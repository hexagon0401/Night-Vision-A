"""Resumable bounded UCDP annual + Candidate acquisition, with revision lineage."""
from datetime import date,datetime,timedelta,timezone
import hashlib,json,sqlite3,time,re
from pathlib import Path
import httpx


def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def digest(value):return hashlib.sha256(canonical(value).encode()).hexdigest()


def normalize(row,version,acquired,allow_invalid_estimates=False):
    identity=str(row['id']);start=date.fromisoformat(str(row['date_start'])[:10]);end=date.fromisoformat(str(row.get('date_end') or row['date_start'])[:10])
    if end<start:raise ValueError('invalid_event_interval')
    precision=int(row.get('where_prec') or 7)
    lat,lon=None,None
    if row.get('latitude') not in (None,'') and row.get('longitude') not in (None,''):
        lat,lon=float(row['latitude']),float(row['longitude'])
        if not (-90<=lat<=90 and -180<=lon<=180):raise ValueError('invalid_coordinates')
    values={k:None if row.get(k) in (None,'') else int(row[k]) for k in ('low','best','high')}
    invalid=any(v is not None and v<0 for v in values.values()) or any(a is not None and b is not None and a>b for a,b in [(values['low'],values['best']),(values['best'],values['high']),(values['low'],values['high'])])
    quality={}
    if invalid:
        if not allow_invalid_estimates:raise ValueError('invalid_fatalities')
        quality={'upstream_estimates':{k:row.get(k) for k in ('low','best','high')},'fatality_validation':'invalid_provider_estimates','quality_warnings':['Fatality estimates rejected as inconsistent/negative; preserved as upstream values, treated as unknown, never zero.']}
        values={k:None for k in ('low','best','high')}
    return {'id':'ucdp:'+identity,'upstream_id':identity,'kind':'ucdp','country':str(row.get('country') or 'Unknown'),
        'day':start.isoformat(),'end_day':end.isoformat(),'precision':precision,'lat':lat,'lon':lon,
        'location_status':'provider_point' if precision==1 else 'approximate' if lat is not None else 'unknown',
        'conflict_type':str(row.get('type_of_violence') or 'unknown'),
        'actors':[str(row.get(k) or '') for k in ('side_a','side_b')],
        'title':str(row.get('country') or 'Unknown')+' · '+str(row.get('side_a') or 'UCDP reported conflict')+' / '+str(row.get('side_b') or ''),
        'source_url':'https://ucdp.uu.se/','endpoint':'https://ucdpapi.pcr.uu.se/api/gedevents/'+version,
        'version':version,'dataset':'candidate' if '.0.' in version else 'annual',
        'hash':digest(row),'acquired_at':acquired,**values,**quality}


def published_candidate(now,client=None):
    """Read bounded public version metadata without sending the API credential."""
    owned=client is None;client=client or httpx.Client(timeout=10,follow_redirects=False)
    try:
        with client.stream('GET','https://ucdp.uu.se/apidocs/') as response:
            if response.status_code!=200:return None
            content=bytearray()
            for chunk in response.iter_bytes():
                if len(content)+len(chunk)>300000:return None
                content.extend(chunk)
        versions=set(re.findall(r'(?<![0-9.])(\d{2}\.0\.\d{1,2})(?![0-9.])',content.decode('utf8','replace')))
        eligible=[v for v in versions if now.year-1<=int(v.split('.')[0])+2000<=now.year and 1<=int(v.split('.')[2])<=12 and (int(v.split('.')[0])+2000,int(v.split('.')[2]))<=(now.year,now.month)]
        return max(eligible,key=lambda v:tuple(map(int,v.split('.')))) if eligible else None
    except httpx.HTTPError:return None
    finally:
        if owned:client.close()


class MonitorState:
    def __init__(self,path):
        Path(path).parent.mkdir(parents=True,exist_ok=True)
        self.db=sqlite3.connect(path);self.db.executescript('''
        CREATE TABLE IF NOT EXISTS requests(day TEXT PRIMARY KEY,n INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS cursors(version TEXT PRIMARY KEY,page INTEGER NOT NULL,complete INTEGER NOT NULL,refreshed TEXT,window TEXT);
        CREATE TABLE IF NOT EXISTS upstream(version TEXT,id TEXT,body TEXT NOT NULL,PRIMARY KEY(version,id));
        CREATE TABLE IF NOT EXISTS staging(version TEXT,id TEXT,body TEXT NOT NULL,PRIMARY KEY(version,id));
        CREATE TABLE IF NOT EXISTS revisions(version TEXT,id TEXT,hash TEXT,seen TEXT,PRIMARY KEY(version,id,hash));
        ''')
    def charge(self,day,limit=500):
        with self.db:
            self.db.execute('INSERT OR IGNORE INTO requests VALUES(?,0)',(day,))
            n=self.db.execute('SELECT n FROM requests WHERE day=?',(day,)).fetchone()[0]
            if n>=limit:raise ValueError('ucdp_daily_request_budget')
            self.db.execute('UPDATE requests SET n=n+1 WHERE day=?',(day,))
    def close(self):self.db.close()


class UCDPMonitor:
    def __init__(self,state,token,client=None,now=None,max_requests=500,sleep=time.sleep,permit=None):
        self.state=state;self.token=token;self.client=client or httpx.Client(timeout=30,follow_redirects=False);self.owned=client is None
        self.now=now or datetime.now(timezone.utc);self.max_requests=max_requests;self.sleep=sleep;self.used=0;self.permit=permit;self.candidate_cached=False
    def get(self,version,page=1,size=250,window=None,missing_ok=False):
        if not self.token:raise ValueError('missing_UCDP_ACCESS_TOKEN')
        if self.permit:self.permit()
        self.state.charge(self.now.date().isoformat(),self.max_requests);self.used+=1
        params={'pagesize':size,'page':page}
        if window:params.update(StartDate=window,EndDate=self.now.date().isoformat())
        # Do not expose credential-bearing transport exceptions or response bodies.
        try:r=self.client.get('https://ucdpapi.pcr.uu.se/api/gedevents/'+version,params=params,headers={'x-ucdp-access-token':self.token})
        except httpx.HTTPError:raise ValueError('ucdp_transport_failure') from None
        if r.status_code in (401,403):raise ValueError('ucdp_auth_rejected')
        if r.status_code==404 or (missing_ok and r.status_code==400):return None
        if r.status_code==429:raise ValueError('ucdp_rate_limited')
        if r.status_code!=200:raise ValueError('ucdp_upstream_http_'+str(r.status_code))
        if len(r.content)>10000000:raise ValueError('ucdp_response_budget')
        try:d=r.json();records=d.get('Result',d.get('result'))
        except (ValueError,AttributeError):raise ValueError('ucdp_invalid_response') from None
        if not isinstance(records,list):raise ValueError('ucdp_invalid_response')
        return d,records
    def discover(self,annual='26.1',hint=None):
        # Prefer the published version index; otherwise probe three bounded months. Never follow NextPageUrl.
        year,month=self.now.year,self.now.month;versions=[]
        if hint and re.fullmatch(r'\d{2}\.0\.\d{1,2}',hint):versions.append(hint)
        for _ in range(3):
            version=f'{year-2000}.0.{month}'
            if version not in versions:versions.append(version)
            month-=1
            if month==0:month=12;year-=1
        for version in versions:
            result=self.get(version,size=1,missing_ok=True)
            if result and result[1]:return version
        # Temporary discovery gaps must not erase the last completed monthly data.
        cutoff=int(annual.split('.')[0])+1999
        cached=[v for (v,) in self.state.db.execute('SELECT version FROM cursors WHERE complete=1') if '.0.' in v and int(v.split('.')[0])+2000>cutoff]
        if cached:
            self.candidate_cached=True
            return max(cached,key=lambda v:tuple(map(int,v.split('.'))))
        return None
    def sync(self,version,max_pages=10):
        db=self.state.db;now=self.now.isoformat();window=(self.now.date()-timedelta(days=396)).isoformat()
        c=db.execute('SELECT page,complete,refreshed,window FROM cursors WHERE version=?',(version,)).fetchone()
        ttl=timedelta(days=1) if '.0.' in version else timedelta(days=7)
        if c and c[1] and c[2] and self.now-datetime.fromisoformat(c[2])<ttl:return True
        if not c or c[1]:
            with db:
                db.execute('DELETE FROM staging WHERE version=?',(version,))
                db.execute('INSERT OR REPLACE INTO cursors VALUES(?,1,0,NULL,?)',(version,window))
            page=1
        else:page=c[0];window=c[3]
        for _ in range(max_pages):
            self.sleep(.25);result=self.get(version,page,window=window)
            if result is None:raise ValueError('ucdp_version_unavailable')
            response,raw=result;records=[]
            for r in raw:
                try:records.append(normalize(r,version,now,allow_invalid_estimates=True))
                except KeyError as error:
                    field=str(error.args[0]);field=field if field in ('id','date_start','date_end','country') else 'unknown'
                    raise ValueError('ucdp_missing_record_field_'+field) from None
                except (ValueError,TypeError) as error:
                    code=str(error) if str(error) in ('invalid_event_interval','invalid_coordinates','invalid_fatalities') else type(error).__name__
                    raise ValueError('ucdp_invalid_record_'+code) from None
            with db:
                for record in records:
                    previous=db.execute('SELECT body FROM upstream WHERE version=? AND id=?',(version,record['id'])).fetchone()
                    if previous:
                        old=json.loads(previous[0])
                        if old['hash']==record['hash']:record['acquired_at']=old['acquired_at']
                    db.execute('INSERT OR REPLACE INTO staging VALUES(?,?,?)',(version,record['id'],canonical(record)))
                    db.execute('INSERT OR IGNORE INTO revisions VALUES(?,?,?,?)',(version,record['id'],record['hash'],now))
                next_page=response.get('NextPageUrl') or response.get('nextPageUrl')
                total=response.get('TotalPages') or response.get('totalPages')
                more=bool(next_page) or (total is not None and page<int(total)) or (total is None and len(raw)==250)
                if not more:
                    db.execute('DELETE FROM upstream WHERE version=?',(version,))
                    db.execute('INSERT INTO upstream SELECT * FROM staging WHERE version=?',(version,))
                    db.execute('DELETE FROM staging WHERE version=?',(version,))
                    db.execute('UPDATE cursors SET complete=1,refreshed=?,page=? WHERE version=?',(now,page,version));return True
                page+=1;db.execute('UPDATE cursors SET page=? WHERE version=?',(page,version))
        return False
    def merged(self,annual,candidate):
        data={}
        for version in [annual,candidate]:
            if not version:continue
            for (body,) in self.state.db.execute('SELECT body FROM upstream WHERE version=? ORDER BY id',(version,)):
                record=json.loads(body);old=data.get(record['id'])
                if old and old['hash']!=record['hash']:record['previous_hash']=old['hash']
                data[record['id']]=record
        return sorted(data.values(),key=lambda r:(r['day'],r['id']))
    def close(self):
        if self.owned:self.client.close()

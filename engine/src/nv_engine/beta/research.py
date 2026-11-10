"""Bounded open-source research. Dates, snippets and access gaps are explicit."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timedelta,timezone
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
import hashlib,json,re
from urllib.parse import urlsplit,urlunsplit,urljoin
import httpx

OFFICIAL=[
 'https://www.imo.org/en/MediaCentre/PressBriefings/Pages/Default.aspx',
 'https://www.ukmto.org/indian-ocean/recent-incidents',
 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport',
]
HOSTS=('imo.org','ukmto.org','unctad.org','un.org','imf.org','worldbank.org','centcom.mil','eunavfor.eu','reuters.com','apnews.com','bbc.com','bbc.co.uk','theguardian.com','aljazeera.com','maritime-executive.com','hellenicshippingnews.com','freightwaves.com','lloydslist.com')
TOPIC='최근 90일의 홍해 공격과 해운 변화: 공격·운송 변화의 실제 규모, 행위자와 구조, 대안 설명 및 반증'

class Page(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.title=[];self.in_title=False;self.skip=0;self.published=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ('script','style','noscript'):self.skip+=1
  if tag=='title':self.in_title=True
  if tag=='meta' and (a.get('property') in ('article:published_time','datePublished') or a.get('name') in ('date','pubdate','publish-date')):self.published=a.get('content')
 def handle_endtag(self,tag):
  if tag in ('script','style','noscript'):self.skip=max(0,self.skip-1)
  if tag=='title':self.in_title=False
 def handle_data(self,data):
  if not self.skip:
   self.parts.append(data)
   if self.in_title:self.title.append(data)

def timestamp(value):
 if not value:return None
 try:
  d=datetime.fromisoformat(str(value).replace('Z','+00:00'))
  if d.tzinfo is None:d=d.replace(tzinfo=timezone.utc)
  return d.astimezone(timezone.utc)
 except ValueError:return None

def safe_url(value):
 u=urlsplit(value)
 if u.scheme!='https' or not u.hostname or u.username or u.password or u.port not in (None,443) or re.search(r'(?i)(?:^|&)(?:key|token|access_token)=',u.query):raise ValueError('unsafe_source_url')
 return urlunsplit((u.scheme,u.netloc,u.path,u.query,''))

class Research:
 def __init__(self,cutoff,client=None):
  self.cutoff=cutoff;self.start=cutoff-timedelta(days=90);self.client=client or httpx.Client(timeout=15,follow_redirects=False,headers={'User-Agent':'NightVisionResearch/2.0 (+https://github.com/hexagon0401/Night-Vision-A)'})
  self.sources={};self.audit=[];self.fetched=set();self.query_count=0
 def get(self,url,params=None,redirect_limit=0,chain=None):
  try:
   for hop in range(redirect_limit+1):
    with self.client.stream('GET',url,params=params) as r:
     if r.status_code in (301,302,303,307,308) and hop<redirect_limit:
      try:target=safe_url(urljoin(url,r.headers.get('Location','')))
      except ValueError:return None,'unsafe_redirect'
      host=urlsplit(target).hostname.lower()
      if not any(host==d or host.endswith('.'+d) for d in HOSTS):return None,'redirect_outside_allowlist'
      url=target;params=None
      if chain is not None:chain.append(target)
      continue
     if r.status_code!=200:return None,'http_'+str(r.status_code)
     result=bytearray()
     for chunk in r.iter_bytes():
      if len(result)+len(chunk)>300000:return None,'response_limit'
      result.extend(chunk)
     return bytes(result),r.headers.get('Content-Type','')
   return None,'redirect_limit'
  except httpx.HTTPError:return None,'transport_failure'
 def fetch_source(self,item):
  try:url=safe_url(item['url'])
  except (ValueError,KeyError):return None,{'state':'unsafe_url'}
  host=urlsplit(url).hostname.lower();allowed=any(host==d or host.endswith('.'+d) for d in HOSTS)
  if not allowed:return None,{'url':url,'state':'discovered_not_fetched','reason':'publisher outside bounded fetch allowlist'}
  chain=[];content,kind=self.get(url,redirect_limit=3,chain=chain)
  if chain:url=chain[-1];host=urlsplit(url).hostname.lower()
  if content is None:return None,{'url':url,'state':kind}
  if 'html' not in kind and 'text/plain' not in kind:return None,{'url':url,'state':'unsupported_document_type'}
  raw=content.decode('utf8','replace');parser=Page()
  try:parser.feed(raw)
  except Exception:return None,{'url':url,'state':'html_parse_failed'}
  published=timestamp(parser.published)
  if not published:
   m=re.search(r'"datePublished"\s*:\s*"([^"]+)"',raw)
   if m:published=timestamp(m[1])
  if published and published>self.cutoff:return None,{'url':url,'state':'after_cutoff'}
  text=re.sub(r'\s+',' ',unescape(' '.join(parser.parts))).strip()
  if not text:return None,{'url':url,'state':'no_extractable_text'}
  if re.search(r'Just a moment|Access denied|Request blocked|Checking your browser|Verify you are human',(' '.join(parser.title)+' '+text[:500]),re.I):return None,{'url':url,'state':'access_challenge'}
  # Prefer the topic-bearing passage, keeping only a short attributable excerpt.
  match=re.search(r'Red Sea|Suez|Houthi|Yemen|홍해',text,re.I);at=max(0,match.start()-120) if match else 0
  excerpt=text[at:at+1000]
  sha=hashlib.sha256(content).hexdigest();identity='src_'+hashlib.sha256((url+sha).encode()).hexdigest()[:16]
  source={'id':identity,'url':url,'title':(' '.join(parser.title) or item.get('title') or host)[:500],'publisher_family':host.removeprefix('www.'),'family_status':'domain proxy; editorial independence requires review','excerpt':excerpt,'published_at':published.isoformat() if published else None,'indexed_at':item.get('indexed_at'),'retrieved_at':datetime.now(timezone.utc).isoformat(),'content_sha256':sha,'scope':'window' if published and published>=self.start else 'background' if published else 'publication_date_unknown','extraction':'bounded HTML excerpt; original document not reproduced'}
  return source,{'url':url,'state':'retrieved','source_id':identity,'date_status':source['scope'],'redirects':chain}
 def discover(self,queries):
  items=[{'url':u} for u in OFFICIAL] if not self.fetched else []
  for query in queries[:3]:
   if self.query_count>=9:break
   self.query_count+=1;query=str(query)[:150]
   q='("Red Sea" OR "Suez Canal") '+query
   data,kind=self.get('https://api.gdeltproject.org/api/v2/doc/doc',{'query':q,'mode':'artlist','format':'json','maxrecords':10,'sort':'datedesc','startdatetime':self.start.strftime('%Y%m%d%H%M%S'),'enddatetime':self.cutoff.strftime('%Y%m%d%H%M%S')})
   self.audit.append({'tool':'GDELT DOC','query':q,'state':kind if data is None else 'response','at':datetime.now(timezone.utc).isoformat(),'date_semantics':'GDELT date is indexing, not publication or event time'})
   if data:
    try:
     for row in json.loads(data).get('articles',[])[:10]:items.append({'url':row['url'],'title':row.get('title'),'indexed_at':row.get('seendate')})
    except (ValueError,TypeError,KeyError):self.audit.append({'tool':'GDELT DOC','state':'invalid_response'})
  unique=[]
  for item in items:
   if item.get('url') not in self.fetched and len(self.fetched)<30:self.fetched.add(item.get('url'));unique.append(item)
  with ThreadPoolExecutor(max_workers=4) as pool:
   for source,audit in pool.map(self.fetch_source,unique):
    self.audit.append(audit)
    if source:self.sources[source['id']]=source
  return sorted(self.sources.values(),key=lambda s:(s['scope']!='window',s['scope']=='publication_date_unknown',s['url']))[:40]
 def close(self):self.client.close()

def common_prompt(cutoff):
 start=cutoff-timedelta(days=90)
 return f'''# Night Vision 비교 실험 — 공통 실행 지시
주제: {TOPIC}
분석 기간: {start.isoformat()} ~ {cutoff.isoformat()} UTC
종료시각 한국 시간: {cutoff.astimezone(timezone(timedelta(hours=9))).isoformat()}

현재 보유한 최신 Night Vision 프레임워크를 사용하라. 실제 모델명, High 설정 가능 여부와 실제 선택값, 프레임워크 버전, 검색 도구, 실행일을 먼저 기록하라. 지원하지 않는 설정이나 확인 불가능한 사용량은 추측하지 말라.

각자 자유롭게 검색하되 종료시각 이후 게시된 자료를 이번 기간의 증거로 사용하지 말라. 기간 이전 자료는 배경으로 구분하라. 문서 발행일·사건일·검색 인덱싱일·조회일을 구분하라. 유료 자료나 접근 불가 문서는 읽은 것처럼 인용하지 말라.

전체 분석 루프를 정확히 3회 수행하라. 각 회차는 프레임/사전가정, 구조적 가설, 출처검토, 구체적 행위자·메커니즘, 시간·대안 인과관계, 반증·시나리오·역설, RETRO를 포함하라. 앞 회차에 대한 평가와 반증을 다음 회차의 수정에 반영하라. 비공개 사고과정 대신 검증 가능한 근거·가설 변경 요약을 기록하라. 마지막 회차에도 [DATA GAP], [UNVERIFIED], [NULL RESULT]를 허용하며 결론을 억지로 확정하지 말라.

매 회차에 출처 URL·문서명·발행일·열람 여부, 주요 주장과 근거 연결, 가설 반증 조건, 변경 사항을 남겨라. 언론 보도나 정부 발표의 존재와 그 내용이 사실임을 구분하라. 시나리오 확률을 보정된 통계 확률처럼 제시하지 말라.

최종 출력: ①실행 조건 ②1회차 분석·평가 ③2회차 분석·평가 ④3회차 분석·평가 ⑤최종 보고서 ⑥출처목록·검색 실패 ⑦확인 가능한 시간·사용량과 한계. 내부 자기평가 점수는 비교 실험의 최종 점수로 사용하지 말라. 다른 비교군의 결과를 요청하거나 참고하지 말라.
'''

def markdown(run):
 lines=[f"# NV Engine 2.0 — {run['topic']}",f"상태: {run['state']} · 종료시각: {run['cutoff']}",f"모델: {json.dumps(run['models'],ensure_ascii=False)}"]
 for step in run.get('steps',[]):
  lines.extend([f"\n## {step['step']//2+1}회차 — {'분석' if step['step']%2==0 else '평가'}",f"상태: {step['state']}"])
  if step.get('output',{} ) and step['output'].get('diagnostic'):lines.append('진단: '+json.dumps(step['output']['diagnostic'],ensure_ascii=False))
  if step.get('output') and step['output'].get('report'):
   o=step['output'];lines.append(f"모델 {o['model']} · {o['duration_ms']}ms · 사용량 {o.get('usage')}")
   if o.get('fallback_reason'):lines.append(f"설정 모델 {o['requested_model']} → 실제 {o['model']} ({o['fallback_reason']}). 모델 대체·동의는 독립 검증이 아닙니다.")
   lines.append('추론 설정: '+o.get('reasoning_effort','provider_default'))
   r=o['report']
   for key,value in r.get('sections',{}).items():lines.extend([f'### {key}',value])
   if 'critique'in r:lines.extend(['### 반증 평가',r['critique'],json.dumps(r.get('rubric'),ensure_ascii=False)])
   if r.get('changes'):lines.extend(['### 변경 사항',r['changes']])
  if step.get('error'):lines.append('중단 사유: '+step['error'])
 lines.append('\n## 출처')
 for source in run.get('input',{}).get('sources',[]):lines.append(f"- [{source['id']}] {source['title']} · {source['url']} · 발행 {source.get('published_at') or '미상'} · {source['scope']}")
 return '\n\n'.join(lines)+'\n'

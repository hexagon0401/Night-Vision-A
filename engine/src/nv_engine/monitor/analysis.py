"""Day-resolution UCDP aggregation; aggregation clock is not an event instant."""
from collections import defaultdict
from datetime import date,datetime,timedelta,timezone
from nv_engine.models import CaseBundle,Source,Entity,Observation,Claim,Provenance
from nv_engine.detect.analysis import analyze
from nv_engine.narrative.build import attach_traces
from .ucdp import digest


def aggregate(records):
    groups=defaultdict(list)
    for r in records:groups[(r['country'],r['day'])].append(r)
    result=[]
    for (country,day),values in sorted(groups.items()):
        result.append({'country':country,'day':day,'events':len(values),
          **{k:sum(r[k] for r in values) if all(r[k] is not None for r in values) else None for k in ('low','best','high')},
          'record_ids':[r['id'] for r in values],'record_hashes':[r['hash'] for r in values],
          'interval_events':sum(r['day']!=r['end_day'] for r in values),
          'invalid_fatality_estimates':sum(r.get('fatality_validation')=='invalid_provider_estimates' for r in values),
          'assignment':'event start day; date intervals retained, not expanded into duplicate daily events'})
    return result


def build_cases(aggregates,acquired,coverage_start=None,coverage_end=None,coverage_intervals=None):
    groups=defaultdict(list)
    for row in aggregates:groups[row['country']].append(row)
    result=[]
    for country,values in sorted(groups.items()):
        values=sorted(values,key=lambda r:r['day']);by_day={r['day']:r for r in values}
        first=date.fromisoformat(coverage_start or values[0]['day']);last=date.fromisoformat(coverage_end or values[-1]['day'])
        # Bound each case; the most recent 90 days per country suffice for prior-only baselines.
        first=max(first,last-timedelta(days=89));rows=[];day=first
        while day<=last:
            key=day.isoformat()
            covered=coverage_intervals is None or any(a<=key<=b for a,b in coverage_intervals)
            if covered:rows.append(by_day.get(key,{'country':country,'day':key,'events':0,'low':0,'best':0,'high':0,'record_ids':[],'record_hashes':[],'interval_events':0,'assignment':'zero only inside completed dataset query coverage'}))
            day+=timedelta(days=1)
        if not rows:continue
        name=digest(country)[:20];entity_id='entity:ucdp:'+name
        sources=[];observations=[];claims=[];provenance_ids=[]
        for row in rows:
            sid='source:ucdp-day:'+digest(row);provenance_ids.append(sid)
            sources.append(Source(source_id=sid,url='https://ucdp.uu.se/',publisher='Uppsala Conflict Data Program',publisher_family='ucdp',published_at_utc=None,retrieved_at_utc=acquired,content_hash=digest(row),license='UCDP dataset-specific citation and reuse terms; metadata aggregation',access='restricted',extraction_method='nv:ucdp-day-aggregation:1; source record IDs and hashes in aggregation evidence'))
            p=Provenance(source_ids=[sid],extraction_method='nv:ucdp-day-aggregation:1')
            for metric,key in [('reported_conflict_events','events'),('reported_fatalities_best','best')]:
                oid='observation:ucdp:'+digest([row,metric]);observations.append(Observation(observation_id=oid,entity_id=entity_id,
                    observed_at_utc=datetime.fromisoformat(row['day']).replace(tzinfo=timezone.utc),metric=metric,value=row[key],unit='events/day' if key=='events' else 'estimated deaths/day',source_record_id=row['day'],location=None,evidence_status='reported',provenance=p))
                claims.append(Claim(claim_id='claim:ucdp:'+digest([row,metric]),statement=f"{country}: {row[key]} {metric} assigned to start-date bucket {row['day']}",assessment='Daily aggregation boundary, not the time of the underlying events; low/high and interval uncertainty retained in aggregation evidence',evidence_status='reported',provenance=p,observation_ids=[oid]))
        entity=Entity(entity_id=entity_id,entity_type='country_conflict_series',name=country,location=None,evidence_status='reported',provenance=Provenance(source_ids=provenance_ids,extraction_method='nv:ucdp-aggregation:1'))
        case=CaseBundle(case_id='case:ucdp:'+digest(rows),title=f'UCDP reported conflict trends — {country}',data_origin='source_backed',sources=sources,entities=[entity],observations=observations,claims=claims,events=[],anomalies=[],relations=[],hypotheses=[],narratives=[])
        report=analyze(case)
        if any(r.get('invalid_fatality_estimates',0) for r in rows):report.warnings.append('Inconsistent provider fatality estimates excluded from numerical analysis as unknown, not zero; event counts retained and original estimates preserved.')
        if coverage_intervals is not None:report.warnings.append('coverage gaps excluded rather than zero-filled; scores uncalibrated')
        case=attach_traces(case,report)
        result.append({'country':country,'payload':{'case':case.model_dump(mode='json'),'analysis':report.model_dump(mode='json'),'aggregation_evidence':rows,'time_semantics':'observed_at_utc is the derived day bucket boundary, never a provider-reported event instant'}})
    return result

"""Detached, provenance-preserving Foundry-shaped CSV ZIP. No upload or credentials."""
from datetime import datetime, timezone
import csv
import hashlib
import io
import json
import zipfile
from typing import Annotated
from pydantic import Field, model_validator
from nv_engine.models import CaseBundle
from nv_engine.models.canonical import Contract, UTCDateTime
from nv_engine.detect.contracts import check_budget


class ExportOptions(Contract):
    include_inferred: bool = False
    rights_reviewed: bool = False
    diagnostic: bool = False
    start_utc: UTCDateTime | None = None
    end_utc: UTCDateTime | None = None
    track_entity_ids: list[str] = Field(default_factory=list)
    coordinate_precision: Annotated[int,Field(ge=0,le=8)] = 6

    @model_validator(mode='after')
    def window(self):
        if self.start_utc and self.end_utc and self.end_utc<self.start_utc: raise ValueError('export window end precedes start')
        return self


class ExportError(ValueError): pass


def encode(value):return (json.dumps(value,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
def sha(value):return hashlib.sha256(value).hexdigest()


def scoped_case(case,options):
    skipped=[]
    names=('entities','events','observations','claims','relations','hypotheses','anomalies','narratives')
    groups={name:list(getattr(case,name)) for name in names}
    def record_id(name,row):return getattr(row,{'entities':'entity_id','hypotheses':'hypothesis_id','anomalies':'anomaly_id'}.get(name,name[:-1]+'_id'))
    def drop(name,row,reason):skipped.append({'record_type':name,'record_id':record_id(name,row),'reason':reason})
    for name in names:
        retained=[]
        for row in groups[name]:
            status=getattr(row,'evidence_status',None)
            if not options.include_inferred and status and status.value in ('inferred','scenario'):
                drop(name,row,'inference_or_scenario_excluded');continue
            time=getattr(row,'observed_at_utc',getattr(row,'event_time_utc',None))
            if name in ('events','observations') and (options.start_utc or options.end_utc):
                if time is None or (options.start_utc and time<options.start_utc) or (options.end_utc and time>options.end_utc):
                    drop(name,row,'outside_or_unknown_export_time');continue
            retained.append(row)
        groups[name]=retained
    # Cascading exclusions preserve all-or-nothing references, including counterevidence.
    changed=True
    while changed:
        changed=False
        ids={name:{record_id(name,row) for row in rows} for name,rows in groups.items()}
        for name in names:
            retained=[]
            for row in groups[name]:
                valid=True
                if name=='observations':valid=row.entity_id in ids['entities']
                if name=='events':valid=set(row.entity_ids)<=ids['entities']
                if name=='claims':valid=set(row.event_ids)<=ids['events'] and set(row.observation_ids)<=ids['observations'] and set(row.counterevidence_claim_ids)<=ids['claims']
                if name=='relations':valid={row.source_entity_id,row.target_entity_id}<=ids['entities'] and set(row.claim_ids)<=ids['claims']
                if name=='hypotheses':valid=set(row.claim_ids+row.disconfirming_claim_ids)<=ids['claims'] and set(row.alternative_to)<=ids['hypotheses']
                if name=='anomalies':valid=set(row.observation_ids)<=ids['observations']
                if name=='narratives':valid=row.anomaly_id in ids['anomalies'] and all(set(s.evidence_claim_ids)<=ids['claims'] and set(s.visible_relation_ids)<=ids['relations'] and set(s.visible_entity_ids)<=ids['entities'] for s in row.steps)
                if valid:retained.append(row)
                else:drop(name,row,'referenced_record_excluded');changed=True
            groups[name]=retained
    filtered=CaseBundle.model_validate(case.model_copy(update=groups).model_dump(mode='json'))
    return filtered,skipped


def export_bundle(case:CaseBundle,options:ExportOptions|None=None,exported_at:datetime|None=None)->bytes:
    check_budget(case)
    case=CaseBundle.model_validate(case.model_dump(mode='json'));options=options or ExportOptions()
    exported_at=exported_at or datetime.now(timezone.utc)
    if exported_at.tzinfo is None:raise ValueError('export timestamp needs timezone')
    case,skipped=scoped_case(case,options)
    from urllib.parse import urlsplit,parse_qsl
    for source in case.sources:
        url=urlsplit(str(source.url))
        if url.username or url.password or any(k.lower() in {'token','access_token','map_key','api_key'} for k,_ in parse_qsl(url.query)):
            raise ExportError('credential_bearing_source_url_rejected')
    files={};schemas={};counts={};errors=[];warnings=[]
    if any(source.retrieved_at_utc>exported_at for source in case.sources):errors.append('source_acquisition_after_export_time')
    def table(name,headers,rows):
        stream=io.StringIO(newline='');writer=csv.DictWriter(stream,fieldnames=headers,lineterminator='\r\n',extrasaction='raise')
        writer.writeheader();writer.writerows(rows);body=stream.getvalue().encode('utf-8')
        parsed=list(csv.DictReader(io.StringIO(body.decode(),newline=''),strict=True))
        if len(parsed)!=len(rows) or any(None in row for row in parsed):raise ExportError('CSV round-trip failed')
        files[name+'.csv']=body;schemas[name+'.csv']={'columns':[{'name':h,'storage_type':'Timestamp' if h.endswith('_utc') else 'Double' if h in ('latitude','longitude','value','location_accuracy_m','score') else 'String','logical_type':'geopoint' if h=='geopoint' else None} for h in headers]};counts[name+'.csv']=len(rows)
    def point(location):
        if location is None or location.role!='verified':return {'latitude':'','longitude':'','geopoint':'','geometry_source_id':''}
        lat=round(location.latitude,options.coordinate_precision);lon=round(location.longitude,options.coordinate_precision)
        return {'latitude':lat,'longitude':lon,'geopoint':f'{lat},{lon}','geometry_source_id':location.source_id}
    def iso(value):return value.astimezone(timezone.utc).isoformat().replace('+00:00','Z') if value else ''
    table('entities',['entity_id','entity_type','name','latitude','longitude','geopoint','geometry_source_id','verification_status'],[
        dict(entity_id=r.entity_id,entity_type=r.entity_type,name=r.name,**point(r.location),verification_status=r.evidence_status.value) for r in case.entities])
    table('events',['event_id','event_type','event_time_utc','latitude','longitude','geopoint','geometry_source_id','evidence_status','description'],[
        dict(event_id=r.event_id,event_type=r.event_type,event_time_utc=iso(r.event_time_utc),**point(r.location),evidence_status=r.evidence_status.value,description=r.description) for r in case.events])
    table('observations',['observation_id','object_id','observed_at_utc','metric','value','unit'],[
        dict(observation_id=r.observation_id,object_id=r.entity_id,observed_at_utc=iso(r.observed_at_utc),metric=r.metric,value=r.value,unit=r.unit) for r in case.observations])
    table('relations',['relation_id','source_entity_id','target_entity_id','relation_type','evidence_status','valid_from_utc','valid_to_utc'],[
        dict(relation_id=r.relation_id,source_entity_id=r.source_entity_id,target_entity_id=r.target_entity_id,relation_type=r.relation_type,evidence_status=r.evidence_status.value,valid_from_utc=iso(r.valid_from_utc),valid_to_utc=iso(r.valid_to_utc)) for r in case.relations])
    table('claims',['claim_id','statement','status','assessment'],[dict(claim_id=r.claim_id,statement=r.statement,status=r.evidence_status.value,assessment=r.assessment) for r in case.claims])
    table('sources',['source_id','publisher','publisher_family','url','published_at_utc','retrieved_at_utc','license','access','content_hash','extraction_method'],[
        dict(source_id=r.source_id,publisher=r.publisher,publisher_family=r.publisher_family,url=str(r.url),published_at_utc=iso(r.published_at_utc),retrieved_at_utc=iso(r.retrieved_at_utc),license=r.license,access=r.access,content_hash=r.content_hash,extraction_method=r.extraction_method) for r in case.sources])
    table('hypotheses',['hypothesis_id','case_id','description','status'],[dict(hypothesis_id=r.hypothesis_id,case_id=case.case_id,description=r.description,status=r.status) for r in case.hypotheses])
    links=[]
    for c in case.claims:
        for kind,refs in [('source',c.provenance.source_ids),('corroborating_source',c.provenance.corroborating_source_ids),('event',c.event_ids),('observation',c.observation_ids),('counterevidence',c.counterevidence_claim_ids)]:
            links += [dict(claim_id=c.claim_id,reference_type=kind,reference_id=ref) for ref in refs]
    table('claim_evidence',['claim_id','reference_type','reference_id'],links)
    lineage=[]
    for kind,rows in [('entity',case.entities),('event',case.events),('observation',case.observations),('claim',case.claims),('relation',case.relations),('hypothesis',case.hypotheses),('anomaly',case.anomalies)]:
        for row in rows:
            for sid in row.provenance.source_ids+row.provenance.corroborating_source_ids:
                lineage.append(dict(record_type=kind,record_id=getattr(row,kind+'_id'),source_id=sid,claim_id=row.claim_id if kind=='claim' else '',evidence_span_hash=row.provenance.evidence_span_hash or '',transform_version='nv-foundry-1.0.0'))
    table('lineage',['record_type','record_id','source_id','claim_id','evidence_span_hash','transform_version'],lineage)
    entity_types={r.entity_id:r.entity_type for r in case.entities};tracks=[];seen={}
    for entity in options.track_entity_ids:
        if entity_types.get(entity) not in ('tracked_asset','vessel','aircraft','satellite'):errors.append(f'unsupported_track_entity:{entity}')
    for r in sorted(case.observations,key=lambda o:(o.entity_id,o.observed_at_utc,o.observation_id)):
        if r.entity_id not in options.track_entity_ids or not r.location or r.location.role!='verified':continue
        key=(r.entity_id,iso(r.observed_at_utc));coordinates=(r.location.latitude,r.location.longitude)
        if key in seen:
            if seen[key]!=coordinates:errors.append(f'conflicting_track_timestamp:{r.entity_id}')
            else:warnings.append('duplicate_track_sample_deduplicated')
            continue
        seen[key]=coordinates
        tracks.append(dict(object_id=r.entity_id,observed_at_utc=key[1],latitude=r.location.latitude,longitude=r.location.longitude,source_id=r.location.source_id,location_accuracy_m=r.location.accuracy_m))
    table('tracks',['object_id','observed_at_utc','latitude','longitude','source_id','location_accuracy_m'],tracks)
    table('event_entities',['event_id','entity_id'],[dict(event_id=r.event_id,entity_id=ref) for r in case.events for ref in r.entity_ids])
    table('relation_claims',['relation_id','claim_id'],[dict(relation_id=r.relation_id,claim_id=ref) for r in case.relations for ref in r.claim_ids])
    table('hypothesis_links',['hypothesis_id','reference_type','reference_id'],[dict(hypothesis_id=r.hypothesis_id,reference_type=kind,reference_id=ref) for r in case.hypotheses for kind,refs in [('supporting_claim',r.claim_ids),('disconfirming_claim',r.disconfirming_claim_ids),('alternative_hypothesis',r.alternative_to)] for ref in refs])
    table('anomalies',['anomaly_id','detector','detector_version','window_start_utc','window_end_utc','score','severity','confidence','impact'],[dict(anomaly_id=r.anomaly_id,detector=r.detector,detector_version=r.detector_version,window_start_utc=iso(r.window_start_utc),window_end_utc=iso(r.window_end_utc),score=r.score,severity=r.severity.value,confidence=r.confidence.value,impact=r.impact.value) for r in case.anomalies])
    table('anomaly_observations',['anomaly_id','observation_id'],[dict(anomaly_id=r.anomaly_id,observation_id=ref) for r in case.anomalies for ref in r.observation_ids])
    files['case.json']=case.model_dump_json(indent=2).encode()
    files['schema.json']=encode({'schema_version':'1.0.0','canonical_schema_version':case.schema_version,'tables':schemas,'many_to_many':'claim_evidence.csv plus canonical case.json; no joined scalar IDs'})
    if not options.rights_reviewed:warnings.append('rights_review_not_confirmed')
    if case.data_origin=='synthetic':warnings.append('synthetic_data')
    warnings.append('Foundry enrollment upload and Ontology rendering not tested')
    report={'structurally_valid':not errors,'foundry_ready':False,'errors':sorted(set(errors)),'warnings':sorted(set(warnings)),
        'skipped_records':skipped,'source_availability':'not_rechecked_at_export','missing_event_times':sum(r.event_time_utc is None for r in case.events),
        'missing_or_symbolic_entity_locations':sum(r.location is None or r.location.role!='verified' for r in case.entities)}
    if errors and not options.diagnostic:raise ExportError(';'.join(sorted(set(errors))))
    files['validation_report.json']=encode(report)
    files['IMPORT_GUIDE.md']=('''# NV Foundry import-shaped bundle

Read validation_report.json first. Structurally valid CSV is not proof of successful enrollment upload, Ontology creation, source truth or reuse permission. This exporter has no Foundry credentials and performs no upload.

Use UTF-8 RFC4180 CSV with quote character double quote and MULTILINE_CSV_PARSER for quoted newlines. Assign IDs as String primary keys, numeric coordinates as Double and UTC fields as timestamps. geopoint is the optional source-backed latitude,longitude string; verify the current logical type mapping in your enrollment. No H3, fictional track vertices or generated routes are emitted. Symbolic locations have empty physical coordinate columns; full role/note remains in case.json.

Create Entity, Event, Observation, Source and Claim object types. Join observations.object_id to entities.entity_id. Join claim_evidence by reference_type/reference_id; IDs are not comma-joined scalar properties. lineage supplies record/source associations. relations supplies typed entity links. tracks contains only explicitly requested tracked entity samples, sorted by time; never merge gaps into a fictional LineString. case.json is the lossless canonical representation of retained scope, including counterevidence, relation/hypothesis links and narratives omitted from simplified CSV columns.

Official references: https://www.palantir.com/docs/foundry/dataset-preview/csv-parsing/ and https://www.palantir.com/docs/foundry/geospatial/ontology/ . Defaults exclude inferred/scenario records and recursively exclude dependent records; skipped reasons are audited. Time filters apply to event/observation instants, with inventory/source context retained. Hashes in manifest.json cover all other files; the manifest cannot hash itself. CSV text is literal data; import with the declared parser rather than executing formulas in a spreadsheet.
''').encode()
    files['manifest.json']=encode({'schema_version':'1.0.0','engine_version':'2.0.0','adapter_version':'1.0.0','case_id':case.case_id,'data_origin':case.data_origin,
        'exported_at_utc':iso(exported_at),'options':options.model_dump(mode='json'),'counts':counts,
        'files':{name:{'sha256':sha(body),'bytes':len(body)} for name,body in sorted(files.items())}})
    output=io.BytesIO()
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED) as archive:
        for name,body in sorted(files.items()):
            info=zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(info,body)
    return output.getvalue()

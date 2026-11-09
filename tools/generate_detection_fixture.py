"""Write reproducible, entirely synthetic detector/UI inputs; never reads live data."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
from nv_engine.models import CaseBundle

ROOT=Path(__file__).resolve().parents[1]

def build():
    sources=[];entities=[];observations=[];claims=[]
    start=datetime(2026,1,1,tzinfo=timezone.utc)
    for index,name in enumerate(('alpha','beta','gamma')):
        values=([10,11,9,10,11,9,10]*7)[:49]
        if name=='alpha': values[-1]=45
        if name=='beta': values[-12:]=[13]*12
        source_id=f'fixture-source:{name}'
        entity_id=f'fixture-entity:{name}'
        payload=json.dumps(values).encode()
        sources.append(dict(source_id=source_id,url=f'https://example.invalid/synthetic/{name}',publisher='Synthetic fixture publisher',publisher_family='synthetic-shared',published_at_utc=None,retrieved_at_utc=(start+timedelta(days=3)).isoformat(),content_hash=hashlib.sha256(payload).hexdigest(),license='Handwritten synthetic fixture; not real intelligence',access='public',extraction_method='deterministic synthetic fixture'))
        prov=dict(source_ids=[source_id],extraction_method='synthetic series')
        location=dict(latitude=35.0+index*.1,longitude=127.0+index*.1,role='verified',source_id=source_id,note='SYNTHETIC fixture point; no real asset or sensor')
        entities.append(dict(entity_id=entity_id,entity_type='synthetic_sensor',name=f'합성 센서 {name.upper()}',location=location,evidence_status='reported',provenance=prov))
        ids=[]
        for i,value in enumerate(values):
            oid=f'fixture-observation:{name}:{i:03}'
            ids.append(oid)
            observations.append(dict(observation_id=oid,entity_id=entity_id,observed_at_utc=(start+timedelta(hours=i)).isoformat(),metric='synthetic_measurement',value=float(value),unit='fixture_units',source_record_id=f'{name}-{i}',location=location,evidence_status='observed',provenance=prov))
        claims.append(dict(claim_id=f'fixture-claim:{name}',statement=f'SYNTHETIC DATA — fictional {name} measurements',assessment='Not a real source-backed case',observation_ids=ids,evidence_status='reported',provenance=prov))
    return CaseBundle(case_id='case:synthetic-detection',title='SYNTHETIC DATA / 합성 탐지 실험',data_origin='synthetic',sources=sources,entities=entities,observations=observations,claims=claims)

if __name__=='__main__':
    (ROOT/'data/fixtures/detection/case.json').write_text(build().model_dump_json(indent=2)+'\n')

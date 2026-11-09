"""Opt-in official RSS metadata; no article scraping, invented locations or causal inference."""
from datetime import datetime,timezone
from pathlib import Path
from nv_engine.sources.config import Manifest
from nv_engine.collect.pipeline import Collector
from nv_engine.collect.state import CollectorState


def collect_official(manifest_path,state_dir,enable=False,rights_reviewed=False):
    manifest=Manifest.model_validate_json(Path(manifest_path).read_text())
    if enable:manifest=manifest.model_copy(update={'enabled':True})
    if rights_reviewed:manifest=manifest.model_copy(update={'rights':manifest.rights.model_copy(update={'reviewed':True})})
    if not manifest.enabled or not manifest.rights.reviewed:raise ValueError('rss_rights_or_enablement_required')
    collector=Collector(CollectorState(state_dir))
    try:result=collector.collect(manifest)
    finally:collector.close()
    if result.report.skipped or result.report.limited:raise ValueError('rss_partial_acquisition')
    records=[]
    for r in result.records:
        source=r.source
        records.append({'id':'rss:'+r.record_key,'kind':'rss','country':'Not geolocated','day':(source.published_at_utc or source.retrieved_at_utc).date().isoformat(),
            'day_semantics':'publication date' if source.published_at_utc else 'acquisition date, event date unknown',
            'title':r.claim.statement[:4000],'source_url':str(source.url),'hash':source.content_hash,
            'lat':None,'lon':None,'precision':7,'acquired_at':source.retrieved_at_utc.isoformat(),
            'publisher':source.publisher,'publisher_family':source.publisher_family,'evidence_status':'reported'})
    return records,{'provider':'official_rss','records':len(records),'publisher':manifest.publisher,'terms_url':str(manifest.rights.terms_url),'coverage_start':min((r['day'] for r in records),default=None),'coverage_end':max((r['day'] for r in records),default=None),'content_scope':'headline metadata and links; no inferred coordinates'}

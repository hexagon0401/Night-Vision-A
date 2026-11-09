from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict
from nv_engine import __version__
from nv_engine.models import CaseBundle

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    yield
    from nv_api import exports
    if exports._registry is not None:
        exports._registry.close();exports._registry=None

app = FastAPI(title='NV API', version=__version__, lifespan=lifespan)


class ValidationSummary(BaseModel):
    model_config = ConfigDict(extra='forbid')
    case_id: str
    schema_version: str
    data_origin: str
    counts: dict[str, int]


@app.get('/healthz')
def health():
    """Process readiness only; no upstream feed or export capabilities implied."""
    return {'status': 'ok', 'phase': 'foundation', 'engine_version': __version__}


@app.post('/api/v2/contracts/validate', response_model=ValidationSummary)
def validate_contract(bundle: CaseBundle):
    """Stateless structural/reference validation, not independent fact verification.

    No network requests, storage writes or confidence upgrades are performed.
    """
    names = ('sources', 'entities', 'events', 'observations', 'claims', 'relations',
             'hypotheses', 'anomalies', 'narratives')
    return ValidationSummary(
        case_id=bundle.case_id, schema_version=bundle.schema_version,
        data_origin=bundle.data_origin,
        counts={name: len(getattr(bundle, name)) for name in names},
    )


from nv_engine.detect.contracts import AnalysisRequest, AnalysisReport
from nv_engine.detect.analysis import analyze


@app.post('/api/v2/analysis', response_model=AnalysisReport)
def analyze_case(request: AnalysisRequest):
    """Bounded, stateless candidate analysis; never fetches, persists or publishes."""
    return analyze(request.case, request.configuration)


from nv_engine.narrative.build import build_narrative
from fastapi import HTTPException


class NarrativeRequest(AnalysisRequest):
    anomaly_id: str


@app.post('/api/v2/narratives', response_model=CaseBundle)
def narrative_case(request: NarrativeRequest):
    try:
        return build_narrative(request.case, request.anomaly_id)
    except ValueError as error:
        raise HTTPException(422, detail=str(error)) from None


from nv_api.exports import router as exports_router
app.include_router(exports_router)


from nv_api.security import RequestBudgets
from starlette.middleware.trustedhost import TrustedHostMiddleware
import os
app.add_middleware(RequestBudgets)
app.add_middleware(TrustedHostMiddleware,allowed_hosts=os.environ.get('NV_ALLOWED_HOSTS','localhost,127.0.0.1,testserver').split(','))

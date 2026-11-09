from fastapi import FastAPI
from nv_engine import __version__

app = FastAPI(title="NV API", version=__version__)

@app.get("/healthz")
def health():
    """Process readiness only; no upstream feed or export capabilities implied."""
    return {"status": "ok", "phase": "foundation", "engine_version": __version__}

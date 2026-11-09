"""Bounded single-process export jobs; private artifacts expire and require auth."""
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone,timedelta
import hmac
import os
from pathlib import Path
import shutil
import tempfile
import threading
import time
import uuid
from fastapi import APIRouter,Depends,Header,HTTPException
from fastapi.responses import FileResponse
from pydantic import Field
from nv_engine.detect.contracts import AnalysisRequest
from nv_engine.export.foundry.bundle import ExportOptions,export_bundle

router=APIRouter(prefix='/api/v2/exports')


def authorized(authorization:str|None=Header(default=None)):
    token=os.environ.get('NV_API_TOKEN')
    if not token:raise HTTPException(503,'Export API disabled: configure NV_API_TOKEN securely')
    supplied=authorization.removeprefix('Bearer ') if authorization else ''
    if not authorization or not authorization.startswith('Bearer ') or not hmac.compare_digest(supplied.encode(),token.encode()):raise HTTPException(401,'Bearer authentication required')


class ExportRequest(AnalysisRequest):
    options:ExportOptions=Field(default_factory=ExportOptions)


class Jobs:
    def __init__(self):
        self.root=Path(tempfile.mkdtemp(prefix='nv-exports-'));self.lock=threading.RLock();self.jobs={};self.requests=deque();self.executor=ThreadPoolExecutor(max_workers=2)
    def cleanup(self):
        now=time.monotonic()
        for key,value in list(self.jobs.items()):
            if value['expires']<now and value['state'] not in ('queued','processing'):
                (self.root/f'{key}.zip').unlink(missing_ok=True);del self.jobs[key]
    def submit(self,request):
        with self.lock:
            self.cleanup();now=time.monotonic()
            while self.requests and self.requests[0]<now-60:self.requests.popleft()
            if len(self.requests)>=5:raise HTTPException(429,'Export rate limit',headers={'Retry-After':'60'})
            if len(self.jobs)>=16:raise HTTPException(429,'Export capacity reached',headers={'Retry-After':'60'})
            self.requests.append(now);key=uuid.uuid4().hex
            self.jobs[key]={'state':'queued','expires':now+300,'expires_at_utc':(datetime.now(timezone.utc)+timedelta(seconds=300)).isoformat()}
            self.executor.submit(self.run,key,request)
            return key
    def run(self,key,request):
        with self.lock:self.jobs[key]['state']='processing'
        try:
            body=export_bundle(request.case,request.options)
            if len(body)>10000000:raise ValueError('artifact budget')
            with (self.root/f'{key}.zip').open('xb') as stream:stream.write(body)
            with self.lock:self.jobs[key]['state']='complete'
        except Exception:
            with self.lock:self.jobs[key]['state']='failed';self.jobs[key]['error']='export_validation_or_generation_failed'
    def status(self,key):
        with self.lock:
            self.cleanup()
            if key not in self.jobs:raise HTTPException(404,'Unknown or expired export')
            row=self.jobs[key]
            return {'job_id':key,'state':row['state'],'expires_at_utc':row['expires_at_utc'],**({'error':row['error']} if 'error'in row else {})}
    def close(self):
        self.executor.shutdown(wait=True);shutil.rmtree(self.root,ignore_errors=True)

_registry=None
_registry_lock=threading.Lock()
def registry():
    global _registry
    with _registry_lock:
        if _registry is None:_registry=Jobs()
        return _registry


@router.post('/foundry',status_code=202,dependencies=[Depends(authorized)])
def submit(request:ExportRequest):
    return registry().status(registry().submit(request))


@router.get('/{job_id}',dependencies=[Depends(authorized)])
def status(job_id:str):return registry().status(job_id)


@router.get('/{job_id}/download',dependencies=[Depends(authorized)])
def download(job_id:str):
    state=registry().status(job_id)
    if state['state']!='complete':raise HTTPException(409,'Export is not complete')
    return FileResponse(registry().root/f'{job_id}.zip',media_type='application/zip',filename=f'NV2_{job_id}_foundry.zip',headers={'Cache-Control':'no-store'})

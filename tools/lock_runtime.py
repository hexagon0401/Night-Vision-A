"""Freeze the tested runtime dependency closure, excluding test-only tools and local packages."""
from importlib.metadata import distribution
from packaging.requirements import Requirement
from packaging.markers import default_environment
from pathlib import Path
pending=[('nv-engine',{'collect','storage'}),('nv-api',set())];found={};visited=set()
while pending:
 name,extras=pending.pop();key=(name,tuple(sorted(extras)))
 if key in visited:continue
 visited.add(key);dist=distribution(name)
 if name not in ('nv-engine','nv-api'):found[dist.metadata['Name']]=dist.version
 for raw in dist.requires or []:
  req=Requirement(raw)
  if req.marker and not any(req.marker.evaluate({**default_environment(),'extra':extra}) for extra in extras|{''}):continue
  pending.append((req.name,set(req.extras)))
Path(__file__).resolve().parents[1].joinpath('requirements-runtime.txt').write_text('# Tested Python 3.12 runtime closure; regenerate deliberately with tools/lock_runtime.py\n'+'\n'.join(f'{name}=={version}' for name,version in sorted(found.items(),key=lambda item:item[0].lower()))+'\n')

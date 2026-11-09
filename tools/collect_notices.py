"""Retain installed production dependency licenses in static distributions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
web=ROOT/'frontend/nv-visualize';lock=json.loads((web/'package-lock.json').read_text())
notices=['Night Vision Alpha — third-party production dependency notices\nApplication source licensing remains the owner\'s decision. No WorldMonitor AGPL code is imported.\n']
for path,entry in sorted(lock['packages'].items()):
    if not path or entry.get('dev'):continue
    package=web/path
    if not package.exists():continue
    metadata=json.loads((package/'package.json').read_text())
    license_=metadata.get('license',entry.get('license','UNKNOWN'))
    if 'AGPL' in str(license_):raise SystemExit('Unexpected AGPL dependency; review required')
    texts=[]
    for name in ('LICENSE','LICENSE.md','LICENSE.txt','license','license.md','LICENCE'):
        source=package/name
        if source.is_file():texts.append(source.read_text(errors='replace'));break
    if not texts:
        readme=package/'README.md'
        if readme.exists():
            body=readme.read_text(errors='replace');at=body.lower().find('## license')
            if at>=0:texts.append(body[at:])
    notices.append(f"\n{'='*60}\n{metadata.get('name',path)} {entry.get('version')} — {license_}\n"+'\n'.join(texts))
(web/'public/THIRD_PARTY_NOTICES.txt').write_text('\n'.join(line.rstrip() for line in '\n'.join(notices).splitlines()).rstrip()+'\n')
print('Production notices retained for',len(notices)-1,'dependencies')

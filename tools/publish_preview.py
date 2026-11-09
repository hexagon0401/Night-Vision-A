"""Publish only reviewed static artifacts to an isolated GitHub Pages branch.

No source branch merge, force push, secret upload or environment-config publication.
"""
import argparse,json,os,re,shutil,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def run(command,**kwargs):return subprocess.check_output(command,cwd=kwargs.pop('cwd',ROOT),text=True,**kwargs).strip()
def api(path,*args):
    body=run(['gh','api',path,*args]);return json.loads(body) if body else {}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--repo',default='hexagon0401/Night-Vision-A');args=p.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',args.repo):raise SystemExit('Invalid repository identity')
    if run(['git','status','--porcelain']):raise SystemExit('Commit the concrete reviewable source first')
    sha=run(['git','rev-parse','HEAD']);branch=f'pages/nv2-alpha-{sha[:12]}'
    checks=api(f'repos/{args.repo}/commits/{sha}/check-runs')['check_runs']
    for name in ('python','frontend'):
        if not any(c['name']==name and c['conclusion']=='success' for c in checks):raise SystemExit(f'Passing {name} CI is required before preview publication')
    try:site=api(f'repos/{args.repo}/pages')
    except subprocess.CalledProcessError:site=None
    if site and not (site.get('source',{}).get('branch') or '').startswith('pages/nv2-alpha-'):
        raise SystemExit('An unrelated Pages site already exists; do not replace it implicitly')
    base='/'+args.repo.split('/')[1]+'/'
    env=dict(os.environ);env['NV_BASE_PATH']=base
    subprocess.run(['npm','run','build'],cwd=ROOT/'frontend/nv-visualize',env=env,check=True)
    subprocess.run([os.sys.executable,'tools/verify_release_assets.py'],cwd=ROOT,check=True)
    with tempfile.TemporaryDirectory(prefix='nv-pages-publish-') as folder:
        destination=Path(folder)
        shutil.copytree(ROOT/'frontend/nv-visualize/dist',destination,dirs_exist_ok=True)
        (destination/'.nojekyll').write_text('')
        (destination/'BUILD_INFO.json').write_text(json.dumps({'source_repository':args.repo,'source_commit':sha,'base_path':base,'scope':'Public/synthetic static Alpha only; no private API or credentials'},indent=2)+'\n')
        subprocess.run(['git','init','-q'],cwd=destination,check=True)
        subprocess.run(['git','checkout','-qb',branch],cwd=destination,check=True)
        identity=run(['git','var','GIT_AUTHOR_IDENT']);match=re.match(r'^(.*?) <([^>]+)>',identity)
        if not match:raise SystemExit('Existing Git author identity unavailable')
        subprocess.run(['git','config','user.name',match[1]],cwd=destination,check=True);subprocess.run(['git','config','user.email',match[2]],cwd=destination,check=True)
        subprocess.run(['git','add','.'],cwd=destination,check=True)
        subprocess.run(['git','commit','-qm',f'Publish isolated NV Alpha build from {sha}'],cwd=destination,check=True)
        # Import the build object, then use the original checkout's existing native Git proxy/auth.
        subprocess.run(['git','fetch',str(destination),branch],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
        artifact=run(['git','rev-parse','FETCH_HEAD'])
        existing=run(['git','ls-remote','--heads','origin',f'refs/heads/{branch}'])
        if existing:
            remote_sha=existing.split()[0];subprocess.run(['git','fetch','origin',branch],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
            if run(['git','rev-parse',artifact+'^{tree}'])!=run(['git','rev-parse',remote_sha+'^{tree}']):raise SystemExit('Immutable preview branch already contains different artifacts')
        else:subprocess.run(['git','push','origin',f'{artifact}:refs/heads/{branch}'],cwd=ROOT,check=True)
        config=destination/'pages-config.json';config.write_text(json.dumps({'source':{'branch':branch,'path':'/'},'build_type':'legacy'}))
        method='PUT' if site else 'POST'
        result=api(f'repos/{args.repo}/pages','--method',method,'--input',str(config))
        print(json.dumps({'url':result.get('html_url',site.get('html_url') if site else None),'source_commit':sha,'preview_branch':branch}))

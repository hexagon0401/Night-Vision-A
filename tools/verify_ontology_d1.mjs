// Disposable Miniflare D1 only. No account bindings or production execution.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const require=createRequire(new URL('../frontend/nv-visualize/package.json',import.meta.url));
const {Miniflare,convertV4MiniflareOptions}=require('miniflare');
const root=new URL('../',import.meta.url);
function statements(sql){
  // sqlite3.complete_statement preserves quoted semicolons and SQL comments.
  return JSON.parse(execFileSync('python3',['-c',`
import sys,json,sqlite3
pending='';result=[]
for line in sys.stdin:
 if line.lstrip().startswith('--'):continue
 pending+=line
 if sqlite3.complete_statement(pending):
  if pending.strip() and not pending.lstrip().upper().startswith('PRAGMA'):result.append(pending)
  pending=''
if pending.strip():raise ValueError('incomplete_sql_statement')
print(json.dumps(result))
`],{input:sql,encoding:'utf8'}));
}
const old=[];
for(const name of ['0001_monitor.sql','0002_beta.sql','0003_event_context.sql'])old.push(...statements(await readFile(new URL('services/cloudflare/migrations/'+name,root),'utf8')));
const proposal=statements(await readFile(new URL('docs/design/nv3.2/0004_ontology_v2.proposed.sql',root),'utf8'));
for(const existing of [false,true]){
  const mf=new Miniflare(await convertV4MiniflareOptions({workers:[{name:'nv32-isolated-test',modules:true,
    script:'export default {fetch(){return new Response("test-only")}}',compatibilityDate:'2026-01-01',d1Databases:['DB']}]}));
  try{
    const db=await mf.getD1Database('DB');
    if(existing){await db.batch(old.map(s=>db.prepare(s)));await db.prepare("INSERT INTO settings(key,value) VALUES('pr1-sentinel','preserve')").run();}
    await db.batch(proposal.map(s=>db.prepare(s)));
    await db.batch(proposal.map(s=>db.prepare(s)));
    const count=await db.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name LIKE 'nv2_%'").first();
    assert.equal(count.n,12);
    const violations=await db.prepare('PRAGMA foreign_key_check').all();assert.equal(violations.results.length,0);
    if(existing)assert.equal((await db.prepare("SELECT value FROM settings WHERE key='pr1-sentinel'").first()).value,'preserve');
    console.log(JSON.stringify({isolatedD1:true,existingSchema:existing,tables:count.n,foreignKeyViolations:0,idempotent:true}));
  }finally{await mf.dispose();}
}

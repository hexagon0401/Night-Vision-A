import {test,expect} from 'vitest';
import {validateSources,validateBetaOutput} from '../../../services/cloudflare/beta.js';
import {PHASES,betaPrompt} from '../../../services/cloudflare/beta-prompt.js';
const source={id:'src_test',title:'SYNTHETIC TEST',url:'https://www.imo.org/test',published_at:'2026-01-01T00:00:00Z',excerpt:'synthetic test text',publisher_family:'imo.org'};
test('beta source dates and citations are bounded without invented publication time',()=>{
 expect(validateSources([source],'2026-11-09T00:00:00Z')).toHaveLength(1);
 expect(()=>validateSources([{...source,published_at:'2027-01-01'}],'2026-11-09')).toThrow('beta_future_source');
 expect(()=>validateSources([{...source,url:'https://secret@imo.org/'}],'2026-11-09')).toThrow();
});
test('complete beta phases and critic criteria are required',()=>{
 const result={sections:Object.fromEntries(PHASES.map(p=>[p,'Synthetic evidence summary [S:src_test]'])),source_ids:['src_test'],hypotheses:[{claim:'test',falsifier:'counterexample',status:'open'}],changes:'none',research_requests:[]};
 expect(validateBetaOutput(result,'analyst',new Set(['src_test']))).toBe(result);
 expect(()=>validateBetaOutput(result,'analyst',new Set())).toThrow();
 expect(()=>validateBetaOutput({...result,sections:{L0:'incomplete'}},'analyst',new Set(['src_test']))).toThrow();
 expect(betaPrompt('critic',3)).toContain('Full iteration 3/3');
});

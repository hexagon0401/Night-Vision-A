import {test,expect} from 'vitest';
import {assembleInvestigation} from '../../../services/cloudflare/nv2-engine.js';
import {readEvidenceMap} from '../src/monitor/evidence-map';
const record={id:'ucdp:test',title:'SYNTHETIC TEST',country:'Test',day:'2026-10-01',end_day:'2026-10-02',lat:20,lon:30,precision:2};
test('regional locations cannot become precise geometry; missing baselines and modules are explicit',()=>{
 const r=assembleInvestigation(record,null);expect(r.map.features).toHaveLength(0);expect(r.detector.state).toBe('waiting_for_baseline');expect(r.module_results).toHaveLength(15);expect(r.quality_gate_results.G2.state).toBe('blocked');expect(r.module_results.find(m=>m.module==='nv2-movement-tracker')?.status).toBe('blocked');
});
test('only provider reported points are mapped; detector candidates retain original identity',()=>{
 const r=assembleInvestigation({...record,precision:1},{analysis:{anomalies:[{anomaly_id:'test-candidate',score:4}],warnings:['coverage gaps']}});expect(r.map.features[0].geometry.coordinates).toEqual([30,20]);expect(r.detector.candidates[0].anomaly_id).toBe('test-candidate');expect(r.detector.calibration).toBe('uncalibrated');expect(readEvidenceMap(r)).toHaveLength(1);
});
test('imported relationships require source references and valid coordinates',()=>{
 const r=assembleInvestigation({...record,precision:1},null);r.map.features[0].properties.source_ids=['invented'];expect(()=>readEvidenceMap(r)).toThrow();r.map.features[0].properties.source_ids=[record.id];r.map.features[0].geometry.coordinates=[999,20];expect(()=>readEvidenceMap(r)).toThrow();
});

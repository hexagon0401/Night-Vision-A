import {test,expect} from '@playwright/test';
for(const width of [1440,390])test(`monitor status, approximate source events and gated AI ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1')return route.abort();
  if(!u.pathname.startsWith('/api/'))return route.continue();
  const responses:Record<string,unknown>={
   '/api/v2/status':{runs_per_day:12,last_success:'2026-11-09T01:00:00Z',next_scheduled_at:'2026-11-09T03:17:00Z',stale:false,runs:[{started:'2026-11-09T01:00:00Z',state:'complete'}],providers:[{provider:'ucdp',metadata:{coverage_start:'2026-01-01',coverage_end:'2026-11-01',records:1,limited:false}}]},
   '/api/v2/overview':{countries:[{country:'SYNTHETIC TEST',events:1}]},
   '/api/v2/cases':{cases:[{id:'case:ucdp:test',country:'SYNTHETIC TEST'}]},
   '/api/auth/me':{user:null,configured:true},
   '/api/v2/monitor-summary':{result:null},
   '/api/v2/events':{records:[{id:'ucdp:test',country:'SYNTHETIC TEST',title:'SYNTHETIC TEST <img src=x>',day:'2026-11-01',end_day:'2026-11-02',kind:'ucdp',version:'test-fixture',precision:2,lat:35,lon:127,low:1,best:2,high:3,hash:'a'.repeat(64),source_url:'https://ucdp.uu.se/'}],limited:false}
  };
  return route.fulfill({contentType:'application/json',body:JSON.stringify(responses[u.pathname]??{})});
 });
 await page.goto('/?view=monitor');await expect(page.getByRole('heading',{name:'세계 분쟁 감시'})).toBeVisible();
 await expect(page.locator('.monitor-status')).toContainText('하루 12회');
 await page.getByRole('button',{name:'2026-11-01 · SYNTHETIC TEST <img src=x>'}).click();
 const detail=page.getByRole('region',{name:'사건 상세'});await expect(detail).toContainText('대략적 보고 위치');await expect(detail).toContainText('최저 1 / 최적 2 / 최고 3');
 expect(await detail.locator('img').count()).toBe(0);
 await detail.getByRole('button',{name:'AI 분석',exact:true}).click();await expect(detail).toContainText('GitHub 로그인 후');
 await expect(detail.getByRole('link',{name:'관련 추이·Trace'})).toHaveAttribute('href','/?case=live&id=case%3Aucdp%3Atest');
 expect(errors).toEqual([]);
});

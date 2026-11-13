export const DAY=86400000;
export function skyPolicy(env,budget={}){const authenticated=!!(env.OPENSKY_CLIENT_ID&&env.OPENSKY_CLIENT_SECRET);const credits=authenticated?(budget.confirmedCredits===8000?8000:4000):400;return {tier:authenticated?(credits===8000?'verified_feeder':'standard_credentials'):'anonymous',daily_credits:credits,credits_per_request:4,max_requests:credits/4,interval_ms:DAY/(credits/4)};}
export function skyNext(now,policy,budget){
 const reset=Math.floor(now/DAY)*DAY+DAY;
 if((budget.positionRequests??0)>=policy.max_requests||budget.remainingCredits!==undefined&&budget.remainingCredits<4)return Math.max(reset,budget.providerRetryAt??0);
 const interval=budget.remainingCredits===undefined?policy.interval_ms:Math.max(policy.interval_ms,(reset-now)/Math.max(1,Math.floor(budget.remainingCredits/4)));
 return Math.max((budget.positionAt??0)+interval,budget.providerRetryAt??0,budget.failureRetryAt??0);
}
// One shared 75-second window per hour, at :17; no catch-up bursts.
export function aisWindow(now){const hour=3600000,offset=17*60000,start=Math.floor((now-offset)/hour)*hour+offset,end=start+75000;return {active:now>=start&&now<end,start,end,next_start:now<end?start:start+hour};}

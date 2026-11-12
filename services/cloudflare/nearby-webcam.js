import {boundedJSON} from './event-context-providers/common.js';
import {requireValue,stmt,json} from './core.js';
import {nearbyQuery} from './nearby.js';
export function webcamImageUrl(value){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.endsWith('.windy.com')&&u.href.length<3000?u.href:null;}catch{return null;}
}
export async function webcamImage(request,env,url){
 requireValue(request.method==='GET','method_not_allowed',405);requireValue(env.WINDY_API_KEY,'windy_key_required',503);
 const id=url.searchParams.get('id')??'';requireValue(/^\d{1,30}$/.test(id),'invalid_webcam');const q=nearbyQuery(url);requireValue(q.type==='webcams','invalid_nearby_type');
 const key='nearby:v1:webcams:'+q.lat+':'+q.lon+':'+q.radius;const entry=await stmt(env.DB,'SELECT value FROM settings WHERE key=?',key).first();
 const saved=entry?JSON.parse(entry.value):null;requireValue(saved&&saved.expires>Date.now()&&saved.body.items.some(i=>i.id==='windy_webcams_v3:'+id),'unknown_or_expired_webcam',404);
 const budget=await stmt(env.DB,"INSERT INTO quotas VALUES(date('now'),'nearby-webcam-image',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<200 RETURNING count").first();requireValue(budget,'webcam_daily_budget',429);
 const api='https://api.windy.com/webcams/api/v3/webcams/'+id+'?include=images,urls';const data=await boundedJSON(api,{headers:{'x-windy-api-key':env.WINDY_API_KEY}});
 requireValue(String(data.webcamId)===id&&data.status==='active','webcam_unavailable',404);
 const image=webcamImageUrl(data.images?.current?.preview)??webcamImageUrl(data.images?.current?.icon);requireValue(image,'webcam_image_unavailable',404);
 // Windy requires the image be used at the exact API-provided URL. Do not log
 // or persist this short-lived URL, proxy its bytes, or expose the API key.
 return json({image_url:image,updated_at:typeof data.lastUpdatedOn==='string'?data.lastUpdatedOn:null});
}

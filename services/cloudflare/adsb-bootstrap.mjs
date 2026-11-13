import {configureAdsbAutopilot} from './adsb-autopilot.mjs';
/** Cloudflare-owner deployment setting, never populated from an HTTP request.
 * Once applied, an operator Stop persists across cold starts and redeploys.
 */
export async function bootstrapAdsb(hub){
 const {env,state}=hub,id=env.ADSB_LOL_AUTOSTART_ID;
 if(env.NV_AIRCRAFT_PROVIDER!=='adsb_lol'||env.ADSB_LOL_ENABLED!=='true'||!id)return false;
 if(typeof id!=='string'||!/^[a-z0-9_-]{1,64}$/.test(id))return false;
 if(await state.storage.get('adsb:bootstrap')===id)return false;
 try{
  const raw=env.ADSB_LOL_WATCHLIST_JSON;
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>4000)throw Error('invalid_watchlist');
  await configureAdsbAutopilot(hub,{enabled:true,regions:JSON.parse(raw),focus:null});
  await hub.arm();
  await state.storage.put('adsb:bootstrap',id);
  return true;
 }catch{await state.storage.put('adsb:bootstrap-error','operator_watchlist_configuration_failed');return false;}
}

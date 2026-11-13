// Minimal v2 art adapter: preserve sourced v1 classification semantics.
const minimalIds={"vessel-ro_ro": "vessel-cargo", "vessel-gas_tanker": "vessel-tanker", "vessel-chemical_tanker": "vessel-tanker", "vessel-pleasure": "vessel-unknown", "vessel-hsc": "vessel-fast", "vessel-tow": "vessel-tug", "vessel-dredger": "vessel-service", "vessel-pilot": "vessel-service", "vessel-sar": "vessel-service", "vessel-medical": "vessel-service", "vessel-law_enforcement": "vessel-patrol", "vessel-military": "vessel-patrol", "vessel-wig": "vessel-unknown", "aircraft-bizjet": "aircraft-business", "aircraft-regional_jet": "aircraft-regional", "aircraft-jumbo": "aircraft-widebody", "aircraft-light_single": "aircraft-light_prop", "aircraft-twin_piston": "aircraft-light_prop", "aircraft-glider": "aircraft-unknown", "aircraft-tiltrotor": "aircraft-unknown", "aircraft-heavy_transport": "aircraft-unknown", "aircraft-cargo": "aircraft-freighter"};
const minimal=id=>minimalIds[id]??id;
/** Night Vision AIS/ADS-B icon mapping, zero dependencies. */
const SHIP = new Set(["unknown", "cargo", "container", "bulk", "ro_ro", "tanker", "gas_tanker", "chemical_tanker", "passenger", "cruise", "ferry", "fishing", "tow", "tug", "dredger", "sailing", "pleasure", "hsc", "pilot", "sar", "law_enforcement", "military", "service", "medical", "wig"]);
const AIR = new Set(["unknown", "light_single", "twin_piston", "turboprop", "regional_jet", "narrowbody", "widebody", "jumbo", "cargo", "bizjet", "helicopter", "fighter", "heavy_transport", "uav", "glider", "tiltrotor"]);
const EXPLICIT_SHIP_SUBTYPES = new Set(['container','bulk','ro_ro','cruise','ferry','gas_tanker','chemical_tanker']);
/** AIS is self-declared and may be incomplete or stale. Never infer container, cruise, LNG, etc from type code alone. */
export function iconFromAIS(typeCode, verifiedSubtype=null) {
  const t = typeof typeCode === 'number' ? typeCode : (/^\d{1,2}$/.test(String(typeCode)) ? Number(typeCode) : NaN);
  let k='unknown';
  if (t===30) k='fishing';
  else if (t===31 || t===32) k='tow';
  else if (t===33) k='dredger';
  else if (t===34) k='service';
  else if (t===35) k='military';
  else if (t===36) k='sailing';
  else if (t===37) k='pleasure';
  else if (t>=40 && t<=49) k='hsc';
  else if (t===50) k='pilot';
  else if (t===51) k='sar';
  else if (t===52) k='tug';
  else if (t===53 || t===54 || t===59) k='service';
  else if (t===55) k='law_enforcement';
  else if (t===58) k='medical';
  else if (t>=60 && t<=69) k='passenger';
  else if (t>=70 && t<=79) k='cargo';
  else if (t>=80 && t<=89) k='tanker';
  else if (t>=20 && t<=29) k='wig';
  else if (t>=90 && t<=99) k='unknown';
  // Explicit external ship-registry subtype may refine only a compatible AIS base class.
  if (typeof verifiedSubtype==='string' && EXPLICIT_SHIP_SUBTYPES.has(verifiedSubtype)) {
    const families={cargo:['container','bulk','ro_ro'],passenger:['cruise','ferry'],tanker:['gas_tanker','chemical_tanker']};
    if ((families[k]??[]).includes(verifiedSubtype)) k=verifiedSubtype;
  }
  return minimal(`vessel-${SHIP.has(k)?k:'unknown'}`);
}

const TYPE_GROUPS = {
  light_single:['C150','C152','C172','C182','PA28','SR20','SR22','C208','PC12'],
  twin_piston:['PA34','PA44','BE58','C310','C340'],
  turboprop:['AT43','AT45','AT72','AT75','AT76','DH8A','DH8B','DH8C','DH8D','SF34','BE20'],
  regional_jet:['E170','E175','E190','E195','E290','E295','CRJ2','CRJ7','CRJ9','CRJX','RJ85'],
  narrowbody:['A318','A319','A320','A321','A19N','A20N','A21N','B733','B734','B735','B736','B737','B738','B739','B38M','B39M','B3XM','B752'],
  widebody:['A332','A333','A338','A339','A342','A343','A345','A346','A359','A35K','B762','B763','B764','B772','B773','B77L','B77W','B788','B789','B78X'],
  jumbo:['A388','B741','B742','B743','B744','B748'],
  heavy_transport:['A124','A225','C17','C5M'],
  bizjet:['GLF4','GLF5','GLF6','GLEX','G650','C25A','C25B','C25C','C56X','CL30','CL35','CL60','E55P','E545','F900'],
  helicopter:['R22','R44','R66','EC35','EC45','H125','H145','A139','A109','S76','B407','B412'],
  fighter:['F16','F15','F18','F35','F22','A10','SU27','SU30','EUFI','RFAL'],
  tiltrotor:['V22','CV22','MV22'],
  glider:['ASW2','DG80','LS8'],
  uav:['MQ9','RQ4'],
};
const TYPE_TO_ICON = new Map(Object.entries(TYPE_GROUPS).flatMap(([name,types])=>types.map(type=>[type,name])));
/** ICAO type designator, NOT ADS-B emitter category. Role (cargo, military, civilian) requires separate verified data. */
export function iconFromICAOType(typeDesignator, verifiedRole=null) {
  const code=String(typeDesignator??'').trim().toUpperCase();
  let k=TYPE_TO_ICON.get(code)??'unknown';
  // Cargo role cannot be inferred from airframe designator; apply only for verified role.
  if (verifiedRole==='cargo' && ['regional_jet','narrowbody','widebody','jumbo','heavy_transport'].includes(k))k='cargo';
  return minimal(`aircraft-${AIR.has(k)?k:'unknown'}`);
}
export const iconURL = (id, scale=2)=> {
  if(!/^((vessel|aircraft)-[a-z_]+)$/.test(id))throw new Error('invalid_icon_id');
  if(![1,2,3].includes(scale))throw new Error('invalid_pixel_ratio');
  return `/assets/nightvision/minimal-v2/png/${({1:24,2:48,3:96})[scale]}/${id}.png`;
};
export const iconHeading = (headingDegrees) => Number.isFinite(headingDegrees) ? ((headingDegrees%360)+360)%360 : 0;

// Independently implemented. Metadata/link policy only; never embed third-party media.
export const providers=[
 {id:'ucdp_existing',category:'official_notice',enabled:true,url:'https://ucdp.uu.se/',terms:'https://ucdp.uu.se/downloads/'},
 {id:'gdelt_doc',category:'article',enabled:false,url:'https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/',terms:'https://www.gdeltproject.org/about.html',reason:'live_probe_failed_http_503'},
 {id:'earth_search_stac',category:'satellite',enabled:true,url:'https://earth-search.aws.element84.com/v1',terms:'https://element84.com/earth-search/'},
 {id:'us_road_cameras_official',category:'cctv',enabled:true,url:'https://cwwp2.dot.ca.gov/tools/cctv.html',terms:'https://dot.ca.gov/conditions-of-use'},
 {id:'panoramax',category:'street_view',enabled:false,url:'https://panoramax.fr/',terms:'https://docs.panoramax.fr/',reason:'terms_pending'},
 {id:'mapillary_street_photo',category:'photo',key:'MAPILLARY_ACCESS_TOKEN',url:'https://www.mapillary.com/',terms:'https://www.mapillary.com/developer'},
 {id:'windy_webcams_v3',category:'cctv',key:'WINDY_API_KEY',url:'https://api.windy.com/webcams/docs',terms:'https://api.windy.com/webcams/terms'},
 {id:'noaa_ais_archive',category:'ais',url:'https://marinecadastre.gov/ais/',terms:'https://coast.noaa.gov/digitalcoast/tools/ais.html',reason:'historical_subset_not_configured'},
 {id:'aisstream',category:'ais',key:'AISSTREAM_API_KEY',url:'https://aisstream.io/',terms:'https://aisstream.io/',reason:'relay_not_configured'},
 {id:'opensky',category:'adsb',key:'OPENSKY_CLIENT_SECRET',url:'https://openskynetwork.github.io/opensky-api/rest.html',terms:'https://opensky-network.org/about/terms-of-use',reason:'historical_permission_required'},
 {id:'adsb_lol',category:'adsb',url:'https://api.adsb.lol/docs',terms:'https://api.adsb.lol/docs',reason:'historical_unavailable'},
 {id:'nasa_worldview',category:'satellite',url:'https://worldview.earthdata.nasa.gov/',terms:'https://www.earthdata.nasa.gov/engage/open-data-services-and-software/data-and-information-policy',reason:'terms_pending'},
];
export function eligibility(p,r){
 const precise=[1,2].includes(r.precision)&&r.lat!==null&&r.lon!==null;
 if(['cctv','street_view','photo','satellite','ais','adsb'].includes(p.category)&&!precise)return 'inapplicable_precision';
 // No actor-based guess that a military organization implies aircraft or shipping.
 const text=[r.location_name,r.conflict_name,r.source_headline].filter(Boolean).join(' ');
 if(p.category==='ais'&&!/\b(port|ship|vessel|maritime|strait|harbour|harbor)\b/i.test(text))return 'no_maritime_evidence';
 if(p.category==='adsb'&&!/\b(airport|aircraft|aviation|flight)\b/i.test(text))return 'no_aviation_evidence';
 if(p.id==='us_road_cameras_official'&&(!/^(United States|United States of America|USA)$/.test(r.country)||r.lat<32||r.lat>42||r.lon< -125||r.lon> -114))return 'outside_reviewed_catalog_coverage';
 if(p.id==='noaa_ais_archive'&&!/^(United States|United States of America|USA)$/.test(r.country))return 'outside_us_archive_coverage';
 return null;
}
export function policy(p,env){
 if((env.CONTEXT_DISABLED_PROVIDERS??'').split(',').includes(p.id))return {status:'disabled',reason:'operator_disabled'};
 if(p.id==='gdelt_doc'&&env.CONTEXT_GDELT_ENABLED==='true'&&env.CONTEXT_GDELT_TERMS_REVIEWED==='true')return null;
 if(p.key&&!env[p.key])return {status:'key_required',reason:'credential_not_registered'};
 if(p.enabled)return null;
 return {status:p.reason==='historical_unavailable'?'historical_unavailable':p.reason==='terms_pending'||!p.reason?'terms_pending':'disabled',reason:p.reason??'terms_pending'};
}

function $n(i,e){if(!i)throw new Error(e||"loader assertion failed.")}const Zo=!!(typeof process!="object"||String(process)!=="[object process]"||process.browser),fc=typeof process<"u"&&process.version&&/v([0-9]*)/.exec(process.version);fc&&parseFloat(fc[1]);const Vs=globalThis,dc=globalThis.process||{},Rg=globalThis.navigator||{};function bf(i){if(typeof window<"u"&&window.process?.type==="renderer"||typeof process<"u"&&process.versions?.electron)return!0;const t=typeof navigator<"u"&&navigator.userAgent;return!!(t&&t.indexOf("Electron")>=0)}function Jt(){return!(typeof process=="object"&&String(process)==="[object process]"&&!process?.browser)||bf()}function Og(i){return Jt()?bf()?"Electron":(Rg.userAgent||"").indexOf("Edge")>-1?"Edge":globalThis.chrome?"Chrome":globalThis.safari?"Safari":globalThis.mozInnerScreenX?"Firefox":"Unknown":"Node"}const vf="4.1.2";function Ko(i,e){if(!i)throw new Error("Assertion failed")}function wf(i){if(!i)return 0;let e;switch(typeof i){case"number":e=i;break;case"object":e=i.logLevel||i.priority||0;break;default:return 0}return Ko(Number.isFinite(e)&&e>=0),e}function Bg(i){const{logLevel:e,message:t}=i;i.logLevel=wf(e);const n=i.args?Array.from(i.args):[];for(;n.length&&n.shift()!==t;);switch(typeof e){case"string":case"function":t!==void 0&&n.unshift(t),i.message=e;break;case"object":Object.assign(i,e);break}typeof i.message=="function"&&(i.message=i.message());const s=typeof i.message;return Ko(s==="string"||s==="object"),Object.assign(i,{args:n},i.opts)}const Dt=()=>{};class kg{constructor({level:e=0}={}){this.userData={},this._onceCache=new Set,this._level=e}set level(e){this.setLevel(e)}get level(){return this.getLevel()}setLevel(e){return this._level=e,this}getLevel(){return this._level}warn(e,...t){return this._log("warn",0,e,t,{once:!0})}error(e,...t){return this._log("error",0,e,t)}log(e,t,...n){return this._log("log",e,t,n)}info(e,t,...n){return this._log("info",e,t,n)}once(e,t,...n){return this._log("once",e,t,n,{once:!0})}_log(e,t,n,s,r={}){const o=Bg({logLevel:t,message:n,args:this._buildArgs(t,n,s),opts:r});return this._createLogFunction(e,o,r)}_buildArgs(e,t,n){return[e,t,...n]}_createLogFunction(e,t,n){if(!this._shouldLog(t.logLevel))return Dt;const s=this._getOnceTag(n.tag??t.tag??t.message);if((n.once||t.once)&&s!==void 0){if(this._onceCache.has(s))return Dt;this._onceCache.add(s)}return this._emit(e,t)}_shouldLog(e){return this.getLevel()>=wf(e)}_getOnceTag(e){if(e!==void 0)try{return typeof e=="string"?e:String(e)}catch{return}}}function Dg(i){try{const e=window[i],t="__storage_test__";return e.setItem(t,t),e.removeItem(t),e}catch{return null}}class Fg{constructor(e,t,n="sessionStorage"){this.storage=Dg(n),this.id=e,this.config=t,this._loadConfiguration()}getConfiguration(){return this.config}setConfiguration(e){if(Object.assign(this.config,e),this.storage){const t=JSON.stringify(this.config);this.storage.setItem(this.id,t)}}_loadConfiguration(){let e={};if(this.storage){const t=this.storage.getItem(this.id);e=t?JSON.parse(t):{}}return Object.assign(this.config,e),this}}function zg(i){let e;return i<10?e=`${i.toFixed(2)}ms`:i<100?e=`${i.toFixed(1)}ms`:i<1e3?e=`${i.toFixed(0)}ms`:e=`${(i/1e3).toFixed(2)}s`,e}function Ng(i,e=8){const t=Math.max(e-i.length,0);return`${" ".repeat(t)}${i}`}var Un;(function(i){i[i.BLACK=30]="BLACK",i[i.RED=31]="RED",i[i.GREEN=32]="GREEN",i[i.YELLOW=33]="YELLOW",i[i.BLUE=34]="BLUE",i[i.MAGENTA=35]="MAGENTA",i[i.CYAN=36]="CYAN",i[i.WHITE=37]="WHITE",i[i.BRIGHT_BLACK=90]="BRIGHT_BLACK",i[i.BRIGHT_RED=91]="BRIGHT_RED",i[i.BRIGHT_GREEN=92]="BRIGHT_GREEN",i[i.BRIGHT_YELLOW=93]="BRIGHT_YELLOW",i[i.BRIGHT_BLUE=94]="BRIGHT_BLUE",i[i.BRIGHT_MAGENTA=95]="BRIGHT_MAGENTA",i[i.BRIGHT_CYAN=96]="BRIGHT_CYAN",i[i.BRIGHT_WHITE=97]="BRIGHT_WHITE"})(Un||(Un={}));const $g=10;function hc(i){return typeof i!="string"?i:(i=i.toUpperCase(),Un[i]||Un.WHITE)}function Ug(i,e,t){return!Jt&&typeof i=="string"&&(e&&(i=`\x1B[${hc(e)}m${i}\x1B[39m`),t&&(i=`\x1B[${hc(t)+$g}m${i}\x1B[49m`)),i}function Gg(i,e=["constructor"]){const t=Object.getPrototypeOf(i),n=Object.getOwnPropertyNames(t),s=i;for(const r of n){const o=s[r];typeof o=="function"&&(e.find(a=>r===a)||(s[r]=o.bind(i)))}}class xf{getHighResolutionTimer(){let e;if(Jt()&&Vs.performance)e=Vs?.performance?.now?.();else if("hrtime"in dc){const t=dc?.hrtime?.();e=t[0]*1e3+t[1]/1e6}else e=Date.now();return e}getMemoryUsageMB(){const t=Vs?.performance?.memory?.usedJSHeapSize;return t==null?null:Math.trunc(t/1024/1024)}}const rt=new xf;globalThis.Probe=xf;globalThis.probe=rt;const Ct={debug:Jt()&&console.debug||console.log,log:console.log,info:console.info,warn:console.warn,error:console.error},js={enabled:!0,level:0};class Wi extends kg{constructor({id:e}={id:""}){super({level:0}),this.VERSION=vf,this._startTs=rt.getHighResolutionTimer(),this._deltaTs=rt.getHighResolutionTimer(),this.userData={},this.LOG_THROTTLE_TIMEOUT=0,this.id=e,this.userData={},this._storage=new Fg(`__probe-${this.id}__`,{[this.id]:js}),this.timeStamp(`${this.id} started`),Gg(this),Object.seal(this)}isEnabled(){return this._getConfiguration().enabled}getLevel(){return this._getConfiguration().level}getTotal(){return Number((rt.getHighResolutionTimer()-this._startTs).toPrecision(10))}getDelta(){return Number((rt.getHighResolutionTimer()-this._deltaTs).toPrecision(10))}set priority(e){this.level=e}get priority(){return this.level}getPriority(){return this.level}enable(e=!0){return this._updateConfiguration({enabled:e}),this}setLevel(e){return this._updateConfiguration({level:e}),this}get(e){return this._getConfiguration()[e]}set(e,t){this._updateConfiguration({[e]:t})}settings(){console.table?console.table(this._storage.config):console.log(this._storage.config)}assert(e,t){if(!e)throw new Error(t||"Assertion failed")}warn(e,...t){return this._log("warn",0,e,t,{method:Ct.warn,once:!0})}error(e,...t){return this._log("error",0,e,t,{method:Ct.error})}deprecated(e,t){return this.warn(`\`${e}\` is deprecated and will be removed in a later version. Use \`${t}\` instead`)}removed(e,t){return this.error(`\`${e}\` has been removed. Use \`${t}\` instead`)}probe(e,t,...n){const s=rt.getMemoryUsageMB();if(s!==null){const r=`${s}MB `;typeof t=="function"?t=()=>`${r}${t()}`:typeof t=="string"&&(t=`${r}${t}`)}return this._log("log",e,t,n,{method:Ct.log,time:!0,once:!0})}log(e,t,...n){return this._log("log",e,t,n,{method:Ct.debug})}info(e,t,...n){return this._log("info",e,t,n,{method:console.info})}once(e,t,...n){return this._log("once",e,t,n,{method:Ct.debug||Ct.info,once:!0})}table(e,t,n){return t?this._log("table",e,t,n&&[n]||[],{method:console.table||Dt,tag:jg(t)}):Dt}time(e,t){return this._log("time",e,t,[],{method:console.time?console.time:console.info})}timeEnd(e,t){return this._log("time",e,t,[],{method:console.timeEnd?console.timeEnd:console.info})}timeStamp(e,t){return this._log("time",e,t,[],{method:console.timeStamp||Dt})}group(e,t,n={collapsed:!1}){const s=(n.collapsed?console.groupCollapsed:console.group)||console.info;return this._log("group",e,t,[],{method:s})}groupCollapsed(e,t,n={}){return this.group(e,t,Object.assign({},n,{collapsed:!0}))}groupEnd(e){return this._log("groupEnd",e,"",[],{method:console.groupEnd||Dt})}withGroup(e,t,n){this.group(e,t)();try{n()}finally{this.groupEnd(e)()}}trace(){console.trace&&console.trace()}_shouldLog(e){return this.isEnabled()&&super._shouldLog(e)}_emit(e,t){const n=t.method;Ko(n),t.total=this.getTotal(),t.delta=this.getDelta(),this._deltaTs=rt.getHighResolutionTimer();const s=Vg(this.id,t.message,t);return n.bind(console,s,...t.args)}_getConfiguration(){return this._storage.config[this.id]||this._updateConfiguration(js),this._storage.config[this.id]}_updateConfiguration(e){const t=this._storage.config[this.id]||{...js};this._storage.setConfiguration({[this.id]:{...t,...e}})}}Wi.VERSION=vf;function Vg(i,e,t){if(typeof e=="string"){const n=t.time?Ng(zg(t.total)):"";e=t.time?`${i}: ${n}  ${e}`:`${i}: ${e}`,e=Ug(e,t.color,t.background)}return e}function jg(i){for(const e in i)for(const t in i[e])return t||"untitled";return"empty"}const Ws="4.5.4",Wg=Ws[0]>="0"&&Ws[0]<="9"?`v${Ws}`:"";function Hg(){const i=new Wi({id:"loaders.gl"});return globalThis.loaders||={},globalThis.loaders.log=i,globalThis.loaders.version=Wg,globalThis.probe||={},globalThis.probe.loaders=i,i}const Yg=Hg(),qg=i=>typeof i=="boolean",Re=i=>typeof i=="function",vt=i=>i!==null&&typeof i=="object",gc=i=>vt(i)&&i.constructor==={}.constructor,Pf=i=>typeof SharedArrayBuffer<"u"&&i instanceof SharedArrayBuffer,Qo=i=>vt(i)&&typeof i.byteLength=="number"&&typeof i.slice=="function",Xg=i=>!!i&&Re(i[Symbol.iterator]),Zg=i=>!!i&&Re(i[Symbol.asyncIterator]),wt=i=>typeof Response<"u"&&i instanceof Response||vt(i)&&Re(i.arrayBuffer)&&Re(i.text)&&Re(i.json),xt=i=>typeof Blob<"u"&&i instanceof Blob,Kg=i=>typeof ReadableStream<"u"&&i instanceof ReadableStream||vt(i)&&Re(i.tee)&&Re(i.cancel)&&Re(i.getReader),Qg=i=>vt(i)&&Re(i.read)&&Re(i.pipe)&&qg(i.readable),Ef=i=>Kg(i)||Qg(i);function Jg(i,e){return Sf(i||{},e)}function Sf(i,e,t=0){if(t>3)return e;const n={...i};for(const[s,r]of Object.entries(e))r&&typeof r=="object"&&!Array.isArray(r)?n[s]=Sf(n[s]||{},e[s],t+1):n[s]=e[s];return n}const ep="latest";function tp(){return globalThis._loadersgl_?.version||(globalThis._loadersgl_=globalThis._loadersgl_||{},globalThis._loadersgl_.version="4.5.4"),globalThis._loadersgl_.version}const ip=tp();function Qe(i,e){if(!i)throw new Error(e||"loaders.gl assertion failed.")}const lt=typeof process!="object"||String(process)!=="[object process]"||process.browser,np=typeof window<"u"&&typeof window.orientation<"u",pc=typeof process<"u"&&process.version&&/v([0-9]*)/.exec(process.version);pc&&parseFloat(pc[1]);class sp{name;workerThread;isRunning=!0;result;_resolve=()=>{};_reject=()=>{};constructor(e,t){this.name=e,this.workerThread=t,this.result=new Promise((n,s)=>{this._resolve=n,this._reject=s})}postMessage(e,t){this.workerThread.postMessage({source:"loaders.gl",type:e,payload:t})}done(e){Qe(this.isRunning),this.isRunning=!1,this._resolve(e)}error(e){Qe(this.isRunning),this.isRunning=!1,this._reject(e)}}class Hs{terminate(){}}const Ys=new Map;function rp(i){Qe(i.source&&!i.url||!i.source&&i.url);let e=Ys.get(i.source||i.url);return e||(i.url&&(e=op(i.url),Ys.set(i.url,e)),i.source&&(e=Tf(i.source),Ys.set(i.source,e))),Qe(e),e}function op(i){if(!i.startsWith("http"))return i;const e=ap(i);return Tf(e)}function Tf(i){const e=new Blob([i],{type:"application/javascript"});return URL.createObjectURL(e)}function ap(i){return`try {
  importScripts('${i}');
} catch (error) {
  console.error(error);
  throw error;
}`}function Lf(i,e=!0,t){const n=t||new Set;if(i){if(mc(i))n.add(i);else if(mc(i.buffer))n.add(i.buffer);else if(!ArrayBuffer.isView(i)){if(e&&typeof i=="object")for(const s in i)Lf(i[s],e,n)}}return t===void 0?Array.from(n):[]}function mc(i){return i?i instanceof ArrayBuffer||typeof MessagePort<"u"&&i instanceof MessagePort||typeof ImageBitmap<"u"&&i instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas:!1}const qs=()=>{};class Jr{name;source;url;terminated=!1;worker;onMessage;onError;_loadableURL="";static isSupported(){return typeof Worker<"u"&&lt||typeof Hs<"u"&&!lt}constructor(e){const{name:t,source:n,url:s}=e;Qe(n||s),this.name=t,this.source=n,this.url=s,this.onMessage=qs,this.onError=r=>console.log(r),this.worker=lt?this._createBrowserWorker():this._createNodeWorker()}destroy(){this.onMessage=qs,this.onError=qs,this.worker.terminate(),this.terminated=!0}get isRunning(){return!!this.onMessage}postMessage(e,t){t=t||Lf(e),this.worker.postMessage(e,t)}_getErrorFromErrorEvent(e){let t="Failed to load ";return t+=`worker ${this.name} from ${this.url}. `,e.message&&(t+=`${e.message} in `),e.lineno&&(t+=`:${e.lineno}:${e.colno}`),new Error(t)}_createBrowserWorker(){this._loadableURL=rp({source:this.source,url:this.url});const e=new Worker(this._loadableURL,{name:this.name});return e.onmessage=t=>{t.data?this.onMessage(t.data):this.onError(new Error("No data received"))},e.onerror=t=>{this.onError(this._getErrorFromErrorEvent(t)),this.terminated=!0},e.onmessageerror=t=>console.error(t),e}_createNodeWorker(){let e;if(this.url){const n=this.url.includes(":/")||this.url.startsWith("/")?this.url:`./${this.url}`,s=this.url.endsWith(".ts")||this.url.endsWith(".mjs")?"module":"commonjs";e=new Hs(n,{eval:!1,type:s})}else if(this.source)e=new Hs(this.source,{eval:!0});else throw new Error("no worker");return e.on("message",t=>{this.onMessage(t)}),e.on("error",t=>{this.onError(t)}),e.on("exit",t=>{}),e}}class cp{name="unnamed";source;url;maxConcurrency=1;maxMobileConcurrency=1;onDebug=()=>{};reuseWorkers=!0;props={};jobQueue=[];idleQueue=[];count=0;isDestroyed=!1;static isSupported(){return Jr.isSupported()}constructor(e){this.source=e.source,this.url=e.url,this.setProps(e)}destroy(){this.idleQueue.forEach(e=>e.destroy()),this.isDestroyed=!0}setProps(e){this.props={...this.props,...e},e.name!==void 0&&(this.name=e.name),e.maxConcurrency!==void 0&&(this.maxConcurrency=e.maxConcurrency),e.maxMobileConcurrency!==void 0&&(this.maxMobileConcurrency=e.maxMobileConcurrency),e.reuseWorkers!==void 0&&(this.reuseWorkers=e.reuseWorkers),e.onDebug!==void 0&&(this.onDebug=e.onDebug)}async startJob(e,t=(s,r,o)=>s.done(o),n=(s,r)=>s.error(r)){const s=new Promise(r=>(this.jobQueue.push({name:e,onMessage:t,onError:n,onStart:r}),this));return this._startQueuedJob(),await s}async _startQueuedJob(){if(!this.jobQueue.length)return;const e=this._getAvailableWorker();if(!e)return;const t=this.jobQueue.shift();if(t){this.onDebug({message:"Starting job",name:t.name,workerThread:e,backlog:this.jobQueue.length});const n=new sp(t.name,e);e.onMessage=s=>t.onMessage(n,s.type,s.payload),e.onError=s=>t.onError(n,s),t.onStart(n);try{await n.result}catch(s){console.error(`Worker exception: ${s}`)}finally{this.returnWorkerToQueue(e)}}}returnWorkerToQueue(e){!lt||this.isDestroyed||!this.reuseWorkers||this.count>this._getMaxConcurrency()?(e.destroy(),this.count--):this.idleQueue.push(e),this.isDestroyed||this._startQueuedJob()}_getAvailableWorker(){if(this.idleQueue.length>0)return this.idleQueue.shift()||null;if(this.count<this._getMaxConcurrency()){this.count++;const e=`${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`;return new Jr({name:e,source:this.source,url:this.url})}return null}_getMaxConcurrency(){return np?this.maxMobileConcurrency:this.maxConcurrency}}const lp={maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:!0,onDebug:()=>{}};class We{props;workerPools=new Map;static _workerFarm;static isSupported(){return Jr.isSupported()}static getWorkerFarm(e={}){return We._workerFarm=We._workerFarm||new We({}),We._workerFarm.setProps(e),We._workerFarm}constructor(e){this.props={...lp},this.setProps(e),this.workerPools=new Map}destroy(){for(const e of this.workerPools.values())e.destroy();this.workerPools=new Map}setProps(e){this.props={...this.props,...e};for(const t of this.workerPools.values())t.setProps(this._getWorkerPoolProps())}getWorkerPool(e){const{name:t,source:n,url:s}=e;let r=this.workerPools.get(t);return r||(r=new cp({name:t,source:n,url:s}),r.setProps(this._getWorkerPoolProps()),this.workerPools.set(t,r)),r}_getWorkerPoolProps(){return{maxConcurrency:this.props.maxConcurrency,maxMobileConcurrency:this.props.maxMobileConcurrency,reuseWorkers:this.props.reuseWorkers,onDebug:this.props.onDebug}}}function up(i,e={}){const t=e[i.id]||{},n=lt?i.workerFile||`${i.id}-worker.js`:`${i.id}-worker-node.js`;let s=t.workerUrl;if(!s&&i.id==="compression"&&(s=e.workerUrl),(e._workerType||e?.core?._workerType)==="test"&&(lt?s=`modules/${i.module}/dist/${n}`:s=`modules/${i.module}/src/workers/${i.id}-worker-node.ts`),!s){let o=i.version;o==="latest"&&(o=ep);const a=o?`@${o}`:"";s=`https://unpkg.com/@loaders.gl/${i.module}${a}/dist/${n}`}return Qe(s),s}function fp(i,e=ip){Qe(i,"no worker provided");const t=i.version;return!(!e||!t)}function dp(i,e){if(!We.isSupported())return!1;const t=e?._nodeWorkers??e?.core?._nodeWorkers;if(!lt&&!t)return!1;const n=e?.worker??e?.core?.worker;return!!(i.worker&&n)}async function hp(i,e,t,n,s){const r=i.id,o=up(i,t),c=We.getWorkerFarm(t?.core).getWorkerPool({name:r,url:o});t=JSON.parse(JSON.stringify(t||{})),t._workerLoaderId=i.id,n=JSON.parse(JSON.stringify(n||{}));const l=await c.startJob("process-on-worker",gp.bind(null,s));return l.postMessage("process",{input:e,options:t,context:n}),await(await l.result).result}async function gp(i,e,t,n){switch(t){case"done":e.done(n);break;case"error":e.error(new Error(n.error));break;case"process":const{id:s,input:r,options:o}=n;try{const a=await i(r,o);e.postMessage("done",{id:s,result:a})}catch(a){const c=a instanceof Error?a.message:"unknown error";e.postMessage("error",{id:s,error:c})}break;default:console.warn(`parse-with-worker unknown message ${t}`)}}function pp(i,e,t){if(t=t||i.byteLength,i.byteLength<t||e.byteLength<t)return!1;const n=new Uint8Array(i),s=new Uint8Array(e);for(let r=0;r<n.length;++r)if(n[r]!==s[r])return!1;return!0}function mp(...i){return _p(i)}function _p(i){const e=i.map(r=>r instanceof ArrayBuffer?new Uint8Array(r):r),t=e.reduce((r,o)=>r+o.byteLength,0),n=new Uint8Array(t);let s=0;for(const r of e)n.set(r,s),s+=r.byteLength;return n.buffer}async function yp(i){const e=[];for await(const t of i)e.push(bp(t));return mp(...e)}function bp(i){if(i instanceof ArrayBuffer)return i;if(ArrayBuffer.isView(i)){const{buffer:e,byteOffset:t,byteLength:n}=i;return _c(e,t,n)}return _c(i)}function _c(i,e=0,t=i.byteLength-e){const n=new Uint8Array(i,e,t),s=new Uint8Array(n.length);return s.set(n),s.buffer}function yc(){let i;if(typeof window<"u"&&window.performance)i=window.performance.now();else if(typeof process<"u"&&process.hrtime){const e=process.hrtime();i=e[0]*1e3+e[1]/1e6}else i=Date.now();return i}class bc{constructor(e,t){this.sampleSize=1,this.time=0,this.count=0,this.samples=0,this.lastTiming=0,this.lastSampleTime=0,this.lastSampleCount=0,this._count=0,this._time=0,this._samples=0,this._startTime=0,this._timerPending=!1,this.name=e,this.type=t,this.reset()}reset(){return this.time=0,this.count=0,this.samples=0,this.lastTiming=0,this.lastSampleTime=0,this.lastSampleCount=0,this._count=0,this._time=0,this._samples=0,this._startTime=0,this._timerPending=!1,this}setSampleSize(e){return this.sampleSize=e,this}incrementCount(){return this.addCount(1),this}decrementCount(){return this.subtractCount(1),this}addCount(e){return this._count+=e,this._samples++,this._checkSampling(),this}subtractCount(e){return this._count-=e,this._samples++,this._checkSampling(),this}addTime(e){return this._time+=e,this.lastTiming=e,this._samples++,this._checkSampling(),this}timeStart(){return this._startTime=yc(),this._timerPending=!0,this}timeEnd(){return this._timerPending?(this.addTime(yc()-this._startTime),this._timerPending=!1,this._checkSampling(),this):this}getSampleAverageCount(){return this.sampleSize>0?this.lastSampleCount/this.sampleSize:0}getSampleAverageTime(){return this.sampleSize>0?this.lastSampleTime/this.sampleSize:0}getSampleHz(){return this.lastSampleTime>0?this.sampleSize/(this.lastSampleTime/1e3):0}getAverageCount(){return this.samples>0?this.count/this.samples:0}getAverageTime(){return this.samples>0?this.time/this.samples:0}getHz(){return this.time>0?this.samples/(this.time/1e3):0}_checkSampling(){this._samples===this.sampleSize&&(this.lastSampleTime=this._time,this.lastSampleCount=this._count,this.count+=this._count,this.time+=this._time,this.samples+=this._samples,this._time=0,this._count=0,this._samples=0)}}class _s{constructor(e){this.stats={},this.id=e.id,this.stats={},this._initializeStats(e.stats),Object.seal(this)}get(e,t="count"){return this._getOrCreate({name:e,type:t})}get size(){return Object.keys(this.stats).length}reset(){for(const e of Object.values(this.stats))e.reset();return this}forEach(e){for(const t of Object.values(this.stats))e(t)}getTable(){const e={};return this.forEach(t=>{e[t.name]={time:t.time||0,count:t.count||0,average:t.getAverageTime()||0,hz:t.getHz()||0}}),e}_initializeStats(e=[]){e.forEach(t=>this._getOrCreate(t))}_getOrCreate(e){const{name:t,type:n}=e;let s=this.stats[t];return s||(e instanceof bc?s=e:s=new bc(t,n),this.stats[t]=s),s}}let vp="";const vc={};function wp(i){for(const e in vc)if(i.startsWith(e)){const t=vc[e];i=i.replace(e,t)}return!i.startsWith("http://")&&!i.startsWith("https://")&&(i=`${vp}${i}`),i}function Cf(i){return i&&typeof i=="object"&&i.isBuffer}function Jo(i){if(Cf(i))return i;if(i instanceof ArrayBuffer)return i;if(Pf(i))return eo(i);if(ArrayBuffer.isView(i)){const e=i.buffer;return i.byteOffset===0&&i.byteLength===i.buffer.byteLength?e:e.slice(i.byteOffset,i.byteOffset+i.byteLength)}if(typeof i=="string"){const e=i;return new TextEncoder().encode(e).buffer}if(i&&typeof i=="object"&&i._toArrayBuffer)return i._toArrayBuffer();throw new Error("toArrayBuffer")}function Af(i){if(i instanceof ArrayBuffer)return i;if(Pf(i))return eo(i);const{buffer:e,byteOffset:t,byteLength:n}=i;return e instanceof ArrayBuffer&&t===0&&n===e.byteLength?e:eo(e,t,n)}function eo(i,e=0,t=i.byteLength-e){const n=new Uint8Array(i,e,t),s=new Uint8Array(n.length);return s.set(n),s.buffer}function xp(i){return ArrayBuffer.isView(i)?i:new Uint8Array(i)}function Mf(i){const e=i?i.lastIndexOf("/"):-1;return e>=0?i.substr(e+1):i}function If(i){const e=i?i.lastIndexOf("/"):-1;return e>=0?i.substr(0,e):""}class Pp extends Error{constructor(e,t){super(e),this.reason=t.reason,this.url=t.url,this.response=t.response}reason;url;response}const Ep=/^data:([-\w.]+\/[-\w.+]+)(;|,)/,Sp=/^([-\w.]+\/[-\w.+]+)/;function wc(i,e){return i.toLowerCase()===e.toLowerCase()}function Tp(i){const e=Sp.exec(i);return e?e[1]:i}function xc(i){const e=Ep.exec(i);return e?e[1]:""}const Rf=/\?.*/;function Lp(i){const e=i.match(Rf);return e&&e[0]}function ys(i){return i.replace(Rf,"")}function Cp(i){if(i.length<50)return i;const e=i.slice(i.length-15);return`${i.substr(0,32)}...${e}`}function bs(i){return wt(i)?i.url:xt(i)?("name"in i?i.name:"")||"":typeof i=="string"?i:""}function vs(i){if(wt(i)){const e=i.headers.get("content-type")||"",t=ys(i.url);return Tp(e)||xc(t)}return xt(i)?i.type||"":typeof i=="string"?xc(i):""}function Ap(i){return wt(i)?i.headers["content-length"]||-1:xt(i)?i.size:typeof i=="string"?i.length:i instanceof ArrayBuffer||ArrayBuffer.isView(i)?i.byteLength:-1}async function Of(i){if(wt(i))return i;const e={},t=Ap(i);t>=0&&(e["content-length"]=String(t));const n=bs(i),s=vs(i);s&&(e["content-type"]=s);const r=await Rp(i);r&&(e["x-first-bytes"]=r),typeof i=="string"&&(i=new TextEncoder().encode(i));const o=new Response(i,{headers:e});return Object.defineProperty(o,"url",{value:n}),o}async function Mp(i){if(!i.ok)throw await Ip(i)}async function Ip(i){const e=Cp(i.url);let t=`Failed to fetch resource (${i.status}) ${i.statusText}: ${e}`;t=t.length>100?`${t.slice(0,100)}...`:t;const n={reason:i.statusText,url:i.url,response:i};try{const s=i.headers.get("Content-Type");n.reason=!i.bodyUsed&&s?.includes("application/json")?await i.json():await i.text()}catch{}return new Pp(t,n)}async function Rp(i){if(typeof i=="string")return`data:,${i.slice(0,5)}`;if(i instanceof Blob){const t=i.slice(0,5);return await new Promise(n=>{const s=new FileReader;s.onload=r=>n(r?.target?.result),s.readAsDataURL(t)})}if(i instanceof ArrayBuffer){const t=i.slice(0,5);return`data:base64,${Op(t)}`}return null}function Op(i){let e="";const t=new Uint8Array(i);for(let n=0;n<t.byteLength;n++)e+=String.fromCharCode(t[n]);return btoa(e)}function Bp(i){return!kp(i)&&!Dp(i)}function kp(i){return i.startsWith("http:")||i.startsWith("https:")}function Dp(i){return i.startsWith("data:")}async function Pc(i,e){if(typeof i=="string"){const t=wp(i);return Bp(t)&&globalThis.loaders?.fetchNode?globalThis.loaders?.fetchNode(t,e):await fetch(t,e)}return await Of(i)}const an=new Wi({id:"loaders.gl"});class Fp{log(){return()=>{}}info(){return()=>{}}warn(){return()=>{}}error(){return()=>{}}}class zp{console;constructor(){this.console=console}log(...e){return this.console.log.bind(this.console,...e)}info(...e){return this.console.info.bind(this.console,...e)}warn(...e){return this.console.warn.bind(this.console,...e)}error(...e){return this.console.error.bind(this.console,...e)}}const to={core:{baseUrl:void 0,fetch:null,mimeType:void 0,fallbackMimeType:void 0,ignoreRegisteredLoaders:void 0,nothrow:!1,log:new zp,useLocalLibraries:!1,CDN:"https://unpkg.com/@loaders.gl",worker:!0,maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:Zo,_nodeWorkers:!1,_workerType:"",limit:0,_limitMB:0,batchSize:"auto",batchDebounceMs:0,metadata:!1,transforms:[]}},Np={baseUri:"core.baseUrl",fetch:"core.fetch",mimeType:"core.mimeType",fallbackMimeType:"core.fallbackMimeType",ignoreRegisteredLoaders:"core.ignoreRegisteredLoaders",nothrow:"core.nothrow",log:"core.log",useLocalLibraries:"core.useLocalLibraries",CDN:"core.CDN",worker:"core.worker",maxConcurrency:"core.maxConcurrency",maxMobileConcurrency:"core.maxMobileConcurrency",reuseWorkers:"core.reuseWorkers",_nodeWorkers:"core.nodeWorkers",_workerType:"core._workerType",_worker:"core._workerType",limit:"core.limit",_limitMB:"core._limitMB",batchSize:"core.batchSize",batchDebounceMs:"core.batchDebounceMs",metadata:"core.metadata",transforms:"core.transforms",throws:"nothrow",dataType:"(no longer used)",uri:"core.baseUrl",method:"core.fetch.method",headers:"core.fetch.headers",body:"core.fetch.body",mode:"core.fetch.mode",credentials:"core.fetch.credentials",cache:"core.fetch.cache",redirect:"core.fetch.redirect",referrer:"core.fetch.referrer",referrerPolicy:"core.fetch.referrerPolicy",integrity:"core.fetch.integrity",keepalive:"core.fetch.keepalive",signal:"core.fetch.signal"},ea=["baseUrl","fetch","mimeType","fallbackMimeType","ignoreRegisteredLoaders","nothrow","log","useLocalLibraries","CDN","worker","maxConcurrency","maxMobileConcurrency","reuseWorkers","_nodeWorkers","_workerType","limit","_limitMB","batchSize","batchDebounceMs","metadata","transforms"];function Bf(){globalThis.loaders=globalThis.loaders||{};const{loaders:i}=globalThis;return i._state||(i._state={}),i._state}function kf(){const i=Bf();return i.globalOptions=i.globalOptions||{...to,core:{...to.core}},pt(i.globalOptions)}function $p(i,e,t,n){return t=t||[],t=Array.isArray(t)?t:[t],Up(i,t),pt(Vp(e,i,n))}function pt(i){const e=Wp(i);Df(e);for(const t of ea)e.core&&e.core[t]!==void 0&&delete e[t];return e.core&&e.core._workerType!==void 0&&delete e._worker,e}function Up(i,e){Ec(i,null,to,Np,e);for(const t of e){const n=i&&i[t.id]||{},s=t.options&&t.options[t.id]||{},r=t.deprecatedOptions&&t.deprecatedOptions[t.id]||{};Ec(n,t.id,s,r,e)}}function Ec(i,e,t,n,s){const r=e||"Top level",o=e?`${e}.`:"";for(const a in i){const c=!e&&vt(i[a]),l=a==="baseUri"&&!e,u=a==="workerUrl"&&e;if(!(a in t)&&!l&&!u){if(a in n)an.level>0&&an.warn(`${r} loader option '${o}${a}' no longer supported, use '${n[a]}'`)();else if(!c&&an.level>0){const f=Gp(a,s);an.warn(`${r} loader option '${o}${a}' not recognized. ${f}`)()}}}}function Gp(i,e){const t=i.toLowerCase();let n="";for(const s of e)for(const r in s.options){if(i===r)return`Did you mean '${s.id}.${r}'?`;const o=r.toLowerCase();(t.startsWith(o)||o.startsWith(t))&&(n=n||`Did you mean '${s.id}.${r}'?`)}return n}function Vp(i,e,t){const n=i.options||{},s={...n};n.core&&(s.core={...n.core}),Df(s),s.core?.log===null&&(s.core={...s.core,log:new Fp}),Sc(s,pt(kf()));const r=pt(e);return Sc(s,r),jp(s,t),Hp(s),s}function Sc(i,e){for(const t in e)if(t in e){const n=e[t];gc(n)&&gc(i[t])?i[t]={...i[t],...e[t]}:i[t]=e[t]}}function jp(i,e){if(!e)return;i.core?.baseUrl!==void 0||(i.core||={},i.core.baseUrl=If(ys(e)))}function Wp(i){const e={...i};return i.core&&(e.core={...i.core}),e}function Df(i){i.baseUri!==void 0&&(i.core||={},i.core.baseUrl===void 0&&(i.core.baseUrl=i.baseUri));for(const t of ea)if(i[t]!==void 0){const s=i.core=i.core||{};s[t]===void 0&&(s[t]=i[t])}const e=i._worker;e!==void 0&&(i.core||={},i.core._workerType===void 0&&(i.core._workerType=e))}function Hp(i){const e=i.core;if(e)for(const t of ea)e[t]!==void 0&&(i[t]=e[t])}function ta(i){return i?(Array.isArray(i)&&(i=i[0]),Array.isArray(i?.extensions)):!1}function ia(i){$n(i,"null loader"),$n(ta(i),"invalid loader");let e;return Array.isArray(i)&&(e=i[1],i=i[0],i={...i,options:{...i.options,...e}}),(i?.parseTextSync||i?.parseText)&&(i.text=!0),i.text||(i.binary=!0),i}const Ff=()=>{const i=Bf();return i.loaderRegistry=i.loaderRegistry||[],i.loaderRegistry};function Yp(i){const e=Ff();i=Array.isArray(i)?i:[i];for(const t of i){const n=ia(t);e.find(s=>n===s)||e.unshift(n)}}function qp(){return Ff()}const Xp=/\.([^.]+)$/;async function Zp(i,e=[],t,n){if(!zf(i))return null;const s=pt(t||{});if(s.core||={},i instanceof Response&&Tc(i)){const o=await i.clone().text(),a=cn(o,e,{...s,core:{...s.core,nothrow:!0}},n);if(a)return a}let r=cn(i,e,{...s,core:{...s.core,nothrow:!0}},n);if(r)return r;if(xt(i)&&(i=await i.slice(0,10).arrayBuffer(),r=cn(i,e,s,n)),!r&&i instanceof Response&&Tc(i)){const o=await i.clone().text();r=cn(o,e,s,n)}if(!r&&!s.core.nothrow)throw new Error(Nf(i));return r}function Tc(i){const e=vs(i);return!!(e&&(e.startsWith("text/")||e==="application/json"||e.endsWith("+json")))}function cn(i,e=[],t,n){if(!zf(i))return null;const s=pt(t||{});if(s.core||={},e&&!Array.isArray(e))return ia(e);let r=[];e&&(r=r.concat(e)),s.core.ignoreRegisteredLoaders||r.push(...qp()),Qp(r);const o=Kp(i,r,s,n);if(!o&&!s.core.nothrow)throw new Error(Nf(i));return o}function Kp(i,e,t,n){const s=bs(i),r=vs(i),o=ys(s)||n?.url;let a=null,c="";return t?.core?.mimeType&&(a=Xs(e,t?.core?.mimeType),c=`match forced by supplied MIME type ${t?.core?.mimeType}`),a=a||Jp(e,o),c=c||(a?`matched url ${o}`:""),a=a||Xs(e,r),c=c||(a?`matched MIME type ${r}`:""),a=a||tm(e,i),c=c||(a?`matched initial data ${$f(i)}`:""),t?.core?.fallbackMimeType&&(a=a||Xs(e,t?.core?.fallbackMimeType),c=c||(a?`matched fallback MIME type ${r}`:"")),c&&Yg.log(1,`selectLoader selected ${a?.name}: ${c}.`),a}function zf(i){return!(i instanceof Response&&i.status===204)}function Nf(i){const e=bs(i),t=vs(i);let n="No valid loader found (";n+=e?`${Mf(e)}, `:"no url provided, ",n+=`MIME type: ${t?`"${t}"`:"not provided"}, `;const s=i?$f(i):"";return n+=s?` first bytes: "${s}"`:"first bytes: not available",n+=")",n}function Qp(i){for(const e of i)ia(e)}function Jp(i,e){const t=e&&Xp.exec(e),n=t&&t[1];return n?em(i,n):null}function em(i,e){e=e.toLowerCase();for(const t of i)for(const n of t.extensions)if(n.toLowerCase()===e)return t;return null}function Xs(i,e){for(const t of i)if(t.mimeTypes?.some(n=>wc(e,n))||wc(e,`application/x.${t.id}`))return t;return null}function tm(i,e){if(!e)return null;for(const t of i)if(typeof e=="string"){if(im(e,t))return t}else if(ArrayBuffer.isView(e)){if(Lc(e.buffer,e.byteOffset,t))return t}else if(e instanceof ArrayBuffer&&Lc(e,0,t))return t;return null}function im(i,e){return e.testText?e.testText(i):(Array.isArray(e.tests)?e.tests:[e.tests]).some(n=>i.startsWith(n))}function Lc(i,e,t){return(Array.isArray(t.tests)?t.tests:[t.tests]).some(s=>nm(i,e,t,s))}function nm(i,e,t,n){if(Qo(n))return pp(n,i,n.byteLength);switch(typeof n){case"function":return n(Af(i));case"string":const s=io(i,e,n.length);return n===s;default:return!1}}function $f(i,e=5){return typeof i=="string"?i.slice(0,e):ArrayBuffer.isView(i)?io(i.buffer,i.byteOffset,e):i instanceof ArrayBuffer?io(i,0,e):""}function io(i,e,t){if(i.byteLength<e+t)return"";const n=new DataView(i);let s="";for(let r=0;r<t;r++)s+=String.fromCharCode(n.getUint8(e+r));return s}const sm=256*1024;function*rm(i,e){const t=e?.chunkSize||sm;let n=0;const s=new TextEncoder;for(;n<i.length;){const r=Math.min(i.length-n,t),o=i.slice(n,n+r);n+=r,yield Af(s.encode(o))}}const om=256*1024;function*am(i,e={}){const{chunkSize:t=om}=e;let n=0;for(;n<i.byteLength;){const s=Math.min(i.byteLength-n,t),r=new ArrayBuffer(s),o=new Uint8Array(i,n,s);new Uint8Array(r).set(o),n+=s,yield r}}const cm=1024*1024;async function*lm(i,e){const t=e?.chunkSize||cm;let n=0;for(;n<i.size;){const s=n+t,r=await i.slice(n,s).arrayBuffer();n=s,yield r}}function Cc(i,e){return Zo?um(i,e):fm(i)}async function*um(i,e){const t=i.getReader();let n;try{for(;;){const s=n||t.read();e?._streamReadAhead&&(n=t.read());const{done:r,value:o}=await s;if(r)return;yield Jo(o)}}catch{t.releaseLock()}}async function*fm(i,e){for await(const t of i)yield Jo(t)}function dm(i,e){if(typeof i=="string")return rm(i,e);if(i instanceof ArrayBuffer)return am(i,e);if(xt(i))return lm(i,e);if(Ef(i))return Cc(i,e);if(wt(i)){const t=i.body;if(!t)throw new Error("Readable stream not available on Response");return Cc(t,e)}throw new Error("makeIterator")}const Uf="Cannot convert supplied data type";function hm(i,e,t){if(e.text&&typeof i=="string")return i;if(Cf(i)&&(i=i.buffer),Qo(i)){const n=xp(i);return e.text&&!e.binary?new TextDecoder("utf8").decode(n):Jo(n)}throw new Error(Uf)}async function gm(i,e,t){if(typeof i=="string"||Qo(i))return hm(i,e);if(xt(i)&&(i=await Of(i)),wt(i))return await Mp(i),e.binary?await i.arrayBuffer():await i.text();if(Ef(i)&&(i=dm(i,t)),Xg(i)||Zg(i))return yp(i);throw new Error(Uf)}function Gf(i,e){const t=kf(),n=i||t,s=n.fetch??n.core?.fetch;return typeof s=="function"?s:vt(s)?r=>Pc(r,s):e?.fetch?e?.fetch:Pc}function pm(i,e,t){if(t)return t;const n={fetch:Gf(e,i),...i};if(n.url){const s=ys(n.url);n.baseUrl=s,n.queryString=Lp(n.url),n.filename=Mf(s),n.baseUrl=If(s)}return Array.isArray(n.loaders)||(n.loaders=null),n}function mm(i,e){if(i&&!Array.isArray(i))return i;let t;if(i&&(t=Array.isArray(i)?i:[i]),e&&e.loaders){const n=Array.isArray(e.loaders)?e.loaders:[e.loaders];t=t?[...t,...n]:n}return t&&t.length?t:void 0}async function Gn(i,e,t,n){e&&!Array.isArray(e)&&!ta(e)&&(n=void 0,t=e,e=void 0),i=await i,t=t||{};const s=bs(i),o=mm(e,n),a=await Zp(i,o,t);if(!a)return null;const c=$p(t,a,o,s);return n=pm({url:s,_parse:Gn,loaders:o},c,n||null),await _m(a,i,c,n)}async function _m(i,e,t,n){if(fp(i),t=Jg(i.options,t),wt(e)){const{ok:r,redirected:o,status:a,statusText:c,type:l,url:u}=e,f=Object.fromEntries(e.headers.entries());n.response={headers:f,ok:r,redirected:o,status:a,statusText:c,type:l,url:u}}e=await gm(e,i,t);const s=i;if(s.parseTextSync&&typeof e=="string")return s.parseTextSync(e,t,n);if(dp(i,t))return await hp(i,e,t,n,Gn);if(s.parseText&&typeof e=="string")return await s.parseText(e,t,n);if(s.parse)return await s.parse(e,t,n);throw Qe(!s.parseSync),new Error(`${i.id} loader - no parser found and worker is disabled`)}function ym(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function bm(i){return Array.isArray(i)?i.length===0||typeof i[0]=="number":!1}function Vf(i){return ym(i)||bm(i)}async function Vn(i,e,t,n){let s,r;!Array.isArray(e)&&!ta(e)?(s=[],r=e):(s=e,r=t);const o=Gf(r);let a=i;return typeof i=="string"&&(a=await o(i)),xt(i)&&(a=await o(i)),typeof i=="string"&&(pt(r||{}).core?.baseUrl||(r={...r,core:{...r?.core,baseUrl:i}})),Array.isArray(s)?await Gn(a,s,r):await Gn(a,s,r)}const vm="4.5.4",wm=globalThis.loaders?.parseImageNode,no=typeof Image<"u",so=typeof ImageBitmap<"u",xm=!!wm,ro=Zo?!0:xm;function Pm(i){switch(i){case"auto":return so||no||ro;case"imagebitmap":return so;case"image":return no;case"data":return ro;default:throw new Error(`@loaders.gl/images: image ${i} not supported in this environment`)}}function Em(){if(so)return"imagebitmap";if(no)return"image";if(ro)return"data";throw new Error("Install '@loaders.gl/polyfills' to parse images under Node.js")}function Sm(i){const e=Lm(i);if(!e)throw new Error("Not an image");return e}function Tm(i){switch(Sm(i)){case"data":return i;case"image":case"imagebitmap":const e=document.createElement("canvas"),t=e.getContext("2d");if(!t)throw new Error("getImageData");return e.width=i.width,e.height=i.height,t.drawImage(i,0,0),t.getImageData(0,0,i.width,i.height);default:throw new Error("getImageData")}}function Lm(i){return typeof ImageBitmap<"u"&&i instanceof ImageBitmap?"imagebitmap":typeof Image<"u"&&i instanceof Image?"image":i&&typeof i=="object"&&i.data&&i.width&&i.height?"data":null}const Cm=/^data:image\/svg\+xml/,Am=/\.svg((\?|#).*)?$/;function na(i){return i&&(Cm.test(i)||Am.test(i))}function Mm(i,e){if(na(e)){let n=new TextDecoder().decode(i);try{typeof unescape=="function"&&typeof encodeURIComponent=="function"&&(n=unescape(encodeURIComponent(n)))}catch(r){throw new Error(r.message)}return`data:image/svg+xml;base64,${btoa(n)}`}return jf(i,e)}function jf(i,e){if(na(e))throw new Error("SVG cannot be parsed directly to imagebitmap");return new Blob([new Uint8Array(i)])}async function Wf(i,e,t){const n=Mm(i,t),s=self.URL||self.webkitURL,r=typeof n!="string"&&s.createObjectURL(n);try{return await Im(r||n,e)}finally{r&&s.revokeObjectURL(r)}}async function Im(i,e){const t=new Image;return t.src=i,e.image&&e.image.decode&&t.decode?(await t.decode(),t):await new Promise((n,s)=>{try{t.onload=()=>n(t),t.onerror=r=>{const o=r instanceof Error?r.message:"error";s(new Error(o))}}catch(r){s(r)}})}let Ac=!0;async function Rm(i,e,t){let n;na(t)?n=await Wf(i,e,t):n=jf(i,t);const s=e&&e.imagebitmap;return await Om(n,s)}async function Om(i,e=null){if((Bm(e)||!Ac)&&(e=null),e)try{return await createImageBitmap(i,e)}catch(t){console.warn(t),Ac=!1}return await createImageBitmap(i)}function Bm(i){if(!i)return!0;for(const e in i)if(Object.prototype.hasOwnProperty.call(i,e))return!1;return!0}function km(i){return!Nm(i,"ftyp",4)||(i[8]&96)===0?null:Dm(i)}function Dm(i){switch(Fm(i,8,12).replace("\0"," ").trim()){case"avif":case"avis":return{extension:"avif",mimeType:"image/avif"};default:return null}}function Fm(i,e,t){return String.fromCharCode(...i.slice(e,t))}function zm(i){return[...i].map(e=>e.charCodeAt(0))}function Nm(i,e,t=0){const n=zm(e);for(let s=0;s<n.length;++s)if(n[s]!==i[s+t])return!1;return!0}const Ce=!1,bi=!0;function Hf(i){const e=Hi(i);return Um(e)||jm(e)||Gm(e)||Vm(e)||$m(e)}function $m(i){const e=new Uint8Array(i instanceof DataView?i.buffer:i),t=km(e);return t?{mimeType:t.mimeType,width:0,height:0}:null}function Um(i){const e=Hi(i);return e.byteLength>=24&&e.getUint32(0,Ce)===2303741511?{mimeType:"image/png",width:e.getUint32(16,Ce),height:e.getUint32(20,Ce)}:null}function Gm(i){const e=Hi(i);return e.byteLength>=10&&e.getUint32(0,Ce)===1195984440?{mimeType:"image/gif",width:e.getUint16(6,bi),height:e.getUint16(8,bi)}:null}function Vm(i){const e=Hi(i);return e.byteLength>=14&&e.getUint16(0,Ce)===16973&&e.getUint32(2,bi)===e.byteLength?{mimeType:"image/bmp",width:e.getUint32(18,bi),height:e.getUint32(22,bi)}:null}function jm(i){const e=Hi(i);if(!(e.byteLength>=3&&e.getUint16(0,Ce)===65496&&e.getUint8(2)===255))return null;const{tableMarkers:n,sofMarkers:s}=Wm();let r=2;for(;r+9<e.byteLength;){const o=e.getUint16(r,Ce);if(s.has(o))return{mimeType:"image/jpeg",height:e.getUint16(r+5,Ce),width:e.getUint16(r+7,Ce)};if(!n.has(o))return null;r+=2,r+=e.getUint16(r,Ce)}return null}function Wm(){const i=new Set([65499,65476,65484,65501,65534]);for(let t=65504;t<65520;++t)i.add(t);return{tableMarkers:i,sofMarkers:new Set([65472,65473,65474,65475,65477,65478,65479,65481,65482,65483,65485,65486,65487,65502])}}function Hi(i){if(i instanceof DataView)return i;if(ArrayBuffer.isView(i))return new DataView(i.buffer);if(i instanceof ArrayBuffer)return new DataView(i);throw new Error("toDataView")}async function Hm(i,e){const{mimeType:t}=Hf(i)||{},n=globalThis.loaders?.parseImageNode;return $n(n),await n(i,t)}async function Ym(i,e,t){e=e||{};const s=(e.image||{}).type||"auto",{url:r}=t||{},o=qm(s);let a;switch(o){case"imagebitmap":a=await Rm(i,e,r);break;case"image":a=await Wf(i,e,r);break;case"data":a=await Hm(i);break;default:$n(!1)}return s==="data"&&(a=Tm(a)),a}function qm(i){switch(i){case"auto":case"data":return Em();default:return Pm(i),i}}const Xm=["png","jpg","jpeg","gif","webp","bmp","ico","svg","avif"],Zm=["image/png","image/jpeg","image/gif","image/webp","image/avif","image/bmp","image/vnd.microsoft.icon","image/svg+xml"],Km={image:{type:"auto",decode:!0}},Qm={dataType:null,batchType:null,id:"image",module:"images",name:"Images",version:vm,mimeTypes:Zm,extensions:Xm,parse:Ym,tests:[i=>!!Hf(new DataView(i))],options:Km},z=new Wi({id:"deck"});let oo={};function Jm(i){oo=i}function te(i,e,t,n){z.level>0&&oo[i]&&oo[i].call(null,e,t,n)}function e_(i){const e=i[0],t=i[i.length-1];return e==="{"&&t==="}"||e==="["&&t==="]"}const t_={dataType:null,batchType:null,id:"JSON",name:"JSON",module:"",version:"",options:{},extensions:["json","geojson"],mimeTypes:["application/json","application/geo+json"],testText:e_,parseTextSync:JSON.parse};function i_(){const i="9.4.1",e=globalThis.deck&&globalThis.deck.VERSION;if(e&&e!==i)throw new Error(`deck.gl - multiple versions detected: ${e} vs ${i}`);return e||(z.log(1,`deck.gl ${i}`)(),globalThis.deck={...globalThis.deck,VERSION:i,version:i,log:z,_registerLoggers:Jm},Yp([t_,[Qm,{imagebitmap:{premultiplyAlpha:"none"}}]])),i}const n_=i_(),he="(?:var<\\s*(uniform|storage(?:\\s*,\\s*[A-Za-z_][A-Za-z0-9_]*)?)\\s*>|var)\\s+([A-Za-z_][A-Za-z0-9_]*)",ge="\\s*",Oi=[new RegExp(`@binding\\(\\s*(auto|\\d+)\\s*\\)${ge}@group\\(\\s*(\\d+)\\s*\\)${ge}${he}`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)${ge}@binding\\(\\s*(auto|\\d+)\\s*\\)${ge}${he}`,"g")],ao=[new RegExp(`@binding\\(\\s*(auto|\\d+)\\s*\\)${ge}@group\\(\\s*(\\d+)\\s*\\)${ge}${he}`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)${ge}@binding\\(\\s*(auto|\\d+)\\s*\\)${ge}${he}`,"g")],s_=[new RegExp(`@binding\\(\\s*(\\d+)\\s*\\)${ge}@group\\(\\s*(\\d+)\\s*\\)${ge}${he}`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)${ge}@binding\\(\\s*(\\d+)\\s*\\)${ge}${he}`,"g")],r_=[new RegExp(`@binding\\(\\s*(auto)\\s*\\)\\s*@group\\(\\s*(\\d+)\\s*\\)\\s*${he}`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)\\s*@binding\\(\\s*(auto)\\s*\\)\\s*${he}`,"g"),new RegExp(`@binding\\(\\s*(auto)\\s*\\)\\s*@group\\(\\s*(\\d+)\\s*\\)(?:[\\s\\n\\r]*@[A-Za-z_][^\\n\\r]*)*[\\s\\n\\r]*${he}`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)\\s*@binding\\(\\s*(auto)\\s*\\)(?:[\\s\\n\\r]*@[A-Za-z_][^\\n\\r]*)*[\\s\\n\\r]*${he}`,"g")];function ws(i){const e=i.split("");let t=0,n=0,s=!1,r=!1,o=!1;for(;t<i.length;){const a=i[t],c=i[t+1];if(r){o?o=!1:a==="\\"?o=!0:a==='"'&&(r=!1),t++;continue}if(s){a===`
`||a==="\r"?s=!1:e[t]=" ",t++;continue}if(n>0){if(a==="/"&&c==="*"){e[t]=" ",e[t+1]=" ",n++,t+=2;continue}if(a==="*"&&c==="/"){e[t]=" ",e[t+1]=" ",n--,t+=2;continue}a!==`
`&&a!=="\r"&&(e[t]=" "),t++;continue}if(a==='"'){r=!0,t++;continue}if(a==="/"&&c==="/"){e[t]=" ",e[t+1]=" ",s=!0,t+=2;continue}if(a==="/"&&c==="*"){e[t]=" ",e[t+1]=" ",n=1,t+=2;continue}t++}return e.join("")}function ei(i,e){const t=ws(i),n=[];for(const s of e){s.lastIndex=0;let r;for(r=s.exec(t);r;){const o=s===e[0],a=r.index,c=r[0].length;n.push({match:i.slice(a,a+c),index:a,length:c,bindingToken:r[o?1:2],groupToken:r[o?2:1],accessDeclaration:r[3]?.trim(),name:r[4]}),r=s.exec(t)}}return n.sort((s,r)=>s.index-r.index)}function Yf(i,e,t){const n=ei(i,e);if(!n.length)return i;let s="",r=0;for(const o of n)s+=i.slice(r,o.index),s+=t(o),r=o.index+o.length;return s+=i.slice(r),s}function qf(i){return/@binding\(\s*auto\s*\)/.test(ws(i))}function o_(i,e){return ei(i,e===Oi||e===ao?r_:e).find(n=>n.bindingToken==="auto")}function Xf(i,e={}){const t=Zf(i),n=a_(t);if(!n)return null;const s=c_(t,n);if(!s)return null;const r=u_(t,n,s);if(!r)return null;if(e.scanVertexAttributes===!1)return{attributes:[],bindings:r};const o=l_(t,n);if(!o)return null;const a=p_(t,n,s,o,e.vertexEntryPoint);return a?{attributes:a,bindings:r}:null}function Zf(i){const e=ws(i),t=/[A-Za-z_][A-Za-z0-9_]*|(?:0[xX][0-9A-Fa-f]+|\d+)|[@(){}<>\[\]:,;=]/g,n=[];let s=t.exec(e);for(;s;)n.push({value:s[0],index:s.index}),s=t.exec(e);return n}function a_(i){const e=[];let t=0;for(const n of i){if(n.value==="}"&&t===0)return null;e.push(t),n.value==="{"?t++:n.value==="}"&&t--}return t===0?e:null}function c_(i,e){const t=new Map;for(let n=0;n<i.length;n++){if(e[n]!==0||i[n].value!=="alias")continue;const s=i[n+1]?.value;if(!Yi(s)||i[n+2]?.value!=="="||t.has(s))return null;const r=Jf(i,e,n+3,";");if(r<0||r===n+3)return null;t.set(s,jn(i.slice(n+3,r))),n=r}return t}function l_(i,e){const t=new Map;for(let n=0;n<i.length;n++){if(e[n]!==0||i[n].value!=="struct")continue;const s=i[n+1]?.value,r=n+2;if(!Yi(s)||t.has(s)||i[r]?.value!=="{")return null;const o=ra(i,r,"{","}");if(o<0)return null;t.set(s,i.slice(r+1,o)),n=o}return t}function u_(i,e,t){const n=[],s=new Set,r=new Set;for(let o=0;o<i.length;o++){if(e[o]!==0||i[o].value!=="var")continue;const a=ed(i,e,o),c=i.slice(a,o),l=co(c,"group"),u=co(c,"binding");if(l===null||u===null||l===void 0!=(u===void 0))return null;if(l===void 0||u===void 0)continue;let f=o+1,d=[];if(i[f]?.value==="<"){const b=ra(i,f,"<",">");if(b<0)return null;const y=xs(i.slice(f+1,b),",");if(!y)return null;d=y.map(jn),f=b+1}const h=i[f]?.value;if(!Yi(h)||i[f+1]?.value!==":")return null;const g=Jf(i,e,f+2,";");if(g<0||g===f+2)return null;const p=sa(jn(i.slice(f+2,g)),t);if(!p)return null;const m=f_({name:h,group:l,location:u,addressSpace:d,resourceType:p}),_=`${l}:${u}`;if(!m||s.has(_)||r.has(h))return null;n.push(m),s.add(_),r.add(h),o=g}return g_(n),n.sort((o,a)=>o.group-a.group||o.location-a.location||o.name.localeCompare(a.name))}function f_(i){const{name:e,group:t,location:n,addressSpace:s,resourceType:r}=i,o={name:e,group:t,location:n};if(s[0]==="uniform"&&s.length===1)return{...o,type:"uniform"};if(s[0]==="storage"&&s.length<=2){const a=s[1]||"read";return a==="read"?{...o,type:"read-only-storage"}:a==="read_write"?{...o,type:"storage"}:null}return s.length>0?null:r==="sampler"||r==="sampler_comparison"?{...o,type:"sampler",...r==="sampler_comparison"?{samplerType:"comparison"}:{}}:r==="texture_external"?{...o,type:"external-texture"}:d_(o,r)||h_(o,r)}function d_(i,e){const t=/^texture_storage_(1d|2d|2d_array|3d)<([A-Za-z0-9_]+),(read|write|read_write)>$/.exec(e);if(!t)return null;const n={read:"read-only",write:"write-only",read_write:"read-write"}[t[3]];return{...i,type:"storage",format:t[2],access:n,viewDimension:lo(t[1])}}function h_(i,e){const t=/^texture_(multisampled_)?(1d|2d|2d_array|cube|cube_array|3d)<(f32|i32|u32)>$/.exec(e);if(t){if(t[1]&&t[2]!=="2d")return null;const s={f32:"float",i32:"sint",u32:"uint"}[t[3]];return{...i,type:"texture",viewDimension:lo(t[2]),sampleType:s,multisampled:!!t[1]}}const n=/^texture_depth_(multisampled_)?(2d|2d_array|cube|cube_array)$/.exec(e);return!n||n[1]&&n[2]!=="2d"?null:{...i,type:"texture",viewDimension:lo(n[2]),sampleType:"depth",multisampled:!!n[1]}}function g_(i){for(const e of i){if(e.type!=="sampler"||e.samplerType||!e.name.endsWith("Sampler"))continue;const t=e.name.slice(0,-7);i.find(s=>s.type==="texture"&&s.name===t&&s.group===e.group)?.sampleType==="depth"&&(e.samplerType="non-filtering")}}function p_(i,e,t,n,s){const r=m_(i,e);if(!r)return null;const o=r.filter(h=>h.vertex),a=s?o.find(h=>h.name===s):o.length===1?o[0]:void 0;if(!a)return o.length===0&&!s?[]:null;const c=xs(a.parameters,",");if(!c)return null;const l=[],u=new Set,f=new Set,d=new Set;for(const h of c)if(h.length>0&&!Kf({declaration:h,aliases:t,structures:n,attributes:l,attributeLocations:u,attributeNames:f,visitedStructures:d}))return null;return l.sort((h,g)=>h.location-g.location||h.name.localeCompare(g.name))}function m_(i,e){const t=[],n=new Set;for(let s=0;s<i.length;s++){if(e[s]!==0||i[s].value!=="fn")continue;const r=i[s+1]?.value,o=s+2;if(!Yi(r)||n.has(r)||i[o]?.value!=="(")return null;const a=ra(i,o,"(",")");if(a<0)return null;const c=ed(i,e,s);t.push({name:r,vertex:Qf(i.slice(c,s),"vertex"),parameters:i.slice(o+1,a)}),n.add(r),s=a}return t}function Kf(i){const{declaration:e,aliases:t,structures:n,attributes:s,attributeLocations:r,attributeNames:o,visitedStructures:a}=i,c=b_(e,":");if(c<1||c===e.length-1)return!1;const l=v_(e.slice(0,c)),u=co(e.slice(0,c),"location"),f=Qf(e.slice(0,c),"builtin"),d=sa(jn(e.slice(c+1)),t);if(!l||u===null||!d||u!==void 0&&f)return!1;if(u!==void 0){const p=y_(d);return!p||r.has(u)||o.has(l)?!1:(s.push({name:l,location:u,type:p}),r.add(u),o.add(l),!0)}if(f)return!0;const h=n.get(d);if(!h||a.has(d))return!1;const g=xs(h,",");if(!g)return!1;a.add(d);for(const p of g)if(p.length>0&&!Kf({...i,declaration:p}))return!1;return a.delete(d),!0}function sa(i,e,t=new Set){const n=Zf(i);let s="";for(const r of n){const o=e.get(r.value);if(!o){s+=__(r.value);continue}if(t.has(r.value))return null;const a=new Set(t);a.add(r.value);const c=sa(o,e,a);if(!c)return null;s+=c}return s}function __(i){const e=/^(vec[234]|mat[234]x[234])([fiuh])$/.exec(i);if(!e)return i;const t={f:"f32",i:"i32",u:"u32",h:"f16"}[e[2]];return`${e[1]}<${t}>`}function y_(i){return/^(?:i32|u32|f32|f16|vec[234]<(?:i32|u32|f32|f16)>)$/.test(i)?i:null}function co(i,e){let t;for(let n=0;n<i.length;n++)if(!(i[n].value!=="@"||i[n+1]?.value!==e)){if(t!==void 0||i[n+2]?.value!=="("||!/^\d+$/.test(i[n+3]?.value||"")||i[n+4]?.value!==")")return null;t=Number(i[n+3].value)}return t}function Qf(i,e){return i.some((t,n)=>t.value==="@"&&i[n+1]?.value===e)}function lo(i){return i.replace("_","-")}function ra(i,e,t,n){let s=0;for(let r=e;r<i.length;r++)if(i[r].value===t)s++;else if(i[r].value===n&&--s===0)return r;return-1}function xs(i,e){const t=[];let n=0;const s={"(":0,"<":0,"[":0,"{":0},r=Object.keys(s),o={")":"(",">":"<","]":"[","}":"{"};for(let a=0;a<i.length;a++){const c=i[a].value;if(c===e&&r.every(l=>s[l]===0)){t.push(i.slice(n,a)),n=a+1;continue}if(c in s)s[c]++;else if(c in o){const l=o[c];if(s[l]--,s[l]<0)return null}}return r.every(a=>s[a]===0)?(t.push(i.slice(n)),t):null}function b_(i,e){const t=xs(i,e);return t&&t.length===2?t[0].length:-1}function Jf(i,e,t,n){for(let s=t;s<i.length;s++)if(e[s]===0&&i[s].value===n)return s;return-1}function ed(i,e,t){for(let n=t-1;n>=0;n--)if(i[n].value===";"&&e[n]===0||i[n].value==="}"&&e[n]===1)return n+1;return 0}function v_(i){for(let e=i.length-1;e>=0;e--)if(Yi(i[e].value))return i[e].value;return null}function jn(i){return i.map(e=>e.value).join("")}function Yi(i){return!!(i&&/^[A-Za-z_][A-Za-z0-9_]*$/.test(i))}function ti(i,e){if(!i){const t=new Error(e||"shadertools: assertion failed.");throw Error.captureStackTrace?.(t,ti),t}}const Zs={number:{type:"number",validate(i,e){return Number.isFinite(i)&&typeof e=="object"&&(e.max===void 0||i<=e.max)&&(e.min===void 0||i>=e.min)}},array:{type:"array",validate(i,e){return Array.isArray(i)||ArrayBuffer.isView(i)}}};function w_(i){const e={};for(const[t,n]of Object.entries(i))e[t]=x_(n);return e}function x_(i){let e=Mc(i);if(e!=="object")return{value:i,...Zs[e],type:e};if(typeof i=="object")return i?i.type!==void 0?{...i,...Zs[i.type],type:i.type}:i.value===void 0?{type:"object",value:i}:(e=Mc(i.value),{...i,...Zs[e],type:e}):{type:"object",value:null};throw new Error("props")}function Mc(i){return Array.isArray(i)||ArrayBuffer.isView(i)?"array":typeof i}const P_=`#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`,E_=`#ifdef MODULE_MATERIAL
  fragColor = material_filterColor(fragColor);
#endif

#ifdef MODULE_LIGHTING
  fragColor = lighting_filterColor(fragColor);
#endif

#ifdef MODULE_FOG
  fragColor = fog_filterColor(fragColor);
#endif

#ifdef MODULE_PICKING
  fragColor = picking_filterHighlightColor(fragColor);
  fragColor = picking_filterPickingColor(fragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`,S_={vertex:P_,fragment:E_},Ic=/void\s+main\s*\([^)]*\)\s*\{\n?/,Rc=/}\n?[^{}]*$/,Ks=[],An="__LUMA_INJECT_DECLARATIONS__";function T_(i){const e={vertex:{},fragment:{}};for(const t in i){let n=i[t];const s=L_(t);typeof n=="string"&&(n={order:0,injection:n}),e[s][t]=n}return e}function L_(i){const e=i.slice(0,2);switch(e){case"vs":return"vertex";case"fs":return"fragment";default:throw new Error(e)}}function Wn(i,e,t,n=!1,s="glsl",r={}){const o=e==="vertex";for(const a in t){const c=t[a];c.sort((u,f)=>u.order-f.order),Ks.length=c.length;for(let u=0,f=c.length;u<f;++u)Ks[u]=c[u].injection;const l=`${Ks.join(`
`)}
`;switch(a){case"vs:#decl":(s==="wgsl"||o)&&(i=i.replace(An,l));break;case"vs:#main-start":(s==="wgsl"||o)&&(i=s==="wgsl"?ln(i,"vertex",l,"start",r.vertex):i.replace(Ic,u=>u+l));break;case"vs:#main-end":(s==="wgsl"||o)&&(i=s==="wgsl"?ln(i,"vertex",l,"end",r.vertex):i.replace(Rc,u=>l+u));break;case"fs:#decl":(s==="wgsl"||!o)&&(i=i.replace(An,l));break;case"fs:#main-start":(s==="wgsl"||!o)&&(i=s==="wgsl"?ln(i,"fragment",l,"start",r.fragment):i.replace(Ic,u=>u+l));break;case"fs:#main-end":(s==="wgsl"||!o)&&(i=s==="wgsl"?ln(i,"fragment",l,"end",r.fragment):i.replace(Rc,u=>l+u));break;default:i=i.replace(a,u=>u+l)}}return i=i.replace(An,""),n&&(i=i.replace(/\}\s*$/,a=>a+S_[e])),i}function ln(i,e,t,n,s){const r=C_(i,e,s);if(!r)return i;if(n==="start"){const o=r.openBraceIndex+1;return`${i.slice(0,o)}
${t}${i.slice(o)}`}return`${i.slice(0,r.closeBraceIndex)}${t}${i.slice(r.closeBraceIndex)}`}function C_(i,e,t){const n=e==="vertex"?"@vertex":"@fragment",s=i.indexOf(n);if(s<0)return null;const r=t?i.search(new RegExp(`\\bfn\\s+${A_(t)}\\s*\\(`)):i.indexOf("fn",s);if(r<0)return null;const o=i.indexOf("{",r);if(o<0)return null;let a=0;for(let c=o;c<i.length;c++){const l=i[c];if(l==="{")a++;else if(l==="}"&&(a--,a===0))return{openBraceIndex:o,closeBraceIndex:c}}return null}function A_(i){return i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Hn(i){i.map(e=>M_(e))}function M_(i){if(i.instance)return;Hn(i.dependencies||[]);const{propTypes:e={},deprecations:t=[],inject:n={}}=i,s={normalizedInjections:T_(n),parsedDeprecations:I_(t)};e&&(s.propValidators=w_(e)),i.instance=s;let r={};e&&(r=Object.entries(e).reduce((o,[a,c])=>{const l=c?.value;return l&&(o[a]=l),o},{})),i.defaultUniforms={...i.defaultUniforms,...r}}function td(i,e,t){i.deprecations?.forEach(n=>{n.regex?.test(e)&&(n.deprecated?t.deprecated(n.old,n.new)():t.removed(n.old,n.new)())})}function I_(i){return i.forEach(e=>{e.type==="function"?e.regex=new RegExp(`\\b${e.old}\\(`):e.regex=new RegExp(`${e.type} ${e.old};`)}),i}function Yn(i){Hn(i);const e={},t={};id({modules:i,level:0,moduleMap:e,moduleDepth:t});const n=Object.keys(t).sort((s,r)=>t[r]-t[s]).map(s=>e[s]);return Hn(n),n}function id(i){const{modules:e,level:t,moduleMap:n,moduleDepth:s}=i;if(t>=5)throw new Error("Possible loop in shader dependency graph");for(const r of e)n[r.name]=r,(s[r.name]===void 0||s[r.name]<t)&&(s[r.name]=t);for(const r of e)r.dependencies&&id({modules:r.dependencies,level:t+1,moduleMap:n,moduleDepth:s})}const P=new Wi({id:"luma.gl"}),nd={id:null,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1,featureLevel:void 0,optionalFeatures:[],xrCompatible:!1,createCanvasContext:void 0,webgl:{},onError:(i,e)=>{},onResize:(i,e)=>{const[t,n]=i.getDevicePixelSize();P.log(1,`${i} resized => ${t}x${n}px`)()},onPositionChange:(i,e)=>{const[t,n]=i.getPosition();P.log(1,`${i} repositioned => ${t},${n}`)()},onVisibilityChange:i=>P.log(1,`${i} Visibility changed ${i.isVisible}`)(),onDevicePixelRatioChange:(i,e)=>P.log(1,`${i} DPR changed ${e.oldRatio} => ${i.devicePixelRatio}`)(),debug:O_(),debugGPUTime:!1,debugShaders:P.get("debug-shaders")||void 0,debugFramebuffers:!!P.get("debug-framebuffers"),debugFactories:!!P.get("debug-factories"),debugWebGL:!!P.get("debug-webgl"),debugSpectorJS:void 0,debugSpectorJSUrl:void 0,_reuseDevices:!1,_cacheShaders:!0,_destroyShaders:!1,_cachePipelines:!0,_sharePipelines:!0,_destroyPipelines:!1,_initializeFeatures:!0,_disabledFeatures:{"compilation-status-async-webgl":!0},_handle:void 0};function R_(i,e){return i!=null?!!i:e!==void 0?e!=="production":!1}function O_(){return R_(P.get("debug"),B_())}function B_(){const i=globalThis.process;if(i?.env)return i.env.NODE_ENV}const k_="GPU Time and Memory",D_=["Adapter","GPU","GPU Type","GPU Backend","Frame Rate","CPU Time","GPU Time","GPU Memory","Buffer Memory","Texture Memory","External Buffer Memory","External Texture Memory","Swap Chain Texture"],Oc=new WeakMap,Bc=new WeakMap;class F_{stats=new Map;getStats(e){return this.get(e)}get(e){this.stats.has(e)||this.stats.set(e,new _s({id:e}));const t=this.stats.get(e);return e===k_&&z_(t,D_),t}}const sd=new F_;function z_(i,e){const t=i.stats;let n=!1;for(const c of e)t[c]||(i.get(c),n=!0);const s=Object.keys(t).length,r=Oc.get(i);if(!n&&r?.orderedStatNames===e&&r.statCount===s)return;const o={};let a=Bc.get(e);a||(a=new Set(e),Bc.set(e,a));for(const c of e)t[c]&&(o[c]=t[c]);for(const[c,l]of Object.entries(t))a.has(c)||(o[c]=l);for(const c of Object.keys(t))delete t[c];Object.assign(t,o),Oc.set(i,{orderedStatNames:e,statCount:s})}const N_="set luma.log.level=1 (or higher) to trace rendering",kc="No matching device found. Ensure `@luma.gl/webgl` and/or `@luma.gl/webgpu` modules are imported.";class qn{static defaultProps={...nd,type:"best-available",adapters:void 0,waitForPageLoad:!0};stats=sd;log=P;VERSION="9.4.2";spector;preregisteredAdapters=new Map;constructor(){if(globalThis.luma){if(globalThis.luma.VERSION!==this.VERSION)throw P.error(`Found luma.gl ${globalThis.luma.VERSION} while initialzing ${this.VERSION}`)(),P.error("'yarn why @luma.gl/core' can help identify the source of the conflict")(),new Error("luma.gl - multiple versions detected: see console log");P.error("This version of luma.gl has already been initialized")()}P.log(1,`${this.VERSION} - ${N_}`)(),globalThis.luma=this}async createDevice(e={}){const t={...qn.defaultProps,...e},n=this.selectAdapter(t.type,t.adapters);if(!n)throw new Error(kc);return t.waitForPageLoad&&await n.pageLoaded,await n.create(t)}async attachDevice(e,t){const n=this._getTypeFromHandle(e,t.adapters),s=n&&this.selectAdapter(n,t.adapters);if(!s)throw new Error(kc);return await s?.attach?.(e,t)}registerAdapters(e){for(const t of e)this.preregisteredAdapters.set(t.type,t)}getSupportedAdapters(e=[]){const t=this._getAdapterMap(e);return Array.from(t).map(([,n])=>n).filter(n=>n.isSupported?.()).map(n=>n.type)}getBestAvailableAdapterType(e=[]){const t=["webgpu","webgl","null"],n=this._getAdapterMap(e);for(const s of t)if(n.get(s)?.isSupported?.())return s;return null}selectAdapter(e,t=[]){let n=e;e==="best-available"&&(n=this.getBestAvailableAdapterType(t));const s=this._getAdapterMap(t);return n&&s.get(n)||null}enforceWebGL2(e=!0,t=[]){const s=this._getAdapterMap(t).get("webgl");s||P.warn("enforceWebGL2: webgl adapter not found")(),s?.enforceWebGL2?.(e)}setDefaultDeviceProps(e){Object.assign(qn.defaultProps,e)}_getAdapterMap(e=[]){const t=new Map(this.preregisteredAdapters);for(const n of e)t.set(n.type,n);return t}_getTypeFromHandle(e,t=[]){return e instanceof WebGL2RenderingContext?"webgl":typeof GPUDevice<"u"&&e instanceof GPUDevice||e?.queue?"webgpu":e===null?"null":(e instanceof WebGLRenderingContext?P.warn("WebGL1 is not supported",e)():P.warn("Unknown handle type",e)(),null)}}const uo=new qn;class $_{get pageLoaded(){return V_()}}const U_=Jt()&&typeof document<"u",G_=()=>U_&&document.readyState==="complete";let un=null;function V_(){return un||(G_()||typeof window>"u"?un=Promise.resolve():un=new Promise(i=>window.addEventListener("load",()=>i()))),un}const Qs={};function qi(i="id"){Qs[i]=Qs[i]||1;const e=Qs[i]++;return`${i}-${e}`}const j_="cpu-hotspot-profiler",Dc="GPU Resource Counts",Fc="Resource Counts",zc="GPU Time and Memory",W_=["Resources","Buffers","Textures","Samplers","TextureViews","Framebuffers","QuerySets","Shaders","RenderPipelines","ComputePipelines","PipelineLayouts","VertexArrays","RenderPasss","RenderBundleEncoders","RenderBundles","ComputePasss","CommandEncoders","CommandBuffers"],H_=["Resources","Buffers","Textures","Samplers","TextureViews","Framebuffers","QuerySets","Shaders","RenderPipelines","SharedRenderPipelines","ComputePipelines","PipelineLayouts","VertexArrays","RenderPasss","RenderBundleEncoders","RenderBundles","ComputePasss","CommandEncoders","CommandBuffers"],Y_=W_.flatMap(i=>[`${i} Created`,`${i} Active`]),q_=H_.flatMap(i=>[`${i} Created`,`${i} Active`]),Nc=new WeakMap,$c=new WeakMap;let D=class{static defaultProps={id:"undefined",handle:void 0,_isHandleBorrowed:!1,userData:void 0};toString(){return`${this[Symbol.toStringTag]||this.constructor.name}:"${this.id}"`}toJSON(){return this.toString()}id;props;userData={};_device;destroyed=!1;allocatedBytes=0;allocatedBytesName=null;_attachedResources=new Set;get ownsHandle(){return(this.props.handle===void 0||this.props.handle===null)&&!this.isHandleBorrowed}get isHandleBorrowed(){return!!this.props._isHandleBorrowed}constructor(e,t,n){if(!e)throw new Error("no device");this._device=e,this.props=X_(t,n);const s=this.props.id!=="undefined"?this.props.id:qi(this[Symbol.toStringTag]);this.props.id=s,this.id=s,this.userData=this.props.userData||{},this.addStats()}destroy(){this.destroyed||this.destroyResource()}delete(){return this.destroy(),this}getProps(){return this.props}attachResource(e){this._attachedResources.add(e)}detachResource(e){this._attachedResources.delete(e)}destroyAttachedResource(e){this._attachedResources.delete(e)&&e.destroy()}destroyAttachedResources(){for(const e of this._attachedResources)e.destroy();this._attachedResources=new Set}destroyResource(){this.destroyed||(this.destroyAttachedResources(),this.removeStats(),this.destroyed=!0)}removeStats(){const e=pi(this._device),t=e?Ve():0,n=[this._device.statsManager.getStats(Dc),this._device.statsManager.getStats(Fc)],s=Gc(this._device);for(const o of n)Uc(o,s);const r=this.getStatsName();for(const o of n)o.get("Resources Active").decrementCount(),o.get(`${r}s Active`).decrementCount();e&&(e.statsBookkeepingCalls=(e.statsBookkeepingCalls||0)+1,e.statsBookkeepingTimeMs=(e.statsBookkeepingTimeMs||0)+(Ve()-t))}trackAllocatedMemory(e,t=this.getStatsName()){const n=pi(this._device),s=n?Ve():0,r=this._device.statsManager.getStats(zc);this.allocatedBytes>0&&this.allocatedBytesName&&(r.get("GPU Memory").subtractCount(this.allocatedBytes),r.get(`${this.allocatedBytesName} Memory`).subtractCount(this.allocatedBytes)),r.get("GPU Memory").addCount(e),r.get(`${t} Memory`).addCount(e),n&&(n.statsBookkeepingCalls=(n.statsBookkeepingCalls||0)+1,n.statsBookkeepingTimeMs=(n.statsBookkeepingTimeMs||0)+(Ve()-s)),this.allocatedBytes=e,this.allocatedBytesName=t}trackReferencedMemory(e,t=this.getStatsName()){this.trackAllocatedMemory(e,`External ${t}`)}trackDeallocatedMemory(e=this.getStatsName()){if(this.allocatedBytes===0){this.allocatedBytesName=null;return}const t=pi(this._device),n=t?Ve():0,s=this._device.statsManager.getStats(zc);s.get("GPU Memory").subtractCount(this.allocatedBytes),s.get(`${this.allocatedBytesName||e} Memory`).subtractCount(this.allocatedBytes),t&&(t.statsBookkeepingCalls=(t.statsBookkeepingCalls||0)+1,t.statsBookkeepingTimeMs=(t.statsBookkeepingTimeMs||0)+(Ve()-n)),this.allocatedBytes=0,this.allocatedBytesName=null}trackDeallocatedReferencedMemory(e=this.getStatsName()){this.trackDeallocatedMemory(`Referenced ${e}`)}addStats(){const e=this.getStatsName(),t=pi(this._device),n=t?Ve():0,s=[this._device.statsManager.getStats(Dc),this._device.statsManager.getStats(Fc)],r=Gc(this._device);for(const o of s)Uc(o,r);for(const o of s)o.get("Resources Created").incrementCount(),o.get("Resources Active").incrementCount(),o.get(`${e}s Created`).incrementCount(),o.get(`${e}s Active`).incrementCount();t&&(t.statsBookkeepingCalls=(t.statsBookkeepingCalls||0)+1,t.statsBookkeepingTimeMs=(t.statsBookkeepingTimeMs||0)+(Ve()-n)),Z_(this._device,e)}getStatsName(){return K_(this)}};function X_(i,e){const t={...e};for(const n in i)i[n]!==void 0&&(t[n]=i[n]);return t}function Uc(i,e){const t=i.stats;let n=!1;for(const c of e)t[c]||(i.get(c),n=!0);const s=Object.keys(t).length,r=Nc.get(i);if(!n&&r?.orderedStatNames===e&&r.statCount===s)return;const o={};let a=$c.get(e);a||(a=new Set(e),$c.set(e,a));for(const c of e)t[c]&&(o[c]=t[c]);for(const[c,l]of Object.entries(t))a.has(c)||(o[c]=l);for(const c of Object.keys(t))delete t[c];Object.assign(t,o),Nc.set(i,{orderedStatNames:e,statCount:s})}function Gc(i){return i.type==="webgl"?q_:Y_}function pi(i){const e=i.userData[j_];return e?.enabled?e:null}function Ve(){return globalThis.performance?.now?.()??Date.now()}function Z_(i,e){const t=pi(i);if(!(!t||!t.activeDefaultFramebufferAcquireDepth))switch(t.transientCanvasResourceCreates=(t.transientCanvasResourceCreates||0)+1,e){case"Texture":t.transientCanvasTextureCreates=(t.transientCanvasTextureCreates||0)+1;break;case"TextureView":t.transientCanvasTextureViewCreates=(t.transientCanvasTextureViewCreates||0)+1;break;case"Sampler":t.transientCanvasSamplerCreates=(t.transientCanvasSamplerCreates||0)+1;break;case"Framebuffer":t.transientCanvasFramebufferCreates=(t.transientCanvasFramebufferCreates||0)+1;break}}function K_(i){let e=Object.getPrototypeOf(i);for(;e;){const t=Object.getPrototypeOf(e);if(!t||t===D.prototype)return Q_(e)||i[Symbol.toStringTag]||i.constructor.name;e=t}return i[Symbol.toStringTag]||i.constructor.name}function Q_(i){const e=Object.getOwnPropertyDescriptor(i,Symbol.toStringTag);return typeof e?.get=="function"?e.get.call(i):typeof e?.value=="string"?e.value:null}class O extends D{static INDEX=16;static VERTEX=32;static UNIFORM=64;static STORAGE=128;static INDIRECT=256;static QUERY_RESOLVE=512;static MAP_READ=1;static MAP_WRITE=2;static COPY_SRC=4;static COPY_DST=8;get[Symbol.toStringTag](){return"Buffer"}usage;indexType;updateTimestamp;constructor(e,t){const n={...t};(t.usage||0)&O.INDEX&&!t.indexType&&(t.data instanceof Uint32Array?n.indexType="uint32":t.data instanceof Uint16Array?n.indexType="uint16":t.data instanceof Uint8Array&&(n.indexType="uint8")),delete n.data,super(e,n,O.defaultProps),this.usage=n.usage||0,this.indexType=n.indexType,this.updateTimestamp=e.incrementTimestamp()}clone(e){return this.device.createBuffer({...this.props,...e})}static DEBUG_DATA_MAX_LENGTH=32;debugData=new ArrayBuffer(0);_setDebugData(e,t,n){if(!this.device.props.debug)return;let s=null,r;ArrayBuffer.isView(e)?(s=e,r=e.buffer):r=e;const o=Math.min(e?e.byteLength:n,O.DEBUG_DATA_MAX_LENGTH);if(r===null)this.debugData=new ArrayBuffer(o);else{const a=Math.min(s?.byteOffset||0,r.byteLength),c=Math.max(0,r.byteLength-a),l=Math.min(o,c);this.debugData=new Uint8Array(r,a,l).slice().buffer}}static defaultProps={...D.defaultProps,handle:void 0,usage:0,byteLength:0,byteOffset:0,data:null,indexType:"uint16",onMapped:void 0}}const fo=globalThis.Float16Array;function J_(){return fo??Uint16Array}function ey(i){return!!(fo&&i===fo)}function ty(i){const e=i.includes("norm"),t=!e&&!i.startsWith("float"),n=i.startsWith("s"),s=aa[i],[r,o,a]=s||["uint8 ","i32",1];return{signedType:r,primitiveType:o,byteLength:a,normalized:e,integer:t,signed:n}}function iy(i){const e=i;switch(e){case"uint8":return"unorm8";case"sint8":return"snorm8";case"uint16":return"unorm16";case"sint16":return"snorm16";default:return e}}function Ae(i,e){switch(e){case 1:return i;case 2:return i+i%2;default:return i+(4-i%4)%4}}function rd(i){const e=ArrayBuffer.isView(i)?i.constructor:i;if(ey(e))return"float16";if(e===Uint8ClampedArray)return"uint8";const t=Object.values(aa).find(n=>e===n[4]);if(!t)throw new Error(e.name);return t[0]}function ny(i){return rd(i)}function vi(i){if(i==="float16")return J_();const e=aa[i];if(!e)throw new Error(i);const[,,,,t]=e;return t}function oa(i){return vi(i)}const aa={uint8:["uint8","u32",1,!1,Uint8Array],sint8:["sint8","i32",1,!1,Int8Array],unorm8:["uint8","f32",1,!0,Uint8Array],snorm8:["sint8","f32",1,!0,Int8Array],uint16:["uint16","u32",2,!1,Uint16Array],sint16:["sint16","i32",2,!1,Int16Array],unorm16:["uint16","u32",2,!0,Uint16Array],snorm16:["sint16","i32",2,!0,Int16Array],float16:["float16","f16",2,!1,Uint16Array],float32:["float32","f32",4,!1,Float32Array],uint32:["uint32","u32",4,!1,Uint32Array],sint32:["sint32","i32",4,!1,Int32Array]};class sy{getDataTypeInfo(e){return ty(e)}getNormalizedDataType(e){return iy(e)}alignTo(e,t){return Ae(e,t)}getDataType(e){return ny(e)}getTypedArrayConstructor(e){return oa(e)}}const Be=new sy;class ry{getVertexFormatInfo(e){if(e==="unorm10-10-10-2")return{type:"unorm8",components:4,byteLength:4,integer:!1,signed:!1,normalized:!0};let t=e==="unorm8x4-bgra"?"unorm8x4":e,n;t.endsWith("-webgl")&&(t=t.slice(0,-6),n=!0);const s=t.split("x");if(s.length>2)throw new Error(`Unsupported vertex format: ${e}`);const[r,o]=s,a=r,c=ay(e,o),l=oy(e,a);let u;try{u=n?cy(e,a,c):this.makeVertexFormat(l.signedType,c,l.normalized)}catch{throw new Error(`Unsupported vertex format: ${e}`)}if(u!==(n?e:t))throw new Error(`Unsupported vertex format: ${e}`);const f={type:a,components:c,byteLength:l.byteLength*c,integer:l.integer,signed:l.signed,normalized:l.normalized};return n&&(f.webglOnly=!0),f}makeVertexFormat(e,t,n){const s=n?Be.getNormalizedDataType(e):e;switch(s){case"unorm8":return t===1?"unorm8":t===3?"unorm8x3-webgl":`${s}x${t}`;case"snorm8":return t===1?"snorm8":t===3?"snorm8x3-webgl":`${s}x${t}`;case"uint8":case"sint8":if(t===3)throw new Error(`size: ${t}`);return t===1?s:`${s}x${t}`;case"uint16":return t===1?"uint16":t===3?"uint16x3-webgl":`${s}x${t}`;case"sint16":return t===1?"sint16":t===3?"sint16x3-webgl":`${s}x${t}`;case"unorm16":return t===1?"unorm16":t===3?"unorm16x3-webgl":`${s}x${t}`;case"snorm16":return t===1?"snorm16":t===3?"snorm16x3-webgl":`${s}x${t}`;case"float16":if(t===3)throw new Error(`size: ${t}`);return t===1?s:`${s}x${t}`;default:return t===1?s:`${s}x${t}`}}getVertexFormatFromAttribute(e,t,n){if(!t||t>4)throw new Error(`size ${t}`);const s=t,r=Be.getDataType(e);return this.makeVertexFormat(r,s,n)}getCompatibleVertexFormat(e){let t;switch(e.primitiveType){case"f32":t="float32";break;case"i32":t="sint32";break;case"u32":t="uint32";break;case"f16":return e.components<=2?"float16x2":"float16x4"}return e.components===1?t:`${t}x${e.components}`}}const ie=new ry;function oy(i,e){try{return Be.getDataTypeInfo(e)}catch{throw new Error(`Unsupported vertex format: ${i}`)}}function ay(i,e){if(!e)return 1;const t=Number(e);if(t===2||t===3||t===4)return t;throw new Error(`Unsupported vertex format: ${i}`)}function cy(i,e,t){if(t!==3)throw new Error(`Unsupported vertex format: ${i}`);switch(e){case"uint8":case"sint8":case"unorm8":case"snorm8":case"uint16":case"sint16":case"unorm16":case"snorm16":return`${e}x3-webgl`;default:throw new Error(`Unsupported vertex format: ${i}`)}}const ee="texture-compression-bc",G="texture-compression-astc",xe="texture-compression-etc2",ly="texture-compression-etc1-webgl",fn="texture-compression-pvrtc-webgl",Js="texture-compression-atc-webgl",dn="float32-renderable-webgl",er="float16-renderable-webgl",uy="rgb9e5ufloat-renderable-webgl",tr="snorm8-renderable-webgl",je="norm16-webgl",ir="norm16-renderable-webgl",nr="snorm16-renderable-webgl",hn="float32-filterable",Vc="float16-filterable-webgl",Xi=1,Zi=2,ca=4,la=8,ii=16,Ps=5,od=10,Z=Xi|Zi,gn=Xi|ca,$e=Xi|Zi|ca|la,Pe=Xi|Zi|ii,fy=Xi|ca|ii,ho=$e|ii,jc=(Zi|la|ii)<<Ps,dy=(Zi|la)<<Ps,ne=ii<<Ps,At=ho<<Ps,hy=$e<<od,sr=ii<<od;function ua(i){const e=ad[i];if(!e)throw new Error(`Unsupported texture format ${i}`);return e}function gy(){return ad}const py={r8unorm:{webgpu:$e|ne},rg8unorm:{webgpu:$e|ne},"rgb8unorm-webgl":{},rgba8unorm:{webgpu:ho},"rgba8unorm-srgb":{webgpu:$e},r8snorm:{render:tr,webgpu:gn|jc},rg8snorm:{render:tr,webgpu:gn|jc},"rgb8snorm-webgl":{},rgba8snorm:{render:tr,webgpu:fy|dy},r8uint:{webgpu:Z|ne},rg8uint:{webgpu:Z|ne},rgba8uint:{webgpu:Pe},r8sint:{webgpu:Z|ne},rg8sint:{webgpu:Z|ne},rgba8sint:{webgpu:Pe},bgra8unorm:{webgpu:$e},"bgra8unorm-srgb":{webgpu:hy},r16unorm:{f:je,render:ir,webgpu:At},rg16unorm:{f:je,render:ir,webgpu:At},"rgb16unorm-webgl":{f:je,render:!1},rgba16unorm:{f:je,render:ir,webgpu:At},r16snorm:{f:je,render:nr,webgpu:At},rg16snorm:{f:je,render:nr,webgpu:At},"rgb16snorm-webgl":{f:je,render:!1},rgba16snorm:{f:je,render:nr,webgpu:At},r16uint:{webgpu:Z|ne},rg16uint:{webgpu:Z|ne},rgba16uint:{webgpu:Pe},r16sint:{webgpu:Z|ne},rg16sint:{webgpu:Z|ne},rgba16sint:{webgpu:Pe},r16float:{render:er,filter:"float16-filterable-webgl",webgpu:$e|ne},rg16float:{render:er,filter:Vc,webgpu:$e|ne},rgba16float:{render:er,filter:Vc,webgpu:ho},r32uint:{webgpu:Pe},rg32uint:{webgpu:Z|sr},rgba32uint:{webgpu:Pe},r32sint:{webgpu:Pe},rg32sint:{webgpu:Z|sr},rgba32sint:{webgpu:Pe},r32float:{render:dn,filter:hn,webgpu:Pe},rg32float:{render:!1,filter:hn,webgpu:Z|sr},"rgb32float-webgl":{render:dn,filter:hn},rgba32float:{render:dn,filter:hn,webgpu:Pe},"rgba4unorm-webgl":{channels:"rgba",bitsPerChannel:[4,4,4,4],packed:!0},"rgb565unorm-webgl":{channels:"rgb",bitsPerChannel:[5,6,5,0],packed:!0},"rgb5a1unorm-webgl":{channels:"rgba",bitsPerChannel:[5,5,5,1],packed:!0},rgb9e5ufloat:{channels:"rgb",packed:!0,render:uy,webgpu:gn},rg11b10ufloat:{channels:"rgb",bitsPerChannel:[11,11,10,0],packed:!0,p:1,render:dn,webgpu:gn|ne},rgb10a2unorm:{channels:"rgba",bitsPerChannel:[10,10,10,2],packed:!0,p:1,webgpu:$e|ne},rgb10a2uint:{channels:"rgba",bitsPerChannel:[10,10,10,2],packed:!0,p:1,webgpu:Z|ne},stencil8:{attachment:"stencil",bitsPerChannel:[8,0,0,0],dataType:"uint8",webgpu:Z},depth16unorm:{attachment:"depth",bitsPerChannel:[16,0,0,0],dataType:"uint16",webgpu:Z},depth24plus:{attachment:"depth",bitsPerChannel:[24,0,0,0],dataType:"uint32",webgpu:Z},depth32float:{attachment:"depth",bitsPerChannel:[32,0,0,0],dataType:"float32",webgpu:Z},"depth24plus-stencil8":{attachment:"depth-stencil",bitsPerChannel:[24,8,0,0],packed:!0,webgpu:Z},"depth32float-stencil8":{attachment:"depth-stencil",bitsPerChannel:[32,8,0,0],packed:!0,f:"depth32float-stencil8",webgpu:Z}},my={"bc1-rgb-unorm-webgl":{f:ee},"bc1-rgb-unorm-srgb-webgl":{f:ee},"bc1-rgba-unorm":{f:ee},"bc1-rgba-unorm-srgb":{f:ee},"bc2-rgba-unorm":{f:ee},"bc2-rgba-unorm-srgb":{f:ee},"bc3-rgba-unorm":{f:ee},"bc3-rgba-unorm-srgb":{f:ee},"bc4-r-unorm":{f:ee},"bc4-r-snorm":{f:ee},"bc5-rg-unorm":{f:ee},"bc5-rg-snorm":{f:ee},"bc6h-rgb-ufloat":{f:ee},"bc6h-rgb-float":{f:ee},"bc7-rgba-unorm":{f:ee},"bc7-rgba-unorm-srgb":{f:ee},"etc2-rgb8unorm":{f:xe},"etc2-rgb8unorm-srgb":{f:xe},"etc2-rgb8a1unorm":{f:xe},"etc2-rgb8a1unorm-srgb":{f:xe},"etc2-rgba8unorm":{f:xe},"etc2-rgba8unorm-srgb":{f:xe},"eac-r11unorm":{f:xe},"eac-r11snorm":{f:xe},"eac-rg11unorm":{f:xe},"eac-rg11snorm":{f:xe},"astc-4x4-unorm":{f:G},"astc-4x4-unorm-srgb":{f:G},"astc-5x4-unorm":{f:G},"astc-5x4-unorm-srgb":{f:G},"astc-5x5-unorm":{f:G},"astc-5x5-unorm-srgb":{f:G},"astc-6x5-unorm":{f:G},"astc-6x5-unorm-srgb":{f:G},"astc-6x6-unorm":{f:G},"astc-6x6-unorm-srgb":{f:G},"astc-8x5-unorm":{f:G},"astc-8x5-unorm-srgb":{f:G},"astc-8x6-unorm":{f:G},"astc-8x6-unorm-srgb":{f:G},"astc-8x8-unorm":{f:G},"astc-8x8-unorm-srgb":{f:G},"astc-10x5-unorm":{f:G},"astc-10x5-unorm-srgb":{f:G},"astc-10x6-unorm":{f:G},"astc-10x6-unorm-srgb":{f:G},"astc-10x8-unorm":{f:G},"astc-10x8-unorm-srgb":{f:G},"astc-10x10-unorm":{f:G},"astc-10x10-unorm-srgb":{f:G},"astc-12x10-unorm":{f:G},"astc-12x10-unorm-srgb":{f:G},"astc-12x12-unorm":{f:G},"astc-12x12-unorm-srgb":{f:G},"pvrtc-rgb4unorm-webgl":{f:fn},"pvrtc-rgba4unorm-webgl":{f:fn},"pvrtc-rgb2unorm-webgl":{f:fn},"pvrtc-rgba2unorm-webgl":{f:fn},"etc1-rbg-unorm-webgl":{f:ly},"atc-rgb-unorm-webgl":{f:Js},"atc-rgba-unorm-webgl":{f:Js},"atc-rgbai-unorm-webgl":{f:Js}},ad={...py,...my},_y=/^(r|rg|rgb|rgba|bgra)([0-9]*)([a-z]*)(-srgb)?(-webgl)?$/,yy=["rgb","rgba","bgra"],by=["depth","stencil"],vy=5,wy=["bc1","bc2","bc3","bc4","bc5","bc6","bc7","etc1","etc2","eac","atc","astc","pvrtc"];class xy{isColor(e){return yy.some(t=>e.startsWith(t))}isDepthStencil(e){return by.some(t=>e.startsWith(t))}isCompressed(e){return wy.some(t=>e.startsWith(t))}getInfo(e){return cd(e)}getCapabilities(e){return Ey(e)}getWebGPUCapabilities(e){const t=ua(e);return t.webgpu!==void 0?t.webgpu:this.isCompressed(e)&&!e.endsWith("-webgl")?vy:0}computeMemoryLayout(e){return Py(e)}}const _e=new xy;function Py({format:i,width:e,height:t,depth:n,byteAlignment:s}){const r=_e.getInfo(i),{bytesPerPixel:o,bytesPerBlock:a=o,blockWidth:c=1,blockHeight:l=1,compressed:u=!1}=r,f=u?Math.ceil(e/c):e,d=u?Math.ceil(t/l):t,h=f*a,g=Math.ceil(h/s)*s,p=d,m=g*p*n;return{bytesPerPixel:o,bytesPerRow:g,rowsPerImage:p,depthOrArrayLayers:n,bytesPerImage:g*p,byteLength:m}}function Ey(i){const e=ua(i),t={format:i,create:e.f??!0,render:e.render??!0,filter:e.filter??!0,blend:e.blend??!0,store:e.store??!0},n=cd(i),s=i.startsWith("depth")||i.startsWith("stencil"),r=n?.signed,o=n?.integer,a=n?.webgl,c=!!n?.compressed;return t.render&&=!s&&!c,t.filter&&=!s&&!r&&!o&&!a,t}function cd(i){let e=Sy(i);if(_e.isCompressed(i)){e.channels="rgb",e.components=3,e.bytesPerPixel=1,e.srgb=!1,e.compressed=!0,e.bytesPerBlock=Ly(i);const n=Ty(i);n&&(e.blockWidth=n.blockWidth,e.blockHeight=n.blockHeight)}const t=e.packed?null:_y.exec(i);if(t){const[,n,s,r,o,a]=t,c=`${r}${s}`,l=Be.getDataTypeInfo(c),u=l.byteLength*8,f=n?.length??1,d=[u,f>=2?u:0,f>=3?u:0,f>=4?u:0];e={format:i,attachment:e.attachment,dataType:l.signedType,components:f,channels:n,integer:l.integer,signed:l.signed,normalized:l.normalized,bitsPerChannel:d,bytesPerPixel:l.byteLength*f,packed:e.packed,srgb:e.srgb},a==="-webgl"&&(e.webgl=!0),o==="-srgb"&&(e.srgb=!0)}return i.endsWith("-webgl")&&(e.webgl=!0),i.endsWith("-srgb")&&(e.srgb=!0),e}function Sy(i){const e={...ua(i)},t=e.bytesPerPixel||1,n=e.bitsPerChannel||[8,8,8,8];return delete e.bitsPerChannel,delete e.bytesPerPixel,delete e.f,delete e.render,delete e.filter,delete e.blend,delete e.store,delete e.webgpu,{...e,format:i,attachment:e.attachment||"color",channels:e.channels||"r",components:e.components||e.channels?.length||1,bytesPerPixel:t,bitsPerChannel:n,dataType:e.dataType||"uint8",srgb:e.srgb??!1,packed:e.packed??!1,webgl:e.webgl??!1,integer:e.integer??!1,signed:e.signed??!1,normalized:e.normalized??!1,compressed:e.compressed??!1}}function Ty(i){const t=/.*-(\d+)x(\d+)-.*/.exec(i);if(t){const[,n,s]=t;return{blockWidth:Number(n),blockHeight:Number(s)}}return i.startsWith("bc")||i.startsWith("etc1")||i.startsWith("etc2")||i.startsWith("eac")||i.startsWith("atc")?{blockWidth:4,blockHeight:4}:i.startsWith("pvrtc-rgb4")||i.startsWith("pvrtc-rgba4")?{blockWidth:4,blockHeight:4}:i.startsWith("pvrtc-rgb2")||i.startsWith("pvrtc-rgba2")?{blockWidth:8,blockHeight:4}:null}function Ly(i){return i.startsWith("bc1")||i.startsWith("bc4")||i.startsWith("etc1")||i.startsWith("etc2-rgb8")||i.startsWith("etc2-rgb8a1")||i.startsWith("eac-r11")||i==="atc-rgb-unorm-webgl"?8:i.startsWith("bc2")||i.startsWith("bc3")||i.startsWith("bc5")||i.startsWith("bc6h")||i.startsWith("bc7")||i.startsWith("etc2-rgba8")||i.startsWith("eac-rg11")||i.startsWith("astc")||i==="atc-rgba-unorm-webgl"||i==="atc-rgbai-unorm-webgl"?16:i.startsWith("pvrtc")?8:16}function Cy(i){return typeof ImageData<"u"&&i instanceof ImageData||typeof ImageBitmap<"u"&&i instanceof ImageBitmap||typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLVideoElement<"u"&&i instanceof HTMLVideoElement||typeof VideoFrame<"u"&&i instanceof VideoFrame||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas}function Ay(i){if(typeof ImageData<"u"&&i instanceof ImageData||typeof ImageBitmap<"u"&&i instanceof ImageBitmap||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas)return{width:i.width,height:i.height};if(typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement)return{width:i.naturalWidth,height:i.naturalHeight};if(typeof HTMLVideoElement<"u"&&i instanceof HTMLVideoElement)return{width:i.videoWidth,height:i.videoHeight};if(typeof VideoFrame<"u"&&i instanceof VideoFrame)return{width:i.displayWidth,height:i.displayHeight};throw new Error("Unknown image type")}class My{}function Iy(i,e){const t=go(i),n=e.map(go).filter(s=>s!==void 0);return[t,...n].filter(s=>s!==void 0)}function go(i){if(i!==void 0){if(i===null||typeof i=="string"||typeof i=="number"||typeof i=="boolean")return i;if(i instanceof Error)return i.message;if(Array.isArray(i))return i.map(go);if(typeof i=="object"){if(Ry(i)){const e=String(i);if(e!=="[object Object]")return e}return Oy(i)?By(i):i.constructor?.name||"Object"}return String(i)}}function Ry(i){return"toString"in i&&typeof i.toString=="function"&&i.toString!==Object.prototype.toString}function Oy(i){return"message"in i&&"type"in i}function By(i){const e=typeof i.type=="string"?i.type:"message",t=typeof i.message=="string"?i.message:"",n=typeof i.lineNum=="number"?i.lineNum:null,s=typeof i.linePos=="number"?i.linePos:null,r=n!==null&&s!==null?` @ ${n}:${s}`:n!==null?` @ ${n}`:"";return`${e}${r}: ${t}`.trim()}class ky{features;disabledFeatures;constructor(e=[],t){this.features=new Set(e),this.disabledFeatures=t||{}}*[Symbol.iterator](){yield*this.features}has(e){return!this.disabledFeatures?.[e]&&this.features.has(e)}}function Dy(){if(typeof HTMLCanvasElement>"u")return!1;const i=HTMLCanvasElement.prototype;return"layoutSubtree"in i&&typeof i.requestPaint=="function"}class Ht{static defaultProps={...nd};get[Symbol.toStringTag](){return"Device"}toString(){return`Device(${this.id})`}toJSON(){return this.toString()}id;props;userData={};statsManager=sd;_factories={};timestamp=0;_reused=!1;_moduleData={};wgslLanguageFeatures=new Set;_textureCaps={};_debugGPUTimeQuery=null;constructor(e){this.props={...Ht.defaultProps,...e},this.id=this.props.id||qi(this[Symbol.toStringTag].toLowerCase())}getVertexFormatInfo(e){return ie.getVertexFormatInfo(e)}isVertexFormatSupported(e){return!0}getTextureFormatInfo(e){return _e.getInfo(e)}getTextureFormatCapabilities(e){let t=this._textureCaps[e];if(!t){const n=this._getDeviceTextureFormatCapabilities(e);t=this._getDeviceSpecificTextureFormatCapabilities(n),this._textureCaps[e]=t}return t}getMipLevelCount(e,t,n=1){const s=Math.max(e,t,n);return 1+Math.floor(Math.log2(s))}isExternalImage(e){return Cy(e)}getExternalImageSize(e){return Ay(e)}isTextureFormatSupported(e){return this.getTextureFormatCapabilities(e).create}isTextureFormatFilterable(e){return this.getTextureFormatCapabilities(e).filter}isTextureFormatRenderable(e){return this.getTextureFormatCapabilities(e).render}isTextureFormatCompressed(e){return _e.isCompressed(e)}getSupportedCompressedTextureFormats(){const e=[];for(const t of Object.keys(gy()))this.isTextureFormatCompressed(t)&&this.isTextureFormatSupported(t)&&e.push(t);return e}pushDebugGroup(e){this.commandEncoder.pushDebugGroup(e)}popDebugGroup(){this.commandEncoder?.popDebugGroup()}insertDebugMarker(e){this.commandEncoder?.insertDebugMarker(e)}loseDevice(){return!1}incrementTimestamp(){return this.timestamp++}reportError(e,t,...n){if(!this.props.onError(e,t)){const r=Iy(t,n);return P.error(this.type==="webgl"?"%cWebGL":"%cWebGPU","color: white; background: red; padding: 2px 6px; border-radius: 3px;",e.message,...r)}return()=>{}}debug(){if(this.props.debug)debugger;else P.once(0,`'Type luma.log.set({debug: true}) in console to enable debug breakpoints',
or create a device with the 'debug: true' prop.`)()}getDefaultCanvasContext(){if(!this.canvasContext)throw new Error("Device has no default CanvasContext. See props.createCanvasContext");return this.canvasContext}createFence(){throw new Error("createFence() not implemented")}beginRenderPass(e){return this.commandEncoder.beginRenderPass(e)}beginComputePass(e){return this.commandEncoder.beginComputePass(e)}writeBufferViaCommandEncoder(e,t,n,s=0){throw new Error("writeBufferViaCommandEncoder() not implemented")}generateMipmapsWebGPU(e){throw new Error("not implemented")}_createSharedRenderPipelineWebGL(e){throw new Error("_createSharedRenderPipelineWebGL() not implemented")}_createBindGroupLayoutWebGPU(e,t){throw new Error("_createBindGroupLayoutWebGPU() not implemented")}_createBindGroupWebGPU(e,t,n,s,r){throw new Error("_createBindGroupWebGPU() not implemented")}_supportsDebugGPUTime(){return this.features.has("timestamp-query")&&!!(this.props.debug||this.props.debugGPUTime)}_enableDebugGPUTime(e=256){if(!this._supportsDebugGPUTime())return null;if(this._debugGPUTimeQuery)return this._debugGPUTimeQuery;try{this._debugGPUTimeQuery=this.createQuerySet({type:"timestamp",count:e}),this.commandEncoder=this.createCommandEncoder({id:this.commandEncoder.props.id,timeProfilingQuerySet:this._debugGPUTimeQuery})}catch{this._debugGPUTimeQuery=null}return this._debugGPUTimeQuery}_disableDebugGPUTime(){this._debugGPUTimeQuery&&(this.commandEncoder.getTimeProfilingQuerySet()===this._debugGPUTimeQuery&&(this.commandEncoder=this.createCommandEncoder({id:this.commandEncoder.props.id})),this._debugGPUTimeQuery.destroy(),this._debugGPUTimeQuery=null)}_isDebugGPUTimeEnabled(){return this._debugGPUTimeQuery!==null}getCanvasContext(){return this.getDefaultCanvasContext()}readPixelsToArrayWebGL(e,t){throw new Error("not implemented")}readPixelsToBufferWebGL(e,t){throw new Error("not implemented")}setParametersWebGL(e){throw new Error("not implemented")}getParametersWebGL(e){throw new Error("not implemented")}withParametersWebGL(e,t){throw new Error("not implemented")}clearWebGL(e){throw new Error("not implemented")}resetWebGL(){throw new Error("not implemented")}getModuleData(e){return this._moduleData[e]||={},this._moduleData[e]}static _getCanvasContextProps(e){return e.createCanvasContext===!0?{}:e.createCanvasContext}_getDeviceTextureFormatCapabilities(e){const t=_e.getCapabilities(e),n=r=>(typeof r=="string"?this.features.has(r):r)??!0,s=n(t.create);return{format:e,create:s,render:s&&n(t.render),filter:s&&n(t.filter),blend:s&&n(t.blend),store:s&&n(t.store)}}_normalizeBufferProps(e){(e instanceof ArrayBuffer||ArrayBuffer.isView(e))&&(e={data:e});const t={...e};if((e.usage||0)&O.INDEX&&(e.indexType||(e.data instanceof Uint32Array?t.indexType="uint32":e.data instanceof Uint16Array?t.indexType="uint16":e.data instanceof Uint8Array&&(t.data=new Uint16Array(e.data),t.indexType="uint16")),!t.indexType))throw new Error("indices buffer content must be of type uint16 or uint32");return t}}class Fy{props;_resizeObserver;_intersectionObserver;_observeDevicePixelRatioTimeout=null;_observeDevicePixelRatioMediaQuery=null;_handleDevicePixelRatioChange=()=>this._refreshDevicePixelRatio();_trackPositionInterval=null;_started=!1;get started(){return this._started}constructor(e){this.props=e}start(){if(this._started||!this.props.canvas)return;this._started=!0,this._intersectionObserver||=new IntersectionObserver(t=>this.props.onIntersection(t)),this._resizeObserver||=new ResizeObserver(t=>this.props.onResize(t)),this._intersectionObserver.observe(this.props.canvas);const e=this.props.resizeObserverBox;try{this._resizeObserver.observe(this.props.canvas,{box:e})}catch{this._resizeObserver.observe(this.props.canvas,{box:"content-box"})}this._observeDevicePixelRatioTimeout=setTimeout(()=>this._refreshDevicePixelRatio(),0),this.props.trackPosition&&this._trackPosition()}stop(){this._started&&(this._started=!1,this._observeDevicePixelRatioTimeout&&(clearTimeout(this._observeDevicePixelRatioTimeout),this._observeDevicePixelRatioTimeout=null),this._observeDevicePixelRatioMediaQuery&&(this._observeDevicePixelRatioMediaQuery.removeEventListener("change",this._handleDevicePixelRatioChange),this._observeDevicePixelRatioMediaQuery=null),this._trackPositionInterval&&(clearInterval(this._trackPositionInterval),this._trackPositionInterval=null),this._resizeObserver?.disconnect(),this._intersectionObserver?.disconnect())}_refreshDevicePixelRatio(){this._started&&(this.props.onDevicePixelRatioChange(),this._observeDevicePixelRatioMediaQuery?.removeEventListener("change",this._handleDevicePixelRatioChange),this._observeDevicePixelRatioMediaQuery=matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),this._observeDevicePixelRatioMediaQuery.addEventListener("change",this._handleDevicePixelRatioChange,{once:!0}))}_trackPosition(e=100){this._trackPositionInterval||(this._trackPositionInterval=setInterval(()=>{this._started?this.props.onPositionChange():this._trackPositionInterval&&(clearInterval(this._trackPositionInterval),this._trackPositionInterval=null)},e))}}function zy(){let i,e;return{promise:new Promise((n,s)=>{i=n,e=s}),resolve:i,reject:e}}function Bi(i,e){if(!i){const t=new Error(e??"luma.gl assertion failed.");throw Error.captureStackTrace?.(t,Bi),t}}function Xn(i,e){return Bi(i,e),i}class Ze{static isHTMLCanvas(e){return typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement}static isOffscreenCanvas(e){return typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas}static defaultProps={id:void 0,canvas:null,width:800,height:600,useDevicePixels:!0,pixelSizeSource:"exact",autoResize:!0,container:null,visible:!0,alphaMode:"opaque",colorSpace:"srgb",colorFormat:void 0,toneMapping:"standard",trackPosition:!1};id;props;canvas;htmlCanvas;offscreenCanvas;type;initialized;isInitialized=!1;isVisible=!0;cssWidth;cssHeight;devicePixelRatio;devicePixelWidth;devicePixelHeight;drawingBufferWidth;drawingBufferHeight;_initializedResolvers=zy();_canvasObserver;_position=[0,0];destroyed=!1;_needsDrawingBufferResize=!0;_configuredDrawingBufferSize=[0,0];toString(){return`${this[Symbol.toStringTag]}(${this.id})`}constructor(e){this.props={...Ze.defaultProps,...e},e=this.props,this.initialized=this._initializedResolvers.promise,Jt()?e.canvas?typeof e.canvas=="string"?this.canvas=$y(e.canvas):this.canvas=e.canvas:this.canvas=Uy(e):this.canvas={width:e.width||1,height:e.height||1},Ze.isHTMLCanvas(this.canvas)?(this.id=e.id||this.canvas.id,this.type="html-canvas",this.htmlCanvas=this.canvas):Ze.isOffscreenCanvas(this.canvas)?(this.id=e.id||"offscreen-canvas",this.type="offscreen-canvas",this.offscreenCanvas=this.canvas):(this.id=e.id||"node-canvas-context",this.type="node"),this.cssWidth=this.htmlCanvas?.clientWidth||this.canvas.width,this.cssHeight=this.htmlCanvas?.clientHeight||this.canvas.height,this.devicePixelWidth=this.canvas.width,this.devicePixelHeight=this.canvas.height,this.drawingBufferWidth=this.canvas.width,this.drawingBufferHeight=this.canvas.height,this._configuredDrawingBufferSize=[this.canvas.width,this.canvas.height],this.devicePixelRatio=globalThis.devicePixelRatio||1,this._position=[0,0],this._canvasObserver=new Fy({canvas:this.htmlCanvas,trackPosition:this.props.trackPosition,resizeObserverBox:this.props.pixelSizeSource==="css-dpr"?"content-box":"device-pixel-content-box",onResize:t=>this._handleResize(t),onIntersection:t=>this._handleIntersection(t),onDevicePixelRatioChange:()=>this._observeDevicePixelRatio(),onPositionChange:()=>this.updatePosition()})}destroy(){this.destroyed||(this.destroyed=!0,this._stopObservers(),this.device=null)}setProps(e){return"useDevicePixels"in e&&(this.props.useDevicePixels=e.useDevicePixels||!1,this._updateDrawingBufferSize()),this}getCurrentFramebuffer(e){return this._resizeDrawingBufferIfNeeded(),this._getCurrentFramebuffer(e)}getCSSSize(){return[this.cssWidth,this.cssHeight]}getPosition(){return this._position}getDevicePixelSize(){return[this.devicePixelWidth,this.devicePixelHeight]}getDrawingBufferSize(){return[this.drawingBufferWidth,this.drawingBufferHeight]}getMaxDrawingBufferSize(){const e=this.device.limits.maxTextureDimension2D;return[e,e]}setDrawingBufferSize(e,t){e=Math.floor(e),t=Math.floor(t),!(this.drawingBufferWidth===e&&this.drawingBufferHeight===t)&&(this.drawingBufferWidth=e,this.drawingBufferHeight=t,this._needsDrawingBufferResize=!0)}getDevicePixelRatio(){return typeof window<"u"&&window.devicePixelRatio||1}cssToDevicePixels(e,t=!0){const n=this.cssToDeviceRatio(),[s,r]=this.getDrawingBufferSize();return Gy(e,n,s,r,t)}getPixelSize(){return this.getDevicePixelSize()}getAspect(){const[e,t]=this.getDrawingBufferSize();return e>0&&t>0?e/t:1}cssToDeviceRatio(){try{const[e]=this.getDrawingBufferSize(),[t]=this.getCSSSize();return t?e/t:1}catch{return 1}}resize(e){this.setDrawingBufferSize(e.width,e.height)}_setAutoCreatedCanvasId(e){this.htmlCanvas?.id==="lumagl-auto-created-canvas"&&(this.htmlCanvas.id=e)}_startObservers(){this.destroyed||this._canvasObserver.start()}_stopObservers(){this._canvasObserver.stop()}_handleIntersection(e){if(this.destroyed)return;const t=e.find(s=>s.target===this.canvas);if(!t)return;const n=t.isIntersecting;this.isVisible!==n&&(this.isVisible=n,this.device.props.onVisibilityChange(this))}_handleResize(e){if(this.destroyed)return;const t=e.find(r=>r.target===this.canvas);if(!t)return;const n=Xn(t.contentBoxSize?.[0]);this.cssWidth=n.inlineSize,this.cssHeight=n.blockSize;const s=this.getDevicePixelSize();this._setDevicePixelSize(this._getDevicePixelSizeFromResizeEntry(t)),this._updateDrawingBufferSize(),this.device.props.onResize(this,{oldPixelSize:s})}_updateDrawingBufferSize(){if(this.props.autoResize)if(typeof this.props.useDevicePixels=="number"){const e=this.props.useDevicePixels;this.setDrawingBufferSize(this.cssWidth*e,this.cssHeight*e)}else this.props.useDevicePixels?this.setDrawingBufferSize(this.devicePixelWidth,this.devicePixelHeight):this.setDrawingBufferSize(this.cssWidth,this.cssHeight);this._initializedResolvers.resolve(),this.isInitialized=!0,this.updatePosition()}_getDevicePixelSizeFromResizeEntry(e){const t=Xn(e.contentBoxSize?.[0]);return this.props.pixelSizeSource==="css-dpr"?this._getDevicePixelSizeFromCSSSize(t.inlineSize,t.blockSize):{devicePixelWidth:e.devicePixelContentBoxSize?.[0]?.inlineSize||t.inlineSize*devicePixelRatio,devicePixelHeight:e.devicePixelContentBoxSize?.[0]?.blockSize||t.blockSize*devicePixelRatio}}_getDevicePixelSizeFromCSSSize(e,t){const n=this.getDevicePixelRatio();return{devicePixelWidth:Math.floor(e*n),devicePixelHeight:Math.floor(t*n)}}_setDevicePixelSize({devicePixelWidth:e,devicePixelHeight:t}){const[n,s]=this.getMaxDrawingBufferSize();this.devicePixelWidth=Math.max(1,Math.min(e,n)),this.devicePixelHeight=Math.max(1,Math.min(t,s))}_resizeDrawingBufferIfNeeded(){if(this._needsDrawingBufferResize){this._needsDrawingBufferResize=!1,(this.drawingBufferWidth!==this.canvas.width||this.drawingBufferHeight!==this.canvas.height)&&(this.canvas.width=this.drawingBufferWidth,this.canvas.height=this.drawingBufferHeight);const[t,n]=this._configuredDrawingBufferSize;(this.drawingBufferWidth!==t||this.drawingBufferHeight!==n)&&(this._configureDevice(),this._configuredDrawingBufferSize=[this.drawingBufferWidth,this.drawingBufferHeight])}}_observeDevicePixelRatio(){if(this.destroyed||!this._canvasObserver.started)return;const e=this.devicePixelRatio;if(this.devicePixelRatio=window.devicePixelRatio,this.props.pixelSizeSource==="css-dpr"){const t=this.getDevicePixelSize();this._setDevicePixelSize(this._getDevicePixelSizeFromCSSSize(this.cssWidth,this.cssHeight)),this._updateDrawingBufferSize(),this.device.props.onResize(this,{oldPixelSize:t})}this.updatePosition(),this.device.props.onDevicePixelRatioChange?.(this,{oldRatio:e})}updatePosition(){if(this.destroyed)return;const e=this.htmlCanvas?.getBoundingClientRect();if(e){const t=[e.left,e.top];if(this._position??=t,t[0]!==this._position[0]||t[1]!==this._position[1]){const s=this._position;this._position=t,this.device.props.onPositionChange?.(this,{oldPosition:s})}}}}function Ny(i){if(typeof i=="string"){const e=document.getElementById(i);if(!e)throw new Error(`${i} is not an HTML element`);return e}return i||document.body}function $y(i){const e=document.getElementById(i);if(!Ze.isHTMLCanvas(e))throw new Error("Object is not a canvas element");return e}function Uy(i){const{width:e,height:t}=i,n=document.createElement("canvas");n.id=qi("lumagl-auto-created-canvas"),n.width=e||1,n.height=t||1,n.style.width=Number.isFinite(e)?`${e}px`:"100%",n.style.height=Number.isFinite(t)?`${t}px`:"100%",i?.visible||(n.style.visibility="hidden");const s=Ny(i?.container||null);return s.insertBefore(n,s.firstChild),n}function Gy(i,e,t,n,s){const r=i,o=Wc(r[0],e,t);let a=Hc(r[1],e,n,s),c=Wc(r[0]+1,e,t);const l=c===t-1?c:c-1;c=Hc(r[1]+1,e,n,s);let u;return s?(c=c===0?c:c+1,u=a,a=c):u=c===n-1?c:c-1,{x:o,y:a,width:Math.max(l-o+1,1),height:Math.max(u-a+1,1)}}function Wc(i,e,t){return Math.min(Math.round(i*e),t-1)}function Hc(i,e,t,n){return n?Math.max(0,t-1-Math.round(i*e)):Math.min(Math.round(i*e),t-1)}class Vy extends Ze{static defaultProps=Ze.defaultProps}class jy extends Ze{}class ki extends D{static defaultProps={...D.defaultProps,type:"color-sampler",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge",magFilter:"nearest",minFilter:"nearest",mipmapFilter:"none",lodMinClamp:0,lodMaxClamp:32,compare:"less-equal",maxAnisotropy:1};get[Symbol.toStringTag](){return"Sampler"}constructor(e,t){t=ki.normalizeProps(e,t),super(e,t,ki.defaultProps)}static normalizeProps(e,t){return t}}const Wy={"1d":"1d","2d":"2d","2d-array":"2d",cube:"2d","cube-array":"2d","3d":"3d"};class k extends D{static SAMPLE=4;static STORAGE=8;static RENDER=16;static COPY_SRC=1;static COPY_DST=2;static TEXTURE=4;static RENDER_ATTACHMENT=16;dimension;baseDimension;format;width;height;depth;mipLevels;samples;byteAlignment;ready=Promise.resolve(this);isReady=!0;updateTimestamp;get[Symbol.toStringTag](){return"Texture"}toString(){return`Texture(${this.id},${this.format},${this.width}x${this.height})`}constructor(e,t,n){if(t=k.normalizeProps(e,t),super(e,t,k.defaultProps),this.dimension=this.props.dimension,this.baseDimension=Wy[this.dimension],this.format=this.props.format,this.width=this.props.width,this.height=this.props.height,this.depth=this.props.depth,this.mipLevels=this.props.mipLevels,this.samples=this.props.samples||1,this.dimension==="cube"&&(this.depth=6),this.props.width===void 0||this.props.height===void 0)if(e.isExternalImage(t.data)){const s=e.getExternalImageSize(t.data);this.width=s?.width||1,this.height=s?.height||1}else this.width=1,this.height=1,(this.props.width===void 0||this.props.height===void 0)&&P.warn(`${this} created with undefined width or height. This is deprecated. Use DynamicTexture instead.`)();this.byteAlignment=n?.byteAlignment||1,this.updateTimestamp=e.incrementTimestamp()}clone(e){return this.device.createTexture({...this.props,...e})}setSampler(e){this.sampler=e instanceof ki?e:this.device.createSampler(e)}copyImageData(e){const{data:t,depth:n,...s}=e;this.writeData(t,{...s,depthOrArrayLayers:s.depthOrArrayLayers??n})}computeMemoryLayout(e={}){const t=this._normalizeTextureReadOptions(e),{width:n=this.width,height:s=this.height,depthOrArrayLayers:r=this.depth}=t,{format:o,byteAlignment:a}=this;return _e.computeMemoryLayout({format:o,width:n,height:s,depth:r,byteAlignment:a})}readBuffer(e,t){throw new Error("readBuffer not implemented")}readDataAsync(e){throw new Error("readBuffer not implemented")}writeBuffer(e,t){throw new Error("readBuffer not implemented")}writeData(e,t){throw new Error("readBuffer not implemented")}readDataSyncWebGL(e){throw new Error("readDataSyncWebGL not available")}generateMipmapsWebGL(){throw new Error("generateMipmapsWebGL not available")}static normalizeProps(e,t){const n={...t},{width:s,height:r}=n;return typeof s=="number"&&(n.width=Math.max(1,Math.ceil(s))),typeof r=="number"&&(n.height=Math.max(1,Math.ceil(r))),n}_initializeData(e){this.device.isExternalImage(e)?this.copyExternalImage({image:e,width:this.width,height:this.height,depth:this.depth,mipLevel:0,x:0,y:0,z:0,aspect:"all",colorSpace:"srgb",premultipliedAlpha:!1,flipY:!1}):e&&this.copyImageData({data:e,mipLevel:0,x:0,y:0,z:0,aspect:"all"})}_normalizeCopyImageDataOptions(e){const{data:t,depth:n,...s}=e,r=this._normalizeTextureWriteOptions({...s,depthOrArrayLayers:s.depthOrArrayLayers??n});return{data:t,depth:r.depthOrArrayLayers,...r}}_normalizeCopyExternalImageOptions(e){const t=k._omitUndefined(e),n=t.mipLevel??0,s=this._getMipLevelSize(n),r=this.device.getExternalImageSize(e.image),o={...k.defaultCopyExternalImageOptions,...s,...r,...t};return o.width=Math.min(o.width,s.width-o.x),o.height=Math.min(o.height,s.height-o.y),o.depth=Math.min(o.depth,s.depthOrArrayLayers-o.z),o}_normalizeCopyElementImageOptions(e){const t=k._omitUndefined(e),n=t.mipLevel??0,s=this._getMipLevelSize(n),r={...k.defaultCopyElementImageOptions,...s,...t};return r.width=Math.min(r.width,s.width-r.x),r.height=Math.min(r.height,s.height-r.y),r.depth=Math.min(r.depth,s.depthOrArrayLayers-r.z),r}_normalizeTextureReadOptions(e){const t=k._omitUndefined(e),n=t.mipLevel??0,s=this._getMipLevelSize(n),r={...k.defaultTextureReadOptions,...s,...t};return r.width=Math.min(r.width,s.width-r.x),r.height=Math.min(r.height,s.height-r.y),r.depthOrArrayLayers=Math.min(r.depthOrArrayLayers,s.depthOrArrayLayers-r.z),r}_getSupportedColorReadOptions(e){const t=this._normalizeTextureReadOptions(e),n=_e.getInfo(this.format);switch(this._validateColorReadAspect(t),this._validateColorReadFormat(n),this.dimension){case"2d":case"cube":case"cube-array":case"2d-array":case"3d":return t;default:throw new Error(`${this} color readback does not support ${this.dimension} textures`)}}_validateColorReadAspect(e){if(e.aspect!=="all")throw new Error(`${this} color readback only supports aspect 'all'`)}_validateColorReadFormat(e){if(e.compressed)throw new Error(`${this} color readback does not support compressed formats (${this.format})`);switch(e.attachment){case"color":return;case"depth":throw new Error(`${this} color readback does not support depth formats (${this.format})`);case"stencil":throw new Error(`${this} color readback does not support stencil formats (${this.format})`);case"depth-stencil":throw new Error(`${this} color readback does not support depth-stencil formats (${this.format})`);default:throw new Error(`${this} color readback does not support format ${this.format}`)}}_normalizeTextureWriteOptions(e){const t=k._omitUndefined(e),n=t.mipLevel??0,s=this._getMipLevelSize(n),r={...k.defaultTextureWriteOptions,...s,...t};r.width=Math.min(r.width,s.width-r.x),r.height=Math.min(r.height,s.height-r.y),r.depthOrArrayLayers=Math.min(r.depthOrArrayLayers,s.depthOrArrayLayers-r.z);const o=_e.computeMemoryLayout({format:this.format,width:r.width,height:r.height,depth:r.depthOrArrayLayers,byteAlignment:this.byteAlignment}),a=o.bytesPerPixel*r.width;if(r.bytesPerRow=t.bytesPerRow??o.bytesPerRow,r.rowsPerImage=t.rowsPerImage??r.height,r.bytesPerRow<a)throw new Error(`bytesPerRow (${r.bytesPerRow}) must be at least ${a} for ${this.format}`);if(r.rowsPerImage<r.height)throw new Error(`rowsPerImage (${r.rowsPerImage}) must be at least ${r.height} for ${this.format}`);const c=this.device.getTextureFormatInfo(this.format).bytesPerPixel;if(c&&r.bytesPerRow%c!==0)throw new Error(`bytesPerRow (${r.bytesPerRow}) must be a multiple of bytesPerPixel (${c}) for ${this.format}`);return r}_getMipLevelSize(e){const t=Math.max(1,this.width>>e),n=this.baseDimension==="1d"?1:Math.max(1,this.height>>e),s=this.dimension==="3d"?Math.max(1,this.depth>>e):this.depth;return{width:t,height:n,depthOrArrayLayers:s}}getAllocatedByteLength(){let e=0;for(let t=0;t<this.mipLevels;t++){const{width:n,height:s,depthOrArrayLayers:r}=this._getMipLevelSize(t);e+=_e.computeMemoryLayout({format:this.format,width:n,height:s,depth:r,byteAlignment:1}).byteLength}return e*this.samples}static _omitUndefined(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t!==void 0))}static defaultProps={...D.defaultProps,data:null,dimension:"2d",format:"rgba8unorm",usage:k.SAMPLE|k.RENDER|k.COPY_DST,width:void 0,height:void 0,depth:1,mipLevels:1,samples:void 0,sampler:{},view:void 0};static defaultCopyDataOptions={data:void 0,byteOffset:0,bytesPerRow:void 0,rowsPerImage:void 0,width:void 0,height:void 0,depthOrArrayLayers:void 0,depth:1,mipLevel:0,x:0,y:0,z:0,aspect:"all"};static defaultCopyExternalImageOptions={image:void 0,sourceX:0,sourceY:0,width:void 0,height:void 0,depth:1,mipLevel:0,x:0,y:0,z:0,aspect:"all",colorSpace:"srgb",premultipliedAlpha:!1,flipY:!1};static defaultCopyElementImageOptions={element:void 0,width:void 0,height:void 0,sourceX:0,sourceY:0,sourceWidth:void 0,sourceHeight:void 0,depth:1,mipLevel:0,x:0,y:0,z:0,aspect:"all",colorSpace:"srgb",premultipliedAlpha:!1,flipY:!1};static defaultTextureReadOptions={x:0,y:0,z:0,width:void 0,height:void 0,depthOrArrayLayers:1,mipLevel:0,aspect:"all"};static defaultTextureWriteOptions={byteOffset:0,bytesPerRow:void 0,rowsPerImage:void 0,x:0,y:0,z:0,width:void 0,height:void 0,depthOrArrayLayers:1,mipLevel:0,aspect:"all"}}class Es extends D{get[Symbol.toStringTag](){return"TextureView"}constructor(e,t){super(e,t,Es.defaultProps)}static defaultProps={...D.defaultProps,format:void 0,dimension:void 0,aspect:"all",baseMipLevel:0,mipLevelCount:void 0,baseArrayLayer:0,arrayLayerCount:void 0}}class fa extends D{width;height;updateTimestamp;get[Symbol.toStringTag](){return"ExternalTexture"}constructor(e,t){super(e,t,fa.defaultProps);const n=this.props.source?e.getExternalImageSize(this.props.source):null;this.width=this.props.width||n?.width||0,this.height=this.props.height||n?.height||0,this.updateTimestamp=e.incrementTimestamp()}static defaultProps={...D.defaultProps,source:void 0,width:0,height:0,colorSpace:"srgb",sampler:{}}}function Hy(i,e,t){let n="";const s=e.split(/\r?\n/),r=i.slice().sort((o,a)=>o.lineNum-a.lineNum);switch(t?.showSourceCode||"no"){case"all":let o=0;for(let a=1;a<=s.length;a++){const c=s[a-1],l=r[o];for(c&&l&&(n+=ld(c,a,t));r.length>o&&l.lineNum===a;){const u=r[o++];u&&(n+=rr(u,s,u.lineNum,{...t,inlineSource:!1}))}}for(;r.length>o;){const a=r[o++];a&&(n+=rr(a,[],0,{...t,inlineSource:!1}))}return n;case"issues":case"no":for(const a of i)n+=rr(a,s,a.lineNum,{inlineSource:t?.showSourceCode!=="no"});return n}}function rr(i,e,t,n){if(n?.inlineSource){const r=Yy(e,t),o=i.linePos>0?`${" ".repeat(i.linePos+5)}^^^
`:"";return`
${r}${o}${i.type.toUpperCase()}: ${i.message}

`}const s=i.type==="error"?"red":"orange";return n?.html?`<div class='luma-compiler-log-${i.type}' style="color:${s};"><b> ${i.type.toUpperCase()}: ${i.message}</b></div>`:`${i.type.toUpperCase()}: ${i.message}`}function Yy(i,e,t){let n="";for(let s=e-2;s<=e;s++){const r=i[s-1];r!==void 0&&(n+=ld(r,e,t))}return n}function ld(i,e,t){const n=t?.html?Xy(i):i;return`${qy(String(e),4)}: ${n}${t?.html?"<br/>":`
`}`}function qy(i,e){let t="";for(let n=i.length;n<e;++n)t+=" ";return t+i}function Xy(i){return i.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}class Ss extends D{get[Symbol.toStringTag](){return"Shader"}stage;source;compilationStatus="pending";constructor(e,t){t={...t,debugShaders:t.debugShaders||e.props.debugShaders||"errors"},super(e,{id:Zy(t),...t},Ss.defaultProps),this.stage=this.props.stage,this.source=this.props.source}getCompilationInfoSync(){return null}getTranslatedSource(){return null}async debugShader(){const e=this.props.debugShaders;switch(e){case"never":return;case"errors":if(this.compilationStatus==="success")return;break}try{const t=await this.getCompilationInfo();if(e==="warnings"&&t?.length===0)return;this._displayShaderLog(t,this.id)}catch(t){P.warn(`Shader ${this.id}: failed to fetch compilation info during debug logging`,t)()}}_displayShaderLog(e,t){if(typeof document>"u"||!document?.createElement)return;const n=t,s=`${this.stage} shader "${n}"`,r=Hy(e,this.source,{showSourceCode:"all",html:!0}),o=this.getTranslatedSource(),a=document.createElement("div");a.innerHTML=`<h1>Compilation error in ${s}</h1>
<div style="display:flex;position:fixed;top:10px;right:20px;gap:2px;">
<button id="copy">Copy source</button><br/>
<button id="close">Close</button>
</div>
<code><pre>${r}</pre></code>`,o&&(a.innerHTML+=`<br /><h1>Translated Source</h1><br /><br /><code><pre>${o}</pre></code>`),a.style.top="0",a.style.left="0",a.style.background="white",a.style.position="fixed",a.style.zIndex="9999",a.style.maxWidth="100vw",a.style.maxHeight="100vh",a.style.overflowY="auto",document.body.appendChild(a),a.querySelector(".luma-compiler-log-error")?.scrollIntoView(),a.querySelector("button#close").onclick=()=>{a.remove()},a.querySelector("button#copy").onclick=()=>{navigator.clipboard.writeText(this.source)}}static defaultProps={...D.defaultProps,language:"auto",stage:void 0,source:"",sourceMap:null,entryPoint:"main",debugShaders:void 0}}function Zy(i){return Ky(i.source)||i.id||qi(`unnamed ${i.stage}-shader`)}function Ky(i,e="unnamed"){return/#define[\s*]SHADER_NAME[\s*]([A-Za-z0-9_-]+)[\s*]/.exec(i)?.[1]??e}class Ts extends D{get[Symbol.toStringTag](){return"Framebuffer"}width;height;constructor(e,t={}){super(e,t,Ts.defaultProps),this.width=this.props.width,this.height=this.props.height}clone(e){const t=this.colorAttachments.map(s=>s.texture.clone(e)),n=this.depthStencilAttachment&&this.depthStencilAttachment.texture.clone(e);return this.device.createFramebuffer({...this.props,...e,colorAttachments:t,depthStencilAttachment:n})}resize(e){let t=!e;if(e){const[n,s]=Array.isArray(e)?e:[e.width,e.height];t=t||s!==this.height||n!==this.width,this.width=n,this.height=s}t&&(P.log(2,`Resizing framebuffer ${this.id} to ${this.width}x${this.height}`)(),this.resizeAttachments(this.width,this.height))}autoCreateAttachmentTextures(){if(this.props.colorAttachments.length===0&&!this.props.depthStencilAttachment)throw new Error("Framebuffer has noattachments");this.colorAttachments=this.props.colorAttachments.map((t,n)=>{if(typeof t=="string"){const s=this.createColorTexture(t,n);return this.attachResource(s),s.view}return t instanceof k?t.view:t});const e=this.props.depthStencilAttachment;if(e)if(typeof e=="string"){const t=this.createDepthStencilTexture(e);this.attachResource(t),this.depthStencilAttachment=t.view}else e instanceof k?this.depthStencilAttachment=e.view:this.depthStencilAttachment=e}createColorTexture(e,t){return this.device.createTexture({id:`${this.id}-color-attachment-${t}`,usage:k.RENDER_ATTACHMENT,format:e,width:this.width,height:this.height,sampler:{magFilter:"linear",minFilter:"linear"}})}createDepthStencilTexture(e){return this.device.createTexture({id:`${this.id}-depth-stencil-attachment`,usage:k.RENDER_ATTACHMENT|k.SAMPLE,format:e,width:this.width,height:this.height})}resizeAttachments(e,t){if(this.colorAttachments.forEach((n,s)=>{const r=n.texture.clone({width:e,height:t});this.destroyAttachedResource(n),this.colorAttachments[s]=r.view,this.attachResource(r.view)}),this.depthStencilAttachment){const n=this.depthStencilAttachment.texture.clone({width:e,height:t});this.destroyAttachedResource(this.depthStencilAttachment),this.depthStencilAttachment=n.view,this.attachResource(n)}this.updateAttachments()}static defaultProps={...D.defaultProps,width:1,height:1,colorAttachments:[],depthStencilAttachment:null}}class Ye extends D{get[Symbol.toStringTag](){return"RenderPipeline"}shaderLayout;bufferLayout;linkStatus="pending";hash="";sharedRenderPipeline=null;get isPending(){return this.linkStatus==="pending"||this.vs.compilationStatus==="pending"||this.fs?.compilationStatus==="pending"}get isErrored(){return this.linkStatus==="error"||this.vs.compilationStatus==="error"||this.fs?.compilationStatus==="error"}constructor(e,t){super(e,t,Ye.defaultProps),this.shaderLayout=this.props.shaderLayout,this.bufferLayout=this.props.bufferLayout||[],this.sharedRenderPipeline=this.props._sharedRenderPipeline||null}static defaultProps={...D.defaultProps,vs:null,vertexEntryPoint:"vertexMain",vsConstants:{},fs:null,fragmentEntryPoint:"fragmentMain",fsConstants:{},shaderLayout:null,bufferLayout:[],topology:"triangle-list",colorAttachmentFormats:void 0,depthStencilAttachmentFormat:void 0,parameters:{},varyings:void 0,bufferMode:void 0,disableWarnings:!1,_sharedRenderPipeline:void 0,_uniformBlockLayouts:[],bindings:void 0,bindGroups:void 0}}class Qy extends D{get[Symbol.toStringTag](){return"SharedRenderPipeline"}constructor(e,t){super(e,t,{...D.defaultProps,handle:void 0,vs:void 0,fs:void 0,varyings:void 0,bufferMode:void 0})}}class Di extends D{get[Symbol.toStringTag](){return"ComputePipeline"}hash="";shaderLayout;constructor(e,t){super(e,t,Di.defaultProps),this.shaderLayout=t.shaderLayout}static defaultProps={...D.defaultProps,shader:void 0,entryPoint:void 0,constants:{},shaderLayout:void 0}}class Ls{static defaultProps={...Ye.defaultProps};static getDefaultPipelineFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultPipelineFactory||=new Ls(e),t.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(e){this.device=e}createRenderPipeline(e){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(e);const t={...Ye.defaultProps,...e},n=this._renderPipelineCache,s=this._hashRenderPipeline(t);let r=n[s]?.resource;if(r)n[s].useCount++,this.device.props.debugFactories&&P.log(3,`${this}: ${n[s].resource} reused, count=${n[s].useCount}, (id=${e.id})`)();else{const o=this.device.type==="webgl"&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;r=this.device.createRenderPipeline({...t,id:t.id?`${t.id}-cached`:qi("unnamed-cached"),_sharedRenderPipeline:o}),r.hash=s,n[s]={resource:r,useCount:1},this.device.props.debugFactories&&P.log(3,`${this}: ${r} created, count=${n[s].useCount}`)()}return r}createComputePipeline(e){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(e);const t={...Di.defaultProps,...e},n=this._computePipelineCache,s=this._hashComputePipeline(t);let r=n[s]?.resource;return r?(n[s].useCount++,this.device.props.debugFactories&&P.log(3,`${this}: ${n[s].resource} reused, count=${n[s].useCount}, (id=${e.id})`)()):(r=this.device.createComputePipeline({...t,id:t.id?`${t.id}-cached`:void 0}),r.hash=s,n[s]={resource:r,useCount:1},this.device.props.debugFactories&&P.log(3,`${this}: ${r} created, count=${n[s].useCount}`)()),r}release(e){if(!this.device.props._cachePipelines){e.destroy();return}const t=this._getCache(e),n=e.hash;t[n].useCount--,t[n].useCount===0?(this._destroyPipeline(e),this.device.props.debugFactories&&P.log(3,`${this}: ${e} released and destroyed`)()):t[n].useCount<0?(P.error(`${this}: ${e} released, useCount < 0, resetting`)(),t[n].useCount=0):this.device.props.debugFactories&&P.log(3,`${this}: ${e} released, count=${t[n].useCount}`)()}createSharedRenderPipeline(e){const t=this._hashSharedRenderPipeline(e);let n=this._sharedRenderPipelineCache[t];return n||(n={resource:this.device._createSharedRenderPipelineWebGL(e),useCount:0},this._sharedRenderPipelineCache[t]=n),n.useCount++,n.resource}releaseSharedRenderPipeline(e){if(!e.sharedRenderPipeline)return;const t=this._hashSharedRenderPipeline(e.sharedRenderPipeline.props),n=this._sharedRenderPipelineCache[t];n&&(n.useCount--,n.useCount===0&&(n.resource.destroy(),delete this._sharedRenderPipelineCache[t]))}_destroyPipeline(e){const t=this._getCache(e);return this.device.props._destroyPipelines?(delete t[e.hash],e.destroy(),e instanceof Ye&&this.releaseSharedRenderPipeline(e),!0):!1}_getCache(e){let t;if(e instanceof Di&&(t=this._computePipelineCache),e instanceof Ye&&(t=this._renderPipelineCache),!t)throw new Error(`${this}`);if(!t[e.hash])throw new Error(`${this}: ${e} matched incorrect entry`);return t}_hashComputePipeline(e){const{type:t}=this.device,n=this._getHash(e.shader.source),s=this._getHash(JSON.stringify(e.shaderLayout));return`${t}/C/${n}SL${s}`}_hashRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,n=e.fs?this._getHash(e.fs.source):0,s=this._getWebGLVaryingHash(e),r=this._getHash(JSON.stringify(e.shaderLayout)),o=this._getHash(JSON.stringify(e._uniformBlockLayouts)),a=this._getHash(JSON.stringify(e.bufferLayout)),{type:c}=this.device;if(c==="webgl"){const l=this._getHash(JSON.stringify(e.parameters));return`${c}/R/${t}/${n}V${s}T${e.topology}P${l}SL${r}UBL${o}BL${a}`}else{const u=this._getHash(JSON.stringify({vertexEntryPoint:e.vertexEntryPoint,fragmentEntryPoint:e.fragmentEntryPoint})),f=this._getHash(JSON.stringify(e.parameters)),d=this._getWebGPUAttachmentHash(e);return`${c}/R/${t}/${n}V${s}T${e.topology}EP${u}P${f}SL${r}BL${a}A${d}`}}_hashSharedRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,n=e.fs?this._getHash(e.fs.source):0,s=this._getWebGLVaryingHash(e);return`webgl/S/${t}/${n}V${s}`}_getHash(e){return this._hashes[e]===void 0&&(this._hashes[e]=this._hashCounter++),this._hashes[e]}_getWebGLVaryingHash(e){const{varyings:t=[],bufferMode:n=null}=e;return this._getHash(JSON.stringify({varyings:t,bufferMode:n}))}_getWebGPUAttachmentHash(e){const t=e.colorAttachmentFormats??[this.device.preferredColorFormat],n=e.depthStencilAttachmentFormat??(e.parameters?.depthWriteEnabled?this.device.preferredDepthFormat:null);return this._getHash(JSON.stringify({colorAttachmentFormats:t,depthStencilAttachmentFormat:n}))}}class Cs{static defaultProps={...Ss.defaultProps};static getDefaultShaderFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultShaderFactory||=new Cs(e),t.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(e){this.device=e}createShader(e){if(!this.device.props._cacheShaders)return this.device.createShader(e);const t=this._hashShader(e);let n=this._cache[t];if(n)n.useCount++,this.device.props.debugFactories&&P.log(3,`${this}: Reusing shader ${n.resource.id} count=${n.useCount}`)();else{const s=this.device.createShader({...e,id:e.id?`${e.id}-cached`:void 0});this._cache[t]=n={resource:s,useCount:1},this.device.props.debugFactories&&P.log(3,`${this}: Created new shader ${s.id}`)()}return n.resource}release(e){if(!this.device.props._cacheShaders){e.destroy();return}const t=this._hashShader(e),n=this._cache[t];if(n)if(n.useCount--,n.useCount===0)this.device.props._destroyShaders&&(delete this._cache[t],n.resource.destroy(),this.device.props.debugFactories&&P.log(3,`${this}: Releasing shader ${e.id}, destroyed`)());else{if(n.useCount<0)throw new Error(`ShaderFactory: Shader ${e.id} released too many times`);this.device.props.debugFactories&&P.log(3,`${this}: Releasing shader ${e.id} count=${n.useCount}`)()}}_hashShader(e){return`${e.stage}:${e.source}`}}function ud(i,e,t){const n=i.bindings.find(s=>s.name===e||`${s.name.toLocaleLowerCase()}uniforms`===e.toLocaleLowerCase());return!n&&!t?.ignoreWarnings&&P.warn(`Binding ${e} not set: Not found in shader layout.`)(),n||null}function da(i,e){if(!e)return{};if(Jy(e))return Object.fromEntries(Object.entries(e).map(([s,r])=>[Number(s),{...r}]));const t={};for(const[n,s]of Object.entries(e)){const o=ud(i,n)?.group??0;t[o]||={},t[o][n]=s}return t}function po(i){const e={};for(const t of Object.values(i))Object.assign(e,t);return e}function Jy(i){const e=Object.keys(i);return e.length>0&&e.every(t=>/^\d+$/.test(t))}class ot extends D{static defaultClearColor=[0,0,0,1];static defaultClearDepth=1;static defaultClearStencil=0;get[Symbol.toStringTag](){return"RenderPass"}constructor(e,t,n=ot.defaultProps){t=ot.normalizeProps(e,t),super(e,t,n)}static normalizeProps(e,t){return t}static defaultProps={...D.defaultProps,framebuffer:null,resolveTargets:void 0,parameters:void 0,clearColor:ot.defaultClearColor,clearColors:void 0,clearDepth:ot.defaultClearDepth,clearStencil:ot.defaultClearStencil,depthReadOnly:!1,stencilReadOnly:!1,discard:!1,occlusionQuerySet:void 0,timestampQuerySet:void 0,beginTimestampIndex:void 0,endTimestampIndex:void 0}}class ha extends D{get[Symbol.toStringTag](){return"CommandEncoder"}_timeProfilingQuerySet=null;_timeProfilingSlotCount=0;_gpuTimeMs;constructor(e,t){super(e,t,ha.defaultProps),this._timeProfilingQuerySet=t.timeProfilingQuerySet??null,this._timeProfilingSlotCount=0,this._gpuTimeMs=void 0}async resolveTimeProfilingQuerySet(){if(this._gpuTimeMs=void 0,!this._timeProfilingQuerySet)return;const e=Math.floor(this._timeProfilingSlotCount/2);if(e<=0)return;const t=e*2,n=await this._timeProfilingQuerySet.readResults({firstQuery:0,queryCount:t});let s=0n;for(let r=0;r<t;r+=2)s+=n[r+1]-n[r];this._gpuTimeMs=Number(s)/1e6}getTimeProfilingSlotCount(){return this._timeProfilingSlotCount}getTimeProfilingQuerySet(){return this._timeProfilingQuerySet}_applyTimeProfilingToPassProps(e){const t=e||{};if(!this._supportsTimestampQueries()||!this._timeProfilingQuerySet||t.timestampQuerySet!==void 0||t.beginTimestampIndex!==void 0||t.endTimestampIndex!==void 0)return t;const n=this._timeProfilingSlotCount;return n+1>=this._timeProfilingQuerySet.props.count?t:(this._timeProfilingSlotCount+=2,{...t,timestampQuerySet:this._timeProfilingQuerySet,beginTimestampIndex:n,endTimestampIndex:n+1})}_supportsTimestampQueries(){return this.device.features.has("timestamp-query")}static defaultProps={...D.defaultProps,measureExecutionTime:void 0,timeProfilingQuerySet:void 0}}class ga extends D{get[Symbol.toStringTag](){return"CommandBuffer"}constructor(e,t){super(e,t,ga.defaultProps)}static defaultProps={...D.defaultProps}}class pa extends D{static defaultProps={...D.defaultProps,shaderLayout:void 0,bufferLayout:[]};get[Symbol.toStringTag](){return"VertexArray"}maxVertexAttributes;indexBuffer=null;attributes;constructor(e,t){super(e,t,pa.defaultProps),this.maxVertexAttributes=e.limits.maxVertexAttributes,this.attributes=new Array(this.maxVertexAttributes).fill(null)}getBufferSlot(e){return null}getDrawValidationError(){return null}setConstantWebGL(e,t){this.device.reportError(new Error("constant attributes not supported"),this)()}}class ma extends D{static defaultProps={...D.defaultProps,layout:void 0,buffers:{}};get[Symbol.toStringTag](){return"TransformFeedback"}constructor(e,t){super(e,t,ma.defaultProps)}}class _a extends D{get[Symbol.toStringTag](){return"QuerySet"}constructor(e,t){super(e,t,_a.defaultProps)}static defaultProps={...D.defaultProps,type:void 0,count:void 0}}class ya extends D{static defaultProps={...D.defaultProps};get[Symbol.toStringTag](){return"Fence"}constructor(e,t={}){super(e,t,ya.defaultProps)}}function ba(i){const e=va(i),t=rb[e];if(!t)throw new Error(`Unsupported variable shader type: ${i}`);return t}function eb(i){const e=fd(i),t=sb[e];if(!t)throw new Error(`Unsupported attribute shader type: ${i}`);const[n,s]=t,r=n==="i32"||n==="u32",o=n!=="u32",a=nb[n]*s;return{primitiveType:n,components:s,byteLength:a,integer:r,signed:o}}class tb{getVariableShaderTypeInfo(e){return ba(e)}getAttributeShaderTypeInfo(e){return eb(e)}makeShaderAttributeType(e,t){return ib(e,t)}resolveAttributeShaderTypeAlias(e){return fd(e)}resolveVariableShaderTypeAlias(e){return va(e)}}function ib(i,e){return e===1?i:`vec${e}<${i}>`}function fd(i){return ob[i]||i}function va(i){return ab[i]||i}const ni=new tb,nb={f32:4,f16:2,i32:4,u32:4},sb={f32:["f32",1],"vec2<f32>":["f32",2],"vec3<f32>":["f32",3],"vec4<f32>":["f32",4],f16:["f16",1],"vec2<f16>":["f16",2],"vec3<f16>":["f16",3],"vec4<f16>":["f16",4],i32:["i32",1],"vec2<i32>":["i32",2],"vec3<i32>":["i32",3],"vec4<i32>":["i32",4],u32:["u32",1],"vec2<u32>":["u32",2],"vec3<u32>":["u32",3],"vec4<u32>":["u32",4]},rb={f32:{type:"f32",components:1},f16:{type:"f16",components:1},i32:{type:"i32",components:1},u32:{type:"u32",components:1},"vec2<f32>":{type:"f32",components:2},"vec3<f32>":{type:"f32",components:3},"vec4<f32>":{type:"f32",components:4},"vec2<f16>":{type:"f16",components:2},"vec3<f16>":{type:"f16",components:3},"vec4<f16>":{type:"f16",components:4},"vec2<i32>":{type:"i32",components:2},"vec3<i32>":{type:"i32",components:3},"vec4<i32>":{type:"i32",components:4},"vec2<u32>":{type:"u32",components:2},"vec3<u32>":{type:"u32",components:3},"vec4<u32>":{type:"u32",components:4},"mat2x2<f32>":{type:"f32",components:4},"mat2x3<f32>":{type:"f32",components:6},"mat2x4<f32>":{type:"f32",components:8},"mat3x2<f32>":{type:"f32",components:6},"mat3x3<f32>":{type:"f32",components:9},"mat3x4<f32>":{type:"f32",components:12},"mat4x2<f32>":{type:"f32",components:8},"mat4x3<f32>":{type:"f32",components:12},"mat4x4<f32>":{type:"f32",components:16},"mat2x2<f16>":{type:"f16",components:4},"mat2x3<f16>":{type:"f16",components:6},"mat2x4<f16>":{type:"f16",components:8},"mat3x2<f16>":{type:"f16",components:6},"mat3x3<f16>":{type:"f16",components:9},"mat3x4<f16>":{type:"f16",components:12},"mat4x2<f16>":{type:"f16",components:8},"mat4x3<f16>":{type:"f16",components:12},"mat4x4<f16>":{type:"f16",components:16},"mat2x2<i32>":{type:"i32",components:4},"mat2x3<i32>":{type:"i32",components:6},"mat2x4<i32>":{type:"i32",components:8},"mat3x2<i32>":{type:"i32",components:6},"mat3x3<i32>":{type:"i32",components:9},"mat3x4<i32>":{type:"i32",components:12},"mat4x2<i32>":{type:"i32",components:8},"mat4x3<i32>":{type:"i32",components:12},"mat4x4<i32>":{type:"i32",components:16},"mat2x2<u32>":{type:"u32",components:4},"mat2x3<u32>":{type:"u32",components:6},"mat2x4<u32>":{type:"u32",components:8},"mat3x2<u32>":{type:"u32",components:6},"mat3x3<u32>":{type:"u32",components:9},"mat3x4<u32>":{type:"u32",components:12},"mat4x2<u32>":{type:"u32",components:8},"mat4x3<u32>":{type:"u32",components:12},"mat4x4<u32>":{type:"u32",components:16}},ob={vec2i:"vec2<i32>",vec3i:"vec3<i32>",vec4i:"vec4<i32>",vec2u:"vec2<u32>",vec3u:"vec3<u32>",vec4u:"vec4<u32>",vec2f:"vec2<f32>",vec3f:"vec3<f32>",vec4f:"vec4<f32>",vec2h:"vec2<f16>",vec3h:"vec3<f16>",vec4h:"vec4<f16>"},ab={vec2i:"vec2<i32>",vec3i:"vec3<i32>",vec4i:"vec4<i32>",vec2u:"vec2<u32>",vec3u:"vec3<u32>",vec4u:"vec4<u32>",vec2f:"vec2<f32>",vec3f:"vec3<f32>",vec4f:"vec4<f32>",vec2h:"vec2<f16>",vec3h:"vec3<f16>",vec4h:"vec4<f16>",mat2x2f:"mat2x2<f32>",mat2x3f:"mat2x3<f32>",mat2x4f:"mat2x4<f32>",mat3x2f:"mat3x2<f32>",mat3x3f:"mat3x3<f32>",mat3x4f:"mat3x4<f32>",mat4x2f:"mat4x2<f32>",mat4x3f:"mat4x3<f32>",mat4x4f:"mat4x4<f32>",mat2x2i:"mat2x2<i32>",mat2x3i:"mat2x3<i32>",mat2x4i:"mat2x4<i32>",mat3x2i:"mat3x2<i32>",mat3x3i:"mat3x3<i32>",mat3x4i:"mat3x4<i32>",mat4x2i:"mat4x2<i32>",mat4x3i:"mat4x3<i32>",mat4x4i:"mat4x4<i32>",mat2x2u:"mat2x2<u32>",mat2x3u:"mat2x3<u32>",mat2x4u:"mat2x4<u32>",mat3x2u:"mat3x2<u32>",mat3x3u:"mat3x3<u32>",mat3x4u:"mat3x4<u32>",mat4x2u:"mat4x2<u32>",mat4x3u:"mat4x3<u32>",mat4x4u:"mat4x4<u32>",mat2x2h:"mat2x2<f16>",mat2x3h:"mat2x3<f16>",mat2x4h:"mat2x4<f16>",mat3x2h:"mat3x2<f16>",mat3x3h:"mat3x3<f16>",mat3x4h:"mat3x4<f16>",mat4x2h:"mat4x2<f16>",mat4x3h:"mat4x3<f16>",mat4x4h:"mat4x4<f16>"};function wa(i,e={}){const t={...i},n=e.layout??"std140",s={};let r=0;for(const[o,a]of Object.entries(t))r=mo(s,o,a,r,n);return r=Ae(r,Je(t,n)),{layout:n,byteLength:r*4,uniformTypes:t,fields:s}}function As(i,e){const t=va(i),n=ba(t),s=/^mat(\d)x(\d)<.+>$/.exec(t);if(s){const o=Number(s[1]),a=Number(s[2]),c=Yc(a,t,n.type),l=lb(c.size,c.alignment,e);return{alignment:c.alignment,size:o*l,components:o*a,columns:o,rows:a,columnStride:l,shaderType:t,type:n.type}}const r=/^vec(\d)<.+>$/.exec(t);return r?Yc(Number(r[1]),t,n.type):{alignment:1,size:1,components:1,columns:1,rows:1,columnStride:1,shaderType:t,type:n.type}}function dd(i){return!!i&&typeof i=="object"&&!Array.isArray(i)}function mo(i,e,t,n,s){if(typeof t=="string"){const r=As(t,s),o=Ae(n,r.alignment);return i[e]={offset:o,...r},o+r.size}if(Array.isArray(t)){if(Array.isArray(t[0]))throw new Error(`Nested arrays are not supported for ${e}`);const r=t[0],o=t[1],a=gd(r,s),c=Ae(n,Je(t,s));for(let l=0;l<o;l++)mo(i,`${e}[${l}]`,r,c+l*a,s);return c+a*o}if(dd(t)){const r=Je(t,s);let o=Ae(n,r);for(const[a,c]of Object.entries(t))o=mo(i,`${e}.${a}`,c,o,s);return Ae(o,r)}throw new Error(`Unsupported CompositeShaderType for ${e}`)}function hd(i,e){if(typeof i=="string")return As(i,e).size;if(Array.isArray(i)){const n=i[0],s=i[1];if(Array.isArray(n))throw new Error("Nested arrays are not supported");return gd(n,e)*s}let t=0;for(const n of Object.values(i)){const s=n;t=Ae(t,Je(s,e)),t+=hd(s,e)}return Ae(t,Je(i,e))}function Je(i,e){if(typeof i=="string")return As(i,e).alignment;if(Array.isArray(i)){const n=i[0],s=Je(n,e);return pd(e)?Math.max(s,4):s}let t=1;for(const n of Object.values(i)){const s=Je(n,e);t=Math.max(t,s)}return ub(e)?Math.max(t,4):t}function Yc(i,e,t,n){return{alignment:i===2?2:4,size:i===3?3:i,components:i,columns:1,rows:i,columnStride:i===3?3:i,shaderType:e,type:t}}function gd(i,e){const t=hd(i,e),n=Je(i,e);return cb(t,n,e)}function cb(i,e,t){return Ae(i,pd(t)?4:e)}function lb(i,e,t){return t==="std140"?4:Ae(i,e)}function pd(i){return i==="std140"||i==="wgsl-uniform"}function ub(i){return i==="std140"||i==="wgsl-uniform"}let pn;function md(i){return(!pn||pn.byteLength<i)&&(pn=new ArrayBuffer(i)),pn}function fb(i,e){const t=md(i.BYTES_PER_ELEMENT*e);return new i(t,0,e)}function db(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Zn(i){return Array.isArray(i)?i.length===0||typeof i[0]=="number":db(i)}class hb{layout;constructor(e){this.layout=e}has(e){return!!this.layout.fields[e]}get(e){const t=this.layout.fields[e];return t?{offset:t.offset,size:t.size}:void 0}getFlatUniformValues(e){const t={};for(const[n,s]of Object.entries(e)){const r=this.layout.uniformTypes[n];r?this._flattenCompositeValue(t,n,r,s):this.layout.fields[n]&&(t[n]=s)}return t}getData(e){const t=md(this.layout.byteLength);new Uint8Array(t,0,this.layout.byteLength).fill(0);const n={i32:new Int32Array(t),u32:new Uint32Array(t),f32:new Float32Array(t),f16:new Uint16Array(t)},s=this.getFlatUniformValues(e);for(const[r,o]of Object.entries(s))this._writeLeafValue(n,r,o);return new Uint8Array(t,0,this.layout.byteLength)}_flattenCompositeValue(e,t,n,s){if(s!==void 0){if(typeof n=="string"||this.layout.fields[t]){e[t]=s;return}if(Array.isArray(n)){const r=n[0],o=n[1];if(Array.isArray(r))throw new Error(`Nested arrays are not supported for ${t}`);if(typeof r=="string"&&Zn(s)){this._flattenPackedArray(e,t,r,o,s);return}if(!Array.isArray(s)){P.warn(`Unsupported uniform array value for ${t}:`,s)();return}for(let a=0;a<Math.min(s.length,o);a++){const c=s[a];c!==void 0&&this._flattenCompositeValue(e,`${t}[${a}]`,r,c)}return}if(dd(n)&&gb(s)){for(const[r,o]of Object.entries(s)){if(o===void 0)continue;const a=`${t}.${r}`;this._flattenCompositeValue(e,a,n[r],o)}return}P.warn(`Unsupported uniform value for ${t}:`,s)()}}_flattenPackedArray(e,t,n,s,r){const o=r,c=As(n,this.layout.layout).components;for(let l=0;l<s;l++){const u=l*c;if(u>=o.length)break;c===1?e[`${t}[${l}]`]=Number(o[u]):e[`${t}[${l}]`]=pb(r,u,u+c)}}_writeLeafValue(e,t,n){const s=this.layout.fields[t];if(!s){P.warn(`Uniform ${t} not found in layout`)();return}const{type:r,components:o,columns:a,rows:c,offset:l,columnStride:u}=s,f=e[r];if(o===1){f[l]=Number(n);return}const d=n;if(a===1){for(let g=0;g<o;g++)f[l+g]=Number(d[g]??0);return}let h=0;for(let g=0;g<a;g++){const p=l+g*u;for(let m=0;m<c;m++)f[p+m]=Number(d[h++]??0)}}}function gb(i){return!!i&&typeof i=="object"&&!Array.isArray(i)&&!ArrayBuffer.isView(i)}function pb(i,e,t){return Array.prototype.slice.call(i,e,t)}const mb=128;function _b(i,e,t=16){if(i===e)return!0;const n=i,s=e;if(!Zn(n)||!Zn(s)||n.length!==s.length)return!1;const r=Math.min(t,mb);if(n.length>r)return!1;for(let o=0;o<n.length;++o)if(s[o]!==n[o])return!1;return!0}function yb(i){return Zn(i)?i.slice():i}class bb{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(e){if(this.name=e?.name||"unnamed",e?.name&&e?.shaderLayout){const t=e?.shaderLayout.bindings?.find(s=>s.type==="uniform"&&s.name===e?.name);if(!t)throw new Error(e?.name);const n=t;for(const s of n.uniforms||[])this.bindingLayout[s.name]=s}}setUniforms(e){for(const[t,n]of Object.entries(e))this._setUniform(t,n)&&!this.needsRedraw&&this.setNeedsRedraw(`${this.name}.${t}=${n}`)}setNeedsRedraw(e){this.needsRedraw=this.needsRedraw||e}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(e,t){return _b(this.uniforms[e],t)?!1:(this.uniforms[e]=yb(t),this.modifiedUniforms[e]=!0,this.modified=!0,!0)}}const vb=1024;class _d{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(e,t){this.device=e;for(const[n,s]of Object.entries(t)){const r=n,o=wa(s.uniformTypes??{},{layout:s.layout??wb(e)}),a=new hb(o);this.shaderBlockLayouts.set(r,o),this.shaderBlockWriters.set(r,a);const c=new bb({name:n});c.setUniforms(a.getFlatUniformValues(s.defaultUniforms||{})),this.uniformBlocks.set(r,c)}}destroy(){for(const e of this.uniformBuffers.values())e.destroy()}setUniforms(e,t){for(const[n,s]of Object.entries(e)){const r=n,a=this.shaderBlockWriters.get(r)?.getFlatUniformValues(s||{});this.uniformBlocks.get(r)?.setUniforms(a||{})}this.updateUniformBuffers(t)}getUniformBufferByteLength(e){const t=this.shaderBlockLayouts.get(e)?.byteLength||0;return Math.max(t,vb)}getUniformBufferData(e){const t=this.uniformBlocks.get(e)?.getAllUniforms()||{};return this.shaderBlockWriters.get(e)?.getData(t)||new Uint8Array(0)}createUniformBuffer(e,t){t&&this.setUniforms(t);const n=this.getUniformBufferByteLength(e),s=this.device.createBuffer({usage:O.UNIFORM|O.COPY_DST,byteLength:n}),r=this.getUniformBufferData(e);return s.write(r),s}getManagedUniformBuffer(e){if(!this.uniformBuffers.get(e)){const t=this.getUniformBufferByteLength(e),n=this.device.createBuffer({usage:O.UNIFORM|O.COPY_DST,byteLength:t});this.uniformBuffers.set(e,n)}return this.uniformBuffers.get(e)}updateUniformBuffers(e){let t=!1;for(const n of this.uniformBlocks.keys()){const s=this.updateUniformBuffer(n,e);t||=s}return t&&P.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(e,t){const n=this.uniformBlocks.get(e);let s=this.uniformBuffers.get(e),r=!1;if(s&&n?.needsRedraw){r||=n.needsRedraw;const o=this.getUniformBufferData(e);if(s=this.uniformBuffers.get(e),s&&(t?this.device.writeBufferViaCommandEncoder(t,s,o):s.write(o)),P.level>=4){const a=this.uniformBlocks.get(e)?.getAllUniforms();P.log(4,`Writing to uniform buffer ${String(e)}`,o,a)()}}return r}}function wb(i){return i.type==="webgpu"?"wgsl-uniform":"std140"}function _o(i){return i.attributes?i.attributes.map(e=>e.attribute):[i.name]}function xb(i){return Object.fromEntries(i.attributes.map(e=>[e.name,e.location]))}function qc(i){let e=1/0;for(const t of i)t!==void 0&&(e=Math.min(e,t));return e}function Pb(i,e,t){Eb(e);const n=new Map;for(const s of e){const r=Sb(s);if(s.attributes)for(const o of s.attributes)n.has(o.attribute)||n.set(o.attribute,{bufferName:s.name,stepMode:s.stepMode,vertexFormat:o.format,byteOffset:o.byteOffset,byteStride:r});else s.format&&!n.has(s.name)&&n.set(s.name,{bufferName:s.name,stepMode:s.stepMode,vertexFormat:s.format,byteOffset:0,byteStride:r})}return i.attributes.map(s=>{const r=n.get(s.name);!r&&t?.warnOnMissingBufferLayout&&P.warn(`layout for attribute "${s.name}" not present in buffer layout`)();const o=ni.getAttributeShaderTypeInfo(s.type),a=r?.vertexFormat||ie.getCompatibleVertexFormat(o);return{attributeName:s.name,bufferName:r?.bufferName||s.name,location:s.location,vertexFormat:a,byteOffset:r?.byteOffset??0,byteStride:r?.byteStride??ie.getVertexFormatInfo(a).byteLength,stepMode:r?.stepMode||s.stepMode||(s.name.startsWith("instance")?"instance":"vertex")}}).sort((s,r)=>s.location-r.location)}function Eb(i){for(const e of i)(e.attributes&&e.format||!e.attributes&&!e.format)&&P.warn(`BufferLayout ${e.name} must have either 'attributes' or 'format' field`)()}function Sb(i){if(typeof i.byteStride=="number")return i.byteStride;if(i.attributes){let e=0;for(const t of i.attributes)e+=ie.getVertexFormatInfo(t.format).byteLength;return e}return ie.getVertexFormatInfo(i.format).byteLength}function yd(i,e){const t={},n=Pb(i,e,{warnOnMissingBufferLayout:!0});for(const s of n){const r=Tb(i,s);t[s.attributeName]=r}return t}function Tb(i,e){const t=Lb(i,e.attributeName),n=ni.getAttributeShaderTypeInfo(t.type),s=e.vertexFormat,r=ie.getVertexFormatInfo(s);return{attributeName:e.attributeName,bufferName:e.bufferName,location:t.location,shaderType:t.type,primitiveType:n.primitiveType,shaderComponents:n.components,vertexFormat:s,bufferDataType:r.type,bufferComponents:r.components,normalized:r.normalized,integer:n.integer,stepMode:e.stepMode,byteOffset:e.byteOffset,byteStride:e.byteStride}}function Lb(i,e){const t=i.attributes.find(n=>n.name===e);return t||P.warn(`shader layout attribute "${e}" not present in shader`)(),t||null}const Cb=/^(vs|fs):(?:#(?:decl|main-start|main-end)|[A-Za-z_][\w-]*)$/;function bd(i=[],e){const t=[],n={},s={},r={},o={};for(const a of i)Xc({modules:t,defines:n,injections:s,vertexInputs:r,varyings:o},a),Xc({modules:t,defines:n,injections:s,vertexInputs:r,varyings:o},a[e]);for(const a of Object.keys(o))if(r[a])throw new Error(`ShaderPlugin name "${a}" cannot be both a vertex input and a varying`);return{modules:t,defines:n,injections:s,vertexInputs:r,varyings:o}}function vd(i=[],e=[]){const t=[...i],n=new Set(t.map(s=>s.name));for(const s of e)n.has(s.name)||(t.push(s),n.add(s.name));return t}function Xc(i,e){if(e){e.modules?.length&&i.modules.push(...e.modules),e.defines&&Object.assign(i.defines,e.defines);for(const[t,n]of Object.entries(e.vertexInputs||{})){Zc(t,"vertex input");const s=i.vertexInputs[t];if(s&&s!==n)throw new Error(`ShaderPlugin vertex input "${t}" has conflicting types "${s}" and "${n}"`);i.vertexInputs[t]=n}for(const[t,n]of Object.entries(e.varyings||{})){Zc(t,"varying");const s=Ab(t,n),r=i.varyings[t];if(r&&(r.type!==s.type||r.interpolation!==s.interpolation))throw new Error(`ShaderPlugin varying "${t}" has conflicting declarations "${r.type}/${r.interpolation}" and "${s.type}/${s.interpolation}"`);i.varyings[t]=s}for(const t of e.injections||[])Mb(t.target),i.injections[t.target]||(i.injections[t.target]=[]),i.injections[t.target].push({injection:t.injection,order:t.order??0})}}function Zc(i,e){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(i)||i.startsWith("_luma_"))throw new Error(`ShaderPlugin ${e} "${i}" must be a valid non-reserved identifier`)}function Ab(i,e){const{primitiveType:t}=ni.getAttributeShaderTypeInfo(e.type),n=t==="i32"||t==="u32",s=e.interpolation||(n?"flat":"smooth");if(n&&s==="smooth")throw new Error(`ShaderPlugin integer varying "${i}" must use flat interpolation`);return{type:e.type,interpolation:s}}function Mb(i){if(!Cb.test(i))throw new Error(`ShaderPlugin injection target "${i}" must be a named shader anchor or hook`)}const Ib=/^(?:uniform\s+)?(?:(?:lowp|mediump|highp)\s+)?[A-Za-z0-9_]+(?:<[^>]+>)?\s+([A-Za-z0-9_]+)(?:\s*\[[^\]]+\])?\s*;/,Rb=/((?:layout\s*\([^)]*\)\s*)*)uniform\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}\s*([A-Za-z_][A-Za-z0-9_]*)?\s*;/g;function xa(i){return`${i.name}Uniforms`}function Ob(i,e){const t=e==="wgsl"?i.source:e==="vertex"?i.vs:i.fs;if(!t)return null;const n=xa(i);return Fb(t,e==="wgsl"?"wgsl":"glsl",n)}function Bb(i,e){const t=Object.keys(i.uniformTypes||{});if(!t.length)return null;const n=Ob(i,e);return n?{moduleName:i.name,uniformBlockName:xa(i),stage:e,expectedUniformNames:t,actualUniformNames:n,matches:$b(t,n)}:null}function kb(i,e,t={}){const n=Bb(i,e);if(!n||n.matches)return n;const s=Ub(n);return t.log?.error?.(s,n)(),t.throwOnError!==!1&&ti(!1,s),n}function Pa(i){const e=[],t=Gb(i);for(const n of t.matchAll(Rb)){const s=n[1]?.trim()||null;e.push({blockName:n[2],body:n[3],instanceName:n[4]||null,layoutQualifier:s,hasLayoutQualifier:!!s,isStd140:!!(s&&/\blayout\s*\([^)]*\bstd140\b[^)]*\)/.exec(s))})}return e}function Db(i,e,t,n){const s=Pa(i).filter(o=>!o.isStd140),r=new Set;for(const o of s){if(r.has(o.blockName))continue;r.add(o.blockName);const a="",c=o.hasLayoutQualifier?`declares ${Vb(o.layoutQualifier)} instead of layout(std140)`:"does not declare layout(std140)",l=`${a}${e} shader uniform block ${o.blockName} ${c}. luma.gl host-side shader block packing assumes explicit layout(std140) for GLSL uniform blocks. Add \`layout(std140)\` to the block declaration.`;t?.warn?.(l,o)()}return s}function Fb(i,e,t){const n=e==="wgsl"?zb(i,t):Nb(i,t);if(!n)return null;const s=[];for(const r of n.split(`
`)){const o=r.replace(/\/\/.*$/,"").trim();if(!o||o.startsWith("#"))continue;const a=e==="wgsl"?o.match(/^([A-Za-z0-9_]+)\s*:/):o.match(Ib);a&&s.push(a[1])}return s}function zb(i,e){const t=new RegExp(`\\bstruct\\s+${e}\\b`,"m").exec(i);if(!t)return null;const n=i.indexOf("{",t.index);if(n<0)return null;let s=0;for(let r=n;r<i.length;r++){const o=i[r];if(o==="{"){s++;continue}if(o==="}"&&(s--,s===0))return i.slice(n+1,r)}return null}function Nb(i,e){return Pa(i).find(n=>n.blockName===e)?.body||null}function $b(i,e){if(i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0}function Ub(i){const{expectedUniformNames:e,actualUniformNames:t}=i,n=e.filter(a=>!t.includes(a)),s=t.filter(a=>!e.includes(a)),r=[`Expected ${e.length} fields, found ${t.length}.`],o=jb(e,t);return o&&r.push(o),n.length&&r.push(`Missing from shader block (${n.length}): ${Kc(n)}.`),s.length&&r.push(`Unexpected in shader block (${s.length}): ${Kc(s)}.`),e.length<=12&&t.length<=12&&(n.length||s.length)&&(r.push(`Expected: ${e.join(", ")}.`),r.push(`Actual: ${t.join(", ")}.`)),`${i.moduleName}: ${i.stage} shader uniform block ${i.uniformBlockName} does not match module.uniformTypes. ${r.join(" ")}`}function Gb(i){return i.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"")}function Vb(i){return i.replace(/\s+/g," ").trim()}function jb(i,e){const t=Math.min(i.length,e.length);for(let n=0;n<t;n++)if(i[n]!==e[n])return`First mismatch at field ${n+1}: expected ${i[n]}, found ${e[n]}.`;return i.length>e.length?`Shader block ends after field ${e.length}; expected next field ${i[e.length]}.`:e.length>i.length?`Shader block has extra field ${e.length}: ${e[i.length]}.`:null}function Kc(i,e=8){if(i.length<=e)return i.join(", ");const t=i.length-e;return`${i.slice(0,e).join(", ")}, ... (${t} more)`}function Wb(i){switch(i?.gpu.toLowerCase()){case"apple":return`#define APPLE_GPU
// Apple optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"nvidia":return`#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;case"intel":return`#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"amd":return`#define AMD_GPU
`;default:return`#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Headless Chrome's software shader 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// If the GPU doesn't have full 32 bits precision, will causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`}}function Hb(i,e){if(Number(i.match(/^#version[ \t]+(\d+)/m)?.[1]||100)!==300)throw new Error("luma.gl v9 only supports GLSL 3.00 shader sources");switch(e){case"vertex":return i=Qc(i,Yb),i;case"fragment":return i=Qc(i,qb),i;default:throw new Error(e)}}const wd=[[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/,`#version 300 es
`],[/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g,"textureLod("],[/\btexture(2D|2DProj|Cube)(EXT)?\(/g,"texture("]],Yb=[...wd,[yo("attribute"),"in $1"],[yo("varying"),"out $1"]],qb=[...wd,[yo("varying"),"in $1"]];function Qc(i,e){for(const[t,n]of e)i=i.replace(t,n);return i}function yo(i){return new RegExp(`\\b${i}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`,"g")}function bo(i,e,t="glsl"){let n="";for(const s in i){const r=i[s];if(n+=`${t==="wgsl"?"fn":"void"} ${r.signature} {
`,r.header&&(n+=`  ${r.header}`),e[s]){const a=e[s];a.sort((c,l)=>c.order-l.order);for(const c of a)n+=`  ${c.injection}
`}r.footer&&(n+=`  ${r.footer}`),n+=`}
`}return n}function xd(i){const e={vertex:{},fragment:{}};for(const t of i){let n,s;typeof t!="string"?(n=t,s=n.hook):(n={},s=t),s=s.trim();const r=s.indexOf(":"),o=s.slice(0,r),a=s.slice(r+1),c=s.replace(/\(.+/,""),l=Object.assign(n,{signature:a});switch(o){case"vs":e.vertex[c]=l;break;case"fs":e.fragment[c]=l;break;default:throw new Error(o)}}return e}function Xb(i,e){return{name:Zb(i,e),language:"glsl",version:Kb(i)}}function Zb(i,e="unnamed"){const n=/#define[^\S\r\n]*SHADER_NAME[^\S\r\n]*([A-Za-z0-9_-]+)\s*/.exec(i);return n?n[1]:e}function Kb(i){let e=100;const t=i.match(/[^\s]+/g);if(t&&t.length>=2&&t[0]==="#version"){const n=parseInt(t[1],10);Number.isFinite(n)&&(e=n)}if(e!==100&&e!==300)throw new Error(`Invalid GLSL version ${e}`);return e}const Jc=[new RegExp(`@binding\\(\\s*(\\d+)\\s*\\)\\s*@group\\(\\s*(\\d+)\\s*\\)\\s*${he}\\s*:\\s*([^;]+);`,"g"),new RegExp(`@group\\(\\s*(\\d+)\\s*\\)\\s*@binding\\(\\s*(\\d+)\\s*\\)\\s*${he}\\s*:\\s*([^;]+);`,"g")];function Pd(i,e=[]){const t=ws(i),n=new Map;for(const r of e)n.set(el(r.name,r.group,r.location),r.moduleName);const s=[];for(const r of Jc){r.lastIndex=0;let o;for(o=r.exec(t);o;){const a=r===Jc[0],c=Number(o[a?1:2]),l=Number(o[a?2:1]),u=o[3]?.trim(),f=o[4],d=o[5].trim(),h=n.get(el(f,l,c));s.push(Qb({name:f,group:l,binding:c,owner:h?"module":"application",moduleName:h,accessDeclaration:u,resourceType:d})),o=r.exec(t)}}return s.sort((r,o)=>r.group!==o.group?r.group-o.group:r.binding!==o.binding?r.binding-o.binding:r.name.localeCompare(o.name))}function Qb(i){const e={name:i.name,group:i.group,binding:i.binding,owner:i.owner,kind:"unknown",moduleName:i.moduleName,resourceType:i.resourceType};if(i.accessDeclaration){const t=i.accessDeclaration.split(",").map(n=>n.trim());if(t[0]==="uniform")return{...e,kind:"uniform",access:"uniform"};if(t[0]==="storage"){const n=t[1]||"read_write";return{...e,kind:n==="read"?"read-only-storage":"storage",access:n}}}return i.resourceType==="sampler"||i.resourceType==="sampler_comparison"?{...e,kind:"sampler",samplerKind:i.resourceType==="sampler_comparison"?"comparison":"filtering"}:i.resourceType.startsWith("texture_storage_")?{...e,kind:"storage-texture",access:ev(i.resourceType),viewDimension:tl(i.resourceType)}:i.resourceType.startsWith("texture_")?{...e,kind:"texture",viewDimension:tl(i.resourceType),sampleType:Jb(i.resourceType),multisampled:i.resourceType.startsWith("texture_multisampled_")}:e}function el(i,e,t){return`${e}:${t}:${i}`}function tl(i){if(i.includes("cube_array"))return"cube-array";if(i.includes("2d_array"))return"2d-array";if(i.includes("cube"))return"cube";if(i.includes("3d"))return"3d";if(i.includes("2d"))return"2d";if(i.includes("1d"))return"1d"}function Jb(i){if(i.startsWith("texture_depth_"))return"depth";if(i.includes("<i32>"))return"sint";if(i.includes("<u32>"))return"uint";if(i.includes("<f32>"))return"float"}function ev(i){return/,\s*([A-Za-z_][A-Za-z0-9_]*)\s*>$/.exec(i)?.[1]}const ct="([a-zA-Z_][a-zA-Z0-9_]*)",tv=/^\s*\#\s*if\s+(.+?)\s*(?:\/\/.*)?$/,iv=new RegExp(`^\\s*\\#\\s*ifdef\\s*${ct}\\s*$`),nv=new RegExp(`^\\s*\\#\\s*ifndef\\s*${ct}\\s*(?:\\/\\/.*)?$`),sv=/^\s*\#\s*else\s*(?:\/\/.*)?$/,rv=/^\s*\#\s*endif\s*$/,ov=new RegExp(`^\\s*\\#\\s*ifdef\\s*${ct}\\s*(?:\\/\\/.*)?$`),av=/^\s*\#\s*endif\s*(?:\/\/.*)?$/;function Fi(i,e){const t=i.split(`
`),n=[],s=[];let r=!0;for(const o of t){const a=o.match(tv),c=o.match(ov)||o.match(iv),l=o.match(nv),u=o.match(sv),f=o.match(av)||o.match(rv);if(a){const d=cv(a[1],e?.defines||{}),h=r&&d;s.push({parentActive:r,branchTaken:d,active:h}),r=h}else if(c||l){const d=(c||l)?.[1],h=!!e?.defines?.[d],g=c?h:!h,p=r&&g;s.push({parentActive:r,branchTaken:g,active:p}),r=p}else if(u){const d=s[s.length-1];if(!d)throw new Error("Encountered #else without matching #if, #ifdef or #ifndef");d.active=d.parentActive&&!d.branchTaken,d.branchTaken=!0,r=d.active}else f?(s.pop(),r=s.length?s[s.length-1].active:!0):r&&n.push(o)}if(s.length>0)throw new Error("Unterminated conditional block in shader source");return n.join(`
`)}function cv(i,e){const t=i.trim();if(/^[+-]?\d+(?:\.\d+)?$/.test(t))return Number(t)!==0;if(t==="true")return!0;if(t==="false")return!1;const n=t.match(new RegExp(`^!\\s*${ct}$`));if(n)return!e[n[1]];const s=t.match(new RegExp(`^${ct}$`));if(s)return!!e[s[1]];const r=t.match(new RegExp(`^defined\\s*\\(\\s*${ct}\\s*\\)$`));if(r)return e[r[1]]!==void 0;const o=t.match(new RegExp(`^!\\s*defined\\s*\\(\\s*${ct}\\s*\\)$`));if(o)return e[o[1]]===void 0;throw new Error(`Unsupported #if expression "${i}"`)}function lv(i,e){const t=[];for(const[n,s]of Object.entries(e))fv(i,n),t.push(`in ${Ea(s)} ${n};`);return t.join(`
`)}function uv(i,e,t){const n=Object.entries(t);if(n.length===0)return{source:i,declarations:"",initialization:""};const s=dv(i,e),r=i.slice(s.openParenthesis+1,s.closeParenthesis),o=hv(i,r),a=new Set(o.locations),c=[],l=[],u=[];for(const[p,m]of n){if(o.names.has(p)||mv(i,p))throw new Error(`ShaderPlugin vertex input "${p}" conflicts with an existing WGSL shader input or variable`);const _=_v(a);a.add(_);const b=`_luma_${p}`;c.push(`@location(${_}) ${b}: ${m}`),l.push(`var<private> ${p}: ${m};`),u.push(`${p} = ${b};`)}const f=r.trim()?`,
  `:`
  `,d=r.trim()?"":`
`,h=`${r}${f}${c.join(`,
  `)}${d}`;return{source:i.slice(0,s.openParenthesis+1)+h+i.slice(s.closeParenthesis),declarations:l.join(`
`),initialization:u.join(`
`)}}function Ea(i){const{primitiveType:e,components:t}=ni.getAttributeShaderTypeInfo(i),n=e==="i32"?"int":e==="u32"?"uint":"float";return t===1?n:`${n==="int"?"i":n==="uint"?"u":""}vec${t}`}function fv(i,e){const t=Ms(e);if(new RegExp(`\\b(?:in|attribute)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${t}\\s*(?:\\[|;)`).test(i))throw new Error(`ShaderPlugin vertex input "${e}" conflicts with an existing GLSL input`)}function dv(i,e){const n=new RegExp(`\\bfn\\s+${Ms(e)}\\s*\\(`,"g").exec(i);if(!n)throw new Error(`ShaderPlugin vertex inputs require WGSL vertex entry point "${e}"`);const s=i.indexOf("(",n.index),r=Ed(i,s,"(",")");if(r<0)throw new Error(`Unable to parse WGSL vertex entry point "${e}" parameters`);return{openParenthesis:s,closeParenthesis:r}}function hv(i,e){const t=il(e),n=new Set(nl(e)),s=gv(e);for(const r of s){const o=pv(i,r);if(o!==null){t.push(...il(o));for(const a of nl(o))n.add(a)}}return{locations:t,names:n}}function il(i){const e=[],t=/@location\s*\(\s*(\d+)\s*\)/g;let n=t.exec(i);for(;n;)e.push(Number(n[1])),n=t.exec(i);return e}function nl(i){const e=[],t=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm;let n=t.exec(i);for(;n;)e.push(n[1]),n=t.exec(i);return e}function gv(i){const e=[],t=/:\s*([A-Za-z_][\w]*)\b/g;let n=t.exec(i);for(;n;)e.push(n[1]),n=t.exec(i);return e}function pv(i,e){const n=new RegExp(`\\bstruct\\s+${Ms(e)}\\s*\\{`,"g").exec(i);if(!n)return null;const s=i.indexOf("{",n.index),r=Ed(i,s,"{","}");return r<0?null:i.slice(s+1,r)}function mv(i,e){const t=Ms(e),n=new RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${t}\\b`,"g");let s=n.exec(i);for(;s;){if(yv(i,s.index)===0)return!0;s=n.exec(i)}return!1}function _v(i){let e=0;for(;i.has(e);)e++;return e}function Ed(i,e,t,n){let s=0,r=0,o=!1;for(let a=e;a<i.length;a++){const c=i[a],l=i[a+1];if(o){c===`
`&&(o=!1);continue}if(r>0){c==="/"&&l==="*"?(r++,a++):c==="*"&&l==="/"&&(r--,a++);continue}if(c==="/"&&l==="/"){o=!0,a++;continue}if(c==="/"&&l==="*"){r=1,a++;continue}if(c===t&&s++,c===n&&--s===0)return a}return-1}function yv(i,e){let t=0,n=0,s=!1;for(let r=0;r<e;r++){const o=i[r],a=i[r+1];if(s){o===`
`&&(s=!1);continue}if(n>0){o==="/"&&a==="*"?(n++,r++):o==="*"&&a==="/"&&(n--,r++);continue}o==="/"&&a==="/"?(s=!0,r++):o==="/"&&a==="*"?(n=1,r++):o==="{"?t++:o==="}"&&t--}return t}function Ms(i){return i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function bv(i,e,t){const n=[],s=[];for(const[r,o]of Object.entries(t)){Ov(i,r);const a=o.interpolation==="flat"?"flat ":"",c=e==="vertex"?"out":"in";n.push(`${a}${c} ${Ea(o.type)} ${r};`),e==="vertex"&&s.push(`${r} = ${Iv(o.type)};`)}return{declarations:n.join(`
`),initialization:s.join(`
`)}}function vv(i,e,t,n){const s=Object.entries(n);if(s.length===0)return{source:i,declarations:"",vertexInitialization:"",fragmentInitialization:""};let r=i,o=mn(r,e,"vertex");const a=wv(r,o);let c=mn(r,t,"fragment");const l=xv(r,c),u=or(r,a),f=or(r,l.type),d=new Set([..._n(o.parameters),..._n(u.body),..._n(c.parameters),..._n(f.body)]),h=new Set([...sl(u.body),...sl(f.body)]),g=[],p=[],m=[],_=[];for(const[w,x]of s){if(d.has(w)||Av(r,w))throw new Error(`ShaderPlugin varying "${w}" conflicts with existing WGSL stage I/O or a module variable`);const S=Mv(h);h.add(S);const T=x.interpolation==="flat"?" @interpolate(flat)":"";g.push(`  @location(${S})${T} ${w}: ${x.type},`),p.push(`var<private> ${w}: ${x.type};`),m.push(`${w} = ${Rv(x.type)};`),_.push(`${w} = ${l.name}.${w};`)}Pv(r,a,o.openBrace,o.closeBrace),r=Ev(r,a,o,s.map(([w])=>w)),o=mn(r,e,"vertex"),r=Sv(r,o,s.map(([w])=>w));const y=(a===l.type?[a]:[a,l.type]).map(w=>or(r,w).closeBrace).sort((w,x)=>x-w);for(const w of y)r=r.slice(0,w)+`${g.join(`
`)}
`+r.slice(w);if(c=mn(r,t,"fragment"),!new RegExp(`\\b${Pt(l.name)}\\s*:`).test(c.parameters))throw new Error(`Unable to preserve WGSL fragment input "${l.name}"`);return{source:r,declarations:p.join(`
`),vertexInitialization:m.join(`
`),fragmentInitialization:_.join(`
`)}}function mn(i,e,t){const s=new RegExp(`\\bfn\\s+${Pt(e)}\\s*\\(`,"g").exec(i);if(!s)throw new Error(`ShaderPlugin varyings require WGSL ${t} entry point "${e}"`);const r=i.indexOf("(",s.index),o=Kn(i,r,"(",")"),a=i.indexOf("{",o),c=Kn(i,a,"{","}");if(o<0||a<0||c<0)throw new Error(`Unable to parse WGSL ${t} entry point "${e}"`);return{openParenthesis:r,closeParenthesis:o,openBrace:a,closeBrace:c,parameters:i.slice(r+1,o)}}function wv(i,e){const t=i.slice(e.closeParenthesis+1,e.openBrace),n=/->\s*([A-Za-z_][\w]*)\s*$/.exec(t.trim());if(!n||Sa(i,n[1])===null)throw new Error("ShaderPlugin varyings require the WGSL vertex entry point to return a named struct");return n[1]}function xv(i,e){const t=[];for(const n of Cv(e.parameters,",")){const s=/(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:\s*([A-Za-z_][\w]*)\s*$/.exec(n.trim());s&&Sa(i,s[2])&&t.push({name:s[1],type:s[2]})}if(t.length!==1)throw new Error(`ShaderPlugin varyings require exactly one named WGSL fragment input struct; found ${t.length}`);return t[0]}function or(i,e){const t=Sa(i,e);if(!t)throw new Error(`Unable to find WGSL stage I/O struct "${e}"`);return t}function Sa(i,e){const n=new RegExp(`\\bstruct\\s+${Pt(e)}\\s*\\{`,"g").exec(i);if(!n)return null;const s=i.indexOf("{",n.index),r=Kn(i,s,"{","}");return r<0?null:{openBrace:s,closeBrace:r,body:i.slice(s+1,r)}}function Pv(i,e,t,n){const s=new RegExp(`\\b${Pt(e)}\\s*\\(`,"g");let r=s.exec(i);for(;r;){if(r.index<t||r.index>n)throw new Error(`ShaderPlugin varying output struct "${e}" is constructed outside the selected vertex entry point`);r=s.exec(i)}}function Ev(i,e,t,n){const s=new RegExp(`\\b${Pt(e)}\\s*\\(`,"g"),r=[];let o=s.exec(i);for(;o;){if(o.index>t.openBrace&&o.index<t.closeBrace){const a=i.indexOf("(",o.index),c=Kn(i,a,"(",")");if(c<0||c>t.closeBrace)throw new Error(`Unable to parse WGSL output constructor "${e}"`);r.push({openParenthesis:a,closeParenthesis:c})}o=s.exec(i)}for(const a of r.sort((c,l)=>l.closeParenthesis-c.closeParenthesis)){const l=i.slice(a.openParenthesis+1,a.closeParenthesis).trim()?", ":"";i=i.slice(0,a.closeParenthesis)+l+n.join(", ")+i.slice(a.closeParenthesis)}return i}function Sv(i,e,t){const n=Tv(i,e.openBrace+1,e.closeBrace);for(let s=n.length-1;s>=0;s--){const r=n[s],o=i.slice(r.expressionStart,r.semicolon).trim();if(!o)throw new Error("ShaderPlugin varying vertex entry point cannot use an empty return");const a=`_luma_vertexOutput${s}`,c=t.map(u=>`${a}.${u} = ${u};`).join(`
`),l=`{
var ${a} = ${o};
${c}
return ${a};
}`;i=i.slice(0,r.start)+l+i.slice(r.semicolon+1)}return i}function Tv(i,e,t){const n=[];let s=e;for(;s<t;)if(s=Ta(i,s,t),i.slice(s,s+6)==="return"&&!/[A-Za-z0-9_]/.test(i[s+6]||"")){const r=s+6,o=Lv(i,r,t);if(o<0)throw new Error("Unable to parse WGSL return statement in selected vertex entry point");n.push({start:s,expressionStart:r,semicolon:o}),s=o+1}else s++;return n}function Lv(i,e,t){let n=0,s=0;for(let r=e;r<t;r++){const o=Ta(i,r,t);if(o!==r){r=o-1;continue}const a=i[r];if(a==="("&&n++,a===")"&&n--,a==="["&&s++,a==="]"&&s--,a===";"&&n===0&&s===0)return r}return-1}function Ta(i,e,t){let n=e;if(i[n]==="/"&&i[n+1]==="/"){const s=i.indexOf(`
`,n+2);return s<0||s>t?t:s+1}if(i[n]==="/"&&i[n+1]==="*"){let s=1;for(n+=2;n<t&&s>0;)i[n]==="/"&&i[n+1]==="*"?(s++,n+=2):i[n]==="*"&&i[n+1]==="/"?(s--,n+=2):n++}return n}function Cv(i,e){const t=[];let n=0,s=0,r=0;for(let o=0;o<i.length;o++){const a=i[o];a==="("&&s++,a===")"&&s--,a==="<"&&r++,a===">"&&r--,a===e&&s===0&&r===0&&(t.push(i.slice(n,o)),n=o+1)}return t.push(i.slice(n)),t}function sl(i){const e=[],t=/@location\s*\(\s*(\d+)\s*\)/g;let n=t.exec(i);for(;n;)e.push(Number(n[1])),n=t.exec(i);return e}function _n(i){const e=[],t=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm;let n=t.exec(i);for(;n;)e.push(n[1]),n=t.exec(i);return e}function Av(i,e){const t=new RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${Pt(e)}\\b`,"g");let n=t.exec(i);for(;n;){if(Bv(i,n.index)===0)return!0;n=t.exec(i)}return!1}function Mv(i){let e=0;for(;i.has(e);)e++;return e}function Iv(i){const{primitiveType:e,components:t}=ni.getAttributeShaderTypeInfo(i),n=e==="u32"?"0u":e==="i32"?"0":"0.0";return t===1?n:`${Ea(i)}(${n})`}function Rv(i){const{primitiveType:e,components:t}=ni.getAttributeShaderTypeInfo(i),n=`${e}(0)`;return t===1?n:`${i}(${n})`}function Ov(i,e){if(new RegExp(`\\b(?:flat\\s+|smooth\\s+)?(?:in|out|varying)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${Pt(e)}\\s*(?:\\[|;)`).test(i))throw new Error(`ShaderPlugin varying "${e}" conflicts with existing GLSL stage I/O`)}function Kn(i,e,t,n){let s=0,r=0,o=!1;for(let a=e;a<i.length;a++){const c=i[a],l=i[a+1];if(o){c===`
`&&(o=!1);continue}if(r>0){c==="/"&&l==="*"?(r++,a++):c==="*"&&l==="/"&&(r--,a++);continue}if(c==="/"&&l==="/"){o=!0,a++;continue}if(c==="/"&&l==="*"){r=1,a++;continue}if(c===t&&s++,c===n&&--s===0)return a}return-1}function Bv(i,e){let t=0;for(let n=0;n<e;n++){const s=Ta(i,n,e);if(s!==n){n=s-1;continue}i[n]==="{"&&t++,i[n]==="}"&&t--}return t}function Pt(i){return i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}const La=`

${An}
`,zi=100,kv=`precision highp float;
`;function Dv(i){const e=Yn(i.modules||[]),{source:t,bindingAssignments:n}=zv(i.platformInfo,{...i,source:i.source,stage:"vertex",modules:e});return{source:t,getUniforms:Sd(e),bindingAssignments:n,bindingTable:Pd(t,n),shaderLayout:Xf(t,{vertexEntryPoint:i.vertexEntryPoint,scanVertexAttributes:i.scanVertexAttributes})}}function Fv(i){const{vs:e,fs:t}=i,n=Yn(i.modules||[]);return{vs:rl(i.platformInfo,{...i,source:e,stage:"vertex",modules:n}),fs:rl(i.platformInfo,{...i,source:t,stage:"fragment",modules:n}),getUniforms:Sd(n)}}function zv(i,e){const{source:t,stage:n,modules:s,defines:r={},hookFunctions:o=[],inject:a={},pluginInjections:c={},pluginVertexInputs:l={},pluginVaryings:u={},vertexEntryPoint:f="vertexMain",fragmentEntryPoint:d="fragmentMain",log:h}=e;ti(typeof t=="string","shader source must be a string");const g=Fi(t,{defines:r}),p=uv(g,f,l),m=vv(p.source,f,d,u),_=m.source;let b="";const y=xd(o),v={},w={},x={};Td(c,v,w,x);for(const M in a){const C=typeof a[M]=="string"?{injection:a[M],order:0}:a[M],I=/^(v|f)s:(#)?([\w-]+)$/.exec(M);if(I){const W=I[2],F=I[3];W?F==="decl"?w[M]=[C]:x[M]=[C]:v[M]=[C]}else x[M]=[C]}Nv(p.declarations,p.initialization,w,x),$v(m,w,x);const S=s,T=Hv(_),L=Wv(T.source),E=Zv(S,e._bindingRegistry,L,r),R=[];for(const M of S){h&&td(M,_,h);const C=Fi(Ld(M,"wgsl",h),{defines:r}),I=Yv(C,M,{usedBindingsByGroup:L,bindingRegistry:e._bindingRegistry,reservedBindingKeysByGroup:E});R.push(...I.bindingAssignments);const W=I.source;b+=W;const F=Uv(M);for(const N in F){const on=/^(v|f)s:#([\w-]+)$/.exec(N);if(on){const Lt=on[2]==="decl"?w:x;Lt[N]=Lt[N]||[],Lt[N].push(F[N])}else v[N]=v[N]||[],v[N].push(F[N])}}return b+=La,b=Wn(b,n,Gv(w),!1,"wgsl",{vertex:f,fragment:d}),b+=Vv(y,v),b+=i0(R),b+=T.source,b=Wn(b,n,x,!1,"wgsl",{vertex:f,fragment:d}),t0(b),{source:b,bindingAssignments:R}}function rl(i,e){const{source:t,stage:n,language:s="glsl",modules:r,defines:o={},hookFunctions:a=[],inject:c={},pluginInjections:l={},pluginVertexInputs:u={},pluginVaryings:f={},prologue:d=!0,log:h}=e;ti(typeof t=="string","shader source must be a string");const g=s==="glsl"?Xb(t).version:-1,p=i.shaderLanguageVersion,m=g===100?"#version 100":"#version 300 es",b=t.split(`
`).slice(1).join(`
`),y={};r.forEach(E=>{Object.assign(y,E.defines)}),Object.assign(y,o);let v="";switch(s){case"wgsl":break;case"glsl":v=d?`${m}

// ----- PROLOGUE -------------------------
${`#define SHADER_TYPE_${n.toUpperCase()}`}

${Wb(i)}
${n==="fragment"?kv:""}

// ----- APPLICATION DEFINES -------------------------

${jv(y)}

`:`${m}
`;break}const w=xd(a),x={},S={},T={};Td(l,x,S,T);for(const E in c){const R=typeof c[E]=="string"?{injection:c[E],order:0}:c[E],M=/^(v|f)s:(#)?([\w-]+)$/.exec(E);if(M){const C=M[2],I=M[3];C?I==="decl"?S[E]=[R]:T[E]=[R]:x[E]=[R]}else T[E]=[R]}if(n==="vertex"){const E=lv(b,u);E&&(S["vs:#decl"]=S["vs:#decl"]||[],S["vs:#decl"].push({injection:E,order:Number.MIN_SAFE_INTEGER}))}const L=bv(b,n,f);if(L.declarations){const E=n==="vertex"?"vs:#decl":"fs:#decl";S[E]=S[E]||[],S[E].push({injection:L.declarations,order:Number.MIN_SAFE_INTEGER})}L.initialization&&(T["vs:#main-start"]=T["vs:#main-start"]||[],T["vs:#main-start"].push({injection:L.initialization,order:Number.MIN_SAFE_INTEGER}));for(const E of r){h&&td(E,b,h);const R=Ld(E,n,h);v+=R;const M=E.instance?.normalizedInjections[n]||{};for(const C in M){const I=/^(v|f)s:#([\w-]+)$/.exec(C);if(I){const F=I[2]==="decl"?S:T;F[C]=F[C]||[],F[C].push(M[C])}else x[C]=x[C]||[],x[C].push(M[C])}}return v+="// ----- MAIN SHADER SOURCE -------------------------",v+=La,v=Wn(v,n,S),v+=bo(w[n],x),v+=b,v=Wn(v,n,T),s==="glsl"&&g!==p&&(v=Hb(v,n)),s==="glsl"&&Db(v,n,h),v.trim()}function Sd(i){return function(t){const n={};for(const s of i){const r=s.getUniforms?.(t,n);Object.assign(n,r)}return n}}function Td(i,e,t,n){for(const s in i){const r=/^(v|f)s:(#)?([\w-]+)$/.exec(s);if(r){const o=r[2],a=r[3],c=o?a==="decl"?t:n:e;c[s]=c[s]||[],c[s].push(...i[s])}else n[s]=n[s]||[],n[s].push(...i[s])}}function Nv(i,e,t,n){i&&(t["vs:#decl"]=t["vs:#decl"]||[],t["vs:#decl"].push({injection:i,order:Number.MIN_SAFE_INTEGER})),e&&(n["vs:#main-start"]=n["vs:#main-start"]||[],n["vs:#main-start"].push({injection:e,order:Number.MIN_SAFE_INTEGER}))}function $v(i,e,t){i.declarations&&(e["vs:#decl"]=e["vs:#decl"]||[],e["vs:#decl"].push({injection:i.declarations,order:Number.MIN_SAFE_INTEGER})),i.vertexInitialization&&(t["vs:#main-start"]=t["vs:#main-start"]||[],t["vs:#main-start"].push({injection:i.vertexInitialization,order:Number.MIN_SAFE_INTEGER})),i.fragmentInitialization&&(t["fs:#main-start"]=t["fs:#main-start"]||[],t["fs:#main-start"].push({injection:i.fragmentInitialization,order:Number.MIN_SAFE_INTEGER}))}function Uv(i){return{...i.instance?.normalizedInjections.vertex||{},...i.instance?.normalizedInjections.fragment||{}}}function Gv(i){const e=[...i["vs:#decl"]||[],...i["fs:#decl"]||[]];return e.length?{"vs:#decl":e}:{}}function Vv(i,e){return bo(i.vertex,e,"wgsl")+bo(i.fragment,e,"wgsl")}function jv(i={}){let e="";for(const t in i){const n=i[t];(n||Number.isFinite(n))&&(e+=`#define ${t.toUpperCase()} ${i[t]}
`)}return e}function Ld(i,e,t){let n;switch(e){case"vertex":n=i.vs||"";break;case"fragment":n=i.fs||"";break;case"wgsl":n=i.source||"";break;default:ti(!1)}if(!i.name)throw new Error("Shader module must have a name");kb(i,e,{log:t});const s=i.name.toUpperCase().replace(/[^0-9a-z]/gi,"_");let r=`// ----- MODULE ${i.name} ---------------

`;return e!=="wgsl"&&(r+=`#define MODULE_${s}
`),r+=`${n}
`,r}function Wv(i){const e=new Map;for(const t of ei(i,s_)){const n=Number(t.bindingToken),s=Number(t.groupToken);Ca(s,n,t.name),Yt(e,s,n,`application binding "${t.name}"`)}return e}function Hv(i){const e=ei(i,ao),t=new Map;for(const r of e){if(r.bindingToken==="auto")continue;const o=Number(r.bindingToken),a=Number(r.groupToken);Ca(a,o,r.name),Yt(t,a,o,`application binding "${r.name}"`)}const n={sawSupportedBindingDeclaration:e.length>0},s=Yf(i,ao,r=>Xv(r,t,n));if(qf(i)&&!n.sawSupportedBindingDeclaration)throw new Error('Unsupported @binding(auto) declaration form in application WGSL. Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.');return{source:s}}function Yv(i,e,t){const n=[],r={sawSupportedBindingDeclaration:ei(i,Oi).length>0,nextHintedBindingLocation:typeof e.firstBindingSlot=="number"?e.firstBindingSlot:null},o=Yf(i,Oi,a=>qv(a,{module:e,context:t,bindingAssignments:n,relocationState:r}));if(qf(i)&&!r.sawSupportedBindingDeclaration)throw new Error(`Unsupported @binding(auto) declaration form in module "${e.name}". Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.`);return{source:o,bindingAssignments:n}}function qv(i,e){const{module:t,context:n,bindingAssignments:s,relocationState:r}=e,{match:o,bindingToken:a,groupToken:c,name:l}=i,u=Number(c);if(a==="auto"){const d=Cd(u,t.name,l),h=n.bindingRegistry?.get(d),g=h!==void 0?h:Jv(u,n.usedBindingsByGroup,t.name,r.nextHintedBindingLocation??void 0,n.bindingRegistry);return ol(t.name,u,g,l),h!==void 0&&Kv(n.reservedBindingKeysByGroup,u,g,d)?(s.push({moduleName:t.name,name:l,group:u,location:g}),o.replace(/@binding\(\s*auto\s*\)/,`@binding(${g})`)):(Yt(n.usedBindingsByGroup,u,g,`module "${t.name}" binding "${l}"`),n.bindingRegistry?.set(d,g),s.push({moduleName:t.name,name:l,group:u,location:g}),r.nextHintedBindingLocation!==null&&h===void 0&&(r.nextHintedBindingLocation=g+1),o.replace(/@binding\(\s*auto\s*\)/,`@binding(${g})`))}const f=Number(a);return ol(t.name,u,f,l),Yt(n.usedBindingsByGroup,u,f,`module "${t.name}" binding "${l}"`),s.push({moduleName:t.name,name:l,group:u,location:f}),o}function Xv(i,e,t){const{match:n,bindingToken:s,groupToken:r,name:o}=i,a=Number(r);if(s==="auto"){const c=e0(a,e);return Ca(a,c,o),Yt(e,a,c,`application binding "${o}"`),n.replace(/@binding\(\s*auto\s*\)/,`@binding(${c})`)}return t.sawSupportedBindingDeclaration=!0,n}function Zv(i,e,t,n){const s=new Map;if(!e)return s;for(const r of i)for(const o of Qv(r,n)){const a=Cd(o.group,r.name,o.name),c=e.get(a);if(c!==void 0){const l=s.get(o.group)||new Map,u=l.get(c);if(u&&u!==a)throw new Error(`Duplicate WGSL binding reservation for modules "${u}" and "${a}": group ${o.group}, binding ${c}.`);Yt(t,o.group,c,`registered module binding "${a}"`),l.set(c,a),s.set(o.group,l)}}return s}function Kv(i,e,t,n){const s=i.get(e);if(!s)return!1;const r=s.get(t);if(!r)return!1;if(r!==n)throw new Error(`Registered module binding "${n}" collided with "${r}": group ${e}, binding ${t}.`);return!0}function Qv(i,e){const t=[],n=Fi(i.source||"",{defines:e});for(const s of ei(n,Oi))t.push({name:s.name,group:Number(s.groupToken)});return t}function Ca(i,e,t){if(i===0&&e>=zi)throw new Error(`Application binding "${t}" in group 0 uses reserved binding ${e}. Application-owned explicit group-0 bindings must stay below ${zi}.`)}function ol(i,e,t,n){if(e===0&&t<zi)throw new Error(`Module "${i}" binding "${n}" in group 0 uses reserved application binding ${t}. Module-owned explicit group-0 bindings must be ${zi} or higher.`)}function Yt(i,e,t,n){const s=i.get(e)||new Set;if(s.has(t))throw new Error(`Duplicate WGSL binding assignment for ${n}: group ${e}, binding ${t}.`);s.add(t),i.set(e,s)}function Jv(i,e,t,n,s){const r=e.get(i)||new Set,o=new Set,a=`${i}:`,c=`${a}${t}:`;for(const[u,f]of s||[])u.startsWith(c)&&o.add(f);let l=n??(i===0?zi:r.size>0?Math.max(...r)+1:0);for(;r.has(l)||o.has(l);)l++;for(const[u,f]of s||[])f===l&&u.startsWith(a)&&s?.delete(u);return l}function e0(i,e){const t=e.get(i)||new Set;let n=0;for(;t.has(n);)n++;return n}function t0(i){const e=o_(i,Oi);if(!e)return;const t=n0(i,e.index);throw t?new Error(`Unresolved @binding(auto) for module "${t}" binding "${e.name}" remained in assembled WGSL source.`):s0(i,e.index)?new Error(`Unresolved @binding(auto) for application binding "${e.name}" remained in assembled WGSL source.`):new Error(`Unresolved @binding(auto) remained in assembled WGSL source near "${r0(e.match)}".`)}function i0(i){if(i.length===0)return"";let e=`// ----- MODULE WGSL BINDING ASSIGNMENTS ---------------
`;for(const t of i)e+=`// ${t.moduleName}.${t.name} -> @group(${t.group}) @binding(${t.location})
`;return e+=`
`,e}function Cd(i,e,t){return`${i}:${e}:${t}`}function n0(i,e){const t=/^\/\/ ----- MODULE ([^\n]+) ---------------$/gm;let n,s;for(s=t.exec(i);s&&s.index<=e;)n=s[1],s=t.exec(i);return n}function s0(i,e){const t=i.indexOf(La);return t>=0?e>t:!0}function r0(i){return i.replace(/\s+/g," ").trim()}class ce{static defaultShaderAssemblers={};_hookFunctions=[];_defaultModules=[];static getDefaultShaderAssembler(e){return ti(e==="glsl"||e==="wgsl"),e==="wgsl"?(ce.defaultShaderAssemblers.wgsl=ce.defaultShaderAssemblers.wgsl||new qt,ce.defaultShaderAssemblers.wgsl):(ce.defaultShaderAssemblers.glsl=ce.defaultShaderAssemblers.glsl||new Ad,ce.defaultShaderAssemblers.glsl)}addDefaultModule(e){this._defaultModules.find(t=>t.name===(typeof e=="string"?e:e.name))||this._defaultModules.push(e)}removeDefaultModule(e){const t=typeof e=="string"?e:e.name;this._defaultModules=this._defaultModules.filter(n=>n.name!==t)}addShaderHook(e,t){t&&(e=Object.assign(t,{hook:e})),this._hookFunctions.push(e)}_getModuleList(e=[]){const t=new Array(this._defaultModules.length+e.length),n={};let s=0;for(let r=0,o=this._defaultModules.length;r<o;++r){const a=this._defaultModules[r],c=a.name;t[s++]=a,n[c]=!0}for(let r=0,o=e.length;r<o;++r){const a=e[r],c=a.name;n[c]||(t[s++]=a,n[c]=!0)}return t.length=s,Hn(t),t}}class Ad extends ce{shaderLanguage="glsl";assembleGLSLShaderPair(e){const t=this._getModuleList(e.modules),n=this._hookFunctions;return{...Fv({...e,vs:e.vs,fs:e.fs,modules:t,hookFunctions:n}),modules:t}}}class qt extends ce{shaderLanguage="wgsl";_wgslBindingRegistry=new Map;assembleWGSLShader(e){const t=this._getModuleList(e.modules),n=this._hookFunctions,s=qt.getShaderPreprocessorDefines(e,t),r=e.platformInfo.shaderLanguage==="wgsl"&&e.source?Fi(e.source,{defines:s}):e.source,{source:o,getUniforms:a,bindingAssignments:c}=Dv({...e,source:r,defines:s,_bindingRegistry:this._wgslBindingRegistry,modules:t,hookFunctions:n}),l=e.platformInfo.shaderLanguage==="wgsl"?Fi(o,{defines:s}):o;return{source:l,getUniforms:a,modules:t,bindingAssignments:c,bindingTable:Pd(l,c),shaderLayout:Xf(l,{vertexEntryPoint:e.vertexEntryPoint,scanVertexAttributes:e.scanVertexAttributes})}}static getShaderPreprocessorDefines(e,t){return{...qt.getPlatformPreprocessorDefines(e.platformInfo),...t.reduce((n,s)=>(Object.assign(n,s.defines),n),{}),...e.defines}}static getPlatformPreprocessorDefines(e){const t=e.limits||{};return{LUMA_SUPPORTS_VERTEX_STORAGE_BUFFERS:e.type==="webgpu"&&(t.maxStorageBuffersInVertexStage||0)>0,LUMA_FP32_TAN_PRECISION_WORKAROUND:e.type==="webgpu"&&e.gpu.toLowerCase()!=="nvidia"&&e.gpu.toLowerCase()!=="amd",LUMA_FP64_INTEGER_ARITHMETIC:e.type==="webgpu"&&e.gpu.toLowerCase()==="apple"}}}const o0=`out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,a0=`#version 300 es
${o0}`;function c0(i){const{input:e,inputChannels:t,output:n}={};if(!e)return a0;if(!t)throw new Error("inputChannels");const s=l0(t),r=u0(e,t);return`#version 300 es
in ${s} ${e};
out vec4 ${n};
void main() {
  ${n} = ${r};
}`}function l0(i){switch(i){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`invalid channels: ${i}`)}}function u0(i,e){switch(e){case 1:return`vec4(${i}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${i}, 0.0, 1.0)`;case 3:return`vec4(${i}, 1.0)`;case 4:return i;default:throw new Error(`invalid channels: ${e}`)}}const f0={EPSILON:1e-12,debug:!1,precision:4,printTypes:!1,printDegrees:!1,printRowMajor:!0,_cartographicRadians:!1};globalThis.mathgl=globalThis.mathgl||{config:{...f0}};const re=globalThis.mathgl.config;function d0(i,{precision:e=re.precision}={}){return i=h0(i),`${parseFloat(i.toPrecision(e))}`}function mt(i){return Array.isArray(i)||ArrayBuffer.isView(i)&&!(i instanceof DataView)}function H(i,e,t){return p0(i,n=>Math.max(e,Math.min(t,n)))}function Qn(i,e,t){return mt(i)?i.map((n,s)=>Qn(n,e[s],t)):t*e+(1-t)*i}function $t(i,e,t){const n=re.EPSILON;try{if(i===e)return!0;if(mt(i)&&mt(e)){if(i.length!==e.length)return!1;for(let s=0;s<i.length;++s)if(!$t(i[s],e[s]))return!1;return!0}return i&&i.equals?i.equals(e):e&&e.equals?e.equals(i):typeof i=="number"&&typeof e=="number"?Math.abs(i-e)<=re.EPSILON*Math.max(1,Math.abs(i),Math.abs(e)):!1}finally{re.EPSILON=n}}function h0(i){return Math.round(i/re.EPSILON)*re.EPSILON}function g0(i){return i.clone?i.clone():new Array(i.length)}function p0(i,e,t){if(mt(i)){const n=i;t=t||g0(n);for(let s=0;s<t.length&&s<n.length;++s){const r=typeof i=="number"?i:i[s];t[s]=e(r,s,t)}return t}return e(i)}class Aa extends Array{clone(){return new this.constructor().copy(this)}fromArray(e,t=0){for(let n=0;n<this.ELEMENTS;++n)this[n]=e[n+t];return this.check()}toArray(e=[],t=0){for(let n=0;n<this.ELEMENTS;++n)e[t+n]=this[n];return e}toObject(e){return e}from(e){return Array.isArray(e)?this.copy(e):this.fromObject(e)}to(e){return e===this?this:mt(e)?this.toArray(e):this.toObject(e)}toTarget(e){return e?this.to(e):this}toFloat32Array(){return new Float32Array(this)}toString(){return this.formatString(re)}formatString(e){let t="";for(let n=0;n<this.ELEMENTS;++n)t+=(n>0?", ":"")+d0(this[n],e);return`${e.printTypes?this.constructor.name:""}[${t}]`}equals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(!$t(this[t],e[t]))return!1;return!0}exactEquals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(this[t]!==e[t])return!1;return!0}negate(){for(let e=0;e<this.ELEMENTS;++e)this[e]=-this[e];return this.check()}lerp(e,t,n){if(n===void 0)return this.lerp(this,e,t);for(let s=0;s<this.ELEMENTS;++s){const r=e[s],o=typeof t=="number"?t:t[s];this[s]=r+n*(o-r)}return this.check()}min(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.min(e[t],this[t]);return this.check()}max(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.max(e[t],this[t]);return this.check()}clamp(e,t){for(let n=0;n<this.ELEMENTS;++n)this[n]=Math.min(Math.max(this[n],e[n]),t[n]);return this.check()}add(...e){for(const t of e)for(let n=0;n<this.ELEMENTS;++n)this[n]+=t[n];return this.check()}subtract(...e){for(const t of e)for(let n=0;n<this.ELEMENTS;++n)this[n]-=t[n];return this.check()}scale(e){if(typeof e=="number")for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;else for(let t=0;t<this.ELEMENTS&&t<e.length;++t)this[t]*=e[t];return this.check()}multiplyByScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;return this.check()}check(){if(re.debug&&!this.validate())throw new Error(`math.gl: ${this.constructor.name} some fields set to invalid numbers'`);return this}validate(){let e=this.length===this.ELEMENTS;for(let t=0;t<this.ELEMENTS;++t)e=e&&Number.isFinite(this[t]);return e}sub(e){return this.subtract(e)}setScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=e;return this.check()}addScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]+=e;return this.check()}subScalar(e){return this.addScalar(-e)}multiplyScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;return this.check()}divideScalar(e){return this.multiplyByScalar(1/e)}clampScalar(e,t){for(let n=0;n<this.ELEMENTS;++n)this[n]=Math.min(Math.max(this[n],e),t);return this.check()}get elements(){return this}}function m0(i,e){if(i.length!==e)return!1;for(let t=0;t<i.length;++t)if(!Number.isFinite(i[t]))return!1;return!0}function V(i){if(!Number.isFinite(i))throw new Error(`Invalid number ${JSON.stringify(i)}`);return i}function Mn(i,e,t=""){if(re.debug&&!m0(i,e))throw new Error(`math.gl: ${t} some fields set to invalid numbers'`);return i}function al(i,e){if(!i)throw new Error(`math.gl assertion ${e}`)}class Md extends Aa{get x(){return this[0]}set x(e){this[0]=V(e)}get y(){return this[1]}set y(e){this[1]=V(e)}len(){return Math.sqrt(this.lengthSquared())}magnitude(){return this.len()}lengthSquared(){let e=0;for(let t=0;t<this.ELEMENTS;++t)e+=this[t]*this[t];return e}magnitudeSquared(){return this.lengthSquared()}distance(e){return Math.sqrt(this.distanceSquared(e))}distanceSquared(e){let t=0;for(let n=0;n<this.ELEMENTS;++n){const s=this[n]-e[n];t+=s*s}return V(t)}dot(e){let t=0;for(let n=0;n<this.ELEMENTS;++n)t+=this[n]*e[n];return V(t)}normalize(){const e=this.magnitude();if(e!==0)for(let t=0;t<this.ELEMENTS;++t)this[t]/=e;return this.check()}multiply(...e){for(const t of e)for(let n=0;n<this.ELEMENTS;++n)this[n]*=t[n];return this.check()}divide(...e){for(const t of e)for(let n=0;n<this.ELEMENTS;++n)this[n]/=t[n];return this.check()}lengthSq(){return this.lengthSquared()}distanceTo(e){return this.distance(e)}distanceToSquared(e){return this.distanceSquared(e)}getComponent(e){return al(e>=0&&e<this.ELEMENTS,"index is out of range"),V(this[e])}setComponent(e,t){return al(e>=0&&e<this.ELEMENTS,"index is out of range"),this[e]=t,this.check()}addVectors(e,t){return this.copy(e).add(t)}subVectors(e,t){return this.copy(e).subtract(t)}multiplyVectors(e,t){return this.copy(e).multiply(t)}addScaledVector(e,t){return this.add(new this.constructor(e).multiplyScalar(t))}}const wi=1e-6;let be=typeof Float32Array<"u"?Float32Array:Array;function _0(){const i=new be(2);return be!=Float32Array&&(i[0]=0,i[1]=0),i}function cl(i,e,t){return i[0]=e[0]+t[0],i[1]=e[1]+t[1],i}function y0(i,e,t){return i[0]=e[0]-t[0],i[1]=e[1]-t[1],i}function b0(i,e){return i[0]=-e[0],i[1]=-e[1],i}function Id(i,e,t,n){const s=e[0],r=e[1];return i[0]=s+n*(t[0]-s),i[1]=r+n*(t[1]-r),i}function v0(i,e,t){const n=e[0],s=e[1];return i[0]=t[0]*n+t[4]*s+t[12],i[1]=t[1]*n+t[5]*s+t[13],i}const w0=y0;(function(){const i=_0();return function(e,t,n,s,r,o){let a,c;for(t||(t=2),n||(n=0),s?c=Math.min(s*t+n,e.length):c=e.length,a=n;a<c;a+=t)i[0]=e[a],i[1]=e[a+1],r(i,i,o),e[a]=i[0],e[a+1]=i[1];return e}})();function x0(i,e,t){const n=e[0],s=e[1],r=t[3]*n+t[7]*s||1;return i[0]=(t[0]*n+t[4]*s)/r,i[1]=(t[1]*n+t[5]*s)/r,i}function Rd(i,e,t){const n=e[0],s=e[1],r=e[2],o=t[3]*n+t[7]*s+t[11]*r||1;return i[0]=(t[0]*n+t[4]*s+t[8]*r)/o,i[1]=(t[1]*n+t[5]*s+t[9]*r)/o,i[2]=(t[2]*n+t[6]*s+t[10]*r)/o,i}function P0(i,e,t){const n=e[0],s=e[1];return i[0]=t[0]*n+t[2]*s,i[1]=t[1]*n+t[3]*s,i[2]=e[2],i}function E0(i,e,t){const n=e[0],s=e[1];return i[0]=t[0]*n+t[2]*s,i[1]=t[1]*n+t[3]*s,i[2]=e[2],i[3]=e[3],i}function S0(i,e,t){const n=e[0],s=e[1],r=e[2];return i[0]=t[0]*n+t[3]*s+t[6]*r,i[1]=t[1]*n+t[4]*s+t[7]*r,i[2]=t[2]*n+t[5]*s+t[8]*r,i[3]=e[3],i}function Od(){const i=new be(3);return be!=Float32Array&&(i[0]=0,i[1]=0,i[2]=0),i}function T0(i){const e=i[0],t=i[1],n=i[2];return Math.sqrt(e*e+t*t+n*n)}function ll(i,e,t){const n=new be(3);return n[0]=i,n[1]=e,n[2]=t,n}function L0(i,e,t){return i[0]=e[0]-t[0],i[1]=e[1]-t[1],i[2]=e[2]-t[2],i}function C0(i,e,t){return i[0]=e[0]*t[0],i[1]=e[1]*t[1],i[2]=e[2]*t[2],i}function A0(i,e,t,n){return i[0]=e[0]+t[0]*n,i[1]=e[1]+t[1]*n,i[2]=e[2]+t[2]*n,i}function M0(i,e){const t=e[0]-i[0],n=e[1]-i[1],s=e[2]-i[2];return Math.sqrt(t*t+n*n+s*s)}function I0(i){const e=i[0],t=i[1],n=i[2];return e*e+t*t+n*n}function R0(i,e){return i[0]=-e[0],i[1]=-e[1],i[2]=-e[2],i}function Bd(i,e){const t=e[0],n=e[1],s=e[2];let r=t*t+n*n+s*s;return r>0&&(r=1/Math.sqrt(r)),i[0]=e[0]*r,i[1]=e[1]*r,i[2]=e[2]*r,i}function xi(i,e){return i[0]*e[0]+i[1]*e[1]+i[2]*e[2]}function ut(i,e,t){const n=e[0],s=e[1],r=e[2],o=t[0],a=t[1],c=t[2];return i[0]=s*c-r*a,i[1]=r*o-n*c,i[2]=n*a-s*o,i}function O0(i,e,t,n){const s=e[0],r=e[1],o=e[2];return i[0]=s+n*(t[0]-s),i[1]=r+n*(t[1]-r),i[2]=o+n*(t[2]-o),i}function Ma(i,e,t){const n=e[0],s=e[1],r=e[2];let o=t[3]*n+t[7]*s+t[11]*r+t[15];return o=o||1,i[0]=(t[0]*n+t[4]*s+t[8]*r+t[12])/o,i[1]=(t[1]*n+t[5]*s+t[9]*r+t[13])/o,i[2]=(t[2]*n+t[6]*s+t[10]*r+t[14])/o,i}function B0(i,e,t){const n=e[0],s=e[1],r=e[2];return i[0]=n*t[0]+s*t[3]+r*t[6],i[1]=n*t[1]+s*t[4]+r*t[7],i[2]=n*t[2]+s*t[5]+r*t[8],i}function Ia(i,e,t){const n=t[0],s=t[1],r=t[2],o=t[3],a=e[0],c=e[1],l=e[2];let u=s*l-r*c,f=r*a-n*l,d=n*c-s*a,h=s*d-r*f,g=r*u-n*d,p=n*f-s*u;const m=o*2;return u*=m,f*=m,d*=m,h*=2,g*=2,p*=2,i[0]=a+u+h,i[1]=c+f+g,i[2]=l+d+p,i}function k0(i,e,t,n){const s=[],r=[];return s[0]=e[0]-t[0],s[1]=e[1]-t[1],s[2]=e[2]-t[2],r[0]=s[0],r[1]=s[1]*Math.cos(n)-s[2]*Math.sin(n),r[2]=s[1]*Math.sin(n)+s[2]*Math.cos(n),i[0]=r[0]+t[0],i[1]=r[1]+t[1],i[2]=r[2]+t[2],i}function D0(i,e,t,n){const s=[],r=[];return s[0]=e[0]-t[0],s[1]=e[1]-t[1],s[2]=e[2]-t[2],r[0]=s[2]*Math.sin(n)+s[0]*Math.cos(n),r[1]=s[1],r[2]=s[2]*Math.cos(n)-s[0]*Math.sin(n),i[0]=r[0]+t[0],i[1]=r[1]+t[1],i[2]=r[2]+t[2],i}function F0(i,e,t,n){const s=[],r=[];return s[0]=e[0]-t[0],s[1]=e[1]-t[1],s[2]=e[2]-t[2],r[0]=s[0]*Math.cos(n)-s[1]*Math.sin(n),r[1]=s[0]*Math.sin(n)+s[1]*Math.cos(n),r[2]=s[2],i[0]=r[0]+t[0],i[1]=r[1]+t[1],i[2]=r[2]+t[2],i}function z0(i,e){const t=i[0],n=i[1],s=i[2],r=e[0],o=e[1],a=e[2],c=Math.sqrt((t*t+n*n+s*s)*(r*r+o*o+a*a)),l=c&&xi(i,e)/c;return Math.acos(Math.min(Math.max(l,-1),1))}const Jn=L0,ul=M0,kd=T0,ar=I0;(function(){const i=Od();return function(e,t,n,s,r,o){let a,c;for(t||(t=3),n||(n=0),s?c=Math.min(s*t+n,e.length):c=e.length,a=n;a<c;a+=t)i[0]=e[a],i[1]=e[a+1],i[2]=e[a+2],r(i,i,o),e[a]=i[0],e[a+1]=i[1],e[a+2]=i[2];return e}})();const cr=[0,0,0];let yn;class ke extends Md{static get ZERO(){return yn||(yn=new ke(0,0,0),Object.freeze(yn)),yn}constructor(e=0,t=0,n=0){super(-0,-0,-0),arguments.length===1&&mt(e)?this.copy(e):(re.debug&&(V(e),V(t),V(n)),this[0]=e,this[1]=t,this[2]=n)}set(e,t,n){return this[0]=e,this[1]=t,this[2]=n,this.check()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this.check()}fromObject(e){return re.debug&&(V(e.x),V(e.y),V(e.z)),this[0]=e.x,this[1]=e.y,this[2]=e.z,this.check()}toObject(e){return e.x=this[0],e.y=this[1],e.z=this[2],e}get ELEMENTS(){return 3}get z(){return this[2]}set z(e){this[2]=V(e)}angle(e){return z0(this,e)}cross(e){return ut(this,this,e),this.check()}rotateX({radians:e,origin:t=cr}){return k0(this,this,t,e),this.check()}rotateY({radians:e,origin:t=cr}){return D0(this,this,t,e),this.check()}rotateZ({radians:e,origin:t=cr}){return F0(this,this,t,e),this.check()}transform(e){return this.transformAsPoint(e)}transformAsPoint(e){return Ma(this,this,e),this.check()}transformAsVector(e){return Rd(this,this,e),this.check()}transformByMatrix3(e){return B0(this,this,e),this.check()}transformByMatrix2(e){return P0(this,this,e),this.check()}transformByQuaternion(e){return Ia(this,this,e),this.check()}}let bn;class Ra extends Md{static get ZERO(){return bn||(bn=new Ra(0,0,0,0),Object.freeze(bn)),bn}constructor(e=0,t=0,n=0,s=0){super(-0,-0,-0,-0),mt(e)&&arguments.length===1?this.copy(e):(re.debug&&(V(e),V(t),V(n),V(s)),this[0]=e,this[1]=t,this[2]=n,this[3]=s)}set(e,t,n,s){return this[0]=e,this[1]=t,this[2]=n,this[3]=s,this.check()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this.check()}fromObject(e){return re.debug&&(V(e.x),V(e.y),V(e.z),V(e.w)),this[0]=e.x,this[1]=e.y,this[2]=e.z,this[3]=e.w,this}toObject(e){return e.x=this[0],e.y=this[1],e.z=this[2],e.w=this[3],e}get ELEMENTS(){return 4}get z(){return this[2]}set z(e){this[2]=V(e)}get w(){return this[3]}set w(e){this[3]=V(e)}transform(e){return Ma(this,this,e),this.check()}transformByMatrix3(e){return S0(this,this,e),this.check()}transformByMatrix2(e){return E0(this,this,e),this.check()}transformByQuaternion(e){return Ia(this,this,e),this.check()}applyMatrix4(e){return e.transform(this,this),this}}class N0 extends Aa{toString(){let e="[";if(re.printRowMajor){e+="row-major:";for(let t=0;t<this.RANK;++t)for(let n=0;n<this.RANK;++n)e+=` ${this[n*this.RANK+t]}`}else{e+="column-major:";for(let t=0;t<this.ELEMENTS;++t)e+=` ${this[t]}`}return e+="]",e}getElementIndex(e,t){return t*this.RANK+e}getElement(e,t){return this[t*this.RANK+e]}setElement(e,t,n){return this[t*this.RANK+e]=V(n),this}getColumn(e,t=new Array(this.RANK).fill(-0)){const n=e*this.RANK;for(let s=0;s<this.RANK;++s)t[s]=this[n+s];return t}setColumn(e,t){const n=e*this.RANK;for(let s=0;s<this.RANK;++s)this[n+s]=t[s];return this}}function $0(){const i=new be(9);return be!=Float32Array&&(i[1]=0,i[2]=0,i[3]=0,i[5]=0,i[6]=0,i[7]=0),i[0]=1,i[4]=1,i[8]=1,i}function U0(i){return i[0]=1,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=1,i[6]=0,i[7]=0,i[8]=0,i[9]=0,i[10]=1,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,i}function G0(i,e){if(i===e){const t=e[1],n=e[2],s=e[3],r=e[6],o=e[7],a=e[11];i[1]=e[4],i[2]=e[8],i[3]=e[12],i[4]=t,i[6]=e[9],i[7]=e[13],i[8]=n,i[9]=r,i[11]=e[14],i[12]=s,i[13]=o,i[14]=a}else i[0]=e[0],i[1]=e[4],i[2]=e[8],i[3]=e[12],i[4]=e[1],i[5]=e[5],i[6]=e[9],i[7]=e[13],i[8]=e[2],i[9]=e[6],i[10]=e[10],i[11]=e[14],i[12]=e[3],i[13]=e[7],i[14]=e[11],i[15]=e[15];return i}function vo(i,e){const t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],f=e[9],d=e[10],h=e[11],g=e[12],p=e[13],m=e[14],_=e[15],b=t*a-n*o,y=t*c-s*o,v=t*l-r*o,w=n*c-s*a,x=n*l-r*a,S=s*l-r*c,T=u*p-f*g,L=u*m-d*g,E=u*_-h*g,R=f*m-d*p,M=f*_-h*p,C=d*_-h*m;let I=b*C-y*M+v*R+w*E-x*L+S*T;return I?(I=1/I,i[0]=(a*C-c*M+l*R)*I,i[1]=(s*M-n*C-r*R)*I,i[2]=(p*S-m*x+_*w)*I,i[3]=(d*x-f*S-h*w)*I,i[4]=(c*E-o*C-l*L)*I,i[5]=(t*C-s*E+r*L)*I,i[6]=(m*v-g*S-_*y)*I,i[7]=(u*S-d*v+h*y)*I,i[8]=(o*M-a*E+l*T)*I,i[9]=(n*E-t*M-r*T)*I,i[10]=(g*x-p*v+_*b)*I,i[11]=(f*v-u*x-h*b)*I,i[12]=(a*L-o*R-c*T)*I,i[13]=(t*R-n*L+s*T)*I,i[14]=(p*y-g*w-m*b)*I,i[15]=(u*w-f*y+d*b)*I,i):null}function V0(i){const e=i[0],t=i[1],n=i[2],s=i[3],r=i[4],o=i[5],a=i[6],c=i[7],l=i[8],u=i[9],f=i[10],d=i[11],h=i[12],g=i[13],p=i[14],m=i[15],_=e*o-t*r,b=e*a-n*r,y=t*a-n*o,v=l*g-u*h,w=l*p-f*h,x=u*p-f*g,S=e*x-t*w+n*v,T=r*x-o*w+a*v,L=l*y-u*b+f*_,E=h*y-g*b+p*_;return c*S-s*T+m*L-d*E}function ft(i,e,t){const n=e[0],s=e[1],r=e[2],o=e[3],a=e[4],c=e[5],l=e[6],u=e[7],f=e[8],d=e[9],h=e[10],g=e[11],p=e[12],m=e[13],_=e[14],b=e[15];let y=t[0],v=t[1],w=t[2],x=t[3];return i[0]=y*n+v*a+w*f+x*p,i[1]=y*s+v*c+w*d+x*m,i[2]=y*r+v*l+w*h+x*_,i[3]=y*o+v*u+w*g+x*b,y=t[4],v=t[5],w=t[6],x=t[7],i[4]=y*n+v*a+w*f+x*p,i[5]=y*s+v*c+w*d+x*m,i[6]=y*r+v*l+w*h+x*_,i[7]=y*o+v*u+w*g+x*b,y=t[8],v=t[9],w=t[10],x=t[11],i[8]=y*n+v*a+w*f+x*p,i[9]=y*s+v*c+w*d+x*m,i[10]=y*r+v*l+w*h+x*_,i[11]=y*o+v*u+w*g+x*b,y=t[12],v=t[13],w=t[14],x=t[15],i[12]=y*n+v*a+w*f+x*p,i[13]=y*s+v*c+w*d+x*m,i[14]=y*r+v*l+w*h+x*_,i[15]=y*o+v*u+w*g+x*b,i}function es(i,e,t){const n=t[0],s=t[1],r=t[2];let o,a,c,l,u,f,d,h,g,p,m,_;return e===i?(i[12]=e[0]*n+e[4]*s+e[8]*r+e[12],i[13]=e[1]*n+e[5]*s+e[9]*r+e[13],i[14]=e[2]*n+e[6]*s+e[10]*r+e[14],i[15]=e[3]*n+e[7]*s+e[11]*r+e[15]):(o=e[0],a=e[1],c=e[2],l=e[3],u=e[4],f=e[5],d=e[6],h=e[7],g=e[8],p=e[9],m=e[10],_=e[11],i[0]=o,i[1]=a,i[2]=c,i[3]=l,i[4]=u,i[5]=f,i[6]=d,i[7]=h,i[8]=g,i[9]=p,i[10]=m,i[11]=_,i[12]=o*n+u*s+g*r+e[12],i[13]=a*n+f*s+p*r+e[13],i[14]=c*n+d*s+m*r+e[14],i[15]=l*n+h*s+_*r+e[15]),i}function Oa(i,e,t){const n=t[0],s=t[1],r=t[2];return i[0]=e[0]*n,i[1]=e[1]*n,i[2]=e[2]*n,i[3]=e[3]*n,i[4]=e[4]*s,i[5]=e[5]*s,i[6]=e[6]*s,i[7]=e[7]*s,i[8]=e[8]*r,i[9]=e[9]*r,i[10]=e[10]*r,i[11]=e[11]*r,i[12]=e[12],i[13]=e[13],i[14]=e[14],i[15]=e[15],i}function j0(i,e,t,n){let s=n[0],r=n[1],o=n[2],a=Math.sqrt(s*s+r*r+o*o),c,l,u,f,d,h,g,p,m,_,b,y,v,w,x,S,T,L,E,R,M,C,I,W;return a<wi?null:(a=1/a,s*=a,r*=a,o*=a,l=Math.sin(t),c=Math.cos(t),u=1-c,f=e[0],d=e[1],h=e[2],g=e[3],p=e[4],m=e[5],_=e[6],b=e[7],y=e[8],v=e[9],w=e[10],x=e[11],S=s*s*u+c,T=r*s*u+o*l,L=o*s*u-r*l,E=s*r*u-o*l,R=r*r*u+c,M=o*r*u+s*l,C=s*o*u+r*l,I=r*o*u-s*l,W=o*o*u+c,i[0]=f*S+p*T+y*L,i[1]=d*S+m*T+v*L,i[2]=h*S+_*T+w*L,i[3]=g*S+b*T+x*L,i[4]=f*E+p*R+y*M,i[5]=d*E+m*R+v*M,i[6]=h*E+_*R+w*M,i[7]=g*E+b*R+x*M,i[8]=f*C+p*I+y*W,i[9]=d*C+m*I+v*W,i[10]=h*C+_*I+w*W,i[11]=g*C+b*I+x*W,e!==i&&(i[12]=e[12],i[13]=e[13],i[14]=e[14],i[15]=e[15]),i)}function Dd(i,e,t){const n=Math.sin(t),s=Math.cos(t),r=e[4],o=e[5],a=e[6],c=e[7],l=e[8],u=e[9],f=e[10],d=e[11];return e!==i&&(i[0]=e[0],i[1]=e[1],i[2]=e[2],i[3]=e[3],i[12]=e[12],i[13]=e[13],i[14]=e[14],i[15]=e[15]),i[4]=r*s+l*n,i[5]=o*s+u*n,i[6]=a*s+f*n,i[7]=c*s+d*n,i[8]=l*s-r*n,i[9]=u*s-o*n,i[10]=f*s-a*n,i[11]=d*s-c*n,i}function W0(i,e,t){const n=Math.sin(t),s=Math.cos(t),r=e[0],o=e[1],a=e[2],c=e[3],l=e[8],u=e[9],f=e[10],d=e[11];return e!==i&&(i[4]=e[4],i[5]=e[5],i[6]=e[6],i[7]=e[7],i[12]=e[12],i[13]=e[13],i[14]=e[14],i[15]=e[15]),i[0]=r*s-l*n,i[1]=o*s-u*n,i[2]=a*s-f*n,i[3]=c*s-d*n,i[8]=r*n+l*s,i[9]=o*n+u*s,i[10]=a*n+f*s,i[11]=c*n+d*s,i}function Fd(i,e,t){const n=Math.sin(t),s=Math.cos(t),r=e[0],o=e[1],a=e[2],c=e[3],l=e[4],u=e[5],f=e[6],d=e[7];return e!==i&&(i[8]=e[8],i[9]=e[9],i[10]=e[10],i[11]=e[11],i[12]=e[12],i[13]=e[13],i[14]=e[14],i[15]=e[15]),i[0]=r*s+l*n,i[1]=o*s+u*n,i[2]=a*s+f*n,i[3]=c*s+d*n,i[4]=l*s-r*n,i[5]=u*s-o*n,i[6]=f*s-a*n,i[7]=d*s-c*n,i}function H0(i,e){const t=e[0],n=e[1],s=e[2],r=e[3],o=t+t,a=n+n,c=s+s,l=t*o,u=n*o,f=n*a,d=s*o,h=s*a,g=s*c,p=r*o,m=r*a,_=r*c;return i[0]=1-f-g,i[1]=u+_,i[2]=d-m,i[3]=0,i[4]=u-_,i[5]=1-l-g,i[6]=h+p,i[7]=0,i[8]=d+m,i[9]=h-p,i[10]=1-l-f,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,i}function Y0(i,e,t,n,s,r,o){const a=1/(t-e),c=1/(s-n),l=1/(r-o);return i[0]=r*2*a,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=r*2*c,i[6]=0,i[7]=0,i[8]=(t+e)*a,i[9]=(s+n)*c,i[10]=(o+r)*l,i[11]=-1,i[12]=0,i[13]=0,i[14]=o*r*2*l,i[15]=0,i}function q0(i,e,t,n,s){const r=1/Math.tan(e/2);if(i[0]=r/t,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=r,i[6]=0,i[7]=0,i[8]=0,i[9]=0,i[11]=-1,i[12]=0,i[13]=0,i[15]=0,s!=null&&s!==1/0){const o=1/(n-s);i[10]=(s+n)*o,i[14]=2*s*n*o}else i[10]=-1,i[14]=-2*n;return i}const X0=q0;function Z0(i,e,t,n,s,r,o){const a=1/(e-t),c=1/(n-s),l=1/(r-o);return i[0]=-2*a,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=-2*c,i[6]=0,i[7]=0,i[8]=0,i[9]=0,i[10]=2*l,i[11]=0,i[12]=(e+t)*a,i[13]=(s+n)*c,i[14]=(o+r)*l,i[15]=1,i}const K0=Z0;function Q0(i,e,t,n){let s,r,o,a,c,l,u,f,d,h;const g=e[0],p=e[1],m=e[2],_=n[0],b=n[1],y=n[2],v=t[0],w=t[1],x=t[2];return Math.abs(g-v)<wi&&Math.abs(p-w)<wi&&Math.abs(m-x)<wi?U0(i):(f=g-v,d=p-w,h=m-x,s=1/Math.sqrt(f*f+d*d+h*h),f*=s,d*=s,h*=s,r=b*h-y*d,o=y*f-_*h,a=_*d-b*f,s=Math.sqrt(r*r+o*o+a*a),s?(s=1/s,r*=s,o*=s,a*=s):(r=0,o=0,a=0),c=d*a-h*o,l=h*r-f*a,u=f*o-d*r,s=Math.sqrt(c*c+l*l+u*u),s?(s=1/s,c*=s,l*=s,u*=s):(c=0,l=0,u=0),i[0]=r,i[1]=c,i[2]=f,i[3]=0,i[4]=o,i[5]=l,i[6]=d,i[7]=0,i[8]=a,i[9]=u,i[10]=h,i[11]=0,i[12]=-(r*g+o*p+a*m),i[13]=-(c*g+l*p+u*m),i[14]=-(f*g+d*p+h*m),i[15]=1,i)}function J0(){const i=new be(4);return be!=Float32Array&&(i[0]=0,i[1]=0,i[2]=0,i[3]=0),i}function ew(i,e,t){return i[0]=e[0]+t[0],i[1]=e[1]+t[1],i[2]=e[2]+t[2],i[3]=e[3]+t[3],i}function Ba(i,e,t){return i[0]=e[0]*t,i[1]=e[1]*t,i[2]=e[2]*t,i[3]=e[3]*t,i}function tw(i){const e=i[0],t=i[1],n=i[2],s=i[3];return Math.sqrt(e*e+t*t+n*n+s*s)}function iw(i){const e=i[0],t=i[1],n=i[2],s=i[3];return e*e+t*t+n*n+s*s}function nw(i,e){const t=e[0],n=e[1],s=e[2],r=e[3];let o=t*t+n*n+s*s+r*r;return o>0&&(o=1/Math.sqrt(o)),i[0]=t*o,i[1]=n*o,i[2]=s*o,i[3]=r*o,i}function sw(i,e){return i[0]*e[0]+i[1]*e[1]+i[2]*e[2]+i[3]*e[3]}function rw(i,e,t,n){const s=e[0],r=e[1],o=e[2],a=e[3];return i[0]=s+n*(t[0]-s),i[1]=r+n*(t[1]-r),i[2]=o+n*(t[2]-o),i[3]=a+n*(t[3]-a),i}function Et(i,e,t){const n=e[0],s=e[1],r=e[2],o=e[3];return i[0]=t[0]*n+t[4]*s+t[8]*r+t[12]*o,i[1]=t[1]*n+t[5]*s+t[9]*r+t[13]*o,i[2]=t[2]*n+t[6]*s+t[10]*r+t[14]*o,i[3]=t[3]*n+t[7]*s+t[11]*r+t[15]*o,i}function ow(i,e,t){const n=e[0],s=e[1],r=e[2],o=t[0],a=t[1],c=t[2],l=t[3],u=l*n+a*r-c*s,f=l*s+c*n-o*r,d=l*r+o*s-a*n,h=-o*n-a*s-c*r;return i[0]=u*l+h*-o+f*-c-d*-a,i[1]=f*l+h*-a+d*-o-u*-c,i[2]=d*l+h*-c+u*-a-f*-o,i[3]=e[3],i}(function(){const i=J0();return function(e,t,n,s,r,o){let a,c;for(t||(t=4),n||(n=0),s?c=Math.min(s*t+n,e.length):c=e.length,a=n;a<c;a+=t)i[0]=e[a],i[1]=e[a+1],i[2]=e[a+2],i[3]=e[a+3],r(i,i,o),e[a]=i[0],e[a+1]=i[1],e[a+2]=i[2],e[a+3]=i[3];return e}})();var wo;(function(i){i[i.COL0ROW0=0]="COL0ROW0",i[i.COL0ROW1=1]="COL0ROW1",i[i.COL0ROW2=2]="COL0ROW2",i[i.COL0ROW3=3]="COL0ROW3",i[i.COL1ROW0=4]="COL1ROW0",i[i.COL1ROW1=5]="COL1ROW1",i[i.COL1ROW2=6]="COL1ROW2",i[i.COL1ROW3=7]="COL1ROW3",i[i.COL2ROW0=8]="COL2ROW0",i[i.COL2ROW1=9]="COL2ROW1",i[i.COL2ROW2=10]="COL2ROW2",i[i.COL2ROW3=11]="COL2ROW3",i[i.COL3ROW0=12]="COL3ROW0",i[i.COL3ROW1=13]="COL3ROW1",i[i.COL3ROW2=14]="COL3ROW2",i[i.COL3ROW3=15]="COL3ROW3"})(wo||(wo={}));const aw=45*Math.PI/180,cw=1,lr=.1,ur=500,lw=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);class ve extends N0{static get IDENTITY(){return fw()}static get ZERO(){return uw()}get ELEMENTS(){return 16}get RANK(){return 4}get INDICES(){return wo}constructor(e){super(-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0),arguments.length===1&&Array.isArray(e)?this.copy(e):this.identity()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this[4]=e[4],this[5]=e[5],this[6]=e[6],this[7]=e[7],this[8]=e[8],this[9]=e[9],this[10]=e[10],this[11]=e[11],this[12]=e[12],this[13]=e[13],this[14]=e[14],this[15]=e[15],this.check()}set(e,t,n,s,r,o,a,c,l,u,f,d,h,g,p,m){return this[0]=e,this[1]=t,this[2]=n,this[3]=s,this[4]=r,this[5]=o,this[6]=a,this[7]=c,this[8]=l,this[9]=u,this[10]=f,this[11]=d,this[12]=h,this[13]=g,this[14]=p,this[15]=m,this.check()}setRowMajor(e,t,n,s,r,o,a,c,l,u,f,d,h,g,p,m){return this[0]=e,this[1]=r,this[2]=l,this[3]=h,this[4]=t,this[5]=o,this[6]=u,this[7]=g,this[8]=n,this[9]=a,this[10]=f,this[11]=p,this[12]=s,this[13]=c,this[14]=d,this[15]=m,this.check()}toRowMajor(e){return e[0]=this[0],e[1]=this[4],e[2]=this[8],e[3]=this[12],e[4]=this[1],e[5]=this[5],e[6]=this[9],e[7]=this[13],e[8]=this[2],e[9]=this[6],e[10]=this[10],e[11]=this[14],e[12]=this[3],e[13]=this[7],e[14]=this[11],e[15]=this[15],e}identity(){return this.copy(lw)}fromObject(e){return this.check()}fromQuaternion(e){return H0(this,e),this.check()}frustum(e){const{left:t,right:n,bottom:s,top:r,near:o=lr,far:a=ur}=e;return a===1/0?dw(this,t,n,s,r,o):Y0(this,t,n,s,r,o,a),this.check()}lookAt(e){const{eye:t,center:n=[0,0,0],up:s=[0,1,0]}=e;return Q0(this,t,n,s),this.check()}ortho(e){const{left:t,right:n,bottom:s,top:r,near:o=lr,far:a=ur}=e;return K0(this,t,n,s,r,o,a),this.check()}orthographic(e){const{fovy:t=aw,aspect:n=cw,focalDistance:s=1,near:r=lr,far:o=ur}=e;fl(t);const a=t/2,c=s*Math.tan(a),l=c*n;return this.ortho({left:-l,right:l,bottom:-c,top:c,near:r,far:o})}perspective(e){const{fovy:t=45*Math.PI/180,aspect:n=1,near:s=.1,far:r=500}=e;return fl(t),X0(this,t,n,s,r),this.check()}determinant(){return V0(this)}getScale(e=[-0,-0,-0]){return e[0]=Math.sqrt(this[0]*this[0]+this[1]*this[1]+this[2]*this[2]),e[1]=Math.sqrt(this[4]*this[4]+this[5]*this[5]+this[6]*this[6]),e[2]=Math.sqrt(this[8]*this[8]+this[9]*this[9]+this[10]*this[10]),e}getTranslation(e=[-0,-0,-0]){return e[0]=this[12],e[1]=this[13],e[2]=this[14],e}getRotation(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];const n=this.getScale(t),s=1/n[0],r=1/n[1],o=1/n[2];return e[0]=this[0]*s,e[1]=this[1]*r,e[2]=this[2]*o,e[3]=0,e[4]=this[4]*s,e[5]=this[5]*r,e[6]=this[6]*o,e[7]=0,e[8]=this[8]*s,e[9]=this[9]*r,e[10]=this[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}getRotationMatrix3(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];const n=this.getScale(t),s=1/n[0],r=1/n[1],o=1/n[2];return e[0]=this[0]*s,e[1]=this[1]*r,e[2]=this[2]*o,e[3]=this[4]*s,e[4]=this[5]*r,e[5]=this[6]*o,e[6]=this[8]*s,e[7]=this[9]*r,e[8]=this[10]*o,e}transpose(){return G0(this,this),this.check()}invert(){return vo(this,this),this.check()}multiplyLeft(e){return ft(this,e,this),this.check()}multiplyRight(e){return ft(this,this,e),this.check()}rotateX(e){return Dd(this,this,e),this.check()}rotateY(e){return W0(this,this,e),this.check()}rotateZ(e){return Fd(this,this,e),this.check()}rotateXYZ(e){return this.rotateX(e[0]).rotateY(e[1]).rotateZ(e[2])}rotateAxis(e,t){return j0(this,this,e,t),this.check()}scale(e){return Oa(this,this,Array.isArray(e)?e:[e,e,e]),this.check()}translate(e){return es(this,this,e),this.check()}transform(e,t){return e.length===4?(t=Et(t||[-0,-0,-0,-0],e,this),Mn(t,4),t):this.transformAsPoint(e,t)}transformAsPoint(e,t){const{length:n}=e;let s;switch(n){case 2:s=v0(t||[-0,-0],e,this);break;case 3:s=Ma(t||[-0,-0,-0],e,this);break;default:throw new Error("Illegal vector")}return Mn(s,e.length),s}transformAsVector(e,t){let n;switch(e.length){case 2:n=x0(t||[-0,-0],e,this);break;case 3:n=Rd(t||[-0,-0,-0],e,this);break;default:throw new Error("Illegal vector")}return Mn(n,e.length),n}transformPoint(e,t){return this.transformAsPoint(e,t)}transformVector(e,t){return this.transformAsPoint(e,t)}transformDirection(e,t){return this.transformAsVector(e,t)}makeRotationX(e){return this.identity().rotateX(e)}makeTranslation(e,t,n){return this.identity().translate([e,t,n])}}let vn,wn;function uw(){return vn||(vn=new ve([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),Object.freeze(vn)),vn}function fw(){return wn||(wn=new ve,Object.freeze(wn)),wn}function fl(i){if(i>Math.PI*2)throw Error("expected radians")}function dw(i,e,t,n,s,r){const o=2*r/(t-e),a=2*r/(s-n),c=(t+e)/(t-e),l=(s+n)/(s-n),u=-1,f=-1,d=-2*r;return i[0]=o,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=a,i[6]=0,i[7]=0,i[8]=c,i[9]=l,i[10]=u,i[11]=f,i[12]=0,i[13]=0,i[14]=d,i[15]=0,i}function dl(){const i=new be(4);return be!=Float32Array&&(i[0]=0,i[1]=0,i[2]=0),i[3]=1,i}function hw(i){return i[0]=0,i[1]=0,i[2]=0,i[3]=1,i}function zd(i,e,t){t=t*.5;const n=Math.sin(t);return i[0]=n*e[0],i[1]=n*e[1],i[2]=n*e[2],i[3]=Math.cos(t),i}function hl(i,e,t){const n=e[0],s=e[1],r=e[2],o=e[3],a=t[0],c=t[1],l=t[2],u=t[3];return i[0]=n*u+o*a+s*l-r*c,i[1]=s*u+o*c+r*a-n*l,i[2]=r*u+o*l+n*c-s*a,i[3]=o*u-n*a-s*c-r*l,i}function gw(i,e,t){t*=.5;const n=e[0],s=e[1],r=e[2],o=e[3],a=Math.sin(t),c=Math.cos(t);return i[0]=n*c+o*a,i[1]=s*c+r*a,i[2]=r*c-s*a,i[3]=o*c-n*a,i}function pw(i,e,t){t*=.5;const n=e[0],s=e[1],r=e[2],o=e[3],a=Math.sin(t),c=Math.cos(t);return i[0]=n*c-r*a,i[1]=s*c+o*a,i[2]=r*c+n*a,i[3]=o*c-s*a,i}function mw(i,e,t){t*=.5;const n=e[0],s=e[1],r=e[2],o=e[3],a=Math.sin(t),c=Math.cos(t);return i[0]=n*c+s*a,i[1]=s*c-n*a,i[2]=r*c+o*a,i[3]=o*c-r*a,i}function _w(i,e){const t=e[0],n=e[1],s=e[2];return i[0]=t,i[1]=n,i[2]=s,i[3]=Math.sqrt(Math.abs(1-t*t-n*n-s*s)),i}function In(i,e,t,n){const s=e[0],r=e[1],o=e[2],a=e[3];let c=t[0],l=t[1],u=t[2],f=t[3],d,h,g,p,m;return d=s*c+r*l+o*u+a*f,d<0&&(d=-d,c=-c,l=-l,u=-u,f=-f),1-d>wi?(h=Math.acos(d),m=Math.sin(h),g=Math.sin((1-n)*h)/m,p=Math.sin(n*h)/m):(g=1-n,p=n),i[0]=g*s+p*c,i[1]=g*r+p*l,i[2]=g*o+p*u,i[3]=g*a+p*f,i}function yw(i,e){const t=e[0],n=e[1],s=e[2],r=e[3],o=t*t+n*n+s*s+r*r,a=o?1/o:0;return i[0]=-t*a,i[1]=-n*a,i[2]=-s*a,i[3]=r*a,i}function bw(i,e){return i[0]=-e[0],i[1]=-e[1],i[2]=-e[2],i[3]=e[3],i}function Nd(i,e){const t=e[0]+e[4]+e[8];let n;if(t>0)n=Math.sqrt(t+1),i[3]=.5*n,n=.5/n,i[0]=(e[5]-e[7])*n,i[1]=(e[6]-e[2])*n,i[2]=(e[1]-e[3])*n;else{let s=0;e[4]>e[0]&&(s=1),e[8]>e[s*3+s]&&(s=2);const r=(s+1)%3,o=(s+2)%3;n=Math.sqrt(e[s*3+s]-e[r*3+r]-e[o*3+o]+1),i[s]=.5*n,n=.5/n,i[3]=(e[r*3+o]-e[o*3+r])*n,i[r]=(e[r*3+s]+e[s*3+r])*n,i[o]=(e[o*3+s]+e[s*3+o])*n}return i}const vw=ew,ww=Ba,xw=sw,Pw=rw,Ew=tw,Sw=iw,$d=nw,Tw=(function(){const i=Od(),e=ll(1,0,0),t=ll(0,1,0);return function(n,s,r){const o=xi(s,r);return o<-.999999?(ut(i,e,s),kd(i)<1e-6&&ut(i,t,s),Bd(i,i),zd(n,i,Math.PI),n):o>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(ut(i,s,r),n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=1+o,$d(n,n))}})();(function(){const i=dl(),e=dl();return function(t,n,s,r,o,a){return In(i,n,o,a),In(e,s,r,a),In(t,i,e,2*a*(1-a)),t}})();(function(){const i=$0();return function(e,t,n,s){return i[0]=n[0],i[3]=n[1],i[6]=n[2],i[1]=s[0],i[4]=s[1],i[7]=s[2],i[2]=-t[0],i[5]=-t[1],i[8]=-t[2],$d(e,Nd(e,i))}})();const Lw=[0,0,0,1];class Cw extends Aa{constructor(e=0,t=0,n=0,s=1){super(-0,-0,-0,-0),Array.isArray(e)&&arguments.length===1?this.copy(e):this.set(e,t,n,s)}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this.check()}set(e,t,n,s){return this[0]=e,this[1]=t,this[2]=n,this[3]=s,this.check()}fromObject(e){return this[0]=e.x,this[1]=e.y,this[2]=e.z,this[3]=e.w,this.check()}fromMatrix3(e){return Nd(this,e),this.check()}fromAxisRotation(e,t){return zd(this,e,t),this.check()}identity(){return hw(this),this.check()}setAxisAngle(e,t){return this.fromAxisRotation(e,t)}get ELEMENTS(){return 4}get x(){return this[0]}set x(e){this[0]=V(e)}get y(){return this[1]}set y(e){this[1]=V(e)}get z(){return this[2]}set z(e){this[2]=V(e)}get w(){return this[3]}set w(e){this[3]=V(e)}len(){return Ew(this)}lengthSquared(){return Sw(this)}dot(e){return xw(this,e)}rotationTo(e,t){return Tw(this,e,t),this.check()}add(e){return vw(this,this,e),this.check()}calculateW(){return _w(this,this),this.check()}conjugate(){return bw(this,this),this.check()}invert(){return yw(this,this),this.check()}lerp(e,t,n){return n===void 0?this.lerp(this,e,t):(Pw(this,e,t,n),this.check())}multiplyRight(e){return hl(this,this,e),this.check()}multiplyLeft(e){return hl(this,e,this),this.check()}normalize(){const e=this.len(),t=e>0?1/e:0;return this[0]=this[0]*t,this[1]=this[1]*t,this[2]=this[2]*t,this[3]=this[3]*t,e===0&&(this[3]=1),this.check()}rotateX(e){return gw(this,this,e),this.check()}rotateY(e){return pw(this,this,e),this.check()}rotateZ(e){return mw(this,this,e),this.check()}scale(e){return ww(this,this,e),this.check()}slerp(e,t,n){let s,r,o;switch(arguments.length){case 1:({start:s=Lw,target:r,ratio:o}=e);break;case 2:s=this,r=e,o=t;break;default:s=e,r=t,o=n}return In(this,s,r,o),this.check()}transformVector4(e,t=new Ra){return ow(t,e,this),Mn(t,4)}lengthSq(){return this.lengthSquared()}setFromAxisAngle(e,t){return this.setAxisAngle(e,t)}premultiply(e){return this.multiplyLeft(e)}multiply(e){return this.multiplyRight(e)}}function Ud(i,e=[],t=0){const n=Math.fround(i),s=i-n;return e[t]=n,e[t+1]=s,e}function Aw(i){return i-Math.fround(i)}function Mw(i){const e=new Float32Array(32);for(let t=0;t<4;++t)for(let n=0;n<4;++n){const s=t*4+n;Ud(i[n*4+t],e,s*2)}return e}function Iw(i,e=!0){return i??e}function Rw(i=[0,0,0],e=!0){return e?i.map(t=>t/255):[...i]}function Ow(i,e=!0){const t=Rw(i.slice(0,3),e),n=Number.isFinite(i[3]),s=n?i[3]:1;return[t[0],t[1],t[2],e&&n?s/255:s]}const Bw=`#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND

// All these functions are for substituting tan() function from Intel GPU only
const float TWO_PI = 6.2831854820251465;
const float PI_2 = 1.5707963705062866;
const float PI_16 = 0.1963495463132858;

const float SIN_TABLE_0 = 0.19509032368659973;
const float SIN_TABLE_1 = 0.3826834261417389;
const float SIN_TABLE_2 = 0.5555702447891235;
const float SIN_TABLE_3 = 0.7071067690849304;

const float COS_TABLE_0 = 0.9807852506637573;
const float COS_TABLE_1 = 0.9238795042037964;
const float COS_TABLE_2 = 0.8314695954322815;
const float COS_TABLE_3 = 0.7071067690849304;

const float INVERSE_FACTORIAL_3 = 1.666666716337204e-01; // 1/3!
const float INVERSE_FACTORIAL_5 = 8.333333767950535e-03; // 1/5!
const float INVERSE_FACTORIAL_7 = 1.9841270113829523e-04; // 1/7!
const float INVERSE_FACTORIAL_9 = 2.75573188446287533e-06; // 1/9!

float sin_taylor_fp32(float a) {
  float r, s, t, x;

  if (a == 0.0) {
    return 0.0;
  }

  x = -a * a;
  s = a;
  r = a;

  r = r * x;
  t = r * INVERSE_FACTORIAL_3;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_5;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_7;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_9;
  s = s + t;

  return s;
}

void sincos_taylor_fp32(float a, out float sin_t, out float cos_t) {
  if (a == 0.0) {
    sin_t = 0.0;
    cos_t = 1.0;
  }
  sin_t = sin_taylor_fp32(a);
  cos_t = sqrt(1.0 - sin_t * sin_t);
}

float tan_taylor_fp32(float a) {
    float sin_a;
    float cos_a;

    if (a == 0.0) {
        return 0.0;
    }

    // 2pi range reduction
    float z = floor(a / TWO_PI);
    float r = a - TWO_PI * z;

    float t;
    float q = floor(r / PI_2 + 0.5);
    int j = int(q);

    if (j < -2 || j > 2) {
        return 1.0 / 0.0;
    }

    t = r - PI_2 * q;

    q = floor(t / PI_16 + 0.5);
    int k = int(q);
    int abs_k = int(abs(float(k)));

    if (abs_k > 4) {
        return 1.0 / 0.0;
    } else {
        t = t - PI_16 * q;
    }

    float u = 0.0;
    float v = 0.0;

    float sin_t, cos_t;
    float s, c;
    sincos_taylor_fp32(t, sin_t, cos_t);

    if (k == 0) {
        s = sin_t;
        c = cos_t;
    } else {
        if (abs(float(abs_k) - 1.0) < 0.5) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs(float(abs_k) - 2.0) < 0.5) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs(float(abs_k) - 3.0) < 0.5) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else if (abs(float(abs_k) - 4.0) < 0.5) {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }
        if (k > 0) {
            s = u * sin_t + v * cos_t;
            c = u * cos_t - v * sin_t;
        } else {
            s = u * sin_t - v * cos_t;
            c = u * cos_t + v * sin_t;
        }
    }

    if (j == 0) {
        sin_a = s;
        cos_a = c;
    } else if (j == 1) {
        sin_a = c;
        cos_a = -s;
    } else if (j == -1) {
        sin_a = -c;
        cos_a = s;
    } else {
        sin_a = -s;
        cos_a = -c;
    }
    return sin_a / cos_a;
}
#endif

float tan_fp32(float a) {
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND
  return tan_taylor_fp32(a);
#else
  return tan(a);
#endif
}
`,kw=`#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND
const FP32_TWO_PI: f32 = 6.2831854820251465;
const FP32_PI_2: f32 = 1.5707963705062866;
const FP32_PI_16: f32 = 0.1963495463132858;

const FP32_SIN_TABLE_0: f32 = 0.19509032368659973;
const FP32_SIN_TABLE_1: f32 = 0.3826834261417389;
const FP32_SIN_TABLE_2: f32 = 0.5555702447891235;
const FP32_SIN_TABLE_3: f32 = 0.7071067690849304;

const FP32_COS_TABLE_0: f32 = 0.9807852506637573;
const FP32_COS_TABLE_1: f32 = 0.9238795042037964;
const FP32_COS_TABLE_2: f32 = 0.8314695954322815;
const FP32_COS_TABLE_3: f32 = 0.7071067690849304;

const FP32_INVERSE_FACTORIAL_3: f32 = 1.666666716337204e-01;
const FP32_INVERSE_FACTORIAL_5: f32 = 8.333333767950535e-03;
const FP32_INVERSE_FACTORIAL_7: f32 = 1.9841270113829523e-04;
const FP32_INVERSE_FACTORIAL_9: f32 = 2.75573188446287533e-06;
const FP32_OVERFLOW: f32 = 3.402823466e+38;

fn sin_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let x = -a * a;
  var sum = a;
  var term = a;

  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_3;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_5;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_7;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_9;

  return sum;
}

fn tan_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let z = floor(a / FP32_TWO_PI);
  let reduced = a - FP32_TWO_PI * z;

  var quadrantValue = floor(reduced / FP32_PI_2 + 0.5);
  let quadrant = i32(quadrantValue);
  if (quadrant < -2 || quadrant > 2) {
    return FP32_OVERFLOW;
  }

  var angle = reduced - FP32_PI_2 * quadrantValue;
  quadrantValue = floor(angle / FP32_PI_16 + 0.5);
  let tableIndex = i32(quadrantValue);
  let absoluteTableIndex = abs(tableIndex);
  if (absoluteTableIndex > 4) {
    return FP32_OVERFLOW;
  }

  angle = angle - FP32_PI_16 * quadrantValue;
  let sinAngle = sin_taylor_fp32(angle);
  let cosAngle = sqrt(1.0 - sinAngle * sinAngle);

  var tableCos = 0.0;
  var tableSin = 0.0;
  if (absoluteTableIndex == 1) {
    tableCos = FP32_COS_TABLE_0;
    tableSin = FP32_SIN_TABLE_0;
  } else if (absoluteTableIndex == 2) {
    tableCos = FP32_COS_TABLE_1;
    tableSin = FP32_SIN_TABLE_1;
  } else if (absoluteTableIndex == 3) {
    tableCos = FP32_COS_TABLE_2;
    tableSin = FP32_SIN_TABLE_2;
  } else if (absoluteTableIndex == 4) {
    tableCos = FP32_COS_TABLE_3;
    tableSin = FP32_SIN_TABLE_3;
  }

  var sinReduced = sinAngle;
  var cosReduced = cosAngle;
  if (tableIndex > 0) {
    sinReduced = tableCos * sinAngle + tableSin * cosAngle;
    cosReduced = tableCos * cosAngle - tableSin * sinAngle;
  } else if (tableIndex < 0) {
    sinReduced = tableCos * sinAngle - tableSin * cosAngle;
    cosReduced = tableCos * cosAngle + tableSin * sinAngle;
  }

  var sinValue = 0.0;
  var cosValue = 0.0;
  if (quadrant == 0) {
    sinValue = sinReduced;
    cosValue = cosReduced;
  } else if (quadrant == 1) {
    sinValue = cosReduced;
    cosValue = -sinReduced;
  } else if (quadrant == -1) {
    sinValue = -cosReduced;
    cosValue = sinReduced;
  } else {
    sinValue = -sinReduced;
    cosValue = -cosReduced;
  }

  return sinValue / cosValue;
}

fn tan_fp32(a: f32) -> f32 {
  return tan_taylor_fp32(a);
}
#else
fn tan_fp32(a: f32) -> f32 {
  return tan(a);
}
#endif
`,ka={name:"fp32",source:kw,vs:Bw},gl=`
layout(std140) uniform fp64arithmeticUniforms {
  uniform float ONE;
  uniform float SPLIT;
} fp64;

/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND

The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' form.

These helpers implement Dekker/Veltkamp-style error tracking. If the compiler
folds constants or reassociates the arithmetic, the high/low split can stop
tracking the rounding error correctly. That failure mode tends to look fine in
simple coordinate setup, but then breaks down inside iterative arithmetic such
as fp64 Mandelbrot loops.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

float prevent_fp64_optimization(float value) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  return value + fp64.ONE * 0.0;
#else
  return value;
#endif
}

// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  // Keep SPLIT as a runtime uniform so the compiler cannot fold the Dekker
  // split into a constant expression and reassociate the recovery steps.
  float split = prevent_fp64_optimization(fp64.SPLIT);
  float t = prevent_fp64_optimization(a * split);
  float temp = t - a;
  float a_hi = t - temp;
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}

// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * fp64.ONE;
  float err = b - (sum - a) * fp64.ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}

// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * fp64.ONE + 2.0 * a_fp64.x *
    a_fp64.y * fp64.ONE * fp64.ONE) + a_fp64.y * a_fp64.y * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  // twoProd is especially sensitive because mul_fp64 and div_fp64 both depend
  // on the split terms and cross terms staying in the original evaluation
  // order. If the compiler folds or reassociates them, the low part tends to
  // collapse to zero or NaN on some drivers.
  float highProduct = prevent_fp64_optimization(a_fp64.x * b_fp64.x);
  float crossProduct1 = prevent_fp64_optimization(a_fp64.x * b_fp64.y);
  float crossProduct2 = prevent_fp64_optimization(a_fp64.y * b_fp64.x);
  float lowProduct = prevent_fp64_optimization(a_fp64.y * b_fp64.y);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err1 = (highProduct - prod) * fp64.ONE;
  float err2 = crossProduct1 * fp64.ONE * fp64.ONE;
  float err3 = crossProduct2 * fp64.ONE * fp64.ONE * fp64.ONE;
  float err4 = lowProduct * fp64.ONE * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err1 = highProduct - prod;
  float err2 = crossProduct1;
  float err3 = crossProduct2;
  float err4 = lowProduct;
#endif
  float err = ((err1 + err2) + err3) + err4;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * fp64.ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
`,Dw=`struct Fp64F32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent.
fn fp64_decode_f32_bits(bits: u32) -> Fp64F32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64F32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64F32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64F32Bits(sign, i32(exponentBits) - 150, 0x800000u | fraction, false, false, false);
}

fn fp64_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return exactSign << 31u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;

  // A normal two-sum/two-product residual never needs a shift this large.
  // This guard gives deterministic underflow behavior outside that contract.
  if (exactShift >= 64 || highShift >= 64) {
    return exactSign << 31u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let lowBits = fp64_make_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  return vec2u(highBits, lowBits);
}

fn fp64_two_sum_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u((a.sign & b.sign) << 31u, 0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = select(
    b.baseExponent - a.baseExponent,
    a.baseExponent - b.baseExponent,
    a.baseExponent >= b.baseExponent
  );

  // Beyond half an ulp, rounding cannot change the larger operand. Returning
  // the smaller operand intact also avoids an unbounded integer alignment.
  // At a power-of-two boundary the spacing below the larger operand is half
  // the spacing above it, so an opposite-sign gap-25 operand can still change
  // the rounded high limb. Gap 26 is the first universally safe early-out.
  if (exponentDifference > 25) {
    if (fp64_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u, 0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_accumulator_bits(resultSign, resultMagnitude, commonBaseExponent);
}

fn fp64_two_sum_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_multiply_significands(a: u32, b: u32) -> vec2u {
  let aLow = a & 0xffffu;
  let aHigh = a >> 16u;
  let bLow = b & 0xffffu;
  let bHigh = b >> 16u;
  let lowProduct = aLow * bLow;
  let crossProduct = aLow * bHigh + aHigh * bLow;
  let highProduct = aHigh * bHigh;

  var result = vec2u(0u, lowProduct);
  result = fp64_u64_add(
    result,
    fp64_u64_shift_left(vec2u(0u, crossProduct), 16u)
  );
  result = fp64_u64_add(result, vec2u(highProduct, 0u));
  return result;
}

fn fp64_two_prod_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);
  let resultSign = a.sign ^ b.sign;

  if (a.isNan || b.isNan || ((a.isZero || b.isZero) && (a.isInf || b.isInf))) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    return vec2u((resultSign << 31u) | 0x7f800000u, resultSign << 31u);
  }
  if (a.isZero || b.isZero) {
    return vec2u(resultSign << 31u, resultSign << 31u);
  }

  let magnitude = fp64_multiply_significands(a.significand, b.significand);
  return fp64_split_accumulator_bits(
    resultSign,
    magnitude,
    a.baseExponent + b.baseExponent
  );
}

fn fp64_two_prod_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_prod_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_round_add_integer(a: f32, b: f32) -> f32 {
  return fp64_two_sum_integer(a, b).x;
}

fn fp64_round_mul_integer(a: f32, b: f32) -> f32 {
  return fp64_two_prod_integer(a, b).x;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_finite_exponent(value: Fp64F32Bits) -> i32 {
  let mostSignificantBit = 31u - countLeadingZeros(value.significand);
  return value.baseExponent + i32(mostSignificantBit);
}

fn fp64_scale_f32_integer(value: f32, exponent: i32) -> f32 {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(value));
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return value;
  }
  let resultBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent + exponent
  );
  return bitcast<f32>(resultBits);
}

// Divide normalized significands so the hardware operation cannot overflow,
// underflow, or flush a subnormal result. Reapply the exponent with integer
// packing, which also produces subnormal correction limbs without relying on
// floating-point arithmetic to preserve them.
fn fp64_divide_f32_integer(aValue: f32, bValue: f32) -> f32 {
  let a = fp64_decode_f32_bits(bitcast<u32>(aValue));
  let b = fp64_decode_f32_bits(bitcast<u32>(bValue));
  if (a.isZero || b.isZero || a.isInf || b.isInf || a.isNan || b.isNan) {
    return aValue / bValue;
  }

  let aMostSignificantBit = 31u - countLeadingZeros(a.significand);
  let bMostSignificantBit = 31u - countLeadingZeros(b.significand);
  let normalizedABits = fp64_make_f32_bits_from_u64(
    a.sign,
    vec2u(0u, a.significand),
    -i32(aMostSignificantBit)
  );
  let normalizedBBits = fp64_make_f32_bits_from_u64(
    b.sign,
    vec2u(0u, b.significand),
    -i32(bMostSignificantBit)
  );
  let normalizedQuotient = bitcast<f32>(normalizedABits) / bitcast<f32>(normalizedBBits);
  let quotient = fp64_decode_f32_bits(bitcast<u32>(normalizedQuotient));
  let exponentShift =
    a.baseExponent + i32(aMostSignificantBit) -
    b.baseExponent - i32(bMostSignificantBit);
  let quotientBits = fp64_make_f32_bits_from_u64(
    quotient.sign,
    vec2u(0u, quotient.significand),
    quotient.baseExponent + exponentShift
  );
  return bitcast<f32>(quotientBits);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  // Rounding the high limb of a maximum-exponent value can overflow even
  // though the original value is finite. Truncate only in that boundary case
  // so split remains an exact finite decomposition.
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = fp64_round_add_integer(result.y, a.y);
  return result;
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var sum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = fp64_two_sum_integer(a.y, b.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.x);
  sum = fp64_two_sum_integer(sum.x, sum.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.y);
  return fp64_two_sum_integer(sum.x, sum.y);
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let negatedB = vec2f(
    bitcast<f32>(bitcast<u32>(b.x) ^ 0x80000000u),
    bitcast<f32>(bitcast<u32>(b.y) ^ 0x80000000u)
  );
  return sum_fp64(a, negatedB);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var product = fp64_two_prod_integer(a.x, b.x);
  let crossProduct1 = fp64_round_mul_integer(a.x, b.y);
  product.y = fp64_round_add_integer(product.y, crossProduct1);
  product = fp64_two_sum_integer(product.x, product.y);
  let crossProduct2 = fp64_round_mul_integer(a.y, b.x);
  product.y = fp64_round_add_integer(product.y, crossProduct2);
  return fp64_two_sum_integer(product.x, product.y);
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_scale_fp64_integer(value: vec2f, exponent: i32) -> vec2f {
  let high = fp64_scale_f32_integer(value.x, exponent);
  let low = fp64_scale_f32_integer(value.y, exponent);
  return sum_fp64(vec2f(high, 0.0), vec2f(low, 0.0));
}

fn fp64_div_fp64_normalized(a: vec2f, b: vec2f) -> vec2f {
  let quotientHigh = fp64_divide_f32_integer(a.x, b.x);
  var quotient = vec2f(quotientHigh, 0.0);

  let remainder = sub_fp64(a, mul_fp64(b, quotient));
  let quotientLow = fp64_divide_f32_integer(remainder.x, b.x);
  quotient = sum_fp64(quotient, vec2f(quotientLow, 0.0));

  let secondRemainder = sub_fp64(a, mul_fp64(b, quotient));
  let correction = fp64_divide_f32_integer(secondRemainder.x, b.x);
  return sum_fp64(quotient, vec2f(correction, 0.0));
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let decodedA = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedB = fp64_decode_f32_bits(bitcast<u32>(b.x));
  if (
    decodedA.isZero || decodedB.isZero ||
    decodedA.isInf || decodedB.isInf ||
    decodedA.isNan || decodedB.isNan
  ) {
    return fp64_div_fp64_normalized(a, b);
  }

  let exponentA = fp64_f32_finite_exponent(decodedA);
  let exponentB = fp64_f32_finite_exponent(decodedB);
  // Correct the quotient near unity so b * q and the remainder stay clear of
  // both f32 underflow and overflow. The exponent difference is applied once.
  let normalizedA = fp64_scale_fp64_integer(a, -exponentA);
  let normalizedB = fp64_scale_fp64_integer(b, -exponentB);
  let normalizedQuotient = fp64_div_fp64_normalized(normalizedA, normalizedB);
  return fp64_scale_fp64_integer(normalizedQuotient, exponentA - exponentB);
}

fn fp64_sqrt_fp64_normalized(a: vec2f) -> vec2f {
  let estimate = sqrt(a.x);
  let difference = sub_fp64(a, fp64_two_prod_integer(estimate, estimate)).x;
  let denominator = fp64_round_add_integer(estimate, estimate);
  let correction = fp64_divide_f32_integer(difference, denominator);
  return sum_fp64(vec2f(estimate, 0.0), vec2f(correction, 0.0));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  if (decoded.isZero && decodedLow.isZero) {
    return vec2f(0.0, 0.0);
  }
  if (decoded.sign == 1u) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  if (decoded.isInf || decoded.isNan) {
    return fp64_sqrt_fp64_normalized(a);
  }
  let exponent = fp64_f32_finite_exponent(decoded);
  // An even scale lets the final square-root rescale use an integer exponent.
  let evenExponent = exponent - (exponent & 1);
  let normalizedA = fp64_scale_fp64_integer(a, -evenExponent);
  let normalizedRoot = fp64_sqrt_fp64_normalized(normalizedA);
  return fp64_scale_fp64_integer(normalizedRoot, evenExponent / 2);
}
#endif
`,Fw=`struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64Bits {
  sign: u32,
  exponent: i32,
  significand: vec2u,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}
#endif

fn fp64_u64_is_zero(value: vec2u) -> bool {
  return value.x == 0u && value.y == 0u;
}

fn fp64_u64_compare(a: vec2u, b: vec2u) -> i32 {
  if (a.x != b.x) {
    return select(-1, 1, a.x > b.x);
  }
  if (a.y != b.y) {
    return select(-1, 1, a.y > b.y);
  }
  return 0;
}

fn fp64_u64_add(a: vec2u, b: vec2u) -> vec2u {
  let low = a.y + b.y;
  let carry = select(0u, 1u, low < a.y);
  return vec2u(a.x + b.x + carry, low);
}

fn fp64_u64_sub(a: vec2u, b: vec2u) -> vec2u {
  let borrow = select(0u, 1u, a.y < b.y);
  return vec2u(a.x - b.x - borrow, a.y - b.y);
}

fn fp64_u64_shift_left(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u((value.x << shift) | (value.y >> (32u - shift)), value.y << shift);
  }
  if (shift == 32u) {
    return vec2u(value.y, 0u);
  }
  if (shift < 64u) {
    return vec2u(value.y << (shift - 32u), 0u);
  }
  return vec2u(0u);
}

fn fp64_u64_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u(value.x >> shift, (value.y >> shift) | (value.x << (32u - shift)));
  }
  if (shift == 32u) {
    return vec2u(0u, value.x);
  }
  if (shift < 64u) {
    return vec2u(0u, value.x >> (shift - 32u));
  }
  return vec2u(0u);
}

fn fp64_u64_get_bit(value: vec2u, bitIndex: u32) -> bool {
  if (bitIndex >= 64u) {
    return false;
  }
  if (bitIndex >= 32u) {
    return ((value.x >> (bitIndex - 32u)) & 1u) != 0u;
  }
  return ((value.y >> bitIndex) & 1u) != 0u;
}

fn fp64_u64_has_bits_below(value: vec2u, bitCount: u32) -> bool {
  if (bitCount == 0u) {
    return false;
  }
  if (bitCount >= 64u) {
    return !fp64_u64_is_zero(value);
  }
  if (bitCount > 32u) {
    let highBitCount = bitCount - 32u;
    let highMask = (1u << highBitCount) - 1u;
    return value.y != 0u || (value.x & highMask) != 0u;
  }
  if (bitCount == 32u) {
    return value.y != 0u;
  }
  let lowMask = (1u << bitCount) - 1u;
  return (value.y & lowMask) != 0u;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_u64_shift_right_sticky(value: vec2u, shift: u32) -> vec2u {
  var shifted = fp64_u64_shift_right(value, shift);
  if (fp64_u64_has_bits_below(value, shift)) {
    shifted.y = shifted.y | 1u;
  }
  return shifted;
}
#endif

fn fp64_u64_count_leading_zeros(value: vec2u) -> u32 {
  if (value.x != 0u) {
    return countLeadingZeros(value.x);
  }
  return 32u + countLeadingZeros(value.y);
}

fn fp64_round_shift_right_to_u32(value: vec2u, shift: u32) -> u32 {
  if (shift == 0u) {
    return value.y;
  }

  let truncated = fp64_u64_shift_right(value, shift);
  var rounded = truncated.y;
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded & 1u) == 1u)) {
    rounded = rounded + 1u;
  }
  return rounded;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_round_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }

  var rounded = fp64_u64_shift_right(value, shift);
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded.y & 1u) == 1u)) {
    rounded = fp64_u64_add(rounded, vec2u(0u, 1u));
  }
  return rounded;
}
#endif

fn fp64_make_f32_bits_from_u64(sign: u32, significand: vec2u, baseExponent: i32) -> u32 {
  if (fp64_u64_is_zero(significand)) {
    return sign << 31u;
  }

  let leadingZeros = fp64_u64_count_leading_zeros(significand);
  let mostSignificantBit = 63u - leadingZeros;
  var exponent = baseExponent + i32(mostSignificantBit);

  if (exponent > 127) {
    return (sign << 31u) | 0x7f800000u;
  }

  if (exponent >= -126) {
    let shift = i32(mostSignificantBit) - 23;
    var significand24: u32;
    if (shift > 0) {
      significand24 = fp64_round_shift_right_to_u32(significand, u32(shift));
    } else {
      significand24 = fp64_u64_shift_left(significand, u32(-shift)).y;
    }

    if (significand24 >= 0x1000000u) {
      significand24 = significand24 >> 1u;
      exponent = exponent + 1;
      if (exponent > 127) {
        return (sign << 31u) | 0x7f800000u;
      }
    }

    return (sign << 31u) | (u32(exponent + 127) << 23u) | (significand24 & 0x7fffffu);
  }

  let scaleExponent = baseExponent + 149;
  var mantissa: u32;
  if (scaleExponent >= 0) {
    mantissa = fp64_u64_shift_left(significand, u32(scaleExponent)).y;
  } else {
    mantissa = fp64_round_shift_right_to_u32(significand, u32(-scaleExponent));
  }

  if (mantissa >= 0x800000u) {
    return (sign << 31u) | 0x00800000u;
  }
  return (sign << 31u) | mantissa;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_decode_bits(bits: vec2u) -> Fp64Bits {
  let sign = bits.x >> 31u;
  let exponentBits = (bits.x >> 20u) & 0x7ffu;
  let fractionHigh = bits.x & 0xfffffu;
  let fractionLow = bits.y;
  let fraction = vec2u(fractionHigh, fractionLow);

  if (exponentBits == 0x7ffu) {
    let isInf = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, 0, vec2u(0u), false, isInf, !isInf);
  }

  if (exponentBits == 0u) {
    let isZero = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, -1022, fraction, isZero, false, false);
  }

  return Fp64Bits(sign, i32(exponentBits) - 1023, vec2u((1u << 20u) | fractionHigh, fractionLow), false, false, false);
}

fn fp64_finite_magnitude_compare(a: Fp64Bits, b: Fp64Bits) -> i32 {
  if (a.exponent != b.exponent) {
    return select(-1, 1, a.exponent > b.exponent);
  }
  return fp64_u64_compare(a.significand, b.significand);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64RawF32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent. This shared
// integer representation lets normalization remain independent of the
// selected double-single arithmetic implementation.
fn fp64_decode_raw_f32_bits(bits: u32) -> Fp64RawF32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64RawF32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64RawF32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64RawF32Bits(
    sign,
    i32(exponentBits) - 150,
    0x800000u | fraction,
    false,
    false,
    false
  );
}

fn fp64_raw_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_raw_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_raw_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return 0u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;
  if (exactShift >= 64 || highShift >= 64) {
    return 0u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_raw_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let rawLowBits = fp64_make_raw_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  let lowBits = select(rawLowBits, 0u, (rawLowBits & 0x7fffffffu) == 0u);
  if ((highBits & 0x7fffffffu) == 0u && (lowBits & 0x7fffffffu) == 0u) {
    return vec2u(0u);
  }
  return vec2u(highBits, lowBits);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
// Round an arithmetic accumulator to binary64 before splitting it. The
// aligned add/subtract paths retain three guard bits plus a sticky bit, which
// is sufficient for round-to-nearest-even at the binary64 boundary.
fn fp64_split_binary64_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }

  let mostSignificantBit = 63u - fp64_u64_count_leading_zeros(magnitude);
  let exponent = baseExponent + i32(mostSignificantBit);
  if (exponent > 1023) {
    return vec2u((sign << 31u) | 0x7f800000u, 0u);
  }

  var roundedMagnitude = magnitude;
  var roundedBaseExponent = baseExponent;
  if (exponent >= -1022) {
    if (mostSignificantBit > 52u) {
      let shift = mostSignificantBit - 52u;
      roundedMagnitude = fp64_round_shift_right(magnitude, shift);
      roundedBaseExponent = baseExponent + i32(shift);
    }
  } else {
    let shift = -1074 - baseExponent;
    if (shift > 0) {
      roundedMagnitude = fp64_round_shift_right(magnitude, u32(shift));
      roundedBaseExponent = -1074;
    }
  }

  if (fp64_u64_is_zero(roundedMagnitude)) {
    return vec2u(0u);
  }
  return fp64_split_raw_accumulator_bits(sign, roundedMagnitude, roundedBaseExponent);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_add_raw_f32_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_raw_f32_bits(aBits);
  let b = fp64_decode_raw_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = abs(a.baseExponent - b.baseExponent);
  if (exponentDifference > 25) {
    if (fp64_raw_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_raw_accumulator_bits(
    resultSign,
    resultMagnitude,
    commonBaseExponent
  );
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_add_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_sub_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_add_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

fn fp64_sub_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

// Subtract two raw binary64 values and round the exact result once to f32.
// The input words are canonical high/low words: .x contains sign/exponent/high
// fraction bits, and .y contains the low 32 fraction bits.
fn sub_fp64u32_to_f32_bits(aBits: vec2u, bBits: vec2u) -> u32 {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return 0x7fc00000u;
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return (a.sign << 31u) | 0x7f800000u;
    }
    return 0x7fc00000u;
  }
  if (a.isInf) {
    return (a.sign << 31u) | 0x7f800000u;
  }
  if (b.isInf) {
    return (bSubtractionSign << 31u) | 0x7f800000u;
  }
  if (a.isZero && b.isZero) {
    return select(0u, 0x80000000u, a.sign == 1u && b.sign == 0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return 0u;
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_f32_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_f32_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_f32(aBits: vec2u, bBits: vec2u) -> f32 {
  return bitcast<f32>(sub_fp64u32_to_f32_bits(aBits, bBits));
}

// Subtract two raw binary64 values, round once to binary64, then split the
// result into normalized f32 limbs. Finite results must fit within the f32
// exponent range; larger magnitudes map to infinity and smaller magnitudes
// map to zero. The input words use canonical high/low word order.
fn sub_fp64u32_to_fp64_bits(aBits: vec2u, bBits: vec2u) -> vec2u {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
    }
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf) {
    return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
  }
  if (b.isInf) {
    return vec2u((bSubtractionSign << 31u) | 0x7f800000u, 0u);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return vec2u(0u);
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_fp64_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_fp64(aBits: vec2u, bBits: vec2u) -> vec2f {
  let resultBits = sub_fp64u32_to_fp64_bits(aBits, bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_runtime_zero() -> f32 {
  return fp64arithmetic.ONE * 0.0;
}

fn prevent_fp64_optimization(value: f32) -> f32 {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  return value + fp64_runtime_zero();
#else
  return value;
#endif
}
#endif

#ifdef LUMA_FP64_INTEGER_ARITHMETIC
${Dw}
#else
fn split(a: f32) -> vec2f {
  let splitValue = prevent_fp64_optimization(fp64arithmetic.SPLIT + fp64_runtime_zero());
  let t = prevent_fp64_optimization(a * splitValue);
  let temp = prevent_fp64_optimization(t - a);
  let aHi = prevent_fp64_optimization(t - temp);
  let aLo = prevent_fp64_optimization(a - aHi);
  return vec2f(aHi, aLo);
}

fn split2(a: vec2f) -> vec2f {
  var b = split(a.x);
  b.y = b.y + a.y;
  return b;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let sum = prevent_fp64_optimization((a + b) * fp64arithmetic.ONE);
  let err = prevent_fp64_optimization(b - (sum - a) * fp64arithmetic.ONE);
#else
  let sum = prevent_fp64_optimization(a + b);
  let err = prevent_fp64_optimization(b - (sum - a));
#endif
  return vec2f(sum, err);
}

fn twoSum(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a + b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) +
    prevent_fp64_optimization(b - v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) + prevent_fp64_optimization(b - v);
#endif
  return vec2f(s, err);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a - b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) -
    prevent_fp64_optimization(b + v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) - prevent_fp64_optimization(b + v);
#endif
  return vec2f(s, err);
}

fn twoSqr(a: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * a);
  let aFp64 = split(a);
  let highProduct = prevent_fp64_optimization(aFp64.x * aFp64.x);
  let crossProduct = prevent_fp64_optimization(2.0 * aFp64.x * aFp64.y);
  let lowProduct = prevent_fp64_optimization(aFp64.y * aFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err =
    (prevent_fp64_optimization(highProduct - prod) * fp64arithmetic.ONE +
      crossProduct * fp64arithmetic.ONE * fp64arithmetic.ONE) +
    lowProduct * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
#else
  let err = ((prevent_fp64_optimization(highProduct - prod) + crossProduct) + lowProduct);
#endif
  return vec2f(prod, err);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * b);
  let aFp64 = split(a);
  let bFp64 = split(b);
  let highProduct = prevent_fp64_optimization(aFp64.x * bFp64.x);
  let crossProduct1 = prevent_fp64_optimization(aFp64.x * bFp64.y);
  let crossProduct2 = prevent_fp64_optimization(aFp64.y * bFp64.x);
  let lowProduct = prevent_fp64_optimization(aFp64.y * bFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err1 = (highProduct - prod) * fp64arithmetic.ONE;
  let err2 = crossProduct1 * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err3 = crossProduct2 * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err4 =
    lowProduct *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE;
#else
  let err1 = highProduct - prod;
  let err2 = crossProduct1;
  let err3 = crossProduct2;
  let err4 = lowProduct;
#endif
  let err12InputA = prevent_fp64_optimization(err1);
  let err12InputB = prevent_fp64_optimization(err2);
  let err12 = prevent_fp64_optimization(err12InputA + err12InputB);
  let err123InputA = prevent_fp64_optimization(err12);
  let err123InputB = prevent_fp64_optimization(err3);
  let err123 = prevent_fp64_optimization(err123InputA + err123InputB);
  let err1234InputA = prevent_fp64_optimization(err123);
  let err1234InputB = prevent_fp64_optimization(err4);
  let err = prevent_fp64_optimization(err1234InputA + err1234InputB);
  return vec2f(prod, err);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSum(a.x, b.x);
  let t = twoSum(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSub(a.x, b.x);
  let t = twoSub(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var prod = twoProd(a.x, b.x);
  let crossProduct1 = prevent_fp64_optimization(a.x * b.y);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct1);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  let crossProduct2 = prevent_fp64_optimization(a.y * b.x);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct2);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let xn = prevent_fp64_optimization(1.0 / b.x);
  let yn = mul_fp64(a, vec2f(xn, fp64_runtime_zero()));
  let diff = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, yn)).x);
  let prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let x = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let yn = prevent_fp64_optimization(a.x * x);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let ynSqr = twoSqr(yn) * fp64arithmetic.ONE;
#else
  let ynSqr = twoSqr(yn);
#endif
  let diff = prevent_fp64_optimization(sub_fp64(a, ynSqr).x);
  let prod = twoProd(prevent_fp64_optimization(x * 0.5), diff);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2f(yn, 0.0), prod);
#endif
}
#endif
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_bits_is_nan(bits: u32) -> bool {
  return (bits & 0x7fffffffu) > 0x7f800000u;
}

fn fp64_f32_bits_is_inf(bits: u32) -> bool {
  return (bits & 0x7fffffffu) == 0x7f800000u;
}

fn fp64_compare_f32_bits(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == 0u && bMagnitude == 0u) {
    return 0;
  }
  let aSign = aBits >> 31u;
  let bSign = bBits >> 31u;
  if (aSign != bSign) {
    return select(1, -1, aSign == 1u);
  }
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  let magnitudeComparison = select(-1, 1, aMagnitude > bMagnitude);
  return select(magnitudeComparison, -magnitudeComparison, aSign == 1u);
}

// Normalize an arbitrary pair of finite f32 limbs with integer accumulation.
// This is independent of LUMA_FP64_INTEGER_ARITHMETIC and canonicalizes every
// representation of zero to vec2f(+0.0, +0.0).
fn normalize_fp64(value: vec2f) -> vec2f {
  let resultBits = fp64_add_raw_f32_bits(bitcast<u32>(value.x), bitcast<u32>(value.y));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn is_nan_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  return fp64_f32_bits_is_nan(bitcast<u32>(normalized.x)) ||
    fp64_f32_bits_is_nan(bitcast<u32>(normalized.y));
}

fn is_finite_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  return !fp64_f32_bits_is_nan(highBits) && !fp64_f32_bits_is_nan(lowBits) &&
    !fp64_f32_bits_is_inf(highBits) && !fp64_f32_bits_is_inf(lowBits);
}

// Returns -1, 0, or 1. NaN is unordered and returns 0; call is_nan_fp64 or
// is_finite_fp64 first when 0 must mean a finite zero.
fn sign_fp64(value: vec2f) -> i32 {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  if (fp64_f32_bits_is_nan(highBits) || fp64_f32_bits_is_nan(lowBits)) {
    return 0;
  }
  if ((highBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (highBits >> 31u) == 1u);
  }
  if ((lowBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (lowBits >> 31u) == 1u);
  }
  return 0;
}

// Compares double-single values and returns -1, 0, or 1. NaN is unordered
// and returns 0; callers that require equality semantics must first check
// is_nan_fp64 or is_finite_fp64.
fn compare_fp64(a: vec2f, b: vec2f) -> i32 {
  let normalizedA = normalize_fp64(a);
  let normalizedB = normalize_fp64(b);
  let aHighBits = bitcast<u32>(normalizedA.x);
  let aLowBits = bitcast<u32>(normalizedA.y);
  let bHighBits = bitcast<u32>(normalizedB.x);
  let bLowBits = bitcast<u32>(normalizedB.y);
  if (fp64_f32_bits_is_nan(aHighBits) || fp64_f32_bits_is_nan(aLowBits) ||
      fp64_f32_bits_is_nan(bHighBits) || fp64_f32_bits_is_nan(bLowBits)) {
    return 0;
  }
  let highComparison = fp64_compare_f32_bits(aHighBits, bHighBits);
  if (highComparison != 0) {
    return highComparison;
  }
  return fp64_compare_f32_bits(aLowBits, bLowBits);
}
#endif
`,zw={ONE:1,SPLIT:4097},Nw={name:"fp64arithmetic",source:Fw,fs:gl,vs:gl,defaultUniforms:zw,uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:Ud,fp64LowPart:Aw,fp64ifyMatrix4:Mw},$w=[0,1,1,1],Uw=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

out vec4 picking_vRGBcolor_Avalid;

// Normalize unsigned byte color to 0-1 range
vec3 picking_normalizeColor(vec3 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

// Normalize unsigned byte color to 0-1 range
vec4 picking_normalizeColor(vec4 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

bool picking_isColorZero(vec3 color) {
  return dot(color, vec3(1.0)) < 0.00001;
}

bool picking_isColorValid(vec3 color) {
  return dot(color, vec3(1.0)) > 0.00001;
}

// Check if this vertex is highlighted 
bool isVertexHighlighted(vec3 vertexColor) {
  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  return
    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));
}

// Set the current picking color
void picking_setPickingColor(vec3 pickingColor) {
  pickingColor = picking_normalizeColor(pickingColor);

  if (bool(picking.isActive)) {
    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));

    if (!bool(picking.isAttribute)) {
      // Stores the picking color so that the fragment shader can render it during picking
      picking_vRGBcolor_Avalid.rgb = pickingColor;
    }
  } else {
    // Do the comparison with selected item color in vertex shader as it should mean fewer compares
    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));
  }
}

void picking_setPickingAttribute(float value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.r = value;
  }
}

void picking_setPickingAttribute(vec2 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rg = value;
  }
}

void picking_setPickingAttribute(vec3 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rgb = value;
  }
}
`,Gw=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

in vec4 picking_vRGBcolor_Avalid;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (picking.isActive > 0.5) {
    return color;
  }

  bool selected = bool(picking_vRGBcolor_Avalid.a);

  if (selected) {
    // Blend in highlight color based on its alpha value
    float highLightAlpha = picking.highlightColor.a;
    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
    float highLightRatio = highLightAlpha / blendedAlpha;

    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
    return vec4(blendedRGB, blendedAlpha);
  } else {
    return color;
  }
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_vRGBcolor_Avalid.a == 0.0) {
      discard;
    }
    return picking_vRGBcolor_Avalid;
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 highlightColor = picking_filterHighlightColor(color);
  return picking_filterPickingColor(highlightColor);
}
`,Mt={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:$w},vs:Uw,fs:Gw,getUniforms:Vw};function Vw(i={},e){const t={},n=Iw(i.useByteColors,!0);if(i.highlightedObjectColor!==void 0)if(i.highlightedObjectColor===null)t.isHighlightActive=!1;else{t.isHighlightActive=!0;const s=i.highlightedObjectColor.slice(0,3);t.highlightedObjectColor=s}return i.highlightColor&&(t.highlightColor=Ow(i.highlightColor,n)),i.isActive!==void 0&&(t.isActive=!!i.isActive,t.isAttribute=!!i.isAttribute),i.useByteColors!==void 0&&(t.useByteColors=!!i.useByteColors),t}const jw=`struct LayerUniforms {
  opacity: f32,
};

@group(0) @binding(auto)
var<uniform> layer: LayerUniforms;
`,pl=`layout(std140) uniform layerUniforms {
  uniform float opacity;
} layer;
`,Ww={name:"layer",source:jw,vs:pl,fs:pl,getUniforms:i=>({opacity:Math.pow(i.opacity,1/2.2)}),uniformTypes:{opacity:"f32"}},Hw=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,Is={name:"color",dependencies:[],source:Hw,getUniforms:i=>({})},Yw=`const SMOOTH_EDGE_RADIUS: f32 = 0.5;

struct VertexGeometry {
  position: vec4<f32>,
  worldPosition: vec3<f32>,
  worldPositionAlt: vec3<f32>,
  normal: vec3<f32>,
  uv: vec2<f32>,
  pickingColor: vec3<f32>,
};

var<private> geometry_: VertexGeometry = VertexGeometry(
  vec4<f32>(0.0, 0.0, 1.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec2<f32>(0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0)
);

struct FragmentGeometry {
  uv: vec2<f32>,
};

var<private> fragmentGeometry: FragmentGeometry;

fn smoothedge(edge: f32, x: f32) -> f32 {
  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);
}
`,Gd="#define SMOOTH_EDGE_RADIUS 0.5",qw=`${Gd}

struct VertexGeometry {
  vec4 position;
  vec3 worldPosition;
  vec3 worldPositionAlt;
  vec3 normal;
  vec2 uv;
  vec3 pickingColor;
} geometry = VertexGeometry(
  vec4(0.0, 0.0, 1.0, 0.0),
  vec3(0.0),
  vec3(0.0),
  vec3(0.0),
  vec2(0.0),
  vec3(0.0)
);
`,Xw=`${Gd}

struct FragmentGeometry {
  vec2 uv;
};
FragmentGeometry geometry;

float smoothedge(float edge, float x) {
  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);
}
`,Vd={name:"geometry",source:Yw,vs:qw,fs:Xw},Zw=25;var B;(function(i){i[i.Start=1]="Start",i[i.Move=2]="Move",i[i.End=4]="End",i[i.Cancel=8]="Cancel"})(B||(B={}));var K;(function(i){i[i.None=0]="None",i[i.Left=1]="Left",i[i.Right=2]="Right",i[i.Up=4]="Up",i[i.Down=8]="Down",i[i.Horizontal=3]="Horizontal",i[i.Vertical=12]="Vertical",i[i.All=15]="All"})(K||(K={}));var A;(function(i){i[i.Possible=1]="Possible",i[i.Began=2]="Began",i[i.Changed=4]="Changed",i[i.Ended=8]="Ended",i[i.Recognized=8]="Recognized",i[i.Cancelled=16]="Cancelled",i[i.Failed=32]="Failed"})(A||(A={}));const Kw="compute",Qw="auto",ts="manipulation",Rn="none",xo="pan-x",Po="pan-y";function Jw(i){if(i.includes(Rn))return Rn;const e=i.includes(xo),t=i.includes(Po);return e&&t?Rn:e||t?e?xo:Po:i.includes(ts)?ts:Qw}class ex{constructor(e,t){this.actions="",this.manager=e,this.set(t)}set(e){e===Kw&&(e=this.compute()),this.manager.element&&(this.manager.element.style.touchAction=e,this.actions=e)}update(){this.set(this.manager.options.touchAction)}compute(){let e=[];for(const t of this.manager.recognizers)t.options.enable&&(e=e.concat(t.getTouchAction()));return Jw(e.join(" "))}}function is(i){return i.trim().split(/\s+/g)}function fr(i,e,t){if(i)for(const n of is(e))i.addEventListener(n,t,!1)}function dr(i,e,t){if(i)for(const n of is(e))i.removeEventListener(n,t,!1)}function ml(i){return(i.ownerDocument||i).defaultView}function tx(i,e){let t=i;for(;t;){if(t===e)return!0;t=t.parentNode}return!1}function jd(i){const e=i.length;if(e===1)return{x:Math.round(i[0].clientX),y:Math.round(i[0].clientY)};let t=0,n=0,s=0;for(;s<e;)t+=i[s].clientX,n+=i[s].clientY,s++;return{x:Math.round(t/e),y:Math.round(n/e)}}function _l(i){const e=[];let t=0;for(;t<i.pointers.length;)e[t]={clientX:Math.round(i.pointers[t].clientX),clientY:Math.round(i.pointers[t].clientY)},t++;return{timeStamp:Date.now(),pointers:e,center:jd(e),deltaX:i.deltaX,deltaY:i.deltaY}}function Da(i,e){const t=e.x-i.x,n=e.y-i.y;return Math.sqrt(t*t+n*n)}function Eo(i,e){const t=e.clientX-i.clientX,n=e.clientY-i.clientY;return Math.sqrt(t*t+n*n)}function ix(i,e){const t=e.x-i.x,n=e.y-i.y;return Math.atan2(n,t)*180/Math.PI}function yl(i,e){const t=e.clientX-i.clientX,n=e.clientY-i.clientY;return Math.atan2(n,t)*180/Math.PI}function Fa(i,e){return i===e?K.None:Math.abs(i)>=Math.abs(e)?i<0?K.Left:K.Right:e<0?K.Up:K.Down}function nx(i,e){const t=e.center;let n=i.offsetDelta,s=i.prevDelta;const r=i.prevInput;return(e.eventType===B.Start||r?.eventType===B.End)&&(s=i.prevDelta={x:r?.deltaX||0,y:r?.deltaY||0},n=i.offsetDelta={x:t.x,y:t.y}),{deltaX:s.x+(t.x-n.x),deltaY:s.y+(t.y-n.y)}}function Wd(i,e,t){return{x:e/i||0,y:t/i||0}}function sx(i,e){return Eo(e[0],e[1])/Eo(i[0],i[1])}function rx(i,e){return yl(e[1],e[0])-yl(i[1],i[0])}function ox(i,e){const t=i.lastInterval||e,n=e.timeStamp-t.timeStamp;let s,r,o,a;if(e.eventType!==B.Cancel&&(n>Zw||t.velocity===void 0)){const c=e.deltaX-t.deltaX,l=e.deltaY-t.deltaY,u=Wd(n,c,l);r=u.x,o=u.y,s=Math.abs(u.x)>Math.abs(u.y)?u.x:u.y,a=Fa(c,l),i.lastInterval=e}else s=t.velocity,r=t.velocityX,o=t.velocityY,a=t.direction;e.velocity=s,e.velocityX=r,e.velocityY=o,e.direction=a}function So(i,e){return"pointerId"in i?i.pointerId:e}function bl(i,e){i.movementOrigin=new Map(e.map((t,n)=>[So(t,n),{clientX:t.clientX,clientY:t.clientY}])),i.firstMovementTime=void 0}function ax(i,e){const t=e.pointers.map(So);if(i.movementOrigin?.size===t.length&&t.every(s=>i.movementOrigin.has(s))||bl(i,e.pointers),e.distancePerPointer=e.pointers.map((s,r)=>Eo(i.movementOrigin.get(t[r]),s)),e.eventType&B.Move&&e.distancePerPointer.some(s=>s>0)&&(i.firstMovementTime??(i.firstMovementTime=e.timeStamp)),e.movementDeltaTime=i.firstMovementTime===void 0?0:e.timeStamp-i.firstMovementTime,e.eventType&(B.End|B.Cancel)){const s=e.changedPointers.map(r=>So(r,e.pointers.indexOf(r)));bl(i,e.pointers.filter((r,o)=>!s.includes(t[o])))}}function cx(i,e){const{session:t}=i,{pointers:n}=e,{length:s}=n;t.firstInput||(t.firstInput=_l(e)),s>1&&!t.firstMultiple?t.firstMultiple=_l(e):s===1&&(t.firstMultiple=!1);const{firstInput:r,firstMultiple:o}=t,a=o?o.center:r.center,c=e.center=jd(n);e.timeStamp=Date.now(),e.deltaTime=e.timeStamp-r.timeStamp,ax(t,e),e.angle=ix(a,c),e.distance=Da(a,c);const{deltaX:l,deltaY:u}=nx(t,e);e.deltaX=l,e.deltaY=u,e.offsetDirection=Fa(e.deltaX,e.deltaY);const f=Wd(e.deltaTime,e.deltaX,e.deltaY);e.overallVelocityX=f.x,e.overallVelocityY=f.y,e.overallVelocity=Math.abs(f.x)>Math.abs(f.y)?f.x:f.y,e.scale=o?sx(o.pointers,n):1,e.rotation=o?rx(o.pointers,n):0,e.maxPointers=t.prevInput?e.pointers.length>t.prevInput.maxPointers?e.pointers.length:t.prevInput.maxPointers:e.pointers.length;let d=i.element;return tx(e.srcEvent.target,d)&&(d=e.srcEvent.target),e.target=d,ox(t,e),e}function lx(i,e,t){const n=t.pointers.length,s=t.changedPointers.length,r=e&B.Start&&n-s===0,o=e&(B.End|B.Cancel)&&n-s===0;t.isFirst=!!r,t.isFinal=!!o,r&&(i.session={}),t.eventType=e;const a=cx(i,t);i.emit("hammer.input",a),i.recognize(a),i.session.prevInput=a}let ux=class{constructor(e){this.evEl="",this.evWin="",this.evTarget="",this.domHandler=t=>{this.manager.options.enable&&this.handler(t)},this.manager=e,this.element=e.element,this.target=e.options.inputTarget||e.element}callback(e,t){lx(this.manager,e,t)}init(){fr(this.element,this.evEl,this.domHandler),fr(this.target,this.evTarget,this.domHandler),fr(ml(this.element),this.evWin,this.domHandler)}destroy(){dr(this.element,this.evEl,this.domHandler),dr(this.target,this.evTarget,this.domHandler),dr(ml(this.element),this.evWin,this.domHandler)}};const fx={pointerdown:B.Start,pointermove:B.Move,pointerup:B.End,pointercancel:B.Cancel,pointerout:B.Cancel},dx="pointerdown",hx="pointermove pointerup pointercancel";class gx extends ux{constructor(e){super(e),this.evEl=dx,this.evWin=hx,this.store=this.manager.session.pointerEvents=[],this.init()}handler(e){const{store:t}=this;let n=!1;const s=fx[e.type],r=e.pointerType,o=r==="touch";let a=t.findIndex(c=>c.pointerId===e.pointerId);s&B.Start&&(e.buttons||o)?a<0&&(t.push(e),a=t.length-1):s&(B.End|B.Cancel)&&(n=!0),!(a<0)&&(t[a]=e,this.callback(s,{pointers:t,changedPointers:[e],eventType:s,pointerType:r,srcEvent:e}),n&&t.splice(a,1))}}const px=["","webkit","Moz","MS","ms","o"];function mx(i,e){const t=e[0].toUpperCase()+e.slice(1);for(const n of px){const s=n?n+t:e;if(s in i)return s}}const _x=1,vl=2,wl={touchAction:"compute",enable:!0,inputTarget:null,cssProps:{userSelect:"none",userDrag:"none",touchCallout:"none",tapHighlightColor:"rgba(0,0,0,0)"}};class yx{constructor(e,t){this.options={...wl,...t,cssProps:{...wl.cssProps,...t.cssProps},inputTarget:t.inputTarget||e},this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=e,this.input=new gx(this),this.touchAction=new ex(this,this.options.touchAction),this.toggleCssProps(!0)}set(e){return Object.assign(this.options,e),e.touchAction&&this.touchAction.update(),e.inputTarget&&(this.input.destroy(),this.input.target=e.inputTarget,this.input.init()),this}stop(e){this.session.stopped=e?vl:_x}recognize(e){const{session:t}=this;if(t.stopped)return;this.session.prevented&&e.srcEvent.preventDefault();let n;const{recognizers:s}=this;let{curRecognizer:r}=t;(!r||r&&r.state&A.Recognized)&&(r=t.curRecognizer=null);let o=0;for(;o<s.length;)n=s[o],t.stopped!==vl&&(!r||n===r||n.canRecognizeWith(r))?n.recognize(e):n.reset(),!r&&n.state&(A.Began|A.Changed|A.Ended)&&(r=t.curRecognizer=n),o++}get(e){const{recognizers:t}=this;for(let n=0;n<t.length;n++)if(t[n].options.event===e)return t[n];return null}add(e){if(Array.isArray(e)){for(const n of e)this.add(n);return this}const t=this.get(e.options.event);return t&&this.remove(t),this.recognizers.push(e),e.manager=this,this.touchAction.update(),e}remove(e){if(Array.isArray(e)){for(const n of e)this.remove(n);return this}const t=typeof e=="string"?this.get(e):e;if(t){const{recognizers:n}=this,s=n.indexOf(t);s!==-1&&(n.splice(s,1),this.touchAction.update())}return this}on(e,t){if(!e||!t)return;const{handlers:n}=this;for(const s of is(e))n[s]=n[s]||[],n[s].push(t)}off(e,t){if(!e)return;const{handlers:n}=this;for(const s of is(e))t?n[s]&&n[s].splice(n[s].indexOf(t),1):delete n[s]}emit(e,t){const n=this.handlers[e]&&this.handlers[e].slice();if(!n||!n.length)return;const s=t;s.type=e,s.preventDefault=function(){t.srcEvent.preventDefault()};let r=0;for(;r<n.length;)n[r](s),r++}destroy(){this.toggleCssProps(!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}toggleCssProps(e){const{element:t}=this;if(t){for(const[n,s]of Object.entries(this.options.cssProps)){const r=mx(t.style,n);e?(this.oldCssProps[r]=t.style[r],t.style[r]=s):t.style[r]=this.oldCssProps[r]||""}e||(this.oldCssProps={})}}}let bx=1;function vx(){return bx++}function xl(i){return i&A.Cancelled?"cancel":i&A.Ended?"end":i&A.Changed?"move":i&A.Began?"start":""}class za{constructor(e){this.options=e,this.id=vx(),this.state=A.Possible,this.simultaneous={},this.requireFail=[]}set(e){return Object.assign(this.options,e),this.manager.touchAction.update(),this}recognizeWith(e){if(Array.isArray(e)){for(const s of e)this.recognizeWith(s);return this}let t;if(typeof e=="string"){if(t=this.manager.get(e),!t)throw new Error(`Cannot find recognizer ${e}`)}else t=e;const{simultaneous:n}=this;return n[t.id]||(n[t.id]=t,t.recognizeWith(this)),this}dropRecognizeWith(e){if(Array.isArray(e)){for(const n of e)this.dropRecognizeWith(n);return this}let t;return typeof e=="string"?t=this.manager.get(e):t=e,t&&delete this.simultaneous[t.id],this}requireFailure(e){if(Array.isArray(e)){for(const s of e)this.requireFailure(s);return this}let t;if(typeof e=="string"){if(t=this.manager.get(e),!t)throw new Error(`Cannot find recognizer ${e}`)}else t=e;const{requireFail:n}=this;return n.indexOf(t)===-1&&(n.push(t),t.requireFailure(this)),this}dropRequireFailure(e){if(Array.isArray(e)){for(const n of e)this.dropRequireFailure(n);return this}let t;if(typeof e=="string"?t=this.manager.get(e):t=e,t){const n=this.requireFail.indexOf(t);n>-1&&this.requireFail.splice(n,1)}return this}hasRequireFailures(){return!!this.requireFail.find(e=>e.options.enable)}canRecognizeWith(e){return!!this.simultaneous[e.id]}emit(e){if(!e)return;const{state:t}=this;t<A.Ended&&this.manager.emit(this.options.event+xl(t),e),this.manager.emit(this.options.event,e),e.additionalEvent&&this.manager.emit(e.additionalEvent,e),t>=A.Ended&&this.manager.emit(this.options.event+xl(t),e)}tryEmit(e){this.canEmit()?this.emit(e):this.state=A.Failed}canEmit(){let e=0;for(;e<this.requireFail.length;){if(!(this.requireFail[e].state&(A.Failed|A.Possible)))return!1;e++}return!0}recognize(e){const t={...e};if(!this.options.enable){this.reset(),this.state=A.Failed;return}this.state&(A.Recognized|A.Cancelled|A.Failed)&&(this.state=A.Possible),this.state=this.process(t),this.state&(A.Began|A.Changed|A.Ended|A.Cancelled)&&this.tryEmit(t)}getEventNames(){return[this.options.event]}reset(){}}function wx(i){return Math.abs(((i+180)%360+360)%360-180)}function xx(i,e){return(e.distance===void 0||i.distance>=e.distance)&&(e.distancePerPointer===void 0||i.distancePerPointer.length>0&&i.distancePerPointer.every(t=>t>=e.distancePerPointer))&&(e.movementDeltaTime===void 0||i.movementDeltaTime>=e.movementDeltaTime)&&(e.rotation===void 0||wx(i.rotation)>=e.rotation)&&(e.scale===void 0||Math.abs(i.scale-1)>=e.scale)}class Px extends za{attrTest(e){const t=this.options.pointers;return t===0||e.pointers.length===t}coherentTest(e){const t=this.options.coherent;return!t?.length||t.some(n=>xx(e,n))}process(e){const{state:t}=this,{eventType:n}=e,s=t&(A.Began|A.Changed),r=this.attrTest(e);return s&&(n&B.Cancel||!r)?t|A.Cancelled:s||r?n&B.End?t|A.Ended:t&A.Began?t|A.Changed:A.Began:A.Failed}}const Ex=["","start","move","end","cancel"];class Sx extends za{constructor(e={}){super({enable:!0,event:"doubleclickdrag",pointers:1,interval:500,time:350,threshold:28,dragThreshold:1,pixelsPerScale:120,...e}),this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}getTouchAction(){return[ts]}getEventNames(){return Ex.map(e=>this.options.event+e)}process(e){const{options:t}=this;return e.pointers.length===t.pointers?e.eventType&B.Start?this._handleStart(e):e.eventType&B.Move?this._handleMove(e):e.eventType&B.Cancel?this._handleEnd(e,!0):e.eventType&B.End?this._handleEnd(e,!1):A.Failed:(this.reset(),A.Failed)}reset(){this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}emit(e){if(e){if(this.state===A.Began){if(!this._drag?.active||this._emittedStart)return;this._emittedStart=!0,this.manager.emit(`${this.options.event}start`,e),this.manager.emit(this.options.event,e);return}if(this.state===A.Changed){if(!this._emittedStart)return;this.manager.emit(`${this.options.event}move`,e),this.manager.emit(this.options.event,e);return}if(this.state===A.Ended){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}end`,e),this._emittedStart=!1;return}if(this.state===A.Cancelled){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}cancel`,e),this._emittedStart=!1}}}_handleStart(e){const t=this._getPointerId(e);return this._lastTap&&this._isTapMatch(e,this._lastTap)?(this._tapStart=null,this._lastTap=null,this._drag={startCenter:e.center,pointerId:t,active:!1},this._emittedStart=!1,A.Began):(this._tapStart={center:e.center,timeStamp:e.timeStamp,pointerId:t},this._lastTap=null,this._drag=null,this._emittedStart=!1,A.Failed)}_handleMove(e){if(!this._drag||!this._isSamePointer(e,this._drag.pointerId))return A.Failed;const t=this._drag.startCenter.y-e.center.y;return!this._drag.active&&Math.abs(t)<this.options.dragThreshold?A.Began:(this._drag.active=!0,e.scale=Math.pow(2,t/this.options.pixelsPerScale),this._emittedStart?A.Changed:A.Began)}_handleEnd(e,t){if(this._drag&&this._isSamePointer(e,this._drag.pointerId)){const{active:n,startCenter:s}=this._drag;if(this._drag=null,this._tapStart=null,this._lastTap=null,!n)return this._emittedStart=!1,A.Failed;const r=s.y-e.center.y;return e.scale=Math.pow(2,r/this.options.pixelsPerScale),t?A.Cancelled:A.Ended}return!this._tapStart||!this._isSamePointer(e,this._tapStart.pointerId)?(t&&this.reset(),A.Failed):(this._isValidTap(e)?this._lastTap={center:e.center,timeStamp:e.timeStamp,pointerId:this._tapStart.pointerId}:this._lastTap=null,this._tapStart=null,A.Failed)}_isTapMatch(e,t){return e.timeStamp-t.timeStamp<=this.options.interval&&Da(e.center,t.center)<=this.options.threshold}_isValidTap(e){return e.deltaTime<=this.options.time&&e.distance<=this.options.threshold}_getPointerId(e){return"pointerId"in e.srcEvent?e.srcEvent.pointerId:null}_isSamePointer(e,t){return t===null||this._getPointerId(e)===t}}class Pl extends za{constructor(e={}){super({enable:!0,event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10,...e}),this.pTime=null,this.pCenter=null,this._timer=null,this._input=null,this.count=0}getTouchAction(){return[ts]}process(e){const{options:t}=this,n=e.pointers.length===t.pointers,s=e.distance<t.threshold,r=e.deltaTime<t.time;if(this.reset(),e.eventType&B.Start&&this.count===0)return this.failTimeout();if(s&&r&&n){if(e.eventType!==B.End)return this.failTimeout();const o=this.pTime?e.timeStamp-this.pTime<t.interval:!0,a=!this.pCenter||Da(this.pCenter,e.center)<t.posThreshold;if(this.pTime=e.timeStamp,this.pCenter=e.center,!a||!o?this.count=1:this.count+=1,this._input=e,this.count%t.taps===0)return this.hasRequireFailures()?(this._timer=setTimeout(()=>{this.state=A.Recognized,this.tryEmit(this._input)},t.interval),A.Began):A.Recognized}return A.Failed}failTimeout(){return this._timer=setTimeout(()=>{this.state=A.Failed},this.options.interval),A.Failed}reset(){clearTimeout(this._timer)}emit(e){this.state===A.Recognized&&(e.tapCount=this.count,this.manager.emit(this.options.event,e))}}class Hd extends Px{constructor(){super(...arguments),this.wheelSession=null,this.wheelSessionUnsubscribe=null,this.handleWheelSessionEvent=e=>{e.device==="trackpad"&&this.handleTrackpadEvent(e)}}set(e){const{wheelSession:t,...n}=e;return t&&t!==this.wheelSession&&(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=null,this.wheelSession=t),super.set(n),this.updateWheelSessionSubscription(),this}getTrackpadInput(e,t={}){const{srcEvent:n}=e,s=t.deltaX??e.deltaX,r=t.deltaY??e.deltaY,o=Fa(s,r),a=Math.sqrt(e.deltaX*e.deltaX+e.deltaY*e.deltaY),c=n;return{pointers:[c,c],changedPointers:[c,c],pointerType:"trackpad",srcEvent:c,eventType:e.eventType,timeStamp:e.timeStamp,deltaTime:e.deltaTime,center:e.center,deltaX:s,deltaY:r,angle:Math.atan2(r,s)*180/Math.PI,distance:Math.sqrt(s*s+r*r),distancePerPointer:[a,a],movementDeltaTime:e.deltaTime,scale:1,rotation:0,direction:o,offsetDirection:o,velocity:e.velocity,velocityX:e.velocityX,velocityY:e.velocityY,overallVelocity:e.overallVelocity,overallVelocityX:e.overallVelocityX,overallVelocityY:e.overallVelocityY,maxPointers:2,target:n.target||this.manager.element,additionalEvent:"",...t}}updateWheelSessionSubscription(){const e=!!(this.wheelSession&&this.options.enable&&this.options.trackpad&&this.options.pointers===2);e&&!this.wheelSessionUnsubscribe?this.wheelSessionUnsubscribe=this.wheelSession.on(this.handleWheelSessionEvent):!e&&this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe(),this.wheelSessionUnsubscribe=null)}}const Tx=["","start","move","end","cancel","up","down","left","right"];class El extends Hd{constructor(e={}){super({enable:!0,pointers:1,event:"pan",threshold:10,direction:K.All,trackpad:!1,coherent:[],...e}),this.trackpadGesture=!1,this.pX=null,this.pY=null}getTouchAction(){const{options:{direction:e}}=this,t=[];return e&K.Horizontal&&t.push(Po),e&K.Vertical&&t.push(xo),t}getEventNames(){return Tx.map(e=>this.options.event+e)}directionTest(e){const{options:t}=this;let n=!0,{distance:s}=e,{direction:r}=e;const o=e.deltaX,a=e.deltaY;return r&t.direction||(t.direction&K.Horizontal?(r=o===0?K.None:o<0?K.Left:K.Right,n=o!==this.pX,s=Math.abs(e.deltaX)):(r=a===0?K.None:a<0?K.Up:K.Down,n=a!==this.pY,s=Math.abs(e.deltaY))),e.direction=r,n&&s>t.threshold&&!!(r&t.direction)}attrTest(e){const t=!!(this.state&A.Began),n=!(this.options.coherent?.length&&e.eventType&(B.End|B.Cancel));return super.attrTest(e)&&(t||n&&this.coherentTest(e)&&this.directionTest(e))}emit(e){this.pX=e.deltaX,this.pY=e.deltaY;const t=K[e.direction].toLowerCase();t&&(e.additionalEvent=this.options.event+t),super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=!e.srcEvent.ctrlKey,!this.trackpadGesture&&this.state&(A.Recognized|A.Cancelled|A.Failed)&&(this.state=A.Possible)),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:-e.deltaX,deltaY:-e.deltaY,velocity:-e.velocity,velocityX:-e.velocityX,velocityY:-e.velocityY,overallVelocity:-e.overallVelocity,overallVelocityX:-e.overallVelocityX,overallVelocityY:-e.overallVelocityY})),e.isFinal&&(this.trackpadGesture=!1))}}const Lx=["","start","move","end","cancel","in","out"];class Cx extends Hd{constructor(e={}){super({enable:!0,event:"pinch",threshold:0,pointers:2,trackpad:!1,coherent:[],...e}),this.trackpadGesture=!1}getTouchAction(){return[Rn]}getEventNames(){return Lx.map(e=>this.options.event+e)}attrTest(e){const t=!!this.options.coherent?.length,n=!!(this.state&A.Began),s=!(t&&e.eventType&(B.End|B.Cancel));return super.attrTest(e)&&(n||s&&(t?this.coherentTest(e):Math.abs(e.scale-1)>this.options.threshold))}emit(e){if(e.scale!==1){const t=e.scale<1?"in":"out";e.additionalEvent=this.options.event+t}super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=e.srcEvent.ctrlKey,!this.trackpadGesture&&this.state&(A.Recognized|A.Cancelled|A.Failed)&&(this.state=A.Possible)),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:0,deltaY:0,velocity:0,velocityX:0,velocityY:0,overallVelocity:0,overallVelocityX:0,overallVelocityY:0,scale:Math.exp(-e.deltaY/100)})),e.isFinal&&(this.trackpadGesture=!1))}}class Rs{constructor(e,t,n){this.element=e,this.callback=t,this.options=n}listen(e,t){t?this.element.addEventListener(e,this.handleEvent,{passive:!1}):this.element.removeEventListener(e,this.handleEvent)}}const Ax=typeof navigator<"u"&&navigator.userAgent?navigator.userAgent.toLowerCase():"",Mx=Ax.indexOf("firefox")!==-1,Ix=40,Rx=.25;class Ox extends Rs{constructor(e,t,n){n.enable=n.enable??!1,super(e,t,n),this.handleEvent=s=>{if(!this.options.enable)return;let r=s.deltaY;globalThis.WheelEvent&&(Mx&&s.deltaMode===globalThis.WheelEvent.DOM_DELTA_PIXEL&&(r/=globalThis.devicePixelRatio),s.deltaMode===globalThis.WheelEvent.DOM_DELTA_LINE&&(r*=Ix)),s.shiftKey&&r&&(r=r*Rx),this.callback({type:"wheel",center:{x:s.clientX,y:s.clientY},delta:-r,device:this.options.wheelSession?.device??"unknown",srcEvent:s,pointerType:"mouse",target:s.target})},n.enable&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{}),this.listen("wheel",!0))}destroy(){this.listen("wheel",!1),this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0}enableEventType(e,t){e==="wheel"&&this.options.enable!==t&&(this.options.enable=t,t&&!this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{})),this.listen("wheel",t),t||(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0))}}const Bx=4.000244140625,Sl=40,kx=0,Dx=1,Fx=40,Tl=40,zx=120,Nx={classificationDelay:32,endDelay:80};class $x{constructor(e,t={}){this.subscriptions=new Map,this.session=null,this.classificationTimer=null,this.endTimer=null,this.pressedControlKeys=new Set,this.listeningForControlKeys=!1,this.handleEvent=n=>{if(!this.hasSubscribers)return"unknown";const s=Gx(n,this.pressedControlKeys.size>0);let r=this.session;if(r&&s.timeStamp-r.lastTimeStamp>=this.options.endDelay){if(this.end(),!this.hasSubscribers)return"unknown";r=null}r?(this.scheduleEnd(),this.addSample(r,s)):(r=this.startPendingSession(s),this.scheduleEnd());let{device:o}=r;return o==="unknown"&&(o=hr(r.samples,!1),o!=="unknown"&&this.begin(r,o)),o},this.finishClassification=()=>{if(this.classificationTimer=null,!this.session||this.session.device!=="unknown")return;const n=this.session,s=hr(n.samples,!0);this.begin(n,s==="unknown"?"mouse":s)},this.end=()=>{if(!this.session)return;if(this.session.device==="unknown"){const s=this.session,r=hr(s.samples,!0);this.begin(s,r==="unknown"?"mouse":r)}if(!this.session)return;const n=this.session;this.emit(B.End,n.lastEvent),this.reset()},this.handleKeyDown=n=>{n.key==="Control"&&this.pressedControlKeys.add(n.code||n.key)},this.handleKeyUp=n=>{n.key==="Control"&&(n.code?this.pressedControlKeys.delete(n.code):this.pressedControlKeys.clear())},this.handleWindowBlur=()=>{this.pressedControlKeys.clear()},this.element=e,this.options={...Nx,...t},this.element?.addEventListener("wheel",this.handleEvent,{passive:!0})}get hasSubscribers(){return this.subscriptions.size>0}get device(){return this.session?.device??"unknown"}on(e){const t={listener:e};return this.subscriptions.set(e,t),this.updateControlKeyEventListeners(),()=>{this.subscriptions.get(e)===t&&this.off(e)}}off(e){this.subscriptions.delete(e),this.updateControlKeyEventListeners(),this.hasSubscribers||this.reset()}cancel(){const e=this.session;e&&e.device!=="unknown"&&this.emit(B.Cancel,e.lastEvent),this.reset()}destroy(){this.cancel(),this.subscriptions.clear(),this.updateControlKeyEventListeners(),this.element?.removeEventListener("wheel",this.handleEvent)}startPendingSession(e){const t={samples:[e],device:"unknown",firstTimeStamp:e.timeStamp,lastTimeStamp:e.timeStamp,totalDeltaX:e.deltaX,totalDeltaY:e.deltaY,velocityX:0,velocityY:0,lastEvent:e.event};return this.session=t,this.classificationTimer=globalThis.setTimeout(this.finishClassification,this.options.classificationDelay),t}addSample(e,t){if(e.samples.push(t),e.lastTimeStamp=t.timeStamp,e.lastEvent=t.event,e.totalDeltaX+=t.deltaX,e.totalDeltaY+=t.deltaY,e.device!=="unknown"){const n=e.samples[e.samples.length-2],s=t.timeStamp-n.timeStamp;e.velocityX=s>0?t.deltaX/s:0,e.velocityY=s>0?t.deltaY/s:0,this.emit(B.Move,t.event,{velocityX:e.velocityX,velocityY:e.velocityY})}}begin(e,t){e.device=t,this.clearClassificationTimer(),this.emit(B.Start,e.samples[0].event);const n=e.lastTimeStamp-e.firstTimeStamp;e.velocityX=n>0?e.totalDeltaX/n:0,e.velocityY=n>0?e.totalDeltaY/n:0,this.emit(B.Move,e.lastEvent,{velocityX:e.velocityX,velocityY:e.velocityY})}scheduleEnd(){this.clearEndTimer(),this.endTimer=globalThis.setTimeout(this.end,this.options.endDelay)}emit(e,t,n){const s=this.session;if(!s||s.device==="unknown")return;const r=e===B.Start,o=e===B.End||e===B.Cancel,a=r?s.firstTimeStamp:s.lastTimeStamp,c=r?0:Math.max(0,a-s.firstTimeStamp),l=r?0:s.totalDeltaX,u=r?0:s.totalDeltaY,f=c>0?l/c:0,d=c>0?u/c:0,h=r?0:n?.velocityX??s.velocityX,g=r?0:n?.velocityY??s.velocityY,p={eventType:e,device:s.device,srcEvent:t,timeStamp:a,center:{x:t.clientX,y:t.clientY},deltaX:l,deltaY:u,deltaTime:c,velocity:Math.abs(h)>Math.abs(g)?h:g,velocityX:h,velocityY:g,overallVelocity:Math.abs(f)>Math.abs(d)?f:d,overallVelocityX:f,overallVelocityY:d,isFirst:r,isFinal:o};for(const{listener:m}of[...this.subscriptions.values()])m(p)}reset(){this.clearClassificationTimer(),this.clearEndTimer(),this.session=null}clearClassificationTimer(){this.classificationTimer!==null&&(globalThis.clearTimeout(this.classificationTimer),this.classificationTimer=null)}clearEndTimer(){this.endTimer!==null&&(globalThis.clearTimeout(this.endTimer),this.endTimer=null)}updateControlKeyEventListeners(){const e=this.hasSubscribers,t=Ux();!t||e===this.listeningForControlKeys||(this.listeningForControlKeys=e,e?(t.addEventListener("keydown",this.handleKeyDown,!0),t.addEventListener("keyup",this.handleKeyUp,!0),t.addEventListener("blur",this.handleWindowBlur)):(t.removeEventListener("keydown",this.handleKeyDown,!0),t.removeEventListener("keyup",this.handleKeyUp,!0),t.removeEventListener("blur",this.handleWindowBlur),this.pressedControlKeys.clear()))}}function Ux(){return typeof window<"u"?window:globalThis.document?.defaultView}function Gx(i,e){let t=i.deltaX,n=i.deltaY;return i.deltaMode===Dx&&(t*=Sl,n*=Sl),{event:i,timeStamp:i.timeStamp,deltaX:t,deltaY:n,isControlKeyDown:e}}function hr(i,e){return i.some(({event:t,isControlKeyDown:n})=>t.ctrlKey&&!n)?"trackpad":i.some(({event:t})=>t.deltaMode!==kx)||i.some(Vx)||i.every(({event:t})=>{const n=t.wheelDelta;return n!==void 0&&Math.abs(n)%40===0})?"mouse":i.some(({deltaX:t})=>t!==0)||i.length>1&&jx(i)?"trackpad":e?"mouse":"unknown"}function Vx({event:i,deltaX:e,deltaY:t}){if(e!==0||t===0)return!1;const n=Math.abs(t/Bx);if(Number.isInteger(n))return!0;const s=i.wheelDelta;return typeof s=="number"&&s!==0&&s%zx===0}function jx(i){for(let e=0;e<i.length;e++){const t=i[e];if(Math.abs(t.deltaX)>Tl||Math.abs(t.deltaY)>Tl||e>0&&t.timeStamp-i[e-1].timeStamp>Fx)return!1}return!0}const Ll=["mousedown","mousemove","mouseup","mouseover","mouseout","mouseenter","mouseleave"];class Wx extends Rs{constructor(e,t,n){super(e,t,{enable:!0,...n}),this.handleEvent=r=>{this.handleOverEvent(r),this.handleOutEvent(r),this.handleEnterEvent(r),this.handleLeaveEvent(r),this.handleMoveEvent(r)},this.pressed=!1;const{enable:s=!1}=this.options;this.enableMoveEvent=s,this.enableLeaveEvent=s,this.enableEnterEvent=s,this.enableOutEvent=s,this.enableOverEvent=s,s&&Ll.forEach(r=>this.listen(r,!0))}destroy(){Ll.forEach(e=>this.listen(e,!1))}enableEventType(e,t){switch(e){case"pointermove":this.enableMoveEvent!==t&&(this.enableMoveEvent=t,this.listen("mousedown",t),this.listen("mousemove",t),this.listen("mouseup",t));break;case"pointerover":this.enableOverEvent!==t&&(this.enableOverEvent=t,this.listen("mouseover",t));break;case"pointerout":this.enableOutEvent!==t&&(this.enableOutEvent=t,this.listen("mouseout",t));break;case"pointerenter":this.enableEnterEvent!==t&&(this.enableEnterEvent=t,this.listen("mouseenter",t));break;case"pointerleave":this.enableLeaveEvent!==t&&(this.enableLeaveEvent=t,this.listen("mouseleave",t));break}}handleOverEvent(e){this.enableOverEvent&&e.type==="mouseover"&&this._emit("pointerover",e)}handleOutEvent(e){this.enableOutEvent&&e.type==="mouseout"&&this._emit("pointerout",e)}handleEnterEvent(e){this.enableEnterEvent&&e.type==="mouseenter"&&this._emit("pointerenter",e)}handleLeaveEvent(e){this.enableLeaveEvent&&e.type==="mouseleave"&&this._emit("pointerleave",e)}handleMoveEvent(e){if(this.enableMoveEvent)switch(e.type){case"mousedown":e.button>=0&&(this.pressed=!0);break;case"mousemove":e.buttons===0&&(this.pressed=!1),this.pressed||this._emit("pointermove",e);break;case"mouseup":this.pressed=!1;break}}_emit(e,t){this.callback({type:e,center:{x:t.clientX,y:t.clientY},srcEvent:t,pointerType:"mouse",target:t.target})}}const Cl=["keydown","keyup"];class Hx extends Rs{constructor(e,t,n){super(e,t,{enable:!0,tabIndex:0,...n}),this.handleEvent=r=>{const o=r.target||r.srcElement;o.tagName==="INPUT"&&o.type==="text"||o.tagName==="TEXTAREA"||(this.enableDownEvent&&r.type==="keydown"&&this.callback({type:"keydown",srcEvent:r,key:r.key,target:r.target}),this.enableUpEvent&&r.type==="keyup"&&this.callback({type:"keyup",srcEvent:r,key:r.key,target:r.target}))};const{enable:s=!1}=this.options;this.enableDownEvent=s,this.enableUpEvent=s,e.tabIndex=this.options.tabIndex,e.style.outline="none",s&&Cl.forEach(r=>this.listen(r,!0))}destroy(){Cl.forEach(e=>this.listen(e,!1))}enableEventType(e,t){e==="keydown"&&this.enableDownEvent!==t&&(this.enableDownEvent=t,this.listen(e,t)),e==="keyup"&&this.enableUpEvent!==t&&(this.enableUpEvent=t,this.listen(e,t))}}class Yx extends Rs{constructor(e,t,n){n.enable=n.enable??!1,super(e,t,n),this.handleEvent=s=>{this.options.enable&&this.callback({type:"contextmenu",center:{x:s.clientX,y:s.clientY},srcEvent:s,pointerType:"mouse",target:s.target})},n.enable&&this.listen("contextmenu",!0)}destroy(){this.listen("contextmenu",!1)}enableEventType(e,t){e==="contextmenu"&&this.options.enable!==t&&(this.options.enable=t,this.listen("contextmenu",t))}}const Al=1,To=2,Ml=4,qx={pointerdown:Al,pointermove:To,pointerup:Ml,mousedown:Al,mousemove:To,mouseup:Ml},Xx=0,Zx=1,Kx=2,Qx=1,Jx=2,eP=4;function tP(i){const e=qx[i.srcEvent.type];if(!e)return null;const{buttons:t,button:n}=i.srcEvent;let s=!1,r=!1,o=!1;return e===To?(s=!!(t&Qx),r=!!(t&eP),o=!!(t&Jx)):(s=n===Xx,r=n===Zx,o=n===Kx),{leftButton:s,middleButton:r,rightButton:o}}function iP(i,e){const t=i.center;if(!t)return null;const n=e.getBoundingClientRect(),s=n.width/e.offsetWidth||1,r=n.height/e.offsetHeight||1,o={x:(t.x-n.left-e.clientLeft)/s,y:(t.y-n.top-e.clientTop)/r};return{center:t,offsetCenter:o}}const nP={srcElement:"root",priority:0};class sP{constructor(e,t){this.handleEvent=n=>{if(this.isEmpty())return;const s=this._normalizeEvent(n);let r=n.srcEvent.target;for(;r&&r!==s.rootElement;){if(this._emit(s,r),s.handled)return;r=r.parentNode}this._emit(s,"root")},this.eventManager=e,this.recognizerName=t,this.handlers=[],this.handlersByElement=new Map,this._active=!1}isEmpty(){return!this._active}add(e,t,n,s=!1,r=!1){const{handlers:o,handlersByElement:a}=this,c={...nP,...n};let l=a.get(c.srcElement);l||(l=[],a.set(c.srcElement,l));const u={type:e,handler:t,srcElement:c.srcElement,priority:c.priority};s&&(u.once=!0),r&&(u.passive=!0),o.push(u),this._active=this._active||!u.passive;let f=l.length-1;for(;f>=0&&!(l[f].priority>=u.priority);)f--;l.splice(f+1,0,u)}remove(e,t){const{handlers:n,handlersByElement:s}=this;for(let r=n.length-1;r>=0;r--){const o=n[r];if(o.type===e&&o.handler===t){n.splice(r,1);const a=s.get(o.srcElement);a.splice(a.indexOf(o),1),a.length===0&&s.delete(o.srcElement)}}this._active=n.some(r=>!r.passive)}_emit(e,t){const n=this.handlersByElement.get(t);if(n){let s=!1;const r=()=>{e.handled=!0},o=()=>{e.handled=!0,s=!0},a=[];for(let c=0;c<n.length;c++){const{type:l,handler:u,once:f}=n[c];if(u({...e,type:l,stopPropagation:r,stopImmediatePropagation:o}),f&&a.push(n[c]),s)break}for(let c=0;c<a.length;c++){const{type:l,handler:u}=a[c];this.remove(l,u)}}}_normalizeEvent(e){const t=this.eventManager.getElement();return{...e,...tP(e),...iP(e,t),preventDefault:()=>{e.srcEvent.preventDefault()},stopImmediatePropagation:null,stopPropagation:null,handled:!1,rootElement:t}}}function rP(i){if("recognizer"in i)return i;let e;const t=Array.isArray(i)?[...i]:[i];if(typeof t[0]=="function"){const n=t.shift(),s=t.shift()||{};e=new n(s)}else e=t.shift();return{recognizer:e,recognizeWith:typeof t[0]=="string"?[t[0]]:t[0],requireFailure:typeof t[1]=="string"?[t[1]]:t[1]}}class oP{constructor(e=null,t={}){if(this._onBasicInput=n=>{this.manager.emit(n.srcEvent.type,n)},this._onOtherEvent=n=>{this.manager.emit(n.type,n)},this.options={recognizers:[],events:{},touchAction:"compute",tabIndex:0,cssProps:{},...t},this.events=new Map,this.element=e,this.wheelSession=new $x(e),!!e){this.manager=new yx(e,this.options);for(const n of this.options.recognizers){const{recognizer:s,recognizeWith:r,requireFailure:o}=rP(n);this.manager.add(s),r&&s.recognizeWith(r),o&&s.requireFailure(o)}this.manager.on("hammer.input",this._onBasicInput),this.wheelInput=new Ox(e,this._onOtherEvent,{enable:!1,wheelSession:this.wheelSession}),this.moveInput=new Wx(e,this._onOtherEvent,{enable:!1}),this.keyInput=new Hx(e,this._onOtherEvent,{enable:!1,tabIndex:t.tabIndex}),this.contextmenuInput=new Yx(e,this._onOtherEvent,{enable:!1}),this.on(this.options.events)}}getElement(){return this.element}destroy(){if(!this.element){this.wheelSession.destroy();return}this.wheelInput.destroy(),this.wheelSession.destroy(),this.moveInput.destroy(),this.keyInput.destroy(),this.contextmenuInput.destroy(),this.manager.destroy()}on(e,t,n){this._addEventHandler(e,t,n,!1)}once(e,t,n){this._addEventHandler(e,t,n,!0)}watch(e,t,n){this._addEventHandler(e,t,n,!1,!0)}off(e,t){this._removeEventHandler(e,t)}emit(e){this.manager?.emit(e.type,e)}_toggleRecognizer(e,t){const{manager:n}=this;if(!n)return;const s=n.get(e);s&&(s.set({enable:t,wheelSession:this.wheelSession}),n.touchAction.update()),this.wheelInput?.enableEventType(e,t),this.moveInput?.enableEventType(e,t),this.keyInput?.enableEventType(e,t),this.contextmenuInput?.enableEventType(e,t)}_addEventHandler(e,t,n,s,r){if(typeof e!="string"){n=t;for(const[l,u]of Object.entries(e))this._addEventHandler(l,u,n,s,r);return}const{manager:o,events:a}=this;if(!o)return;let c=a.get(e);if(!c){const l=this._getRecognizerName(e)||e;c=new sP(this,l),a.set(e,c),o&&o.on(e,c.handleEvent)}c.add(e,t,n,s,r),c.isEmpty()||this._toggleRecognizer(c.recognizerName,!0)}_removeEventHandler(e,t){if(typeof e!="string"){for(const[r,o]of Object.entries(e))this._removeEventHandler(r,o);return}const{events:n}=this,s=n.get(e);if(s&&(s.remove(e,t),s.isEmpty())){const{recognizerName:r}=s;let o=!1;for(const a of n.values())if(a.recognizerName===r&&!a.isEmpty()){o=!0;break}o||this._toggleRecognizer(r,!1)}}_getRecognizerName(e){return this.manager.recognizers.find(t=>t.getEventNames().includes(e))?.options.event}}const se={WEB_MERCATOR:1,GLOBE:2,WEB_MERCATOR_AUTO_OFFSET:4,IDENTITY:0},Ue={common:0,meters:1,pixels:2},On={click:"onClick",dblclick:"onClick",panstart:"onDragStart",panmove:"onDrag",panend:"onDragEnd"},Il={multipan:[El,{threshold:10,pointers:2,trackpad:!0}],pinch:[Cx,{trackpad:!0},null,["multipan"]],pan:[El,{threshold:1},["pinch"],["multipan"]],dblclick:[Pl,{event:"dblclick",taps:2,enable:!1}],dblclickdrag:[Sx,{event:"dblclickdrag",enable:!1},["dblclick"],null],click:[Pl,{event:"click"},["dblclickdrag"],["dblclick","dblclickdrag"]]};function aP(i,e){if(i===e)return!0;if(Array.isArray(i)){const t=i.length;if(!e||e.length!==t)return!1;for(let n=0;n<t;n++)if(i[n]!==e[n])return!1;return!0}return!1}function Ki(i){let e={},t;return n=>{for(const s in n)if(!aP(n[s],e[s])){t=i(n),e=n;break}return t}}const Rl=[0,0,0,0],cP=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],Yd=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],lP=[0,0,0],qd=[0,0,0],uP={default:-1,cartesian:0,lnglat:1,"meter-offsets":2,"lnglat-offsets":3};function Os(i){const e=uP[i];if(e===void 0)throw new Error(`Invalid coordinateSystem: ${i}`);return e}const fP=Ki(gP);function Xd(i,e,t=qd){t.length<3&&(t=[t[0],t[1],0]);let n=t,s,r=!0;switch(e==="lnglat-offsets"||e==="meter-offsets"?s=t:s=i.isGeospatial?[Math.fround(i.longitude),Math.fround(i.latitude),0]:null,i.projectionMode){case se.WEB_MERCATOR:e==="lnglat"?(s=[0,0,0],r=!1):e==="cartesian"&&(r=!1,s=i.unprojectPosition([Math.fround(i.center[0]),Math.fround(i.center[1]),0]));break;case se.WEB_MERCATOR_AUTO_OFFSET:e==="lnglat"?n=s:e==="cartesian"&&(n=[Math.fround(i.center[0]),Math.fround(i.center[1]),0],s=i.unprojectPosition(n),n[0]-=t[0],n[1]-=t[1],n[2]-=t[2]);break;case se.IDENTITY:n=i.position.map(Math.fround),n[2]=n[2]||0;break;case se.GLOBE:r=!1,s=null;break;default:r=!1}return{geospatialOrigin:s,shaderCoordinateOrigin:n,offsetMode:r}}function dP(i,e,t){const{viewMatrixUncentered:n,projectionMatrix:s}=i;let{viewMatrix:r,viewProjectionMatrix:o}=i,a=Rl,c=Rl,l=i.cameraPosition;const{geospatialOrigin:u,shaderCoordinateOrigin:f,offsetMode:d}=Xd(i,e,t);return d&&(c=i.projectPosition(u||f),l=[l[0]-c[0],l[1]-c[1],l[2]-c[2]],c[3]=1,a=Et([],c,o),r=n||r,o=ft([],s,r),o=ft([],o,cP)),{viewMatrix:r,viewProjectionMatrix:o,projectionCenter:a,originCommon:c,cameraPosCommon:l,shaderCoordinateOrigin:f,geospatialOrigin:u}}function hP({viewport:i,devicePixelRatio:e=1,modelMatrix:t=null,coordinateSystem:n="default",coordinateOrigin:s=qd,autoWrapLongitude:r=!1}){n==="default"&&(n=i.isGeospatial?"lnglat":"cartesian");const o=fP({viewport:i,devicePixelRatio:e,coordinateSystem:n,coordinateOrigin:s});return o.wrapLongitude=r,o.modelMatrix=t||Yd,o}function gP({viewport:i,devicePixelRatio:e,coordinateSystem:t,coordinateOrigin:n}){const{projectionCenter:s,viewProjectionMatrix:r,originCommon:o,cameraPosCommon:a,shaderCoordinateOrigin:c,geospatialOrigin:l}=dP(i,t,n),u=i.getDistanceScales(),f=[i.width*e,i.height*e],d=Et([],[0,0,-i.focalDistance,1],i.projectionMatrix)[3]||1,h={coordinateSystem:Os(t),projectionMode:i.projectionMode,coordinateOrigin:c,commonOrigin:o.slice(0,3),center:s,pseudoMeters:!!i._pseudoMeters,viewportSize:f,devicePixelRatio:e,focalDistance:d,commonUnitsPerMeter:u.unitsPerMeter,commonUnitsPerWorldUnit:u.unitsPerMeter,commonUnitsPerWorldUnit2:lP,scale:i.scale,wrapLongitude:!1,viewProjectionMatrix:r,modelMatrix:Yd,cameraPosition:a};if(l){const g=i.getDistanceScales(l);switch(t){case"meter-offsets":h.commonUnitsPerWorldUnit=g.unitsPerMeter,h.commonUnitsPerWorldUnit2=g.unitsPerMeter2;break;case"lnglat":case"lnglat-offsets":i._pseudoMeters||(h.commonUnitsPerMeter=g.unitsPerMeter),h.commonUnitsPerWorldUnit=g.unitsPerDegree,h.commonUnitsPerWorldUnit2=g.unitsPerDegree2;break;case"cartesian":h.commonUnitsPerWorldUnit=[1,1,g.unitsPerMeter[2]],h.commonUnitsPerWorldUnit2=[0,0,g.unitsPerMeter2[2]];break}}if(i.projectionMode===se.GLOBE&&t==="meter-offsets"){const m=n[0]*Math.PI/180,_=n[1]*Math.PI/180,b=Math.cos(_),y=((n[2]||0)/6370972+1)*256;h.commonOrigin=[Math.sin(m)*b*y,-Math.cos(m)*b*y,Math.sin(_)*y]}return h}const pP=["default","lnglat","meter-offsets","lnglat-offsets","cartesian"],mP=pP.map(i=>`const COORDINATE_SYSTEM_${i.toUpperCase().replaceAll("-","_")}: i32 = ${Os(i)};`).join(""),_P=Object.keys(se).map(i=>`const PROJECTION_MODE_${i}: i32 = ${se[i]};`).join(""),yP=Object.keys(Ue).map(i=>`const UNIT_${i.toUpperCase()}: i32 = ${Ue[i]};`).join(""),bP=`${mP}
${_P}
${yP}

const TILE_SIZE: f32 = 512.0;
const PI: f32 = 3.1415926536;
const WORLD_SCALE: f32 = TILE_SIZE / (PI * 2.0);
const ZERO_64_LOW: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
const EARTH_RADIUS: f32 = 6370972.0; // meters
const GLOBE_RADIUS: f32 = 256.0;

// -----------------------------------------------------------------------------
// Uniform block (converted from GLSL uniform block)
// -----------------------------------------------------------------------------
struct ProjectUniforms {
  wrapLongitude: i32,
  coordinateSystem: i32,
  commonUnitsPerMeter: vec3<f32>,
  projectionMode: i32,
  scale: f32,
  commonUnitsPerWorldUnit: vec3<f32>,
  commonUnitsPerWorldUnit2: vec3<f32>,
  center: vec4<f32>,
  modelMatrix: mat4x4<f32>,
  viewProjectionMatrix: mat4x4<f32>,
  viewportSize: vec2<f32>,
  devicePixelRatio: f32,
  focalDistance: f32,
  cameraPosition: vec3<f32>,
  coordinateOrigin: vec3<f32>,
  commonOrigin: vec3<f32>,
  pseudoMeters: i32,
};

@group(0) @binding(auto)
var<uniform> project: ProjectUniforms;

// -----------------------------------------------------------------------------
// Geometry data shared across the project helpers.
// The active layer shader is responsible for populating this private module
// state before calling the project functions below.
// -----------------------------------------------------------------------------

// Structure to carry additional geometry data used by deck.gl filters.
struct Geometry {
  worldPosition: vec3<f32>,
  worldPositionAlt: vec3<f32>,
  position: vec4<f32>,
  normal: vec3<f32>,
  uv: vec2<f32>,
  pickingColor: vec3<f32>,
};

var<private> geometry: Geometry;
`,vP=`${bP}

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

// Returns an adjustment factor for commonUnitsPerMeter
fn _project_size_at_latitude(lat: f32) -> f32 {
  let y = clamp(lat, -89.9, 89.9);
  return 1.0 / cos(radians(y));
}

// Overloaded version: scales a value in meters at a given latitude.
fn _project_size_at_latitude_m(meters: f32, lat: f32) -> f32 {
  return meters * project.commonUnitsPerMeter.z * _project_size_at_latitude(lat);
}

// Computes a non-linear scale factor based on geometry.
// (Note: This function relies on "geometry" being provided.)
fn project_size() -> f32 {
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR &&
      project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
      project.pseudoMeters == 0) {
    if (geometry.position.w == 0.0) {
      return _project_size_at_latitude(geometry.worldPosition.y);
    }
    let y: f32 = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
    let y2 = y * y;
    let y4 = y2 * y2;
    let y6 = y4 * y2;
    return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
  }
  return 1.0;
}

// Overloads to scale offsets (meters to world units)
fn project_size_float(meters: f32) -> f32 {
  return meters * project.commonUnitsPerMeter.z * project_size();
}

fn project_size_vec2(meters: vec2<f32>) -> vec2<f32> {
  return meters * project.commonUnitsPerMeter.xy * project_size();
}

fn project_size_vec3(meters: vec3<f32>) -> vec3<f32> {
  return meters * project.commonUnitsPerMeter * project_size();
}

fn project_size_vec4(meters: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(meters.xyz * project.commonUnitsPerMeter, meters.w);
}

// Returns a rotation matrix aligning the z‑axis with the given up vector.
fn project_get_orientation_matrix(up: vec3<f32>) -> mat3x3<f32> {
  let uz = normalize(up);
  let ux = select(
    vec3<f32>(1.0, 0.0, 0.0),
    normalize(vec3<f32>(uz.y, -uz.x, 0.0)),
    abs(uz.z) == 1.0
  );
  let uy = cross(uz, ux);
  return mat3x3<f32>(ux, uy, uz);
}

// Since WGSL does not support "out" parameters, we return a struct.
struct RotationResult {
  needsRotation: bool,
  transform: mat3x3<f32>,
};

fn project_needs_rotation(commonPosition: vec3<f32>) -> RotationResult {
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    return RotationResult(true, project_get_orientation_matrix(commonPosition));
  } else {
    return RotationResult(false, mat3x3<f32>());  // identity alternative if needed
  };
}

// Projects a normal vector from the current coordinate system to world space.
fn project_normal(vector: vec3<f32>) -> vec3<f32> {
  let normal_modelspace = project.modelMatrix * vec4<f32>(vector, 0.0);
  var n = normalize(normal_modelspace.xyz * project.commonUnitsPerMeter);
  let rotResult = project_needs_rotation(geometry.position.xyz);
  if (rotResult.needsRotation) {
    n = rotResult.transform * n;
  }
  return n;
}

// Applies a scale offset based on y-offset (dy)
fn project_offset_(offset: vec4<f32>) -> vec4<f32> {
  let dy: f32 = offset.y;
  let commonUnitsPerWorldUnit = project.commonUnitsPerWorldUnit + project.commonUnitsPerWorldUnit2 * dy;
  return vec4<f32>(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

// Projects lng/lat coordinates to a unit tile [0,1]
fn project_mercator_(lnglat: vec2<f32>) -> vec2<f32> {
  var x = lnglat.x;
  if (project.wrapLongitude != 0) {
    x = ((x + 180.0) % 360.0) - 180.0;
  }
  let y = clamp(lnglat.y, -89.9, 89.9);
  return vec2<f32>(
    radians(x) + PI,
    PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// Projects lng/lat/z coordinates for a globe projection.
fn project_globe_(lnglatz: vec3<f32>) -> vec3<f32> {
  let lambda = radians(lnglatz.x);
  let phi = radians(lnglatz.y);
  let cosPhi = cos(phi);
  let D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;
  return vec3<f32>(
    sin(lambda) * cosPhi,
    -cos(lambda) * cosPhi,
    sin(phi)
  ) * D;
}

// Mercator y of project_mercator_'s latitude clamp: log(tan(PI / 4 + radians(89.9) / 2))
const MAX_MERCATOR_Y: f32 = 7.0439589847;

// Inverse of project_globe_ followed by project_mercator_, without forming lat/lng:
// Mercator y = atanh(sin(lat)) = log((D + |z|) / |xy|), which stays accurate near the poles
fn project_globe_to_mercator_(spherePos: vec3<f32>) -> vec2<f32> {
  let D = length(spherePos);
  let h = max(length(spherePos.xy), 1e-20);
  let y = sign(spherePos.z) * min(log((D + abs(spherePos.z)) / h), MAX_MERCATOR_Y);
  let x = atan2(spherePos.x, -spherePos.y);
  return (vec2<f32>(x, y) + PI) * WORLD_SCALE;
}

// Flat common space (Mercator or cartesian) of a common position; identity except under GLOBE.
// WGSL has no function overloading: pass position.xyz for a vec4. See project.glsl.ts.
fn project_common_position_to_flat(commonPosition: vec3<f32>) -> vec2<f32> {
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    return project_globe_to_mercator_(commonPosition);
  }
  return commonPosition.xy;
}

// World copy of a flat x nearest to referenceX
fn project_wrap_flat_x_(x: f32, referenceX: f32) -> f32 {
  return x - TILE_SIZE * floor((x - referenceX) / TILE_SIZE + 0.5);
}

// Flat position in the world copy nearest to referenceX (e.g. a bounds centre); geospatial only
fn project_common_position_to_flat_wrapped(commonPosition: vec3<f32>, referenceX: f32) -> vec2<f32> {
  var flatPosition = project_common_position_to_flat(commonPosition);
  if (project.projectionMode != PROJECTION_MODE_IDENTITY) {
    flatPosition.x = project_wrap_flat_x_(flatPosition.x, referenceX);
  }
  return flatPosition;
}

// Flat position continuous across the antimeridian under GLOBE (seam moved opposite referenceX,
// e.g. the camera); identity for flat modes. For periodic patterns.
fn project_common_position_to_flat_continuous(commonPosition: vec3<f32>, referenceX: f32) -> vec2<f32> {
  var flatPosition = project_common_position_to_flat(commonPosition);
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    flatPosition.x = project_wrap_flat_x_(flatPosition.x, referenceX);
  }
  return flatPosition;
}

// Projects positions (with an optional 64-bit low part) from the input
// coordinate system to the common space.
fn project_position_vec4_f64(position: vec4<f32>, position64Low: vec3<f32>) -> vec4<f32> {
  var position_world = project.modelMatrix * position;

  // Work around for a Mac+NVIDIA bug:
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4<f32>(
        project_mercator_(position_world.xy),
        _project_size_at_latitude_m(position_world.z, position_world.y),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
      position_world = vec4f(position_world.xyz + project.coordinateOrigin, position_world.w);
    }
  }
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4<f32>(
        project_globe_(position_world.xyz),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS) {
      let enuMatrix = project_get_orientation_matrix(project.commonOrigin);
      let metersToCommon = GLOBE_RADIUS / EARTH_RADIUS;
      let offsetCommon = (enuMatrix * vec3<f32>(-position_world.x, -position_world.y, position_world.z)) * metersToCommon;
      return vec4<f32>(project.commonOrigin + offsetCommon, position_world.w);
    }
  }
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      if (abs(position_world.y - project.coordinateOrigin.y) > 0.25) {
        return vec4<f32>(
          project_mercator_(position_world.xy) - project.commonOrigin.xy,
          project_size_float(position_world.z),
          position_world.w
        );
      }
    }
  }
  if (project.projectionMode == PROJECTION_MODE_IDENTITY ||
      (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
       (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
        project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
    position_world = vec4f(position_world.xyz - project.coordinateOrigin, position_world.w);
  }

  return project_offset_(position_world) +
         project_offset_(project.modelMatrix * vec4<f32>(position64Low, 0.0));
}

// Overloaded versions for different input types.
fn project_position_vec4_f32(position: vec4<f32>) -> vec4<f32> {
  return project_position_vec4_f64(position, ZERO_64_LOW);
}

fn project_position_vec3_f64(position: vec3<f32>, position64Low: vec3<f32>) -> vec3<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 1.0), position64Low);
  return projected_position.xyz;
}

fn project_position_vec3_f32(position: vec3<f32>) -> vec3<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 1.0), ZERO_64_LOW);
  return projected_position.xyz;
}

fn project_position_vec2_f32(position: vec2<f32>) -> vec2<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 0.0, 1.0), ZERO_64_LOW);
  return projected_position.xy;
}

// Transforms a common space position to clip space.
fn project_common_position_to_clipspace_with_projection(position: vec4<f32>, viewProjectionMatrix: mat4x4<f32>, center: vec4<f32>) -> vec4<f32> {
  var clipPosition = viewProjectionMatrix * position + center;
  // deck.gl projection matrices use WebGL's [-w, w] depth range; WebGPU clips z to [0, w].
  clipPosition.z = (clipPosition.z + clipPosition.w) * 0.5;
  return clipPosition;
}

// Uses the project viewProjectionMatrix and center.
fn project_common_position_to_clipspace(position: vec4<f32>) -> vec4<f32> {
  return project_common_position_to_clipspace_with_projection(position, project.viewProjectionMatrix, project.center);
}

// Returns a clip space offset corresponding to a given number of screen pixels.
fn project_pixel_size_to_clipspace(pixels: vec2<f32>) -> vec2<f32> {
  let offset = pixels / project.viewportSize * project.devicePixelRatio * 2.0;
  return offset * project.focalDistance;
}

fn project_meter_size_to_pixel(meters: f32) -> f32 {
  return project_size_float(meters) * project.scale;
}

fn project_unit_size_to_pixel(size: f32, unit: i32) -> f32 {
  if (unit == UNIT_METERS) {
    return project_meter_size_to_pixel(size);
  } else if (unit == UNIT_COMMON) {
    return size * project.scale;
  }
  // UNIT_PIXELS: no scaling applied.
  return size;
}

fn project_pixel_size_float(pixels: f32) -> f32 {
  return pixels / project.scale;
}

fn project_pixel_size_vec2(pixels: vec2<f32>) -> vec2<f32> {
  return pixels / project.scale;
}
`,wP=["default","lnglat","meter-offsets","lnglat-offsets","cartesian"],xP=wP.map(i=>`const int COORDINATE_SYSTEM_${i.toUpperCase().replaceAll("-","_")} = ${Os(i)};`).join(""),PP=Object.keys(se).map(i=>`const int PROJECTION_MODE_${i} = ${se[i]};`).join(""),EP=Object.keys(Ue).map(i=>`const int UNIT_${i.toUpperCase()} = ${Ue[i]};`).join(""),SP=`${xP}
${PP}
${EP}
layout(std140) uniform projectUniforms {
bool wrapLongitude;
int coordinateSystem;
vec3 commonUnitsPerMeter;
int projectionMode;
float scale;
vec3 commonUnitsPerWorldUnit;
vec3 commonUnitsPerWorldUnit2;
vec4 center;
mat4 modelMatrix;
mat4 viewProjectionMatrix;
vec2 viewportSize;
float devicePixelRatio;
float focalDistance;
vec3 cameraPosition;
vec3 coordinateOrigin;
vec3 commonOrigin;
bool pseudoMeters;
} project;
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec3 ZERO_64_LOW = vec3(0.0);
const float EARTH_RADIUS = 6370972.0;
const float GLOBE_RADIUS = 256.0;
float project_size_at_latitude(float lat) {
float y = clamp(lat, -89.9, 89.9);
return 1.0 / cos(radians(y));
}
float project_size() {
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR &&
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
project.pseudoMeters == false) {
if (geometry.position.w == 0.0) {
return project_size_at_latitude(geometry.worldPosition.y);
}
float y = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
float y2 = y * y;
float y4 = y2 * y2;
float y6 = y4 * y2;
return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
}
return 1.0;
}
float project_size_at_latitude(float meters, float lat) {
return meters * project.commonUnitsPerMeter.z * project_size_at_latitude(lat);
}
float project_size(float meters) {
return meters * project.commonUnitsPerMeter.z * project_size();
}
vec2 project_size(vec2 meters) {
return meters * project.commonUnitsPerMeter.xy * project_size();
}
vec3 project_size(vec3 meters) {
return meters * project.commonUnitsPerMeter * project_size();
}
vec4 project_size(vec4 meters) {
return vec4(meters.xyz * project.commonUnitsPerMeter, meters.w);
}
mat3 project_get_orientation_matrix(vec3 up) {
vec3 uz = normalize(up);
vec3 ux = abs(uz.z) == 1.0 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(uz.y, -uz.x, 0));
vec3 uy = cross(uz, ux);
return mat3(ux, uy, uz);
}
bool project_needs_rotation(vec3 commonPosition, out mat3 transform) {
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
transform = project_get_orientation_matrix(commonPosition);
return true;
}
return false;
}
vec3 project_normal(vec3 vector) {
vec4 normal_modelspace = project.modelMatrix * vec4(vector, 0.0);
vec3 n = normalize(normal_modelspace.xyz * project.commonUnitsPerMeter);
mat3 rotation;
if (project_needs_rotation(geometry.position.xyz, rotation)) {
n = rotation * n;
}
return n;
}
vec4 project_offset_(vec4 offset) {
float dy = offset.y;
vec3 commonUnitsPerWorldUnit = project.commonUnitsPerWorldUnit + project.commonUnitsPerWorldUnit2 * dy;
return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}
vec2 project_mercator_(vec2 lnglat) {
float x = lnglat.x;
if (project.wrapLongitude) {
x = mod(x + 180., 360.0) - 180.;
}
float y = clamp(lnglat.y, -89.9, 89.9);
return vec2(
radians(x) + PI,
PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))
) * WORLD_SCALE;
}
vec3 project_globe_(vec3 lnglatz) {
float lambda = radians(lnglatz.x);
float phi = radians(lnglatz.y);
float cosPhi = cos(phi);
float D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;
return vec3(
sin(lambda) * cosPhi,
-cos(lambda) * cosPhi,
sin(phi)
) * D;
}
const float MAX_MERCATOR_Y = 7.0439589847;
vec2 project_globe_to_mercator_(vec3 spherePos) {
float D = length(spherePos);
float h = max(length(spherePos.xy), 1e-20);
float y = sign(spherePos.z) * min(log((D + abs(spherePos.z)) / h), MAX_MERCATOR_Y);
float x = atan(spherePos.x, -spherePos.y);
return (vec2(x, y) + PI) * WORLD_SCALE;
}
vec2 project_common_position_to_flat(vec3 commonPosition) {
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
return project_globe_to_mercator_(commonPosition);
}
return commonPosition.xy;
}
vec2 project_common_position_to_flat(vec4 commonPosition) {
return project_common_position_to_flat(commonPosition.xyz);
}
float project_wrap_flat_x_(float x, float referenceX) {
return x - TILE_SIZE * floor((x - referenceX) / TILE_SIZE + 0.5);
}
vec2 project_common_position_to_flat_wrapped(vec3 commonPosition, float referenceX) {
vec2 flatPosition = project_common_position_to_flat(commonPosition);
if (project.projectionMode != PROJECTION_MODE_IDENTITY) {
flatPosition.x = project_wrap_flat_x_(flatPosition.x, referenceX);
}
return flatPosition;
}
vec2 project_common_position_to_flat_wrapped(vec4 commonPosition, float referenceX) {
return project_common_position_to_flat_wrapped(commonPosition.xyz, referenceX);
}
vec2 project_common_position_to_flat_continuous(vec3 commonPosition, float referenceX) {
vec2 flatPosition = project_common_position_to_flat(commonPosition);
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
flatPosition.x = project_wrap_flat_x_(flatPosition.x, referenceX);
}
return flatPosition;
}
vec2 project_common_position_to_flat_continuous(vec4 commonPosition, float referenceX) {
return project_common_position_to_flat_continuous(commonPosition.xyz, referenceX);
}
vec4 project_position(vec4 position, vec3 position64Low) {
vec4 position_world = project.modelMatrix * position;
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
return vec4(
project_mercator_(position_world.xy),
project_size_at_latitude(position_world.z, position_world.y),
position_world.w
);
}
if (project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
position_world.xyz += project.coordinateOrigin;
}
}
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
return vec4(
project_globe_(position_world.xyz),
position_world.w
);
}
if (project.coordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS) {
mat3 enuMatrix = project_get_orientation_matrix(project.commonOrigin);
float metersToCommon = GLOBE_RADIUS / EARTH_RADIUS;
vec3 offsetCommon = (enuMatrix * vec3(-position_world.xy, position_world.z)) * metersToCommon;
return vec4(project.commonOrigin + offsetCommon, position_world.w);
}
}
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
if (abs(position_world.y - project.coordinateOrigin.y) > 0.25) {
return vec4(
project_mercator_(position_world.xy) - project.commonOrigin.xy,
project_size(position_world.z),
position_world.w
);
}
}
}
if (project.projectionMode == PROJECTION_MODE_IDENTITY ||
(project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
(project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
position_world.xyz -= project.coordinateOrigin;
}
return project_offset_(position_world) + project_offset_(project.modelMatrix * vec4(position64Low, 0.0));
}
vec4 project_position(vec4 position) {
return project_position(position, ZERO_64_LOW);
}
vec3 project_position(vec3 position, vec3 position64Low) {
vec4 projected_position = project_position(vec4(position, 1.0), position64Low);
return projected_position.xyz;
}
vec3 project_position(vec3 position) {
vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);
return projected_position.xyz;
}
vec2 project_position(vec2 position) {
vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);
return projected_position.xy;
}
vec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {
return viewProjectionMatrix * position + center;
}
vec4 project_common_position_to_clipspace(vec4 position) {
return project_common_position_to_clipspace(position, project.viewProjectionMatrix, project.center);
}
vec2 project_pixel_size_to_clipspace(vec2 pixels) {
vec2 offset = pixels / project.viewportSize * project.devicePixelRatio * 2.0;
return offset * project.focalDistance;
}
float project_size_to_pixel(float meters) {
return project_size(meters) * project.scale;
}
vec2 project_size_to_pixel(vec2 meters) {
return project_size(meters) * project.scale;
}
float project_size_to_pixel(float size, int unit) {
if (unit == UNIT_METERS) return project_size_to_pixel(size);
if (unit == UNIT_COMMON) return size * project.scale;
return size;
}
float project_pixel_size(float pixels) {
return pixels / project.scale;
}
vec2 project_pixel_size(vec2 pixels) {
return pixels / project.scale;
}
`,TP={};function LP(i=TP){return"viewport"in i?hP(i):{}}const Qi={name:"project",dependencies:[ka,Vd],source:vP,vs:SP,getUniforms:LP,uniformTypes:{wrapLongitude:"f32",coordinateSystem:"i32",commonUnitsPerMeter:"vec3<f32>",projectionMode:"i32",scale:"f32",commonUnitsPerWorldUnit:"vec3<f32>",commonUnitsPerWorldUnit2:"vec3<f32>",center:"vec4<f32>",modelMatrix:"mat4x4<f32>",viewProjectionMatrix:"mat4x4<f32>",viewportSize:"vec2<f32>",devicePixelRatio:"f32",focalDistance:"f32",cameraPosition:"vec3<f32>",coordinateOrigin:"vec3<f32>",commonOrigin:"vec3<f32>",pseudoMeters:"f32"}},CP=`// Define a structure to hold both the clip-space position and the common position.
struct ProjectResult {
  clipPosition: vec4<f32>,
  commonPosition: vec4<f32>,
};

// This function mimics the GLSL version with the 'out' parameter by returning both values.
fn project_position_to_clipspace_and_commonspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> ProjectResult {
  // Compute the projected position.
  let projectedPosition: vec3<f32> = project_position_vec3_f64(position, position64Low);

  // Start with the provided offset.
  var finalOffset: vec3<f32> = offset;

  // Get whether a rotation is needed and the rotation matrix.
  let rotationResult = project_needs_rotation(projectedPosition);

  // If rotation is needed, update the offset.
  if (rotationResult.needsRotation) {
    finalOffset = rotationResult.transform * offset;
  }

  // Compute the common position.
  let commonPosition: vec4<f32> = vec4<f32>(projectedPosition + finalOffset, 1.0);

  // Convert to clip-space.
  let clipPosition: vec4<f32> = project_common_position_to_clipspace(commonPosition);

  return ProjectResult(clipPosition, commonPosition);
}

// A convenience overload that returns only the clip-space position.
fn project_position_to_clipspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> vec4<f32> {
  return project_position_to_clipspace_and_commonspace(position, position64Low, offset).clipPosition;
}
`,AP=`vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition
) {
  vec3 projectedPosition = project_position(position, position64Low);
  mat3 rotation;
  if (project_needs_rotation(projectedPosition, rotation)) {
    // offset is specified as ENU
    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe
    offset = rotation * offset;
  }
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}
`,Bs={name:"project32",dependencies:[Qi],source:CP,vs:AP};function MP(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function Ut(i,e){const t=Et([],e,i);return Ba(t,t,1/t[3]),t}function Lo(i,e,t){return i<e?e:i>t?t:i}function IP(i){return Math.log(i)*Math.LOG2E}const Zd=Math.log2||IP;function Ge(i,e){if(!i)throw new Error(e||"@math.gl/web-mercator: assertion failed.")}const ye=Math.PI,Kd=ye/4,pe=ye/180,Co=180/ye,Xt=512,ns=4003e4,Me=85.051129,RP=1.5;function OP(i){return Zd(i)}function _t(i){const[e,t]=i;Ge(Number.isFinite(e)),Ge(Number.isFinite(t)&&t>=-90&&t<=90,"invalid latitude");const n=e*pe,s=t*pe,r=Xt*(n+ye)/(2*ye),o=Xt*(ye+Math.log(Math.tan(Kd+s*.5)))/(2*ye);return[r,o]}function Ji(i){const[e,t]=i,n=e/Xt*(2*ye)-ye,s=2*(Math.atan(Math.exp(t/Xt*(2*ye)-ye))-Kd);return[n*Co,s*Co]}function BP(i){const{latitude:e}=i;Ge(Number.isFinite(e));const t=Math.cos(e*pe);return OP(ns*t)-9}function Bn(i){const e=Math.cos(i*pe);return Xt/ns/e}function Ao(i){const{latitude:e,longitude:t,highPrecision:n=!1}=i;Ge(Number.isFinite(e)&&Number.isFinite(t));const s=Xt,r=Math.cos(e*pe),o=s/360,a=o/r,c=s/ns/r,l={unitsPerMeter:[c,c,c],metersPerUnit:[1/c,1/c,1/c],unitsPerDegree:[o,a,c],degreesPerUnit:[1/o,1/a,1/c]};if(n){const u=pe*Math.tan(e*pe)/r,f=o*u/2,d=s/ns*u,h=d/a*c;l.unitsPerDegree2=[0,f,d],l.unitsPerMeter2=[h,0,h]}return l}function Qd(i,e){const[t,n,s]=i,[r,o,a]=e,{unitsPerMeter:c,unitsPerMeter2:l}=Ao({longitude:t,latitude:n,highPrecision:!0}),u=_t(i);u[0]+=r*(c[0]+l[0]*o),u[1]+=o*(c[1]+l[1]*o);const f=Ji(u),d=(s||0)+(a||0);return Number.isFinite(s)||Number.isFinite(a)?[f[0],f[1],d]:f}function kP(i){const{height:e,pitch:t,bearing:n,altitude:s,scale:r,center:o}=i,a=MP();es(a,a,[0,0,-s]),Dd(a,a,-t*pe),Fd(a,a,n*pe);const c=r/e;return Oa(a,a,[c,c,c]),o&&es(a,a,R0([],o)),a}function DP(i){const{width:e,height:t,altitude:n,pitch:s=0,offset:r,center:o,scale:a,nearZMultiplier:c=1,farZMultiplier:l=1}=i;let{fovy:u=Ni(RP)}=i;n!==void 0&&(u=Ni(n));const f=u*pe,d=s*pe,h=Na(u);let g=h;o&&(g+=o[2]*a/Math.cos(d)/t);const p=f*(.5+(r?r[1]:0)/t),m=Math.sin(p)*g/Math.sin(Lo(Math.PI/2-d-p,.01,Math.PI-.01)),_=Math.sin(d)*m+g,b=g*10,y=Math.min(_*l,b);return{fov:f,aspect:e/t,focalDistance:h,near:c,far:y}}function Ni(i){return 2*Math.atan(.5/i)*Co}function Na(i){return .5/Math.tan(.5*i*pe)}function $a(i,e){const[t,n,s=0]=i;return Ge(Number.isFinite(t)&&Number.isFinite(n)&&Number.isFinite(s)),Ut(e,[t,n,s,1])}function ss(i,e,t=0){const[n,s,r]=i;if(Ge(Number.isFinite(n)&&Number.isFinite(s),"invalid pixel coordinate"),Number.isFinite(r))return Ut(e,[n,s,r,1]);const o=Ut(e,[n,s,0,1]),a=Ut(e,[n,s,1,1]),c=o[2],l=a[2],u=c===l?0:((t||0)-c)/(l-c);return Id([],o,a,u)}function FP(i){const{width:e,height:t,bounds:n,minExtent:s=0,maxZoom:r=24,offset:o=[0,0]}=i,[[a,c],[l,u]]=n,f=zP(i.padding),d=_t([a,Lo(u,-Me,Me)]),h=_t([l,Lo(c,-Me,Me)]),g=[Math.max(Math.abs(h[0]-d[0]),s),Math.max(Math.abs(h[1]-d[1]),s)],p=[e-f.left-f.right-Math.abs(o[0])*2,t-f.top-f.bottom-Math.abs(o[1])*2];Ge(p[0]>0&&p[1]>0);const m=p[0]/g[0],_=p[1]/g[1],b=(f.right-f.left)/2/m,y=(f.top-f.bottom)/2/_,v=[(h[0]+d[0])/2+b,(h[1]+d[1])/2+y],w=Ji(v),x=Math.min(r,Zd(Math.abs(Math.min(m,_))));return Ge(Number.isFinite(x)),{longitude:w[0],latitude:w[1],zoom:x}}function zP(i=0){return typeof i=="number"?{top:i,bottom:i,left:i,right:i}:(Ge(Number.isFinite(i.top)&&Number.isFinite(i.bottom)&&Number.isFinite(i.left)&&Number.isFinite(i.right)),i)}const Ol=Math.PI/180;function NP(i,e=0){const{width:t,height:n,unproject:s}=i,r={targetZ:e},o=s([0,n],r),a=s([t,n],r);let c,l;const u=i.fovy?.5*i.fovy*Ol:Math.atan(.5/i.altitude),f=(90-i.pitch)*Ol;return u>f-.01?(c=Bl(i,0,e),l=Bl(i,t,e)):(c=s([0,0],r),l=s([t,0],r)),[o,a,l,c]}function Bl(i,e,t){const{pixelUnprojectionMatrix:n}=i,s=Ut(n,[e,0,1,1]),r=Ut(n,[e,i.height,1,1]),a=(t*i.distanceScales.unitsPerMeter[2]-s[2])/(r[2]-s[2]),c=Id([],s,r,a),l=Ji(c);return l.push(t),l}const Jd=`
layout(std140) uniform shadowUniforms {
  bool drawShadowMap;
  bool useShadowMap;
  vec4 color;
  highp int lightId;
  float lightCount;
  mat4 viewProjectionMatrix0;
  mat4 viewProjectionMatrix1;
  vec4 projectCenter0;
  vec4 projectCenter1;
} shadow;
`,$P=`
const int max_lights = 2;

out vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  mat4 viewProjectionMatrices[max_lights];
  viewProjectionMatrices[0] = shadow.viewProjectionMatrix0;
  viewProjectionMatrices[1] = shadow.viewProjectionMatrix1;
  vec4 projectCenters[max_lights];
  projectCenters[0] = shadow.projectCenter0;
  projectCenters[1] = shadow.projectCenter1;

  if (shadow.drawShadowMap) {
    return project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[shadow.lightId], projectCenters[shadow.lightId]);
  }
  if (shadow.useShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow.lightCount)) {
        vec4 shadowMap_position = project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[i], projectCenters[i]);
        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
      }
    }
  }
  return gl_Position;
}
`,UP=`
${Jd}
${$P}
`,GP=`
const int max_lights = 2;
uniform sampler2D shadow_uShadowMap0;
uniform sampler2D shadow_uShadowMap1;

in vec3 shadow_vPosition[max_lights];

const vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);
const vec4 bitUnpackShift = 1.0 / bitPackShift;
const vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);

float shadow_getShadowWeight(vec3 position, sampler2D shadowMap) {
  vec4 rgbaDepth = texture(shadowMap, position.xy);

  float z = dot(rgbaDepth, bitUnpackShift);
  return smoothstep(0.001, 0.01, position.z - z);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow.drawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow.useShadowMap) {
    float shadowAlpha = 0.0;
    shadowAlpha += shadow_getShadowWeight(shadow_vPosition[0], shadow_uShadowMap0);
    if(shadow.lightCount > 1.0) {
      shadowAlpha += shadow_getShadowWeight(shadow_vPosition[1], shadow_uShadowMap1);
    }
    shadowAlpha *= shadow.color.a / shadow.lightCount;
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow.color.rgb, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`,VP=`
${Jd}
${GP}
`,jP=Ki(XP),WP=Ki(ZP),HP=[0,0,0,1],YP=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0];function qP(i){const{width:e,height:t,pixelUnprojectionMatrix:n}=i,s=[[0,0],[e,0],[e,t],[0,t]],r=s.map(([c,l])=>ss([c,l,-1],n)),o=s.map(([c,l])=>ss([c,l,1],n));if(!i.isGeospatial)return r.concat(o);const a=r.concat(o).filter(c=>c[2]>=0);for(let c=0;c<4;c++){const l=(c+1)%4;for(const[u,f]of[[r[c],o[c]],[r[c],r[l]],[o[c],o[l]]])if(u[2]<0!=f[2]<0){const d=u[2]/(u[2]-f[2]);a.push([u[0]+(f[0]-u[0])*d,u[1]+(f[1]-u[1])*d,0])}}return a.length>0?a:r.concat(o)}function XP({viewport:i,center:e}){return new ve(i.viewProjectionMatrix).invert().transform(e)}function ZP({viewport:i,shadowMatrices:e}){const t=[],n=qP(i);for(const s of e){const r=s.clone().translate(new ke(i.center).negate()),o=n.map(c=>r.transform(c)),a=new ve().ortho({left:Math.min(...o.map(c=>c[0])),right:Math.max(...o.map(c=>c[0])),bottom:Math.min(...o.map(c=>c[1])),top:Math.max(...o.map(c=>c[1])),near:Math.min(...o.map(c=>-c[2])),far:Math.max(...o.map(c=>-c[2]))});t.push(a.multiplyRight(s))}return t}function KP(i){const{shadowEnabled:e=!0,project:t}=i;if(!e||!t||!i.shadowMatrices||!i.shadowMatrices.length)return{drawShadowMap:!1,useShadowMap:!1,shadow_uShadowMap0:i.dummyShadowMap,shadow_uShadowMap1:i.dummyShadowMap};const n=Qi.getUniforms(t),s=jP({viewport:t.viewport,center:n.center}),r=[],o=WP({shadowMatrices:i.shadowMatrices,viewport:t.viewport}).slice();for(let c=0;c<i.shadowMatrices.length;c++){const l=o[c],u=l.clone().translate(new ke(t.viewport.center).negate());n.coordinateSystem===Os("lnglat")&&n.projectionMode===se.WEB_MERCATOR?(o[c]=u,r[c]=s):(o[c]=l.clone().multiplyRight(YP),r[c]=u.transform(s))}const a={drawShadowMap:!!i.drawToShadowMap,useShadowMap:i.shadowMaps?i.shadowMaps.length>0:!1,color:i.shadowColor||HP,lightId:i.shadowLightId||0,lightCount:i.shadowMatrices.length,shadow_uShadowMap0:i.dummyShadowMap,shadow_uShadowMap1:i.dummyShadowMap};for(let c=0;c<o.length;c++)a[`viewProjectionMatrix${c}`]=o[c],a[`projectCenter${c}`]=r[c];for(let c=0;c<2;c++)a[`shadow_uShadowMap${c}`]=i.shadowMaps&&i.shadowMaps[c]||i.dummyShadowMap;return a}const kl={name:"shadow",dependencies:[Qi],vs:UP,fs:VP,inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    position = shadow_setVertexPosition(geometry.position);
    `,"fs:DECKGL_FILTER_COLOR":`
    color = shadow_filterShadowColor(color);
    `},getUniforms:KP,uniformTypes:{drawShadowMap:"f32",useShadowMap:"f32",color:"vec4<f32>",lightId:"i32",lightCount:"f32",viewProjectionMatrix0:"mat4x4<f32>",viewProjectionMatrix1:"mat4x4<f32>",projectCenter0:"vec4<f32>",projectCenter1:"vec4<f32>"}},rs=10,os=16777215;function QP(i,e){i.length===rs?z.warn(`pickMultipleObjects can only exclude ${rs} previously picked objects for layers without picking buffers`)():i.push(e)}const JP=`  float disabledPickingIndexCount;
  vec4 disabledPickingIndices0;
  vec4 disabledPickingIndices1;
  vec4 disabledPickingIndices2;
`;function Dl(i){return i.replace(`  vec4 highlightColor;
} picking;`,`  vec4 highlightColor;
${JP}} picking;`)}function gr(i,e){return[i[e]||0,i[e+1]||0,i[e+2]||0,i[e+3]||0]}const e2=`vec3 picking_getPickingColorFromIndex(float objectIndex) {
  if (objectIndex < 0.0 || objectIndex >= ${os}.0) {
    return vec3(0.0);
  }

  for (int i = 0; i < ${rs}; i++) {
    if (float(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    vec4 disabledIndices = i < 4
      ? picking.disabledPickingIndices0
      : (i < 8 ? picking.disabledPickingIndices1 : picking.disabledPickingIndices2);
    float disabledIndex = disabledIndices[i - (i / 4) * 4];
    if (disabledIndex == objectIndex) {
      return vec3(0.0);
    }
  }

  float encodedIndex = objectIndex + 1.0;
  return vec3(
    mod(encodedIndex, 256.0),
    mod(floor(encodedIndex / 256.0), 256.0),
    mod(floor(encodedIndex / 65536.0), 256.0)
  );
}

vec3 picking_getPickingColorFromIndex(uint objectIndex) {
  return picking_getPickingColorFromIndex(float(objectIndex));
}

vec3 picking_getPickingColorFromInstanceID() {
  return picking_getPickingColorFromIndex(float(gl_InstanceID));
}

void picking_setPickingColorFromInstanceID() {
  picking_setPickingColor(picking_getPickingColorFromInstanceID());
}
`,t2=`struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
  disabledPickingIndexCount: f32,
  disabledPickingIndices0: vec4<f32>,
  disabledPickingIndices1: vec4<f32>,
  disabledPickingIndices2: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}

fn picking_getPickingColorFromIndex(objectIndex: u32) -> vec3<f32> {
  if (objectIndex >= ${os}u) {
    return vec3<f32>(0.0);
  }

  for (var i = 0; i < ${rs}; i = i + 1) {
    if (f32(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    let disabledIndices = select(
      picking.disabledPickingIndices2,
      select(picking.disabledPickingIndices1, picking.disabledPickingIndices0, i < 4),
      i < 8
    );
    let disabledIndex = disabledIndices[i % 4];
    if (disabledIndex == f32(objectIndex)) {
      return vec3<f32>(0.0);
    }
  }

  let encodedIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(encodedIndex % 256u),
    f32((encodedIndex / 256u) % 256u),
    f32((encodedIndex / 65536u) % 256u)
  ) / 255.0;
}
`,ks={...Mt,vs:`${Dl(Mt.vs)}
${e2}`,fs:Dl(Mt.fs),source:t2,uniformTypes:{...Mt.uniformTypes,disabledPickingIndexCount:"f32",disabledPickingIndices0:"vec4<f32>",disabledPickingIndices1:"vec4<f32>",disabledPickingIndices2:"vec4<f32>"},defaultUniforms:{...Mt.defaultUniforms,useByteColors:!0,disabledPickingIndexCount:0,disabledPickingIndices0:[0,0,0,0],disabledPickingIndices1:[0,0,0,0],disabledPickingIndices2:[0,0,0,0]},getUniforms(i,e){const t=Mt.getUniforms(i),n=i.disabledPickingIndices||[];return t.disabledPickingIndexCount=n.length,t.disabledPickingIndices0=gr(n,0),t.disabledPickingIndices1=gr(n,4),t.disabledPickingIndices2=gr(n,8),t},inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,"vs:DECKGL_FILTER_COLOR":`
  picking_setPickingColor(geometry.pickingColor);
  `,"fs:DECKGL_FILTER_COLOR":{order:99,injection:`
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `}}},i2=[Vd],n2=["vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)","vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)","vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)","fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)"],s2=[];function r2(i){const e=ce.getDefaultShaderAssembler(i);for(const n of i2)e.addDefaultModule(n);e._hookFunctions.length=0;const t=i==="glsl"?n2:s2;for(const n of t)e.addShaderHook(n);return e}const o2=[255,255,255],a2=1;let c2=0;class l2{constructor(e={}){this.type="ambient";const{color:t=o2}=e,{intensity:n=a2}=e;this.id=e.id||`ambient-${c2++}`,this.color=t,this.intensity=n}}const u2=[255,255,255],f2=1,d2=[0,0,-1];let h2=0;class Fl{constructor(e={}){this.type="directional";const{color:t=u2}=e,{intensity:n=f2}=e,{direction:s=d2}=e,{_shadow:r=!1}=e;this.id=e.id||`directional-${h2++}`,this.color=t,this.intensity=n,this.type="directional",this.direction=new ke(s).normalize().toArray(),this.shadow=r}getProjectedLight(e){return this}}class g2{constructor(e,t={id:"pass"}){const{id:n}=t;this.id=n,this.device=e,this.props={...t}}setProps(e){Object.assign(this.props,e)}render(e){}cleanup(){}}const p2={depthWriteEnabled:!0,depthCompare:"less-equal",blendColorOperation:"add",blendColorSrcFactor:"one",blendColorDstFactor:"one-minus-src-alpha",blendAlphaOperation:"add",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"};class Ua extends g2{constructor(){super(...arguments),this._lastRenderIndex=-1}render(e){this._render(e)}_render(e){const{canvasContext:t=this.device.canvasContext}=e,n=e.target??t.getCurrentFramebuffer(),[s,r]=t.getDrawingBufferSize(),o=e.clearCanvas??!0;let a=e.clearColor??(o?[0,0,0,0]:!1),c=o?1:!1,l=o?0:!1;const u=e.colorMask??15,f={viewport:[0,0,s,r]};e.colorMask&&(f.colorMask=u),e.scissorRect&&(f.scissorRect=e.scissorRect);const{shaderModuleProps:d,viewports:h,views:g,onViewportActive:p,clearStack:m=!0}=e,_=e.pass||"unknown",b=this.device.type==="webgpu";m&&(this._lastRenderIndex=-1);const y=[];if(!h.length)return this.device.beginRenderPass({framebuffer:n,parameters:f,clearColor:a,clearDepth:c,clearStencil:l}).end(),this.device.submit(),y;try{for(const v of h){p?.(v);const w=this._getDrawLayerParams(v,e),x=g&&g[v.id],S=v.subViewports||[v],T=b?S.map(L=>[L]):[S];for(const L of T){const E=this.device.beginRenderPass({framebuffer:n,parameters:f,clearColor:a,clearDepth:c,clearStencil:l});try{for(const R of L){const M=this._drawLayersInViewport(E,{target:n,canvasContext:t,shaderModuleProps:d,viewport:R,view:x,pass:_,layers:e.layers,isPicking:e.isPicking},w);y.push(M)}}finally{E.end(),b&&this.device.submit()}a=!1,c=!1,l=!1}}return y}finally{b||this.device.submit()}}_getDrawLayerParams(e,{layers:t,pass:n,isPicking:s=!1,layerFilter:r,cullRect:o,views:a,effects:c,canvasContext:l=this.device.canvasContext,shaderModuleProps:u},f=!1){const d=[],h=eh(this._lastRenderIndex+1),g={layer:t[0],viewport:e,isPicking:s,renderPass:n,cullRect:o},p={};for(let m=0;m<t.length;m++){const _=t[m],b=this._shouldDrawLayer(_,g,r,p),y={shouldDrawLayer:b};if(b&&!f){y.shouldDrawLayer=!0,y.layerRenderIndex=h(_,b),y.shaderModuleProps=this._getShaderModuleProps(_,c,n,l,u);const v=_.context.device.type==="webgpu"?p2:null;y.layerParameters={...v,..._.context.deck?.props.parameters,...a?.[e.id]?.props.parameters,...this.getLayerParameters(_,m,e)}}d[m]=y}return d}_drawLayersInViewport(e,{layers:t,shaderModuleProps:n,pass:s,target:r,canvasContext:o,viewport:a,view:c,isPicking:l},u){const f=m2(this.device,{canvasContext:o,shaderModuleProps:n,target:r,viewport:a});if(c){const{clear:h,clearColor:g,clearDepth:p,clearStencil:m}=c.props;if(h){let _=[0,0,0,0],b=1,y=0;Array.isArray(g)&&!l?_=[...g.slice(0,3),g[3]||255].map(w=>w/255):g===!1&&(_=!1),p!==void 0&&(b=p),m!==void 0&&(y=m),this.device.beginRenderPass({framebuffer:r,parameters:{viewport:f,scissorRect:f},clearColor:_,clearDepth:b,clearStencil:y}).end()}}const d={totalCount:t.length,visibleCount:0,compositeCount:0,pickableCount:0};e.setParameters({viewport:f});for(let h=0;h<t.length;h++){const g=t[h],p=u[h],{shouldDrawLayer:m}=p;if(m&&g.props.pickable&&d.pickableCount++,g.isComposite&&d.compositeCount++,g.isDrawable&&p.shouldDrawLayer){const{layerRenderIndex:_,shaderModuleProps:b,layerParameters:y}=p;d.visibleCount++,this._lastRenderIndex=Math.max(this._lastRenderIndex,_),b.project&&(b.project.viewport=a),g.context.renderPass=e;try{g._drawLayer({renderPass:e,shaderModuleProps:b,uniforms:{layerIndex:_},parameters:y})}catch(v){g.raiseError(v,`drawing ${g} to ${s}`)}}}return d}shouldDrawLayer(e){return!0}getShaderModuleProps(e,t,n){return null}getLayerParameters(e,t,n){return e.props.parameters}_shouldDrawLayer(e,t,n,s){if(!(e.props.visible&&this.shouldDrawLayer(e)))return!1;t.layer=e;let o=e.parent;for(;o;){if(!o.props.visible||!o.filterSubLayer(t))return!1;t.layer=o,o=o.parent}if(n){const a=t.layer.id;if(a in s||(s[a]=n(t)),!s[a])return!1}return e.activateViewport(t.viewport),!0}_getShaderModuleProps(e,t,n,s,r){const o=s.cssToDeviceRatio(),a=e.internalState?.propsInTransition||e.props,c={layer:a,picking:{isActive:!1},project:{viewport:e.context.viewport,devicePixelRatio:o,modelMatrix:a.modelMatrix,coordinateSystem:a.coordinateSystem,coordinateOrigin:a.coordinateOrigin,autoWrapLongitude:e.wrapLongitude}};if(t)for(const l of t)zl(c,l.getShaderModuleProps?.(e,c));for(const l of e.context.defaultShaderModules)l.name in c||(c[l.name]={});return zl(c,this.getShaderModuleProps(e,t,c),r)}}function eh(i=0,e={}){const t={},n=(s,r)=>{const o=s.props._offset,a=s.id,c=s.parent&&s.parent.id;let l;if(c&&!(c in e)&&n(s.parent,!1),c in t){const u=t[c]=t[c]||eh(e[c],e);l=u(s,r),t[a]=u}else Number.isFinite(o)?(l=o+(e[c]||0),t[a]=null):l=i;return r&&l>=i&&(i=l+1),e[a]=l,l};return n}function m2(i,{canvasContext:e=i.canvasContext,shaderModuleProps:t,target:n,viewport:s}){const r=t?.project?.devicePixelRatio??e.cssToDeviceRatio(),[,o]=e.getDrawingBufferSize(),a=n?n.height:o,c=s;return[c.x*r,a-(c.y+c.height)*r,c.width*r,c.height*r]}function zl(i,...e){for(const t of e)if(t)for(const n in t)i[n]?Object.assign(i[n],t[n]):i[n]=t[n];return i}class _2 extends Ua{constructor(e,t){super(e,t);const n=e.createTexture({format:"rgba8unorm",width:1,height:1,sampler:{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}}),s=e.createTexture({format:"depth16unorm",width:1,height:1});this.fbo=e.createFramebuffer({id:"shadowmap",width:1,height:1,colorAttachments:[n],depthStencilAttachment:s})}delete(){this.fbo&&(this.fbo.destroy(),this.fbo=null)}getShadowMap(){return this.fbo.colorAttachments[0].texture}render(e){const t=this.fbo,n=this.device.canvasContext.cssToDeviceRatio(),s=e.viewports[0],r=s.width*n,o=s.height*n,a=[1,1,1,1];(r!==t.width||o!==t.height)&&t.resize({width:r,height:o}),super.render({...e,clearColor:a,target:t,pass:"shadow"})}getLayerParameters(e,t,n){return{...e.props.parameters,blend:!1,depthWriteEnabled:!0,depthCompare:"less-equal",depthBias:0}}shouldDrawLayer(e){return e.props.shadowEnabled!==!1}getShaderModuleProps(e,t,n){return{shadow:{project:n.project,drawToShadowMap:!0},lighting:{enabled:!1}}}}const y2={color:[255,255,255],intensity:1},Nl=[{color:[255,255,255],intensity:1,direction:[-1,3,-1]},{color:[255,255,255],intensity:.9,direction:[1,-8,-2.5]}],b2=[0,0,0,200/255];class th{constructor(e={}){this.id="lighting-effect",this.shadowColor=b2,this.shadow=!1,this.directionalLights=[],this.pointLights=[],this.shadowPasses=[],this.dummyShadowMap=null,this.setProps(e)}setup(e){this.context=e;const{device:t,deck:n}=e;this.shadow&&!this.dummyShadowMap&&(this._createShadowPasses(t),n._addDefaultShaderModule(kl),this.dummyShadowMap=t.createTexture({width:1,height:1}))}setProps(e){this.ambientLight=void 0,this.directionalLights=[],this.pointLights=[];for(const t in e){const n=e[t];switch(n.type){case"ambient":this.ambientLight=n;break;case"directional":this.directionalLights.push(n);break;case"point":this.pointLights.push(n);break}}this._applyDefaultLights(),this.shadow=this.directionalLights.some(t=>t.shadow),this.context&&(this.shadow||this.cleanup(this.context),this.setup(this.context)),this.props=e}preRender({layers:e,layerFilter:t,viewports:n,onViewportActive:s,views:r}){if(this.shadow){this.shadowMatrices=this._calculateMatrices();for(let o=0;o<this.shadowPasses.length;o++)this.shadowPasses[o].render({layers:e,layerFilter:t,viewports:n,onViewportActive:s,views:r,shaderModuleProps:{shadow:{shadowLightId:o,dummyShadowMap:this.dummyShadowMap,shadowMatrices:this.shadowMatrices}}})}}getShaderModuleProps(e,t){const n=this.shadow?{project:t.project,shadowMaps:this.shadowPasses.map(o=>o.getShadowMap()),dummyShadowMap:this.dummyShadowMap,shadowColor:this.shadowColor,shadowMatrices:this.shadowMatrices}:{},s={enabled:!0,lights:this._getLights(e)},r=e.props.material;return{shadow:n,lighting:s,phongMaterial:r,gouraudMaterial:r}}cleanup(e){for(const t of this.shadowPasses)t.delete();this.shadowPasses.length=0,this.dummyShadowMap&&(this.dummyShadowMap.destroy(),this.dummyShadowMap=null,e.deck._removeDefaultShaderModule(kl))}_calculateMatrices(){const e=[];for(const t of this.directionalLights){const n=new ve().lookAt({eye:new ke(t.direction).negate()});e.push(n)}return e}_createShadowPasses(e){for(let t=0;t<this.directionalLights.length;t++){const n=new _2(e);this.shadowPasses[t]=n}}_applyDefaultLights(){const{ambientLight:e,pointLights:t,directionalLights:n}=this;!e&&t.length===0&&n.length===0&&(this.ambientLight=new l2(y2),this.directionalLights.push(new Fl(Nl[0]),new Fl(Nl[1])))}_getLights(e){const t=[];this.ambientLight&&t.push(this.ambientLight);for(const n of this.pointLights)t.push(n.getProjectedLight({layer:e}));for(const n of this.directionalLights)t.push(n.getProjectedLight({layer:e}));return t}}class v2{constructor(e={}){this._pool=[],this.opts={overAlloc:2,poolSize:100},this.setOptions(e)}setOptions(e){Object.assign(this.opts,e)}allocate(e,t,{size:n=1,type:s,padding:r=0,copy:o=!1,initialize:a=!1,maxCount:c}){const l=s||e&&e.constructor||Float32Array,u=t*n+r;if(ArrayBuffer.isView(e)){if(u<=e.length)return e;if(u*e.BYTES_PER_ELEMENT<=e.buffer.byteLength)return new l(e.buffer,0,u)}let f=1/0;c&&(f=c*n+r);const d=this._allocate(l,u,a,f);return e&&o?d.set(e):a||d.fill(0,0,4),this._release(e),d}release(e){this._release(e)}_allocate(e,t,n,s){let r=Math.max(Math.ceil(t*this.opts.overAlloc),1);r>s&&(r=s);const o=this._pool,a=e.BYTES_PER_ELEMENT*r,c=o.findIndex(l=>l.byteLength>=a);if(c>=0){const l=new e(o.splice(c,1)[0],0,r);return n&&l.fill(0),l}return new e(r)}_release(e){if(!ArrayBuffer.isView(e))return;const t=this._pool,{buffer:n}=e,{byteLength:s}=n,r=t.findIndex(o=>o.byteLength>=s);r<0?t.push(n):(r>0||t.length<this.opts.poolSize)&&t.splice(r,0,n),t.length>this.opts.poolSize&&t.shift()}}const Zt=new v2;function mi(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function $i(i,e){const t=i%e;return t<0?e+t:t}function w2(i){return[i[12],i[13],i[14]]}function x2(i){return{left:It(i[3]+i[0],i[7]+i[4],i[11]+i[8],i[15]+i[12]),right:It(i[3]-i[0],i[7]-i[4],i[11]-i[8],i[15]-i[12]),bottom:It(i[3]+i[1],i[7]+i[5],i[11]+i[9],i[15]+i[13]),top:It(i[3]-i[1],i[7]-i[5],i[11]-i[9],i[15]-i[13]),near:It(i[3]+i[2],i[7]+i[6],i[11]+i[10],i[15]+i[14]),far:It(i[3]-i[2],i[7]-i[6],i[11]-i[10],i[15]-i[14])}}const $l=new ke;function It(i,e,t,n){$l.set(i,e,t);const s=$l.len();return{distance:n/s,normal:new ke(-i/s,-e/s,-t/s)}}function P2(i){return i-Math.fround(i)}let oi;function kn(i,e){const{size:t=1,startIndex:n=0}=e,s=e.endIndex!==void 0?e.endIndex:i.length,r=(s-n)/t;oi=Zt.allocate(oi,r,{type:Float32Array,size:t*2});let o=n,a=0;for(;o<s;){for(let c=0;c<t;c++){const l=i[o++];oi[a+c]=l,oi[a+c+t]=P2(l)}a+=t*2}return oi.subarray(0,r*t*2)}function E2(i){let e=null,t=!1;for(const n of i)n&&(e?(t||(e=[[e[0][0],e[0][1]],[e[1][0],e[1][1]]],t=!0),e[0][0]=Math.min(e[0][0],n[0][0]),e[0][1]=Math.min(e[0][1],n[0][1]),e[1][0]=Math.max(e[1][0],n[1][0]),e[1][1]=Math.max(e[1][1],n[1][1])):e=n);return e}const S2=Math.PI/180,T2=mi(),Ul=[0,0,0],L2={unitsPerMeter:[1,1,1],metersPerUnit:[1,1,1]};function C2({width:i,height:e,orthographic:t,fovyRadians:n,focalDistance:s,padding:r,near:o,far:a}){const c=i/e,l=t?new ve().orthographic({fovy:n,aspect:c,focalDistance:s,near:o,far:a}):new ve().perspective({fovy:n,aspect:c,near:o,far:a});if(r){const{left:u=0,right:f=0,top:d=0,bottom:h=0}=r,g=H((u+i-f)/2,0,i)-i/2,p=H((d+e-h)/2,0,e)-e/2;l[8]-=g*2/i,l[9]+=p*2/e}return l}class si{constructor(e={}){this._frustumPlanes={},this.id=e.id||this.constructor.displayName||"viewport",this.x=e.x||0,this.y=e.y||0,this.width=e.width||1,this.height=e.height||1,this.zoom=e.zoom||0,this.padding=e.padding,this.distanceScales=e.distanceScales||L2,this.focalDistance=e.focalDistance||1,this.position=e.position||Ul,this.modelMatrix=e.modelMatrix||null;const{longitude:t,latitude:n}=e;this.isGeospatial=Number.isFinite(n)&&Number.isFinite(t),this._initProps(e),this._initMatrices(e),this.equals=this.equals.bind(this),this.project=this.project.bind(this),this.unproject=this.unproject.bind(this),this.projectPosition=this.projectPosition.bind(this),this.unprojectPosition=this.unprojectPosition.bind(this),this.projectFlat=this.projectFlat.bind(this),this.unprojectFlat=this.unprojectFlat.bind(this)}get subViewports(){return null}get metersPerPixel(){return this.distanceScales.metersPerUnit[2]/this.scale}get projectionMode(){return this.isGeospatial?this.zoom<12?se.WEB_MERCATOR:se.WEB_MERCATOR_AUTO_OFFSET:se.IDENTITY}equals(e){return e instanceof si?this===e?!0:e.width===this.width&&e.height===this.height&&e.scale===this.scale&&e.projectionMode===this.projectionMode&&e.resolution===this.resolution&&$t(e.distanceScales.unitsPerMeter,this.distanceScales.unitsPerMeter)&&$t(e.projectionMatrix,this.projectionMatrix)&&$t(e.viewMatrix,this.viewMatrix):!1}project(e,{topLeft:t=!0}={}){const n=this.projectPosition(e),s=$a(n,this.pixelProjectionMatrix),[r,o]=s,a=t?o:this.height-o;return e.length===2?[r,a]:[r,a,s[2]]}unproject(e,{topLeft:t=!0,targetZ:n}={}){const[s,r,o]=e,a=t?r:this.height-r,c=n&&n*this.distanceScales.unitsPerMeter[2],l=ss([s,a,o],this.pixelUnprojectionMatrix,c),[u,f,d]=this.unprojectPosition(l);return Number.isFinite(o)?[u,f,d]:Number.isFinite(n)?[u,f,n]:[u,f]}projectPosition(e){const[t,n]=this.projectFlat(e),s=(e[2]||0)*this.distanceScales.unitsPerMeter[2];return[t,n,s]}unprojectPosition(e){const[t,n]=this.unprojectFlat(e),s=(e[2]||0)*this.distanceScales.metersPerUnit[2];return[t,n,s]}projectFlat(e){if(this.isGeospatial){const t=_t(e);return t[1]=H(t[1],-318,830),t}return e}unprojectFlat(e){return this.isGeospatial?Ji(e):e}getBounds(e={}){const t={targetZ:e.z||0},n=this.unproject([0,0],t),s=this.unproject([this.width,0],t),r=this.unproject([0,this.height],t),o=this.unproject([this.width,this.height],t);return[Math.min(n[0],s[0],r[0],o[0]),Math.min(n[1],s[1],r[1],o[1]),Math.max(n[0],s[0],r[0],o[0]),Math.max(n[1],s[1],r[1],o[1])]}getDistanceScales(e){return e&&this.isGeospatial?Ao({longitude:e[0],latitude:e[1],highPrecision:!0}):this.distanceScales}containsPixel({x:e,y:t,width:n=1,height:s=1}){return e<this.x+this.width&&this.x<e+n&&t<this.y+this.height&&this.y<t+s}getFrustumPlanes(){return this._frustumPlanes.near?this._frustumPlanes:(Object.assign(this._frustumPlanes,x2(this.viewProjectionMatrix)),this._frustumPlanes)}panByPosition(e,t,n){return null}_initProps(e){const t=e.longitude,n=e.latitude;this.isGeospatial&&(Number.isFinite(e.zoom)||(this.zoom=BP({latitude:n})+Math.log2(this.focalDistance)),this.distanceScales=e.distanceScales||Ao({latitude:n,longitude:t}));const s=Math.pow(2,this.zoom);this.scale=s;const{position:r,modelMatrix:o}=e;let a=Ul;if(r&&(a=o?new ve(o).transformAsVector(r,[]):r),this.isGeospatial){const c=this.projectPosition([t,n,0]);this.center=new ke(a).scale(this.distanceScales.unitsPerMeter).add(c)}else this.center=this.projectPosition(a)}_initMatrices(e){const{viewMatrix:t=T2,projectionMatrix:n=null,orthographic:s=!1,fovyRadians:r,fovy:o=75,near:a=.1,far:c=1e3,padding:l=null,focalDistance:u=1}=e;this.viewMatrixUncentered=t,this.viewMatrix=new ve().multiplyRight(t).translate(new ke(this.center).negate()),this.projectionMatrix=n||C2({width:this.width,height:this.height,orthographic:s,fovyRadians:r||o*S2,focalDistance:u,padding:l,near:a,far:c});const f=mi();ft(f,f,this.projectionMatrix),ft(f,f,this.viewMatrix),this.viewProjectionMatrix=f,this.viewMatrixInverse=vo([],this.viewMatrix)||this.viewMatrix,this.cameraPosition=w2(this.viewMatrixInverse);const d=mi(),h=mi();Oa(d,d,[this.width/2,-this.height/2,1]),es(d,d,[1,-1,0]),ft(h,d,this.viewProjectionMatrix),this.pixelProjectionMatrix=h,this.pixelUnprojectionMatrix=vo(mi(),this.pixelProjectionMatrix),this.pixelUnprojectionMatrix||z.warn("Pixel project matrix not invertible")()}}si.displayName="Viewport";class Oe extends si{constructor(e={}){const{latitude:t=0,longitude:n=0,zoom:s=0,pitch:r=0,bearing:o=0,nearZMultiplier:a=.1,farZMultiplier:c=1.01,nearZ:l,farZ:u,orthographic:f=!1,projectionMatrix:d,repeat:h=!1,worldOffset:g=0,position:p,padding:m,legacyMeterSizes:_=!1}=e;let{width:b,height:y,altitude:v=1.5}=e;const w=Math.pow(2,s);b=b||1,y=y||1;let x,S=null;if(d)v=d[5]/2,x=Ni(v);else{e.fovy?(x=e.fovy,v=Na(x)):x=Ni(v);let L;if(m){const{top:E=0,bottom:R=0}=m;L=[0,H((E+y-R)/2,0,y)-y/2]}S=DP({width:b,height:y,scale:w,center:p&&[0,0,p[2]*Bn(t)],offset:L,pitch:r,fovy:x,nearZMultiplier:a,farZMultiplier:c}),Number.isFinite(l)&&(S.near=l),Number.isFinite(u)&&(S.far=u)}let T=kP({height:y,pitch:r,bearing:o,scale:w,altitude:v});g&&(T=new ve().translate([512*g,0,0]).multiplyLeft(T)),super({...e,width:b,height:y,viewMatrix:T,longitude:n,latitude:t,zoom:s,...S,fovy:x,focalDistance:v}),this.latitude=t,this.longitude=n,this.zoom=s,this.pitch=r,this.bearing=o,this.altitude=v,this.fovy=x,this.orthographic=f,this._subViewports=h?[]:null,this._pseudoMeters=_,Object.freeze(this)}get subViewports(){if(this._subViewports&&!this._subViewports.length){const e=this.getBounds(),t=Math.floor((e[0]+180)/360),n=Math.ceil((e[2]-180)/360);for(let s=t;s<=n;s++){const r=s?new Oe({...this,worldOffset:s}):this;this._subViewports.push(r)}}return this._subViewports}equals(e){return e instanceof Oe&&e._pseudoMeters===this._pseudoMeters&&super.equals(e)}projectPosition(e){if(this._pseudoMeters)return super.projectPosition(e);const[t,n]=this.projectFlat(e),s=(e[2]||0)*Bn(e[1]);return[t,n,s]}unprojectPosition(e){if(this._pseudoMeters)return super.unprojectPosition(e);const[t,n]=this.unprojectFlat(e),s=(e[2]||0)/Bn(n);return[t,n,s]}addMetersToLngLat(e,t){return Qd(e,t)}panByPosition(e,t,n){const s=ss(t,this.pixelUnprojectionMatrix),r=this.projectFlat(e),o=cl([],r,b0([],s)),a=cl([],this.center,o),[c,l]=this.unprojectFlat(a);return{longitude:c,latitude:l}}panByPosition3D(e,t){const n=e[2]||0,s=w0([],e,this.unproject(t,{targetZ:n}));return{longitude:this.longitude+s[0],latitude:this.latitude+s[1]}}getBounds(e={}){const t=NP(this,e.z||0);return[Math.min(t[0][0],t[1][0],t[2][0],t[3][0]),Math.min(t[0][1],t[1][1],t[2][1],t[3][1]),Math.max(t[0][0],t[1][0],t[2][0],t[3][0]),Math.max(t[0][1],t[1][1],t[2][1],t[3][1])]}fitBounds(e,t={}){const{width:n,height:s}=this,{longitude:r,latitude:o,zoom:a}=FP({width:n,height:s,bounds:e,...t});return new Oe({width:n,height:s,longitude:r,latitude:o,zoom:a})}}Oe.displayName="WebMercatorViewport";const Gl=[0,0,0];function pr(i,e,t=!1){const n=e.projectPosition(i);if(t&&e instanceof Oe){const[s,r,o=0]=i,a=e.getDistanceScales([s,r]);n[2]=o*a.unitsPerMeter[2]}return n}function A2(i){const{viewport:e,modelMatrix:t,coordinateOrigin:n}=i;let{coordinateSystem:s,fromCoordinateSystem:r,fromCoordinateOrigin:o}=i;return s==="default"&&(s=e.isGeospatial?"lnglat":"cartesian"),r===void 0?r=s:r==="default"&&(r=e.isGeospatial?"lnglat":"cartesian"),o===void 0&&(o=n),{viewport:e,coordinateSystem:s,coordinateOrigin:n,modelMatrix:t,fromCoordinateSystem:r,fromCoordinateOrigin:o}}function Ga(i,{viewport:e,modelMatrix:t,coordinateSystem:n,coordinateOrigin:s,offsetMode:r}){let[o,a,c=0]=i;switch(t&&([o,a,c]=Et([],[o,a,c,1],t)),n){case"default":return Ga(i,{viewport:e,modelMatrix:t,coordinateSystem:e.isGeospatial?"lnglat":"cartesian",coordinateOrigin:s,offsetMode:r});case"lnglat":return pr([o,a,c],e,r);case"lnglat-offsets":return pr([o+s[0],a+s[1],c+(s[2]||0)],e,r);case"meter-offsets":return pr(Qd(s,[o,a,c]),e,r);case"cartesian":return e.isGeospatial?[o+s[0],a+s[1],c+s[2]]:e.projectPosition([o,a,c]);default:throw new Error(`Invalid coordinateSystem: ${n}`)}}function M2(i,e){const{viewport:t,coordinateSystem:n,coordinateOrigin:s,modelMatrix:r,fromCoordinateSystem:o,fromCoordinateOrigin:a}=A2(e),{autoOffset:c=!0}=e,{geospatialOrigin:l=Gl,shaderCoordinateOrigin:u=Gl,offsetMode:f=!1}=c?Xd(t,n,s):{},d=Ga(i,{viewport:t,modelMatrix:r,coordinateSystem:o,coordinateOrigin:a,offsetMode:f});if(f){const h=t.projectPosition(l||u);Jn(d,d,h)}return d}const mr={};function en(i="id"){mr[i]=mr[i]||1;const e=mr[i]++;return`${i}-${e}`}class tn{id;topology;vertexCount;indices;attributes;bufferLayout;userData={};constructor(e){const{attributes:t={},indices:n=null,vertexCount:s=null}=e;this.id=e.id||en("geometry"),this.topology=e.topology,n&&(this.indices=ArrayBuffer.isView(n)?{value:n,size:1}:n),this.attributes={};for(const[r,o]of Object.entries(t)){const a=ArrayBuffer.isView(o)?{value:o}:o;if(!ArrayBuffer.isView(a.value))throw new Error(`${this._print(r)}: must be typed array or object with value as typed array`);if((r==="POSITION"||r==="positions")&&!a.size&&(a.size=3),r==="indices"){if(this.indices)throw new Error("Multiple indices detected");this.indices=a}else{const c=Ui(r),l=Object.keys(this.attributes).find(u=>Ui(u)===c);l&&delete this.attributes[l],this.attributes[r]=a}}this.indices&&this.indices.isIndexed!==void 0&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=s||this._calculateVertexCount(this.attributes,this.indices),this.bufferLayout=e.bufferLayout||I2(this.attributes)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(e){return`Geometry ${this.id} attribute ${e}`}_setAttributes(e,t){return this}_calculateVertexCount(e,t){if(t)return t.value.length;let n=1/0;for(const s of Object.values(e)){if(!s)continue;const{value:r,size:o,constant:a}=s;!a&&r&&o!==void 0&&o>=1&&(n=Math.min(n,r.length/o))}return n}}function Ui(i){switch(i){case"POSITION":return"positions";case"NORMAL":return"normals";case"TEXCOORD_0":return"texCoords";case"TEXCOORD_1":return"texCoords1";case"COLOR_0":return"colors";default:return i}}function I2(i){const e=[];for(const[t,n]of Object.entries(i)){if(!n)continue;const{value:s,size:r,normalized:o}=n;if(r===void 0)throw new Error(`Attribute ${t} is missing a size`);e.push({name:Ui(t),format:ie.getVertexFormatFromAttribute(s,r,o)})}return e}function R2(i,e={}){const t=e.bufferName||"geometry";if(O2(i,t))return i;const n=e.minAttributeAlignment||4,s=B2(i,e.attributes),r=[];let o=0,a=1/0;for(const[u,f]of s){if(!f)continue;if(f.constant)throw new Error(`Attribute ${u} is constant`);const{value:d,size:h,normalized:g}=f;if(!ArrayBuffer.isView(d))throw new Error(`Attribute ${u} is missing typed array data`);if(h===void 0)throw new Error(`Attribute ${u} is missing a size`);const p=ie.getVertexFormatFromAttribute(d,h,g),m=ie.getVertexFormatInfo(p);o=Vl(o,n),r.push({sourceName:u,attributeName:Ui(u),value:d,size:h,format:p,byteOffset:o,byteLength:m.byteLength}),o+=m.byteLength;const _=d.length/h;if(!Number.isInteger(_))throw new Error(`Attribute ${u} length is not divisible by size`);a=Math.min(a,_)}if(r.length===0||!Number.isFinite(a))throw new Error(`Geometry ${i.id} has no interleavable attributes`);const c=Vl(o,n),l=new ArrayBuffer(a*c);for(const u of r)k2(l,a,c,u);return new tn({id:i.id,topology:i.topology||"triangle-list",vertexCount:i.vertexCount,indices:i.indices,attributes:{[t]:{value:new Uint8Array(l),size:c,byteStride:c}},bufferLayout:[{name:t,stepMode:"vertex",byteStride:c,attributes:r.map(u=>({attribute:u.attributeName,format:u.format,byteOffset:u.byteOffset}))}]})}function O2(i,e){if(i.bufferLayout.length!==1)return!1;const t=i.bufferLayout[0];return t.name===e&&!!t.attributes?.length&&!!i.attributes[e]}function B2(i,e){return e?e.map(t=>[t,i.attributes[t]]):Object.entries(i.attributes)}function k2(i,e,t,n){const s=n.value.constructor,r=s.BYTES_PER_ELEMENT;if(n.byteOffset%r!==0||t%r!==0)throw new Error(`Attribute ${n.sourceName} is not aligned to its component type`);const o=new s(i),a=n.value,c=n.byteOffset/r,l=t/r;for(let u=0;u<e;u++){const f=u*n.size,d=u*l+c;for(let h=0;h<n.size;h++)o[d+h]=a[f+h]}}function Vl(i,e){return Math.ceil(i/e)*e}let D2=1,F2=1;class ih{time=0;channels=new Map;animations=new Map;playing=!1;lastEngineTime=-1;constructor(){}addChannel(e){const{delay:t=0,duration:n=Number.POSITIVE_INFINITY,rate:s=1,repeat:r=1}=e,o=D2++,a={time:0,delay:t,duration:n,rate:s,repeat:r};return this._setChannelTime(a,this.time),this.channels.set(o,a),o}removeChannel(e){this.channels.delete(e);for(const[t,n]of this.animations)n.channel===e&&this.detachAnimation(t)}isFinished(e){const t=this.channels.get(e);return t===void 0?!1:this.time>=t.delay+t.duration*t.repeat}getTime(e){if(e===void 0)return this.time;const t=this.channels.get(e);return t===void 0?-1:t.time}setTime(e){this.time=Math.max(0,e);const t=this.channels.values();for(const s of t)this._setChannelTime(s,this.time);const n=this.animations.values();for(const s of n){const{animation:r,channel:o}=s;r.setTime(this.getTime(o))}}play(){this.playing=!0}pause(){this.playing=!1,this.lastEngineTime=-1}reset(){this.setTime(0)}attachAnimation(e,t){const n=F2++;return this.animations.set(n,{animation:e,channel:t}),e.setTime(this.getTime(t)),n}detachAnimation(e){this.animations.delete(e)}update(e){this.playing&&(this.lastEngineTime===-1&&(this.lastEngineTime=e),this.setTime(this.time+(e-this.lastEngineTime)),this.lastEngineTime=e)}_setChannelTime(e,t){const n=t-e.delay,s=e.duration*e.repeat;n>=s?e.time=e.duration*e.rate:(e.time=Math.max(0,n)%e.duration,e.time*=e.rate)}}function z2(i){const e=typeof window<"u"?window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame:null;return e?e.call(window,i):setTimeout(()=>i(typeof performance<"u"?performance.now():Date.now()),1e3/60)}function N2(i){const e=typeof window<"u"?window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame:null;if(e){e.call(window,i);return}clearTimeout(i)}let $2=0;const U2="Animation Loop",jl={requestAnimationFrame:i=>z2(i),cancelAnimationFrame:i=>N2(i)};class as{static defaultAnimationLoopProps={device:null,onAddHTML:()=>"",onInitialize:async()=>null,onRender:()=>{},onFinalize:()=>{},onError:e=>{console.error(e)},stats:void 0,autoResizeViewport:!1,animationFrameProvider:jl};device=null;canvas=null;props;animationProps=null;timeline=null;stats;sharedStats;cpuTime;gpuTime;frameRate;display;_needsRedraw="initialized";_initialized=!1;_running=!1;_animationFrameId=null;_nextFramePromise=null;_resolveNextFrame=null;_cpuStartTime=0;_error=null;_lastFrameTime=0;constructor(e){if(this.props={...as.defaultAnimationLoopProps,...e},e=this.props,!e.device)throw new Error("No device provided");this.stats=e.stats||new _s({id:`animation-loop-${$2++}`}),this.sharedStats=uo.stats.get(U2),this.frameRate=this.stats.get("Frame Rate"),this.frameRate.setSampleSize(1),this.cpuTime=this.stats.get("CPU Time"),this.gpuTime=this.stats.get("GPU Time"),this.setProps({autoResizeViewport:e.autoResizeViewport,animationFrameProvider:e.animationFrameProvider}),this.start=this.start.bind(this),this.stop=this.stop.bind(this),this._onMousemove=this._onMousemove.bind(this),this._onMouseleave=this._onMouseleave.bind(this)}destroy(){this.stop(),this._setDisplay(null),this.device?._disableDebugGPUTime()}delete(){this.destroy()}reportError(e){this._error=e,this.props.onError(e),this.props.onError===as.defaultAnimationLoopProps.onError&&typeof window<"u"&&typeof ErrorEvent<"u"&&window.dispatchEvent(new ErrorEvent("error",{error:e,message:e.message}))}setNeedsRedraw(e){return this._needsRedraw=this._needsRedraw||e,this}needsRedraw(){const e=this._needsRedraw;return this._needsRedraw=!1,e}setProps(e){if("autoResizeViewport"in e&&(this.props.autoResizeViewport=e.autoResizeViewport||!1),"animationFrameProvider"in e){const t=e.animationFrameProvider||jl;if(t!==this.props.animationFrameProvider){const n=this._animationFrameId!==null;n&&this._cancelAnimationFrame(),this.props.animationFrameProvider=t,n&&this._requestAnimationFrame()}}return this}async start(){if(this._running)return this;this._running=!0;try{let e;if(!this._initialized){if(this._initialized=!0,await this._initDevice(),this._initialize(),!this._running)return null;await this.props.onInitialize(this._getAnimationProps())}return this._running?(e!==!1&&(this._cancelAnimationFrame(),this._requestAnimationFrame()),this):null}catch(e){const t=e instanceof Error?e:new Error("Unknown error");throw this.props.onError(t),t}}stop(){if(this._running){const e=this.animationProps;this._cancelAnimationFrame(),this._nextFramePromise=null,this._resolveNextFrame=null,this._running=!1,this._lastFrameTime=0,e&&this.props.onFinalize(e)}return this}redraw(e,t=null){return this.device?.isLost||this._error?this:(this._beginFrameTimers(e),this._setupFrame(),this.animationProps&&(this.animationProps.animationFrame=t),this._updateAnimationProps(),this._renderFrame(this._getAnimationProps()),this._clearNeedsRedraw(),this._resolveNextFrame&&(this._resolveNextFrame(this),this._nextFramePromise=null,this._resolveNextFrame=null),this._endFrameTimers(),this)}attachTimeline(e){return this.timeline=e,this.timeline}detachTimeline(){this.timeline=null}waitForRender(){return this.setNeedsRedraw("waitForRender"),this._nextFramePromise||(this._nextFramePromise=new Promise(e=>{this._resolveNextFrame=e})),this._nextFramePromise}async toDataURL(){if(this.setNeedsRedraw("toDataURL"),await this.waitForRender(),this.canvas instanceof HTMLCanvasElement)return this.canvas.toDataURL();throw new Error("OffscreenCanvas")}_initialize(){this._startEventHandling(),this._initializeAnimationProps(),this._updateAnimationProps(),this._resizeViewport(),this.device?._enableDebugGPUTime()}_setDisplay(e){this.display&&(this.display.destroy(),this.display.animationLoop=null),e&&(e.animationLoop=this),this.display=e}_requestAnimationFrame(){this._running&&(this._animationFrameId=this.props.animationFrameProvider.requestAnimationFrame(this._animationFrame.bind(this)))}_cancelAnimationFrame(){this._animationFrameId!==null&&(this.props.animationFrameProvider.cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}_animationFrame(e,t){if(this._running)try{this.redraw(e,t??null),this._requestAnimationFrame()}catch(n){const s=n instanceof Error?n:new Error(String(n));this.reportError(s),this.stop()}}_renderFrame(e){if(this.display){this.display._renderFrame(e);return}const t=this.props.onRender(this._getAnimationProps());this.device&&t!==!1&&this.device.submit()}_clearNeedsRedraw(){this._needsRedraw=!1}_setupFrame(){this._resizeViewport()}_initializeAnimationProps(){const e=this.device?.getDefaultCanvasContext();if(!this.device||!e)throw new Error("loop");const t=e?.canvas,n=e.props.useDevicePixels;this.animationProps={animationLoop:this,device:this.device,canvasContext:e,canvas:t,useDevicePixels:n,timeline:this.timeline,needsRedraw:!1,width:1,height:1,aspect:1,time:0,startTime:Date.now(),engineTime:0,tick:0,tock:0,animationFrame:null,_mousePosition:null}}_getAnimationProps(){if(!this.animationProps)throw new Error("animationProps");return this.animationProps}_updateAnimationProps(){if(!this.animationProps)return;const{width:e,height:t,aspect:n}=this._getSizeAndAspect();(e!==this.animationProps.width||t!==this.animationProps.height)&&this.setNeedsRedraw("drawing buffer resized"),n!==this.animationProps.aspect&&this.setNeedsRedraw("drawing buffer aspect changed"),this.animationProps.width=e,this.animationProps.height=t,this.animationProps.aspect=n,this.animationProps.needsRedraw=this._needsRedraw,this.animationProps.engineTime=Date.now()-this.animationProps.startTime,this.timeline&&this.timeline.update(this.animationProps.engineTime),this.animationProps.tick=Math.floor(this.animationProps.time/1e3*60),this.animationProps.tock++,this.animationProps.time=this.timeline?this.timeline.getTime():this.animationProps.engineTime}async _initDevice(){if(this.device=await this.props.device,!this.device)throw new Error("No device provided");this.canvas=this.device.getDefaultCanvasContext().canvas||null}_createInfoDiv(){if(this.canvas&&this.props.onAddHTML){const e=document.createElement("div");document.body.appendChild(e),e.style.position="relative";const t=document.createElement("div");t.style.position="absolute",t.style.left="10px",t.style.bottom="10px",t.style.width="300px",t.style.background="white",this.canvas instanceof HTMLCanvasElement&&e.appendChild(this.canvas),e.appendChild(t);const n=this.props.onAddHTML(t);n&&(t.innerHTML=n)}}_getSizeAndAspect(){if(!this.device)return{width:1,height:1,aspect:1};const[e,t]=this.device.getDefaultCanvasContext().getDrawingBufferSize(),n=e>0&&t>0?e/t:1;return{width:e,height:t,aspect:n}}_resizeViewport(){this.props.autoResizeViewport&&this.device.gl&&this.device.gl.viewport(0,0,this.device.gl.drawingBufferWidth,this.device.gl.drawingBufferHeight)}_beginFrameTimers(e){const t=e??(typeof performance<"u"?performance.now():Date.now());if(this._lastFrameTime){const n=t-this._lastFrameTime;n>0&&this.frameRate.addTime(n)}this._lastFrameTime=t,this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeStart()}_endFrameTimers(){this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeEnd(),this._updateSharedStats()}_consumeEncodedGpuTime(){if(!this.device)return;const e=this.device.commandEncoder._gpuTimeMs;e!==void 0&&(this.gpuTime.addTime(e),this.device.commandEncoder._gpuTimeMs=void 0)}_updateSharedStats(){if(this.stats!==this.sharedStats){for(const e of Object.keys(this.sharedStats.stats))this.stats.stats[e]||delete this.sharedStats.stats[e];this.stats.forEach(e=>{const t=this.sharedStats.get(e.name,e.type);t.sampleSize=e.sampleSize,t.time=e.time,t.count=e.count,t.samples=e.samples,t.lastTiming=e.lastTiming,t.lastSampleTime=e.lastSampleTime,t.lastSampleCount=e.lastSampleCount,t._count=e._count,t._time=e._time,t._samples=e._samples,t._startTime=e._startTime,t._timerPending=e._timerPending})}}_startEventHandling(){this.canvas&&(this.canvas.addEventListener("mousemove",this._onMousemove.bind(this)),this.canvas.addEventListener("mouseleave",this._onMouseleave.bind(this)))}_onMousemove(e){e instanceof MouseEvent&&(this._getAnimationProps()._mousePosition=[e.offsetX,e.offsetY])}_onMouseleave(e){this._getAnimationProps()._mousePosition=null}}class Wl{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(e){if(this.id=e.id||en("geometry"),this.topology=e.topology,this.indices=e.indices||null,this.attributes=e.attributes,this.vertexCount=e.vertexCount,this.bufferLayout=e.bufferLayout||[],this.indices&&!(this.indices.usage&O.INDEX))throw new Error("Index buffer must have INDEX usage")}destroy(){this.indices?.destroy();for(const e of Object.values(this.attributes))e.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(e){return e.byteLength/12}}function G2(i,e){if(e instanceof Wl)return e;const t=R2(e),n=V2(i,t),{attributes:s,bufferLayout:r}=j2(i,t);return new Wl({topology:t.topology||"triangle-list",bufferLayout:r,vertexCount:t.vertexCount,indices:n,attributes:s})}function V2(i,e){if(!e.indices)return;const t=e.indices.value;return i.createBuffer({usage:O.INDEX,data:t})}function j2(i,e){const t={};for(const[n,s]of Object.entries(e.attributes)){const r=e.bufferLayout.find(o=>o.name===n)?.name||Ui(n);s&&(t[r]=i.createBuffer({data:s.value,id:`${n}-buffer`}))}return{attributes:t,bufferLayout:e.bufferLayout,vertexCount:e.vertexCount}}function W2(i,e){const t={},n="Values";if(i.attributes.length===0&&!i.varyings?.length)return{"No attributes or varyings":{[n]:"N/A"}};for(const s of i.attributes)if(s){const r=`${s.location} ${s.name}: ${s.type}`;t[`in ${r}`]={[n]:s.stepMode||"vertex"}}for(const s of i.varyings||[]){const r=`${s.location} ${s.name}`;t[`out ${r}`]={[n]:JSON.stringify(s)}}return t}const Hl="__debugFramebufferState",_r=8;function H2(i,e,t){if(i.device.type!=="webgl")return;const n=X2(i.device);if(!n.flushing){if(K2(i)){Y2(i,t,n);return}e&&Z2(e)&&e.handle!==null&&(n.queuedFramebuffers.includes(e)||n.queuedFramebuffers.push(e))}}function Y2(i,e,t){if(t.queuedFramebuffers.length===0)return;const n=i.device,{gl:s}=n,r=s.getParameter(36010),o=s.getParameter(36006),[a,c]=i.device.getDefaultCanvasContext().getDrawingBufferSize();let l=Yl(e.top,_r);const u=Yl(e.left,_r);t.flushing=!0;try{for(const f of t.queuedFramebuffers){const[d,h,g,p,m]=q2({framebuffer:f,targetWidth:a,targetHeight:c,topPx:l,leftPx:u,minimap:e.minimap});s.bindFramebuffer(36008,f.handle),s.bindFramebuffer(36009,null),s.blitFramebuffer(0,0,f.width,f.height,d,h,g,p,16384,9728),l+=m+_r}}finally{s.bindFramebuffer(36008,r),s.bindFramebuffer(36009,o),t.flushing=!1}}function q2(i){const{framebuffer:e,targetWidth:t,targetHeight:n,topPx:s,leftPx:r}=i,o=Math.max(Math.floor(t/4),1),a=Math.max(Math.floor(n/4),1),c=Math.min(o/e.width,a/e.height),l=Math.max(Math.floor(e.width*c),1),u=Math.max(Math.floor(e.height*c),1),f=r,d=Math.max(n-s-u,0),h=f+l,g=d+u;return[f,d,h,g,u]}function X2(i){return i.userData[Hl]||={flushing:!1,queuedFramebuffers:[]},i.userData[Hl]}function Z2(i){return"colorAttachments"in i}function K2(i){const e=i.props.framebuffer;return!e||e.handle===null}function Yl(i,e){if(!i)return e;const t=Number.parseInt(i,10);return Number.isFinite(t)?t:e}function Pi(i,e,t){if(i===e)return!0;if(!t||!i||!e)return!1;if(Array.isArray(i)){if(!Array.isArray(e)||i.length!==e.length)return!1;for(let n=0;n<i.length;n++)if(!Pi(i[n],e[n],t-1))return!1;return!0}if(Array.isArray(e))return!1;if(typeof i=="object"&&typeof e=="object"){const n=Object.keys(i),s=Object.keys(e);if(n.length!==s.length)return!1;for(const r of n)if(!e.hasOwnProperty(r)||!Pi(i[r],e[r],t-1))return!1;return!0}return!1}class yr{bufferLayouts;constructor(e){this.bufferLayouts=e}getBufferLayout(e){return this.bufferLayouts.find(t=>t.name===e)||null}getAttributeNamesForBuffer(e){return _o(e)}mergeBufferLayouts(e,t){const n=[...e];for(const s of t){const r=n.findIndex(o=>o.name===s.name);r<0?n.push(s):n[r]=s}return n}}function Q2(i,e){const t=xb(i),n=e.slice();return n.sort((s,r)=>{const o=qc(_o(s).map(c=>t[c])),a=qc(_o(r).map(c=>t[c]));return o-a}),n}function cs(i,e){if(!i||!e.some(n=>n.bindingLayout?.length))return i;const t={...i,bindings:i.bindings.map(n=>({...n}))};"attributes"in(i||{})&&(t.attributes=i?.attributes||[]);for(const n of e)for(const s of n.bindingLayout||[])for(const r of tE(s.name)){const o=t.bindings.find(a=>a.name===r);o?.group===0&&(o.group=s.group),o&&s.visibility!==void 0&&(o.visibility=s.visibility)}return t}function J2(i,e,t=[]){return i?e?{...i,attributes:i.attributes.length?sE(i.attributes,e.attributes.filter(n=>t.includes(n.name))):e.attributes,bindings:nE(i.bindings,e.bindings)}:i:e}function Va(i){return!!(i.uniformTypes&&!iE(i.uniformTypes))}function eE(i){const e=[];for(const t of i){const n=xa(t),s=new Set([t.vs,t.fs].flatMap(o=>o?Pa(o).filter(a=>a.isStd140).map(a=>a.blockName):[])),r=s.has(n)?n:s.size===1?s.values().next().value:void 0;Va(t)&&r&&e.push({name:r,uniformTypes:t.uniformTypes})}return e}function nh(i,e){const t=[],n=new Set;for(const s of[...i||[],...e||[]])n.has(s.name)||(n.add(s.name),t.push(s));return t}function tE(i){const e=new Set([i,`${i}Uniforms`]);return i.endsWith("Uniforms")||e.add(`${i}Sampler`),[...e]}function iE(i){for(const e in i)return!1;return!0}function nE(i,e){const t=i.map(r=>({...r})),n=new Set(i.map(r=>r.name)),s=new Set(i.map(r=>`${r.group}:${r.location}`));for(const r of e){const o=`${r.group}:${r.location}`;!n.has(r.name)&&!s.has(o)&&t.push({...r})}return t}function sE(i,e){const t=i.map(r=>({...r})),n=new Map(i.map(r=>[r.name,r])),s=new Map(i.map(r=>[r.location,r]));for(const r of e){const o=n.get(r.name);if(o){if(o.type!==r.type||o.location!==r.location)throw new Error(`Shader attribute "${r.name}" conflicts with its inferred type or location`);continue}const a=s.get(r.location);if(a)throw new Error(`Shader attributes "${a.name}" and "${r.name}" both use location ${r.location}`);t.push({...r})}return t}function rE(i){return Vf(i)||typeof i=="number"||typeof i=="boolean"}function oE(i,e={}){const t={bindings:{},uniforms:{}};return Object.keys(i).forEach(n=>{const s=i[n];Object.prototype.hasOwnProperty.call(e,n)||rE(s)?t.uniforms[n]=s:t.bindings[n]=s}),t}class sh{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;directBindings={};constructor(e,t){Object.assign(this.options,t);const n=Yn(Object.values(e).filter(aE));for(const s of n)e[s.name]=s;P.log(1,"Creating ShaderInputs with modules",Object.keys(e))(),this.modules=e,this.moduleUniforms={},this.moduleBindings={};for(const[s,r]of Object.entries(e))r&&(this._addModule(r),r.name&&s!==r.name&&!this.options.disableWarnings&&P.warn(`Module name: ${s} vs ${r.name}`)())}destroy(){}setProps(e){e.bindings&&Object.assign(this.directBindings,e.bindings);for(const t of Object.keys(e)){if(t==="bindings")continue;const n=t,s=e[n]||{},r=this.modules[n];if(!r)this.options.disableWarnings||P.warn(`Module ${t} not found`)();else{const o=this.moduleUniforms[n],a=this.moduleBindings[n],c=r.getUniforms?.(s,o)||s,{uniforms:l,bindings:u}=oE(c,r.uniformTypes);this.moduleUniforms[n]=ql(o,l,r.uniformTypes),this.moduleBindings[n]={...a,...u}}}}getModules(){return Object.values(this.modules)}addModules(e){const t=Yn(e);for(const n of t){const s=n.name;this.modules[s]||(this.modules[s]=n,this._addModule(n))}}getUniformValues(){return this.moduleUniforms}getBindingValues(){const e={};for(const t of Object.values(this.moduleBindings))Object.assign(e,t);return Object.assign(e,this.directBindings),e}getModuleBindingValues(e){const t=this.moduleBindings[e];return t?{...t}:{}}getDebugTable(){const e={};for(const[t,n]of Object.entries(this.moduleUniforms))for(const[s,r]of Object.entries(n))e[`${t}.${s}`]={type:this.modules[t].uniformTypes?.[s],value:String(r)};return e}_addModule(e){const t=e.name;this.moduleUniforms[t]=ql({},e.defaultUniforms||{},e.uniformTypes),this.moduleBindings[t]={}}}function ql(i={},e={},t={}){const n={...i};for(const[s,r]of Object.entries(e))r!==void 0&&(n[s]=Mo(i[s],r,t[s]));return n}function Mo(i,e,t){if(!t||typeof t=="string")return Ei(e);if(Array.isArray(t)){if(Io(e)||!Array.isArray(e))return Ei(e);const o=Array.isArray(i)&&!Io(i)?[...i]:[],a=o.slice();for(let c=0;c<e.length;c++){const l=e[c];l!==void 0&&(a[c]=Mo(o[c],l,t[0]))}return a}if(!Ro(e))return Ei(e);const n=t,s=Ro(i)?i:{},r={...s};for(const[o,a]of Object.entries(e))a!==void 0&&(r[o]=Mo(s[o],a,n[o]));return r}function Ei(i){return ArrayBuffer.isView(i)?Array.prototype.slice.call(i):Array.isArray(i)?Io(i)?i.slice():i.map(t=>t===void 0?void 0:Ei(t)):Ro(i)?Object.fromEntries(Object.entries(i).map(([e,t])=>[e,t===void 0?void 0:Ei(t)])):i}function Io(i){return ArrayBuffer.isView(i)||Array.isArray(i)&&(i.length===0||typeof i[0]=="number")}function Ro(i){return!!i&&typeof i=="object"&&!Array.isArray(i)&&!ArrayBuffer.isView(i)}function aE(i){return!!i?.dependencies}const cE=O.DEBUG_DATA_MAX_LENGTH;class Le{device;id;ready;usage;props;isReady=!0;destroyed=!1;generation=0;updateTimestamp;debugData=new ArrayBuffer(0);_debugDataEnabled;_maxDebugDataByteLength;_ownsBuffer;_buffer;get buffer(){return this._buffer}get byteLength(){return this._buffer.byteLength}get[Symbol.toStringTag](){return"DynamicBuffer"}toString(){return`DynamicBuffer:"${this.id}":${this.byteLength}B`}toJSON(){return this.toString()}constructor(e,t){const{debugData:n=!1,buffer:s,ownsBuffer:r=!0,...o}=t;if(s&&s.device!==e)throw new Error("DynamicBuffer adopted buffers must belong to the supplied device");if(s&&(o.byteLength!==void 0||o.data!==void 0))throw new Error("DynamicBuffer cannot combine an adopted buffer with byteLength or data");const a=t.id||s?.id||en("dynamic-buffer"),c={...o,id:a,usage:o.usage??s?.usage,indexType:o.indexType??s?.indexType};(c.usage||0)&O.INDEX&&!c.indexType&&(o.data instanceof Uint32Array?c.indexType="uint32":o.data instanceof Uint16Array?c.indexType="uint16":o.data instanceof Uint8Array&&(c.indexType="uint8")),delete c.data,delete c.byteOffset,this.device=e,this.id=a,this.props=c,this.usage=c.usage||0,this._debugDataEnabled=!!n,this._maxDebugDataByteLength=typeof n=="object"&&n.maxByteLength!==void 0?n.maxByteLength:cE,this._ownsBuffer=r,this._buffer=s??this.device.createBuffer({...o,id:a}),this.ready=Promise.resolve(this._buffer),this.updateTimestamp=this._buffer.updateTimestamp,this._resetDebugData(this._buffer.byteLength),o.data&&this._writeDebugData(o.data,o.byteOffset||0)}write(e,t=0){this._buffer.write(e,t),this._touch(),this._writeDebugData(e,t)}async mapAndWriteAsync(e,t=0,n=this.byteLength-t){let s=null;await this._buffer.mapAndWriteAsync(async(r,o)=>{await e(r,o),s=new Uint8Array(r.slice(0,n))},t,n),this._touch(),s&&this._writeDebugData(s,t)}async readAsync(e=0,t=this.byteLength-e){const n=await this._buffer.readAsync(e,t);return this._writeDebugData(n,e)&&this._touch(),n}async mapAndReadAsync(e,t=0,n=this.byteLength-t){let s=null;const r=await this._buffer.mapAndReadAsync(async(o,a)=>(s=new Uint8Array(o.slice(0)),await e(o,a)),t,n);return s&&this._writeDebugData(s,t)&&this._touch(),r}resize(e){const{byteLength:t,preserveData:n=!1}=e;if(t===this.byteLength)return!1;const s=Math.min(e.copyByteLength??Math.min(this.byteLength,t),this.byteLength,t),r=this._buffer,o=this.debugData.slice(0),{data:a,byteOffset:c,...l}=this.props,u=this.device.createBuffer({...l,byteLength:t});return n&&s>0&&this._copyBufferContents(r,u,s),this._buffer=u,this._resetDebugData(t),n&&o.byteLength>0&&this._writeDebugData(o,0),this._ownsBuffer&&r.destroy(),this._ownsBuffer=!0,this.generation++,this._touch(),!0}ensureSize(e,t){return e<=this.byteLength?!1:this.resize({byteLength:e,preserveData:t?.preserveData})}getBinding(e){return e?.offset===void 0&&e?.size===void 0?this._buffer:{buffer:this._buffer,offset:e?.offset,size:e?.size}}destroy(){this.destroyed||(this._ownsBuffer&&this._buffer.destroy(),this.destroyed=!0,this.debugData=new ArrayBuffer(0))}_copyBufferContents(e,t,n){const s=this.device.type==="webgpu"?Math.ceil(n/4)*4:n,r=this.device.createCommandEncoder();r.copyBufferToBuffer({sourceBuffer:e,destinationBuffer:t,size:s}),this.device.submit(r.finish())}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_resetDebugData(e){if(!this._debugDataEnabled){this.debugData=new ArrayBuffer(0);return}this.debugData=new ArrayBuffer(Math.min(e,this._maxDebugDataByteLength))}_writeDebugData(e,t){if(!this._debugDataEnabled||this.debugData.byteLength===0||t>=this.debugData.byteLength)return!1;const n=ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e),s=new Uint8Array(this.debugData),r=Math.min(n.byteLength,s.byteLength-t);return s.set(n.subarray(0,r),t),r>0}}function rh(i){return i!==null&&typeof i=="object"&&"buffer"in i}function lE(i){return i instanceof Le?i.buffer:i}function uE(i){return{buffer:lE(i.buffer),offset:i.offset,size:i.size}}function Dn(i){return i!==null&&typeof i=="object"&&"resolveTextureBinding"in i&&typeof i.resolveTextureBinding=="function"}function fE(i){return i?.type==="texture"||i?.type==="external-texture"}function dE(i,e,t){const n=ud(i,e,{ignoreWarnings:!0});return fE(n)?n:i.bindings.length===0&&t?.fallbackGroup!==void 0?{type:"texture",name:e,group:t.fallbackGroup,location:0}:null}const Ee=2,hE=1e4,br="render pipeline initialization failed",gE=["stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"];class De{static defaultProps={...Ye.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],plugins:[],geometry:null,indexBuffer:null,indexCount:void 0,firstVertex:0,firstIndex:0,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:ce.getDefaultShaderAssembler("glsl"),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexCount;firstVertex;firstIndex;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_dynamicIndexBufferSource=null;_dynamicAttributeBufferSources={};_colorAttachmentFormats;_depthStencilAttachmentFormat;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_drawBlockedReason=!1;_destroyed=!1;_vertexCountSet=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(e,t){const n=De.defaultProps.shaderAssembler,s=t.vertexCount!==void 0;this.props={...De.defaultProps,...t,shaderAssembler:t.shaderAssembler??(vr(n,e.info.shadingLanguage)?n:ce.getDefaultShaderAssembler(e.info.shadingLanguage))},this._vertexCountSet=s,t=this.props,this.id=t.id||en("model"),this.device=e,Object.assign(this.userData,t.userData),this.material=t.material||null;const r=bE(e),o=bd(this.props.plugins,r.shaderLanguage),a=vd(this.props.modules,o.modules),c=Object.fromEntries(a.map(h=>[h.name,h])),l=t.shaderInputs||new sh(c,{disableWarnings:this.props.disableWarnings});t.shaderInputs&&o.modules.length>0&&l.addModules(o.modules),this.setShaderInputs(l);const u=nh(this.props.modules,l.getModules()),f={...o.defines,...this.props.defines};if(this.device.type==="webgl"&&(this.props._uniformBlockLayouts=eE(u)),this.props.shaderLayout=cs(this.props.shaderLayout,u)||null,this.device.type==="webgpu"&&this.props.source){const h=this.props.shaderAssembler;Bi(vr(h,"wgsl"));const{source:g,getUniforms:p,bindingTable:m,shaderLayout:_}=h.assembleWGSLShader({platformInfo:r,...this.props,modules:u,defines:f,pluginInjections:o.injections,pluginVertexInputs:o.vertexInputs,pluginVaryings:o.varyings});this.source=g,this._getModuleUniforms=p,this._bindingTable=m;const b=_??e.getShaderLayout?.(this.source),y=pE(b,o.vertexInputs),v=J2(this.props.shaderLayout,y,Object.keys(o.vertexInputs));this.props.shaderLayout=cs(v||null,u)||null}else{const h=this.props.shaderAssembler;Bi(vr(h,"glsl"));const{vs:g,fs:p,getUniforms:m}=h.assembleGLSLShaderPair({platformInfo:r,...this.props,modules:u,defines:f,pluginInjections:o.injections,pluginVertexInputs:o.vertexInputs,pluginVaryings:o.varyings});this.vs=g,this.fs=p,this._getModuleUniforms=m,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.indexCount=this.props.indexCount,this.firstVertex=this.props.firstVertex,this.firstIndex=this.props.firstIndex,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,this._colorAttachmentFormats=this.props.colorAttachmentFormats,this._depthStencilAttachmentFormat=this.props.depthStencilAttachmentFormat,t.geometry&&this.setGeometry(t.geometry),this.pipelineFactory=t.pipelineFactory||Ls.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||Cs.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=e.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in t&&(this.isInstanced=t.isInstanced),t.instanceCount&&this.setInstanceCount(t.instanceCount),t.vertexCount&&this.setVertexCount(t.vertexCount),t.indexBuffer&&this.setIndexBuffer(t.indexBuffer),t.attributes&&this.setAttributes(t.attributes),t.constantAttributes&&this.setConstantAttributes(t.constantAttributes),t.bindings&&this.setBindings(t.bindings),t.transformFeedback&&(this.transformFeedback=t.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");const e=this._needsRedraw;return this._needsRedraw=!1,e}setNeedsRedraw(e){this._needsRedraw||=e}getBindingDebugTable(){return this._bindingTable}predraw(e){this._syncDynamicBuffers(),this.updateShaderInputs(e),this.material?.updateShaderInputs(e),this.pipeline=this._updatePipeline()}draw(e){if(this._drawBlockedReason&&!this._pipelineNeedsUpdate)return P.info(Ee,`>>> DRAWING ABORTED ${this.id}: ${this._drawBlockedReason}`)(),!1;const t=this._areBindingsLoading();if(t)return P.info(Ee,`>>> DRAWING ABORTED ${this.id}: ${t} not loaded`)(),!1;this._syncAttachmentFormats(e);try{e.pushDebugGroup(`${this}.predraw(${e})`),this.device.type==="webgpu"?(this.updateShaderInputs(),this.material?.updateShaderInputs(),this._syncDynamicBuffers(),this.pipeline=this._updatePipeline()):this.predraw(this.device.commandEncoder)}finally{e.popDebugGroup()}let n,s=this.pipeline.isErrored;try{if(e.pushDebugGroup(`${this}.draw(${e})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),s=this.pipeline.isErrored,s)P.info(Ee,`>>> DRAWING ABORTED ${this.id}: ${br}`)(),n=!1;else{const r=this.vertexArray.getDrawValidationError();if(r)P.info(Ee,`>>> DRAWING ABORTED ${this.id}: ${r}`)(),this._drawBlockedReason=r,n=!1;else{const o=this._getCurrentShaderLayout(),a=this._getBindings(o),c=this._getBindGroups(o,a),{indexBuffer:l}=this.vertexArray,u=l?this.indexCount??(this._vertexCountSet?this.vertexCount:l.byteLength/(l.indexType==="uint32"?4:2)):void 0;e.setPipeline(this.pipeline),e.setBindings(c,{_bindGroupCacheKeys:this._getBindGroupCacheKeys()}),e.setVertexArray(this.vertexArray),n=this.isInstanced===!0&&this.instanceCount===0?!0:e.draw({isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.isInstanced?this.instanceCount:void 0,indexCount:u,firstVertex:this.firstVertex,firstIndex:this.firstIndex,transformFeedback:this.transformFeedback||void 0,uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}}finally{e.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(e),n?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):s?(this._needsRedraw=br,this._drawBlockedReason=br):this._drawBlockedReason?this._needsRedraw=this._drawBlockedReason:this._needsRedraw="waiting for resource initialization",n}setGeometry(e){this._gpuGeometry?.destroy();const t=e&&G2(this.device,e);if(t){this.setTopology(t.topology||"triangle-list");const n=new yr(this.bufferLayout);this.bufferLayout=n.mergeBufferLayouts(t.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(t)}this._gpuGeometry=t}setTopology(e){e!==this.topology&&(this.topology=e,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(e){const t=new yr(this.bufferLayout),n=this._gpuGeometry?t.mergeBufferLayouts(e,this._gpuGeometry.bufferLayout):e;Pi(n,this.bufferLayout,-1)||(this.bufferLayout=n,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry))}setParameters(e){Pi(e,this.parameters,2)||(this.parameters=e,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(e){this.instanceCount=e,this.isInstanced===void 0&&e>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(e){this.vertexCount=e,this._vertexCountSet=!0,this.setNeedsRedraw("vertexCount")}setIndexCount(e){this.indexCount=e,this.setNeedsRedraw("indexCount")}setDrawOffsets({firstVertex:e,firstIndex:t}){this.firstVertex=e,this.firstIndex=t,this.setNeedsRedraw("drawOffsets")}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new _d(this.device,this.shaderInputs.modules);for(const[t,n]of Object.entries(this.shaderInputs.modules))if(Va(n)&&!this.material?.ownsModule(t)){const s=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=s}this.setNeedsRedraw("shaderInputs")}setMaterial(e){this.material=e,this.setNeedsRedraw("material")}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(e){Object.assign(this.bindings,e),this.setNeedsRedraw("bindings")}setTransformFeedback(e){this.transformFeedback=e,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(e){const t=e instanceof Le?e.buffer:e;this.indexBuffer=t,this._dynamicIndexBufferSource=e instanceof Le?{source:e,generation:e.generation}:null,this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(e,t){this._drawBlockedReason=!1;const n=t?.disableWarnings??this.props.disableWarnings;e.indices&&P.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=Q2(this.pipeline.shaderLayout,this.bufferLayout);const s=new yr(this.bufferLayout);for(const[r,o]of Object.entries(e)){const a=o instanceof Le?o.buffer:o,c=s.getBufferLayout(r);if(!c){n||P.warn(`Model(${this.id}): Missing layout for buffer "${r}".`)();continue}const l=s.getAttributeNamesForBuffer(c);let u=!1;for(const f of l){const d=this._attributeInfos[f];if(d){const h=this.device.type==="webgpu"?this.vertexArray.getBufferSlot(d.bufferName):d.location;if(h===null){n||P.warn(`Model(${this.id}): Missing vertex array slot for buffer "${d.bufferName}".`)();continue}this.vertexArray.setBuffer(h,a),o instanceof Le?this._dynamicAttributeBufferSources[h]={source:o,generation:o.generation}:delete this._dynamicAttributeBufferSources[h],u=!0}}!u&&!n&&P.warn(`Model(${this.id}): Ignoring buffer "${a.id}" for unknown attribute "${r}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(e,t){for(const[n,s]of Object.entries(e)){const r=this._attributeInfos[n];r?this.vertexArray.setConstantWebGL(r.location,s):(t?.disableWarnings??this.props.disableWarnings)||P.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${n}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(const e of Object.values(this.bindings))if(Dn(e)&&!e.isReady)return e.id;for(const e of Object.values(this.material?.bindings||{}))if(Dn(e)&&!e.isReady)return e.id;return!1}_getBindings(e=this._getCurrentShaderLayout()){const t={};for(const[n,s]of Object.entries(this.bindings)){const r=mE(n,s,e);r&&(t[n]=r)}return t}_getBindGroups(e=this._getCurrentShaderLayout(),t=this._getBindings(e)){const n=e.bindings.length?da(e,t):{0:t};if(!this.material)return n;for(const[s,r]of Object.entries(this.material.getBindingsByGroup(e))){const o=Number(s);n[o]={...n[o]||{},...r}}return n}_getBindGroupCacheKeys(){const e=this.material?.getBindGroupCacheKey(3);return e?{3:e}:{}}_getBindingsUpdateTimestamp(){let e=0;this._dynamicIndexBufferSource&&(e=Math.max(e,this._dynamicIndexBufferSource.source.updateTimestamp));for(const t of Object.values(this._dynamicAttributeBufferSources))e=Math.max(e,t.source.updateTimestamp);for(const t of Object.values(this.bindings))t instanceof Es?e=Math.max(e,t.texture.updateTimestamp):t instanceof O||t instanceof k||t instanceof fa||t instanceof Le?e=Math.max(e,t.updateTimestamp):Dn(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:rh(t)&&(e=Math.max(e,(t.buffer instanceof Le,t.buffer.updateTimestamp)));return Math.max(e,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(e){const t={...e.attributes};for(const[n]of Object.entries(t))!this.pipeline.shaderLayout.attributes.find(s=>s.name===n)&&n!=="positions"&&delete t[n];this.vertexCount=e.vertexCount,this._vertexCountSet=!0,this.setIndexBuffer(e.indices||null),this.setAttributes(e.attributes,{disableWarnings:!0}),this.setAttributes(t,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate||=e,this._drawBlockedReason=!1,this.setNeedsRedraw(e)}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null,t=null;this.pipeline&&(P.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.pipeline.vs,t=this.pipeline.fs),this._pipelineNeedsUpdate=!1;const n=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders});let s=null;this.source?s=n:this.fs&&(s=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,colorAttachmentFormats:this._colorAttachmentFormats,depthStencilAttachmentFormat:this._depthStencilAttachmentFormat,topology:this.topology,parameters:this.parameters,bindGroups:void 0,vs:n,fs:s}),this._attributeInfos=yd(this.pipeline.shaderLayout,this.bufferLayout),e&&this.shaderFactory.release(e),t&&t!==e&&this.shaderFactory.release(t)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=P.level>3?0:hE;P.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,P.group(Ee,`>>> DRAWING MODEL ${this.id}`,{collapsed:P.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=W2(this.pipeline.shaderLayout,this.id);P.table(Ee,e)();const t=this.shaderInputs.getDebugTable();P.table(Ee,t)();const n=this._getAttributeDebugTable();P.table(Ee,this._attributeInfos)(),P.table(Ee,n)(),P.groupEnd(Ee)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(e){const t=this.device.props.debugFramebuffers;if(this._drawCount++,!t)return;const n=e.props.framebuffer;H2(e,n,{id:n?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){const e={};for(const[t,n]of Object.entries(this._attributeInfos)){const s=this.vertexArray.attributes[n.location];e[n.location]={name:t,type:n.shaderType,values:s?this._getBufferOrConstantValues(s,n.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){const{indexBuffer:t}=this.vertexArray,n=t.indexType==="uint32"?new Uint32Array(t.debugData):new Uint16Array(t.debugData);e.indices={name:"indices",type:t.indexType,values:n.toString()}}return e}_getBufferOrConstantValues(e,t){const n=Be.getTypedArrayConstructor(t);return(e instanceof O?new n(e.debugData):e).toString()}_getNonMaterialBindings(e){if(!this.material)return e;const t={};for(const[n,s]of Object.entries(e))this.material.ownsBinding(n)||(t[n]=s);return t}_getCurrentShaderLayout(){return this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]}}_syncDynamicBuffers(){if(this._dynamicIndexBufferSource&&this._dynamicIndexBufferSource.generation!==this._dynamicIndexBufferSource.source.generation){const e=this._dynamicIndexBufferSource.source.buffer;this.indexBuffer=e,this.vertexArray.setIndexBuffer(e),this._dynamicIndexBufferSource.generation=this._dynamicIndexBufferSource.source.generation,this.setNeedsRedraw("dynamic index buffer")}for(const[e,t]of Object.entries(this._dynamicAttributeBufferSources))t.generation!==t.source.generation&&(this.vertexArray.setBuffer(Number(e),t.source.buffer),t.generation=t.source.generation,this.setNeedsRedraw("dynamic attribute buffer"))}_syncAttachmentFormats(e){if(this.device.type!=="webgpu")return;const t=e.framebuffer||e.props.framebuffer,n=e.props,s=n.colorAttachmentFormats??t?.colorAttachments?.map(o=>_E(o?.texture?.format)),r=n.depthStencilAttachmentFormat===!1?void 0:n.depthStencilAttachmentFormat??yE(t?.depthStencilAttachment?.texture?.format);(!Pi(this._colorAttachmentFormats,s,1)||this._depthStencilAttachmentFormat!==r)&&(this._colorAttachmentFormats=s,this._depthStencilAttachmentFormat=r,this._setPipelineNeedsUpdate("attachment formats"))}}function vr(i,e){return i.shaderLanguage!==void 0&&i.shaderLanguage!==e?!1:e==="glsl"?"assembleGLSLShaderPair"in i&&typeof i.assembleGLSLShaderPair=="function":"assembleWGSLShader"in i&&typeof i.assembleWGSLShader=="function"}function pE(i,e){return!i||Object.keys(e).length===0?i:{...i,attributes:i.attributes.map(t=>{const n=t.name.startsWith("_luma_")?t.name.slice(6):null;return n&&e[n]?{...t,name:n}:t})}}function mE(i,e,t){if(Dn(e)){const n=dE(t,i,{fallbackGroup:0});return n?e.resolveTextureBinding(n):null}return e instanceof Le?e.buffer:rh(e)?uE(e):e}function _E(i){return i&&!oh(i)?i:null}function yE(i){return i&&oh(i)?i:void 0}function oh(i){return gE.includes(i)}function bE(i){return{type:i.type,shaderLanguage:i.info.shadingLanguage,shaderLanguageVersion:i.info.shadingLanguageVersion,gpu:i.info.gpu,limits:i.limits,features:i.features}}const vE=35980,wE=35981;class Fe{device;model;transformFeedback;static defaultProps={...De.defaultProps,feedbackBufferMode:"separate",outputs:void 0,feedbackBuffers:void 0};static isSupported(e){return e?.info?.type==="webgl"}constructor(e,t=Fe.defaultProps){if(!Fe.isSupported(e))throw new Error("BufferTransform not yet implemented on WebGPU");this.device=e,this.model=new De(this.device,{id:t.id||"buffer-transform-model",fs:t.fs||c0(),topology:t.topology||"point-list",varyings:t.outputs||t.varyings,...t,bufferMode:t.bufferMode||(t.feedbackBufferMode==="interleaved"?vE:wE)}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:t.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(e){e?.inputBuffers&&this.model.setAttributes(e.inputBuffers),e?.outputBuffers&&this.transformFeedback.setBuffers(e.outputBuffers);const t=this.device.beginRenderPass({discard:!0,...e});this.model.draw(t),t.end()}getBuffer(e){return this.transformFeedback.getBuffer(e)}readAsync(e){const t=this.getBuffer(e);if(!t)throw new Error("BufferTransform#getBuffer");if(t instanceof O)return t.readAsync();const{buffer:n,byteOffset:s=0,byteLength:r=n.byteLength}=t;return n.readAsync(s,r)}}const wr=2,xE=1e4;class St{static defaultProps={...Di.defaultProps,id:"unnamed",handle:void 0,userData:{},source:"",modules:[],defines:{},plugins:[],bindings:void 0,shaderInputs:void 0,pipelineFactory:void 0,shaderFactory:void 0,shaderAssembler:ce.getDefaultShaderAssembler("wgsl"),debugShaders:void 0};device;id;pipelineFactory;shaderFactory;userData={};bindings={};pipeline;source;shader;shaderInputs;_uniformStore;_pipelineNeedsUpdate="newly created";_getModuleUniforms;props;_destroyed=!1;constructor(e,t){if(e.type!=="webgpu")throw new Error("Computation is only supported in WebGPU");this.props={...St.defaultProps,...t},t=this.props,this.id=t.id||en("model"),this.device=e,Object.assign(this.userData,t.userData);const n=PE(e),s=bd(this.props.plugins,n.shaderLanguage);if(Object.keys(s.vertexInputs).length>0||Object.keys(s.varyings).length>0)throw new Error("Computation does not support ShaderPlugin vertex inputs or varyings");const r=vd(this.props.modules,s.modules),o=Object.fromEntries(r.map(g=>[g.name,g]));this.shaderInputs=t.shaderInputs||new sh(o),t.shaderInputs&&s.modules.length>0&&this.shaderInputs.addModules(s.modules),this.setShaderInputs(this.shaderInputs);const a=nh(this.props.modules,this.shaderInputs?.getModules()),c={...s.defines,...this.props.defines};this.props.shaderLayout=cs(this.props.shaderLayout,a)||null,this.pipelineFactory=t.pipelineFactory||Ls.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||Cs.getDefaultShaderFactory(this.device);const l=this.props.shaderAssembler;Bi(l instanceof qt);const{source:u,getUniforms:f,shaderLayout:d}=l.assembleWGSLShader({platformInfo:n,...this.props,modules:a,defines:c,scanVertexAttributes:!1,pluginInjections:s.injections});this.source=u,this._getModuleUniforms=f;const h=d??e.getShaderLayout?.(this.source,{scanVertexAttributes:!1});this.props.shaderLayout=cs(this.props.shaderLayout||h||null,a)||null,this.pipeline=this._updatePipeline(),t.bindings&&this.setBindings(t.bindings)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.shader),this._uniformStore.destroy(),this._destroyed=!0)}predraw(e){this.updateShaderInputs(e)}dispatch(e,t,n,s){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatch(t,n,s)}finally{this._logDrawCallEnd()}}dispatchIndirect(e,t,n=0){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatchIndirect(t,n)}finally{this._logDrawCallEnd()}}_setPipeline(e){this.pipeline=this._updatePipeline(),this.pipeline.setBindings(this.bindings),e.setPipeline(this.pipeline),e.setBindings({})}setVertexCount(e){}setInstanceCount(e){}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new _d(this.device,this.shaderInputs.modules);for(const[t,n]of Object.entries(this.shaderInputs.modules))if(Va(n)){const s=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=s}}setShaderModuleProps(e){const t=this._getModuleUniforms(e),n=Object.keys(t).filter(s=>{const r=t[s];return!Vf(r)&&typeof r!="number"&&typeof r!="boolean"});for(const s of n)t[s],delete t[s]}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e)}setBindings(e){Object.assign(this.bindings,e)}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate=this._pipelineNeedsUpdate||e}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null;this.pipeline&&(P.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.shader),this._pipelineNeedsUpdate=!1,this.shader=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"compute",source:this.source,debugShaders:this.props.debugShaders}),this.pipeline=this.pipelineFactory.createComputePipeline({...this.props,shader:this.shader}),e&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=P.level>3?0:xE;P.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,P.group(wr,`>>> DRAWING MODEL ${this.id}`,{collapsed:P.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=this.shaderInputs.getDebugTable();P.table(wr,e)(),P.groupEnd(wr)(),this._logOpen=!1}}_drawCount=0;_getBufferOrConstantValues(e,t){const n=Be.getTypedArrayConstructor(t);return(e instanceof O?new n(e.debugData):e).toString()}}function PE(i){return{type:i.type,shaderLanguage:i.info.shadingLanguage,shaderLanguageVersion:i.info.shadingLanguageVersion,gpu:i.info.gpu,limits:i.limits,features:i.features}}const EE={blendColorOperation:"add",blendColorSrcFactor:"one",blendColorDstFactor:"zero",blendAlphaOperation:"add",blendAlphaSrcFactor:"constant",blendAlphaDstFactor:"zero"};class ah extends Ua{constructor(){super(...arguments),this._colorEncoderState=null}render(e){return"pickingFBO"in e?this._drawPickingBuffer(e):{decodePickingColor:null,stats:super._render(e)}}_drawPickingBuffer({layers:e,layerFilter:t,views:n,viewports:s,onViewportActive:r,pickingFBO:o,deviceRect:{x:a,y:c,width:l,height:u},cullRect:f,effects:d,pass:h="picking",pickZ:g,canvasContext:p,shaderModuleProps:m,clearColor:_}){this.pickZ=g;const b=this._resetColorEncoder(g),y=[a,c,l,u],v=super._render({target:o,layers:e,layerFilter:t,views:n,viewports:s,onViewportActive:r,cullRect:f,effects:d?.filter(x=>x.useInPicking),pass:h,canvasContext:p,isPicking:!0,shaderModuleProps:m,clearColor:_??[0,0,0,0],colorMask:15,scissorRect:y});return this._colorEncoderState=null,{decodePickingColor:b&&SE.bind(null,b),stats:v}}shouldDrawLayer(e){const{pickable:t,operation:n}=e.props;return t&&n.includes("draw")||n.includes("terrain")||n.includes("mask")}getShaderModuleProps(e,t,n){return{picking:{isActive:1,isAttribute:this.pickZ,disabledPickingIndices:e.internalState?.disabledPickingIndices},lighting:{enabled:!1}}}getLayerParameters(e,t,n){const s={...e.props.parameters},{pickable:r,operation:o}=e.props;return this._colorEncoderState?r&&o.includes("draw")?(Object.assign(s,EE),s.blend=!0,this.device.type==="webgpu"?s.blendConstant=Xl(this._colorEncoderState,e,n):s.blendColor=Xl(this._colorEncoderState,e,n),o.includes("terrain")&&e.state?._hasPickingCover&&(s.blendAlphaSrcFactor="one")):o.includes("terrain")&&(s.blend=!1):s.blend=!1,s}_resetColorEncoder(e){return this._colorEncoderState=e?null:{byLayer:new Map,byAlpha:[]},this._colorEncoderState}}function Xl(i,e,t){const{byLayer:n,byAlpha:s}=i;let r,o=n.get(e);return o?(o.viewports.push(t),r=o.a):(r=n.size+1,r<=255?(o={a:r,layer:e,viewports:[t]},n.set(e,o),s[r]=o):(z.warn("Too many pickable layers, only picking the first 255")(),r=0)),[0,0,0,r/255]}function SE(i,e){const t=i.byAlpha[e[3]];return t&&{pickedLayer:t.layer,pickedViewports:t.viewports,pickedObjectIndex:t.layer.decodePickingColor(e)}}const kt={NO_STATE:"Awaiting state",MATCHED:"Matched. State transferred from previous layer",INITIALIZED:"Initialized",AWAITING_GC:"Discarded. Awaiting garbage collection",AWAITING_FINALIZATION:"No longer matched. Awaiting garbage collection",FINALIZED:"Finalized! Awaiting garbage collection"},ls=Symbol.for("component"),Ke=Symbol.for("propTypes"),xr=Symbol.for("deprecatedProps"),Gt=Symbol.for("asyncPropDefaults"),yt=Symbol.for("asyncPropOriginal"),qe=Symbol.for("asyncPropResolved");function Kt(i,e=()=>!0){return Array.isArray(i)?ch(i,e,[]):e(i)?[i]:[]}function ch(i,e,t){let n=-1;for(;++n<i.length;){const s=i[n];Array.isArray(s)?ch(s,e,t):e(s)&&t.push(s)}return t}function TE({target:i,source:e,start:t=0,count:n=1}){const s=e.length,r=n*s;let o=0;for(let a=t;o<s;o++)i[a++]=e[o];for(;o<r;)o<r-o?(i.copyWithin(t+o,t,t+o),o*=2):(i.copyWithin(t+o,t,t+r-o),o=r);return i}class LE{constructor(e,t,n){this._loadCount=0,this._subscribers=new Set,this.id=e,this.context=n,this.setData(t)}subscribe(e){this._subscribers.add(e)}unsubscribe(e){this._subscribers.delete(e)}inUse(){return this._subscribers.size>0}delete(){}getData(){return this.isLoaded?this._error?Promise.reject(this._error):this._content:this._loader.then(()=>this.getData())}setData(e,t){if(e===this._data&&!t)return;this._data=e;const n=++this._loadCount;let s=e;typeof e=="string"&&(s=Vn(e)),s instanceof Promise?(this.isLoaded=!1,this._loader=s.then(r=>{this._loadCount===n&&(this.isLoaded=!0,this._error=void 0,this._content=r)}).catch(r=>{this._loadCount===n&&(this.isLoaded=!0,this._error=r||!0)})):(this.isLoaded=!0,this._error=void 0,this._content=e);for(const r of this._subscribers)r.onChange(this.getData())}}class CE{constructor(e){this.protocol=e.protocol||"resource://",this._context={device:e.device,gl:e.device?.gl,resourceManager:this},this._resources={},this._consumers={},this._pruneRequest=null}contains(e){return e.startsWith(this.protocol)?!0:e in this._resources}add({resourceId:e,data:t,forceUpdate:n=!1,persistent:s=!0}){let r=this._resources[e];r?r.setData(t,n):(r=new LE(e,t,this._context),this._resources[e]=r),r.persistent=s}remove(e){const t=this._resources[e];t&&(t.delete(),delete this._resources[e])}unsubscribe({consumerId:e}){const t=this._consumers[e];if(t){for(const n in t){const s=t[n],r=this._resources[s.resourceId];r&&r.unsubscribe(s)}delete this._consumers[e],this.prune()}}subscribe({resourceId:e,onChange:t,consumerId:n,requestId:s="default"}){const{_resources:r,protocol:o}=this;e.startsWith(o)&&(e=e.replace(o,""),r[e]||this.add({resourceId:e,data:null,persistent:!1}));const a=r[e];if(this._track(n,s,a,t),a)return a.getData()}prune(){this._pruneRequest||(this._pruneRequest=setTimeout(()=>this._prune(),0))}finalize(){for(const e in this._resources)this._resources[e].delete()}_track(e,t,n,s){const r=this._consumers,o=r[e]=r[e]||{};let a=o[t];const c=a&&a.resourceId&&this._resources[a.resourceId];c&&(c.unsubscribe(a),this.prune()),n&&(a?(a.onChange=s,a.resourceId=n.id):a={onChange:s,resourceId:n.id},o[t]=a,n.subscribe(a))}_prune(){this._pruneRequest=null;for(const e of Object.keys(this._resources)){const t=this._resources[e];!t.persistent&&!t.inUse()&&(t.delete(),delete this._resources[e])}}}const AE="layerManager.setLayers",ME="layerManager.activateViewport";class IE{constructor(e,t){this._lastRenderedLayers=[],this._needsRedraw=!1,this._needsUpdate=!1,this._nextLayers=null,this._debug=!1,this._defaultShaderModulesChanged=!1,this.activateViewport=a=>{te(ME,this,a),a&&(this.context.viewport=a)};const{deck:n,stats:s,viewport:r,timeline:o}=t||{};this.layers=[],this.resourceManager=new CE({device:e,protocol:"deck://"}),this.context={mousePosition:null,userData:{},layerManager:this,device:e,gl:e?.gl,deck:n,shaderAssembler:r2(e?.info?.shadingLanguage||"glsl"),defaultShaderModules:[Ww],renderPass:void 0,stats:s||new _s({id:"deck.gl"}),viewport:r||new si({id:"DEFAULT-INITIAL-VIEWPORT"}),timeline:o||new ih,resourceManager:this.resourceManager,onError:void 0},Object.seal(this)}finalize(){this.resourceManager.finalize();for(const e of this.layers)this._finalizeLayer(e)}needsRedraw(e={clearRedrawFlags:!1}){let t=this._needsRedraw;e.clearRedrawFlags&&(this._needsRedraw=!1);for(const n of this.layers){const s=n.getNeedsRedraw(e);t=t||s}return t}needsUpdate(){return this._nextLayers&&this._nextLayers!==this._lastRenderedLayers?"layers changed":this._defaultShaderModulesChanged?"shader modules changed":this._needsUpdate}setNeedsRedraw(e){this._needsRedraw=this._needsRedraw||e}setNeedsUpdate(e){this._needsUpdate=this._needsUpdate||e}getLayers({layerIds:e}={}){return e?this.layers.filter(t=>e.find(n=>t.id.indexOf(n)===0)):this.layers}setProps(e){"debug"in e&&(this._debug=e.debug),"userData"in e&&(this.context.userData=e.userData),"layers"in e&&(this._nextLayers=e.layers),"onError"in e&&(this.context.onError=e.onError)}setLayers(e,t){te(AE,this,t,e),this._lastRenderedLayers=e;const n=Kt(e,Boolean);for(const s of n)s.context=this.context;this._updateLayers(this.layers,n)}updateLayers(){const e=this.needsUpdate();e&&(this.setNeedsRedraw(`updating layers: ${e}`),this.setLayers(this._nextLayers||this._lastRenderedLayers,e)),this._nextLayers=null}addDefaultShaderModule(e){const{defaultShaderModules:t}=this.context;t.find(n=>n.name===e.name)||(t.push(e),this._defaultShaderModulesChanged=!0)}removeDefaultShaderModule(e){const{defaultShaderModules:t}=this.context,n=t.findIndex(s=>s.name===e.name);n>=0&&(t.splice(n,1),this._defaultShaderModulesChanged=!0)}_handleError(e,t,n){n.raiseError(t,`${e} of ${n}`)}_updateLayers(e,t){const n={};for(const o of e)n[o.id]?z.warn(`Multiple old layers with same id ${o.id}`)():n[o.id]=o;if(this._defaultShaderModulesChanged){for(const o of e)o.setNeedsUpdate(),o.setChangeFlags({extensionsChanged:!0});this._defaultShaderModulesChanged=!1}const s=[];this._updateSublayersRecursively(t,n,s),this._finalizeOldLayers(n);let r=!1;for(const o of s)if(o.hasUniformTransition()){r=`Uniform transition in ${o}`;break}this._needsUpdate=r,this.layers=s}_updateSublayersRecursively(e,t,n){for(const s of e){s.context=this.context;const r=t[s.id];r===null&&z.warn(`Multiple new layers with same id ${s.id}`)(),t[s.id]=null;let o=null;try{this._debug&&r!==s&&s.validateProps(),r?(this._transferLayerState(r,s),this._updateLayer(s)):this._initializeLayer(s),n.push(s),o=s.isComposite?s.getSubLayers():null}catch(a){this._handleError("matching",a,s)}o&&this._updateSublayersRecursively(o,t,n)}}_finalizeOldLayers(e){for(const t in e){const n=e[t];n&&this._finalizeLayer(n)}}_initializeLayer(e){try{e._initialize(),e.lifecycle=kt.INITIALIZED}catch(t){this._handleError("initialization",t,e)}}_transferLayerState(e,t){t._transferState(e),t.lifecycle=kt.MATCHED,t!==e&&(e.lifecycle=kt.AWAITING_GC)}_updateLayer(e){try{e._update()}catch(t){this._handleError("update",t,e)}}_finalizeLayer(e){this._needsRedraw=this._needsRedraw||`finalized ${e}`,e.lifecycle=kt.AWAITING_FINALIZATION;try{e._finalize(),e.lifecycle=kt.FINALIZED}catch(t){this._handleError("finalization",t,e)}}}function J(i,e,t){if(i===e)return!0;if(!t||!i||!e)return!1;if(Array.isArray(i)){if(!Array.isArray(e)||i.length!==e.length)return!1;for(let n=0;n<i.length;n++)if(!J(i[n],e[n],t-1))return!1;return!0}if(Array.isArray(e))return!1;if(typeof i=="object"&&typeof e=="object"){const n=Object.keys(i),s=Object.keys(e);if(n.length!==s.length)return!1;for(const r of n)if(!e.hasOwnProperty(r)||!J(i[r],e[r],t-1))return!1;return!0}return!1}const Vt="default-canvas";class RE{constructor(e){this.views=[],this.width=100,this.height=100,this.viewState={},this.controllers={},this.timeline=e.timeline,this._viewports=[],this._viewportMap={},this._isUpdating=!1,this._needsRedraw="First render",this._needsUpdate="Initialize",this._eventManager=e.eventManager,this._eventManagers=e.eventManagers||{},this._viewEventManagers={},this._eventCallbacks={onViewStateChange:e.onViewStateChange,onInteractionStateChange:e.onInteractionStateChange},this._pickPosition=e.pickPosition,this._getCanvasContext=e.getCanvasContext,Object.seal(this),this.setProps(e)}finalize(){for(const e in this.controllers){const t=this.controllers[e];t&&t.finalize()}this.controllers={}}needsRedraw(e={clearRedrawFlags:!1}){const t=this._needsRedraw;return e.clearRedrawFlags&&(this._needsRedraw=!1),t}setNeedsUpdate(e){this._needsUpdate=this._needsUpdate||e,this._needsRedraw=this._needsRedraw||e}updateViewStates(){for(const e in this.controllers){const t=this.controllers[e];t&&t.updateTransition()}}getViewports(e){return e?this._viewports.filter(t=>{const n=!e.canvasId||this.getCanvasId(t.id)===e.canvasId,s=!("x"in e)||t.containsPixel(e);return n&&s}):this._viewports}getViews(){const e={};return this.views.forEach(t=>{e[t.id]=t}),e}getView(e){return this.views.find(t=>t.id===e)}getViewState(e){const t=typeof e=="string"?this.getView(e):e,n=t&&this.viewState[t.getViewStateId()]||this.viewState;return t?t.filterViewState(n):n}getViewport(e){return this._viewportMap[e]}getCanvasId(e){const t=typeof e=="string"?this.getView(e):e;return t?this._viewEventManagers[t.id]?.canvasId||this._getCanvasIdFromView(t):void 0}unproject(e,t){const n=this.getViewports(),s={x:e[0],y:e[1]};for(let r=n.length-1;r>=0;--r){const o=n[r];if(o.containsPixel(s)){const a=e.slice();return a[0]-=o.x,a[1]-=o.y,o.unproject(a,t)}}return null}setProps(e){e.views&&this._setViews(e.views),e.viewState&&this._setViewState(e.viewState),("width"in e||"height"in e)&&this._setSize(e.width,e.height),"pickPosition"in e&&(this._pickPosition=e.pickPosition),"eventManagers"in e&&this._setEventManagers(e.eventManagers||{}),this._isUpdating||this._update()}_update(){this._isUpdating=!0;try{this._needsUpdate&&(this._needsUpdate=!1,this._rebuildViewports()),this._needsUpdate&&(this._needsUpdate=!1,this._rebuildViewports())}finally{this._isUpdating=!1}}_hasViewState(e){const t=e.props.viewState;if(t&&typeof t=="object"&&!t.id||this.viewState[e.getViewStateId()])return!0;const n=Object.values(this.viewState);return n.length===0||n.some(s=>!s||typeof s!="object"||Array.isArray(s))}_setSize(e,t){(e!==this.width||t!==this.height)&&(this.width=e,this.height=t,this.setNeedsUpdate("Size changed"))}_setViews(e){e=Kt(e,Boolean),this._diffViews(e,this.views)&&this.setNeedsUpdate("views changed"),this.views=e}_setViewState(e){e?(!J(e,this.viewState,3)&&this.setNeedsUpdate("viewState changed"),this.viewState=e):z.warn("missing `viewState` or `initialViewState`")()}_setEventManagers(e){this._eventManagers!==e&&(this._eventManagers=e,this.setNeedsUpdate("eventManagers changed"))}_getCanvasIdFromView(e){return e.props.canvasId||this._getCanvasContext?.(e.id)?.id||Vt}_getCanvasDimensions(e){const t=this._getCanvasContext?.(e.id),[n,s]=t?.getCSSSize()||[this.width,this.height];return{width:n,height:s}}_getViewEventManager(e){const t=this.getCanvasId(e)||Vt;return{canvasId:t,eventManager:this._eventManagers[t]||this._eventManager}}_startViewportRebuild(){const e=this.controllers,t=this._viewEventManagers;return this._viewports=[],this.controllers={},this._viewEventManagers={},{oldControllers:e,oldViewEventManagers:t}}_getReusableController(e,t,n){return e&&(t?.canvasId!==n.canvasId||t?.eventManager!==n.eventManager)?(e.finalize(),null):e}_createController(e,t){const n=t.type;return new n({timeline:this.timeline,eventManager:this._getViewEventManager(e).eventManager,onViewStateChange:this._eventCallbacks.onViewStateChange,onStateChange:this._eventCallbacks.onInteractionStateChange,makeViewport:r=>this.getView(e.id)?.makeViewport({viewState:r,...this._getCanvasDimensions(e)}),pickPosition:(r,o)=>this._pickPosition?.(r,o,e.id)})}_updateController(e,t,n,s){const r=e.controller;if(r&&n){const o={...t,...r,id:e.id,x:n.x,y:n.y,width:n.width,height:n.height};return(!s||s.constructor!==r.type)&&(s=this._createController(e,o)),s&&s.setProps(o),s}return null}_rebuildViewports(){const{views:e}=this,{oldControllers:t,oldViewEventManagers:n}=this._startViewportRebuild();let s=!1;for(let r=e.length;r--;){const o=e[r],{width:a,height:c}=this._getCanvasDimensions(o),l=this._getViewEventManager(o);this._viewEventManagers[o.id]=l;const u=this.getViewState(o),f=o.makeViewport({viewState:u,width:a,height:c});let d=this._getReusableController(t[o.id],n[o.id],l),h=!!o.controller;h&&!this._hasViewState(o)&&(h=!1),h&&!d&&(s=!0),(s||!h)&&d&&(d.finalize(),d=null),this.controllers[o.id]=h?this._updateController(o,u,f,d):null,f&&this._viewports.unshift(f)}for(const r in t){const o=t[r];o&&!this.controllers[r]&&o.finalize()}this._buildViewportMap()}_buildViewportMap(){this._viewportMap={},this._viewports.forEach(e=>{e.id&&(this._viewportMap[e.id]=this._viewportMap[e.id]||e)})}_diffViews(e,t){return e.length!==t.length?!0:e.some((n,s)=>!e[s].equals(t[s]))}}const OE=/^(?:\d+\.?\d*|\.\d+)$/;function ue(i){switch(typeof i){case"number":if(!Number.isFinite(i))throw new Error(`Could not parse position string ${i}`);return{type:"literal",value:i};case"string":try{const e=BE(i);return new kE(e).parseExpression()}catch(e){const t=e instanceof Error?e.message:String(e);throw new Error(`Could not parse position string ${i}: ${t}`)}default:throw new Error(`Could not parse position string ${i}`)}}function Oo(i,e){switch(i.type){case"literal":return i.value;case"percentage":return Math.round(i.value*e);case"binary":const t=Oo(i.left,e),n=Oo(i.right,e);return i.operator==="+"?t+n:t-n;default:throw new Error("Unknown layout expression type")}}function fe(i,e){return Oo(i,e)}function BE(i){const e=[];let t=0;for(;t<i.length;){const n=i[t];if(/\s/.test(n)){t++;continue}if(n==="+"||n==="-"||n==="("||n===")"||n==="%"){e.push({type:"symbol",value:n}),t++;continue}if(Zl(n)||n==="."){const s=t;let r=n===".";for(t++;t<i.length;){const a=i[t];if(Zl(a)){t++;continue}if(a==="."&&!r){r=!0,t++;continue}break}const o=i.slice(s,t);if(!OE.test(o))throw new Error("Invalid number token");e.push({type:"number",value:parseFloat(o)});continue}if(Kl(n)){const s=t;for(;t<i.length&&Kl(i[t]);)t++;const r=i.slice(s,t).toLowerCase();e.push({type:"word",value:r});continue}throw new Error("Invalid token in position string")}return e}class kE{constructor(e){this.index=0,this.tokens=e}parseExpression(){const e=this.parseBinaryExpression();if(this.index<this.tokens.length)throw new Error("Unexpected token at end of expression");return e}parseBinaryExpression(){let e=this.parseFactor(),t=this.peek();for(;DE(t);){this.index++;const n=this.parseFactor();e={type:"binary",operator:t.value,left:e,right:n},t=this.peek()}return e}parseFactor(){const e=this.peek();if(!e)throw new Error("Unexpected end of expression");if(e.type==="symbol"&&e.value==="+")return this.index++,this.parseFactor();if(e.type==="symbol"&&e.value==="-"){this.index++;const t=this.parseFactor();return{type:"binary",operator:"-",left:{type:"literal",value:0},right:t}}if(e.type==="symbol"&&e.value==="("){this.index++;const t=this.parseBinaryExpression();if(!this.consumeSymbol(")"))throw new Error("Missing closing parenthesis");return t}if(e.type==="word"&&e.value==="calc"){if(this.index++,!this.consumeSymbol("("))throw new Error("Missing opening parenthesis after calc");const t=this.parseBinaryExpression();if(!this.consumeSymbol(")"))throw new Error("Missing closing parenthesis");return t}if(e.type==="number"){this.index++;const t=e.value,n=this.peek();return n&&n.type==="symbol"&&n.value==="%"?(this.index++,{type:"percentage",value:t/100}):n&&n.type==="word"&&n.value==="px"?(this.index++,{type:"literal",value:t}):{type:"literal",value:t}}throw new Error("Unexpected token in expression")}consumeSymbol(e){const t=this.peek();return t&&t.type==="symbol"&&t.value===e?(this.index++,!0):!1}peek(){return this.tokens[this.index]||null}}function Zl(i){return i>="0"&&i<="9"}function Kl(i){return i>="a"&&i<="z"||i>="A"&&i<="Z"}function DE(i){return!!(i&&i.type==="symbol"&&(i.value==="+"||i.value==="-"))}function FE(i,e){const t={...i};for(const n in e)n!=="id"&&(Array.isArray(t[n])&&Array.isArray(e[n])?t[n]=zE(t[n],e[n]):t[n]=e[n]);return t}function zE(i,e){i=i.slice();for(let t=0;t<e.length;t++){const n=e[t];Number.isFinite(n)&&(i[t]=n)}return i}class lh{constructor(e){const{id:t,x:n=0,y:s=0,width:r="100%",height:o="100%",padding:a=null}=e;this.id=t||this.constructor.displayName||"view",this.props={...e,id:this.id},this._x=ue(n),this._y=ue(s),this._width=ue(r),this._height=ue(o),this._padding=a&&{left:ue(a.left||0),right:ue(a.right||0),top:ue(a.top||0),bottom:ue(a.bottom||0)},this.equals=this.equals.bind(this),Object.seal(this)}equals(e){return this===e?!0:this.constructor===e.constructor&&J(this.props,e.props,2)}clone(e){const t=this.constructor;return new t({...this.props,...e})}makeViewport({width:e,height:t,viewState:n}){n=this.filterViewState(n);const s=this.getDimensions({width:e,height:t});if(!s.height||!s.width)return null;const r=this.getViewportType(n);return new r({...n,...this.props,...s})}getViewStateId(){const{viewState:e}=this.props;return typeof e=="string"?e:e?.id||this.id}filterViewState(e){return this.props.viewState&&typeof this.props.viewState=="object"?this.props.viewState.id?FE(e,this.props.viewState):this.props.viewState:e}getDimensions({width:e,height:t}){const n={x:fe(this._x,e),y:fe(this._y,t),width:fe(this._width,e),height:fe(this._height,t)};return this._padding&&(n.padding={left:fe(this._padding.left,e),top:fe(this._padding.top,t),right:fe(this._padding.right,e),bottom:fe(this._padding.bottom,t)}),n}get controller(){const e=this.props.controller;return e?e===!0?{type:this.ControllerType}:typeof e=="function"?{type:e}:{type:this.ControllerType,...e}:null}}class Ds{constructor(e){this._inProgress=!1,this._handle=null,this.time=0,this.settings={duration:0},this._timeline=e}get inProgress(){return this._inProgress}start(e){this.cancel(),this.settings=e,this._inProgress=!0,this.settings.onStart?.(this)}end(){this._inProgress&&(this._timeline.removeChannel(this._handle),this._handle=null,this._inProgress=!1,this.settings.onEnd?.(this))}cancel(){this._inProgress&&(this.settings.onInterrupt?.(this),this._timeline.removeChannel(this._handle),this._handle=null,this._inProgress=!1)}update(){if(!this._inProgress)return!1;if(this._handle===null){const{_timeline:e,settings:t}=this;this._handle=e.addChannel({delay:e.getTime(),duration:t.duration})}return this.time=this._timeline.getTime(this._handle),this._onUpdate(),this.settings.onUpdate?.(this),this._timeline.isFinished(this._handle)&&this.end(),!0}_onUpdate(){}}const Ql=()=>{},Jl={mode:"preserve"},NE={mode:"hard"},Bo={BREAK:1,SNAP_TO_END:2,IGNORE:3},$E=i=>i,UE=Bo.BREAK;class GE{constructor(e){this._onTransitionUpdate=t=>{const{time:n,settings:{interpolator:s,startProps:r,endProps:o,duration:a,easing:c}}=t,l=c(n/a),u=s.interpolateProps(r,o,l);this.propsInTransition=this.getControllerState({...this.props,...u},Jl).getViewportProps(),this.onViewStateChange({viewState:this.propsInTransition,oldViewState:this.props})},this.getControllerState=e.getControllerState,this.propsInTransition=null,this.transition=new Ds(e.timeline),this.onViewStateChange=e.onViewStateChange||Ql,this.onStateChange=e.onStateChange||Ql}finalize(){this.transition.cancel()}getViewportInTransition(){return this.propsInTransition}processViewStateChange(e){let t=!1;const n=this.props;if(this.props=e,!n||this._shouldIgnoreViewportChange(n,e))return!1;if(this._isTransitionEnabled(e)){let s=n;if(this.transition.inProgress){const{interruption:r,endProps:o}=this.transition.settings;s={...n,...r===Bo.SNAP_TO_END?o:this.propsInTransition||n}}this._triggerTransition(s,e),t=!0}else this.transition.cancel();return t}updateTransition(){this.transition.update()}_isTransitionEnabled(e){const{transitionDuration:t,transitionInterpolator:n}=e;return(t>0||t==="auto")&&!!n}_isUpdateDueToCurrentTransition(e){return this.transition.inProgress&&this.propsInTransition?this.transition.settings.interpolator.arePropsEqual(e,this.propsInTransition):!1}_shouldIgnoreViewportChange(e,t){return this.transition.inProgress?this.transition.settings.interruption===Bo.IGNORE||this._isUpdateDueToCurrentTransition(t):this._isTransitionEnabled(t)?t.transitionInterpolator.arePropsEqual(e,t):!0}_triggerTransition(e,t){const n=this.getControllerState(e,Jl),s=this.getControllerState(t,NE).shortestPathFrom(n),r=t.transitionInterpolator,o=r.getDuration?r.getDuration(e,t):t.transitionDuration;if(o===0)return;const a=r.initializeProps(e,s);this.propsInTransition={};const c={duration:o,easing:t.transitionEasing||$E,interpolator:r,interruption:t.transitionInterruption||UE,startProps:a.start,endProps:a.end,onStart:t.onTransitionStart,onUpdate:this._onTransitionUpdate,onInterrupt:this._onTransitionEnd(t.onTransitionInterrupt),onEnd:this._onTransitionEnd(t.onTransitionEnd)};this.transition.start(c),this.onStateChange({inTransition:!0}),this.updateTransition()}_onTransitionEnd(e){return t=>{this.propsInTransition=null,this.onStateChange({inTransition:!1,isZooming:!1,isPanning:!1,isRotating:!1}),e?.(t)}}}function $(i,e){if(!i)throw new Error(e||"deck.gl: assertion failed.")}class uh{constructor(e){const{compare:t,extract:n,required:s}=e;this._propsToCompare=t,this._propsToExtract=n||t,this._requiredProps=s}arePropsEqual(e,t){for(const n of this._propsToCompare)if(!(n in e)||!(n in t)||!$t(e[n],t[n]))return!1;return!0}initializeProps(e,t){const n={},s={};for(const r of this._propsToExtract)(r in e||r in t)&&(n[r]=e[r],s[r]=t[r]);return this._checkRequiredProps(n),this._checkRequiredProps(s),{start:n,end:s}}getDuration(e,t){return t.transitionDuration}_checkRequiredProps(e){this._requiredProps&&this._requiredProps.forEach(t=>{const n=e[t];$(Number.isFinite(n)||Array.isArray(n),`${t} is required for transition`)})}}const VE=["longitude","latitude","zoom","bearing","pitch"],jE=["longitude","latitude","zoom"];class ja extends uh{constructor(e={}){const t=Array.isArray(e)?e:e.transitionProps,n=Array.isArray(e)?{}:e;n.transitionProps=Array.isArray(t)?{compare:t,required:t}:t||{compare:VE,required:jE},super(n.transitionProps),this.opts=n}initializeProps(e,t){const n=super.initializeProps(e,t),{makeViewport:s,around:r}=this.opts;if(s&&r){const o=s(e),a=s(t),c=o.unproject(r);n.start.around=r,Object.assign(n.end,{around:a.project(c),aroundPosition:c,width:t.width,height:t.height})}return n}interpolateProps(e,t,n){const s={};for(const r of this._propsToExtract)s[r]=Qn(e[r]||0,t[r]||0,n);if(t.aroundPosition&&this.opts.makeViewport){const r=this.opts.makeViewport({...t,...s});Object.assign(s,r.panByPosition(t.aroundPosition,Qn(e.around,t.around,n)))}return s}}const Se={transitionDuration:0},WE=300,HE=300,Pr=i=>1-(1-i)*(1-i),YE=i=>i===1?1:1-Math.pow(2,-10*i),it={WHEEL:["wheel"],PAN:["panstart","panmove","panend"],PINCH:["pinchstart","pinchmove","pinchend"],MULTI_PAN:["multipanstart","multipanmove","multipanend"],DOUBLE_CLICK:["dblclick"],DOUBLE_CLICK_DRAG:["dblclickdragstart","dblclickdragmove","dblclickdragend","dblclickdragcancel"],KEYBOARD:["keydown"]},nt={};class fh{constructor(e){this.state={},this._events={},this._interactionState={isDragging:!1},this._customEvents=[],this._eventStartBlocked=null,this._panMove=!1,this._multiPanMode=null,this._multiPanStartCenter=null,this._doubleClickDragAnchor=null,this._suppressDoubleClickUntil=0,this.invertPan=!1,this.dragMode="rotate",this.inertia=0,this.scrollZoom=!0,this.dragPan=!0,this.dragRotate=!0,this.doubleClickZoom=!0,this.doubleClickDragZoom=!0,this.touchZoom=!0,this.touchRotate=!1,this.multiTouchDrag=null,this.trackpadGesture=!1,this.zoomAround="pointer",this.keyboard=!0,this.transitionManager=new GE({...e,getControllerState:(t,n)=>new this.ControllerState({...t,constraintContext:n,makeViewport:e.makeViewport}),onViewStateChange:this._onTransition.bind(this),onStateChange:this._setInteractionState.bind(this)}),this.handleEvent=this.handleEvent.bind(this),this.eventManager=e.eventManager,this.onViewStateChange=e.onViewStateChange||(()=>{}),this.onStateChange=e.onStateChange||(()=>{}),this.makeViewport=e.makeViewport,this.pickPosition=e.pickPosition}set events(e){this.toggleEvents(this._customEvents,!1),this.toggleEvents(e,!0),this._customEvents=e,this.props&&this.setProps(this.props)}finalize(){for(const e in this._events)this._events[e]&&this.eventManager?.off(e,this.handleEvent);this.transitionManager.finalize()}handleEvent(e){this._controllerState=void 0;const t=this._eventStartBlocked;switch(e.type){case"panstart":return t?!1:this._onPanStart(e);case"panmove":return this._onPan(e);case"panend":return this._onPanEnd(e);case"pinchstart":return t||!this._isTrackpadGestureAllowed(e)?!1:this._onPinchStart(e);case"pinchmove":return this._isTrackpadGestureAllowed(e)?this._onPinch(e):!1;case"pinchend":return this._isTrackpadGestureAllowed(e)?this._onPinchEnd(e):!1;case"multipanstart":return t?!1:this._onMultiPanStart(e);case"multipanmove":return this._onMultiPan(e);case"multipanend":return this._onMultiPanEnd(e);case"dblclick":return this._onDoubleClick(e);case"dblclickdragstart":return t?!1:this._onDoubleClickDragStart(e);case"dblclickdragmove":return this._onDoubleClickDrag(e);case"dblclickdragend":case"dblclickdragcancel":return this._onDoubleClickDragEnd(e);case"wheel":return this._onWheel(e);case"keydown":return this._onKeyDown(e);default:return!1}}get controllerState(){return this._controllerState=this._controllerState||new this.ControllerState({makeViewport:this.makeViewport,...this.props,...this.state}),this._controllerState}getCenter(e){const{x:t,y:n}=this.props,{offsetCenter:s}=e;return[s.x-t,s.y-n]}getZoomPosition(e){if(this.zoomAround==="pointer")return e;const t=this.makeViewport(this.controllerState.getViewportProps()),[n,s]=$a(t.center,t.pixelProjectionMatrix);return[n,s]}isPointInBounds(e,t){const{width:n,height:s}=this.props;if(t&&t.handled)return!1;const r=e[0]>=0&&e[0]<=n&&e[1]>=0&&e[1]<=s;return r&&t&&t.stopPropagation(),r}isFunctionKeyPressed(e){const{srcEvent:t}=e;return!!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)}isDragging(){return this._interactionState.isDragging||!1}blockEvents(e){const t=setTimeout(()=>{this._eventStartBlocked===t&&(this._eventStartBlocked=null)},e);this._eventStartBlocked=t}setProps(e){e.maxBoundsPadding===void 0&&(e.maxBoundsPadding=null),e.dragMode&&(this.dragMode=e.dragMode);const t=this.props;this.props=e,"transitionInterpolator"in e||(e.transitionInterpolator=this._getTransitionProps().transitionInterpolator),this.transitionManager.processViewStateChange(e);const{inertia:n}=e;this.inertia=Number.isFinite(n)?n:n===!0?WE:0;const{scrollZoom:s=!0,dragPan:r=!0,dragRotate:o=!0,doubleClickZoom:a=!0,doubleClickDragZoom:c=!1,touchZoom:l=!0,touchRotate:u=!1,multiTouchDrag:f=u?"rotate":null,trackpadGesture:d=!1,zoomAround:h="pointer",keyboard:g=!0}=e,p=!!this.onViewStateChange;if(this.toggleEvents(it.WHEEL,p&&s),this.toggleEvents(it.PAN,p),this.toggleEvents(it.PINCH,p&&(l||f==="rotate")),this.toggleEvents(it.MULTI_PAN,p&&!!f),this.toggleEvents(it.DOUBLE_CLICK,p&&a),this.toggleEvents(it.DOUBLE_CLICK_DRAG,p&&c),this.toggleEvents(it.KEYBOARD,p&&g),this.scrollZoom=s,this.dragPan=r,this.dragRotate=o,this.doubleClickZoom=a,this.doubleClickDragZoom=c,this.touchZoom=l,this.touchRotate=f==="rotate",this.multiTouchDrag=f,this.trackpadGesture=d,this.zoomAround=h,this.keyboard=g,(!t||t.height!==e.height||t.width!==e.width||t.maxBounds!==e.maxBounds||t.maxBoundsPadding!==e.maxBoundsPadding)&&e.maxBounds){const _=new this.ControllerState({...e,makeViewport:this.makeViewport}),b=_.getViewportProps();Object.keys(b).some(v=>!J(b[v],e[v],1))&&this.updateViewport(_)}}updateTransition(){this.transitionManager.updateTransition()}toggleEvents(e,t){this.eventManager&&e.forEach(n=>{this._events[n]!==t&&(this._events[n]=t,t?this.eventManager.on(n,this.handleEvent):this.eventManager.off(n,this.handleEvent))})}updateViewport(e,t=null,n={}){const s={...e.getViewportProps(),...t},r=this.controllerState!==e;if(this.state=e.getState(),this._setInteractionState(n),r){const o=this.controllerState&&this.controllerState.getViewportProps();this.onViewStateChange&&this.onViewStateChange({viewState:s,interactionState:this._interactionState,oldViewState:o,viewId:this.props.id})}}_onTransition(e){this.onViewStateChange({...e,interactionState:this._interactionState,viewId:this.props.id})}_setInteractionState(e){Object.assign(this._interactionState,e),this.onStateChange(this._interactionState)}_getConstraintContext(e,t){return this.props.rubberBand?{mode:t==="update"?"elastic":t==="end"?"rebound":"hard"}:{mode:"hard"}}_getReboundTransition(e,t){if(e.mode!=="rebound")return null;const n=t.getViewportProps();return Object.keys(n).some(r=>!J(this.props[r],n[r],1))?{...this._getTransitionProps(),transitionDuration:HE,transitionEasing:YE}:null}_onPanStart(e){const t=this.getCenter(e);if(!this.isPointInBounds(t,e))return!1;let n=this.isFunctionKeyPressed(e)||e.rightButton||!1;(this.invertPan||this.dragMode==="pan")&&(n=!n);const s=n?"pan":"rotate",r=this._getConstraintContext(s,"start"),o=n?this.controllerState.panStart({pos:t},r):this.controllerState.rotateStart({pos:t},r);return this._panMove=n,this.updateViewport(o,Se,{isDragging:!0}),!0}_onPan(e){return this.isDragging()?this._panMove?this._onPanMove(e):this._onPanRotate(e):!1}_onPanEnd(e){return this.isDragging()?this._panMove?this._onPanMoveEnd(e):this._onPanRotateEnd(e):!1}_onPanMove(e){if(!this.dragPan)return!1;const t=this.getCenter(e),n=this.controllerState.pan({pos:t},this._getConstraintContext("pan","update"));return this.updateViewport(n,Se,{isDragging:!0,isPanning:!0}),!0}_onPanMoveEnd(e){const{inertia:t}=this;if(this.dragPan&&t&&e.velocity){const n=this.getCenter(e),s=[n[0]+e.velocityX*t/2,n[1]+e.velocityY*t/2],r=this.controllerState.pan({pos:s}).panEnd();this.updateViewport(r,{...this._getTransitionProps(),transitionDuration:t,transitionEasing:Pr},{isDragging:!1,isPanning:!0})}else{const n=this.controllerState,s=this._getConstraintContext("pan","end"),r=n.panEnd(s),o=this._getReboundTransition(s,r);this.updateViewport(r,o,{isDragging:!1,isPanning:!!o})}return!0}_onPanRotate(e){if(!this.dragRotate)return!1;const t=this.getCenter(e),n=this.controllerState.rotate({pos:t},this._getConstraintContext("rotate","update"));return this.updateViewport(n,Se,{isDragging:!0,isRotating:!0}),!0}_onPanRotateEnd(e){const{inertia:t}=this;if(this.dragRotate&&t&&e.velocity){const n=this.getCenter(e),s=[n[0]+e.velocityX*t/2,n[1]+e.velocityY*t/2],r=this.controllerState.rotate({pos:s}).rotateEnd();this.updateViewport(r,{...this._getTransitionProps(),transitionDuration:t,transitionEasing:Pr},{isDragging:!1,isRotating:!0})}else{const n=this.controllerState,s=this._getConstraintContext("rotate","end"),r=n.rotateEnd(s),o=this._getReboundTransition(s,r);this.updateViewport(r,o,{isDragging:!1,isRotating:!!o})}return!0}_onWheel(e){if(!this.scrollZoom||this.trackpadGesture&&e.device!=="mouse")return!1;const t=this.getCenter(e);if(!this.isPointInBounds(t,e))return!1;e.srcEvent.preventDefault();const{speed:n=.01,smooth:s=!1}=this.scrollZoom===!0?{}:this.scrollZoom,{delta:r}=e;let o=2/(1+Math.exp(-Math.abs(r*n)));r<0&&o!==0&&(o=1/o);const a=this.getZoomPosition(t),c=s?{...this._getTransitionProps({around:a}),transitionDuration:250}:Se,l=this.controllerState.zoom({pos:a,scale:o});return this.updateViewport(l,c,{isZooming:!0,isPanning:!0}),s||this._setInteractionState({isZooming:!1,isPanning:!1}),!0}_onMultiPanStart(e){const{multiTouchDrag:t}=this;if(!t||!this._isMultiPanEventAllowed(e,t))return!1;const n=e.offsetCenter;if(!this.isPointInBounds(this.getCenter(e),e))return!1;const s=e.pointerType==="trackpad",r={x:n.x-(s?0:e.deltaX),y:n.y-(s?0:e.deltaY)},o={...e,offsetCenter:r},a=this.getCenter(o),c=t==="pan"?this.controllerState.panStart({pos:a},this._getConstraintContext("pan","start")):this.controllerState.rotateStart({pos:a},this._getConstraintContext("rotate","start"));return this._multiPanMode=t,this._multiPanStartCenter=r,this.updateViewport(c,Se,{isDragging:!0}),!0}_onMultiPan(e){const{mode:t,event:n}=this._getMultiPanEvent(e);return!t||!n||!this.isDragging()?!1:t==="pan"?this._onPanMove(n):this._onPanRotate(n)}_onMultiPanEnd(e){const{mode:t,event:n}=this._getMultiPanEvent(e);if(!t||!n||!this.isDragging())return this._resetMultiPan(),!1;const s=t==="pan"?this._onPanMoveEnd(n):this._onPanRotateEnd(n);return this._resetMultiPan(),s}_isTrackpadGestureAllowed(e){return e.pointerType!=="trackpad"||this.trackpadGesture}_isMultiPanEventAllowed(e,t){return e.pointerType==="trackpad"?this.trackpadGesture&&(t==="pan"?this.dragPan:this.dragRotate):e.pointerType==="touch"&&(t==="pan"?this.dragPan:this.dragRotate)}_getMultiPanEvent(e){const t=this._multiPanMode,n=this._multiPanStartCenter;return!t||!n?{mode:null,event:null}:{mode:t,event:{...e,offsetCenter:{x:n.x+e.deltaX,y:n.y+e.deltaY}}}}_resetMultiPan(){this._multiPanMode=null,this._multiPanStartCenter=null}_onPinchStart(e){this._doubleClickDragAnchor=null;const t=this.getCenter(e);if(!this.isPointInBounds(t,e))return!1;const n=this.controllerState.zoomStart({pos:this.getZoomPosition(t)},this._getConstraintContext("zoom","start")).rotateStart({pos:t},this._getConstraintContext("rotate","start"));return nt._startPinchRotation=e.rotation,nt._lastPinchEvent=e,this.updateViewport(n,Se,{isDragging:!0}),!0}_onPinch(e){if(!this.touchZoom&&!this.touchRotate||!this.isDragging())return!1;let t=this.controllerState;if(this.touchZoom){const{scale:n}=e,s=this.getCenter(e);t=t.zoom({pos:this.getZoomPosition(s),scale:n},this._getConstraintContext("zoom","update"))}if(this.touchRotate){const{rotation:n}=e;t=t.rotate({deltaAngleX:nt._startPinchRotation-n},this._getConstraintContext("rotate","update"))}return this.updateViewport(t,Se,{isDragging:!0,isPanning:this.touchZoom,isZooming:this.touchZoom,isRotating:this.touchRotate}),nt._lastPinchEvent=e,!0}_onPinchEnd(e){if(!this.isDragging())return!1;const{inertia:t}=this,{_lastPinchEvent:n}=nt;if(this.touchZoom&&t&&n&&e.scale!==n.scale){const s=this.getCenter(e),r=this.getZoomPosition(s);let o=this.controllerState.rotateEnd();const a=Math.log2(e.scale),c=(a-Math.log2(n.scale))/(e.deltaTime-n.deltaTime),l=Math.pow(2,a+c*t/2);o=o.zoom({pos:r,scale:l}).zoomEnd(),this.updateViewport(o,{...this._getTransitionProps({around:r}),transitionDuration:t,transitionEasing:Pr},{isDragging:!1,isPanning:this.touchZoom,isZooming:this.touchZoom,isRotating:!1}),this.blockEvents(t)}else{const s=this.controllerState,r=this._getConstraintContext("zoom","end"),o=this._getConstraintContext("rotate","end"),a=s.zoomEnd(r).rotateEnd(o),c=this._getReboundTransition(this.touchZoom?r:o,a);this.updateViewport(a,c,{isDragging:!1,isPanning:!!c&&this.touchZoom,isZooming:!!c&&this.touchZoom,isRotating:!!c&&this.touchRotate})}return nt._startPinchRotation=null,nt._lastPinchEvent=null,!0}_onDoubleClick(e){if(!this.doubleClickZoom||Date.now()<this._suppressDoubleClickUntil)return!1;const t=this.getCenter(e);if(!this.isPointInBounds(t,e))return!1;const n=this.isFunctionKeyPressed(e),s=this.getZoomPosition(t),r=this.controllerState.zoom({pos:s,scale:n?.5:2});return this.updateViewport(r,this._getTransitionProps({around:s}),{isZooming:!0,isPanning:!0}),this.blockEvents(100),!0}_onDoubleClickDragStart(e){if(!this.doubleClickDragZoom)return this._doubleClickDragAnchor=null,!1;const t=this.getCenter(e);if(!this.isPointInBounds(t,e))return this._doubleClickDragAnchor=null,!1;this._doubleClickDragAnchor=this.getZoomPosition(t);let n=this.controllerState.zoomStart({pos:this._doubleClickDragAnchor},this._getConstraintContext("zoom","start"));return e.scale!==1&&(n=n.zoom({pos:this._doubleClickDragAnchor,scale:e.scale},this._getConstraintContext("zoom","update"))),this.updateViewport(n,Se,{isDragging:!0,isPanning:!0,isZooming:!0}),!0}_onDoubleClickDrag(e){const t=this._doubleClickDragAnchor;if(!t)return!1;const n=this.controllerState.zoom({pos:t,scale:e.scale},this._getConstraintContext("zoom","update"));return this.updateViewport(n,Se,{isDragging:!0,isPanning:!0,isZooming:!0}),!0}_onDoubleClickDragEnd(e){if(!this._doubleClickDragAnchor)return!1;this._doubleClickDragAnchor=null;const n=this.controllerState,s=this._getConstraintContext("zoom","end"),r=n.zoomEnd(s),o=this._getReboundTransition(s,r);return this.updateViewport(r,o,{isDragging:!1,isPanning:!!o,isZooming:!!o}),this._suppressDoubleClickUntil=Date.now()+100,this.blockEvents(100),!0}_onKeyDown(e){if(!this.keyboard)return!1;const t=this.isFunctionKeyPressed(e),{zoomSpeed:n,moveSpeed:s,rotateSpeedX:r,rotateSpeedY:o}=this.keyboard===!0?{}:this.keyboard,{controllerState:a}=this;let c;const l={};switch(e.srcEvent.code){case"Minus":c=t?a.zoomOut(n).zoomOut(n):a.zoomOut(n),l.isZooming=!0;break;case"Equal":c=t?a.zoomIn(n).zoomIn(n):a.zoomIn(n),l.isZooming=!0;break;case"ArrowLeft":t?(c=a.rotateLeft(r),l.isRotating=!0):(c=a.moveLeft(s),l.isPanning=!0);break;case"ArrowRight":t?(c=a.rotateRight(r),l.isRotating=!0):(c=a.moveRight(s),l.isPanning=!0);break;case"ArrowUp":t?(c=a.rotateUp(o),l.isRotating=!0):(c=a.moveUp(s),l.isPanning=!0);break;case"ArrowDown":t?(c=a.rotateDown(o),l.isRotating=!0):(c=a.moveDown(s),l.isPanning=!0);break;default:return!1}return this.updateViewport(c,this._getTransitionProps(),l),!0}_getTransitionProps(e){const{transition:t}=this;return!t||!t.transitionInterpolator?Se:e?{...t,transitionInterpolator:new ja({...e,...t.transitionInterpolator.opts,makeViewport:this.controllerState.makeViewport})}:t}}const at=Symbol("constraintAround");class qE{constructor(e,t,n,s){this.makeViewport=n,this._viewportProps=this.applyConstraints(e,s),this._state=t}getViewportProps(){return this._viewportProps}getState(){return this._state}}function Er(i,e,t){const n=i-e;return n&&Number.isFinite(n)?e+n*t/(t+Math.abs(n)):e}function us(i,e,t){const n=fe(ue(t?.left??0),i),s=fe(ue(t?.right??0),i),r=fe(ue(t?.top??0),e),o=fe(ue(t?.bottom??0),e);return{x:n,y:r,width:i-n-s,height:e-r-o}}function dh(i,e,t){let[n,s]=i.project(e);return n=Number.isFinite(n)?n:i.width/2,s=Number.isFinite(s)?s:i.height/2,{left:n-t.x,right:t.x+t.width-n,top:s-t.y,bottom:t.y+t.height-s}}const eu=5,XE=1.2,tu=512,hh=[[-1/0,-90],[1/0,90]],ZE=1;function ai([i,e]){if(Math.abs(e)>90&&(e=Math.sign(e)*90),Number.isFinite(i)){const[n,s]=_t([i,e]);return[n,H(s,0,tu)]}const[,t]=_t([0,e]);return[i,H(t,0,tu)]}class gh extends qE{constructor(e){const{width:t,height:n,latitude:s,longitude:r,zoom:o,bearing:a=0,pitch:c=0,altitude:l=1.5,position:u=[0,0,0],maxZoom:f=20,minZoom:d=0,maxPitch:h=60,minPitch:g=0,startPanLngLat:p,startZoomLngLat:m,startRotatePos:_,startRotateLngLat:b,startBearing:y,startPitch:v,startZoom:w,normalize:x=!0,rubberBand:S=!1}=e,{[at]:T}=e;$(Number.isFinite(r)),$(Number.isFinite(s)),$(Number.isFinite(o));const L=e.maxBounds||(x?hh:null),E=e.maxBoundsPadding||null;super({width:t,height:n,latitude:s,longitude:r,zoom:o,bearing:a,pitch:c,altitude:l,maxZoom:f,minZoom:d,maxPitch:h,minPitch:g,normalize:x,position:u,maxBounds:L,maxBoundsPadding:E,rubberBand:S,[at]:T},{startPanLngLat:p,startZoomLngLat:m,startRotatePos:_,startRotateLngLat:b,startBearing:y,startPitch:v,startZoom:w},e.makeViewport,e.constraintContext),this.getAltitude=e.getAltitude}panStart({pos:e},t){return this._getUpdatedState({startPanLngLat:this._unproject(e)},t)}pan({pos:e,startPos:t},n){const s=this.getState().startPanLngLat||this._unproject(t);if(!s)return this;const o=this.makeViewport(this.getViewportProps()).panByPosition(s,e);return this._getUpdatedState(o,n)}panEnd(e){return this._getUpdatedState({startPanLngLat:null},e)}rotateStart({pos:e}){const t=this.getAltitude?.(e);return this._getUpdatedState({startRotatePos:e,startRotateLngLat:t!==void 0?this._unproject3D(e,t):void 0,startBearing:this.getViewportProps().bearing,startPitch:this.getViewportProps().pitch})}rotate({pos:e,deltaAngleX:t=0,deltaAngleY:n=0}){const{startRotatePos:s,startRotateLngLat:r,startBearing:o,startPitch:a}=this.getState();if(!s||o===void 0||a===void 0)return this;let c;if(e?c=this._getNewRotation(e,s,a,o):c={bearing:o+t,pitch:a+n},r){const l=this.makeViewport({...this.getViewportProps(),...c}),u="panByPosition3D"in l?"panByPosition3D":"panByPosition";return this._getUpdatedState({...c,...l[u](r,s)})}return this._getUpdatedState(c)}rotateEnd(){return this._getUpdatedState({startRotatePos:null,startRotateLngLat:null,startBearing:null,startPitch:null})}zoomStart({pos:e},t){return this._getUpdatedState({startZoomLngLat:this._unproject(e),startZoom:this.getViewportProps().zoom},t)}zoom({pos:e,startPos:t,scale:n},s){let{startZoom:r,startZoomLngLat:o}=this.getState();return o||(r=this.getViewportProps().zoom,o=this._unproject(t)||this._unproject(e)),o?this._getUpdatedState({zoom:r+Math.log2(n),[at]:{position:o,screenPosition:e}},s):this}zoomEnd(e){return this._getUpdatedState({startZoomLngLat:null,startZoom:null},e)}zoomIn(e=2,t){return this._zoomFromCenter(e,t)}zoomOut(e=2,t){return this._zoomFromCenter(1/e,t)}moveLeft(e=100,t){return this._panFromCenter([e,0],t)}moveRight(e=100,t){return this._panFromCenter([-e,0],t)}moveUp(e=100,t){return this._panFromCenter([0,e],t)}moveDown(e=100,t){return this._panFromCenter([0,-e],t)}rotateLeft(e=15){return this._getUpdatedState({bearing:this.getViewportProps().bearing-e})}rotateRight(e=15){return this._getUpdatedState({bearing:this.getViewportProps().bearing+e})}rotateUp(e=10){return this._getUpdatedState({pitch:this.getViewportProps().pitch+e})}rotateDown(e=10){return this._getUpdatedState({pitch:this.getViewportProps().pitch-e})}shortestPathFrom(e){const t=e.getViewportProps(),n={...this.getViewportProps()},{bearing:s,longitude:r}=n;return Math.abs(s-t.bearing)>180&&(n.bearing=s<0?s+360:s-360),Math.abs(r-t.longitude)>180&&(n.longitude=r<0?r+360:r-360),n}applyConstraints(e,t){const n=e,s=n[at];delete n[at];const{maxPitch:r,minPitch:o,pitch:a,bearing:c,normalize:l,maxBounds:u,rubberBand:f}=e;l&&(c<-180||c>180)&&(e.bearing=$i(c+180,360)-180),e.pitch=H(a,o,r);const d=this._constrainZoom(e.zoom,e),h=f&&t?.mode==="elastic";if(e.zoom=t?.mode==="preserve"?e.zoom:h?Er(e.zoom,d,ZE):d,s){const g=this.makeViewport(e);Object.assign(e,g.panByPosition(s.position,s.screenPosition))}if(l&&(e.longitude<-180||e.longitude>180)&&(e.longitude=$i(e.longitude+180,360)-180),u){const g=us(e.width,e.height,e.maxBoundsPadding),p=this.makeViewport({...e,bearing:0,pitch:0}),m=dh(p,[e.longitude,e.latitude],g),_=ai(u[0]),b=ai(u[1]),y=2**e.zoom,v=[_[0]+m.left/y,_[1]+m.bottom/y],w=[b[0]-m.right/y,b[1]-m.top/y],x=ai([e.longitude,e.latitude]),S=[H(x[0],v[0],w[0]),H(x[1],v[1],w[1])],T=x.slice();if(g.width>=0&&(T[0]=t?.mode==="preserve"?x[0]:h?Er(x[0],S[0],g.width/2/y):S[0]),g.height>=0&&(T[1]=t?.mode==="preserve"?x[1]:h?Er(x[1],S[1],g.height/2/y):S[1]),T[0]!==x[0]||T[1]!==x[1]){const[L,E]=Ji(T);T[0]!==x[0]&&(e.longitude=L),T[1]!==x[1]&&(e.latitude=E)}}return e}_constrainZoom(e,t){t||(t=this.getViewportProps());const{maxZoom:n,maxBounds:s}=t,r=s!==null&&t.width>0&&t.height>0;let{minZoom:o}=t;if(r){const a=us(t.width,t.height,t.maxBoundsPadding),c=ai(s[0]),l=ai(s[1]),u=l[0]-c[0],f=l[1]-c[1];a.width>0&&Number.isFinite(u)&&u>0&&(o=Math.max(o,Math.log2(a.width/u))),a.height>0&&Number.isFinite(f)&&f>0&&(o=Math.max(o,Math.log2(a.height/f))),o>n&&(o=n)}return H(e,o,n)}_zoomFromCenter(e,t){const{width:n,height:s}=this.getViewportProps();return this.zoom({pos:[n/2,s/2],scale:e},t)}_panFromCenter(e,t){const{width:n,height:s}=this.getViewportProps();return this.pan({startPos:[n/2,s/2],pos:[n/2+e[0],s/2+e[1]]},t)}_getUpdatedState(e,t){return new this.constructor({makeViewport:this.makeViewport,...this.getViewportProps(),...this.getState(),...e,constraintContext:t})}_unproject(e){const t=this.makeViewport(this.getViewportProps());return e&&t.unproject(e)}_unproject3D(e,t){return this.makeViewport(this.getViewportProps()).unproject(e,{targetZ:t})}_getNewRotation(e,t,n,s){const r=e[0]-t[0],o=e[1]-t[1],a=e[1],c=t[1],{width:l,height:u}=this.getViewportProps(),f=r/l;let d=0;o>0?Math.abs(u-c)>eu&&(d=o/(c-u)*XE):o<0&&c>eu&&(d=1-a/c),d=H(d,-1,1);const{minPitch:h,maxPitch:g}=this.getViewportProps(),p=s+180*f;let m=n;return d>0?m=n+d*(g-n):d<0&&(m=n-d*(h-n)),{pitch:m,bearing:p}}}class KE extends fh{constructor(){super(...arguments),this.ControllerState=gh,this.transition={transitionDuration:300,transitionInterpolator:new ja({transitionProps:{compare:["longitude","latitude","zoom","bearing","pitch","position"],required:["longitude","latitude","zoom"]}})},this.dragMode="pan",this.rotationPivot="center",this._getAltitude=e=>{if(this.rotationPivot==="2d")return 0;if(this.rotationPivot==="3d"&&this.pickPosition){const{x:t,y:n}=this.props,s=this.pickPosition(t+e[0],n+e[1]);if(s&&s.coordinate&&s.coordinate.length>=3)return s.coordinate[2]}}}setProps(e){"rotationPivot"in e&&(this.rotationPivot=e.rotationPivot||"center"),e.getAltitude=this._getAltitude,e.position=e.position||[0,0,0],e.maxBounds=e.maxBounds||(e.normalize===!1?null:hh),super.setProps(e)}updateViewport(e,t=null,n={}){const s=e.getState();n.isDragging&&s.startRotateLngLat?n={...n,rotationPivotPosition:s.startRotateLngLat}:n.isDragging===!1&&(n={...n,rotationPivotPosition:void 0}),super.updateViewport(e,t,n)}}class Wa extends lh{constructor(e={}){super(e)}getViewportType(){return Oe}get ControllerType(){return KE}}Wa.displayName="MapView";const QE=new th;function JE(i,e){const t=i.order??1/0,n=e.order??1/0;return t-n}class eS{constructor(e){this._resolvedEffects=[],this._defaultEffects=[],this.effects=[],this._context=e,this._needsRedraw="Initial render",this._setEffects([])}addDefaultEffect(e){const t=this._defaultEffects;if(!t.find(n=>n.id===e.id)){const n=t.findIndex(s=>JE(s,e)>0);n<0?t.push(e):t.splice(n,0,e),e.setup(this._context),this._setEffects(this.effects)}}setProps(e){"effects"in e&&(J(e.effects,this.effects,1)||this._setEffects(e.effects))}needsRedraw(e={clearRedrawFlags:!1}){const t=this._needsRedraw;return e.clearRedrawFlags&&(this._needsRedraw=!1),t}getEffects(){return this._resolvedEffects}_setEffects(e){const t={};for(const s of this.effects)t[s.id]=s;const n=[];for(const s of e){const r=t[s.id];let o=s;r&&r!==s?r.setProps?(r.setProps(s.props),o=r):r.cleanup(this._context):r||s.setup(this._context),n.push(o),delete t[s.id]}for(const s in t)t[s].cleanup(this._context);this.effects=n,this._resolvedEffects=n.concat(this._defaultEffects),e.some(s=>s instanceof th)||this._resolvedEffects.push(QE),this._needsRedraw="effects changed"}finalize(){for(const e of this._resolvedEffects)e.cleanup(this._context);this.effects.length=0,this._resolvedEffects.length=0,this._defaultEffects.length=0}}class tS extends Ua{shouldDrawLayer(e){const{operation:t}=e.props;return t.includes("draw")||t.includes("terrain")}render(e){return this._render(e)}}const iS="deckRenderer.renderLayers";class nS{constructor(e,t={}){this.device=e,this.stats=t.stats,this.layerFilter=null,this.drawPickingColors=!1,this.drawLayersPass=new tS(e),this.pickLayersPass=new ah(e),this.renderCount=0,this._needsRedraw="Initial render",this.renderBuffers=[],this.lastPostProcessEffect=null}setProps(e){this.layerFilter!==e.layerFilter&&(this.layerFilter=e.layerFilter,this._needsRedraw="layerFilter changed"),this.drawPickingColors!==e.drawPickingColors&&(this.drawPickingColors=e.drawPickingColors,this._needsRedraw="drawPickingColors changed")}renderLayers(e){const t=this.drawPickingColors?this.pickLayersPass:this.drawLayersPass,n={layerFilter:this.layerFilter,isPicking:this.drawPickingColors,...e};if(!e.viewports.length){const a=t.render(n),c="stats"in a?a.stats:a;this._updateStats(c);return}n.effects&&this._preRender(n.effects,n);const s=this.lastPostProcessEffect?this.renderBuffers[0]:n.target;this.lastPostProcessEffect&&(n.clearColor=[0,0,0,0],n.clearCanvas=!0);const r=t.render({...n,target:s}),o="stats"in r?r.stats:r;n.effects&&(this.lastPostProcessEffect&&(n.clearCanvas=e.clearCanvas===void 0?!0:e.clearCanvas),this._postRender(n.effects,n)),this.renderCount++,te(iS,this,o,e),this._updateStats(o)}needsRedraw(e={clearRedrawFlags:!1}){const t=this._needsRedraw;return e.clearRedrawFlags&&(this._needsRedraw=!1),t}finalize(){const{renderBuffers:e}=this;for(const t of e)t.delete();e.length=0}_updateStats(e){if(!this.stats)return;let t=0;for(const{visibleCount:n}of e)t+=n;this.stats.get("Layers rendered").addCount(t)}_preRender(e,t){this.lastPostProcessEffect=null,t.preRenderStats=t.preRenderStats||{};for(const n of e)t.preRenderStats[n.id]=n.preRender(t),n.postRender&&(this.lastPostProcessEffect=n.id);this.lastPostProcessEffect&&this._resizeRenderBuffers(t.canvasContext)}_resizeRenderBuffers(e=this.device.canvasContext){const{renderBuffers:t}=this,n=e.getDrawingBufferSize(),[s,r]=n;t.length===0&&[0,1].map(o=>{const a=this.device.createTexture({sampler:{minFilter:"linear",magFilter:"linear"},width:s,height:r});t.push(this.device.createFramebuffer({id:`deck-renderbuffer-${o}`,colorAttachments:[a]}))});for(const o of t)o.resize(n)}_postRender(e,t){const{renderBuffers:n}=this,s=t.target??t.canvasContext?.getCurrentFramebuffer()??t.target,r={...t,inputBuffer:n[0],swapBuffer:n[1]};for(const o of e)if(o.postRender){r.target=o.id===this.lastPostProcessEffect?s:void 0;const a=o.postRender(r);r.inputBuffer=a,r.swapBuffer=a===n[0]?n[1]:n[0]}}}const sS={pickedColor:null,pickedObjectIndex:-1};function iu({pickedColors:i,decodePickingColor:e,deviceX:t,deviceY:n,deviceRadius:s,deviceRect:r}){const{x:o,y:a,width:c,height:l}=r;let u=s*s,f=-1,d=0;for(let h=0;h<l;h++){const g=h+a-n,p=g*g;if(p>u)d+=4*c;else for(let m=0;m<c;m++){if(i[d+3]-1>=0){const b=m+o-t,y=b*b+p;y<=u&&(u=y,f=d)}d+=4}}if(f>=0){const h=i.slice(f,f+4),g=e(h);if(g){const p=Math.floor(f/4/c),m=f/4-p*c;return{...g,pickedColor:h,pickedX:o+m,pickedY:a+p}}z.error("Picked non-existent layer. Is picking buffer corrupt?")()}return sS}function nu({pickedColors:i,decodePickingColor:e}){const t=new Map;if(i){for(let n=0;n<i.length;n+=4)if(i[n+3]-1>=0){const r=i.slice(n,n+4),o=r.join(",");if(!t.has(o)){const a=e(r);a?t.set(o,{...a,color:r}):z.error("Picked non-existent layer. Is picking buffer corrupt?")()}}}return Array.from(t.values())}function ko({pickInfo:i,viewports:e,pixelRatio:t,x:n,y:s,z:r}){let o=e[0];e.length>1&&(o=rS(i?.pickedViewports||e,{x:n,y:s}));let a;if(o){const c=[n-o.x,s-o.y];r!==void 0&&(c[2]=r),a=o.unproject(c)}return{color:null,layer:null,viewport:o,index:-1,picked:!1,x:n,y:s,pixel:[n,s],coordinate:a,devicePixel:i&&"pickedX"in i?[i.pickedX,i.pickedY]:void 0,pixelRatio:t}}function su(i){const{pickInfo:e,lastPickedInfo:t,mode:n,layers:s}=i,{pickedColor:r,pickedLayer:o,pickedObjectIndex:a}=e,c=o?[o]:[];if(n==="hover"){const f=t.index,d=t.layerId,h=o?o.props.id:null;if(h!==d||a!==f){if(h!==d){const g=s.find(p=>p.props.id===d);g&&c.unshift(g)}t.layerId=h,t.index=a,t.info=null}}const l=ko(i),u=new Map;return u.set(null,l),c.forEach(f=>{let d={...l};f===o&&(d.color=r,d.index=a,d.picked=!0),d=Do({layer:f,info:d,mode:n});const h=d.layer;f===o&&n==="hover"&&(t.info=d),u.set(h.id,d),n==="hover"&&h.updateAutoHighlight(d)}),u}function Do({layer:i,info:e,mode:t}){for(;i&&e;){const n=e.layer||null;e.sourceLayer=n,e.layer=i,e=i.getPickingInfo({info:e,mode:t,sourceLayer:n}),i=i.parent}return e}function rS(i,e){for(let t=i.length-1;t>=0;t--){const n=i[t];if(n.containsPixel(e))return n}return i[0]}class oS{constructor(e,t={}){this._pickable=!0,this.device=e,this.stats=t.stats,this.pickLayersPass=new ah(e),this.lastPickedInfo={index:-1,layerId:null,info:null}}setProps(e){"layerFilter"in e&&(this.layerFilter=e.layerFilter),"_pickable"in e&&(this._pickable=e._pickable)}finalize(){this.pickingFBO&&this.pickingFBO.destroy(),this.depthFBO&&this.depthFBO.destroy()}pickObjectAsync(e){return this._pickClosestObjectAsync(e)}pickObjectsAsync(e){return this._pickVisibleObjectsAsync(e)}pickObject(e){return this._pickClosestObject(e)}pickObjects(e){return this._pickVisibleObjects(e)}getLastPickedObject({x:e,y:t,layers:n,viewports:s},r=this.lastPickedInfo.info){const o=r&&r.layer&&r.layer.id,a=r&&r.viewport&&r.viewport.id,c=o?n.find(d=>d.id===o):null,l=a&&s.find(d=>d.id===a)||s[0],u=l&&l.unproject([e-l.x,t-l.y]);return{...r,...{x:e,y:t,viewport:l,coordinate:u,layer:c}}}_resizeBuffer(e=this.device.getDefaultCanvasContext()){if(!this.pickingFBO){const s=this.device.createTexture({format:"rgba8unorm",width:1,height:1,usage:k.RENDER_ATTACHMENT|k.COPY_SRC});if(this.pickingFBO=this.device.createFramebuffer({colorAttachments:[s],depthStencilAttachment:"depth16unorm"}),this.device.isTextureFormatRenderable("rgba32float")){const r=this.device.createTexture({format:"rgba32float",width:1,height:1,usage:k.RENDER_ATTACHMENT|k.COPY_SRC}),o=this.device.createFramebuffer({colorAttachments:[r],depthStencilAttachment:"depth16unorm"});this.depthFBO=o}}const[t,n]=e.getDrawingBufferSize();this.pickingFBO?.resize({width:t,height:n}),this.depthFBO?.resize({width:t,height:n})}_getPickable(e){if(this._pickable===!1)return null;const t=e.filter(n=>this.pickLayersPass.shouldDrawLayer(n)&&!n.isComposite);return t.length?t:null}async _pickClosestObjectAsync({layers:e,views:t,viewports:n,x:s,y:r,radius:o=0,depth:a=1,mode:c="query",unproject3D:l,canvasContext:u=this.device.getDefaultCanvasContext(),onViewportActive:f,effects:d}){const h=u.cssToDeviceRatio(),g=this._getPickable(e);if(!g||n.length===0)return{result:[],emptyInfo:ko({viewports:n,x:s,y:r,pixelRatio:h})};this._resizeBuffer(u);const p=u.cssToDevicePixels([s,r],!0),m=[p.x+Math.floor(p.width/2),p.y+Math.floor(p.height/2)],_=Math.round(o*h),{width:b,height:y}=this.pickingFBO,v=this._getPickingRect({deviceX:m[0],deviceY:m[1],deviceRadius:_,deviceWidth:b,deviceHeight:y}),w={x:s-o,y:r-o,width:o*2+1,height:o*2+1};let x;const S=[],T=new Set;for(let L=0;L<a;L++){let E;if(v){const C=await this._drawAndSampleAsync({layers:g,views:t,viewports:n,onViewportActive:f,deviceRect:v,cullRect:w,effects:d,pass:`picking:${c}`,canvasContext:u});E=iu({...C,deviceX:m[0],deviceY:m[1],deviceRadius:_,deviceRect:v})}else E={pickedColor:null,pickedObjectIndex:-1};let R;const M=this._getDepthLayers(E,g,l);if(M.length>0){const{pickedColors:C}=await this._drawAndSampleAsync({layers:M,views:t,viewports:n,onViewportActive:f,deviceRect:{x:E.pickedX??m[0],y:E.pickedY??m[1],width:1,height:1},cullRect:w,effects:d,pass:`picking:${c}:z`,canvasContext:u},!0);C[3]&&(R=C[0])}E.pickedLayer&&L+1<a&&(T.add(E.pickedLayer),E.pickedLayer.disablePickingIndex(E.pickedObjectIndex)),x=su({pickInfo:E,lastPickedInfo:this.lastPickedInfo,mode:c,layers:g,viewports:n,x:s,y:r,z:R,pixelRatio:h});for(const C of x.values())C.layer&&S.push(C);if(!E.pickedColor)break}for(const L of T)L.restorePickingColors();return{result:S,emptyInfo:x.get(null)}}_pickClosestObject({layers:e,views:t,viewports:n,x:s,y:r,radius:o=0,depth:a=1,mode:c="query",unproject3D:l,canvasContext:u=this.device.getDefaultCanvasContext(),onViewportActive:f,effects:d}){const h=u.cssToDeviceRatio(),g=this._getPickable(e);if(!g||n.length===0)return{result:[],emptyInfo:ko({viewports:n,x:s,y:r,pixelRatio:h})};this._resizeBuffer(u);const p=u.cssToDevicePixels([s,r],!0),m=[p.x+Math.floor(p.width/2),p.y+Math.floor(p.height/2)],_=Math.round(o*h),{width:b,height:y}=this.pickingFBO,v=this._getPickingRect({deviceX:m[0],deviceY:m[1],deviceRadius:_,deviceWidth:b,deviceHeight:y}),w={x:s-o,y:r-o,width:o*2+1,height:o*2+1};let x;const S=[],T=new Set;for(let L=0;L<a;L++){let E;if(v){const C=this._drawAndSample({layers:g,views:t,viewports:n,onViewportActive:f,deviceRect:v,cullRect:w,effects:d,pass:`picking:${c}`,canvasContext:u});E=iu({...C,deviceX:m[0],deviceY:m[1],deviceRadius:_,deviceRect:v})}else E={pickedColor:null,pickedObjectIndex:-1};let R;const M=this._getDepthLayers(E,g,l);if(M.length>0){const{pickedColors:C}=this._drawAndSample({layers:M,views:t,viewports:n,onViewportActive:f,deviceRect:{x:E.pickedX??m[0],y:E.pickedY??m[1],width:1,height:1},cullRect:w,effects:d,pass:`picking:${c}:z`,canvasContext:u},!0);C[3]&&(R=C[0])}E.pickedLayer&&L+1<a&&(T.add(E.pickedLayer),E.pickedLayer.disablePickingIndex(E.pickedObjectIndex)),x=su({pickInfo:E,lastPickedInfo:this.lastPickedInfo,mode:c,layers:g,viewports:n,x:s,y:r,z:R,pixelRatio:h});for(const C of x.values())C.layer&&S.push(C);if(!E.pickedColor)break}for(const L of T)L.restorePickingColors();return{result:S,emptyInfo:x.get(null)}}async _pickVisibleObjectsAsync({layers:e,views:t,viewports:n,x:s,y:r,width:o=1,height:a=1,mode:c="query",maxObjects:l=null,canvasContext:u=this.device.getDefaultCanvasContext(),onViewportActive:f,effects:d}){const h=this._getPickable(e);if(!h||n.length===0)return[];this._resizeBuffer(u);const g=u.cssToDeviceRatio(),p=u.cssToDevicePixels([s,r],!0),m=p.x,_=p.y+p.height,b=u.cssToDevicePixels([s+o,r+a],!0),y=b.x+b.width,v=b.y,w={x:m,y:v,width:y-m,height:_-v},x=await this._drawAndSampleAsync({layers:h,views:t,viewports:n,onViewportActive:f,deviceRect:w,cullRect:{x:s,y:r,width:o,height:a},effects:d,pass:`picking:${c}`,canvasContext:u}),S=nu(x),T=new Map,L=[],E=Number.isFinite(l);for(let R=0;R<S.length&&!(E&&L.length>=l);R++){const M=S[R];let C={color:M.pickedColor,layer:null,index:M.pickedObjectIndex,picked:!0,x:s,y:r,pixelRatio:g};C=Do({layer:M.pickedLayer,info:C,mode:c});const I=C.layer.id;T.has(I)||T.set(I,new Set);const W=T.get(I),F=C.object??C.index;W.has(F)||(W.add(F),L.push(C))}return L}_pickVisibleObjects({layers:e,views:t,viewports:n,x:s,y:r,width:o=1,height:a=1,mode:c="query",maxObjects:l=null,canvasContext:u=this.device.getDefaultCanvasContext(),onViewportActive:f,effects:d}){const h=this._getPickable(e);if(!h||n.length===0)return[];this._resizeBuffer(u);const g=u.cssToDeviceRatio(),p=u.cssToDevicePixels([s,r],!0),m=p.x,_=p.y+p.height,b=u.cssToDevicePixels([s+o,r+a],!0),y=b.x+b.width,v=b.y,w={x:m,y:v,width:y-m,height:_-v},x=this._drawAndSample({layers:h,views:t,viewports:n,onViewportActive:f,deviceRect:w,cullRect:{x:s,y:r,width:o,height:a},effects:d,pass:`picking:${c}`,canvasContext:u}),S=nu(x),T=new Map,L=[],E=Number.isFinite(l);for(let R=0;R<S.length&&!(E&&L.length>=l);R++){const M=S[R];let C={color:M.pickedColor,layer:null,index:M.pickedObjectIndex,picked:!0,x:s,y:r,pixelRatio:g};C=Do({layer:M.pickedLayer,info:C,mode:c});const I=C.layer.id;T.has(I)||T.set(I,new Set);const W=T.get(I),F=C.object??C.index;W.has(F)||(W.add(F),L.push(C))}return L}async _drawAndSampleAsync({layers:e,views:t,viewports:n,onViewportActive:s,deviceRect:r,cullRect:o,effects:a,pass:c,canvasContext:l},u=!1){const f=u?this.depthFBO:this.pickingFBO,d={layers:e,layerFilter:this.layerFilter,views:t,viewports:n,onViewportActive:s,pickingFBO:f,deviceRect:r,cullRect:o,effects:a,pass:c,canvasContext:l,pickZ:u,preRenderStats:{},isPicking:!0};for(const w of a)w.useInPicking&&(d.preRenderStats[w.id]=w.preRender(d));const{decodePickingColor:h,stats:g}=this.pickLayersPass.render(d);this._updateStats(g);const{x:p,y:m,width:_,height:b}=r,y=f.colorAttachments[0]?.texture;if(!y)throw new Error("Picking framebuffer color attachment is missing");const v=await this._readTextureDataAsync(y,{x:p,y:m,width:_,height:b},u?Float32Array:Uint8Array);if(!u){let w=!1;for(let x=3;x<v.length;x+=4)if(v[x]!==0){w=!0;break}!w&&v.length>0&&z.warn("Async pick readback returned only zero alpha values",{deviceRect:r,bytes:Array.from(v.subarray(0,Math.min(v.length,16)))})()}return{pickedColors:v,decodePickingColor:h}}async _readTextureDataAsync(e,t,n){const{width:s,height:r}=t,o=e.computeMemoryLayout(t),a=this.device.createBuffer({byteLength:o.byteLength,usage:O.COPY_DST|O.MAP_READ});try{e.readBuffer(t,a);const c=await a.readAsync(0,o.byteLength),l=n.BYTES_PER_ELEMENT;if(o.bytesPerRow%l!==0)throw new Error(`Texture readback row stride ${o.bytesPerRow} is not aligned to ${l}-byte elements.`);const u=new n(c.buffer,c.byteOffset,o.byteLength/l),f=s*4,d=o.bytesPerRow/l;if(d<f)throw new Error(`Texture readback row stride ${d} is smaller than packed row length ${f}.`);const h=new n(s*r*4);for(let g=0;g<r;g++){const p=g*d;h.set(u.subarray(p,p+f),g*f)}return h}finally{a.destroy()}}_drawAndSample({layers:e,views:t,viewports:n,onViewportActive:s,deviceRect:r,cullRect:o,effects:a,pass:c,canvasContext:l},u=!1){const f=u?this.depthFBO:this.pickingFBO,d={layers:e,layerFilter:this.layerFilter,views:t,viewports:n,onViewportActive:s,pickingFBO:f,deviceRect:r,cullRect:o,effects:a,pass:c,canvasContext:l,pickZ:u,preRenderStats:{},isPicking:!0};for(const v of a)v.useInPicking&&(d.preRenderStats[v.id]=v.preRender(d));const{decodePickingColor:h,stats:g}=this.pickLayersPass.render(d);this._updateStats(g);const{x:p,y:m,width:_,height:b}=r,y=new(u?Float32Array:Uint8Array)(_*b*4);return this.device.readPixelsToArrayWebGL(f,{sourceX:p,sourceY:m,sourceWidth:_,sourceHeight:b,target:y}),{pickedColors:y,decodePickingColor:h}}_updateStats(e){if(!this.stats)return;let t=0;for(const{visibleCount:n}of e)t+=n;this.stats.get("Layers picked").addCount(t)}_getDepthLayers(e,t,n){if(!n||!this.depthFBO)return[];const{pickedLayer:s}=e,r=s?.state?.terrainDrawMode==="drape";return s&&!r?[s]:t.filter(o=>o.props.operation.includes("terrain"))}_getPickingRect({deviceX:e,deviceY:t,deviceRadius:n,deviceWidth:s,deviceHeight:r}){const o=Math.max(0,e-n),a=Math.max(0,t-n),c=Math.min(s,e+n+1)-o,l=Math.min(r,t+n+1)-a;return c<=0||l<=0?null:{x:o,y:a,width:c,height:l}}}const aS={"top-left":{top:0,left:0},"top-right":{top:0,right:0},"bottom-left":{bottom:0,left:0},"bottom-right":{bottom:0,right:0},fill:{top:0,left:0,bottom:0,right:0}},cS="top-left",ru="root";class lS{constructor({deck:e,parentElement:t}){this.defaultWidgets=[],this.widgets=[],this.resolvedWidgets=[],this.containers={},this.lastViewports={},this.deck=e,t?.classList.add("deck-widget-container"),this.parentElement=t}getWidgets(){return this.resolvedWidgets}setProps(e){if(e.widgets&&!J(e.widgets,this.widgets,1)){const t=e.widgets.filter(Boolean);this._setWidgets(t)}}finalize(){for(const e of this.getWidgets())this._removeWidget(e);this.defaultWidgets.length=0,this.resolvedWidgets.length=0;for(const e in this.containers)this.containers[e].remove()}addDefault(e){this.defaultWidgets.find(t=>t.id===e.id)||(this._addWidget(e),this.defaultWidgets.push(e),this._setWidgets(this.widgets))}onRedraw({viewports:e,layers:t}){const n=e.reduce((s,r)=>(s[r.id]=r,s),{});for(const s of this.getWidgets()){const{viewId:r}=s;if(r){const o=n[r];o&&(s.onViewportChange&&s.onViewportChange(o),s.onRedraw?.({viewports:[o],layers:t}))}else{if(s.onViewportChange)for(const o of e)s.onViewportChange(o);s.onRedraw?.({viewports:e,layers:t})}}this.lastViewports=n,this._updateContainers()}onHover(e,t){for(const n of this.getWidgets()){const{viewId:s}=n;(!s||s===e.viewport?.id)&&n.onHover?.(e,t)}}getCanvasBounds(e){const n=this.deck?.getCanvas?.()?.getBoundingClientRect(),s=this.parentElement?.getBoundingClientRect(),r=this.deck?.getCanvasContext?.(e?.id);if(r&&s){r.updatePosition();const[o,a]=r.getPosition(),[c,l]=r.getCSSSize();return{x:o-s.left,y:a-s.top,width:c,height:l}}return{x:n&&s?n.left-s.left:0,y:n&&s?n.top-s.top:0,width:n?.width||this.deck?.width||0,height:n?.height||this.deck?.height||0}}onEvent(e,t){const n=On[t.type];if(n)for(const s of this.getWidgets()){const{viewId:r}=s;(!r||r===e.viewport?.id)&&s[n]?.(e,t)}}_setWidgets(e){const t={};for(const n of this.resolvedWidgets)t[n.id]=n;this.resolvedWidgets.length=0;for(const n of this.defaultWidgets)t[n.id]=null,this.resolvedWidgets.push(n);for(let n of e){const s=t[n.id];s?s.viewId!==n.viewId||s.placement!==n.placement?(this._removeWidget(s),this._addWidget(n)):n!==s&&(s.setProps(n.props),n=s):this._addWidget(n),t[n.id]=null,this.resolvedWidgets.push(n)}for(const n in t){const s=t[n];s&&this._removeWidget(s)}this.widgets=e}_addWidget(e){const{viewId:t=null,placement:n=cS}=e,s=e.props._container??t;e.widgetManager=this,e.deck=this.deck,e.rootElement=e._onAdd({deck:this.deck,viewId:t}),e.rootElement&&this._getContainer(s,n).append(e.rootElement),e.updateHTML()}_removeWidget(e){e.onRemove?.(),e.rootElement&&e.rootElement.remove(),e.rootElement=void 0,e.deck=void 0,e.widgetManager=void 0}_getContainer(e,t){if(e&&typeof e!="string")return e;const n=e||ru;let s=this.containers[n];s||(s=document.createElement("div"),s.style.pointerEvents="none",s.style.position="absolute",s.style.overflow="hidden",this.parentElement?.append(s),this.containers[n]=s);let r=s.querySelector(`.${t}`);return r||(r=globalThis.document.createElement("div"),r.className=t,r.style.position="absolute",r.style.zIndex="2",Object.assign(r.style,aS[t]),s.append(r)),r}_updateContainers(){for(const e in this.containers){const t=this.lastViewports[e]||null,n=e===ru||t,s=this.containers[e];if(n){const r=this._getContainerBounds(t);s.style.display="block",s.style.left=`${r.x}px`,s.style.top=`${r.y}px`,s.style.width=`${r.width}px`,s.style.height=`${r.height}px`}else s.style.display="none"}}_getContainerBounds(e){if(!e)return{x:0,y:0,width:this.parentElement?.clientWidth||this.deck.width,height:this.parentElement?.clientHeight||this.deck.height};const t=this.getCanvasBounds(e);return{x:t.x+e.x,y:t.y+e.y,width:e.width,height:e.height}}}function ou(i,e){e&&Object.entries(e).map(([t,n])=>{t.startsWith("--")?i.style.setProperty(t,n):i.style[t]=n})}function uS(i,e){e&&Object.keys(e).map(t=>{t.startsWith("--")?i.style.removeProperty(t):i.style[t]=""})}class Ha{constructor(e){this.viewId=null,this.props={...this.constructor.defaultProps,...e},this.id=this.props.id}setProps(e){const t=this.props,n=this.rootElement;n&&t.className!==e.className&&(t.className&&n.classList.remove(t.className),e.className&&n.classList.add(e.className)),n&&!J(t.style,e.style,1)&&(uS(n,t.style),ou(n,e.style)),Object.assign(this.props,e),this.updateHTML()}updateHTML(){this.rootElement&&this.onRenderHTML(this.rootElement)}get viewIds(){return this.viewId?[this.viewId]:this.deck?.getViews().map(e=>e.id)??[]}getViewState(e){return this.deck?.viewManager?.getViewState(e)||{}}setViewState(e,t){this.deck?._onViewStateChange({viewId:e,viewState:t,interactionState:{}})}onCreateRootElement(){const e=["deck-widget",this.className,this.props.className],t=document.createElement("div");return e.filter(n=>typeof n=="string"&&n.length>0).forEach(n=>t.classList.add(n)),ou(t,this.props.style),t}_onAdd(e){return this.onAdd(e)??this.onCreateRootElement()}onAdd(e){}onRemove(){}onViewportChange(e){}onRedraw(e){}onHover(e,t){}onClick(e,t){}onDrag(e,t){}onDragStart(e,t){}onDragEnd(e,t){}}Ha.defaultProps={id:"widget",style:{},_container:null,className:""};const fS={zIndex:"1",position:"absolute",pointerEvents:"none",color:"#a0a7b4",backgroundColor:"#29323c",padding:"10px",top:"0",left:"0",display:"none"};class ph extends Ha{constructor(e={}){super(e),this.id="default-tooltip",this.placement="fill",this.className="deck-tooltip",this.isVisible=!1,this.setProps(e)}onCreateRootElement(){const e=document.createElement("div");return e.className=this.className,Object.assign(e.style,fS),e}onRenderHTML(e){}onViewportChange(e){this.isVisible&&e.id===this.lastViewport?.id&&!e.equals(this.lastViewport)&&this.setTooltip(null),this.lastViewport=e}onHover(e){const{deck:t}=this,n=t&&t.props.getTooltip;if(!n)return;const s=n(e),r=this.widgetManager?.getCanvasBounds(e.viewport),o=e.x+(r?.x||0),a=e.y+(r?.y||0);this.setTooltip(s,o,a)}setTooltip(e,t,n){const s=this.rootElement;if(s){if(typeof e=="string")s.innerText=e;else if(e)e.text&&(s.innerText=e.text),e.html&&(s.innerHTML=e.html),e.className&&(s.className=e.className);else{this.isVisible=!1,s.style.display="none";return}this.isVisible=!0,s.style.display="block",s.style.transform=`translate(${t}px, ${n}px)`,e&&typeof e=="object"&&"style"in e&&Object.assign(s.style,e.style)}}}ph.defaultProps={...Ha.defaultProps};class dS{constructor(e){this.targets={},this.order=[],this.eventManagers={},this._eventRootToCanvasId=new WeakMap,this._createEventManager=e.createEventManager,this._getEventRoot=e.getEventRoot}finalize(){for(const e of Object.values(this.targets))e.eventManager.destroy(),e.presentationContext.destroy();this.targets={},this.order=[],this.eventManagers={},this._eventRootToCanvasId=new WeakMap}syncCanvasEntries(e){const t=this._normalizeCanvasList(e.canvases),n={},s=[],r=new Map;for(const{canvas:a}of t){const c=this._getEventRoot(a);r.set(c,(r.get(c)||0)+1)}for(const{id:a,canvas:c}of t){const l=this._getEventRoot(c),u=r.get(l)===1?l:c;let f=this.targets[a];if(!f||f.device!==e.device||f.canvas!==c||f.eventRoot!==u){f?.eventManager.destroy(),f?.presentationContext.destroy();const d=e.device.createPresentationContext({id:a,canvas:c,useDevicePixels:e.useDevicePixels,autoResize:!0});f={id:a,device:e.device,canvas:c,eventRoot:u,presentationContext:d,eventManager:this._createEventManager(u)}}this._eventRootToCanvasId.set(u,a),this._eventRootToCanvasId.set(c,a),n[a]=f,s.push(a)}for(const[a,c]of Object.entries(this.targets))n[a]||(c.eventManager.destroy(),c.presentationContext.destroy());this.targets=n,this.order=s;const o=Object.fromEntries(Object.entries(n).map(([a,c])=>[a,c.eventManager]));this._haveSameEventManagers(o)||(this.eventManagers=o)}getCanvasIdFromEvent(e){return e?this._eventRootToCanvasId.get(e):void 0}getTarget(e){return this.targets[e||this.order[0]||Vt]||null}_normalizeCanvasList(e=[]){const t=new Set;return e.map((n,s)=>{let r,o;return typeof n=="string"?(r=document.getElementById(n),$(r,`Canvas with id ${n} not found`),o=n):(r=n,o=r.id||`deckgl-canvas-${s}`),$(!t.has(o),`Duplicate canvas id ${o}`),t.add(o),{id:o,canvas:r}})}_haveSameEventManagers(e){const t=Object.keys(e),n=Object.keys(this.eventManagers);return t.length===n.length&&t.every(s=>e[s]===this.eventManagers[s])}}const hS="modulepreload",gS=function(i){return"/Night-Vision-A/"+i},au={},fs=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let c=function(l){return Promise.all(l.map(u=>Promise.resolve(u).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),a=o?.nonce||o?.getAttribute("nonce");s=c(t.map(l=>{if(l=gS(l),l in au)return;au[l]=!0;const u=l.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${f}`))return;const d=document.createElement("link");if(d.rel=u?"stylesheet":hS,u||(d.as="script"),d.crossOrigin="",d.href=l,a&&d.setAttribute("nonce",a),document.head.appendChild(d),u)return new Promise((h,g)=>{d.addEventListener("load",h),d.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&r(a.reason);return e().catch(r)})},pS={WEBGL_depth_texture:{UNSIGNED_INT_24_8_WEBGL:34042},OES_element_index_uint:{},OES_texture_float:{},OES_texture_half_float:{HALF_FLOAT_OES:5131},EXT_color_buffer_float:{},OES_standard_derivatives:{FRAGMENT_SHADER_DERIVATIVE_HINT_OES:35723},EXT_frag_depth:{},EXT_blend_minmax:{MIN_EXT:32775,MAX_EXT:32776},EXT_shader_texture_lod:{}},mS=i=>({drawBuffersWEBGL(e){return i.drawBuffers(e)},COLOR_ATTACHMENT0_WEBGL:36064,COLOR_ATTACHMENT1_WEBGL:36065,COLOR_ATTACHMENT2_WEBGL:36066,COLOR_ATTACHMENT3_WEBGL:36067}),_S=i=>({VERTEX_ARRAY_BINDING_OES:34229,createVertexArrayOES(){return i.createVertexArray()},deleteVertexArrayOES(e){return i.deleteVertexArray(e)},isVertexArrayOES(e){return i.isVertexArray(e)},bindVertexArrayOES(e){return i.bindVertexArray(e)}}),yS=i=>({VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE:35070,drawArraysInstancedANGLE(...e){return i.drawArraysInstanced(...e)},drawElementsInstancedANGLE(...e){return i.drawElementsInstanced(...e)},vertexAttribDivisorANGLE(...e){return i.vertexAttribDivisor(...e)}});function bS(i=!0){const e=HTMLCanvasElement.prototype;if(!i&&e.originalGetContext){e.getContext=e.originalGetContext,e.originalGetContext=void 0;return}e.originalGetContext=e.getContext,e.getContext=function(t,n){if(t==="webgl"||t==="experimental-webgl"){const s=this.originalGetContext("webgl2",n);return s instanceof HTMLElement&&vS(s),s}return this.originalGetContext(t,n)}}function vS(i){i.getExtension("EXT_color_buffer_float");const e={...pS,WEBGL_disjoint_timer_query:i.getExtension("EXT_disjoint_timer_query_webgl2"),WEBGL_draw_buffers:mS(i),OES_vertex_array_object:_S(i),ANGLE_instanced_arrays:yS(i)},t=i.getExtension.bind(i);i.getExtension=function(s){const r=t(s);return r||(s in e?e[s]:null)};const n=i.getSupportedExtensions;i.getSupportedExtensions=function(){return(n.apply(i)||[])?.concat(Object.keys(e))}}let cu=!1;async function wS(){{Ya();return}}function xS(i,e){return Ya(),i}async function PS(i){{Ya();return}}function ES(i){return null}function Ya(){cu||(cu=!0,P.warn("Import @luma.gl/webgl/debug before enabling WebGL debugging.")())}const ci=1;class SS extends $_{type="webgl";enforceWebGL2(e){bS(e)}isSupported(){return typeof WebGL2RenderingContext<"u"}isDeviceHandle(e){return typeof WebGL2RenderingContext<"u"&&e instanceof WebGL2RenderingContext?!0:(typeof WebGLRenderingContext<"u"&&e instanceof WebGLRenderingContext&&P.warn("WebGL1 is not supported",e)(),!1)}async attach(e,t={}){const{WebGLDevice:n}=await fs(async()=>{const{WebGLDevice:o}=await Promise.resolve().then(()=>Su);return{WebGLDevice:o}},void 0);if(e instanceof n)return e;const s=n.getDeviceFromContext(e);if(s)return s;if(!TS(e))throw new Error("Invalid WebGL2RenderingContext");t=lu(t),await uu(t);const r=t.createCanvasContext===!0?{}:t.createCanvasContext;return new n({...t,_handle:e,createCanvasContext:{canvas:e.canvas,autoResize:!1,...r}})}async create(e={}){const{WebGLDevice:t}=await fs(async()=>{const{WebGLDevice:n}=await Promise.resolve().then(()=>Su);return{WebGLDevice:n}},void 0);e=lu(e),await uu(e);try{const n=new t(e);P.groupCollapsed(ci,`WebGLDevice ${n.id} created`)();const s=`${n._reused?"Reusing":"Created"} device with WebGL2 ${n.props.debug?"debug ":""}context: ${n.info.vendor}, ${n.info.renderer} for canvas: ${n.canvasContext.id}`;return P.probe(ci,s)(),P.table(ci,n.info)(),n}finally{P.groupEnd(ci)(),P.info(ci,"%cWebGL call tracing: luma.log.set('debug-webgl') ","color: white; background: blue; padding: 2px 6px; border-radius: 3px;")()}}}function TS(i){return typeof WebGL2RenderingContext<"u"&&i instanceof WebGL2RenderingContext?!0:!!(i&&typeof i.createVertexArray=="function")}const Sr=new SS;function lu(i){return{...i,debug:i.debug??Ht.defaultProps.debug,debugWebGL:i.debugWebGL??Ht.defaultProps.debugWebGL,debugSpectorJS:i.debugSpectorJS??!!P.get("debug-spectorjs")}}async function uu(i){const e=[];(i.debugWebGL||i.debug)&&e.push(wS()),i.debugSpectorJS&&e.push(PS());const t=await Promise.allSettled(e);for(const n of t)n.status==="rejected"&&P.error(`Failed to initialize debug libraries ${n.reason}`)()}const qa={3042:!1,32773:new Float32Array([0,0,0,0]),32777:32774,34877:32774,32969:1,32968:0,32971:1,32970:0,3106:new Float32Array([0,0,0,0]),3107:[!0,!0,!0,!0],2884:!1,2885:1029,2929:!1,2931:1,2932:513,2928:new Float32Array([0,1]),2930:!0,3024:!0,35725:null,36006:null,36007:null,34229:null,34964:null,2886:2305,33170:4352,2849:1,32823:!1,32824:0,10752:0,32926:!1,32928:!1,32938:1,32939:!1,3089:!1,3088:new Int32Array([0,0,1024,1024]),2960:!1,2961:0,2968:4294967295,36005:4294967295,2962:519,2967:0,2963:4294967295,34816:519,36003:0,36004:4294967295,2964:7680,2965:7680,2966:7680,34817:7680,34818:7680,34819:7680,2978:[0,0,1024,1024],36389:null,36662:null,36663:null,35053:null,35055:null,35723:4352,36010:null,35977:!1,3333:4,3317:4,37440:!1,37441:!1,37443:37444,3330:0,3332:0,3331:0,3314:0,32878:0,3316:0,3315:0,32877:0},X=(i,e,t)=>e?i.enable(t):i.disable(t),fu=(i,e,t)=>i.hint(t,e),ae=(i,e,t)=>i.pixelStorei(t,e),du=(i,e,t)=>{const n=t===36006?36009:36008;return i.bindFramebuffer(n,e)},li=(i,e,t)=>{const s={34964:34962,36662:36662,36663:36663,35053:35051,35055:35052}[t];i.bindBuffer(s,e)};function Tr(i){return Array.isArray(i)||ArrayBuffer.isView(i)&&!(i instanceof DataView)}const LS={3042:X,32773:(i,e)=>i.blendColor(...e),32777:"blendEquation",34877:"blendEquation",32969:"blendFunc",32968:"blendFunc",32971:"blendFunc",32970:"blendFunc",3106:(i,e)=>i.clearColor(...e),3107:(i,e)=>i.colorMask(...e),2884:X,2885:(i,e)=>i.cullFace(e),2929:X,2931:(i,e)=>i.clearDepth(e),2932:(i,e)=>i.depthFunc(e),2928:(i,e)=>i.depthRange(...e),2930:(i,e)=>i.depthMask(e),3024:X,35723:fu,35725:(i,e)=>i.useProgram(e),36007:(i,e)=>i.bindRenderbuffer(36161,e),36389:(i,e)=>i.bindTransformFeedback?.(36386,e),34229:(i,e)=>i.bindVertexArray(e),36006:du,36010:du,34964:li,36662:li,36663:li,35053:li,35055:li,2886:(i,e)=>i.frontFace(e),33170:fu,2849:(i,e)=>i.lineWidth(e),32823:X,32824:"polygonOffset",10752:"polygonOffset",35977:X,32926:X,32928:X,32938:"sampleCoverage",32939:"sampleCoverage",3089:X,3088:(i,e)=>i.scissor(...e),2960:X,2961:(i,e)=>i.clearStencil(e),2968:(i,e)=>i.stencilMaskSeparate(1028,e),36005:(i,e)=>i.stencilMaskSeparate(1029,e),2962:"stencilFuncFront",2967:"stencilFuncFront",2963:"stencilFuncFront",34816:"stencilFuncBack",36003:"stencilFuncBack",36004:"stencilFuncBack",2964:"stencilOpFront",2965:"stencilOpFront",2966:"stencilOpFront",34817:"stencilOpBack",34818:"stencilOpBack",34819:"stencilOpBack",2978:(i,e)=>i.viewport(...e),34383:X,10754:X,12288:X,12289:X,12290:X,12291:X,12292:X,12293:X,12294:X,12295:X,3333:ae,3317:ae,37440:ae,37441:ae,37443:ae,3330:ae,3332:ae,3331:ae,3314:ae,32878:ae,3316:ae,3315:ae,32877:ae,framebuffer:(i,e)=>{const t=e&&"handle"in e?e.handle:e;return i.bindFramebuffer(36160,t)},blend:(i,e)=>e?i.enable(3042):i.disable(3042),blendColor:(i,e)=>i.blendColor(...e),blendEquation:(i,e)=>{const t=typeof e=="number"?[e,e]:e;i.blendEquationSeparate(...t)},blendFunc:(i,e)=>{const t=e?.length===2?[...e,...e]:e;i.blendFuncSeparate(...t)},clearColor:(i,e)=>i.clearColor(...e),clearDepth:(i,e)=>i.clearDepth(e),clearStencil:(i,e)=>i.clearStencil(e),colorMask:(i,e)=>i.colorMask(...e),cull:(i,e)=>e?i.enable(2884):i.disable(2884),cullFace:(i,e)=>i.cullFace(e),depthTest:(i,e)=>e?i.enable(2929):i.disable(2929),depthFunc:(i,e)=>i.depthFunc(e),depthMask:(i,e)=>i.depthMask(e),depthRange:(i,e)=>i.depthRange(...e),dither:(i,e)=>e?i.enable(3024):i.disable(3024),derivativeHint:(i,e)=>{i.hint(35723,e)},frontFace:(i,e)=>i.frontFace(e),mipmapHint:(i,e)=>i.hint(33170,e),lineWidth:(i,e)=>i.lineWidth(e),polygonOffsetFill:(i,e)=>e?i.enable(32823):i.disable(32823),polygonOffset:(i,e)=>i.polygonOffset(...e),sampleCoverage:(i,e)=>i.sampleCoverage(e[0],e[1]||!1),scissorTest:(i,e)=>e?i.enable(3089):i.disable(3089),scissor:(i,e)=>i.scissor(...e),stencilTest:(i,e)=>e?i.enable(2960):i.disable(2960),stencilMask:(i,e)=>{e=Tr(e)?e:[e,e];const[t,n]=e;i.stencilMaskSeparate(1028,t),i.stencilMaskSeparate(1029,n)},stencilFunc:(i,e)=>{e=Tr(e)&&e.length===3?[...e,...e]:e;const[t,n,s,r,o,a]=e;i.stencilFuncSeparate(1028,t,n,s),i.stencilFuncSeparate(1029,r,o,a)},stencilOp:(i,e)=>{e=Tr(e)&&e.length===3?[...e,...e]:e;const[t,n,s,r,o,a]=e;i.stencilOpSeparate(1028,t,n,s),i.stencilOpSeparate(1029,r,o,a)},viewport:(i,e)=>i.viewport(...e)};function Y(i,e,t){return e[i]!==void 0?e[i]:t[i]}const CS={blendEquation:(i,e,t)=>i.blendEquationSeparate(Y(32777,e,t),Y(34877,e,t)),blendFunc:(i,e,t)=>i.blendFuncSeparate(Y(32969,e,t),Y(32968,e,t),Y(32971,e,t),Y(32970,e,t)),polygonOffset:(i,e,t)=>i.polygonOffset(Y(32824,e,t),Y(10752,e,t)),sampleCoverage:(i,e,t)=>i.sampleCoverage(Y(32938,e,t),Y(32939,e,t)),stencilFuncFront:(i,e,t)=>i.stencilFuncSeparate(1028,Y(2962,e,t),Y(2967,e,t),Y(2963,e,t)),stencilFuncBack:(i,e,t)=>i.stencilFuncSeparate(1029,Y(34816,e,t),Y(36003,e,t),Y(36004,e,t)),stencilOpFront:(i,e,t)=>i.stencilOpSeparate(1028,Y(2964,e,t),Y(2965,e,t),Y(2966,e,t)),stencilOpBack:(i,e,t)=>i.stencilOpSeparate(1029,Y(34817,e,t),Y(34818,e,t),Y(34819,e,t))},hu={enable:(i,e)=>i({[e]:!0}),disable:(i,e)=>i({[e]:!1}),pixelStorei:(i,e,t)=>i({[e]:t}),hint:(i,e,t)=>i({[e]:t}),useProgram:(i,e)=>i({35725:e}),bindRenderbuffer:(i,e,t)=>i({36007:t}),bindTransformFeedback:(i,e,t)=>i({36389:t}),bindVertexArray:(i,e)=>i({34229:e}),bindFramebuffer:(i,e,t)=>{switch(e){case 36160:return i({36006:t,36010:t});case 36009:return i({36006:t});case 36008:return i({36010:t});default:return null}},bindBuffer:(i,e,t)=>{const n={34962:[34964],36662:[36662],36663:[36663],35051:[35053],35052:[35055]}[e];return n?i({[n]:t}):{valueChanged:!0}},blendColor:(i,e,t,n,s)=>i({32773:new Float32Array([e,t,n,s])}),blendEquation:(i,e)=>i({32777:e,34877:e}),blendEquationSeparate:(i,e,t)=>i({32777:e,34877:t}),blendFunc:(i,e,t)=>i({32969:e,32968:t,32971:e,32970:t}),blendFuncSeparate:(i,e,t,n,s)=>i({32969:e,32968:t,32971:n,32970:s}),clearColor:(i,e,t,n,s)=>i({3106:new Float32Array([e,t,n,s])}),clearDepth:(i,e)=>i({2931:e}),clearStencil:(i,e)=>i({2961:e}),colorMask:(i,e,t,n,s)=>i({3107:[e,t,n,s]}),cullFace:(i,e)=>i({2885:e}),depthFunc:(i,e)=>i({2932:e}),depthRange:(i,e,t)=>i({2928:new Float32Array([e,t])}),depthMask:(i,e)=>i({2930:e}),frontFace:(i,e)=>i({2886:e}),lineWidth:(i,e)=>i({2849:e}),polygonOffset:(i,e,t)=>i({32824:e,10752:t}),sampleCoverage:(i,e,t)=>i({32938:e,32939:t}),scissor:(i,e,t,n,s)=>i({3088:new Int32Array([e,t,n,s])}),stencilMask:(i,e)=>i({2968:e,36005:e}),stencilMaskSeparate:(i,e,t)=>i({[e===1028?2968:36005]:t}),stencilFunc:(i,e,t,n)=>i({2962:e,2967:t,2963:n,34816:e,36003:t,36004:n}),stencilFuncSeparate:(i,e,t,n,s)=>i({[e===1028?2962:34816]:t,[e===1028?2967:36003]:n,[e===1028?2963:36004]:s}),stencilOp:(i,e,t,n)=>i({2964:e,2965:t,2966:n,34817:e,34818:t,34819:n}),stencilOpSeparate:(i,e,t,n,s)=>i({[e===1028?2964:34817]:t,[e===1028?2965:34818]:n,[e===1028?2966:34819]:s}),viewport:(i,e,t,n,s)=>i({2978:[e,t,n,s]})},Te=(i,e)=>i.isEnabled(e),gu={3042:Te,2884:Te,2929:Te,3024:Te,32823:Te,32926:Te,32928:Te,3089:Te,2960:Te,35977:Te},AS=new Set([34016,36388,36387,35983,35368,34965,35739,35738,3074,34853,34854,34855,34856,34857,34858,34859,34860,34861,34862,34863,34864,34865,34866,34867,34868,35097,32873,35869,32874,34068]);function ri(i,e){if(IS(e))return;const t={};for(const s in e){const r=Number(s),o=LS[s];o&&(typeof o=="string"?t[o]=!0:o(i,e[s],r))}const n=i.lumaState?.cache;if(n)for(const s in t){const r=CS[s];r(i,e,n)}}function mh(i,e=qa){if(typeof e=="number"){const s=e,r=gu[s];return r?r(i,s):i.getParameter(s)}const t=Array.isArray(e)?e:Object.keys(e),n={};for(const s of t){const r=gu[s];n[s]=r?r(i,Number(s)):i.getParameter(Number(s))}return n}function MS(i){ri(i,qa)}function IS(i){for(const e in i)return!1;return!0}function RS(i,e){if(i===e)return!0;if(pu(i)&&pu(e)&&i.length===e.length){for(let t=0;t<i.length;++t)if(i[t]!==e[t])return!1;return!0}return!1}function pu(i){return Array.isArray(i)||ArrayBuffer.isView(i)}class dt{static get(e){return e.lumaState}gl;program=null;stateStack=[];enable=!0;cache=null;log;initialized=!1;constructor(e,t){this.gl=e,this.log=t?.log||(()=>{}),this._updateCache=this._updateCache.bind(this),Object.seal(this)}push(e={}){this.stateStack.push({})}pop(){const e=this.stateStack[this.stateStack.length-1];ri(this.gl,e),this.stateStack.pop()}trackState(e,t){if(this.cache=t?.copyState?mh(e):Object.assign({},qa),this.initialized)throw new Error("WebGLStateTracker");this.initialized=!0,this.gl.lumaState=this,BS(e);for(const n in hu){const s=hu[n];OS(e,n,s)}mu(e,"getParameter"),mu(e,"isEnabled")}_updateCache(e){let t=!1,n;const s=this.stateStack.length>0?this.stateStack[this.stateStack.length-1]:null;for(const r in e){const o=e[r],a=this.cache[r];RS(o,a)||(t=!0,n=a,s&&!(r in s)&&(s[r]=a),this.cache[r]=o)}return{valueChanged:t,oldValue:n}}}function mu(i,e){const t=i[e].bind(i);i[e]=function(s){if(s===void 0||AS.has(s))return t(s);const r=dt.get(i);return s in r.cache||(r.cache[s]=t(s)),r.enable?r.cache[s]:t(s)},Object.defineProperty(i[e],"name",{value:`${e}-from-cache`,configurable:!1})}function OS(i,e,t){if(!i[e])return;const n=i[e].bind(i);i[e]=function(...r){const o=dt.get(i),{valueChanged:a,oldValue:c}=t(o._updateCache,...r);return a&&n(...r),c},Object.defineProperty(i[e],"name",{value:`${e}-to-cache`,configurable:!1})}function BS(i){const e=i.useProgram.bind(i);i.useProgram=function(n){const s=dt.get(i);s.program!==n&&(e(n),s.program=n)}}function Fo(i){const e=i.luma||{_polyfilled:!1,extensions:{},softwareRenderer:!1};return e._polyfilled??=!1,e.extensions||={},i.luma=e,e}function kS(i,e,t){let n="";const s=c=>{const l=c.statusMessage;l&&(n||=l)};i.addEventListener("webglcontextcreationerror",s,!1);const r=t.failIfMajorPerformanceCaveat!==!0,o={preserveDrawingBuffer:!0,...t,failIfMajorPerformanceCaveat:!0};let a=null;try{a||=i.getContext("webgl2",o),!a&&o.failIfMajorPerformanceCaveat&&(n||="Only software GPU is available. Set `failIfMajorPerformanceCaveat: false` to allow.");let c=!1;if(!a&&r&&(o.failIfMajorPerformanceCaveat=!1,a=i.getContext("webgl2",o),c=!0),a||(a=i.getContext("webgl",{}),a&&(a=null,n||="Your browser only supports WebGL1")),!a)throw n||="Your browser does not support WebGL",new Error(`Failed to create WebGL context: ${n}`);const l=Fo(a);l.softwareRenderer=c;const{onContextLost:u,onContextRestored:f}=e;return i.addEventListener("webglcontextlost",d=>u(d),!1),i.addEventListener("webglcontextrestored",d=>f(d),!1),a}finally{i.removeEventListener("webglcontextcreationerror",s,!1)}}function bt(i,e,t){return t[e]===void 0&&(t[e]=i.getExtension(e)||null),t[e]}function DS(i,e){const t=i.getParameter(7936),n=i.getParameter(7937);bt(i,"WEBGL_debug_renderer_info",e);const s=e.WEBGL_debug_renderer_info,r=i.getParameter(s?s.UNMASKED_VENDOR_WEBGL:7936),o=i.getParameter(s?s.UNMASKED_RENDERER_WEBGL:7937),a=r||t,c=o||n,l=i.getParameter(7938),u=_h(a,c),f=FS(a,c),d=zS(a,c);return{type:"webgl",gpu:u,gpuType:d,gpuBackend:f,vendor:a,renderer:c,version:l,shadingLanguage:"glsl",shadingLanguageVersion:300}}function _h(i,e){return/NVIDIA/i.exec(i)||/NVIDIA/i.exec(e)?"nvidia":/INTEL/i.exec(i)||/INTEL/i.exec(e)?"intel":/Apple/i.exec(i)||/Apple/i.exec(e)?"apple":/AMD/i.exec(i)||/AMD/i.exec(e)||/ATI/i.exec(i)||/ATI/i.exec(e)?"amd":/SwiftShader/i.exec(i)||/SwiftShader/i.exec(e)?"software":"unknown"}function FS(i,e){return/Metal/i.exec(i)||/Metal/i.exec(e)?"metal":/ANGLE/i.exec(i)||/ANGLE/i.exec(e)?"opengl":"unknown"}function zS(i,e){if(/SwiftShader/i.exec(i)||/SwiftShader/i.exec(e))return"cpu";switch(_h(i,e)){case"apple":return NS(i,e)?"integrated":"unknown";case"intel":return"integrated";case"software":return"cpu";case"unknown":return"unknown";default:return"discrete"}}function NS(i,e){return/Apple (M\d|A\d|GPU)/i.test(`${i} ${e}`)}function yh(i){switch(i){case"uint8":return 5121;case"sint8":return 5120;case"unorm8":return 5121;case"snorm8":return 5120;case"uint16":return 5123;case"sint16":return 5122;case"unorm16":return 5123;case"snorm16":return 5122;case"uint32":return 5125;case"sint32":return 5124;case"float16":return 5131;case"float32":return 5126}throw new Error(String(i))}const _i="WEBGL_compressed_texture_s3tc",yi="WEBGL_compressed_texture_s3tc_srgb",Ft="EXT_texture_compression_rgtc",zt="EXT_texture_compression_bptc",$S="WEBGL_compressed_texture_etc",US="WEBGL_compressed_texture_astc",GS="WEBGL_compressed_texture_etc1",VS="WEBGL_compressed_texture_pvrtc",jS="WEBGL_compressed_texture_atc",WS="EXT_texture_norm16",_u="EXT_render_snorm",bh="EXT_color_buffer_float",Lr="snorm8-renderable-webgl",Cr="norm16-renderable-webgl",Ar="snorm16-renderable-webgl",Mr="float16-renderable-webgl",xn="float32-renderable-webgl",HS="rgb9e5ufloat-renderable-webgl",Xa={"float32-renderable-webgl":{extensions:[bh]},"float16-renderable-webgl":{extensions:["EXT_color_buffer_half_float"]},"rgb9e5ufloat-renderable-webgl":{extensions:["WEBGL_render_shared_exponent"]},"snorm8-renderable-webgl":{extensions:[_u]},"norm16-webgl":{extensions:[WS]},"norm16-renderable-webgl":{features:["norm16-webgl"]},"snorm16-renderable-webgl":{features:["norm16-webgl"],extensions:[_u]},"float32-filterable":{extensions:["OES_texture_float_linear"]},"float16-filterable-webgl":{extensions:["OES_texture_half_float_linear"]},"texture-filterable-anisotropic-webgl":{extensions:["EXT_texture_filter_anisotropic"]},"texture-blend-float-webgl":{extensions:["EXT_float_blend"]},"texture-compression-bc":{extensions:[_i,yi,Ft,zt]},"texture-compression-bc5-webgl":{extensions:[Ft]},"texture-compression-bc7-webgl":{extensions:[zt]},"texture-compression-etc2":{extensions:[$S]},"texture-compression-astc":{extensions:[US]},"texture-compression-etc1-webgl":{extensions:[GS]},"texture-compression-pvrtc-webgl":{extensions:[VS]},"texture-compression-atc-webgl":{extensions:[jS]}};function YS(i){return i in Xa}function vh(i,e,t){return wh(i,e,t,new Set)}function wh(i,e,t,n){const s=Xa[e];if(!s||n.has(e))return!1;n.add(e);const r=(s.features||[]).every(o=>wh(i,o,t,n));return n.delete(e),r?(s.extensions||[]).every(o=>!!bt(i,o,t)):!1}const Fs={r8unorm:{gl:33321,rb:!0},r8snorm:{gl:36756,r:Lr},r8uint:{gl:33330,rb:!0},r8sint:{gl:33329,rb:!0},rg8unorm:{gl:33323,rb:!0},rg8snorm:{gl:36757,r:Lr},rg8uint:{gl:33336,rb:!0},rg8sint:{gl:33335,rb:!0},r16uint:{gl:33332,rb:!0},r16sint:{gl:33331,rb:!0},r16float:{gl:33325,rb:!0,r:Mr},r16unorm:{gl:33322,rb:!0,r:Cr},r16snorm:{gl:36760,r:Ar},"rgba4unorm-webgl":{gl:32854,rb:!0},"rgb565unorm-webgl":{gl:36194,rb:!0},"rgb5a1unorm-webgl":{gl:32855,rb:!0},"rgb8unorm-webgl":{gl:32849},"rgb8snorm-webgl":{gl:36758},rgba8unorm:{gl:32856},"rgba8unorm-srgb":{gl:35907},rgba8snorm:{gl:36759,r:Lr},rgba8uint:{gl:36220},rgba8sint:{gl:36238},bgra8unorm:{},"bgra8unorm-srgb":{},rg16uint:{gl:33338},rg16sint:{gl:33337},rg16float:{gl:33327,rb:!0,r:Mr},rg16unorm:{gl:33324,r:Cr},rg16snorm:{gl:36761,r:Ar},r32uint:{gl:33334,rb:!0},r32sint:{gl:33333,rb:!0},r32float:{gl:33326,r:xn},rgb9e5ufloat:{gl:35901,r:HS},rg11b10ufloat:{gl:35898,rb:!0},rgb10a2unorm:{gl:32857,rb:!0},rgb10a2uint:{gl:36975,rb:!0},"rgb16unorm-webgl":{gl:32852,r:!1},"rgb16snorm-webgl":{gl:36762,r:!1},rg32uint:{gl:33340,rb:!0},rg32sint:{gl:33339,rb:!0},rg32float:{gl:33328,rb:!0,r:xn},rgba16uint:{gl:36214,rb:!0},rgba16sint:{gl:36232,rb:!0},rgba16float:{gl:34842,r:Mr},rgba16unorm:{gl:32859,rb:!0,r:Cr},rgba16snorm:{gl:36763,r:Ar},"rgb32float-webgl":{gl:34837,x:bh,r:xn,dataFormat:6407,types:[5126]},rgba32uint:{gl:36208,rb:!0},rgba32sint:{gl:36226,rb:!0},rgba32float:{gl:34836,rb:!0,r:xn},stencil8:{gl:36168,rb:!0},depth16unorm:{gl:33189,dataFormat:6402,types:[5123],rb:!0},depth24plus:{gl:33190,dataFormat:6402,types:[5125]},depth32float:{gl:36012,dataFormat:6402,types:[5126],rb:!0},"depth24plus-stencil8":{gl:35056,rb:!0,depthTexture:!0,dataFormat:34041,types:[34042]},"depth32float-stencil8":{gl:36013,dataFormat:34041,types:[36269],rb:!0},"bc1-rgb-unorm-webgl":{gl:33776,x:_i},"bc1-rgb-unorm-srgb-webgl":{gl:35916,x:yi},"bc1-rgba-unorm":{gl:33777,x:_i},"bc1-rgba-unorm-srgb":{gl:35916,x:yi},"bc2-rgba-unorm":{gl:33778,x:_i},"bc2-rgba-unorm-srgb":{gl:35918,x:yi},"bc3-rgba-unorm":{gl:33779,x:_i},"bc3-rgba-unorm-srgb":{gl:35919,x:yi},"bc4-r-unorm":{gl:36283,x:Ft},"bc4-r-snorm":{gl:36284,x:Ft},"bc5-rg-unorm":{gl:36285,x:Ft},"bc5-rg-snorm":{gl:36286,x:Ft},"bc6h-rgb-ufloat":{gl:36495,x:zt},"bc6h-rgb-float":{gl:36494,x:zt},"bc7-rgba-unorm":{gl:36492,x:zt},"bc7-rgba-unorm-srgb":{gl:36493,x:zt},"etc2-rgb8unorm":{gl:37492},"etc2-rgb8unorm-srgb":{gl:37494},"etc2-rgb8a1unorm":{gl:37496},"etc2-rgb8a1unorm-srgb":{gl:37497},"etc2-rgba8unorm":{gl:37493},"etc2-rgba8unorm-srgb":{gl:37495},"eac-r11unorm":{gl:37488},"eac-r11snorm":{gl:37489},"eac-rg11unorm":{gl:37490},"eac-rg11snorm":{gl:37491},"astc-4x4-unorm":{gl:37808},"astc-4x4-unorm-srgb":{gl:37840},"astc-5x4-unorm":{gl:37809},"astc-5x4-unorm-srgb":{gl:37841},"astc-5x5-unorm":{gl:37810},"astc-5x5-unorm-srgb":{gl:37842},"astc-6x5-unorm":{gl:37811},"astc-6x5-unorm-srgb":{gl:37843},"astc-6x6-unorm":{gl:37812},"astc-6x6-unorm-srgb":{gl:37844},"astc-8x5-unorm":{gl:37813},"astc-8x5-unorm-srgb":{gl:37845},"astc-8x6-unorm":{gl:37814},"astc-8x6-unorm-srgb":{gl:37846},"astc-8x8-unorm":{gl:37815},"astc-8x8-unorm-srgb":{gl:37847},"astc-10x5-unorm":{gl:37816},"astc-10x5-unorm-srgb":{gl:37848},"astc-10x6-unorm":{gl:37817},"astc-10x6-unorm-srgb":{gl:37849},"astc-10x8-unorm":{gl:37818},"astc-10x8-unorm-srgb":{gl:37850},"astc-10x10-unorm":{gl:37819},"astc-10x10-unorm-srgb":{gl:37851},"astc-12x10-unorm":{gl:37820},"astc-12x10-unorm-srgb":{gl:37852},"astc-12x12-unorm":{gl:37821},"astc-12x12-unorm-srgb":{gl:37853},"pvrtc-rgb4unorm-webgl":{gl:35840},"pvrtc-rgba4unorm-webgl":{gl:35842},"pvrtc-rgb2unorm-webgl":{gl:35841},"pvrtc-rgba2unorm-webgl":{gl:35843},"etc1-rbg-unorm-webgl":{gl:36196},"atc-rgb-unorm-webgl":{gl:35986},"atc-rgba-unorm-webgl":{gl:35986},"atc-rgbai-unorm-webgl":{gl:34798}};function qS(i,e,t){let n=e.create;const s=Fs[e.format];s?.gl===void 0&&(n=!1),s?.x&&(n=n&&!!bt(i,s.x,t)),e.format==="stencil8"&&(n=!1);const r=s?.r===!1?!1:s?.r===void 0||vh(i,s.r,t),o=n&&e.render&&r&&XS(i,e.format,t);return{format:e.format,create:n&&e.create,render:o,filter:n&&e.filter,blend:n&&e.blend,store:n&&e.store}}function XS(i,e,t){const n=Fs[e],s=n?.gl;if(s===void 0||n?.x&&!bt(i,n.x,t))return!1;const r=i.getParameter(32873),o=i.getParameter(36006),a=i.createTexture(),c=i.createFramebuffer();if(!a||!c)return!1;const l=0;let u=Number(i.getError());for(;u!==l;)u=i.getError();let f=!1;try{if(i.bindTexture(3553,a),i.texStorage2D(3553,1,s,1,1),Number(i.getError())!==l)return!1;i.bindFramebuffer(36160,c),i.framebufferTexture2D(36160,36064,3553,a,0),f=Number(i.checkFramebufferStatus(36160))===36053&&Number(i.getError())===l}finally{i.bindFramebuffer(36160,o),i.deleteFramebuffer(c),i.bindTexture(3553,r),i.deleteTexture(a)}return f}function xh(i){const e=Fs[i],t=QS(i),n=_e.getInfo(i);return n.compressed&&(e.dataFormat=t),{internalFormat:t,format:e?.dataFormat||KS(n.channels,n.integer,n.normalized,t),type:n.dataType?yh(n.dataType):e?.types?.[0]||5121,compressed:n.compressed||!1}}function ZS(i){switch(_e.getInfo(i).attachment){case"depth":return 36096;case"stencil":return 36128;case"depth-stencil":return 33306;default:throw new Error(`Not a depth stencil format: ${i}`)}}function KS(i,e,t,n){if(n===6408||n===6407)return n;switch(i){case"r":return e&&!t?36244:6403;case"rg":return e&&!t?33320:33319;case"rgb":return e&&!t?36248:6407;case"rgba":return e&&!t?36249:6408;case"bgra":throw new Error("bgra pixels not supported by WebGL");default:return 6408}}function QS(i){const t=Fs[i]?.gl;if(t===void 0)throw new Error(`Unsupported texture format ${i}`);return t}const yu={"depth-clip-control":"EXT_depth_clamp","timestamp-query":"EXT_disjoint_timer_query_webgl2","compilation-status-async-webgl":"KHR_parallel_shader_compile","html-in-canvas":i=>Dy()&&typeof i.texElementImage2D=="function","polygon-mode-webgl":"WEBGL_polygon_mode","provoking-vertex-webgl":"WEBGL_provoking_vertex","shader-clip-cull-distance-webgl":"WEBGL_clip_cull_distance","shader-noperspective-interpolation-webgl":"NV_shader_noperspective_interpolation","shader-conservative-depth-webgl":"EXT_conservative_depth"};class JS extends ky{gl;extensions;testedFeatures=new Set;constructor(e,t,n){super([],n),this.gl=e,this.extensions=t,bt(e,"EXT_color_buffer_float",t)}*[Symbol.iterator](){const e=this.getFeatures();for(const t of e)this.has(t)&&(yield t);return[]}has(e){return this.disabledFeatures?.[e]?!1:(this.testedFeatures.has(e)||(this.testedFeatures.add(e),YS(e)&&vh(this.gl,e,this.extensions)&&this.features.add(e),this.getWebGLFeature(e)&&this.features.add(e)),this.features.has(e))}initializeFeatures(){const e=this.getFeatures().filter(t=>t!=="polygon-mode-webgl");for(const t of e)this.has(t)}getFeatures(){return[...Object.keys(yu),...Object.keys(Xa)]}getWebGLFeature(e){const t=yu[e];return typeof t=="string"?!!bt(this.gl,t,this.extensions):typeof t=="function"?t(this.gl):!!t}}class e3 extends My{get maxTextureDimension1D(){return 0}get maxTextureDimension2D(){return this.getParameter(3379)}get maxTextureDimension3D(){return this.getParameter(32883)}get maxTextureArrayLayers(){return this.getParameter(35071)}get maxBindGroups(){return 0}get maxBindGroupsPlusVertexBuffers(){return 0}get maxBindingsPerBindGroup(){return 0}get maxDynamicUniformBuffersPerPipelineLayout(){return 0}get maxDynamicStorageBuffersPerPipelineLayout(){return 0}get maxSampledTexturesPerShaderStage(){return this.getParameter(35660)}get maxSamplersPerShaderStage(){return this.getParameter(35661)}get maxStorageBuffersPerShaderStage(){return 0}get maxStorageBuffersInVertexStage(){return 0}get maxStorageBuffersInFragmentStage(){return 0}get maxStorageTexturesPerShaderStage(){return 0}get maxStorageTexturesInVertexStage(){return 0}get maxStorageTexturesInFragmentStage(){return 0}get maxUniformBuffersPerShaderStage(){return this.getParameter(35375)}get maxUniformBufferBindingSize(){return this.getParameter(35376)}get maxStorageBufferBindingSize(){return 0}get maxBufferSize(){return Number.MAX_SAFE_INTEGER}get minUniformBufferOffsetAlignment(){return this.getParameter(35380)}get minStorageBufferOffsetAlignment(){return 0}get maxVertexBuffers(){return 16}get maxVertexAttributes(){return this.getParameter(34921)}get maxVertexBufferArrayStride(){return 2048}get maxInterStageShaderVariables(){return this.getParameter(35659)}get maxColorAttachments(){return this.getParameter(36063)}get maxColorAttachmentBytesPerSample(){return 0}get maxComputeWorkgroupStorageSize(){return 0}get maxComputeInvocationsPerWorkgroup(){return 0}get maxComputeWorkgroupSizeX(){return 0}get maxComputeWorkgroupSizeY(){return 0}get maxComputeWorkgroupSizeZ(){return 0}get maxComputeWorkgroupsPerDimension(){return 0}gl;limits={};constructor(e){super(),this.gl=e}getParameter(e){return this.limits[e]===void 0&&(this.limits[e]=this.gl.getParameter(e)),this.limits[e]||0}}class Si extends Ts{device;gl;handle;colorAttachments=[];depthStencilAttachment=null;constructor(e,t){super(e,t);const n=t.handle,s=n===null;this.device=e,this.gl=e.gl,this.handle=n||s?n:this.gl.createFramebuffer(),s||(e._setWebGLDebugMetadata(this.handle,this,{spector:this.props}),t.handle||(this.autoCreateAttachmentTextures(),this.updateAttachments()))}destroy(){super.destroy(),!this.destroyed&&this.handle!==null&&!this.props.handle&&this.gl.deleteFramebuffer(this.handle)}updateAttachments(){const e=this.gl.bindFramebuffer(36160,this.handle);for(let t=0;t<this.colorAttachments.length;++t){const n=this.colorAttachments[t];if(n){const s=36064+t;this._attachTextureView(s,n)}}if(this.depthStencilAttachment){const t=ZS(this.depthStencilAttachment.props.format);this._attachTextureView(t,this.depthStencilAttachment)}if(this.device.props.debug){const t=this.gl.checkFramebufferStatus(36160);if(t!==36053)throw new Error(`Framebuffer ${i3(t)}`)}this.gl.bindFramebuffer(36160,e)}_attachTextureView(e,t){const{gl:n}=this.device,{texture:s}=t,r=t.props.baseMipLevel,o=t.props.baseArrayLayer;switch(n.bindTexture(s.glTarget,s.handle),s.glTarget){case 35866:case 32879:n.framebufferTextureLayer(36160,e,s.handle,r,o);break;case 34067:const a=t3(o);n.framebufferTexture2D(36160,e,a,s.handle,r);break;case 3553:n.framebufferTexture2D(36160,e,3553,s.handle,r);break;default:throw new Error("Illegal texture type")}n.bindTexture(s.glTarget,null)}resizeAttachments(e,t){if(this.handle===null){this.width=e,this.height=t;return}super.resizeAttachments(e,t)}}function t3(i){return i<34069?i+34069:i}function i3(i){switch(i){case 36053:return"success";case 36054:return"Mismatched attachments";case 36055:return"No attachments";case 36057:return"Height/width mismatch";case 36061:return"Unsupported or split attachments";case 36182:return"Samples mismatch";default:return`${i}`}}class n3 extends Vy{device;handle=null;_framebuffer=null;get[Symbol.toStringTag](){return"WebGLCanvasContext"}constructor(e,t){super(t),this.device=e,this._setAutoCreatedCanvasId(`${this.device.id}-canvas`),this._configureDevice()}_configureDevice(){(this.drawingBufferWidth!==this._framebuffer?.width||this.drawingBufferHeight!==this._framebuffer?.height)&&this._framebuffer?.resize([this.drawingBufferWidth,this.drawingBufferHeight])}_getCurrentFramebuffer(){return this._framebuffer||=new Si(this.device,{id:"canvas-context-framebuffer",handle:null,width:this.drawingBufferWidth,height:this.drawingBufferHeight}),this._framebuffer}}class s3 extends jy{device;handle=null;context2d;get[Symbol.toStringTag](){return"WebGLPresentationContext"}constructor(e,t={}){super(t),this.device=e;const n=`${this[Symbol.toStringTag]}(${this.id})`;if(!this.device.getDefaultCanvasContext().offscreenCanvas)throw new Error(`${n}: WebGL PresentationContext requires the default CanvasContext canvas to be an OffscreenCanvas`);const r=this.canvas.getContext("2d");if(!r)throw new Error(`${n}: Failed to create 2d presentation context`);this.context2d=r,this._setAutoCreatedCanvasId(`${this.device.id}-presentation-canvas`),this._configureDevice(),this._startObservers()}present(){this._resizeDrawingBufferIfNeeded(),this.device.submit();const e=this.device.getDefaultCanvasContext(),[t,n]=e.getDrawingBufferSize();if(!(this.drawingBufferWidth===0||this.drawingBufferHeight===0||t===0||n===0||e.canvas.width===0||e.canvas.height===0)){if(t!==this.drawingBufferWidth||n!==this.drawingBufferHeight||e.canvas.width!==this.drawingBufferWidth||e.canvas.height!==this.drawingBufferHeight)throw new Error(`${this[Symbol.toStringTag]}(${this.id}): Default canvas context size ${t}x${n} does not match presentation size ${this.drawingBufferWidth}x${this.drawingBufferHeight}`);this.context2d.clearRect(0,0,this.drawingBufferWidth,this.drawingBufferHeight),this.context2d.drawImage(e.canvas,0,0)}}_configureDevice(){}_getCurrentFramebuffer(e){const t=this.device.getDefaultCanvasContext();return t.setDrawingBufferSize(this.drawingBufferWidth,this.drawingBufferHeight),t.getCurrentFramebuffer(e)}}const Ir={};function r3(i="id"){Ir[i]=Ir[i]||1;const e=Ir[i]++;return`${i}-${e}`}class Ti extends O{device;gl;handle;glTarget;glUsage;glIndexType=5123;byteLength=0;bytesUsed=0;constructor(e,t={}){super(e,t),this.device=e,this.gl=this.device.gl;const n=typeof t=="object"?t.handle:void 0;this.handle=n||this.gl.createBuffer(),e._setWebGLDebugMetadata(this.handle,this,{spector:{...this.props,data:typeof this.props.data}}),this.glTarget=o3(this.props.usage),this.glUsage=a3(this.props.usage),this.glIndexType=this.props.indexType==="uint32"?5125:5123,t.data?this._initWithData(t.data,t.byteOffset,t.byteLength):this._initWithByteLength(t.byteLength||0)}destroy(){!this.destroyed&&this.handle&&(this.removeStats(),this.props.handle?this.trackDeallocatedReferencedMemory("Buffer"):(this.trackDeallocatedMemory(),this.gl.deleteBuffer(this.handle)),this.destroyed=!0,this.handle=null)}_initWithData(e,t=0,n=e.byteLength+t){const s=this.glTarget;this.gl.bindBuffer(s,this.handle),this.gl.bufferData(s,n,this.glUsage),this.gl.bufferSubData(s,t,e),this.gl.bindBuffer(s,null),this.bytesUsed=n,this.byteLength=n,this._setDebugData(e,t,n),this.props.handle?this.trackReferencedMemory(n,"Buffer"):this.trackAllocatedMemory(n)}_initWithByteLength(e){let t=e;e===0&&(t=new Float32Array(0));const n=this.glTarget;return this.gl.bindBuffer(n,this.handle),this.gl.bufferData(n,t,this.glUsage),this.gl.bindBuffer(n,null),this.bytesUsed=e,this.byteLength=e,this._setDebugData(null,0,e),this.props.handle?this.trackReferencedMemory(e,"Buffer"):this.trackAllocatedMemory(e),this}write(e,t=0){const n=ArrayBuffer.isView(e)?e:new Uint8Array(e),s=36663;this.gl.bindBuffer(s,this.handle),this.gl.bufferSubData(s,t,n),this.gl.bindBuffer(s,null),this._setDebugData(e,t,e.byteLength)}async mapAndWriteAsync(e,t=0,n=this.byteLength-t){const s=new ArrayBuffer(n);await e(s,"copied"),this.write(s,t)}async readAsync(e=0,t){return this.readSyncWebGL(e,t)}async mapAndReadAsync(e,t=0,n){const s=await this.readAsync(t,n);return await e(s.buffer,"copied")}readSyncWebGL(e=0,t){t=t??this.byteLength-e;const n=new Uint8Array(t),s=0;return this.gl.bindBuffer(36662,this.handle),this.gl.getBufferSubData(36662,e,n,s,t),this.gl.bindBuffer(36662,null),this._setDebugData(n,e,t),n}}function o3(i){return i&O.INDEX?34963:i&O.VERTEX?34962:i&O.UNIFORM?35345:34962}function a3(i){return i&O.INDEX||i&O.VERTEX?35044:i&O.UNIFORM?35048:35044}function c3(i){const e=i.split(/\r?\n/),t=[];for(const n of e){if(n.length<=1)continue;const s=n.trim(),r=n.split(":"),o=r[0]?.trim();if(r.length===2){const[h,g]=r;if(!h||!g){t.push({message:s,type:Pn(o||"info"),lineNum:0,linePos:0});continue}t.push({message:g.trim(),type:Pn(h),lineNum:0,linePos:0});continue}const[a,c,l,...u]=r;if(!a||!c||!l){t.push({message:r.slice(1).join(":").trim()||s,type:Pn(o||"info"),lineNum:0,linePos:0});continue}let f=parseInt(l,10);Number.isNaN(f)&&(f=0);let d=parseInt(c,10);Number.isNaN(d)&&(d=0),t.push({message:u.join(":").trim(),type:Pn(a),lineNum:f,linePos:d})}return t}function Pn(i){const e=["warning","error","info"],t=i.toLowerCase();return e.includes(t)?t:"info"}class l3 extends Ss{device;handle;_compilationInfoLog="";constructor(e,t){super(e,t),this.device=e;const n=this.props.handle;switch(this.props.stage){case"vertex":this.handle=n||this.device.gl.createShader(35633);break;case"fragment":this.handle=n||this.device.gl.createShader(35632);break;default:throw new Error(this.props.stage)}e._setWebGLDebugMetadata(this.handle,this,{spector:this.props});const s=this._compile(this.source);s&&typeof s.catch=="function"&&s.catch(()=>{this.compilationStatus="error"})}destroy(){this.handle&&(this.removeStats(),this.device.gl.deleteShader(this.handle),this.destroyed=!0,this.handle.destroyed=!0)}get asyncCompilationStatus(){return this._waitForCompilationComplete().then(()=>(this._getCompilationStatus(),this.compilationStatus))}async getCompilationInfo(){return await this._waitForCompilationComplete(),this.getCompilationInfoSync()}getCompilationInfoSync(){const e=this._getCompilationInfoLog();return e?c3(e):[]}getTranslatedSource(){return this.device.getExtension("WEBGL_debug_shaders").WEBGL_debug_shaders?.getTranslatedShaderSource(this.handle)||null}_compile(e){e=e.startsWith("#version ")?e:`#version 300 es
${e}`;const{gl:t}=this.device;if(t.shaderSource(this.handle,e),t.compileShader(this.handle),!this.device.props.debug){this.compilationStatus="pending";return}if(!this.device.features.has("compilation-status-async-webgl")){if(this._getCompilationStatus(),this.debugShader(),this.compilationStatus==="error")throw new Error(this._getCompilationErrorMessage(e));return}return P.once(1,"Shader compilation is asynchronous")(),this._waitForCompilationComplete().then(()=>{P.info(2,`Shader ${this.id} - async compilation complete: ${this.compilationStatus}`)(),this._getCompilationStatus(),this.debugShader()})}async _waitForCompilationComplete(){const e=async s=>await new Promise(r=>setTimeout(r,s));if(!this.device.features.has("compilation-status-async-webgl")){await e(10);return}const{gl:n}=this.device;for(;;){if(n.getShaderParameter(this.handle,37297))return;await e(10)}}_getCompilationStatus(){this.compilationStatus=this.device.gl.getShaderParameter(this.handle,35713)?"success":"error",this.compilationStatus==="error"&&this._getCompilationInfoLog()}_getCompilationErrorMessage(e){const t=`${this.props.stage} shader ${this.props.id}`,n=u3(this._getCompilationInfoLog()),s=this.getCompilationInfoSync(),r=s.find(u=>u.type==="error"&&u.message.trim())||s.find(u=>u.message.trim())||s.find(u=>u.type==="error")||s[0];if(!r)return n?`GLSL compilation errors in ${t}: ${n}`:`GLSL compilation errors in ${t}: WebGL did not provide a shader compiler log`;const o=r.lineNum?e.split(/\r?\n/)[r.lineNum-1]?.trim():void 0,a=r.lineNum?` line ${r.lineNum}`:"",c=o?`
Source: ${o}`:"",l=r.message.trim()||n||"WebGL did not provide a shader compiler log";return`GLSL compilation errors in ${t}:${a}: ${l}${c}`}_getCompilationInfoLog(){const e=this.device.gl.getShaderInfoLog(this.handle)?.trim();return e&&(this._compilationInfoLog=e),this._compilationInfoLog}}function u3(i){return i.split(/\r?\n/).find(e=>e.trim())?.trim()}function f3(i,e,t,n){if(p3(e))return n(i);const s=i;s.pushState();try{return d3(i,e),ri(s.gl,t),n(i)}finally{s.popState()}}function d3(i,e){const t=i,{gl:n}=t;if(e.cullMode)switch(e.cullMode){case"none":n.disable(2884);break;case"front":n.enable(2884),n.cullFace(1028);break;case"back":n.enable(2884),n.cullFace(1029);break}if(e.frontFace&&n.frontFace(ht("frontFace",e.frontFace,{ccw:2305,cw:2304})),e.unclippedDepth&&i.features.has("depth-clip-control")&&n.enable(34383),e.depthBias!==void 0&&(n.enable(32823),n.polygonOffset(e.depthBias,e.depthBiasSlopeScale||0)),e.provokingVertex&&i.features.has("provoking-vertex-webgl")){const r=t.getExtension("WEBGL_provoking_vertex").WEBGL_provoking_vertex,o=ht("provokingVertex",e.provokingVertex,{first:36429,last:36430});r?.provokingVertexWEBGL(o)}if((e.polygonMode||e.polygonOffsetLine)&&i.features.has("polygon-mode-webgl")){if(e.polygonMode){const r=t.getExtension("WEBGL_polygon_mode").WEBGL_polygon_mode,o=ht("polygonMode",e.polygonMode,{fill:6914,line:6913});r?.polygonModeWEBGL(1028,o),r?.polygonModeWEBGL(1029,o)}e.polygonOffsetLine&&n.enable(10754)}if(i.features.has("shader-clip-cull-distance-webgl")&&(e.clipDistance0&&n.enable(12288),e.clipDistance1&&n.enable(12289),e.clipDistance2&&n.enable(12290),e.clipDistance3&&n.enable(12291),e.clipDistance4&&n.enable(12292),e.clipDistance5&&n.enable(12293),e.clipDistance6&&n.enable(12294),e.clipDistance7&&n.enable(12295)),e.depthWriteEnabled!==void 0&&n.depthMask(g3("depthWriteEnabled",e.depthWriteEnabled)),e.depthCompare&&(e.depthCompare!=="always"?n.enable(2929):n.disable(2929),n.depthFunc(zo("depthCompare",e.depthCompare))),e.clearDepth!==void 0&&n.clearDepth(e.clearDepth),e.stencilWriteMask){const s=e.stencilWriteMask;n.stencilMaskSeparate(1028,s),n.stencilMaskSeparate(1029,s)}if(e.stencilReadMask&&P.warn("stencilReadMask not supported under WebGL"),e.stencilCompare){const s=e.stencilReadMask||4294967295,r=zo("depthCompare",e.stencilCompare);e.stencilCompare!=="always"?n.enable(2960):n.disable(2960),n.stencilFuncSeparate(1028,r,0,s),n.stencilFuncSeparate(1029,r,0,s)}if(e.stencilPassOperation&&e.stencilFailOperation&&e.stencilDepthFailOperation){const s=Rr("stencilPassOperation",e.stencilPassOperation),r=Rr("stencilFailOperation",e.stencilFailOperation),o=Rr("stencilDepthFailOperation",e.stencilDepthFailOperation);n.stencilOpSeparate(1028,r,o,s),n.stencilOpSeparate(1029,r,o,s)}switch(e.blend){case!0:n.enable(3042);break;case!1:n.disable(3042);break}if(e.blendColorOperation||e.blendAlphaOperation){const s=bu("blendColorOperation",e.blendColorOperation||"add"),r=bu("blendAlphaOperation",e.blendAlphaOperation||"add");n.blendEquationSeparate(s,r);const o=En("blendColorSrcFactor",e.blendColorSrcFactor||"one"),a=En("blendColorDstFactor",e.blendColorDstFactor||"zero"),c=En("blendAlphaSrcFactor",e.blendAlphaSrcFactor||"one"),l=En("blendAlphaDstFactor",e.blendAlphaDstFactor||"zero");n.blendFuncSeparate(o,a,c,l)}}function zo(i,e){return ht(i,e,{never:512,less:513,equal:514,"less-equal":515,greater:516,"not-equal":517,"greater-equal":518,always:519})}function Rr(i,e){return ht(i,e,{keep:7680,zero:0,replace:7681,invert:5386,"increment-clamp":7682,"decrement-clamp":7683,"increment-wrap":34055,"decrement-wrap":34056})}function bu(i,e){return ht(i,e,{add:32774,subtract:32778,"reverse-subtract":32779,min:32775,max:32776})}function En(i,e,t="color"){return ht(i,e,{one:1,zero:0,src:768,"one-minus-src":769,dst:774,"one-minus-dst":775,"src-alpha":770,"one-minus-src-alpha":771,"dst-alpha":772,"one-minus-dst-alpha":773,"src-alpha-saturated":776,constant:t==="color"?32769:32771,"one-minus-constant":t==="color"?32770:32772,src1:768,"one-minus-src1":769,"src1-alpha":770,"one-minus-src1-alpha":771})}function h3(i,e){return`Illegal parameter ${e} for ${i}`}function ht(i,e,t){if(!(e in t))throw new Error(h3(i,e));return t[e]}function g3(i,e){return e}function p3(i){let e=!0;for(const t in i){e=!1;break}return e}function Ph(i){const e={};return i.addressModeU&&(e[10242]=Or(i.addressModeU)),i.addressModeV&&(e[10243]=Or(i.addressModeV)),i.addressModeW&&(e[32882]=Or(i.addressModeW)),i.magFilter&&(e[10240]=No(i.magFilter)),(i.minFilter||i.mipmapFilter)&&(e[10241]=m3(i.minFilter||"linear",i.mipmapFilter)),i.lodMinClamp!==void 0&&(e[33082]=i.lodMinClamp),i.lodMaxClamp!==void 0&&(e[33083]=i.lodMaxClamp),i.type==="comparison-sampler"&&(e[34892]=34894),i.compare&&(e[34893]=zo("compare",i.compare)),i.maxAnisotropy&&(e[34046]=i.maxAnisotropy),e}function Or(i){switch(i){case"clamp-to-edge":return 33071;case"repeat":return 10497;case"mirror-repeat":return 33648}}function No(i){switch(i){case"nearest":return 9728;case"linear":return 9729}}function m3(i,e="none"){if(!e)return No(i);switch(e){case"none":return No(i);case"nearest":switch(i){case"nearest":return 9984;case"linear":return 9985}break;case"linear":switch(i){case"nearest":return 9986;case"linear":return 9987}}}class _3 extends ki{device;handle;parameters;constructor(e,t){super(e,t),this.device=e,this.parameters=Ph(t),this.handle=t.handle||this.device.gl.createSampler(),this._setSamplerParameters(this.parameters)}destroy(){this.handle&&(this.device.gl.deleteSampler(this.handle),this.handle=void 0)}toString(){return`Sampler(${this.id},${JSON.stringify(this.props)})`}_setSamplerParameters(e){for(const[t,n]of Object.entries(e)){const s=Number(t);switch(s){case 33082:case 33083:this.device.gl.samplerParameterf(this.handle,s,n);break;default:this.device.gl.samplerParameteri(this.handle,s,n);break}}}}function He(i,e,t){if(y3(e))return t(i);const{nocatch:n=!0}=e,s=dt.get(i);s.push(),ri(i,e);let r;if(n)r=t(i),s.pop();else try{r=t(i)}finally{s.pop()}return r}function y3(i){for(const e in i)return!1;return!0}class Nt extends Es{device;gl;handle;texture;constructor(e,t){super(e,{...k.defaultProps,...t}),this.device=e,this.gl=this.device.gl,this.handle=null,this.texture=t.texture}}function Eh(i){return b3[i]}const b3={5124:"sint32",5125:"uint32",5122:"sint16",5123:"uint16",5120:"sint8",5121:"uint8",5126:"float32",5131:"float16",33635:"uint16",32819:"uint16",32820:"uint16",33640:"uint32",35899:"uint32",35902:"uint32",34042:"uint32",36269:"uint32"};class Li extends k{device;gl;handle;sampler=void 0;view;glTarget;glFormat;glType;glInternalFormat;compressed;_textureUnit=0;_framebuffer=null;_framebufferAttachmentKey=null;constructor(e,t){super(e,t,{byteAlignment:1}),this.device=e,this.gl=this.device.gl;const n=xh(this.props.format);if(this.glTarget=x3(this.props.dimension),this.glInternalFormat=n.internalFormat,this.glFormat=n.format,this.glType=n.type,this.compressed=n.compressed,this.isHandleBorrowed&&this.props.handle===void 0)throw new Error("Borrowed WebGL textures require a texture handle");if(this.handle=this.props.handle||this.gl.createTexture(),this.device._setWebGLDebugMetadata(this.handle,this,{spector:this.props}),!this.isHandleBorrowed){this.gl.bindTexture(this.glTarget,this.handle);const{dimension:s,width:r,height:o,depth:a,mipLevels:c,glTarget:l,glInternalFormat:u}=this;if(!this.compressed)switch(s){case"2d":case"cube":this.gl.texStorage2D(l,c,u,r,o);break;case"2d-array":case"3d":this.gl.texStorage3D(l,c,u,r,o,a);break;default:throw new Error(s)}this.gl.bindTexture(this.glTarget,null),this._initializeData(t.data)}this.ownsHandle?this.trackAllocatedMemory(this.getAllocatedByteLength(),"Texture"):this.trackReferencedMemory(this.getAllocatedByteLength(),"Texture"),this.isHandleBorrowed||this.setSampler(this.props.sampler),this.view=new Nt(this.device,{...this.props,texture:this}),Object.seal(this)}destroy(){this.handle&&(this._framebuffer?.destroy(),this._framebuffer=null,this._framebufferAttachmentKey=null,this.removeStats(),this.ownsHandle?(this.gl.deleteTexture(this.handle),this.trackDeallocatedMemory("Texture")):this.trackDeallocatedReferencedMemory("Texture"),this.destroyed=!0)}createView(e){return new Nt(this.device,{...e,texture:this})}clone(e){if(this.isHandleBorrowed&&e&&(e.width!==this.width||e.height!==this.height))throw new Error(`Cannot resize borrowed read-only ${this}`);return super.clone(e)}setSampler(e={}){this._assertWritable("set sampler parameters on"),super.setSampler(e);const t=Ph(this.sampler.props);this._setSamplerParameters(t)}copyExternalImage(e){this._assertWritable("copy external image data into");const t=this._normalizeCopyExternalImageOptions(e);if(t.sourceX||t.sourceY)throw new Error("WebGL does not support sourceX/sourceY)");const{glFormat:n,glType:s}=this,{image:r,depth:o,mipLevel:a,x:c,y:l,z:u,width:f,height:d}=t,h=ui(this.glTarget,this.dimension,u),g=t.flipY?{37440:!0}:{};return this.gl.bindTexture(this.glTarget,this.handle),He(this.gl,g,()=>{switch(this.dimension){case"2d":case"cube":this.gl.texSubImage2D(h,a,c,l,f,d,n,s,r);break;case"2d-array":case"3d":this.gl.texSubImage3D(h,a,c,l,u,f,d,o,n,s,r);break;default:}}),this.gl.bindTexture(this.glTarget,null),{width:t.width,height:t.height}}copyElementImage(e){this._assertWritable("copy element image data into");const t=this._normalizeCopyElementImageOptions(e),{glFormat:n}=this,{element:s,depth:r,mipLevel:o,sourceX:a,sourceY:c,sourceWidth:l,sourceHeight:u,x:f,y:d,z:h,width:g,height:p}=t,m=ui(this.glTarget,this.dimension,h),_=t.flipY?{37440:!0}:{},b=this.gl;if(r!==1||this.dimension!=="2d"&&this.dimension!=="cube")throw new Error(`${this} copyElementImage only supports 2d and cube textures on WebGL`);if(o!==0||f!==0||d!==0)throw new Error(`${this} copyElementImage only supports full base-level uploads on WebGL`);if(typeof b.texElementImage2D!="function")throw new Error(`${this} copyElementImage is not supported by this WebGL implementation`);return this.gl.bindTexture(this.glTarget,this.handle),He(this.gl,_,()=>{b.texElementImage2D?.(m,n,s,{sx:a,sy:c,swidth:l??g,sheight:u??p,width:g,height:p})}),this.gl.bindTexture(this.glTarget,null),{width:t.width,height:t.height}}copyImageData(e){super.copyImageData(e)}readBuffer(e={},t){if(!t)throw new Error(`${this} readBuffer requires a destination buffer`);const n=this._getSupportedColorReadOptions(e),s=e.byteOffset??0,r=this.computeMemoryLayout(n);if(t.byteLength<s+r.byteLength)throw new Error(`${this} readBuffer target is too small (${t.byteLength} < ${s+r.byteLength})`);const o=t;this.gl.bindBuffer(35051,o.handle);try{this._readColorTextureLayers(n,r,a=>{this.gl.readPixels(n.x,n.y,n.width,n.height,this.glFormat,this.glType,s+a)})}finally{this.gl.bindBuffer(35051,null)}return t}async readDataAsync(e={}){throw new Error(`${this} readDataAsync is deprecated; use readBuffer() with an explicit destination buffer or DynamicTexture.readAsync()`)}writeBuffer(e,t={}){this._assertWritable("write buffer data into");const n=this._normalizeTextureWriteOptions(t),{width:s,height:r,depthOrArrayLayers:o,mipLevel:a,byteOffset:c,x:l,y:u,z:f}=n,{glFormat:d,glType:h,compressed:g}=this,p=ui(this.glTarget,this.dimension,f);if(g)throw new Error("writeBuffer for compressed textures is not implemented in WebGL");const{bytesPerPixel:m}=this.device.getTextureFormatInfo(this.format),_=m?n.bytesPerRow/m:void 0,b={3317:this.byteAlignment,..._!==void 0?{3314:_}:{},32878:n.rowsPerImage};this.gl.bindTexture(this.glTarget,this.handle),this.gl.bindBuffer(35052,e.handle),He(this.gl,b,()=>{switch(this.dimension){case"2d":case"cube":this.gl.texSubImage2D(p,a,l,u,s,r,d,h,c);break;case"2d-array":case"3d":this.gl.texSubImage3D(p,a,l,u,f,s,r,o,d,h,c);break;default:}}),this.gl.bindBuffer(35052,null),this.gl.bindTexture(this.glTarget,null)}writeData(e,t={}){this._assertWritable("write data into");const n=this._normalizeTextureWriteOptions(t),s=ArrayBuffer.isView(e)?e:new Uint8Array(e),{width:r,height:o,depthOrArrayLayers:a,mipLevel:c,x:l,y:u,z:f,byteOffset:d}=n,{glFormat:h,glType:g,compressed:p}=this,m=ui(this.glTarget,this.dimension,f);let _;if(!p){const{bytesPerPixel:S}=this.device.getTextureFormatInfo(this.format);S&&(_=n.bytesPerRow/S)}const b=this.compressed?{}:{3317:this.byteAlignment,..._!==void 0?{3314:_}:{},32878:n.rowsPerImage},y=w3(s,d),v=p?v3(s,d):s,w=this._getMipLevelSize(c),x=l===0&&u===0&&f===0&&r===w.width&&o===w.height&&a===w.depthOrArrayLayers;this.gl.bindTexture(this.glTarget,this.handle),this.gl.bindBuffer(35052,null),He(this.gl,b,()=>{switch(this.dimension){case"2d":case"cube":p?x?this.gl.compressedTexImage2D(m,c,h,r,o,0,v):this.gl.compressedTexSubImage2D(m,c,l,u,r,o,h,v):this.gl.texSubImage2D(m,c,l,u,r,o,h,g,s,y);break;case"2d-array":case"3d":p?x?this.gl.compressedTexImage3D(m,c,h,r,o,a,0,v):this.gl.compressedTexSubImage3D(m,c,l,u,f,r,o,a,h,v):this.gl.texSubImage3D(m,c,l,u,f,r,o,a,h,g,s,y);break;default:}}),this.gl.bindTexture(this.glTarget,null)}_getRowByteAlignment(e,t){return 1}_getFramebuffer(){return this._framebuffer||=this.device.createFramebuffer({id:`framebuffer-for-${this.id}`,width:this.width,height:this.height,colorAttachments:[this]}),this._framebuffer}readDataSyncWebGL(e={}){const t=this._getSupportedColorReadOptions(e),n=this.computeMemoryLayout(t),s=Eh(this.glType),r=oa(s),o=new r(n.byteLength/r.BYTES_PER_ELEMENT);return this._readColorTextureLayers(t,n,a=>{const c=new r(o.buffer,o.byteOffset+a,n.bytesPerImage/r.BYTES_PER_ELEMENT);this.gl.readPixels(t.x,t.y,t.width,t.height,this.glFormat,this.glType,c)}),o.buffer}_readColorTextureLayers(e,t,n){const s=this._getFramebuffer(),r=t.bytesPerRow/t.bytesPerPixel,o={3333:this.byteAlignment,...r!==e.width?{3330:r}:{}},a=this.gl.getParameter(3074),c=this.gl.bindFramebuffer(36160,s.handle);try{this.gl.readBuffer(36064),He(this.gl,o,()=>{for(let l=0;l<e.depthOrArrayLayers;l++)this._attachReadSubresource(s,e.mipLevel,e.z+l),n(l*t.bytesPerImage)})}finally{this.gl.bindFramebuffer(36160,c||null),this.gl.readBuffer(a)}}_attachReadSubresource(e,t,n){const s=`${t}:${n}`;if(this._framebufferAttachmentKey!==s){switch(this.dimension){case"2d":this.gl.framebufferTexture2D(36160,36064,3553,this.handle,t);break;case"cube":this.gl.framebufferTexture2D(36160,36064,ui(this.glTarget,this.dimension,n),this.handle,t);break;case"2d-array":case"3d":this.gl.framebufferTextureLayer(36160,36064,this.handle,t,n);break;default:throw new Error(`${this} color readback does not support ${this.dimension} textures`)}if(this.device.props.debug){const r=Number(this.gl.checkFramebufferStatus(36160));if(r!==36053)throw new Error(`${e} incomplete for ${this} readback (${r})`)}this._framebufferAttachmentKey=s}}generateMipmapsWebGL(e){if(this._assertWritable("generate mipmaps for"),!(!(this.device.isTextureFormatRenderable(this.props.format)&&this.device.isTextureFormatFilterable(this.props.format))&&(P.warn(`${this} is not renderable or filterable, may not be able to generate mipmaps`)(),!e?.force)))try{this.gl.bindTexture(this.glTarget,this.handle),this.gl.generateMipmap(this.glTarget)}catch(n){P.warn(`Error generating mipmap for ${this}: ${n.message}`)()}finally{this.gl.bindTexture(this.glTarget,null)}}_setSamplerParameters(e){P.level>=2&&P.log(2,`${this.id} sampler parameters`,this.device.getGLKeys(e))(),this.gl.bindTexture(this.glTarget,this.handle);for(const[t,n]of Object.entries(e)){const s=Number(t),r=n;switch(s){case 33082:case 33083:this.gl.texParameterf(this.glTarget,s,r);break;case 10240:case 10241:this.gl.texParameteri(this.glTarget,s,r);break;case 10242:case 10243:case 32882:this.gl.texParameteri(this.glTarget,s,r);break;case 34046:this.device.features.has("texture-filterable-anisotropic-webgl")&&this.gl.texParameteri(this.glTarget,s,r);break;case 34892:case 34893:this.gl.texParameteri(this.glTarget,s,r);break}}this.gl.bindTexture(this.glTarget,null)}_getActiveUnit(){return this.gl.getParameter(34016)-33984}_bind(e){const{gl:t}=this;return e!==void 0&&(this._textureUnit=e,t.activeTexture(33984+e)),t.bindTexture(this.glTarget,this.handle),e}_unbind(e){const{gl:t}=this;return e!==void 0&&(this._textureUnit=e,t.activeTexture(33984+e)),t.bindTexture(this.glTarget,null),e}_assertWritable(e){if(this.isHandleBorrowed)throw new Error(`Cannot ${e} borrowed read-only ${this}`)}}function v3(i,e=0){return e?new i.constructor(i.buffer,i.byteOffset+e,(i.byteLength-e)/i.BYTES_PER_ELEMENT):i}function w3(i,e){if(e%i.BYTES_PER_ELEMENT!==0)throw new Error(`Texture byteOffset ${e} must align to typed array element size ${i.BYTES_PER_ELEMENT}`);return e/i.BYTES_PER_ELEMENT}function x3(i){switch(i){case"1d":break;case"2d":return 3553;case"3d":return 32879;case"cube":return 34067;case"2d-array":return 35866}throw new Error(i)}function ui(i,e,t){return e==="cube"?34069+t:i}function P3(i,e,t,n){const s=i;let r=n;r===!0&&(r=1),r===!1&&(r=0);const o=typeof r=="number"?[r]:r;switch(t){case 35678:case 35680:case 35679:case 35682:case 36289:case 36292:case 36293:case 36298:case 36299:case 36300:case 36303:case 36306:case 36307:case 36308:case 36311:if(typeof n!="number")throw new Error("samplers must be set to integers");return i.uniform1i(e,n);case 5126:return i.uniform1fv(e,o);case 35664:return i.uniform2fv(e,o);case 35665:return i.uniform3fv(e,o);case 35666:return i.uniform4fv(e,o);case 5124:return i.uniform1iv(e,o);case 35667:return i.uniform2iv(e,o);case 35668:return i.uniform3iv(e,o);case 35669:return i.uniform4iv(e,o);case 35670:return i.uniform1iv(e,o);case 35671:return i.uniform2iv(e,o);case 35672:return i.uniform3iv(e,o);case 35673:return i.uniform4iv(e,o);case 5125:return s.uniform1uiv(e,o,1);case 36294:return s.uniform2uiv(e,o,2);case 36295:return s.uniform3uiv(e,o,3);case 36296:return s.uniform4uiv(e,o,4);case 35674:return i.uniformMatrix2fv(e,!1,o);case 35675:return i.uniformMatrix3fv(e,!1,o);case 35676:return i.uniformMatrix4fv(e,!1,o);case 35685:return s.uniformMatrix2x3fv(e,!1,o);case 35686:return s.uniformMatrix2x4fv(e,!1,o);case 35687:return s.uniformMatrix3x2fv(e,!1,o);case 35688:return s.uniformMatrix3x4fv(e,!1,o);case 35689:return s.uniformMatrix4x2fv(e,!1,o);case 35690:return s.uniformMatrix4x3fv(e,!1,o)}throw new Error("Illegal uniform")}function E3(i){return L3[i]}function Za(i){return T3[i]}function Sh(i){return!!Th[i]}function S3(i){return Th[i]}const T3={5126:"f32",35664:"vec2<f32>",35665:"vec3<f32>",35666:"vec4<f32>",5124:"i32",35667:"vec2<i32>",35668:"vec3<i32>",35669:"vec4<i32>",5125:"u32",36294:"vec2<u32>",36295:"vec3<u32>",36296:"vec4<u32>",35670:"f32",35671:"vec2<f32>",35672:"vec3<f32>",35673:"vec4<f32>",35674:"mat2x2<f32>",35685:"mat2x3<f32>",35686:"mat2x4<f32>",35687:"mat3x2<f32>",35675:"mat3x3<f32>",35688:"mat3x4<f32>",35689:"mat4x2<f32>",35690:"mat4x3<f32>",35676:"mat4x4<f32>"},Th={35678:{viewDimension:"2d",sampleType:"float"},35680:{viewDimension:"cube",sampleType:"float"},35679:{viewDimension:"3d",sampleType:"float"},35682:{viewDimension:"3d",sampleType:"depth"},36289:{viewDimension:"2d-array",sampleType:"float"},36292:{viewDimension:"2d-array",sampleType:"depth"},36293:{viewDimension:"cube",sampleType:"float"},36298:{viewDimension:"2d",sampleType:"sint"},36299:{viewDimension:"3d",sampleType:"sint"},36300:{viewDimension:"cube",sampleType:"sint"},36303:{viewDimension:"2d-array",sampleType:"uint"},36306:{viewDimension:"2d",sampleType:"uint"},36307:{viewDimension:"3d",sampleType:"uint"},36308:{viewDimension:"cube",sampleType:"uint"},36311:{viewDimension:"2d-array",sampleType:"uint"}},L3={uint8:5121,sint8:5120,unorm8:5121,snorm8:5120,uint16:5123,sint16:5122,unorm16:5123,snorm16:5122,uint32:5125,sint32:5124,float16:5131,float32:5126};function C3(i,e,t={}){const n={attributes:[],bindings:[]};n.attributes=A3(i,e);const s=R3(i,e,t);for(const c of s){const l=c.uniforms.map(u=>({name:u.name,format:u.format,byteOffset:u.byteOffset,byteStride:u.byteStride,arrayLength:u.arrayLength}));n.bindings.push({type:"uniform",name:c.name,group:0,location:c.location,visibility:(c.vertex?1:0)|(c.fragment?2:0),minBindingSize:c.byteLength,uniforms:l})}const r=I3(i,e);let o=0;for(const c of r)if(Sh(c.type)){const{viewDimension:l,sampleType:u}=S3(c.type);n.bindings.push({type:"texture",name:c.name,group:0,location:o,viewDimension:l,sampleType:u}),c.textureUnit=o,o+=1}r.length&&(n.uniforms=r);const a=M3(i,e);return a?.length&&(n.varyings=a),n}function A3(i,e){const t=[],n=i.getProgramParameter(e,35721);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s);if(!r)throw new Error("activeInfo");const{name:o,type:a}=r,c=i.getAttribLocation(e,o);if(c>=0){const l=Za(a),u=/instance/i.test(o)?"instance":"vertex";t.push({name:o,location:c,stepMode:u,type:l})}}return t.sort((s,r)=>s.location-r.location),t}function M3(i,e){const t=[],n=i.getProgramParameter(e,35971);for(let s=0;s<n;s++){const r=i.getTransformFeedbackVarying(e,s);if(!r)throw new Error("activeInfo");const{name:o,type:a,size:c}=r,l=Za(a),{type:u,components:f}=ba(l);t.push({location:s,name:o,type:u,size:c*f})}return t.sort((s,r)=>s.location-r.location),t}function I3(i,e){const t=[],n=i.getProgramParameter(e,35718);for(let s=0;s<n;s++){const r=i.getActiveUniform(e,s);if(!r)throw new Error("activeInfo");const{name:o,size:a,type:c}=r,{name:l,isArray:u}=N3(o);let f=i.getUniformLocation(e,l);const d={location:f,name:l,size:a,type:c,isArray:u};if(t.push(d),d.size>1)for(let h=0;h<d.size;h++){const g=`${l}[${h}]`;f=i.getUniformLocation(e,g);const p={...d,name:g,location:f};t.push(p)}}return t}function R3(i,e,t){const n=[],s=B3(i,e,t);for(const[o,a]of s){n.push(a);try{const c=vu(i,e,o,a.name);O3(c,a)}catch(c){const l=c instanceof Error?c.message:String(c);P.once(0,`WebGL uniform block reflection failed for "${a.name}"; using supplied std140 metadata. ${l}`)()}}const r=i.getProgramParameter(e,35382);if(!Number.isInteger(r)||r<0)throw new Error(`Failed to reflect WebGL uniform blocks: ACTIVE_UNIFORM_BLOCKS returned ${String(r)}`);for(let o=0;o<r;o++)s.has(o)||n.push(vu(i,e,o));return n.sort((o,a)=>o.location-a.location),n}function O3(i,e){for(const t of i.uniforms){const n=e.uniforms.find(s=>t.name===s.name||t.name.endsWith(`.${s.name}`));if(!n)throw new Error(`Failed to validate WebGL uniform block "${e.name}": reflected unexpected member "${t.name}"`);if(t.format!==n.format||t.arrayLength!==n.arrayLength||t.byteOffset!==n.byteOffset||t.byteStride!==n.byteStride)throw new Error(`Failed to validate WebGL uniform block "${e.name}": reflected layout for "${t.name}" does not match supplied std140 metadata`)}}function B3(i,e,t){const n=new Map;for(const r of t.uniformBlockLayouts||[])n.set(r.name,D3(r));for(const r of t.shaderLayout?.bindings||[])z3(r)&&n.set(r.name,r);const s=new Map;for(const r of n.values()){const o=k3(i,e,r.name);if(!o)continue;const{blockIndex:a,blockName:c}=o;if(s.has(a))throw new Error(`Multiple supplied uniform block layouts resolve to active WebGL block "${c}"`);s.set(a,{name:c,location:a,byteLength:r.minBindingSize,vertex:!!(r.visibility&&r.visibility&1),fragment:!!(r.visibility&&r.visibility&2),uniformCount:r.uniforms.length,uniforms:r.uniforms.map(l=>({...l}))})}return s}function k3(i,e,t){const n=t.endsWith("Uniforms")?[t,t.slice(0,-8)]:[t,`${t}Uniforms`];for(const s of n){const r=i.getUniformBlockIndex(e,s);if(r!==4294967295){if(!Number.isInteger(r)||r<0)throw new Error(`Failed to resolve WebGL uniform block "${s}": getUniformBlockIndex returned ${String(r)}`);return{blockIndex:r,blockName:s}}}return null}function vu(i,e,t,n){const s=n||i.getActiveUniformBlockName(e,t);if(!s)throw new Error(`Failed to reflect WebGL uniform block at index ${t}: missing block name`);const r=(y,v)=>{const w=i.getActiveUniformBlockParameter(e,t,y);if(w==null)throw new Error(`Failed to reflect WebGL uniform block "${s}": ${v} returned null`);return w},o=st(r(35391,"UNIFORM_BLOCK_BINDING"),s,"UNIFORM_BLOCK_BINDING",0),a=st(r(35392,"UNIFORM_BLOCK_DATA_SIZE"),s,"UNIFORM_BLOCK_DATA_SIZE",0),c=st(r(35394,"UNIFORM_BLOCK_ACTIVE_UNIFORMS"),s,"UNIFORM_BLOCK_ACTIVE_UNIFORMS",0),l=Lh(r(35395,"UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES"),s,"UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES",c),u=fi(i,e,l,35383,"UNIFORM_TYPE",s,c),f=fi(i,e,l,35384,"UNIFORM_SIZE",s,c),d=fi(i,e,l,35386,"UNIFORM_BLOCK_INDEX",s,c),h=fi(i,e,l,35387,"UNIFORM_OFFSET",s,c),g=fi(i,e,l,35388,"UNIFORM_ARRAY_STRIDE",s,c),p=[];for(let y=0;y<c;y++){if(d[y]!==t)throw new Error(`Failed to reflect WebGL uniform block "${s}": active uniform index ${l[y]} belongs to block ${d[y]}, expected ${t}`);const v=l[y],w=i.getActiveUniform(e,v);if(!w)throw new Error(`Failed to reflect WebGL uniform block "${s}": getActiveUniform(${v}) returned null`);const x=st(u[y],s,`UNIFORM_TYPE[${y}]`,1),S=st(f[y],s,`UNIFORM_SIZE[${y}]`,1),T=st(h[y],s,`UNIFORM_OFFSET[${y}]`,0),L=st(g[y],s,`UNIFORM_ARRAY_STRIDE[${y}]`,0);if(w.type!==x||w.size!==S)throw new Error(`Failed to reflect WebGL uniform block "${s}": getActiveUniform(${v}) disagrees with getActiveUniforms`);p.push({name:w.name,format:Za(x),arrayLength:S,byteOffset:T,byteStride:L})}const m={name:s,location:o,byteLength:a,vertex:!!r(35396,"UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER"),fragment:!!r(35398,"UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER"),uniformCount:c,uniforms:p},_=new Set(m.uniforms.map(y=>y.name.split(".")[0]).filter(y=>!!y)),b=m.name.replace(/Uniforms$/,"");if(_.size===1&&!_.has(m.name)&&!_.has(b)){const[y]=_;P.warn(`Uniform block "${m.name}" uses GLSL instance "${y}". luma.gl binds uniform buffers by block name ("${m.name}") and alias ("${b}"). Prefer matching the instance name to one of those to avoid confusing silent mismatches.`)()}return m}function fi(i,e,t,n,s,r,o){const a=i.getActiveUniforms(e,t,n);if(a===null)throw new Error(`Failed to reflect WebGL uniform block "${r}": ${s} returned null`);return Lh(a,r,s,o)}function Lh(i,e,t,n){if(!Array.isArray(i)&&!ArrayBuffer.isView(i))throw new Error(`Failed to reflect WebGL uniform block "${e}": ${t} returned a non-array value`);const s=Array.from(i);if(s.length!==n||s.some(r=>!Number.isInteger(r)))throw new Error(`Failed to reflect WebGL uniform block "${e}": ${t} returned ${s.length} invalid values, expected ${n}`);return s}function st(i,e,t,n){if(!Number.isInteger(i)||i<n)throw new Error(`Failed to reflect WebGL uniform block "${e}": ${t} returned ${String(i)}`);return i}function D3(i){const e=wa(i.uniformTypes,{layout:"std140"}),t=F3(i.uniformTypes,e.fields);return{type:"uniform",name:i.name,group:0,location:0,minBindingSize:e.byteLength,uniforms:t}}function F3(i,e){const t=[],n=(r,o)=>{if(typeof o=="string"){const a=e[r];if(!a)throw new Error(`Missing std140 layout field ${r}`);t.push({name:r,format:a.shaderType,arrayLength:1,byteOffset:a.offset*4,byteStride:0});return}if(Array.isArray(o)){s(r,o[0],o[1]);return}for(const[a,c]of Object.entries(o))n(`${r}.${a}`,c)},s=(r,o,a)=>{if(typeof o=="string"){const c=e[`${r}[0]`],l=a>1?e[`${r}[1]`]:void 0;if(!c)throw new Error(`Missing std140 array layout field ${r}[0]`);t.push({name:`${r}[0]`,format:c.shaderType,arrayLength:a,byteOffset:c.offset*4,byteStride:l?(l.offset-c.offset)*4:0});return}if(Array.isArray(o))throw new Error(`Nested uniform arrays are not supported for ${r}`);for(const[c,l]of Object.entries(o)){if(typeof l!="string")throw new Error(`Composite uniform array members are not supported for ${r}`);const u=`${r}[0].${c}`,f=`${r}[1].${c}`,d=e[u],h=a>1?e[f]:void 0;if(!d)throw new Error(`Missing std140 array layout field ${u}`);t.push({name:u,format:d.shaderType,arrayLength:a,byteOffset:d.offset*4,byteStride:h?(h.offset-d.offset)*4:0})}};for(const[r,o]of Object.entries(i))n(r,o);return t}function z3(i){return i.type==="uniform"&&Number.isInteger(i.minBindingSize)&&i.minBindingSize>=0&&Array.isArray(i.uniforms)&&i.uniforms.every(e=>typeof e.name=="string"&&typeof e.format=="string"&&Number.isInteger(e.arrayLength)&&e.arrayLength>0&&Number.isInteger(e.byteOffset)&&e.byteOffset>=0&&Number.isInteger(e.byteStride)&&e.byteStride>=0)}function N3(i){if(i[i.length-1]!=="]")return{name:i,length:1,isArray:!1};const t=/([^[]*)(\[[0-9]+\])?/.exec(i);return{name:Xn(t?.[1],`Failed to parse GLSL uniform name ${i}`),length:t?.[2]?1:0,isArray:!!t?.[2]}}class $3 extends Ye{device;handle;vs;fs;introspectedLayout;bindings={};uniforms={};varyings=null;_uniformCount=0;_uniformSetters={};get[Symbol.toStringTag](){return"WEBGLRenderPipeline"}constructor(e,t){super(e,t),this.device=e;const n=this.sharedRenderPipeline||this.device._createSharedRenderPipelineWebGL(t);this.sharedRenderPipeline=n,this.handle=n.handle,this.vs=n.vs,this.fs=n.fs,this.linkStatus=n.linkStatus,this.introspectedLayout=C3(this.device.gl,this.handle,{uniformBlockLayouts:t._uniformBlockLayouts,shaderLayout:t.shaderLayout}),this.device._setWebGLDebugMetadata(this.handle,this,{spector:{id:this.props.id}}),this.shaderLayout=t.shaderLayout?U3(this.introspectedLayout,t.shaderLayout):this.introspectedLayout}destroy(){this.destroyed||(this.sharedRenderPipeline&&!this.props._sharedRenderPipeline&&this.sharedRenderPipeline.destroy(),this.destroyResource())}setBindings(e,t){const n=po(da(this.shaderLayout,e));for(const[s,r]of Object.entries(n)){const o=Ch(this.shaderLayout,s);if(o){switch(r||P.warn(`Unsetting binding "${s}" in render pipeline "${this.id}"`)(),o.type){case"uniform":if(!(r instanceof Ti)&&!(r.buffer instanceof Ti))throw new Error("buffer value");break;case"texture":if(!(r instanceof Nt||r instanceof Li||r instanceof Si))throw new Error(`${this} Bad texture binding for ${s}`);break;case"sampler":P.warn(`Ignoring sampler ${s}`)();break;default:throw new Error(o.type)}this.bindings[s]=r}else{const a=this.shaderLayout.bindings.map(c=>`"${c.name}"`).join(", ");t?.disableWarnings||P.warn(`No binding "${s}" in render pipeline "${this.id}", expected one of ${a}`,r)()}}}draw(e){const t=e.renderPass,n=e.bindGroups?po(e.bindGroups):e.bindings||this.bindings;return t.setPipeline(this),t.setBindings(n),t.setVertexArray(e.vertexArray),t.draw({parameters:e.parameters,topology:e.topology,isInstanced:e.isInstanced,vertexCount:e.vertexCount,indexCount:e.indexCount,instanceCount:e.instanceCount,firstVertex:e.firstVertex,firstIndex:e.firstIndex,firstInstance:e.firstInstance,baseVertex:e.baseVertex,transformFeedback:e.transformFeedback,uniforms:e.uniforms})}_areTexturesRenderable(e){let t=!0;for(const n of this.shaderLayout.bindings)wu(e,n.name)||(P.warn(`Binding ${n.name} not found in ${this.id}`)(),t=!1);return t}_applyBindings(e,t){if(this._syncLinkStatus(),this.linkStatus!=="success")return;const{gl:n}=this.device;n.useProgram(this.handle);let s=0,r=0;for(const o of this.shaderLayout.bindings){const a=wu(e,o.name);if(!a)throw new Error(`No value for binding ${o.name} in ${this.id}`);switch(o.type){case"uniform":const{name:c}=o,l=n.getUniformBlockIndex(this.handle,c);if(l===4294967295)throw new Error(`Invalid uniform block name ${c}`);if(n.uniformBlockBinding(this.handle,l,r),a instanceof Ti)n.bindBufferBase(35345,r,a.handle);else{const f=a;n.bindBufferRange(35345,r,f.buffer.handle,f.offset||0,f.size||f.buffer.byteLength-(f.offset||0))}r+=1;break;case"texture":if(!(a instanceof Nt||a instanceof Li||a instanceof Si))throw new Error("texture");let u;if(a instanceof Nt)u=a.texture;else if(a instanceof Li)u=a;else if(a instanceof Si&&a.colorAttachments[0]instanceof Nt)P.warn("Passing framebuffer in texture binding may be deprecated. Use fbo.colorAttachments[0] instead")(),u=a.colorAttachments[0].texture;else throw new Error("No texture");n.activeTexture(33984+s),n.bindTexture(u.glTarget,u.handle),s+=1;break;case"sampler":break;case"storage":case"read-only-storage":throw new Error(`binding type '${o.type}' not supported in WebGL`)}}}_applyUniforms(e){for(const t of this.shaderLayout.uniforms||[]){const{name:n,location:s,type:r,textureUnit:o}=t,a=e[n]??o;a!==void 0&&P3(this.device.gl,s,r,a)}}_syncLinkStatus(){this.linkStatus=this.sharedRenderPipeline.linkStatus}}function U3(i,e){const t={...i,attributes:i.attributes.map(n=>({...n})),bindings:i.bindings.map(n=>({...n}))};for(const n of e?.attributes||[]){const s=t.attributes.find(r=>r.name===n.name);s?(s.type=n.type||s.type,s.stepMode=n.stepMode||s.stepMode):P.warn(`shader layout attribute ${n.name} not present in shader`)}for(const n of e?.bindings||[]){const s=Ch(t,n.name);if(!s){P.warn(`shader layout binding ${n.name} not present in shader`);continue}Object.assign(s,n)}return t}function Ch(i,e){return i.bindings.find(t=>t.name===e||t.name===`${e}Uniforms`||`${t.name}Uniforms`===e)}function wu(i,e){return i[e]||i[`${e}Uniforms`]||i[e.replace(/Uniforms$/,"")]}const xu=4;class G3 extends Qy{device;handle;vs;fs;linkStatus="pending";constructor(e,t){super(e,t),this.device=e,this.handle=t.handle||this.device.gl.createProgram(),this.vs=t.vs,this.fs=t.fs,t.varyings&&t.varyings.length>0&&this.device.gl.transformFeedbackVaryings(this.handle,t.varyings,t.bufferMode||35981),this._linkShaders()}destroy(){this.destroyed||(this.device.gl.useProgram(null),this.device.gl.deleteProgram(this.handle),this.handle.destroyed=!0,this.destroyResource())}async _linkShaders(){const{gl:e}=this.device;if(e.attachShader(this.handle,this.vs.handle),e.attachShader(this.handle,this.fs.handle),P.time(xu,`linkProgram for ${this.id}`)(),e.linkProgram(this.handle),P.timeEnd(xu,`linkProgram for ${this.id}`)(),!this.device.features.has("compilation-status-async-webgl")){const n=this._getLinkStatus();this._reportLinkStatus(n);return}P.once(1,"RenderPipeline linking is asynchronous")(),await this._waitForLinkComplete(),P.info(2,`RenderPipeline ${this.id} - async linking complete: ${this.linkStatus}`)();const t=this._getLinkStatus();this._reportLinkStatus(t)}async _reportLinkStatus(e){switch(e){case"success":return;default:const t=e==="link-error"?"Link error":"Validation error";switch(this.vs.compilationStatus){case"error":throw this.vs.debugShader(),new Error(`${this} ${t} during compilation of ${this.vs}`);case"pending":await this.vs.asyncCompilationStatus,this.vs.debugShader();break}switch(this.fs?.compilationStatus){case"error":throw this.fs.debugShader(),new Error(`${this} ${t} during compilation of ${this.fs}`);case"pending":await this.fs.asyncCompilationStatus,this.fs.debugShader();break}const n=this.device.gl.getProgramInfoLog(this.handle);this.device.reportError(new Error(`${t} during ${e}: ${n}`),this)(),this.device.debug()}}_getLinkStatus(){const{gl:e}=this.device;return e.getProgramParameter(this.handle,35714)?(this._initializeSamplerUniforms(),e.validateProgram(this.handle),e.getProgramParameter(this.handle,35715)?(this.linkStatus="success","success"):(this.linkStatus="error","validation-error")):(this.linkStatus="error","link-error")}_initializeSamplerUniforms(){const{gl:e}=this.device;e.useProgram(this.handle);let t=0;const n=e.getProgramParameter(this.handle,35718);for(let s=0;s<n;s++){const r=e.getActiveUniform(this.handle,s);if(r&&Sh(r.type)){const o=r.name.endsWith("[0]"),a=o?r.name.slice(0,-3):r.name,c=e.getUniformLocation(this.handle,a);c!==null&&(t=this._assignSamplerUniform(c,r,o,t))}}}_assignSamplerUniform(e,t,n,s){const{gl:r}=this.device;if(n&&t.size>1){const o=Int32Array.from({length:t.size},(a,c)=>s+c);return r.uniform1iv(e,o),s+t.size}return r.uniform1i(e,s),s+1}async _waitForLinkComplete(){const e=async s=>await new Promise(r=>setTimeout(r,s));if(!this.device.features.has("compilation-status-async-webgl")){await e(10);return}const{gl:n}=this.device;for(;;){if(n.getProgramParameter(this.handle,37297))return;await e(10)}}}class V3 extends ga{device;handle=null;commands=[];constructor(e,t={}){super(e,t),this.device=e}_executeCommands(e=this.commands){for(const t of e)switch(t.name){case"copy-buffer-to-buffer":j3(this.device,t.options);break;case"copy-buffer-to-texture":W3(this.device,t.options);break;case"copy-texture-to-buffer":H3(this.device,t.options);break;case"copy-texture-to-texture":Y3(this.device,t.options);break;default:throw new Error(t.name)}}}function j3(i,e){const t=e.sourceBuffer,n=e.destinationBuffer;i.gl.bindBuffer(36662,t.handle),i.gl.bindBuffer(36663,n.handle),i.gl.copyBufferSubData(36662,36663,e.sourceOffset??0,e.destinationOffset??0,e.size),i.gl.bindBuffer(36662,null),i.gl.bindBuffer(36663,null)}function W3(i,e){const{sourceBuffer:t,byteOffset:n=0,destinationTexture:s,mipLevel:r=0,origin:o=[0,0,0],aspect:a="all",bytesPerRow:c,rowsPerImage:l,size:u}=e;if(a!=="all")throw new Error("copyBufferToTexture aspect is not supported in WebGL");s.writeBuffer(t,{byteOffset:n,bytesPerRow:c,rowsPerImage:l,mipLevel:r,x:o[0]??0,y:o[1]??0,z:o[2]??0,width:u[0],height:u[1],depthOrArrayLayers:u[2]})}function H3(i,e){const{sourceTexture:t,mipLevel:n=0,aspect:s="all",width:r=e.sourceTexture.width,height:o=e.sourceTexture.height,depthOrArrayLayers:a,origin:c=[0,0,0],destinationBuffer:l,byteOffset:u=0,bytesPerRow:f,rowsPerImage:d}=e;if(t instanceof k){t.readBuffer({x:c[0]??0,y:c[1]??0,z:c[2]??0,width:r,height:o,depthOrArrayLayers:a,mipLevel:n,aspect:s,byteOffset:u},l);return}if(s!=="all")throw new Error("aspect not supported in WebGL");if(n!==0||a!==void 0||f||d)throw new Error("not implemented");const{framebuffer:h,destroyFramebuffer:g}=Ah(t);let p;try{const m=l,_=r||h.width,b=o||h.height,y=Xn(h.colorAttachments[0]),v=xh(y.texture.props.format),w=v.format,x=v.type;i.gl.bindBuffer(35051,m.handle),p=i.gl.bindFramebuffer(36160,h.handle),i.gl.readPixels(c[0],c[1],_,b,w,x,u)}finally{i.gl.bindBuffer(35051,null),p!==void 0&&i.gl.bindFramebuffer(36160,p),g&&h.destroy()}}function Y3(i,e){const{sourceTexture:t,destinationMipLevel:n=0,origin:s=[0,0],destinationOrigin:r=[0,0,0],destinationTexture:o}=e;let{width:a=e.destinationTexture.width,height:c=e.destinationTexture.height}=e;const{framebuffer:l,destroyFramebuffer:u}=Ah(t),[f=0,d=0]=s,[h,g,p]=r,m=i.gl.bindFramebuffer(36160,l.handle);let _,b;if(o instanceof Li)_=o,a=Number.isFinite(a)?a:_.width,c=Number.isFinite(c)?c:_.height,_._bind(0),b=_.glTarget;else throw new Error("invalid destination");switch(b){case 3553:case 34067:i.gl.copyTexSubImage2D(b,n,h,g,f,d,a,c);break;case 35866:case 32879:i.gl.copyTexSubImage3D(b,n,h,g,p,f,d,a,c);break}_&&_._unbind(),i.gl.bindFramebuffer(36160,m),u&&l.destroy()}function Ah(i){if(i instanceof k){const{width:e,height:t,id:n}=i;return{framebuffer:i.device.createFramebuffer({id:`framebuffer-for-${n}`,width:e,height:t,colorAttachments:[i]}),destroyFramebuffer:!0}}return{framebuffer:i,destroyFramebuffer:!1}}function q3(i){switch(i){case"point-list":return 0;case"line-list":return 1;case"line-strip":return 3;case"triangle-list":return 4;case"triangle-strip":return 5;default:throw new Error(i)}}function X3(i){switch(i){case"point-list":return 0;case"line-list":return 1;case"line-strip":return 1;case"triangle-list":return 4;case"triangle-strip":return 4;default:throw new Error(i)}}const Z3=[1,2,4,8];class K3 extends ot{device;handle=null;glParameters={};pipeline=null;bindings={};bindingsPipeline=null;vertexArray=null;constructor(e,t){super(e,t),this.device=e;const n=this.props.framebuffer,s=!n||n.handle===null;s&&e.getDefaultCanvasContext()._resizeDrawingBufferIfNeeded();let r;if(!t?.parameters?.viewport)if(!s&&n){const{width:o,height:a}=n;r=[0,0,o,a]}else{const[o,a]=e.getDefaultCanvasContext().getDrawingBufferSize();r=[0,0,o,a]}if(this.device.pushState(),this.setParameters({viewport:r,...this.props.parameters}),!s&&n?.colorAttachments.length){const o=n.colorAttachments.map((a,c)=>36064+c);this.device.gl.drawBuffers(o)}else s&&this.device.gl.drawBuffers([1029]);this.clear(),this.props.timestampQuerySet&&this.props.beginTimestampIndex!==void 0&&this.props.timestampQuerySet.writeTimestamp(this.props.beginTimestampIndex)}end(){this.destroyed||(this.props.timestampQuerySet&&this.props.endTimestampIndex!==void 0&&this.props.timestampQuerySet.writeTimestamp(this.props.endTimestampIndex),this.device.popState(),this.destroy())}pushDebugGroup(e){}popDebugGroup(){}insertDebugMarker(e){}executeBundles(e){throw new Error("Render bundles are only supported in WebGPU")}setParameters(e={}){const t={...this.glParameters};t.framebuffer=this.props.framebuffer||null,this.props.depthReadOnly&&(t.depthMask=!this.props.depthReadOnly),t.stencilMask=this.props.stencilReadOnly?0:1,t[35977]=this.props.discard,e.viewport&&(e.viewport.length>=6?(t.viewport=e.viewport.slice(0,4),t.depthRange=[e.viewport[4],e.viewport[5]]):t.viewport=e.viewport),e.scissorRect&&(t.scissorTest=!0,t.scissor=e.scissorRect),e.blendConstant&&(t.blendColor=e.blendConstant),e.stencilReference!==void 0&&(t[2967]=e.stencilReference,t[36003]=e.stencilReference),"colorMask"in e&&(t.colorMask=Z3.map(n=>!!(n&e.colorMask))),this.glParameters=t,ri(this.device.gl,t)}setPipeline(e){this.pipeline=e}setBindings(e,t){if(!this.pipeline)throw new Error("RenderPass.setPipeline() must be called before setBindings()");this.bindings=po(da(this.pipeline.shaderLayout,e)),this.bindingsPipeline=this.pipeline}setVertexArray(e){this.vertexArray=e}draw(e){const t=this.pipeline,n=this.vertexArray;if(!t)throw new Error("RenderPass.setPipeline() must be called before draw()");if(!n)throw new Error("RenderPass.setVertexArray() must be called before draw()");if(t.shaderLayout.bindings.length>0&&this.bindingsPipeline!==t)throw new Error("RenderPass.setBindings() must be called after setPipeline() before draw()");t._syncLinkStatus();const{parameters:s=t.props.parameters,topology:r=t.props.topology,vertexCount:o,indexCount:a,instanceCount:c,isInstanced:l=!1,firstVertex:u=0,transformFeedback:f,uniforms:d=t.uniforms}=e,h=q3(r),g=!!n.indexBuffer,p=n.indexBuffer?.glIndexType,m=a??o??0;if(t.linkStatus!=="success")return P.info(2,`RenderPipeline:${t.id}.draw() aborted - waiting for shader linking`)(),!1;if(!t._areTexturesRenderable(this.bindings))return P.info(2,`RenderPipeline:${t.id}.draw() aborted - textures not yet loaded`)(),!1;this.device.gl.useProgram(t.handle),n.bindBeforeRender(this);const _=f;return _&&_.begin(t.props.topology),t._applyBindings(this.bindings,{disableWarnings:t.props.disableWarnings}),t._applyUniforms(d),f3(this.device,s,this.glParameters,()=>{g&&l?this.device.gl.drawElementsInstanced(h,m,p,u,c||0):g?this.device.gl.drawElements(h,m,p,u):l?this.device.gl.drawArraysInstanced(h,u,o||0,c||0):this.device.gl.drawArrays(h,u,o||0),_&&_.end()}),n.unbindAfterRender(this),!0}drawIndirect(e,t=0){throw new Error("Indirect drawing is only supported in WebGPU")}drawIndexedIndirect(e,t=0){throw new Error("Indirect drawing is only supported in WebGPU")}beginOcclusionQuery(e){this.props.occlusionQuerySet?.beginOcclusionQuery()}endOcclusionQuery(){this.props.occlusionQuerySet?.endOcclusionQuery()}clear(){const e={...this.glParameters};let t=0;this.props.clearColors&&this.props.clearColors.forEach((n,s)=>{n&&this.clearColorBuffer(s,n)}),this.props.clearColor!==!1&&this.props.clearColors===void 0&&(t|=16384,e.clearColor=this.props.clearColor),this.props.clearDepth!==!1&&(t|=256,e.clearDepth=this.props.clearDepth),this.props.clearStencil!==!1&&(t|=1024,e.clearStencil=this.props.clearStencil),t!==0&&He(this.device.gl,e,()=>{this.device.gl.clear(t)})}clearColorBuffer(e=0,t=[0,0,0,0]){He(this.device.gl,{framebuffer:this.props.framebuffer},()=>{switch(t.constructor){case Int8Array:case Int16Array:case Int32Array:this.device.gl.clearBufferiv(6144,e,t);break;case Uint8Array:case Uint8ClampedArray:case Uint16Array:case Uint32Array:this.device.gl.clearBufferuiv(6144,e,t);break;case Float32Array:this.device.gl.clearBufferfv(6144,e,t);break;default:throw new Error("clearColorBuffer: color must be typed array")}})}}class Pu extends ha{device;handle=null;commandBuffer;constructor(e,t){super(e,t),this.device=e,this.commandBuffer=new V3(e,{id:this.id,userData:this.userData})}destroy(){this.destroyResource()}finish(){return this.destroy(),this.commandBuffer}beginRenderPass(e={}){return new K3(this.device,this._applyTimeProfilingToPassProps(e))}beginComputePass(e={}){throw new Error("ComputePass not supported in WebGL")}copyBufferToBuffer(e){this.commandBuffer.commands.push({name:"copy-buffer-to-buffer",options:e})}copyBufferToTexture(e){this.commandBuffer.commands.push({name:"copy-buffer-to-texture",options:e})}copyTextureToBuffer(e){this.commandBuffer.commands.push({name:"copy-texture-to-buffer",options:e})}copyTextureToTexture(e){this.commandBuffer.commands.push({name:"copy-texture-to-texture",options:e})}pushDebugGroup(e){}popDebugGroup(){}insertDebugMarker(e){}resolveQuerySet(e,t,n){throw new Error("resolveQuerySet is not supported in WebGL")}writeTimestamp(e,t){e.writeTimestamp(t)}}function Q3(i){const{target:e,source:t,start:n=0,count:s=1}=i,r=t.length,o=s*r;let a=0;for(let c=n;a<r;a++)e[c++]=t[a]??0;for(;a<o;)a<o-a?(e.copyWithin(n+a,n,n+a),a*=2):(e.copyWithin(n+a,n,n+o-a),a=o);return i.target}class Ka extends pa{get[Symbol.toStringTag](){return"VertexArray"}device;handle;attributeInfosByLocation;buffer=null;bufferValue=null;static isConstantAttributeZeroSupported(e){return Og()==="Chrome"}constructor(e,t){super(e,t),this.device=e,this.handle=this.device.gl.createVertexArray(),this.attributeInfosByLocation=new Array(this.maxVertexAttributes).fill(null);for(const n of Object.values(yd(t.shaderLayout,t.bufferLayout)))this.attributeInfosByLocation[n.location]=n}destroy(){super.destroy(),this.buffer&&this.buffer?.destroy(),this.handle&&(this.device.gl.deleteVertexArray(this.handle),this.handle=void 0)}setIndexBuffer(e){const t=e;if(t&&t.glTarget!==34963)throw new Error("Use .setBuffer()");this.device.gl.bindVertexArray(this.handle),this.device.gl.bindBuffer(34963,t?t.handle:null),this.indexBuffer=t,this.device.gl.bindVertexArray(null)}setBuffer(e,t){const n=t;if(n.glTarget===34963)throw new Error("Use .setIndexBuffer()");const{size:s,type:r,stride:o,offset:a,normalized:c,integer:l,divisor:u}=this._getAccessor(e);this.device.gl.bindVertexArray(this.handle),this.device.gl.bindBuffer(34962,n.handle),l?this.device.gl.vertexAttribIPointer(e,s,r,o,a):this.device.gl.vertexAttribPointer(e,s,r,c,o,a),this.device.gl.bindBuffer(34962,null),this.device.gl.enableVertexAttribArray(e),this.device.gl.vertexAttribDivisor(e,u||0),this.attributes[e]=n,this.device.gl.bindVertexArray(null)}setConstantWebGL(e,t){this._enable(e,!1),this.attributes[e]=t}bindBeforeRender(){this.device.gl.bindVertexArray(this.handle),this._applyConstantAttributes()}unbindAfterRender(){this.device.gl.bindVertexArray(null)}_applyConstantAttributes(){for(let e=0;e<this.maxVertexAttributes;++e){const t=this.attributes[e];ArrayBuffer.isView(t)&&this.device.setConstantAttributeWebGL(e,t)}}_getAccessor(e){const t=this.attributeInfosByLocation[e];if(!t)throw new Error(`Unknown attribute location ${e}`);const n=yh(t.bufferDataType);return{size:t.bufferComponents,type:n,stride:t.byteStride,offset:t.byteOffset,normalized:t.normalized,integer:t.integer,divisor:t.stepMode==="instance"?1:0}}_enable(e,t=!0){const s=Ka.isConstantAttributeZeroSupported(this.device)||e!==0;(t||s)&&(e=Number(e),this.device.gl.bindVertexArray(this.handle),t?this.device.gl.enableVertexAttribArray(e):this.device.gl.disableVertexAttribArray(e),this.device.gl.bindVertexArray(null))}getConstantBuffer(e,t){const n=J3(t),s=n.byteLength*e,r=n.length*e;if(this.buffer&&s!==this.buffer.byteLength)throw new Error(`Buffer size is immutable, byte length ${s} !== ${this.buffer.byteLength}.`);let o=!this.buffer;if(this.buffer=this.buffer||this.device.createBuffer({byteLength:s}),o||=!eT(n,this.bufferValue),o){const a=fb(t.constructor,r);Q3({target:a,source:n,start:0,count:r}),this.buffer.write(a),this.bufferValue=t}return this.buffer}}function J3(i){return Array.isArray(i)?new Float32Array(i):i}function eT(i,e){if(!i||!e||i.length!==e.length||i.constructor!==e.constructor)return!1;for(let t=0;t<i.length;++t)if(i[t]!==e[t])return!1;return!0}class tT extends ma{device;gl;handle;layout;buffers={};unusedBuffers={};bindOnUse=!0;_bound=!1;constructor(e,t){super(e,t),this.device=e,this.gl=e.gl,this.handle=this.props.handle||this.gl.createTransformFeedback(),this.layout=this.props.layout,t.buffers&&this.setBuffers(t.buffers),Object.seal(this)}destroy(){this.gl.deleteTransformFeedback(this.handle),super.destroy()}begin(e="point-list"){this.gl.bindTransformFeedback(36386,this.handle),this.bindOnUse&&this._bindBuffers(),this.gl.beginTransformFeedback(X3(e))}end(){this.gl.endTransformFeedback(),this.bindOnUse&&this._unbindBuffers(),this.gl.bindTransformFeedback(36386,null)}setBuffers(e){this.buffers={},this.unusedBuffers={},this.bind(()=>{for(const[t,n]of Object.entries(e))this.setBuffer(t,n)})}setBuffer(e,t){const n=this._getVaryingIndex(e),{buffer:s,byteLength:r,byteOffset:o}=this._getBufferRange(t);if(n<0){this.unusedBuffers[e]=s,P.warn(`${this.id} unusedBuffers varying buffer ${e}`)();return}this.buffers[n]={buffer:s,byteLength:r,byteOffset:o},this.bindOnUse||this._bindBuffer(n,s,o,r)}getBuffer(e){if(Eu(e))return this.buffers[e]||null;const t=this._getVaryingIndex(e);return this.buffers[t]??null}bind(e=this.handle){if(typeof e!="function")return this.gl.bindTransformFeedback(36386,e),this;let t;return this._bound?t=e():(this.gl.bindTransformFeedback(36386,this.handle),this._bound=!0,t=e(),this._bound=!1,this.gl.bindTransformFeedback(36386,null)),t}unbind(){this.bind(null)}_getBufferRange(e){if(e instanceof Ti)return{buffer:e,byteOffset:0,byteLength:e.byteLength};const{buffer:t,byteOffset:n=0,byteLength:s=e.buffer.byteLength}=e;return{buffer:t,byteOffset:n,byteLength:s}}_getVaryingIndex(e){if(Eu(e))return Number(e);for(const t of this.layout.varyings||[])if(e===t.name)return t.location;return-1}_bindBuffers(){for(const[e,t]of Object.entries(this.buffers)){const{buffer:n,byteLength:s,byteOffset:r}=this._getBufferRange(t);this._bindBuffer(Number(e),n,r,s)}}_unbindBuffers(){for(const e in this.buffers)this.gl.bindBufferBase(35982,Number(e),null)}_bindBuffer(e,t,n=0,s){const r=t&&t.handle;!r||s===void 0?this.gl.bindBufferBase(35982,e,r):this.gl.bindBufferRange(35982,e,r,n,s)}}function Eu(i){return typeof i=="number"?Number.isInteger(i):/^\d+$/.test(i)}class iT extends _a{device;handle;_timestampPairs=[];_pendingReads=new Set;_occlusionQuery=null;_occlusionActive=!1;get[Symbol.toStringTag](){return"QuerySet"}constructor(e,t){if(super(e,t),this.device=e,t.type==="timestamp"){if(t.count<2)throw new Error("Timestamp QuerySet requires at least two query slots");this._timestampPairs=new Array(Math.ceil(t.count/2)).fill(null).map(()=>({activeQuery:null,completedQueries:[]})),this.handle=null}else{if(t.count>1)throw new Error("WebGL occlusion QuerySet can only have one value");const n=this.device.gl.createQuery();if(!n)throw new Error("WebGL query not supported");this.handle=n}Object.seal(this)}destroy(){if(!this.destroyed){this.handle&&this.device.gl.deleteQuery(this.handle);for(const e of this._timestampPairs){e.activeQuery&&(this._cancelPendingQuery(e.activeQuery),this.device.gl.deleteQuery(e.activeQuery.handle));for(const t of e.completedQueries)this._cancelPendingQuery(t),this.device.gl.deleteQuery(t.handle)}this._occlusionQuery&&(this._cancelPendingQuery(this._occlusionQuery),this.device.gl.deleteQuery(this._occlusionQuery.handle));for(const e of Array.from(this._pendingReads))this._cancelPendingQuery(e);this.destroyResource()}}isResultAvailable(e){return this.props.type==="timestamp"?e===void 0?this._timestampPairs.some((t,n)=>this._isTimestampPairAvailable(n)):this._isTimestampPairAvailable(this._getTimestampPairIndex(e)):this._occlusionQuery?this._pollQueryAvailability(this._occlusionQuery):!1}async readResults(e){const t=e?.firstQuery||0,n=e?.queryCount||this.props.count-t;if(this._validateRange(t,n),this.props.type==="timestamp"){const s=new Array(n).fill(0n),r=Math.floor(t/2),o=Math.floor((t+n-1)/2);for(let a=r;a<=o;a++){const c=await this._consumeTimestampPairResult(a),l=a*2,u=l+1;l>=t&&l<t+n&&(s[l-t]=0n),u>=t&&u<t+n&&(s[u-t]=c)}return s}if(!this._occlusionQuery)throw new Error("Occlusion query has not been started");return[await this._consumeQueryResult(this._occlusionQuery)]}async readTimestampDuration(e,t){if(this.props.type!=="timestamp")throw new Error("Timestamp durations require a timestamp QuerySet");if(e<0||t>=this.props.count||t<=e)throw new Error("Timestamp duration range is out of bounds");if(e%2!==0||t!==e+1)throw new Error("WebGL timestamp durations require adjacent even/odd query indices");const n=await this._consumeTimestampPairResult(this._getTimestampPairIndex(e));return Number(n)/1e6}beginOcclusionQuery(){if(this.props.type!=="occlusion")throw new Error("Occlusion queries require an occlusion QuerySet");if(!this.handle)throw new Error("WebGL occlusion query is not available");if(this._occlusionActive)throw new Error("Occlusion query is already active");this.device.gl.beginQuery(35887,this.handle),this._occlusionQuery={handle:this.handle,promise:null,result:null,disjoint:!1,cancelled:!1,pollRequestId:null,resolve:null,reject:null},this._occlusionActive=!0}endOcclusionQuery(){if(!this._occlusionActive)throw new Error("Occlusion query is not active");this.device.gl.endQuery(35887),this._occlusionActive=!1}writeTimestamp(e){if(this.props.type!=="timestamp")throw new Error("Timestamp writes require a timestamp QuerySet");const t=this._getTimestampPairIndex(e),n=this._timestampPairs[t];if(e%2===0){if(n.activeQuery)throw new Error("Timestamp query pair is already active");const s=this.device.gl.createQuery();if(!s)throw new Error("WebGL query not supported");const r={handle:s,promise:null,result:null,disjoint:!1,cancelled:!1,pollRequestId:null,resolve:null,reject:null};this.device.gl.beginQuery(35007,s),n.activeQuery=r;return}if(!n.activeQuery)throw new Error("Timestamp query pair was ended before it was started");this.device.gl.endQuery(35007),n.completedQueries.push(n.activeQuery),n.activeQuery=null}_validateRange(e,t){if(e<0||t<0||e+t>this.props.count)throw new Error("Query read range is out of bounds")}_getTimestampPairIndex(e){if(e<0||e>=this.props.count)throw new Error("Query index is out of bounds");return Math.floor(e/2)}_isTimestampPairAvailable(e){const t=this._timestampPairs[e];return!t||t.completedQueries.length===0?!1:this._pollQueryAvailability(t.completedQueries[0])}_pollQueryAvailability(e){if(e.cancelled||this.destroyed)return e.result=0n,!0;if(e.result!==null||e.disjoint)return!0;if(!this.device.gl.getQueryParameter(e.handle,34919))return!1;const n=!!this.device.gl.getParameter(36795);return e.disjoint=n,e.result=n?0n:BigInt(this.device.gl.getQueryParameter(e.handle,34918)),!0}async _consumeTimestampPairResult(e){const t=this._timestampPairs[e];if(!t||t.completedQueries.length===0)throw new Error("Timestamp query pair has no completed result");const n=t.completedQueries.shift();try{return await this._consumeQueryResult(n)}finally{this.device.gl.deleteQuery(n.handle)}}_consumeQueryResult(e){return e.promise||(this._pendingReads.add(e),e.promise=new Promise((t,n)=>{e.resolve=t,e.reject=n;const s=()=>{if(e.pollRequestId=null,e.cancelled||this.destroyed){this._pendingReads.delete(e),e.promise=null,e.resolve=null,e.reject=null,t(0n);return}if(!this._pollQueryAvailability(e)){e.pollRequestId=this._requestAnimationFrame(s);return}this._pendingReads.delete(e),e.promise=null,e.resolve=null,e.reject=null,e.disjoint?n(new Error("GPU timestamp query was invalidated by a disjoint event")):t(e.result||0n)};s()})),e.promise}_cancelPendingQuery(e){if(this._pendingReads.delete(e),e.cancelled=!0,e.pollRequestId!==null&&(this._cancelAnimationFrame(e.pollRequestId),e.pollRequestId=null),e.resolve){const t=e.resolve;e.promise=null,e.resolve=null,e.reject=null,t(0n)}}_requestAnimationFrame(e){return requestAnimationFrame(e)}_cancelAnimationFrame(e){cancelAnimationFrame(e)}}class nT extends ya{device;gl;handle;signaled;_signaled=!1;constructor(e,t={}){super(e,{}),this.device=e,this.gl=e.gl;const n=this.props.handle||this.gl.fenceSync(this.gl.SYNC_GPU_COMMANDS_COMPLETE,0);if(!n)throw new Error("Failed to create WebGL fence");this.handle=n,this.signaled=new Promise(s=>{const r=()=>{const o=this.gl.clientWaitSync(this.handle,0,0);o===this.gl.ALREADY_SIGNALED||o===this.gl.CONDITION_SATISFIED?(this._signaled=!0,s()):setTimeout(r,1)};r()})}isSignaled(){if(this._signaled)return!0;const e=this.gl.getSyncParameter(this.handle,this.gl.SYNC_STATUS);return this._signaled=e===this.gl.SIGNALED,this._signaled}destroy(){this.destroyed||this.gl.deleteSync(this.handle)}}function Mh(i){switch(i){case 6406:case 33326:case 6403:case 36244:return 1;case 33339:case 33340:case 33328:case 33320:case 33319:return 2;case 6407:case 36248:case 34837:return 3;case 6408:case 36249:case 34836:return 4;default:return 0}}function sT(i){switch(i){case 5121:return 1;case 33635:case 32819:case 32820:return 2;case 5126:return 4;default:return 0}}function rT(i,e){const{sourceX:t=0,sourceY:n=0,sourceAttachment:s=0}=e||{};let{target:r=null,sourceWidth:o,sourceHeight:a,sourceDepth:c,sourceFormat:l,sourceType:u}=e||{};const{framebuffer:f,deleteFramebuffer:d}=Ih(i),{gl:h,handle:g}=f;o||=f.width,a||=f.height;const p=f.colorAttachments[s]?.texture;if(!p)throw new Error(`Invalid framebuffer attachment ${s}`);c=p?.depth||1,l||=p?.glFormat||6408,u||=p?.glType||5121,r=cT(r,u,l,o,a);const m=Be.getDataType(r);u=u||E3(m);const _=h.bindFramebuffer(36160,g);return h.readBuffer(36064+s),h.readPixels(t,n,o,a,l,u,r),h.readBuffer(36064),h.bindFramebuffer(36160,_||null),d&&f.destroy(),r}function oT(i,e){const{target:t,sourceX:n=0,sourceY:s=0,sourceFormat:r=6408,targetByteOffset:o=0}=e||{};let{sourceWidth:a,sourceHeight:c,sourceType:l}=e||{};const{framebuffer:u,deleteFramebuffer:f}=Ih(i);a=a||u.width,c=c||u.height;const d=u;l=l||5121;let h=t;if(!h){const p=Mh(r),m=sT(l),_=o+a*c*p*m;h=d.device.createBuffer({byteLength:_})}const g=i.device.createCommandEncoder();return g.copyTextureToBuffer({sourceTexture:i,width:a,height:c,origin:[n,s],destinationBuffer:h,byteOffset:o}),g.destroy(),f&&u.destroy(),h}function Ih(i){return i instanceof Ts?{framebuffer:i,deleteFramebuffer:!1}:{framebuffer:aT(i),deleteFramebuffer:!0}}function aT(i,e){const{device:t,width:n,height:s,id:r}=i;return t.createFramebuffer({...e,id:`framebuffer-for-${r}`,width:n,height:s,colorAttachments:[i]})}function cT(i,e,t,n,s,r){if(i)return i;e||=5121;const o=Eh(e),a=Be.getTypedArrayConstructor(o),c=Mh(t);return new a(n*s*c)}function lT(i){const e=new Map;for(const t in i){const n=i[t];if(t<"a"){const s=e.get(n);e.set(n,s?`${s}, GL.${t}`:`GL.${t}`)}}return e}class gt extends Ht{static getDeviceFromContext(e){return e?e.luma?.device??null:null}type="webgl";handle;features;limits;info;canvasContext;preferredColorFormat="rgba8unorm";preferredDepthFormat="depth24plus";commandEncoder;lost;_resolveContextLost;_isLost=!1;gl;_glKeyByValue=null;_constants;extensions;_polyfilled=!1;spectorJS;get[Symbol.toStringTag](){return"WebGLDevice"}toString(){return`${this[Symbol.toStringTag]}(${this.id})`}isVertexFormatSupported(e){return e!=="unorm8x4-bgra"}constructor(e){super({...e,id:e.id||r3("webgl-device")});const t=Ht._getCanvasContextProps(e);if(!t)throw new Error("WebGLDevice requires props.createCanvasContext to be set");const n=t.canvas?.gl??null;let s=gt.getDeviceFromContext(n);if(s)throw new Error(`WebGL context already attached to device ${s.id}`);this.canvasContext=new n3(this,t),this.lost=new Promise(u=>{this._resolveContextLost=u});const r={...e.webgl};t.alphaMode==="premultiplied"&&(r.premultipliedAlpha=!0),e.powerPreference!==void 0&&(r.powerPreference=e.powerPreference),e.failIfMajorPerformanceCaveat!==void 0&&(r.failIfMajorPerformanceCaveat=e.failIfMajorPerformanceCaveat);const a=this.props._handle||kS(this.canvasContext.canvas,{onContextLost:u=>this._resolveContextLost?.({reason:"destroyed",message:"Entered sleep mode, or too many apps or browser tabs are using the GPU."}),onContextRestored:u=>{console.log("WebGL context restored")}},r);if(!a)throw new Error("WebGL context creation failed");if(s=gt.getDeviceFromContext(a),s){if(e._reuseDevices)return P.log(1,`Not creating a new Device, instead returning a reference to Device ${s.id} already attached to WebGL context`,s)(),this.canvasContext.destroy(),s._reused=!0,s;throw new Error(`WebGL context already attached to device ${s.id}`)}this.handle=a,this.gl=a,this.spectorJS=ES({...this.props,gl:this.handle});const c=Fo(this.handle);c.device=this,c.extensions||(c.extensions={}),this.extensions=c.extensions,this.info=DS(this.gl,this.extensions),this.limits=new e3(this.gl),this.features=new JS(this.gl,this.extensions,this.props._disabledFeatures),this.props._initializeFeatures&&this.features.initializeFeatures(),new dt(this.gl,{log:(...u)=>P.log(1,...u)()}).trackState(this.gl,{copyState:!1}),(e.debug||e.debugWebGL)&&(this.gl=xS(this.gl,{traceWebGL:e.debugWebGL}),P.warn("WebGL debug mode activated. Performance reduced.")()),e.debugWebGL&&(P.level=Math.max(P.level,1)),this.commandEncoder=new Pu(this,{id:`${this}-command-encoder`}),this.canvasContext._startObservers()}destroy(){if(!this.props._reuseDevices&&!this._reused){this._isLost=!0,this.commandEncoder?.destroy();const e=Fo(this.handle);e.device=null}}get isLost(){return this._isLost||this.gl.isContextLost()}createCanvasContext(e){throw new Error("WebGL only supports a single canvas")}createPresentationContext(e){return new s3(this,e||{})}createBuffer(e){const t=this._normalizeBufferProps(e);return new Ti(this,t)}createTexture(e){return new Li(this,e)}createExternalTexture(e){throw new Error("ExternalTexture is not available on WebGL")}createSampler(e){return new _3(this,e)}createShader(e){return new l3(this,e)}createFramebuffer(e){return new Si(this,e)}createVertexArray(e){return new Ka(this,e)}createTransformFeedback(e){return new tT(this,e)}createQuerySet(e){return new iT(this,e)}createFence(){return new nT(this)}createRenderPipeline(e){return new $3(this,e)}_createSharedRenderPipelineWebGL(e){return new G3(this,e)}createComputePipeline(e){throw new Error("ComputePipeline not supported in WebGL")}createRenderBundleEncoder(e){throw new Error("Render bundles are only supported in WebGPU")}createCommandEncoder(e={}){return new Pu(this,e)}submit(e){let t=null;e||({submittedCommandEncoder:t,commandBuffer:e}=this._finalizeDefaultCommandEncoderForSubmit());try{e._executeCommands(),t&&t.resolveTimeProfilingQuerySet().then(()=>{this.commandEncoder._gpuTimeMs=t._gpuTimeMs}).catch(()=>{})}finally{e.destroy()}}writeBufferViaCommandEncoder(e,t,n,s=0){t.write(n,s)}_finalizeDefaultCommandEncoderForSubmit(){const e=this.commandEncoder,t=e.finish();return this.commandEncoder.destroy(),this.commandEncoder=this.createCommandEncoder({id:e.props.id,timeProfilingQuerySet:e.getTimeProfilingQuerySet()}),{submittedCommandEncoder:e,commandBuffer:t}}readPixelsToArrayWebGL(e,t){return rT(e,t)}readPixelsToBufferWebGL(e,t){return oT(e,t)}setParametersWebGL(e){ri(this.gl,e)}getParametersWebGL(e){return mh(this.gl,e)}withParametersWebGL(e,t){return He(this.gl,e,t)}resetWebGL(){P.warn("WebGLDevice.resetWebGL is deprecated, use only for debugging")(),MS(this.gl)}_getDeviceSpecificTextureFormatCapabilities(e){return qS(this.gl,e,this.extensions)}loseDevice(){let e=!1;const n=this.getExtension("WEBGL_lose_context").WEBGL_lose_context;return n&&(e=!0,n.loseContext()),this._resolveContextLost?.({reason:"destroyed",message:"Application triggered context loss"}),e}pushState(){dt.get(this.gl).push()}popState(){dt.get(this.gl).pop()}getGLKey(e,t){const n=this._getGLKeyByValue().get(Number(e));return n||(t?.emptyIfUnknown?"":String(e))}getGLKeys(e){const t={emptyIfUnknown:!0};return Object.entries(e).reduce((n,[s,r])=>(n[`${s}:${this.getGLKey(s,t)}`]=`${r}:${this.getGLKey(r,t)}`,n),{})}_getGLKeyByValue(){return this._glKeyByValue??=lT(this.gl),this._glKeyByValue}setConstantAttributeWebGL(e,t){const n=this.limits.maxVertexAttributes;this._constants=this._constants||new Array(n).fill(null);const s=this._constants[e];switch(s&&hT(s,t)&&P.info(1,`setConstantAttributeWebGL(${e}) could have been skipped, value unchanged`)(),this._constants[e]=t,t.constructor){case Float32Array:uT(this,e,t);break;case Int32Array:fT(this,e,t);break;case Uint32Array:dT(this,e,t);break;default:throw new Error("constant")}}getExtension(e){return bt(this.gl,e,this.extensions),this.extensions}_setWebGLDebugMetadata(e,t,n){e.luma=t;const s={props:n.spector,id:n.spector.id};e.__SPECTOR_Metadata=s}}function uT(i,e,t){switch(t.length){case 1:i.gl.vertexAttrib1fv(e,t);break;case 2:i.gl.vertexAttrib2fv(e,t);break;case 3:i.gl.vertexAttrib3fv(e,t);break;case 4:i.gl.vertexAttrib4fv(e,t);break}}function fT(i,e,t){i.gl.vertexAttribI4iv(e,t)}function dT(i,e,t){i.gl.vertexAttribI4uiv(e,t)}function hT(i,e){if(!i||!e||i.length!==e.length||i.constructor!==e.constructor)return!1;for(let t=0;t<i.length;++t)if(i[t]!==e[t])return!1;return!0}const Su=Object.freeze(Object.defineProperty({__proto__:null,WebGLDevice:gt},Symbol.toStringTag,{value:"Module"}));function ze(){}const gT=({isDragging:i})=>i?"grabbing":"grab";function Tu(i){return i.deviceProps?.debug??i.debug}const Rh={id:"",width:"100%",height:"100%",style:null,viewState:null,initialViewState:null,pickingRadius:0,pickAsync:"auto",layerFilter:null,parameters:{},parent:null,device:null,deviceProps:{},gl:null,canvas:null,_canvases:null,layers:[],effects:[],views:null,controller:null,useDevicePixels:!0,touchAction:"none",eventRecognizerOptions:{},_framebuffer:null,_animate:!1,_pickable:!0,_typedArrayManagerProps:{},_customRender:null,widgets:[],onDeviceInitialized:ze,onWebGLInitialized:ze,onResize:ze,onViewStateChange:ze,onInteractionStateChange:ze,onBeforeRender:ze,onAfterRender:ze,onLoad:ze,onError:i=>z.error(i.message,i.cause)(),onHover:null,onClick:null,onDragStart:null,onDrag:null,onDragEnd:null,_onMetrics:null,getCursor:gT,getTooltip:null,debug:!1,drawPickingColors:!1};class ds{constructor(e){this.width=0,this.height=0,this.userData={},this.device=null,this.canvas=null,this.viewManager=null,this.layerManager=null,this.effectManager=null,this.deckRenderer=null,this.deckPicker=null,this.eventManager=null,this.eventManagers={},this.widgetManager=null,this.tooltip=null,this.animationLoop=null,this._canvasContext=null,this._deviceResizeHandler=null,this.cursorState={isHovering:!1,isDragging:!1},this.stats=new _s({id:"deck.gl"}),this.metrics={fps:0,setPropsTime:0,layersCount:0,drawLayersCount:0,updateLayersCount:0,updateAttributesCount:0,updateAttributesTime:0,framesRedrawn:0,pickTime:0,pickCount:0,pickLayersCount:0,gpuTime:0,gpuTimePerFrame:0,cpuTime:0,cpuTimePerFrame:0,bufferMemory:0,textureMemory:0,renderbufferMemory:0,gpuMemory:0},this._metricsCounter=0,this._hoverPickSequence=0,this._pointerDownPickSequence=0,this._needsRedraw="Initial render",this._canvasManager=new dS({createEventManager:s=>this._createEventManager(s),getEventRoot:s=>this._getEventRoot(s)}),this._ownedCanvas=null,this._pickRequest={mode:"hover",x:-1,y:-1,radius:0,canvasId:void 0,event:null,unproject3D:!1},this._lastPointerDownInfo=null,this._lastPointerDownInfoPromise=null,this._onPointerMove=s=>{const{_pickRequest:r}=this,o=this._getCanvasIdFromEvent(s);if(s.type==="pointerleave")r.x=-1,r.y=-1,r.radius=0,r.canvasId=o;else{if(s.leftButton||s.rightButton)return;{const a=s.offsetCenter;if(!a)return;r.x=a.x,r.y=a.y,r.radius=this.props.pickingRadius,r.canvasId=o}}this.layerManager&&(this.layerManager.context.mousePosition={x:r.x,y:r.y}),r.event=s},this._onEvent=s=>{const r=On[s.type],o=s.offsetCenter,a=this._getCanvasIdFromEvent(s);if(!r||!o||!this.layerManager)return;const c=this.layerManager.getLayers(),l=this._getInternalPickingMode();if(!l)return;if(l==="sync"){const f=s.type==="click"&&this._shouldUnproject3D(c)?this._getFirstPickedInfo(this._pickPointSync(this._getPointPickOptions(o.x,o.y,{unproject3D:!0,canvasId:a},c))):this._getLastPointerDownPickingInfo(o.x,o.y,a,c);this._dispatchPickingEvent(f,s);return}(this._lastPointerDownInfoPromise||Promise.resolve(this._getLastPointerDownPickingInfo(o.x,o.y,a,c))).then(f=>{this._dispatchPickingEvent(f,s)}).catch(f=>this.props.onError?.(f))},this._onPointerDown=s=>{const r=s.offsetCenter,o=this._getCanvasIdFromEvent(s);if(!r)return;const a=this._getInternalPickingMode();if(!a)return;const c=this.layerManager?.getLayers()||[],l=++this._pointerDownPickSequence;if(a==="sync"){const f=this._pickPointSync({x:r.x,y:r.y,canvasId:o,radius:this.props.pickingRadius}),d=this._getFirstPickedInfo(f);this._lastPointerDownInfo=d,this._lastPointerDownInfoPromise=Promise.resolve(d);return}const u=this._pickPointAsync(this._getPointPickOptions(r.x,r.y,{canvasId:o},c)).then(f=>this._getFirstPickedInfo(f)).then(f=>(l===this._pointerDownPickSequence&&(this._lastPointerDownInfo=f),f)).catch(f=>{this.props.onError?.(f);const d=this.deckPicker&&this.viewManager?this._getLastPointerDownPickingInfo(r.x,r.y,o,c):{};return l===this._pointerDownPickSequence&&(this._lastPointerDownInfo=d),d});this._lastPointerDownInfo=null,this._lastPointerDownInfoPromise=u};const t=e;this.props={...Rh,...e},e=this.props,this._validateCanvasConfiguration(e),e.viewState&&e.initialViewState&&z.warn("View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.")(),this.viewState=this.props.initialViewState,e.device&&(this.device=e.device,this._setDeviceCanvasContext(e.device));let n=this.device;!n&&e.gl&&(e.gl instanceof WebGLRenderingContext&&z.error("WebGL1 context not supported.")(),n=Sr.attach(e.gl,{_cacheShaders:!0,_cachePipelines:!0,...e.deviceProps,debug:Tu(e)})),n||(n=this._createDevice(e)),this.animationLoop=this._createAnimationLoop(n,e),this.setProps(t),e._typedArrayManagerProps&&Zt.setOptions(e._typedArrayManagerProps),this.animationLoop.start()}finalize(){this._restoreDeviceResizeHandler(),this.animationLoop?.stop(),this.animationLoop?.destroy(),this.animationLoop=null,this._hoverPickSequence++,this._pointerDownPickSequence++,this._lastPointerDownInfo=null,this._lastPointerDownInfoPromise=null,this.layerManager?.finalize(),this.layerManager=null,this.viewManager?.finalize(),this.viewManager=null,this.effectManager?.finalize(),this.effectManager=null,this.deckRenderer?.finalize(),this.deckRenderer=null,this.deckPicker?.finalize(),this.deckPicker=null,Object.keys(this._canvasManager.targets).length||this.eventManager?.destroy(),this.eventManager=null,this.eventManagers={},this.widgetManager?.finalize(),this.widgetManager=null,this._canvasManager.finalize(),this._isMultiCanvasMode()?this.canvas=null:this.canvas&&this.canvas===this._ownedCanvas&&(this.canvas.parentElement?.removeChild(this.canvas),this.canvas=null,this._ownedCanvas=null),this._canvasContext=null}setProps(e){this.stats.get("setProps Time").timeStart(),"onLayerHover"in e&&z.removed("onLayerHover","onHover")(),"onLayerClick"in e&&z.removed("onLayerClick","onClick")(),e.initialViewState&&!J(this.props.initialViewState,e.initialViewState,3)&&(this.viewState=e.initialViewState),$(!("_canvases"in e)||Array.isArray(e._canvases)===this._isMultiCanvasMode()),Object.assign(this.props,e),this._validateCanvasConfiguration(this.props),this._validateInternalPickingMode(),this.device&&this._isMultiCanvasMode()&&this._syncCanvasTargets(),this._setCanvasSize(this.props);const t=Object.create(this.props);if(Object.assign(t,{views:this._getViews(),width:this.width,height:this.height,viewState:this._getViewState(),eventManagers:this.eventManagers}),e.device&&e.device.id!==this.device?.id){const n=e.device.getDefaultCanvasContext();this.animationLoop?.stop(),!this._isMultiCanvasMode()&&this.canvas!==n.canvas&&(this.canvas?.remove(),this.eventManager?.destroy(),this.canvas=null),this._setDeviceCanvasContext(e.device),z.log(`recreating animation loop for new device! id=${e.device.id}`)(),this.animationLoop=this._createAnimationLoop(e.device,e),this.animationLoop.start()}if(this.animationLoop?.setProps(t),e.useDevicePixels!==void 0&&this._canvasContext?.setProps){this._canvasContext.setProps({useDevicePixels:e.useDevicePixels});for(const n of Object.values(this._canvasManager.targets))n.presentationContext.setProps({useDevicePixels:e.useDevicePixels})}this.layerManager&&(this.viewManager.setProps(t),this.layerManager.activateViewport(this.getViewports()[0]),this.layerManager.setProps(t),this.effectManager.setProps(t),this.deckRenderer.setProps(t),this.deckPicker.setProps(t),this.widgetManager.setProps(t)),this.stats.get("setProps Time").timeEnd()}needsRedraw(e={clearRedrawFlags:!1}){if(!this.layerManager)return!1;if(this.props._animate)return"Deck._animate";let t=this._needsRedraw;e.clearRedrawFlags&&(this._needsRedraw=!1);const n=this.viewManager.needsRedraw(e),s=this.layerManager.needsRedraw(e),r=this.effectManager.needsRedraw(e),o=this.deckRenderer.needsRedraw(e);return t=t||n||s||r||o,t}redraw(e){if(!this.layerManager)return;let t=this.needsRedraw({clearRedrawFlags:!0});t=e||t,t&&(this.stats.get("Redraw Count").incrementCount(),this.props._customRender?this.props._customRender(t):this._drawLayers(t))}get isInitialized(){return this.viewManager!==null}getViews(){return $(this.viewManager),this.viewManager.views}getView(e){return $(this.viewManager),this.viewManager.getView(e)}getViewports(e){return $(this.viewManager),this.viewManager.getViewports(e)}getCanvas(){return this.canvas}getCanvasContext(e){const t=e?this.viewManager?.getView(e)?.props.canvasId:void 0;return this._getCanvasContext(t)}getEventManager(e){if(!e||!this.viewManager)return this.eventManager;const t=this.viewManager.getCanvasId(e)||Vt;return this.eventManagers[t]||this.eventManager}async pickObjectAsync(e){const t=(await this._pickAsync("pickObjectAsync","pickObject Time",e)).result;return t.length?t[0]:null}async pickObjectsAsync(e){return await this._pickAsync("pickObjectsAsync","pickObjects Time",e)}pickObject(e){const t=this._pick("pickObject","pickObject Time",e).result;return t.length?t[0]:null}pickMultipleObjects(e){return e.depth=e.depth||10,this._pick("pickObject","pickMultipleObjects Time",e).result}pickObjects(e){return this._pick("pickObjects","pickObjects Time",e)}_pickPositionForController(e,t,n){return this._getInternalPickingMode()!=="sync"?null:this.pickObject({x:e,y:t,radius:0,unproject3D:!0,canvasId:n?this.viewManager?.getCanvasId(n):void 0})}_addResources(e,t=!1){for(const n in e)this.layerManager.resourceManager.add({resourceId:n,data:e[n],forceUpdate:t})}_removeResources(e){for(const t of e)this.layerManager.resourceManager.remove(t)}_addDefaultEffect(e){this.effectManager.addDefaultEffect(e)}_addDefaultShaderModule(e){this.layerManager.addDefaultShaderModule(e)}_removeDefaultShaderModule(e){this.layerManager?.removeDefaultShaderModule(e)}_resolveInternalPickingMode(){const{pickAsync:e}=this.props,t=this.device?.type||this.props.deviceProps?.type;if(e==="auto")return t==="webgpu"?"async":"sync";if(e==="sync"&&t==="webgpu")throw new Error('`pickAsync: "sync"` is not supported when Deck is using a WebGPU device.');return e}_getInternalPickingMode(){try{return this._resolveInternalPickingMode()}catch(e){return this.props.onError?.(e),null}}_validateInternalPickingMode(){this._getInternalPickingMode()}_getFirstPickedInfo({result:e,emptyInfo:t}){return e[0]||t}_shouldUnproject3D(e=this.layerManager?.getLayers()||[]){return e.some(t=>t.props.pickable==="3d")}_getPointPickOptions(e,t,n={},s=this.layerManager?.getLayers()||[]){return{x:e,y:t,canvasId:n.canvasId,radius:this.props.pickingRadius,unproject3D:this._shouldUnproject3D(s),...n}}_pickPointSync(e){return this._pick("pickObject","pickObject Time",e)}_pickPointAsync(e){return this._pickAsync("pickObjectAsync","pickObject Time",e)}_getLastPointerDownPickingInfo(e,t,n,s=this.layerManager?.getLayers()||[]){return this.deckPicker.getLastPickedObject({x:e,y:t,layers:s,viewports:this.getViewports({x:e,y:t,canvasId:n})},this._lastPointerDownInfo)}_applyHoverCallbacks({result:e,emptyInfo:t},n){if(!this.widgetManager)return;this.cursorState.isHovering=e.length>0;let s=t,r=!1;for(const o of e)s=o,r=o.layer?.onHover(o,n)||r;r||(this.props.onHover?.(s,n),this.widgetManager.onHover(s,n))}_dispatchPickingEvent(e,t){if(!this.layerManager||!this.widgetManager)return;const n=On[t.type];if(!n)return;const{layer:s}=e,r=s&&(s[n]||s.props[n]),o=this.props[n];let a=!1;r&&(a=r.call(s,e,t)),a||(o?.(e,t),this.widgetManager.onEvent(e,t))}_pickAsync(e,t,n){$(this.deckPicker);const{stats:s}=this,r=this._isMultiCanvasMode()?n.canvasId||this._getDefaultCanvasId():n.canvasId,o=this._getCanvasContext(r)||void 0;s.get("Pick Count").incrementCount(),s.get(t).timeStart(),this._resizeForCanvasTarget(r);const a=this.deckPicker[e]({layers:this.layerManager.getLayers(n),views:this.viewManager.getViews(),viewports:this.getViewports({...n,canvasId:r}),onViewportActive:this.layerManager.activateViewport,effects:this.effectManager.getEffects(),...n,canvasId:r,canvasContext:o});return s.get(t).timeEnd(),a}_pick(e,t,n){$(this.deckPicker);const{stats:s}=this,r=this._isMultiCanvasMode()?n.canvasId||this._getDefaultCanvasId():n.canvasId,o=this._getCanvasContext(r)||void 0;s.get("Pick Count").incrementCount(),s.get(t).timeStart(),this._resizeForCanvasTarget(r);const a=this.deckPicker[e]({layers:this.layerManager.getLayers(n),views:this.viewManager.getViews(),viewports:this.getViewports({...n,canvasId:r}),onViewportActive:this.layerManager.activateViewport,effects:this.effectManager.getEffects(),...n,canvasId:r,canvasContext:o});return s.get(t).timeEnd(),a}_createCanvas(e){let t=e.canvas;return typeof t=="string"&&(t=document.getElementById(t),$(t)),t?this._ownedCanvas=null:(t=document.createElement("canvas"),t.id=e.id||"deckgl-overlay",e.width&&typeof e.width=="number"&&(t.width=e.width),e.height&&typeof e.height=="number"&&(t.height=e.height),(e.parent||document.body).appendChild(t),this._ownedCanvas=t),Object.assign(t.style,e.style),t}_isMultiCanvasMode(){return Array.isArray(this.props._canvases)}_getDefaultCanvasId(){return this._canvasManager.order[0]||Vt}_validateCanvasConfiguration(e){Array.isArray(e._canvases)&&($(!e.canvas),$(!e.gl),$(!e.device?.canvasContext||e.device.getDefaultCanvasContext().offscreenCanvas))}_createEventManager(e){const t=new oP(e,{touchAction:this.props.touchAction,recognizers:Object.keys(Il).map(n=>{const[s,r,o,a]=Il[n],c=this.props.eventRecognizerOptions?.[n],l={...r,...c,event:n};return{recognizer:new s(l),recognizeWith:o,requireFailure:a}}),events:{pointerdown:this._onPointerDown,pointermove:this._onPointerMove,pointerleave:this._onPointerMove}});for(const n in On)n==="dblclick"?t.watch(n,this._onEvent):t.on(n,this._onEvent);return t}_getEventRoot(e){return e.closest(".deck-events-root")||this.props.parent?.querySelector(".deck-events-root")||e}_syncCanvasTargets(){if(!this.device||!this._isMultiCanvasMode())return;this._canvasManager.syncCanvasEntries({device:this.device,canvases:this.props._canvases||[],useDevicePixels:this.props.useDevicePixels}),this.eventManagers=this._canvasManager.eventManagers;const e=this._getDefaultCanvasId();this.eventManager=this.eventManagers[e]||null,this.canvas=this._canvasManager.targets[e]?.canvas||null}_setCanvasContext(e){this._canvasContext=e,"style"in e.canvas&&(this.canvas=e.canvas)}_setDeviceCanvasContext(e,t={}){const n=e.getDefaultCanvasContext();this._setCanvasContext(n),this._setDeviceResizeHandler(e,t)}_setDeviceResizeHandler(e,t={}){const n=!!t.syncDrawingBuffer;if(this._deviceResizeHandler?.device===e){this._deviceResizeHandler.syncDrawingBuffer=n;return}this._restoreDeviceResizeHandler();const s=r=>{this._isMultiCanvasMode()?this._updateMultiCanvasDimensions():r===this._canvasContext&&this._canvasContext&&this._onCanvasContextResize(this._canvasContext,{syncDrawingBuffer:this._deviceResizeHandler?.syncDrawingBuffer})};e.props.onResize=s,this._deviceResizeHandler={device:e,onResize:s,syncDrawingBuffer:n}}_restoreDeviceResizeHandler(){const e=this._deviceResizeHandler;e&&e.device.props?.onResize===e.onResize&&(e.device.props.onResize=ze),this._deviceResizeHandler=null}_setCanvasSize(e){if(this._isMultiCanvasMode()||!this.canvas)return;const{width:t,height:n}=e;if(t||t===0){const s=Number.isFinite(t)?`${t}px`:t;this.canvas.style.width=s}if(n||n===0){const s=Number.isFinite(n)?`${n}px`:n;this.canvas.style.position=e.style?.position||"absolute",this.canvas.style.height=s}}_getCanvasIdFromEvent(e){return this._canvasManager.getCanvasIdFromEvent(e?.rootElement)}_getCanvasContext(e){return this._canvasManager.getTarget(e)?.presentationContext||this._canvasContext}_resizeForCanvasTarget(e){const t=this._canvasManager.getTarget(e);if(!t||!this.device?.canvasContext)return;const[n,s]=t.presentationContext.getDrawingBufferSize();this.device.canvasContext.setDrawingBufferSize(n,s)}_createDeviceCanvas(e){if(this._isMultiCanvasMode()){const t=globalThis.OffscreenCanvas;if(!t)throw new Error("`_canvases` requires OffscreenCanvas support.");const n=typeof e.width=="number"&&Number.isFinite(e.width)?e.width:1,s=typeof e.height=="number"&&Number.isFinite(e.height)?e.height:1;return new t(n,s)}return this._createCanvas(e)}_updateCanvasSize(e=this._canvasContext){if(this._isMultiCanvasMode()){this._updateMultiCanvasDimensions();return}const{canvas:t}=this,[n,s]=e?e.getCSSSize():[t?.clientWidth??t?.width??0,t?.clientHeight??t?.height??0];(n!==this.width||s!==this.height)&&(this.width=n,this.height=s,this.viewManager?.setProps({width:n,height:s}),this.layerManager?.activateViewport(this.getViewports()[0]),this.props.onResize({width:n,height:s},e||void 0))}_onCanvasContextResize(e,t={}){if(t.syncDrawingBuffer){const{width:n,height:s}=e.canvas;e.setDrawingBufferSize(n,s)}this._needsRedraw="Canvas resized",this._updateCanvasSize(e)}_updateMultiCanvasDimensions(){const[e,t]=this._getCanvasContext()?.getCSSSize()||[0,0];(e!==this.width||t!==this.height)&&(this.width=e,this.height=t,this.props.onResize({width:e,height:t})),this._needsRedraw="Canvas resized",this.viewManager?.setNeedsUpdate("Canvas resized"),this.viewManager?.setProps({width:this.width,height:this.height})}_createAnimationLoop(e,t){const{gl:n,onError:s}=t;return new as({device:e,autoResizeDrawingBuffer:!n&&!Array.isArray(t._canvases),autoResizeViewport:!1,onInitialize:r=>this._setDevice(r.device),onRender:this._onRenderFrame.bind(this),onError:s})}_createDevice(e){const t=this.props.deviceProps?.createCanvasContext,n=typeof t=="object"?t:void 0,s={adapters:[],_cacheShaders:!0,_cachePipelines:!0,...e.deviceProps,debug:Tu(e)};s.adapters.includes(Sr)||s.adapters.push(Sr);const r={alphaMode:this.props.deviceProps?.type==="webgpu"?"premultiplied":void 0};return uo.createDevice({_reuseDevices:!0,type:"webgl",...s,createCanvasContext:{...r,...n,canvas:this._createDeviceCanvas(e),useDevicePixels:this.props.useDevicePixels,autoResize:!0}})}_getViewState(){return this.props.viewState||this.viewState}_getViews(){const{views:e}=this.props,t=Array.isArray(e)?e:e?[e]:[new Wa({id:"default-view"})];return t.length&&this.props.controller&&(t[0]=t[0].clone({controller:this.props.controller})),t}_onContextLost(){const{onError:e}=this.props;this.animationLoop&&e&&e(new Error("WebGL context is lost"))}_pickAndCallback(){const{_pickRequest:e}=this;if(e.event){const t=e.event,n=this.layerManager?.getLayers()||[],s=this._getPointPickOptions(e.x,e.y,{canvasId:e.canvasId,radius:e.radius,mode:e.mode},n),r=this._getInternalPickingMode(),o=++this._hoverPickSequence;if(e.event=null,e.canvasId=void 0,!r)return;if(r==="sync"){this._applyHoverCallbacks(this._pickPointSync(s),t);return}this._pickPointAsync(s).then(({result:a,emptyInfo:c})=>{o===this._hoverPickSequence&&this._applyHoverCallbacks({result:a,emptyInfo:c},t)}).catch(a=>this.props.onError?.(a))}}_updateCursor(){const e=this.props.getCursor(this.cursorState);if(this._isMultiCanvasMode()){for(const n of Object.values(this._canvasManager.targets))n.canvas.style.cursor=e;return}const t=this.props.parent||this.canvas;t&&(t.style.cursor=e)}_setDevice(e){if(this.device=e,this._validateInternalPickingMode(),!this.animationLoop)return;this._setDeviceCanvasContext(e,{syncDrawingBuffer:!!(this.props.gl&&this.props.device!==e)}),this._isMultiCanvasMode()?this._syncCanvasTargets():this.canvas&&!this.canvas.isConnected&&this.props.parent&&this.props.parent.insertBefore(this.canvas,this.props.parent.firstChild),this.device.type==="webgl"&&this.device.setParametersWebGL({blend:!0,blendFunc:[770,771,1,771],polygonOffsetFill:!0,depthTest:!0,depthFunc:515}),this.props.onDeviceInitialized(this.device),this.device.type==="webgl"&&this.props.onWebGLInitialized(this.device.gl);const t=new ih;if(t.play(),this.animationLoop.attachTimeline(t),!this._isMultiCanvasMode()){const r=this.canvas&&this._getEventRoot(this.canvas);$(r),this.eventManager=this._createEventManager(r),this.eventManagers={[Vt]:this.eventManager}}this.viewManager=new RE({timeline:t,eventManager:this.eventManager,eventManagers:this.eventManagers,getCanvasContext:this._isMultiCanvasMode()?this.getCanvasContext.bind(this):void 0,onViewStateChange:this._onViewStateChange.bind(this),onInteractionStateChange:this._onInteractionStateChange.bind(this),pickPosition:this._pickPositionForController.bind(this),views:this._getViews(),viewState:this._getViewState(),width:this.width,height:this.height});const n=this.viewManager.getViewports()[0];this.layerManager=new IE(this.device,{deck:this,stats:this.stats,viewport:n,timeline:t}),this.effectManager=new eS({deck:this,device:this.device}),this.deckRenderer=new nS(this.device,{stats:this.stats}),this.deckPicker=new oS(this.device,{stats:this.stats});const s=this.props.parent?.querySelector(".deck-widgets-root")||(this._isMultiCanvasMode()?this.props.parent||this.canvas?.parentElement:null)||this.canvas?.parentElement;this.widgetManager=new lS({deck:this,parentElement:s}),this.widgetManager.addDefault(new ph),this.setProps({}),this._updateCanvasSize(this._canvasContext),this.props.onLoad()}_drawLayers(e,t){const{device:n,gl:s}=this.layerManager.context;this.props.onBeforeRender({device:n,gl:s});const r={target:this.props._framebuffer,layers:this.layerManager.getLayers(),viewports:this.viewManager.getViewports(),onViewportActive:this.layerManager.activateViewport,views:this.viewManager.getViews(),pass:"screen",effects:this.effectManager.getEffects(),...t};if(this._isMultiCanvasMode()&&r.pass==="screen"&&!r.target&&this._canvasManager.order.length)for(const o of this._canvasManager.order){const a=r.viewports.filter(u=>this.viewManager.getCanvasId(u.id)===o);if(!a.length){const u=this._canvasManager.targets[o];this._resizeForCanvasTarget(o),this.deckRenderer?.renderLayers({...r,canvasContext:u.presentationContext,target:u.presentationContext.getCurrentFramebuffer(),viewports:[],clearCanvas:!0}),u.presentationContext.present();continue}const c=this._canvasManager.targets[o];this._resizeForCanvasTarget(o);const l=c.presentationContext.getCurrentFramebuffer();this.deckRenderer?.renderLayers({...r,canvasContext:c.presentationContext,target:l,viewports:a}),c.presentationContext.present()}else this.deckRenderer?.renderLayers(r);r.pass==="screen"&&this.widgetManager.onRedraw({viewports:r.viewports,layers:r.layers}),this.props.onAfterRender({device:n,gl:s})}_onRenderFrame(){this._getFrameStats(),this._metricsCounter++%60===0&&(this._getMetrics(),this.stats.reset(),z.table(4,this.metrics)(),this.props._onMetrics&&this.props._onMetrics(this.metrics)),this._updateCursor(),this.layerManager.updateLayers(),this._pickAndCallback(),this.redraw(),this.viewManager&&this.viewManager.updateViewStates()}_onViewStateChange(e){const t=this.props.onViewStateChange(e)||e.viewState;this.viewState&&(this.viewState={...this.viewState,[e.viewId]:t},this.props.viewState||this.viewManager&&this.viewManager.setProps({viewState:this.viewState}))}_onInteractionStateChange(e){this.cursorState.isDragging=e.isDragging||!1,this.props.onInteractionStateChange(e)}_getFrameStats(){const{stats:e}=this;e.get("frameRate").timeEnd(),e.get("frameRate").timeStart();const t=this.animationLoop.stats;e.get("GPU Time").addTime(t.get("GPU Time").lastTiming),e.get("CPU Time").addTime(t.get("CPU Time").lastTiming)}_getMetrics(){const{metrics:e,stats:t}=this;e.fps=t.get("frameRate").getHz(),e.setPropsTime=t.get("setProps Time").time,e.updateAttributesTime=t.get("Update Attributes").time,e.framesRedrawn=t.get("Redraw Count").count,e.pickTime=t.get("pickObject Time").time+t.get("pickMultipleObjects Time").time+t.get("pickObjects Time").time,e.pickCount=t.get("Pick Count").count,e.layersCount=this.layerManager?.layers.length??0,e.drawLayersCount=t.get("Layers rendered").lastSampleCount,e.pickLayersCount=t.get("Layers picked").lastSampleCount,e.updateLayersCount=t.get("Layer updates").count,e.updateAttributesCount=t.get("Attributes updated").count,e.gpuTime=t.get("GPU Time").time,e.cpuTime=t.get("CPU Time").time,e.gpuTimePerFrame=t.get("GPU Time").getAverageTime(),e.cpuTimePerFrame=t.get("CPU Time").getAverageTime();const n=uo.stats.get("GPU Time and Memory");e.bufferMemory=n.get("Buffer Memory").count,e.textureMemory=n.get("Texture Memory").count,e.renderbufferMemory=n.get("Renderbuffer Memory").count,e.gpuMemory=n.get("GPU Memory").count}}ds.defaultProps=Rh;ds.VERSION=n_;function pT(i){switch(i){case"float64":return Float64Array;case"uint8":case"unorm8":return Uint8ClampedArray;default:return oa(i)}}const mT=Be.getDataType.bind(Be);function Sn(i,e,t){if(e.size>4)return null;const n=t==="webgpu"&&e.type==="uint8"?"unorm8":e.type,s=e.size,r=!!(t!=="webgpu"&&s===3&&n&&["uint8","sint8","unorm8","snorm8","uint16","sint16","unorm16","snorm16"].includes(n));return{attribute:i,format:s>1?`${n}x${s}${r?"-webgl":""}`:e.type,byteOffset:e.offset||0}}function Ie(i){return i.stride||i.size*i.bytesPerElement}function _T(i,e){return i.type===e.type&&i.size===e.size&&Ie(i)===Ie(e)&&(i.offset||0)===(e.offset||0)}function $o(i,e){e.offset&&z.removed("shaderAttribute.offset","vertexOffset, elementOffset")();const t=Ie(i),n=e.vertexOffset!==void 0?e.vertexOffset:i.vertexOffset||0,s=e.elementOffset||0,r=n*t+s*i.bytesPerElement+(i.offset||0);return{...e,offset:r,stride:t}}function yT(i,e){const t=$o(i,e);return{high:t,low:{...t,offset:t.offset+i.size*4}}}class bT{constructor(e,t,n){this._buffer=null,this.device=e,this.id=t.id||"",this.size=t.size||1;const s=t.logicalType||t.type,r=s==="float64";let{defaultValue:o}=t;o=Number.isFinite(o)?[o]:o||new Array(this.size).fill(0);let a;r?a="float32":!s&&t.isIndexed?a="uint32":a=s||"float32";let c=pT(s||a);this.doublePrecision=r,r&&t.fp64===!1&&(c=Float32Array),this.value=null,this.settings={...t,defaultType:c,defaultValue:o,logicalType:s,type:a,normalized:a.includes("norm"),size:this.size,bytesPerElement:c.BYTES_PER_ELEMENT},this.state={...n,externalBuffer:null,bufferAccessor:this.settings,allocatedValue:null,numInstances:0,bounds:null,constant:!1}}get isConstant(){return this.state.constant}get buffer(){return this._buffer}get byteOffset(){const e=this.getAccessor();return e.vertexOffset?e.vertexOffset*Ie(e):0}get numInstances(){return this.state.numInstances}set numInstances(e){this.state.numInstances=e}get isDoublePrecisionBuffer(){return this._shouldSplitDoublePrecisionValue(this.value)}delete(){this._buffer&&(this._buffer.delete(),this._buffer=null),Zt.release(this.state.allocatedValue),this.state.allocatedValue=null}getBuffer(){return this.state.constant&&this.device.type!=="webgpu"?null:this.state.externalBuffer||this._buffer}getValue(e=this.id,t=null){const n={};if(this.state.constant){const s=this.value;if(this.device.type==="webgpu"&&this._buffer)n[e]=this._buffer;else if(t){const r=$o(this.getAccessor(),t),o=r.offset/s.BYTES_PER_ELEMENT,a=r.size||this.size;n[e]=s.subarray(o,o+a)}else n[e]=s}else n[e]=this.getBuffer();return this.doublePrecision&&(this.isDoublePrecisionBuffer?n[`${e}64Low`]=n[e]:n[`${e}64Low`]=new Float32Array(this.size)),n}_getBufferLayout(e=this.id,t=null){const n=this.getAccessor(),s=[],r={name:this.id,byteStride:this.device.type==="webgpu"&&this.state.constant?0:Ie(n)};if(this.doublePrecision){const o=yT(n,t||{});s.push(Sn(e,{...n,...o.high},this.device.type),Sn(`${e}64Low`,{...n,...o.low},this.device.type))}else if(t){const o=$o(n,t);s.push(Sn(e,{...n,...o},this.device.type))}else s.push(Sn(e,n,this.device.type));return r.attributes=s.filter(Boolean),r}setAccessor(e){this.state.bufferAccessor=e}getAccessor(){return this.state.bufferAccessor}getBounds(){if(this.state.bounds)return this.state.bounds;let e=null;if(this.state.constant&&this.value){const t=Array.from(this.value);e=[t,t]}else{const{value:t,numInstances:n,size:s}=this,r=n*s;if(t&&r&&t.length>=r){const o=new Array(s).fill(1/0),a=new Array(s).fill(-1/0);for(let c=0;c<r;)for(let l=0;l<s;l++){const u=t[c++];u<o[l]&&(o[l]=u),u>a[l]&&(a[l]=u)}e=[o,a]}}return this.state.bounds=e,e}setData(e){const{state:t}=this;let n;ArrayBuffer.isView(e)?n={value:e}:e instanceof O?n={buffer:e}:n=e;const s={...this.settings,...n};if(ArrayBuffer.isView(n.value)){if(!n.type)if(this.doublePrecision&&n.value instanceof Float64Array)s.type="float32";else{const o=mT(n.value);s.type=s.normalized?o.replace("int","norm"):o}s.bytesPerElement=n.value.BYTES_PER_ELEMENT,s.stride=Ie(s)}if(t.bounds=null,n.constant){let r=n.value;if(r=this._normalizeValue(r,[],0),this.settings.normalized&&(r=this.normalizeConstant(r)),!(!t.constant||!this._areValuesEqual(r,this.value)))return!1;t.externalBuffer=null,t.constant=!0,this.value=ArrayBuffer.isView(r)?r:new Float32Array(r)}else if(n.buffer){const r=n.buffer;t.externalBuffer=r,t.constant=!1,this.value=n.value||null}else if(n.value){this._checkExternalBuffer(n);const r=n.value;let o=r;t.externalBuffer=null,t.constant=!1,this.value=r,this._shouldSplitDoublePrecisionValue(o)&&(o=kn(o,s),r instanceof Float32Array&&(s.stride=s.size*2*Float32Array.BYTES_PER_ELEMENT));let{buffer:a}=this;const c=Ie(s),l=(s.vertexOffset||0)*c;if(this.settings.isIndexed){const f=this.settings.defaultType;o.constructor!==f&&(o=new f(o))}const u=o.byteLength+l+c*2;(!a||a.byteLength<u)&&(a=this._createBuffer(u)),a.write(o,l)}return this.setAccessor(s),!0}updateSubBuffer(e={}){this.state.bounds=null;const t=this.value,{startOffset:n=0,endOffset:s}=e,r=this._shouldSplitDoublePrecisionValue(t);this.buffer.write(r?kn(t,{size:this.size,startIndex:n,endIndex:s}):t.subarray(n,s),n*(r?8:t.BYTES_PER_ELEMENT)+this.byteOffset)}allocate(e,t=!1){const{state:n}=this,s=n.allocatedValue,r=Zt.allocate(s,e+1,{size:this.size,type:this.settings.defaultType,copy:t});this.value=r;const o=this._shouldSplitDoublePrecisionValue(r),a=o&&r instanceof Float32Array?{...this.settings,stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}:this.settings;this.setAccessor(a);const{byteOffset:c}=this;let{buffer:l}=this;const u=r.byteLength*(o&&r instanceof Float32Array?2:1);return(!l||l.byteLength<u+c)&&(l=this._createBuffer(u+c),t&&s&&l.write(this._shouldSplitDoublePrecisionValue(s)?kn(s,this):s,c)),n.allocatedValue=r,n.constant=!1,n.externalBuffer=null,!0}_shouldSplitDoublePrecisionValue(e){return!!(this.doublePrecision&&(e instanceof Float64Array||this.device.type==="webgpu"&&e instanceof Float32Array))}_checkExternalBuffer(e){const{value:t}=e;if(!ArrayBuffer.isView(t))throw new Error(`Attribute ${this.id} value is not TypedArray`);const n=this.settings.defaultType;let s=!1;if(this.doublePrecision&&(s=t.BYTES_PER_ELEMENT<4),s)throw new Error(`Attribute ${this.id} does not support ${t.constructor.name}`);!(t instanceof n)&&this.settings.normalized&&!("normalized"in e)&&z.warn(`Attribute ${this.id} is normalized`)()}normalizeConstant(e){switch(this.settings.type){case"snorm8":return new Float32Array(e).map(t=>(t+128)/255*2-1);case"snorm16":return new Float32Array(e).map(t=>(t+32768)/65535*2-1);case"unorm8":return new Float32Array(e).map(t=>t/255);case"unorm16":return new Float32Array(e).map(t=>t/65535);default:return e}}_normalizeValue(e,t,n){const{defaultValue:s,size:r}=this.settings;if(Number.isFinite(e))return t[n]=e,t;if(!e){let o=r;for(;--o>=0;)t[n+o]=s[o];return t}switch(r){case 4:t[n+3]=Number.isFinite(e[3])?e[3]:s[3];case 3:t[n+2]=Number.isFinite(e[2])?e[2]:s[2];case 2:t[n+1]=Number.isFinite(e[1])?e[1]:s[1];case 1:t[n+0]=Number.isFinite(e[0])?e[0]:s[0];break;default:let o=r;for(;--o>=0;)t[n+o]=Number.isFinite(e[o])?e[o]:s[o]}return t}_areValuesEqual(e,t){if(!e||!t)return!1;const{size:n}=this;for(let s=0;s<n;s++)if(e[s]!==t[s])return!1;return!0}_createBuffer(e){this._buffer&&this._buffer.destroy();const{isIndexed:t,type:n}=this.settings,s=this.device.type==="webgpu"&&!t?O.VERTEX|O.STORAGE|O.COPY_DST|O.COPY_SRC:(t?O.INDEX:O.VERTEX)|O.COPY_DST;return this._buffer=this.device.createBuffer({...this._buffer?.props,id:this.id,usage:s,indexType:t?n:void 0,byteLength:e}),this._buffer}}const Lu=[],Cu=[];function nn(i,e=0,t=1/0){let n=Lu;const s={index:-1,data:i,target:[]};return i?typeof i[Symbol.iterator]=="function"?n=i:i.length>0&&(Cu.length=i.length,n=Cu):n=Lu,(e>0||Number.isFinite(t))&&(n=(Array.isArray(n)?n:Array.from(n)).slice(e,t),s.index=e-1),{iterable:n,objectInfo:s}}function Oh(i){return i&&i[Symbol.asyncIterator]}function Bh(i,e){const{size:t,stride:n,offset:s,startIndices:r,nested:o}=e,a=i.BYTES_PER_ELEMENT,c=n?n/a:t,l=s?s/a:0,u=Math.floor((i.length-l)/c);return(f,{index:d,target:h})=>{if(!r){const _=d*c+l;for(let b=0;b<t;b++)h[b]=i[_+b];return h}const g=r[d],p=r[d+1]||u;let m;if(o){m=new Array(p-g);for(let _=g;_<p;_++){const b=_*c+l;h=new Array(t);for(let y=0;y<t;y++)h[y]=i[b+y];m[_-g]=h}}else if(c===t)m=i.subarray(g*t+l,p*t+l);else{m=new i.constructor((p-g)*t);let _=0;for(let b=g;b<p;b++){const y=b*c+l;for(let v=0;v<t;v++)m[_++]=i[y+v]}}return m}}const vT=[],Fn=[[0,1/0]];function wT(i,e){if(i===Fn||(e[0]<0&&(e[0]=0),e[0]>=e[1]))return i;const t=[],n=i.length;let s=0;for(let r=0;r<n;r++){const o=i[r];o[1]<e[0]?(t.push(o),s=r+1):o[0]>e[1]?t.push(o):e=[Math.min(o[0],e[0]),Math.max(o[1],e[1])]}return t.splice(s,0,e),t}const xT={interpolation:{duration:0,easing:i=>i},spring:{stiffness:.05,damping:.5}};function kh(i,e){if(!i)return null;Number.isFinite(i)&&(i={type:"interpolation",duration:i});const t=i.type||"interpolation";return{...xT[t],...e,...i,type:t}}class Dh extends bT{constructor(e,t){super(e,t,{startIndices:null,constantValue:null,lastExternalBuffer:null,binaryValue:null,binaryAccessor:null,needsUpdate:!0,needsRedraw:!1,layoutChanged:!1,updateRanges:Fn}),this.constant=!1,this.settings.update=t.update||(t.accessor?this._autoUpdater:void 0),Object.seal(this.settings),Object.seal(this.state),this._validateAttributeUpdaters()}get startIndices(){return this.state.startIndices}set startIndices(e){this.state.startIndices=e}needsUpdate(){return this.state.needsUpdate}needsRedraw({clearChangedFlags:e=!1}={}){const t=this.state.needsRedraw;return this.state.needsRedraw=t&&!e,t}layoutChanged(){return this.state.layoutChanged}setAccessor(e){var t;(t=this.state).layoutChanged||(t.layoutChanged=!_T(e,this.getAccessor())),super.setAccessor(e)}getUpdateTriggers(){const{accessor:e}=this.settings;return[this.id].concat(typeof e!="function"&&e||[])}supportsTransition(){return!!this.settings.transition}getTransitionSetting(e){if(!e||!this.supportsTransition())return null;const{accessor:t}=this.settings,n=this.settings.transition,s=Array.isArray(t)?e[t.find(r=>e[r])]:e[t];return kh(s,n)}setNeedsUpdate(e=this.id,t){if(this.state.needsUpdate=this.state.needsUpdate||e,this.setNeedsRedraw(e),t){const{startRow:n=0,endRow:s=1/0}=t;this.state.updateRanges=wT(this.state.updateRanges,[n,s])}else this.state.updateRanges=Fn}clearNeedsUpdate(){this.state.needsUpdate=!1,this.state.updateRanges=vT}setNeedsRedraw(e=this.id){this.state.needsRedraw=this.state.needsRedraw||e}allocate(e){const{state:t,settings:n}=this;if(n.noAlloc)return!1;if(n.update){const s=this.isConstant;return super.allocate(e,t.updateRanges!==Fn),t.layoutChanged||(t.layoutChanged=s&&this.device.type==="webgpu"),!0}return!1}updateBuffer({numInstances:e,data:t,props:n,context:s}){if(!this.needsUpdate())return!1;const{state:{updateRanges:r},settings:{update:o,noAlloc:a}}=this;let c=!0;if(o){for(const[l,u]of r)o.call(s,this,{data:t,startRow:l,endRow:u,props:n,numInstances:e});if(this.value)if(this.constant||!this.buffer||this.buffer.byteLength<this.value.byteLength+this.byteOffset){if(this.constant){const l=this.value;this.value=null,this.setConstantValue(s,l)}else this.setData({value:this.value,constant:this.constant});this.constant=!1}else for(const[l,u]of r){const f=Number.isFinite(l)?this.getVertexOffset(l):0,d=Number.isFinite(u)?this.getVertexOffset(u):a||!Number.isFinite(e)?this.value.length:e*this.size;super.updateSubBuffer({startOffset:f,endOffset:d})}this._checkAttributeArray()}else c=!1;return this.clearNeedsUpdate(),this.setNeedsRedraw(),c}setConstantValue(e,t){var n;if(t===void 0||typeof t=="function")return!1;const s=this.isConstant,r=this.settings.transform&&e?this.settings.transform.call(e,t):t,o=this.settings.defaultType;this.state.constantValue=this._normalizeValue(r,new o(this.size),0);const a=this.setData({constant:!0,value:r});if(this.device.type==="webgpu"){let c=this.state.constantValue;this.doublePrecision&&(c instanceof Float32Array||c instanceof Float64Array)&&(c=kn(c,{size:this.size}),this.setAccessor({...this.getAccessor(),stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}));let l=this._buffer;(!l||l.byteLength<c.byteLength)&&(l=this._createBuffer(c.byteLength)),l.write(c),(n=this.state).layoutChanged||(n.layoutChanged=!s),this.constant=!1}return a&&this.setNeedsRedraw(),this.clearNeedsUpdate(),!0}getConstantValue(){return this.isConstant?this.state.constantValue:null}setExternalBuffer(e){const{state:t}=this;return e?(this.clearNeedsUpdate(),t.lastExternalBuffer===e||(t.lastExternalBuffer=e,this.setNeedsRedraw(),this.setData(e)),!0):(t.lastExternalBuffer=null,!1)}setBinaryValue(e,t=null){const{state:n,settings:s}=this;if(!e)return n.binaryValue=null,n.binaryAccessor=null,!1;if(s.noAlloc)return!1;if(n.binaryValue===e)return this.clearNeedsUpdate(),!0;if(n.binaryValue=e,this.setNeedsRedraw(),s.transform||t!==this.startIndices){ArrayBuffer.isView(e)&&(e={value:e});const o=e;$(ArrayBuffer.isView(o.value),`invalid ${s.accessor}`);const a=!!o.size&&o.size!==this.size;return n.binaryAccessor=Bh(o.value,{size:o.size||this.size,stride:o.stride,offset:o.offset,startIndices:t,nested:a}),!1}return this.clearNeedsUpdate(),this.setData(e),!0}getVertexOffset(e){const{startIndices:t}=this;return(t?e<t.length?t[e]:this.numInstances:e)*this.size}getValue(){const e=this.settings.shaderAttributes,t=super.getValue();if(!e)return t;for(const n in e)Object.assign(t,super.getValue(n,e[n]));return t}getBufferLayout(e){this.state.layoutChanged=!1;const t=this.settings.shaderAttributes,n=super._getBufferLayout(),{stepMode:s}=this.settings;if(s==="dynamic"?n.stepMode=e?e.isInstanced?"instance":"vertex":"instance":n.stepMode=s??"vertex",!t)return n;for(const r in t){const o=super._getBufferLayout(r,t[r]);n.attributes.push(...o.attributes)}return n}_autoUpdater(e,{data:t,startRow:n,endRow:s,props:r,numInstances:o}){const{settings:a,state:c,value:l,size:u,startIndices:f}=e,{accessor:d,transform:h}=a,g=c.binaryAccessor||(typeof d=="function"?d:r[d]);$(typeof g=="function",`accessor "${d}" is not a function`);let p=e.getVertexOffset(n);const{iterable:m,objectInfo:_}=nn(t,n,s);for(const b of m){_.index++;let y=g(b,_);if(h&&(y=h.call(this,y)),f){const v=(_.index<f.length-1?f[_.index+1]:o)-f[_.index];if(y&&Array.isArray(y[0])){let w=p;for(const x of y)e._normalizeValue(x,l,w),w+=u}else y&&y.length>u?l.set(y,p):(e._normalizeValue(y,_.target,0),TE({target:l,source:_.target,start:p,count:v}));p+=v*u}else e._normalizeValue(y,l,p),p+=u}}_validateAttributeUpdaters(){const{settings:e}=this;if(!(e.noAlloc||typeof e.update=="function"))throw new Error(`Attribute ${this.id} missing update or accessor`)}_checkAttributeArray(){const{value:e}=this,t=Math.min(4,this.size);if(e&&e.length>=t){let n=!0;switch(t){case 4:n=n&&Number.isFinite(e[3]);case 3:n=n&&Number.isFinite(e[2]);case 2:n=n&&Number.isFinite(e[1]);case 1:n=n&&Number.isFinite(e[0]);break;default:n=!1}if(!n)throw new Error(`Illegal attribute generated for ${this.id}`)}}}const Fh=/^vertex-list<([^<>]+)>$/,zh=/^value-list<([^<>]+)>$/;function Nh(i){return Fh.test(i)}function $h(i){return zh.test(i)}function PT(i){const e=Fh.exec(i),t=zh.exec(i),n=e?.[1]??t?.[1]??i;try{ie.getVertexFormatInfo(n)}catch{throw new Error(`Unsupported GPUVector format ${i}`)}return n}function sn(i){const e=PT(i),t=Nh(i),n=$h(i),s=ie.getVertexFormatInfo(e),r=s.type,o=s.normalized,a=ET(r,o);return{format:i,elementFormat:e,vertexList:t,valueList:n,type:r,signedDataType:ST(e,r),primitiveType:a,components:s.components,byteLength:s.byteLength,integer:s.integer,signed:s.signed,normalized:o,...s.webglOnly?{webglOnly:!0}:{}}}function ET(i,e){if(e)return"f32";switch(i){case"float32":return"f32";case"float16":return"f16";case"uint8":case"uint16":case"uint32":return"u32";case"sint8":case"sint16":case"sint32":return"i32";default:throw new Error(`Unsupported GPUVector component type ${i}`)}}function ST(i,e){if(i==="unorm10-10-10-2")return"uint32";switch(e){case"unorm8":return"uint8";case"snorm8":return"sint8";case"unorm16":return"uint16";case"snorm16":return"sint16";default:return e}}class hs{buffer;format;length;byteOffset;byteStride;constructor(e){const t=ie.getVertexFormatInfo(e.format).byteLength,n=e.byteOffset??0,s=e.byteStride??t;if(Br(e.length,"GPUDataView length"),Br(n,"GPUDataView byteOffset"),Br(s,"GPUDataView byteStride"),s<t)throw new Error(`GPUDataView byteStride ${s} is smaller than ${e.format} byte length ${t}`);const r=e.length===0?0:(e.length-1)*s+t,o=n+r;if(!Number.isSafeInteger(r)||!Number.isSafeInteger(o))throw new Error("GPUDataView byte range must use safe integers");if(o>e.buffer.byteLength)throw new Error("GPUDataView exceeds its backing buffer byte length");this.buffer=e.buffer,this.format=e.format,this.length=e.length,this.byteOffset=n,this.byteStride=s}get elementByteLength(){return ie.getVertexFormatInfo(this.format).byteLength}get byteLength(){return this.length===0?0:(this.length-1)*this.byteStride+this.elementByteLength}}function Br(i,e){if(!Number.isSafeInteger(i)||i<0)throw new Error(`${e} must be a non-negative safe integer`)}function kr(i){return!!(i&&typeof i=="object"&&i.type==="struct")}function TT(i,e){const t=Object.entries(i);if(t.length===0)throw new Error("GPUData struct format must declare at least one field");return e==="packed"?LT(t):CT(t)}function LT(i){const e=[];let t=0,n=0;for(const[s,r]of i){const o=ie.getVertexFormatInfo(r);if(o.webglOnly)throw new Error(`Packed GPUData struct field "${s}" uses WebGL-only format ${r}`);t=Au(t,Math.min(4,o.byteLength)),e.push([s,Object.freeze({format:r,byteOffset:t,byteLength:o.byteLength})]),t+=o.byteLength,n+=o.components}return Object.freeze({type:"struct",layout:"packed",fields:Object.freeze(Object.fromEntries(e)),components:n,byteStride:Au(t,4),rowByteLength:t})}function CT(i){const e=Object.fromEntries(i.map(([o,a])=>[o,AT(a)])),t=wa(e,{layout:"wgsl-storage"}),n=[];let s=0,r=0;for(const[o,a]of i){const c=ie.getVertexFormatInfo(a),l=t.fields[o].offset*4;n.push([o,Object.freeze({format:a,byteOffset:l,byteLength:c.byteLength})]),s=Math.max(s,l+c.byteLength),r+=c.components}return Object.freeze({type:"struct",layout:"wgsl-storage",fields:Object.freeze(Object.fromEntries(n)),components:r,byteStride:t.byteLength,rowByteLength:s})}function AT(i){const e=ie.getVertexFormatInfo(i);switch(e.type){case"float32":return Tn("f32",e.components);case"sint32":return Tn("i32",e.components);case"uint32":return Tn("u32",e.components);default:{const t=Math.ceil(e.byteLength/4);return Tn("u32",t)}}}function Tn(i,e){return e===1?i:`vec${e}<${i}>`}function Au(i,e){return Math.ceil(i/e)*e}class MT{buffer;ownsDataBuffer;constructor(e,t){this.buffer=e,this.ownsDataBuffer=t}get ownsBuffer(){return this.ownsDataBuffer}transferBufferOwnership(e){if(e.buffer!==this.buffer)throw new Error("GPUData ownership can only be transferred to the same buffer");e.ownsDataBuffer=this.ownsDataBuffer,this.ownsDataBuffer=!1}destroy(){this.ownsDataBuffer&&(this.buffer.destroy(),this.ownsDataBuffer=!1)}}class IT extends MT{dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;readbackMetadata;valueOffsets;nullBitmap;valueByteLength;constructor(e){const{buffer:t,format:n,length:s,valueLength:r,stride:o,byteOffset:a=0,byteStride:c,rowByteLength:l,ownsBuffer:u=!1,readbackMetadata:f,valueOffsets:d,nullBitmap:h,valueByteLength:g,dataType:p}=e;super(t,u);let m;n?typeof n=="string"?m=n:m=TT(n,e.layout??"wgsl-storage"):m=void 0;const _=kr(m)?m:void 0,b=typeof m=="string"?sn(m):void 0;if(this.dataType=p,this.format=m,this.length=s,this.valueLength=r??s,this.stride=o??b?.components??_?.components??c??l??1,this.byteOffset=a,this.rowByteLength=l??_?.rowByteLength??b?.byteLength??c??this.stride,this.byteStride=c??_?.byteStride??this.rowByteLength,_){if(this.rowByteLength<_.rowByteLength)throw new Error(`GPUData rowByteLength ${this.rowByteLength} is smaller than struct format row byte length ${_.rowByteLength}`);if(this.byteStride<Math.max(_.byteStride,this.rowByteLength))throw new Error(`GPUData byteStride ${this.byteStride} is smaller than its struct row layout`)}this.readbackMetadata=f,this.valueOffsets=d,this.nullBitmap=h,this.valueByteLength=g}getChild(e){if(!kr(this.format))return null;const t=this.format.fields[e];return t?new hs({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}getChildAt(e){if(!kr(this.format))return null;const t=Object.values(this.format.fields)[e];return t?new hs({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}}const Uo=IT;class Ci{name;dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;bufferLayout;data=[];device;bufferProps;isAppendable=!1;ownsDataChunks=!0;ownedVectors=[];appendableByteLength=0;constructor(e){switch(e.type){case"buffer":{const{name:t,buffer:n,format:s,length:r,valueLength:o=r,byteOffset:a=0,ownsBuffer:c=!1}=e,{stride:l,byteStride:u,rowByteLength:f}=Mu(e);this.name=t,this.dataType=e.dataType,this.format=s,this.length=r,this.valueLength=o,this.stride=l,this.byteOffset=a,this.byteStride=u,this.rowByteLength=f,this.data.push(new Uo({buffer:n,format:s,length:r,valueLength:o,stride:l,byteOffset:a,byteStride:u,rowByteLength:f,ownsBuffer:c,dataType:e.dataType}));return}case"interleaved":{const{name:t,buffer:n,format:s,length:r,valueLength:o=r,byteOffset:a=0,byteStride:c,attributes:l,ownsBuffer:u=!1}=e;this.name=t,this.dataType=e.dataType,this.format=s,this.length=r,this.valueLength=o,this.stride=c,this.byteOffset=a,this.byteStride=c,this.rowByteLength=c,this.bufferLayout={name:t,byteStride:c,attributes:l},this.data.push(new Uo({buffer:n,format:s,length:r,valueLength:o,stride:c,byteOffset:a,byteStride:c,rowByteLength:c,ownsBuffer:u,dataType:e.dataType}));return}case"data":{const t=e.format??RT(e.data),n=t?sn(t):void 0,{name:s,data:r,stride:o=r[0]?.stride??n?.components??1,valueLength:a=r.reduce((d,h)=>d+h.valueLength,0),byteStride:c=r[0]?.byteStride??n?.byteLength,rowByteLength:l=r[0]?.rowByteLength??n?.byteLength,bufferLayout:u,ownsData:f=!1}=e;if(c===void 0||l===void 0)throw new Error("GPUVector requires format or explicit byte layout metadata");t&&OT(r,t),this.name=s,this.dataType=e.dataType,this.format=t,this.length=r.reduce((d,h)=>d+h.length,0),this.valueLength=a,this.stride=o,this.byteOffset=r.length===1?r[0].byteOffset:0,this.byteStride=c,this.rowByteLength=l,this.bufferLayout=u,this.ownsDataChunks=f,this.data.push(...r);return}case"appendable":{const{name:t,device:n,format:s,valueLength:r=0,bufferProps:o}=e,{stride:a,byteStride:c,rowByteLength:l}=Mu(e);this.name=t,this.dataType=e.dataType,this.format=s,this.length=0,this.valueLength=r,this.stride=a,this.byteOffset=0,this.byteStride=c,this.rowByteLength=l,this.device=n,this.bufferProps=o,this.isAppendable=!0;return}}}get ownsBuffer(){return this.ownsDataChunks&&this.data.some(e=>e.ownsBuffer)||this.ownedVectors.some(e=>e.ownsBuffer)}get capacityRows(){return this.isAppendable?this.length:void 0}get appendedByteLength(){return this.appendableByteLength}addData(e){if(this.format&&e.format!==this.format)throw new Error("GPUVector.addData() requires matching formats");if(e.byteStride!==this.byteStride)throw new Error("GPUVector.addData() requires matching byteStride");if(e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.addData() requires matching rowByteLength");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this}appendDataChunk(e,t=this.appendableByteLength+e.buffer.byteLength){if(!this.isAppendable)throw new Error("GPUVector.appendDataChunk() requires appendable vector storage");if(this.format&&e.format!==this.format)throw new Error("GPUVector.appendDataChunk() requires matching formats");if(e.byteStride!==this.byteStride||e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.appendDataChunk() requires matching byte layout metadata");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this.appendableByteLength=t,this}resetLastBatch(){if(!this.isAppendable)throw new Error("GPUVector.resetLastBatch() requires appendable vector storage");for(const e of this.data.splice(0))e.destroy();return this.length=0,this.valueLength=0,this.appendableByteLength=0,this}retainOwnedVectors(e){return this.ownedVectors.push(...e),this}transferBufferOwnership(e){const t=this.data[0],n=e.data[0];if(!t||!n||t.buffer!==n.buffer)throw new Error("GPUVector ownership can only be transferred to the same buffer");t.transferBufferOwnership(n)}destroy(){if(this.ownsDataChunks)for(const e of this.data)e.destroy();for(const e of this.ownedVectors.splice(0))e.destroy()}}function Mu(i){const e=i.format?sn(i.format):void 0,t=i.rowByteLength??i.byteStride??e?.byteLength;if(t===void 0)throw new Error("GPUVector requires format or explicit rowByteLength");return{stride:i.stride??e?.components??1,byteStride:i.byteStride??t,rowByteLength:t}}function RT(i){return i[0]?.format}function OT(i,e){if(i.find(n=>n.format!==e))throw new Error("GPUVector data chunks must share the declared format")}class BT{poolSize=20;bufferPools;constructor(){this.bufferPools=new Map}createOrReuse(e,t){if(t>e.limits.maxBufferSize)throw new Error(`Buffer pool cannot allocate ${t} bytes: device.limits.maxBufferSize is ${e.limits.maxBufferSize}`);const n=this.bufferPools.get(e),s=n?n.findIndex(o=>o.byteLength>=t):-1;if(s<0)return e.createBuffer({usage:O.VERTEX|O.STORAGE|O.COPY_DST|O.COPY_SRC,byteLength:t});const[r]=n.splice(s,1);return r}recycle(e){const t=e.device;this.bufferPools.has(t)||this.bufferPools.set(t,[]);const n=this.bufferPools.get(t),s=n.findIndex(r=>r.byteLength>e.byteLength);s<0?n.push(e):n.splice(s,0,e),this.purge()}purge(){for(const[e,t]of this.bufferPools){const n=e.isLost?0:this.poolSize;for(;t.length>n;)t.shift().destroy();t.length===0&&this.bufferPools.delete(e)}}}const me=new BT;class U{static get bufferPoolSize(){return me.poolSize}static set bufferPoolSize(e){if(!Number.isSafeInteger(e)||e<0)throw new Error("GPUDataEvaluator.bufferPoolSize must be a non-negative safe integer");me.poolSize=e,me.purge()}type;size;get offset(){return this._offset}get stride(){return this._stride}normalized;isConstant;length;get byteLength(){return this._byteLength}ValueType;source=null;format;_id;_destroyed=!1;_value;_offset;_stride;_byteLength;_gpuVector;_bufferOwnership="owned";_targetBuffer;static fromArray(e,{type:t,size:n=1,offset:s=0,stride:r=0,normalized:o=!1}){let a=t,c;if(Array.isArray(e)){a=a||"float32";const u=vi(a);c=new u(e)}else e instanceof Float64Array?(a="uint32",n*=2,s*=2,r*=2,c=new Uint32Array(e.buffer,e.byteOffset,e.byteLength/4)):(a=a||rd(e),c=e);const l=`<${a} * ${n}>`;return new U({id:l,type:a,size:n,offset:s,stride:r,normalized:o,value:c})}static fromConstant(e,t="float32"){const n=vi(t);let s;return Array.isArray(e)?s=`[${e.join(",")}]`:(s=String(e),e=[e]),new U({id:s,isConstant:!0,type:t,size:e.length,value:new n(e)})}static fromGPUData(e,t={}){DT(e);const n=new hs({buffer:e.buffer,format:e.format,length:e.length,byteOffset:e.byteOffset,byteStride:e.byteStride});return new U({...Ru(n),id:t.id,gpuData:e})}static fromGPUDataView(e,t={}){return new U({...Ru(e),id:t.id,buffer:e.buffer})}constructor(e){const{id:t,value:n,buffer:s,gpuData:r,format:o,source:a=null,isConstant:c=!1}=e;if(!a&&!n&&!s&&!r)throw new Error("GPUDataEvaluator must have a value source");let{type:l,size:u,offset:f,stride:d,normalized:h,length:g}=e;if(a instanceof U?(l=l??a.type,u=u??a.size,f=f??a.offset,d=d??a.stride,h=h??a.normalized,g=g??a.length):(u=u??1,f=f??0,h=h??!1,g=c?1:g),!l)throw new Error("GPUDataEvaluator: type not defined");if(this._id=t,this.type=l,this.size=u,this.ValueType=vi(this.type),this._offset=f,this._stride=d||this.ValueType.BYTES_PER_ELEMENT*u,this.normalized=h,this.source=a,this.format=o,g===void 0)if(c)g=1;else{if(!n)throw new Error("GPUDataEvaluator: length not defined");g=Math.ceil(n.byteLength/this.stride)}this.isConstant=c,this.length=g;const p=this.ValueType.BYTES_PER_ELEMENT*this.size;this._byteLength=g===0?0:(g-1)*this.stride+p,this._value=n,this._bufferOwnership=a instanceof U||s||r?"borrowed":"owned",r?this._gpuVector=new Ci({type:"data",name:this._id??"data",format:r.format,data:[r],stride:r.stride,byteStride:r.byteStride,rowByteLength:r.rowByteLength}):s&&(this._gpuVector=this.createGPUVectorView({buffer:s,name:this._id,format:this.format}))}get value(){return this._value||(this.source instanceof U?this.source.value:void 0)}get evaluated(){return!!this._gpuVector}get id(){return this._id}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}get buffer(){return Ln(this.gpuVector)}setTargetBuffer({buffer:e,byteOffset:t=0,byteStride:n=this.stride}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)throw new Error(`GPUDataEvaluator ${this} already evaluated`);if(!this.source||this.source instanceof U)throw new Error("GPUDataEvaluator target buffers require a deferred operation source");this._targetBuffer={buffer:e,byteOffset:t,byteStride:n}}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let n;if(this.source instanceof U){const s=await this.source.evaluate(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:Ln(s)}),this._gpuVector}if(n=this._getEvaluationBuffer(e),this._value)n.write(this._value);else{const s=await this.source.execute(e,n);if(!s.success)throw s.error||new Error(`${this.source} evaluation failed`);s.value&&(this._value=s.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:n}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let n;if(this.source instanceof U){const s=this.source.evaluateSync(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:Ln(s)}),this._gpuVector}if(n=this._getEvaluationBuffer(e),this._value)n.write(this._value);else{const s=this.source.executeSync(e,n);if(!s.success)throw s.error||new Error(`${this.source} evaluation failed`);s.value&&(this._value=s.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:n}),this._gpuVector}createGPUVectorView(e){const t=e.name??this._id??"vector",n=e.format??this.format??NT(this.type,this.size,this.normalized);if(e.interleaved){const s=typeof e.interleaved=="object"&&e.interleaved.attributes?e.interleaved.attributes:zT(this);return new Ci({type:"interleaved",name:t,buffer:e.buffer,format:e.format??this.format,length:this.length,byteOffset:this.offset,byteStride:this.stride,attributes:s,ownsBuffer:!1})}return new Ci({type:"buffer",name:t,buffer:e.buffer,format:n,length:this.length,stride:this.size,byteOffset:this.offset,byteStride:this.stride,rowByteLength:this.ValueType.BYTES_PER_ELEMENT*this.size,ownsBuffer:!1})}_getEvaluationBuffer(e){const t=this._targetBuffer;if(!t)return me.createOrReuse(e,this.byteLength);if(t.buffer.device!==e)throw new Error("GPUDataEvaluator target buffer belongs to a different device");const n=this.ValueType.BYTES_PER_ELEMENT*this.size,s=this.length===0?0:(this.length-1)*t.byteStride+n;if(t.byteOffset+s>t.buffer.byteLength)throw new Error("GPUDataEvaluator target buffer is too small for the output layout");return this._offset=t.byteOffset,this._stride=t.byteStride,this._byteLength=s,this._bufferOwnership="borrowed",this._targetBuffer=void 0,t.buffer}async readValue(e=0,t){const{ValueType:n}=this,{size:s,offset:r,stride:o,length:a}=this,c=n.BYTES_PER_ELEMENT*s;if(t=t??a,e=Math.max(0,Math.min(a,e)),t=Math.max(e,Math.min(a,t)),this._value)return kT(this,this._value,e,t);const l=t-e;if(l===0)return new n(0);const u=r+e*o,f=o===c?l*c:(l-1)*o+c,d=await this.buffer.readAsync(u,f),h=new n(d.buffer,d.byteOffset,d.byteLength/n.BYTES_PER_ELEMENT);if(o===c)return h;const g=new Uint8Array(c*l);for(let p=0;p<l;p++){const m=p*o;g.set(d.subarray(m,m+c),p*c)}return new n(g.buffer)}async ensureCPUValue(){const e=this.value;if(e)return e;const t=await this.buffer.readAsync(0,this.offset+this.byteLength);if(t.byteLength%this.ValueType.BYTES_PER_ELEMENT!==0)throw new Error(`${this} backing buffer byte length is not aligned to its scalar type`);const n=t.slice();return this._value=new this.ValueType(n.buffer,n.byteOffset,n.byteLength/this.ValueType.BYTES_PER_ELEMENT),this._value}ensureCPUValueSync(){const e=this.value;if(e)return e;throw new Error(`${this} CPU value is not available for synchronous evaluation`)}toString(){return this._id??this.source?.toString()??this.constructor.name}destroy(){this._gpuVector&&(this._bufferOwnership==="owned"&&me.recycle(Ln(this._gpuVector)),this._gpuVector=void 0),this._targetBuffer=void 0,this._destroyed=!0}}function kT(i,e,t,n){const{ValueType:s,size:r,offset:o,stride:a}=i,c=a/s.BYTES_PER_ELEMENT,l=o/s.BYTES_PER_ELEMENT,u=n-t;if(c===r){const d=l+t*c;return e.subarray(d,d+u*r)}const f=new s(u*r);for(let d=0;d<u;d++){const h=l+(t+d)*c;f.set(e.subarray(h,h+r),d*r)}return f}function Iu(i){if(i instanceof U)return i;if(typeof i=="number"||Array.isArray(i))return U.fromConstant(i);if(i instanceof Uo)return U.fromGPUData(i);if(i instanceof hs)return U.fromGPUDataView(i);throw new Error("getGPUDataEvaluator() requires GPUDataEvaluator, GPUData, GPUDataView, number, or number[]")}function DT(i){if(!i.format)throw new Error("GPUDataEvaluator.fromGPUData() requires GPUData format metadata");if(Nh(i.format)||$h(i.format))throw new Error("GPUDataEvaluator.fromGPUData() does not support variable-length input");const t=sn(i.format).byteLength;if(i.rowByteLength!==t)throw new Error(`GPUDataEvaluator.fromGPUData() requires rowByteLength ${t} for GPUData`)}function Ru(i){const e=sn(i.format),t=vi(e.signedDataType),n=t.BYTES_PER_ELEMENT*e.components;if(e.byteLength!==n)throw new Error(`GPUDataEvaluator does not support packed vertex format ${i.format}: ${e.byteLength} physical bytes cannot expose ${e.components} ${e.signedDataType} components`);if(i.byteOffset%t.BYTES_PER_ELEMENT!==0||i.byteStride%t.BYTES_PER_ELEMENT!==0)throw new Error(`GPUDataEvaluator requires ${i.format} offset and stride aligned to ${t.BYTES_PER_ELEMENT} bytes`);return{type:e.signedDataType,size:e.components,offset:i.byteOffset,stride:i.byteStride,normalized:e.normalized,length:i.length,format:i.format}}function Ln(i){const e=FT(i).buffer;return e instanceof Le?e.buffer:e}function FT(i){const[e,...t]=i.data;if(!e||t.length>0)throw new Error(`GPUDataEvaluator requires exactly one GPUData chunk for "${i.name}"`);return e}function zT(i){const e=[];return Uh(i,e,{byteOffset:0}),e}function Uh(i,e,t){const n=i.source;if(n&&!(n instanceof U)&&n.name==="interleave"){for(const s of Object.values(n.inputs))s instanceof U&&Uh(s,e,t);return}e.push({attribute:i.id??i.toString(),format:Gh(i.type,i.size,i.normalized),byteOffset:t.byteOffset}),t.byteOffset+=i.ValueType.BYTES_PER_ELEMENT*i.size}function Gh(i,e,t=!1){if(e<1||e>4)throw new Error(`Cannot synthesize a GPUVector vertex format with ${e} components`);let n=i;if(t)switch(i){case"uint8":n="unorm8";break;case"sint8":n="snorm8";break;case"uint16":n="unorm16";break;case"sint16":n="snorm16";break;case"float32":n="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${i}`)}return(n==="uint8"||n==="sint8"||n==="uint16"||n==="sint16"||n==="unorm8"||n==="snorm8"||n==="unorm16"||n==="snorm16")&&e===3?`${n}x3-webgl`:`${n}${e===1?"":`x${e}`}`}function NT(i,e,t=!1){return e>=1&&e<=4?Gh(i,e,t):void 0}class jt{gpuDataEvaluators;format;length;id;_gpuVector;_ownsGPUDataEvaluators;_destroyed=!1;static fromGPUVector(e){if(e.bufferLayout)throw new Error(`GPUVectorEvaluator.fromGPUVector() does not accept interleaved vector "${e.name}"`);if(e.data.length===0)throw new Error(`GPUVectorEvaluator.fromGPUVector() requires GPUData for "${e.name}"`);return new jt({id:e.name,gpuDataEvaluators:e.data.map(t=>U.fromGPUData(t,{id:e.name})),gpuVector:e,format:e.format})}static fromGPUDataEvaluators(e,t={}){return new jt({id:t.id,gpuDataEvaluators:e,format:t.format})}constructor({id:e,gpuDataEvaluators:t,gpuVector:n,format:s}){if(t.length===0)throw new Error("GPUVectorEvaluator requires at least one GPUData evaluator");$T(t),this.id=e,this.gpuDataEvaluators=t,this.format=s??t[0].format,this.length=t.reduce((r,o)=>r+o.length,0),this._gpuVector=n,this._ownsGPUDataEvaluators=!n}get evaluated(){return!!this._gpuVector}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}mapGPUData(e){return jt.fromGPUDataEvaluators(this.gpuDataEvaluators.map((t,n)=>e(t,n)),{id:this.id})}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const n=await Promise.all(this.gpuDataEvaluators.map(a=>a.evaluate(e,t))),s=n[0],r=n.map(Ou),o=t.format??this.format??s.format;return this._gpuVector=new Ci({type:"data",name:t.name??this.id??"vector",format:o,data:r,stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength,bufferLayout:s.bufferLayout}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const n=this.gpuDataEvaluators.map(a=>a.evaluateSync(e,t)),s=n[0],r=n.map(Ou),o=t.format??this.format??s.format;return this._gpuVector=new Ci({type:"data",name:t.name??this.id??"vector",format:o,data:r,stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength,bufferLayout:s.bufferLayout}),this._gpuVector}destroy(){if(this._ownsGPUDataEvaluators)for(const e of this.gpuDataEvaluators)e.destroy();this._gpuVector=void 0,this._destroyed=!0}toString(){return this.id??this.constructor.name}}function $T(i){const e=i[0];for(const t of i.slice(1))if(t.type!==e.type||t.size!==e.size||t.normalized!==e.normalized||t.format!==e.format)throw new Error("GPUVectorEvaluator requires matching GPUData evaluator layouts")}function Ou(i){const[e,...t]=i.data;if(!e||t.length>0)throw new Error(`GPUVectorEvaluator requires one GPUData chunk for "${i.name}"`);return e}const Qa={add:{arity:2,symbol:"arithmetic_add"},subtract:{arity:2,symbol:"arithmetic_subtract"},multiply:{arity:2,symbol:"arithmetic_multiply"},divide:{arity:2,symbol:"arithmetic_divide"},pow:{arity:2,symbol:"pow"},sqrt:{arity:1,symbol:"sqrt"},abs:{arity:1,symbol:"abs"},sin:{arity:1,symbol:"sin"},cos:{arity:1,symbol:"cos"},tan:{arity:1,symbol:"arithmetic_tan"},exp:{arity:1,symbol:"exp"},log:{arity:1,symbol:"log"}};function Ja({elementWise:i,func:e,inputs:t,output:n,outputBuffer:s}){const r=Array.isArray(t)?t:Object.values(t);for(const g of r)if(!g.value)throw new Error(`${g} does not have CPU value`);const o=n.length,a=n.size,c=new n.ValueType(o*a);for(let g=0;g<o;g++){const p=r.map(m=>oe(m,g));if(i)for(let m=0;m<a;m++)c[g*a+m]=e.apply(null,p.map(_=>_[m]));else e.call(null,c.subarray(g*a,g*a+a),...p)}const l=n.ValueType.BYTES_PER_ELEMENT,u=n.offset/l,f=n.stride/l,d=a;let h=c;if(u!==0||f!==d){h=new n.ValueType(u+n.byteLength/l);for(let g=0;g<o;g++){const p=g*d,m=u+g*f,_=c.subarray(p,p+a);h.set(_,m),s.write(_,m*l)}}else s.write(c);return{success:!0,value:h}}function oe(i,e){const t=i.value,n=i.size,s=i.offset/i.ValueType.BYTES_PER_ELEMENT,r=i.stride/i.ValueType.BYTES_PER_ELEMENT,o=i.isConstant?0:e,a=s+o*r,c=t.slice(a,a+n);if(!i.normalized)return c;const l=new Float32Array(n);for(let u=0;u<n;u++)l[u]=UT(c[u],i.type);return l}function UT(i,e){switch(e){case"uint8":return i/255;case"uint16":return i/65535;case"uint32":return i/4294967295;case"sint8":return Math.max(i/127,-1);case"sint16":return Math.max(i/32767,-1);case"sint32":return Math.max(i/2147483647,-1);case"float32":return i;default:throw new Error(`Unsupported normalized source type ${e}`)}}const GT=({inputs:i,output:e,target:t})=>{for(const s of Object.values(i.namedInputs))if(!s.value)throw new Error(`${s} does not have CPU value`);const n=new e.ValueType(e.length*e.size);for(let s=0;s<e.length;s++){const r=Object.fromEntries(Object.entries(i.namedInputs).map(([o,a])=>[o,oe(a,s)]));for(let o=0;o<e.size;o++)n[s*e.size+o]=Vh(i.expression,r,o)}return t.write(n),{success:!0,value:n}};function Vh(i,e,t){switch(i.kind){case"input":{const n=e[i.name];return t<n.length?n[t]:n.length===1?n[0]:0}case"literal":return Array.isArray(i.value)?i.value[t]??0:i.value;case"call":{VT(i.op,i.args.length);const n=i.args.map(s=>Vh(s,e,t));switch(i.op){case"add":return n[0]+n[1];case"subtract":return n[0]-n[1];case"multiply":return n[0]*n[1];case"divide":return n[0]/n[1];case"pow":return Math.pow(n[0],n[1]);case"sqrt":return Math.sqrt(n[0]);case"abs":return Math.abs(n[0]);case"sin":return Math.sin(n[0]);case"cos":return Math.cos(n[0]);case"tan":return Math.tan(n[0]);case"exp":return Math.exp(n[0]);case"log":return Math.log(n[0]);default:{const s=i.op;throw new Error(`Unsupported arithmetic op ${s}`)}}}default:{const n=i;throw new Error(`Unsupported expression node ${n.kind}`)}}}function VT(i,e){const t=Qa[i].arity;if(e!==t)throw new Error(`Arithmetic op '${i}' expects ${t} args, got ${e}`)}const jT=({inputs:i,output:e,target:t})=>{const{sourceValues:n}=i;if(!n.value)throw new Error(`${n} does not have CPU value`);const r=new e.ValueType(e.length*e.size);if(n.length===0)return{success:!1,error:new Error(`${n} is empty`)};for(let o=0;o<n.size;o++){const a=oe(n,0)[o],c=o*e.size,l=c+1;r[c]=a,r[l]=a;for(let u=1;u<n.length;u++){const f=oe(n,u)[o];f<r[c]&&(r[c]=f),f>r[l]&&(r[l]=f)}}return t.write(r),{success:!0,value:r}},WT=({inputs:i,output:e,target:t})=>Ja({func:(n,s)=>{const r=n.length/2,o=new Float64Array(s.buffer);for(let a=0;a<r;a++){const c=o[a];n[a]=Math.fround(c),n[a+r]=c-n[a]}return n},inputs:i,output:e,outputBuffer:t}),HT=async({inputs:i,output:e,target:t})=>{const{ids:n,sourceValues:s}=i,r=n.value,o=s.value;if(!r)throw new Error(`${n} does not have CPU value`);if(!o)throw new Error(`${s} does not have CPU value`);const a=new e.ValueType(e.length*e.size),c=new Array(e.size).fill(0);for(let l=0;l<e.length;l++){const u=oe(n,l),f=Number(u[0]),d=YT(f,s.length)?oe(s,f):c;a.set(d,l*e.size)}return t.write(a),{success:!0,value:a}};function YT(i,e){return Number.isInteger(i)&&i>=0&&i<e}const qT=({inputs:i,output:e,target:t})=>Ja({func:(n,...s)=>{let r=0;for(const o of s)n.set(o,r),r+=o.length},inputs:i,output:e,outputBuffer:t}),XT=({inputs:i,output:e,target:t})=>{const{x:n,y:s}=i,r=new e.ValueType(e.length);for(let o=0;o<e.length;o++){const a=oe(n,o),c=oe(s,o);let l=0;for(let u=0;u<n.size;u++)l+=a[u]*c[u];r[o]=l}return t.write(r),{success:!0,value:r}},ZT=({inputs:i,output:e,target:t})=>{const{x:n,y:s}=i,r=new e.ValueType(e.length);for(let o=0;o<e.length;o++){const a=oe(n,o),c=oe(s,o);let l=1;for(let u=0;u<n.size;u++)if(a[u]!==c[u]){l=0;break}r[o]=l}return t.write(r),{success:!0,value:r}},KT=({inputs:i,output:e,target:t})=>{const{x:n}=i,s=new e.ValueType(e.length);for(let r=0;r<e.length;r++){const o=oe(n,r);let a=0;for(let c=0;c<n.size;c++)a+=o[c]*o[c];s[r]=Math.sqrt(a)}return t.write(s),{success:!0,value:s}},QT=async({inputs:i,output:e,target:t})=>{const{segments:n,vertexCount:s}=i,r=n.value;if(!r)throw new Error(`${n} does not have CPU value`);JT(r,n,s);const o=new e.ValueType(e.length*e.size);let a=0;for(let c=0;c<s;c++){for(;a+1<n.length&&r[Go(n,a+1)]<=c;)a++;const l=r[Go(n,a)],u=c*e.size;o[u]=a,o[u+1]=c-l}return t.write(o),{success:!0,value:o}};function JT(i,e,t){if(e.length<1)throw new Error("segmentedMap segments must contain at least one segment start");let n=0;for(let s=0;s<e.length;s++){const r=i[Go(e,s)];if(s===0&&r!==0)throw new Error(`segmentedMap segments must start at 0, got ${r}`);if(s>0&&r<n)throw new Error(`segmentedMap segments must be non-decreasing, got ${r} after ${n}`);n=r}if(n>t)throw new Error(`segmentedMap last segment start must be <= vertexCount, got ${n} > ${t}`)}function Go(i,e){return i.offset/i.ValueType.BYTES_PER_ELEMENT+e*(i.stride/i.ValueType.BYTES_PER_ELEMENT)}const e1=async({inputs:i,output:e,target:t})=>{const{condition:n,whenTrue:s,whenFalse:r}=i,o=new e.ValueType(e.length*e.size);for(let a=0;a<e.length;a++){const c=oe(n,a),l=oe(s,a),u=oe(r,a);for(let f=0;f<e.size;f++){const d=Dr(c,n.size,f);o[a*e.size+f]=d!==0?Dr(l,s.size,f):Dr(u,r.size,f)}}return t.write(o),{success:!0,value:o}};function Dr(i,e,t){return t<e?i[t]:e===1?i[0]:0}const t1=({inputs:i,output:e,target:t})=>{const n=new e.ValueType(e.length);for(let s=0;s<e.length;s++)n[s]=i.start+s*i.step;return t.write(n),{success:!0,value:n}},i1=({inputs:i,output:e,target:t})=>{const{columns:n}=i;return Ja({func:(s,r)=>{for(let o=0;o<n.length;o++)s[o]=r[n[o]]},inputs:{x:i.x},output:e,outputBuffer:t})},n1=Object.freeze(Object.defineProperty({__proto__:null,arithmetic:GT,dot:XT,equalAll:ZT,extent:jT,fround:WT,gather:HT,interleave:qT,length:KT,segmentedMap:QT,select:e1,sequence:t1,swizzle:i1},Symbol.toStringTag,{value:"Module"}));class s1{_modules={cpu:n1};add(e,t){const n=this._modules[e];if(typeof t.then=="function"){const r=Promise.all([Promise.resolve(n||{}),t]).then(([o,a])=>({...o,...a}));return this._modules[e]=r,r.then(o=>{this._modules[e]=o}).catch(o=>{P.error(`Failed to register ${e} backend: ${o}`)()}),r}if(n&&typeof n.then=="function"){const r=Promise.resolve(n).then(o=>({...o,...t})).then(o=>(this._modules[e]=o,o)).catch(o=>{throw P.error(`Failed to register ${e} backend: ${o}`)(),o});return this._modules[e]=r,r}const s={...n||{},...t};return this._modules[e]=s,Promise.resolve(s)}async get(e,t){let n=this._modules[e];if(!n)if(e==="webgl")n=this.add("webgl",fs(()=>Promise.resolve().then(()=>VM),void 0));else if(e==="webgpu")n=this.add("webgpu",fs(()=>Promise.resolve().then(()=>iL),void 0));else throw new Error(`${e} backend not registered`);const r=(await n)[t];if(typeof r!="function")throw new Error(`${e} backend does not implement ${t}`);return r}getSync(e,t){const n=this._modules[e];if(!n)throw new Error(`${e} backend not registered`);if(typeof n.then=="function")throw new Error(`${e} backend is not loaded yet`);const r=n[t];if(typeof r!="function")throw new Error(`${e} backend does not implement ${t}`);return r}clear(){this._modules={}}}const Vo=new s1;class r1{inputs;dependencies;constructor(e){this.inputs=e,this.dependencies=Array.from(e instanceof Array?e:Object.values(e)).filter(t=>t instanceof U)}async execute(e,t){return await this._resolveDependencies(e),await this._executeWithHandler(await Vo.get(this._getHandlerRegistry(e),this.name),t)}executeSync(e,t){this._resolveDependenciesSync(e);const n=this._executeWithHandler(Vo.getSync(this._getHandlerRegistry(e),this.name),t);if(o1(n))throw new Error(`${this.name} returned a Promise in executeSync()`);return n}shouldExecuteOnCPU(){return this.output.length<=1&&Array.from(this.dependencies).every(e=>!!e.value)}_getHandlerRegistry(e){return this.shouldExecuteOnCPU()?"cpu":e.type}async _resolveDependencies(e){for(const n of this.dependencies)await n.evaluate(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const n of this.dependencies)await n.ensureCPUValue()}_resolveDependenciesSync(e){for(const n of this.dependencies)n.evaluateSync(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const n of this.dependencies)n.ensureCPUValueSync()}_executeWithHandler(e,t){return e({device:t.device,inputs:this.inputs,output:this.output,target:t})}}function o1(i){return typeof i?.then=="function"}function jh(i,{operations:e,inputs:t}){switch(i.kind){case"input":if(!(i.name in t))throw new Error(`Unknown expression input '${i.name}'`);return;case"literal":if(Array.isArray(i.value)){for(const n of i.value)if(!Number.isFinite(n))throw new Error(`Expression literal array must contain only finite values, got ${n}`)}else if(!Number.isFinite(i.value))throw new Error(`Expression literal must be finite, got ${i.value}`);return;case"call":{const n=e[i.op];if(!n)throw new Error(`Unknown expression op '${i.op}'`);if(i.args.length!==n.arity)throw new Error(`Expression op '${i.op}' expects ${n.arity} args, got ${i.args.length}`);for(const s of i.args)jh(s,{operations:e,inputs:t});return}default:{const n=i;throw new Error(`Unsupported expression node ${n.kind}`)}}}function Wh(i,e){return jh(i,e),Hh(i,e)}function Hh(i,e){switch(i.kind){case"input":{const t=e.inputs[i.name];return e.laneIndex<t.size?e.formatInput(i.name):e.formatOutOfBoundsInput(i.name)}case"literal":return e.formatLiteral(i.value);case"call":{const t=e.operations[i.op],n=i.args.map(s=>Hh(s,e));return e.formatCall(t.symbol,n)}default:{const t=i;throw new Error(`Unsupported expression node ${t.kind}`)}}}function a1(...i){let e=c1(i.map(t=>t.type));return e[0]!=="f"&&i.some(t=>t.normalized)&&(e="float32"),{isConstant:i.every(t=>t.isConstant),type:e,size:i.reduce((t,n)=>Math.max(t,n.size),0),length:i.reduce((t,n)=>Math.max(t,n.length),0)}}function c1(i){let e=0,t=0;for(const n of i){if(n[0]==="f")return"float32";const s=n.endsWith("8")?8:n.endsWith("6")?16:32;n[0]==="u"?e=Math.max(e,s):t=Math.max(t,s)}return e&&!t?`uint${e}`:t&&e<32?`sint${Math.max(t,e*2)}`:"float32"}class l1 extends r1{name="interleave";output;constructor(e){super(e);const{isConstant:t,type:n,length:s}=a1(...e);this.output=new U({isConstant:t,type:n,size:e.reduce((r,o)=>r+o.size,0),length:s,source:this})}toString(){return`_${this.inputs.join("_")}_`}}function u1(...i){if(i.length===0)throw new Error("interleave() requires at least one input");return i.length===1?Iu(i[0]):new l1(i.map(Iu)).output}function f1(i,e){const t=h1(e);for(const n of t)n.evaluateSync(i);return d1(t),e}function d1(i){const e=new Set(i.flatMap(p1)),t=new Set;for(const n of i)zn(n,t);for(const n of t)n.evaluated&&!e.has(n.buffer)&&n.destroy()}function h1(i){const e=new Set;return jo(i,e,new Set),Array.from(e)}function jo(i,e,t){if(m1(i)){e.add(i);return}if(!(!i||typeof i!="object"||t.has(i))){if(t.add(i),Array.isArray(i)){for(const n of i)jo(n,e,t);return}if(g1(i))for(const n of Object.values(i))jo(n,e,t)}}function g1(i){const e=Object.getPrototypeOf(i);return e===Object.prototype||e===null}function zn(i,e){if(i instanceof jt){for(const n of i.gpuDataEvaluators)zn(n,e);return}const t=i.source;if(t){if(t instanceof U){e.has(t)||(e.add(t),zn(t,e));return}for(const n of t.dependencies)e.has(n)||(e.add(n),zn(n,e))}}function p1(i){return i instanceof U?[i.buffer]:i.gpuVector.data.map(e=>e.buffer instanceof Le?e.buffer.buffer:e.buffer)}function m1(i){return i instanceof U||i instanceof jt}const _1=65535;function rn(i,e){const t=y1(e),n=Math.max(1,Math.ceil(i)),s=Math.min(n,t),r=Math.min(Math.ceil(n/s),t),o=Math.ceil(n/s/r);if(o>t)throw new Error(`WebGPU dispatch requires ${n} workgroups, exceeding the 3D dispatch limit of ${t} per dimension`);return{x:s,y:r,z:o}}function Yh(i,e="workgroupId"){return`((${e}.z * ${i.y}u + ${e}.y) * ${i.x}u + ${e}.x)`}function zs(i,e,t="workgroupId",n="localId"){return`(${Yh(i,t)} * ${e}u + ${n}.x)`}function y1(i){return Number.isFinite(i)&&i>0?Math.floor(i):_1}function Gi(i,e){switch(i){case"u32":return`${e}u`;case"f32":return Number.isInteger(e)?`${e}.0`:`${e}`;default:return`${e}`}}function b1(i,e){switch(i){case"uint32":return Gi("u32",Math.trunc(e));case"sint32":return`${Math.trunc(e)}`;case"float32":return Gi("f32",e);default:throw new Error(`WebGPU operations only support 32-bit output types, got ${i}`)}}function Ns(i){switch(i){case"uint32":return"0u";case"sint32":return"0";case"float32":return"0.0";default:throw new Error(`WebGPU operations only support 32-bit output types, got ${i}`)}}function q(i){switch(i){case"uint32":return"u32";case"sint32":return"i32";case"float32":return"f32";default:throw new Error(`WebGPU operations only support 32-bit storage types, got ${i}`)}}const Fr=64,v1="GPGPU Operation Counts",w1="Computation Runs",x1=new qt;function et({module:i,elementWise:e=!1,expression:t,inputs:n,output:s,operationType:r=s.type,outputBuffer:o}){if(!i.source)throw new Error(`WebGPU computation ${i.name} requires WGSL source`);const a=C1(n),c=a.map(([b,y])=>({name:b,input:y})),l=c.filter(({input:b})=>!b.isConstant).map((b,y)=>({...b,index:y})),u=q(r),f=q(s.type),d={TYPE:u,RESULT_LEN:s.size.toString()},h=rn(Math.ceil(s.length/Fr),o.device.limits.maxComputeWorkgroupsPerDimension);for(const[b,y]of a)d[`${b.toUpperCase()}_LEN`]=y.size.toString();const g=`
${M1(i.source,d)}
${l.map(({name:b,input:y,index:v})=>P1(b,y,v)).join(`
`)}
${c.map(({name:b,input:y})=>E1(b,y,r)).join(`
`)}
${S1(s,l.length)}
${T1(s)}

@compute @workgroup_size(${Fr}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${zs(h,Fr)};
  if (rowIndex >= ${s.length}u) {
    return;
  }

${c.map(({name:b})=>`  let ${b} = read_${b}(rowIndex);`).join(`
`)}
  var result: array<${f}, ${s.size}>;
${L1(i.name,a,s,e,t)}
  write_result(rowIndex, result);
}
`,p=new St(o.device,{source:g,modules:i.dependencies,shaderAssembler:x1,shaderLayout:{bindings:[...l.map(({name:b},y)=>({name:b,type:"storage",group:0,location:y})),{name:"result",type:"storage",group:0,location:l.length}]}}),m=Object.fromEntries(l.map(({name:b,input:y})=>[b,y.buffer]));m.result=o,p.setBindings(m);const _=o.device.beginComputePass({});o.device.statsManager.getStats(v1).get(w1).incrementCount(),p.dispatch(_,h.x,h.y,h.z),_.end(),o.device.submit(),p.destroy()}function P1(i,e,t){if(e.isConstant)return"";const n=q(e.type);return`@group(0) @binding(${t}) var<storage, read> ${i}: array<${n}>;`}function E1(i,e,t){const n=q(t),s=e.type===t?"":n,r=e.stride/e.ValueType.BYTES_PER_ELEMENT,o=e.offset/e.ValueType.BYTES_PER_ELEMENT;return e.isConstant?`fn read_${i}(_rowIndex: u32) -> array<${n}, ${e.size}> {
  return array<${n}, ${e.size}>(${A1(e,s)});
}`:`fn read_${i}(rowIndex: u32) -> array<${n}, ${e.size}> {
  var value: array<${n}, ${e.size}>;
  let rowOffset = ${o}u + rowIndex * ${r}u;
${Array.from({length:e.size},(a,c)=>s?`  value[${c}] = ${s}(${i}[rowOffset + ${c}u]);`:`  value[${c}] = ${i}[rowOffset + ${c}u];`).join(`
`)}
  return value;
}`}function S1(i,e){const t=q(i.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${t}>;`}function T1(i){const e=i.stride/i.ValueType.BYTES_PER_ELEMENT,t=i.offset/i.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${q(i.type)}, ${i.size}>) {
  let rowOffset = ${t}u + rowIndex * ${e}u;
${Array.from({length:i.size},(s,r)=>`  result[rowOffset + ${r}u] = value[${r}];`).join(`
`)}
}`}function L1(i,e,t,n,s){let r="";if(s)for(let o=0;o<t.size;o++)r+=`  result[${o}] = ${s(o)};
`;else if(n){const o=Ns(t.type),a=q(t.type);for(let c=0;c<t.size;c++){const l=e.map(([u,f])=>c<f.size?q(f.type)===a?`${u}[${c}]`:`${a}(${u}[${c}])`:o);r+=`  result[${c}] = ${i}(${l.join(", ")});
`}}else r+=`result = ${i}(${e.map(([o])=>o).join(", ")});`;return r.trimEnd()}function C1(i){return Array.isArray(i)?i.map((e,t)=>[`x${t}`,e]):Object.entries(i)}function A1(i,e){const t=i.value;if(!t)throw new Error(`Constant input ${i} is missing CPU values`);return Array.from({length:i.size},(n,s)=>Gi(e,t[s]??0)).join(", ")}function M1(i,e){for(const t in e)i=i.replaceAll(`{${t}}`,e[t]);return i}const I1=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x + y;
}

fn arithmetic_subtract(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x - y;
}

fn arithmetic_multiply(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x * y;
}

fn arithmetic_divide(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x / y;
}

fn arithmetic_tan(x: f32) -> f32 {
  return tan_fp32(x);
}
`,R1=({inputs:i,output:e,target:t})=>{const n=e.type,s=q(n),r=Ns(n),o=i.namedInputs;return et({module:{name:"arithmetic",source:I1,dependencies:[ka]},inputs:o,output:e,operationType:n,outputBuffer:t,expression:a=>Wh(i.expression,{operations:Qa,inputs:o,laneIndex:a,formatInput:c=>`${c}[${a}]`,formatOutOfBoundsInput:c=>o[c].size===1?`${c}[0]`:r,formatLiteral:c=>{const l=Array.isArray(c)?c[a]??0:c;return`${s}(${b1(n,l)})`},formatCall:(c,l)=>`${c}(${l.join(", ")})`})}),{success:!0}},O1=`fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,B1=({inputs:i,output:e,target:t})=>(et({module:{name:"row_dot",source:O1},inputs:i,output:e,operationType:"float32",outputBuffer:t}),{success:!0}),k1=`fn equalAll(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<u32, 1> {
  var allEqual = 1u;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    if (x[i] != y[i]) {
      allEqual = 0u;
      break;
    }
  }
  return array<u32, 1>(allEqual);
}
`,D1=({inputs:i,output:e,target:t})=>(et({module:{name:"equalAll",source:k1},inputs:i,output:e,operationType:i.x.type,outputBuffer:t}),{success:!0}),de=64;function ec(i,e,t){const n=q(e.type);return`@group(0) @binding(${t}) var<storage, read> ${i}: array<${n}>;`}function qh(i,e,t,n=i){const s=q(t);if(e.isConstant){const l=e.value;if(!l)throw new Error(`Constant input ${e} is missing CPU values`);return`fn read_${n}(_sourceIndex: u32) -> array<${s}, ${e.size}> {
  return array<${s}, ${e.size}>(${Array.from({length:e.size},(u,f)=>Gi(s,l[f]??0)).join(", ")});
}`}const r=e.stride/e.ValueType.BYTES_PER_ELEMENT,o=e.offset/e.ValueType.BYTES_PER_ELEMENT,c=q(e.type)===s?"":`${s}`;return`fn read_${n}(sourceIndex: u32) -> array<${s}, ${e.size}> {
  var value: array<${s}, ${e.size}>;
  let rowOffset = ${o}u + sourceIndex * ${r}u;
${Array.from({length:e.size},(l,u)=>c?`  value[${u}] = ${c}(${i}[rowOffset + ${u}u]);`:`  value[${u}] = ${i}[rowOffset + ${u}u];`).join(`
`)}
  return value;
}`}function Xh(i,e){return qh("sourceValues",i,e,"source_values")}function tc(i,e){const t=q(i.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${t}>;`}function ic(i){const e=i.stride/i.ValueType.BYTES_PER_ELEMENT,t=i.offset/i.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${q(i.type)}, ${i.size}>) {
  let rowOffset = ${t}u + rowIndex * ${e}u;
${Array.from({length:i.size},(s,r)=>`  result[rowOffset + ${r}u] = value[${r}];`).join(`
`)}
}`}function F1(i,e){const t=Ns(i);return`fn zero_result() -> array<${q(i)}, ${e}> {
  var result: array<${q(i)}, ${e}>;
${Array.from({length:e},(n,s)=>`  result[${s}] = ${t};`).join(`
`)}
  return result;
}`}const z1=({inputs:i,output:e,target:t})=>{const{sourceValues:n}=i;if(n.length===0){const c=new e.ValueType(e.length*e.size);return t.write(c),{success:!0,value:c}}if(n.isConstant){const c=n.value;if(!c)throw new Error(`Constant input ${n} is missing CPU values`);const l=new e.ValueType(e.length*e.size);for(let u=0;u<e.length;u++){const f=c[u];l[u*2]=f,l[u*2+1]=f}return t.write(l),{success:!0,value:l}}const s=[];let r=n,o="raw",a=n.length;try{for(;;){const c=Math.ceil(a/de),l=e.length*c,u=c===1?t:me.createOrReuse(t.device,l*e.stride);if(c>1&&s.push(u),N1({input:r,inputMode:o,inputGroupCount:a,channelCount:e.length,outputType:e.type,outputBuffer:u,outputLength:l,outputStride:e.stride,outputOffset:e.offset}),c===1)break;r=new U({buffer:u,type:e.type,size:2,length:l}),o="partial",a=c}return{success:!0}}finally{for(const c of s)me.recycle(c)}};function N1({input:i,inputMode:e,inputGroupCount:t,channelCount:n,outputType:s,outputBuffer:r,outputLength:o,outputStride:a,outputOffset:c}){const l=q(s),u=rn(o,r.device.limits.maxComputeWorkgroupsPerDimension),f=new U({buffer:r,type:s,size:2,length:o,stride:a,offset:c}),d=`
${i.isConstant?"":ec("sourceValues",i,0)}
${Xh(i,s)}
${tc(f,i.isConstant?0:1)}
${ic(f)}
${$1(e,s,n,t)}

var<workgroup> sharedMin: array<${l}, ${de}>;
var<workgroup> sharedMax: array<${l}, ${de}>;

@compute @workgroup_size(${de}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${Yh(u)};
  if (outputRowIndex >= ${o}u) {
    return;
  }

  let channelIndex = outputRowIndex % ${n}u;
  let outputGroupIndex = outputRowIndex / ${n}u;
  let inputGroupIndex = outputGroupIndex * ${de}u + localId.x;

  let result = extent_pass(channelIndex, inputGroupIndex);
  sharedMin[localId.x] = result[0];
  sharedMax[localId.x] = result[1];
  workgroupBarrier();

  var stride = ${Math.floor(de/2)}u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (localId.x < stride) {
      let compareIndex = localId.x + stride;
      if (sharedMin[compareIndex] < sharedMin[localId.x]) {
        sharedMin[localId.x] = sharedMin[compareIndex];
      }
      if (sharedMax[compareIndex] > sharedMax[localId.x]) {
        sharedMax[localId.x] = sharedMax[compareIndex];
      }
    }
    workgroupBarrier();
    stride = stride / 2u;
  }

  if (localId.x == 0u) {
    write_result(outputRowIndex, array<${l}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,h=new St(r.device,{source:d,shaderLayout:{bindings:[...i.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:i.isConstant?0:1}]}}),g={result:r};i.isConstant||(g.sourceValues=i.buffer),h.setBindings(g);const p=r.device.beginComputePass({});h.dispatch(p,u.x,u.y,u.z),p.end(),r.device.submit(),h.destroy()}function $1(i,e,t,n){const s=q(e),[r,o]=U1(e);return i==="raw"?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${r};
  result[1] = ${o};

  if (inputGroupIndex < ${n}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${r};
  result[1] = ${o};

  if (inputGroupIndex < ${n}u) {
    let rowIndex = inputGroupIndex * ${t}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}function U1(i){switch(i){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw new Error(`Unsupported WebGPU extent type for ${i}`)}}function G1(){const i=new Uint16Array([255]);return new Uint8Array(i.buffer)[0]>0}const V1=`const LE: bool = ${G1()?"true":"false"};
const F32_NAN: u32 = 0xffffffffu;
const F32_INF: u32 = 0x7f800000u;

fn roundShiftRight(value: u32, shift: i32) -> u32 {
  if (shift <= 0) {
    return value << u32(-shift);
  }

  if (shift >= 32) {
    if (shift == 32 && value > 0x80000000u) {
      return 1u;
    }
    return 0u;
  }

  let shiftU32 = u32(shift);
  let truncated = value >> shiftU32;
  let halfShift = 1u << u32(shift - 1);
  let remainder = value & ((1u << shiftU32) - 1u);
  if (remainder > halfShift || (remainder == halfShift && (truncated & 1u) == 1u)) {
    return truncated + 1u;
  }
  return truncated;
}

fn makeFloatImmediate(sign: u32, exponent: i32, mantissa: u32) -> u32 {
  return (sign << 31u) | (u32(exponent + 127) << 23u) | (mantissa & 0x7fffffu);
}

fn makeFloat(sign: u32, exponent: i32, significand: u32) -> u32 {
  if (significand == 0u) {
    return sign << 31u;
  }

  let leadingZeros = i32(countLeadingZeros(significand));
  var normalizedExponent = exponent + 31 - leadingZeros;

  if (normalizedExponent > 127) {
    return (sign << 31u) | F32_INF;
  }

  var mantissa: u32;
  if (normalizedExponent >= -126) {
    mantissa = roundShiftRight(significand, 8 - leadingZeros);
    if (mantissa >= 0x1000000u) {
      mantissa = mantissa >> 1u;
      normalizedExponent += 1;
      if (normalizedExponent > 127) {
        return (sign << 31u) | F32_INF;
      }
    }
    return makeFloatImmediate(sign, normalizedExponent, mantissa);
  }

  let subnormalShift = -149 - exponent;
  mantissa = roundShiftRight(significand, subnormalShift);
  if (mantissa >= 0x800000u) {
    return (sign << 31u) | (1u << 23u);
  }
  return (sign << 31u) | mantissa;
}

fn parseAsDouble(words: vec2<u32>) -> vec2<u32> {
  var d = words;
  if (LE) {
    d = d.yx;
  }

  let sign = (d.x >> 31u) & 1u;
  let exponentBits = (d.x >> 20u) & 0x7ffu;
  let exponent = i32(exponentBits) - 1023;
  let fractionHigh = d.x & 0xfffffu;
  let fractionLow = d.y;

  if (exponentBits == 0x7ffu) {
    if (fractionHigh == 0u && fractionLow == 0u) {
      return vec2<u32>((sign << 31u) | F32_INF, F32_NAN);
    }
    return vec2<u32>(F32_NAN);
  }

  if (exponentBits == 0u) {
    return vec2<u32>(sign << 31u);
  }

  if (exponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highSignificand = 0x800000u | (fractionHigh << 3u) | (fractionLow >> 29u);
  let lowSignificand = fractionLow & 0x1fffffffu;

  if (exponent < -126) {
    let highPart = makeFloat(sign, exponent - 23, highSignificand);
    let lowPart = makeFloat(sign, exponent - 52, lowSignificand);
    return vec2<u32>(highPart, lowPart);
  }

  let roundUp = lowSignificand > 0x10000000u ||
    (lowSignificand == 0x10000000u && (highSignificand & 1u) == 1u);

  var roundedSignificand = highSignificand + select(0u, 1u, roundUp);
  var highExponent = exponent;
  if (roundedSignificand == 0x1000000u) {
    roundedSignificand = 0x800000u;
    highExponent += 1;
  }

  if (highExponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highPart = makeFloatImmediate(sign, highExponent, roundedSignificand);

  var remainder = i32(lowSignificand);
  var lowSign = sign;
  if (roundUp) {
    remainder -= 0x20000000;
  }
  if (remainder < 0) {
    lowSign = 1u - sign;
    remainder = -remainder;
  }

  let lowPart = makeFloat(lowSign, exponent - 52, u32(remainder));
  return vec2<u32>(highPart, lowPart);
}

fn fround(x: array<u32, {X_LEN}>) -> array<f32, {RESULT_LEN}> {
  var result: array<f32, {RESULT_LEN}>;
  let n = {X_LEN}u / 2u;
  for (var i = 0u; i < n; i = i + 1u) {
    let parts = parseAsDouble(vec2<u32>(x[i * 2u], x[i * 2u + 1u]));
    result[i] = bitcast<f32>(parts.x);
    result[i + n] = bitcast<f32>(parts.y);
  }
  return result;
}
`,j1=({inputs:i,output:e,target:t})=>(et({module:{name:"fround",source:V1},inputs:i,output:e,operationType:"uint32",outputBuffer:t}),{success:!0}),W1=async({inputs:i,output:e,target:t})=>{const{ids:n,sourceValues:s}=i,r=q(n.type),o=[];n.isConstant||o.push({name:"ids",input:n,index:o.length}),s.isConstant||o.push({name:"sourceValues",input:s,index:o.length});const a=rn(Math.ceil(e.length/de),t.device.limits.maxComputeWorkgroupsPerDimension),c=`
${o.map(({name:d,input:h,index:g})=>ec(d,h,g)).join(`
`)}
${H1(n,r)}
${Xh(s,e.type)}
${tc(e,o.length)}
${ic(e)}
${F1(e.type,e.size)}
${Y1(n.type,e.type,e.size,s.length)}

@compute @workgroup_size(${de}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${zs(a,de)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,l=new St(t.device,{source:c,shaderLayout:{bindings:[...o.map(({name:d,index:h})=>({name:d,type:"storage",group:0,location:h})),{name:"result",type:"storage",group:0,location:o.length}]}}),u={};n.isConstant||(u.ids=n.buffer),s.isConstant||(u.sourceValues=s.buffer),u.result=t,l.setBindings(u);const f=t.device.beginComputePass({});return l.dispatch(f,a.x,a.y,a.z),f.end(),t.device.submit(),l.destroy(),{success:!0}};function H1(i,e){if(i.isConstant){const s=i.value;if(!s)throw new Error(`Constant input ${i} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${e} {
  return ${Gi(e,s[0]??0)};
}`}const t=i.stride/i.ValueType.BYTES_PER_ELEMENT,n=i.offset/i.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${e} {
  let rowOffset = ${n}u + rowIndex * ${t}u;
  return ids[rowOffset];
}`}function Y1(i,e,t,n){const s=q(i),r=q(e);return`fn gather(idsValue: ${s}) -> array<${r}, ${t}> {
  let sourceIndex = ${s==="u32"?"i32(idsValue)":s==="i32"?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${n}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`}const q1=async({inputs:i,output:e,target:t})=>{const{segments:n}=i,s=n.isConstant?[]:[{name:"segments",input:n,index:0}],r=rn(Math.ceil(e.length/de),t.device.limits.maxComputeWorkgroupsPerDimension),o=`
${s.map(({name:u,input:f,index:d})=>ec(u,f,d)).join(`
`)}
${qh("segments",n,"uint32")}
${tc(e,s.length)}
${ic(e)}
${X1(n.length)}

@compute @workgroup_size(${de}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${zs(r,de)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,a=new St(t.device,{source:o,shaderLayout:{bindings:[...s.map(({name:u,index:f})=>({name:u,type:"storage",group:0,location:f})),{name:"result",type:"storage",group:0,location:s.length}]}}),c=Object.fromEntries(s.map(({name:u,input:f})=>[u,f.buffer]));c.result=t,a.setBindings(c);const l=t.device.beginComputePass({});return a.dispatch(l,r.x,r.y,r.z),l.end(),t.device.submit(),a.destroy(),{success:!0}};function X1(i){return`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
  var low = 0i;
  var high = ${i}i;
  while (low < high) {
    let mid = low + (high - low) / 2i;
    let midStart = read_segments(u32(mid))[0];
    if (midStart <= vertexIndex) {
      low = mid + 1i;
    } else {
      high = mid;
    }
  }

  let segmentIndex = u32(max(low - 1i, 0i));
  let segmentStart = read_segments(segmentIndex)[0];
  return array<u32, 2>(segmentIndex, vertexIndex - segmentStart);
}`}const Zh=({inputs:i,output:e,target:t})=>{const n=i.map((c,l)=>[`x${l}`,c]);Z1(t.device.limits,n);const s=n.map(([c,l])=>`${c}: array<{TYPE}, ${l.size}>`).join(", ");let r=0;const o=n.map(([c,l])=>{const u=Array.from({length:l.size},(f,d)=>`  out[${r+d}] = ${c}[${d}];`).join(`
`);return r+=l.size,u}).join(`
`),a=`fn interleave(${s}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${o}
  return out;
}
`;return et({module:{name:"interleave",source:a},inputs:i,output:e,outputBuffer:t}),{success:!0}};function Z1(i,e){const n=e.filter(([,s])=>!s.isConstant).length+1;if(n>i.maxStorageBuffersPerShaderStage)throw new Error(`interleave() requires ${n} storage buffers, exceeding device limit ${i.maxStorageBuffersPerShaderStage}`);if(n>i.maxBindingsPerBindGroup)throw new Error(`interleave() requires ${n} bindings, exceeding bind group limit ${i.maxBindingsPerBindGroup}`)}const K1=`fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,Q1=({inputs:i,output:e,target:t})=>(et({module:{name:"row_length",source:K1},inputs:i,output:e,operationType:"float32",outputBuffer:t}),{success:!0}),J1=async({inputs:i,output:e,target:t})=>{const n=Ns(e.type);return et({module:{name:"select",source:`// inline expression select
`},inputs:i,output:e,operationType:e.type,outputBuffer:t,expression:s=>{const r=zr("condition",i.condition,s,n),o=zr("whenTrue",i.whenTrue,s,n);return`select(${zr("whenFalse",i.whenFalse,s,n)}, ${o}, ${r} != ${n})`}}),{success:!0}};function zr(i,e,t,n){return t<e.size?`${i}[${t}]`:e.size===1?`${i}[0]`:n}const Nr=64,eL=({inputs:i,output:e,target:t})=>{const n=rn(Math.ceil(e.length/Nr),t.device.limits.maxComputeWorkgroupsPerDimension),s=`@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(${Nr}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${zs(n,Nr)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let rowOffset = ${e.offset/e.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${e.stride/e.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${i.start} + i32(rowIndex) * ${i.step};
}
`,r=new St(t.device,{source:s,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}});r.setBindings({result:t});const o=t.device.beginComputePass({});return r.dispatch(o,n.x,n.y,n.z),o.end(),t.device.submit(),r.destroy(),{success:!0}},tL=({inputs:i,output:e,target:t})=>{const{columns:n}=i;return et({module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:s=>`x[${n[s]}]`,inputs:{x:i.x},output:e,outputBuffer:t}),{success:!0}},iL=Object.freeze(Object.defineProperty({__proto__:null,arithmetic:R1,dot:B1,equalAll:D1,extent:z1,fround:j1,gather:W1,interleave:Zh,length:Q1,segmentedMap:q1,select:J1,sequence:eL,swizzle:tL},Symbol.toStringTag,{value:"Module"}));class nL{constructor(e,{id:t,isTransitionAttribute:n}){this.packedBuffers={},this.device=e,this.id=t,this.isTransitionAttribute=n,this.device.type==="webgpu"&&Vo.add("webgpu",{interleave:Zh})}hasGroups(e){return this.device.type==="webgpu"&&Object.values(e).some(t=>!!t.settings.bufferGroup)}finalize(){for(const e of Object.values(this.packedBuffers))e.packed.destroy();this.packedBuffers={}}getBufferLayouts(e,t){const n=this._getPackedGroups(e,t,{requireValues:!1,excludeAttributes:{}});return this._getBufferLayouts(e,n,t)}getBindings(e,t,n,s){const r=this._getPackedGroups(e,n,{requireValues:!0,excludeAttributes:s}),o={},a=new Set;for(const c of r.values()){const l=!this.packedBuffers[c.id]||c.attributes.some(u=>!!t[u.id]);o[c.id]=this._getPackedBuffer(c,l);for(const u of c.attributes)a.add(u.id)}return{bufferLayouts:this._getBufferLayouts(e,r,n).filter(c=>!s[c.name]&&!e[c.name]?.settings.isIndexed),buffers:o,groupedAttributeIds:a}}_getPackedGroups(e,t,{requireValues:n,excludeAttributes:s}){const r=new Map;for(const a of Object.values(e)){const c=a.settings.bufferGroup;if(!c)continue;const l=r.get(c)||[];l.push(a),r.set(c,l)}const o=new Map;for(const[a,c]of r){const l=this._getPackedGroup(a,c,t,n,s);l&&o.set(a,l)}return o}_getPackedGroup(e,t,n,s,r){if(t.length<2)return null;const o=t.map(h=>h.getBufferLayout(n)),a=o[0].stepMode,c=Math.max(1,t[0].numInstances),l=s&&t.every(h=>h.isConstant);for(let h=0;h<t.length;h++){const g=t[h],p=g.getAccessor(),m=p.size*p.bytesPerElement;if(r[g.id]||g.settings.isIndexed||g.settings.noAlloc||g.doublePrecision||this.isTransitionAttribute(g.id)||o[h].stepMode!==a||g.numInstances!==t[0].numInstances||(p.offset||0)!==0||(p.vertexOffset||0)!==0||Ie(p)!==m||s&&(g.isConstant?!g.getConstantValue()||g.getConstantValue().byteLength<m:!ArrayBuffer.isView(g.value)||g.value.byteLength<c*m))return null}const u={},f=[];let d=0;for(let h=0;h<t.length;h++){const g=t[h];d=Bu(d),u[g.id]=d;for(const p of o[h].attributes||[])f.push({...p,byteOffset:d+(p.byteOffset||0)});d+=Ie(g.getAccessor())}return d=Bu(d),{id:e,attributes:t,byteStride:d,byteOffsets:u,rowCount:c,layout:{name:e,byteStride:l?0:d,stepMode:a,attributes:f}}}_getBufferLayouts(e,t,n){const s=[],r=new Set,o=new Set;for(const a of t.values())for(const c of a.attributes)o.add(c.id);for(const a of Object.values(e)){const c=a.settings.bufferGroup,l=c&&t.get(c);l&&o.has(a.id)?r.has(l.id)||(s.push(l.layout),r.add(l.id)):s.push(a.getBufferLayout(n))}return s}_getPackedBuffer(e,t){const n=JSON.stringify({byteStride:e.layout.byteStride,attributes:e.layout.attributes}),s=this.packedBuffers[e.id];if((!s||s.layoutKey!==n)&&(t=!0),t){s&&(s.packed.destroy(),delete this.packedBuffers[e.id]);const r=this._interleavePackedGroup(e);return this.packedBuffers[e.id]={packed:r,layoutKey:n},r.buffer}if(!s)throw new Error(`Attribute buffer group ${e.id} has no packed buffer`);return s.packed.buffer}_interleavePackedGroup(e){const t=e.attributes.map(s=>this._getInterleaveInput(e,s)),n=u1(...t);return f1(this.device,n),n}_getInterleaveInput(e,t){const n=Ie(t.getAccessor()),s=e.byteOffsets[t.id];if(di(`${e.id}.${t.id} rowByteLength`,n),di(`${e.id}.${t.id} groupByteOffset`,s),t.isConstant){const c=t.getConstantValue();if(!c)throw new Error(`Attribute group ${e.id} is missing constant value ${t.id}`);return di(`${e.id}.${t.id} constant byteOffset`,c.byteOffset),new U({id:t.id,type:"uint32",size:n/4,isConstant:!0,value:new Uint32Array(c.buffer,c.byteOffset,n/Uint32Array.BYTES_PER_ELEMENT)})}const r=t.getBuffer(),o=t.byteOffset,a=t.getAccessor().stride||n;if(di(`${e.id}.${t.id} byteOffset`,o),di(`${e.id}.${t.id} stride`,a),!r)throw new Error(`Attribute group ${e.id} cannot interleave missing buffer ${t.id}`);return new U({id:t.id,type:"uint32",size:n/4,offset:o,stride:a,length:e.rowCount,buffer:r})}}function Bu(i){return Math.ceil(i/4)*4}function di(i,e){if(e%4!==0)throw new Error(`Attribute buffer groups require 32-bit alignment: ${i}=${e}`)}function $r(i){const{source:e,target:t,start:n=0,size:s,getData:r}=i,o=i.end||t.length,a=e.length,c=o-n;if(a>c){t.set(e.subarray(0,c),n);return}if(t.set(e,n),!r)return;let l=a;for(;l<c;){const u=r(l,e);for(let f=0;f<s;f++)t[n+l]=u[f]||0,l++}}function sL({source:i,target:e,size:t,getData:n,sourceStartIndices:s,targetStartIndices:r}){if(!s||!r)return $r({source:i,target:e,size:t,getData:n}),e;let o=0,a=0;const c=n&&((u,f)=>n(u+a,f)),l=Math.min(s.length,r.length);for(let u=1;u<l;u++){const f=s[u]*t,d=r[u]*t;$r({source:i.subarray(o,f),target:e,start:a,end:d,size:t,getData:c}),o=f,a=d}return a<e.length&&$r({source:[],target:e,start:a,size:t,getData:c}),e}function rL(i){const{device:e,settings:t,value:n}=i,s=new Dh(e,t);return s.setData({value:n instanceof Float64Array?new Float64Array(0):new Float32Array(0),normalized:t.normalized}),s}function Kh(i){switch(i){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`No defined attribute type for size "${i}"`)}}function Qh(i){switch(i){case 1:return"float32";case 2:return"float32x2";case 3:return"float32x3";case 4:return"float32x4";default:throw new Error("invalid type size")}}function Jh(i){i.push(i.shift())}function oL(i,e){const{settings:t,value:n,size:s}=i,r=i.isDoublePrecisionBuffer?2:1;let o=0;const{shaderAttributes:a}=i.settings;if(a)for(const c of Object.values(a))o=Math.max(o,c.vertexOffset??0);return(t.noAlloc?n.length:(e+o)*s)*r}function eg({device:i,source:e,target:t}){return(!t||t.byteLength<e.byteLength)&&(t?.destroy(),t=i.createBuffer({byteLength:e.byteLength,usage:e.usage})),t}function tg({device:i,buffer:e,attribute:t,fromLength:n,toLength:s,fromStartIndices:r,getData:o=a=>a}){const a=t.isDoublePrecisionBuffer?2:1,c=t.size*a,l=t.byteOffset,u=t.settings.bytesPerElement<4?l/t.settings.bytesPerElement*4:l,f=t.startIndices,d=r&&f,h=t.isConstant;if(!d&&e&&n>=s)return e;const g=t.value instanceof Float64Array?Float32Array:t.value.constructor,p=h?t.value:new g(t.getBuffer().readSyncWebGL(l,s*g.BYTES_PER_ELEMENT).buffer);if(t.settings.normalized&&!h){const y=o;o=(v,w)=>t.normalizeConstant(y(v,w))}const m=h?(y,v)=>o(p,v):(y,v)=>o(p.subarray(y,y+c),v),_=e?new Float32Array(e.readSyncWebGL(u,n*4).buffer):new Float32Array(0),b=new Float32Array(s);return sL({source:_,target:b,sourceStartIndices:r,targetStartIndices:f,size:c,getData:m}),(!e||e.byteLength<b.byteLength+u)&&(e?.destroy(),e=i.createBuffer({byteLength:b.byteLength+u,usage:35050})),e.write(b,u),e}class ig{constructor({device:e,attribute:t,timeline:n}){this.buffers=[],this.currentLength=0,this.device=e,this.transition=new Ds(n),this.attribute=t,this.attributeInTransition=rL(t),this.currentStartIndices=t.startIndices}get inProgress(){return this.transition.inProgress}start(e,t,n=1/0){this.settings=e,this.currentStartIndices=this.attribute.startIndices,this.currentLength=oL(this.attribute,t),this.transition.start({...e,duration:n})}update(){const e=this.transition.update();return e&&this.onUpdate(),e}setBuffer(e){const{stride:t}=this.attributeInTransition.getAccessor();this.attributeInTransition.setData({buffer:e,normalized:this.attribute.settings.normalized,value:this.attributeInTransition.value,stride:t})}cancel(){this.transition.cancel()}delete(){this.cancel();for(const e of this.buffers)e.destroy();this.buffers.length=0}}class aL extends ig{constructor({device:e,attribute:t,timeline:n}){super({device:e,attribute:t,timeline:n}),this.type="interpolation",this.hasUpdated=!1,this.transform=fL(e,t)}start(e,t){const n=this.currentLength,s=this.currentStartIndices;if(super.start(e,t,e.duration),e.duration<=0){this.transition.cancel();return}const{buffers:r,attribute:o}=this;this.hasUpdated&&Jh(r),this.hasUpdated=!1,r[0]=tg({device:this.device,buffer:r[0],attribute:o,fromLength:n,toLength:this.currentLength,fromStartIndices:s,getData:e.enter}),r[1]=eg({device:this.device,source:r[0],target:r[1]}),this.setBuffer(r[1]);const{transform:a}=this,c=a.model;let l=Math.floor(this.currentLength/o.size);ng(o)&&(l/=2),c.setVertexCount(l),o.isConstant?(c.setAttributes({aFrom:r[0]}),c.setConstantAttributes({aTo:o.value})):c.setAttributes({aFrom:r[0],aTo:o.getBuffer()}),a.transformFeedback.setBuffers({vCurrent:r[1]})}onUpdate(){const{duration:e,easing:t}=this.settings,{time:n}=this.transition;let s=n/e;t&&(s=t(s));const{model:r}=this.transform,o={time:s};r.shaderInputs.setProps({interpolation:o}),this.transform.run({discard:!0}),this.hasUpdated=!0}delete(){super.delete(),this.transform.destroy()}}const cL=`layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`,ku={name:"interpolation",vs:cL,uniformTypes:{time:"f32"}},lL=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`,uL=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;function ng(i){return i.isDoublePrecisionBuffer}function fL(i,e){const t=e.size,n=Kh(t),s=Qh(t),r=e.getBufferLayout();return ng(e)?new Fe(i,{vs:uL,bufferLayout:[{name:"aFrom",byteStride:8*t,attributes:[{attribute:"aFrom",format:s,byteOffset:0},{attribute:"aFrom64Low",format:s,byteOffset:4*t}]},{name:"aTo",byteStride:8*t,attributes:[{attribute:"aTo",format:s,byteOffset:0},{attribute:"aTo64Low",format:s,byteOffset:4*t}]}],modules:[Nw,ku],defines:{ATTRIBUTE_TYPE:n,ATTRIBUTE_SIZE:t},moduleSettings:{},varyings:["vCurrent","vCurrent64Low"],bufferMode:35980,disableWarnings:!0}):new Fe(i,{vs:lL,bufferLayout:[{name:"aFrom",format:s},{name:"aTo",format:r.attributes[0].format}],modules:[ku],defines:{ATTRIBUTE_TYPE:n},varyings:["vCurrent"],disableWarnings:!0})}class dL extends ig{constructor({device:e,attribute:t,timeline:n}){super({device:e,attribute:t,timeline:n}),this.type="spring",this.texture=yL(e),this.framebuffer=bL(e,this.texture),this.transform=_L(e,t)}start(e,t){const n=this.currentLength,s=this.currentStartIndices;super.start(e,t);const{buffers:r,attribute:o}=this;for(let c=0;c<2;c++)r[c]=tg({device:this.device,buffer:r[c],attribute:o,fromLength:n,toLength:this.currentLength,fromStartIndices:s,getData:e.enter});r[2]=eg({device:this.device,source:r[0],target:r[2]}),this.setBuffer(r[1]);const{model:a}=this.transform;a.setVertexCount(Math.floor(this.currentLength/o.size)),o.isConstant?a.setConstantAttributes({aTo:o.value}):a.setAttributes({aTo:o.getBuffer()})}onUpdate(){const{buffers:e,transform:t,framebuffer:n,transition:s}=this,r=this.settings;t.model.setAttributes({aPrev:e[0],aCur:e[1]}),t.transformFeedback.setBuffers({vNext:e[2]});const o={stiffness:r.stiffness,damping:r.damping};t.model.shaderInputs.setProps({spring:o}),t.run({framebuffer:n,discard:!1,parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]}),Jh(e),this.setBuffer(e[1]),this.device.readPixelsToArrayWebGL(n)[0]>0||s.end()}delete(){super.delete(),this.transform.destroy(),this.texture.destroy(),this.framebuffer.destroy()}}const hL=`layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`,gL={name:"spring",vs:hL,uniformTypes:{damping:"f32",stiffness:"f32"}},pL=`#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`,mL=`#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;function _L(i,e){const t=Kh(e.size),n=Qh(e.size);return new Fe(i,{vs:pL,fs:mL,bufferLayout:[{name:"aPrev",format:n},{name:"aCur",format:n},{name:"aTo",format:e.getBufferLayout().attributes[0].format}],varyings:["vNext"],modules:[gL],defines:{ATTRIBUTE_TYPE:t},parameters:{depthCompare:"always",blendColorOperation:"max",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one"}})}function yL(i){return i.createTexture({data:new Uint8Array(4),format:"rgba8unorm",width:1,height:1})}function bL(i,e){return i.createFramebuffer({id:"spring-transition-is-transitioning-framebuffer",width:1,height:1,colorAttachments:[e]})}const vL={interpolation:aL,spring:dL};class wL{constructor(e,{id:t,timeline:n}){if(!e)throw new Error("AttributeTransitionManager is constructed without device");this.id=t,this.device=e,this.timeline=n,this.transitions={},this.needsRedraw=!1,this.numInstances=1}finalize(){for(const e in this.transitions)this._removeTransition(e)}update({attributes:e,transitions:t,numInstances:n}){this.numInstances=n||1;for(const s in e){const r=e[s],o=r.getTransitionSetting(t);o&&this._updateAttribute(s,r,o)}for(const s in this.transitions){const r=e[s];(!r||!r.getTransitionSetting(t))&&this._removeTransition(s)}}hasAttribute(e){const t=this.transitions[e];return t&&t.inProgress}getAttributes(){const e={};for(const t in this.transitions){const n=this.transitions[t];n.inProgress&&(e[t]=n.attributeInTransition)}return e}run(){if(this.numInstances===0)return!1;for(const t in this.transitions)this.transitions[t].update()&&(this.needsRedraw=!0);const e=this.needsRedraw;return this.needsRedraw=!1,e}_removeTransition(e){this.transitions[e].delete(),delete this.transitions[e]}_updateAttribute(e,t,n){const s=this.transitions[e];let r=!s||s.type!==n.type;if(r){s&&this._removeTransition(e);const o=vL[n.type];o?this.transitions[e]=new o({attribute:t,timeline:this.timeline,device:this.device}):(z.error(`unsupported transition type '${n.type}'`)(),r=!1)}(r||t.needsRedraw())&&(this.needsRedraw=!0,this.transitions[e].start(n,this.numInstances))}}const Du="attributeManager.invalidate",xL="attributeManager.updateStart",PL="attributeManager.updateEnd",EL="attribute.updateStart",SL="attribute.allocate",TL="attribute.updateEnd";class LL{constructor(e,{id:t="attribute-manager",stats:n,timeline:s}={}){this.mergeBoundsMemoized=Ki(E2),this.id=t,this.device=e,this.attributes={},this.updateTriggers={},this.needsRedraw=!0,this.userData={},this.stats=n,this.attributeTransitionManager=new wL(e,{id:`${t}-transitions`,timeline:s}),this.attributeBufferGroups=e.type==="webgpu"?new nL(e,{id:t,isTransitionAttribute:r=>this.attributeTransitionManager.hasAttribute(r)}):null,Object.seal(this)}finalize(){this.attributeBufferGroups?.finalize();for(const e in this.attributes)this.attributes[e].delete();this.attributeTransitionManager.finalize()}getNeedsRedraw(e={clearRedrawFlags:!1}){const t=this.needsRedraw;return this.needsRedraw=this.needsRedraw&&!e.clearRedrawFlags,t&&this.id}setNeedsRedraw(){this.needsRedraw=!0}add(e){this._add(e)}addInstanced(e){this._add(e,{stepMode:"instance"})}remove(e){for(const t of e)this.attributes[t]!==void 0&&(this.attributes[t].delete(),delete this.attributes[t])}invalidate(e,t){const n=this._invalidateTrigger(e,t);te(Du,this,e,n)}invalidateAll(e){for(const t in this.attributes)this.attributes[t].setNeedsUpdate(t,e);te(Du,this,"all")}update({data:e,numInstances:t,startIndices:n=null,transitions:s,props:r={},buffers:o={},context:a={}}){let c=!1;te(xL,this),this.stats&&this.stats.get("Update Attributes").timeStart();for(const l in this.attributes){const u=this.attributes[l],f=u.settings.accessor;u.startIndices=n,u.numInstances=t,r[l]&&z.removed(`props.${l}`,`data.attributes.${l}`)(),u.setExternalBuffer(o[l])||u.setBinaryValue(typeof f=="string"?o[f]:void 0,e.startIndices)||typeof f=="string"&&!o[f]&&u.setConstantValue(a,r[f])||u.needsUpdate()&&(c=!0,this._updateAttribute({attribute:u,numInstances:t,data:e,props:r,context:a})),this.needsRedraw=this.needsRedraw||u.needsRedraw()}c&&te(PL,this,t),this.stats&&(this.stats.get("Update Attributes").timeEnd(),c&&this.stats.get("Attributes updated").incrementCount()),this.attributeTransitionManager.update({attributes:this.attributes,numInstances:t,transitions:s})}updateTransition(){const{attributeTransitionManager:e}=this,t=e.run();return this.needsRedraw=this.needsRedraw||t,t}getAttributes(){return{...this.attributes,...this.attributeTransitionManager.getAttributes()}}getBounds(e){const t=e.map(n=>this.attributes[n]?.getBounds());return this.mergeBoundsMemoized(t)}getChangedAttributes(e={clearChangedFlags:!1}){const{attributes:t,attributeTransitionManager:n}=this,s={...n.getAttributes()};for(const r in t){const o=t[r];o.needsRedraw(e)&&!n.hasAttribute(r)&&(s[r]=o)}return s}getBufferLayouts(e){return this.hasBufferGroups()?this.attributeBufferGroups.getBufferLayouts(this.getAttributes(),e):Object.values(this.getAttributes()).map(t=>t.getBufferLayout(e))}hasBufferGroups(){return!!this.attributeBufferGroups?.hasGroups(this.attributes)}getBufferGroupBindings(e,t,n={}){return this.attributeBufferGroups?this.attributeBufferGroups.getBindings(this.getAttributes(),e,t,n):{bufferLayouts:this.getBufferLayouts(t),buffers:{},groupedAttributeIds:new Set}}_add(e,t){for(const n in e){const s=e[n],r={...s,id:n,size:s.isIndexed&&1||s.size||1,...t};this.attributes[n]=new Dh(this.device,r)}this._mapUpdateTriggersToAttributes()}_mapUpdateTriggersToAttributes(){const e={};for(const t in this.attributes)this.attributes[t].getUpdateTriggers().forEach(s=>{e[s]||(e[s]=[]),e[s].push(t)});this.updateTriggers=e}_invalidateTrigger(e,t){const{attributes:n,updateTriggers:s}=this,r=s[e];return r&&r.forEach(o=>{const a=n[o];a&&a.setNeedsUpdate(a.id,t)}),r}_updateAttribute(e){const{attribute:t,numInstances:n}=e;if(te(EL,t),t.constant){t.setConstantValue(e.context,t.value);return}t.allocate(n)&&te(SL,t,n),t.updateBuffer(e)&&(this.needsRedraw=!0,te(TL,t,n))}}class CL extends Ds{get value(){return this._value}_onUpdate(){const{time:e,settings:{fromValue:t,toValue:n,duration:s,easing:r}}=this,o=r(e/s);this._value=Qn(t,n,o)}}const Fu=1e-5;function zu(i,e,t,n,s){const r=e-i,a=(t-e)*s,c=-r*n;return a+c+r+e}function AL(i,e,t,n,s){if(Array.isArray(t)){const r=[];for(let o=0;o<t.length;o++)r[o]=zu(i[o],e[o],t[o],n,s);return r}return zu(i,e,t,n,s)}function Nu(i,e){if(Array.isArray(i)){let t=0;for(let n=0;n<i.length;n++){const s=i[n]-e[n];t+=s*s}return Math.sqrt(t)}return Math.abs(i-e)}class ML extends Ds{get value(){return this._currValue}_onUpdate(){const{fromValue:e,toValue:t,damping:n,stiffness:s}=this.settings,{_prevValue:r=e,_currValue:o=e}=this;let a=AL(r,o,t,n,s);const c=Nu(a,t),l=Nu(a,o);c<Fu&&l<Fu&&(a=t,this.end()),this._prevValue=o,this._currValue=a}}const IL={interpolation:CL,spring:ML};class RL{constructor(e){this.transitions=new Map,this.timeline=e}get active(){return this.transitions.size>0}add(e,t,n,s){const{transitions:r}=this;if(r.has(e)){const c=r.get(e),{value:l=c.settings.fromValue}=c;t=l,this.remove(e)}if(s=kh(s),!s)return;const o=IL[s.type];if(!o){z.error(`unsupported transition type '${s.type}'`)();return}const a=new o(this.timeline);a.start({...s,fromValue:t,toValue:n}),r.set(e,a)}remove(e){const{transitions:t}=this;t.has(e)&&(t.get(e).cancel(),t.delete(e))}update(){const e={};for(const[t,n]of this.transitions)n.update(),e[t]=n.value,n.inProgress||this.remove(t);return e}clear(){for(const e of this.transitions.keys())this.remove(e)}}function OL(i){const e=i[Ke];for(const t in e){const n=e[t],{validate:s}=n;if(s&&!s(i[t],n))throw new Error(`Invalid prop ${t}: ${i[t]}`)}}function BL(i,e){const t=sg({newProps:i,oldProps:e,propTypes:i[Ke],ignoreProps:{data:null,updateTriggers:null,extensions:null,transitions:null}}),n=DL(i,e);let s=!1;return n||(s=FL(i,e)),{dataChanged:n,propsChanged:t,updateTriggersChanged:s,extensionsChanged:zL(i,e),transitionsChanged:kL(i,e)}}function kL(i,e){if(!i.transitions)return!1;const t={},n=i[Ke];let s=!1;for(const r in i.transitions){const o=n[r],a=o&&o.type;(a==="number"||a==="color"||a==="array")&&Wo(i[r],e[r],o)&&(t[r]=!0,s=!0)}return s?t:!1}function sg({newProps:i,oldProps:e,ignoreProps:t={},propTypes:n={},triggerName:s="props"}){if(e===i)return!1;if(typeof i!="object"||i===null)return`${s} changed shallowly`;if(typeof e!="object"||e===null)return`${s} changed shallowly`;for(const r of Object.keys(i))if(!(r in t)){if(!(r in e))return`${s}.${r} added`;const o=Wo(i[r],e[r],n[r]);if(o)return`${s}.${r} ${o}`}for(const r of Object.keys(e))if(!(r in t)){if(!(r in i))return`${s}.${r} dropped`;if(!Object.hasOwnProperty.call(i,r)){const o=Wo(i[r],e[r],n[r]);if(o)return`${s}.${r} ${o}`}}return!1}function Wo(i,e,t){let n=t&&t.equal;return n&&!n(i,e,t)||!n&&(n=i&&e&&i.equals,n&&!n.call(i,e))?"changed deeply":!n&&e!==i?"changed shallowly":null}function DL(i,e){if(e===null)return"oldProps is null, initial diff";let t=!1;const{dataComparator:n,_dataDiff:s}=i;return n?n(i.data,e.data)||(t="Data comparator detected a change"):i.data!==e.data&&(t="A new data container was supplied"),t&&s&&(t=s(i.data,e.data)||t),t}function FL(i,e){if(e===null)return{all:!0};if("all"in i.updateTriggers&&$u(i,e,"all"))return{all:!0};const t={};let n=!1;for(const s in i.updateTriggers)s!=="all"&&$u(i,e,s)&&(t[s]=!0,n=!0);return n?t:!1}function zL(i,e){if(e===null)return!0;const t=e.extensions,{extensions:n}=i;if(n===t)return!1;if(!t||!n||n.length!==t.length)return!0;for(let s=0;s<n.length;s++)if(!n[s].equals(t[s]))return!0;return!1}function $u(i,e,t){let n=i.updateTriggers[t];n=n??{};let s=e.updateTriggers[t];return s=s??{},sg({oldProps:s,newProps:n,triggerName:t})}const NL="count(): argument not an object",$L="count(): argument not a container";function UL(i){if(!VL(i))throw new Error(NL);if(typeof i.count=="function")return i.count();if(Number.isFinite(i.size))return i.size;if(Number.isFinite(i.length))return i.length;if(GL(i))return Object.keys(i).length;throw new Error($L)}function GL(i){return i!==null&&typeof i=="object"&&i.constructor===Object}function VL(i){return i!==null&&typeof i=="object"}function Ai(i,e){if(!e)return i;const t={...i,...e};if("defines"in e&&(t.defines={...i.defines,...e.defines}),"modules"in e&&(t.modules=(i.modules||[]).concat(e.modules),e.modules.some(n=>n.name==="project64"))){const n=t.modules.findIndex(s=>s.name==="project32");n>=0&&t.modules.splice(n,1)}if("inject"in e)if(!i.inject)t.inject=e.inject;else{const n={...i.inject};for(const s in e.inject)n[s]=(n[s]||"")+e.inject[s];t.inject=n}return t}const jL={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},Ho={};function WL(i,e,t,n){if(t instanceof k)return t;t.constructor&&t.constructor.name!=="Object"&&(t={data:t});let s=null;t.compressed&&(s={minFilter:"linear",mipmapFilter:t.data.length>1?"nearest":"linear"});const{width:r,height:o}=t.data,a=e.createTexture({...t,sampler:{...jL,...s,...n},mipLevels:e.getMipLevelCount(r,o)});return e.type==="webgl"?a.generateMipmapsWebGL():e.type==="webgpu"&&e.generateMipmapsWebGPU(a),Ho[a.id]=i,a}function HL(i,e){!e||!(e instanceof k)||Ho[e.id]===i&&(e.delete(),delete Ho[e.id])}const YL={boolean:{validate(i,e){return!0},equal(i,e,t){return!!i==!!e}},number:{validate(i,e){return Number.isFinite(i)&&(!("max"in e)||i<=e.max)&&(!("min"in e)||i>=e.min)}},color:{validate(i,e){return e.optional&&!i||Yo(i)&&(i.length===3||i.length===4)},equal(i,e,t){return J(i,e,1)}},accessor:{validate(i,e){const t=gs(i);return t==="function"||t===gs(e.value)},equal(i,e,t){return typeof e=="function"?!0:J(i,e,1)}},array:{validate(i,e){return e.optional&&!i||Yo(i)},equal(i,e,t){const{compare:n}=t,s=Number.isInteger(n)?n:n?1:0;return n?J(i,e,s):i===e}},object:{equal(i,e,t){if(t.ignore)return!0;const{compare:n}=t,s=Number.isInteger(n)?n:n?1:0;return n?J(i,e,s):i===e}},function:{validate(i,e){return e.optional&&!i||typeof i=="function"},equal(i,e,t){return!t.compare&&t.ignore!==!1||i===e}},data:{transform:(i,e,t)=>{if(!i)return i;const{dataTransform:n}=t.props;return n?n(i):typeof i.shape=="string"&&i.shape.endsWith("-table")&&Array.isArray(i.data)?i.data:i}},image:{transform:(i,e,t)=>{const n=t.context;return!n||!n.device?null:WL(t.id,n.device,i,{...e.parameters,...t.props.textureParameters})},release:(i,e,t)=>{HL(t.id,i)}}};function qL(i){const e={},t={},n={};for(const[s,r]of Object.entries(i)){const o=r?.deprecatedFor;if(o)n[s]=Array.isArray(o)?o:[o];else{const a=XL(s,r);e[s]=a,t[s]=a.value}}return{propTypes:e,defaultProps:t,deprecatedProps:n}}function XL(i,e){switch(gs(e)){case"object":return hi(i,e);case"array":return hi(i,{type:"array",value:e,compare:!1});case"boolean":return hi(i,{type:"boolean",value:e});case"number":return hi(i,{type:"number",value:e});case"function":return hi(i,{type:"function",value:e,compare:!0});default:return{name:i,type:"unknown",value:e}}}function hi(i,e){return"type"in e?{name:i,...YL[e.type],...e}:"value"in e?{name:i,type:gs(e.value),...e}:{name:i,type:"object",value:e}}function Yo(i){return Array.isArray(i)||ArrayBuffer.isView(i)}function gs(i){return Yo(i)?"array":i===null?"null":typeof i}function ZL(i,e){let t;for(let r=e.length-1;r>=0;r--){const o=e[r];"extensions"in o&&(t=o.extensions)}const n=qo(i.constructor,t),s=Object.create(n);s[ls]=i,s[yt]={},s[qe]={};for(let r=0;r<e.length;++r){const o=e[r];for(const a in o)s[a]=o[a]}return Object.freeze(s),s}const KL="_mergedDefaultProps";function qo(i,e){if(!(i instanceof $s.constructor))return{};let t=KL;if(e)for(const s of e){const r=s.constructor;r&&(t+=`:${r.extensionName||r.name}`)}const n=rg(i,t);return n||(i[t]=QL(i,e||[]))}function QL(i,e){if(!i.prototype)return null;const n=Object.getPrototypeOf(i),s=qo(n),r=rg(i,"defaultProps")||{},o=qL(r),a=Object.assign(Object.create(null),s,o.defaultProps),c=Object.assign(Object.create(null),s?.[Ke],o.propTypes),l=Object.assign(Object.create(null),s?.[xr],o.deprecatedProps);for(const u of e){const f=qo(u.constructor);f&&(Object.assign(a,f),Object.assign(c,f[Ke]),Object.assign(l,f[xr]))}return JL(a,i),tC(a,c),eC(a,l),a[Ke]=c,a[xr]=l,e.length===0&&!nc(i,"_propTypes")&&(i._propTypes=c),a}function JL(i,e){const t=nC(e);Object.defineProperties(i,{id:{writable:!0,value:t}})}function eC(i,e){for(const t in e)Object.defineProperty(i,t,{enumerable:!1,set(n){const s=`${this.id}: ${t}`;for(const r of e[t])nc(this,r)||(this[r]=n);z.deprecated(s,e[t].join("/"))()}})}function tC(i,e){const t={},n={};for(const s in e){const r=e[s],{name:o,value:a}=r;r.async&&(t[o]=a,n[o]=iC(o))}i[Gt]=t,i[yt]={},Object.defineProperties(i,n)}function iC(i){return{enumerable:!0,set(e){typeof e=="string"||e instanceof Promise||Oh(e)?this[yt][i]=e:this[qe][i]=e},get(){if(this[qe]){if(i in this[qe])return this[qe][i]||this[Gt][i];if(i in this[yt]){const e=this[ls]&&this[ls].internalState;if(e&&e.hasAsyncProp(i))return e.getAsyncProp(i)||this[Gt][i]}}return this[Gt][i]}}}function nc(i,e){return Object.prototype.hasOwnProperty.call(i,e)}function rg(i,e){return nc(i,e)&&i[e]}function nC(i){const e=i.componentName;return e||z.warn(`${i.name}.componentName not specified`)(),e||i.name}let sC=0;class $s{constructor(...e){this.props=ZL(this,e),this.id=this.props.id,this.count=sC++}clone(e){const{props:t}=this,n={};for(const s in t[Gt])s in t[qe]?n[s]=t[qe][s]:s in t[yt]&&(n[s]=t[yt][s]);return new this.constructor({...t,...n,...e})}}$s.componentName="Component";$s.defaultProps={};const rC=Object.freeze({});class oC{constructor(e){this.component=e,this.asyncProps={},this.onAsyncPropUpdated=()=>{},this.oldProps=null,this.oldAsyncProps=null}finalize(){for(const e in this.asyncProps){const t=this.asyncProps[e];t&&t.type&&t.type.release&&t.type.release(t.resolvedValue,t.type,this.component)}this.asyncProps={},this.component=null,this.resetOldProps()}getOldProps(){return this.oldAsyncProps||this.oldProps||rC}resetOldProps(){this.oldAsyncProps=null,this.oldProps=this.component?this.component.props:null}hasAsyncProp(e){return e in this.asyncProps}getAsyncProp(e){const t=this.asyncProps[e];return t&&t.resolvedValue}isAsyncPropLoading(e){if(e){const t=this.asyncProps[e];return!!(t&&t.pendingLoadCount>0&&t.pendingLoadCount!==t.resolvedLoadCount)}for(const t in this.asyncProps)if(this.isAsyncPropLoading(t))return!0;return!1}reloadAsyncProp(e,t){this._watchPromise(e,Promise.resolve(t))}setAsyncProps(e){this.component=e[ls]||this.component;const t=e[qe]||{},n=e[yt]||e,s=e[Gt]||{};for(const r in t){const o=t[r];this._createAsyncPropData(r,s[r]),this._updateAsyncProp(r,o),t[r]=this.getAsyncProp(r)}for(const r in n){const o=n[r];this._createAsyncPropData(r,s[r]),this._updateAsyncProp(r,o)}}_fetch(e,t){return null}_onResolve(e,t){}_onError(e,t){}_updateAsyncProp(e,t){if(this._didAsyncInputValueChange(e,t)){if(typeof t=="string"&&(t=this._fetch(e,t)),t instanceof Promise){this._watchPromise(e,t);return}if(Oh(t)){this._resolveAsyncIterable(e,t);return}this._setPropValue(e,t)}}_freezeAsyncOldProps(){if(!this.oldAsyncProps&&this.oldProps){this.oldAsyncProps=Object.create(this.oldProps);for(const e in this.asyncProps)Object.defineProperty(this.oldAsyncProps,e,{enumerable:!0,value:this.oldProps[e]})}}_didAsyncInputValueChange(e,t){const n=this.asyncProps[e];return t===n.resolvedValue||t===n.lastValue?!1:(n.lastValue=t,!0)}_setPropValue(e,t){this._freezeAsyncOldProps();const n=this.asyncProps[e];n&&(t=this._postProcessValue(n,t),n.resolvedValue=t,n.pendingLoadCount++,n.resolvedLoadCount=n.pendingLoadCount)}_setAsyncPropValue(e,t,n){const s=this.asyncProps[e];s&&n>=s.resolvedLoadCount&&t!==void 0&&(this._freezeAsyncOldProps(),s.resolvedValue=t,s.resolvedLoadCount=n,this.onAsyncPropUpdated(e,t))}_watchPromise(e,t){const n=this.asyncProps[e];if(n){n.pendingLoadCount++;const s=n.pendingLoadCount;t.then(r=>{this.component&&(r=this._postProcessValue(n,r),this._setAsyncPropValue(e,r,s),this._onResolve(e,r))}).catch(r=>{this._onError(e,r)})}}async _resolveAsyncIterable(e,t){if(e!=="data"){this._setPropValue(e,t);return}const n=this.asyncProps[e];if(!n)return;n.pendingLoadCount++;const s=n.pendingLoadCount;let r=[],o=0;for await(const a of t){if(!this.component)return;const{dataTransform:c}=this.component.props;c?r=c(a,r):r=r.concat(a),Object.defineProperty(r,"__diff",{enumerable:!1,value:[{startRow:o,endRow:r.length}]}),o=r.length,this._setAsyncPropValue(e,r,s)}this._onResolve(e,r)}_postProcessValue(e,t){const n=e.type;return n&&this.component&&(n.release&&n.release(e.resolvedValue,n,this.component),n.transform)?n.transform(t,n,this.component):t}_createAsyncPropData(e,t){if(!this.asyncProps[e]){const s=this.component&&this.component.props[Ke];this.asyncProps[e]={type:s&&s[e],lastValue:null,resolvedValue:t,pendingLoadCount:0,resolvedLoadCount:0}}}}class aC extends oC{constructor({attributeManager:e,layer:t}){super(t),this.attributeManager=e,this.needsRedraw=!0,this.needsUpdate=!0,this.subLayers=null,this.usesPickingColorCache=!1,this.disabledPickingIndices=[]}get layer(){return this.component}_fetch(e,t){const n=this.layer,s=n?.props.fetch;return s?s(t,{propName:e,layer:n}):super._fetch(e,t)}_onResolve(e,t){const n=this.layer;if(n){const s=n.props.onDataLoad;e==="data"&&s&&s(t,{propName:e,layer:n})}}_onError(e,t){const n=this.layer;n&&n.raiseError(t,`loading ${e} of ${this.layer}`)}}const cC="layer.changeFlag",lC="layer.initialize",uC="layer.update",fC="layer.finalize",dC="layer.matched",Uu=2**24-1,hC=Object.freeze([]),gC=Ki(({oldViewport:i,viewport:e})=>i.equals(e));let le=new Uint8ClampedArray(0);function Gu(i){return i.rowIndexes||i.pickingColors||i.instancePickingColors}function Ur(i){return i.rowIndexes}function Gr(i){return i.pickingColors||i.instancePickingColors}const pC={data:{type:"data",value:hC,async:!0},dataComparator:{type:"function",value:null,optional:!0},_dataDiff:{type:"function",value:i=>i&&i.__diff,optional:!0},dataTransform:{type:"function",value:null,optional:!0},onDataLoad:{type:"function",value:null,optional:!0},onError:{type:"function",value:null,optional:!0},fetch:{type:"function",value:(i,{propName:e,layer:t,loaders:n,loadOptions:s,signal:r})=>{const{resourceManager:o}=t.context;s=s||t.getLoadOptions(),n=n||t.props.loaders,r&&(s={...s,core:{...s?.core,fetch:{...s?.core?.fetch,signal:r}}});let a=o.contains(i);return!a&&!s&&(o.add({resourceId:i,data:Vn(i,n),persistent:!1}),a=!0),a?o.subscribe({resourceId:i,onChange:c=>t.internalState?.reloadAsyncProp(e,c),consumerId:t.id,requestId:e}):Vn(i,n,s)}},updateTriggers:{},visible:!0,pickable:!1,opacity:{type:"number",min:0,max:1,value:1},operation:"draw",onHover:{type:"function",value:null,optional:!0},onClick:{type:"function",value:null,optional:!0},onDragStart:{type:"function",value:null,optional:!0},onDrag:{type:"function",value:null,optional:!0},onDragEnd:{type:"function",value:null,optional:!0},coordinateSystem:"default",coordinateOrigin:{type:"array",value:[0,0,0],compare:!0},modelMatrix:{type:"array",value:null,compare:!0,optional:!0},wrapLongitude:!1,positionFormat:"XYZ",colorFormat:"RGBA",parameters:{type:"object",value:{},optional:!0,compare:2},loadOptions:{type:"object",value:null,optional:!0,ignore:!0},transitions:null,extensions:[],loaders:{type:"array",value:[],optional:!0,ignore:!0},getPolygonOffset:{type:"function",value:({layerIndex:i})=>[0,-i*100]},highlightedObjectIndex:null,autoHighlight:!1,highlightColor:{type:"accessor",value:[0,0,128,128]}};class Tt extends $s{constructor(){super(...arguments),this.internalState=null,this.lifecycle=kt.NO_STATE,this.parent=null}static get componentName(){return Object.prototype.hasOwnProperty.call(this,"layerName")?this.layerName:""}get root(){let e=this;for(;e.parent;)e=e.parent;return e}toString(){return`${this.constructor.layerName||this.constructor.name}({id: '${this.props.id}'})`}project(e){$(this.internalState);const t=this.internalState.viewport||this.context.viewport,n=Ga(e,{viewport:t,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem}),[s,r,o]=$a(n,t.pixelProjectionMatrix);return e.length===2?[s,r]:[s,r,o]}unproject(e){return $(this.internalState),(this.internalState.viewport||this.context.viewport).unproject(e)}projectPosition(e,t){$(this.internalState);const n=this.internalState.viewport||this.context.viewport;return M2(e,{viewport:n,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem,...t})}get isComposite(){return!1}get isDrawable(){return!0}setState(e){this.setChangeFlags({stateChanged:!0}),Object.assign(this.state,e),this.setNeedsRedraw()}setNeedsRedraw(){this.internalState&&(this.internalState.needsRedraw=!0)}setNeedsUpdate(){this.internalState&&(this.context.layerManager.setNeedsUpdate(String(this)),this.internalState.needsUpdate=!0)}get isLoaded(){return this.internalState?!this.internalState.isAsyncPropLoading():!1}get wrapLongitude(){return this.props.wrapLongitude}isPickable(){return this.props.pickable&&this.props.visible}getModels(){const e=this.state;return e&&(e.models||e.model&&[e.model])||[]}setShaderModuleProps(...e){for(const t of this.getModels())t.shaderInputs.setProps(...e)}getAttributeManager(){return this.internalState&&this.internalState.attributeManager}getCurrentLayer(){return this.internalState&&this.internalState.layer}getLoadOptions(){return this.props.loadOptions}use64bitPositions(){const{coordinateSystem:e}=this.props;return e==="default"||e==="lnglat"||e==="cartesian"}onHover(e,t){return this.props.onHover&&this.props.onHover(e,t)||!1}onClick(e,t){return this.props.onClick&&this.props.onClick(e,t)||!1}nullPickingColor(){return[0,0,0]}encodePickingColor(e,t=[]){return t[0]=e+1&255,t[1]=e+1>>8&255,t[2]=e+1>>8>>8&255,t}decodePickingColor(e){$(e instanceof Uint8Array);const[t,n,s]=e;return t+n*256+s*65536-1}getNumInstances(){return Number.isFinite(this.props.numInstances)?this.props.numInstances:this.state&&this.state.numInstances!==void 0?this.state.numInstances:UL(this.props.data)}getStartIndices(){return this.props.startIndices?this.props.startIndices:this.state&&this.state.startIndices?this.state.startIndices:null}getBounds(){return this.getAttributeManager()?.getBounds(["positions","instancePositions"])}getShaders(e){e=Ai(e,{disableWarnings:!0,modules:this.context.defaultShaderModules});for(const t of this.props.extensions)e=Ai(e,t.getShaders.call(this,t));return e}shouldUpdateState(e){return e.changeFlags.propsOrDataChanged}updateState(e){const t=this.getAttributeManager(),{dataChanged:n}=e.changeFlags;if(n&&t)if(Array.isArray(n))for(const s of n)t.invalidateAll(s);else t.invalidateAll();if(t){const{props:s}=e,r=this.internalState.hasPickingBuffer,o=Number.isInteger(s.highlightedObjectIndex)||!!s.pickable||s.extensions.some(a=>a.getNeedsPickingBuffer.call(this,a));if(r!==o){this.internalState.hasPickingBuffer=o;const a=Gu(t.attributes);a&&(o&&a.constant&&(a.constant=!1,t.invalidate(a.id)),!a.value&&!o&&(a.constant=!0,a.value=Ur(t.attributes)?[os]:[0,0,0]))}}}finalizeState(e){for(const n of this.getModels())n.destroy();const t=this.getAttributeManager();t&&t.finalize(),this.context&&this.context.resourceManager.unsubscribe({consumerId:this.id}),this.internalState&&(this.internalState.uniformTransitions.clear(),this.internalState.finalize())}draw(e){for(const t of this.getModels())t.draw(e.renderPass)}getPickingInfo({info:e,mode:t,sourceLayer:n}){const{index:s}=e;return s>=0&&Array.isArray(this.props.data)&&(e.object=this.props.data[s]),e}raiseError(e,t){t&&(e=new Error(`${t}: ${e.message}`,{cause:e})),this.props.onError?.(e)||this.context?.onError?.(e,this)}getNeedsRedraw(e={clearRedrawFlags:!1}){return this._getNeedsRedraw(e)}needsUpdate(){return this.internalState?this.internalState.needsUpdate||this.hasUniformTransition()||this.shouldUpdateState(this._getUpdateParams()):!1}hasUniformTransition(){return this.internalState?.uniformTransitions.active||!1}activateViewport(e){if(!this.internalState)return;const t=this.internalState.viewport;this.internalState.viewport=e,(!t||!gC({oldViewport:t,viewport:e}))&&(this.setChangeFlags({viewportChanged:!0}),this.isComposite?this.needsUpdate()&&this.setNeedsUpdate():this._update())}invalidateAttribute(e="all"){const t=this.getAttributeManager();t&&(e==="all"?t.invalidateAll():t.invalidate(e))}updateAttributes(e){let t=!1;for(const n in e)e[n].layoutChanged()&&(t=!0);for(const n of this.getModels())this._setModelAttributes(n,e,t)}_updateAttributes(){const e=this.getAttributeManager();if(!e)return;const t=this.props,n=this.getNumInstances(),s=this.getStartIndices();e.update({data:t.data,numInstances:n,startIndices:s,props:t,transitions:t.transitions,buffers:t.data.attributes,context:this});const r=e.getChangedAttributes({clearChangedFlags:!0});this.updateAttributes(r)}_updateAttributeTransition(){const e=this.getAttributeManager();e&&e.updateTransition()}_updateUniformTransition(){const{uniformTransitions:e}=this.internalState;if(e.active){const t=e.update(),n=Object.create(this.props);for(const s in t)Object.defineProperty(n,s,{value:t[s]});return n}return this.props}calculateInstancePickingColors(e,{numInstances:t}){if(e.constant)return;const n=Math.floor(le.length/4);this.internalState.usesPickingColorCache=!0;const s=t>0&&le[0]===0;if(n<t||s){t>Uu&&z.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")(),le=Zt.allocate(le,t,{size:4,copy:!0,maxCount:Math.max(t,Uu)});const r=Math.floor(le.length/4),o=[0,0,0],a=s?0:n;for(let c=a;c<r;c++)this.encodePickingColor(c,o),le[c*4+0]=o[0],le[c*4+1]=o[1],le[c*4+2]=o[2],le[c*4+3]=0}e.value=le.subarray(0,t*4)}_setModelAttributes(e,t,n=!1){if(!Object.keys(t).length)return;const s=this.getAttributeManager();if(s?.hasBufferGroups()){this._setGroupedModelAttributes(e,s,t);return}if(n){const c=this.getAttributeManager();e.setBufferLayout(c.getBufferLayouts(e)),t=c.getAttributes()}const r=e.userData?.excludeAttributes||{},o={},a={};for(const c in t){if(r[c])continue;const l=t[c].getValue();for(const u in l){const f=l[u];f instanceof O?t[c].settings.isIndexed?e.setIndexBuffer(f):o[u]=f:f&&(a[u]=f)}}e.setAttributes(o),e.setConstantAttributes(a)}_setGroupedModelAttributes(e,t,n){const s=e.userData?.excludeAttributes||{},r=t.getBufferGroupBindings(n,e,s);e.setBufferLayout(r.bufferLayouts);const o={...r.buffers},a={},c=t.getAttributes();for(const l in c){if(s[l]||r.groupedAttributeIds.has(l))continue;const u=c[l],f=u.getValue();for(const d in f){const h=f[d];h instanceof O?u.settings.isIndexed?e.setIndexBuffer(h):o[d]=h:h&&(a[d]=h)}}e.setAttributes(o),e.setConstantAttributes(a)}disablePickingIndex(e){const t=this.props.data;if(!("attributes"in t)){this._disablePickingIndex(e);return}const n=this.getAttributeManager().attributes,s=Ur(n),r=Gr(n),o=s&&t.attributes&&t.attributes[s.id];if(o&&o.value){const c=o.value;for(let l=0;l<t.length;l++){const u=s.getVertexOffset(l);c[u]===e&&this._disablePickingIndex(l)}return}const a=r&&t.attributes&&t.attributes[r.id];if(a&&a.value){const c=a.value,l=this.encodePickingColor(e);for(let u=0;u<t.length;u++){const f=r.getVertexOffset(u);c[f]===l[0]&&c[f+1]===l[1]&&c[f+2]===l[2]&&this._disablePickingIndex(u)}}else this._disablePickingIndex(e)}_disablePickingIndex(e){const t=this.getAttributeManager().attributes,n=Ur(t);if(n){const a=n.getVertexOffset(e),c=n.getVertexOffset(e+1),l=new Uint32Array(c-a);l.fill(os),n.buffer.write(l,a*l.BYTES_PER_ELEMENT);return}const s=Gr(t);if(!s){this.internalState&&QP(this.internalState.disabledPickingIndices,e);return}const r=s.getVertexOffset(e),o=s.getVertexOffset(e+1);s.buffer.write(new Uint8Array(o-r),r)}restorePickingColors(){const e=this.getAttributeManager().attributes,t=Gu(e);if(!t){this.internalState&&(this.internalState.disabledPickingIndices.length=0);return}const n=Gr(e);this.internalState.usesPickingColorCache&&n&&n.value.buffer!==le.buffer&&(n.value=le.subarray(0,n.value.length)),t.updateSubBuffer({startOffset:0})}_initialize(){$(!this.internalState),te(lC,this);const e=this._getAttributeManager();this.internalState=new aC({attributeManager:e,layer:this}),this._clearChangeFlags(),this.state={},Object.defineProperty(this.state,"attributeManager",{get:()=>(z.deprecated("layer.state.attributeManager","layer.getAttributeManager()")(),e)}),this.internalState.uniformTransitions=new RL(this.context.timeline),this.internalState.onAsyncPropUpdated=this._onAsyncPropUpdated.bind(this),this.internalState.setAsyncProps(this.props),this.initializeState(this.context);for(const t of this.props.extensions)t.initializeState.call(this,this.context,t);this.setChangeFlags({dataChanged:"init",propsChanged:"init",viewportChanged:!0,extensionsChanged:!0}),this._update()}_transferState(e){te(dC,this,this===e);const{state:t,internalState:n}=e;this!==e&&(this.internalState=n,this.state=t,this.internalState.setAsyncProps(this.props),this._diffProps(this.props,this.internalState.getOldProps()))}_update(){const e=this.needsUpdate();if(te(uC,this,e),!e)return;this.context.stats.get("Layer updates").incrementCount();const t=this.props,n=this.context,s=this.internalState,r=n.viewport,o=this._updateUniformTransition();s.propsInTransition=o,n.viewport=s.viewport||r,this.props=o;try{const a=this._getUpdateParams(),c=this.getModels();if(n.device)this.updateState(a);else try{this.updateState(a)}catch{}for(const u of this.props.extensions)u.updateState.call(this,a,u);this.setNeedsRedraw(),this._updateAttributes();const l=this.getModels()[0]!==c[0];this._postUpdate(a,l)}finally{n.viewport=r,this.props=t,this._clearChangeFlags(),s.needsUpdate=!1,s.resetOldProps()}}_finalize(){te(fC,this),this.finalizeState(this.context);for(const e of this.props.extensions)e.finalizeState.call(this,this.context,e)}_drawLayer({renderPass:e,shaderModuleProps:t=null,uniforms:n={},parameters:s={}}){this._updateAttributeTransition();const r=this.props,o=this.context;this.props=this.internalState.propsInTransition||r;try{t&&this.setShaderModuleProps(t);const{getPolygonOffset:a}=this.props,c=a&&a(n)||[0,0];o.device instanceof gt&&o.device.setParametersWebGL({polygonOffset:c});const l=o.device instanceof gt?null:mC(s);if(_C(this.getModels(),e,s,l),o.device instanceof gt)o.device.withParametersWebGL(s,()=>{const u={renderPass:e,shaderModuleProps:t,uniforms:n,parameters:s,context:o};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)});else{l?.renderPassParameters&&e.setParameters(l.renderPassParameters);const u={renderPass:e,shaderModuleProps:t,uniforms:n,parameters:s,context:o};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)}}finally{this.props=r}}getChangeFlags(){return this.internalState?.changeFlags}setChangeFlags(e){if(!this.internalState)return;const{changeFlags:t}=this.internalState;for(const s in e)if(e[s]){let r=!1;switch(s){case"dataChanged":const o=e[s],a=t[s];o&&Array.isArray(a)&&(t.dataChanged=Array.isArray(o)?a.concat(o):o,r=!0);default:t[s]||(t[s]=e[s],r=!0)}r&&te(cC,this,s,e)}const n=!!(t.dataChanged||t.updateTriggersChanged||t.propsChanged||t.extensionsChanged);t.propsOrDataChanged=n,t.somethingChanged=n||t.viewportChanged||t.stateChanged}_clearChangeFlags(){this.internalState.changeFlags={dataChanged:!1,propsChanged:!1,updateTriggersChanged:!1,viewportChanged:!1,stateChanged:!1,extensionsChanged:!1,propsOrDataChanged:!1,somethingChanged:!1}}_diffProps(e,t){const n=BL(e,t);if(n.updateTriggersChanged)for(const s in n.updateTriggersChanged)n.updateTriggersChanged[s]&&this.invalidateAttribute(s);if(n.transitionsChanged)for(const s in n.transitionsChanged)this.internalState.uniformTransitions.add(s,t[s],e[s],e.transitions?.[s]);return this.setChangeFlags(n)}validateProps(){OL(this.props)}updateAutoHighlight(e){this.props.autoHighlight&&!Number.isInteger(this.props.highlightedObjectIndex)&&this._updateAutoHighlight(e)}_updateAutoHighlight(e){const t={highlightedObjectColor:e.picked?e.color:null},{highlightColor:n}=this.props;e.picked&&typeof n=="function"&&(t.highlightColor=n(e)),this.setShaderModuleProps({picking:t}),this.setNeedsRedraw()}_getAttributeManager(){const e=this.context;return new LL(e.device,{id:this.props.id,stats:e.stats,timeline:e.timeline})}_postUpdate(e,t){const{props:n,oldProps:s}=e,r=this.state.model;r?.isInstanced&&r.setInstanceCount(this.getNumInstances());const{autoHighlight:o,highlightedObjectIndex:a,highlightColor:c}=n;if(t||s.autoHighlight!==o||s.highlightedObjectIndex!==a||s.highlightColor!==c){const l={};Array.isArray(c)&&(l.highlightColor=c),(t||s.autoHighlight!==o||a!==s.highlightedObjectIndex)&&(l.highlightedObjectColor=Number.isFinite(a)&&a>=0?this.encodePickingColor(a):null),this.setShaderModuleProps({picking:l})}}_getUpdateParams(){return{props:this.props,oldProps:this.internalState.getOldProps(),context:this.context,changeFlags:this.internalState.changeFlags}}_getNeedsRedraw(e){if(!this.internalState)return!1;let t=!1;t=t||this.internalState.needsRedraw&&this.id;const n=this.getAttributeManager(),s=n?n.getNeedsRedraw(e):!1;if(t=t||s,t)for(const r of this.props.extensions)r.onNeedsRedraw.call(this,r);return this.internalState.needsRedraw=this.internalState.needsRedraw&&!e.clearRedrawFlags,t}_onAsyncPropUpdated(){this._diffProps(this.props,this.internalState.getOldProps()),this.setNeedsUpdate()}}Tt.defaultProps=pC;Tt.layerName="Layer";function mC(i){const{blendConstant:e,...t}=i;return e?{pipelineParameters:t,renderPassParameters:{blendConstant:e}}:{pipelineParameters:t}}function _C(i,e,t,n){for(const s of i)s.device.type==="webgpu"?(yC(s,e),s.setParameters({...s.parameters,...n?.pipelineParameters})):s.setParameters(t)}function yC(i,e){const t=e.props.framebuffer||(e.framebuffer??null);if(!t)return;const n=t.colorAttachments.map(o=>o?.texture?.format??null),s=t.depthStencilAttachment?.texture?.format,r=i;(!bC(r.props.colorAttachmentFormats,n)||r.props.depthStencilAttachmentFormat!==s)&&(r.props.colorAttachmentFormats=n,r.props.depthStencilAttachmentFormat=s,r._setPipelineNeedsUpdate("attachment formats"))}function bC(i,e){if(i===e)return!0;if(!i||!e||i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0}const vC="compositeLayer.renderLayers";class og extends Tt{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(e=>e.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(e){}setState(e){super.setState(e),this.setNeedsUpdate()}getPickingInfo({info:e}){const{object:t}=e;return t&&t.__source&&t.__source.parent&&t.__source.parent.id===this.id&&(e.object=t.__source.object,e.index=t.__source.index),e}filterSubLayer(e){return!0}shouldRenderSubLayer(e,t){return t&&t.length}getSubLayerClass(e,t){const{_subLayerProps:n}=this.props;return n&&n[e]&&n[e].type||t}getSubLayerRow(e,t,n){return e.__source={parent:this,object:t,index:n},e}getSubLayerAccessor(e){if(typeof e=="function"){const t={index:-1,data:this.props.data,target:[]};return(n,s)=>n&&n.__source?(t.index=n.__source.index,e(n.__source.object,t)):e(n,s)}return e}getSubLayerProps(e={}){const{opacity:t,pickable:n,visible:s,parameters:r,getPolygonOffset:o,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:g,extensions:p,fetch:m,operation:_,_subLayerProps:b}=this.props,y={id:"",updateTriggers:{},opacity:t,pickable:n,visible:s,parameters:r,getPolygonOffset:o,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:g,extensions:p,fetch:m,operation:_},v=b&&e.id&&b[e.id],w=v&&v.updateTriggers,x=e.id||"sublayer";if(v){const S=this.props[Ke],T=e.type?e.type._propTypes:{};for(const L in v){const E=T[L]||S[L];E&&E.type==="accessor"&&(v[L]=this.getSubLayerAccessor(v[L]))}}Object.assign(y,e,v),y.id=`${this.props.id}-${x}`,y.updateTriggers={all:this.props.updateTriggers?.all,...e.updateTriggers,...w};for(const S of p){const T=S.getSubLayerProps.call(this,S);T&&Object.assign(y,T,{updateTriggers:Object.assign(y.updateTriggers,T.updateTriggers)})}return y}_updateAutoHighlight(e){for(const t of this.getSubLayers())t.updateAutoHighlight(e)}_getAttributeManager(){return null}_postUpdate(e,t){let n=this.internalState.subLayers;const s=!n||this.needsUpdate();if(s){const r=this.renderLayers();n=Kt(r,Boolean),this.internalState.subLayers=n}te(vC,this,s,n);for(const r of n)r.parent=this}}og.layerName="CompositeLayer";const Rt=Math.PI/180,Vu=180/Math.PI,Nn=6370972,Xe=256,ju=.75,wC=.35,xC=1.15;function PC(){const i=Xe/Nn,e=Math.PI/180*Xe;return{unitsPerMeter:[i,i,i],unitsPerMeter2:[0,0,0],metersPerUnit:[1/i,1/i,1/i],unitsPerDegree:[e,e,i],unitsPerDegree2:[0,0,0],degreesPerUnit:[1/e,1/e,1/i]}}class sc extends si{constructor(e={}){const{longitude:t=0,bearing:n=0,pitch:s=0,zoom:r=0,nearZMultiplier:o=.5,farZMultiplier:a=1,resolution:c=10}=e;let{latitude:l=0,height:u,altitude:f=1.5,fovy:d}=e;l=Math.max(Math.min(l,90),-90),u=u||1,d?f=Na(d):d=Ni(f);const h=Math.max(Math.min(l,Me),-Me),g=Math.pow(2,r-Q(h)),p=s*Rt,m=e.nearZ??o,_=e.farZ??(f+Xe*2*g/u/Math.max(Math.cos(p),.1))*a,b=new ve().lookAt({eye:[0,-f,0],up:[0,0,1]}).rotateX(-p).rotateY(-n*Rt).rotateX(l*Rt).rotateZ(-t*Rt).scale(g/u);super({...e,height:u,viewMatrix:b,longitude:t,latitude:l,zoom:r,distanceScales:PC(),fovy:d,focalDistance:f,near:m,far:_}),this.scale=g,this.latitude=l,this.longitude=t,this.bearing=n,this.pitch=s,this.fovy=d,this.resolution=c}get projectionMode(){return se.GLOBE}getDistanceScales(){return this.distanceScales}getBounds(e={}){const t={targetZ:e.z||0},n=this.unproject([0,this.height/2],t),s=this.unproject([this.width/2,0],t),r=this.unproject([this.width,this.height/2],t),o=this.unproject([this.width/2,this.height],t);return r[0]<this.longitude&&(r[0]+=360),n[0]>this.longitude&&(n[0]-=360),[Math.min(n[0],r[0],s[0],o[0]),Math.min(n[1],r[1],s[1],o[1]),Math.max(n[0],r[0],s[0],o[0]),Math.max(n[1],r[1],s[1],o[1])]}_getRayToGlobe(e,{topLeft:t=!0,targetZ:n}={}){const[s,r]=e,o=t?r:this.height-r,{pixelUnprojectionMatrix:a}=this,c=Vr(a,[s,o,-1,1]),l=Vr(a,[s,o,1,1]),u=((n||0)/Nn+1)*Xe,f=ar(Jn([],c,l)),d=ar(c),h=ar(l),p=4*((4*d*h-(f-d-h)**2)/16)/f;return{rayStartPosition:c,rayEndPosition:l,radius:u,rayLengthSquared:f,rayStartDistanceSquared:d,distanceToCenterSquared:p}}_getRayDistanceToGlobeCenterRatio(e,t){const{distanceToCenterSquared:n,radius:s}=this._getRayToGlobe(e,t);return Math.sqrt(Math.max(0,n))/s}getZoomAnchorStrength(e){const t=this._getRayDistanceToGlobeCenterRatio(e);return t>xC?0:1-Math.max(0,Math.min(1,(t-ju)/(1-ju)))*(1-wC)}unproject(e,{topLeft:t=!0,targetZ:n}={}){const[s,r,o]=e,a=t?r:this.height-r,{pixelUnprojectionMatrix:c}=this;let l;if(Number.isFinite(o))l=Vr(c,[s,a,o,1]);else{const{rayStartPosition:h,rayEndPosition:g,radius:p,rayLengthSquared:m,rayStartDistanceSquared:_,distanceToCenterSquared:b}=this._getRayToGlobe(e,{topLeft:t,targetZ:n}),y=Math.sqrt(_-b),v=Math.sqrt(Math.max(0,p*p-b)),w=(y-v)/Math.sqrt(m);l=O0([],h,g,w)}const[u,f,d]=this.unprojectPosition(l);return Number.isFinite(o)?[u,f,d]:Number.isFinite(n)?[u,f,n]:[u,f]}projectPosition(e){const[t,n,s=0]=e,r=t*Rt,o=n*Rt,a=Math.cos(o),c=(s/Nn+1)*Xe;return[Math.sin(r)*a*c,-Math.cos(r)*a*c,Math.sin(o)*c]}unprojectPosition(e){const[t,n,s]=e,r=kd(e),o=Math.asin(s/r),c=Math.atan2(t,-n)*Vu,l=o*Vu,u=(r/Xe-1)*Nn;return[c,l,u]}projectFlat(e){return e}unprojectFlat(e){return e}panByPosition(e,t,n){if(!n){const d=this.getZoomAnchorStrength(t);if(d===0)return{longitude:this.longitude,latitude:this.latitude};const h=this.unproject(t),g=$i(e[0]-h[0]+180,360)-180,p=this.longitude+g*d,m=Math.max(Math.min(this.latitude+(e[1]-h[1])*d,90),-90);return{longitude:p,latitude:m}}const[s,r,o]=e,c=.25/Math.pow(2,this.zoom-Q(this.latitude)),l=s+c*(n[0]-t[0]);let u=r-c*(n[1]-t[1]);u=Math.max(Math.min(u,90),-90);const f={longitude:l,latitude:u,zoom:o-Q(r)};return f.zoom+=Q(f.latitude),f}}sc.displayName="GlobeViewport";function Q(i,e){e&&(i=Math.max(Math.min(i,Me),-Me));const t=Math.PI*Math.cos(i*Math.PI/180);return Math.log2(t)}function Vr(i,e){const t=Et([],e,i);return Ba(t,t,1/t[3]),t}const Ot=Math.PI/180,jr=180/Math.PI;class j{static toPosition(e,t){const n=t*Ot,s=e*Ot,r=Math.cos(n);return[r*Math.cos(s),r*Math.sin(s),Math.sin(n)]}static toLngLat(e){return[Math.atan2(e[1],e[0])*jr,Math.asin(H(e[2],-1,1))*jr]}static tangentBasis(e,t){const n=t*Ot,s=e*Ot,r=Math.sin(n),o=Math.cos(n),a=Math.sin(s),c=Math.cos(s);return{N:[-r*c,-r*a,o],E:[-a,c,0]}}static upVector(e,t,n){const{N:s,E:r}=j.tangentBasis(e,t),o=n*Ot,a=Math.cos(o),c=Math.sin(o);return[s[0]*a+r[0]*c,s[1]*a+r[1]*c,s[2]*a+r[2]*c]}static bearing(e,t,n){const{N:s,E:r}=j.tangentBasis(t,n);return Math.atan2(xi(e,r),xi(e,s))*jr}static cameraFrame(e,t,n){const s=j.toPosition(e,t),r=j.upVector(e,t,n),{N:o,E:a}=j.tangentBasis(e,t),c=n*Ot,l=Math.cos(c),u=Math.sin(c),f=[a[0]*l-o[0]*u,a[1]*l-o[1]*u,a[2]*l-o[2]*u];return{position:s,up:r,axisHorizontal:ut([],s,f),axisVertical:ut([],s,r),longitude:e,latitude:t,bearing:n}}static angularDistance(e,t){const n=j.toPosition(e.longitude,e.latitude),s=j.toPosition(t.longitude,t.latitude);return Math.acos(H(xi(n,s),-1,1))}static greatCircleAxis(e,t){const n=j.toPosition(e.longitude,e.latitude),s=j.toPosition(t.longitude,t.latitude);return Bd([],ut([],n,s))}static rotate(e,t,n){const s=new Cw().fromAxisRotation(t,n);return Ia([],e,s)}static rotateFrame(e,t,n,s){let r=j.rotate(e.position,e.axisHorizontal,t);r=j.rotate(r,e.axisVertical,n);let o=j.rotate(e.up,e.axisHorizontal,t);o=j.rotate(o,e.axisVertical,n);const[a,c]=j.toLngLat(r),l=s?0:j.bearing(o,a,c);return{...e,position:r,up:o,longitude:a,latitude:c,bearing:l}}}const EC=1/(1-Math.exp(-5)),SC=i=>(1-Math.exp(-5*i))*EC;class Wu extends uh{constructor(e){const t="axis"in e;super({compare:["longitude","latitude"],extract:t?["longitude","latitude","zoom","bearing"]:["longitude","latitude","zoom"],required:["longitude","latitude"]}),t?(this._mode="rotation",this._axis=e.axis,this._totalAngle=e.totalAngle):(this._mode="linear",this._targetLongitude=e.targetLongitude)}initializeProps(e,t){const n=super.initializeProps(e,t);return this._startZoom=e.zoom,this._mode==="rotation"?this._startFrame={...j.cameraFrame(e.longitude,e.latitude,e.bearing||0),axisHorizontal:this._axis}:n.end.longitude=this._targetLongitude,n}interpolateProps(e,t,n){if(this._mode==="rotation"){const{longitude:a,latitude:c,bearing:l}=j.rotateFrame(this._startFrame,this._totalAngle*n,0),u=this._startZoom+Q(c,!0)-Q(this._startFrame.latitude,!0);return{bearing:l,longitude:a,latitude:c,zoom:u}}const s=e.longitude+(t.longitude-e.longitude)*n,r=e.latitude+(t.latitude-e.latitude)*n,o=this._startZoom+Q(r,!0)-Q(e.latitude,!0);return{longitude:s,latitude:r,zoom:o}}}const Ne=Math.PI/180,TC=180/Math.PI;function Hu(i,e=0){const t=Math.min(180,i)*Ne;return Xe*2*Math.sin(t/2)*Math.pow(2,e)}function Bt(i,e=0){const t=i/Math.pow(2,e);return Math.asin(Math.min(1,t/Xe/2))*2*TC}class LC extends gh{constructor(e){const{startPanPos:t,startPanCameraFrame:n,startPanAngularRate:s,startPanLockBearing:r,...o}=e;o.normalize=!1,super(o);const a=this._state;t!==void 0&&(a.startPanPos=t),n!==void 0&&(a.startPanCameraFrame=n),s!==void 0&&(a.startPanAngularRate=s),r!==void 0&&(a.startPanLockBearing=r)}panStart({pos:e}){const{latitude:t,longitude:n,zoom:s,bearing:r=0}=this.getViewportProps(),o=j.cameraFrame(n,t,r),a=Math.abs(r)<1;a&&(o.axisHorizontal=[0,0,1]);const l=.25/Math.pow(2,s-Q(t,!0))*Ne;return this._getUpdatedState({startPanPos:e,startPanCameraFrame:o,startPanAngularRate:l,startPanLockBearing:a,startZoom:s})}pan({pos:e,startPos:t}){const n=this.getState(),s=n.startPanPos||t;if(!s)return this;const r=n.startPanCameraFrame,o=n.startPanAngularRate,a=n.startZoom??this.getViewportProps().zoom;if(!r||!o)return this;const c=s[0]-e[0],l=s[1]-e[1];let u=c*o,f=-l*o;const d=n.startPanLockBearing;if(d){const p=Math.cos(r.latitude*Ne);u=c*o/Math.max(p,.25);const m=(Me-r.latitude)*Ne,_=-(Me+r.latitude)*Ne;f=H(f,_,m)}const h=j.rotateFrame(r,u,f,d),g=a+Q(h.latitude,!0)-Q(r.latitude,!0);return this._getUpdatedState({longitude:h.longitude,latitude:h.latitude,bearing:h.bearing,zoom:g})}panEnd(){return this._getUpdatedState({startPanPos:null,startPanCameraFrame:null,startPanAngularRate:null,startPanLockBearing:null,startZoom:null})}_panFromCenter(e){const{width:t,height:n}=this.getViewportProps(),s=[t/2,n/2];return this.panStart({pos:s}).pan({pos:[s[0]+e[0],s[1]+e[1]]}).panEnd()}applyConstraints(e){const t=e,n=t[at];delete t[at];const{latitude:s,maxBounds:r}=e;if(e.zoom=this._constrainZoom(e.zoom,e),n){const a=this.makeViewport(e);Object.assign(e,a.panByPosition(n.position,n.screenPosition))}(e.longitude<-180||e.longitude>180)&&(e.longitude=$i(e.longitude+180,360)-180),e.latitude=H(e.latitude,-90,90),(e.bearing<-180||e.bearing>180)&&(e.bearing=$i(e.bearing+180,360)-180),e.pitch=H(e.pitch,e.minPitch,e.maxPitch);const o=r?us(e.width,e.height,e.maxBoundsPadding):null;if(r&&o&&(o.width>=0&&(e.longitude=H(e.longitude,r[0][0],r[1][0])),o.height>=0&&(e.latitude=H(e.latitude,r[0][1],r[1][1]))),r&&o){const a=this.makeViewport({...e,bearing:0,pitch:0}),c=dh(a,[e.longitude,e.latitude],o),l=e.zoom-Q(s),u=r[1][0]-r[0][0],f=r[1][1]-r[0][1];if(o.height>=0&&f>0&&f<180){const d=Math.min(Bt(o.height,l),f),h=o.height?d*c.bottom/o.height:Bt(c.bottom,l),g=o.height?d*c.top/o.height:Bt(c.top,l);e.latitude=H(e.latitude,r[0][1]+h,r[1][1]-g)}if(o.width>=0&&u>0&&u<360){const d=Math.min(Bt(o.width/Math.cos(e.latitude*Ne),l),u),h=o.width?d*c.left/o.width:Bt(c.left/Math.cos(e.latitude*Ne),l),g=o.width?d*c.right/o.width:Bt(c.right/Math.cos(e.latitude*Ne),l);e.longitude=H(e.longitude,r[0][0]+h,r[1][0]-g)}}return e.latitude!==s&&(e.zoom+=Q(e.latitude,!0)-Q(s,!0)),e}_constrainZoom(e,t){t||(t=this.getViewportProps());const{maxZoom:n,maxBounds:s}=t;let{minZoom:r}=t;if(s!==null&&t.width>0&&t.height>0){const c=us(t.width,t.height,t.maxBoundsPadding),l=s[0][1],u=s[1][1],f=Math.sign(l)===Math.sign(u)?Math.min(Math.abs(l),Math.abs(u)):0,d=Q(0),h=Hu(s[1][0]-s[0][0])*Math.cos(f*Ne),g=Hu(s[1][1]-s[0][1]);c.width>0&&h>0&&(r=Math.max(r,Math.log2(c.width/h)+d)),c.height>0&&g>0&&(r=Math.max(r,Math.log2(c.height/g)+d)),r>n&&(r=n)}const a=Q(t.latitude,!0)-Q(0,!0);return H(e,r+a,n+a)}}class CC extends fh{constructor(){super(...arguments),this.ControllerState=LC,this.transition={transitionDuration:300,transitionInterpolator:new ja({transitionProps:{compare:["longitude","latitude","zoom","bearing","pitch"],required:["longitude","latitude","zoom"]}})},this.dragMode="pan",this._panHistory=[]}getZoomPosition(e){const t=super.getZoomPosition(e),n=this.makeViewport(this.controllerState.getViewportProps());return!(n instanceof sc)||n.getZoomAnchorStrength(t)>0?t:n.project([n.longitude,n.latitude])}_onPanStart(e){return this._panHistory=[],super._onPanStart(e)}_onMultiPanStart(e){return this._panHistory=[],super._onMultiPanStart(e)}_onPanMove(e){if(!this.dragPan)return!1;const t=this.getCenter(e),n=this.controllerState.pan({pos:t});this.updateViewport(n,{transitionDuration:0},{isDragging:!0,isPanning:!0});const{longitude:s,latitude:r}=n.getViewportProps();return this._panHistory.push({longitude:s,latitude:r,timestamp:Date.now()}),this._panHistory.length>5&&this._panHistory.shift(),!0}_onPanMoveEnd(e){const{inertia:t}=this;if(this.dragPan&&t&&this._panHistory.length>=2){const s=this._panHistory[0],r=this._panHistory[this._panHistory.length-1],o=r.timestamp-s.timestamp;if(o>0){const a=this.controllerState.getViewportProps(),c=this.controllerState.getState(),u=j.angularDistance(s,r)/o;if(u>1e-6){const f=u*t/2;let d,h,g;if(c.startPanLockBearing){let m=r.longitude-s.longitude;m>180?m-=360:m<-180&&(m+=360);const _=r.latitude-s.latitude,b=m/o,y=_/o;h=a.longitude+b*t/2,g=H(a.latitude+y*t/2,-90,90),d=new Wu({targetLongitude:h})}else{const m=j.greatCircleAxis(s,r),_=j.cameraFrame(a.longitude,a.latitude,a.bearing||0),b=j.rotateFrame({..._,axisHorizontal:m},f,0);h=b.longitude,g=H(b.latitude,-90,90),d=new Wu({axis:m,totalAngle:f})}const p=this.controllerState.panEnd();return this.updateViewport(p,{transitionInterpolator:d,transitionDuration:t,transitionEasing:SC,longitude:h,latitude:g},{isDragging:!1,isPanning:!0}),this._panHistory=[],!0}}}this._panHistory=[];const n=this.controllerState.panEnd();return this.updateViewport(n,null,{isDragging:!1,isPanning:!1}),!0}}const AC={cullMode:"back"};class ag extends lh{constructor(e={}){super({...e,parameters:{...AC,...e.parameters}})}getViewportType(e){return e.zoom>12?Oe:sc}get ControllerType(){return CC}}ag.displayName="GlobeView";class rc{static get componentName(){return Object.prototype.hasOwnProperty.call(this,"extensionName")?this.extensionName:""}constructor(e){e&&(this.opts=e)}equals(e){return this===e?!0:this.constructor===e.constructor&&J(this.opts,e.opts,1)}getShaders(e){return null}getSubLayerProps(e){const{defaultProps:t}=e.constructor,n={updateTriggers:{}};for(const s in t)if(s in this.props){const r=t[s],o=this.props[s];n[s]=o,r&&r.type==="accessor"&&(n.updateTriggers[s]=this.props.updateTriggers[s],typeof o=="function"&&(n[s]=this.getSubLayerAccessor(o)))}return n}initializeState(e,t){}updateState(e,t){}onNeedsRedraw(e){}getNeedsPickingBuffer(e){return!1}draw(e,t){}finalizeState(e,t){}}rc.defaultProps={};rc.extensionName="LayerExtension";class MC{constructor(e){this.indexStarts=[0],this.vertexStarts=[0],this.vertexCount=0,this.instanceCount=0;const{attributes:t={}}=e;this.typedArrayManager=Zt,this.attributes={},this._attributeDefs=t,this.opts=e,this.updateGeometry(e)}updateGeometry(e){Object.assign(this.opts,e);const{data:t,buffers:n={},getGeometry:s,geometryBuffer:r,positionFormat:o,dataChanged:a,normalize:c=!0}=this.opts;if(this.data=t,this.getGeometry=s,this.positionSize=r&&r.size||(o==="XY"?2:3),this.buffers=n,this.normalize=c,r&&($(t.startIndices),this.getGeometry=this.getGeometryFromBuffer(r),c||(n.vertexPositions=r)),this.geometryBuffer=n.vertexPositions,Array.isArray(a))for(const l of a)this._rebuildGeometry(l);else this._rebuildGeometry()}updatePartialGeometry({startRow:e,endRow:t}){this._rebuildGeometry({startRow:e,endRow:t})}getGeometryFromBuffer(e){const t=e.value||e;return ArrayBuffer.isView(t)?Bh(t,{size:this.positionSize,offset:e.offset,stride:e.stride,startIndices:this.data.startIndices}):null}_allocate(e,t){const{attributes:n,buffers:s,_attributeDefs:r,typedArrayManager:o}=this;for(const a in r)if(a in s)o.release(n[a]),n[a]=null;else{const c=r[a];c.copy=t,n[a]=o.allocate(n[a],e,c)}}_forEachGeometry(e,t,n){const{data:s,getGeometry:r}=this,{iterable:o,objectInfo:a}=nn(s,t,n);for(const c of o){a.index++;const l=r?r(c,a):null;e(l,a.index)}}_rebuildGeometry(e){if(!this.data)return;let{indexStarts:t,vertexStarts:n,instanceCount:s}=this;const{data:r,geometryBuffer:o}=this,{startRow:a=0,endRow:c=1/0}=e||{},l={};if(e||(t=[0],n=[0]),this.normalize||!o)this._forEachGeometry((f,d)=>{const h=f&&this.normalizeGeometry(f);l[d]=h,n[d+1]=n[d]+(h?this.getGeometrySize(h):0)},a,c),s=n[n.length-1];else if(n=r.startIndices,s=n[r.length]||0,ArrayBuffer.isView(o))s=s||o.length/this.positionSize;else if(o instanceof O){const f=this.positionSize*4;s=s||o.byteLength/f}else if(o.buffer){const f=o.stride||this.positionSize*4;s=s||o.buffer.byteLength/f}else if(o.value){const f=o.value,d=o.stride/f.BYTES_PER_ELEMENT||this.positionSize;s=s||f.length/d}this._allocate(s,!!e),this.indexStarts=t,this.vertexStarts=n,this.instanceCount=s;const u={};this._forEachGeometry((f,d)=>{const h=l[d]||f;u.vertexStart=n[d],u.indexStart=t[d];const g=d<n.length-1?n[d+1]:s;u.geometrySize=g-n[d],u.geometryIndex=d,this.updateGeometryAttributes(h,u)},a,c),this.vertexCount=t[t.length-1]}}class IC{constructor(e){$(e.id,"id is required"),this.id=e.id,this.type="custom",this.renderingMode=e.renderingMode||"3d",this.slot=e.slot,this.beforeId=e.beforeId,this.map=null}onAdd(e,t){this.map=e}render(e,t){this.map&&DC(this.map.__deck,this.map,this,t)}}const Wr="__UNDEFINED__";function Mi(i){return i.props.beforeId?`deck-layer-group-before:${i.props.beforeId}`:i.props.slot?`deck-layer-group-slot:${i.props.slot}`:"deck-layer-group-last"}function RC(i,e,t){if(!i||!i.style||!i.style._loaded)return;const n=Kt(t,Boolean);if(e!==t){const o=Kt(e,Boolean),a=new Set(o.map(l=>Mi(l))),c=new Set(n.map(l=>Mi(l)));for(const l of a)c.has(l)||i.getLayer(l)&&i.removeLayer(l)}const s={};for(const o of n){const a=Mi(o),c=i.getLayer(a);if(c){const l=c.implementation||c;s[a]=l}else{const l=new IC({id:a,slot:o.props.slot,beforeId:o.props.beforeId});s[a]=l,i.addLayer(l,o.props.beforeId)}}const r=i.style._order;for(const[o,a]of Object.entries(s)){const c=a.beforeId||Wr,l=c===Wr?r.length:r.indexOf(c);if(l===-1)continue;if(r.indexOf(o)!==l-1){const f=c===Wr?void 0:c;i.moveLayer(o,f)}}}const Qt="mapbox",Hr=512,OC=Math.PI/180;function BC({map:i,deck:e}){if(i.__deck)return i.__deck;const t=e.props._customRender,n=e.props.onLoad,s={...e.props,_customRender:()=>{i.triggerRepaint(),t?.("")}};return s.views||(s.views=ps(i)),Object.assign(s,{width:null,height:null,touchAction:"unset",viewState:Vi(i)}),e.isInitialized?Yu(e,i):s.onLoad=()=>{Yu(e,i),ug(e,i),n?.()},e.setProps(s),i.__deck=e,i.on("render",()=>{e.isInitialized&&zC(e,i)}),e}function Yu(i,e){const t=()=>{i.isInitialized?ug(i,e):e.off("move",t)};e.on("move",t)}function kC(i){i.__deck?.finalize(),i.__deck=null}function Yr(i,e){return e?{depthWriteEnabled:!0,depthCompare:"less-equal",depthBias:0,blend:!0,blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha",blendColorOperation:"add",blendAlphaOperation:"add"}:{}}function DC(i,e,t,n){if(!i.isInitialized)return;let{currentViewport:s}=i.userData,r=!1;s||(s=lg(i,e,n),i.userData.currentViewport=s,r=!0),s&&i._drawLayers("mapbox-repaint",{viewports:[s],layerFilter:o=>{if(i.props.layerFilter&&!i.props.layerFilter(o))return!1;const a=o.layer;return a.props.beforeId===t.beforeId&&a.props.slot===t.slot},clearStack:r,clearCanvas:!1})}function cg(i){let e;try{e=i.getProjection?.()}catch{return"mercator"}const t=e?.type||e?.name;if(t==="globe")return"globe";if(t&&t!=="mercator")throw new Error("Unsupported projection");return"mercator"}function ps(i){return cg(i)==="globe"?new ag({id:Qt}):new Wa({id:Qt})}function Vi(i){const{lng:e,lat:t}=i.getCenter(),n={longitude:(e+540)%360-180,latitude:t,zoom:i.getZoom(),bearing:i.getBearing(),pitch:i.getPitch(),padding:i.getPadding(),repeat:i.getRenderWorldCopies()};return i.getTerrain?.()&&FC(i,n),n}function FC(i,e){if(i.getFreeCameraOptions){const{position:t}=i.getFreeCameraOptions();if(!t||t.z===void 0)return;const n=i.transform.height,{longitude:s,latitude:r,pitch:o}=e,a=t.x*Hr,c=(1-t.y)*Hr,l=t.z*Hr,u=_t([s,r]),f=a-u[0],d=c-u[1],h=Math.sqrt(f*f+d*d),g=o*OC,p=1.5*n,m=g<.001?p*Math.cos(g)/l:p*Math.sin(g)/h;e.zoom=Math.log2(m);const _=p*Math.cos(g)/m,b=l-_;e.position=[0,0,b/Bn(r)]}else typeof i.transform.elevation=="number"&&(e.position=[0,0,i.transform.elevation])}function lg(i,e,t){const n=Vi(e),s=i.getView(Qt)||ps(e);t&&(s.props.nearZMultiplier=.2);const r=t?.nearZ??e.transform._nearZ,o=t?.farZ??e.transform._farZ;return Number.isFinite(r)&&(n.nearZ=r/e.transform.height,n.farZ=o/e.transform.height),s.makeViewport({width:i.width,height:i.height,viewState:n})}function zC(i,e){const n=Kt(i.props.layers,Boolean).some(a=>a&&!e.getLayer(Mi(a)));let s=i.getViewports();const r=s.findIndex(a=>a.id===Qt),o=s.length>1||r<0;if(n||o){if(r>=0){s=s.slice();const a=lg(i,e);a?s[r]=a:s.splice(r,1)}i._drawLayers("mapbox-repaint",{viewports:s,layerFilter:a=>(!i.props.layerFilter||i.props.layerFilter(a))&&(a.viewport.id!==Qt||!e.getLayer(Mi(a.layer))),clearCanvas:!1})}else{const a=i.device,c=a?.gl;i.props.onBeforeRender?.({device:a,gl:c}),i.props.onAfterRender?.({device:a,gl:c})}i.userData.currentViewport=null}function ug(i,e){i.setProps({viewState:Vi(e)}),i.needsRedraw({clearRedrawFlags:!0})}class HM{constructor(e){this._handleStyleChange=()=>{if(this._resolveLayers(this._map,this._deck,this._props.layers,this._props.layers),!this._map)return;cg(this._map)&&this._deck?.setProps({views:this._getViews(this._map)})},this._updateContainerSize=()=>{if(this._map&&this._container){const{clientWidth:n,clientHeight:s}=this._map.getContainer();Object.assign(this._container.style,{width:`${n}px`,height:`${s}px`})}},this._updateViewState=()=>{const n=this._deck,s=this._map;n&&s&&(n.setProps({views:this._getViews(s),viewState:Vi(s)}),n.isInitialized&&n.redraw())},this._handleMouseEvent=n=>{const s=this._deck;if(!s||!s.isInitialized)return;const r={type:n.type,offsetCenter:n.point,srcEvent:n},o=this._lastMouseDownPoint;switch(!n.point&&o&&(r.deltaX=n.originalEvent.clientX-o.clientX,r.deltaY=n.originalEvent.clientY-o.clientY,r.offsetCenter={x:o.x+r.deltaX,y:o.y+r.deltaY}),r.type){case"mousedown":s._onPointerDown(r),this._lastMouseDownPoint={...n.point,clientX:n.originalEvent.clientX,clientY:n.originalEvent.clientY};break;case"dragstart":r.type="panstart",s._onEvent(r);break;case"drag":r.type="panmove",s._onEvent(r);break;case"dragend":r.type="panend",s._onEvent(r);break;case"click":r.tapCount=1,s._onEvent(r);break;case"dblclick":r.type="click",r.tapCount=2,s._onEvent(r);break;case"mousemove":r.type="pointermove",s._onPointerMove(r);break;case"mouseout":r.type="pointerleave",s._onPointerMove(r);break;default:return}};const{interleaved:t=!1}=e;this._interleaved=t,this._props=this.filterProps(e)}filterProps(e){const{interleaved:t,useDevicePixels:n,...s}=e;return!this._interleaved&&n!==void 0&&(s.useDevicePixels=n),s}setProps(e){this._interleaved&&e.layers&&this._resolveLayers(this._map,this._deck,this._props.layers,e.layers),Object.assign(this._props,this.filterProps(e)),this._deck&&this._map&&this._deck.setProps({...this._props,views:this._getViews(this._map),parameters:{...Yr(this._map,this._interleaved),...this._props.parameters}})}onAdd(e){return this._map=e,this._interleaved?this._onAddInterleaved(e):this._onAddOverlaid(e)}_onAddOverlaid(e){const t=document.createElement("div");return Object.assign(t.style,{position:"absolute",left:0,top:0,textAlign:"initial",pointerEvents:"none"}),this._container=t,this._deck=new ds({...this._props,parent:t,deviceProps:{...this._props.deviceProps,createCanvasContext:{...typeof this._props.deviceProps?.createCanvasContext=="object"?this._props.deviceProps.createCanvasContext:void 0,pixelSizeSource:"css-dpr"}},parameters:{...Yr(e,!1),...this._props.parameters},views:this._getViews(e),viewState:Vi(e)}),e.on("resize",this._updateContainerSize),e.on("render",this._updateViewState),e.on("mousedown",this._handleMouseEvent),e.on("dragstart",this._handleMouseEvent),e.on("drag",this._handleMouseEvent),e.on("dragend",this._handleMouseEvent),e.on("mousemove",this._handleMouseEvent),e.on("mouseout",this._handleMouseEvent),e.on("click",this._handleMouseEvent),e.on("dblclick",this._handleMouseEvent),this._updateContainerSize(),t}_onAddInterleaved(e){const t=e.painter.context.gl;return t instanceof WebGLRenderingContext&&z.warn("Incompatible basemap library. See: https://deck.gl/docs/api-reference/mapbox/overview#compatibility")(),this._deck=BC({map:e,deck:new ds({...this._props,views:this._getViews(e),gl:t,parameters:{...Yr(e,!0),...this._props.parameters}})}),e.on("styledata",this._handleStyleChange),this._resolveLayers(e,this._deck,[],this._props.layers),document.createElement("div")}_resolveLayers(e,t,n,s){RC(e,n,s)}onRemove(){const e=this._map;e&&(this._interleaved?this._onRemoveInterleaved(e):this._onRemoveOverlaid(e)),this._deck=void 0,this._map=void 0,this._container=void 0}_onRemoveOverlaid(e){e.off("resize",this._updateContainerSize),e.off("render",this._updateViewState),e.off("mousedown",this._handleMouseEvent),e.off("dragstart",this._handleMouseEvent),e.off("drag",this._handleMouseEvent),e.off("dragend",this._handleMouseEvent),e.off("mousemove",this._handleMouseEvent),e.off("mouseout",this._handleMouseEvent),e.off("click",this._handleMouseEvent),e.off("dblclick",this._handleMouseEvent),this._deck?.finalize(),this._container?.remove()}_onRemoveInterleaved(e){e.off("styledata",this._handleStyleChange),this._resolveLayers(e,this._deck,this._props.layers,[]),kC(e)}getDefaultPosition(){return"top-left"}pickObject(e){return $(this._deck),this._deck.pickObject(e)}pickMultipleObjects(e){return $(this._deck),this._deck.pickMultipleObjects(e)}pickObjects(e){return $(this._deck),this._deck.pickObjects(e)}finalize(){this._map&&this._map.removeControl(this)}getCanvas(){return this._map?this._interleaved?this._map.getCanvas():this._deck.getCanvas():null}_getViews(e){if(!this._props.views)return ps(e);const t=Array.isArray(this._props.views)?this._props.views:[this._props.views];return t.some(s=>s.id===Qt)?this._props.views:[ps(e),...t]}}const qu=`layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`,NC={name:"icon",vs:qu,fs:qu,uniformTypes:{sizeScale:"f32",iconsTextureDim:"vec2<f32>",sizeBasis:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",billboard:"f32",sizeUnits:"i32",alphaCutoff:"f32"}},$C=`#version 300 es
#define SHADER_NAME icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
#ifdef USE_ROW_INDEXES
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float iconConstraint = icon.sizeBasis == 0.0 ? iconSize.x : iconSize.y;
float instanceScale = iconConstraint == 0.0 ? 0.0 : sizePixels / iconConstraint;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,UC=`#version 300 es
#define SHADER_NAME icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
vec4 texColor = texture(iconsTexture, vTextureCoords);
vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
float a = texColor.a * layer.opacity * vColor.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color, a);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,GC=`struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, s), vec2<f32>(-s, c));
  return rotation * vertex;
}

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  // write geometry fields used by filters + FS
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  // convert size in meters to pixels, then clamp
  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // scale icon height to match instanceSize
  let iconConstraint = select(iconSize.y, iconSize.x, icon.sizeBasis == 0.0);
  let instanceScale = select(sizePixels / iconConstraint, 0.0, iconConstraint == 0.0);

  // scale and rotate vertex in "pixel" units; then add per-instance pixel offset
  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  if (icon.billboard != 0) {
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0)); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);

    var offset = vec3<f32>(pixelOffset, 0.0);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipOffset = project_pixel_size_to_clipspace(offset.xy);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
    outp.position = pos;
  } else {
    var offset_common = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    // DECKGL_FILTER_SIZE(offset_common, geometry);
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offset_common); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);
    outp.position = pos;
  }

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.vColor = inp.instanceColors;
  // DECKGL_FILTER_COLOR(outp.vColor, geometry);

  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = geometry.pickingColor;

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  // expose to deck.gl filter hooks
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 (or picking), use texture as transparency mask
  let rgb = mix(texColor.rgb, inp.vColor.rgb, inp.vColorMode);
  let a = texColor.a * layer.opacity * inp.vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`;function VC(i){return GC.replace("PICKING_COLOR_ATTRIBUTE",i?"@location(10) rowIndexes: u32,":"").replace("PICKING_COLOR_VALUE",i?"picking_getPickingColorFromIndex(inp.rowIndexes)":"picking_getPickingColorFromIndex(inp.instanceIndex)")}const jC=1024,WC=4,Xu=()=>{},Zu={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},HC={x:0,y:0,width:0,height:0};function YC(i){return Math.pow(2,Math.ceil(Math.log2(i)))}function qC(i,e,t,n){const s=Math.min(t/e.width,n/e.height),r=Math.floor(e.width*s),o=Math.floor(e.height*s);return s===1?{image:e,width:r,height:o}:(i.canvas.height=o,i.canvas.width=r,i.clearRect(0,0,r,o),i.drawImage(e,0,0,e.width,e.height,0,0,r,o),{image:i.canvas,width:r,height:o})}function ji(i){return i&&(i.id||i.url)}function fg(i){const{device:e}=i;e.type==="webgl"?i.generateMipmapsWebGL():e.type==="webgpu"&&e.generateMipmapsWebGPU(i)}function XC(i,e,t,n){const{width:s,height:r,device:o}=i,a=o.createTexture({format:"rgba8unorm",width:e,height:t,sampler:n,mipLevels:o.getMipLevelCount(e,t)}),c=o.createCommandEncoder();c.copyTextureToTexture({sourceTexture:i,destinationTexture:a,width:s,height:r});const l=c.finish();return o.submit(l),fg(a),i.destroy(),a}function Ku(i,e,t){for(let n=0;n<e.length;n++){const{icon:s,xOffset:r}=e[n],o=ji(s);i[o]={...s,x:r,y:t}}}function ZC({icons:i,buffer:e,mapping:t={},xOffset:n=0,yOffset:s=0,rowHeight:r=0,canvasWidth:o}){let a=[];for(let c=0;c<i.length;c++){const l=i[c],u=ji(l);if(!t[u]){const{height:f,width:d}=l;n+d+e>o&&(Ku(t,a,s),n=0,s=r+s+e,r=0,a=[]),a.push({icon:l,xOffset:n}),n=n+d+e,r=Math.max(r,f)}}return a.length>0&&Ku(t,a,s),{mapping:t,rowHeight:r,xOffset:n,yOffset:s,canvasWidth:o,canvasHeight:YC(r+s+e)}}function KC(i,e,t){if(!i||!e)return null;t=t||{};const n={},{iterable:s,objectInfo:r}=nn(i);for(const o of s){r.index++;const a=e(o,r),c=ji(a);if(!a)throw new Error("Icon is missing.");if(!a.url)throw new Error("Icon url is missing.");!n[c]&&(!t[c]||a.url!==t[c].url)&&(n[c]={...a,source:o,sourceIndex:r.index})}return n}class QC{constructor(e,{onUpdate:t=Xu,onError:n=Xu}){this._loadOptions=null,this._texture=null,this._externalTexture=null,this._mapping={},this._samplerParameters=null,this._pendingCount=0,this._autoPacking=!1,this._xOffset=0,this._yOffset=0,this._rowHeight=0,this._buffer=WC,this._canvasWidth=jC,this._canvasHeight=0,this._canvas=null,this.device=e,this.onUpdate=t,this.onError=n}finalize(){this._texture?.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(e){const t=this._autoPacking?ji(e):e;return this._mapping[t]||HC}setProps({loadOptions:e,autoPacking:t,iconAtlas:n,iconMapping:s,textureParameters:r}){e&&(this._loadOptions=e),t!==void 0&&(this._autoPacking=t),s&&(this._mapping=s),n&&(this._texture?.delete(),this._texture=null,this._externalTexture=n),r&&(this._samplerParameters=r)}get isLoaded(){return this._pendingCount===0}packIcons(e,t){if(!this._autoPacking||typeof document>"u")return;const n=Object.values(KC(e,t,this._mapping)||{});if(n.length>0){const{mapping:s,xOffset:r,yOffset:o,rowHeight:a,canvasHeight:c}=ZC({icons:n,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=a,this._mapping=s,this._xOffset=r,this._yOffset=o,this._canvasHeight=c,this._texture||(this._texture=this.device.createTexture({format:"rgba8unorm",data:null,width:this._canvasWidth,height:this._canvasHeight,sampler:this._samplerParameters||Zu,mipLevels:this.device.getMipLevelCount(this._canvasWidth,this._canvasHeight)})),this._texture.height!==this._canvasHeight&&(this._texture=XC(this._texture,this._canvasWidth,this._canvasHeight,this._samplerParameters||Zu)),this.onUpdate(!0),this._canvas=this._canvas||document.createElement("canvas"),this._loadIcons(n)}}_loadIcons(e){const t=this._canvas.getContext("2d",{willReadFrequently:!0});for(const n of e)this._pendingCount++,Vn(n.url,this._loadOptions).then(s=>{const r=ji(n),o=this._mapping[r],{x:a,y:c,width:l,height:u}=o,{image:f,width:d,height:h}=qC(t,s,l,u),g=a+(l-d)/2,p=c+(u-h)/2;this._texture?.copyExternalImage({image:f,x:g,y:p,width:d,height:h}),o.x=g,o.y=p,o.width=d,o.height=h,this._texture&&fg(this._texture),this.onUpdate(d!==l||h!==u)}).catch(s=>{this.onError({url:n.url,source:n.source,sourceIndex:n.sourceIndex,loadOptions:this._loadOptions,error:s})}).finally(()=>{this._pendingCount--})}}const dg=[0,0,0,255],JC={iconAtlas:{type:"image",value:null,async:!0},iconMapping:{type:"object",value:{},async:!0},sizeScale:{type:"number",value:1,min:0},billboard:!0,sizeUnits:"pixels",sizeBasis:"height",sizeMinPixels:{type:"number",min:0,value:0},sizeMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},alphaCutoff:{type:"number",value:.05,min:0,max:1},getPosition:{type:"accessor",value:i=>i.position},getIcon:{type:"accessor",value:i=>i.icon},getColor:{type:"accessor",value:dg},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},onIconError:{type:"function",value:null,optional:!0},textureParameters:{type:"object",ignore:!0,value:null}};class oc extends Tt{getShaders(){const e=!!this.props.data?.attributes?.rowIndexes;return super.getShaders({vs:$C,fs:UC,source:VC(e),defines:e?{USE_ROW_INDEXES:!0}:{},modules:[Bs,Is,ks,NC]})}initializeState(){this.state={iconManager:new QC(this.context.device,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,bufferGroup:"icon-instance-data",accessor:"getSize",defaultValue:1},instanceIconDefs:{size:7,bufferGroup:"icon-instance-data",accessor:"getIcon",transform:this.getInstanceIconDef,shaderAttributes:{instanceOffsets:{size:2,elementOffset:0},instanceIconFrames:{size:4,elementOffset:2},instanceColorModes:{size:1,elementOffset:6}}},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,bufferGroup:"icon-instance-data",accessor:"getColor",defaultValue:dg},instanceAngles:{size:1,transition:!0,bufferGroup:"icon-instance-data",accessor:"getAngle"},instancePixelOffset:{size:2,transition:!0,bufferGroup:"icon-instance-data",accessor:"getPixelOffset"},...this.props.data?.attributes?.rowIndexes?{rowIndexes:{size:1,type:"uint32",noAlloc:!0}}:{}})}updateState(e){super.updateState(e);const{props:t,oldProps:n,changeFlags:s}=e,r=this.getAttributeManager(),{iconAtlas:o,iconMapping:a,data:c,getIcon:l,textureParameters:u}=t,{iconManager:f}=this.state;if(typeof o=="string")return;const d=o||this.internalState.isAsyncPropLoading("iconAtlas");f.setProps({loadOptions:t.loadOptions,autoPacking:!d,iconAtlas:o,iconMapping:d?a:null,textureParameters:u}),d?n.iconMapping!==t.iconMapping&&r.invalidate("getIcon"):(s.dataChanged||s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getIcon))&&f.packIcons(c,l),s.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),r.invalidateAll())}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(e){super.finalizeState(e),this.state.iconManager.finalize()}draw({uniforms:e}){this._drawModel(this.state.model)}_drawModel(e){const{sizeScale:t,sizeBasis:n,sizeMinPixels:s,sizeMaxPixels:r,sizeUnits:o,billboard:a,alphaCutoff:c}=this.props,{iconManager:l}=this.state,u=l.getTexture();if(u){const f={iconsTexture:u,iconsTextureDim:[u.width,u.height],sizeUnits:Ue[o],sizeScale:t,sizeBasis:n==="height"?1:0,sizeMinPixels:s,sizeMaxPixels:r,billboard:a,alphaCutoff:c};e.shaderInputs.setProps({icon:f}),e.draw(this.context.renderPass)}}_getModel(e=this.props.id){const t=[-1,-1,1,-1,-1,1,1,1];return new De(this.context.device,{...this.getShaders(),id:e,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new tn({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}_onUpdate(e){e?(this.getAttributeManager()?.invalidate("getIcon"),this.setNeedsUpdate()):this.setNeedsRedraw()}_onError(e){const t=this.getCurrentLayer()?.props.onIconError;t?t(e):z.error(e.error.message)()}getInstanceIconDef(e){const{x:t,y:n,width:s,height:r,mask:o,anchorX:a=s/2,anchorY:c=r/2}=this.state.iconManager.getIconMapping(e);return[s/2-a,r/2-c,t,n,s,r,o?1:0]}}oc.defaultProps=JC;oc.layerName="IconLayer";const Qu=`layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`,eA={name:"scatterplot",vs:Qu,fs:Qu,source:"",uniformTypes:{radiusScale:"f32",radiusMinPixels:"f32",radiusMaxPixels:"f32",lineWidthScale:"f32",lineWidthMinPixels:"f32",lineWidthMaxPixels:"f32",stroked:"f32",filled:"f32",antialiasing:"f32",billboard:"f32",radiusUnits:"i32",lineWidthUnits:"i32"}},tA=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
in vec2 instancePixelOffset;
out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;
void main(void) {
geometry.worldPosition = instancePositions;
outerRadiusPixels = clamp(
project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
);
float lineWidthPixels = clamp(
project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
);
outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
unitPosition = edgePadding * positions.xy;
geometry.uv = unitPosition;
#ifdef USE_ROW_INDEXES
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
if (scatterplot.billboard) {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = edgePadding * positions * outerRadiusPixels;
offset.xy += instancePixelOffset;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
offset.xy += project_pixel_size(instancePixelOffset);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,iA=`#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition;
float distToCenter = length(unitPosition) * outerRadiusPixels;
float inCircle = scatterplot.antialiasing ?
smoothedge(distToCenter, outerRadiusPixels) :
step(distToCenter, outerRadiusPixels);
if (inCircle == 0.0) {
discard;
}
if (scatterplot.stroked > 0.5) {
float isLine = scatterplot.antialiasing ?
smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
step(innerUnitRadius * outerRadiusPixels, distToCenter);
if (scatterplot.filled > 0.5) {
fragColor = mix(vFillColor, vLineColor, isLine);
} else {
if (isLine == 0.0) {
discard;
}
fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
}
} else if (scatterplot.filled < 0.5) {
discard;
} else {
fragColor = vFillColor;
}
fragColor.a *= inCircle;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,nA=`// Main shaders

struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
  @location(6) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  // Draw an inline geometry constant array clip space triangle to verify that rendering works.
  // var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  // if (attributes.instanceIndex == 0) {
  //   varyings.position = vec4<f32>(positions[attributes.vertexIndex], 0.0, 1.0);
  //   return varyings;
  // }

  geometry.worldPosition = attributes.instancePositions;

  // Multiply out radius and clamp to limits
  varyings.outerRadiusPixels = clamp(
    project_unit_size_to_pixel(scatterplot.radiusScale * attributes.instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_unit_size_to_pixel(scatterplot.lineWidthScale * attributes.instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  varyings.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  // WGSL selects the second value when the condition is true, so keep the antialiased path second.
  let edgePadding = select(
    1.0,
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    var offset = edgePadding * attributes.positions * varyings.outerRadiusPixels;
    offset = vec3<f32>(offset.xy + attributes.instancePixelOffset, offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position = vec4<f32>(varyings.position.x + clipPixels.x, varyings.position.y + clipPixels.y, varyings.position.z, varyings.position.w);
    geometry.position = vec4<f32>(
      geometry.position.xy + project_pixel_size_vec2(offset.xy),
      geometry.position.zw
    );
  } else {
    var offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    offset = vec3<f32>(offset.xy + project_pixel_size_vec2(attributes.instancePixelOffset), offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offset
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = geometry.pickingColor;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    step(distToCenter, varyings.outerRadiusPixels),
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      scatterplot.antialiasing != 0
    );

    if (scatterplot.filled != 0) {
      fragColor = mix(varyings.vFillColor, varyings.vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(varyings.vLineColor.rgb, varyings.vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == 0) {
    discard;
  } else {
    fragColor = varyings.vFillColor;
  }

  fragColor.a *= inCircle;

  clip_filterColor(varyings.clipCoordinates);

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
  // return vec4<f32>(0, 0, 1, 1);
}
`;function sA(i){return nA.replace("PICKING_COLOR_ATTRIBUTE",i?"@location(8) rowIndexes: u32,":"").replace("PICKING_COLOR_VALUE",i?"picking_getPickingColorFromIndex(attributes.rowIndexes)":"picking_getPickingColorFromIndex(attributes.instanceIndex)")}const Xo=0,hg=1,rA=`struct ClipUniforms {
  enabled: i32,
  mode: i32,
  bounds: vec4<f32>,
};

@group(2) @binding(auto) var<uniform> clipUniforms: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clipUniforms.bounds.x &&
    coordinates.y >= clipUniforms.bounds.y &&
    coordinates.x < clipUniforms.bounds.z &&
    coordinates.y < clipUniforms.bounds.w;
}

fn clip_filterPosition(position: ptr<function, vec4<f32>>, instanceCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${hg} &&
    !clip_isInBounds(instanceCoordinates)
  ) {
    *position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }
}

fn clip_filterColor(geometryCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${Xo} &&
    !clip_isInBounds(geometryCoordinates)
  ) {
    discard;
  }
}
`,gg={name:"clip",source:rA,props:{},uniforms:{},bindingLayout:[{name:"clip",group:2}],uniformTypes:{enabled:"i32",mode:"i32",bounds:"vec4<f32>"},defaultUniforms:{enabled:0,mode:Xo,bounds:[0,0,1,1]},getUniforms(i={}){const e={};return i.enabled!==void 0&&(e.enabled=i.enabled?1:0),i.mode!==void 0&&(e.mode=i.mode==="instance"?hg:Xo),i.bounds!==void 0&&(e.bounds=i.bounds),e}},Ju=[0,0,0,255],oA={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:i=>i.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:Ju},getLineColor:{type:"accessor",value:Ju},getLineWidth:{type:"accessor",value:1},getPixelOffset:{type:"accessor",value:[0,0]},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class pg extends Tt{getShaders(){const e=!!this.props.data?.attributes?.rowIndexes;return super.getShaders({vs:tA,fs:iA,source:sA(e),defines:e?{USE_ROW_INDEXES:!0}:{},modules:[Bs,Is,ks,eA,...this.context.device.type==="webgpu"?[gg]:[]]})}initializeState(){const e=this.props.data?.attributes?.rowIndexes?{rowIndexes:{size:1,type:"uint32",noAlloc:!0}}:{};this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset",bufferGroup:"scatterplot-instance-data"},...e})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{radiusUnits:t,radiusScale:n,radiusMinPixels:s,radiusMaxPixels:r,stroked:o,filled:a,billboard:c,antialiasing:l,lineWidthUnits:u,lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h}=this.props,g={stroked:o,filled:a,billboard:c,antialiasing:l,radiusUnits:Ue[t],radiusScale:n,radiusMinPixels:s,radiusMaxPixels:r,lineWidthUnits:Ue[u],lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h},p=this.state.model;p.shaderInputs.setProps({scatterplot:g}),p.draw(this.context.renderPass)}_getModel(){const e=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new De(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new tn({topology:"triangle-strip",attributes:{positions:{size:3,value:new Float32Array(e)}}}),isInstanced:!0})}}pg.defaultProps=oA;pg.layerName="ScatterplotLayer";function Cn(i,e){const t=e.length,n=i.length;if(n>0){let s=!0;for(let r=0;r<t;r++)if(i[n-t+r]!==e[r]){s=!1;break}if(s)return!1}for(let s=0;s<t;s++)i[n+s]=e[s];return!0}function ef(i,e){const t=e.length;for(let n=0;n<t;n++)i[n]=e[n]}function tf(i,e,t,n,s=[]){const r=n+e*t;for(let o=0;o<t;o++)s[o]=i[r+o];return s}function nf(i,e,t,n,s=[]){let r,o;if(t&8)r=(n[3]-i[1])/(e[1]-i[1]),o=3;else if(t&4)r=(n[1]-i[1])/(e[1]-i[1]),o=1;else if(t&2)r=(n[2]-i[0])/(e[0]-i[0]),o=2;else if(t&1)r=(n[0]-i[0])/(e[0]-i[0]),o=0;else return null;for(let a=0;a<i.length;a++)s[a]=(o&1)===a?n[o]:r*(e[a]-i[a])+i[a];return s}function qr(i,e){let t=0;return i[0]<e[0]?t|=1:i[0]>e[2]&&(t|=2),i[1]<e[1]?t|=4:i[1]>e[3]&&(t|=8),t}function mg(i,e){const{size:t=2,broken:n=!1,gridResolution:s=10,gridOffset:r=[0,0],startIndex:o=0,endIndex:a=i.length}=e||{},c=(a-o)/t;let l=[];const u=[l],f=tf(i,0,t,o);let d,h;const g=aA(f,s,r,[]),p=[];Cn(l,f);for(let m=1;m<c;m++){for(d=tf(i,m,t,o,d),h=qr(d,g);h;){nf(f,d,h,g,p);const _=qr(p,g);_&&(nf(f,p,_,g,p),h=_),Cn(l,p),ef(f,p),cA(g,s,h),n&&l.length>t&&(l=[],u.push(l),Cn(l,f)),h=qr(d,g)}Cn(l,d),ef(f,d)}return n?u:u[0]}function aA(i,e,t,n){const s=Math.floor((i[0]-t[0])/e)*e+t[0],r=Math.floor((i[1]-t[1])/e)*e+t[1];return n[0]=s,n[1]=r,n[2]=s+e,n[3]=r+e,n}function cA(i,e,t){t&8?(i[1]+=e,i[3]+=e):t&4?(i[1]-=e,i[3]-=e):t&2?(i[0]+=e,i[2]+=e):t&1&&(i[0]-=e,i[2]-=e)}function lA(i,e){const{size:t=2,startIndex:n=0,endIndex:s=i.length,normalize:r=!0}=e||{},o=i.slice(n,s);uA(o,t,0,s-n);const a=mg(o,{size:t,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(r)for(const c of a)fA(c,t);return a}function uA(i,e,t,n){let s=i[0],r;for(let o=t;o<n;o+=e){r=i[o];const a=r-s;(a>180||a<-180)&&(r-=Math.round(a/360)*360),i[o]=s=r}}function fA(i,e){let t;const n=i.length/e;for(let r=0;r<n&&(t=i[r*e],(t+180)%360===0);r++);const s=-Math.round(t/360)*360;if(s!==0)for(let r=0;r<n;r++)i[r*e]+=s}function dA(i,e,t,n){let s;if(Array.isArray(i[0])){const r=i.length*e;s=new Array(r);for(let o=0;o<i.length;o++)for(let a=0;a<e;a++)s[o*e+a]=i[o][a]||0}else s=i;return t?mg(s,{size:e,gridResolution:t}):n?lA(s,{size:e}):s}const hA=1,gA=2,gi=4;class pA extends MC{constructor(e){super({...e,attributes:{positions:{size:3,padding:18,initialize:!0,type:e.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:e.isWebGPU?Float32Array:Uint8ClampedArray}}})}get(e){return this.attributes[e]}getPathSegmentIndices(e){const t=this.attributes.segmentTypes,n=this.vertexStarts[e],s=Math.min(this.vertexStarts[e+1]??this.instanceCount,this.instanceCount),r=[];for(let o=n;o<s-1;o++)(t[o]&gi)===0&&r.push(o);return r.length&&(t[n]&gi)!==0&&r.unshift(r.pop()),r}getGeometryFromBuffer(e){return this.normalize||this.opts.isWebGPU?super.getGeometryFromBuffer(e):null}normalizeGeometry(e){return this.normalize?dA(e,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):e}getGeometrySize(e){if(sf(e)){let n=0;for(const s of e)n+=this.getGeometrySize(s);return n}const t=this.getPathLength(e);return t<2?0:this.isClosed(e)?t<3?0:t+2:t}updateGeometryAttributes(e,t){if(t.geometrySize!==0)if(e&&sf(e))for(const n of e){const s=this.getGeometrySize(n);t.geometrySize=s,this.updateGeometryAttributes(n,t),t.vertexStart+=s}else this._updateSegmentTypes(e,t),this._updatePositions(e,t)}_updateSegmentTypes(e,t){const n=this.attributes.segmentTypes,s=e?this.isClosed(e):!1,{vertexStart:r,geometrySize:o}=t;n.fill(0,r,r+o),s?(n[r]=gi,n[r+o-2]=gi):(n[r]+=hA,n[r+o-2]+=gA),n[r+o-1]=gi}_updatePositions(e,t){const{positions:n}=this.attributes;if(!n||!e)return;const{vertexStart:s,geometrySize:r}=t,o=new Array(3);for(let a=s,c=0;c<r;a++,c++)this.getPointOnPath(e,c,o),n[a*3]=o[0],n[a*3+1]=o[1],n[a*3+2]=o[2]}getPathLength(e){return e.length/this.positionSize}getPointOnPath(e,t,n=[]){const{positionSize:s}=this;t*s>=e.length&&(t+=1-e.length/s);const r=t*s;return n[0]=e[r],n[1]=e[r+1],n[2]=s===3&&e[r+2]||0,n}isClosed(e){if(!this.normalize)return!!this.opts.loop;const{positionSize:t}=this,n=e.length-t;return e[0]===e[n]&&e[1]===e[n+1]&&(t===2||e[2]===e[n+2])}}function sf(i){return Array.isArray(i[0])}const mA=`struct PathUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  jointType: f32,
  capType: f32,
  miterLimit: f32,
  billboard: f32,
  widthUnits: i32,
};

@group(0) @binding(auto)
var<uniform> path: PathUniforms;
`,rf=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,_A={name:"path",source:mA,vs:rf,fs:rf,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}},yA=`const EPSILON: f32 = 0.001;
const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct JoinResult {
  offset: vec3<f32>,
  cornerOffset: vec2<f32>,
  miterLength: f32,
  pathPosition: vec2<f32>,
  pathLength: f32,
  jointType: f32,
};

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) instanceTypes: f32,
  @location(2) instanceLeftPositions: vec3<f32>,
  @location(3) instanceStartPositions: vec3<f32>,
  @location(4) instanceEndPositions: vec3<f32>,
  @location(5) instanceRightPositions: vec3<f32>,
  @location(6) instanceLeftPositions64Low: vec3<f32>,
  @location(7) instanceStartPositions64Low: vec3<f32>,
  @location(8) instanceEndPositions64Low: vec3<f32>,
  @location(9) instanceRightPositions64Low: vec3<f32>,
  @location(10) instanceStrokeWidths: f32,
  @location(11) instanceColors: vec4<f32>,
  @location(12) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vCornerOffset: vec2<f32>,
  @location(2) vMiterLength: f32,
  @location(3) vPathPosition: vec2<f32>,
  @location(4) vPathLength: f32,
  @location(5) vJointType: f32,
  // Location 6 is reserved for TripsLayer's injected vTime varying.
  @location(7) clipCoordinates: vec2<f32>,
#ifdef DASH_ENABLED
  @location(8) vPathBounds: vec2<f32>,
#endif
};

fn flipIfTrue(flag: bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn clipLine(position: vec4<f32>, refPosition: vec4<f32>) -> vec4<f32> {
  if (position.w < EPSILON) {
    let r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
    return refPosition + (position - refPosition) * r;
  }
  return position;
}

#ifdef DASH_ENABLED
// Return the visible interval of the original segment before clipLine moves either endpoint.
fn getClippedPathRange(startW: f32, endW: f32) -> vec2<f32> {
  let startClipped = startW < EPSILON;
  let endClipped = endW < EPSILON;
  if (startClipped && endClipped) {
    return vec2<f32>(0.0, 0.0);
  }
  if (startClipped || endClipped) {
    let intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
    if (startClipped) {
      return vec2<f32>(intersection, 1.0);
    }
    return vec2<f32>(0.0, intersection);
  }
  return vec2<f32>(0.0, 1.0);
}
#endif

fn getLineJoinOffset(
  prevPoint: vec3<f32>,
  currPoint: vec3<f32>,
  nextPoint: vec3<f32>,
  width: vec2<f32>,
#ifdef DASH_ENABLED
  sourcePathLength: f32,
  sourcePathRange: vec2<f32>,
#endif
#ifdef ANTIALIASING
  coverageScale: f32,
#endif
  positions: vec2<f32>,
  instanceTypes: f32
) -> JoinResult {
  let isEnd = positions.x > 0.0;
  let sideOfPath = positions.y;
  let isJoint = select(0.0, 1.0, sideOfPath == 0.0);

  var deltaA3 = currPoint - prevPoint;
  var deltaB3 = nextPoint - currPoint;

  let rotationResult = project_needs_rotation(currPoint);
  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    deltaA3 = rotationResult.transform * deltaA3;
    deltaB3 = rotationResult.transform * deltaB3;
  }

  let deltaA = deltaA3.xy / width;
  let deltaB = deltaB3.xy / width;

  let lenA = length(deltaA);
  let lenB = length(deltaB);

  let dirA = select(vec2<f32>(0.0, 0.0), normalize(deltaA), lenA > 0.0);
  let dirB = select(vec2<f32>(0.0, 0.0), normalize(deltaB), lenB > 0.0);

  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);

  var tangent = dirA + dirB;
  tangent = select(perpA, normalize(tangent), length(tangent) > 0.0);
  let miterVec = vec2<f32>(-tangent.y, tangent.x);
  let dir = select(dirB, dirA, isEnd);
  let perp = select(perpB, perpA, isEnd);
#ifdef DASH_ENABLED
  let segmentLength2D = select(lenB, lenA, isEnd);

  // Extrusion happens in the XY plane, so segmentLength2D is a 2D length and pathPosition.y
  // below measures 2D distance along the segment. For a path that also moves in Z the true
  // arc length is longer by this ratio. Scaling pathLength and pathPosition.y by it makes
  // the coordinate measure real 3D distance while leaving the joint tests unchanged, since
  // they compare the two against each other and both are scaled alike. Billboard mode
  // extrudes in clip space, where the perspective divide has already reduced the segment to
  // its screen projection, so its complete common-space length is supplied by the caller.
  // Mirrors path-layer-vertex.glsl.ts.
  let currDelta3 = select(deltaB3, deltaA3, isEnd);
  let currLength2D = length(currDelta3.xy);
  // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
  // smaller than that in common space, and changing their scale corrupts even flat paths.
  let safeLength2D = select(1.0, currLength2D, currLength2D > 0.0);
  var arcLengthRatio = 1.0;
  var pathPositionOffset = 0.0;
  var pathLength = segmentLength2D;
  if (path.billboard != 0.0) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep pathLength complete so justification is stable as the camera clips it.
    let visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    arcLengthRatio = 0.0;
    if (segmentLength2D > 0.0) {
      arcLengthRatio = visiblePathLength / segmentLength2D;
    }
    pathPositionOffset = sourcePathLength * sourcePathRange.x;
    pathLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    arcLengthRatio = length(currDelta3) / safeLength2D;
    pathLength = segmentLength2D * arcLengthRatio;
  }
#else
  let pathLength = select(lenB, lenA, isEnd);
#endif

  let sinHalfA = abs(dot(miterVec, perp));
  let cosHalfA = abs(dot(dirA, miterVec));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;

  var miterSize = 1.0 / max(sinHalfA, EPSILON);
  miterSize = mix(
    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
    miterSize,
    step(0.0, cornerPosition)
  );

  var offsetVec =
    mix(miterVec * miterSize, perp, step(0.5, cornerPosition)) *
    (sideOfPath + isJoint * turnDirection);

  let isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
  let isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
  let isCap = isStartCap || isEndCap;

  var jointType = path.jointType;
  if (isCap) {
    offsetVec = mix(
      perp * sideOfPath,
      dir * path.capType * 4.0 * flipIfTrue(isStartCap),
      isJoint
    );
    jointType = path.capType;
  }

#ifdef ANTIALIASING
  let coverageOffsetVec = offsetVec * coverageScale;
  var miterLength = dot(coverageOffsetVec, miterVec * turnDirection);
#else
  var miterLength = dot(offsetVec, miterVec * turnDirection);
#endif
  miterLength = select(miterLength, isJoint, isCap);

#ifdef ANTIALIASING
  let offsetFromStartOfPath = coverageOffsetVec + deltaA * select(0.0, 1.0, isEnd);
#else
  let offsetFromStartOfPath = offsetVec + deltaA * select(0.0, 1.0, isEnd);
#endif
  let pathPosition = vec2<f32>(
    dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
    pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
    dot(offsetFromStartOfPath, dir)
#endif
  );
  let isValid = step(f32(instanceTypes), 3.5);
#ifdef ANTIALIASING
  var offset = vec3<f32>(coverageOffsetVec * width * isValid, 0.0);
#else
  var offset = vec3<f32>(offsetVec * width * isValid, 0.0);
#endif

  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    offset = rotationResult.transform * offset;
  }

#ifdef ANTIALIASING
  return JoinResult(
    offset, coverageOffsetVec, miterLength, pathPosition, pathLength, jointType
  );
#else
  return JoinResult(offset, offsetVec, miterLength, pathPosition, pathLength, jointType);
#endif
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let isEnd = attributes.positions.x;

  let prevPosition = mix(attributes.instanceLeftPositions, attributes.instanceStartPositions, isEnd);
  let prevPosition64Low = mix(
    attributes.instanceLeftPositions64Low,
    attributes.instanceStartPositions64Low,
    isEnd
  );
  let currPosition = mix(attributes.instanceStartPositions, attributes.instanceEndPositions, isEnd);
  let currPosition64Low = mix(
    attributes.instanceStartPositions64Low,
    attributes.instanceEndPositions64Low,
    isEnd
  );
  let nextPosition = mix(attributes.instanceEndPositions, attributes.instanceRightPositions, isEnd);
  let nextPosition64Low = mix(
    attributes.instanceEndPositions64Low,
    attributes.instanceRightPositions64Low,
    isEnd
  );

  geometry.worldPosition = currPosition;

  let widthPixels =
    clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * path.widthScale, path.widthUnits),
      path.widthMinPixels,
      path.widthMaxPixels
    ) / 2.0;

  if (path.billboard != 0.0) {
#ifdef DASH_ENABLED
    let prevProjection = project_position_to_clipspace_and_commonspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    let nextProjection = project_position_to_clipspace_and_commonspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
    let prevPositionCommon = prevProjection.commonPosition.xyz;
    let nextPositionCommon = nextProjection.commonPosition.xyz;
    var prevPositionScreen = prevProjection.clipPosition;
    var nextPositionScreen = nextProjection.clipPosition;
#else
    var prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    var nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
#endif
    let currProjection = project_position_to_clipspace_and_commonspace(
      currPosition, currPosition64Low, ZERO_OFFSET
    );
    geometry.position = currProjection.commonPosition;
    var currPositionScreen = currProjection.clipPosition;
#ifdef DASH_ENABLED
    let currPositionCommon = currProjection.commonPosition.xyz;
    let sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
    let sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
    let billboardPathRange = getClippedPathRange(
      sourcePathStartScreen.w, sourcePathEndScreen.w
    );
#endif

    prevPositionScreen = clipLine(prevPositionScreen, currPositionScreen);
    nextPositionScreen = clipLine(nextPositionScreen, currPositionScreen);
    currPositionScreen = clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));

#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
#ifdef DASH_ENABLED
    let currentDeltaCommon = select(
      nextPositionCommon - currPositionCommon,
      currPositionCommon - prevPositionCommon,
      isEnd > 0.0
    );
    let billboardPathLength = select(
      0.0,
      length(currentDeltaCommon) * project.scale / (widthPixels * project.focalDistance),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(vec2<f32>(widthPixels, widthPixels)),
#ifdef DASH_ENABLED
      billboardPathLength,
      billboardPathRange,
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    // Phase and justification use the complete source segment, while cap and joint coverage
    // must still recognize the endpoints moved by clipLine.
    varyings.vPathBounds = billboardPathLength * billboardPathRange;
#endif

    geometry.uv = join.pathPosition;
    varyings.position = vec4<f32>(
      currPositionScreen.xyz + join.offset * currPositionScreen.w,
      currPositionScreen.w
    );
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  } else {
    let prevPositionCommon = project_position_vec3_f64(prevPosition, prevPosition64Low);
    let currPositionCommon = project_position_vec3_f64(currPosition, currPosition64Low);
    let nextPositionCommon = project_position_vec3_f64(nextPosition, nextPosition64Low);

    let width = vec2<f32>(
      project_pixel_size_float(widthPixels),
      project_pixel_size_float(widthPixels)
    );
#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionCommon,
      currPositionCommon,
      nextPositionCommon,
      width,
#ifdef DASH_ENABLED
      1.0,
      vec2<f32>(0.0, 1.0),
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    varyings.vPathBounds = vec2<f32>(0.0, join.pathLength);
#endif

    geometry.position = vec4<f32>(currPositionCommon + join.offset, 1.0);
    geometry.uv = join.pathPosition;
    varyings.position = project_common_position_to_clipspace(geometry.position);
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.vPathPosition;

#ifdef ANTIALIASING
  // Coordinates of the outer silhouette, in units of half-width: rounded joints and caps are
  // bounded by the corner offset, everywhere else by the edge of the stroke. Dividing by the
  // screen-space derivative converts the distance to the boundary into device pixels, which stays
  // correct under perspective foreshortening and under extensions that rescale the stroke.
#ifdef DASH_ENABLED
  let isCorner =
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y;
#else
  let isCorner = varyings.vPathPosition.y < 0.0 || varyings.vPathPosition.y > varyings.vPathLength;
#endif
  let isRound = varyings.vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives need uniform control flow and are
  // undefined after a discard in the quad. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  let bodyCoord = abs(varyings.vPathPosition.x);
  let cornerCoord = length(varyings.vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  let bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  let cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
  // Rounded corners still intersect the stroke-width envelope. Extensions may remap
  // vPathPosition.x independently of vCornerOffset, as PathStyleExtension does for offsets.
  let edgePixels = select(bodyPixels, min(cornerPixels, bodyPixels), isRound && isCorner);
#else
  let edgePixels = select(bodyPixels, cornerPixels, isRound && isCorner);
#endif

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    if (!isRound && varyings.vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }

  var color = varyings.vColor;

  // Feather one device pixel across the width only, before premultiplication. edgePixels is a
  // signed device-pixel distance and SMOOTH_EDGE_RADIUS is 0.5, so this ramps across one pixel.
  color.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
  if (
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y
  ) {
#else
  if (
    varyings.vPathPosition.y < 0.0 ||
    varyings.vPathPosition.y > varyings.vPathLength
  ) {
#endif
    if (varyings.vJointType > 0.5 && length(varyings.vCornerOffset) > 1.0) {
      discard;
    }
    if (
      varyings.vJointType < 0.5 &&
      varyings.vMiterLength > path.miterLimit + 1.0
    ) {
      discard;
    }
  }
#endif

  // Fragment-layer injections that discard pixels must run after analytic coverage derivatives.
  // See TripsLayer, which rejects fragments outside of the active time window at this anchor.
  // DECKGL_FILTER_COLOR
  clip_filterColor(varyings.clipCoordinates);
#ifdef ANTIALIASING
  return deckgl_premultiplied_alpha(color);
#else
  return deckgl_premultiplied_alpha(varyings.vColor);
#endif
}
`,bA=`#version 300 es
#define SHADER_NAME path-layer-vertex-shader
in vec2 positions;
in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in float rowIndexes;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
#ifdef DASH_ENABLED
out vec2 vPathBounds;
#endif
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
#ifdef DASH_ENABLED
, float sourcePathLength, vec2 sourcePathRange
#endif
#ifdef ANTIALIASING
, float coverageScale
#endif
) {
bool isEnd = positions.x > 0.0;
float sideOfPath = positions.y;
float isJoint = float(sideOfPath == 0.0);
vec3 deltaA3 = (currPoint - prevPoint);
vec3 deltaB3 = (nextPoint - currPoint);
mat3 rotationMatrix;
bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
if (needsRotation) {
deltaA3 = deltaA3 * rotationMatrix;
deltaB3 = deltaB3 * rotationMatrix;
}
vec2 deltaA = deltaA3.xy / width;
vec2 deltaB = deltaB3.xy / width;
float lenA = length(deltaA);
float lenB = length(deltaB);
vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
vec2 perpA = vec2(-dirA.y, dirA.x);
vec2 perpB = vec2(-dirB.y, dirB.x);
vec2 tangent = dirA + dirB;
tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
vec2 miterVec = vec2(-tangent.y, tangent.x);
vec2 dir = isEnd ? dirA : dirB;
vec2 perp = isEnd ? perpA : perpB;
float L = isEnd ? lenA : lenB;
#ifdef DASH_ENABLED
vec3 currDelta3 = isEnd ? deltaA3 : deltaB3;
float currLength2D = length(currDelta3.xy);
float arcLengthRatio = 1.0;
float pathPositionOffset = 0.0;
float pathLength = L;
if (path.billboard) {
float visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
arcLengthRatio = L > 0.0 ? visiblePathLength / L : 0.0;
pathPositionOffset = sourcePathLength * sourcePathRange.x;
pathLength = sourcePathLength;
} else if (currLength2D > 0.0) {
arcLengthRatio = length(currDelta3) / currLength2D;
pathLength = L * arcLengthRatio;
}
#endif
float sinHalfA = abs(dot(miterVec, perp));
float cosHalfA = abs(dot(dirA, miterVec));
float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
float cornerPosition = sideOfPath * turnDirection;
float miterSize = 1.0 / max(sinHalfA, EPSILON);
miterSize = mix(
min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
miterSize,
step(0.0, cornerPosition)
);
vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
* (sideOfPath + isJoint * turnDirection);
bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
bool isCap = isStartCap || isEndCap;
if (isCap) {
offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
vJointType = path.capType;
} else {
vJointType = path.jointType;
}
#ifdef ANTIALIASING
vec2 coverageOffsetVec = offsetVec * coverageScale;
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = coverageOffsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = coverageOffsetVec + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(coverageOffsetVec * width * isValid, 0.0);
#else
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
#endif
if (needsRotation) {
offset = rotationMatrix * offset;
}
return offset;
}
void clipLine(inout vec4 position, vec4 refPosition) {
if (position.w < EPSILON) {
float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
position = refPosition + (position - refPosition) * r;
}
}
#ifdef DASH_ENABLED
vec2 getClippedPathRange(float startW, float endW) {
bool startClipped = startW < EPSILON;
bool endClipped = endW < EPSILON;
if (startClipped && endClipped) {
return vec2(0.0);
}
if (startClipped || endClipped) {
float intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
return startClipped ? vec2(intersection, 1.0) : vec2(0.0, intersection);
}
return vec2(0.0, 1.0);
}
#endif
void main() {
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
float isEnd = positions.x;
vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);
vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);
vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);
geometry.worldPosition = currPosition;
vec2 widthPixels = vec2(clamp(
project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
path.widthMinPixels, path.widthMaxPixels) / 2.0);
vec3 width;
if (path.billboard) {
#ifdef DASH_ENABLED
vec4 prevPositionCommon;
vec4 nextPositionCommon;
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET, prevPositionCommon
);
#else
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET
);
#endif
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
#ifdef DASH_ENABLED
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET, nextPositionCommon
);
#else
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET
);
#endif
#ifdef DASH_ENABLED
vec4 sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
vec4 sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
vec2 billboardPathRange = getClippedPathRange(
sourcePathStartScreen.w, sourcePathEndScreen.w
);
#endif
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = vec2(0.5 / project.devicePixelRatio);
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
#ifdef DASH_ENABLED
vec3 currentDeltaCommon = isEnd > 0.0
? geometry.position.xyz - prevPositionCommon.xyz
: nextPositionCommon.xyz - geometry.position.xyz;
float billboardPathLength = width.x > 0.0
? length(currentDeltaCommon) * project.scale / (width.x * project.focalDistance)
: 0.0;
#endif
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
#ifdef DASH_ENABLED
,
billboardPathLength, billboardPathRange
#endif
#ifdef ANTIALIASING
,
coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = billboardPathLength * billboardPathRange;
#endif
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = project_pixel_size(vec2(0.5 / project.devicePixelRatio));
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
vec3 offset = getLineJoinOffset(
prevPosition, currPosition, nextPosition, width.xy
#ifdef DASH_ENABLED
, 1.0, vec2(0.0, 1.0)
#endif
#ifdef ANTIALIASING
, coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = vec2(0.0, vPathLength);
#endif
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,vA=`#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
#ifdef DASH_ENABLED
in vec2 vPathBounds;
#endif
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
#ifdef ANTIALIASING
#ifdef DASH_ENABLED
bool isCorner = vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y;
#else
bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
#endif
bool isRound = vJointType > 0.5;
float bodyCoord = abs(vPathPosition.x);
float cornerCoord = length(vCornerOffset);
float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
float edgePixels = isRound && isCorner ? min(cornerPixels, bodyPixels) : bodyPixels;
#else
float edgePixels = isRound && isCorner ? cornerPixels : bodyPixels;
#endif
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
if (isCorner) {
if (!isRound && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
fragColor.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
if (vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y) {
#else
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
#endif
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,_g=[0,0,0,255],wA={widthUnits:"meters",widthScale:{type:"number",min:0,value:1},widthMinPixels:{type:"number",min:0,value:0},widthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},jointRounded:!1,capRounded:!1,miterLimit:{type:"number",min:0,value:4},antialiasing:!1,billboard:!1,_pathType:null,getPath:{type:"accessor",value:i=>i.path},getColor:{type:"accessor",value:_g},getWidth:{type:"accessor",value:1},rounded:{deprecatedFor:["jointRounded","capRounded"]}},Xr={enter:(i,e)=>e.length?e.subarray(e.length-i.length):i};function xA(i){if(i.isGeospatial)return null;const{unitsPerMeter:e}=i.distanceScales;return[e[0],e[1],e[2]]}function of(i,e){return i===e||!!(i&&e&&i.length===e.length&&i.every((t,n)=>t===e[n]))}class yg extends Tt{getShaders(){const{antialiasing:e}=this.props;return super.getShaders({vs:bA,fs:vA,source:yA,defines:e?{ANTIALIASING:1}:{},modules:[Bs,Is,ks,_A,...this.context.device.type==="webgpu"?[gg]:[]]})}get wrapLongitude(){return!1}getBounds(){return this.context.device.type==="webgpu"?null:this.getAttributeManager()?.getBounds(["vertexPositions"])}getPathProjectionScale(e){const t=this.props.coordinateSystem;if(!!!this.getAttributeManager()?.getAttributes().instanceDashOffsets)return null;if(e instanceof Oe&&e.zoom>=12&&(t==="default"||t==="lnglat"||t==="cartesian")){const o=Qi.getUniforms({viewport:e,coordinateSystem:t,coordinateOrigin:this.props.coordinateOrigin,autoWrapLongitude:this.wrapLongitude});return[e.projectionMode,o.coordinateOrigin[1],o.commonOrigin[1],...o.commonUnitsPerWorldUnit,...o.commonUnitsPerWorldUnit2,o.commonUnitsPerMeter[2]]}const r=xA(e);return r?[e.projectionMode,...r]:[e.projectionMode]}shouldUpdateState(e){const{viewport:t}=this.context;return super.shouldUpdateState(e)||this.state?.tessellationResolution!==t.resolution||!of(this.state?.pathProjectionScale,this.getPathProjectionScale(t))}initializeState(){const t=this.context.device.type==="webgpu";this.getAttributeManager().addInstanced({...t?{pathPositions:{size:24,type:"float32",transition:!1,accessor:"getPath",update:this.calculateWebGPUPositions,shaderAttributes:{instanceLeftPositions:{size:3,elementOffset:0},instanceStartPositions:{size:3,elementOffset:3},instanceEndPositions:{size:3,elementOffset:6},instanceRightPositions:{size:3,elementOffset:9},instanceLeftPositions64Low:{size:3,elementOffset:12},instanceStartPositions64Low:{size:3,elementOffset:15},instanceEndPositions64Low:{size:3,elementOffset:18},instanceRightPositions64Low:{size:3,elementOffset:21}},noAlloc:!0}}:{vertexPositions:{size:3,vertexOffset:1,type:"float64",fp64:this.use64bitPositions(),transition:Xr,accessor:"getPath",update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}}},instanceTypes:{size:1,type:t?"float32":"uint8",update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:"getWidth",transition:t?!1:Xr,defaultValue:1,bufferGroup:"path-instance-data"},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",accessor:"getColor",transition:t?!1:Xr,defaultValue:_g,bufferGroup:"path-instance-data"},rowIndexes:{size:1,type:"uint32",accessor:(s,{index:r})=>s&&s.__source?s.__source.index:r,bufferGroup:"path-instance-data"}}),this.setState({pathTesselator:new pA({fp64:this.use64bitPositions(),isWebGPU:t}),tessellationResolution:this.context.viewport.resolution,pathProjectionScale:this.getPathProjectionScale(this.context.viewport)})}updateState(e){super.updateState(e);const{props:t,oldProps:n,changeFlags:s}=e,r=this.getAttributeManager(),{viewport:o}=this.context,a=this.state.tessellationResolution!==o.resolution,c=this.getPathProjectionScale(o),l=!of(this.state.pathProjectionScale,c),f=s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getPath)||t._pathType!==n._pathType||t.positionFormat!==n.positionFormat||t.wrapLongitude!==n.wrapLongitude||a;if(s.dataChanged||f){const{pathTesselator:h}=this.state,g=t.data.attributes||{};h.updateGeometry({data:t.data,geometryBuffer:g.getPath,buffers:g,normalize:!t._pathType,loop:t._pathType==="loop",getGeometry:t.getPath,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:o.resolution,dataChanged:f?void 0:s.dataChanged}),this.setState({numInstances:h.instanceCount,startIndices:h.vertexStarts,tessellationResolution:o.resolution,pathProjectionScale:c}),!s.dataChanged||f?r.invalidateAll():l&&r.invalidate("instanceDashOffsets")}else l&&(this.setState({pathProjectionScale:c}),r.invalidate("instanceDashOffsets"));(s.extensionsChanged||t.antialiasing!==n.antialiasing)&&(this.state.model?.destroy(),this.state.model=this._getModel(),r.invalidateAll())}getPickingInfo(e){const t=super.getPickingInfo(e),{index:n}=t,s=this.props.data;return s[0]&&s[0].__source&&(t.object=s.find(r=>r.__source.index===n)),t}disablePickingIndex(e){const t=this.props.data;if(t[0]&&t[0].__source)for(let n=0;n<t.length;n++)t[n].__source.index===e&&this._disablePickingIndex(n);else super.disablePickingIndex(e)}draw({uniforms:e}){const{jointRounded:t,capRounded:n,billboard:s,miterLimit:r,widthUnits:o,widthScale:a,widthMinPixels:c,widthMaxPixels:l}=this.props,u=this.state.model,f={jointType:Number(t),capType:Number(n),billboard:s,widthUnits:Ue[o],widthScale:a,miterLimit:r,widthMinPixels:c,widthMaxPixels:l};u.shaderInputs.setProps({path:f}),u.draw(this.context.renderPass)}_getModel(){const e=[0,1,2,1,4,2,1,3,4,3,5,4],t=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new De(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new tn({topology:"triangle-list",attributes:{indices:new Uint16Array(e),positions:{value:new Float32Array(t),size:2}}}),isInstanced:!0})}calculatePositions(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("positions")}calculateSegmentTypes(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("segmentTypes")}calculateWebGPUPositions(e){const{pathTesselator:t}=this.state,n=t.get("positions");if(!n){e.value=null;return}const s=t.instanceCount,r=new Float32Array(s*24),o=[-1,0,1,2];for(let a=0;a<s;a++){const c=a*24;for(let l=0;l<4;l++){const u=a+o[l],f=c+l*3;for(let d=0;d<3;d++){const h=u>=0&&u<s?n[u*3+d]:0,g=Math.fround(h);r[f+d]=g,r[f+d+12]=h-g}}}e.startIndices=t.vertexStarts,e.value=r}}yg.defaultProps=wA;yg.layerName="PathLayer";const af=`layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`,PA={name:"sdf",vs:af,fs:af,uniformTypes:{gamma:"f32",enabled:"f32",buffer:"f32",outlineBuffer:"f32",outlineColor:"vec4<f32>"}},Ii={none:0,start:1,center:2,end:3},EA=`layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${Ii.start}
#define ALIGN_MODE_CENTER ${Ii.center}
#define ALIGN_MODE_END ${Ii.end}
`,bg={name:"text",vs:EA,getUniforms:({contentCutoffPixels:i=[0,0],contentAlignHorizontal:e="none",contentAlignVertical:t="none",fontSize:n,viewport:s})=>({cutoffPixels:i,align:[Ii[e],Ii[t]],fontSize:n,flipY:s?.flipY??!1}),uniformTypes:{cutoffPixels:"vec2<f32>",align:"vec2<i32>",fontSize:"f32",flipY:"f32"}},SA=`#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in float rowIndexes;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec4 instanceClipRect;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
float getPixelOffsetFromAlignment(float anchor, float extent, float clipStart, float clipEnd, int mode) {
if (clipEnd < clipStart) return 0.0;
if (mode == ALIGN_MODE_START) {
return max(- (anchor + clipStart), 0.0);
}
if (mode == ALIGN_MODE_CENTER) {
float _min = max(0., anchor + clipStart);
float _max = min(extent, anchor + clipEnd);
return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
}
if (mode == ALIGN_MODE_END) {
return min(extent - (anchor + clipEnd), 0.);
}
return 0.0;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
vec2 anchorPosScreen;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
anchorPosScreen = gl_Position.xy / gl_Position.w;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0));
anchorPosScreen = anchorPos.xy / anchorPos.w;
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
anchorPosScreen = vec2(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 * project.viewportSize / project.devicePixelRatio;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (text.align.x > 0 || text.align.y > 0) {
vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
vec2 scrollPixels = vec2(
getPixelOffsetFromAlignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
-getPixelOffsetFromAlignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
);
pixelOffset += scrollPixels;
gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels);
}
if (instanceClipRect.z >= 0.) {
if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.x > 0.) {
float vpWidth = project.viewportSize.x / project.devicePixelRatio;
float l = max(anchorPosScreen.x + xy.x, 0.0);
float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
if (r - l < text.cutoffPixels.x) {
gl_Position = vec4(0.0);
}
}
}
if (instanceClipRect.w >= 0.) {
if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.y > 0.) {
float vpHeight = project.viewportSize.y / project.devicePixelRatio;
float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
float b = min(anchorPosScreen.y - xy.y, vpHeight);
if (b - t < text.cutoffPixels.y) {
gl_Position = vec4(0.0);
}
}
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,TA=`#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
if (!bool(picking.isActive)) {
float alpha = texture(iconsTexture, vTextureCoords).a;
vec4 color = vColor;
if (sdf.enabled) {
float distance = alpha;
alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);
if (sdf.outlineBuffer > 0.0) {
float inFill = alpha;
float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
color = mix(sdf.outlineColor, vColor, inFill);
alpha = inBorder;
}
}
float a = alpha * color.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color.rgb, a * layer.opacity);
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;function LA({collision:i=!1}={}){return`struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32
};

struct SdfUniforms {
  gamma: f32,
  enabled: f32,
  buffer: f32,
  outlineBuffer: f32,
  outlineColor: vec4<f32>
};

${i?`struct CollisionUniforms {
  sort: i32,
  enabled: i32
};
`:""}

const ALIGN_MODE_START: i32 = 1;
const ALIGN_MODE_CENTER: i32 = 2;
const ALIGN_MODE_END: i32 = 3;

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var<uniform> text: TextUniforms;
@group(0) @binding(auto) var<uniform> sdf: SdfUniforms;
${i?"@group(0) @binding(auto) var<uniform> collision: CollisionUniforms;":""}
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;
${i?`@group(0) @binding(auto) var collision_texture : texture_2d<f32>;
`:""}

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, -s), vec2<f32>(s, c));
  return rotation * vertex;
}

fn get_pixel_offset_from_alignment(
  anchor: f32,
  extent: f32,
  clipStart: f32,
  clipEnd: f32,
  mode: i32
) -> f32 {
  if (clipEnd < clipStart) {
    return 0.0;
  }
  if (mode == ALIGN_MODE_START) {
    return max(-(anchor + clipStart), 0.0);
  }
  if (mode == ALIGN_MODE_CENTER) {
    let minValue = max(0.0, anchor + clipStart);
    let maxValue = min(extent, anchor + clipEnd);
    if (minValue < maxValue) {
      return (minValue + maxValue) / 2.0 - anchor;
    }
    return 0.0;
  }
  if (mode == ALIGN_MODE_END) {
    return min(extent - (anchor + clipEnd), 0.0);
  }
  return 0.0;
}

${i?`fn collision_match(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  let textureSize = vec2<i32>(textureDimensions(collision_texture));
  let pixelCoords = clamp(
    vec2<i32>(texCoords * vec2<f32>(textureSize)),
    vec2<i32>(0),
    textureSize - vec2<i32>(1)
  );
  let collisionPickingColor = textureLoad(collision_texture, pixelCoords, 0);
  let delta = dot(abs(collisionPickingColor.rgb - pickingColor), vec3<f32>(1.0));
  return step(delta, 0.001);
}

fn collision_is_visible(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  if (collision.enabled == 0) {
    return 1.0;
  }

  var accumulator = 0.0;
  let stepSize = vec2<f32>(1.0) / project.viewportSize;

  for (var i: i32 = -2; i <= 2; i = i + 1) {
    for (var j: i32 = -2; j <= 2; j = j + 1) {
      let delta = vec2<f32>(f32(j), f32(i)) * stepSize;
      accumulator = accumulator + collision_match(texCoords + delta, pickingColor);
    }
  }

  return pow(accumulator / 25.0, 2.2);
}
`:""}

struct Attributes {
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  @location(10) rowIndexes: u32,
  @location(11) instanceClipRect: vec4<f32>,
  ${i?"@location(12) collisionPriorities: f32,":""}
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  var pos: vec4<f32>;
  var anchorPosScreen: vec2<f32>;
  if (icon.billboard != 0) {
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = pos.xy / pos.w;

    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    let anchorPos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = anchorPos.xy / anchorPos.w;
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offsetCommon);
  }

  anchorPosScreen = vec2<f32>(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 *
    project.viewportSize / project.devicePixelRatio;
  var xy = project_size_vec2(inp.instanceClipRect.xy) * project.scale;
  var wh = project_size_vec2(inp.instanceClipRect.zw) * project.scale;

  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (text.align.x > 0 || text.align.y > 0) {
    let viewportPixels = project.viewportSize / project.devicePixelRatio;
    let scrollPixels = vec2<f32>(
      get_pixel_offset_from_alignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
      -get_pixel_offset_from_alignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
    );
    pixelOffset = pixelOffset + scrollPixels;
    let scrollClipOffset = project_pixel_size_to_clipspace(scrollPixels);
    pos.x = pos.x + scrollClipOffset.x;
    pos.y = pos.y + scrollClipOffset.y;
  }

  if (inp.instanceClipRect.z >= 0.0) {
    if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.x > 0.0) {
      let viewportWidth = project.viewportSize.x / project.devicePixelRatio;
      let left = max(anchorPosScreen.x + xy.x, 0.0);
      let right = min(anchorPosScreen.x + xy.x + wh.x, viewportWidth);
      if (right - left < text.cutoffPixels.x) {
        pos = vec4<f32>(0.0);
      }
    }
  }
  if (inp.instanceClipRect.w >= 0.0) {
    if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.y > 0.0) {
      let viewportHeight = project.viewportSize.y / project.devicePixelRatio;
      let top = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
      let bottom = min(anchorPosScreen.y - xy.y, viewportHeight);
      if (bottom - top < text.cutoffPixels.y) {
        pos = vec4<f32>(0.0);
      }
    }
  }

  ${i?`  if (collision.sort != 0) {
    pos.z = -0.001 * inp.collisionPriorities * pos.w;
  }
  `:""}

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.position = pos;
  outp.vColor = inp.instanceColors;
  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);
  var alpha = texColor.a;
  var color = inp.vColor;

  if (sdf.enabled > 0.5) {
    let distance = alpha;
    alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);

    if (sdf.outlineBuffer > 0.0) {
      let inFill = alpha;
      let inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
      color = mix(sdf.outlineColor, inp.vColor, inFill);
      alpha = inBorder;
    }
  } else if (inp.vColorMode == 0.0) {
    color = texColor;
  }

  var a = alpha * color.a * layer.opacity;
  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  ${i?`  let collisionFade = collision_is_visible(inp.position.xy / project.viewportSize, inp.pickingColor);
  a = a * collisionFade;
  if (a <= 0.0001) {
    discard;
  }
  `:""}

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(color.rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`}const CA=LA(),Zr=192/256,AA={getIconOffsets:{type:"accessor",value:i=>i.offsets},getContentBox:{type:"accessor",value:[0,0,-1,-1]},fontSize:1,alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:"color",value:[0,0,0,255]},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};class ac extends oc{getShaders(){const e=super.getShaders();return{...e,modules:[...e.modules,bg,PA],vs:SA,fs:TA,source:CA}}initializeState(){super.initializeState();const e=this.getAttributeManager(),t=e.attributes.instanceIconDefs;t.settings.update=this.calculateInstanceIconDefs,e.addInstanced({rowIndexes:{type:"uint32",size:1,bufferGroup:"icon-instance-data",accessor:(n,{index:s})=>s},instanceClipRect:{size:4,bufferGroup:"icon-instance-data",accessor:"getContentBox",defaultValue:[0,0,-1,-1]}})}updateState(e){super.updateState(e);const{props:t,oldProps:n,changeFlags:s}=e,{outlineColor:r}=t;if(s.extensionsChanged){this.state.fillModel?.destroy();const o=this.context.device.type==="webgpu"?this._getModel(`${this.props.id}-fill`):void 0;this.setState({fillModel:o,models:o?[this.state.model,o]:[this.state.model]})}if(s.updateTriggersChanged&&(s.updateTriggersChanged.getIcon||s.updateTriggersChanged.getIconOffsets)&&this.getAttributeManager().invalidate("instanceIconDefs"),r!==n.outlineColor){const o=[r[0]/255,r[1]/255,r[2]/255,(r[3]??255)/255];this.setState({outlineColor:o})}!t.sdf&&t.outlineWidth&&z.warn(`${this.id}: fontSettings.sdf is required to render outline`)()}draw(e){const{sdf:t,smoothing:n,fontSize:s,outlineWidth:r,contentCutoffPixels:o,contentAlignHorizontal:a,contentAlignVertical:c}=this.props,{outlineColor:l}=this.state,u=r?Math.max(n,Zr*(1-r)):-1,f=this.state.model,d={buffer:Zr,outlineBuffer:u,gamma:n,enabled:!!t,outlineColor:l},h={contentCutoffPixels:o,contentAlignHorizontal:a,contentAlignVertical:c,fontSize:s,viewport:this.context.viewport};if(f.shaderInputs.setProps({sdf:d,text:h}),super.draw(e),t&&r){const{iconManager:g}=this.state;if(g.getTexture()){const m=this.state.fillModel||f;m.shaderInputs.setProps({sdf:{...d,outlineBuffer:Zr},text:h}),this._drawModel(m)}}}calculateInstanceIconDefs(e,{startRow:t,endRow:n}){const{data:s,getIcon:r,getIconOffsets:o}=this.props;let a=e.getVertexOffset(t);const c=e.value,{iterable:l,objectInfo:u}=nn(s,t,n);for(const f of l){u.index++;const d=r(f,u),h=o(f,u);if(d){let g=0;for(const p of Array.from(d)){const m=super.getInstanceIconDef(p);m[0]=h[g*2],m[1]+=h[g*2+1],m[6]=1,c.set(m,a),a+=e.size,g++}}}}}ac.defaultProps=AA;ac.layerName="MultiIconLayer";const Ri=1e20,cc=new Float64Array(256);for(let i=0;i<256;i++){const e=.5-Math.pow(i/255,.45454545454545453);cc[i]=e*Math.abs(e)}cc[255]=-Ri;class MA{constructor({fontSize:e=24,buffer:t=3,radius:n=8,cutoff:s=.25,fontFamily:r="sans-serif",fontWeight:o="normal",fontStyle:a="normal",lang:c=null}={}){t=this.buffer=Math.round(t),this.radius=n,this.cutoff=s,this.lang=c;const l=this.size=Math.ceil(e)+t*4,u=this._createCanvas(l),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${a} ${o} ${e}px ${r}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",c&&(f.lang=c);const h=(this.maxGlyphDim=l-t)+2*t;this.gridOuter=new Float64Array(h*h),this.gridInner=new Float64Array(h*h),this.f=new Float64Array(h),this.z=new Float64Array(h+1),this.v=new Uint16Array(h)}_createCanvas(e){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,e);const t=document.createElement("canvas");return t.width=t.height=e,t}draw(e){const{width:t,actualBoundingBoxAscent:n,actualBoundingBoxDescent:s,actualBoundingBoxLeft:r,actualBoundingBoxRight:o}=this.ctx.measureText(e),a=Math.ceil(n),c=Math.floor(-r),l=Math.max(0,Math.min(this.maxGlyphDim,Math.ceil(o)-c)),u=Math.max(0,Math.min(this.maxGlyphDim,a+Math.ceil(s))),f=l+2*this.buffer,d=u+2*this.buffer,h=f*d,g=new Uint8ClampedArray(h),p={data:g,width:f,height:d,glyphWidth:l,glyphHeight:u,glyphTop:a,glyphLeft:c,glyphAdvance:t};if(l===0||u===0)return p;const{ctx:m,buffer:_,gridInner:b,gridOuter:y}=this;m.clearRect(_,_,l,u),m.fillText(e,_-c,_+a);const v=m.getImageData(_,_,l,u);y.fill(Ri,0,h),b.fill(0,0,h);let w=3;for(let L=0;L<u;L++){let E=(L+_)*f+_;for(let R=0;R<l;R++,w+=4,E++){const M=v.data[w];if(M===0)continue;const C=cc[M];y[E]=Math.max(0,C),b[E]=Math.max(0,-C)}}cf(y,0,0,f,d,f,this.f,this.v,this.z,_);const x=Math.min(_,1);cf(b,_-x,_-x,l+2*x,u+2*x,f,this.f,this.v,this.z);const S=255/this.radius,T=255*(1-this.cutoff);for(let L=0;L<h;L++){const E=Math.sqrt(y[L])-Math.sqrt(b[L]);g[L]=T-S*E}return p}}function cf(i,e,t,n,s,r,o,a,c,l=0){for(let u=e+l;u<e+n-l;u++)lf(i,t*r+u,r,s,o,a,c);for(let u=t;u<t+s;u++)lf(i,u*r+e,1,n,o,a,c)}function lf(i,e,t,n,s,r,o){r[0]=0,o[0]=-Ri,o[1]=Ri,s[0]=i[e];for(let a=1,c=0;a<n;a++){const l=s[a]=i[e+a*t],u=a*a;let f;do{const d=r[c];f=(l-s[d]+u-d*d)/(a-d)/2}while(f<=o[c]&&--c>-1);c++,r[c]=a,o[c]=f,o[c+1]=Ri}for(let a=0,c=0;a<n;a++){for(;o[c+1]<a;)c++;const l=r[c],u=a-l;i[e+a*t]=s[l]+u*u}}const IA=32,RA=[];function OA(i){return Math.pow(2,Math.ceil(Math.log2(i)))}function BA({characterSet:i,measureText:e,buffer:t,maxCanvasWidth:n,mapping:s={},xOffset:r=0,yOffsetMin:o=0,yOffsetMax:a=0}){let c=r,l=o,u=a;for(const f of i)if(!s[f]){const{advance:d,width:h,ascent:g,descent:p}=e(f),m=g+p;c+h+t*2>n&&(c=0,l=u),s[f]={x:c+t,y:l+t,width:h,height:m,advance:d,anchorX:h/2,anchorY:g},c+=h+t*2,u=Math.max(u,l+m+t*2)}return{mapping:s,xOffset:c,yOffsetMin:l,yOffsetMax:u,canvasHeight:OA(u)}}function vg(i,e,t,n){let s=0;for(let r=e;r<t;r++){const o=i[r];s+=n[o]?.advance||0}return s}function wg(i,e,t,n,s,r){let o=e,a=0;for(let c=e;c<t;c++){const l=vg(i,c,c+1,s);a+l>n&&(o<c&&r.push(c),o=c,a=0),a+=l}return a}function kA(i,e,t,n,s,r){let o=e,a=e,c=e,l=0;for(let u=e;u<t;u++)if((i[u]===" "||i[u+1]===" "||u+1===t)&&(c=u+1),c>a){let f=vg(i,a,c,s);l+f>n&&(o<a&&(r.push(a),o=a,l=0),f>n&&(f=wg(i,a,c,n,s,r),o=r[r.length-1])),a=c,l+=f}return l}function DA(i,e,t,n,s=0,r){r===void 0&&(r=i.length);const o=[];return e==="break-all"?wg(i,s,r,t,n,o):kA(i,s,r,t,n,o),o}function FA(i,e,t,n,s,r){let o=0,a=0;for(let c=e;c<t;c++){const l=i[c],u=n[l];u&&(a=Math.max(a,u.height))}for(let c=e;c<t;c++){const l=i[c],u=n[l];u?(s[c]=o+u.anchorX,o+=u.advance):(z.warn(`Missing character: ${l} (${l.codePointAt(0)})`)(),s[c]=o,o+=IA)}r[0]=o,r[1]=a}function zA(i,e,t,n,s,r){const o=Array.from(i),a=o.length,c=new Array(a),l=new Array(a),u=new Array(a),f=(n==="break-word"||n==="break-all")&&isFinite(s)&&s>0,d=[0,0],h=[0,0];let g=0,p=e+t/2,m=0,_=0;for(let b=0;b<=a;b++){const y=o[b];if((y===`
`||b===a)&&(_=b),_>m){const v=f?DA(o,n,s,r,m,_):RA;for(let w=0;w<=v.length;w++){const x=w===0?m:v[w-1],S=w<v.length?v[w]:_;FA(o,x,S,r,c,h);for(let T=x;T<S;T++)l[T]=p,u[T]=h[0];g++,p+=t,d[0]=Math.max(d[0],h[0])}m=_}y===`
`&&(c[m]=0,l[m]=0,u[m]=0,m++)}return d[1]=g*t,{x:c,y:l,rowWidth:u,size:d}}function NA({value:i,length:e,stride:t,offset:n,startIndices:s,characterSet:r}){const o=i.BYTES_PER_ELEMENT,a=t?t/o:1,c=n?n/o:0,l=s[e]||Math.ceil((i.length-c)/a),u=r&&new Set,f=new Array(e);let d=i;if(a>1||c>0){const h=i.constructor;d=new h(l);for(let g=0;g<l;g++)d[g]=i[g*a+c]}for(let h=0;h<e;h++){const g=s[h],p=s[h+1]||l,m=d.subarray(g,p);f[h]=String.fromCodePoint.apply(null,m),u&&m.forEach(u.add,u)}if(u)for(const h of u)r.add(String.fromCodePoint(h));return{texts:f,characterCount:l}}class xg{constructor(e=5){this._cache={},this._order=[],this.limit=e}get(e){const t=this._cache[e];return t&&(this._deleteOrder(e),this._appendOrder(e)),t}set(e,t){this._cache[e]?(this.delete(e),this._cache[e]=t,this._appendOrder(e)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[e]=t,this._appendOrder(e))}delete(e){this._cache[e]&&(delete this._cache[e],this._deleteOrder(e))}_deleteOrder(e){const t=this._order.indexOf(e);t>=0&&this._order.splice(t,1)}_appendOrder(e){this._order.push(e)}}function $A(){const i=[];for(let e=32;e<128;e++)i.push(String.fromCharCode(e));return i}const Wt={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:$A(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},uf=1024,ff=.9,df=.3,Pg=3;let ms=new xg(Pg);function UA(i,e){let t;typeof e=="string"?t=new Set(Array.from(e)):t=new Set(e);const n=ms.get(i);if(!n)return t;for(const s in n.mapping)t.has(s)&&t.delete(s);return t}function GA(i,e){for(let t=0;t<i.length;t++)e.data[4*t+3]=i[t]}function hf(i,e,t,n){i.font=`${n} ${t}px ${e}`,i.fillStyle="#000",i.textBaseline="alphabetic",i.textAlign="left"}function VA(i,e,t){if(t===void 0){const s=i.measureText("A");return s.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(s.fontBoundingBoxAscent),descent:Math.ceil(s.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:e*ff,descent:e*df}}const n=i.measureText(t);return n.actualBoundingBoxAscent?{advance:n.width,width:Math.ceil(n.actualBoundingBoxRight-n.actualBoundingBoxLeft),ascent:Math.ceil(n.actualBoundingBoxAscent),descent:Math.ceil(n.actualBoundingBoxDescent)}:{advance:n.width,width:n.width,ascent:e*ff,descent:e*df}}function jA(i){z.assert(Number.isFinite(i)&&i>=Pg,"Invalid cache limit"),ms=new xg(i)}class WA{constructor(){this.props={...Wt}}get atlas(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}setProps(e={}){Object.assign(this.props,e),e._getFontRenderer&&(this._getFontRenderer=e._getFontRenderer),this._key=this._getKey();const t=UA(this._key,this.props.characterSet),n=ms.get(this._key);if(n&&t.size===0){this._atlas!==n&&(this._atlas=n);return}const s=this._generateFontAtlas(t,n);this._atlas=s,ms.set(this._key,s)}_generateFontAtlas(e,t){const{fontFamily:n,fontWeight:s,fontSize:r,buffer:o,sdf:a,radius:c,cutoff:l}=this.props;let u=t&&t.data;u||(u=document.createElement("canvas"),u.width=uf);const f=u.getContext("2d",{willReadFrequently:!0});hf(f,n,r,s);const d=v=>VA(f,r,v);let h;this._getFontRenderer?h=this._getFontRenderer(this.props):a&&(h={measure:d,draw:HA(this.props)});const{mapping:g,canvasHeight:p,xOffset:m,yOffsetMin:_,yOffsetMax:b}=BA({measureText:v=>h?h.measure(v):d(v),buffer:o,characterSet:e,maxCanvasWidth:uf,...t&&{mapping:t.mapping,xOffset:t.xOffset,yOffsetMin:t.yOffsetMin,yOffsetMax:t.yOffsetMax}});if(u.height!==p){const v=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=p,v&&f.putImageData(v,0,0)}if(hf(f,n,r,s),h)for(const v of e){const w=g[v],x=w.width,{data:S,left:T=0,top:L=0}=h.draw(v),E=w.x-T,R=w.y-L,M=Math.max(0,Math.round(E)),C=Math.max(0,Math.round(R)),I=Math.min(S.width,u.width-M),W=Math.min(S.height,u.height-C);f.putImageData(S,M,C,0,0,I,W),w.x=M,w.y=C,w.width=I,w.height=W,w.anchorX+=I/2-T-x/2,w.anchorY+=L}else for(const v of e){const w=g[v];f.fillText(v,w.x,w.y+w.anchorY)}const y=h?h.measure():d();return{baselineOffset:(y.ascent-y.descent)/2,xOffset:m,yOffsetMin:_,yOffsetMax:b,mapping:g,data:u,width:u.width,height:u.height}}_getKey(){const{fontFamily:e,fontWeight:t,fontSize:n,buffer:s,sdf:r,radius:o,cutoff:a}=this.props;return r?`${e} ${t} ${n} ${s} ${o} ${a}`:`${e} ${t} ${n} ${s}`}}function HA({fontSize:i,buffer:e,radius:t,cutoff:n,fontFamily:s,fontWeight:r}){const o=new MA({fontSize:i,buffer:e,radius:t,cutoff:n,fontFamily:s,fontWeight:`${r}`});return a=>{const{data:c,width:l,height:u}=o.draw(a),f=new ImageData(l,u);return GA(c,f),{data:f,left:e,top:e}}}const YA=`struct TextBackgroundUniforms {
  billboard: f32,
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  borderRadius: vec4<f32>,
  padding: vec4<f32>,
  sizeUnits: i32,
  stroked: f32,
};

@group(0) @binding(auto) var<uniform> textBackground: TextBackgroundUniforms;
`,gf=`layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`,qA={name:"textBackground",source:YA,vs:gf,fs:gf,uniformTypes:{billboard:"f32",sizeScale:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",borderRadius:"vec4<f32>",padding:"vec4<f32>",sizeUnits:"i32",stroked:"f32"}},XA=`#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in vec4 instanceClipRect;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = radians(angle);
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = picking_getPickingColorFromInstanceID();
uv = positions;
vLineWidth = instanceLineWidths;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
textBackground.sizeMinPixels, textBackground.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
dimensions = instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;
vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * instanceScale + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
pixelOffset += instancePixelOffsets;
pixelOffset.y *= -1.0;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (instanceClipRect.z >= 0.0) {
dimensions.x = wh.x;
pixelOffset.x = xy.x + uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, uv.x);
}
if (instanceClipRect.w >= 0.0) {
dimensions.y = wh.y;
pixelOffset.y = xy.y + uv.y * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, uv.y);
}
if (textBackground.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,ZA=`#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;
out vec4 fragColor;
float round_rect(vec2 p, vec2 size, vec4 radii) {
vec2 pixelPositionCB = (p - 0.5) * size;
vec2 sizeCB = size * 0.5;
float maxBorderRadius = min(size.x, size.y) * 0.5;
vec4 borderRadius = vec4(min(radii, maxBorderRadius));
borderRadius.xy =
(pixelPositionCB.x > 0.0) ? borderRadius.xy : borderRadius.zw;
borderRadius.x = (pixelPositionCB.y > 0.0) ? borderRadius.x : borderRadius.y;
vec2 q = abs(pixelPositionCB) - sizeCB + borderRadius.x;
return -(min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - borderRadius.x);
}
float rect(vec2 p, vec2 size) {
vec2 pixelPosition = p * size;
return min(min(pixelPosition.x, size.x - pixelPosition.x),
min(pixelPosition.y, size.y - pixelPosition.y));
}
vec4 get_stroked_fragColor(float dist) {
float isBorder = smoothedge(dist, vLineWidth);
return mix(vFillColor, vLineColor, isBorder);
}
void main(void) {
geometry.uv = uv;
if (textBackground.borderRadius != vec4(0.0)) {
float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
float shapeAlpha = smoothedge(-distToEdge, 0.0);
if (shapeAlpha == 0.0) {
discard;
}
if (textBackground.stroked) {
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
fragColor.a *= shapeAlpha;
} else {
if (textBackground.stroked) {
float distToEdge = rect(uv, dimensions);
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,KA=`struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32,
};

@group(0) @binding(auto) var<uniform> text: TextUniforms;

fn rotate_by_angle(vertex: vec2<f32>, angle: f32) -> vec2<f32> {
  let angleRadian = radians(angle);
  let cosine = cos(angleRadian);
  let sine = sin(angleRadian);
  let rotationMatrix = mat2x2<f32>(
    vec2<f32>(cosine, -sine),
    vec2<f32>(sine, cosine)
  );
  return rotationMatrix * vertex;
}

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceRects: vec4<f32>,
  @location(6) instanceClipRect: vec4<f32>,
  @location(7) instancePixelOffsets: vec2<f32>,
  @location(8) instanceFillColors: vec4<f32>,
  @location(9) instanceLineColors: vec4<f32>,
  @location(10) instanceLineWidths: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) vLineWidth: f32,
  @location(3) uv: vec2<f32>,
  @location(4) dimensions: vec2<f32>,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  geometry.worldPosition = attributes.instancePositions;
  geometry.uv = attributes.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  var varyings: Varyings;
  varyings.uv = attributes.positions;
  varyings.vLineWidth = attributes.instanceLineWidths;

  let sizePixels = clamp(
    project_unit_size_to_pixel(
      attributes.instanceSizes * textBackground.sizeScale,
      textBackground.sizeUnits
    ),
    textBackground.sizeMinPixels,
    textBackground.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  varyings.dimensions = attributes.instanceRects.zw * instanceScale +
    textBackground.padding.xy + textBackground.padding.zw;

  var pixelOffset =
    (attributes.positions * attributes.instanceRects.zw + attributes.instanceRects.xy) *
      instanceScale +
    mix(-textBackground.padding.xy, textBackground.padding.zw, attributes.positions);
  pixelOffset = rotate_by_angle(pixelOffset, attributes.instanceAngles);
  pixelOffset = pixelOffset + attributes.instancePixelOffsets;
  pixelOffset.y = pixelOffset.y * -1.0;

  var xy = project_size_vec2(attributes.instanceClipRect.xy) * project.scale;
  let wh = project_size_vec2(attributes.instanceClipRect.zw) * project.scale;
  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (attributes.instanceClipRect.z >= 0.0) {
    varyings.dimensions.x = wh.x;
    pixelOffset.x = xy.x + varyings.uv.x * wh.x + mix(
      -textBackground.padding.x,
      textBackground.padding.z,
      varyings.uv.x
    );
  }
  if (attributes.instanceClipRect.w >= 0.0) {
    varyings.dimensions.y = wh.y;
    pixelOffset.y = xy.y + varyings.uv.y * wh.y + mix(
      -textBackground.padding.y,
      textBackground.padding.w,
      varyings.uv.y
    );
  }

  if (textBackground.billboard > 0.5) {
    var position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    position = vec4<f32>(
      position.x + clipOffset.x,
      position.y + clipOffset.y,
      position.z,
      position.w
    );
    varyings.position = position;
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    varyings.position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offsetCommon
    );
  }

  varyings.vFillColor = vec4<f32>(
    attributes.instanceFillColors.rgb,
    attributes.instanceFillColors.a * layer.opacity
  );
  varyings.vLineColor = vec4<f32>(
    attributes.instanceLineColors.rgb,
    attributes.instanceLineColors.a * layer.opacity
  );
  varyings.pickingColor = geometry.pickingColor;
  return varyings;
}

fn round_rect(point: vec2<f32>, size: vec2<f32>, radii: vec4<f32>) -> f32 {
  let pixelPosition = (point - 0.5) * size;
  let halfSize = size * 0.5;
  let maxBorderRadius = min(size.x, size.y) * 0.5;
  var borderRadius = min(radii, vec4<f32>(maxBorderRadius));

  borderRadius = select(borderRadius.zwxy, borderRadius, pixelPosition.x > 0.0);
  let radius = select(borderRadius.y, borderRadius.x, pixelPosition.y > 0.0);
  let q = abs(pixelPosition) - halfSize + radius;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, vec2<f32>(0.0))) - radius);
}

fn rect(point: vec2<f32>, size: vec2<f32>) -> f32 {
  let pixelPosition = point * size;
  return min(
    min(pixelPosition.x, size.x - pixelPosition.x),
    min(pixelPosition.y, size.y - pixelPosition.y)
  );
}

fn get_stroked_frag_color(
  distanceToEdge: f32,
  lineWidth: f32,
  fillColor: vec4<f32>,
  lineColor: vec4<f32>
) -> vec4<f32> {
  let isBorder = smoothedge(distanceToEdge, lineWidth);
  return mix(fillColor, lineColor, isBorder);
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.uv;
  var fragColor: vec4<f32>;

  if (any(textBackground.borderRadius != vec4<f32>(0.0))) {
    let distanceToEdge = round_rect(
      varyings.uv,
      varyings.dimensions,
      textBackground.borderRadius
    );
    let shapeAlpha = smoothedge(-distanceToEdge, 0.0);
    if (shapeAlpha == 0.0) {
      discard;
    }
    if (textBackground.stroked > 0.5) {
      fragColor = get_stroked_frag_color(
        distanceToEdge,
        varyings.vLineWidth,
        varyings.vFillColor,
        varyings.vLineColor
      );
    } else {
      fragColor = varyings.vFillColor;
    }
    fragColor.a = fragColor.a * shapeAlpha;
  } else if (textBackground.stroked > 0.5) {
    let distanceToEdge = rect(varyings.uv, varyings.dimensions);
    fragColor = get_stroked_frag_color(
      distanceToEdge,
      varyings.vLineWidth,
      varyings.vFillColor,
      varyings.vLineColor
    );
  } else {
    fragColor = varyings.vFillColor;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + fragColor.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`,QA={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,fontSize:1,borderRadius:{type:"object",value:0},padding:{type:"array",value:[0,0,0,0]},getPosition:{type:"accessor",value:i=>i.position},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},getBoundingRect:{type:"accessor",value:[0,0,0,0]},getClipRect:{type:"accessor",value:[0,0,-1,-1]},getFillColor:{type:"accessor",value:[0,0,0,255]},getLineColor:{type:"accessor",value:[0,0,0,255]},getLineWidth:{type:"accessor",value:1}};class lc extends Tt{getShaders(){return super.getShaders({vs:XA,fs:ZA,source:KA,modules:[Bs,Is,ks,qA,bg]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getSize",defaultValue:1},instanceAngles:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getAngle"},instanceRects:{size:4,bufferGroup:"text-background-instance-data",accessor:"getBoundingRect"},instanceClipRect:{size:4,bufferGroup:"text-background-instance-data",accessor:"getClipRect",defaultValue:[0,0,-1,-1]},instancePixelOffsets:{size:2,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getPixelOffset"},instanceFillColors:{size:4,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getLineWidth",defaultValue:1}})}updateState(e){super.updateState(e);const{changeFlags:t}=e;t.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{billboard:t,sizeScale:n,sizeUnits:s,sizeMinPixels:r,sizeMaxPixels:o,getLineWidth:a,fontSize:c}=this.props;let{padding:l,borderRadius:u}=this.props;l.length<4&&(l=[l[0],l[1],l[0],l[1]]),Array.isArray(u)||(u=[u,u,u,u]);const f=this.state.model,d={billboard:t,stroked:!!a,borderRadius:u,padding:l,sizeUnits:Ue[s],sizeScale:n,sizeMinPixels:r,sizeMaxPixels:o},h={fontSize:c,viewport:this.context.viewport};f.shaderInputs.setProps({textBackground:d,text:h}),f.draw(this.context.renderPass)}_getModel(){const e=[0,0,1,0,0,1,1,1];return new De(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new tn({topology:"triangle-strip",vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(e)}}}),isInstanced:!0})}}lc.defaultProps=QA;lc.layerName="TextBackgroundLayer";const pf={start:1,middle:0,end:-1},mf={top:1,center:0,bottom:-1},Kr=[0,0,0,255],JA=1,eM={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,background:!1,getBackgroundColor:{type:"accessor",value:[255,255,255,255]},getBorderColor:{type:"accessor",value:Kr},getBorderWidth:{type:"accessor",value:0},backgroundBorderRadius:{type:"object",value:0},backgroundPadding:{type:"array",value:[0,0,0,0]},characterSet:{type:"object",value:Wt.characterSet},fontFamily:Wt.fontFamily,fontWeight:Wt.fontWeight,lineHeight:JA,outlineWidth:{type:"number",value:0,min:0},outlineColor:{type:"color",value:Kr},fontSettings:{type:"object",value:{},compare:1},wordBreak:"break-word",maxWidth:{type:"number",value:-1},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none",getText:{type:"accessor",value:i=>i.text},getPosition:{type:"accessor",value:i=>i.position},getColor:{type:"accessor",value:Kr},getSize:{type:"accessor",value:32},getAngle:{type:"accessor",value:0},getTextAnchor:{type:"accessor",value:"middle"},getAlignmentBaseline:{type:"accessor",value:"center"},getPixelOffset:{type:"accessor",value:[0,0]},getContentBox:{type:"accessor",value:[0,0,-1,-1]},backgroundColor:{deprecatedFor:["background","getBackgroundColor"]}};class Eg extends og{constructor(){super(...arguments),this.getBoundingRect=(e,t)=>{const{size:[n,s]}=this.transformParagraph(e,t),{getTextAnchor:r,getAlignmentBaseline:o}=this.props,a=pf[typeof r=="function"?r(e,t):r],c=mf[typeof o=="function"?o(e,t):o];return[(a-1)*n/2,(c-1)*s/2,n,s]},this.getIconOffsets=(e,t)=>{const{getTextAnchor:n,getAlignmentBaseline:s}=this.props,{x:r,y:o,rowWidth:a,size:[,c]}=this.transformParagraph(e,t),l=pf[typeof n=="function"?n(e,t):n],u=mf[typeof s=="function"?s(e,t):s],f=r.length,d=new Array(f*2);let h=0;for(let g=0;g<f;g++)d[h++]=(l-1)*a[g]/2+r[g],d[h++]=(u-1)*c/2+o[g];return d}}initializeState(){this.state={styleVersion:0,fontAtlasManager:new WA},this.props.maxWidth>0&&z.once(1,"v8.9 breaking change: TextLayer maxWidth is now relative to text size")()}updateState(e){const{props:t,oldProps:n,changeFlags:s}=e;(s.dataChanged||s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||t.lineHeight!==n.lineHeight||t.wordBreak!==n.wordBreak||t.maxWidth!==n.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:e}){return e.object=e.index>=0?this.props.data[e.index]:null,e}_updateFontAtlas(){const{fontSettings:e,fontFamily:t,fontWeight:n,_getFontRenderer:s}=this.props,{fontAtlasManager:r,characterSet:o}=this.state,a={...e,characterSet:o,fontFamily:t,fontWeight:n,_getFontRenderer:s};if(!r.mapping)return r.setProps(a),!0;for(const c in a)if(a[c]!==r.props[c])return r.setProps(a),!0;return!1}_updateText(){const{data:e,characterSet:t}=this.props,n=e.attributes?.getText;let{getText:s}=this.props,r=e.startIndices,o;const a=t==="auto"&&new Set;if(n&&r){const{texts:c,characterCount:l}=NA({...ArrayBuffer.isView(n)?{value:n}:n,length:e.length,startIndices:r,characterSet:a});o=l,s=(u,{index:f})=>c[f]}else{const{iterable:c,objectInfo:l}=nn(e);r=[0],o=0;for(const u of c){l.index++;const f=Array.from(s(u,l)||"");a&&f.forEach(a.add,a),o+=f.length,r.push(o)}}this.setState({getText:s,startIndices:r,numInstances:o,characterSet:a||t})}transformParagraph(e,t){const{fontAtlasManager:n}=this.state,s=n.mapping,{baselineOffset:r}=n.atlas,{fontSize:o}=n.props,a=this.state.getText,{wordBreak:c,lineHeight:l,maxWidth:u}=this.props,f=a(e,t)||"";return zA(f,r,l*o,c,u*o,s)}renderLayers(){const{startIndices:e,numInstances:t,getText:n,fontAtlasManager:{atlas:s,mapping:r},styleVersion:o}=this.state,{data:a,_dataDiff:c,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getBackgroundColor:g,getBorderColor:p,getBorderWidth:m,getContentBox:_,backgroundBorderRadius:b,backgroundPadding:y,background:v,billboard:w,fontSettings:x,outlineWidth:S,outlineColor:T,sizeScale:L,sizeUnits:E,sizeMinPixels:R,sizeMaxPixels:M,contentCutoffPixels:C,contentAlignHorizontal:I,contentAlignVertical:W,transitions:F,updateTriggers:N}=this.props,on=this.getSubLayerClass("characters",ac),uc=this.getSubLayerClass("background",lc),{fontSize:Lt}=this.state.fontAtlasManager.props;return[v&&new uc({getFillColor:g,getLineColor:p,getLineWidth:m,borderRadius:b,padding:y,getPosition:l,getSize:f,getAngle:d,getPixelOffset:h,getClipRect:_,billboard:w,sizeScale:L,sizeUnits:E,sizeMinPixels:R,sizeMaxPixels:M,fontSize:Lt,transitions:F&&{getPosition:F.getPosition,getAngle:F.getAngle,getSize:F.getSize,getFillColor:F.getBackgroundColor,getLineColor:F.getBorderColor,getLineWidth:F.getBorderWidth,getPixelOffset:F.getPixelOffset}},this.getSubLayerProps({id:"background",updateTriggers:{getPosition:N.getPosition,getAngle:N.getAngle,getSize:N.getSize,getFillColor:N.getBackgroundColor,getLineColor:N.getBorderColor,getLineWidth:N.getBorderWidth,getPixelOffset:N.getPixelOffset,getBoundingRect:{getText:N.getText,getTextAnchor:N.getTextAnchor,getAlignmentBaseline:N.getAlignmentBaseline,styleVersion:o}}}),{data:a.attributes&&a.attributes.background?{length:a.length,attributes:a.attributes.background}:a,_dataDiff:c,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new on({sdf:x.sdf,smoothing:Number.isFinite(x.smoothing)?x.smoothing:Wt.smoothing,outlineWidth:S/(x.radius||Wt.radius),outlineColor:T,iconAtlas:s,iconMapping:r,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getContentBox:_,billboard:w,sizeScale:L,sizeUnits:E,sizeMinPixels:R,sizeMaxPixels:M,fontSize:Lt,contentCutoffPixels:C,contentAlignHorizontal:I,contentAlignVertical:W,transitions:F&&{getPosition:F.getPosition,getAngle:F.getAngle,getColor:F.getColor,getSize:F.getSize,getPixelOffset:F.getPixelOffset,getContentBox:F.getContentBox}},this.getSubLayerProps({id:"characters",updateTriggers:{all:N.getText,getPosition:N.getPosition,getAngle:N.getAngle,getColor:N.getColor,getSize:N.getSize,getPixelOffset:N.getPixelOffset,getContentBox:N.getContentBox,getIconOffsets:{getTextAnchor:N.getTextAnchor,getAlignmentBaseline:N.getAlignmentBaseline,styleVersion:o}}}),{data:a,_dataDiff:c,startIndices:e,numInstances:t,getIconOffsets:this.getIconOffsets,getIcon:n})]}static set fontAtlasCacheLimit(e){jA(e)}}Eg.defaultProps=eM;Eg.layerName="TextLayer";const tM={inject:{"vs:#main-end":`
#ifdef PATH_STYLE_OFFSET
float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
float offsetDir = sign(instanceOffsets);
vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
vPathPosition.y *= offsetWidth;
vPathLength *= offsetWidth;
#ifdef DASH_ENABLED
vPathBounds *= offsetWidth;
#endif
#endif
#ifdef DASH_ENABLED
float strokeHalfWidth = width.x;
#ifdef PATH_STYLE_OFFSET
strokeHalfWidth /= offsetWidth;
#endif
float dashWidthPixels = path.billboard
? strokeHalfWidth * project.focalDistance
: strokeHalfWidth * project.scale;
float strokeHalfWidthPixels = path.billboard
? strokeHalfWidth
: strokeHalfWidth * project.scale;
float dashUnitPixels = strokeHalfWidthPixels;
if (pathStyle.dashUnits == 1) {
dashUnitPixels = 1.0;
} else if (pathStyle.dashUnits == 2) {
dashUnitPixels = project_size_to_pixel(1.0);
} else if (pathStyle.dashUnits == 3) {
dashUnitPixels = project.scale;
}
vDashArray = instanceDashArrays * (dashUnitPixels / dashWidthPixels);
#ifdef HIGH_PRECISION_DASH
vec2 dashOffsetAndLength = (instanceDashOffsets * project.scale) / dashWidthPixels;
vDashPathLength = dashOffsetAndLength.y;
float dashUnitLength = vDashArray.x + vDashArray.y;
float dashPeriod = pathStyle.dashAlignMode == 0.0
? dashUnitLength
: vDashPathLength / max(round(vDashPathLength / max(dashUnitLength, 0.0001)), 1.0);
vDashOffset = dashPeriod > 0.0 ? mod(dashOffsetAndLength.x, dashPeriod) : 0.0;
#else
vDashOffset = 0.0;
vDashPathLength = 0.0;
#endif
#endif
`,"fs:#main-end":`
#ifdef DASH_ENABLED
#ifdef ANTIALIASING
if (inRoundedDashGap) {
float pathCoverage = smoothedge(0.0, edgePixels);
float resolvedCapMultiplier =
min(pathCoverage, roundedDashResolvedCoverage) / max(pathCoverage, 1e-6);
dashCoverage = mix(
resolvedCapMultiplier,
roundedDashDutyCycle,
roundedDashSubPixelBlend
);
}
#endif
if (shouldDiscardDash) {
discard;
}
fragColor.a *= dashCoverage;
#endif
#ifdef PATH_STYLE_OFFSET
#ifndef ANTIALIASING
if (abs(vPathPosition.x) > 1.0) {
discard;
}
#endif
#endif
`}},iM={inject:{"vs:#decl":`
in vec2 instanceDashArrays;
#ifdef HIGH_PRECISION_DASH
in vec2 instanceDashOffsets;
#endif
out vec2 vDashArray;
out float vDashOffset;
out float vDashPathLength;
layout(std140) uniform pathStyleUniforms {
float dashAlignMode;
bool dashGapPickable;
highp int dashUnits;
} pathStyle;
`,"fs:#decl":`
layout(std140) uniform pathStyleUniforms {
float dashAlignMode;
bool dashGapPickable;
highp int dashUnits;
} pathStyle;
in vec2 vDashArray;
in float vDashOffset;
in float vDashPathLength;
float dashPatternIntegral(float position, float solidLength, float unitLength) {
return floor(position / unitLength) * solidLength +
min(mod(position, unitLength), solidLength);
}
float dashPatternCoverage(
float position,
float solidLength,
float unitLength,
float filterWidth
) {
float halfFilter = 0.5 * filterWidth;
float reducedPosition = mod(position, unitLength);
return (dashPatternIntegral(reducedPosition + halfFilter, solidLength, unitLength) -
dashPatternIntegral(reducedPosition - halfFilter, solidLength, unitLength)) / filterWidth;
}
`,"fs:#main-start":`
float dashCoverage = 1.0;
bool shouldDiscardDash = false;
bool inRoundedDashGap = false;
float roundedDashResolvedCoverage = 1.0;
float roundedDashSubPixelBlend = 0.0;
float roundedDashDutyCycle = 1.0;
float solidLength = vDashArray.x;
float gapLength = vDashArray.y;
float unitLength = solidLength + gapLength;
if (unitLength > 0.0 && gapLength > 0.0) {
float offset;
if (pathStyle.dashAlignMode == 0.0) {
offset = vDashOffset;
} else {
#ifdef HIGH_PRECISION_DASH
unitLength = vDashPathLength / max(round(vDashPathLength / unitLength), 1.0);
#else
unitLength = vPathLength / max(round(vPathLength / unitLength), 1.0);
#endif
solidLength = min(solidLength, unitLength);
offset = solidLength / 2.0;
#ifdef HIGH_PRECISION_DASH
offset += vDashOffset;
#endif
}
float alongPath = vPathPosition.y + offset;
float unitOffset = mod(alongPath, unitLength);
float filterWidth = max(fwidth(alongPath), 0.0001);
if (bool(picking.isActive)) {
bool inGap = unitOffset > solidLength;
if (inGap && path.capType > 0.5) {
inGap = length(vec2(
min(unitOffset - solidLength, unitLength - unitOffset),
vPathPosition.x
)) > 1.0;
}
if (inGap && !pathStyle.dashGapPickable) {
shouldDiscardDash = true;
}
} else if (path.capType <= 0.5) {
dashCoverage = dashPatternCoverage(alongPath, solidLength, unitLength, filterWidth);
} else {
float distanceAlongGap = min(unitOffset - solidLength, unitLength - unitOffset);
float distanceToEnd = length(vec2(max(distanceAlongGap, 0.0), vPathPosition.x));
float capEdgePixels = (1.0 - distanceToEnd) / max(fwidth(distanceToEnd), 1e-6);
if (distanceAlongGap > 0.0) {
inRoundedDashGap = true;
roundedDashResolvedCoverage = smoothedge(0.0, capEdgePixels);
dashCoverage = roundedDashResolvedCoverage;
}
float subPixelBlend = smoothstep(unitLength, 2.0 * unitLength, filterWidth);
roundedDashSubPixelBlend = subPixelBlend;
float boundedSolidLength = min(solidLength, unitLength);
float effectiveGap = max(unitLength - boundedSolidLength, 0.0);
float capSpan = 2.0 * sqrt(max(1.0 - vPathPosition.x * vPathPosition.x, 0.0));
float roundedDutyCycle = clamp(
(boundedSolidLength + min(effectiveGap, capSpan)) / unitLength,
0.0,
1.0
);
roundedDashDutyCycle = roundedDutyCycle;
dashCoverage = mix(dashCoverage, roundedDutyCycle, subPixelBlend);
}
dashCoverage = clamp(dashCoverage, 0.0, 1.0);
shouldDiscardDash = shouldDiscardDash || dashCoverage <= 0.0;
}
`}},nM={inject:{"vs:#decl":`
in vec2 instanceDashArrays;
out vec2 vDashArray;
`,"vs:#main-end":`
vDashArray = instanceDashArrays;
`,"fs:#decl":`
layout(std140) uniform pathStyleUniforms {
bool dashGapPickable;
} pathStyle;
in vec2 vDashArray;
#define PI 3.141592653589793
`,"fs:#main-start":`
bool inDashGap = false;
float dashUnitLength = vDashArray.x + vDashArray.y;
if (dashUnitLength > 0.0 && scatterplot.stroked > 0.5) {
float _distToCenter = length(unitPosition) * outerRadiusPixels;
float innerRadius = innerUnitRadius * outerRadiusPixels;
if (_distToCenter >= innerRadius) {
float strokeWidth = (1.0 - innerUnitRadius) * outerRadiusPixels;
float midStrokeRadius = (innerUnitRadius + 1.0) * 0.5 * outerRadiusPixels;
float angle = atan(unitPosition.y, unitPosition.x) + PI;
float circumference = 2.0 * PI * midStrokeRadius;
float posAlongStroke = (angle / (2.0 * PI)) * circumference / strokeWidth;
float unitOffset = mod(posAlongStroke, dashUnitLength);
if (unitOffset > vDashArray.x) {
if (scatterplot.filled > 0.5) {
inDashGap = true;
} else {
if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
discard;
}
}
}
}
}
`,"fs:#main-end":`
if (inDashGap) {
float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
fragColor = picking_filterPickingColor(fragColor);
fragColor = picking_filterHighlightColor(fragColor);
}
`}},sM={inject:{"vs:#decl":`
in vec2 instanceDashArrays;
out vec2 vDashArray;
`,"vs:#main-end":`
vDashArray = instanceDashArrays;
`,"fs:#decl":`
layout(std140) uniform pathStyleUniforms {
bool dashGapPickable;
} pathStyle;
in vec2 vDashArray;
#define PI 3.141592653589793
float getPerimeterPosition(vec2 fragUV, vec2 dims, vec4 radii, float lineWidth) {
float width = dims.x;
float height = dims.y;
float maxRadius = min(width, height) * 0.5;
float rBL = min(radii.w, maxRadius);
float rTL = min(radii.z, maxRadius);
float rTR = min(radii.x, maxRadius);
float rBR = min(radii.y, maxRadius);
vec2 p = fragUV * dims;
float leftLen = height - rBL - rTL;
float topLen = width - rTL - rTR;
float rightLen = height - rTR - rBR;
float bottomLen = width - rBR - rBL;
float arcBL = PI * 0.5 * rBL;
float arcTL = PI * 0.5 * rTL;
float arcTR = PI * 0.5 * rTR;
float arcBR = PI * 0.5 * rBR;
float pos = 0.0;
float distLeft = p.x;
float distRight = width - p.x;
float distBottom = p.y;
float distTop = height - p.y;
float minDist = min(min(distLeft, distRight), min(distBottom, distTop));
if (p.x < rBL && p.y < rBL) {
vec2 c = vec2(rBL, rBL);
vec2 d = p - c;
float angle = atan(-d.x, -d.y);
pos = angle / (PI * 0.5) * arcBL;
} else if (p.x < rTL && p.y > height - rTL) {
vec2 c = vec2(rTL, height - rTL);
vec2 d = p - c;
float angle = atan(d.y, -d.x);
pos = arcBL + leftLen + angle / (PI * 0.5) * arcTL;
} else if (p.x > width - rTR && p.y > height - rTR) {
vec2 c = vec2(width - rTR, height - rTR);
vec2 d = p - c;
float angle = atan(d.x, d.y);
pos = arcBL + leftLen + arcTL + topLen + angle / (PI * 0.5) * arcTR;
} else if (p.x > width - rBR && p.y < rBR) {
vec2 c = vec2(width - rBR, rBR);
vec2 d = p - c;
float angle = atan(-d.y, d.x);
pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + angle / (PI * 0.5) * arcBR;
} else if (minDist == distLeft) {
pos = arcBL + clamp(p.y - rBL, 0.0, leftLen);
} else if (minDist == distTop) {
pos = arcBL + leftLen + arcTL + clamp(p.x - rTL, 0.0, topLen);
} else if (minDist == distRight) {
pos = arcBL + leftLen + arcTL + topLen + arcTR + clamp(height - rTR - p.y, 0.0, rightLen);
} else {
pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + arcBR + clamp(width - rBR - p.x, 0.0, bottomLen);
}
return pos / lineWidth;
}
float getRectPerimeterPosition(vec2 fragUV, vec2 dims, float lineWidth) {
float width = dims.x;
float height = dims.y;
float distLeft = fragUV.x * width;
float distRight = (1.0 - fragUV.x) * width;
float distBottom = fragUV.y * height;
float distTop = (1.0 - fragUV.y) * height;
float minDist = min(min(distLeft, distRight), min(distBottom, distTop));
float pos = 0.0;
if (minDist == distLeft) {
pos = fragUV.y * height;
} else if (minDist == distTop) {
pos = height + fragUV.x * width;
} else if (minDist == distRight) {
pos = height + width + (1.0 - fragUV.y) * height;
} else {
pos = 2.0 * height + width + (1.0 - fragUV.x) * width;
}
return pos / lineWidth;
}
`,"fs:#main-start":`
bool inDashGap = false;
float dashUnitLength = vDashArray.x + vDashArray.y;
if (dashUnitLength > 0.0 && textBackground.stroked) {
float distToEdge;
bool hasRoundedCorners = textBackground.borderRadius != vec4(0.0);
if (hasRoundedCorners) {
distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
} else {
distToEdge = rect(uv, dimensions);
}
if (distToEdge <= vLineWidth && distToEdge >= 0.0) {
float posAlongStroke;
if (hasRoundedCorners) {
posAlongStroke = getPerimeterPosition(uv, dimensions, textBackground.borderRadius, vLineWidth);
} else {
posAlongStroke = getRectPerimeterPosition(uv, dimensions, vLineWidth);
}
float unitOffset = mod(posAlongStroke, dashUnitLength);
if (unitOffset > vDashArray.x) {
if (vFillColor.a > 0.0) {
inDashGap = true;
} else {
if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
discard;
}
}
}
}
}
`,"fs:#main-end":`
if (inDashGap) {
float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
fragColor = picking_filterPickingColor(fragColor);
fragColor = picking_filterHighlightColor(fragColor);
}
`}},rM={inject:{"vs:#decl":`
in float instanceOffsets;
`,"vs:DECKGL_FILTER_SIZE":`
float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
size *= offsetWidth;
`}},oM={getDashArray:{type:"accessor",value:[0,0]},getOffset:{type:"accessor",value:0},dashJustified:!1,dashGapPickable:!1,dashUnits:"widths"},aM={widths:0,pixels:1,meters:2,common:3},cM=["instanceDashArrays","instanceDashOffsets","instanceOffsets"];function lM({props:i,oldProps:e}){return!J(i.modelMatrix,e.modelMatrix,2)||i.coordinateSystem!==e.coordinateSystem||!J(i.coordinateOrigin,e.coordinateOrigin,1)}function _f(i,e,t){const n=i.context.viewport;if(!(n instanceof Oe)||n.zoom<12)return i.projectPosition(e,{autoOffset:!1});const s=Et([],[e[0],e[1],e[2]||0,1],t.modelMatrix),r=i.props.coordinateSystem==="default"?"lnglat":i.props.coordinateSystem;if(r==="lnglat"){if(Math.abs(s[1]-t.coordinateOrigin[1])>.25){let c=s[0];t.wrapLongitude&&(c=((c+180)%360+360)%360-180);const l=n.projectPosition([c,s[1],0]);return[l[0]-t.commonOrigin[0],l[1]-t.commonOrigin[1],s[2]*t.commonUnitsPerMeter[2]]}Jn(s,s,t.coordinateOrigin)}else r==="cartesian"&&Jn(s,s,t.coordinateOrigin);const o=s[1],a=A0([],t.commonUnitsPerWorldUnit,t.commonUnitsPerWorldUnit2,o);return C0([],s,a)}class Sg extends rc{constructor({dash:e=!1,offset:t=!1,dashMode:n,highPrecisionDash:s=!1}={}){const r=n??(s?"path":"segment");super({dash:e||s||n!==void 0,offset:t,dashMode:r,highPrecisionDash:r==="path"})}getLayerType(e){if("pathTesselator"in e.state)return"path";const t=e.constructor.layerName;return t==="ScatterplotLayer"?"scatterplot":t==="TextBackgroundLayer"?"textBackground":null}synchronizeAttributes(e){const t=e.getAttributeManager(),n=this.getLayerType(e);if(!t||!n)return!1;const s=t.getAttributes(),r=new Set;this.opts.dash&&r.add("instanceDashArrays"),n==="path"&&this.opts.dash&&this.opts.dashMode==="path"&&r.add("instanceDashOffsets"),n==="path"&&this.opts.offset&&r.add("instanceOffsets");let o=!1;for(const a of cM)s[a]&&!r.has(a)&&(t.remove([a]),o=!0);return r.has("instanceDashArrays")&&!s.instanceDashArrays&&(t.addInstanced({instanceDashArrays:{size:2,accessor:"getDashArray"}}),o=!0),r.has("instanceDashOffsets")&&!s.instanceDashOffsets&&(t.addInstanced({instanceDashOffsets:{size:2,accessor:["getPath"],update:this.calculateDashMetrics}}),o=!0),r.has("instanceOffsets")&&!s.instanceOffsets&&(t.addInstanced({instanceOffsets:{size:1,accessor:"getOffset"}}),o=!0),o}isEnabled(e){return this.getLayerType(e)!==null}getShaders(e){const t=e.getLayerType(this);if(!t)return null;if(t==="scatterplot"||t==="textBackground")return e.opts.dash?{modules:[{name:"pathStyle",inject:t==="scatterplot"?nM.inject:sM.inject,uniformTypes:{dashGapPickable:"i32"}}]}:null;let n={};(e.opts.dash||e.opts.offset)&&(n=Ai(n,tM));const s={};e.opts.dash&&(n=Ai(n,iM),s.DASH_ENABLED=!0,e.opts.dashMode==="path"&&(s.HIGH_PRECISION_DASH=!0)),e.opts.offset&&(n=Ai(n,rM),s.PATH_STYLE_OFFSET=!0);const{inject:r}=n,o={name:"pathStyle",inject:r};return e.opts.dash&&(o.uniformTypes={dashAlignMode:"f32",dashGapPickable:"i32",dashUnits:"i32"}),{modules:[o],defines:s}}initializeState(e,t){t.synchronizeAttributes(this)}updateState(e,t){if(t.isEnabled(this)){if(e.changeFlags.extensionsChanged){const n=t.synchronizeAttributes(this),s=this.getAttributeManager();if(s&&n){s.invalidateAll();for(const r of this.getModels())r.setBufferLayout(s.getBufferLayouts(r))}}if(t.opts.dash){const n=t.getLayerType(this);if(n==="path"&&t.opts.dashMode==="path"&&lM(e)&&this.getAttributeManager()?.invalidate("instanceDashOffsets"),n==="scatterplot"||n==="textBackground"){const s={dashGapPickable:!!this.props.dashGapPickable};this.setShaderModuleProps({pathStyle:s})}else{const s={dashAlignMode:this.props.dashJustified?1:0,dashGapPickable:!!this.props.dashGapPickable,dashUnits:aM[this.props.dashUnits??"widths"]};this.setShaderModuleProps({pathStyle:s})}}}}calculateDashMetrics(e,{startRow:t,endRow:n}){const s=this.state.pathTesselator,r=s?.vertexStarts,o=s?.instanceCount,a=s?.get("positions");if(!r||o===void 0||typeof s?.getPathSegmentIndices!="function")throw new Error("PathStyleExtension requires PathLayer tessellation data for path dashes.");const c=this.props.data?.attributes?.getPath,l=ArrayBuffer.isView(c)?c:c?.value,u=ArrayBuffer.isView(l),f=a&&(!c||s.normalize||s.opts?.isWebGPU);if(c&&!u||!f&&!u)throw new Error("PathStyleExtension cannot calculate whole-path dash metrics from GPU-only getPath data; supply data.attributes.instanceDashOffsets.");const d=e.value,h=e.size,g=Math.max(0,t),p=Math.min(n,r.length-1);let m=3,_=3,b=0;if(!f){const x=l.BYTES_PER_ELEMENT;m=c?.size||(this.props.positionFormat==="XY"?2:3),_=c?.stride?c.stride/x:m,b=c?.offset?c.offset/x:0}const y=new Array(3),v=Qi.getUniforms({viewport:this.context.viewport,modelMatrix:this.props.modelMatrix,coordinateSystem:this.props.coordinateSystem,coordinateOrigin:this.props.coordinateOrigin,autoWrapLongitude:this.wrapLongitude}),w=x=>{if(f)y[0]=a[x*3],y[1]=a[x*3+1],y[2]=a[x*3+2];else{const S=b+x*_;y[0]=l[S],y[1]=l[S+1],y[2]=m===3?l[S+2]:0}return y};e.startIndices=r;for(let x=g;x<p;x++){const S=r[x],T=Math.min(r[x+1]??o,o);d.fill(0,S*h,T*h);const L=s.getPathSegmentIndices(x);let E=0,R=-2,M=null;for(const C of L){const I=C*h;d[I]=E;const W=C===R+1&&M?M:_f(this,w(C),v),F=_f(this,w(C+1),v);E+=ul(W,F),R=C,M=F}if(h>1)for(let C=S;C<T;C++)d[C*h+1]=E}}getDashOffsets(e){const t=[0],n=this.props.positionFormat==="XY"?2:3,s=Array.isArray(e[0]),r=s?e.length:e.length/n;let o,a;for(let c=0;c<r-1;c++)o=s?e[c]:e.slice(c*n,c*n+n),o=this.projectPosition(o,{autoOffset:!1}),c>0&&(t[c]=t[c-1]+ul(a,o)),a=o;return t[r-1]=0,t}}Sg.defaultProps=oM;Sg.extensionName="PathStyleExtension";function we(i,e,t=!1){if(t)return e===1?"float":`vec${e}`;switch(i){case"uint8":case"uint16":case"uint32":return e===1?"uint":`uvec${e}`;case"sint8":case"sint16":case"sint32":return e===1?"int":`ivec${e}`;default:return e===1?"float":`vec${e}`}}function Tg(i,e,t=!1){let n;if(t)switch(i){case"uint8":n="unorm8";break;case"sint8":n="snorm8";break;case"uint16":n="unorm16";break;case"sint16":n="snorm16";break;case"float32":n="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${i}`)}else n=i;return e===1?n:e===3&&!n.startsWith("float32")&&!n.endsWith("32")?`${n}x3-webgl`:`${n}x${e}`}function Us(i){switch(i[0]){case"u":return"0u";case"s":return"0";default:return"0."}}function uM(i,e){switch(i){case"uint8":case"uint16":case"uint32":return`${Math.trunc(e)}u`;case"sint8":case"sint16":case"sint32":return`${Math.trunc(e)}`;default:return Number.isInteger(e)?`${e}.0`:`${e}`}}function fM(i){switch(i){case"uint8":return"r8uint";case"sint8":return"r8sint";case"uint16":return"r16uint";case"sint16":return"r16sint";case"uint32":return"r32uint";case"sint32":return"r32sint";case"float32":return"r32float";default:throw new Error(`Unsupported WebGL gather texture format for ${i}`)}}function dM(i){switch(i){case"uint32":return"usampler2D";case"sint32":return"isampler2D";case"float32":return"sampler2D";default:throw new Error(`Unsupported WebGL gather sampler type for ${i}`)}}const hM="GPGPU Operation Counts",gM="Transform Runs",pM=new Ad;function tt({module:i,elementWise:e=!1,expression:t,inputs:n,output:s,operationType:r=s.type,outputBuffer:o}){const a=o.device,c=Gs("result",s.type,s.size,s.normalized),l=[i,c],u=[],f={},d=we(s.type,1,s.normalized),h=we(r,1,s.normalized);let g="",p=null;const m={TYPE:h,RESULT_LEN:s.size.toString()},_=mM(n);for(const[w,x]of _)l.push(Lg(w,x.type,x.size,x.normalized,r)),u.push(Cg(w,x)),x instanceof U?f[w]=x.buffer:(p=p||me.createOrReuse(a,o.byteLength),f[w]=p),g+=`TYPE ${w}[${x.size}]; get_${w}(${w});
`,m[`${w.toUpperCase()}_LEN`]=x.size.toString();let b="";if(t)for(let w=0;w<s.size;w++)b+=`result[${w}]=${t(w)};
`;else if(e)for(let w=0;w<s.size;w++){const x=Us(h),S=_.map(([T,L])=>w<L.size?`${T}[${w}]`:x);b+=`result[${w}]=${i.name}(${S.join(", ")});
`}else b=`${i.name}(${_.map(([w])=>w).join(", ")}, result);`;const y=`#version 300 es

void main() {
${g}
${d} result[${s.size}];
${b}
set_result(result);
}
  `,v=new Fe(a,{vs:y,shaderAssembler:pM,defines:m,modules:l,bufferLayout:u,vertexCount:1,instanceCount:s.length,attributes:f,feedbackBufferMode:"interleaved",outputs:c.varyings});a.statsManager.getStats(hM).get(gM).incrementCount(),v.run({inputBuffers:f,outputBuffers:{[c.varyings[0]]:s.offset===0?o:{buffer:o,byteOffset:s.offset,byteLength:s.byteLength}}}),p&&me.recycle(p)}function mM(i){return Array.isArray(i)?i.map((e,t)=>[`x${t}`,e]):Object.entries(i)}function Lg(i,e,t,n=!1,s=e){let r="",o="";for(let c=0;c<t;c+=4){const l=Math.min(t-c,4),u=we(e,l,n);r+=`in ${u} a${i}_${c};
`;for(let f=0;f<l;f++){let d=`a${i}_${c}`;l>1&&(d=`${d}[${f}]`),(n||e!==s)&&(d=`TYPE(${d})`),o+=`v[${c+f}]=${d};
`}}const a=`
${r}
void get_${i}(out TYPE v[${t}]) {
  ${o}
}
`;return{name:i,vs:a}}function Cg(i,e){const t={name:i,stepMode:e.isConstant?"vertex":"instance",byteStride:e.stride,attributes:[]};for(let n=0;n<e.size;n+=4){const s=Math.min(e.size-n,4);t.attributes.push({attribute:`a${i}_${n}`,format:Tg(e.type,s,e.normalized),byteOffset:e.offset+e.ValueType.BYTES_PER_ELEMENT*n})}return t}function Gs(i,e,t,n=!1){const s=[],r=we(e,1,n);let o="",a="";for(let c=0;c<t;c+=4){const l=Math.min(t-c,4),u=we(e,l,n);s.push(`${i}_${c}`),o+=`flat out ${u} ${i}_${c};
`;const f=Array.from({length:l},(d,h)=>c+h);a+=`${i}_${c} = ${u}(${f.map(d=>`v[${d}]`).join(",")});
`}return{name:i,varyings:s,vs:`
${o}
void set_${i}(in ${r} v[${t}]) {
  ${a}
}
`}}const _M=`TYPE arithmetic_add(TYPE x, TYPE y) {
  return x + y;
}

TYPE arithmetic_subtract(TYPE x, TYPE y) {
  return x - y;
}

TYPE arithmetic_multiply(TYPE x, TYPE y) {
  return x * y;
}

TYPE arithmetic_divide(TYPE x, TYPE y) {
  return x / y;
}

float arithmetic_tan(float x) {
  return tan_fp32(x);
}
`,Ag=({inputs:i,output:e,target:t})=>{const n=e.type,s=we(n,1,e.normalized),r=Us(s),o=i.namedInputs;return tt({module:{name:"arithmetic",dependencies:[ka],vs:_M},inputs:o,output:e,operationType:n,outputBuffer:t,expression:a=>Wh(i.expression,{operations:Qa,inputs:o,laneIndex:a,formatInput:c=>`${c}[${a}]`,formatOutOfBoundsInput:c=>o[c].size===1?`${c}[0]`:r,formatLiteral:c=>{const l=Array.isArray(c)?c[a]??0:c;return`${s}(${uM(n,l)})`},formatCall:(c,l)=>`${c}(${l.join(", ")})`})}),{success:!0}},yM="GPGPU Operation Counts",bM="Transform Runs",vM=({inputs:i,output:e,target:t})=>{const{sourceValues:n}=i,s=t.device;if(n.length===0){const f=new e.ValueType(e.length*e.size);return t.write(f),{success:!0,value:f}}if(n.isConstant){const f=n.value,d=new e.ValueType(e.length*e.size);for(let h=0;h<e.length;h++){const g=f[h];d[h*2]=g,d[h*2+1]=g}return t.write(d),{success:!0,value:d}}const r=s.createTexture({width:1,height:e.length,format:"rg32float",usage:k.RENDER|k.COPY_SRC|k.COPY_DST}),o=s.createFramebuffer({colorAttachments:[r]}),a=`#version 300 es

flat out float extent_value;

void main() {
  float sourceValues[SOURCE_VALUES_LEN];
  get_sourceValues(sourceValues);
  extent_value = sourceValues[gl_VertexID];

  float y = (float(gl_VertexID) + 0.5) / float(CHANNEL_COUNT) * 2.0 - 1.0;
  gl_Position = vec4(0.0, y, 0.0, 1.0);
  gl_PointSize = 1.0;
}
  `,c=`#version 300 es

precision highp float;

flat in float extent_value;
out vec2 fragColor;

void main() {
  fragColor = vec2(-extent_value, extent_value);
}
  `,l=new De(s,{vs:a,fs:c,topology:"point-list",parameters:{depthCompare:"always",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},modules:[Lg("sourceValues",n.type,n.size,n.normalized)],defines:{TYPE:"float",SOURCE_VALUES_LEN:n.size.toString(),CHANNEL_COUNT:e.length.toString()},attributes:{sourceValues:n.buffer},bufferLayout:[Cg("sourceValues",n)],instanceCount:n.length,vertexCount:e.length,disableWarnings:!0}),u=me.createOrReuse(s,e.byteLength);try{const f=s.beginRenderPass({framebuffer:o,parameters:{viewport:[0,0,1,e.length]},clearColor:[-yf,-yf,0,0],clearDepth:!1,clearStencil:!1});s.statsManager.getStats(yM).get(bM).incrementCount(),l.draw(f),f.end();const d=s.createCommandEncoder();return d.copyTextureToBuffer({sourceTexture:r,width:1,height:e.length,destinationBuffer:u,byteOffset:0,bytesPerRow:8}),s.submit(d.finish()),Ag({device:s,inputs:{expression:{kind:"call",op:"multiply",args:[{kind:"input",name:"x"},{kind:"literal",value:[-1,1]}]},namedInputs:{x:new U({buffer:u,size:2,type:"float32",length:e.length})}},output:e,target:t})}finally{l.destroy(),me.recycle(u),o.destroy(),r.destroy()}},yf=3e38,wM=({inputs:i,output:e,target:t})=>{const n=i.map((c,l)=>[`x${l}`,c]);xM(t.device.limits.maxVertexAttributes,n),PM(t.device.limits.maxInterStageShaderVariables,e);const s=n.map(([c,l])=>`in TYPE ${c}[${l.size}]`).join(", ");let r=0;const o=n.map(([c,l])=>{const u=Array.from({length:l.size},(f,d)=>`  result[${r+d}] = ${c}[${d}];`).join(`
`);return r+=l.size,u}).join(`
`),a=`void interleave(${s}, out TYPE result[RESULT_LEN]) {
${o}
}
`;return tt({module:{name:"interleave",vs:a},inputs:i,output:e,outputBuffer:t}),{success:!0}};function xM(i,e){const t=e.reduce((n,[,s])=>n+Math.ceil(s.size/4),0);if(t>i)throw new Error(`interleave() requires ${t} vertex attributes, exceeding device limit ${i}`)}function PM(i,e){if(e.size>i)throw new Error(`interleave() output size ${e.size} exceeds device inter-stage component limit ${i}`)}function EM(){const i=new Uint16Array([255]);return new Uint8Array(i.buffer)[0]>0}const SM=`#define LE ${EM()?1:0}
const uint F32_NAN = 0xffffffffu;
const uint F32_INF = 0x7f800000u;

// Find first set bit using binary search
// https://en.wikipedia.org/wiki/Find_first_set#CLZ
int countLeadingZeros(uint a) {
  if (a == 0u) return 32;
  int n = 0;
  if ((a & 0xffff0000u) == 0u) { n += 16; a = a << 16; }
  if ((a & 0xff000000u) == 0u) { n += 8;  a = a << 8;  }
  if ((a & 0xf0000000u) == 0u) { n += 4;  a = a << 4;  }
  if ((a & 0xc0000000u) == 0u) { n += 2;  a = a << 2;  }
  if ((a & 0x80000000u) == 0u) return n + 1;
  return n;
}

uint roundShiftRight(uint value, int shift) {
  if (shift <= 0) {
    return value << (-shift);
  }

  if (shift >= 32) {
    if (shift == 32 && value > 0x80000000u) {
      return 1u;
    }
    return 0u;
  }

  uint truncated = value >> shift;
  uint halfShift = 1u << (shift - 1);
  uint remainder = value & ((1u << shift) - 1u);
  if (remainder > halfShift || (remainder == halfShift && (truncated & 1u) == 1u)) {
    return truncated + 1u;
  }
  return truncated;
}

uint makeFloat_(uint sign, int exponent, uint mantissa) {
  return (sign << 31) | (uint(exponent + 127) << 23) | (mantissa & 0x7fffffu);
}

/**
 * Assemble a float32 in bit representation according to IEEE 754
 * https://en.wikipedia.org/wiki/Single-precision_floating-point_format
 */
uint makeFloat(uint sign, int exponent, uint significand) {
  if (significand == 0u) {
    return sign << 31;
  }

  // Remove any extra leading zeros for better precision
  int lead_zeros = countLeadingZeros(significand);
  // Significand is encoded as 1.fraction
  int normalizedExponent = exponent + 31 - lead_zeros;

  if (normalizedExponent > 127) {
    return (sign << 31) | F32_INF;
  }

  uint mantissa;
  if (normalizedExponent >= -126) {
    mantissa = roundShiftRight(significand, 8 - lead_zeros);
    if (mantissa >= 0x1000000u) {
      mantissa >>= 1;
      normalizedExponent++;
      if (normalizedExponent > 127) {
        return (sign << 31) | F32_INF;
      }
    }
    return makeFloat_(sign, normalizedExponent, mantissa);
  }

  int subnormalShift = -149 - exponent;
  mantissa = roundShiftRight(significand, subnormalShift);
  if (mantissa >= 0x800000u) {
    return (sign << 31) | (1u << 23);
  }
  return (sign << 31) | mantissa;
}

/**
 * Parse 8-byte memory as a float64 number according to IEEE 754
 * https://en.wikipedia.org/wiki/Double-precision_floating-point_format
 * Returns 8-byte memory as 2 float32 numbers, consisting of
 * high part: fround(d)
 * low part: d - fround(d)
 */
uvec2 parseAsDouble(uvec2 d) {
  #if LE
  d = d.yx; // to big endian
  #endif

  uint sign = (d[0] >> 31) & 1u; // first bit
  uint exponentBits = (d[0] >> 20) & 0x7ffu;
  int exponent = int(exponentBits) - 1023; // next 11 bits
  uint fractionHigh = d[0] & 0xfffffu;
  uint fractionLow = d[1];

  if (exponentBits == 0x7ffu) {
    if (fractionHigh == 0u && fractionLow == 0u) {
      return uvec2((sign << 31) | F32_INF, F32_NAN);
    }
    return uvec2(F32_NAN);
  }
  
  if (exponentBits == 0u) {
    // All float64 subnormals are too small to survive a float32 split.
    return uvec2(sign << 31);
  }

  if (exponent > 127) {
    return uvec2((sign << 31) | F32_INF, ((1u - sign) << 31) | F32_INF);
  }

  uint hi_part;
  uint low_part;

  // float64 significand has 52 bits
  // float32 significand has 23 bits
  // The significand of the high part is the significand of the double, trimmed
  uint f_hi = 0x800000u | (fractionHigh << 3) | (fractionLow >> 29);
  uint f_low = fractionLow & 0x1fffffffu;

  if (exponent < -126) {
    // For tiny normals, the top 24 significand bits still contribute to the float32
    // high part, but they land in the float32 subnormal range.
    hi_part = makeFloat(sign, exponent - 23, f_hi);

    // The residual keeps the remaining 29 significand bits at the original double scale.
    low_part = makeFloat(sign, exponent - 52, f_low);
    return uvec2(hi_part, low_part);
  }

  bool roundUp = f_low > 0x10000000u || (f_low == 0x10000000u && (f_hi & 1u) == 1u);

  uint f_rounded = f_hi + (roundUp ? 1u : 0u);
  int exponent_hi = exponent;
  if (f_rounded == 0x1000000u) {
    f_rounded = 0x800000u;
    exponent_hi++;
  }

  if (exponent_hi > 127) {
    // Overflows float32 limit
    hi_part = (sign << 31) | F32_INF;
    low_part = ((1u - sign) << 31) | F32_INF;
    return uvec2(hi_part, low_part);
  }
  
  hi_part = makeFloat_(sign, exponent_hi, f_rounded);

  int remainder = int(f_low);
  uint sign_low = sign;
  if (roundUp) {
    remainder -= 0x20000000;
  }
  if (remainder < 0) {
    sign_low = 1u - sign;
    remainder = -remainder;
  }
  low_part = makeFloat(sign_low, exponent - 52, uint(remainder));

  return uvec2(hi_part, low_part);
}

void fround(in uint x[X_LEN], out float result[X_LEN]) {
  int n = X_LEN / 2;
  for (int i = 0; i < n; i++) {
    uvec2 f = parseAsDouble(uvec2(x[i * 2], x[i * 2 + 1]));
    result[i] = uintBitsToFloat(f.x);
    result[i + n] = uintBitsToFloat(f.y);
  }
}
`,TM=({inputs:i,output:e,target:t})=>(tt({module:{name:"fround",vs:SM},inputs:i,output:e,operationType:"uint32",outputBuffer:t}),{success:!0});function Mg(i,e,t){const n=dM(t),s=we(e,1),r=Array.from({length:i.size},(o,a)=>`  v[${a}] = ${s}(texelFetch(source_values_texture, ivec2(${a}, rowIndex), 0).r);`).join(`
`);return{name:"source_values_texture",vs:`
uniform highp ${n} source_values_texture;
void read_source_values(int rowIndex, out TYPE v[${i.size}]) {
${r}
}
`}}function Ig(i,e,t){const n=t.createTexture({width:Math.max(i.size,1),height:i.length,format:fM(e),usage:k.SAMPLE|k.COPY_DST});if(i.length===0)return n;const s=t.createCommandEncoder();return s.copyBufferToTexture({sourceBuffer:i.buffer,destinationTexture:n,byteOffset:i.offset,bytesPerRow:i.stride,rowsPerImage:i.length,size:[i.size,i.length,1]}),t.submit(s.finish()),n}const LM=async({inputs:i,output:e,target:t})=>{const{ids:n,sourceValues:s}=i,r=t.device,o=Gs("result",e.type,e.size),a=we(n.type,1),c=we(e.type,1),l=e.type,u=Ig(s,l,r),f=`#version 300 es

void main() {
  INDEX_TYPE ids[1];
  get_ids(ids);
  TYPE result[${e.size}];
  gather(ids, result);
  set_result(result);
}
  `,d=new Fe(r,{vs:f,defines:{INDEX_TYPE:a,TYPE:c,RESULT_LEN:e.size.toString(),SOURCE_VALUES_ROWS:s.length.toString()},modules:[CM(n,a),Mg(s,e.type,l),MM(e.type),o],bindings:{source_values_texture:u},bufferLayout:[AM(n)],vertexCount:1,instanceCount:e.length,feedbackBufferMode:"interleaved",outputs:o.varyings});try{return d.run({inputBuffers:{ids:n.buffer},outputBuffers:{[o.varyings[0]]:t}}),{success:!0}}finally{d.destroy(),u.destroy()}};function CM(i,e){const t=we(i.type,1);let n="aids_0";return i.type!==IM(e)&&(n=`${e}(${n})`),{name:"ids",vs:`
in ${t} aids_0;
void get_ids(out INDEX_TYPE v[1]) {
  v[0] = ${n};
}
`}}function AM(i){return{name:"ids",stepMode:i.isConstant?"vertex":"instance",byteStride:i.stride,attributes:[{attribute:"aids_0",format:Tg(i.type,1,i.normalized),byteOffset:i.offset}]}}function MM(i){return{name:"gather",vs:`
void zero_result(out TYPE result[RESULT_LEN]) {
  for (int i = 0; i < RESULT_LEN; i++) {
    result[i] = ${Us(i)};
  }
}

void gather(in INDEX_TYPE ids[1], out TYPE result[RESULT_LEN]) {
  int sourceIndex = int(ids[0]);
  if (sourceIndex < 0 || sourceIndex >= SOURCE_VALUES_ROWS) {
    zero_result(result);
    return;
  }
  read_source_values(sourceIndex, result);
}
`}}function IM(i){switch(i){case"uint":return"uint32";case"int":return"sint32";default:return"float32"}}const RM=`void row_dot(in TYPE x[X_LEN], in TYPE y[Y_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(y[i]);
  }
  result[0] = sum;
}
`,OM=({inputs:i,output:e,target:t})=>(tt({module:{name:"row_dot",vs:RM},inputs:i,output:e,operationType:"float32",outputBuffer:t}),{success:!0}),BM=`void equalAll(in TYPE x[X_LEN], in TYPE y[Y_LEN], out uint result[1]) {
  uint allEqual = uint(1);
  for (int i = 0; i < X_LEN; i++) {
    if (x[i] != y[i]) {
      allEqual = uint(0);
      break;
    }
  }
  result[0] = allEqual;
}
`,kM=({inputs:i,output:e,target:t})=>(tt({module:{name:"equalAll",vs:BM},inputs:i,output:e,operationType:e.type==="uint32"?i.x.type:e.type,outputBuffer:t}),{success:!0}),DM=`void row_length(in TYPE x[X_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(x[i]);
  }
  result[0] = sqrt(sum);
}
`,FM=({inputs:i,output:e,target:t})=>(tt({module:{name:"row_length",vs:DM},inputs:i,output:e,operationType:"float32",outputBuffer:t}),{success:!0}),zM=async({inputs:i,output:e,target:t})=>{const{segments:n}=i,s=t.device,r=Gs("result",e.type,e.size),o=n.type,a=Ig(n,o,s),c=new Fe(s,{vs:`#version 300 es

void main() {
  TYPE result[RESULT_LEN];
  segmentedMap(result);
  set_result(result);
}
`,defines:{TYPE:"uint",RESULT_LEN:e.size.toString(),SEGMENTS_LENGTH:n.length.toString()},modules:[Mg(n,e.type,o),NM(),r],bindings:{source_values_texture:a},vertexCount:1,instanceCount:e.length,feedbackBufferMode:"interleaved",outputs:r.varyings});try{return c.run({outputBuffers:{[r.varyings[0]]:t}}),{success:!0}}finally{c.destroy(),a.destroy()}};function NM(){return{name:"segmentedMap",vs:`
uint read_segment_start(int segmentIndex) {
  TYPE value[1];
  read_source_values(segmentIndex, value);
  return uint(value[0]);
}

void segmentedMap(out TYPE result[RESULT_LEN]) {
  uint vertexIndex = uint(gl_InstanceID);
  int low = 0;
  int high = SEGMENTS_LENGTH;

  while (low < high) {
    int mid = low + (high - low) / 2;
    uint midStart = read_segment_start(mid);
    if (midStart <= vertexIndex) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  uint segmentIndex = uint(max(low - 1, 0));
  uint segmentStart = read_segment_start(int(segmentIndex));
  result[0] = segmentIndex;
  result[1] = vertexIndex - segmentStart;
}
`}}const $M=async({inputs:i,output:e,target:t})=>{const n=we(e.type,1,e.normalized),s=Us(n);return tt({module:{name:"select",vs:""},inputs:i,output:e,operationType:e.type,outputBuffer:t,expression:r=>{const o=Qr("condition",i.condition,r,s),a=Qr("whenTrue",i.whenTrue,r,s),c=Qr("whenFalse",i.whenFalse,r,s);return`(${o} != ${s} ? ${a} : ${c})`}}),{success:!0}};function Qr(i,e,t,n){return t<e.size?`${i}[${t}]`:e.size===1?`${i}[0]`:n}const UM=({inputs:i,output:e,target:t})=>{const n=Gs("result",e.type,e.size),s=new Fe(t.device,{vs:`#version 300 es

void main() {
  int result[1];
  result[0] = START + gl_InstanceID * STEP;
  set_result(result);
}
`,defines:{START:i.start.toString(),STEP:i.step.toString()},modules:[n],vertexCount:1,instanceCount:e.length,feedbackBufferMode:"interleaved",outputs:n.varyings});try{return s.run({outputBuffers:{[n.varyings[0]]:t}}),{success:!0}}finally{s.destroy()}},GM=({inputs:i,output:e,target:t})=>{const{columns:n}=i;return tt({module:{name:"swizzle",vs:"// swizzle expression handled inline"},expression:s=>`x[${n[s]}]`,inputs:{x:i.x},output:e,outputBuffer:t}),{success:!0}},VM=Object.freeze(Object.defineProperty({__proto__:null,arithmetic:Ag,dot:OM,equalAll:kM,extent:vM,fround:TM,gather:LM,interleave:wM,length:FM,segmentedMap:zM,select:$M,sequence:UM,swizzle:GM},Symbol.toStringTag,{value:"Module"}));export{HM as M,yg as P,pg as S,Eg as T,Sg as a};

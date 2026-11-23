
(()=>{
'use strict';
const KEYS={kanto:'pokesenda_beta1_save_v1',johto:'pokesenda_johto_dev_isolated_v1',hoenn:'pokesenda_hoenn_isolated_v1',global:'pokesenda_global_infinite_v1'};
const BACKUPS={kanto:'pokesenda_beta1_backups_v1',johto:'pokesenda_johto_backups_v1',hoenn:'pokesenda_hoenn_backups_v1'};
const BEFORE={johto:'pokesenda_johto_before_cloud_v1',hoenn:'pokesenda_hoenn_before_cloud_v1'};
const EMERGENCY={kanto:'pokesenda_guard_lastgood_kanto',johto:'pokesenda_guard_lastgood_johto',hoenn:'pokesenda_guard_lastgood_hoenn',global:'pokesenda_guard_lastgood_global'};
const REGION_NAMES={kanto:'🌿 Kanto',johto:'🍂 Johto',hoenn:'🌊 Hoenn',global:'♾️ Expedición Infinita Global'};
const CLOUD_PACK='__pokesendaCloudRegions';
const $=id=>document.getElementById(id);
let active='kanto',candidates={kanto:[],johto:[],hoenn:[],global:[]},candidateMap=new Map(),serial=0,cloudState='pending';
const safeParse=raw=>{try{const x=typeof raw==='string'?JSON.parse(raw):raw;return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(_){return null}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uniq=a=>Array.isArray(a)?new Set(a.map(v=>String(v))).size:0;
function valid(region,o){if(!o||typeof o!=='object'||Array.isArray(o))return false;if(region==='kanto'||region==='hoenn')return o.releaseId==='beta1'&&o.routes&&typeof o.routes==='object';if(region==='johto')return !!(o.routes&&typeof o.routes==='object'&&o.pokemon&&typeof o.pokemon==='object'&&Array.isArray(o.formation));if(region==='global')return true;return false;}
function metrics(o){
  const badges=Array.isArray(o?.gyms?.badges)?uniq(o.gyms.badges):uniq(o?.badges);
  const dex=Array.isArray(o?.dexOwnedHistory)?uniq(o.dexOwnedHistory):Array.isArray(o?.dex)?uniq(o.dex):uniq(o?.dexSeen);
  const routes=Object.values(o?.routes||{}).reduce((n,r)=>n+Math.max(0,Number(r?.completions||0)),0);
  const shiny=uniq(o?.shinyDex);const ar=o?.achievements||{};const ach=uniq(ar.claimedRewards)+uniq(ar.claimedMilestones)+Object.values(ar.unlocked||{}).filter(Boolean).length;
  const best=Math.max(0,Math.floor(Number(o?.infiniteExpedition?.bestDistance||o?.bestDistance||0)));
  const vals=[];for(const bucket of [o?.progress,o?.pokemon])if(bucket&&typeof bucket==='object')for(const p of Object.values(bucket)){const lv=Number(p?.level||p?.lv||0);if(Number.isFinite(lv)&&lv>0)vals.push(lv)}
  vals.sort((a,b)=>b-a);const maxLevel=Math.max(0,...vals),topLevels=vals.slice(0,6);
  const owned=Array.isArray(o?.owned)?o.owned.length:(o?.pokemon&&typeof o.pokemon==='object'?Object.keys(o.pokemon).length:0);
  const money=Math.max(0,Math.floor(Number(o?.pokedollars??o?.money??0)));
  return {badges,dex,routes,shiny,ach,best,maxLevel,topLevels,owned,money};
}
function vector(m){return [m.badges,m.dex,m.routes,m.shiny,m.ach,m.best,m.owned,m.maxLevel]}
function compare(a,b){const av=vector(a.m),bv=vector(b.m);for(let i=0;i<av.length;i++){if(av[i]!==bv[i])return av[i]-bv[i]}return Number(a.at||0)-Number(b.at||0)}
function rawHash(raw){let h=2166136261;const str=String(raw);for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)+':'+str.length}
function add(region,raw,meta={}){
  const obj=safeParse(raw);if(!valid(region,obj))return null;const normalized=JSON.stringify(obj),finger=region+':'+rawHash(normalized);let c=candidateMap.get(finger);
  if(c){if(meta.source&&!c.sources.includes(meta.source))c.sources.push(meta.source);if(meta.at&&(!c.at||meta.at>c.at))c.at=meta.at;if(meta.cloud)c.cloud=meta.cloud;return c;}
  c={id:'rc'+(++serial),region,raw:normalized,obj,m:metrics(obj),sources:[meta.source||'Copia encontrada'],at:Number(meta.at||0),reason:meta.reason||'',current:!!meta.current,cloud:meta.cloud||null};candidateMap.set(finger,c);candidates[region].push(c);return c;
}
function collectLocal(){
  for(const region of Object.keys(KEYS)){try{const raw=localStorage.getItem(KEYS[region]);if(raw)add(region,raw,{source:'💻 Partida actual',current:true})}catch(_){}}
  for(const [region,key] of Object.entries(BACKUPS))try{const arr=safeParseArray(localStorage.getItem(key));for(const x of arr)if(x?.raw)add(region,x.raw,{source:'🕐 Respaldo local',at:Date.parse(x.createdAt)||0,reason:x.reason||''})}catch(_){}
  for(const [region,key] of Object.entries(BEFORE))try{const x=safeParse(localStorage.getItem(key));if(x?.data)add(region,JSON.stringify(x.data),{source:'☁️ Antes de Cloud',at:Number(x.at||0),reason:'Copia guardada justo antes de cargar Cloud'})}catch(_){}
  for(const [region,key] of Object.entries(EMERGENCY))try{const x=safeParse(localStorage.getItem(key));if(x?.raw)add(region,x.raw,{source:'🛡️ SaveGuard',at:Number(x.at||0),reason:x.reason||'Copia de emergencia'})}catch(_){}
}
function safeParseArray(raw){try{const a=JSON.parse(raw||'[]');return Array.isArray(a)?a:[]}catch(_){return []}}
async function collectIDB(){
  if(!globalThis.indexedDB)return;let db;try{db=await new Promise(resolve=>{const q=indexedDB.open('PokeSendaSafetyDB',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>resolve(null);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains('snapshots')){const st=d.createObjectStore('snapshots',{keyPath:'id',autoIncrement:true});st.createIndex('saveKey','saveKey');st.createIndex('at','at')}}})}catch(_){return}if(!db)return;
  let rows=[];try{rows=await new Promise(resolve=>{const tx=db.transaction('snapshots','readonly'),q=tx.objectStore('snapshots').getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>resolve([])})}catch(_){return}
  const reverse=Object.fromEntries(Object.entries(KEYS).map(([r,k])=>[k,r]));for(const x of rows){const region=reverse[x?.saveKey];if(region&&x?.raw)add(region,x.raw,{source:'🗄️ Historial seguro',at:Number(x.at||0),reason:x.reason||'Snapshot de seguridad'})}
}
async function collectCloud(){
  cloudState='pending';renderStatus();try{if(!window.PKCloud?.hasLink?.()){cloudState='unlinked';renderStatus();return}if(!navigator.onLine){cloudState='offline';renderStatus();return}const r=await window.PKCloud.recoveryRemote?.();if(!r?.data){cloudState='missing';renderStatus();return}const data=r.data,pack=data?.[CLOUD_PACK]||{};const k={...data};delete k[CLOUD_PACK];const meta={source:'☁️ Cloud actual',at:Date.parse(r.updatedAt)||0,cloud:{revision:r.revision,deviceName:r.deviceName,updatedAt:r.updatedAt}};add('kanto',JSON.stringify(k),meta);if(pack.johto)add('johto',JSON.stringify(pack.johto),meta);if(pack.hoenn)add('hoenn',JSON.stringify(pack.hoenn),meta);if(pack.globalInfinite)add('global',JSON.stringify(pack.globalInfinite),meta);cloudState='ok';render();renderStatus()}catch(e){cloudState='error';renderStatus(String(e?.message||e))}
}
function statusText(error=''){const total=Object.values(candidates).reduce((n,a)=>n+a.length,0);if(cloudState==='pending')return [`Buscando copias locales e historial seguro… ${total?total+' encontradas hasta ahora.':''}`,'loading'];if(cloudState==='ok')return [`✅ Búsqueda completa: ${total} copias únicas encontradas, incluida la versión Cloud disponible.`,'ok'];if(cloudState==='unlinked')return [`Búsqueda local completa: ${total} copias únicas. Este navegador no tiene un Cloud Save vinculado.`,'ok'];if(cloudState==='offline')return [`Búsqueda local completa: ${total} copias. Sin Internet no se pudo consultar Cloud; las copias locales sí están disponibles.`,'warn'];if(cloudState==='missing')return [`Búsqueda local completa: ${total} copias. El vínculo Cloud existe, pero no se encontró una partida remota utilizable.`,'warn'];if(cloudState==='error')return [`Se encontraron ${total} copias locales. Cloud no pudo consultarse${error?': '+error:''}.`,'warn'];return [`${total} copias encontradas.`,''];}
function renderStatus(error=''){const el=$('pkRecoveryStatus');if(!el)return;const [t,c]=statusText(error);el.className='pk-recovery-status '+c;el.textContent=t}
function recommendation(list){if(!list.length)return null;return [...list].sort(compare).at(-1)}
function dateText(c){if(c.current)return 'Estado guardado actualmente en este navegador';if(!c.at)return 'Fecha no disponible';try{return new Date(c.at).toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'})}catch(_){return 'Fecha no disponible'}}
function fmtMeters(n){n=Math.max(0,Number(n)||0);return n>=1000?(n/1000).toFixed(n%1000?1:0)+' km':Math.floor(n)+' m'}
function cardHtml(c,reco){const m=c.m,src=c.sources.map(x=>`<span class="pk-recovery-source ${x.includes('Cloud')?'cloud':''} ${c.current?'current':''}">${esc(x)}</span>`).join('');const cloud=c.cloud?` · Cloud rev. ${Number(c.cloud.revision||0)} · ${esc(c.cloud.deviceName||'dispositivo')}`:'';const lv=m.topLevels.length?` · Niveles altos: ${m.topLevels.slice(0,3).map(x=>'Nv.'+Math.floor(x)).join(', ')}`:'';return `<div class="pk-recovery-card ${c===reco?'recommended':''} ${c.current?'current':''}"><div><div class="pk-recovery-badges">${src}${c===reco?'<span class="pk-recovery-star">⭐ Mayor progreso detectado</span>':''}</div><div class="pk-recovery-title">${esc(REGION_NAMES[c.region])}</div><div class="pk-recovery-when">${esc(dateText(c))}${cloud}</div><div class="pk-recovery-metrics"><div class="pk-recovery-metric"><small>Medallas</small><b>${m.badges}</b></div><div class="pk-recovery-metric"><small>Pokédex</small><b>${m.dex}</b></div><div class="pk-recovery-metric"><small>Rutas</small><b>${m.routes}</b></div><div class="pk-recovery-metric"><small>Shiny</small><b>${m.shiny}</b></div><div class="pk-recovery-metric"><small>Logros</small><b>${m.ach}</b></div><div class="pk-recovery-metric"><small>Nivel máx.</small><b>${m.maxLevel||'—'}</b></div><div class="pk-recovery-metric"><small>Dinero</small><b>₽${m.money.toLocaleString('es-CL')}</b></div><div class="pk-recovery-metric"><small>Récord Infinita</small><b>${fmtMeters(m.best)}</b></div></div><div class="pk-recovery-extra">${c.reason?esc(c.reason):'Copia válida encontrada.'}${lv}</div></div><div class="pk-recovery-actions"><button class="btn ${c===reco?'primary':''}" type="button" data-pk-recovery-restore="${c.id}">${c.current?'Mantener esta partida':'Usar esta partida'}</button></div></div>`}
function render(){const list=candidates[active]||[],box=$('pkRecoveryList');if(!box)return;const reco=recommendation(list);$('pkRecoveryRegionTitle').textContent=REGION_NAMES[active];$('pkRecoveryCount').textContent=`${list.length} copia${list.length===1?'':'s'}`;if(!list.length){box.innerHTML='<div class="pk-recovery-empty">No encontré copias válidas de esta región en este navegador. Si tienes Cloud vinculado, espera a que termine la consulta de la nube.</div>';return}const sorted=[...list].sort((a,b)=>compare(b,a));box.innerHTML=sorted.map(c=>cardHtml(c,reco)).join('');box.querySelectorAll('[data-pk-recovery-restore]').forEach(b=>b.addEventListener('click',()=>restore(b.dataset.pkRecoveryRestore)))}
function backupCurrent(region){const key=KEYS[region],raw=localStorage.getItem(key);if(!raw)return;try{window.PokeSendaSaveGuard?.snapshotAll?.('Antes de restaurar desde Centro de Recuperación')}catch(_){}const bk=BACKUPS[region];if(!bk)return;try{const arr=safeParseArray(localStorage.getItem(bk));if(arr[0]?.raw===raw)return;const item={createdAt:new Date().toISOString(),reason:'Antes de restaurar desde Centro de Recuperación',gameVersion:'BETA 1.0 · Recovery Center',raw};localStorage.setItem(bk,JSON.stringify([item,...arr].slice(0,3)))}catch(_){}}
async function restore(id){
  const c=[...candidateMap.values()].find(x=>x.id===id);if(!c)return;
  if(window.PokeSendaSaveGuard?.isOwner&&!window.PokeSendaSaveGuard.isOwner()){
    const notice=window.PokeSendaGameAlert;if(typeof notice==='function')await notice({title:'Otra pestaña está usando PokéSenda',message:'Cierra la otra pestaña o toma el control antes de restaurar una partida.',confirmText:'Entendido',tone:'warning',symbol:'🛡️'});else window.alert('PokéSenda está abierto en otra pestaña activa. Cierra la otra pestaña o toma el control antes de restaurar una partida.');return;
  }
  if(c.current){try{window.toast?.('✅ Esta ya es la partida activa')}catch(_){}return}
  const m=c.m,summary=`Fuente: ${c.sources.join(' + ')}\nFecha: ${dateText(c)}\nMedallas: ${m.badges} · Pokédex: ${m.dex} · Rutas: ${m.routes} · Shiny: ${m.shiny}\nNivel máximo detectado: ${m.maxLevel||'—'} · Dinero: ₽${m.money.toLocaleString('es-CL')}\n\nSolo se reemplazará esta región. Antes se guardará otra copia de tu estado actual.`;
  let ok=false;const cf=window.PokeSendaGameConfirm;if(typeof cf==='function')ok=await cf({title:'Restaurar '+REGION_NAMES[c.region],message:summary,confirmText:'Usar esta partida',cancelText:'Cancelar',tone:'danger',symbol:'🛟'});else ok=window.confirm(summary+'\n\n¿Usar esta partida?');if(!ok)return;
  try{backupCurrent(c.region);const write=()=>localStorage.setItem(KEYS[c.region],c.raw);if(window.PokeSendaSaveGuard?.withBypass)window.PokeSendaSaveGuard.withBypass(write);else write();sessionStorage.setItem('pokesenda_recovery_restored_v1',JSON.stringify({region:c.region,source:c.sources.join(' + ')}));location.reload()}
  catch(e){const notice=window.PokeSendaGameAlert;if(typeof notice==='function')await notice({title:'No se pudo restaurar',message:'PokéSenda mantuvo el estado actual.',confirmText:'Cerrar',tone:'danger',symbol:'⚠️'});else window.alert('No se pudo restaurar esta copia. PokéSenda mantuvo el estado actual.')}
}
function exportEmergency(){if(window.PokeSendaSaveGuard?.exportBundle){window.PokeSendaSaveGuard.exportBundle();return}try{const out={format:'PokeSendaEmergencyBundle',version:1,createdAt:new Date().toISOString(),saves:Object.fromEntries(Object.values(KEYS).map(k=>[k,localStorage.getItem(k)])),cloudLink:localStorage.getItem('pokesenda_beta1_cloud_link_v1')};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PokeSenda_respaldo_emergencia_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(_){}}
async function scan(){candidates={kanto:[],johto:[],hoenn:[],global:[]};candidateMap=new Map();serial=0;cloudState='pending';collectLocal();render();renderStatus();await collectIDB();render();await collectCloud()}
function currentRegion(){
  try{if(window.PokeSendaRegionBoot?.isHoennClone||window.PokeSendaRegionBoot?.region==='hoenn')return 'hoenn'}catch(_){}
  const jr=document.getElementById('pkRegionRuntimeRoot');
  if(jr&&!jr.classList.contains('hidden'))return 'johto';
  return 'kanto';
}
function recoveryRegionFromTrigger(trigger){
  if(!trigger)return currentRegion();
  const explicit=String(trigger.getAttribute?.('data-pk-recovery-open-region')||'').toLowerCase();
  if(['kanto','johto','hoenn','global'].includes(explicit))return explicit;
  if(trigger.closest?.('#pkRegionRuntimeRoot'))return 'johto';
  if(trigger.closest?.('#pkGlobalInfiniteRoot'))return 'global';
  try{if(window.PokeSendaRegionBoot?.isHoennClone||window.PokeSendaRegionBoot?.region==='hoenn')return 'hoenn'}catch(_){}
  return 'kanto';
}
function open(regionOverride){
  const wanted=['kanto','johto','hoenn','global'].includes(String(regionOverride||'').toLowerCase())?String(regionOverride).toLowerCase():currentRegion();
  /* El Centro de Recuperación es global y vive en <body>. Los runtimes regionales
     (especialmente Johto) usan un z-index muy alto, por lo que una overlay global
     normal podía abrirse correctamente pero quedar detrás de toda la región. */
  document.querySelectorAll('#optionsOverlay').forEach(el=>el.classList.add('hidden'));
  document.querySelectorAll('#pkMobileMore').forEach(el=>el.classList.remove('show'));
  const overlay=$('pkRecoveryOverlay');
  if(overlay){
    overlay.dataset.pkRecoveryOrigin=wanted;
    overlay.style.setProperty('z-index','490000','important');
    overlay.classList.remove('hidden');
  }
  active=wanted;
  document.querySelectorAll('[data-pk-recovery-region]').forEach(x=>x.classList.toggle('active',x.dataset.pkRecoveryRegion===active));
  scan();
}
function close(){const overlay=$('pkRecoveryOverlay');if(overlay){overlay.classList.add('hidden');delete overlay.dataset.pkRecoveryOrigin;}}
function bind(){
  /* Delegación global: Johto recrea Opciones dentro de su runtime. Un listener directo
     quedaba ligado al botón original de Kanto y el botón visible de Johto no hacía nada. */
  if(!document.documentElement.dataset.pkRecoveryDelegated){
    document.documentElement.dataset.pkRecoveryDelegated='1';
    document.addEventListener('click',e=>{
      const trigger=e.target?.closest?.('#menuRecoveryBtn,#optionsRecoveryBtn,[data-mobile-more="recovery"]');
      if(!trigger)return;
      e.preventDefault();e.stopPropagation();
      open(recoveryRegionFromTrigger(trigger));
    },true);
  }
  $('pkRecoveryClose')?.addEventListener('click',close);$('pkRecoveryOverlay')?.addEventListener('click',e=>{if(e.target===$('pkRecoveryOverlay'))close()});$('pkRecoveryRefresh')?.addEventListener('click',scan);$('pkRecoveryExport')?.addEventListener('click',exportEmergency);
  document.querySelectorAll('[data-pk-recovery-region]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.pkRecoveryRegion;document.querySelectorAll('[data-pk-recovery-region]').forEach(x=>x.classList.toggle('active',x===b));render()}));
  try{const x=JSON.parse(sessionStorage.getItem('pokesenda_recovery_restored_v1')||'null');if(x){sessionStorage.removeItem('pokesenda_recovery_restored_v1');setTimeout(()=>{try{window.toast?.(`🛟 ${REGION_NAMES[x.region]||'Partida'} restaurada correctamente`)}catch(_){}},1000)}}catch(_){}
}
window.PokeSendaRecovery={open,scan};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

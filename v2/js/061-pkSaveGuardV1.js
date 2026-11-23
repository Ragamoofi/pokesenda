
(()=>{
  'use strict';
  const GAME_KEYS=['pokesenda_beta1_save_v1','pokesenda_johto_dev_isolated_v1','pokesenda_hoenn_isolated_v1','pokesenda_global_infinite_v1'];
  const GAME_SET=new Set(GAME_KEYS);
  const LOCK_KEY='pokesenda_single_tab_lock_v1';
  const TAB_ID=(globalThis.crypto?.randomUUID?.()||('tab-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)));
  const LOCK_TTL=90000, HEARTBEAT=8000;
  const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem,nativeRemove=Storage.prototype.removeItem;
  const blocked=new Map(),lastEmergencyAt=new Map();
  let owner=false,overlayReason='',dbPromise=null;

  const safeParse=raw=>{try{const x=JSON.parse(raw);return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(_){return null}};
  const readRaw=k=>{try{return nativeGet.call(localStorage,k)}catch(_){return null}};
  const rawSet=(k,v)=>nativeSet.call(localStorage,k,v);
  const rawRemove=k=>nativeRemove.call(localStorage,k);
  const emergencyKey=k=>'pokesenda_guard_lastgood_'+({
    'pokesenda_beta1_save_v1':'kanto','pokesenda_johto_dev_isolated_v1':'johto','pokesenda_hoenn_isolated_v1':'hoenn','pokesenda_global_infinite_v1':'global'
  }[k]||'save');

  function regionVector(s){
    /* SaveGuard V2: compara sólo progreso regional verdaderamente monótono.
       Los contadores internos de Logros y los campos históricos de Infinita pueden
       reducirse legítimamente cuando una actualización retira/reorganiza contenido;
       usarlos aquí provocaba falsos positivos de rollback. */
    if(!s||typeof s!=='object')return [0,0,0,0];
    const uniqueCount=a=>Array.isArray(a)?new Set(a.map(v=>String(v))).size:0;
    const badges=Array.isArray(s?.gyms?.badges)?uniqueCount(s.gyms.badges):uniqueCount(s?.badges);
    const dex=Array.isArray(s?.dexOwnedHistory)?uniqueCount(s.dexOwnedHistory):Array.isArray(s?.dex)?uniqueCount(s.dex):uniqueCount(s?.dexSeen);
    const routes=Object.values(s?.routes||{}).reduce((n,r)=>n+Math.max(0,Number(r?.completions||0)),0);
    const shiny=uniqueCount(s?.shinyDex);
    return [badges,dex,routes,shiny];
  }
  function infiniteVector(s){return [Math.max(0,Math.floor(Number(s?.bestDistance||0)))];}
  function bundleVectors(data){
    const p=data?.__pokesendaCloudRegions||{};
    return {k:regionVector(data),j:regionVector(p.johto),h:regionVector(p.hoenn),g:infiniteVector(p.globalInfinite)};
  }
  function isRegression(candidate,reference){
    if(!candidate||!reference)return false;
    const c=bundleVectors(candidate),r=bundleVectors(reference);
    for(const key of ['k','j','h','g'])for(let i=0;i<r[key].length;i++)if(Number(c[key][i]||0)<Number(r[key][i]||0))return true;
    return false;
  }
  function isValidForKey(key,obj){
    if(!obj||typeof obj!=='object'||Array.isArray(obj))return false;
    if(key==='pokesenda_beta1_save_v1'||key==='pokesenda_hoenn_isolated_v1')return obj.releaseId==='beta1'&&obj.routes&&typeof obj.routes==='object';
    if(key==='pokesenda_johto_dev_isolated_v1')return obj.routes&&typeof obj.routes==='object'&&obj.pokemon&&typeof obj.pokemon==='object'&&Array.isArray(obj.formation);
    if(key==='pokesenda_global_infinite_v1')return true;
    return true;
  }
  function localRegression(key,nextObj,prevObj){
    if(!prevObj||!nextObj)return false;
    if(key==='pokesenda_global_infinite_v1')return Number(nextObj.bestDistance||0)<Number(prevObj.bestDistance||0);
    const a=regionVector(nextObj),b=regionVector(prevObj);return a.some((v,i)=>Number(v||0)<Number(b[i]||0));
  }

  function readLock(){try{return safeParse(nativeGet.call(localStorage,LOCK_KEY)||'')}catch(_){return null}}
  function lockFresh(l){return !!(l?.tabId&&Date.now()-Number(l.at||0)<LOCK_TTL)}
  function writeLock(force=false){
    const l=readLock();
    if(!force&&lockFresh(l)&&l.tabId!==TAB_ID){owner=false;showTabOverlay();return false;}
    try{
      rawSet(LOCK_KEY,JSON.stringify({tabId:TAB_ID,at:Date.now(),url:location.pathname||'',title:document.title||'PokéSenda'}));
      const check=readLock();owner=!!(check?.tabId===TAB_ID);
      if(owner){hideTabOverlay();return true;}showTabOverlay();return false;
    }catch(_){owner=true;return true;}
  }
  function heartbeat(){if(!owner)return;const l=readLock();if(l?.tabId&&l.tabId!==TAB_ID&&lockFresh(l)){owner=false;showTabOverlay();return;}try{rawSet(LOCK_KEY,JSON.stringify({tabId:TAB_ID,at:Date.now(),url:location.pathname||'',title:document.title||'PokéSenda'}))}catch(_){}}

  function ensureStyle(){
    if(document.getElementById('pkSaveGuardStyle'))return;
    const st=document.createElement('style');st.id='pkSaveGuardStyle';st.textContent=`
    .pk-saveguard-overlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(2,8,16,.88);backdrop-filter:blur(7px)}
    .pk-saveguard-overlay.hidden{display:none!important}.pk-saveguard-card{width:min(620px,94vw);border:2px solid #d6ad45;border-radius:17px;background:linear-gradient(180deg,#17283b,#0b1724);box-shadow:0 30px 100px #000d;padding:20px;color:#eef6ff}.pk-saveguard-card h2{margin:0 0 9px;font-size:18px}.pk-saveguard-card p{font-size:11px;line-height:1.65;color:#c9d6e4}.pk-saveguard-card b{color:#fff}.pk-saveguard-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.pk-saveguard-actions button{flex:1;min-width:170px}.pk-saveguard-note{margin-top:9px;color:#91a4b6;font-size:8px;line-height:1.5}
    @media(max-width:600px){.pk-saveguard-card{padding:15px}.pk-saveguard-actions{display:grid;grid-template-columns:1fr}.pk-saveguard-actions button{min-width:0}}
    `;document.head.appendChild(st);
  }
  function getOverlay(){
    let ov=document.getElementById('pkSaveGuardOverlay');if(ov)return ov;ensureStyle();
    ov=document.createElement('div');ov.id='pkSaveGuardOverlay';ov.className='pk-saveguard-overlay hidden';ov.innerHTML=`<div class="pk-saveguard-card"><h2 id="pkSaveGuardTitle">🛡️ Protección de partida</h2><p id="pkSaveGuardText"></p><div class="pk-saveguard-actions"><button class="btn primary" id="pkSaveGuardTake" type="button">Usar esta pestaña</button><button class="btn primary" id="pkSaveGuardRecover" type="button" style="display:none">↩ Volver a copia protegida</button><button class="btn" id="pkSaveGuardExport" type="button">Descargar respaldo</button></div><div class="pk-saveguard-note" id="pkSaveGuardNote">PokéSenda protege la partida para evitar que una pestaña antigua o un guardado incompleto reemplace progreso más nuevo.</div></div>`;document.body.appendChild(ov);
    ov.querySelector('#pkSaveGuardTake').onclick=()=>{writeLock(true);location.reload()};
    ov.querySelector('#pkSaveGuardRecover').onclick=()=>returnToProtectedSave(ov.dataset.saveKey||'');
    ov.querySelector('#pkSaveGuardExport').onclick=()=>{exportBundle();const b=ov.querySelector('#pkSaveGuardExport');b.textContent='✅ Respaldo descargado';setTimeout(()=>{if(b)b.textContent='Descargar otro respaldo'},1600)};
    return ov;
  }
  async function returnToProtectedSave(key){
    key=String(key||'');if(!GAME_SET.has(key))return;
    const ov=getOverlay(),btn=ov.querySelector('#pkSaveGuardRecover');if(btn){btn.disabled=true;btn.textContent='🛡️ Recuperando…'}
    try{
      const current=readRaw(key),currentObj=safeParse(current||'');
      if(current&&isValidForKey(key,currentObj)){
        blocked.delete(key);try{sessionStorage.setItem('pokesenda_saveguard_returned','1')}catch(_){}location.reload();return;
      }
      const local=emergencyCandidates(key).find(c=>c?.raw&&isValidForKey(key,safeParse(c.raw)));
      let raw=local?.raw||null;
      if(!raw){const idb=await recoverFromIDB(key);if(idb?.raw&&isValidForKey(key,safeParse(idb.raw)))raw=idb.raw;}
      if(!raw)throw new Error('No se encontró una copia segura válida en este navegador.');
      withBypass(()=>rawSet(key,raw));blocked.delete(key);queueSnapshot(key,raw,'SaveGuard · recuperación manual');
      try{sessionStorage.setItem('pokesenda_saveguard_returned','1')}catch(_){}location.reload();
    }catch(e){
      if(btn){btn.disabled=false;btn.textContent='↩ Volver a copia protegida'}
      ov.querySelector('#pkSaveGuardText').innerHTML=`No pude restaurar automáticamente la copia protegida.<br><br><b>${String(e?.message||e||'Error de recuperación')}</b><br><br>Tu respaldo descargado sigue siendo válido. Puedes usar el Centro de Recuperación desde una recarga limpia.`;
    }
  }
  function showTabOverlay(){overlayReason='tab';const go=()=>{const ov=getOverlay();ov.classList.remove('hidden');delete ov.dataset.saveKey;ov.querySelector('#pkSaveGuardTitle').textContent='🛡️ PokéSenda ya está abierto';ov.querySelector('#pkSaveGuardText').innerHTML='Hay <b>otra pestaña activa</b> de PokéSenda. Esta pestaña queda en modo seguro y <b>no puede sobrescribir tu partida</b>.<br><br>Cierra la otra pestaña o pulsa <b>Usar esta pestaña</b> para tomar el control.';ov.querySelector('#pkSaveGuardTake').style.display='';ov.querySelector('#pkSaveGuardRecover').style.display='none';};document.body?go():document.addEventListener('DOMContentLoaded',go,{once:true})}
  function showFailure(key,msg){overlayReason='save';const go=()=>{const ov=getOverlay();ov.dataset.saveKey=String(key||'');ov.classList.remove('hidden');ov.querySelector('#pkSaveGuardTitle').textContent='⚠️ Guardado protegido';ov.querySelector('#pkSaveGuardText').innerHTML=`PokéSenda bloqueó una escritura que parecía reducir progreso.<br><br><b>${String(msg||'No se pudo guardar de forma segura.')}</b><br><br>El save anterior sigue protegido. Puedes descargar un respaldo y luego pulsar <b>Volver a copia protegida</b> para recargar la última copia válida sin quedarte atrapado en esta pantalla.`;ov.querySelector('#pkSaveGuardTake').style.display='none';const r=ov.querySelector('#pkSaveGuardRecover');r.style.display='';r.disabled=false;r.textContent='↩ Volver a copia protegida';};document.body?go():document.addEventListener('DOMContentLoaded',go,{once:true})}
  function hideTabOverlay(){if(overlayReason!=='tab')return;const ov=document.getElementById('pkSaveGuardOverlay');ov?.classList.add('hidden');overlayReason=''}

  function cleanupForQuota(){
    // Primero elimina sólo cachés reconstruibles.
    for(const k of ['pokesenda_tm_compat_rb_v36407','pokesenda_johto_tm_compat_gs_v1'])try{rawRemove(k)}catch(_){}
    // Los respaldos históricos completos pueden ocupar varios MB en móviles. Si el
    // navegador rechaza un guardado, conserva el respaldo local más reciente y
    // manda los antiguos a IndexedDB antes de liberar espacio.
    const backupMap={
      pokesenda_beta1_backups_v1:'pokesenda_beta1_save_v1',
      pokesenda_johto_backups_v1:'pokesenda_johto_dev_isolated_v1',
      pokesenda_hoenn_backups_v1:'pokesenda_hoenn_isolated_v1'
    };
    for(const [bk,saveKey] of Object.entries(backupMap))try{
      const arr=JSON.parse(readRaw(bk)||'[]');if(!Array.isArray(arr)||arr.length<=1)continue;
      const sorted=[...arr].sort((a,b)=>(Date.parse(b?.createdAt)||0)-(Date.parse(a?.createdAt)||0));
      for(const x of sorted.slice(1))if(x?.raw)queueSnapshot(saveKey,x.raw,'Respaldo local archivado por falta de espacio');
      rawSet(bk,JSON.stringify(sorted.slice(0,1)));
    }catch(_){}
  }
  function writeEmergency(key,raw,reason='Guardado anterior'){
    if(!raw||!isValidForKey(key,safeParse(raw)))return false;
    const now=Date.now(),last=Number(lastEmergencyAt.get(key)||0);if(now-last<15000&&reason!=='rollback')return false;
    try{rawSet(emergencyKey(key),JSON.stringify({at:now,reason,raw}));lastEmergencyAt.set(key,now);queueSnapshot(key,raw,reason);return true}catch(_){queueSnapshot(key,raw,reason);return false}
  }
  function emergencyCandidates(key){
    const out=[];
    try{const e=safeParse(readRaw(emergencyKey(key)));if(e?.raw)out.push({at:Number(e.at||0),raw:e.raw,source:'SaveGuard'})}catch(_){}
    const backupKey={
      'pokesenda_beta1_save_v1':'pokesenda_beta1_backups_v1','pokesenda_hoenn_isolated_v1':'pokesenda_hoenn_backups_v1','pokesenda_johto_dev_isolated_v1':'pokesenda_johto_backups_v1'
    }[key];
    if(backupKey)try{const a=JSON.parse(readRaw(backupKey)||'[]');if(Array.isArray(a))for(const x of a)if(x?.raw)out.push({at:Date.parse(x.createdAt)||0,raw:x.raw,source:'Respaldo local'})}catch(_){}
    const beforeKey={pokesenda_johto_dev_isolated_v1:'pokesenda_johto_before_cloud_v1',pokesenda_hoenn_isolated_v1:'pokesenda_hoenn_before_cloud_v1'}[key];
    if(beforeKey)try{const x=safeParse(readRaw(beforeKey));if(x?.data)out.push({at:Number(x.at||0),raw:JSON.stringify(x.data),source:'Antes de Cloud'})}catch(_){}
    return out.sort((a,b)=>b.at-a.at);
  }
  function getRecoveryObject(key){for(const c of emergencyCandidates(key)){const o=safeParse(c.raw);if(isValidForKey(key,o))return o}return null}
  function flagLoadFailure(key,reason='Guardado local inválido'){
    blocked.set(key,String(reason));showFailure(key,reason);recoverFromIDB(key).then(x=>{if(!x?.raw||!isValidForKey(key,safeParse(x.raw)))return;try{withBypass(()=>rawSet(key,x.raw));blocked.delete(key);sessionStorage.setItem('pokesenda_saveguard_recovered','1');setTimeout(()=>location.reload(),120)}catch(_){}});
  }

  let bypassDepth=0;
  function withBypass(fn){bypassDepth++;try{return fn()}finally{bypassDepth=Math.max(0,bypassDepth-1)}}
  function guardedSetItem(k,v){
    k=String(k);if(this!==localStorage||!GAME_SET.has(k)||bypassDepth>0)return nativeSet.call(this,k,v);
    if(!owner){showTabOverlay();return;}
    if(blocked.has(k)){showFailure(k,blocked.get(k));return;}
    const nextRaw=String(v),nextObj=safeParse(nextRaw),prevRaw=readRaw(k),prevObj=safeParse(prevRaw||'');
    if(!isValidForKey(k,nextObj)){if(prevRaw&&isValidForKey(k,prevObj)){writeEmergency(k,prevRaw,'Guardado previo válido');blocked.set(k,'Se intentó escribir un save incompleto o inválido.');showFailure(k,blocked.get(k));return;}}
    if(prevObj&&nextObj&&isValidForKey(k,prevObj)&&isValidForKey(k,nextObj)&&localRegression(k,nextObj,prevObj)){
      writeEmergency(k,prevRaw,'rollback');blocked.set(k,'Se detectó una regresión de progreso desde esta pestaña y se bloqueó antes de sobrescribir el save.');showFailure(k,blocked.get(k));return;
    }
    if(prevRaw&&prevRaw!==nextRaw)writeEmergency(k,prevRaw,'Guardado anterior');
    try{const out=nativeSet.call(this,k,nextRaw);queueSnapshot(k,nextRaw,'Guardado válido');return out}catch(e){
      cleanupForQuota();try{const out=nativeSet.call(this,k,nextRaw);queueSnapshot(k,nextRaw,'Guardado válido tras liberar caché');return out}catch(e2){blocked.set(k,'El navegador rechazó el guardado local (posible falta de espacio).');showFailure(k,blocked.get(k));return;}
    }
  }
  function guardedRemoveItem(k){k=String(k);if(this!==localStorage||!GAME_SET.has(k)||bypassDepth>0)return nativeRemove.call(this,k);if(!owner){showTabOverlay();return;}const prev=readRaw(k);if(prev)writeEmergency(k,prev,'Antes de borrar progreso');return nativeRemove.call(this,k)}

  /* Restauración explícita confirmada por el jugador.
     A diferencia de un guardado automático, una importación/recuperación puede ser
     intencionalmente regresiva. Se valida todo antes, se respalda el estado actual,
     se escribe como una sola operación lógica y, si una región falla, se revierte
     todo lo que ya se hubiese escrito. */
  function restoreConfirmed(entries,reason='Restauración confirmada por el jugador'){
    if(!owner){showTabOverlay();return {ok:false,error:'Hay otra pestaña activa de PokéSenda.'};}
    const list=(Array.isArray(entries)?entries:[]).map(x=>Array.isArray(x)?{key:String(x[0]||''),raw:String(x[1]??'')}:{key:String(x?.key||''),raw:String(x?.raw??'')}).filter(x=>GAME_SET.has(x.key)&&x.raw);
    if(!list.length)return {ok:false,error:'No hay partidas válidas para restaurar.'};
    const seen=new Set();
    for(const x of list){
      if(seen.has(x.key))return {ok:false,error:'El paquete contiene una región duplicada.'};seen.add(x.key);
      const obj=safeParse(x.raw);if(!isValidForKey(x.key,obj))return {ok:false,error:'Una de las partidas del archivo no es válida para su región.'};
    }
    const previous=new Map(list.map(x=>[x.key,readRaw(x.key)]));
    for(const [key,raw] of previous)if(raw&&isValidForKey(key,safeParse(raw)))writeEmergency(key,raw,reason);
    try{
      withBypass(()=>{for(const x of list)rawSet(x.key,x.raw)});
      for(const x of list)if(readRaw(x.key)!==x.raw)throw new Error('La escritura no pudo verificarse para '+x.key);
      for(const x of list){blocked.delete(x.key);queueSnapshot(x.key,x.raw,reason+' · restaurado');}
      return {ok:true,keys:list.map(x=>x.key)};
    }catch(e){
      let rollbackOk=true;
      try{withBypass(()=>{for(const x of list){const prev=previous.get(x.key);if(prev==null)rawRemove(x.key);else rawSet(x.key,prev);}})}catch(_){rollbackOk=false;}
      for(const x of list){const prev=previous.get(x.key);const now=readRaw(x.key);if((prev==null&&now!=null)||(prev!=null&&now!==prev))rollbackOk=false;}
      return {ok:false,error:String(e?.message||e||'No se pudo restaurar la partida.'),rolledBack:rollbackOk};
    }
  }
  Storage.prototype.setItem=guardedSetItem;Storage.prototype.removeItem=guardedRemoveItem;

  function openDB(){
    if(dbPromise)return dbPromise;dbPromise=new Promise(resolve=>{if(!globalThis.indexedDB)return resolve(null);let req;try{req=indexedDB.open('PokeSendaSafetyDB',1)}catch(_){return resolve(null)}req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('snapshots')){const s=db.createObjectStore('snapshots',{keyPath:'id',autoIncrement:true});s.createIndex('saveKey','saveKey');s.createIndex('at','at')}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null)});return dbPromise;
  }
  async function queueSnapshot(key,raw,reason='Guardado'){
    if(!raw||!GAME_SET.has(key))return;const db=await openDB();if(!db)return;
    try{const tx=db.transaction('snapshots','readwrite'),s=tx.objectStore('snapshots');s.add({saveKey:key,at:Date.now(),reason,raw});const idx=s.index('saveKey'),req=idx.getAll(IDBKeyRange.only(key));req.onsuccess=()=>{const rows=(req.result||[]).sort((a,b)=>b.at-a.at);for(const row of rows.slice(8))try{s.delete(row.id)}catch(_){}}}catch(_){}
  }
  async function recoverFromIDB(key){const db=await openDB();if(!db)return null;return await new Promise(resolve=>{try{const tx=db.transaction('snapshots','readonly'),req=tx.objectStore('snapshots').index('saveKey').getAll(IDBKeyRange.only(key));req.onsuccess=()=>{const rows=(req.result||[]).sort((a,b)=>b.at-a.at);resolve(rows.find(r=>isValidForKey(key,safeParse(r.raw)))||null)};req.onerror=()=>resolve(null)}catch(_){resolve(null)}})}
  async function prime(){for(const k of GAME_KEYS){const raw=readRaw(k),obj=safeParse(raw||'');if(raw&&isValidForKey(k,obj))queueSnapshot(k,raw,'Inicio de sesión')}}

  function exportBundle(){
    try{const data={format:'PokeSendaEmergencyBundle',version:1,createdAt:new Date().toISOString(),saves:Object.fromEntries(GAME_KEYS.map(k=>[k,readRaw(k)])),cloudLink:readRaw('pokesenda_beta1_cloud_link_v1')};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PokeSenda_respaldo_emergencia_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(_){}
  }
  async function report(){
    let est=null;try{est=await navigator.storage?.estimate?.()}catch(_){}
    return {tabId:TAB_ID,owner,lock:readLock(),blocked:Object.fromEntries(blocked),storage:est,saves:Object.fromEntries(GAME_KEYS.map(k=>{const r=readRaw(k),o=safeParse(r||'');return [k,{present:!!r,valid:isValidForKey(k,o),bytes:r?new Blob([r]).size:0,vector:regionVector(o)}]}))};
  }

  writeLock(false);setInterval(heartbeat,HEARTBEAT);
  window.addEventListener('storage',e=>{if(e.key!==LOCK_KEY)return;const l=readLock();if(lockFresh(l)&&l.tabId!==TAB_ID){owner=false;showTabOverlay()}else if(!lockFresh(l))writeLock(false)});
  window.addEventListener('pagehide',e=>{if(e.persisted||!owner)return;const l=readLock();if(l?.tabId===TAB_ID)try{rawRemove(LOCK_KEY)}catch(_){}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){const l=readLock();if(lockFresh(l)&&l.tabId!==TAB_ID){owner=false;showTabOverlay()}else writeLock(false)}});
  setTimeout(prime,0);
  window.PokeSendaSaveGuard={tabId:TAB_ID,isOwner:()=>owner,withBypass,restoreConfirmed,isRegressionBundle:isRegression,getRecoveryObject,flagLoadFailure,snapshotAll:(reason='Respaldo de seguridad')=>{for(const k of GAME_KEYS){const r=readRaw(k);if(r)writeEmergency(k,r,reason)}},exportBundle,report,recoverFromIDB};
  try{if(sessionStorage.getItem('pokesenda_saveguard_recovered')){sessionStorage.removeItem('pokesenda_saveguard_recovered');setTimeout(()=>{try{window.toast?.('🛡️ PokéSenda recuperó una copia de seguridad válida')}catch(_){}},900)}if(sessionStorage.getItem('pokesenda_saveguard_returned')){sessionStorage.removeItem('pokesenda_saveguard_returned');setTimeout(()=>{try{window.toast?.('✅ Partida protegida recargada correctamente')}catch(_){}},950)}}catch(_){}
})();

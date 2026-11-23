
(()=>{
  'use strict';
  const SUPABASE_URL='https://rkxbqpamksltyosulmut.supabase.co';
  const SUPABASE_KEY='sb_publishable_Y7aNyG3ggvVxBa6GwGvpsw_eAWhjWwO';
  const SAVE_KEY='pokesenda_beta1_save_v1';
  const JOHTO_SAVE_KEY='pokesenda_johto_dev_isolated_v1';
  const HOENN_SAVE_KEY='pokesenda_hoenn_isolated_v1';
  const GLOBAL_INFINITE_KEY='pokesenda_global_infinite_v1';
  const CLOUD_REGIONS_KEY='__pokesendaCloudRegions';
  const LINK_KEY='pokesenda_beta1_cloud_link_v1';
  const SESSION_PULL='pokesenda_cloud_pulled_v364048';
  const SESSION_LINK='pokesenda_cloud_linked_v364048';
  const $=id=>document.getElementById(id);
  let busy=false, conflict=null, syncTimer=null, pollTimer=null, suppressSaveWatch=false, lastStatus='', ensureLinkPromise=null;

  function nowIso(){return new Date().toISOString();}
  function randomHex(bytes=32){
    const a=new Uint8Array(bytes);
    if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(a);else for(let i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);
    return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function uuidLike(){
    if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
    const h=randomHex(16).split('');h[12]='4';h[16]=((parseInt(h[16],16)&3)|8).toString(16);const s=h.join('');return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
  }
  function deviceName(){
    const ua=navigator.userAgent||'';
    if(/Android/i.test(ua))return 'Android';
    if(/iPhone|iPad|iPod/i.test(ua))return 'iPhone/iPad';
    if(/Windows/i.test(ua))return 'PC Windows';
    if(/Macintosh|Mac OS/i.test(ua))return 'Mac';
    if(/Linux/i.test(ua))return 'PC Linux';
    return 'Dispositivo';
  }
  function readLink(){try{const v=JSON.parse(localStorage.getItem(LINK_KEY)||'null');return v&&v.slotId&&v.secret?v:null;}catch(_){return null;}}
  function writeLink(v){try{localStorage.setItem(LINK_KEY,JSON.stringify(v));}catch(_){} updateUI();}
  function forgetLink(){try{localStorage.removeItem(LINK_KEY);}catch(_){} conflict=null;updateUI();}
  function safeLocalObject(key){try{const raw=localStorage.getItem(key);if(!raw)return null;const data=JSON.parse(raw);return data&&typeof data==='object'?data:null;}catch(_){return null;}}
  function getLocal(){
    try{
      const kanto=safeLocalObject(SAVE_KEY);if(!kanto)return null;
      const johto=safeLocalObject(JOHTO_SAVE_KEY),hoenn=safeLocalObject(HOENN_SAVE_KEY),globalInfinite=safeLocalObject(GLOBAL_INFINITE_KEY);
      const data={...kanto,[CLOUD_REGIONS_KEY]:{v:2,johto:johto||null,hoenn:hoenn||null,globalInfinite:globalInfinite||null}};
      return {raw:JSON.stringify(data),data,hash:fingerprint(data)};
    }catch(_){return null;}
  }
  function stableStringify(v){
    if(v===null||typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return '['+v.map(stableStringify).join(',')+']';
    const keys=Object.keys(v).sort();return '{'+keys.map(k=>JSON.stringify(k)+':'+stableStringify(v[k])).join(',')+'}';
  }
  function fingerprint(v){
    const s=stableStringify(v);let h1=0x811c9dc5,h2=0x9e3779b9;
    for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1^=c;h1=Math.imul(h1,0x01000193);h2^=(c+i);h2=Math.imul(h2,0x85ebca6b);}
    return (h1>>>0).toString(16).padStart(8,'0')+(h2>>>0).toString(16).padStart(8,'0')+':'+s.length;
  }
  function saveSummary(s){
    try{
      const countDex=x=>Array.isArray(x?.dexOwnedHistory)?x.dexOwnedHistory.length:Array.isArray(x?.dexSeen)?x.dexSeen.length:Array.isArray(x?.dex)?x.dex.length:0;
      const countBadges=x=>Array.isArray(x?.gyms?.badges)?x.gyms.badges.length:Array.isArray(x?.badges)?x.badges.length:0;
      const pack=s?.[CLOUD_REGIONS_KEY]||{},j=pack.johto||null,h=pack.hoenn||null;
      const money=Math.max(0,Math.floor(Number(s?.pokedollars||0))).toLocaleString('es-CL');
      const kDex=countDex(s),jDex=countDex(j),hDex=countDex(h);
      const badges=countBadges(s)+countBadges(j)+countBadges(h);
      return `Kanto ${kDex}/151 · Johto ${jDex}/131 · Hoenn ${hDex}/138 · 🏅 ${badges}/24 · ₽${money}`;
    }catch(_){return 'Partida multirregional de PokéSenda';}
  }
  function formatWhen(iso){
    if(!iso)return 'sin registro';
    try{return new Date(iso).toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'});}catch(_){return String(iso);}
  }
  function setStatus(msg,tone='info'){
    lastStatus=msg;const el=$('pkCloudMessage');if(el){el.className='pk-cloud-message '+tone;el.textContent=msg;}
    const quick=$('pkCloudQuickBtn');if(quick){quick.dataset.tone=tone;quick.title=msg;}
  }
  function toastMsg(msg){try{if(typeof window.toast==='function')window.toast(msg);else setStatus(msg);}catch(_){setStatus(msg);}}

  async function rpc(fn,args){
    const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`,{
        method:'POST',signal:ctrl.signal,headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(args)
      });
      const text=await r.text();let body=null;try{body=text?JSON.parse(text):null;}catch(_){body=text;}
      if(!r.ok){const detail=body?.message||body?.details||body?.hint||text||`HTTP ${r.status}`;throw new Error(detail);}
      return body;
    }finally{clearTimeout(t);}
  }
  const firstRow=x=>Array.isArray(x)?x[0]:x;
  async function remoteLoad(link=readLink()){
    if(!link)return null;
    const out=await rpc('pokesenda_load_cloud_save',{p_slot_id:link.slotId,p_secret:link.secret});
    const row=firstRow(out);if(!row||!row.save_data)return null;if(row.save_data?.releaseId!=="beta1")throw new Error("Esta partida Cloud pertenece a una versión de pruebas anterior y no es compatible con BETA 1.0.");
    return {data:row.save_data,revision:Number(row.revision||0),updatedAt:row.updated_at||null,deviceName:row.device_name||'Otro dispositivo',hash:fingerprint(row.save_data)};
  }
  async function remoteCreate(local){
    const secret=randomHex(32);
    const out=await rpc('pokesenda_create_cloud_save',{p_secret:secret,p_save_data:local.data,p_device_name:deviceName()});
    const row=firstRow(out);if(!row?.slot_id)throw new Error('Supabase no devolvió el identificador de la partida. Revisa que el SQL de Cloud Save se haya ejecutado.');
    const link={slotId:row.slot_id,secret,revision:Number(row.revision||1),lastSyncedHash:local.hash,lastSyncedAt:row.updated_at||nowIso(),deviceId:uuidLike(),deviceName:deviceName(),linkedAt:nowIso()};
    writeLink(link);return link;
  }
  async function remoteUpdate(link,local,expectedRevision){
    const out=await rpc('pokesenda_update_cloud_save',{p_slot_id:link.slotId,p_secret:link.secret,p_save_data:local.data,p_expected_revision:Number(expectedRevision),p_device_name:deviceName()});
    const row=firstRow(out);return row?{ok:!!row.ok,revision:Number(row.revision||0),updatedAt:row.updated_at||null}:null;
  }
  async function ensureLink({silent=true}={}){
    const existing=readLink();if(existing)return existing;
    if(ensureLinkPromise)return ensureLinkPromise;
    const initialLocal=getLocal();if(!initialLocal||!initialLocal.data?.starter)return null;
    const task=(async()=>{
      let waited=0;while(busy&&waited<5000){await new Promise(r=>setTimeout(r,100));waited+=100;}
      const linked=readLink();if(linked)return linked;if(busy)return null;
      busy=true;if(!silent)setStatus('Creando tu identidad online…','loading');
      try{
        const local=getLocal()||initialLocal,link=await remoteCreate(local);
        updateUI();
        if(!silent)setStatus('✅ Identidad online creada.','ok');
        return link;
      }catch(e){
        if(!silent)setStatus('No se pudo crear la identidad online: '+friendlyError(e),'error');
        console.warn('PokéSenda Online · no se pudo crear identidad automática:',e);
        return null;
      }finally{busy=false;}
    })();
    ensureLinkPromise=task;
    try{return await task;}finally{if(ensureLinkPromise===task)ensureLinkPromise=null;}
  }

  function connectionCode(link=readLink()){
    if(!link)return '';
    const json=JSON.stringify({v:1,s:link.slotId,k:link.secret});
    const bytes=new TextEncoder().encode(json);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));
    return 'PS1.'+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function parseCode(code){
    try{
      code=String(code||'').trim();
      if(code.startsWith('http://')||code.startsWith('https://')){const u=new URL(code);const h=new URLSearchParams(u.hash.replace(/^#/,''));code=h.get('pscloud')||code;}
      if(code.includes('#pscloud=')){code=decodeURIComponent(code.split('#pscloud=')[1].split('&')[0]);}
      if(!code.startsWith('PS1.'))throw new Error('Formato');
      let b64=code.slice(4).replace(/-/g,'+').replace(/_/g,'/');while(b64.length%4)b64+='=';
      const bin=atob(b64),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0)),obj=JSON.parse(new TextDecoder().decode(bytes));
      if(obj?.v!==1||!/^[0-9a-f-]{36}$/i.test(obj?.s||'')||!/^[0-9a-f]{64}$/i.test(obj?.k||''))throw new Error('Datos');
      return {slotId:obj.s,secret:obj.k};
    }catch(_){return null;}
  }
  function linkPayload(link=readLink()){
    const code=connectionCode(link);if(!code)return '';
    if(location.protocol==='http:'||location.protocol==='https:')return `${location.origin}${location.pathname}#pscloud=${encodeURIComponent(code)}`;
    return code;
  }
  function renderQR(text){
    const host=$('pkCloudQr');if(!host)return;host.innerHTML='';
    try{
      const lib=globalThis.PKQRCode;if(!lib?.QRCode)throw new Error('QR no disponible');
      const qr=new lib.QRCode(-1,lib.QRErrorCorrectLevel.M);qr.addData(text);qr.make();
      const n=qr.getModuleCount(),quiet=4,size=n+quiet*2;let d='';
      for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))d+=`M${c+quiet} ${r+quiet}h1v1h-1z`;
      host.innerHTML=`<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Código QR para vincular PokéSenda"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    }catch(e){host.innerHTML='<div class="pk-cloud-qr-fallback">QR no disponible.<br>Usa el código de vinculación.</div>';}
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);toastMsg('📋 Código copiado');return true;}catch(_){
      try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toastMsg('📋 Código copiado');return true;}catch(__){return false;}
    }
  }
  async function shareLink(){
    const payload=linkPayload();if(!payload)return;
    try{if(navigator.share)await navigator.share({title:'Vincular PokéSenda Cloud',text:'Vincula este dispositivo a mi partida de PokéSenda.',url:(payload.startsWith('http')?payload:undefined)});else await copyText(payload);}catch(e){if(e?.name!=='AbortError')await copyText(payload);}
  }

  function updateUI(){
    const link=readLink(),linked=$('pkCloudLinked'),unlinked=$('pkCloudUnlinked'),menu=$('menuCloudSaveBtn'),options=$('optionsCloudSaveBtn'),mobile=$('[data-mobile-more="cloud"]');
    linked?.classList.toggle('hidden',!link);unlinked?.classList.toggle('hidden',!!link);
    if(menu)menu.textContent=link?'☁️ Cloud Save · Activado':'☁️ Cloud Save';if(options)options.textContent=link?'☁️ Cloud Save · Activado':'☁️ Cloud Save';if(mobile)mobile.textContent=link?'☁️ Cloud Save · Activado':'☁️ Cloud Save';
    if(link){
      const id=$('pkCloudSlotId'),rev=$('pkCloudRevision'),last=$('pkCloudLastSync'),dev=$('pkCloudDevice');
      if(id)id.textContent=String(link.slotId).slice(0,8).toUpperCase();if(rev)rev.textContent=String(link.revision||'?');if(last)last.textContent=formatWhen(link.lastSyncedAt);if(dev)dev.textContent=link.deviceName||deviceName();
      const code=connectionCode(link),input=$('pkCloudCodeOutput');if(input)input.value=code;renderQR(linkPayload(link));
    }
  }
  function open(){updateUI();$('pkCloudOverlay')?.classList.remove('hidden');}
  function close(){$('pkCloudOverlay')?.classList.add('hidden');$('pkCloudQrPanel')?.classList.add('hidden');}
  function showQR(){const p=$('pkCloudQrPanel');p?.classList.remove('hidden');renderQR(linkPayload());p?.scrollIntoView?.({block:'nearest'});}
  function hideQR(){$('pkCloudQrPanel')?.classList.add('hidden');}

  function applyRemote(remote,reason='cloud'){
    try{
      try{window.PokeSendaBackups?.create('Antes de cargar una partida desde Cloud',true);}catch(_){}
      try{window.PokeSendaSaveGuard?.snapshotAll?.('Antes de cargar Cloud');}catch(_){}
      suppressSaveWatch=true;
      const remoteData=remote?.data&&typeof remote.data==='object'?remote.data:{};
      const bundle=remoteData[CLOUD_REGIONS_KEY]&&typeof remoteData[CLOUD_REGIONS_KEY]==='object'?remoteData[CLOUD_REGIONS_KEY]:null;
      const kantoData={...remoteData};delete kantoData[CLOUD_REGIONS_KEY];
      const entries=[[SAVE_KEY,JSON.stringify(kantoData)]];
      // Un Cloud antiguo sin bundle regional nunca borra una campaña local más nueva.
      if(bundle?.johto&&typeof bundle.johto==='object'){
        try{const before=localStorage.getItem(JOHTO_SAVE_KEY);if(before)localStorage.setItem('pokesenda_johto_before_cloud_v1',JSON.stringify({at:Date.now(),data:JSON.parse(before)}));}catch(_){}
        entries.push([JOHTO_SAVE_KEY,JSON.stringify(bundle.johto)]);
      }
      if(bundle?.hoenn&&typeof bundle.hoenn==='object'){
        try{const before=localStorage.getItem(HOENN_SAVE_KEY);if(before)localStorage.setItem('pokesenda_hoenn_before_cloud_v1',JSON.stringify({at:Date.now(),data:JSON.parse(before)}));}catch(_){}
        entries.push([HOENN_SAVE_KEY,JSON.stringify(bundle.hoenn)]);
      }
      if(bundle?.globalInfinite&&typeof bundle.globalInfinite==='object')entries.push([GLOBAL_INFINITE_KEY,JSON.stringify(bundle.globalInfinite)]);

      /* Cloud se aplica ahora como una sola restauración lógica: todas las regiones
         se validan antes; si una escritura falla, SaveGuard restaura las que ya se
         hubiesen escrito. Así nunca queda Kanto de una revisión y Johto de otra. */
      const result=window.PokeSendaSaveGuard?.restoreConfirmed?.(entries,'Antes de cargar Cloud');
      if(!result?.ok){
        const extra=result?.rolledBack===false?' El rollback tampoco pudo verificarse; no cierres el juego y descarga un respaldo.':'';
        setStatus('No se pudo aplicar la partida Cloud completa. Se conservó el estado anterior.'+extra,'error');
        return;
      }
      const link=readLink();if(link){link.revision=remote.revision;link.lastSyncedHash=remote.hash;link.lastSyncedAt=remote.updatedAt||nowIso();link.lastRemoteDevice=remote.deviceName;link.needsResolution=false;writeLink(link);}
      sessionStorage.setItem(SESSION_PULL,reason);setTimeout(()=>location.reload(),120);
    }catch(e){setStatus('No se pudo guardar la partida descargada en este navegador.','error');}
    finally{suppressSaveWatch=false;}
  }
  function showConflict(local,remote){
    conflict={local,remote};
    const l=$('pkCloudConflictLocal'),r=$('pkCloudConflictRemote');
    if(l)l.innerHTML=`<b>Este dispositivo · ${deviceName()}</b><span>${saveSummary(local.data)}</span><small>Cambios locales aún no sincronizados.</small>`;
    if(r)r.innerHTML=`<b>Nube · ${remote.deviceName}</b><span>${saveSummary(remote.data)}</span><small>Guardado ${formatWhen(remote.updatedAt)} · revisión ${remote.revision}</small>`;
    $('pkCloudConflictOverlay')?.classList.remove('hidden');setStatus('Hay cambios distintos en este dispositivo y en la nube. Elige cuál conservar.','warn');
  }
  function closeConflict(){$('pkCloudConflictOverlay')?.classList.add('hidden');conflict=null;}
  async function chooseLocal(){
    if(!conflict||busy)return;busy=true;try{
      const link=readLink();try{window.PokeSendaSaveGuard?.snapshotAll?.('Antes de subir conflicto local a Cloud');}catch(_){}const res=await remoteUpdate(link,conflict.local,conflict.remote.revision);
      if(!res?.ok)throw new Error('La nube cambió otra vez mientras elegías. Vuelve a sincronizar.');
      link.revision=res.revision;link.lastSyncedHash=conflict.local.hash;link.lastSyncedAt=res.updatedAt||nowIso();link.deviceName=deviceName();link.needsResolution=false;writeLink(link);closeConflict();setStatus('✅ Se conservó esta partida y se actualizó la nube.','ok');toastMsg('☁️ Partida local subida a la nube');
    }catch(e){setStatus('No se pudo resolver el conflicto: '+e.message,'error');}finally{busy=false;}
  }
  function chooseRemote(){if(!conflict||busy)return;const remote=conflict.remote;closeConflict();applyRemote(remote,'conflict-cloud');}

  async function activate(){
    if(busy)return;const local=getLocal();if(!local){setStatus('Primero inicia una partida para crear su guardado en la nube.','warn');return;}
    busy=true;setStatus('Creando tu espacio privado de Cloud Save…','loading');
    try{const link=await remoteCreate(local);setStatus('✅ Cloud Save activado. Ya puedes vincular tu teléfono.','ok');updateUI();showQR();sessionStorage.setItem(SESSION_LINK,'1');}
    catch(e){setStatus('No se pudo activar Cloud Save: '+friendlyError(e),'error');}
    finally{busy=false;}
  }
  async function linkFromInput(){
    if(busy)return;const parsed=parseCode($('pkCloudCodeInput')?.value);if(!parsed){setStatus('El código de vinculación no es válido.','error');return;}
    busy=true;setStatus('Buscando la partida en la nube…','loading');
    try{
      const temp={slotId:parsed.slotId,secret:parsed.secret},remote=await remoteLoad(temp);if(!remote)throw new Error('No se encontró la partida o la clave no coincide.');
      const local=getLocal();
      const differs=!!(local&&local.hash!==remote.hash);
      const link={...temp,revision:remote.revision,lastSyncedHash:remote.hash,lastSyncedAt:remote.updatedAt||nowIso(),deviceId:uuidLike(),deviceName:deviceName(),linkedAt:nowIso(),needsResolution:differs};writeLink(link);
      if(differs){
        // Al vincular un nuevo dispositivo, la nube es la fuente de verdad; se muestra comparación antes de reemplazar si ya había progreso local.
        showConflict(local,remote);setStatus('Dispositivo vinculado. Hay una partida local diferente: elige cuál conservar.','warn');
      }else if(!local){applyRemote(remote,'linked-cloud');}
      else{setStatus('✅ Dispositivo vinculado y partida al día.','ok');updateUI();}
    }catch(e){setStatus('No se pudo vincular: '+friendlyError(e),'error');}
    finally{busy=false;}
  }
  function friendlyError(e){
    const m=String(e?.message||e||'Error desconocido');
    if(/Failed to fetch|NetworkError|abort/i.test(m))return 'sin conexión con Supabase. Revisa Internet e inténtalo de nuevo.';
    if(/function|schema cache|404/i.test(m))return 'no encuentro las funciones de Cloud Save. Revisa que hayas ejecutado el SQL completo en Supabase.';
    return m;
  }

  async function syncNow({startup=false,manual=false,poll=false}={}){
    const link=readLink(),local=getLocal();if(!link||!local||busy||conflict)return;
    if(!navigator.onLine){if(manual)setStatus('Sin Internet. La partida sigue guardada localmente. Cuando vuelva la conexión, pulsa Sincronizar ahora.','warn');return;}
    busy=true;if(manual)setStatus('Sincronizando con la nube…','loading');
    try{
      const remote=await remoteLoad(link);
      if(link.needsResolution){showConflict(local,remote);setStatus('Este dispositivo todavía tiene un conflicto pendiente. Elige explícitamente qué partida conservar.','warn');return;}if(!remote)throw new Error('La partida Cloud ya no existe o la clave dejó de ser válida.');
      const current=readLink()||link;
      if(remote.hash===local.hash){current.revision=remote.revision;current.lastSyncedHash=local.hash;current.lastSyncedAt=remote.updatedAt||current.lastSyncedAt||nowIso();writeLink(current);if(manual)setStatus('✅ Ya estaba todo sincronizado.','ok');return;}
      const localChanged=local.hash!==current.lastSyncedHash;
      const remoteChanged=remote.revision!==Number(current.revision||0)||remote.hash!==current.lastSyncedHash;
      if(remoteChanged&&localChanged){showConflict(local,remote);return;}
      if(remoteChanged&&!localChanged){
        if(window.PokeSendaSaveGuard?.isRegressionBundle?.(remote.data,local.data)){showConflict(local,remote);setStatus('🛡️ La nube parece tener menos progreso irreversible que este dispositivo. Se bloqueó la carga automática.','warn');return;}
        if(startup||document.visibilityState==='hidden'||manual){applyRemote(remote,'cloud-newer');return;}
        setStatus(`☁️ Hay una partida más nueva en la nube (${remote.deviceName}, ${formatWhen(remote.updatedAt)}). Pulsa Sincronizar ahora para cargarla.`,'warn');return;
      }
      if(!remoteChanged&&localChanged){
        if(window.PokeSendaSaveGuard?.isRegressionBundle?.(local.data,remote.data)){showConflict(local,remote);setStatus('🛡️ Esta copia local parece más antigua que la nube. Se bloqueó la subida automática para evitar un rollback.','warn');return;}
        try{window.PokeSendaSaveGuard?.snapshotAll?.('Antes de subir a Cloud');}catch(_){}
        const res=await remoteUpdate(current,local,current.revision);
        if(!res?.ok){const latest=await remoteLoad(current);if(latest)showConflict(local,latest);else throw new Error('No se pudo verificar la revisión de la nube.');return;}
        current.revision=res.revision;current.lastSyncedHash=local.hash;current.lastSyncedAt=res.updatedAt||nowIso();current.deviceName=deviceName();writeLink(current);if(manual)setStatus('✅ Partida subida a la nube.','ok');return;
      }
      if(manual)setStatus('✅ Cloud Save al día.','ok');
    }catch(e){if(manual||startup)setStatus('Cloud Save: '+friendlyError(e),'error');}
    finally{busy=false;}
  }
  function schedulePush(){
    // V11 SaveGuard · modo rescate: nunca subir automáticamente un save sólo por
    // una escritura local. Cloud se sincroniza únicamente cuando el jugador pulsa
    // “Sincronizar ahora”, evitando que un estado viejo/accidental llegue a la nube.
    return;
  }

  // Observa únicamente los guardados de la partida y sincroniza con debounce.
  try{
    const native=Storage.prototype.setItem;
    if(!Storage.prototype.__pokesendaCloudWrapped){
      Storage.prototype.setItem=function(k,v){const out=native.call(this,k,v);try{if(this===localStorage&&(k===SAVE_KEY||k===JOHTO_SAVE_KEY||k===HOENN_SAVE_KEY||k===GLOBAL_INFINITE_KEY))schedulePush();}catch(_){}return out;};
      Object.defineProperty(Storage.prototype,'__pokesendaCloudWrapped',{value:true,configurable:true});
    }
  }catch(_){}

  function installButtons(){
    const menuButtons=document.querySelector('#mainMenu .menu-buttons');
    if(menuButtons&&!$('menuCloudSaveBtn')){const b=document.createElement('button');b.id='menuCloudSaveBtn';b.className='btn primary';b.type='button';b.textContent='☁️ Cloud Save';const transfer=$('menuTransferSaveBtn');transfer?menuButtons.insertBefore(b,transfer):menuButtons.appendChild(b);b.addEventListener('click',open);}
    const reset=$('optionsResetBtn');let optionsCloud=$('optionsCloudSaveBtn');if(reset&&!optionsCloud){optionsCloud=document.createElement('button');optionsCloud.id='optionsCloudSaveBtn';optionsCloud.className='btn';optionsCloud.type='button';optionsCloud.textContent='☁️ Cloud Save';const transfer=$('optionsTransferSaveBtn');transfer?.parentElement?.insertBefore(optionsCloud,transfer||reset);}
    if(optionsCloud&&optionsCloud.dataset.pkCloudBound!=='1'){optionsCloud.dataset.pkCloudBound='1';optionsCloud.addEventListener('click',open);}
    // V36.40.49: Cloud Save se gestiona desde Menú/Opciones/Más; cabecera de juego limpia.
    const cloudMore=document.querySelector('[data-mobile-more="cloud"]');cloudMore?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.getElementById('pkMobileMore')?.classList.remove('show');open();});
    const transferStatus=$('saveTransferStatus');if(transferStatus&&!$('pkCloudTransferCta')){const c=document.createElement('div');c.id='pkCloudTransferCta';c.className='pk-cloud-transfer-cta';c.innerHTML='<div><b>☁️ ¿Usas PC y móvil?</b><span>Cloud Save permite llevar tu partida entre dispositivos; por seguridad, ahora se sincroniza manualmente.</span></div><button class="btn primary" type="button">Abrir Cloud Save</button>';transferStatus.insertAdjacentElement('afterend',c);c.querySelector('button').addEventListener('click',()=>{document.getElementById('saveTransferOverlay')?.classList.add('hidden');open();});}
    updateUI();
  }

  function bootHash(){
    try{const p=new URLSearchParams(location.hash.replace(/^#/,'')),code=p.get('pscloud');if(!code)return;history.replaceState(null,'',location.pathname+location.search);const input=$('pkCloudCodeInput');if(input)input.value=code;open();setStatus('📱 Código QR detectado. Pulsa “Vincular y cargar” para conectar este dispositivo.','ok');}
    catch(_){}
  }

  $('pkCloudCloseBtn')?.addEventListener('click',close);$('pkCloudOverlay')?.addEventListener('click',e=>{if(e.target===$('pkCloudOverlay'))close();});
  $('pkCloudActivateBtn')?.addEventListener('click',activate);$('pkCloudLinkBtn')?.addEventListener('click',linkFromInput);
  $('pkCloudSyncBtn')?.addEventListener('click',()=>syncNow({manual:true}));$('pkCloudQrBtn')?.addEventListener('click',showQR);$('pkCloudQrCloseBtn')?.addEventListener('click',hideQR);
  $('pkCloudCopyBtn')?.addEventListener('click',()=>copyText(connectionCode()));$('pkCloudShareBtn')?.addEventListener('click',shareLink);
  $('pkCloudUnlinkBtn')?.addEventListener('click',()=>{forgetLink();hideQR();setStatus('Este dispositivo quedó desvinculado. La copia de la nube no fue borrada.','info');});
  $('pkCloudConflictUseCloud')?.addEventListener('click',chooseRemote);$('pkCloudConflictUseLocal')?.addEventListener('click',chooseLocal);$('pkCloudConflictCancel')?.addEventListener('click',()=>{$('pkCloudConflictOverlay')?.classList.add('hidden');conflict=null;const link=readLink();if(link?.needsResolution)setStatus('⚠️ Conflicto pendiente: Cloud Save no sincronizará hasta que elijas qué partida conservar.','warn');});
  $('pkCloudConflictOverlay')?.addEventListener('click',e=>{if(e.target===$('pkCloudConflictOverlay')){$('pkCloudConflictOverlay').classList.add('hidden');conflict=null;}});

  window.addEventListener('online',()=>{if(readLink())setStatus('Modo rescate: sincronización automática pausada. Usa Sincronizar manualmente solo después de comprobar tus partidas regionales.','warn');});
  document.addEventListener('visibilitychange',()=>{});
  pollTimer=null;

  window.PKCloud={open,sync:()=>syncNow({manual:true}),showQR,connectionCode,ensureLink:()=>ensureLink({silent:true}),hasLink:()=>!!readLink(),recoveryRemote:async()=>{const link=readLink();if(!link)return null;return await remoteLoad(link);}};
  installButtons();bootHash();
  setTimeout(()=>{if(readLink())setStatus('🛡️ Modo rescate activo: Cloud Save automático está pausado hasta que confirmes tus partidas regionales.','warn');},1400);
  try{if(sessionStorage.getItem(SESSION_PULL)){sessionStorage.removeItem(SESSION_PULL);setTimeout(()=>toastMsg('☁️ Partida más reciente cargada desde la nube'),800);}if(sessionStorage.getItem(SESSION_LINK)){sessionStorage.removeItem(SESSION_LINK);}}catch(_){}
})();



(()=>{
  const mq=window.matchMedia('(max-width: 980px)');
  const $m=id=>document.getElementById(id);
  const dock=$m('pkMobileDock'), more=$m('pkMobileMore'), tip=$m('pkMobileTip');
  const isMobile=()=>mq.matches;
  const closeMore=()=>{more?.classList.remove('show');document.body.classList.remove('pk-mobile-sheet-open');};
  const openMore=()=>{more?.classList.add('show');document.body.classList.add('pk-mobile-sheet-open');};
  const safeClick=id=>{const el=$m(id); if(el){closeMore();el.click();return true;} return false;};
  const scrollToEl=sel=>{closeMore();const el=document.querySelector(sel);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
  const modalSelectors='.overlay,.loot-panel,.info-panel,.ux-context-panel';

  function mobileRequestFullscreen(){
    try{
      if(document.fullscreenElement){document.exitFullscreen?.();return;}
      const root=document.documentElement;
      const req=root.requestFullscreen||root.webkitRequestFullscreen||root.msRequestFullscreen;
      if(req){const p=req.call(root,{navigationUI:'hide'});p?.catch?.(()=>window.toast?.('No se pudo activar pantalla completa'));}
      else if(typeof toast==='function')toast('Pantalla completa no está disponible en este navegador');
    }catch(_){if(typeof toast==='function')toast('Pantalla completa no está disponible en este navegador');}
  }

  const refreshModalState=()=>{
    if(!document.body)return;
    const open=[...document.querySelectorAll(modalSelectors)].some(el=>!el.classList.contains('hidden'));
    document.body.classList.toggle('pk-mobile-modal-open',isMobile()&&open);
    if(open)closeMore();
  };
  const apply=()=>{
    document.documentElement.classList.toggle('pk-mobile',isMobile());
    document.body?.classList.toggle('pk-mobile',isMobile());
    if(!isMobile())closeMore();
    refreshModalState();
  };
  apply(); mq.addEventListener?.('change',apply);
  document.querySelectorAll(modalSelectors).forEach(el=>new MutationObserver(refreshModalState).observe(el,{attributes:true,attributeFilter:['class']}));

  // Identificación visible en portada móvil + acceso rápido a pantalla completa.
  const menuBox=document.querySelector('#mainMenu .menu-box');
  if(menuBox && !$m('pkMobileStartBadge')){
    const badge=document.createElement('div');badge.id='pkMobileStartBadge';badge.className='pk-mobile-start-badge';
    badge.innerHTML='<span class="pk-mobile-version-dot"></span><span>📱 <b>PokéSenda BETA 1.0 · Versión móvil</b></span><button id="pkMobileMenuFullscreenBtn" class="btn" type="button">⛶ Maximizar</button>';
    const sub=menuBox.querySelector('.menu-sub');sub?.insertAdjacentElement('afterend',badge);
    $m('pkMobileMenuFullscreenBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mobileRequestFullscreen();});
  }
  const title=document.querySelector('.title');
  if(title && !$m('pkMobileHudFullscreenBtn')){
    const b=document.createElement('button');b.id='pkMobileHudFullscreenBtn';b.className='btn pk-mobile-hud-fullscreen';b.type='button';b.title='Pantalla completa';b.setAttribute('aria-label','Pantalla completa');b.textContent='⛶';
    title.appendChild(b);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mobileRequestFullscreen();});
  }
  // Android/Chrome permite solicitar fullscreen desde el toque en Jugar/Continuar.
  $m('menuPlayBtn')?.addEventListener('click',()=>{if(isMobile()&&!document.fullscreenElement)mobileRequestFullscreen();},{capture:true});

  dock?.addEventListener('click',e=>{
    const b=e.target.closest('[data-mobile-action]');if(!b)return;
    e.preventDefault();e.stopPropagation();
    const a=b.dataset.mobileAction;
    if(a==='field')scrollToEl('#field');
    else if(a==='team')scrollToEl('.right');
    else if(a==='loot'){closeMore(); if(typeof openLoot==='function')openLoot('main'); else safeClick('lootBtn');}
    else if(a==='dex')safeClick('pokedexBtn');
    else if(a==='box')safeClick('pcBoxBtn');
    else if(a==='more'){more?.classList.contains('show')?closeMore():openMore();}
  });
  $m('pkMobileMoreClose')?.addEventListener('click',closeMore);
  more?.addEventListener('click',e=>{
    const b=e.target.closest('[data-mobile-more]');if(!b)return;
    e.preventDefault();e.stopPropagation();
    const a=b.dataset.mobileMore;
    if(a==='gyms')safeClick('gymHudBtn');
    else if(a==='profile'){if(!safeClick('pkTrainerMarker'))safeClick('pkTrainerBack');}
    else if(a==='regions')safeClick('regionSwitchBtn');
    else if(a==='tree')safeClick('skillTreeBtn');
    else if(a==='achievements')safeClick('achievementsBtn');
    else if(a==='help')safeClick('helpInfoBtn');
    else if(a==='transfer')openSaveTransfer();
    else if(a==='menu')safeClick('gameMenuBtn');
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore();});
  document.addEventListener('click',e=>{if(more?.classList.contains('show')&&!e.target.closest('#pkMobileMore')&&!e.target.closest('[data-mobile-action="more"]'))closeMore();});
  const closeTip=()=>{tip?.classList.remove('show');try{localStorage.setItem('pokesenda_mobile_tip_v364047','1')}catch(_){}};
  $m('pkMobileTipClose')?.addEventListener('click',closeTip);
  try{if(isMobile()&&!localStorage.getItem('pokesenda_mobile_tip_v364047')){tip?.classList.add('show');setTimeout(()=>tip?.classList.remove('show'),11000);}}catch(_){if(isMobile())tip?.classList.add('show');}

  // -------- Transferencia PC ↔ móvil --------
  const transfer=$m('saveTransferOverlay'), transferStatus=$m('saveTransferStatus'), fileInput=$m('saveTransferFileInput');
  function saveSnapshot(){
    try{if(typeof save==='function')save();}catch(_){}
    try{const raw=localStorage.getItem(window.PokeSendaActiveSaveKey||'pokesenda_beta1_save_v1');return raw?JSON.parse(raw):null;}catch(_){return null;}
  }
  function saveSummary(s){
    try{
      const name=String(s?.trainerAvatar?.name||'Entrenador');
      const owned=Array.isArray(s?.owned)?s.owned.length:0;
      const money=Math.floor(Number(s?.pokedollars||0)).toLocaleString('es-CL');
      const routes=Object.values(s?.routes||{}).reduce((n,r)=>n+Number(r?.completions||0),0);
      return `<b>${name}</b> · ${owned} Pokémon · ₽${money} · ${routes} rutas completadas`;
    }catch(_){return 'Partida disponible';}
  }
  function refreshTransferStatus(){const s=saveSnapshot();if(transferStatus)transferStatus.innerHTML=`Partida local actual: ${saveSummary(s)}<br><small>Último respaldo: crea uno antes de cambiar de dispositivo.</small>`;}
  function openSaveTransfer(){closeMore();refreshTransferStatus();transfer?.classList.remove('hidden');refreshModalState();}
  function closeSaveTransfer(){transfer?.classList.add('hidden');if(fileInput)fileInput.value='';refreshModalState();}
  function buildPayload(){
    const snapshot=saveSnapshot();
    return {format:'PokeSendaSave',formatVersion:1,gameVersion:'V36.60.2',exportedAt:new Date().toISOString(),data:snapshot};
  }
  function saveFileName(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return `PokeSenda_Save_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.pokesenda`;}
  function payloadFile(){const blob=new Blob([JSON.stringify(buildPayload())],{type:'application/json'});return new File([blob],saveFileName(),{type:'application/json'});}
  function downloadPayload(){
    try{const file=payloadFile(),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);if(typeof toast==='function')toast('💾 Respaldo de PokéSenda exportado');refreshTransferStatus();}
    catch(_){if(typeof toast==='function')toast('No se pudo exportar la partida');}
  }
  async function sharePayload(){
    try{
      const file=payloadFile();
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({title:'Partida de PokéSenda',text:'Respaldo de mi partida de PokéSenda',files:[file]});}
      else{downloadPayload();if(typeof toast==='function')toast('Tu navegador no permite compartir archivos directamente; se descargó el respaldo.');}
    }catch(e){if(e?.name!=='AbortError'&&typeof toast==='function')toast('No se pudo compartir el respaldo');}
  }
  const EMERGENCY_SAVE_KEYS={kanto:'pokesenda_beta1_save_v1',johto:'pokesenda_johto_dev_isolated_v1',hoenn:'pokesenda_hoenn_isolated_v1',global:'pokesenda_global_infinite_v1'};
  const EMERGENCY_LABELS={kanto:'Kanto',johto:'Johto',hoenn:'Hoenn',global:'Expedición Infinita Global'};
  function emergencyBundleEntries(bundle){
    if(bundle?.format!=='PokeSendaEmergencyBundle'||!bundle.saves||typeof bundle.saves!=='object')return [];
    const out=[];for(const [region,key] of Object.entries(EMERGENCY_SAVE_KEYS)){const raw=bundle.saves[key];if(typeof raw==='string'&&raw.trim())out.push({region,key,raw});}
    return out;
  }
  async function importEmergencyBundle(bundle,fileName){
    const entries=emergencyBundleEntries(bundle);if(!entries.length){if(typeof toast==='function')toast('El respaldo de emergencia no contiene partidas regionales recuperables');return;}
    const labels=entries.map(x=>EMERGENCY_LABELS[x.region]).join(', ');
    let ok=true;
    const message=`Se detectó un respaldo de emergencia de PokéSenda.

Regiones incluidas: ${labels}

Se restaurarán juntas para evitar mezclar campañas de momentos distintos. Antes se conservará una copia de seguridad del estado actual.

El vínculo de Cloud NO se modificará.

Archivo: ${fileName}`;
    if(typeof gameConfirm==='function')ok=await gameConfirm({title:'🛟 Importar respaldo de emergencia',message,confirmText:'Restaurar paquete',cancelText:'Cancelar',tone:'danger',symbol:'🛟'});else ok=window.confirm(`${message}\n\n¿Restaurar este paquete?`);
    if(!ok)return;
    const guard=window.PokeSendaSaveGuard;if(!guard?.restoreConfirmed){if(typeof toast==='function')toast('Esta versión no dispone del restaurador seguro necesario');return;}
    try{if(typeof stopLoop==='function')stopLoop();}catch(_){}
    try{window.PokeSendaBackups?.create('Antes de importar paquete de emergencia '+fileName,true);}catch(_){}
    const result=guard.restoreConfirmed(entries.map(x=>[x.key,x.raw]),'Antes de importar paquete de emergencia '+fileName);
    if(!result?.ok){if(typeof toast==='function')toast(result?.rolledBack===false?'⚠️ Falló la restauración y no se pudo verificar el rollback. No cierres el juego.':'No se pudo restaurar el paquete; se mantuvo la partida anterior.');return;}
    try{sessionStorage.setItem('pokesenda_import_emergency_ok_v1',JSON.stringify({regions:entries.map(x=>x.region),fileName}));}catch(_){}
    location.reload();
  }
  async function importText(rawText,fileName='respaldo'){
    let parsed;
    try{parsed=JSON.parse(rawText);}catch(_){if(typeof toast==='function')toast('El archivo no contiene una partida válida de PokéSenda');return;}
    if(parsed?.format==='PokeSendaEmergencyBundle'){await importEmergencyBundle(parsed,fileName);return;}
    if(String(rawText||'').length>5*1024*1024){if(typeof toast==='function')toast('Ese archivo es demasiado grande para ser un save regional normal de PokéSenda');return;}
    const candidate=parsed?.format==='PokeSendaSave'?parsed.data:parsed;if(candidate?.releaseId!=='beta1'){if(typeof toast==='function')toast('Este respaldo pertenece a una versión de pruebas anterior. BETA 1.0 comienza desde cero.');return;}
    if(!candidate || typeof candidate!=='object' || Array.isArray(candidate) || !candidate.options || !candidate.routes || !Array.isArray(candidate.owned)){
      if(typeof toast==='function')toast('El archivo no parece ser una partida válida de PokéSenda');return;
    }
    const importedInfo=saveSummary(candidate);
    let ok=true;
    if(typeof gameConfirm==='function')ok=await gameConfirm({title:'Importar partida',message:`Se reemplazará la partida guardada en este dispositivo por:

${importedInfo.replace(/<[^>]+>/g,'')}

Archivo: ${fileName}

Te recomiendo exportar antes una copia del progreso actual.`,confirmText:'Importar y reemplazar',cancelText:'Cancelar',tone:'danger',symbol:'💾'});
    else ok=window.confirm('¿Importar esta partida y reemplazar el progreso local?');
    if(!ok)return;
    try{
      if(typeof stopLoop==='function')stopLoop();
      try{window.PokeSendaBackups?.create('Antes de importar '+fileName,true);}catch(_){}
      const key=window.PokeSendaActiveSaveKey||'pokesenda_beta1_save_v1',raw=JSON.stringify(candidate),guard=window.PokeSendaSaveGuard;
      const result=guard?.restoreConfirmed?guard.restoreConfirmed([[key,raw]],'Antes de importar '+fileName):null;
      if(!result?.ok){if(typeof toast==='function')toast('No se pudo verificar la importación. La partida anterior se mantuvo.');return;}
      if(localStorage.getItem(key)!==raw){if(typeof toast==='function')toast('La importación no pudo verificarse y no se marcará como exitosa');return;}
      sessionStorage.setItem('pokesenda_import_ok_v364047','1');
      location.reload();
    }catch(_){if(typeof toast==='function')toast('No se pudo guardar la partida importada en este navegador');}
  }
  $m('saveTransferCloseBtn')?.addEventListener('click',closeSaveTransfer);
  transfer?.addEventListener('click',e=>{if(e.target===transfer)closeSaveTransfer();});
  $m('saveTransferExportBtn')?.addEventListener('click',downloadPayload);
  $m('saveTransferBackupBtn')?.addEventListener('click',downloadPayload);
  $m('saveTransferShareBtn')?.addEventListener('click',sharePayload);
  $m('saveTransferImportBtn')?.addEventListener('click',()=>fileInput?.click());
  fileInput?.addEventListener('change',async()=>{const f=fileInput.files?.[0];if(!f)return;if(f.size>25*1024*1024){if(typeof toast==='function')toast('Ese archivo es demasiado grande para un respaldo de PokéSenda');fileInput.value='';return;}try{await importText(await f.text(),f.name);}catch(_){if(typeof toast==='function')toast('No se pudo leer el archivo de partida');}});

  // Botón de transferencia también en el menú principal de PC y móvil.
  const menuButtons=document.querySelector('#mainMenu .menu-buttons');
  if(menuButtons && !$m('menuTransferSaveBtn')){
    const b=document.createElement('button');b.id='menuTransferSaveBtn';b.type='button';b.className='btn';b.textContent='💾 Transferir partida';
    const exit=$m('menuExitBtn');exit?menuButtons.insertBefore(b,exit):menuButtons.appendChild(b);b.addEventListener('click',openSaveTransfer);
  }
  // En Opciones queda otro acceso cómodo, útil especialmente en PC.
  // V36.66.xx: el botón ahora existe en el HTML por el rework visual; enlazarlo aunque no haya que crearlo.
  const optionsReset=$m('optionsResetBtn');
  let optionsTransfer=$m('optionsTransferSaveBtn');
  if(optionsReset && !optionsTransfer){
    optionsTransfer=document.createElement('button');optionsTransfer.id='optionsTransferSaveBtn';optionsTransfer.type='button';optionsTransfer.className='btn';optionsTransfer.textContent='💾 Transferir partida';optionsReset.parentElement?.insertBefore(optionsTransfer,optionsReset);
  }
  if(optionsTransfer && optionsTransfer.dataset.pkTransferBound!=='1'){
    optionsTransfer.dataset.pkTransferBound='1';
    optionsTransfer.addEventListener('click',openSaveTransfer);
  }
  window.PokeSendaTransferSave={open:openSaveTransfer,close:closeSaveTransfer,refresh:refreshTransferStatus};

  try{if(sessionStorage.getItem('pokesenda_import_ok_v364047')){sessionStorage.removeItem('pokesenda_import_ok_v364047');setTimeout(()=>{if(typeof toast==='function')toast('✅ Partida importada correctamente');},700);}const eb=sessionStorage.getItem('pokesenda_import_emergency_ok_v1');if(eb){sessionStorage.removeItem('pokesenda_import_emergency_ok_v1');setTimeout(()=>{if(typeof toast==='function')toast('🛟 Respaldo de emergencia restaurado correctamente');},900);}}catch(_){}

  // Al abrir modales en móvil, volver arriba evita que aparezcan a mitad de página.
  const observeIds=['lootPanel','pokedexOverlay','pcBoxOverlay','skillTreeOverlay','achievementsOverlay','pokemonDetailOverlay','mainMenu','saveTransferOverlay'];
  observeIds.forEach(id=>{const el=$m(id);if(!el)return;new MutationObserver(()=>{if(isMobile()&&!el.classList.contains('hidden')){requestAnimationFrame(()=>{if(id!=='mainMenu'&&id!=='lootPanel')el.scrollTop=0;});}}).observe(el,{attributes:true,attributeFilter:['class']});});
})();

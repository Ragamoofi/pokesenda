
(()=>{
  'use strict';
  const SAVE_KEY=window.PokeSendaActiveSaveKey||'pokesenda_beta1_save_v1';
  const BACKUP_KEY=window.PokeSendaRegionBoot?.isHoennClone?'pokesenda_hoenn_backups_v1':'pokesenda_beta1_backups_v1';
  const BUILD_MARK='pokesenda_beta1_backup_seen_v1';
  const CLOUD_KEY='pokesenda_beta1_cloud_link_v1';
  const VERSION='V36.64.1';
  const BETA='BETA 1.0';
  const $=id=>document.getElementById(id);
  const toastSafe=m=>{try{if(typeof toast==='function')toast(m);else console.log(m);}catch(_){console.log(m);}};
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  // ---------- Loading screen ----------
  const boot=$('pkBootLoader'),bootStatus=$('pkBootStatus');
  const bootRegion=window.PokeSendaRegionBoot?.isHoennClone?'Hoenn':'Kanto';
  const bootMsgs=['Cargando recursos…',`Preparando ${bootRegion}…`,'Organizando tu Pokédex…','Cargando sistemas de PokéSenda…'];
  let bootIdx=0,bootTimer=setInterval(()=>{if(bootStatus)bootStatus.textContent=bootMsgs[++bootIdx%bootMsgs.length];},750);
  const finishBoot=()=>{clearInterval(bootTimer);if(bootStatus)bootStatus.textContent='¡Listo!';setTimeout(()=>{boot?.classList.add('pk-ready');setTimeout(()=>boot?.remove(),450);},260);};
  if(document.readyState==='complete')finishBoot();else window.addEventListener('load',finishBoot,{once:true});
  setTimeout(()=>{if(boot&&!boot.classList.contains('pk-ready'))finishBoot();},6500);

  // ---------- BETA / disclaimer ----------
  const menuBox=document.querySelector('#mainMenu .menu-box');
  if(menuBox&&!$('pkBetaRow')){
    const row=document.createElement('div');row.id='pkBetaRow';row.className='pk-beta-row';row.innerHTML='<span class="pk-beta-badge">BETA 1.0</span><span class="pk-beta-build">BETA 1.0 · Lanzamiento web</span>';
    menuBox.querySelector('.menu-sub')?.insertAdjacentElement('afterend',row);
  }
  if(menuBox&&!$('pkFanDisclaimer')){
    const d=document.createElement('div');d.id='pkFanDisclaimer';d.className='pk-fan-disclaimer';d.innerHTML='<b>Proyecto fan no oficial, gratuito y sin fines comerciales.</b> Pokémon y sus recursos pertenecen a sus respectivos propietarios.<br><span class="pk-font-credit">Aguante los Ras</span>';
    menuBox.querySelector('.menu-credit')?.insertAdjacentElement('afterend',d);
  }

  // ---------- Backups rotativos ----------
  function readBackups(){try{const a=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]');return Array.isArray(a)?a:[];}catch(_){return[];}}
  function writeBackups(a){
    try{localStorage.setItem(BACKUP_KEY,JSON.stringify(a.slice(0,3)));return true;}
    catch(e){
      try{const trimmed=a.slice(0,2);localStorage.setItem(BACKUP_KEY,JSON.stringify(trimmed));return true;}catch(_){return false;}
    }
  }
  function summaryRaw(raw){
    try{const s=JSON.parse(raw),owned=Array.isArray(s.owned)?s.owned.length:0,money=Math.floor(Number(s.pokedollars||0)).toLocaleString('es-CL'),routes=Object.values(s.routes||{}).reduce((n,r)=>n+Number(r?.completions||0),0),avatar=s.trainerAvatar?.name||s.trainerName||'Entrenador';return `${avatar} · ${owned} Pokémon · ₽${money} · ${routes} rutas`;}
    catch(_){return 'Partida guardada';}
  }
  function createBackup(reason='Respaldo manual',silent=false){
    try{
      const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;
      const list=readBackups();
      if(list[0]?.raw===raw){if(!silent)toastSafe('🛡️ La partida actual ya está respaldada');return true;}
      const item={createdAt:new Date().toISOString(),reason:String(reason).slice(0,120),gameVersion:VERSION,raw};
      const ok=writeBackups([item,...list].slice(0,3));
      if(!silent)toastSafe(ok?'🛡️ Respaldo local creado':'No se pudo crear el respaldo local');
      renderBackups();return ok;
    }catch(_){if(!silent)toastSafe('No se pudo crear el respaldo local');return false;}
  }
  async function restoreBackup(index){
    const list=readBackups(),item=list[index];if(!item?.raw)return;
    let ok=true;
    const msg=`Se reemplazará la partida actual por el respaldo del ${new Date(item.createdAt).toLocaleString('es-CL')}.\n\n${summaryRaw(item.raw)}\n\nMotivo: ${item.reason}`;
    try{if(typeof gameConfirm==='function')ok=await gameConfirm({title:'Restaurar respaldo local',message:msg,confirmText:'Restaurar partida',cancelText:'Cancelar',tone:'danger',symbol:'🛡️'});else ok=confirm(msg);}catch(_){ok=false;}
    if(!ok)return;
    try{const current=localStorage.getItem(SAVE_KEY);if(current&&current!==item.raw)writeBackups([{createdAt:new Date().toISOString(),reason:'Antes de restaurar otro respaldo',gameVersion:VERSION,raw:current},...list].slice(0,3));(window.PokeSendaSaveGuard?.withBypass?window.PokeSendaSaveGuard.withBypass(()=>localStorage.setItem(SAVE_KEY,item.raw)):localStorage.setItem(SAVE_KEY,item.raw));sessionStorage.setItem('pokesenda_backup_restored_v364050','1');location.reload();}catch(_){toastSafe('No se pudo restaurar el respaldo');}
  }
  function renderBackups(){
    const box=$('pkBackupList');if(!box)return;const list=readBackups();
    if(!list.length){box.innerHTML='<div class="pk-backup-empty">Todavía no hay respaldos locales. PokéSenda los creará automáticamente antes de operaciones importantes.</div>';return;}
    box.innerHTML=list.map((x,i)=>`<div class="pk-backup-card"><div><b>${escapeHtml(new Date(x.createdAt).toLocaleString('es-CL'))}</b><span>${escapeHtml(summaryRaw(x.raw))}</span><small>${escapeHtml(x.reason||'Respaldo')} · ${escapeHtml(x.gameVersion||'')}</small></div><button class="btn" type="button" data-pk-restore="${i}">Restaurar</button></div>`).join('');
    box.querySelectorAll('[data-pk-restore]').forEach(b=>b.addEventListener('click',()=>restoreBackup(Number(b.dataset.pkRestore))));
  }
  function openBackups(){renderBackups();$('pkBackupOverlay')?.classList.remove('hidden');}
  function closeBackups(){$('pkBackupOverlay')?.classList.add('hidden');}
  window.PokeSendaBackups={create:createBackup,list:readBackups,open:openBackups};

  // Primera apertura de esta build: conservar snapshot del save que llegó desde la versión anterior.
  setTimeout(()=>{try{if(!localStorage.getItem(BUILD_MARK)&&localStorage.getItem(SAVE_KEY)){createBackup('Respaldo automático al actualizar a '+VERSION,true);localStorage.setItem(BUILD_MARK,'1');}}catch(_){}},300);

  $('pkBackupCloseBtn')?.addEventListener('click',closeBackups);$('pkBackupOverlay')?.addEventListener('click',e=>{if(e.target===$('pkBackupOverlay'))closeBackups();});$('pkBackupCreateBtn')?.addEventListener('click',()=>createBackup('Respaldo manual'));

  // Diagnóstico técnico retirado de la build pública.

  // Botones en Opciones (antes de Borrar progreso).
  // V36.66.xx: Respaldos pasó a existir de forma fija en el layout visual; enlazar también el botón ya existente.
  const reset=$('optionsResetBtn');
  let optionsBackups=$('optionsBackupsBtn');
  if(reset&&!optionsBackups){optionsBackups=document.createElement('button');optionsBackups.id='optionsBackupsBtn';optionsBackups.className='btn';optionsBackups.type='button';optionsBackups.textContent='🛡️ Respaldos';reset.parentElement?.insertBefore(optionsBackups,reset);}
  if(optionsBackups&&optionsBackups.dataset.pkBackupsBound!=='1'){optionsBackups.dataset.pkBackupsBound='1';optionsBackups.addEventListener('click',openBackups);}
  // Diagnóstico técnico retirado de la build pública.

  try{if(sessionStorage.getItem('pokesenda_backup_restored_v364050')){sessionStorage.removeItem('pokesenda_backup_restored_v364050');setTimeout(()=>toastSafe('✅ Respaldo local restaurado'),800);}}catch(_){}
})();


(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const JOHTO_UNLOCK_KEY='pokesenda_johto_region_unlocked_v1';
  const HOENN_UNLOCK_KEY='pokesenda_hoenn_region_requirement_v1';
  const HOENN_SAVE_KEY='pokesenda_hoenn_isolated_v1';

  function kantoBadges(){
    // En el clon técnico de Hoenn, PokeSendaKantoGlobalBridge apunta al motor clonado.
    // El requisito regional debe seguir leyendo la partida Kanto REAL.
    if(window.PokeSendaRegionBoot?.isHoennClone){try{const s=window.PokeSendaKantoSaveResolver?.resolve?.()?.data||JSON.parse(localStorage.getItem('pokesenda_beta1_save_v1')||'null');const n=Array.isArray(s?.gyms?.badges)?s.gyms.badges.length:0;return Math.max(0,Math.min(8,Math.floor(Number(n)||0)));}catch(_){return 0;}}
    const n=Number(window.PokeSendaKantoGlobalBridge?.summary?.()?.badges||0);
    return Number.isFinite(n)?Math.max(0,Math.min(8,Math.floor(n))):0;
  }
  function johtoStarted(){
    try{
      const live=window.PokeSendaJohtoIsolated?.getState?.()||window.PokeSendaJohtoBattleIsolated?.getState?.()||{};
      if(live?.starter)return true;
      const saved=JSON.parse(localStorage.getItem('pokesenda_johto_dev_isolated_v1')||'null');
      return !!saved?.starter;
    }catch(_){return false;}
  }
  function johtoBadges(){
    try{
      const live=window.PokeSendaJohtoBattleIsolated?.collectionSnapshot?.();
      if(Array.isArray(live?.badges))return Math.max(0,Math.min(8,live.badges.length));
      const saved=JSON.parse(localStorage.getItem('pokesenda_johto_dev_isolated_v1')||'null');
      const badges=Array.isArray(saved?.gyms?.badges)?saved.gyms.badges.length:0;
      return Math.max(0,Math.min(8,Math.floor(Number(badges)||0)));
    }catch(_){return 0;}
  }
  function hoennStarted(){
    try{return !!window.PokeSendaHoennScaffold?.isStarted?.();}catch(_){return false;}
  }
  function persistHoennRequirement(){try{localStorage.setItem(HOENN_UNLOCK_KEY,'1');}catch(_){} }
  function hoennRequirementMet(){
    let permanent=false;try{permanent=localStorage.getItem(HOENN_UNLOCK_KEY)==='1';}catch(_){}
    // El save técnico de Hoenn NO cuenta como desbloqueo. El requisito jugable sigue siendo 8 Medallas de Johto.
    const earned=johtoBadges()>=8;
    if(earned&&!permanent){persistHoennRequirement();permanent=true;}
    return permanent||earned;
  }
  function persistUnlock(){
    try{localStorage.setItem(JOHTO_UNLOCK_KEY,'1');}catch(_){}
  }
  function johtoUnlocked(){
    let permanent=false;
    try{permanent=localStorage.getItem(JOHTO_UNLOCK_KEY)==='1';}catch(_){}
    const earned=kantoBadges()>=8;
    const legacy=johtoStarted();
    if((earned||legacy)&&!permanent){persistUnlock();permanent=true;}
    return permanent||earned||legacy;
  }
  function hoennTechnicalPreviewAllowed(){return !!window.PokeSendaRegionBoot?.localDev;}
  function hoennCloneActive(){return !!window.PokeSendaRegionBoot?.isHoennClone;}
  function regionMessage(html){
    const msg=$('regionComingMessage');if(!msg)return;
    msg.innerHTML=html;msg.classList.remove('flash');void msg.offsetWidth;msg.classList.add('flash');
    setTimeout(()=>msg.classList.remove('flash'),650);
  }
  function syncTopRegionButton(_unlocked=johtoUnlocked()){
    const btn=$('regionSwitchBtn'),sm=btn?.querySelector('.region-switch-copy small');
    if(sm)sm.textContent='Cambiar región';
  }
  function prepareJohtoCard(){
    const card=$('regionJohtoCard');if(!card)return;
    const unlocked=johtoUnlocked(),badges=kantoBadges();
    card.classList.remove('current','available','coming');
    card.classList.add(unlocked?'available':'coming');
    card.removeAttribute('disabled');
    card.setAttribute('aria-disabled',String(!unlocked));
    card.setAttribute('aria-label',unlocked?'Johto, disponible · viajar':`Johto, bloqueado · ${badges}/8 Medallas de Kanto`);
    const badge=card.querySelector('.region-state-badge');
    if(badge)badge.textContent=unlocked?'Viajar a Johto':`🔒 ${badges}/8 Medallas`;
    let lock=card.querySelector('.region-lock');
    if(unlocked){lock?.remove();}
    else{
      if(!lock){
        lock=document.createElement('span');lock.className='region-lock';lock.setAttribute('aria-hidden','true');
        card.querySelector('.region-card-top')?.appendChild(lock);
      }
      lock.textContent='🔒';
    }
    const small=card.querySelector('.region-card-name span');
    if(small)small.textContent=unlocked?'Disponible':'Bloqueado';
    const info=card.querySelector('.region-card-info p');
    if(info)info.textContent=unlocked
      ?'La segunda campaña de PokéSenda está desbloqueada. Explora Johto y usa la Expedición Infinita Global para combinar regiones.'
      :`Consigue las 8 Medallas de Kanto para desbloquear Johto. Progreso actual: ${badges}/8 Medallas.`;
    const feature=card.querySelector('.region-feature-row');
    if(feature)feature.innerHTML='<span>131 Pokémon</span><span>3 rutas</span><span>Infinita Global</span><span>8 Gimnasios</span>';
    const msg=$('regionComingMessage');
    if(msg)msg.innerHTML=unlocked
      ?'<strong>✅ Johto está desbloqueado.</strong> Puedes viajar cuando quieras y seguir avanzando hacia la Expedición Infinita Global.'
      :`<strong>🔒 Johto se desbloquea con las 8 Medallas de Kanto.</strong> Llevas ${badges}/8.`;
    const foot=document.querySelector('#regionSelectOverlay .region-footer-note');
    if(foot)foot.textContent=unlocked
      ?'Kanto y Johto ya están disponibles. La Expedición Infinita Global es el modo pensado para combinar Pokémon de distintas regiones.'
      :'Completa los 8 Gimnasios de Kanto para abrir Johto. Después también podrás aprovechar la Expedición Infinita Global.';
    syncTopRegionButton(unlocked);
  }
  function prepareHoennCard(){
    const card=$('regionHoennCard');if(!card)return;
    if(window.PokeSendaHoennRelease?.enabled!==true){card.hidden=true;card.style.display='none';card.setAttribute('aria-hidden','true');card.onclick=null;return;}
    card.hidden=false;card.style.removeProperty('display');card.removeAttribute('aria-hidden');
    const badges=johtoBadges(),met=hoennRequirementMet(),dev=hoennTechnicalPreviewAllowed(),active=hoennCloneActive(),available=met||dev||hoennStarted();
    card.classList.remove('current','available','coming','requirement-met');card.classList.add(active?'current':available?'available':'coming');if(met&&!active)card.classList.add('requirement-met');
    card.removeAttribute('disabled');card.setAttribute('aria-disabled',String(!active&&!available));
    card.setAttribute('aria-label',active?'Hoenn, región actual':available?'Hoenn, disponible · viajar':`Hoenn, bloqueado · ${badges}/8 Medallas de Johto`);
    const badge=card.querySelector('.region-state-badge');if(badge)badge.textContent=active?'Región actual':available?'Viajar a Hoenn':`🔒 ${badges}/8 Medallas de Johto`;
    let lock=card.querySelector('.region-lock');if(available&&!active){lock?.remove();lock=null;}else if(!lock){lock=document.createElement('span');lock.className='region-lock';lock.setAttribute('aria-hidden','true');card.querySelector('.region-card-top')?.appendChild(lock);}if(lock)lock.textContent=active?'🌊':'🔒';
    const small=card.querySelector('.region-card-name span');if(small)small.textContent=active?'Campaña activa':available?'Disponible':'Bloqueado';
    const info=card.querySelector('.region-card-info p');if(info)info.textContent=active?'Tercera campaña de PokéSenda. Hoenn conserva su propio progreso regional y comparte únicamente los sistemas globales.':available?'Hoenn está disponible: Gen III completa, tres rutas, Pokédex regional, ocho Gimnasios y save propio.':`Consigue las 8 Medallas de Johto para desbloquear Hoenn. Progreso actual: ${badges}/8 Medallas.`;
    const feature=card.querySelector('.region-feature-row');if(feature)feature.innerHTML='<span>138 Pokémon</span><span>3 rutas</span><span>Infinita Global</span><span>8 Gimnasios</span>';
  }
  function prepareKantoCardForBoot(){
    const card=$('regionKantoCard');if(!card)return;const active=hoennCloneActive();
    card.classList.toggle('current',!active);card.classList.toggle('available',active);
    card.setAttribute('aria-label',active?'Kanto · volver a la región maestra':'Kanto, región actual');
    const badge=card.querySelector('.region-state-badge');if(badge)badge.textContent=active?'Volver a Kanto':'Región actual';
    const small=card.querySelector('.region-card-name span');if(small)small.textContent=active?'Plantilla maestra':'Disponible';
    if(active){card.setAttribute('role','button');card.tabIndex=0;card.style.cursor='pointer';const go=()=>{try{sessionStorage.setItem('pokesenda_menu_region_autoplay_v1','kanto');}catch(_){}window.PokeSendaRegionBoot?.enterKanto?.();};card.onclick=go;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};}else{card.removeAttribute('role');card.removeAttribute('tabindex');card.style.removeProperty('cursor');card.onclick=null;card.onkeydown=null;}
  }
  function travelHoenn(){
    if(window.PokeSendaHoennRelease?.enabled!==true)return;
    prepareHoennCard();const n=johtoBadges(),available=hoennRequirementMet()||hoennTechnicalPreviewAllowed()||hoennStarted();
    if(!available){regionMessage(`<strong>🔒 Hoenn todavía está bloqueado.</strong> Necesitas las 8 Medallas de Johto. Progreso: ${n}/8.`);return;}
    const busy=window.PokeSendaKantoGlobalBridge?.globalBusy?.()||{};if(busy.run||busy.gym){regionMessage('<strong>⚠️ Termina primero la actividad actual.</strong> Hoenn usa un save regional separado y necesita recargar PokéSenda.');return;}
    try{sessionStorage.setItem('pokesenda_menu_region_autoplay_v1','hoenn');}catch(_){}
    closeRegions();window.PokeSendaHoennRuntime?.openCampaign?.();
  }
  function prepareRegionCards(){
    prepareKantoCardForBoot();prepareJohtoCard();prepareHoennCard();
    const line=document.querySelector('#regionSelectOverlay .region-current-line');
    if(line&&hoennCloneActive())line.innerHTML='<span class="region-current-dot"></span> Región activa: <b>Hoenn</b> <span>·</span> Campaña completa con save regional aislado.';
    const msg=$('regionComingMessage');if(msg&&hoennCloneActive())msg.innerHTML='<strong>🌊 Hoenn es la región activa.</strong> Kanto y Johto conservan intacto su progreso; puedes cambiar de región cuando quieras fuera de una actividad.';
    const foot=document.querySelector('#regionSelectOverlay .region-footer-note');
    if(foot&&window.PokeSendaHoennRelease?.enabled===true){
      const hb=johtoBadges(),ha=hoennRequirementMet()||hoennStarted();
      foot.textContent=ha
        ?'Kanto, Johto y Hoenn están disponibles y mantienen partidas regionales separadas. La Expedición Infinita Global permite combinar Pokémon de las tres regiones.'
        :'Kanto y Johto están disponibles. Hoenn se desbloquea con las 8 Medallas de Johto ('+hb+'/8); cada región conserva su propio progreso.';
    }
  }
  function openRegions(){
    prepareRegionCards();
    $('regionSelectOverlay')?.classList.remove('hidden');
    $('regionSwitchBtn')?.setAttribute('aria-expanded','true');
  }
  function closeRegions(){
    $('regionSelectOverlay')?.classList.add('hidden');
    $('regionSwitchBtn')?.setAttribute('aria-expanded','false');
  }
  function travelJohto(){
    prepareJohtoCard();
    if(!johtoUnlocked()){
      const n=kantoBadges();
      regionMessage(`<strong>🔒 Johto todavía está bloqueado.</strong> Necesitas las 8 Medallas de Kanto. Progreso: ${n}/8.`);
      return;
    }
    const busy=window.PokeSendaKantoGlobalBridge?.globalBusy?.()||{};
    if(busy.run||busy.gym){
      regionMessage('<strong>⚠️ Termina primero la actividad de Kanto.</strong> Detén la expedición o sal del Gimnasio antes de viajar a Johto.');
      return;
    }
    closeRegions();
    const rt=window.PokeSendaJohtoRuntime;
    if(rt?.open){if(johtoStarted()&&rt.showGame){rt.showGame();return;}rt.open();return;}
    regionMessage('<strong>Johto no pudo inicializarse.</strong> Cierra y vuelve a abrir PokéSenda.');
  }
  function boot(){
    prepareRegionCards();
    $('regionSwitchBtn')?.addEventListener('click',openRegions);
    $('regionSwitchBtn')?.addEventListener('mouseenter',()=>syncTopRegionButton());
    $('regionSelectCloseBtn')?.addEventListener('click',closeRegions);
    $('regionJohtoCard')?.addEventListener('click',travelJohto);
    $('regionHoennCard')?.addEventListener('click',travelHoenn);
    $('regionSelectOverlay')?.addEventListener('click',e=>{if(e.target===$('regionSelectOverlay'))closeRegions();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('regionSelectOverlay')?.classList.contains('hidden'))closeRegions();});
    window.addEventListener('storage',e=>{if([JOHTO_UNLOCK_KEY,HOENN_UNLOCK_KEY,'pokesenda_beta1_save_v1','pokesenda_johto_dev_isolated_v1',HOENN_SAVE_KEY].includes(e.key))prepareRegionCards();});
  }
  window.PokeSendaRegionProgression={
    johtoUnlocked,
    kantoBadges,
    johtoStarted,
    johtoBadges,
    hoennStarted,
    hoennRequirementMet,
    unlockKey:JOHTO_UNLOCK_KEY,
    hoennRequirementKey:HOENN_UNLOCK_KEY,
    hoennSaveKey:HOENN_SAVE_KEY,
    refresh:prepareRegionCards
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

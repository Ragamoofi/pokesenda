
(()=>{
  'use strict';
  const LAST_KEY='pokesenda_menu_region_choice_v1';
  const AUTOPLAY_KEY='pokesenda_menu_region_autoplay_v1';
  // V36.72.1: sin MutationObserver global de clases; evita bucles durante el boot.
  const SAVE={kanto:'pokesenda_beta1_save_v1',johto:'pokesenda_johto_dev_isolated_v1',hoenn:'pokesenda_hoenn_isolated_v1'};
  const LABEL={kanto:'Kanto',johto:'Johto',hoenn:'Hoenn'};
  let selected='kanto',autoplayDone=false,refreshQueued=false;

  const parse=k=>{try{if(k==='kanto'){const r=window.PokeSendaKantoSaveResolver?.resolve?.();if(r?.data)return r.data;}const v=JSON.parse(localStorage.getItem(SAVE[k])||'null');return v&&typeof v==='object'?v:null;}catch(_){return null;}};
  const saveStarted=(region,s)=>!!(s?.starter||(Array.isArray(s?.owned)&&s.owned.length)||(region==='johto'&&s?.pokemon&&Object.keys(s.pokemon).length));
  const badges=s=>Math.max(0,Math.min(8,Array.isArray(s?.gyms?.badges)?s.gyms.badges.length:Number(s?.badges||0)||0));
  const money=s=>Math.floor(Number(s?.pokedollars??s?.money??0)||0);
  const dexCount=(region,s)=>{
    if(!s)return 0;
    if(Array.isArray(s.dexSeen))return new Set(s.dexSeen.map(Number).filter(Number.isFinite)).size;
    if(Array.isArray(s.dex))return new Set(s.dex.map(x=>typeof x==='object'?(x.dex??x.id):x).map(Number).filter(Number.isFinite)).size;
    if(s.pokemon&&typeof s.pokemon==='object')return Object.keys(s.pokemon).length;
    return Array.isArray(s.owned)?s.owned.length:0;
  };
  const total=region=>region==='kanto'?151:region==='johto'?131:138;
  const regionState=region=>{
    const p=window.PokeSendaRegionProgression;
    if(region==='kanto')return {available:true,state:'Disponible'};
    if(region==='johto'){
      const n=Number(p?.kantoBadges?.()||0),ok=!!p?.johtoUnlocked?.();
      return {available:ok,state:ok?'Disponible':`🔒 ${n}/8 Medallas de Kanto`,reason:`Johto se desbloquea con las 8 Medallas de Kanto. Llevas ${n}/8.`};
    }
    const released=window.PokeSendaHoennRelease?.enabled===true;
    if(!released)return {available:false,prelaunch:true,state:'PRELANZAMIENTO',reason:'Hoenn sigue en prelanzamiento en esta versión. No se modifica su bloqueo.'};
    const n=Number(p?.johtoBadges?.()||0),ok=!!p?.hoennRequirementMet?.()||!!p?.hoennStarted?.();
    return {available:ok,state:ok?'Disponible':`🔒 ${n}/8 Medallas de Johto`,reason:`Hoenn se desbloquea con las 8 Medallas de Johto. Llevas ${n}/8.`};
  };
  const summary=region=>{
    const s=parse(region),started=saveStarted(region,s),b=badges(s),d=dexCount(region,s),m=money(s);
    if(!started)return regionState(region).prelaunch?'Campaña preparada · todavía no publicada':'Partida nueva';
    return `${b}/8 medallas · Dex ${d}/${total(region)} · ₽${m.toLocaleString('es-CL')}`;
  };
  const loadChoice=()=>{
    const boot=window.PokeSendaRegionBoot?.region;
    if(boot==='hoenn'&&window.PokeSendaHoennRelease?.enabled===true)return 'hoenn';
    let v='kanto';try{v=localStorage.getItem(LAST_KEY)||'kanto';}catch(_){}
    if(!['kanto','johto','hoenn'].includes(v))v='kanto';
    if(!regionState(v).available)v='kanto';
    return v;
  };
  const persist=region=>{try{localStorage.setItem(LAST_KEY,region);}catch(_){}};
  const message=(menu,msg,tone='')=>{const el=menu?.querySelector('[data-pk-region-message]');if(!el)return;el.textContent=msg||'';el.classList.toggle('warn',tone==='warn');el.classList.toggle('good',tone==='good');};
  const menuActiveRegion=menu=>menu?.closest('#pkRegionRuntimeRoot')?'johto':(window.PokeSendaRegionBoot?.region==='hoenn'?'hoenn':'kanto');

  function renderMenu(menu){
    if(!menu)return;
    menu.classList.remove('pk-menu-region-kanto','pk-menu-region-johto','pk-menu-region-hoenn');
    menu.classList.add(`pk-menu-region-${selected}`);
    menu.querySelectorAll('[data-pk-menu-region]').forEach(card=>{
      const r=card.dataset.pkMenuRegion,st=regionState(r),sel=r===selected;
      card.setAttribute('aria-pressed',String(sel));card.setAttribute('aria-disabled',String(!st.available));
      card.classList.toggle('locked',!st.available&&!st.prelaunch);card.classList.toggle('prelaunch',!!st.prelaunch);
      const stateEl=card.querySelector('[data-pk-region-state]'),prog=card.querySelector('[data-pk-region-progress]');
      if(stateEl)stateEl.textContent=st.state;if(prog)prog.textContent=summary(r);
      card.title=st.available?`${LABEL[r]} · ${summary(r)}`:st.reason||st.state;
    });
    const st=regionState(selected),s=parse(selected),started=saveStarted(selected,s),play=menu.querySelector('#menuPlayBtn'),info=menu.querySelector('#menuSaveInfo');
    if(play){play.textContent=`${started?'Continuar':'Jugar'} ${LABEL[selected]}`;play.disabled=!st.available;play.title=st.available?`${started?'Continuar':'Comenzar'} la campaña de ${LABEL[selected]}`:(st.reason||`${LABEL[selected]} no está disponible`);}
    const desired=st.available?`${LABEL[selected]} · ${summary(selected)}`:`${LABEL[selected]} · ${st.state}`;
    if(info&&info.textContent!==desired)info.textContent=desired;
    if(st.available)message(menu,`${LABEL[selected]} seleccionada · el botón principal abrirá esta campaña.`,'good');
    else message(menu,st.reason||`${LABEL[selected]} no está disponible.`, 'warn');
  }
  function renderAll(){document.querySelectorAll('#mainMenu').forEach(renderMenu);}
  function choose(region,menu){
    const st=regionState(region);
    if(!st.available){message(menu,st.reason||`${LABEL[region]} no está disponible.`, 'warn');return false;}
    selected=region;persist(region);renderAll();return true;
  }
  function scheduleRender(){if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;renderAll();});}
  function originalKantoPlay(){const btn=document.querySelector('body > #mainMenu #menuPlayBtn');if(btn)btn.click();}
  function routePlay(btn,e){
    const menu=btn.closest('#mainMenu');if(!menu)return;
    const st=regionState(selected);if(!st.available){e.preventDefault();e.stopImmediatePropagation();message(menu,st.reason||'Región bloqueada.','warn');return;}
    persist(selected);
    const active=menuActiveRegion(menu),boot=window.PokeSendaRegionBoot?.region==='hoenn'?'hoenn':'kanto';
    if(selected==='johto'){
      if(active==='johto')return; // deja actuar al botón original del runtime Johto
      e.preventDefault();e.stopImmediatePropagation();
      const rt=window.PokeSendaJohtoRuntime;
      if(rt?.open){rt.open();return;}
      message(menu,'Johto todavía no terminó de inicializarse. Inténtalo nuevamente.','warn');return;
    }
    if(selected==='hoenn'){
      if(boot==='hoenn'&&active!=='johto')return; // botón original ya controla el clon Hoenn
      e.preventDefault();e.stopImmediatePropagation();
      if(active==='johto')try{window.PokeSendaJohtoRuntime?.close?.();}catch(_){}
      try{sessionStorage.setItem(AUTOPLAY_KEY,'hoenn');}catch(_){}
      window.PokeSendaRegionBoot?.enterHoennClone?.();return;
    }
    // Kanto
    if(boot==='hoenn'){
      e.preventDefault();e.stopImmediatePropagation();
      if(active==='johto')try{window.PokeSendaJohtoRuntime?.close?.();}catch(_){}
      try{sessionStorage.setItem(AUTOPLAY_KEY,'kanto');}catch(_){}
      window.PokeSendaRegionBoot?.enterKanto?.();return;
    }
    if(active==='johto'){
      e.preventDefault();e.stopImmediatePropagation();
      try{window.PokeSendaJohtoRuntime?.close?.();}catch(_){}
      setTimeout(originalKantoPlay,40);return;
    }
    // Kanto sobre Kanto: deja pasar el handler original.
  }
  function maybeAutoplay(){
    if(autoplayDone)return;let want='';try{want=sessionStorage.getItem(AUTOPLAY_KEY)||'';}catch(_){}
    if(!want)return;
    const boot=window.PokeSendaRegionBoot?.region==='hoenn'?'hoenn':'kanto';
    if(want!==boot)return;
    autoplayDone=true;try{sessionStorage.removeItem(AUTOPLAY_KEY);}catch(_){}
    selected=want;persist(want);renderAll();setTimeout(()=>document.querySelector('body > #mainMenu #menuPlayBtn')?.click(),80);
  }
  function bindMenu(menu){
    if(!menu||menu.dataset.pkRegionSelectorBound==='1')return;menu.dataset.pkRegionSelectorBound='1';
    menu.addEventListener('click',ev=>{const card=ev.target.closest('[data-pk-menu-region]');if(!card||!menu.contains(card))return;ev.preventDefault();choose(card.dataset.pkMenuRegion,menu);});
    const info=menu.querySelector('#menuSaveInfo');if(info){new MutationObserver(()=>{const st=regionState(selected),desired=st.available?`${LABEL[selected]} · ${summary(selected)}`:`${LABEL[selected]} · ${st.state}`;if(info.textContent!==desired)info.textContent=desired;}).observe(info,{childList:true,characterData:true,subtree:true});}
  }
  function scan(){document.querySelectorAll('#mainMenu').forEach(bindMenu);renderAll();}
  function boot(){
    selected=loadChoice();scan();
    document.addEventListener('click',e=>{const btn=e.target.closest?.('#menuPlayBtn');if(btn&&btn.closest('#mainMenu'))routePlay(btn,e);},true);
    // Mantener la última región real también al usar el selector interno existente.
    document.addEventListener('click',e=>{
      const card=e.target.closest?.('#regionKantoCard,#regionJohtoCard,#regionHoennCard');if(!card)return;
      const r=card.id==='regionKantoCard'?'kanto':card.id==='regionJohtoCard'?'johto':'hoenn';
      if(regionState(r).available){selected=r;persist(r);setTimeout(renderAll,0);}
    },true);
    // Importante: NO observar cambios de class del juego. El selector también cambia clases
    // visuales y observarlas provocaría un bucle de MutationObserver durante el arranque.
    // Los menús regionales ya nacen desde el mismo #mainMenu, así que bastan repasos puntuales.
    window.addEventListener('storage',e=>{if([SAVE.kanto,SAVE.johto,SAVE.hoenn,'pokesenda_johto_region_unlocked_v1','pokesenda_hoenn_region_requirement_v1',LAST_KEY].includes(e.key)){if(e.key===LAST_KEY)selected=loadChoice();scheduleRender();}});
    window.addEventListener('focus',scheduleRender);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRender();});
    setTimeout(()=>{scan();maybeAutoplay();},120);
    setTimeout(scan,650);
    window.PokeSendaMenuRegionSelector={get:()=>selected,set:r=>choose(r,document.querySelector('body > #mainMenu')),refresh:renderAll};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

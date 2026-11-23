
/* Hoenn · aviso breve de economía/dificultad · máximo 2 veces por cuenta/dispositivo */
(()=>{
  'use strict';
  const BASE='pokesenda_hoenn_launch_notice_20260919_v2';
  const MAX_SHOWS=2;
  let pollTimer=0;
  function accountToken(){
    try{const link=JSON.parse(localStorage.getItem('pokesenda_beta1_cloud_link_v1')||'null');if(link?.slotId)return 'cloud_'+String(link.slotId).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);}catch(_){}
    return 'local';
  }
  function key(){return BASE+'_'+accountToken()}
  // Rework etapa 1: el aviso de Hoenn es para quien ya juega; un jugador nuevo empieza en Kanto sin interrupciones.
  function hasExistingProgress(){
    for(const k of ['pokesenda_beta1_save_v1','pokesenda_johto_dev_isolated_v1','pokesenda_hoenn_isolated_v1']){
      try{const s=JSON.parse(localStorage.getItem(k)||'null');if(s&&s.progress&&Object.keys(s.progress).length)return true;}catch(_){}
    }
    return false;
  }
  function countShown(){try{return Math.max(0,Number(localStorage.getItem(key())||0)||0)}catch(_){return 0}}
  function visible(el){if(!el||el.classList.contains('hidden'))return false;try{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0}catch(_){return true}}
  function anotherModalIsOpen(){return [...document.querySelectorAll('.overlay:not(.hidden),.evo-overlay:not(.hidden),.pk-confirm-overlay:not(.hidden)')].some(el=>el.id!=='mainMenu'&&el.id!=='pkHoennLaunchNotice'&&visible(el));}
  function dismiss(){document.getElementById('pkHoennLaunchNotice')?.classList.add('hidden')}
  function showNow(){
    const overlay=document.getElementById('pkHoennLaunchNotice'),count=document.getElementById('pkHoennLaunchCount'),close=document.getElementById('pkHoennLaunchClose');
    if(!overlay||!close||window.PokeSendaHoennRelease?.enabled!==true)return false;
    const shown=countShown();if(shown>=MAX_SHOWS)return false;
    const next=Math.min(MAX_SHOWS,shown+1);try{localStorage.setItem(key(),String(next))}catch(_){}
    if(count)count.textContent=next+' / '+MAX_SHOWS;
    overlay.classList.remove('hidden');try{close.focus({preventScroll:true})}catch(_){}
    return true;
  }
  function tryShow(){if(window.PokeSendaHoennRelease?.enabled!==true){clearInterval(pollTimer);return}if(countShown()>=MAX_SHOWS){clearInterval(pollTimer);return}if(anotherModalIsOpen())return;if(showNow())clearInterval(pollTimer);}
  function boot(){
    const overlay=document.getElementById('pkHoennLaunchNotice'),close=document.getElementById('pkHoennLaunchClose');
    if(!overlay||!close||window.PokeSendaHoennRelease?.enabled!==true||countShown()>=MAX_SHOWS)return;
    if(!hasExistingProgress()){try{localStorage.setItem(key(),String(MAX_SHOWS))}catch(_){}return;}
    close.addEventListener('click',dismiss);overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss()});
    setTimeout(tryShow,1250);pollTimer=setInterval(tryShow,700);setTimeout(()=>{if(pollTimer)clearInterval(pollTimer)},10*60*1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* Centro de Recuperación · aviso de entrada máximo 2 veces por cuenta/dispositivo */
(()=>{
  'use strict';
  const BASE='pokesenda_recovery_launch_notice_v1';
  const MAX_SHOWS=2;
  function accountToken(){
    try{
      const link=JSON.parse(localStorage.getItem('pokesenda_beta1_cloud_link_v1')||'null');
      if(link?.slotId)return 'cloud_'+String(link.slotId).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);
    }catch(_){}
    return 'local';
  }
  function key(){return BASE+'_'+accountToken()}
  function hasExistingProgress(){
    for(const k of ['pokesenda_beta1_save_v1','pokesenda_johto_dev_isolated_v1','pokesenda_hoenn_isolated_v1']){
      try{const s=JSON.parse(localStorage.getItem(k)||'null');if(s&&s.progress&&Object.keys(s.progress).length)return true;}catch(_){}
    }
    return false;
  }
  function boot(){
    const overlay=document.getElementById('pkRecoveryLaunchNotice');
    const close=document.getElementById('pkRecoveryLaunchClose');
    const open=document.getElementById('pkRecoveryLaunchOpen');
    const count=document.getElementById('pkRecoveryLaunchCount');
    if(!overlay||!close||!open)return;
    let shown=0;
    try{shown=Math.max(0,Number(localStorage.getItem(key())||0)||0)}catch(_){shown=0}
    if(shown>=MAX_SHOWS)return;
    // Rework etapa 1: un jugador nuevo no tiene partidas que recuperar; no le mostramos este aviso.
    if(!hasExistingProgress()){try{localStorage.setItem(key(),String(MAX_SHOWS))}catch(_){}return;}
    const next=Math.min(MAX_SHOWS,shown+1);
    try{localStorage.setItem(key(),String(next))}catch(_){}
    if(count)count.textContent='Aviso '+next+' de '+MAX_SHOWS;
    setTimeout(()=>{
      overlay.classList.remove('hidden');
      try{open.focus({preventScroll:true})}catch(_){}
    },520);
    const dismiss=()=>overlay.classList.add('hidden');
    close.addEventListener('click',dismiss);
    overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss()});
    open.addEventListener('click',()=>{
      dismiss();
      try{window.PokeSendaRecovery?.open?.()}catch(_){}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

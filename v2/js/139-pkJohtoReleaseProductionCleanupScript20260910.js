
(()=>{
  'use strict';
  function cleanup(){
    // Defensa extra: elimina cualquier resto de diagnóstico/QA que pudiera existir por DOM heredado. Backups/transferencia/Cloud permanecen.
    document.querySelectorAll('#optionsDiagnosticBtn,.pk-johto-dev-tools,.pk-johto-qa-menu,.pk-j-qa-overlay').forEach(n=>n.remove());
    document.querySelector('body > #pkDiagnosticOverlay')?.remove();

    // Si Johto ya fue construido antes de esta pasada, también se limpia su clon.
    document.querySelectorAll('#pkRegionRuntimeRoot #optionsDiagnosticBtn,#pkRegionRuntimeRoot #pkDiagnosticOverlay').forEach(n=>n.remove());

    // El root antiguo queda siempre cerrado; el runtime público es #pkRegionRuntimeRoot.
    const legacy=document.getElementById('pkIsoJohtoRoot');
    if(legacy){legacy.classList.add('hidden');legacy.setAttribute('aria-hidden','true');}

    // Mensaje local después de usar "Reiniciar solo Johto".
    try{
      if(sessionStorage.getItem('pokesenda_johto_reset_notice_v1')){
        sessionStorage.removeItem('pokesenda_johto_reset_notice_v1');
        setTimeout(()=>{
          const t=document.querySelector('body > .game #toast');
          if(t){
            t.textContent='🍂 Johto reiniciado. Kanto y la Expedición Infinita Global se conservaron.';
            t.classList.add('show');
            setTimeout(()=>t.classList.remove('show'),3200);
          }
        },900);
      }
    }catch(_){}
  }
  cleanup();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  setTimeout(cleanup,800);
  setTimeout(cleanup,2200);
})();

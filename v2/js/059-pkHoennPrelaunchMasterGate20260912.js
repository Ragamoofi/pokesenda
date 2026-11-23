
(()=>{
  'use strict';
  // INTERRUPTOR MAESTRO DE LANZAMIENTO DE HOENN.
  // 19/09/2026 · Lanzamiento público: Hoenn queda habilitado manteniendo
  // el requisito de progresión de 8 Medallas de Johto y su save regional aislado.
  const HOENN_RELEASED=true;
  window.PokeSendaHoennRelease={enabled:HOENN_RELEASED,phase:HOENN_RELEASED?'released':'prelaunch',label:'Hoenn'};
  document.documentElement.classList.toggle('pk-hoenn-prelaunch',!HOENN_RELEASED);
  if(!HOENN_RELEASED){
    try{sessionStorage.removeItem('pokesenda_active_region_boot_v1');}catch(_){}
  }
})();

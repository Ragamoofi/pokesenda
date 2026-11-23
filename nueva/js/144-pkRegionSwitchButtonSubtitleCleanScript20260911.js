
(()=>{
  'use strict';
  function apply(){
    document.querySelectorAll('#regionSwitchBtn .region-switch-copy small').forEach(el=>{
      el.textContent='Cambiar región';
    });
  }
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  setTimeout(apply,250);
  setTimeout(apply,1200);
})();

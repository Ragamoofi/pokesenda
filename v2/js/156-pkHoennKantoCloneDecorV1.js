
(()=>{
  'use strict';
  if(!window.PokeSendaRegionBoot?.isHoennClone)return;
  function decorate(){
    document.body.classList.add('pk-hoenn-kanto-clone');
    document.title='PokéSenda';
    const menu=document.getElementById('mainMenu');
    const logo=menu?.querySelector('.menu-logo'),sub=menu?.querySelector('.menu-sub');
    if(logo)logo.textContent='PokéSenda';
    if(sub)sub.innerHTML='<b>HOENN · REGIÓN III</b> · Campaña completa basada en la plantilla funcional maestra de Kanto';
    document.getElementById('pkHoennCloneBadge')?.remove();
    const regionCopy=document.getElementById('regionSwitchBtn')?.querySelector('.region-switch-copy'),regionStrong=regionCopy?.querySelector('b'),regionSmall=regionCopy?.querySelector('small');if(regionStrong)regionStrong.textContent='HOENN';if(regionSmall)regionSmall.textContent='Cambiar región';
    window.PokeSendaRegionProgression?.refresh?.();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
})();

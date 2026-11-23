
(()=>{
  'use strict';
  const MODE_KEY='pokesenda_active_region_boot_v1';
  const KEYS={kanto:'pokesenda_beta1_save_v1',hoenn:'pokesenda_hoenn_isolated_v1'};
  let region='kanto';
  const hoennReleased=window.PokeSendaHoennRelease?.enabled===true;
  try{region=hoennReleased&&sessionStorage.getItem(MODE_KEY)==='hoenn'?'hoenn':'kanto';}catch(_){}
  const localDev=location.protocol==='file:'||['localhost','127.0.0.1','::1'].includes(location.hostname);
  function setRegion(next){if(next==='hoenn'&&!hoennReleased)next='kanto';try{if(next==='hoenn')sessionStorage.setItem(MODE_KEY,'hoenn');else sessionStorage.removeItem(MODE_KEY);}catch(_){} location.reload();}
  if(hoennReleased&&region==='hoenn'){
    try{
      const raw=JSON.parse(localStorage.getItem(KEYS.hoenn)||'null');
      const legacyHoennPhases=new Set(['foundation','kanto_clone','technical_clone','hoenn_complete_v1']);
      if(raw&&legacyHoennPhases.has(raw.phase)){
        const migratedFrom=raw.phase;
        raw.releaseId='beta1';
        raw.region='hoenn';
        raw.phase='hoenn_complete_v2';
        raw.meta={...(raw.meta||{}),schema:4,template:'kanto',templateRule:'KANTO_ES_LA_PLANTILLA_FUNCIONAL_MAESTRA',migratedFrom,createdAt:Number(raw?.meta?.createdAt||Date.now()),updatedAt:Date.now()};
        localStorage.setItem(KEYS.hoenn,JSON.stringify(raw));
      }
    }catch(_){ }
  }
  window.PokeSendaRegionBoot={modeKey:MODE_KEY,region,keys:KEYS,isHoennClone:hoennReleased&&region==='hoenn',localDev,enterHoennClone:()=>{if(hoennReleased)setRegion('hoenn');},enterKanto:()=>setRegion('kanto')};
  window.PokeSendaActiveSaveKey=KEYS[region]||KEYS.kanto;
  document.documentElement.dataset.pkBootRegion=region;
})();

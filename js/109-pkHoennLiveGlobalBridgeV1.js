
(()=>{
'use strict';
if(!window.PokeSendaRegionBoot?.isHoennClone)return;
const live=window.PokeSendaKantoGlobalBridge,archive=window.PokeSendaHoennArchiveBridge;
if(!live)return;
window.PokeSendaHoennGlobalBridge={
  label:'Hoenn',saveKey:'pokesenda_hoenn_isolated_v1',
  catalog:[...(archive?.catalog||[])],families:archive?.families||[],routeData:archive?.routeData||null,
  collectionSnapshot:()=>live.collectionSnapshot?.()||archive?.collectionSnapshot?.()||{},
  collectionDetail:id=>live.collectionDetail?.(id)||archive?.collectionDetail?.(id)||null,
  pokemonMeta:dex=>archive?.pokemonMeta?.(dex)||null,
  roster:()=>live.roster?.()||archive?.roster?.()||[],
  formation:()=>live.currentFormation?.()||archive?.formation?.()||[],
  enemyCatalog:()=>live.enemyCatalog?.()||archive?.enemyCatalog?.()||[],
  bossCatalog:()=>live.bossCatalog?.()||archive?.bossCatalog?.()||[],
  enemyTemplate:(id,level)=>live.enemyTemplate?.(id,level)||archive?.enemyTemplate?.(id,level)||null,
  capture:(...args)=>live.capture?.(...args)||archive?.capture?.(...args),
  visualMeters:(...args)=>live.visualMeters?.(...args)??archive?.visualMeters?.(...args)??.82,
  getItemDef:id=>live.getItemDef?.(id)||archive?.getItemDef?.(id)||null,
  shinyChance:()=>live.shinyChance?.()||archive?.shinyChance?.()||1/1536,
  bossHealPct:()=>live.globalBossHealPct?.()||archive?.bossHealPct?.()||0,
  rollDrops:(...args)=>live.rollGlobalDrops?.(...args)??archive?.rollDrops?.(...args)??false,
  grantMTTicket:(...args)=>live.grantGlobalMTTicket?.(...args)??archive?.grantMTTicket?.(...args)??false,
  globalInfiniteProgress:()=>archive?.globalInfiniteProgress?.()||{tier:0,route1Complete:false,route2Complete:false,route3Complete:false,levelCap:0},
  globalAutoPotionState:()=>live.globalAutoPotionState?.()||archive?.globalAutoPotionState?.(),
  globalSetAutoPotion:value=>live.globalSetAutoPotion?.(value)??archive?.globalSetAutoPotion?.(value)??false,
  globalConsumeMedicine:id=>live.globalConsumeMedicine?.(id)||archive?.globalConsumeMedicine?.(id)||{ok:false},
  typeMultiplier:(type,types)=>live.typeMultiplier?.(type,types)??1,
  refresh:()=>live.refresh?.()
};
})();

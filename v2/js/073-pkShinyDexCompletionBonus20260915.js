
(()=>{
  "use strict";
  // Recompensa endgame deliberadamente moderada: +25% relativo por Dex regional completa
  // y +10% relativo adicional cuando Kanto + Johto + Hoenn están completas.
  // No crea una probabilidad aparte ni toca Tickets Shiny garantizados: solo multiplica la tasa normal existente.
  const CFG=Object.freeze({
    kanto:{key:"pokesenda_beta1_save_v1",total:151,fields:["dexSeen","dexOwnedHistory"]},
    johto:{key:"pokesenda_johto_dev_isolated_v1",total:131,fields:["dex"]},
    hoenn:{key:"pokesenda_hoenn_isolated_v1",total:138,fields:["dexSeen","dexOwnedHistory"]}
  });
  const read=region=>{try{if(region==='kanto'){const r=window.PokeSendaKantoSaveResolver?.resolve?.();if(r?.data)return r.data;}const raw=localStorage.getItem(CFG[region]?.key||"");const s=raw?JSON.parse(raw):null;return s&&typeof s==="object"?s:null;}catch(_){return null;}};
  const dexSet=(region,s=read(region))=>{
    const out=new Set(),cfg=CFG[region];if(!cfg||!s)return out;
    for(const field of cfg.fields){for(const entry of (Array.isArray(s[field])?s[field]:[])){const n=Number(entry&&typeof entry==="object"?(entry.dex??entry.id):entry);if(Number.isFinite(n)&&n>0)out.add(n);}}
    for(const entry of (Array.isArray(s.captureLog)?s.captureLog:[])){const n=Number(entry?.dex);if(Number.isFinite(n)&&n>0)out.add(n);}
    return out;
  };
  const stats=region=>{const cfg=CFG[region];if(!cfg)return{region,count:0,total:0,complete:false};const count=dexSet(region).size;return{region,count,total:cfg.total,complete:count>=cfg.total};};
  const allComplete=()=>Object.keys(CFG).every(r=>stats(r).complete);
  const parts=region=>{const regional=stats(region).complete?.25:0,global=allComplete()?.10:0;return{regional,global,total:regional+global};};
  const relativeBonus=region=>parts(region).total;
  const multiplier=region=>1+relativeBonus(region);
  window.PokeSendaShinyDexBonus=Object.freeze({stats,allComplete,parts,relativeBonus,multiplier,config:CFG});
})();

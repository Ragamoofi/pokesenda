
(()=>{
  'use strict';
  const PRIMARY='pokesenda_beta1_save_v1';
  const LEGACY='pokesenda_beta1_legacy_disabled_v1';
  const safeParse=raw=>{try{const x=JSON.parse(raw||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(_){return null}};
  const started=s=>!!(s&&(s.starter||(Array.isArray(s.owned)&&s.owned.length)||(s.progress&&Object.keys(s.progress).length)||(Array.isArray(s.gyms?.badges)&&s.gyms.badges.length)||['route1','route2','route3'].some(r=>Number(s.routes?.[r]?.completions||0)>0||Number(s.routes?.[r]?.bestDistance||s.routes?.[r]?.checkpoint||0)>0)));
  const score=s=>{if(!s)return -1;const badges=Array.isArray(s.gyms?.badges)?s.gyms.badges.length:0,owned=Array.isArray(s.owned)?s.owned.length:Object.keys(s.progress||{}).length,dex=Array.isArray(s.dexSeen)?new Set(s.dexSeen).size:0,routes=['route1','route2','route3'].reduce((n,r)=>n+100*Number(s.routes?.[r]?.completions||0)+Math.floor(Number(s.routes?.[r]?.bestDistance||s.routes?.[r]?.checkpoint||0)/1000),0);return (started(s)?1000000:0)+badges*100000+routes*1000+dex*10+owned;};
  function resolve(){
    const primary=safeParse(localStorage.getItem(PRIMARY));
    if(started(primary))return {data:primary,source:'primary',started:true};
    const candidates=[];
    const legacy=safeParse(localStorage.getItem(LEGACY));if(started(legacy))candidates.push({data:legacy,source:'legacy'});
    try{const recovery=window.PokeSendaSaveGuard?.getRecoveryObject?.(PRIMARY);if(started(recovery))candidates.push({data:recovery,source:'saveguard'});}catch(_){}
    candidates.sort((a,b)=>score(b.data)-score(a.data));
    if(candidates.length)return {...candidates[0],started:true,primaryWasEmpty:!!primary};
    return {data:primary,source:primary?'primary-empty':'none',started:false};
  }
  window.PokeSendaKantoSaveResolver={resolve,read:()=>{const r=resolve();return r.data?JSON.parse(JSON.stringify(r.data)):null;},started:()=>resolve().started,source:()=>resolve().source};
  window.addEventListener('load',()=>setTimeout(()=>{try{const src=sessionStorage.getItem('pokesenda_kanto_rescued_v1');if(src){sessionStorage.removeItem('pokesenda_kanto_rescued_v1');window.toast?.('🛡️ Partida de Kanto recuperada correctamente');}}catch(_){}},1200),{once:true});
})();

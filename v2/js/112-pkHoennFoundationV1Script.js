
(()=>{
  'use strict';
  const SAVE_KEY='pokesenda_hoenn_isolated_v1';
  const SCHEMA=4;
  const HOENN_RELEASED=window.PokeSendaHoennRelease?.enabled===true;
  const now=()=>Date.now();
  function blank(){
    const t=now();
    // Forma compatible con freshState() de Kanto. Kanto completa el resto al cargar.
    return {releaseId:'beta1',region:'hoenn',phase:'hoenn_complete_v2',starter:null,trainerAvatar:null,owned:[],progress:{},formation:[null,null,null,null,null,null],currentRoute:'route1',unlockedRoutes:['route1'],routes:{route1:{checkpoint:0,farmCheckpoint:null,completions:0,bosses:0,bestDistance:0,centersSeen:[]},route2:{checkpoint:0,farmCheckpoint:null,completions:0,bosses:0,bestDistance:0,centersSeen:[]},route3:{checkpoint:0,farmCheckpoint:null,completions:0,bosses:0,bestDistance:0,centersSeen:[]}},pokedollars:0,items:{},skillTree:{a3:1},tms:{},dexSeen:[],dexUnread:[],shinyDex:[],achievements:{},options:{},meta:{schema:SCHEMA,template:'kanto',templatePhase:'HOENN_COMPLETE',templateRule:'KANTO_ES_LA_PLANTILLA_FUNCIONAL_MAESTRA',createdAt:t,updatedAt:t}};
  }
  function read(){try{const v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return v&&typeof v==='object'?v:null}catch(_){return null}}
  function normalize(s){s=s&&typeof s==='object'?s:blank();s.skillTree=s.skillTree&&typeof s.skillTree==='object'?s.skillTree:{};s.skillTree.a3=Math.max(1,Number(s.skillTree.a3||0));s.releaseId='beta1';s.region='hoenn';s.phase='hoenn_complete_v2';s.meta=s.meta&&typeof s.meta==='object'?s.meta:{};s.meta.schema=SCHEMA;s.meta.template='kanto';s.meta.templatePhase='HOENN_COMPLETE';s.meta.templateRule='KANTO_ES_LA_PLANTILLA_FUNCIONAL_MAESTRA';s.meta.createdAt=Number(s.meta.createdAt||now());s.meta.updatedAt=now();return s;}
  function applyPendingJohtoRewards(s){try{const key='pokesenda_cross_region_rewards_v1',q=JSON.parse(localStorage.getItem(key)||'{}'),premium=Math.max(0,Math.floor(Number(q.hoennPremiumTickets||0))),shiny=Math.max(0,Math.floor(Number(q.hoennShinyTickets||0)));if(!premium&&!shiny)return s;s.achievements=s.achievements&&typeof s.achievements==='object'?s.achievements:{};s.achievements.premiumTickets=Math.max(0,Math.floor(Number(s.achievements.premiumTickets||0)))+premium;s.achievements.shinyTickets=Math.max(0,Math.floor(Number(s.achievements.shinyTickets||0)))+shiny;s.crossRegionRewards=s.crossRegionRewards&&typeof s.crossRegionRewards==='object'?s.crossRegionRewards:{};s.crossRegionRewards.claimedJohtoAchievements=[...new Set((Array.isArray(s.crossRegionRewards.claimedJohtoAchievements)?s.crossRegionRewards.claimedJohtoAchievements:[]).concat(Array.isArray(q.claimedJohtoAchievements)?q.claimedJohtoAchievements:[]))];s.crossRegionRewards.claimedJohtoShinyAchievements=[...new Set((Array.isArray(s.crossRegionRewards.claimedJohtoShinyAchievements)?s.crossRegionRewards.claimedJohtoShinyAchievements:[]).concat(Array.isArray(q.claimedJohtoShinyAchievements)?q.claimedJohtoShinyAchievements:[]))];q.hoennPremiumTickets=0;q.hoennShinyTickets=0;q.claimedJohtoAchievements=[];q.claimedJohtoShinyAchievements=[];localStorage.setItem(key,JSON.stringify(q));}catch(_){}return s;}
  function ensure(){let s=read();if(!s){s=blank();s=applyPendingJohtoRewards(s);try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(_){}}else if(s.phase!=='hoenn_complete_v2'||s.meta?.templatePhase!=='HOENN_COMPLETE'||Number(s.meta?.schema)!==SCHEMA){s=normalize(s);s=applyPendingJohtoRewards(s);try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(_){}}else{const before=Number(s.achievements?.premiumTickets||0);s=applyPendingJohtoRewards(s);if(Number(s.achievements?.premiumTickets||0)!==before)try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(_){}}return s;}
  function write(next){const s=normalize(next);try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(_){return false}}
  function started(){const s=read();return !!(s?.starter||(Array.isArray(s?.owned)&&s.owned.length));}
  function active(){return !!window.PokeSendaRegionBoot?.isHoennClone;}
  function enter(){if(HOENN_RELEASED)window.PokeSendaRegionBoot?.enterHoennClone?.();}
  function exit(){window.PokeSendaRegionBoot?.enterKanto?.();}
  function resetFoundation(){try{localStorage.removeItem(SAVE_KEY);ensure();return true}catch(_){return false}}
  window.PokeSendaHoennScaffold={saveKey:SAVE_KEY,schema:SCHEMA,getState:()=>JSON.parse(JSON.stringify(ensure())),ensureState:()=>JSON.parse(JSON.stringify(ensure())),writeState:write,isStarted:started,isCloneActive:active,enterKantoClone:enter,exitKantoClone:exit,resetFoundation,status:()=>({phase:'hoenn_public_release_v1',template:'kanto',templateRuntime:'kanto-master',publicReady:HOENN_RELEASED,prelaunch:!HOENN_RELEASED,completeRegionalContent:true,cloneActive:active(),started:started()})};
  // Runtime regional completo de Hoenn; conserva el mismo arranque aislado usado durante el desarrollo.
  window.PokeSendaHoennRuntime={phase:'hoenn_public_release_v1',publicReady:HOENN_RELEASED,prelaunch:!HOENN_RELEASED,isTechnicalClone:false,completeRegionalContent:true,openTechnicalPreview:enter,closeTechnicalPreview:exit,openCampaign:enter,closeCampaign:exit,isReleased:HOENN_RELEASED,isOpen:active};
  window.PokeSendaHoennPublicationQA=()=>{
    const menuCard=document.querySelector('[data-pk-menu-region="hoenn"]'),rootCard=document.getElementById('regionHoennCard'),prelaunch=document.documentElement.classList.contains('pk-hoenn-prelaunch');
    const expectedGyms=['Roxanne','Brawly','Wattson','Flannery','Norman','Winona','Tate & Liza','Juan'];
    const html=document.documentElement.innerHTML,gymNames=expectedGyms.filter(name=>html.includes(name));
    const gymAssets=Array.from({length:8},(_,i)=>`../assets/embedded/hoenn_gym_${i+1}_${['roxanne','brawly','wattson','flannery','norman','winona','tate_liza','juan'][i]}.png`),gymAssetRefs=gymAssets.filter(x=>html.includes(x));
    const regionalQA=window.PokeSendaHoennQA||null,gachaQA=window.PokeSendaHoennGachaQA?.()||null;
    const checks={released:window.PokeSendaHoennRelease?.enabled===true,noPrelaunchClass:!prelaunch,menuCardPresent:!!menuCard,regionSelectorCardPresent:!!rootCard,allGymLeadersReferenced:gymNames.length===8,allGymAssetsReferenced:gymAssetRefs.length===8,regionalDataQA:regionalQA?.ok===true,gachaRatesQA:gachaQA?.ok===true};
    return {phase:window.PokeSendaHoennRuntime?.phase||null,saveKey:'pokesenda_hoenn_isolated_v1',gymLeaders:gymNames,gymAssetRefs,regionalQA,gachaQA,checks,pass:Object.values(checks).every(Boolean)};
  };
  if(HOENN_RELEASED||read())ensure();
})();

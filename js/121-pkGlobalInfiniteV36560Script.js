

(()=>{
"use strict";
const SAVE="pokesenda_global_infinite_v1",MILESTONE=10000,MAX_LEVEL=60,REPEAT={common:.67,uncommon:.25,rare:.07,epic:.009,legendary:.001},RAR_NAMES={common:"Común",uncommon:"Poco común",rare:"Raro",epic:"Épico",legendary:"Legendario"};
let gs=load(),root=null,game=null,reward=null,detail=null,boxOverlay=null,swapOverlay=null,run=null,timer=null,sourceReturn="kanto",formationSig="",worldSig="",rewardSession=null,devGiftStandaloneContext=null,boxRegion="all",boxStatus="all",boxRarity="all",boxSort="power",boxDir="desc",boxQuery="",boxTargetSlot=null,boxSwapRef=null,damagePanelMode="damage",globalCatchingUp=false,globalConfirmOverlay=null,globalProfileObserver=null,globalProfileResume=false;
// Registro opcional para Hoenn y futuras regiones: cada región puede aportar roster, enemigos, jefes y recompensas sin reescribir la Infinita.
const EXTRA_REGION_PROVIDERS=new Map();
function extraRegionApi(region){return EXTRA_REGION_PROVIDERS.get(String(region||""))||null;}
const $=(id,host=root)=>host?.querySelector?.("#"+id)||null,q=(s,h=root)=>h?.querySelector?.(s)||null,qa=(s,h=root)=>Array.from(h?.querySelectorAll?.(s)||[]);
function fresh(){return{v:3,bestDistance:0,totalRuns:0,bosses:0,claimedMilestones:[],pendingReward:null,formation:[null,null,null,null,null,null],history:[],lastRun:null,migratedFromRegionalInfinite:false,preferredSpeed:1};}
function load(){const raw=localStorage.getItem(SAVE);if(!raw)return fresh();const normalize=s=>{s=s&&typeof s==="object"&&!Array.isArray(s)?s:{};s.claimedMilestones=Array.isArray(s.claimedMilestones)?s.claimedMilestones:[];s.formation=Array.isArray(s.formation)?s.formation.slice(0,6):[];while(s.formation.length<6)s.formation.push(null);s.history=Array.isArray(s.history)?s.history.slice(0,10):[];s.preferredSpeed=[1,2,4,6].includes(Number(s.preferredSpeed))?Number(s.preferredSpeed):1;return Object.assign(fresh(),s);};try{const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Formato inválido");return normalize(parsed);}catch(_){const recovered=window.PokeSendaSaveGuard?.getRecoveryObject?.(SAVE);if(recovered)return normalize(recovered);window.PokeSendaSaveGuard?.flagLoadFailure?.(SAVE,"El save de Expedición Infinita Global existe pero no se pudo leer. Se bloqueó la sobrescritura automática para proteger la partida.");return fresh();}}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(gs));}catch(_){}}
function K(){return (window.PokeSendaRegionBoot?.isHoennClone?window.PokeSendaKantoArchiveBridge:window.PokeSendaKantoGlobalBridge)||null}function J(){return window.PokeSendaJohtoBattleIsolated||null}function R(region){return region==='kanto'?K():region==='johto'?J():extraRegionApi(region)}function regionLabel(region){return region==='kanto'?'Kanto':region==='johto'?'Johto':region==='hoenn'?'Hoenn':(extraRegionApi(region)?.label||String(region||''));}
function migrateLegacyInfinite(){
  if(gs.migratedFromRegionalInfinite)return;
  try{
    const ki=K()?.infiniteState?.()||{};
    gs.bestDistance=Math.max(Number(gs.bestDistance||0),Number(ki.bestDistance||0));
    gs.totalRuns=Math.max(Number(gs.totalRuns||0),Number(ki.totalRuns||0));
    gs.bosses=Math.max(Number(gs.bosses||0),Number(ki.bosses||0));
    gs.claimedMilestones=[...new Set([...(gs.claimedMilestones||[]),...(ki.claimedMilestones||[])].map(Number).filter(x=>Number.isFinite(x)&&x>=MILESTONE&&x%MILESTONE===0))].sort((a,b)=>a-b);
    if(!gs.pendingReward&&ki.pendingReward?.firstClear&&!gs.claimedMilestones.includes(Number(ki.pendingReward.milestone||0))){
      const milestone=Number(ki.pendingReward.milestone||0);
      if(milestone>=MILESTONE){gs.pendingReward={milestone,first:true,region:"kanto",id:ki.pendingReward.id,rarity:ki.pendingReward.rarity,level:Number(ki.pendingReward.level||44),shiny:!!ki.pendingReward.shiny,rates:ki.pendingReward.rates||firstRates(milestone)};}
    }
  }catch(_){}
  gs.migratedFromRegionalInfinite=true;save();
}
function unlocked(){const ki=K()?.infiniteState?.()||{},ks=K()?.summary?.()||{},jr=J()?.getState?.()?.routes?.johto_route3||{},hr=window.PokeSendaHoennArchiveBridge?.read?.()?.routes?.route3||{};return !!(K()?.infiniteUnlocked?.()||ks.route3Complete||Number(ki.bestDistance||0)>0||Number(ki.totalRuns||0)>0||Number(gs.bestDistance||0)>0||Number(gs.totalRuns||0)>0||Number(jr.completions||0)>0||Number(hr.completions||0)>0);}
const REGION_LEVEL_CAPS=[0,25,42,60],RARITY_MIN_REGION_TIER={common:1,uncommon:1,rare:1,epic:2,legendary:3};
function normalizeRegionProgress(raw={}){const tier=Math.max(0,Math.min(3,Number(raw?.tier)||0)),cap=Math.max(0,Math.min(MAX_LEVEL,Number(raw?.levelCap)||REGION_LEVEL_CAPS[tier]||0));return {tier,route1Complete:tier>=1||!!raw?.route1Complete,route2Complete:tier>=2||!!raw?.route2Complete,route3Complete:tier>=3||!!raw?.route3Complete,levelCap:cap};}
function regionProgress(region){try{if(region==='kanto')return normalizeRegionProgress(K()?.globalInfiniteProgress?.()||{});if(region==='johto')return normalizeRegionProgress(J()?.getGlobalInfiniteProgress?.()||{});return normalizeRegionProgress(extraRegionApi(region)?.progression?.()||{});}catch(_){return normalizeRegionProgress({});}}
function regionRewardEligible(region){return regionProgress(region).tier>=1;}
function rarityAllowedForRegion(region,rarity){return regionProgress(region).tier>=Number(RARITY_MIN_REGION_TIER[rarity]||1);}
function regionKeys(){return ['kanto','johto',...EXTRA_REGION_PROVIDERS.keys()];}
function regionPoolStatusText(){return regionKeys().map(region=>{const p=regionProgress(region);return p.tier<1?regionLabel(region)+' 🔒 Ruta 1':regionLabel(region)+' ✅ Nv.'+p.levelCap;}).join(' · ');}
function regionPoolDetailText(){return regionKeys().map(region=>{const p=regionProgress(region);if(p.tier<1)return regionLabel(region)+': bloqueado hasta completar Ruta 1';const rarity=p.tier>=3?'hasta Legendario':p.tier>=2?'hasta Épico':'hasta Raro';return regionLabel(region)+': '+rarity+' · capturas hasta Nv.'+p.levelCap;}).join(' | ');}
function canStart(){return unlocked()&&!!K()?.canStartGlobal?.()&&!J()?.getRun?.()&&!J()?.getGymBattle?.();}
function regionalBusy(){const kb=K()?.globalBusy?.()||{run:!K()?.canStartGlobal?.(),gym:false},jb=J()?.globalBusy?.()||{run:!!J()?.getRun?.(),gym:!!J()?.getGymBattle?.()};return {kRun:!!kb.run,kGym:!!kb.gym,jRun:!!jb.run,jGym:!!jb.gym};}
async function clearRegionalRunsForGlobal(){const b=regionalBusy();if(b.kGym||b.jGym){toast("Termina primero el Gimnasio activo antes de entrar a la Infinita.");return false;}if(!b.kRun&&!b.jRun)return true;const names=[b.kRun?"Kanto":null,b.jRun?"Johto":null].filter(Boolean).join(" y ");const ok=await globalGameConfirm({title:"Cambiar a Expedición Infinita",message:"Hay una expedición regional activa en "+names+".\n\nSi continúas, ese intento regional terminará y entrarás a la Expedición Infinita.",confirmText:"Entrar a Infinita",cancelText:"Cancelar",tone:"warn",symbol:"♾"});if(!ok){toast("La Expedición Infinita quedó en espera.");return false;}if(b.kRun)K()?.abandonRunForGlobal?.();if(b.jRun)J()?.abandonRunForGlobal?.();return !!K()?.canStartGlobal?.()&&!J()?.getRun?.()&&!J()?.getGymBattle?.();}
function sprite(dex,shiny=false,back=false){dex=Number(dex)||1;const animate=window.PokeSendaPokemonGifAllowed?.()??true;if(!animate)return spriteStatic(dex,shiny,back);const base="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";return base+(back?(shiny?"back/shiny/":"back/"):(shiny?"shiny/":""))+dex+".gif";}
function spriteStatic(dex,shiny=false,back=false){const base="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";return base+(back?(shiny?"back/shiny/":"back/"):(shiny?"shiny/":""))+Number(dex)+".png";}
function globalHpBand(pct){pct=Number(pct)||0;return pct<=20?"hp-red":pct<=50?"hp-yellow":"hp-green";}
function globalSetBattleHp(fill,hp,maxHp){if(!fill)return;const pct=Math.max(0,Math.min(100,Number(hp||0)/Math.max(1,Number(maxHp||1))*100));fill.style.width=pct+"%";fill.className="battle-hp-fill "+globalHpBand(pct);}
const GLOBAL_ROLE_META=[
  {name:"Guardia",className:"guard"},
  {name:"Asalto",className:"striker"},
  {name:"Apoyo",className:"supportpos"}
];
function globalNativeView(p){try{return p?.region==='johto'?J()?.getPokemonView?.(p.id):p?.region==='kanto'?K()?.collectionDetail?.(p.id):extraRegionApi(p?.region)?.getPokemonView?.(p.id)||null}catch(_){return null}}
function globalStatusBadges(e){
  const out=[];
  if(e?.status?.type){
    const meta={burn:["🔥BRN","burn"],poison:["☠PSN","poison"],paralysis:["⚡PAR","paralysis"],sleep:["💤SLP","sleep"],freeze:["❄FRZ","freeze"]}[e.status.type];
    if(meta)out.push('<span class="status-badge '+meta[1]+'">'+meta[0]+'</span>');
  }
  if(Number(e?.confusion||0)>0)out.push('<span class="status-badge confusion">💫CONF</span>');
  return out.join("");
}
const GLOBAL_ITEM_SPRITE_ROOT="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/";
const GLOBAL_ITEM_SPRITE_ALIAS={link_cable:"dubious-disc",relearning_orb:"sacred-ash",up_grade:"up-grade",upgrade:"up-grade",gold_berry:"sitrus-berry",miracle_berry:"lum-berry"};
function globalItemIconHtml(item,size="small",itemId=""){
  if(!item)return '';
  const id=String(itemId||"").trim(),slug=id?(GLOBAL_ITEM_SPRITE_ALIAS[id]||id.replace(/_/g,"-")):"",url=String(item.sprite|| (slug?GLOBAL_ITEM_SPRITE_ROOT+slug+".png":""));
  const cls=size?" "+size:"";
  return '<span class="item-sprite-wrap'+cls+(url?' has-img':'')+'">'+(url?'<img class="item-sprite" src="'+url+'" alt="'+String(item.name||'Objeto').replace(/"/g,'&quot;')+'" referrerpolicy="no-referrer" decoding="async" onerror="this.style.display=\'none\';this.parentElement.classList.remove(\'has-img\')">':'')+'<span class="item-fallback">'+(item.icon||'🎒')+'</span></span>';
}
function globalTypeLabel(t){return ({normal:"Normal",fire:"Fuego",water:"Agua",electric:"Eléctrico",grass:"Planta",ice:"Hielo",fighting:"Lucha",poison:"Veneno",ground:"Tierra",flying:"Volador",psychic:"Psíquico",bug:"Bicho",rock:"Roca",ghost:"Fantasma",dragon:"Dragón",dark:"Siniestro",steel:"Acero",fairy:"Hada"})[t]||String(t||"");}
// V36.66.6 · Infinita Global deja de tener HUD/escala propios.
// Estos helpers reproducen el HUD clásico que ya usan Kanto y Johto: nombre,
// PS, nivel y tipos viajan juntos sobre el sprite y la escala usa metros reales.
const GLOBAL_NATIVE_TYPE_COLOR={normal:"#a8a77a",fire:"#ee8130",water:"#6390f0",electric:"#d9a521",grass:"#7ac74c",ice:"#7cc9c6",fighting:"#c22e28",poison:"#a33ea1",ground:"#d9b25f",flying:"#a98ff3",psychic:"#f95587",bug:"#a6b91a",rock:"#b6a136",ghost:"#735797",dragon:"#6f35fc",dark:"#705746",steel:"#b7b7ce",fairy:"#d685ad"};
function globalVisualMeters(e){
  try{
    if(!e)return .8;
    if(e.region==="kanto")return Math.max(.25,Number(K()?.visualMeters?.(e.id,e.dex,e.level)||.8));
    if(e.region==="johto")return Math.max(.25,Number(J()?.globalVisualMeters?.(e.id,e.dex)||.8));
    return Math.max(.25,Number(extraRegionApi(e.region)?.visualMeters?.(e.id,e.dex,e.level)||.8));
  }catch(_){return .8;}
}
function globalNativeTypeHtml(types){return (types||[]).map(t=>'<span class="pk-type" style="background:'+(GLOBAL_NATIVE_TYPE_COLOR[t]||"#607d8b")+'">'+globalTypeLabel(t)+'</span>').join("");}
function globalBuildNativeHud(slot,entity){
  if(!slot)return;
  const box=q(".mon,.enemy",slot);if(!box)return;
  let hud=q(":scope > .pk-hud",box);if(!hud){hud=document.createElement("div");hud.className="pk-hud";box.appendChild(hud);}
  let row=q(":scope > .pk-hprow",hud);if(!row){row=document.createElement("div");row.className="pk-hprow";hud.appendChild(row);}
  const name=q(".mon-name,.enemy-name",slot);if(name&&name.parentNode!==hud)hud.insertBefore(name,row);
  const held=q(".held-badge",slot);if(held&&held.parentNode!==hud)hud.insertBefore(held,name||row);
  const hp=q(".battle-hp",slot);if(hp&&hp.parentNode!==row)row.appendChild(hp);
  const badge=q(".posbadge,.levelbadge",slot);if(badge&&badge.parentNode!==row)row.appendChild(badge);
  let types=q(".types",slot);if(!types){types=document.createElement("div");types.className="types";slot.appendChild(types);}
  types.innerHTML=globalNativeTypeHtml(entity?.types||[]);
  if(types.parentNode!==hud)hud.appendChild(types);
  let shinyStar=q(":scope > .pk-shiny-star",box);
  if(entity?.shiny&&!shinyStar){shinyStar=document.createElement("i");shinyStar.className="pk-shiny-star";shinyStar.textContent="★";box.appendChild(shinyStar);}
  if(!entity?.shiny&&shinyStar)shinyStar.remove();
}
const GLOBAL_NATIVE_PXM=130;
function globalStyleNativeWorldSlot(slot,img,entity){
  if(!slot||!img||!entity)return;
  const types=entity.types||[],flying=types.some(t=>t==="flying"||t==="ghost"),m=globalVisualMeters(entity);
  let ob=parseFloat(img.dataset.pkOb),ow=parseFloat(img.dataset.pkOw);
  if(!(ob>0)||!(ow>0)){const cs=getComputedStyle(img);ob=Math.abs(parseFloat(cs.bottom)||46);ow=parseFloat(cs.width)||img.clientWidth||237;img.dataset.pkOb=String(ob);img.dataset.pkOw=String(ow);}
  const px=Math.max(30,Math.min(235,m*GLOBAL_NATIVE_PXM)),sc=px/Math.max(1,ow);
  // CSS variable is intentional: it overrides the obsolete scaleX rule from the
  // first Global prototype without preventing the same dynamic scale as Kanto/Johto.
  img.style.setProperty("--pk-global-battle-transform","scale("+sc.toFixed(3)+")");
  img.style.transformOrigin="50% 100%";
  img.style.bottom="-"+Math.max(2,Math.round(ob*sc))+"px";
  if(slot.style.transform)slot.style.transform="";
  slot.classList.toggle("pk-hover",flying);
  const box=q(".enemy,.mon",slot);if(box){const bw=Math.max(50,Math.round(px+14)),bh=Math.max(40,Math.round(px+10));box.style.width=bw+"px";box.style.height=bh+"px";}
  slot.querySelectorAll(":scope > .pk-ground-shadow").forEach(x=>x.remove());
  let sh=q(":scope > .pk-fly-shadow",slot);
  if(flying&&box){if(!sh){sh=document.createElement("i");sh.className="pk-fly-shadow pk-fly-shadow-el";slot.insertBefore(sh,slot.firstChild);}sh.style.top=(box.offsetTop+box.offsetHeight-6)+"px";}else sh?.remove();
}
function globalApplyNativeWorldSlot(slot,img,entity){
  const apply=()=>{if(img?.isConnected)globalStyleNativeWorldSlot(slot,img,entity);};
  requestAnimationFrame(apply);if(img&&!img.complete)img.addEventListener("load",apply,{once:true});
}
function globalSharedTypes(){const a=active();if(a.length!==3)return[];let types=[...(a[0].types||[])];for(const p of a.slice(1))types=types.filter(t=>(p.types||[]).includes(t));return types;}
function globalCanEditFormation(){return !run||!!run.paused;}
function globalFormationLabel(i){const role=i<3?i:i-3;return (i+1)+" · "+GLOBAL_ROLE_META[role].name;}
function globalNormalizeSearch(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
function globalFieldNodeForAlly(ref){return q('[data-g-world="'+CSS.escape(String(ref))+'"] .mon',game);}
function globalFieldNodeForEnemy(uid){return q('[data-g-enemy="'+CSS.escape(String(uid))+'"] .enemy',game);}
function globalFxCenter(node){const field=$("field",game),r=node?.getBoundingClientRect(),f=field?.getBoundingClientRect();if(!r||!f||!r.width||!f.width)return null;return{x:r.left-f.left+r.width/2,y:r.top-f.top+r.height/2};}
function globalSpawnFloat(node,text,cls="",color=""){
  if(globalCatchingUp||!node)return;const layer=$("fxLayer",game),p=globalFxCenter(node);if(!layer||!p||layer.childElementCount>36)return;
  const s=document.createElement("span");s.className="pk-dmg"+(cls?" "+cls:"");if(color)s.style.color=color;s.textContent=text;
  s.style.left=Math.round(p.x+(Math.random()*24-12))+"px";s.style.top=Math.round(p.y-24+Math.random()*10)+"px";layer.appendChild(s);setTimeout(()=>s.remove(),950);
}
function globalPulse(node,cls,ms=330){if(!node)return;node.classList.remove(cls);void node.offsetWidth;node.classList.add(cls);setTimeout(()=>node.classList.remove(cls),ms);}
function globalProjectile(source,target,type,delay=0){
  if(globalCatchingUp||!source||!target)return;const layer=$("fxLayer",game),a=globalFxCenter(source),b=globalFxCenter(target);if(!layer||!a||!b)return;
  const sym={normal:"✦",fire:"🔥",water:"💧",electric:"⚡",grass:"🍃",ice:"❄",fighting:"✹",poison:"☠",ground:"◆",flying:"➶",psychic:"✧",bug:"✣",rock:"●",ghost:"◈",dragon:"✦",dark:"◆",steel:"✦",fairy:"✧"}[type]||"✦";
  const fx=document.createElement("div");fx.className="fx-projectile";fx.textContent=sym;fx.style.left=(a.x-12)+"px";fx.style.top=(a.y-12)+"px";layer.appendChild(fx);
  const dx=b.x-a.x,dy=b.y-a.y,anim=fx.animate([{transform:"translate(0,0) scale(.7)",opacity:0},{transform:"translate(0,0) scale(1)",opacity:1,offset:.12},{transform:`translate(${dx}px,${dy}px) scale(1.15)`,opacity:1,offset:.86},{transform:`translate(${dx}px,${dy}px) scale(.7)`,opacity:0}],{duration:300,delay,easing:"cubic-bezier(.25,.8,.25,1)"});
  anim.onfinish=()=>fx.remove();
}
function globalAnimateAllyAttack(ref,targetUids,type,area=false){
  const s=globalFieldNodeForAlly(ref);if(!s)return;globalPulse(s,area?"area-cast":"attack-forward",330);
  (targetUids||[]).forEach((uid,i)=>{const t=globalFieldNodeForEnemy(uid);if(t){globalProjectile(s,t,type,25+i*30);setTimeout(()=>globalPulse(t,area?"hit-area":"hit-react",300),200+i*30);}});
}
function globalAnimateEnemyAttack(uid,targetRefs,type,area=false){
  const s=globalFieldNodeForEnemy(uid);if(!s)return;globalPulse(s,area?"area-cast":"enemy-melee-cast",340);
  (targetRefs||[]).forEach((ref,i)=>{const t=globalFieldNodeForAlly(ref);if(t){globalProjectile(s,t,type,20+i*30);setTimeout(()=>globalPulse(t,area?"hit-area":"hit-react",300),185+i*30);}});
}

function roster(){const extra=[...EXTRA_REGION_PROVIDERS.values()].flatMap(p=>{try{return p?.roster?.()||[]}catch(_){return[]}}),arr=[...(K()?.roster?.()||[]),...(J()?.getGlobalRoster?.()||[]),...extra],map=new Map();for(const p of arr)if(p?.ref&&!map.has(p.ref))map.set(p.ref,p);return [...map.values()];}
function rosterMap(){return new Map(roster().map(p=>[p.ref,p]));}
function catalog(){const extra=[...EXTRA_REGION_PROVIDERS.values()].flatMap(p=>{try{return p?.enemyCatalog?.()||[]}catch(_){return[]}}),a=[...(K()?.enemyCatalog?.()||[]),...(J()?.getGlobalEnemyCatalog?.()||[]),...extra],m=new Map();for(const x of a){const progress=regionProgress(x.region);if(!regionRewardEligible(x.region)||progress.tier<Math.max(1,Number(x.minRouteTier)||1)||!rarityAllowedForRegion(x.region,x.rarity))continue;const key=x.region+":"+x.id;if(!m.has(key))m.set(key,{...x,ref:key});}return [...m.values()];}
function bossCatalog(){const extra=[...EXTRA_REGION_PROVIDERS.values()].flatMap(p=>{try{return p?.bossCatalog?.()||[]}catch(_){return[]}}),a=[...(K()?.bossCatalog?.()||[]),...(J()?.getGlobalBossCatalog?.()||[]),...extra],m=new Map();for(const x of a){const progress=regionProgress(x.region);if(!regionRewardEligible(x.region)||progress.tier<Math.max(1,Number(x.minRouteTier)||1)||!rarityAllowedForRegion(x.region,x.rarity))continue;const key=x.region+":"+x.id;if(!m.has(key))m.set(key,{...x,ref:key});}const out=[...m.values()];return out.length?out:catalog();}
function rarityName(r){return RAR_NAMES[r]||r}function fmt(m){m=Math.max(0,Number(m)||0);return m>=1000?(m/1000).toFixed(2).replace(".",",")+" km":Math.floor(m).toLocaleString("es-CL")+" m";}
function toast(t){let e=document.getElementById("pkGlobalToast");if(!e){e=document.createElement("div");e.id="pkGlobalToast";e.className="pk-runtime-toast pk-global-toast";document.body.appendChild(e);}e.textContent=t;e.classList.add("show");clearTimeout(e._pkTimer);e._pkTimer=setTimeout(()=>e.classList.remove("show"),2600);}
function battleFxDamage(key,amount,type="normal",important=false,side="enemy"){
  if(globalCatchingUp||!Number.isFinite(Number(amount))||Number(amount)<=0)return;
  const node=side==="enemy"?globalFieldNodeForEnemy(key):globalFieldNodeForAlly(key);if(!node)return;
  let cls="",color="";
  if(important)cls="crit";
  else if(type==="fire")cls="burn";
  else if(type==="poison")cls="poison";
  else color=({water:"#68a8ff",electric:"#ffe066",grass:"#7bd66b",ice:"#9ee7ff",fighting:"#e07b55",ground:"#caa56b",flying:"#9dc6ff",psychic:"#ef7bc2",bug:"#a6c957",rock:"#c1ad78",ghost:"#9b83d8",dragon:"#8070e6",dark:"#8d7f78",steel:"#b8c1d1",fairy:"#f0a8d5"})[type]||"#fff";
  globalSpawnFloat(node,"-"+Math.max(1,Math.ceil(Number(amount)||0)),cls,color);
}
function battleFxHeal(key,amount){
  if(globalCatchingUp||!Number.isFinite(Number(amount))||Number(amount)<=0)return;
  globalSpawnFloat(globalFieldNodeForAlly(key),"+"+Math.max(1,Math.ceil(Number(amount)||0)),"heal");
}
function globalGameConfirm(opts={}){
  build();
  if(!globalConfirmOverlay){
    globalConfirmOverlay=document.createElement("div");globalConfirmOverlay.className="overlay hidden pk-global-confirm-overlay";globalConfirmOverlay.style.zIndex="480950";
    globalConfirmOverlay.innerHTML='<div class="modal-box pk-global-confirm-box" role="dialog" aria-modal="true"><div class="pokemon-detail-head"><div><h2 data-gconfirm-title>Confirmar</h2><div class="tiny muted">Expedición Infinita</div></div></div><div class="pk-global-confirm-symbol" data-gconfirm-symbol>♾</div><p data-gconfirm-message></p><div class="evo-actions"><button type="button" class="btn" data-gconfirm-cancel>Cancelar</button><button type="button" class="btn danger" data-gconfirm-ok>Aceptar</button></div></div>';
    root.appendChild(globalConfirmOverlay);
  }
  return new Promise(resolve=>{const title=q('[data-gconfirm-title]',globalConfirmOverlay),msg=q('[data-gconfirm-message]',globalConfirmOverlay),sym=q('[data-gconfirm-symbol]',globalConfirmOverlay),ok=q('[data-gconfirm-ok]',globalConfirmOverlay),cancel=q('[data-gconfirm-cancel]',globalConfirmOverlay);if(title)title.textContent=opts.title||"Confirmar";if(msg)msg.textContent=opts.message||"";if(sym)sym.textContent=opts.symbol||"♾";if(ok){ok.textContent=opts.confirmText||"Aceptar";ok.className="btn "+(opts.tone==="danger"?"danger":opts.tone==="warn"?"warn":"primary");}if(cancel)cancel.textContent=opts.cancelText||"Cancelar";const esc=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();finish(false);}};const finish=v=>{globalConfirmOverlay.classList.add("hidden");ok.onclick=null;cancel.onclick=null;globalConfirmOverlay.onclick=null;document.removeEventListener("keydown",esc,true);resolve(v);};ok.onclick=()=>finish(true);cancel.onclick=()=>finish(false);globalConfirmOverlay.onclick=e=>{if(e.target===globalConfirmOverlay)finish(false);};document.addEventListener("keydown",esc,true);globalConfirmOverlay.classList.remove("hidden");});
}
function globalOpenTrainerProfile(){
  if(typeof window.PokeSendaOpenPlayerProfile!=="function"){toast("El Perfil del Entrenador no está disponible en este momento.");return;}
  globalProfileResume=!!(run&&!run.paused);if(globalProfileResume)togglePause();root?.classList.add("hidden");window.PokeSendaOpenPlayerProfile("game");
  const overlay=document.querySelector("body > #playerProfileOverlay");globalProfileObserver?.disconnect?.();if(!overlay){root?.classList.remove("hidden");if(globalProfileResume&&run?.paused)togglePause();globalProfileResume=false;return;}
  globalProfileObserver=new MutationObserver(()=>{if(!overlay.classList.contains("hidden"))return;globalProfileObserver?.disconnect?.();globalProfileObserver=null;root?.classList.remove("hidden");if(globalProfileResume&&run&&run.paused&&!run.rewardPending)togglePause();globalProfileResume=false;});globalProfileObserver.observe(overlay,{attributes:true,attributeFilter:["class"]});
}
function clone(sel){const src=document.querySelector(sel);if(!src)throw new Error("Falta componente Kanto "+sel);const n=src.cloneNode(true);root.appendChild(n);return n;}
function globalInfiniteHelpNormalize(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
function globalInfiniteSetHelpTab(name){const panel=$("infoPanel",game);if(!panel)return;qa("[data-help-tab]",panel).forEach(b=>b.classList.toggle("active",b.dataset.helpTab===name));qa("[data-help-page]",panel).forEach(p=>p.classList.toggle("hidden",p.dataset.helpPage!==name));try{panel._helpSync?.();}catch(_){} }
function prepareGlobalInfiniteHelp(){
  if(!game)return;const panel=$("infoPanel",game),btn=$("helpInfoBtn",game);if(!panel||!btn)return;
  if(!panel.dataset.globalInfiniteHelp){
    panel.dataset.globalInfiniteHelp="1";
    const sub=q(".info-panel-head small",panel);if(sub)sub.textContent="Manual de referencia · Expedición Infinita Global";
    const start=q('[data-help-page="start"]',panel),hero=q(".help-hero",start);
    if(start&&!q(".pk-global-infinite-help-card",start)){
      const card=document.createElement("div");card.className="help-tip help-good pk-global-infinite-help-card";card.innerHTML='<b>♾️ Estás en Expedición Infinita Global</b><br>Jefe cada 1 km, Gachapon mejorado en cada hito nuevo de 10 km y velocidad exclusiva <b>x6</b>. El x6 acelera solo la simulación de este modo: los jefes, hitos y recompensas siguen deteniendo el avance cuando corresponde.';
      hero?.insertAdjacentElement("afterend",card);
    }
    const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){if(n.nodeValue?.includes("x1 · x2 · x4"))n.nodeValue=n.nodeValue.replaceAll("x1 · x2 · x4","x1 · x2 · x4 · x6");if(n.nodeValue?.includes("×1/×2/×4"))n.nodeValue=n.nodeValue.replaceAll("×1/×2/×4","×1/×2/×4/×6");}
  }
  const overview=()=>{const team=gs.formation.filter(Boolean).length,dist=run?.distance||0;const vals={helpNowRoute:"♾ Infinita Global",helpNowTeam:team+"/6 · "+Math.min(3,team)+" activos",helpNowCheckpoint:"Siempre desde 0 m",helpNowDex:"Kanto + Johto + Hoenn",helpNowMoney:"Sin ₽ directos",helpNowEvents:"Jefe 1 km · Gacha 10 km"};for(const [id,v] of Object.entries(vals)){const e=$(id,panel);if(e)e.textContent=v;}const goal=$("helpNextGoal",panel),why=$("helpNextWhy",panel);if(goal)goal.textContent=run?"Alcanza el próximo hito de "+fmt((Math.floor(dist/MILESTONE)+1)*MILESTONE):"Prepara tu Formación Global";if(why)why.textContent=run?"Los hitos nuevos de 10 km entregan un Gachapon mejorado.":"Combina Pokémon de las regiones que ya tengas habilitadas para recompensas.";};
  const openHelp=()=>{const opening=panel.classList.contains("hidden");panel.classList.toggle("hidden",!opening);btn.setAttribute("aria-expanded",opening?"true":"false");if(opening){window.enhanceTrainerGuidePanel?.(panel);window.setTrainerGuideMode?.(panel,"manual");overview();globalInfiniteSetHelpTab("start");setTimeout(()=>$("helpSearch",panel)?.focus(),0);}};
  btn.onclick=e=>{e.preventDefault();e.stopPropagation();openHelp();};
  const close=$("infoCloseBtn",panel);if(close)close.onclick=()=>{panel.classList.add("hidden");btn.setAttribute("aria-expanded","false");};
  panel.onclick=e=>{e.stopPropagation();const go=e.target.closest?.("[data-help-go]");if(go&&panel.contains(go)){e.preventDefault();globalInfiniteSetHelpTab(go.dataset.helpGo||"start");}};
  qa("[data-help-tab]",panel).forEach(b=>b.onclick=()=>globalInfiniteSetHelpTab(b.dataset.helpTab));
  qa("[data-help-sidebar-go]",panel).forEach(b=>b.onclick=e=>{e.preventDefault();globalInfiniteSetHelpTab(b.dataset.helpSidebarGo||"start");});
  qa(".help-mode-btn",panel).forEach(b=>b.onclick=e=>{e.preventDefault();window.setTrainerGuideMode?.(panel,"manual");});
  const search=$("helpSearch",panel),results=$("helpSearchResults",panel),clear=$("helpSearchClear",panel);if(search)search.oninput=()=>{const term=globalInfiniteHelpNormalize(search.value);if(!term){results?.classList.add("hidden");if(results)results.innerHTML="";return;}const hits=qa("[data-help-page]",panel).filter(p=>globalInfiniteHelpNormalize(p.textContent).includes(term)).slice(0,8);if(results){results.innerHTML='<div class="help-search-summary">'+hits.length+' sección(es) encontradas</div>'+hits.map(p=>'<button class="help-search-hit" type="button" data-gi-help-hit="'+p.dataset.helpPage+'"><b>'+((p.dataset.helpTitle)||q("h3",p)?.textContent||p.dataset.helpPage)+'</b><small>Abrir esta sección de la guía</small></button>').join("");results.classList.toggle("hidden",!hits.length);qa("[data-gi-help-hit]",results).forEach(b=>b.onclick=()=>globalInfiniteSetHelpTab(b.dataset.giHelpHit));}};if(clear)clear.onclick=()=>{if(search){search.value="";search.focus();}if(results){results.innerHTML="";results.classList.add("hidden");}};
  const ctx=$("uxContextBtn",game);if(ctx){ctx.classList.add("hidden");ctx.disabled=true;ctx.title="Usa ? para abrir la ayuda de Expedición Infinita";}$("uxContextPanel",game)?.classList.add("hidden");
}
function build(){if(root)return;root=document.createElement("div");root.id="pkGlobalInfiniteRoot";root.className="hidden";document.body.appendChild(root);game=clone("body > .game");reward=clone("body > #rewardOverlay");detail=clone("body > #pokemonDetailOverlay");root.addEventListener("click",e=>e.stopPropagation());root.addEventListener("pointerdown",e=>e.stopPropagation());prepareUI();prepareGlobalInfiniteHelp();buildGlobalBoxUI();}
function hideOverlays(){reward?.classList.add("hidden");detail?.classList.add("hidden");boxOverlay?.classList.add("hidden");swapOverlay?.classList.add("hidden");}
async function open(from="kanto"){
  build();migrateLegacyInfinite();sourceReturn=from;
  if(!unlocked()){toast("🔒 La Infinita Global se desbloquea al completar la tercera ruta de Kanto, Johto o Hoenn.");return;}
  if(!(await clearRegionalRunsForGlobal()))return;
  ensureFormation();
  const adjustedReward=sanitizePendingReward();
  if(from==="johto")try{document.querySelector("body > #johtoBgMusic")?.pause?.();}catch(_){}
  document.getElementById("pkRegionRuntimeRoot")?.classList.add("hidden");
  document.querySelector("body > .game")?.classList.add("pk-global-underlay-hidden");
  root.classList.remove("hidden");game.classList.remove("hidden");hideOverlays();render(true);
  if(gs.pendingReward&&!run){setTimeout(()=>{toast(adjustedReward?"🛡️ Tu Gachapon pendiente fue ajustado al progreso regional actual.":"🎁 Tienes un Gachapon de hito pendiente.");openReward();},180);}
  else if(!gs.formation.some(Boolean))toast("Elige tu equipo desde la Caja Global.");
  else toast("♾ Pools regionales · "+regionPoolStatusText());
}

async function close(){
  if(run){const ok=await globalGameConfirm({title:"Salir de la Expedición Infinita",message:"El intento actual terminará y la próxima expedición volverá a comenzar desde 0 m.",confirmText:"Salir y terminar",cancelText:"Seguir jugando",tone:"danger",symbol:"⏹"});if(!ok)return;stopRun("Detenida");}
  hideOverlays();root.classList.add("hidden");document.querySelector("body > .game")?.classList.remove("pk-global-underlay-hidden");
  if(sourceReturn==="johto")window.PokeSendaJohtoRuntime?.showGame?.();else K()?.refresh?.();
}

function ensureFormation(){
  const map=rosterMap(),raw=Array.isArray(gs.formation)?gs.formation.slice(0,6):[],out=[],seen=new Set();
  while(raw.length<6)raw.push(null);
  for(let i=0;i<6;i++){
    const ref=raw[i];
    if(ref&&map.has(ref)&&!seen.has(ref)){out[i]=ref;seen.add(ref);}else out[i]=null;
  }
  const defaults=[...(K()?.currentFormation?.()||[]),...(J()?.getGlobalFormation?.()||[]),...[...EXTRA_REGION_PROVIDERS.values()].flatMap(p=>{try{return p?.formation?.()||[]}catch(_){return[]}})];
  for(const ref of defaults){
    if(!ref||!map.has(ref)||seen.has(ref))continue;
    const slot=out.findIndex(x=>!x);if(slot<0)break;out[slot]=ref;seen.add(ref);
  }
  gs.formation=out;save();
}

function prepareUI(){
  const region=$("regionSwitchBtn",game);if(region){q(".region-switch-copy b",region).textContent="GLOBAL";q(".region-switch-copy small",region).textContent="Kanto + Johto + Hoenn";region.onclick=close;}
  const rs=$("routeSelect",game);rs.innerHTML='<option>♾ Expedición Infinita</option>';rs.disabled=true;
  $("gameMenuBtn",game).onclick=close;
  $("startBtn",game).onclick=()=>run?togglePause():startRun();
  $("stopRunBtn",game).onclick=async()=>{if(!run)return;const ok=await globalGameConfirm({title:"Parar Expedición Infinita",message:"El intento actual terminará. Se conservará tu récord, pero la próxima Expedición Infinita comenzará nuevamente desde 0 m.",confirmText:"Parar expedición",cancelText:"Continuar",tone:"danger",symbol:"⏹"});if(ok)stopRun("Detenida");};
  $("checkpointSelectBtn",game)?.classList.add("hidden");$("mtTicketTop",game)?.classList.add("hidden");

  const dexBtn=$("pokedexBtn",game);if(dexBtn){dexBtn.disabled=false;dexBtn.title="Pokédex Global · Kanto + Johto + Hoenn";dexBtn.onclick=()=>window.PokeSendaGlobal?.open?.();}
  const boxBtn=$("pcBoxBtn",game);if(boxBtn){boxBtn.disabled=false;boxBtn.title="Caja Global · organiza Pokémon de Kanto, Johto y Hoenn";boxBtn.onclick=()=>openGlobalBox();}
  for(const id of ["lootBtn","skillTreeBtn","achievementsBtn","gymHudBtn","profileHudBtn"]){const b=$(id,game);if(b){b.disabled=true;b.title="Sistema regional · vuelve a tu región";}}

  const speedWrap=q(".run-speed-controls",game);if(speedWrap&&!q('[data-speed="6"]',speedWrap)){const b=document.createElement("button");b.className="btn speed-btn quick-speed-btn";b.dataset.speed="6";b.type="button";b.textContent="x6";b.title="x6 exclusivo de Expedición Infinita";speedWrap.appendChild(b);speedWrap.title="Velocidad de Expedición Infinita · x6 exclusivo de este modo";}
  qa("[data-speed]",game).forEach(b=>b.onclick=()=>{const v=[1,2,4,6].includes(Number(b.dataset.speed))?Number(b.dataset.speed):1;gs.preferredSpeed=v;if(run)run.speed=v;save();renderTop();});
  for(const id of ["autoRepeatBtn","autoOpenBtn"]){const b=$(id,game);if(b){b.disabled=true;b.classList.remove("active");b.title=id==="autoRepeatBtn"?"La Infinita siempre vuelve a 0 m: no usa Auto-repetir.":"Los Gachapones de récord se abren manualmente en la Infinita Global.";}}
  const ap=$("autoPotionBtn",game);if(ap){ap.onclick=()=>{const providers=[K(),J(),...EXTRA_REGION_PROVIDERS.values()].filter(Boolean),states=providers.map(b=>b?.globalAutoPotionState?.()).filter(x=>x?.unlocked);if(!states.length){toast("🔒 Auto-Poción todavía no está desbloqueada en ninguna región.");return;}const next=!states.some(x=>x.enabled);let changed=false;for(const b of providers)if(b?.globalAutoPotionState?.()?.unlocked){if(typeof b.globalSetAutoPotion==='function')changed=!!b.globalSetAutoPotion(next)||changed;}if(changed){toast("💉 Auto-Poción Global "+(next?"ACTIVADA":"desactivada"));renderTop();}};}

  $("openChestBtn",reward).onclick=revealReward;$("rewardContinueBtn",reward).onclick=closeReward;const inc=$("gachaIncensePanel",reward);if(inc)inc.classList.add("hidden");
  $("pokemonDetailCloseBtn",detail).onclick=()=>detail.classList.add("hidden");$("pokemonPrevBtn",detail)?.classList.add("hidden");$("pokemonNextBtn",detail)?.classList.add("hidden");
  const trainer=q(".pk-trainer-back",game);if(trainer){trainer.style.pointerEvents="auto";trainer.style.cursor="pointer";trainer.title="Abrir Perfil del Entrenador";trainer.onclick=e=>{e.preventDefault();e.stopPropagation();globalOpenTrainerProfile();};}
  const field=$("field",game);field.classList.remove("route1","route2","route3","pk-lobby-mode");field.classList.add("routeInfinite");q(".hud",game)?.classList.remove("hidden");const routeName=$("routeHudName",game);if(routeName){routeName.textContent="";routeName.classList.add("hidden");}
}


function buildGlobalBoxUI(){
  if(boxOverlay)return;
  boxOverlay=document.createElement("div");boxOverlay.id="pkGlobalBoxOverlay";boxOverlay.className="overlay hidden";
  boxOverlay.innerHTML='<div class="modal-box pc-box-modal pk-global-box-modal" onclick="event.stopPropagation()">'+
    '<div class="pokemon-detail-head"><h2>💻 Caja Global · Kanto + Johto + Hoenn</h2><div class="grow"></div><button class="btn" data-gbox-close>Cerrar</button></div>'+
    '<div class="pc-box-summary"><button class="filter-chip active" data-gbox-status="all">Todos <b data-gbox-total>0</b></button><button class="filter-chip" data-gbox-status="team">En formación <b data-gbox-team>0</b></button><button class="filter-chip" data-gbox-status="box">En caja <b data-gbox-stored>0</b></button></div>'+
    '<div class="filter-strip"><span class="filter-strip-label">Región:</span><button class="filter-chip active" data-gbox-region="all">Todas</button><button class="filter-chip" data-gbox-region="kanto">Kanto</button><button class="filter-chip" data-gbox-region="johto">Johto</button><button class="filter-chip" data-gbox-region="hoenn">Hoenn</button></div>'+
    '<div class="filter-strip"><span class="filter-strip-label">Rareza:</span><button class="filter-chip active" data-gbox-rarity="all">Todas</button><button class="filter-chip rarity-common" data-gbox-rarity="common">Común</button><button class="filter-chip rarity-uncommon" data-gbox-rarity="uncommon">Poco común</button><button class="filter-chip rarity-rare" data-gbox-rarity="rare">Raro</button><button class="filter-chip rarity-epic" data-gbox-rarity="epic">Épico</button><button class="filter-chip rarity-legendary" data-gbox-rarity="legendary">Legendario</button></div>'+
    '<div class="pc-box-sortbar"><span class="filter-strip-label">Ordenar:</span><select class="pc-box-sort-select" data-gbox-sort><option value="power">Poder estimado</option><option value="dex">N.º Pokédex</option><option value="name">Nombre</option><option value="level">Nivel</option><option value="stars">Estrellas</option><option value="region">Región</option></select><button class="filter-chip pc-sort-dir" data-gbox-dir>↓ Descendente</button></div>'+
    '<div class="pc-box-tools"><input class="pc-box-search" data-gbox-search type="search" placeholder="🔎 Buscar nombre, región, nivel o tipo..." autocomplete="off" spellcheck="false"><span class="pill" data-gbox-count>0</span></div>'+
    '<div class="pk-global-box-note" data-gbox-note></div><div class="pc-box-grid" data-gbox-grid></div></div>';
  root.appendChild(boxOverlay);
  swapOverlay=document.createElement("div");swapOverlay.id="pkGlobalSwapOverlay";swapOverlay.className="overlay hidden";
  swapOverlay.innerHTML='<div class="modal-box pc-swap-modal" onclick="event.stopPropagation()"><div class="pokemon-detail-head"><h2>⇄ Elegir puesto de Formación Global</h2><div class="grow"></div><button class="btn" data-gswap-close>Cancelar</button></div><div class="tiny muted pc-swap-note">Elige el puesto que ocupará este Pokémon. El Pokémon anterior volverá automáticamente a la Caja Global.</div><div class="pc-swap-grid" data-gswap-grid></div></div>';
  root.appendChild(swapOverlay);

  boxOverlay.querySelector("[data-gbox-close]").onclick=()=>{boxTargetSlot=null;boxOverlay.classList.add("hidden");};
  boxOverlay.onclick=e=>{if(e.target===boxOverlay){boxTargetSlot=null;boxOverlay.classList.add("hidden");}};
  swapOverlay.querySelector("[data-gswap-close]").onclick=()=>swapOverlay.classList.add("hidden");
  swapOverlay.onclick=e=>{if(e.target===swapOverlay)swapOverlay.classList.add("hidden")};

  boxOverlay.querySelectorAll("[data-gbox-region]").forEach(b=>b.onclick=()=>{boxRegion=b.dataset.gboxRegion;renderGlobalBox();});
  boxOverlay.querySelectorAll("[data-gbox-status]").forEach(b=>b.onclick=()=>{boxStatus=b.dataset.gboxStatus;renderGlobalBox();});
  boxOverlay.querySelectorAll("[data-gbox-rarity]").forEach(b=>b.onclick=()=>{boxRarity=b.dataset.gboxRarity;renderGlobalBox();});
  boxOverlay.querySelector("[data-gbox-sort]").onchange=e=>{boxSort=e.target.value||"power";renderGlobalBox();};
  boxOverlay.querySelector("[data-gbox-dir]").onclick=()=>{boxDir=boxDir==="asc"?"desc":"asc";renderGlobalBox();};
  boxOverlay.querySelector("[data-gbox-search]").oninput=e=>{boxQuery=e.target.value||"";renderGlobalBox();};
}
function globalPower(p){const d=p?.stats||{};return Math.round(Number(d.maxHp||0)*.35+Math.max(Number(d.atk||0),Number(d.spAtk||0))*1.6+(Number(d.def||0)+Number(d.spDef||0))*.55+(1/Math.max(.15,Number(d.cd||1)))*18+Number(p?.stars||1)*12);}

/* Caja Global:
   - Fuera de una run abre la ficha NATIVA completa de la región.
   - Así conserva exactamente las funciones originales: Shiny normal/alternativo,
     estrellas, evolución, objeto, MT, movimientos, naturaleza/Mentas, etc.
   - Durante una run mantiene ficha de combate en modo lectura para no mutar
     el snapshot del intento a mitad de combate. */
let globalNativeDetailObserver=null,globalNativeDetailRegion=null,globalNativeDetailReturnToBox=false;
function closeGlobalNativeDetailBridge(){
  try{globalNativeDetailObserver?.disconnect?.();}catch(_){}
  globalNativeDetailObserver=null;
  const jr=document.getElementById("pkRegionRuntimeRoot");
  if(globalNativeDetailRegion==="johto")jr?.classList.add("hidden");
  document.querySelector("body > .game")?.classList.add("pk-global-underlay-hidden");
  root?.classList.remove("hidden");game?.classList.remove("hidden");
  globalNativeDetailRegion=null;
  ensureFormation();formationSig="";worldSig="";
  render(true);
  if(globalNativeDetailReturnToBox){renderGlobalBox();boxOverlay?.classList.remove("hidden");}
  else boxOverlay?.classList.add("hidden");
  globalNativeDetailReturnToBox=false;
}
function watchGlobalNativeDetailClose(overlay){
  try{globalNativeDetailObserver?.disconnect?.();}catch(_){}
  if(!overlay){closeGlobalNativeDetailBridge();return;}
  let opened=false,finished=false;
  const done=()=>{if(finished)return;finished=true;closeGlobalNativeDetailBridge();};
  const check=()=>{
    const visible=!overlay.classList.contains("hidden");
    if(visible){opened=true;return;}
    if(opened)done();
  };
  globalNativeDetailObserver=new MutationObserver(check);
  globalNativeDetailObserver.observe(overlay,{attributes:true,attributeFilter:["class"]});
  setTimeout(check,0);
  // Protección: si por datos corruptos la ficha regional no llegara a abrirse,
  // la Caja Global se restaura en vez de dejar al jugador en una pantalla oculta.
  setTimeout(()=>{if(!opened)done();},700);
}
function openGlobalNativePokemonDetail(ref,returnToBox=false){
  const p=rosterMap().get(ref);if(!p)return;globalNativeDetailReturnToBox=!!returnToBox;
  if(run){
    toast("🔒 Durante el intento la ficha es solo de consulta. Termina la Infinita para administrar completamente este Pokémon.");
    openDetail(ref);
    return;
  }
  boxOverlay?.classList.add("hidden");swapOverlay?.classList.add("hidden");
  root?.classList.add("hidden");

  if(p.region==="kanto"){
    globalNativeDetailRegion="kanto";
    document.getElementById("pkRegionRuntimeRoot")?.classList.add("hidden");
    document.querySelector("body > .game")?.classList.remove("pk-global-underlay-hidden");
    const ov=document.querySelector("body > #pokemonDetailOverlay");
    window.PokeSendaKantoGlobalBridge?.openCollectionEntry?.(p.id);
    setTimeout(()=>watchGlobalNativeDetailClose(ov),0);
    return;
  }

  globalNativeDetailRegion="johto";
  document.querySelector("body > .game")?.classList.add("pk-global-underlay-hidden");
  const jr=document.getElementById("pkRegionRuntimeRoot");
  if(jr)jr.classList.remove("hidden");
  const ov=jr?.querySelector("#pokemonDetailOverlay");
  window.PokeSendaJohtoRuntime?.openCollectionEntry?.(p.id);
  setTimeout(()=>watchGlobalNativeDetailClose(ov),0);
}
function openGlobalBox(targetSlot=null){
  build();ensureFormation();boxTargetSlot=Number.isInteger(targetSlot)?targetSlot:null;
  if(boxTargetSlot!==null){boxStatus="all";boxRegion="all";boxRarity="all";boxQuery="";const inp=boxOverlay.querySelector("[data-gbox-search]");if(inp)inp.value="";}
  renderGlobalBox();boxOverlay.classList.remove("hidden");
}
function renderGlobalBox(){
  if(!boxOverlay)return;
  const all=roster(),team=new Set(gs.formation.filter(Boolean)),query=boxQuery.trim().toLowerCase();
  let rows=all.filter(p=>{
    if(boxRegion!=="all"&&p.region!==boxRegion)return false;
    if(boxStatus==="team"&&!team.has(p.ref))return false;
    if(boxStatus==="box"&&team.has(p.ref))return false;
    if(boxRarity!=="all"&&p.rarity!==boxRarity)return false;
    if(query&&!(`${p.name} ${p.region} ${p.level} ${(p.stats?.types||[]).join(" ")} ${p.dex}`).toLowerCase().includes(query))return false;
    return true;
  });
  const dir=boxDir==="asc"?1:-1,rarank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
  rows.sort((a,b)=>{
    let av,bv;
    if(boxSort==="dex"){av=Number(a.dex||0);bv=Number(b.dex||0);}
    else if(boxSort==="name"){av=String(a.name||"");bv=String(b.name||"");}
    else if(boxSort==="level"){av=Number(a.level||0);bv=Number(b.level||0);}
    else if(boxSort==="stars"){av=Number(a.stars||0);bv=Number(b.stars||0);}
    else if(boxSort==="region"){av=String(a.region||"");bv=String(b.region||"");}
    else{av=globalPower(a);bv=globalPower(b);}
    return (typeof av==="string"?av.localeCompare(bv,"es"):av-bv)*dir;
  });
  boxOverlay.querySelector("[data-gbox-total]").textContent=all.length;
  boxOverlay.querySelector("[data-gbox-team]").textContent=team.size;
  boxOverlay.querySelector("[data-gbox-stored]").textContent=Math.max(0,all.length-team.size);
  boxOverlay.querySelector("[data-gbox-count]").textContent=rows.length;
  boxOverlay.querySelector("[data-gbox-dir]").textContent=boxDir==="asc"?"↑ Ascendente":"↓ Descendente";
  boxOverlay.querySelector("[data-gbox-sort]").value=boxSort;
  boxOverlay.querySelectorAll("[data-gbox-region]").forEach(b=>b.classList.toggle("active",b.dataset.gboxRegion===boxRegion));
  boxOverlay.querySelectorAll("[data-gbox-status]").forEach(b=>b.classList.toggle("active",b.dataset.gboxStatus===boxStatus));
  boxOverlay.querySelectorAll("[data-gbox-rarity]").forEach(b=>b.classList.toggle("active",b.dataset.gboxRarity===boxRarity));
  const note=boxOverlay.querySelector("[data-gbox-note]");
  note.innerHTML=run
    ?'<b>🔒 Formación fijada durante el intento.</b> Puedes revisar las fichas de combate, pero para cambiar integrantes o administrar un Pokémon debes terminar la Infinita.'
    :(boxTargetSlot!==null?'<b>⇄ Elige un Pokémon para el puesto '+(boxTargetSlot+1)+'.</b> Puedes usar cualquier Pokémon de Kanto, Johto o Hoenn.':'<b>🌐 Caja Global completa.</b> Reúne Kanto + Johto + Hoenn. Usa ⇄ para organizar la Formación y <b>Ver ficha</b> para abrir todas las opciones originales del Pokémon.');
  const grid=boxOverlay.querySelector("[data-gbox-grid]");
  grid.innerHTML=rows.length?rows.map(p=>{
    const slot=gs.formation.indexOf(p.ref),inTeam=slot>=0,power=globalPower(p),types=(p.stats?.types||[]).join(" / ")||"—",locked=!!run;
    const action=boxTargetSlot!==null?"Elegir":(inTeam?"Mover":"⇄ Formación");
    let heldName="";
    try{
      if(p.heldItem){
        heldName=p.region==='kanto'?(K()?.collectionDetail?.(p.id)?.item?.name||'Objeto equipado'):p.region==='johto'?(J()?.getItemDef?.(p.heldItem)?.name||'Objeto equipado'):(extraRegionApi(p.region)?.getItemDef?.(p.heldItem)?.name||'Objeto equipado');
      }
    }catch(_){}
    return '<div class="pc-card '+(inTeam?'in-team ':'')+'rarity-'+(p.rarity||"common")+'">'+
      '<span class="pc-card-state '+(inTeam?'team':'')+'">'+(inTeam?('Puesto '+(slot+1)):regionLabel(p.region))+'</span>'+
      (p.shiny?'<span class="pc-card-shiny-star" title="Shiny">★</span>':'')+
      '<button class="pc-card-swap" type="button" data-gbox-swap="'+p.ref+'" '+(locked?'disabled':'')+' title="'+(locked?'Equipo bloqueado durante el intento':action)+'">⇄</button>'+
      '<img src="'+sprite(p.dex,p.shiny)+'" alt="'+p.name+'"><div class="pc-card-name">'+p.name+'</div>'+
      '<div class="pc-card-meta">'+regionLabel(p.region)+' · #'+String(p.dex).padStart(3,"0")+' · Nv.'+p.level+'</div>'+
      '<div class="pc-card-types">'+types+'</div><div class="pc-card-stars stars">'+'★'.repeat(Math.max(1,p.stars||1))+'</div>'+
      '<div class="pc-card-power">⚔ Poder '+power.toLocaleString("es-CL")+'</div>'+
      '<div class="pc-card-item">'+(p.heldItem?(globalItemIconHtml(itemDefFor(p),"small")+' '+heldName):'Sin objeto equipado')+'</div>'+
      '<button class="btn mini-btn" type="button" data-gbox-detail="'+p.ref+'">'+(run?'Ver ficha de combate':'Ver ficha completa')+'</button></div>';
  }).join(""):'<div class="pk-players-empty">No hay Pokémon que coincidan con estos filtros.</div>';
  grid.querySelectorAll("[data-gbox-detail]").forEach(b=>b.onclick=()=>openGlobalNativePokemonDetail(b.dataset.gboxDetail,true));
  grid.querySelectorAll("[data-gbox-swap]").forEach(b=>b.onclick=()=>{
    const ref=b.dataset.gboxSwap;if(run)return toast("🔒 La Formación Global queda fijada durante cada intento.");
    if(boxTargetSlot!==null){changeFormation(boxTargetSlot,ref);boxTargetSlot=null;boxOverlay.classList.add("hidden");return;}
    openGlobalSwap(ref);
  });
}
function openGlobalSwap(ref){
  if(run)return toast("🔒 Termina el intento antes de sustituir Pokémon.");
  boxSwapRef=ref;renderGlobalSwap();swapOverlay.classList.remove("hidden");
}
function renderGlobalSwap(){
  if(!swapOverlay||!boxSwapRef)return;
  const map=rosterMap(),incoming=map.get(boxSwapRef),grid=swapOverlay.querySelector("[data-gswap-grid]");if(!incoming)return;
  grid.innerHTML=Array.from({length:6},(_,i)=>{
    const cur=map.get(gs.formation[i]),label=["GUARDIA","ASALTO","APOYO","GUARDIA","ASALTO","APOYO"][i],active=i<3;
    return '<button class="pk-global-swap-choice '+(active?'active-slot':'reserve-slot')+'" type="button" data-gswap-slot="'+i+'">'+
      '<span><b>'+(i+1)+' · '+label+'</b><small>'+(active?'COMBATE':'PRIORIDAD')+'</small></span>'+
      (cur?'<img src="'+sprite(cur.dex,cur.shiny)+'"><span><b>'+cur.name+'</b><small>'+regionLabel(cur.region)+' · Nv.'+cur.level+'</small></span>':'<span class="pk-global-swap-empty">Vacío</span>')+
      '</button>';
  }).join("")+(gs.formation.includes(boxSwapRef)?'<button class="btn danger pk-global-remove-team" type="button" data-gswap-remove>Enviar este Pokémon a la Caja</button>':'');
  grid.querySelectorAll("[data-gswap-slot]").forEach(b=>b.onclick=()=>{changeFormation(Number(b.dataset.gswapSlot),boxSwapRef);swapOverlay.classList.add("hidden");renderGlobalBox();});
  grid.querySelector("[data-gswap-remove]")?.addEventListener("click",()=>{const i=gs.formation.indexOf(boxSwapRef);if(i>=0)changeFormation(i,null);swapOverlay.classList.add("hidden");renderGlobalBox();});
}
function potionStateFor(p){const b=R(p?.region);return b?.globalAutoPotionState?.()||null;}
function globalPotionUnlocked(){return [K(),J(),...EXTRA_REGION_PROVIDERS.values()].map(b=>b?.globalAutoPotionState?.()).some(x=>x?.unlocked);}
function globalPotionEnabled(){return [K(),J(),...EXTRA_REGION_PROVIDERS.values()].map(b=>b?.globalAutoPotionState?.()).some(x=>x?.unlocked&&x?.enabled);}
function processGlobalAutoPotions(dt){
  if(!run)return;
  for(const p of active()){
    p.autoPotionCooldown=Math.max(0,Number(p.autoPotionCooldown||0)-dt);
    if(!p.alive||p.autoPotionCooldown>0)continue;
    const b=R(p.region),st=b?.globalAutoPotionState?.();if(!st?.unlocked||!st.enabled)continue;
    const ratio=p.hp/Math.max(1,p.maxHp);
    if(ratio<=.10){
      const item=(st.priority||[]).find(id=>Number(st.inventory?.[id]||0)>0);
      if(item){const res=b.globalConsumeMedicine?.(item);if(res?.ok){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*Number(res.healPct||0)*Number(res.healMult||1));const healed=Math.max(0,p.hp-before);p.stats.healing+=healed;p.autoPotionCooldown=2.2;if(healed)battleFxHeal(p.ref,healed);log("💉 Auto-Poción · "+p.name+" +"+Math.ceil(healed)+" PS"+(res.saved?" · no se consumió":""));continue;}}
    }
    if(ratio<=.25&&st.canFullHeal&&(p.status||p.confusion>0)&&Number(st.inventory?.full_heal||0)>0){
      const res=b.globalConsumeMedicine?.("full_heal");if(res?.ok){p.status=null;p.statusTick=3;p.confusion=0;p.autoPotionCooldown=2.2;log("💊 Auto-Cura · "+p.name+" recupera su estado.");}
    }
  }
}

function roleMods(p,role){
  const m=p.mods||{},out={atk:1,spAtk:1,def:1,spDef:1,cd:1,reduction:0,support:1,crit:0};
  if(role===0){out.def=out.spDef=1.18*(1+.01*Number(m.guardRank||0));out.reduction=.06+.0015*Number(m.guardRank||0);}
  if(role===1){out.atk=out.spAtk=1.12*(1+.01*Number(m.assaultRank||0));out.crit=.03+.0015*Number(m.assaultRank||0);}
  if(role===2){out.cd=1/(1.15*(1+.01*Number(m.supportRank||0)));out.support=1.20*(1+.015*Number(m.supportRank||0));}
  return out;
}
function assignments(){
  if(!run)return[];const used=new Set(),chosen=[],f=gs.formation,available=ref=>!!(ref&&run.team[ref]?.alive&&!used.has(ref));
  for(let role=0;role<3;role++){
    let ref=f[role];
    if(!available(ref)){
      const preferred=f[role+3];
      if(available(preferred))ref=preferred;else ref=f.slice(3,6).find(available)||null;
    }
    if(available(ref)){used.add(ref);chosen.push({ref,role});}
  }
  return chosen;
}
function active(){return assignments().map(x=>run.team[x.ref]).filter(Boolean)}
function enemies(){return(run?.enemies||[]).filter(e=>e.alive&&e.hp>0)}
function synergy(){const a=active();if(a.length!==3)return false;let types=[...a[0].types];for(const p of a.slice(1))types=types.filter(t=>p.types.includes(t));return types.length>0;}
function typeMult(type,types){const v=K()?.typeMultiplier?.(type,types);return Number(v??1)}
function defFactor(v){return Math.max(.52,Math.min(1.22,1/(1+(Number(v||60)-60)*.004)))}
function rankMult(r){return 1+.018*(Math.max(1,Number(r)||1)-1)}
function idlePowerGlobal(basePower){return Math.max(.66,Math.min(1.28,.62+(Number(basePower)||40)*.0052));}
function moveAccuracyGlobal(m){const v=Number(m?.tmAccuracy??m?.accuracy??1);return Number.isFinite(v)?Math.max(0,Math.min(1,v)):1;}
function statusSpeedFactor(e){return e?.status?.type==='paralysis'?2:1}
function burnPenalty(e,category){return e?.status?.type==='burn'&&category==='physical'?.75:1}
function itemDefFor(p){
  try{
    if(!p?.heldItem)return null;
    if(p.region==='johto')return J()?.getItemDef?.(p.heldItem)||null;
    if(p.region==='kanto')return K()?.collectionDetail?.(p.id)?.item||null;
    return extraRegionApi(p.region)?.getItemDef?.(p.heldItem)||null;
  }catch(_){return null;}
}
function moveCategoryGlobal(m){
  if(m?.category==='special'||m?.category==='physical')return m.category;
  return ['fire','water','electric','grass','ice','psychic','dragon','dark'].includes(m?.type)?'special':'physical';
}
function globalMajorStatus(move){
  if(move?.statusType&&move.statusType!=='confusion')return {type:move.statusType,chance:Number(move.statusChance??1)};
  const n=String(move?.name||'');
  if(n==='Llamarada')return{type:'burn',chance:.30};
  if(['Ascua','Lanzallamas','Colmillo Ígneo'].includes(n))return{type:'burn',chance:.10};
  if(['Impactrueno','Rayo'].includes(n))return{type:'paralysis',chance:.10};
  if(['Chispa','Descarga','Trueno','Golpe Cuerpo','Lengüetazo'].includes(n))return{type:'paralysis',chance:.30};
  if(['Aguijón Venenoso','Picotazo Veneno','Bomba Lodo'].includes(n))return{type:'poison',chance:.30};
  if(n==='Veneno Cruzado'||n==='Ácido')return{type:'poison',chance:.10};
  if(['Rayo Hielo','Ventisca'].includes(n))return{type:'freeze',chance:.10};
  return null;
}
function globalConfusionChance(move){
  if(move?.statusType==='confusion')return Number(move.statusChance??1);
  const n=String(move?.name||'');
  if(n==='Hidropulso')return .20;
  if(['Confusión','Psicorrayo'].includes(n))return .10;
  return 0;
}
function globalSupportStatus(move,rank=1){
  if(move?.statusType){return{type:move.statusType,chance:Math.min(1,Number(move.statusChance??1))};}
  const n=String(move?.name||''),bonus=.004*(Math.max(1,Math.min(25,Number(rank)||1))-1);let type=null,base=0;
  if(['Onda Trueno','Polvo Paralizador'].includes(n)){type='paralysis';base=.90;}
  else if(['Hipnosis','Canto'].includes(n)){type='sleep';base=.75;}
  else if(n==='Espora'){type='sleep';base=.95;}
  else if(['Supersónico','Rayo Confuso','Beso Dulce'].includes(n)){type='confusion';base=.85;}
  else if(n==='Tóxico'){type='poison';base=.80;}
  return type?{type,chance:Math.min(.99,base+bonus)}:null;
}
function moveBypassesType(m){return !!(m?.fixedDamage||m?.fixedLevel||m?.fixedLevelRandom||m?.ohko)}
function moveCanDamage(m,e){return !!m&&!!e&&(moveBypassesType(m)||typeMult(m.type,e.types)>0)}
function makePlayer(p){
  const it=itemDefFor(p),d=p.stats||{};
  return {ref:p.ref,region:p.region,id:p.id,dex:p.dex,name:p.name,level:p.level,stars:p.stars,rarity:p.rarity,shiny:p.shiny,heldItem:p.heldItem||null,
    types:[...(d.types||[])],maxHp:Number(d.maxHp||1),hp:Number(d.maxHp||1),atk:Number(d.atk||1),spAtk:Number(d.spAtk||1),def:Number(d.def||1),spDef:Number(d.spDef||1),cd:Number(d.cd||1),
    crit:Number(d.crit||.05),critDamage:Number(d.critDamage||1.65),reduction:Number(d.reduction||0),roundHeal:Number(d.roundHeal||.045),lifesteal:Number(d.lifesteal||0),xpBoost:Number(d.xpBoost||0),survive:Number(d.survive||0),supportMult:Number(d.supportMult||1),
    dodge:Number(d.dodge??it?.dodge??0),statusResist:Number(d.statusResist??it?.statusResist??0),slowProc:Number(d.slowProc??it?.slowProc??0),moneyBonus:Number(d.moneyBonus??it?.money??0),itemBoostType:it?.boostType||null,itemPower:Number(it?.power||0),
    moves:(p.moves||[]).map(x=>({m:{...x.m},rank:Number(x.rank||1),i:x.i})),mods:{...(p.mods||{})},attackTimer:.25+Math.random()*.35,autoPotionCooldown:0,alive:true,status:null,statusTick:3,confusion:0,
    tempReduction:0,tempReductionTime:0,haste:0,hasteTime:0,powerBuff:0,powerBuffTime:0,transformData:null,transformCooldown:0,
    stats:{damage:0,healing:0,taken:0,kos:0,crits:0,superEffective:0,deaths:0,supports:0}};
}
function enemyLevel(distance){const km=Math.floor(distance/1000);return Math.min(MAX_LEVEL,24+Math.floor(km*1.15)+Math.floor((distance%1000)/700));}
function enemyTemplate(desc,level){if(desc.region==="johto")return J()?.getGlobalEnemyTemplate?.(desc.id,level);if(desc.region==="kanto")return K()?.enemyTemplate?.(desc.id,level);return extraRegionApi(desc.region)?.enemyTemplate?.(desc.id,level)||null}
function makeEnemy(desc,index,boss=false,forced=null){
  const lv=Math.max(1,Math.min(MAX_LEVEL,forced??(enemyLevel(run.distance)+(boss?2:0)))),t=enemyTemplate(desc,lv);if(!t)return null;
  const km=Math.max(0,run.distance/1000),dec=Math.floor(km/10),curve={hp:1+km*.022+dec*.07,atk:1+km*.017+dec*.045,def:1+km*.012+dec*.03,speed:Math.max(.68,1-km*.004)},avg=active().length?active().reduce((n,p)=>n+p.level,0)/active().length:1,gap=Math.min(6,Math.max(0,lv-avg)),milestone=boss&&Math.round(run.distance/1000)%10===0,tier=milestone?Math.max(0,Math.floor(run.distance/MILESTONE)):0,bhp=boss?4.8:1,batk=boss?1.10:1,mhp=milestone?1.10+tier*.04:1,matk=milestone?1.04+tier*.015:1,c=t.core||{};
  return {uid:'g'+run.round+'e'+index,region:desc.region,id:desc.id,dex:t.dex,name:t.name,level:lv,types:[...(t.types||['normal'])],maxHp:Math.max(1,Math.round(Number(c.maxHp||1)*.92*curve.hp*(1+gap*.04)*bhp*mhp)),hp:0,
    atk:Number(c.atk||1)*.88*curve.atk*(1+gap*.06)*batk*matk,spAtk:Number(c.spAtk||1)*.88*curve.atk*(1+gap*.06)*batk*matk,def:Number(c.def||1)*curve.def,spDef:Number(c.spDef||1)*curve.def,cd:Math.max(.70,Number(c.cd||1)*.94*curve.speed*(boss?.98:1)),
    moves:(t.moves||[]).map(m=>({...m})),attackTimer:.5,boss,alive:true,status:null,statusTick:3,confusion:0,reduction:0,attackDebuff:0,attackDebuffTime:0,xp:Math.max(1,Math.round((3.2+lv*.65)*(boss?2.2:1))),stats:{damage:0,taken:0,kos:0}};
}
function finishEnemy(e,killer){
  if(!e?.alive)return;e.alive=false;e.hp=0;if(killer)killer.stats.kos++;run.roundXp+=Number(e.xp||0);run.defeated++;worldSig='';
  log(e.name+' Nv.'+e.level+' derrotado.');
  if(!enemies().length){awardXp(!!run.boss);rollDrops(run.boss?((run.distance%MILESTONE===0)?'milestone':'boss'):'round',e.region);if(run.boss)finishBoss();else finishRound();}
}
function statusImmune(e,type){const types=e?.types||[];return(type==='burn'&&types.includes('fire'))||(type==='poison'&&(types.includes('poison')||types.includes('steel')))||(type==='paralysis'&&types.includes('electric'))||(type==='freeze'&&types.includes('ice'))}
function applyStatus(e,type,source=null){
  if(!e||e.status||statusImmune(e,type))return false;
  if(e.ref&&Number(e.statusResist||0)>0&&Math.random()<Number(e.statusResist||0))return false;
  e.status={type,turns:type==='sleep'?2+Math.floor(Math.random()*3):0,source};e.statusTick=3;return true;
}
function applyConfusionGlobal(e){if(!e||Number(e.confusion||0)>0)return false;e.confusion=2+Math.floor(Math.random()*4);return true;}
function maybeApplyGlobalMoveStatus(move,e,source){
  if(!e?.alive)return false;let changed=false;const fx=globalMajorStatus(move),cc=globalConfusionChance(move);
  if(fx&&Math.random()<fx.chance&&applyStatus(e,fx.type,source)){
    const labels={burn:['🔥','quemadura'],poison:['☠️','veneno'],paralysis:['⚡','parálisis'],sleep:['💤','sueño'],freeze:['❄️','congelación']},v=labels[fx.type]||['💫',fx.type];
    log(v[0]+' '+source+' provoca '+v[1]+'.');changed=true;
  }
  if(cc&&Math.random()<cc&&applyConfusionGlobal(e)){log('💫 '+source+' provoca confusión.');changed=true;}
  return changed;
}
function blocked(e,label='Pokémon'){
  if(!e)return true;
  if(e.status?.type==='sleep'){e.status.turns=Math.max(0,Number(e.status.turns||1)-1);if(e.status.turns<=0){e.status=null;log('💤 '+label+' se despertó.');}else log('💤 '+label+' está dormido.');return true;}
  if(e.status?.type==='freeze'){if(Math.random()<.20){e.status=null;log('❄ '+label+' se descongeló.');}else{log('❄ '+label+' está congelado.');return true;}}
  if(e.status?.type==='paralysis'&&Math.random()<.25){log('⚡ '+label+' no puede moverse por la parálisis.');return true;}
  if(Number(e.confusion||0)>0){e.confusion--;if(e.confusion<=0){log('💫 '+label+' dejó de estar confundido.');}else if(Math.random()<.33){const self=Math.max(1,e.maxHp*.08);const actual=Math.min(e.hp,self);e.hp-=self;if(e.ref){e.stats.taken+=actual;battleFxDamage(e.ref,actual,'psychic',false,'ally');if(e.hp<=0)faintPlayer(e,'confusión');}else{battleFxDamage(e.uid,actual,'psychic',false,'enemy');if(e.hp<=0)finishEnemy(e,null);}log('💫 '+label+' se golpea a sí mismo por confusión.');return true;}}
  return false;
}
function faintPlayer(p,reason='combate'){
  if(!p?.alive)return;const before=new Set(assignments().map(a=>a.ref));p.hp=0;p.alive=false;p.stats.deaths=(p.stats.deaths||0)+1;formationSig='';worldSig='';
  log('💀 '+p.name+' queda fuera de combate'+(reason!=='combate'?' por '+reason:'')+'.');
  const after=assignments();for(const a of after)run.fought?.add?.(a.ref);const incoming=after.find(a=>!before.has(a.ref));if(incoming){const mon=run.team[incoming.ref],haste=Math.max(0,Number(mon.mods?.entryHaste||0)),power=Math.max(0,Number(mon.mods?.entryPower||0));if(haste){mon.haste=Math.max(mon.haste||0,haste);mon.hasteTime=Math.max(mon.hasteTime||0,8);}if(power){mon.powerBuff=Math.max(mon.powerBuff||0,power);mon.powerBuffTime=Math.max(mon.powerBuffTime||0,8);}log('🔄 '+mon.name+' entra desde la banca para cubrir '+(['Guardia','Asalto','Apoyo'][incoming.role]||'combate')+(haste||power?' con impulso':'')+'.');}
}
function processStatus(dt){
  if(!run)return;
  for(const p of Object.values(run.team||{})){
    if(!p?.alive||!['burn','poison'].includes(p.status?.type))continue;p.statusTick=(p.statusTick??3)-dt;
    while(p.alive&&p.statusTick<=0){p.statusTick+=3;const actual=Math.min(p.hp,Math.max(1,p.maxHp*(p.status.type==='burn'?.045:.065)));p.hp-=actual;p.stats.taken+=actual;battleFxDamage(p.ref,actual,p.status.type==='burn'?'fire':'poison',false,'ally');if(p.hp<=0)faintPlayer(p,p.status.type==='burn'?'quemadura':'veneno');}
  }
  for(const e of run.enemies||[]){
    if(!e?.alive||!['burn','poison'].includes(e.status?.type))continue;e.statusTick=(e.statusTick??3)-dt;
    while(run&&e.alive&&e.statusTick<=0){e.statusTick+=3;const actual=Math.min(e.hp,Math.max(1,e.maxHp*(e.status.type==='burn'?.045:.065)));e.hp-=actual;battleFxDamage(e.uid,actual,e.status.type==='burn'?'fire':'poison',false,'enemy');if(e.hp<=0)finishEnemy(e,null);}
  }
}
function estimateGlobalMove(p,target,x,role){
  const m=x.m,cat=moveCategoryGlobal(m),rm=roleMods(p,role),off=(cat==='special'?p.spAtk*rm.spAtk:p.atk*rm.atk)*burnPenalty(p,cat),def=cat==='special'?target.spDef:target.def,stab=p.types.includes(m.type)?1.2+Number(p.mods?.stabBonus||0):1,mult=moveBypassesType(m)?1:typeMult(m.type,target.types),itemBoost=p.itemBoostType===m.type?1+Number(p.itemPower||0):1;
  if(m.ohko)return target.boss?target.maxHp*.35:target.hp*1.2;
  if(m.fixedDamage)return Number(m.fixedDamage)||1;
  if(m.fixedLevel||m.fixedLevelRandom)return p.level*(m.fixedLevelRandom?1:1);
  const accuracy=m.alwaysHit?1:moveAccuracyGlobal(m),statusBonus=m.statusPowerBonus&&(p.status?.type||(p.confusion||p.confusionTurns||0)>0)?Number(m.statusPowerBonus||1):1;return Math.max(0,off*idlePowerGlobal(m.power)*rankMult(x.rank)*stab*mult*defFactor(def)*itemBoost*(1+Number(p.powerBuff||0))*accuracy*statusBonus/Math.max(1,Number(m.cooldownMult||1)));
}
function chooseMove(p,target){
  const atk=p.moves.filter(x=>x.m?.kind==='attack'),role=assignments().find(a=>a.ref===p.ref)?.role??1;let best=null;
  for(const x of atk){
    if(!moveCanDamage(x.m,target))continue;
    const score=estimateGlobalMove(p,target,x,role);if(!best||score>best.score)best={...x,score};
  }
  if(best)return best;
  return {m:{kind:'attack',name:'Forcejeo',type:'normal',power:45,category:'physical',struggle:true},rank:1,i:-1,score:Math.max(1,p.atk*45*defFactor(target.def))};
}
function transformGlobalPlayer(p,rank=1){
  if(p.id!=='ditto'||p.transformData?.active||Number(p.transformCooldown||0)>0)return false;
  const targets=enemies().filter(e=>e.alive);if(!targets.length)return false;
  const chance=Math.min(.55,.30+.01*(Math.max(1,rank)-1)),duration=10+.20*(Math.max(1,rank)-1),eff=Math.min(.98,.80+.0075*(Math.max(1,rank)-1));
  if(Math.random()>=chance){p.transformCooldown=2.2;log('🧬 Ditto usa Transformación, pero falla.');return true;}
  const e=targets[Math.floor(Math.random()*targets.length)];
  p.transformData={active:true,time:duration,original:{dex:p.dex,name:p.name,types:[...p.types],atk:p.atk,spAtk:p.spAtk,def:p.def,spDef:p.spDef,cd:p.cd,moves:p.moves.map(x=>({m:{...x.m},rank:x.rank,i:x.i})),shiny:p.shiny}};
  p.dex=e.dex;p.name='Ditto → '+e.name;p.types=[...e.types];p.atk=e.atk*eff;p.spAtk=e.spAtk*eff;p.def=e.def*eff;p.spDef=e.spDef*eff;p.cd=Math.max(.25,e.cd/Math.max(.5,eff));p.moves=(e.moves||[]).filter(m=>m.kind!=='support').map((m,i)=>({m:{...m},rank:Math.max(1,rank),i}));
  p.transformCooldown=0;worldSig='';formationSig='';log('🧬 ¡Transformación! Ditto copia a '+e.name+' durante '+duration.toFixed(1)+' s.');return true;
}
function revertGlobalTransform(p){
  const o=p?.transformData?.original;if(!o)return;p.dex=o.dex;p.name=o.name;p.types=[...o.types];p.atk=o.atk;p.spAtk=o.spAtk;p.def=o.def;p.spDef=o.spDef;p.cd=o.cd;p.moves=o.moves;p.shiny=o.shiny;p.transformData=null;p.transformCooldown=3.5;worldSig='';formationSig='';log('🧬 La Transformación de Ditto termina.');
}
function chooseSupport(p,role){
  const supports=p.moves.filter(x=>x.m?.kind==='support');if(!supports.length)return null;const a=active();if(!a.length)return null;
  const ratios=a.map(x=>x.hp/Math.max(1,x.maxHp)),min=Math.min(...ratios),avg=ratios.reduce((x,y)=>x+y,0)/ratios.length,boss=enemies().some(e=>e.boss);
  for(const x of supports){const m=x.m,fx=globalSupportStatus(m,x.rank);if(m.effect==='transform'&&p.id==='ditto'&&!p.transformData?.active&&Number(p.transformCooldown||0)<=0&&Math.random()<(boss?.82:.58))return x;if(fx&&enemies().some(e=>fx.type==='confusion'?Number(e.confusion||0)<=0:!e.status)&&Math.random()<.72)return x;if(m.effect==='heal'&&min<.58)return x;if(m.effect==='guard'&&(boss||avg<.62)&&a.some(t=>Number(t.tempReduction||0)<.02)&&Math.random()<.70)return x;if(m.effect==='haste'&&(boss||enemies().length>=3)&&a.every(t=>Number(t.haste||0)<.02)&&Math.random()<.42)return x;if(m.effect==='power'&&(boss||enemies().length>=3)&&a.every(t=>Number(t.powerBuff||0)<.02)&&Math.random()<.42)return x;if(m.selfHeal&&p.hp/p.maxHp<.48)return x;if(m.substitute&&p.hp/p.maxHp>.42&&Math.random()<.25)return x;if(m.bide&&boss&&Math.random()<.30)return x;}
  return null;
}
function supportAction(p,role,x=null){
  x=x||chooseSupport(p,role);if(!x)return false;const m=x.m,rank=Math.max(1,Number(x.rank)||1),rm=roleMods(p,role),amount=(.05+.003*(rank-1))*rm.support*p.supportMult*(1+Number(p.mods?.supportSkill||0))*(synergy()?1.05:1)*Number(m.supportScale||1);p.stats.supports=(p.stats.supports||0)+1;
  if(m.effect==='transform')return transformGlobalPlayer(p,rank);
  const fx=globalSupportStatus(m,rank);
  if(fx){const c=enemies().filter(e=>fx.type==='confusion'?Number(e.confusion||0)<=0:!e.status),e=c[0]||enemies()[0];if(!e)return true;if(m.supportAccuracyRoll&&Math.random()>moveAccuracyGlobal(m)){log('💨 '+p.name+' usa '+m.name+', pero falla.');return true;}if(Math.random()<fx.chance){if(fx.type==='confusion'){if(applyConfusionGlobal(e))log('💫 '+p.name+' usa '+m.name+' y confunde a '+e.name+'.');}else if(applyStatus(e,fx.type,p.ref))log('🎯 '+p.name+' usa '+m.name+' sobre '+e.name+'.');}return true;}
  if(m.metronome){const pool=p.moves.filter(y=>y.m?.kind==='attack');const pick=pool[Math.floor(Math.random()*pool.length)];if(pick){const e=enemies()[0];if(e){log('🎲 '+p.name+' usa Metrónomo → '+pick.m.name+'.');executePlayerMove(p,role,e,{...pick,m:{...pick.m,tmAccuracy:1}});}}return true;}
  if(m.mimic){const e=enemies()[0],copy=e?.moves?.find(z=>z.kind==='attack');if(e&&copy){log('🪞 '+p.name+' usa Mimético y copia '+copy.name+'.');executePlayerMove(p,role,e,{m:{...copy,tmAccuracy:1},rank,i:-1});}return true;}
  if(m.substitute){const cost=p.maxHp*.25;if(p.hp>cost+1){p.hp-=cost;p.tempReduction=Math.max(p.tempReduction||0,.42);p.tempReductionTime=Math.max(p.tempReductionTime||0,8);log('🧸 '+p.name+' usa Sustituto: sacrifica '+Math.round(cost)+' PS y obtiene una barrera.');}return true;}
  if(m.healPct&&m.selfHeal){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*Number(m.healPct));const healed=p.hp-before;p.stats.healing+=healed;if(m.rest){p.status=null;p.confusion=0;applyStatus(p,'sleep',p.ref);}if(healed)battleFxHeal(p.ref,healed);log('💚 '+p.name+' usa '+m.name+': recupera '+Math.round(healed)+' PS.');return true;}
  if(m.bide){p.tempReduction=Math.max(p.tempReduction||0,.30);p.tempReductionTime=Math.max(p.tempReductionTime||0,7);p.powerBuff=Math.max(p.powerBuff||0,.22);p.powerBuffTime=Math.max(p.powerBuffTime||0,7);log('🛡️ '+p.name+' acumula energía con '+m.name+'.');return true;}
  if(m.disrupt){const e=enemies()[0];if(e)e.attackTimer+=Number(m.disrupt)||0;}
  if(m.effect==='heal'){const target=active().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||p,before=target.hp;target.hp=Math.min(target.maxHp,target.hp+target.maxHp*amount);const healed=target.hp-before;p.stats.healing+=healed;if(healed)battleFxHeal(target.ref,healed);log('💚 '+p.name+' usa '+m.name+': cura a '+target.name+' +'+Math.ceil(healed)+' PS.');}
  else if(m.effect==='guard'){for(const t of active()){t.tempReduction=Math.max(t.tempReduction||0,amount);t.tempReductionTime=Math.max(t.tempReductionTime||0,5);}log('🛡️ '+p.name+' usa '+m.name+': protege al equipo.');}
  else if(m.effect==='haste'){for(const t of active()){t.haste=Math.max(t.haste||0,amount);t.hasteTime=Math.max(t.hasteTime||0,5);}log('⚡ '+p.name+' usa '+m.name+': acelera al equipo.');}
  else {for(const t of active()){t.powerBuff=Math.max(t.powerBuff||0,amount);t.powerBuffTime=Math.max(t.powerBuffTime||0,5);}log('💥 '+p.name+' usa '+m.name+': potencia al equipo.');}
  return true;
}
function executePlayerMove(p,role,primary,x){
  const m=x.m;if(!primary?.alive)return;p._nextCooldownMult=Math.max(1,Number(m?.cooldownMult||1));
  if(m.requiresSleep&&primary.status?.type!=='sleep'){log('💤 '+p.name+' intenta '+m.name+', pero '+primary.name+' no está dormido.');return;}
  if(!m.alwaysHit&&Math.random()>moveAccuracyGlobal(m)){log('💨 '+p.name+' falla '+m.name+'.');return;}
  if(m.ohko){globalAnimateAllyAttack(p.ref,[primary.uid],m.type,false);if(primary.boss){const actual=Math.min(primary.hp,Math.max(1,primary.maxHp*.35));primary.hp-=actual;p.stats.damage+=actual;battleFxDamage(primary.uid,actual,m.type,true,'enemy');log('💥 '+p.name+' usa '+m.name+': el JEFE resiste el KO directo.');if(primary.hp<=0)finishEnemy(primary,p);}else{const actual=primary.hp;p.stats.damage+=actual;battleFxDamage(primary.uid,actual,m.type,true,'enemy');finishEnemy(primary,p);}return;}
  if(m.fixedDamage||m.fixedLevel||m.fixedLevelRandom){globalAnimateAllyAttack(p.ref,[primary.uid],m.type,false);const dmg=Number(m.fixedDamage)||(p.level*(m.fixedLevelRandom?(.5+Math.random()):1)),actual=Math.min(primary.hp,Math.max(1,dmg));primary.hp-=actual;p.stats.damage+=actual;battleFxDamage(primary.uid,actual,m.type,false,'enemy');if(primary.hp<=0)finishEnemy(primary,p);return;}
  let targets=m.area&&!m.struggle?enemies().filter(e=>moveCanDamage(m,e)).slice(0,4):[primary];if(!targets.length)targets=[primary];globalAnimateAllyAttack(p.ref,targets.map(e=>e.uid),m.type,!!m.area);const rm=roleMods(p,role),cat=moveCategoryGlobal(m),beforeSelf=p.hp;let totalDealt=0;
  for(const e of targets){if(!e?.alive)continue;const off=(cat==='special'?p.spAtk*rm.spAtk:p.atk*rm.atk)*burnPenalty(p,cat),def=cat==='special'?e.spDef:e.def,stab=m.struggle?1:(p.types.includes(m.type)?1.2+Number(p.mods?.stabBonus||0):1),mult=m.struggle?1:typeMult(m.type,e.types),crit=Math.random()<Math.min(.95,p.crit+rm.crit),area=m.area?Math.min(.82,Number(m.areaFactor??.60)+Number(p.mods?.area||0)):1,catBoost=cat==='special'?1+Number(p.mods?.special||0):1+Number(p.mods?.physical||0),boss=e.boss?1+Number(p.mods?.boss||0):1,last=p.hp/p.maxHp<.30?1+Number(p.mods?.last||0):1,sy=synergy()?1.05:1,itemBoost=p.itemBoostType===m.type?1+Number(p.itemPower||0):1;
    const movePower=m.struggle?idlePowerGlobal(50)*.45:idlePowerGlobal(m.power),statusBonus=m.statusPowerBonus&&(p.status?.type||(p.confusion||p.confusionTurns||0)>0)?Number(m.statusPowerBonus||1):1;let raw=off*movePower*rankMult(x.rank)*stab*mult*defFactor(def)*area*catBoost*boss*last*sy*itemBoost*(1+Number(p.powerBuff||0))*statusBonus*(.92+Math.random()*.16)*(crit?p.critDamage:1);raw*=1-Math.min(.65,Number(e.reduction||0));
    const actual=Math.min(e.hp,Math.max(0,raw));e.hp-=raw;p.stats.damage+=actual;e.stats.taken+=actual;totalDealt+=actual;battleFxDamage(e.uid,actual,m.type,crit||mult>1.01,'enemy');if(crit)p.stats.crits++;if(mult>1.01)p.stats.superEffective++;
    if(m.type==='fire'&&e.status?.type==='freeze')e.status=null;if(e.hp>0)maybeApplyGlobalMoveStatus(m,e,p.name+' usa '+m.name);if(p.slowProc&&Math.random()<p.slowProc)e.attackTimer+=.38;if(e.hp<=0)finishEnemy(e,p);
  }
  const drain=Number(p.lifesteal||0)+Number(m.drain||0)+Number(m.drainPct||0);if(drain>0&&totalDealt>0&&p.alive){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+totalDealt*drain);const healed=p.hp-before;p.stats.healing+=healed;if(healed)battleFxHeal(p.ref,healed);}
  if(m.recoilPct&&totalDealt>0&&p.alive){const recoil=Math.min(p.hp,Math.max(1,totalDealt*Number(m.recoilPct)));p.hp-=recoil;p.stats.taken+=recoil;battleFxDamage(p.ref,recoil,'normal',false,'ally');if(p.hp<=0)faintPlayer(p,'retroceso');}
  if(m.selfKO&&p.alive)faintPlayer(p,m.name||'autodestrucción');
  if(m.rageBuff&&p.alive){p.powerBuff=Math.max(p.powerBuff||0,Number(m.rageBuff));p.powerBuffTime=Math.max(p.powerBuffTime||0,6);}
  if(m.selfGuard&&p.alive){p.tempReduction=Math.max(p.tempReduction||0,Number(m.selfGuard));p.tempReductionTime=Math.max(p.tempReductionTime||0,5);}
  if(m.slowChance&&Math.random()<Number(m.slowChance)&&primary?.alive)primary.attackTimer+=Number(m.slowSeconds||.5);
  if(m.weakenChance&&Math.random()<Number(m.weakenChance)&&primary?.alive){primary.attackDebuff=Math.max(primary.attackDebuff||0,.12);primary.attackDebuffTime=Math.max(primary.attackDebuffTime||0,6);primary.attackTimer+=.35;}
  if(m.struggle&&p.alive){const recoil=Math.min(Math.max(0,p.hp-1),Math.max(1,p.maxHp*.05));if(recoil>0){p.hp-=recoil;p.stats.taken+=recoil;battleFxDamage(p.ref,recoil,'normal',false,'ally');}if(!p.struggleWarned){log('⚠️ '+p.name+' no puede afectar al rival y recurre a Forcejeo.');p.struggleWarned=true;}}
}
function playerAction(p,role){
  if(!p?.alive||blocked(p,p.name))return;
  const su=chooseSupport(p,role);if(su&&supportAction(p,role,su))return;
  const es=enemies();if(!es.length)return;let best=null;
  for(const e of es){const mv=chooseMove(p,e);if(mv&&(!best||mv.score>best.mv.score))best={e,mv};}
  if(best)executePlayerMove(p,role,best.e,best.mv);
}
function enemyAction(e){
  if(!e?.alive||blocked(e,e.name))return;const a=active();if(!a.length)return;
  const pool=(e.moves||[]).filter(m=>m?.kind!=='support'),usable=pool.filter(m=>a.some(t=>moveCanDamage(m,t)));let m=(usable.length?usable:pool)[Math.floor(Math.random()*Math.max(1,(usable.length?usable:pool).length))]||{kind:'attack',name:'Placaje',type:'normal',power:40,category:'physical'};
  if(!m.alwaysHit&&Math.random()>moveAccuracyGlobal(m)){log('💨 '+e.name+' falla '+m.name+'.');return;}
  const hittable=a.filter(t=>moveCanDamage(m,t)),struggle=!hittable.length;
  if(struggle)m={kind:'attack',name:'Forcejeo',type:'normal',power:45,category:'physical',struggle:true};
  const area=!struggle&&Math.random()<.25,targets=area?a:[(struggle?a:hittable)[Math.floor(Math.random()*(struggle?a:hittable).length)]],cat=moveCategoryGlobal(m),off=(cat==='special'?e.spAtk:e.atk)*burnPenalty(e,cat)*(1-Math.min(.5,Number(e.attackDebuff||0)));globalAnimateEnemyAttack(e.uid,targets.map(t=>t.ref),m.type,area);
  for(const t of targets){
    if(!t?.alive)continue;const role=assignments().find(x=>x.ref===t.ref)?.role??1,rm=roleMods(t,role),def=cat==='special'?t.spDef*rm.spDef:t.def*rm.def,mult=struggle?1:(moveBypassesType(m)?1:typeMult(m.type,t.types));if(mult<=0)continue;
    if(Number(t.dodge||0)>0&&Math.random()<Number(t.dodge||0)){log('💨 '+t.name+' esquiva el ataque de '+e.name+'.');continue;}
    const crit=Math.random()<.05,areaF=area?(e.boss?.62:.60):1,stab=struggle?1:(e.types.includes(m.type)?1.20:1),tempRed=Math.min(.45,Number(t.tempReduction||0)),red=Math.min(.65,Number(t.reduction||0)+rm.reduction+tempRed),movePower=struggle?idlePowerGlobal(m.power||50)*.45:idlePowerGlobal(m.power);let raw=off*movePower*stab*mult*defFactor(def)*areaF*(.92+Math.random()*.16)*(crit?1.65:1)*(1-red);
    if(m.fixedDamage||m.fixedLevel||m.fixedLevelRandom)raw=Number(m.fixedDamage)||(e.level*(m.fixedLevelRandom?(.5+Math.random()):1));if(m.ohko)raw=t.maxHp*.85;
    const actual=Math.min(t.hp,Math.max(struggle?1:0,raw));t.hp-=raw;t.stats.taken+=actual;battleFxDamage(t.ref,actual,m.type,crit||mult>1.01,'ally');if(t.hp>0&&m.type==='fire'&&t.status?.type==='freeze')t.status=null;if(t.hp>0)maybeApplyGlobalMoveStatus(m,t,e.name+' usa '+m.name);
    if(t.hp<=0){if(Number(t.survive||0)>0&&Math.random()<Number(t.survive||0)){t.hp=1;log('🎗️ '+t.name+' resiste con 1 PS.');}else faintPlayer(t,'combate');}
  }
  if(area)log(e.name+' usa '+m.name+' en ÁREA.');
  if(struggle){if(!e.struggleWarned){log('⚠️ '+e.name+' no puede afectar al equipo y recurre a Forcejeo.');e.struggleWarned=true;}const recoil=Math.min(Math.max(0,e.hp-1),Math.max(1,e.maxHp*.05));if(recoil>0)e.hp-=recoil;if(e.hp<=0)finishEnemy(e,null);}
}
function simulateStep(dt,draw=true){
  if(!run||run.paused||run.rewardPending)return false;dt=Math.max(0,Number(dt)||0);if(dt<=0)return true;run.elapsed=(run.elapsed||0)+dt;
  processStatus(dt);if(!run)return false;processGlobalAutoPotions(dt);if(!active().length){failRun();return false;}
  for(const p of Object.values(run.team||{})){
    if(p.tempReductionTime>0){p.tempReductionTime-=dt;if(p.tempReductionTime<=0)p.tempReduction=0;}
    if(p.hasteTime>0){p.hasteTime-=dt;if(p.hasteTime<=0)p.haste=0;}
    if(p.powerBuffTime>0){p.powerBuffTime-=dt;if(p.powerBuffTime<=0)p.powerBuff=0;}
    if(p.transformCooldown>0)p.transformCooldown=Math.max(0,p.transformCooldown-dt);
    if(p.transformData?.active){p.transformData.time-=dt;if(p.transformData.time<=0)revertGlobalTransform(p);}
  }
  for(const e of run.enemies||[]){if(e.attackDebuffTime>0){e.attackDebuffTime-=dt;if(e.attackDebuffTime<=0)e.attackDebuff=0;}}
  if(!enemies().length&&run.spawnDelay<=0)spawnRound();if(!run||run.paused||run.rewardPending)return false;
  if(run.spawnDelay>0){run.spawnDelay-=dt;if(draw)renderFrame();return true;}
  for(const a of assignments()){
    const p=run.team[a.ref];if(!p?.alive)continue;p.attackTimer-=dt;let guard=0;
    while(run&&p.alive&&p.attackTimer<=0&&enemies().length&&guard++<12){p._nextCooldownMult=1;playerAction(p,a.role);if(!run||!p.alive)break;const cd=Math.max(.12,p.cd*roleMods(p,a.role).cd*statusSpeedFactor(p)/Math.max(.25,1+Number(p.haste||0))),moveCd=Math.max(.25,Number(p._nextCooldownMult||1));p._nextCooldownMult=1;p.attackTimer+=cd*moveCd;}
  }
  if(!run)return false;
  for(const e of [...enemies()]){
    if(!run||!e.alive)continue;e.attackTimer-=dt;let guard=0;
    while(run&&e.alive&&e.attackTimer<=0&&active().length&&guard++<12){enemyAction(e);if(!run||!e.alive)break;e.attackTimer+=Math.max(.12,e.cd*statusSpeedFactor(e));}
  }
  processGlobalAutoPotions(dt);if(run&&!active().length){failRun();return false;}if(draw&&run)renderFrame();return !!run;
}
function tick(){
  if(!run||document.hidden)return;const now=Date.now(),last=Number(run.wallTickMs||now-100),realGap=Math.max(0,Math.min(180,(now-last)/1000));run.wallTickMs=now;if(run.paused||run.rewardPending)return;
  const speed=Math.max(1,Number(run.speed||1));let budget=realGap||.10,steps=0,changed=false;globalCatchingUp=realGap>.35;
  try{
    while(budget>.001&&run&&!run.paused&&!run.rewardPending&&steps<1800){const realStep=Math.min(.10,budget);simulateStep(realStep*speed,false);budget-=realStep;steps++;changed=true;}
  }finally{globalCatchingUp=false;}
  if(run&&(changed||realGap>.35))render(realGap>.35);else if(run)renderFrame();if(run?.rewardPending&&gs.pendingReward&&reward?.classList.contains("hidden"))setTimeout(()=>{if(run?.rewardPending&&gs.pendingReward)openReward();},0);
}
function spawnRound(){
  if(!run||run.rewardPending)return;if(run.pendingBoss){spawnBoss();return;}
  run.round++;run.roundXp=0;run.fought=new Set(assignments().map(x=>x.ref));
  const pool=catalog();if(!pool.length){toast("♾ No hay regiones habilitadas para el pool Global. Completa al menos la Ruta 1 de una región.");stopRun("Sin pool habilitado");return;}
  const count=Math.min(4,Math.max(2,assignments().length+2)),main=pool[Math.floor(Math.random()*pool.length)],same=pool.filter(x=>x.ref!==main.ref&&x.region===main.region),keys=Array.from({length:count},()=>main);
  if(same.length&&Math.random()<.38)keys[Math.floor(Math.random()*count)]=same[Math.floor(Math.random()*same.length)];
  run.enemies=keys.map((d,i)=>{const lv=Math.max(1,Math.min(60,enemyLevel(run.distance)+[-2,-1,0,0,1,2][Math.floor(Math.random()*6)]));const e=makeEnemy(d,i,false,lv);if(e){e.hp=e.maxHp;e.attackTimer=e.cd*(.7+Math.random()*.35);}return e;}).filter(Boolean);
  if(!run.enemies.length){toast("No se pudo generar la oleada Global.");stopRun("Error de datos");return;}
  log("Manada global · "+run.enemies.map(e=>e.name+" Nv."+e.level+" · "+regionLabel(e.region)).join(" · "));worldSig="";if(!globalCatchingUp)render(true);
}

function spawnBoss(){
  run.round++;run.roundXp=0;run.fought=new Set(assignments().map(x=>x.ref));
  const km=Math.max(1,Math.round(run.distance/1000)),all=catalog(),bosses=bossCatalog();if(!all.length||!bosses.length){toast("No se pudo cargar el jefe Global.");stopRun("Error de datos");return;}
  const leg=all.filter(x=>x.rarity==="legendary"),bossDesc=km%10===0&&leg.length?leg[(Math.floor(km/10)-1)%leg.length]:bosses[(km-1)%bosses.length],bossLevel=MAX_LEVEL,e=makeEnemy(bossDesc,0,true,bossLevel);
  if(!e){toast("No se pudo generar el jefe Global.");stopRun("Error de datos");return;}
  e.hp=e.maxHp;e.attackTimer=e.cd*.8;run.enemies=[e];run.pendingBoss=false;run.boss=true;
  log("⚠ JEFE "+km+" km: "+e.name+(km%10===0?" · GUARDIÁN DE HITO":"")+" · "+regionLabel(e.region));worldSig="";if(!globalCatchingUp)render(true);
}

function awardXp(boss=false){if(!run)return;run.roundXp=0;run.fought=new Set();refreshPlayers();}
function refreshPlayers(){
  const map=rosterMap();for(const ref of Object.keys(run?.team||{})){const fresh=map.get(ref),p=run.team[ref];if(!fresh)continue;const ratio=p.hp/Math.max(1,p.maxHp),n=makePlayer(fresh);
    if(p.transformData?.active){p.level=n.level;p.stars=n.stars;const oldMax=p.maxHp;p.maxHp=n.maxHp;p.hp=Math.min(p.maxHp,Math.max(0,p.maxHp*ratio));p.xpBoost=n.xpBoost;p.roundHeal=n.roundHeal;p.survive=n.survive;p.dodge=n.dodge;p.statusResist=n.statusResist;p.mods=n.mods;}
    else Object.assign(p,{level:n.level,stars:n.stars,maxHp:n.maxHp,hp:Math.min(n.maxHp,Math.max(0,n.maxHp*ratio)),atk:n.atk,spAtk:n.spAtk,def:n.def,spDef:n.spDef,cd:n.cd,crit:n.crit,critDamage:n.critDamage,reduction:n.reduction,roundHeal:n.roundHeal,lifesteal:n.lifesteal,xpBoost:n.xpBoost,survive:n.survive,supportMult:n.supportMult,dodge:n.dodge,statusResist:n.statusResist,slowProc:n.slowProc,moneyBonus:n.moneyBonus,itemBoostType:n.itemBoostType,itemPower:n.itemPower,moves:n.moves,mods:n.mods});
  }
}
function rollDrops(kind,region){const km=Math.max(1,Math.round(run.distance/1000));if(region==="johto")J()?.rollGlobalDrops?.(kind,km);else if(region==="kanto")K()?.rollGlobalDrops?.(kind,km);else extraRegionApi(region)?.rollDrops?.(kind,km);}
function finishRound(){for(const p of active()){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*p.roundHeal);p.stats.healing+=p.hp-before;}const old=run.distance,mods=active().map(p=>Number(p.mods?.meters||0)),meterBoost=mods.length?mods.reduce((a,b)=>a+b,0)/mods.length:0,gain=Math.round((24+Math.floor(Math.random()*14))*(1+meterBoost)),target=old+gain,next=(Math.floor(old/1000)+1)*1000;if(old<next&&target>=next){run.distance=next;run.pendingBoss=true;run.spawnDelay=.7;log("♾ Llegaste a "+fmt(next)+". Un jefe bloquea el avance"+(next%MILESTONE===0?" y protege el Gachapon del hito":"")+".");}else{run.distance=target;run.spawnDelay=.55;}gs.bestDistance=Math.max(gs.bestDistance,run.distance);save();if(!globalCatchingUp)render();}
function finishBoss(){const km=Math.max(1,Math.round(run.distance/1000));run.boss=false;gs.bosses++;gs.bestDistance=Math.max(gs.bestDistance,run.distance);for(const p of Object.values(run.team||{})){if(!p?.alive)continue;const pct=Math.max(0,Number(p.region==="kanto"?K()?.globalBossHealPct?.():p.region==="johto"?J()?.globalBossHealPct?.():extraRegionApi(p.region)?.bossHealPct?.()||0));if(pct>0){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*pct);const healed=Math.max(0,p.hp-before);p.stats.healing+=healed;if(healed)battleFxHeal(p.ref,healed);}}if(km%30===0){const region=run.enemies[0]?.region||"kanto";if(region==="johto")J()?.grantGlobalMTTicket?.();else if(region==="kanto")K()?.grantGlobalMTTicket?.("Infinita Global · "+km+" km");else extraRegionApi(region)?.grantMTTicket?.("Infinita Global · "+km+" km");}if(km%10===0){const milestone=km*1000,first=!gs.claimedMilestones.includes(milestone);if(!first){run.rewardPending=false;gs.pendingReward=null;run.spawnDelay=.75;log("♾ Hito "+fmt(milestone)+" ya reclamado · no aparece Gachapon; continúas al siguiente hito nuevo.");save();if(!globalCatchingUp)render();return;}const nextReward=gs.pendingReward&&Number(gs.pendingReward.milestone)===milestone&&rewardStillValid(gs.pendingReward)?gs.pendingReward:buildReward(milestone,true);if(!nextReward){run.rewardPending=false;gs.pendingReward=null;run.spawnDelay=.75;log("🛡️ No hay recompensas regionales elegibles todavía para este hito.");save();if(!globalCatchingUp)render();return;}run.rewardPending=true;gs.pendingReward=nextReward;save();if(!globalCatchingUp){render();openReward();}return;}run.spawnDelay=.75;save();if(!globalCatchingUp)render();}
function failRun(){if(!run)return;const dist=run.distance;gs.bestDistance=Math.max(gs.bestDistance,dist);pushHistory("Derrota",dist);gs.lastRun={result:"Derrota",distance:Math.floor(dist),at:Date.now()};run=null;clearInterval(timer);timer=null;save();showSummary("♾ Fin de la Expedición Infinita","Llegaste a "+fmt(dist)+". Tu récord global es "+fmt(gs.bestDistance)+". El siguiente intento comienza desde 0 m.","♾ Reintentar desde 0 m",true);render();}
function startRun(){
  if(run||!canStart())return toast("No puedes iniciar la Infinita mientras otro modo está activo.");
  ensureFormation();const map=rosterMap(),refs=gs.formation.filter(ref=>map.has(ref)).slice(0,6);
  if(!refs.length)return toast("Elige al menos un Pokémon desde la Caja Global.");
  const team={};for(const ref of refs)team[ref]=makePlayer(map.get(ref));
  run={distance:0,partyRefs:refs,team,enemies:[],round:0,roundXp:0,fought:new Set(),pendingBoss:false,boss:false,rewardPending:false,paused:false,spawnDelay:0,lastTick:performance.now(),wallTickMs:Date.now(),speed:Number(gs.preferredSpeed||1),defeated:0,logs:[],startedAt:Date.now(),elapsed:0};
  gs.totalRuns++;save();log("♾ Expedición Infinita Global iniciada desde 0 m con "+refs.length+" Pokémon.");log("🛡️ Progreso regional · "+regionPoolDetailText());spawnRound();clearInterval(timer);timer=setInterval(tick,100);render(true);
}

function togglePause(){if(!run)return;run.paused=!run.paused;run.lastTick=performance.now();run.wallTickMs=Date.now();worldSig="";render(true);}

function stopRun(result="Detenida"){if(!run)return;const dist=run.distance;pushHistory(result,dist);gs.lastRun={result,distance:Math.floor(dist),at:Date.now()};run=null;clearInterval(timer);timer=null;save();showSummary("Expedición detenida","Récord global: "+fmt(gs.bestDistance)+". La Infinita siempre vuelve a 0 m.","Cerrar",false);render(true);}
function pushHistory(result,distance){const party=(run?.partyRefs||[]).map(ref=>{const p=run.team[ref];return p?{ref,region:p.region,dex:p.dex,name:p.name,level:p.level,damage:Math.round(p.stats.damage||0),kos:p.stats.kos||0}:null}).filter(Boolean);gs.history.unshift({at:new Date().toISOString(),result,distance:Math.floor(distance||0),rounds:run?.round||0,defeated:run?.defeated||0,party});gs.history=gs.history.slice(0,10);}
function firstRates(m){const tier=Math.max(1,Math.round(m/MILESTONE)),step=tier-1,uncommon=Math.max(.05,.22-.018*step),epic=Math.min(.48,.28+.025*step),legendary=Math.min(.15,.02+.0125*step),rare=Math.max(.10,1-uncommon-epic-legendary);return{common:0,uncommon,rare,epic,legendary};}
function rewardRates(m,first){return first?firstRates(m):{...REPEAT}}
function effectiveRewardRates(m,first){const nominal=rewardRates(m,first),pool=catalog(),order=["common","uncommon","rare","epic","legendary"],usable=order.filter(r=>Number(nominal?.[r]||0)>0&&pool.some(x=>x.rarity===r)),sum=usable.reduce((n,r)=>n+Number(nominal[r]||0),0)||1,out={common:0,uncommon:0,rare:0,epic:0,legendary:0};for(const r of usable)out[r]=Number(nominal[r]||0)/sum;return out;}
function weighted(arr,weights){let total=weights.reduce((a,b)=>a+b,0),x=Math.random()*total;for(let i=0;i<arr.length;i++){x-=weights[i];if(x<=0)return arr[i]}return arr.at(-1)}
function rewardLevelForRegion(region,milestone,rarity){const p=regionProgress(region),cap=Math.max(1,Number(p.levelCap)||1),tier=Math.max(1,Math.round(milestone/MILESTONE)),base=Math.min(MAX_LEVEL,42+tier*2+(rarity==="legendary"?5:rarity==="epic"?2:0)),raw=Math.min(MAX_LEVEL,base+Math.floor(Math.random()*5));if(raw<=cap)return raw;const low=Math.max(1,cap-4);return low+Math.floor(Math.random()*(cap-low+1));}
function buildRewardForRarity(milestone,first,rar){const rates=effectiveRewardRates(milestone,first),pool=catalog(),group=pool.filter(x=>x.rarity===rar);if(!group.length||Number(rates?.[rar]||0)<=0)return null;const pick=group[Math.floor(Math.random()*group.length)],level=rewardLevelForRegion(pick.region,milestone,rar),chance=pick.region==="johto"?Number(J()?.globalShinyChance?.()||1/1536):pick.region==="kanto"?Number(K()?.shinyChance?.()||1/1536):Number(extraRegionApi(pick.region)?.shinyChance?.()||1/1536);return{milestone,first,region:pick.region,id:pick.id,rarity:rar,level,regionalLevelCap:regionProgress(pick.region).levelCap,shiny:Math.random()<chance,rates};}
function buildReward(milestone,first){const rates=effectiveRewardRates(milestone,first),pool=catalog(),rarities=Object.keys(rates).filter(r=>rates[r]>0&&pool.some(x=>x.rarity===r));if(!pool.length||!rarities.length)return null;const rar=weighted(rarities,rarities.map(r=>rates[r]));return buildRewardForRarity(milestone,first,rar);}
function rewardStillValid(x){if(!x||!regionRewardEligible(x.region)||!rarityAllowedForRegion(x.region,x.rarity))return false;const rates=effectiveRewardRates(Number(x.milestone||MILESTONE),x.first!==false);if(Number(rates?.[x.rarity]||0)<=0)return false;return Number(x.level||1)<=Math.max(1,Number(regionProgress(x.region).levelCap)||1);}
function sanitizePendingReward(){if(!gs.pendingReward)return false;const old={...gs.pendingReward},expected=effectiveRewardRates(Number(old.milestone||MILESTONE),old.first!==false),stored=old.rates||{},ratesChanged=["common","uncommon","rare","epic","legendary"].some(r=>Math.abs(Number(stored[r]||0)-Number(expected[r]||0))>.0001);if(rewardStillValid(old)&&!ratesChanged)return false;const rebuilt=buildReward(Number(old.milestone||MILESTONE),old.first!==false);if(!rebuilt){gs.pendingReward=null;}else{if(old.adminGift)rebuilt.adminGift=true;gs.pendingReward=rebuilt;}save();return true;}
function rouletteRarityBag(milestone,first,count){const rates=effectiveRewardRates(milestone,first),order=["common","uncommon","rare","epic","legendary"],rows=order.filter(r=>rates[r]>0).map(r=>{const exact=rates[r]*count,base=Math.floor(exact);return{r,base,frac:exact-base};});let left=count-rows.reduce((n,x)=>n+x.base,0);rows.sort((a,b)=>b.frac-a.frac);for(let i=0;i<left&&rows.length;i++)rows[i%rows.length].base++;const bag=[];for(const x of rows)for(let i=0;i<x.base;i++)bag.push(x.r);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}return bag;}
function roulette(final){const before=92,after=30,premium=final?.first!==false,bag=rouletteRarityBag(final.milestone,premium,before+after),arr=bag.map(r=>buildRewardForRarity(final.milestone,premium,r)||{...final,rarity:r});arr.splice(before,0,{...final,winner:true});return{entries:arr,targetIndex:before};}
function openReward(){const pr=gs.pendingReward;if(!pr)return;const effective=effectiveRewardRates(Number(pr.milestone||MILESTONE),pr.first!==false);pr.rates={...effective};save();rewardSession={roll:{...pr,rates:{...effective}},opened:false,targetIndex:null};reward.classList.remove("hidden");$("rewardTitle",reward).textContent=pr.adminGift?"🎁 Gachapon de hito regalado · "+fmt(pr.milestone):pr.first?"♾ Hito nuevo "+fmt(pr.milestone)+" · Gachapon mejorado":"♻ Hito repetido "+fmt(pr.milestone);$("rewardSubtitle",reward).textContent=(pr.adminGift?"REGALO DEL CREADOR · usa exactamente las probabilidades del hito elegido y el pool regional habilitado, sin marcar el hito como reclamado: ":pr.first?"PREMIO DE RÉCORD · la ruleta usa exactamente este pool: ":"Este hito ya fue reclamado antes. ")+ratesText(effective)+" · "+regionLabel(pr.region)+" hasta Nv."+Math.max(1,Number(regionProgress(pr.region).levelCap)||1);$("closedChest",reward).classList.remove("hidden");$("closedChest",reward).style.display="";$("rouletteWrap",reward).classList.remove("show");$("rouletteWrap",reward).style.display="";$("rewardResult",reward).classList.remove("show");$("rewardResult",reward).style.display="";$("rouletteStrip",reward).innerHTML="";$("openChestBtn",reward).disabled=false;$("openChestBtn",reward).textContent="Abrir Gachapon";}
function ratesText(r){return "Común "+(r.common*100).toFixed(1)+"% · Poco común "+(r.uncommon*100).toFixed(1)+"% · Raro "+(r.rare*100).toFixed(1)+"% · Épico "+(r.epic*100).toFixed(1)+"% · Legendario "+(r.legendary*100).toFixed(2)+"%";}
function revealReward(){if(!rewardSession||rewardSession.opened)return;rewardSession.opened=true;$("openChestBtn",reward).disabled=true;const data=roulette(rewardSession.roll),wrap=$("rouletteWrap",reward),strip=$("rouletteStrip",reward);rewardSession.targetIndex=data.targetIndex;$("closedChest",reward).classList.add("hidden");$("closedChest",reward).style.display="";wrap.classList.add("show");wrap.style.display="";$("rewardResult",reward).classList.remove("show");$("rewardResult",reward).style.display="";strip.style.transition="none";strip.style.transform="translateX(0px)";strip.innerHTML=data.entries.map(x=>'<div class="roulette-card '+x.rarity+(x.winner?' winner-pending':'')+'"><span class="pk-inf-rarity-tag '+x.rarity+'">'+rarityName(x.rarity)+'</span><img src="'+rewardSprite(x)+'" alt="'+rewardName(x)+'"><small>'+(x.shiny?'✨ ':'')+rewardName(x)+'</small></div>').join('');requestAnimationFrame(()=>{const cardW=96,gap=10,startOffset=wrap.clientWidth/2-cardW/2,targetOffset=wrap.clientWidth/2-(data.targetIndex*(cardW+gap)+cardW/2),fastOffset=targetOffset+2350;strip.style.transform='translateX('+startOffset+'px)';requestAnimationFrame(()=>{strip.style.transition="transform 3.35s linear";strip.style.transform='translateX('+fastOffset+'px)';setTimeout(()=>{strip.style.transition="transform 2.35s cubic-bezier(.08,.70,.10,1)";strip.style.transform='translateX('+targetOffset+'px)';},3350);});});setTimeout(finalizeReward,5800);}
function rewardTemplate(x){if(x.region==="johto")return J()?.getGlobalEnemyTemplate?.(x.id,x.level);if(x.region==="kanto")return K()?.enemyTemplate?.(x.id,x.level);return extraRegionApi(x.region)?.enemyTemplate?.(x.id,x.level)||null}function rewardName(x){return rewardTemplate(x)?.name||x.id}function rewardDex(x){return Number(rewardTemplate(x)?.dex||1)}function rewardSprite(x){return sprite(rewardDex(x),!!x.shiny)}
function finalizeReward(){if(!rewardSession)return;const x=rewardSession.roll,res=x.region==="johto"?J()?.grantGlobalCapture?.(x.id,x.level,x.rarity,x.shiny):x.region==="kanto"?K()?.capture?.(x.id,x.level,x.rarity,x.shiny):extraRegionApi(x.region)?.capture?.(x.id,x.level,x.rarity,x.shiny);if(!res?.ok){rewardSession.opened=false;$("openChestBtn",reward).disabled=false;$("openChestBtn",reward).textContent="Reintentar registro";toast(res?.msg||"No se pudo registrar la captura global");return;}if(x.first&&!x.adminGift&&!gs.claimedMilestones.includes(x.milestone)){gs.claimedMilestones.push(x.milestone);gs.claimedMilestones.sort((a,b)=>a-b);}gs.pendingReward=null;save();const strip=$("rouletteStrip",reward),winner=strip?.children?.[Number(rewardSession.targetIndex??-1)];winner?.classList?.add("winner");$("rewardResult",reward).classList.add("show");$("rewardResult",reward).style.display="";$("rewardImg",reward).className=x.rarity+"-glow";$("rewardImg",reward).src=rewardSprite(x);$("rewardName",reward).textContent=(x.shiny?"✨ ":"")+rewardName(x)+" · Nv."+x.level;$("rewardRarity",reward).innerHTML='<span class="rarity '+x.rarity+'">'+rarityName(x.rarity).toUpperCase()+'</span>';$("rewardStars",reward).innerHTML="";$("rewardNote",reward).textContent=(res.stateNew?"Nueva familia obtenida":"Duplicado · +"+Number(res.candies||0)+" caramelos")+" · progreso guardado en "+regionLabel(x.region)+" · límite regional Nv."+Math.max(1,Number(regionProgress(x.region).levelCap)||1);K()?.refresh?.();J()?.reload?.();extraRegionApi(x.region)?.refresh?.();}
function closeReward(){if(!rewardSession||!$("rewardResult",reward).classList.contains("show"))return;const wasAdminGift=!!rewardSession?.roll?.adminGift;rewardSession=null;reward.classList.add("hidden");$("rouletteWrap",reward).classList.remove("show");$("rewardResult",reward).classList.remove("show");$("closedChest",reward).classList.remove("hidden");$("openChestBtn",reward).textContent="Abrir Gachapon";if(run){run.rewardPending=false;run.spawnDelay=.9;run.lastTick=performance.now();run.wallTickMs=Date.now();render(true);}else render();if(wasAdminGift)devGiftRestoreStandalone();}
function log(s){if(!run)return;run.logs=[s,...run.logs].slice(0,40)}
function changeFormation(slot,ref){
  slot=Math.max(0,Math.min(5,Number(slot)||0));ref=ref||null;
  if(run&&!run.paused){toast("⏸ Pausa la Infinita para reordenar los Pokémon que iniciaron este intento.");return false;}
  const map=rosterMap();if(ref&&!map.has(ref))return false;
  if(run&&ref&&!run.team?.[ref]){toast("🔒 Ese Pokémon no inició esta expedición. Para sustituir integrantes debes usar ⏹ Parar.");return false;}
  const old=gs.formation[slot]||null,other=ref?gs.formation.indexOf(ref):-1;
  if(ref&&other>=0&&other!==slot)gs.formation[other]=old;
  gs.formation[slot]=ref;
  const seen=new Set();gs.formation=gs.formation.map(x=>{if(!x||seen.has(x))return null;seen.add(x);return x;});while(gs.formation.length<6)gs.formation.push(null);
  save();formationSig="";worldSig="";render(true);return true;
}

function renderFormation(){
  const host=$("formationControls",game),map=rosterMap();if(!host)return;host.innerHTML="";
  const shared=globalSharedTypes(),banner=document.createElement("div");banner.className="type-synergy-banner "+(shared.length?"active":"");
  banner.title="La Afinidad solo se activa con 3 combatientes vivos que compartan al menos un tipo.";
  banner.innerHTML=shared.length
    ?'<b>🔗 Afinidad de tipo activa</b><span class="type-synergy-types">'+shared.map(t=>'<span class="type-synergy-chip">'+globalTypeLabel(t)+'</span>').join("")+'</span><br>Se recalcula automáticamente cuando entra un Pokémon desde la banca.'
    :'<b>🔗 Afinidad de tipo</b> · Reúne 3 combatientes que compartan al menos un tipo para obtener un bonus táctico moderado.';
  banner.style.margin="8px 0 0";

  const grid=document.createElement("div");grid.className="formation-grid";
  for(let i=0;i<6;i++){
    const ref=gs.formation[i],p=map.get(ref),t=run?.team?.[ref],role=i<3?i:i-3,roleMeta=GLOBAL_ROLE_META[role],slot=document.createElement("div"),isKO=!!(t&&!t.alive);
    slot.className="formation-slot "+(i<3?"active-slot ":"reserve-slot ")+(i>=3?(role===0?"bench-guard ":role===1?"bench-striker ":"bench-support "):"")+(isKO?"ko-slot ":"");
    slot.dataset.pkFormationIndex=String(i);
    let visual='<div class="formation-empty-visual">＋</div>';
    if(p){
      const view=globalNativeView(p)||{},native=view.p||{},xp=Math.max(0,Number(native.xp||0)),need=p.level>=MAX_LEVEL?1:Math.max(1,Math.round(42*Math.pow(p.level,1.27))),xpPct=p.level>=MAX_LEVEL?100:Math.min(100,xp/need*100);
      const hp=t?(Math.max(0,Math.ceil(t.hp))+"/"+Math.ceil(t.maxHp)+(t.alive?"":" · KO")):(Math.round(Number(p.stats?.maxHp||view.stats?.maxHp||0))+" PS");
      visual='<div class="formation-pokemon" data-g-detail="'+p.ref+'"><img src="'+spriteStatic(p.dex,p.shiny)+'" alt="'+p.name+'"><div><b>'+p.name+'</b><small>Nv.'+p.level+'</small><span class="formation-position-tag '+roleMeta.className+'">'+(i<3?roleMeta.name:"↪ "+roleMeta.name)+'</span><div class="formation-stars stars">'+"★".repeat(Math.max(1,p.stars||1))+'</div><div class="formation-status">'+globalStatusBadges(t)+'</div><small data-g-form-hp>'+hp+'</small></div></div><div class="xpbar"><div class="xpfill" data-g-form-xp style="width:'+xpPct+'%"></div></div><div class="tiny-xp"><span data-g-form-xp-now>'+(p.level>=MAX_LEVEL?"MAX":Math.floor(xp)+" XP")+'</span><span data-g-form-xp-next>'+(p.level>=MAX_LEVEL?"":need+" sig.")+'</span></div>';
    }

    const choices=(run?Object.keys(run.team||{}):roster().map(x=>x.ref)).filter(x=>map.has(x));
    const options=['<button class="formation-combo-option '+(!ref?"selected":"")+'" type="button" data-g-form-choice=""><span class="formation-combo-empty">—</span><span><b>Vacío</b><small>Dejar este puesto libre</small></span></button>'].concat(choices.map(choice=>{
      const c=map.get(choice),ct=run?.team?.[choice],selected=choice===ref;
      return '<button class="formation-combo-option '+(selected?"selected":"")+'" type="button" data-g-form-choice="'+choice+'" data-g-form-search="'+c.name+' '+c.level+' '+c.region+'"><img src="'+spriteStatic(c.dex,c.shiny)+'" alt=""><span><b>'+(selected?"✓ ":"")+c.name+'</b><small>Nv.'+c.level+' · '+Math.max(1,c.stars||1)+'★'+(ct&&!ct.alive?" · DEBILITADO":"")+'</small></span></button>';
    })).join("");

    slot.innerHTML='<div class="formation-slot-label"><span>'+globalFormationLabel(i)+'</span><span>'+(i<3?"COMBATE":"PRIORIDAD")+'</span></div>'+visual+
      '<div class="formation-combo" data-g-form-combo="'+i+'"><button class="formation-swap-icon" type="button" title="Cambiar Pokémon" '+(globalCanEditFormation()?"":"disabled")+'>⇄</button><input class="formation-combo-input" type="search" placeholder="Cambiar Pokémon..." autocomplete="off" spellcheck="false" '+(globalCanEditFormation()?"":"disabled")+'><span class="formation-combo-caret" aria-hidden="true">▾</span><div class="formation-combo-menu hidden">'+options+'<div class="formation-combo-no-results hidden">No hay Pokémon que coincidan.</div></div></div>';
    grid.appendChild(slot);
  }
  host.appendChild(grid);host.appendChild(banner);
  if(run){const note=document.createElement("div");note.className="party-lock-note";note.textContent=run.paused?"⏸ Pausa: puedes reordenar los 6 Pokémon que iniciaron la Infinita, pero no traer integrantes nuevos.":"🔒 Equipo bloqueado durante el combate. Pausa para reordenar; usa ⏹ Parar para sustituir integrantes.";host.appendChild(note);}
  window.PokeSendaBindSafeFormationDrag?.({root:grid,canEdit:globalCanEditFormation,onSwap:(from,to)=>{const ref=gs.formation[from]||null;if(ref)changeFormation(to,ref);}});

  host.querySelectorAll("[data-g-detail]").forEach(el=>el.addEventListener("click",()=>{const ref=el.dataset.gDetail;openDetail(ref);}));
  const closeMenus=except=>host.querySelectorAll(".formation-combo.open").forEach(c=>{if(c===except)return;c.classList.remove("open");c.closest(".formation-slot")?.classList.remove("combo-open");c.querySelector(".formation-combo-menu")?.classList.add("hidden");});
  host.querySelectorAll("[data-g-form-combo]").forEach(combo=>{
    const idx=Number(combo.dataset.gFormCombo),input=combo.querySelector(".formation-combo-input"),swap=combo.querySelector(".formation-swap-icon"),menu=combo.querySelector(".formation-combo-menu"),opts=[...combo.querySelectorAll("[data-g-form-choice]")],empty=combo.querySelector(".formation-combo-no-results");
    const filter=()=>{const s=globalNormalizeSearch(input.value);let shown=0;opts.forEach((b,n)=>{if(n===0){b.classList.toggle("hidden",!!s);return;}const ok=!s||globalNormalizeSearch(b.dataset.gFormSearch||b.textContent).includes(s);b.classList.toggle("hidden",!ok);if(ok)shown++;});empty?.classList.toggle("hidden",shown>0||!s);};
    const openMenu=()=>{if(input.disabled)return;closeMenus(combo);combo.classList.add("open");combo.closest(".formation-slot")?.classList.add("combo-open");menu.classList.remove("hidden");filter();input.focus();};
    input?.addEventListener("focus",openMenu);input?.addEventListener("input",filter);swap?.addEventListener("click",openMenu);
    opts.forEach(b=>b.addEventListener("click",()=>changeFormation(idx,b.dataset.gFormChoice||null)));
  });
}

function globalStatusHTML(e){const out=[];if(e?.status?.type){const x={burn:'🔥 BRN',poison:'☠ PSN',paralysis:'⚡ PAR',sleep:'💤 SLP',freeze:'❄ FRZ'}[e.status.type];if(x)out.push(x);}if(Number(e?.confusion||0)>0)out.push('💫 CONF');return out.join(' · ');}
function renderWorld(){
  const team=$("teamLine",game),enemy=$("enemyTeamLine",game);if(!team||!enemy)return;
  team.innerHTML="";enemy.innerHTML="";team.classList.remove("pk-team-one","pk-team-two","pk-team-three");
  if(!run)return;
  const as=assignments(),back=!run.paused;
  if(as.length===1)team.classList.add("pk-team-one");else if(as.length===2)team.classList.add("pk-team-two");else team.classList.add("pk-team-three");

  [...as].reverse().forEach(({ref,role})=>{
    const p=run.team[ref],item=itemDefFor(p),pct=Math.max(0,p.hp/p.maxHp*100),w=document.createElement("div");w.className="mon-wrap";w.dataset.gWorld=ref;w.dataset.battleRole=String(role);
    // Igual que Kanto/Johto: durante combate el equipo usa sprite de ESPALDA.
    // Al pausar, usa frente. El fallback PNG respeta exactamente la misma orientación.
    const visual=sprite(p.dex,p.shiny,back),fallback=spriteStatic(p.dex,p.shiny,back);
    w.innerHTML='<div class="mon">'+(item?'<div class="held-badge ally-held-badge" title="Lleva '+(item.name||p.heldItem)+'">'+globalItemIconHtml(item,"small",p.heldItem)+'</div>':"")+
      '<div class="battle-hp ally-world-hp"><div class="battle-hp-fill '+globalHpBand(pct)+'" style="width:'+pct+'%"></div></div><span class="posbadge">Nv.'+p.level+'</span>'+
      '<img data-pk-gif-done="1" src="'+visual+'" data-fallback="'+fallback+'" alt="'+p.name+'"></div><div class="field-stars stars">'+"★".repeat(Math.max(1,p.stars||1))+'</div>'+
      '<div class="status-badges">'+globalStatusBadges(p)+'</div><div class="mon-name">'+p.name+'</div><div class="types"></div>';
    const img=w.querySelector(".mon>img");if(img){img.onerror=()=>{if(img.src!==img.dataset.fallback)img.src=img.dataset.fallback;};}
    w.addEventListener("click",()=>openDetail(ref));team.appendChild(w);
    globalBuildNativeHud(w,p);globalApplyNativeWorldSlot(w,img,p);
  });
  for(let i=as.length;i<3;i++){const e=document.createElement("div");e.className="empty-team";e.textContent="＋";team.prepend(e);}

  for(const e of enemies()){
    const pct=Math.max(0,e.hp/e.maxHp*100),w=document.createElement("div");w.className="enemy-slot";w.dataset.gEnemy=e.uid;
    const visual=sprite(e.dex,false,false),fallback=spriteStatic(e.dex,false,false),held=itemDefFor(e);
    w.innerHTML='<div class="enemy '+(e.boss?"boss ":"")+'">'+(held?'<div class="held-badge enemy-held-badge" title="Lleva '+(held.name||e.heldItem)+'">'+globalItemIconHtml(held,"small",e.heldItem)+'</div>':'')+'<div class="battle-hp enemy-world-hp" style="'+(e.boss?"width:112px":"")+'"><div class="battle-hp-fill '+globalHpBand(pct)+'" style="width:'+pct+'%"></div></div><span class="levelbadge">Nv.'+e.level+'</span><img src="'+visual+'" data-fallback="'+fallback+'" alt="'+e.name+'"></div><div class="enemy-status-row">'+globalStatusBadges(e)+'</div><div class="enemy-name">'+e.name+'</div>'+(e.boss?'<div class="enemy-role">JEFE</div>':"")+'<div class="types"></div>';
    const img=w.querySelector(".enemy>img");if(img){img.onerror=()=>{if(img.src!==img.dataset.fallback)img.src=img.dataset.fallback;};}
    enemy.appendChild(w);globalBuildNativeHud(w,e);globalApplyNativeWorldSlot(w,img,e);
  }
}
function renderFrame(){
  if(!run)return;
  qa("[data-g-world]",game).forEach(w=>{const p=run.team[w.dataset.gWorld];if(!p)return;globalSetBattleHp(q(".battle-hp-fill",w),p.hp,p.maxHp);const s=q(".status-badges",w);if(s)s.innerHTML=globalStatusBadges(p);});
  qa("[data-g-enemy]",game).forEach(w=>{const e=run.enemies.find(x=>String(x.uid)===String(w.dataset.gEnemy));if(!e)return;globalSetBattleHp(q(".battle-hp-fill",w),e.hp,e.maxHp);const s=q(".enemy-status-row",w);if(s)s.innerHTML=globalStatusBadges(e);});
  renderTop();renderDamage();renderLog();
}
function globalSyncRouteTrainerMarker(pct){
  const rp=q(".route-progress",game);if(!rp)return;
  let marker=q("#pkTrainerMarker",game);
  if(!marker){marker=document.createElement("span");marker.id="pkTrainerMarker";marker.title="Tu entrenador";rp.insertBefore(marker,q(".timebar",rp));marker.onclick=e=>{e.preventDefault();e.stopPropagation();globalOpenTrainerProfile();};}
  marker.style.left=Math.max(0,Math.min(100,Number(pct)||0))+"%";
  const snap=window.PokeSendaPublicProfileBridge?.snapshot?.(),tv=window.PokeSendaPublicProfileBridge?.trainerVisual?.(snap?.trainerId||"red","front");
  if(tv?.src){let img=q("img",marker);if(!img){marker.innerHTML='<img alt="Entrenador">';img=q("img",marker);}img.src=tv.src;img.alt=String(snap?.name||"Entrenador");img.style.height=Math.round(34*(Number(tv.scale)||1))+"px";img.style.width="auto";}
}
function renderTop(){
  const dist=run?.distance||0,next=(Math.floor(dist/MILESTONE)+1)*MILESTONE,within=dist%MILESTONE;
  $("collectionTop",game).textContent=roster().length+" Pokémon";$("moneyTop",game).textContent=regionPoolStatusText();$("moneyTop",game).title=regionPoolDetailText();$("distance",game).textContent=fmt(dist)+" / próximo hito "+fmt(next);$("bestDistance",game).textContent=fmt(gs.bestDistance);const routePct=Math.min(100,within/MILESTONE*100);$("objectiveFill",game).style.width=routePct+'%';globalSyncRouteTrainerMarker(routePct);const routeName=$("routeHudName",game);if(routeName){routeName.textContent="";routeName.classList.add("hidden");}$("nextBoss",game).textContent=((Math.floor(dist/1000)+1))+" km";const lobbyBanner=$("pkLobbyBanner",game);if(lobbyBanner)lobbyBanner.classList.add("hidden");
  const start=$("startBtn",game),stop=$("stopRunBtn",game);if(run){start.textContent=run.paused?'▶ Continuar expedición':'⏸ Pausar expedición';stop.disabled=!!run.rewardPending;}else{start.textContent='Comenzar expedición';start.disabled=!canStart()||!gs.formation.some(Boolean);stop.disabled=true;}
  qa('[data-speed]',game).forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===(run?.speed||gs.preferredSpeed||1)));
  const ap=$("autoPotionBtn",game);if(ap){ap.disabled=!globalPotionUnlocked();ap.classList.toggle("active",globalPotionEnabled());ap.title=globalPotionUnlocked()?"Auto-Poción Global · cada Pokémon usa consumibles de su propia región":"Auto-Poción no está desbloqueada en ninguna región disponible";}
  q('.hud',game)?.classList.toggle('hidden',!run);q('.route-progress',game)?.classList.toggle('hidden',!run);
  const snap=window.PokeSendaPublicProfileBridge?.snapshot?.(),tv=window.PokeSendaPublicProfileBridge?.trainerVisual?.(snap?.trainerId||'red',run&&!run.paused?'back':'front'),host=q('.pk-trainer-back',game);let img=q('img',host);if(!img&&host&&tv?.src){host.innerHTML='<img alt="Entrenador">';img=q('img',host);}if(img&&tv?.src){img.src=tv.src;img.dataset.pkCustomFacing=run&&!run.paused?'back':'front';host?.style.setProperty('--pk-global-trainer-scale',String(Number(tv?.scale)||1));}
  if(host){host.style.pointerEvents="auto";host.style.cursor="pointer";host.title="Abrir Perfil del Entrenador";host.onclick=e=>{e.preventDefault();e.stopPropagation();globalOpenTrainerProfile();};const name=q('.pk-trainer-name',host);if(name){name.textContent=String(snap?.name||name.textContent||'').trim();name.classList.toggle('hidden',!name.textContent);name.style.setProperty('top','auto','important');name.style.setProperty('bottom','2px','important');name.style.setProperty('left','auto','important');name.style.setProperty('right','-42px','important');name.style.setProperty('transform','none','important');}}
}

function renderDamage(){
  const h=$("damagePanel",game);if(!h)return;
  const metric=["damage","taken","healing"].includes(damagePanelMode)?damagePanelMode:"damage";
  if(!run){h.innerHTML='<div class="damage-tabs"><button class="damage-tab active" data-g-dmg="damage">Daño acumulado</button><button class="damage-tab" data-g-dmg="taken">Daño recibido</button><button class="damage-tab" data-g-dmg="healing">Curación</button></div><div class="damage-empty">La información aparecerá al comenzar la Infinita.</div>';return;}
  const rows=Object.values(run.team),value=p=>Number(p.stats?.[metric]||0),total=rows.reduce((n,p)=>n+value(p),0),max=Math.max(1,...rows.map(value)),cfg=metric==="taken"?{title:"🛡 Daño recibido",label:"recibido"}:metric==="healing"?{title:"💚 Curación",label:"curado"}:{title:"⚔ Daño acumulado · Global",label:"daño"};
  rows.sort((a,b)=>value(b)-value(a));
  h.innerHTML='<div class="damage-tabs"><button class="damage-tab '+(metric==="damage"?'active':'')+'" data-g-dmg="damage">Daño acumulado</button><button class="damage-tab '+(metric==="taken"?'active':'')+'" data-g-dmg="taken">Daño recibido</button><button class="damage-tab '+(metric==="healing"?'active':'')+'" data-g-dmg="healing">Curación</button></div><div class="damage-head"><b>'+cfg.title+'</b><div class="grow"></div><small>'+Math.round(total).toLocaleString('es-CL')+' total</small></div><div class="damage-list">'+rows.map(p=>{const v=value(p),pct=total?v/total*100:0;return '<div class="damage-row"><img src="'+sprite(p.dex,p.shiny)+'"><div class="damage-main"><b>'+p.name+' · '+regionLabel(p.region)+'</b><div class="damage-bar"><div class="damage-fill" style="width:'+(v/max*100).toFixed(1)+'%"></div></div></div><div class="damage-number"><b>'+Math.round(v).toLocaleString('es-CL')+'</b><small>'+pct.toFixed(1)+'% · KO '+p.stats.kos+'</small></div></div>';}).join('')+'</div>';
  h.querySelectorAll('[data-g-dmg]').forEach(b=>b.onclick=()=>{damagePanelMode=b.dataset.gDmg||'damage';renderDamage();});
}
function renderLog(){const l=$("log",game);if(l)l.innerHTML=(run?.logs||['Expedición Infinita lista.']).map(x=>'<div>'+x+'</div>').join('');const hist=$("expeditionHistory",game);if(hist)hist.innerHTML=gs.history.length?gs.history.map(h=>'<details class="exp-history-card"><summary><span><b>'+h.result+' · Infinita</b><small>'+new Date(h.at).toLocaleString('es-CL')+'</small></span><span><b>'+fmt(h.distance)+'</b><small>'+h.rounds+' oleadas</small></span></summary><div class="exp-history-team">'+h.party.map(p=>'<div class="exp-history-mon"><img src="'+sprite(p.dex)+'"><b>'+p.name+' · '+regionLabel(p.region)+'</b><small>Nv.'+p.level+' · daño '+p.damage.toLocaleString('es-CL')+'</small></div>').join('')+'</div></details>').join(''):'<div class="exp-history-empty">Todavía no hay intentos de Infinita terminados.</div>';if($("expeditionHistoryCount",game))$("expeditionHistoryCount",game).textContent=String(gs.history.length);}
function render(force=false){if(!root||root.classList.contains('hidden'))return;renderTop();const fs=JSON.stringify([gs.formation,!!run,run?.paused,run?Object.values(run.team).map(p=>[p.ref,p.level,p.alive]):[]]);if(force||fs!==formationSig){formationSig=fs;renderFormation()}const ws=JSON.stringify([!!run,assignments().map(x=>x.ref),run?.enemies?.map(e=>[e.uid,e.alive,e.dex])]);if(force||ws!==worldSig){worldSig=ws;renderWorld()}else renderFrame();renderDamage();renderLog();}
function openDetail(ref){const p=(run?.team?.[ref])||rosterMap().get(ref);if(!p)return;const stats=p.stats&&p.stats.maxHp?p.stats:p,moves=p.moves||[];$("pokemonDetailTitle",detail).textContent=p.name+' · '+regionLabel(p.region);const heldDef=itemDefFor(p),held=p.heldItem?(heldDef?.name||'Objeto equipado'):'Ninguno',heldHtml=p.heldItem?(globalItemIconHtml(heldDef,"small")+' '+held):held,status=globalStatusHTML(p)||'Sin alteraciones';$("pokemonDetailContent",detail).innerHTML='<div class="team-card"><div class="team-head"><img class="poke-img" src="'+sprite(p.dex,p.shiny)+'"><div class="team-title"><b>'+p.name+' · Nv.'+p.level+'</b><small>'+(p.types||stats.types||[]).join('/')+' · '+Math.ceil(Number(p.hp ?? stats.maxHp ?? p.maxHp ?? 0))+'/'+Math.round(stats.maxHp||p.maxHp||0)+' PS</small><span class="role-badge">'+rarityName(p.rarity)+'</span><div class="stars">'+'★'.repeat(Math.max(1,p.stars||1))+'</div></div></div><div class="database-note">Estado: <b>'+status+'</b> · Objeto: <b>'+heldHtml+'</b><br>Ficha de combate en solo lectura mientras la Infinita está activa.</div><div class="moves-first-label">MOVIMIENTOS</div><div class="skills">'+moves.map(x=>'<div class="skill move-skill"><strong><span>'+x.m.name+'</span><span>R'+Math.max(1,x.rank||1)+'</span></strong><small>'+x.m.type+' · '+(x.m.kind==='attack'?'Potencia '+(x.m.power||'—'):'Support')+'</small></div>').join('')+'</div><div class="statline"><span>ATQ '+Number(stats.atk||p.atk||0).toFixed(1)+' · AT.ESP '+Number(stats.spAtk||p.spAtk||0).toFixed(1)+'</span><span>DEF '+Number(stats.def||p.def||0).toFixed(0)+' · DEF.ESP '+Number(stats.spDef||p.spDef||0).toFixed(0)+'</span></div></div>';detail.classList.remove('hidden');}
function showSummary(title,text,button,retry){const s=$("summary",game);$("summaryTitle",game).textContent=title;$("summaryText",game).textContent=text;$("sumDistance",game).textContent=fmt(gs.lastRun?.distance||gs.bestDistance);$("sumCheckpoint",game).textContent='0 m';$("repeatBtn",game).textContent=button;$("summaryCloseBtn",game)?.classList.add('hidden');$("repeatBtn",game).onclick=()=>{s.classList.remove('show');if(retry)startRun();};s.classList.add('show');}
function getState(){return JSON.parse(JSON.stringify(gs))}
function syncEntryPoints(){
  const isOpen=unlocked();
  const krs=document.querySelector('body > .game #routeSelect');
  const kopt=krs?[...krs.options].find(o=>o.value==='infinite'):null;
  if(kopt&&isOpen){kopt.disabled=false;kopt.textContent='♾ Expedición Infinita · Global';}
  const jrs=document.querySelector('#pkRegionRuntimeRoot .game #routeSelect');
  const jopt=jrs?[...jrs.options].find(o=>o.value==='global_infinite'):null;
  if(jopt){jopt.disabled=!isOpen;jopt.textContent=isOpen?'♾ Expedición Infinita · Global':'🔒 Expedición Infinita · completa la tercera ruta de una región';}
}
function devGiftShowStandalone(){
  build();
  const rootHidden=root.classList.contains("hidden"),gameHidden=game.classList.contains("hidden");
  devGiftStandaloneContext={rootHidden,gameHidden};
  if(rootHidden){root.classList.remove("hidden");game.classList.add("hidden");}
}
function devGiftRestoreStandalone(){
  const c=devGiftStandaloneContext;if(!c)return;devGiftStandaloneContext=null;
  if(c.gameHidden)game.classList.add("hidden");else game.classList.remove("hidden");
  if(c.rootHidden)root.classList.add("hidden");else root.classList.remove("hidden");
}
function devOpenMilestoneGift(km=10){
  try{
    build();km=Math.max(10,Math.round((Number(km)||10)/10)*10);
    const rewardVisible=!!(reward&&!reward.classList.contains("hidden"));
    if(run)return {ok:false,msg:"Hay una Expedición Infinita activa. Termínala o detenla antes de abrir este regalo."};
    if(rewardSession&&rewardVisible)return {ok:false,msg:"Ya hay un Gachapon/recompensa abierto. Termínalo antes de abrir otro regalo."};
    if(rewardSession&&!rewardVisible)rewardSession=null;
    if(gs.pendingReward){
      if(gs.pendingReward.adminGift){
        devGiftShowStandalone();openReward();
        return {ok:false,recoveredPending:true,msg:"Había un Gachapon regalado que quedó oculto por el bug anterior. Lo recuperé y lo abrí ahora; este regalo sigue guardado."};
      }
      return {ok:false,msg:"Tienes un Gachapon de hito real pendiente en Expedición Infinita. Ábrelo primero y luego vuelve a este regalo."};
    }
    const gift=buildReward(km*1000,true);
    if(!gift)return {ok:false,msg:"Todavía no hay un pool regional elegible para este Gachapon de hito."};
    gift.adminGift=true;gs.pendingReward=gift;save();devGiftShowStandalone();openReward();
    return {ok:true,km,milestone:gift.milestone,rates:gift.rates};
  }catch(e){devGiftRestoreStandalone();return {ok:false,msg:e?.message||"No se pudo abrir el Gachapon de hito regalado"};}
}
window.PokeSendaGlobalInfinite={open,close,openBox:openGlobalBox,unlocked,getState,saveKey:SAVE,syncEntryPoints,devOpenMilestoneGift,registerRegion:(key,provider)=>{key=String(key||"").trim();if(!key||key==="kanto"||key==="johto"||!provider)return false;EXTRA_REGION_PROVIDERS.set(key,{...provider,key,label:provider.label||key});ensureFormation();syncEntryPoints();return true;},unregisterRegion:key=>EXTRA_REGION_PROVIDERS.delete(String(key||"")),rosterSnapshot:()=>JSON.parse(JSON.stringify(roster())),diagnose:()=>({unlocked:unlocked(),canStart:canStart(),busy:regionalBusy(),formation:[...gs.formation],regions:["kanto","johto",...EXTRA_REGION_PROVIDERS.keys()],regionProgress:Object.fromEntries(regionKeys().map(r=>[r,regionProgress(r)])),roster:roster().length,bossPool:bossCatalog().length,bestDistance:Number(gs.bestDistance||0),totalRuns:Number(gs.totalRuns||0),pendingReward:!!gs.pendingReward,run:!!run,active:run?assignments().map(x=>x.ref):[],enemies:run?enemies().map(e=>({name:e.name,level:e.level,hp:e.hp,maxHp:e.maxHp,status:e.status?.type||null})):[],speed:run?.speed||gs.preferredSpeed,typeImmunityCheck:typeMult('normal',['ghost']),rules:{bossEvery:1000,milestoneEvery:MILESTONE,bossLevel:MAX_LEVEL,rewardBaseLevel:42,restartMeters:0,speeds:[1,2,4,6]}})};
function installKantoIntercept(){syncEntryPoints();const rs=document.querySelector('body > .game #routeSelect');if(!rs)return;if(rs.dataset.globalInfiniteHook)return;rs.dataset.globalInfiniteHook='1';rs.addEventListener('change',e=>{if(e.target.value!=='infinite')return;e.stopImmediatePropagation();e.preventDefault();if(!unlocked()){toast('🔒 Completa la tercera ruta de Kanto, Johto o Hoenn para desbloquear la Infinita Global.');K()?.refresh?.();syncEntryPoints();return;}open(window.PokeSendaRegionBoot?.isHoennClone?'hoenn':'kanto');K()?.refresh?.();syncEntryPoints();},true);}
function keepEntryPointsSynced(){syncEntryPoints();clearTimeout(keepEntryPointsSynced._t);keepEntryPointsSynced._t=setTimeout(keepEntryPointsSynced,2000);}

document.addEventListener("visibilitychange",()=>{if(run&&!document.hidden)tick();else if(run&&document.hidden)run.wallTickMs=Date.now();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{migrateLegacyInfinite();installKantoIntercept();keepEntryPointsSynced();},{once:true});else{migrateLegacyInfinite();installKantoIntercept();keepEntryPointsSynced();}setTimeout(installKantoIntercept,800);setTimeout(installKantoIntercept,2200);
})();


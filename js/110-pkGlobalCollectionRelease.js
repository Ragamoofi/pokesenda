
(()=>{
'use strict';
// Read-only aggregation. No regional save is merged, copied back, or serialized here.
const HOENN_RELEASED=window.PokeSendaHoennRelease?.enabled===true;
const REGIONS=HOENN_RELEASED?['kanto','johto','hoenn']:['kanto','johto'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=v=>Array.isArray(v)?v:[];
const dexes=v=>[...new Set(list(v).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=386))].sort((a,b)=>a-b);
const count=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;
function johtoFamilyOrder(){
 const families=window.PokeSendaJohtoIsolated?.getData?.()?.families||{};
 const out=[],seen=new Set();
 // Respeta exactamente el mismo orden que la Pokédex regional de Johto:
 // familia por familia y, dentro de cada una, orden evolutivo.
 for(const f of Object.values(families))for(const raw of list(f?.members)){
  const dex=Number(raw);if(!Number.isInteger(dex)||dex<1||dex>251||seen.has(dex))continue;
  seen.add(dex);out.push(dex);
 }
 return out;
}
function hoennFamilyOrder(){return [...(window.PokeSendaHoennArchiveBridge?.catalog||[])];}
function catalog(region){
 if(region==='kanto')return Array.from({length:151},(_,i)=>i+1);
 if(region==='johto')return johtoFamilyOrder();
 return hoennFamilyOrder();
}
function normalize(region,raw={}){
 const sourceCat=raw.catalog?.length?list(raw.catalog):catalog(region),cat=[],catSeen=new Set();
 for(const rawDex of sourceCat){const dex=Number(rawDex);if(Number.isInteger(dex)&&dex>=1&&dex<=386&&!catSeen.has(dex)){catSeen.add(dex);cat.push(dex);}}
 // Los perfiles/saves antiguos de Johto pueden traer dexCatalog ordenado por número Nacional.
 // Para la UI global siempre reconstruimos el orden por familias, sin alterar el save.
 if(region==='johto'||region==='hoenn'){
  const wanted=new Set(cat),ordered=(region==='johto'?johtoFamilyOrder():hoennFamilyOrder()).filter(d=>wanted.has(d));
  for(const d of cat)if(!ordered.includes(d))ordered.push(d);
  cat.splice(0,cat.length,...ordered);
 }
 const valid=new Set(cat);
 const owned=list(raw.owned).filter(p=>p&&valid.has(Number(p.dex))).map(p=>({id:String(p.id||''),dex:Number(p.dex),name:String(p.name||''),level:Math.max(1,count(p.level)),stars:Math.min(5,Math.max(1,count(p.stars))),shiny:!!p.shiny,heldItem:p.heldItem?String(p.heldItem):null}));
 return {region,catalog:cat,seen:dexes([...list(raw.seen),...owned.map(p=>p.dex)]).filter(d=>valid.has(d)),shiny:dexes(raw.shiny).filter(d=>valid.has(d)),owned,badges:[...new Set(list(raw.badges).filter(v=>typeof v==='string'))]};
}
function localSnapshot(){
 const k=(window.PokeSendaRegionBoot?.isHoennClone?window.PokeSendaKantoArchiveBridge:window.PokeSendaKantoGlobalBridge)?.collectionSnapshot?.()||{};
 const j=window.PokeSendaJohtoBattleIsolated?.collectionSnapshot?.()||{};
 const h=(window.PokeSendaHoennGlobalBridge?.collectionSnapshot?.()||window.PokeSendaHoennArchiveBridge?.collectionSnapshot?.()||{});
 return {kanto:normalize('kanto',k),johto:normalize('johto',j),hoenn:normalize('hoenn',h)};
}
function localGlobalInfiniteBest(){
 try{
  const live=Number(window.PokeSendaGlobalInfinite?.getState?.()?.bestDistance||0);
  if(Number.isFinite(live)&&live>0)return live;
  const saved=JSON.parse(localStorage.getItem('pokesenda_global_infinite_v1')||'null');
  return Math.max(0,Number(saved?.bestDistance||0)||0);
 }catch(_){return 0;}
}
function meta(dex,region){
 const k=window.PokeSendaRegionBoot?.isHoennClone?window.PokeSendaKantoArchiveBridge:window.PokeSendaPublicProfileBridge;
 if(dex<=151){const m=k?.pokemonMeta?.(dex);if(m?.name&&!m.name.startsWith('#'))return m;}
 if(region==='hoenn'||dex>251)return window.PokeSendaHoennArchiveBridge?.pokemonMeta?.(dex)||{dex,name:'#'+dex,types:[],rarity:'common'};
 const j=window.PokeSendaJohtoBattleIsolated;
 const m=list(window.PokeSendaJohtoIsolated?.getData?.()?.species).find(p=>Number(p.dex)===dex)||{};
 const f=Object.entries(window.PokeSendaJohtoIsolated?.getData?.()?.families||{}).find(([,v])=>list(v.members).map(Number).includes(dex));
 return {dex,name:m.name||'#'+dex,types:list(m.types),rarity:f?j?.getRarity?.(f[0],dex)||'common':'common',baseStats:m.baseStats};
}
function entries(regions,filter='all'){
 const result=new Map();
 for(const region of REGIONS){
  if(filter!=='all'&&filter!==region)continue;
  const r=regions[region];if(!r)continue;
  const seen=new Set(r.seen),shiny=new Set(r.shiny);
  for(const dex of r.catalog){
   let e=result.get(dex);if(!e){e={dex,seen:false,shiny:false,sources:[],owned:[]};result.set(dex,e);}
   const copies=r.owned.filter(p=>p.dex===dex);
   e.seen=e.seen||seen.has(dex);e.shiny=e.shiny||shiny.has(dex);
   e.sources.push({region,seen:seen.has(dex),shiny:shiny.has(dex)});
   e.owned.push(...copies.map(p=>({...p,region})));
  }
 }
 const out=[...result.values()];
 if(filter==='johto'){
  const rank=new Map(johtoFamilyOrder().map((dex,i)=>[dex,i]));
  return out.sort((a,b)=>(rank.get(a.dex)??9999)-(rank.get(b.dex)??9999)||a.dex-b.dex);
 }
 if(filter==='hoenn'){const rank=new Map(hoennFamilyOrder().map((dex,i)=>[dex,i]));return out.sort((a,b)=>(rank.get(a.dex)??9999)-(rank.get(b.dex)??9999)||a.dex-b.dex);}
 if(filter==='kanto')return out.sort((a,b)=>a.dex-b.dex);
 // Vista TODOS: también mantiene juntas las familias cruzadas Kanto→Johto.
 // Ej.: Pichu→Pikachu→Raichu, Zubat→Golbat→Crobat, Eevee→sus evoluciones.
 const families=Object.values(window.PokeSendaJohtoIsolated?.getData?.()?.families||{}),famByDex=new Map();
 for(const f of families){const members=list(f?.members).map(Number).filter(Number.isInteger);for(const d of members)if(!famByDex.has(d))famByDex.set(d,members);}
 const wanted=new Set(out.map(e=>e.dex)),order=[],used=new Set();
 const push=d=>{if(wanted.has(d)&&!used.has(d)){used.add(d);order.push(d);}};
 for(let d=1;d<=151;d++){
  if(used.has(d)||!wanted.has(d))continue;
  const fam=famByDex.get(d);if(fam)fam.forEach(push);else push(d);
 }
 for(const d of johtoFamilyOrder())push(d);
 for(const d of hoennFamilyOrder())push(d);
 for(const e of out)push(e.dex);
 const rank=new Map(order.map((dex,i)=>[dex,i]));
 return out.sort((a,b)=>(rank.get(a.dex)??9999)-(rank.get(b.dex)??9999)||a.dex-b.dex);
}
function profileStats(d={}){
 const k=d.regions?.kanto||d,j=d.regions?.johto||null,h=HOENN_RELEASED?(d.regions?.hoenn||null):null,ks=k.stats||{},js=j?.stats||{},hs=h?.stats||{};
 const exactK=Array.isArray(k.dexList),exactJ=!j||Array.isArray(j.dexList),exactH=!h||Array.isArray(h.dexList);
 const globalSeen=dexes([...list(k.dexList),...list(j?.dexList),...list(h?.dexList)]),globalShiny=dexes([...list(k.shinyDexList),...list(j?.shinyDexList),...list(h?.shinyDexList)]);
 const max=dexes([...(k.dexCatalog?.length?k.dexCatalog:catalog('kanto')),...(j?(j.dexCatalog?.length?j.dexCatalog:catalog('johto')):[]),...(h?(h.dexCatalog?.length?h.dexCatalog:catalog('hoenn')):[])]).length;
 // Legacy profiles without species lists cannot have an exact deduplicated total.
 const exact=exactK&&exactJ&&exactH;
 const completed=count(ks.achievementUnlocked)+count(js.achievementUnlocked)+count(hs.achievementUnlocked),total=count(ks.achievementTotal)+count(js.achievementTotal)+count(hs.achievementTotal);
 const unlocked=1+(j&&j.started!==false?1:0)+(h&&h.started!==false?1:0);
 return {...ks,badgesTotal:count(ks.badges)+count(js.badges)+count(hs.badges),badgesMax:(h&&h.started!==false)?24:(j&&j.started!==false)?16:8,
 dexTotal:exact?globalSeen.length:count(ks.dex)+count(js.dex)+count(hs.dex),dexTotalMax:exact?max:(h?386:j?251:151),
 shinyDexTotal:exact?globalShiny.length:count(ks.shinyDex)+count(js.shinyDex)+count(hs.shinyDex),shinyDexTotalMax:exact?max:(h?386:j?251:151),
 pokemonOwned:count(ks.pokemonOwned)+count(js.pokemonOwned)+count(hs.pokemonOwned),regionsUnlocked:unlocked,collectionExact:exact,
 infiniteBestDistance:Math.max(count(d.globalInfiniteBestDistance),count(ks.infiniteBestDistance),count(js.infiniteBestDistance),count(hs.infiniteBestDistance)),
 achievementUnlocked:completed,achievementTotal:total,achievementPercent:total?Math.round(completed/total*1000)/10:count(ks.achievementPercent)};
}
function publicSnapshot(k,j,h){
 const local=localSnapshot();
 function enrich(p,r){return {...p,collectionVersion:1,dexCatalog:r.catalog,dexList:r.seen,shinyDexList:r.shiny,ownedDexList:dexes(r.owned.map(p=>p.dex)),collection:r.owned.map(p=>({dex:p.dex,level:p.level,stars:p.stars,shiny:p.shiny})),stats:{...p.stats,dex:r.seen.length,shinyDex:r.shiny.length,pokemonOwned:r.owned.length}};}
 const kr=enrich(k,local.kanto),jr=enrich(j?{...j,started:true}:{region:'johto',started:false,stats:{},badges:[],team:[]},local.johto),hr=enrich(h?{...h,started:true}:{region:'hoenn',started:false,stats:{},badges:[],team:[]},local.hoenn);
 const profile={...kr,v:5,regions:HOENN_RELEASED?{kanto:kr,johto:jr,hoenn:hr}:{kanto:kr,johto:jr}};
 profile.globalInfiniteBestDistance=localGlobalInfiniteBest();
 profile.stats=profileStats(profile);return profile;
}
function remoteSnapshot(d){
 const result={};
 for(const region of REGIONS){
  const p=region==='kanto'?(d.regions?.kanto||d):d.regions?.[region];
  if(!p)continue;
  const copies=Array.isArray(p.collection)?p.collection:list(p.ownedDexList).map(dex=>({dex,level:0,stars:0,legacy:true}));
  result[region]=normalize(region,{catalog:p.dexCatalog,seen:p.dexList,shiny:p.shinyDexList,owned:copies,badges:p.badges});
  result[region].legacy=!Array.isArray(p.collection);result[region].exact=Array.isArray(p.dexList);
 }
 return result;
}
const boundButtons=new WeakSet();
let overlay=null,detail=null,context=null,region='all',filter='all',query='',shinyView=false,returnFocus=null;
function sprite(dex,shiny){return window.PokeSendaPublicProfileBridge?.pokemonSprite?.(dex,shiny)||'';}
function close(){overlay?.classList.add('hidden');detail?.classList.add('hidden');overlay?.classList.remove('pk-global-dex-from-community');detail?.classList.remove('pk-global-dex-from-community');context=null;returnFocus?.focus?.();}
function ensureUI(){
 if(overlay)return;
 overlay=document.createElement('div');overlay.id='pkGlobalDexOverlay';overlay.className='overlay hidden';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','pkGlobalDexTitle');
 overlay.innerHTML='<div class="modal-box pokedex-box"><div class="pokemon-detail-head"><h2 id="pkGlobalDexTitle">📘 Pokédex Global</h2><div class="grow"></div><button class="btn" data-gd-close>Cerrar</button></div><div class="pk-public-dex-tabs" data-gd-regions></div><div class="pk-public-dex-summary" data-gd-summary></div><div class="pk-public-dex-toolbar"><input data-gd-search type="search" placeholder="Buscar nombre o número…" aria-label="Buscar Pokémon"><div class="pk-public-dex-filters"><button class="pk-public-dex-filter active" data-gd-filter="all">Todos</button><button class="pk-public-dex-filter" data-gd-filter="owned">En posesión</button><button class="pk-public-dex-filter" data-gd-filter="seen">Registrados</button><button class="pk-public-dex-filter" data-gd-filter="shiny">Shiny</button><button class="pk-public-dex-filter" data-gd-filter="missing">No capturados</button><button class="btn" data-gd-shiny aria-pressed="false">Vista normal</button></div></div><div class="pokedex-grid" data-gd-grid></div></div>';
 detail=document.createElement('div');detail.id='pkGlobalDexDetail';detail.className='overlay hidden';detail.setAttribute('role','dialog');detail.setAttribute('aria-modal','true');detail.setAttribute('aria-label','Detalle de colección');detail.innerHTML='<div class="modal-box"><div data-gd-detail></div><button class="btn" data-gd-detail-close>Volver a Pokédex Global</button></div>';
 document.body.append(overlay,detail);
 overlay.querySelector('[data-gd-close]').onclick=close;
 overlay.querySelector('[data-gd-search]').oninput=e=>{query=e.target.value;renderGrid();};
 overlay.querySelectorAll('[data-gd-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.gdFilter;renderGrid();});
 overlay.querySelector('[data-gd-shiny]').onclick=()=>{shinyView=!shinyView;renderGrid();};
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 detail.querySelector('[data-gd-detail-close]').onclick=()=>detail.classList.add('hidden');
 detail.addEventListener('click',e=>{if(e.target===detail)detail.classList.add('hidden');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&context){e.preventDefault();e.stopImmediatePropagation();if(!detail.classList.contains('hidden'))detail.classList.add('hidden');else close();}},true);
}
function current(){return context?.remote?context.regions:localSnapshot();}
function open(publicProfile=null,startRegion='all'){
 ensureUI();returnFocus=document.activeElement;context=publicProfile?{remote:true,regions:remoteSnapshot(publicProfile.profile_data||{}),name:publicProfile.player_name||publicProfile.profile_data?.name||'Entrenador'}:{remote:false};
 overlay.classList.toggle('pk-global-dex-from-community',!!publicProfile);detail.classList.toggle('pk-global-dex-from-community',!!publicProfile);
 region=['all',...REGIONS].includes(startRegion)?startRegion:'all';filter='all';query='';shinyView=false;
 overlay.classList.toggle('pk-global-johto',!!document.querySelector('#pkRegionRuntimeRoot:not(.hidden)'));overlay.classList.toggle('pk-global-hoenn',!!window.PokeSendaRegionBoot?.isHoennClone);
 overlay.querySelector('[data-gd-search]').value='';
 overlay.querySelector('#pkGlobalDexTitle').textContent=context.remote?'📘 Pokédex · '+context.name:'📘 Pokédex Global';
 overlay.querySelector('[data-gd-regions]').innerHTML=['all',...REGIONS].map(r=>'<button type="button" class="pk-public-dex-tab" data-gd-region="'+r+'">'+({all:'TODOS',kanto:'KANTO',johto:'JOHTO',hoenn:'HOENN'}[r])+'</button>').join('');
 overlay.querySelectorAll('[data-gd-region]').forEach(b=>b.onclick=()=>{region=b.dataset.gdRegion;renderGrid();});
 overlay.classList.remove('hidden');renderGrid();overlay.querySelector('[data-gd-close]').focus();
}
function renderGrid(){
 if(!context)return;
 const regions=current(),rows=entries(regions,region),q=query.trim().toLocaleLowerCase('es');
 const incomplete=context.remote&&Object.values(regions).some(r=>!r.exact);
 overlay.querySelector('[data-gd-summary]').innerHTML='<span>📘 '+rows.filter(e=>e.seen).length+'/'+rows.length+' registrados</span><span>📦 '+rows.filter(e=>e.owned.length).length+' especies en posesión</span><span>✨ '+rows.filter(e=>e.shiny).length+' Shiny</span>'+(incomplete?'<span>Perfil antiguo: detalle parcial; se actualizará al volver a conectarse.</span>':'');
 overlay.querySelectorAll('[data-gd-region]').forEach(b=>b.classList.toggle('active',b.dataset.gdRegion===region));
 overlay.querySelectorAll('[data-gd-filter]').forEach(b=>b.classList.toggle('active',b.dataset.gdFilter===filter));
 const toggle=overlay.querySelector('[data-gd-shiny]');toggle.textContent=shinyView?'✨ Vista Shiny':'Vista normal';toggle.setAttribute('aria-pressed',String(shinyView));
 const shown=rows.map(e=>({...e,meta:meta(e.dex,e.sources[0].region)})).filter(e=>{
  if(q&&!(`${e.dex} ${e.meta.name}`).toLocaleLowerCase('es').includes(q))return false;
  return filter==='owned'?!!e.owned.length:filter==='seen'?e.seen:filter==='shiny'?e.shiny:filter==='missing'?!e.seen:true;
 });
 const host=overlay.querySelector('[data-gd-grid]');
 host.innerHTML=shown.map(e=>{const use=shinyView&&e.shiny,stars=Math.max(0,...e.owned.filter(p=>!regions[p.region].legacy).map(p=>p.stars));return '<button type="button" class="dex-card '+(e.seen?'discovered':'locked')+' rarity-'+esc(e.meta.rarity||'common')+'" data-gd-dex="'+e.dex+'" aria-label="'+esc('#'+e.dex+' '+(e.seen?e.meta.name:'No capturado'))+'"><div class="dex-meta">#'+String(e.dex).padStart(3,'0')+' · '+e.sources.map(r=>r.region==='johto'?'Johto':r.region==='hoenn'?'Hoenn':'Kanto').join(' / ')+'</div><img loading="lazy" decoding="async" src="'+esc(sprite(e.dex,use))+'" alt=""><div class="dex-name">'+esc(e.seen?e.meta.name:'???')+'</div><div class="dex-meta">'+(e.owned.length?'En posesión':e.seen?'Registrado':'No capturado')+(stars?' · '+stars+'★':'')+(e.shiny?' · ✨':'')+'</div><div class="rarity '+esc(e.meta.rarity||'common')+'">'+esc(({common:'Común',uncommon:'Poco común',rare:'Raro',epic:'Épico',legendary:'Legendario'})[e.meta.rarity]||'Común')+'</div></button>';}).join('')||'<div class="pk-players-empty">No hay Pokémon con esos filtros.</div>';
 host.querySelectorAll('[data-gd-dex]').forEach(b=>b.onclick=()=>showDetail(Number(b.dataset.gdDex)));
}
function showDetail(dex){
 const regions=current(),e=entries(regions,region).find(e=>e.dex===dex);if(!e)return;
 const m=meta(dex,e.sources[0].region),host=detail.querySelector('[data-gd-detail]');
 host.innerHTML='<h2>'+esc(e.seen?m.name:'No capturado')+' · #'+dex+'</h2><div class="dex-lore-hero"><img src="'+esc(sprite(dex,shinyView&&e.shiny))+'" alt="'+esc(m.name)+'"><div><p>'+esc(list(m.types).join(' / '))+'</p>'+e.sources.map(r=>'<p><b>'+esc(r.region.toUpperCase())+'</b> · '+(r.seen?'Registrado':'No registrado')+(r.shiny?' · Shiny registrado':'')+'</p>').join('')+'</div></div>'+e.owned.map((p,i)=>'<div class="option-row"><div><b>'+esc(p.region.toUpperCase())+'</b><p>'+(!regions[p.region].legacy?'Nv. '+p.level+' · '+p.stars+'★'+(p.shiny?' · Shiny equipado':''):'En posesión · detalle pendiente de actualizar')+'</p></div>'+(!context.remote&&((p.region==='johto')===!!document.querySelector('#pkRegionRuntimeRoot:not(.hidden)'))?'<button class="btn" data-gd-native="'+i+'">Abrir ficha regional</button>':'')+'</div>').join('')+'<p class="muted tiny">'+(context.remote?'Colección pública de solo lectura.':'Los Pokémon y su progreso pertenecen a su región de origen.')+'</p>';
 if(!context.remote){const more=document.createElement('div');more.innerHTML=e.owned.map(p=>{const v=p.region==='kanto'?window.PokeSendaKantoGlobalBridge?.collectionDetail?.(p.id):p.region==='johto'?window.PokeSendaJohtoBattleIsolated?.getPokemonView?.(p.id):p.region==='hoenn'?(window.PokeSendaHoennGlobalBridge?.collectionDetail?.(p.id)||window.PokeSendaHoennArchiveBridge?.collectionDetail?.(p.id)):null;if(!v)return '';const stats=v.stats||{},state=v.p||{},item=p.heldItem&&(v.item||window.PokeSendaJohtoBattleIsolated?.getItemDef?.(p.heldItem));return '<div class="dex-lore-section"><h3>'+esc(p.region.toUpperCase())+' · '+esc(p.name||m.name)+'</h3><p>Naturaleza: '+esc(state.nature||'—')+' · EXP: '+count(state.xp)+' · Caramelos: '+count(state.candies)+'</p><p>Objeto: '+esc(item?.name||p.heldItem||'Ninguno')+'</p><div class="combat-stat-grid">'+[['maxHp','PS'],['atk','ATQ'],['spAtk','AT. ESP.'],['def','DEF'],['spDef','DEF. ESP.']].map(([k,label])=>'<div class="combat-stat">'+label+' <b>'+Math.round(count(stats[k]))+'</b></div>').join('')+'</div><p class="tiny muted">Estadísticas regionales calculadas; los efectos temporales dependen del combate.</p><h4>Movimientos y MT</h4>'+list(v.moves).map(x=>'<p>'+esc(x.m?.name||'Movimiento')+' · '+esc(x.m?.type||'')+' · rango '+count(x.rank)+(x.unlocked===false?' · bloqueado':'')+'</p>').join('')+'</div>';}).join('');host.appendChild(more);}
 host.querySelectorAll('[data-gd-native]').forEach(b=>b.onclick=()=>{
  const p=e.owned[Number(b.dataset.gdNative)];if(!p)return;
  close();if(p.region==='kanto')window.PokeSendaKantoGlobalBridge?.openCollectionEntry?.(p.id);else if(p.region==='johto')window.PokeSendaJohtoRuntime?.openCollectionEntry?.(p.id);else if(window.PokeSendaRegionBoot?.isHoennClone)window.PokeSendaKantoGlobalBridge?.openCollectionEntry?.(p.id);
 });
 detail.classList.remove('hidden');detail.querySelector('[data-gd-detail-close]').focus();
}
function installButtons(){
 document.querySelectorAll('[id="pokedexOverlay"],[id="playerProfileOverlay"]').forEach(host=>{
  const head=host.querySelector('.pokemon-detail-head');if(!head)return;
  let b=head.querySelector('[data-global-dex-open]');
  if(!b){b=document.createElement('button');b.type='button';b.className='btn';b.dataset.globalDexOpen='1';}
  if(host.id==='playerProfileOverlay'){
    b.textContent='📘 Pokédex';
    b.title='Abrir Pokédex';
    const close=head.querySelector('#playerProfileCloseBtn');
    if(close)close.insertAdjacentElement('beforebegin',b);else if(!b.parentElement)head.appendChild(b);
  }else{
    b.textContent='🌐 Pokédex Global';
    if(!b.parentElement)head.appendChild(b);
  }
  if(!boundButtons.has(b)){b.onclick=()=>open();boundButtons.add(b);}
 });
}
function decorateProfile(host){
 if(!host)return;

 const hero=host.querySelector('[id="playerProfileHero"]');
 const modal=host.querySelector('.player-profile-box');
 if(!hero||!modal)return;

 // Los renderizadores regionales de Kanto/Johto siguen preparando sus datos
 // nativos. Esta capa solo reorganiza la presentación del Perfil propio.
 host.querySelector('[data-global-profile-summary]')?.remove();
 host.querySelector('[data-self-profile-shell]')?.remove();

 const live=window.PokeSendaPublicProfileBridge?.snapshot?.()||null;
 const k=window.PokeSendaRegionBoot?.isHoennClone?(window.PokeSendaKantoArchiveBridge?.profile?.()||null):live;
 const j=window.PokeSendaJohtoBattleIsolated?.getGlobalProfile?.()||null;
 const h=HOENN_RELEASED?(()=>{try{if(window.PokeSendaRegionBoot?.isHoennClone&&live){return {...live,region:'hoenn',started:true};}const a=window.PokeSendaHoennArchiveBridge,cs=a?.collectionSnapshot?.()||{},sv=a?.read?.()||{},rm=new Map((a?.roster?.()||[]).map(x=>[x.ref,x])),team=(a?.formation?.()||[]).map((ref,i)=>{const m=rm.get(ref);return m?{dex:m.dex,name:m.name,level:m.level,stars:m.stars,shiny:m.shiny,role:['Guardia','Asalto','Apoyo'][i%3]}:null}).filter(Boolean),unlocked=sv.achievements&&typeof sv.achievements==='object'&&sv.achievements.unlocked&&typeof sv.achievements.unlocked==='object'?sv.achievements.unlocked:{},validAch=Array.isArray(a?.achievementIds)?a.achievementIds:[],ach=validAch.length?validAch.filter(id=>!!unlocked[id]).length:Object.keys(unlocked).length,totalAch=Number(a?.achievementTotal||validAch.length||60);return{region:'hoenn',started:!!(sv.starter||(Array.isArray(sv.owned)&&sv.owned.length)),stats:{badges:cs.badges?.length||0,dex:cs.seen?.length||0,shinyDex:cs.shiny?.length||0,pokemonOwned:cs.owned?.length||0,avgTeamLevel:team.length?team.reduce((n,x)=>n+Number(x.level||0),0)/team.length:0,achievementUnlocked:ach,achievementTotal:totalAch},badges:cs.badges||[],team,dexCatalog:cs.catalog||[],dexList:cs.seen||[],shinyDexList:cs.shiny||[],ownedDexList:(cs.owned||[]).map(x=>x.dex)};}catch(_){return null;}})():null;
 const regions=localSnapshot();if(!HOENN_RELEASED)delete regions.hoenn;
 const rows=entries(regions);

 const escSelf=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=v=>Number.isFinite(Number(v))?Number(v):0;
 const pct=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
 const fmtMeters=v=>{
   const n=Math.max(0,Number(v)||0);
   return n>=1000?(n/1000).toFixed(n>=10000?0:1).replace('.',',')+' km':Math.round(n)+' m';
 };
 const achievementPct=(key,r)=>{
   const s=r?.stats||{};
   // El porcentaje de Logros siempre representa LOGROS COMPLETADOS / LOGROS TOTALES.
   // No usar puntos: cada logro puede valer una cantidad distinta y eso inflaba Johto
   // (por ejemplo, 5 puntos del primer logro / ~30 logros ≈ 17% aunque solo sea 1 logro).
   if(Number.isFinite(Number(s.achievementPercent)))return pct(s.achievementPercent);
   const done=num(s.achievementUnlocked),total=num(s.achievementTotal);
   if(total>0)return pct(done/total*100);
   if(key==='johto'){
     try{
       const a=window.PokeSendaJohtoRuntime?.achievementSummary?.()||{};
       const unlocked=num(a.unlocked??a.completed??0),countTotal=num(a.count??a.totalAchievements??0);
       return countTotal>0?pct(unlocked/countTotal*100):0;
     }catch(_){return 0;}
   }
   return 0;
 };
 const trainerId=String(live?.trainerId||k?.trainerId||'red');
 const trainerName=String(live?.name||k?.name||host.querySelector('.profile-name')?.textContent||'Entrenador').trim()||'Entrenador';
 const jStarted=!!j&&j.started!==false,hStarted=!!h&&h.started!==false;
 const globalOwned=(regions.kanto?.owned?.length||0)+(regions.johto?.owned?.length||0)+(regions.hoenn?.owned?.length||0);
 const globalBadges=(regions.kanto?.badges?.length||0)+(regions.johto?.badges?.length||0)+(regions.hoenn?.badges?.length||0);
 const globalShiny=rows.filter(r=>r.shiny).length;
 const globalDex=rows.filter(r=>r.seen).length;
 const globalBest=Math.max(
   num(window.PokeSendaGlobalInfinite?.getState?.()?.bestDistance),
   num(k?.stats?.infiniteBestDistance)
 );

 // Conserva el visor frente/espalda que ya construyó el motor regional.
 const art=hero.firstElementChild;
 while(hero.children.length>1)hero.removeChild(hero.lastElementChild);
 hero.classList.add('pk-self-profile-hero');
 if(art)art.classList.add('pk-self-profile-trainer');

 const copy=document.createElement('div');
 copy.className='pk-self-profile-copy';
 copy.innerHTML=
   '<div class="profile-name">'+escSelf(trainerName)+'</div>'+
   '<div class="muted pk-self-profile-subtitle">Entrenador de PokéSenda</div>'+
   '<div class="pk-public-global-strip pk-self-global-strip">'+
     '<div class="pk-self-metric"><span>🏅</span><b>'+globalBadges+'/'+(HOENN_RELEASED?24:16)+'</b><small>Medallas</small></div>'+
     '<div class="pk-self-metric"><span>📘</span><b>'+globalDex+'/'+rows.length+'</b><small>Pokédex</small></div>'+
     '<div class="pk-self-metric"><span>🔴</span><b>'+globalOwned+'</b><small>Pokémon poseídos</small></div>'+
     '<div class="pk-self-metric"><span>✨</span><b>'+globalShiny+'</b><small>Especies Shiny</small></div>'+
     '<div class="pk-self-metric"><span>♾️</span><b>'+fmtMeters(globalBest)+'</b><small>Récord Infinita</small></div>'+
   '</div>';
 hero.appendChild(copy);

 // Oculta la antigua presentación regional larga.
 modal.querySelectorAll(':scope > .profile-section').forEach(s=>s.style.display='none');

 const shell=document.createElement('div');
 shell.dataset.selfProfileShell='1';
 shell.className='pk-self-profile-shell';

 const startingRegion=HOENN_RELEASED&&window.PokeSendaRegionBoot?.isHoennClone?'hoenn':host.closest('#pkRegionRuntimeRoot')?'johto':'kanto';
 let activeRegion=startingRegion==='hoenn'&&hStarted?'hoenn':startingRegion==='johto'&&jStarted?'johto':'kanto';

 const kGyms=[{id:'brock',leader:'Brock',badge:'Medalla Roca',badgeUrl:'assets/embedded/4e8592bc4acc9e8d.png'},{id:'misty',leader:'Misty',badge:'Medalla Cascada',badgeUrl:'assets/embedded/2c72be4e875a7ebc.png'},{id:'surge',leader:'Lt. Surge',badge:'Medalla Trueno',badgeUrl:'assets/embedded/b1240317ba21363a.png'},{id:'erika',leader:'Erika',badge:'Medalla Arcoíris',badgeUrl:'assets/embedded/c49fec3814894f3c.png'},{id:'koga',leader:'Koga',badge:'Medalla Alma',badgeUrl:'assets/embedded/dc97a957c55d3c06.png'},{id:'sabrina',leader:'Sabrina',badge:'Medalla Pantano',badgeUrl:'assets/embedded/736e237720a7443b.png'},{id:'blaine',leader:'Blaine',badge:'Medalla Volcán',badgeUrl:'assets/embedded/62328bc44fe5fcc0.png'},{id:'giovanni',leader:'Giovanni',badge:'Medalla Tierra',badgeUrl:'assets/embedded/8e0681f2c0f486ee.png'}];
 const jGyms=(()=>{try{return window.PokeSendaJohtoRuntime?.gymMeta?.()||[];}catch(_){return [];}})();

 const hGyms=[
   {id:'brock',leader:'Roxanne',badge:'Medalla Piedra',badgeUrl:window.PokeSendaHoennBadgeSprites.brock},
   {id:'misty',leader:'Brawly',badge:'Medalla Puño',badgeUrl:window.PokeSendaHoennBadgeSprites.misty},
   {id:'surge',leader:'Wattson',badge:'Medalla Dinamo',badgeUrl:window.PokeSendaHoennBadgeSprites.surge},
   {id:'erika',leader:'Flannery',badge:'Medalla Calor',badgeUrl:window.PokeSendaHoennBadgeSprites.erika},
   {id:'koga',leader:'Norman',badge:'Medalla Equilibrio',badgeUrl:window.PokeSendaHoennBadgeSprites.koga},
   {id:'sabrina',leader:'Winona',badge:'Medalla Pluma',badgeUrl:window.PokeSendaHoennBadgeSprites.sabrina},
   {id:'blaine',leader:'Tate & Liza',badge:'Medalla Mente',badgeUrl:window.PokeSendaHoennBadgeSprites.blaine},
   {id:'giovanni',leader:'Juan',badge:'Medalla Lluvia',badgeUrl:window.PokeSendaHoennBadgeSprites.giovanni}
 ];
 const regionInfo={
   kanto:{label:'Kanto',icon:'🔵',data:k,max:151,gyms:kGyms},
   johto:{label:'Johto',icon:'🍂',data:j,max:131,gyms:jGyms},
   hoenn:{label:'Hoenn',icon:'🌊',data:h,max:138,gyms:hGyms}
 };

 const sprite=(dex,shiny=false)=>{
   try{return window.PokeSendaPublicProfileBridge?.pokemonSprite?.(Number(dex)||1,!!shiny)||'';}catch(_){return '';}
 };

 const teamHTML=(r,key)=>{
   const team=Array.isArray(r?.team)?r.team:[];
   if(!team.length){
     return '<div class="pk-players-empty">'+(key==='johto'&&!jStarted?'Todavía no has comenzado tu aventura en Johto.':'No tienes Pokémon colocados en la Formación de esta región.')+'</div>';
   }
   return team.map(mon=>{
     const dex=Math.max(1,num(mon?.dex)||1),name=mon?.name||('#'+dex),img=sprite(dex,!!mon?.shiny);
     return '<div class="pk-public-mon">'+
       '<div class="pk-public-role">'+escSelf(mon?.role||'')+'</div>'+
       (img?'<img src="'+escSelf(img)+'" alt="'+escSelf(name)+'">':'')+
       '<b title="'+escSelf(name)+'">'+escSelf(name)+'</b>'+
       '<small>Nv.'+Math.max(1,num(mon?.level)||1)+' · '+Math.max(1,num(mon?.stars)||1)+'★'+(mon?.shiny?' · ✨':'')+'</small>'+
     '</div>';
   }).join('');
 };

 const badgeHTML=(r,gyms)=>{
   if(!gyms.length)return '<div class="pk-players-empty">Sin información de Gimnasios para esta región.</div>';
   const ownedBadges=Array.isArray(r?.badges)?r.badges:[],gymTeams=r?.gymTeams&&typeof r.gymTeams==='object'?r.gymTeams:{};
   return gyms.map(g=>{
     const unlocked=ownedBadges.includes(g.id),badgeName=g.badge||'Medalla',leader=g.leader||g.id,clearTeam=Array.isArray(gymTeams[g.id])?gymTeams[g.id].slice(0,6):[];
     const visual=unlocked?(g.badgeUrl?'<img src="'+escSelf(g.badgeUrl)+'" alt="'+escSelf(badgeName)+'" referrerpolicy="no-referrer" decoding="async" onerror="this.style.display=\'none\';this.parentElement.textContent=\'🏅\'">':'🏅'):'?';
     const clearTeamHTML=unlocked&&clearTeam.length?'<div class="pk-badge-clear-team" title="Equipo con el que superaste este Gimnasio">'+clearTeam.map(mon=>{const dex=Math.max(1,num(mon?.dex)||1),img=sprite(dex,false),name=mon?.name||('#'+dex),lv=Math.max(1,num(mon?.level)||1);return img?'<img src="'+escSelf(img)+'" alt="'+escSelf(name)+'" title="'+escSelf(name)+' · Nv.'+lv+'">':'';}).join('')+'</div>':'';
     return '<div class="pk-public-badge '+(unlocked?'':'locked')+'">'+
       '<div>'+visual+'</div><b>'+escSelf(badgeName)+'</b><small>'+escSelf(leader)+'</small>'+clearTeamHTML+
     '</div>';
   }).join('');
 };

 const regionTabHTML=(key,label,icon,started)=>{
   return '<button class="pk-public-region-tab" type="button" data-self-profile-region="'+key+'" role="tab">'+
     '<span class="pk-public-region-tab-icon">'+icon+'</span>'+
     '<span class="pk-public-region-tab-copy">'+
       '<span class="pk-public-region-tab-title">'+label+'</span>'+
     '</span>'+
   '</button>';
 };

 const panelHTML=key=>{
   const cfg=regionInfo[key],r=cfg.data;
   if((key==='johto'&&!jStarted)||(key==='hoenn'&&!hStarted)){
     const icon=key==='johto'?'🍂':'🌊',label=key==='johto'?'Johto':'Hoenn',req=key==='johto'?'las 8 Medallas de Kanto':'las 8 Medallas de Johto';
     return '<div class="pk-public-region-panel pk-self-region-panel" data-region="'+key+'">'+
       '<div class="pk-public-region-head">'+
         '<div class="pk-public-region-head-copy"><h3>'+icon+' Región de '+label+'</h3><small>Esta aventura todavía no ha comenzado.</small></div>'+
         '<div class="pk-public-region-head-meta"><span class="pk-public-region-status pending">Sin aventura</span></div>'+
       '</div>'+
       '<div class="pk-players-empty pk-public-region-empty">Cuando desbloquees '+label+' con '+req+' y elijas tu inicial, aquí aparecerán sus estadísticas, formación y medallas.</div>'+
     '</div>';
   }
   const s=r?.stats||{},max=cfg.max;
   const dex=num(s.dex)||(Array.isArray(r?.dexList)?r.dexList.length:0);
   const shiny=num(s.shinyDex)||(Array.isArray(r?.shinyDexList)?r.shinyDexList.length:0);
   const owned=num(s.pokemonOwned)||(Array.isArray(r?.ownedDexList)?r.ownedDexList.length:0);
   const badges=num(s.badges)||(Array.isArray(r?.badges)?r.badges.length:0);
   const avg=num(s.avgTeamLevel);
   return '<div class="pk-public-region-panel pk-self-region-panel" data-region="'+key+'">'+
     '<div class="pk-public-region-head">'+
       '<div class="pk-public-region-head-copy"><h3>'+cfg.icon+' Región de '+cfg.label+'</h3><small>Tu progreso de '+cfg.label+'</small></div>'+
       '<div class="pk-public-region-head-meta"><span class="pk-public-region-status ready">Tu aventura</span></div>'+
     '</div>'+
     '<div class="pk-public-stats pk-public-region-stats">'+
       '<div><b>'+badges+'/8</b><small>Medallas</small></div>'+
       '<div><b>'+dex+'/'+max+'</b><small>Pokédex</small></div>'+
       '<div><b>'+shiny+'/'+max+'</b><small>Shiny</small></div>'+
       '<div><b>'+owned+'</b><small>Pokémon poseídos</small></div>'+
       '<div><b>'+achievementPct(key,r)+'%</b><small>Logros</small></div>'+
       '<div><b>'+avg.toFixed(1)+'</b><small>Nivel medio</small></div>'+
     '</div>'+
     '<div class="pk-public-section pk-public-region-section">'+
       '<h3>⚔️ Formación actual · '+cfg.label+'</h3>'+
       '<div class="pk-public-team">'+teamHTML(r,key)+'</div>'+
     '</div>'+
     '<div class="pk-public-section pk-public-region-section pk-public-badges-section">'+
       '<h3>🏅 Medallas de '+cfg.label+'</h3>'+
       '<div class="pk-public-badges">'+badgeHTML(r,cfg.gyms)+'</div>'+
     '</div>'+
   '</div>';
 };

 const renderRegion=key=>{
   if(!regionInfo[key])key='kanto';
   if((key==='johto'&&!jStarted)||(key==='hoenn'&&!hStarted))activeRegion=key;else activeRegion=key;
   const content=shell.querySelector('[data-self-profile-region-content]');
   if(content)content.innerHTML=panelHTML(activeRegion);
   shell.querySelectorAll('[data-self-profile-region]').forEach(btn=>{
     const on=btn.dataset.selfProfileRegion===activeRegion;
     btn.classList.toggle('active',on);
     btn.setAttribute('aria-selected',on?'true':'false');
   });
 };

 shell.innerHTML=
   '<div class="pk-public-region-tabs pk-self-profile-tabs" role="tablist" aria-label="Región del perfil">'+
     regionTabHTML('kanto','Kanto','🔵',true)+
     regionTabHTML('johto','Johto','🍂',jStarted)+
     (HOENN_RELEASED?regionTabHTML('hoenn','Hoenn','🌊',hStarted):'')+
   '</div>'+
   '<div data-self-profile-region-content></div>';

 hero.insertAdjacentElement('afterend',shell);
 shell.querySelectorAll('[data-self-profile-region]').forEach(btn=>btn.addEventListener('click',()=>renderRegion(btn.dataset.selfProfileRegion)));
 renderRegion(activeRegion);
}
window.PokeSendaGlobal=Object.freeze({decorateProfile,snapshot:localSnapshot,entries,normalize,profileStats,publicSnapshot,open:()=>open(),openPublic:open,catalog,remoteSnapshot});
function boot(){installButtons();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
// The regional UI is cloned during its own boot; install once more afterwards.
setTimeout(installButtons,0);
})();


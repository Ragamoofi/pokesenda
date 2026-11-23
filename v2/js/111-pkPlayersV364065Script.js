
(()=>{
  'use strict';
  const SUPABASE_URL='https://rkxbqpamksltyosulmut.supabase.co';
  const SUPABASE_KEY='sb_publishable_Y7aNyG3ggvVxBa6GwGvpsw_eAWhjWwO';
  const CLOUD_LINK_KEY='pokesenda_beta1_cloud_link_v1';
  const PUBLIC_CFG_KEY='pokesenda_beta1_public_profile_v1';
  const AUTO_SESSION_KEY='pokesenda_beta1_online_session_v1';
  const HOENN_RELEASED=window.PokeSendaHoennRelease?.enabled===true;
  const $=id=>document.getElementById(id);
  let profiles=[];
  let busy=false,externalReturn=null;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
  function readCloud(){const v=readJson(CLOUD_LINK_KEY);return v&&v.slotId&&v.secret?v:null;}
  function readCfg(){const v=readJson(PUBLIC_CFG_KEY);return v&&typeof v==='object'?v:{enabled:false};}
  function writeCfg(v){try{localStorage.setItem(PUBLIC_CFG_KEY,JSON.stringify(v));}catch(_){} renderOwner();}
  function markAutoSession(){try{sessionStorage.setItem(AUTO_SESSION_KEY,'1');}catch(_){}}
  function autoSessionStarted(){if(window.PokeSendaHoennRuntime?.isTechnicalClone)return false;try{return sessionStorage.getItem(AUTO_SESSION_KEY)==='1';}catch(_){return false;}}
  function fmtMeters(v){try{return typeof formatMeters==='function'?formatMeters(Number(v)||0):`${((Number(v)||0)/1000).toFixed(2)} km`;}catch(_){return `${Math.round(Number(v)||0)} m`;}}
  function relTime(iso){
    if(!iso)return 'sin fecha';
    const d=Date.now()-new Date(iso).getTime();if(!Number.isFinite(d))return 'sin fecha';
    const m=Math.max(0,Math.floor(d/60000));if(m<1)return 'ahora';if(m<60)return `hace ${m} min`;
    const h=Math.floor(m/60);if(h<24)return `hace ${h} h`;const days=Math.floor(h/24);return `hace ${days} d`;
  }
  async function rpc(fn,args={}){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`,{method:'POST',signal:ctrl.signal,headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(args)});
      const text=await r.text();let body=null;try{body=text?JSON.parse(text):null;}catch(_){body=text;}
      if(!r.ok){const detail=body?.message||body?.details||body?.hint||text||`HTTP ${r.status}`;throw new Error(detail);}
      return body;
    }finally{clearTimeout(timer);}
  }
  function profileSnapshot(){
    try{const live=window.PokeSendaPublicProfileBridge?.snapshot?.();if(!live)return null;
      const k=window.PokeSendaRegionBoot?.isHoennClone?(window.PokeSendaKantoArchiveBridge?.profile?.()||live):live;
      const j=window.PokeSendaJohtoBattleIsolated?.getGlobalProfile?.()||null;
      const a=window.PokeSendaHoennArchiveBridge,s=a?.read?.()||{},cs=a?.collectionSnapshot?.()||{},rm=new Map((a?.roster?.()||[]).map(x=>[x.ref,x])),form=a?.formation?.()||[];
      const team=form.map((ref,i)=>{const m=rm.get(ref);return m?{dex:m.dex,name:m.name,level:m.level,stars:m.stars,shiny:m.shiny,role:['Guardia','Asalto','Apoyo'][i%3]}:null}).filter(Boolean);
      const unlocked=s.achievements&&typeof s.achievements==='object'&&s.achievements.unlocked&&typeof s.achievements.unlocked==='object'?s.achievements.unlocked:{},validAch=Array.isArray(a?.achievementIds)?a.achievementIds:[],ach=validAch.length?validAch.filter(id=>!!unlocked[id]).length:Object.keys(unlocked).length,totalAch=Number(a?.achievementTotal||validAch.length||60);
      const h=HOENN_RELEASED?(window.PokeSendaRegionBoot?.isHoennClone?{...live,region:'hoenn',started:true,stats:{...live.stats,badges:cs.badges?.length||live.stats?.badges||0,dex:cs.seen?.length||live.stats?.dex||0,shinyDex:cs.shiny?.length||live.stats?.shinyDex||0,pokemonOwned:cs.owned?.length||live.stats?.pokemonOwned||0},badges:cs.badges||live.badges||[],team:live.team||team,dexCatalog:cs.catalog||live.dexCatalog||[],dexList:cs.seen||live.dexList||[],shinyDexList:cs.shiny||live.shinyDexList||[],ownedDexList:(cs.owned||[]).map(x=>x.dex)}:{region:'hoenn',started:!!(s.starter||(Array.isArray(s.owned)&&s.owned.length)),stats:{badges:cs.badges?.length||0,dex:cs.seen?.length||0,shinyDex:cs.shiny?.length||0,pokemonOwned:cs.owned?.length||0,avgTeamLevel:team.length?team.reduce((n,x)=>n+Number(x.level||0),0)/team.length:0,teamStars:team.reduce((n,x)=>n+Number(x.stars||0),0),achievementUnlocked:ach,achievementTotal:totalAch},badges:cs.badges||[],team,dexCatalog:cs.catalog||[],dexList:cs.seen||[],shinyDexList:cs.shiny||[],ownedDexList:(cs.owned||[]).map(x=>x.dex)}):null;
      const publicSnap=window.PokeSendaGlobal?.publicSnapshot(k,j,h)||k;
      // Comunidad publica progreso y formación actual, no el equipo histórico usado en cada Gimnasio.
      try{
        if(publicSnap&&typeof publicSnap==='object'){
          delete publicSnap.gymTeams;
          if(publicSnap.regions&&typeof publicSnap.regions==='object'){
            Object.values(publicSnap.regions).forEach(r=>{if(r&&typeof r==='object')delete r.gymTeams;});
          }
        }
      }catch(_){}
      return publicSnap;
    }catch(err){console.error('[PokéSenda Comunidad] No se pudo construir Perfil multirregional:',err);return null;}
  }
function sig(p){
    const s=JSON.stringify(p);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16)+':'+s.length;
  }
  function setMsg(msg,tone='info'){
    const el=$('pkPlayersMessage');if(!el)return;el.className=`pk-players-message ${tone}`;el.textContent=msg;
  }
  function trainerVisual(id){try{return window.PokeSendaPublicProfileBridge?.trainerVisual?.(id)||{src:'',scale:1};}catch(_){return {src:'',scale:1};}}
  function trainerImg(id){return trainerVisual(id).src||'';}
  function trainerScale(id){return Number(trainerVisual(id).scale)||1;}
  function publicPokemonSprite(dex,shiny=false){try{return window.PokeSendaPublicProfileBridge?.pokemonSprite?.(dex,shiny)||'';}catch(_){return '';}}
  function publicGymMeta(){return [{id:'brock',leader:'Brock',badge:'Medalla Roca',badgeUrl:'../assets/embedded/4e8592bc4acc9e8d.png'},{id:'misty',leader:'Misty',badge:'Medalla Cascada',badgeUrl:'../assets/embedded/2c72be4e875a7ebc.png'},{id:'surge',leader:'Lt. Surge',badge:'Medalla Trueno',badgeUrl:'../assets/embedded/b1240317ba21363a.png'},{id:'erika',leader:'Erika',badge:'Medalla Arcoíris',badgeUrl:'../assets/embedded/c49fec3814894f3c.png'},{id:'koga',leader:'Koga',badge:'Medalla Alma',badgeUrl:'../assets/embedded/dc97a957c55d3c06.png'},{id:'sabrina',leader:'Sabrina',badge:'Medalla Pantano',badgeUrl:'../assets/embedded/736e237720a7443b.png'},{id:'blaine',leader:'Blaine',badge:'Medalla Volcán',badgeUrl:'../assets/embedded/62328bc44fe5fcc0.png'},{id:'giovanni',leader:'Giovanni',badge:'Medalla Tierra',badgeUrl:'../assets/embedded/8e0681f2c0f486ee.png'}];}
  function communityHeadlineStats(profile){
    const d=profile?.profile_data||{};return window.PokeSendaGlobal?.profileStats(d)||d.stats||d.regions?.kanto?.stats||{};
  }
  function achievementCompletionPct(stats){
    const s=stats||{};
    const direct=Number(s.achievementPercent);
    if(Number.isFinite(direct)&&direct>=0)return Math.max(0,Math.min(100,direct));
    const done=Number(s.achievementUnlocked),total=Number(s.achievementTotal);
    if(Number.isFinite(done)&&Number.isFinite(total)&&total>0)return Math.max(0,Math.min(100,done/total*100));
    try{const pts=Number(s.achievementPoints||0),max=Number(achievementPointsTotal?.()||0);if(max>0)return Math.max(0,Math.min(100,pts/max*100));}catch(_){}
    return 0;
  }
  function achievementPctLabel(stats){const pct=achievementCompletionPct(stats);return `${pct>=99.95?100:Math.round(pct)}%`;}
  function metric(p,key){
    const s=communityHeadlineStats(p);
    if(key==='badges')return Number((s.badgesTotal??s.badges)||0);
    if(key==='infinite')return Number(s.infiniteBestDistance||0);
    if(key==='dex')return Number((s.dexTotal??s.dex)||0);
    if(key==='achievements')return achievementCompletionPct(s);
    if(key==='team')return Number(s.avgTeamLevel||0)*100+Number(s.teamStars||0);
    return 0;
  }
  function metricLabel(p,key){const s=communityHeadlineStats(p);if(key==='badges')return `${Number((s.badgesTotal??s.badges)||0)}/${Number(s.badgesMax||8)} medallas`;if(key==='infinite')return `♾ ${fmtMeters(s.infiniteBestDistance||0)}`;if(key==='dex')return `Pokédex ${Number((s.dexTotal??s.dex)||0)}/${Number(s.dexTotalMax||151)}`;if(key==='achievements')return `${achievementPctLabel(s)} de logros`;return `Nv. medio ${Number(s.avgTeamLevel||0).toFixed(1)}`;}

  function renderOwner(){
    const host=$('pkPlayersOwner');if(!host)return;
    const link=readCloud(),cfg=readCfg(),snap=profileSnapshot();
    if(!snap){host.innerHTML='<div><b>⏳ Cargando tu Perfil de Entrenador</b><small>PokéSenda está preparando tus datos públicos…</small></div>';const tries=Number(host.dataset.profileRetry||0);if(tries<8){host.dataset.profileRetry=String(tries+1);setTimeout(()=>{try{renderOwner();}catch(_){}},300);}else{host.innerHTML='<div><b>⚠️ No se pudo leer el Perfil</b><small>Actualiza la página con Ctrl + F5. Si continúa, abre Perfil y vuelve a Jugadores.</small></div>';}return;}host.dataset.profileRetry='0';
    if(!link){host.innerHTML='<div><b>🌐 Perfil online automático</b><small>Al pulsar “Comenzar aventura” PokéSenda crea tu identidad online y publica tu resumen automáticamente. Nunca comparte tu save ni tu clave privada.</small></div><button id="pkPlayersConnectNow" class="btn" type="button">↻ Conectar ahora</button>'; $('pkPlayersConnectNow')?.addEventListener('click',()=>autoJoinCommunity({preload:true,manual:true}));return;}
    host.innerHTML=`<div><b>🟢 Perfil online automático</b><small>Ya formas parte de la Comunidad. Tu resumen se actualiza solo mientras juegas; nunca se comparte tu save, Pokédólares, inventario ni clave Cloud.</small></div><div class="pk-owner-actions"><button id="pkPlayersPublish" class="btn" type="button">↻ Actualizar ahora</button></div>`;
    $('pkPlayersPublish')?.addEventListener('click',()=>publishProfile(true));
  }
  async function publishProfile(manual=false){
    if(busy)return false;const link=readCloud(),snap=profileSnapshot();if(!link){if(manual)setMsg('Activa Cloud Save antes de publicar tu perfil.','warn');return false;}if(!snap)return false;
    const cfg=readCfg(),hash=sig(snap);if(!manual&&cfg.publicId&&cfg.lastHash===hash)return true;
    busy=true;if(manual)setMsg('Publicando tu perfil…');
    try{
      const out=await rpc('pokesenda_publish_public_profile',{p_slot_id:link.slotId,p_secret:link.secret,p_profile:snap});
      const row=Array.isArray(out)?out[0]:out;if(!row?.public_id)throw new Error('Supabase no devolvió el perfil público.');
      writeCfg({enabled:true,publicId:row.public_id,lastHash:hash,lastPublishedAt:row.updated_at||new Date().toISOString()});
      if(manual){setMsg('Perfil online actualizado correctamente.','ok');await loadProfiles(false);}
      return true;
    }catch(e){if(manual)setMsg(String(e?.message||e).includes('Could not find')?'Falta instalar la tabla de Jugadores en Supabase. Ejecuta el SQL del parche una sola vez.':`No se pudo publicar: ${e?.message||e}`,'bad');return false;}finally{busy=false;renderOwner();}
  }
  async function autoJoinCommunity({preload=true,manual=false}={}){
    if(window.PokeSendaHoennRuntime?.isTechnicalClone){if(manual)setMsg('La Comunidad está pausada durante una prueba técnica temporal.','warn');return false;}
    markAutoSession();
    if(navigator.onLine===false)return false;
    let link=readCloud();
    if(!link){
      try{link=await window.PKCloud?.ensureLink?.();}catch(e){console.warn('PokéSenda Online · identidad automática:',e);}
      if(!link){if(manual)setMsg('No se pudo crear la identidad online. Revisa tu conexión e inténtalo otra vez.','warn');return false;}
    }
    let snap=profileSnapshot();
    for(let i=0;!snap&&i<12;i++){await new Promise(r=>setTimeout(r,250));snap=profileSnapshot();}
    if(!snap){if(manual)setMsg('El Perfil todavía se está preparando. Inténtalo otra vez en unos segundos.','warn');return false;}
    const ok=await publishProfile(false);
    if(ok&&preload){try{await loadProfiles(false);}catch(_){}}
    if(manual&&ok)setMsg('✅ Perfil conectado automáticamente a la Comunidad.','ok');
    return ok;
  }
  async function unpublishProfile(){
    if(busy)return;const link=readCloud();if(!link)return;busy=true;setMsg('Ocultando tu perfil…');
    try{await rpc('pokesenda_unpublish_public_profile',{p_slot_id:link.slotId,p_secret:link.secret});writeCfg({enabled:false});setMsg('Tu perfil ya no aparece en la Comunidad.','ok');await loadProfiles(false);}catch(e){setMsg(`No se pudo ocultar: ${e?.message||e}`,'bad');}finally{busy=false;renderOwner();}
  }
  async function loadProfiles(showMsg=true){
    if(busy)return;busy=true;if(showMsg)setMsg('Actualizando lista de jugadores…');
    try{
      const out=await rpc('pokesenda_list_public_profiles',{});profiles=Array.isArray(out)?out:[];renderList();if(showMsg)setMsg(`${profiles.length} jugador${profiles.length===1?'':'es'} publicado${profiles.length===1?'':'s'}.`,'ok');
    }catch(e){profiles=[];renderList();setMsg(String(e?.message||e).includes('Could not find')?'La Comunidad todavía no está instalada en Supabase. Ejecuta el archivo SQL del parche una sola vez.':`No se pudo cargar jugadores: ${e?.message||e}`,'bad');}
    finally{busy=false;}
  }
  function sortedFiltered(){
    const q=String($('pkPlayersSearch')?.value||'').trim().toLowerCase(),key=$('pkPlayersSort')?.value||'badges';
    const arr=profiles.filter(p=>!q||String(p.player_name||p.profile_data?.name||'').toLowerCase().includes(q));
    return arr.sort((a,b)=>metric(b,key)-metric(a,key)||Number((communityHeadlineStats(b).badgesTotal??communityHeadlineStats(b).badges)||0)-Number((communityHeadlineStats(a).badgesTotal??communityHeadlineStats(a).badges)||0)||String(a.player_name||'').localeCompare(String(b.player_name||''),'es'));
  }
  function renderList(){
    const host=$('pkPlayersList');if(!host)return;const key=$('pkPlayersSort')?.value||'badges',arr=sortedFiltered(),cfg=readCfg();
    $('pkPlayersCount') && ($('pkPlayersCount').textContent=`${arr.length} jugador${arr.length===1?'':'es'}`);
    if(!arr.length){host.innerHTML='<div class="pk-players-empty">Todavía no hay perfiles publicados con este filtro.</div>';return;}
    host.innerHTML=arr.map((p,i)=>{const d=p.profile_data||{},s=communityHeadlineStats(p),isMe=cfg.publicId&&cfg.publicId===p.public_id,img=trainerImg(p.trainer_id||d.trainerId);return `<button class="pk-player-row" type="button" data-public-id="${esc(p.public_id)}"><span class="pk-player-rank">#${i+1}</span><span class="pk-player-avatar">${img?`<img src="${esc(img)}" alt="">`:''}</span><span class="pk-player-name"><b>${esc(p.player_name||d.name||'Entrenador')}${isMe?' <em>TÚ</em>':''}</b><small>${metricLabel(p,key)} · actualizado ${relTime(p.updated_at)}</small></span><span class="pk-player-metric"><b>🏅 ${Number(s.badgesTotal??s.badges??0)}/${Number(s.badgesMax||8)}</b><small>medallas totales</small></span><span class="pk-player-metric"><b>♾ ${fmtMeters(s.infiniteBestDistance||0)}</b><small>infinita</small></span><span class="pk-player-metric"><b>📘 ${Number(s.dexTotal??s.dex??0)}/${Number(s.dexTotalMax||151)}</b><small>Pokédex global</small></span><span class="pk-player-metric pk-hide-small"><b>🏆 ${achievementPctLabel(s)}</b><small>logros completados</small></span><span class="pk-player-chevron">›</span></button>`;}).join('');
    host.querySelectorAll('[data-public-id]').forEach(el=>el.addEventListener('click',()=>showPublicDetail(el.dataset.publicId)));
  }
  const PUBLIC_TYPE_ES={normal:'Normal',fire:'Fuego',water:'Agua',electric:'Eléctrico',grass:'Planta',ice:'Hielo',fighting:'Lucha',poison:'Veneno',ground:'Tierra',flying:'Volador',psychic:'Psíquico',bug:'Bicho',rock:'Roca',ghost:'Fantasma',dragon:'Dragón',dark:'Siniestro',steel:'Acero',fairy:'Hada'};
  function publicDexMeta(dex,region){
    dex=Number(dex);
    if(region==='kanto'){try{return window.PokeSendaPublicProfileBridge?.pokemonMeta?.(dex)||{dex,name:'#'+dex,types:[]};}catch(_){return {dex,name:'#'+dex,types:[]};}}
    try{const x=window.PokeSendaJohtoBattleIsolated?.getSpeciesInfo?.(dex);if(x)return {dex,name:x.name||('#'+dex),types:[...(x.types||[])]};}catch(_){}
    return {dex,name:'#'+dex,types:[]};
  }
  function localJohtoDexCatalog(){try{const d=window.PokeSendaJohtoIsolated?.getData?.(),vals=Object.values(d?.families||{}).flatMap(f=>Array.isArray(f?.members)?f.members:[]);return [...new Set(vals.map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);}catch(_){return [];}}
  function publicDexPayload(profile,region){
    const d=profile?.profile_data||{},r=region==='kanto'?(d?.regions?.kanto||d):d?.regions?.[region],max=region==='hoenn'?138:region==='johto'?131:151;
    const seen=[...new Set((r?.dexList||[]).map(Number).filter(Number.isFinite))],owned=[...new Set((r?.ownedDexList||[]).map(Number).filter(Number.isFinite))],shiny=[...new Set((r?.shinyDexList||[]).map(Number).filter(Number.isFinite))];
    let catalog=[...new Set((r?.dexCatalog||[]).map(Number).filter(Number.isFinite))];if(!catalog.length)catalog=region==='hoenn'?[...(window.PokeSendaHoennArchiveBridge?.catalog||[])]:region==='johto'?localJohtoDexCatalog():Array.from({length:151},(_,i)=>i+1);
    catalog.sort((a,b)=>a-b);return {r,max,seen:new Set(seen),owned:new Set(owned),shiny:new Set(shiny),catalog,hasExact:Array.isArray(r?.dexList)};
  }
  function renderPublicPokedex(profileId,region='all',filter='all',query=''){
    const p=profiles.find(x=>x.public_id===profileId);if(!p)return;
    window.PokeSendaGlobal?.openPublic(p,region);
  }
  function showPublicDetail(id){
    const p=profiles.find(x=>x.public_id===id);if(!p)return;
    const d=p.profile_data||{},regions=d.regions||{};
    const jk=regions.kanto||d||null,jj=regions.johto||null,jh=HOENN_RELEASED?(regions.hoenn||null):null;
    const img=trainerImg(p.trainer_id||d.trainerId),scale=trainerScale(p.trainer_id||d.trainerId),globalStats=communityHeadlineStats(p);
    const playerName=p.player_name||d.name||'Entrenador';
    const johtoStarted=!!jj&&jj.started!==false,hoennStarted=HOENN_RELEASED&&!!jh&&jh.started!==false;
    $('pkPlayersListView')?.classList.add('hidden');const view=$('pkPlayerDetailView');view?.classList.remove('hidden');if(!view)return;

    const regionInfo={
      kanto:{key:'kanto',label:'Kanto',icon:'🔵',data:jk,defaultMax:151,gyms:publicGymMeta()},
      johto:{key:'johto',label:'Johto',icon:'🍂',data:jj,defaultMax:131,gyms:(()=>{try{return window.PokeSendaJohtoRuntime?.gymMeta?.()||[];}catch(_){return [];}})()},
      hoenn:{key:'hoenn',label:'Hoenn',icon:'🌊',data:jh,defaultMax:138,gyms:[
        {id:'brock',leader:'Roxanne',badge:'Medalla Piedra',badgeUrl:window.PokeSendaHoennBadgeSprites.brock},
        {id:'misty',leader:'Brawly',badge:'Medalla Puño',badgeUrl:window.PokeSendaHoennBadgeSprites.misty},
        {id:'surge',leader:'Wattson',badge:'Medalla Dinamo',badgeUrl:window.PokeSendaHoennBadgeSprites.surge},
        {id:'erika',leader:'Flannery',badge:'Medalla Calor',badgeUrl:window.PokeSendaHoennBadgeSprites.erika},
        {id:'koga',leader:'Norman',badge:'Medalla Equilibrio',badgeUrl:window.PokeSendaHoennBadgeSprites.koga},
        {id:'sabrina',leader:'Winona',badge:'Medalla Pluma',badgeUrl:window.PokeSendaHoennBadgeSprites.sabrina},
        {id:'blaine',leader:'Tate & Liza',badge:'Medalla Mente',badgeUrl:window.PokeSendaHoennBadgeSprites.blaine},
        {id:'giovanni',leader:'Juan',badge:'Medalla Lluvia',badgeUrl:window.PokeSendaHoennBadgeSprites.giovanni}
      ]}
    };
    const regionHasAdventure=(key,r)=>key==='kanto'?!!r:!!r&&r.started!==false;
    const regionMax=(key,r)=>Math.max(1,Number(r?.dexCatalog?.length)||(key==='hoenn'?138:key==='johto'?131:151));
    const statNum=(v,dflt=0)=>Number.isFinite(Number(v))?Number(v):dflt;
    const teamCardsFor=(r,key)=>{
      const team=Array.isArray(r?.team)?r.team:[];
      if(!team.length)return `<div class="pk-players-empty">${key==='johto'&&!regionHasAdventure(key,r)?'Este Entrenador todavía no ha comenzado su aventura en Johto.':'Sin formación publicada en esta región.'}</div>`;
      return team.map(mon=>{const dex=Number(mon?.dex)||1,monImg=publicPokemonSprite(dex,!!mon?.shiny),name=mon?.name||('#'+dex);return `<div class="pk-public-mon"><div class="pk-public-role">${esc(mon?.role||'')}</div>${monImg?`<img src="${esc(monImg)}" alt="${esc(name)}">`:''}<b title="${esc(name)}">${esc(name)}</b><small>Nv.${Math.max(1,statNum(mon?.level,1))} · ${Math.max(1,statNum(mon?.stars,1))}★${mon?.shiny?' · ✨':''}</small></div>`;}).join('');
    };
    const badgeCardsFor=(r,key,gyms)=>{
      if(!gyms?.length)return '<div class="pk-players-empty">Sin datos de Gimnasios para esta región.</div>';
      const badges=Array.isArray(r?.badges)?r.badges:[];
      return gyms.map(g=>{
        const unlocked=badges.includes(g.id),badgeName=g.badge||'Medalla',leader=g.leader||g.id;
        const visual=unlocked?(g.badgeUrl?`<img src="${esc(g.badgeUrl)}" alt="${esc(badgeName)}" referrerpolicy="no-referrer" decoding="async" onerror="this.style.display='none';this.parentElement.textContent='🏅'">`:'🏅'):'?';
        return `<div class="pk-public-badge ${unlocked?'':'locked'}"><div>${visual}</div><b>${esc(badgeName)}</b><small>${esc(leader)}</small></div>`;
      }).join('');
    };
    const regionTabHTML=(key,label,icon,started)=>{
      return `<button class="pk-public-region-tab ${key==='kanto'?'active':''}" type="button" data-profile-region="${key}" role="tab" aria-selected="${key==='kanto'?'true':'false'}"><span class="pk-public-region-tab-icon">${icon}</span><span class="pk-public-region-tab-copy"><span class="pk-public-region-tab-title">${label}</span></span></button>`;
    };
    const regionPanelHTML=key=>{
      const cfg=regionInfo[key],r=cfg.data,started=regionHasAdventure(key,r),s=r?.stats||{},max=regionMax(key,r);
      if(!started&&key!=='kanto')return `<div class="pk-public-region-panel" data-region="${key}"><div class="pk-public-region-head"><div class="pk-public-region-head-copy"><h3>${cfg.icon} Región de ${cfg.label}</h3><small>Este Entrenador todavía no ha comenzado ${cfg.label}.</small></div><div class="pk-public-region-head-meta"><span class="pk-public-region-status pending">Sin aventura</span></div></div><div class="pk-players-empty pk-public-region-empty">Cuando comience su aventura de ${cfg.label}, aquí aparecerán sus estadísticas, formación y medallas con el mismo formato regional.</div></div>`;
      const dex=statNum(s.dex,Array.isArray(r?.dexList)?r.dexList.length:0),shiny=statNum(s.shinyDex,Array.isArray(r?.shinyDexList)?r.shinyDexList.length:0),owned=statNum(s.pokemonOwned,Array.isArray(r?.collection)?r.collection.length:Array.isArray(r?.ownedDexList)?r.ownedDexList.length:0),badges=statNum(s.badges,Array.isArray(r?.badges)?r.badges.length:0),avg=statNum(s.avgTeamLevel,0);
      return `<div class="pk-public-region-panel" data-region="${key}"><div class="pk-public-region-head"><div class="pk-public-region-head-copy"><h3>${cfg.icon} Región de ${cfg.label}</h3><small>Progreso publicado de ${cfg.label}</small></div><div class="pk-public-region-head-meta"><span class="pk-public-region-status ready">Perfil publicado</span></div></div><div class="pk-public-stats pk-public-region-stats"><div><b>${badges}/8</b><small>Medallas</small></div><div><b>${dex}/${max}</b><small>Pokédex</small></div><div><b>${shiny}/${max}</b><small>Shiny</small></div><div><b>${owned}</b><small>Pokémon poseídos</small></div><div><b>${achievementPctLabel(s)}</b><small>Logros</small></div><div><b>${avg.toFixed(1)}</b><small>Nivel medio</small></div></div><div class="pk-public-section pk-public-region-section"><h3>⚔️ Formación actual · ${cfg.label}</h3><div class="pk-public-team">${teamCardsFor(r,key)}</div></div><div class="pk-public-section pk-public-region-section pk-public-badges-section"><h3>🏅 Medallas de ${cfg.label}</h3><div class="pk-public-badges">${badgeCardsFor(r,key,cfg.gyms)}</div></div></div>`;
    };

    view.innerHTML=`<button id="pkPlayersBack" class="btn pk-players-back" type="button">← Volver a jugadores</button><div class="pk-public-hero pk-public-hero-global"><div class="pk-public-trainer">${img?`<img src="${esc(img)}" style="transform:scale(${Number(scale)||1});transform-origin:50% 100%" alt="${esc(playerName)}">`:''}</div><div class="pk-public-hero-copy"><div class="pk-public-name">${esc(playerName)}</div><div class="muted">${HOENN_RELEASED&&hoennStarted?'Entrenador multirregional · Kanto + Johto + Hoenn':johtoStarted?'Entrenador multirregional · Kanto + Johto':'Entrenador de Kanto'} · actualizado ${relTime(p.updated_at)}</div><div class="pk-public-global-strip"><div><b>${Number(globalStats.badgesTotal||globalStats.badges||0)}/${Number(globalStats.badgesMax||8)}</b><small>Medallas totales</small></div><div><b>${Number(globalStats.dexTotal??globalStats.dex??0)}/${Number(globalStats.dexTotalMax||151)}</b><small>Pokédex</small></div><div><b>${Number(globalStats.pokemonOwned||0)}</b><small>Pokémon poseídos</small></div><div><b>${Number(globalStats.shinyDexTotal??globalStats.shinyDex??0)}</b><small>Especies Shiny</small></div><div><b>${fmtMeters(globalStats.infiniteBestDistance||0)}</b><small>Récord Infinita</small></div></div><div class="pk-public-actions"><button id="pkPublicDexBtn" class="btn primary" type="button">📘 Pokédex</button></div></div></div><div class="pk-public-region-tabs" role="tablist" aria-label="Región del perfil">${regionTabHTML('kanto','Kanto','🔵',true)}${regionTabHTML('johto','Johto','🍂',johtoStarted)}${HOENN_RELEASED?regionTabHTML('hoenn','Hoenn','🌊',hoennStarted):''}</div><div id="pkPublicRegionContent">${regionPanelHTML('kanto')}</div>`;

    let activeRegion='kanto';
    const renderRegion=key=>{
      if(!regionInfo[key])key='kanto';activeRegion=key;
      const host=$('pkPublicRegionContent');if(host)host.innerHTML=regionPanelHTML(key);
      view.querySelectorAll('[data-profile-region]').forEach(btn=>{const on=btn.dataset.profileRegion===key;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',on?'true':'false');});

    };
    view.querySelectorAll('[data-profile-region]').forEach(btn=>btn.addEventListener('click',()=>renderRegion(btn.dataset.profileRegion)));
    $('pkPlayersBack')?.addEventListener('click',()=>{$('pkPlayerDetailView')?.classList.add('hidden');$('pkPlayersListView')?.classList.remove('hidden');});
    $('pkPublicDexBtn')?.addEventListener('click',()=>renderPublicPokedex(id,'all','all',''));
    renderRegion('kanto');
  }
  function openPlayers(opts={}){
    ensureUI();
    externalReturn=opts&&opts.returnTo||null;
    $('playerProfileOverlay')?.classList.add('hidden');
    // Johto usa un runtime fijo con z-index muy alto. La Comunidad vive fuera de ese
    // runtime (es compartida Kanto + Johto + Hoenn), así que debemos elevarla por encima y
    // ocultar explícitamente el Perfil regional clonado.
    const johtoProfile=document.querySelector('#pkRegionRuntimeRoot #playerProfileOverlay');
    if(externalReturn==='johto')johtoProfile?.classList.add('hidden');
    const players=$('pkPlayersOverlay');
    if(players){
      players.classList.toggle('pk-players-from-johto',externalReturn==='johto');
      players.classList.remove('hidden');
    }
    $('pkPlayerDetailView')?.classList.add('hidden');
    $('pkPlayersListView')?.classList.remove('hidden');
    renderOwner();loadProfiles(true);
  }
  function closePlayers(backToProfile=true){
    const players=$('pkPlayersOverlay');
    players?.classList.add('hidden');
    players?.classList.remove('pk-players-from-johto');
    if(externalReturn==='johto'){
      externalReturn=null;
      window.PokeSendaJohtoRuntime?.reopenProfile?.();
      return;
    }
    if(backToProfile)$('playerProfileOverlay')?.classList.remove('hidden');
  }
  function ensureUI(){
    const close=$('playerProfileCloseBtn');if(close&&!$('playersOpenBtn')){const b=document.createElement('button');b.id='playersOpenBtn';b.className='btn';b.type='button';b.textContent='👥 Jugadores';close.insertAdjacentElement('beforebegin',b);b.addEventListener('click',openPlayers);}
    if(!$('pkPlayersOverlay')){
      const o=document.createElement('div');o.id='pkPlayersOverlay';o.className='overlay hidden';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.innerHTML=`<div class="modal-box pk-players-box" onclick="event.stopPropagation()"><div class="pokemon-detail-head"><div><h2>👥 Comunidad de Entrenadores</h2><div class="tiny muted">Compara el progreso público de tus amigos sin compartir sus partidas.</div></div><div class="grow"></div><button id="pkPlayersClose" class="btn" type="button">Cerrar</button></div><div id="pkPlayersListView"><div id="pkPlayersOwner" class="pk-players-owner"></div><div class="pk-players-toolbar"><input id="pkPlayersSearch" type="search" placeholder="Buscar entrenador…" aria-label="Buscar entrenador"><select id="pkPlayersSort" aria-label="Ordenar jugadores"><option value="badges">🏅 Medallas</option><option value="infinite">♾ Récord Infinita</option><option value="dex">📘 Pokédex</option><option value="achievements">🏆 Logros</option><option value="team">⚔️ Nivel de equipo</option></select><button id="pkPlayersRefresh" class="btn" type="button">↻ Actualizar</button><span id="pkPlayersCount" class="pill">0 jugadores</span></div><div id="pkPlayersMessage" class="pk-players-message">Los perfiles se conectan automáticamente cuando cada Entrenador comienza su aventura.</div><div id="pkPlayersList" class="pk-players-list"></div></div><div id="pkPlayerDetailView" class="hidden"></div></div>`;document.body.appendChild(o);
      $('pkPlayersClose')?.addEventListener('click',()=>closePlayers(true));o.addEventListener('click',e=>{if(e.target===o)closePlayers(true);});$('pkPlayersRefresh')?.addEventListener('click',()=>loadProfiles(true));$('pkPlayersSearch')?.addEventListener('input',renderList);$('pkPlayersSort')?.addEventListener('change',renderList);
    }
  }
  window.PokeSendaPlayers={open:openPlayers,close:closePlayers,refresh:()=>loadProfiles(true),publish:()=>publishProfile(true),autoJoin:(opts={})=>autoJoinCommunity(opts)};
  function autoTick(){if(!autoSessionStarted()||document.visibilityState!=='visible')return;autoJoinCommunity({preload:false});}
  function boot(){ensureUI();renderOwner();window.addEventListener('online',autoTick);setTimeout(autoTick,5000);setInterval(autoTick,60000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(ensureUI,1000);setTimeout(ensureUI,2500);
})();


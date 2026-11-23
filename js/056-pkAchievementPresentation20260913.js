
/* PokéSenda · Presentación de Logros. Solo DOM; sin acceso al guardado ni al motor. */
(()=>{
  'use strict';
  const views=new WeakMap();
  const fmt=n=>Number(n||0).toLocaleString('es-CL');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const paths={
    all:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    adventure:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
    collection:'<circle cx="12" cy="12" r="9"/><path d="M3 12h6m6 0h6"/><circle cx="12" cy="12" r="3"/>',
    trainer:'<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7z"/><path d="m8 12 3 3 5-6"/>',
    gyms:'<path d="m3 8 9-5 9 5M4 9h16M6 9v10m6-10v10m6-10v10M3 21h18"/>',
    special:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    trophy:'<path d="M7 3h10v5c0 5-2 7-5 7s-5-2-5-7zM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4m-4 3v5m-5 1h10"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8S5 9 5 5c0-4 7-1 7 3Zm0 0s7 1 7-3c0-4-7-1-7 3Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
    ticket:'<path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4zM15 5v2m0 3v1m0 3v1m0 3v1"/>',
    shiny:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    coin:'<ellipse cx="12" cy="12" rx="8" ry="9"/><path d="M10 17V7h3a3 3 0 0 1 0 6H8m0 3h6"/>',
    disc:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="m6 9 3-3m6 12 3-3"/>'
  };
  const icon=(name,cls='')=>`<svg class="pk-ach-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.special}</svg>`;
  const crest=()=>`<svg class="pk-ach-crest" viewBox="0 0 200 200" aria-hidden="true"><path d="m100 8 69 32v66c0 39-69 80-69 80s-69-41-69-80V40z" fill="#162739" stroke="#c9a661" stroke-width="2"/><path d="m100 18 59 28v59c0 31-59 70-59 70s-59-39-59-70V46z" fill="none" stroke="#735f3c"/><path d="M65 62H45v13c0 18 15 27 30 26m60-39h20v13c0 18-15 27-30 26" fill="none" stroke="#dfbb72" stroke-width="7"/><path d="M63 48h74v34c0 25-15 41-37 41S63 107 63 82z" fill="#edc77c"/><path d="M100 49h36v32c0 26-15 40-36 42z" fill="#c99540"/><path d="M94 122h12v20h17v8H77v-8h17z" fill="#e9be70"/><circle cx="100" cy="81" r="18" fill="#fff1c4" stroke="#745522" stroke-width="3"/><path d="M82 81h36" stroke="#745522" stroke-width="3"/><circle cx="100" cy="81" r="6" fill="#fff6d9" stroke="#745522" stroke-width="3"/><path d="m100 155 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#eecb85"/><path d="m26 107 6 8m-8 4 11 7m-6 5 12 5m-5 8 11 2m127-39-6 8m8 4-11 7m6 5-12 5m5 8-11 2" stroke="#baa16a" stroke-width="4" stroke-linecap="round"/></svg>`;
  const stateLabel={locked:'Bloqueado',progress:'En progreso',ready:'Completado',claimed:'Reclamado'};
  const statusOf=d=>d.claimed?'claimed':d.done?'ready':d.current>0?'progress':'locked';
  function card(d){
    const status=statusOf(d),target=Math.max(1,Number(d.target)||1),current=Math.max(0,Number(d.current)||0),pct=Math.max(0,Math.min(100,current/target*100));
    const statusIcon=status==='claimed'?'check':status==='ready'?'gift':status==='locked'?'lock':'adventure';
    return `<article class="achievement-card pk-ach-card ${d.done?'unlocked':'locked'} ${status==='ready'?'reward-ready':''}" data-ach-key="${esc(d.id)}" data-ach-state="${status}" data-ach-progress="${pct}" data-ach-search="${esc(norm(d.title+' '+d.desc+' '+d.categoryName+' '+d.reward))}">
      <div class="pk-ach-card-top"><span class="pk-ach-state ${status}">${icon(statusIcon)}${stateLabel[status]}</span><span class="pk-ach-points">+${fmt(d.points)} <small>PTS</small></span></div>
      <div class="pk-ach-card-main"><div class="pk-ach-emblem ${esc(d.category)}">${icon(d.category)}</div><div class="pk-ach-copy"><span class="pk-ach-kicker">${esc(d.categoryName)}</span><h3>${esc(d.title)}</h3></div></div>
      <p class="pk-ach-desc">${esc(d.desc)}</p>
      <div class="pk-ach-progress-label"><span>${d.isNew?'<b class="pk-ach-new">NUEVO</b>':d.done&&d.stamp?esc(d.stamp):'Progreso'}</span><b>${fmt(Math.min(current,target))} <span>/ ${fmt(target)}</span></b></div>
      <div class="pk-ach-bar" role="progressbar" aria-label="${esc(d.title)}" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${Math.min(current,target)}"><i style="width:${pct.toFixed(2)}%"></i></div>
      <div class="pk-ach-card-footer"><div class="pk-ach-prize"><small>RECOMPENSA</small><strong>${esc(d.reward)}</strong></div>${status==='ready'?`<button type="button" class="btn achievement-claim-btn pk-ach-claim" ${d.claimAttr}="${esc(d.id)}" aria-label="Reclamar: ${esc(d.title)}">Reclamar ${icon('gift')}</button>`:`<span class="pk-ach-foot-state ${status}">${icon(status==='claimed'?'check':'lock')}<span>${status==='claimed'?'Recibida':'Pendiente'}</span></span>`}</div>
    </article>`;
  }
  function roadCard(m){
    const kind=m.master?'trophy':m.shiny?'shiny':m.money&&!m.tickets&&!m.premium&&!m.randomMints&&!m.masterMints&&!m.incenses?'coin':'ticket';
    const status=m.done?'claimed':m.ready?'ready':'locked';
    return `<article class="achievement-road-card pk-ach-road-card ${m.ready?'ready ':''}${m.done?'claimed ':''}${m.master?'master':''}" data-ach-road-key="${esc(m.id)}" data-ach-road-points="${m.points}" data-ach-state="${status}" data-ach-road-title="${esc(m.title)}" data-ach-road-reward="${esc(m.reward)}">
      <div class="pk-ach-road-node"><span>${m.done?icon('check'):String(m.index+1).padStart(2,'0')}</span><b>${fmt(m.points)} <small>PTS</small></b></div>
      <div class="pk-ach-road-prize ${kind}"><span class="pk-ach-road-kind">${m.master?'RECOMPENSA MAESTRA':kind==='coin'?'POKÉDÓLARES':kind==='shiny'?'TICKET SHINY':m.money?'RECOMPENSA ESPECIAL':'TICKET PREMIUM'}</span><div class="pk-ach-reward-art">${icon(kind)}</div><span class="pk-ach-road-tier">HITO ${String(m.index+1).padStart(2,'0')}</span><h3>${esc(m.title)}</h3><p>${esc(m.reward)}</p><div class="pk-ach-road-action">${m.ready?`<button type="button" class="btn achievement-claim-btn pk-ach-claim" ${m.claimAttr}="${esc(m.id)}" aria-label="Reclamar: ${esc(m.title)}">Reclamar ${icon('gift')}</button>`:`<span class="pk-ach-state ${status}">${icon(m.done?'check':'lock')}${m.done?'Reclamado':'Faltan '+fmt(Math.max(0,m.points-m.earned))+' pts'}</span>`}</div></div>
    </article>`;
  }
  function view(root){
    let v=views.get(root);if(v)return v;
    const shell=root.querySelector('.pk-ach-shell');
    v={root,shell,status:'all',search:'',sort:'featured',tab:'collection',focus:null};views.set(root,v);
    root.querySelectorAll('[data-ach-symbol]').forEach(el=>el.innerHTML=icon(el.dataset.achSymbol));
    root.querySelectorAll('[data-ach-crest]').forEach(el=>el.innerHTML=crest());
    // Listeners live on each modal, including independently cloned regional modals.
    shell.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.achTab){setTab(v,b.dataset.achTab);return;}
      if(b.hasAttribute('data-ach-go-road')){setTab(v,'road');goProgress(v);return;}
      if(b.hasAttribute('data-ach-road-jump')){goProgress(v);return;}
      if(b.dataset.achScroll){scrollRoad(v,Number(b.dataset.achScroll));return;}
      if(b.hasAttribute('data-ach-reset')){v.status='all';v.search='';root.querySelector('[data-ach-search-input]').value='';root.querySelector('[data-ach-status-select]').value='all';apply(v);}
    });
    shell.addEventListener('click',e=>{
      const b=e.target.closest('[data-achievement-claim],[data-j-ach],[data-achievement-milestone],[data-j-road]');
      if(b)v.focus={key:b.closest('[data-ach-key],[data-ach-road-key]')?.getAttribute(b.closest('[data-ach-key]')?'data-ach-key':'data-ach-road-key'),road:!!b.closest('[data-ach-road-key]')};
    },true);
    root.querySelector('[data-ach-search-input]').addEventListener('input',e=>{v.search=norm(e.target.value);apply(v);});
    root.querySelector('[data-ach-status-select]').addEventListener('change',e=>{v.status=e.target.value;apply(v);});
    root.querySelector('[data-ach-sort-select]').addEventListener('change',e=>{v.sort=e.target.value;apply(v);});
    const track=root.querySelector('#achievementRoadTrack');
    track.addEventListener('scroll',()=>roadButtons(v),{passive:true});
    track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();scrollRoad(v,e.key==='ArrowRight'?1:-1);}if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:'auto'});}});
    root.querySelector('.pk-ach-main-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...root.querySelectorAll('[data-ach-tab]')];const index=tabs.indexOf(document.activeElement);if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(v,tabs[next].dataset.achTab);tabs[next].focus();});
    // Resets cloned transient view state; no persisted preferences or save writes.
    root.querySelector('[data-ach-search-input]').value='';root.querySelector('[data-ach-status-select]').value='all';root.querySelector('[data-ach-sort-select]').value='featured';setTab(v,'collection');
    return v;
  }
  function setTab(v,tab){
    v.tab=tab;v.shell.dataset.achView=tab;
    v.root.querySelectorAll('[data-ach-tab]').forEach(b=>{const yes=b.dataset.achTab===tab;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;});
    v.root.querySelectorAll('[data-ach-pane]').forEach(p=>p.hidden=p.dataset.achPane!==tab);
    if(tab==='road')requestAnimationFrame(()=>roadButtons(v));
  }
  function roadButtons(v){const t=v.root.querySelector('#achievementRoadTrack');const max=t.scrollWidth-t.clientWidth;v.root.querySelector('[data-ach-scroll="-1"]').disabled=t.scrollLeft<=2;v.root.querySelector('[data-ach-scroll="1"]').disabled=t.scrollLeft>=max-2;}
  const behavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  function scrollRoad(v,dir){const t=v.root.querySelector('#achievementRoadTrack');t.scrollBy({left:dir*Math.max(240,t.clientWidth*.8),behavior:behavior()});}
  function goProgress(v){requestAnimationFrame(()=>{const t=v.root.querySelector('#achievementRoadTrack');const c=t.querySelector('.ready')||t.querySelector('[data-ach-state="locked"]')||t.lastElementChild;if(c)t.scrollTo({left:c.offsetLeft-t.offsetLeft-20,behavior:behavior()});});}
  function apply(v){
    const root=v.root,grid=root.querySelector('#achievementGrid'),cards=[...grid.querySelectorAll('[data-ach-key]')];
    const weights={ready:0,progress:1,locked:2,claimed:3};
    if(v.sort==='featured')cards.sort((a,b)=>weights[a.dataset.achState]-weights[b.dataset.achState]||(a.dataset.achState==='progress'?Number(b.dataset.achProgress)-Number(a.dataset.achProgress):0));
    else if(v.sort==='progress')cards.sort((a,b)=>Number(b.dataset.achProgress)-Number(a.dataset.achProgress));
    else cards.sort((a,b)=>Number(a.dataset.achOrder)-Number(b.dataset.achOrder));
    let shown=0;cards.forEach((c,i)=>{c.style.order=String(i);const yes=(v.status==='all'||c.dataset.achState===v.status)&&(!v.search||c.dataset.achSearch.includes(v.search));c.hidden=!yes;if(yes)shown++;});
    const count=root.querySelector('[data-ach-result-count]');count.textContent=fmt(shown)+' de '+fmt(cards.length)+' logros';
    root.querySelector('[data-ach-empty]').hidden=shown>0;
  }
  function sync(root,data){
    if(!root)return;const v=view(root);v.data=data;
    const region=data.region||'kanto';v.shell.dataset.achRegion=region;
    root.querySelectorAll('[data-ach-region-name]').forEach(el=>el.textContent=region.toUpperCase());
    const counts={};for(const d of data.defs){for(const key of ['all',d.category]){counts[key]||={total:0,done:0};counts[key].total++;if(data.unlocked[d.id])counts[key].done++;}}
    root.querySelectorAll('[data-achievement-filter]').forEach(b=>{const cat=b.dataset.achievementFilter,c=counts[cat]||{total:0,done:0},name=data.categoryNames[cat]||'Todos';b.innerHTML=icon(cat)+`<span>${esc(name)}</span><small>${c.done}/${c.total}</small>`;b.setAttribute('aria-pressed',String(b.classList.contains('active')));b.title=`${name}: ${c.done} de ${c.total} completados`;});
    const active=root.querySelector('[data-achievement-filter].active');root.querySelector('[data-ach-category-name]').textContent=active?.dataset.achievementFilter==='all'?'Todos los logros':data.categoryNames[active?.dataset.achievementFilter]||'Todos los logros';
    const ready=data.defs.filter(d=>data.unlocked[d.id]&&!data.claimed.has(d.id)).length;
    const readyCount=root.querySelector('[data-ach-ready-count]');if(readyCount)readyCount.textContent=fmt(ready);
    const readyCopy=root.querySelector('[data-ach-ready-copy]');if(readyCopy)readyCopy.textContent=ready?'logros por reclamar':'Todo al día';
    root.querySelector('[data-ach-claim-count]').textContent=fmt(ready);root.querySelector('[data-ach-claim-count]').hidden=!ready;
    const all=root.querySelector('#achievementClaimAllBtn');all.disabled=!ready;all.textContent=ready?`Reclamar todas (${ready})`:'Sin recompensas pendientes';all.title='Reclama las recompensas de los logros. Los hitos del Camino se reclaman por separado.';all.setAttribute('aria-label',ready?`Reclamar las recompensas de ${ready} logros`:'Sin recompensas de logros pendientes');
    const grid=root.querySelector('#achievementGrid');grid.querySelectorAll('[data-ach-key]').forEach((c,i)=>c.dataset.achOrder=String(i));
    apply(v);
    // Restore keyboard focus after a claim replaces the card, without moving scroll.
    if(v.focus){const f=v.focus;v.focus=null;const nodes=root.querySelectorAll(f.road?'[data-ach-road-key]':'[data-ach-key]');const c=[...nodes].find(n=>(f.road?n.dataset.achRoadKey:n.dataset.achKey)===f.key);if(c){c.tabIndex=-1;c.focus({preventScroll:true});c.classList.add('pk-ach-just-claimed');}}
  }
  function syncRoad(root,data){
    const v=view(root),track=root.querySelector('#achievementRoadTrack'),cards=[...track.children];
    const next=cards.find(c=>c.classList.contains('ready'))||cards.find(c=>c.dataset.achState==='locked');
    const reached=data.milestones.filter(m=>data.points>=m.points).length,ready=cards.filter(c=>c.classList.contains('ready')).length,last=data.milestones.at(-1)?.points||1;
    root.querySelector('[data-ach-road-count]').textContent=`${reached} / ${cards.length} hitos alcanzados`;
    root.querySelector('[data-ach-road-earned]').textContent=fmt(data.points);
    root.querySelector('[data-ach-road-total]').textContent=fmt(data.total)+' pts de logro';
    root.querySelector('[data-ach-road-ready]').textContent=ready?`${ready} por reclamar`:'Recompensas del camino';
    const roadBadge=root.querySelector('[data-ach-road-claim-count]');
    roadBadge.textContent=fmt(ready);roadBadge.hidden=ready===0;
    root.querySelector('[data-ach-tab="road"]').setAttribute('aria-label',ready?`Camino del Maestro: ${ready} ${ready===1?'recompensa disponible para reclamar':'recompensas disponibles para reclamar'}`:'Camino del Maestro: sin recompensas pendientes');
    const target=Number(next?.dataset.achRoadPoints||last),remain=Math.max(0,target-data.points),progress=Math.min(100,data.points/target*100);
    root.querySelector('[data-ach-next-label]').textContent=next?(remain?'PRÓXIMO HITO':'LISTO PARA RECLAMAR'):'CAMINO COMPLETADO';
    root.querySelector('[data-ach-next-title]').textContent=next?.dataset.achRoadTitle||'¡Todos los hitos reclamados!';
    root.querySelector('[data-ach-next-reward]').textContent=next?.dataset.achRoadReward||'Tu colección de recompensas está completa.';
    root.querySelector('[data-ach-next-progress]').textContent=next?fmt(Math.min(data.points,target))+' / '+fmt(target)+' pts':fmt(data.points)+' pts';
    root.querySelector('[data-ach-next-remaining]').textContent=remain?`Faltan ${fmt(remain)} pts`:next?'Recompensa disponible':'¡Camino completado!';
    root.querySelector('[data-ach-next-fill]').style.width=progress+'%';
    const teaser=root.querySelector('[data-ach-teaser-copy]');teaser.textContent=next?`${next.dataset.achRoadTitle} · ${remain?fmt(remain)+' pts para el hito':'Recompensa disponible'}`:'Todos los hitos reclamados';
    root.querySelector('[data-ach-teaser-points]').textContent=fmt(data.points)+' PTS';
    cards.forEach(c=>c.classList.toggle('pk-ach-next',c===next));
    requestAnimationFrame(()=>roadButtons(v));
  }
  window.PokeSendaAchievementView={card,roadCard,sync,syncRoad};
})();



/* PokéSenda · Árbol radial: presentación y navegación. El catálogo y la compra
   pertenecen al juego; esta vista solo los consulta y llama a la compra original. */
(()=>{
  'use strict';
  const instances=new WeakMap(),NS='http://www.w3.org/2000/svg';
  const branches={
    combat:{name:'Combate',color:'#ff737d',rgb:'255,115,125',angle:180,icon:'swords'},
    automation:{name:'Automatización',color:'#bc95ff',rgb:'188,149,255',angle:270,icon:'gear'},
    fortune:{name:'Fortuna',color:'#f4cd6b',rgb:'244,205,107',angle:0,icon:'spark'},
    expedition:{name:'Expedición',color:'#70d4f5',rgb:'112,212,245',angle:90,icon:'compass'},
    root:{name:'Núcleo del Entrenador',color:'#eddbad',rgb:'237,219,173',angle:0,icon:'ball'}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'₽ '+Math.floor(Number(n)||0).toLocaleString('es-CL');
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const icons={
    swords:'<path d="m5 3 14 14-3 3L3 6V3h2Zm14 0L5 17l3 3L21 6V3h-2ZM4 14l6 6m4-6 6 6M3 21l3-3m12 0 3 3"/>',
    gear:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-3-2-3 1-2-3H9Z"/><circle cx="12" cy="11" r="3"/>',
    spark:'<path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8L12 3ZM20 2v4m-2-2h4"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2ZM12 1v3m0 16v3M1 12h3m16 0h3"/>',
    ball:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M3 12h6m6 0h6M6 5a9 9 0 0 1 12 0"/>',
    heart:'<path d="M12 21 3.7 13A5.6 5.6 0 0 1 12 5.5 5.6 5.6 0 0 1 20.3 13L12 21Z"/>',
    shield:'<path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8m-3 0h3v3"/>',
    crown:'<path d="m3 6 4 4 5-7 5 7 4-4-2 13H5L3 6ZM6 22h12"/>',
    potion:'<path d="M9 3h6m-5 0v6l-5 8a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-8V3M7 15h10"/><path d="M12 14v5m-2-2h4"/>',
    bag:'<path d="M8 7V5a4 4 0 0 1 8 0v2M6 7h12l2 15H4L6 7Z"/><path d="M9 12h6m-6 4h6"/>',
    repeat:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5"/>',
    steps:'<path d="m5 3 4 1 2 7-4 2-3-6 1-4Zm8 8 4-1 4 5-1 5-4 1-3-5v-5ZM7 17l2 4m7-17 2 3"/>',
    book:'<path d="M12 5v17M3 3c4 0 7 0 9 3 2-3 5-3 9-3v16c-4 0-7 0-9 3-2-3-5-3-9-3V3Z"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M9 18V6h4a3 3 0 0 1 0 6H7m0 3h7"/>',
    moon:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
    check:'<path d="m5 12 4 4 10-10"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    fit:'<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/><circle cx="12" cy="12" r="2"/>',
    search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>'
  };
  const icon=(name,cls='')=>`<svg class="pkt-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
  const nodeIcons={trainer:'ball',c1:'swords',c2:'heart',c3:'bolt',c4:'target',c5:'shield',c6:'spark',c7:'heart',c8:'bolt',c9:'crown',c10:'swords',c11:'spark',c12:'target',c13:'heart',c14:'target',f1:'coin',f2:'bag',f3:'compass',f4:'bag',f5:'spark',f6:'ball',f7:'heart',f8:'crown',f9:'bag',f10:'potion',f11:'spark',f12:'repeat',f13:'spark',f14:'bag',f15:'spark',f16:'spark',f17:'crown',e1:'book',e2:'steps',e3:'moon',e4:'bolt',e5:'swords',e6:'repeat',e7:'heart',e8:'crown',e9:'shield',e10:'potion',e11:'swords',e12:'shield',e13:'steps',a1:'gear',a2:'ball',a3:'repeat',a5:'potion',a6:'potion',a7:'potion',a8:'coin',a9:'shield',a10:'shield',a11:'swords',a12:'heart',a13:'target',a14:'bag',a15:'spark'};
  // Coordenadas de presentación, sin inferir ni cambiar dependencias.
  const positions=[
    ['c1',178,180],['c2',322,202],['c3',322,158],
    ['c5',474,216],['c4',474,198],['c6',474,180],['c10',474,162],['c11',474,144],
    ['c8',622,210],['c14',622,195],['c7',622,179],['c12',622,157],['c13',764,172],['c9',774,194],
    ['a1',178,270],['a3',340,234],['a15',340,258],['a5',340,282],['a2',340,306],
    ['a10',474,234],['a11',474,252],['a12',622,246],['a6',474,277],['a8',474,306],
    ['a9',622,262],['a14',622,278],['a13',622,299],['a7',774,280],
    ['f1',178,0],['f2',322,-22],['f3',322,22],
    ['f6',474,-33],['f12',458,-15],['f4',474,3],['f9',610,3],['f10',474,21],['f5',474,39],
    ['f13',622,-35],['f7',622,-19],['f11',622,22],['f14',730,35],['f8',754,5],
    ['f15',786,-33],['f16',808,-16],['f17',828,19],
    ['e1',178,90],['e2',322,66],['e3',322,111],
    ['e13',474,56],['e5',474,72],['e4',474,88],['e10',474,104],['e9',474,121],['e6',614,132],
    ['e7',622,71],['e12',622,88],['e11',760,125],['e8',774,100]
  ];
  let cachedLayout;
  function layout(){
    if(cachedLayout)return cachedLayout;
    const W=1900,H=1900,cx=W/2,cy=H/2,pos={trainer:{x:cx,y:cy,r:0,a:0}};
    for(const [id,r,a] of positions){const t=a*Math.PI/180;pos[id]={x:cx+r*Math.cos(t),y:cy+r*Math.sin(t),r,a};}
    cachedLayout={W,H,cx,cy,pos};return cachedLayout;
  }
  const at=(r,a)=>{const {cx,cy}=layout(),t=a*Math.PI/180;return{x:cx+r*Math.cos(t),y:cy+r*Math.sin(t)};};
  const xy=p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  const sector=(r1,r2,a1,a2)=>{const p=at(r1,a1),q=at(r2,a1),r=at(r2,a2),s=at(r1,a2);return `M${xy(p)} L${xy(q)} A${r2} ${r2} 0 0 1 ${xy(r)} L${xy(s)} A${r1} ${r1} 0 0 0 ${xy(p)} Z`;};
  function bounds(ids,catalog){
    const {cx,cy,pos}=layout();let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(const id of ids){const p=pos[id];if(!p)continue;const r=id==='trainer'?84:catalog[id]?.max===1?74:66;minX=Math.min(minX,p.x-r);maxX=Math.max(maxX,p.x+r);minY=Math.min(minY,p.y-r);maxY=Math.max(maxY,p.y+r+25);}
    return {minX,minY,maxX,maxY,cx:(minX+maxX)/2,cy:(minY+maxY)/2,w:maxX-minX,h:maxY-minY};
  }
  function decoration(){
    const {W,H,cx,cy}=layout();
    let s=`<svg class="pkt-orbits" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><radialGradient id="pkt-core-light"><stop stop-color="#f4dd9d" stop-opacity=".09"/><stop offset="1" stop-color="#f4dd9d" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="250" fill="url(#pkt-core-light)"/>`;
    for(const [key,b] of Object.entries(branches)){if(key==='root')continue;s+=`<path d="${sector(112,875,b.angle-42,b.angle+42)}" fill="${b.color}" fill-opacity=".032"/><path d="${sector(865,869,b.angle-40,b.angle+40)}" fill="${b.color}" fill-opacity=".50"/>`;}
    for(const r of [112,178,322,474,622,776,883])s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#92aac4" stroke-opacity="${r===112?'.16':'.085'}" stroke-width="${r===112?2:1}" ${r===883?'stroke-dasharray="2 9"':''}/>`;
    for(const a of [45,135,225,315])s+=`<path d="M${xy(at(138,a))} L${xy(at(865,a))}" stroke="#95a9bf" stroke-opacity=".11" stroke-dasharray="3 9"/>`;
    // Los rótulos se encuadran junto con los nodos; nunca dependen del zoom CSS.
    const labels=[['automation',0,-902],['combat',-650,-603],['fortune',650,-603],['expedition',0,908]];
    for(const [key,x,y] of labels){const b=branches[key];s+=`<g class="pkt-sector-title" transform="translate(${cx+x},${cy+y})" fill="${b.color}"><text text-anchor="middle" font-size="25" font-weight="750" letter-spacing="3">${b.name.toUpperCase()}</text></g>`;}
    return s+'</svg>';
  }
  // Evita atravesar nodos intermedios. Se buscan curvas en el corredor de
  // cada rama; los requisitos entre ramas aparecen como enlaces al enfocarlos.
  function connectionPath(from,to,catalog,cross){
    const {pos,cx,cy}=layout(),a=pos[from],b=pos[to];
    if(!a||!b)return'';
    const radius=id=>id==='trainer'?73:catalog[id]?.max===1?62:56;
    const trim=(p,q,r)=>{const d=Math.hypot(q.x-p.x,q.y-p.y)||1;return{x:p.x+(q.x-p.x)*r/d,y:p.y+(q.y-p.y)*r/d};};
    let best=null;
    for(const bend of [0,44,-44,88,-88,145,-145,220,-220]){
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
      const c1={x:a.x+dx*.36-dy/d*bend,y:a.y+dy*.36+dx/d*bend},c2={x:a.x+dx*.68-dy/d*bend,y:a.y+dy*.68+dx/d*bend};
      const start=trim(a,c1,radius(from)+3),end=trim(b,c2,radius(to)+3);
      let score=Math.abs(bend)*.04;
      if(cross&&bend===0)score+=100;
      for(let k=1;k<24;k++){const t=k/24,u=1-t,p={x:u*u*u*start.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*end.x,y:u*u*u*start.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*end.y};
        for(const [id,n] of Object.entries(pos)){if(id===from||id===to||!catalog[id])continue;const gap=Math.hypot(p.x-n.x,p.y-n.y)-radius(id)-13;if(gap<0)score+=-gap*4;}
        if(!cross&&from!=='trainer'){const theta=Math.atan2(p.y-cy,p.x-cx)*180/Math.PI,sectorAngle=branches[catalog[to].branch].angle,delta=Math.abs(((theta-sectorAngle+540)%360)-180);if(delta>44)score+=(delta-44)*3;}
      }
      if(!best||score<best.score)best={score,start,end,c1,c2};
    }
    return `M${xy(best.start)} C${xy(best.c1)},${xy(best.c2)},${xy(best.end)}`;
  }
  class TreeView{
    constructor(wrap,api){
      this.wrap=wrap;this.api=api;this.overlay=wrap.closest('[id="skillTreeOverlay"]');this.box=this.overlay.querySelector('.tree-modal');
      this.selected=null;this.hovered=null;this.focusBranch=null;this.camera={x:0,y:0,z:.5};this.fitMode=true;this.ready=false;this.pending=true;this.suppressUntil=0;this.zoomFrame=0;this.moveFrame=0;this.flashTimers=[];
      this.observer=new MutationObserver(()=>{if(this.visible()){this.refresh();if(!this.ready)this.fit(false);}else this.suspend();});
      this.observer.observe(this.overlay,{attributes:true,attributeFilter:['class']});
      const regionRoot=this.overlay.closest('#pkRegionRuntimeRoot');if(regionRoot)this.observer.observe(regionRoot,{attributes:true,attributeFilter:['class']});
    }
    visible(){return !this.overlay.closest('.hidden')&&this.overlay.isConnected;}
    init(){
      if(this.viewport)return;
      const all=Object.keys(this.api.nodes),{W,H,pos}=layout();
      this.box.classList.add('pkt-modal');this.overlay.classList.add('pkt-overlay');
      this.wrap.innerHTML=`<div class="pkt-nav"><div class="pkt-branches" role="group" aria-label="Enfocar una rama">${Object.entries(branches).filter(([k])=>k!=='root').map(([key,b])=>`<button class="pkt-branch" type="button" data-pkt-branch="${key}" style="--branch:${b.color};--branch-rgb:${b.rgb}" aria-pressed="false">${icon(b.icon)}<span>${b.name}<small data-pkt-count="${key}"></small></span><i class="pkt-branch-meter"><i></i></i></button>`).join('')}</div><label class="pkt-search">${icon('search')}<input type="search" placeholder="Buscar habilidad…" aria-label="Buscar habilidad" autocomplete="off" spellcheck="false"><span class="pkt-search-count"></span></label></div><div class="pkt-workspace"><div class="pkt-map-wrap"><div class="poe-tree-scroll pkt-viewport" tabindex="0" role="group" aria-label="Árbol radial de habilidades. Arrastra para mover; rueda para acercar; flechas para navegar entre nodos."><div class="pkt-stage" style="width:${W}px;height:${H}px">${decoration()}<svg class="pkt-connections" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"></svg><div class="pkt-nodes"></div></div></div><div class="pkt-map-caption"><span data-pkt-view-label>Vista completa</span><button type="button" class="pkt-map-home" data-pkt-home>${icon('fit')} Ver todo</button></div><div class="pkt-feedback" role="status" aria-live="polite"></div><div class="pkt-hover-card" role="tooltip" hidden></div><div class="pkt-map-legend"><span><i class="pkt-key owned"></i>Comprado</span><span><i class="pkt-key available"></i>Disponible</span><span><i class="pkt-key locked"></i>Bloqueado</span><span class="pkt-map-total"></span></div></div><aside class="pkt-inspector" aria-label="Detalle de la habilidad"><div class="pkt-detail"></div></aside></div><div class="pkt-footnote"><span><b>Arrastrar</b> mover <i>·</i> <b>Rueda</b> zoom <i>·</i> <b>Doble clic</b> comprar</span><span>Selecciona una habilidad para ver sus requisitos.</span></div>`;
      this.viewport=this.wrap.querySelector('.pkt-viewport');this.stage=this.wrap.querySelector('.pkt-stage');this.detail=this.wrap.querySelector('.pkt-detail');this.tip=this.wrap.querySelector('.pkt-hover-card');this.feedback=this.wrap.querySelector('.pkt-feedback');this.search=this.wrap.querySelector('input[type="search"]');this.nodeEls=new Map();this.edges=[];
      const container=this.wrap.querySelector('.pkt-nodes');
      for(const id of all){const n=this.api.nodes[id],p=pos[id];if(!p)continue;const b=branches[n.branch]||branches.root,el=document.createElement('button');
        el.type='button';el.className='pkt-node'+(n.max===1?' major':'')+(id==='trainer'?' root':'')+(n.shinyEndgame?' shiny-endgame':'');el.dataset.pktSkill=id;el.dataset.branch=n.branch;el.style.cssText=`left:${p.x}px;top:${p.y}px;--branch:${b.color};--branch-rgb:${b.rgb}`;
        el.innerHTML=`<svg class="pkt-rank-ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="pkt-rank-track" cx="60" cy="60" r="56"/><circle class="pkt-rank-fill" cx="60" cy="60" r="56" pathLength="100"/></svg><span class="pkt-node-face"><span class="pkt-node-icon">${icon(nodeIcons[id]||b.icon)}</span><span class="pkt-node-name">${esc(n.name)}</span></span><span class="pkt-node-rank"></span><span class="pkt-node-state" aria-hidden="true"></span><span class="pkt-node-cost"></span>`;container.append(el);this.nodeEls.set(id,el);
      }
      const svg=this.wrap.querySelector('.pkt-connections');
      for(const [id,n] of Object.entries(this.api.nodes))for(const [req,need] of n.requires){if(!pos[id]||!pos[req])continue;const cross=req!=='trainer'&&this.api.nodes[req].branch!==n.branch,el=document.createElementNS(NS,'path');el.setAttribute('d',connectionPath(req,id,this.api.nodes,cross));el.setAttribute('class','pkt-edge'+(cross?' cross-branch':''));el.setAttribute('style',`--branch:${branches[n.branch].color}`);el.dataset.from=req;el.dataset.to=id;svg.append(el);this.edges.push({el,from:req,to:id,need,cross});}
      this.bind();this.renderEmpty();
      this.resizer=new ResizeObserver(()=>{if(!this.visible())return;const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(w<1||h<1)return;if(!this.ready||this.fitMode)this.fit(false,this.focusBranch);else if(this.lastSize){this.camera.x+=(w-this.lastSize.w)/2;this.camera.y+=(h-this.lastSize.h)/2;this.apply();}this.lastSize={w,h};});this.resizer.observe(this.viewport);
    }
    snapshot(){
      const a=this.api,out={money:Number(a.money())||0,nodes:{}};
      for(const [id,n] of Object.entries(a.nodes)){const rank=a.rank(id),cost=a.cost(id),unlocked=a.unlocked(id);out.nodes[id]={rank,cost,unlocked,maxed:rank>=n.max,can:unlocked&&rank<n.max&&out.money>=cost};}
      return out;
    }
    refresh(){
      if(!this.visible()){this.pending=true;return;}
      this.init();this.data=this.snapshot();this.pending=false;const d=this.data;
      const wallet=this.overlay.querySelector('[id="treeMoney"]');if(wallet)wallet.textContent=Math.floor(d.money).toLocaleString('es-CL');
      let owned=0,completed=0,available=0;
      for(const [id,el] of this.nodeEls){const v=d.nodes[id],n=this.api.nodes[id],status=v.maxed?'Completado':!v.unlocked?'Bloqueado':v.can?'Disponible':'Faltan Pokédólares';if(v.rank>0)owned++;if(v.maxed)completed++;if(v.can)available++;
        el.classList.toggle('owned',v.rank>0);el.classList.toggle('maxed',v.maxed);el.classList.toggle('available',v.can);el.classList.toggle('locked',!v.unlocked&&v.rank===0);el.classList.toggle('unaffordable',v.unlocked&&!v.maxed&&!v.can);
        el.querySelector('.pkt-rank-fill').setAttribute('stroke-dasharray',`${clamp(v.rank/n.max*100,0,100)} 100`);
        el.querySelector('.pkt-node-rank').textContent=`${v.rank}/${n.max}`;el.querySelector('.pkt-node-cost').textContent=v.maxed?'COMPLETO':money(v.cost);
        el.querySelector('.pkt-node-state').innerHTML=icon(v.maxed?'check':v.can?'plus':!v.unlocked?'lock':v.rank?'check':'coin');
        el.setAttribute('aria-label',`${n.name}. Rango ${v.rank} de ${n.max}. ${status}.${v.maxed?'':' Costo '+money(v.cost)+'.'} Clic para ver detalles; doble clic para comprar.`);
        el.dataset.rank=v.rank;el.dataset.cost=v.cost;el.dataset.status=status;
      }
      for(const [key,b] of Object.entries(branches)){if(key==='root')continue;const ids=Object.keys(this.api.nodes).filter(id=>this.api.nodes[id].branch===key),done=ids.filter(id=>d.nodes[id].maxed).length,can=ids.filter(id=>d.nodes[id].can).length,btn=this.wrap.querySelector(`[data-pkt-branch="${key}"]`);btn.querySelector('small').textContent=`${done}/${ids.length} completadas`;btn.querySelector('.pkt-branch-meter i').style.width=`${done/ids.length*100}%`;btn.title=`Enfocar ${b.name} · ${done}/${ids.length} completadas · ${can} disponibles`;
      }
      this.wrap.querySelector('.pkt-map-total').textContent=`${completed}/${this.nodeEls.size} completadas`;
      const count=this.overlay.querySelector('[data-pkt-affordable]');if(count)count.textContent=`${available} ${available===1?'mejora disponible':'mejoras disponibles'}`;
      if(this.selected)this.renderDetail();else this.renderEmpty();this.highlight();this.filterSearch(false);if(!this.ready)this.fit(false);
    }
    renderEmpty(){
      const completed=this.data?Object.values(this.data.nodes).filter(v=>v.maxed).length:0,total=this.nodeEls.size||59;
      this.detail.innerHTML=`<div class="pkt-empty"><div class="pkt-empty-orbit"><span>${icon('ball')}</span></div><div class="pkt-eyebrow">TU CAMINO COMO ENTRENADOR</div><h3>Cada mejora cuenta.</h3><p>Explora las cuatro ramas y elige cómo quieres crecer.</p><div class="pkt-total-progress"><strong>${completed}<small> / ${total}</small></strong><span>habilidades completadas</span><div><i style="width:${completed/total*100}%"></i></div></div><div class="pkt-empty-tips"><div>${icon('target')}<span>Selecciona un nodo para conocer su efecto y sus requisitos.</span></div><div>${icon('fit')}<span>Pulsa una categoría para explorar su rama de cerca.</span></div></div><button class="pkt-start" type="button" data-pkt-select="trainer">Ver núcleo del árbol <span>↗</span></button></div>`;
    }
    renderDetail(){
      const id=this.selected,n=this.api.nodes[id],v=this.data.nodes[id],b=branches[n.branch]||branches.root;
      const unmet=n.requires.filter(([req,k])=>this.data.nodes[req].rank<k),status=v.maxed?'Completado':!v.unlocked?'Bloqueado':v.can?'Disponible para comprar':v.rank?'Comprado · siguiente rango':'Desbloqueado';
      this.detail.style.cssText=`--branch:${b.color};--branch-rgb:${b.rgb}`;
      const requirements=n.requires.map(([req,k])=>{const r=this.data.nodes[req].rank,ok=r>=k,rb=branches[this.api.nodes[req].branch]||branches.root;return `<button type="button" class="pkt-requirement ${ok?'met':''}" data-pkt-select="${req}" style="--req-color:${rb.color}" title="Localizar ${esc(this.api.nodes[req].name)}">${icon(ok?'check':'lock')}<span>${esc(this.api.nodes[req].name)}<small>${rb.name}</small></span><b>${r}<em> / ${k}</em></b><span class="pkt-req-arrow">↗</span></button>`;}).join('');
      const children=Object.keys(this.api.nodes).filter(key=>this.api.nodes[key].requires.some(([r])=>r===id));
      const note=v.maxed?'Esta habilidad ya alcanzó su rango máximo.':!v.unlocked?`Completa ${unmet.length===1?'el requisito pendiente':'los '+unmet.length+' requisitos pendientes'} para comprar esta habilidad.`:v.can?`Después de comprar: ${money(this.data.money-v.cost)}`:`Te faltan ${money(v.cost-this.data.money)} para ${v.rank?'el siguiente rango':'comprar esta habilidad'}.`;
      this.detail.innerHTML=`<div class="pkt-detail-scroll"><div class="pkt-detail-category">${icon(b.icon)} ${b.name}<button type="button" class="pkt-detail-dismiss" data-pkt-clear aria-label="Quitar selección">×</button></div><div class="pkt-detail-hero">${icon(nodeIcons[id]||b.icon)}<span class="pkt-status ${v.can?'can':v.maxed?'complete':''}">${icon(v.maxed?'check':!v.unlocked?'lock':'plus')}${status}</span></div><h3>${esc(n.name)}</h3><div class="pkt-detail-rank"><span>Rango <strong>${v.rank}<small> / ${n.max}</small></strong></span><span>${n.shinyEndgame?'Mejora Shiny':n.max===1?'Nodo mayor':'Habilidad progresiva'}</span></div><div class="pkt-detail-progress"><i style="width:${clamp(v.rank/n.max*100,0,100)}%"></i></div><div class="pkt-effect"><div class="pkt-eyebrow">EFECTO DE LA HABILIDAD</div><p>${esc(n.desc)}</p>${n.shinyEndgame&&this.api.extra?`<p class="pkt-extra">${esc(this.api.extra(id)||'')}</p>`:''}</div><div class="pkt-req-head"><span class="pkt-eyebrow">REQUISITOS</span><span>${n.requires.length?`${n.requires.length-unmet.length}/${n.requires.length} cumplidos`:'Núcleo inicial'}</span></div><div class="pkt-requirements">${requirements||'<p class="pkt-no-req">Tu punto de partida. No requiere otras habilidades.</p>'}</div>${children.length?`<details class="pkt-next"><summary>Conecta con ${children.length} ${children.length===1?'habilidad':'habilidades'}</summary><div>${children.map(key=>`<button type="button" data-pkt-select="${key}">${esc(this.api.nodes[key].name)} <span>↗</span></button>`).join('')}</div></details>`:''}</div><div class="pkt-purchase"><div class="pkt-price"><span>${v.maxed?'Progreso completo':'Costo del '+(v.rank?'siguiente rango':'desbloqueo')}</span><strong>${v.maxed?`${v.rank} / ${n.max}`:money(v.cost)}</strong></div><button class="pkt-buy ${v.can?'can':''}" type="button" data-pkt-buy aria-disabled="${!v.can}">${icon(v.maxed?'check':!v.unlocked?'lock':'plus')}<span>${v.maxed?'Habilidad completada':!v.unlocked?'Requisitos pendientes':!v.can?'Pokédólares insuficientes':v.rank?'Mejorar al rango '+(v.rank+1):'Comprar habilidad'}</span></button><p class="pkt-buy-note ${!v.can&&!v.maxed?'pending':''}">${note}</p><button type="button" class="pkt-locate" data-pkt-locate>${icon('target')} Localizar en el árbol</button></div>`;
    }
    select(id,locate=false,moveFocus=true){
      if(!this.nodeEls.has(id))return;this.selected=id;this.hovered=null;this.hideTip();this.refresh();
      const mobile=matchMedia('(max-width:700px)').matches;
      if(mobile)this.wrap.classList.add('pkt-has-selection');
      if(locate||mobile)this.focusNode(id);
      /* En móvil no forzar focus: Safari/Chrome puede recolocar el viewport al tocar un nodo. */
      if(moveFocus&&!mobile){try{this.nodeEls.get(id).focus({preventScroll:true});}catch(_){this.nodeEls.get(id).focus();}}
      else if(mobile&&this.overlay.contains(document.activeElement)){try{document.activeElement.blur();}catch(_){}}
    }
    highlight(){
      const id=this.hovered||this.selected,related=new Set(id?[id]:[]);
      for(const e of this.edges){const active=e.from===id||e.to===id;if(active){related.add(e.from);related.add(e.to);}const met=this.data&&this.data.nodes[e.from].rank>=e.need,owned=this.data&&this.data.nodes[e.to].rank>0;e.el.classList.toggle('met',!!met);e.el.classList.toggle('owned',!!met&&!!owned);e.el.classList.toggle('focused',!!id&&active);e.el.classList.toggle('dim',!!id&&!active);}
      for(const [key,el] of this.nodeEls){el.classList.toggle('selected',key===this.selected);el.classList.toggle('related',key!==id&&related.has(key));el.classList.toggle('deemphasized',!!id&&!related.has(key));el.setAttribute('aria-pressed',String(key===this.selected));el.tabIndex=(key===(this.selected||'trainer'))?0:-1;}
    }
    notify(message,ok=false){this.feedback.textContent=message;this.feedback.classList.toggle('success',ok);this.feedback.classList.add('show');clearTimeout(this.feedbackTimer);this.feedbackTimer=setTimeout(()=>this.feedback.classList.remove('show'),2800);}
    purchase(id){
      if(!id||this.purchasing||performance.now()<this.suppressUntil||!this.visible())return;
      const mobile=matchMedia('(max-width:700px)').matches,winX=window.scrollX,winY=window.scrollY,detailBefore=this.detail?.querySelector('.pkt-detail-scroll'),detailTop=detailBefore?.scrollTop||0;
      if(mobile&&this.overlay.contains(document.activeElement)){try{document.activeElement.blur();}catch(_){}}
      this.selected=id;this.refresh();const v=this.data.nodes[id],n=this.api.nodes[id];
      if(!v.can){this.notify(v.maxed?'Esta habilidad ya está completa.':!v.unlocked?'Revisa los requisitos marcados en la ficha.':`Te faltan ${money(v.cost-this.data.money)}.`);const el=this.nodeEls.get(id);el.classList.remove('denied');void el.offsetWidth;el.classList.add('denied');this.flashTimers.push(setTimeout(()=>el.classList.remove('denied'),400));return;}
      this.purchasing=true;
      try{this.api.buy(id);this.refresh();if(this.data.nodes[id].rank>v.rank){const el=this.nodeEls.get(id);el.classList.remove('purchased');void el.offsetWidth;el.classList.add('purchased');this.flashTimers.push(setTimeout(()=>el.classList.remove('purchased'),750));this.notify(`${n.name} · ${this.data.nodes[id].rank}/${n.max}`,true);}}
      finally{
        this.purchasing=false;
        if(mobile)requestAnimationFrame(()=>requestAnimationFrame(()=>{try{window.scrollTo(winX,winY);}catch(_){}const d=this.detail?.querySelector('.pkt-detail-scroll');if(d)d.scrollTop=Math.min(detailTop,Math.max(0,d.scrollHeight-d.clientHeight));}));
      }
    }
    getBounds(branch=null){
      const ids=Object.keys(this.api.nodes).filter(id=>!branch||this.api.nodes[id].branch===branch),b=bounds(ids,this.api.nodes);
      if(!branch){const {cx,cy}=layout();b.minX=Math.min(b.minX,cx-891);b.maxX=Math.max(b.maxX,cx+891);b.minY=Math.min(b.minY,cy-930);b.maxY=Math.max(b.maxY,cy+924);b.w=b.maxX-b.minX;b.h=b.maxY-b.minY;b.cx=(b.minX+b.maxX)/2;b.cy=(b.minY+b.maxY)/2;}
      return b;
    }
    fit(animate=true,branch=null){
      if(!this.viewport||!this.visible())return;this.endGesture();this.stopZoom();const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(w<1||h<1)return;
      this.wrap.classList.remove('pkt-has-selection');
      const b=this.getBounds(branch),pad=w<550?16:25,z=Math.min((w-2*pad)/b.w,(h-2*pad)/b.h,1.15);
      this.focusBranch=branch;this.fitMode=true;this.ready=true;this.lastSize={w,h};this.setCamera({z,x:w/2-b.cx*z,y:h/2-b.cy*z},animate);this.updateBranchFocus();
    }
    updateBranchFocus(){
      for(const btn of this.wrap.querySelectorAll('[data-pkt-branch]'))btn.setAttribute('aria-pressed',String(btn.dataset.pktBranch===this.focusBranch));
      this.wrap.querySelector('[data-pkt-view-label]').textContent=this.focusBranch?branches[this.focusBranch].name:'Vista completa';
    }
    fitScale(){const b=this.getBounds(),w=this.viewport.clientWidth,h=this.viewport.clientHeight;return Math.min((w-32)/b.w,(h-32)/b.h);}
    motionAllowed(){return !document.documentElement.classList.contains('no-anim')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!matchMedia('(max-width:980px)').matches;}
    setCamera(c,animate=false){
      this.camera=c;this.stage.style.transition=animate&&this.motionAllowed()?'transform 240ms cubic-bezier(.2,.7,.2,1)':'none';this.apply();
    }
    apply(){
      const c=this.camera;this.stage.style.transform=`translate3d(${c.x.toFixed(3)}px,${c.y.toFixed(3)}px,0) scale(${c.z})`;
      const label=this.overlay.querySelector('[id="treeZoomLabel"]');if(label)label.textContent=Math.round(c.z*100)+'%';
      this.viewport.dataset.zoom=c.z.toFixed(4);this.viewport.dataset.panX=c.x.toFixed(2);this.viewport.dataset.panY=c.y.toFixed(2);
    }
    stopZoom(){cancelAnimationFrame(this.zoomFrame);this.zoomFrame=0;this.zoomTarget=null;this.stage?.style.setProperty('transition','none');}
    zoomTo(z,ax=null,ay=null,smooth=true){
      if(!this.viewport||!this.visible())return;const w=this.viewport.clientWidth,h=this.viewport.clientHeight,x=ax??w/2,y=ay??h/2;z=clamp(z,Math.min(.2,this.fitScale()*.65),1.8);
      this.fitMode=false;this.hideTip();this.stage.style.transition='none';const c=this.camera,anchor={x:(x-c.x)/c.z,y:(y-c.y)/c.z};this.zoomTarget={z,x,y,anchor};
      if(!smooth||!this.motionAllowed()){this.stopZoom();this.setCamera({z,x:x-anchor.x*z,y:y-anchor.y*z});return;}
      if(this.zoomFrame)return;
      const tick=()=>{if(!this.visible()||!this.zoomTarget){this.stopZoom();return;}const t=this.zoomTarget,c=this.camera,z=Math.abs(t.z-c.z)<.0004?t.z:c.z+(t.z-c.z)*.3;this.camera={z,x:t.x-t.anchor.x*z,y:t.y-t.anchor.y*z};this.apply();if(z===t.z){this.zoomFrame=0;this.zoomTarget=null;}else this.zoomFrame=requestAnimationFrame(tick);};this.zoomFrame=requestAnimationFrame(tick);
    }
    zoomStep(direction){this.zoomTo((this.zoomTarget?.z||this.camera.z)*Math.pow(1.23,direction));}
    focusNode(id){
      this.stopZoom();this.endGesture();const p=layout().pos[id],w=this.viewport.clientWidth,h=this.viewport.clientHeight,usableH=this.wrap.classList.contains('pkt-has-selection')&&matchMedia('(max-width:700px)').matches?Math.max(90,h*.5-24):h,z=clamp(Math.max(this.camera.z,.9),.3,1.25);this.fitMode=false;this.setCamera({z,x:w/2-p.x*z,y:usableH/2-p.y*z},true);
    }
    ensureNodeVisible(id){
      const p=layout().pos[id],c=this.camera,w=this.viewport.clientWidth,h=this.viewport.clientHeight,r=90*c.z,x=p.x*c.z+c.x,y=p.y*c.z+c.y;
      if(x-r<0||x+r>w||y-r<0||y+r>h){this.fitMode=false;this.setCamera({...c,x:c.x+(x-r<0?r-x:x+r>w?w-r-x:0),y:c.y+(y-r<0?r-y:y+r>h?h-r-y:0)},true);}
    }
    endGesture(){
      if(this.gesture){if(this.gesture.moved)this.suppressUntil=performance.now()+260;try{if(this.viewport.hasPointerCapture(this.gesture.id))this.viewport.releasePointerCapture(this.gesture.id);}catch(_){}this.gesture=null;}
      this.gestureEvents?.abort();this.gestureEvents=null;this.viewport?.classList.remove('panning');cancelAnimationFrame(this.moveFrame);this.moveFrame=0;
    }
    suspend(){this.endGesture();this.stopZoom();this.hideTip();if(this.feedback)this.feedback.classList.remove('show');}
    showTip(id,e){
      if(!this.data||this.gesture?.moved||e.pointerType==='touch')return;
      const n=this.api.nodes[id],v=this.data.nodes[id];this.tip.innerHTML=`<b>${esc(n.name)} <em>${v.rank}/${n.max}</em></b><p>${esc(n.desc)}</p><small>${v.maxed?'Habilidad completa':!v.unlocked?'Requisitos pendientes · clic para verlos':v.can?'Disponible · doble clic para comprar':'Te faltan '+money(v.cost-this.data.money)}</small>`;
      this.tip.hidden=false;const rect=this.viewport.getBoundingClientRect(),w=this.tip.offsetWidth,h=this.tip.offsetHeight;let x=e.clientX-rect.left+18,y=e.clientY-rect.top+18;if(x+w>rect.width-12)x=e.clientX-rect.left-w-18;if(y+h>rect.height-12)y=e.clientY-rect.top-h-18;this.tip.style.left=clamp(x,8,Math.max(8,rect.width-w-8))+'px';this.tip.style.top=clamp(y,8,Math.max(8,rect.height-h-8))+'px';
    }
    hideTip(){clearTimeout(this.tipTimer);if(this.tip)this.tip.hidden=true;}
    filterSearch(locate=true){
      if(!this.search)return;const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),q=norm(this.search.value.trim());this.matches=[];
      for(const [id,el] of this.nodeEls){const hit=!!q&&norm(this.api.nodes[id].name).includes(q);el.classList.toggle('search-hit',hit);el.classList.toggle('search-muted',!!q&&!hit);if(hit)this.matches.push(id);}
      this.wrap.querySelector('.pkt-search-count').textContent=q?String(this.matches.length):'';
      if(locate&&q&&this.matches.length===1)this.select(this.matches[0],true,false);
    }
    bind(){
      this.wrap.addEventListener('click',e=>{
        if(performance.now()<this.suppressUntil){e.preventDefault();return;}
        const node=e.target.closest('[data-pkt-skill]');if(node){this.select(node.dataset.pktSkill);return;}
        const select=e.target.closest('[data-pkt-select]');if(select){this.select(select.dataset.pktSelect,true);return;}
        if(e.target.closest('[data-pkt-buy]')){this.purchase(this.selected);return;}
        if(e.target.closest('[data-pkt-locate]')){this.focusNode(this.selected);return;}
        const branch=e.target.closest('[data-pkt-branch]');if(branch){this.fit(true,branch.dataset.pktBranch===this.focusBranch?null:branch.dataset.pktBranch);return;}
        if(e.target.closest('[data-pkt-home]')){this.fit();return;}
        if(e.target.closest('[data-pkt-clear]')){this.selected=null;this.hovered=null;this.wrap.classList.remove('pkt-has-selection');this.refresh();return;}
      });
      this.viewport.addEventListener('dblclick',e=>{const el=e.target.closest('[data-pkt-skill]');if(el){e.preventDefault();this.purchase(el.dataset.pktSkill);}});
      this.search.addEventListener('input',()=>this.filterSearch());this.search.addEventListener('keydown',e=>{if(e.key==='Enter'&&this.matches?.length){e.preventDefault();this.select(this.matches[0],true);}if(e.key==='Escape'){e.stopPropagation();this.search.value='';this.filterSearch(false);}});
      this.viewport.addEventListener('wheel',e=>{
        e.preventDefault();this.endGesture();const r=this.viewport.getBoundingClientRect(),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?r.height:1);if(!delta)return;const z=this.zoomTarget?.z||this.camera.z;this.zoomTo(z*Math.exp(-clamp(delta,-160,160)*.0018),e.clientX-r.left-this.viewport.clientLeft,e.clientY-r.top-this.viewport.clientTop);
      },{passive:false});
      this.viewport.addEventListener('pointerdown',e=>{
        if(e.button!==0&&e.button!==1)return;if(this.gesture){this.endGesture();return;}this.stopZoom();this.hideTip();
        this.gesture={id:e.pointerId,x:e.clientX,y:e.clientY,panX:this.camera.x,panY:this.camera.y,moved:false};this.gestureEvents=new AbortController();const signal=this.gestureEvents.signal;
        const move=ev=>{const g=this.gesture;if(!g||ev.pointerId!==g.id)return;if(ev.pointerType==='mouse'&&ev.buttons===0){this.endGesture();return;}const dx=ev.clientX-g.x,dy=ev.clientY-g.y;
          if(!g.moved&&Math.hypot(dx,dy)>6){g.moved=true;this.fitMode=false;this.hideTip();this.hovered=null;this.highlight();this.viewport.classList.add('panning');try{this.viewport.setPointerCapture(g.id);}catch(_){}}
          if(g.moved){ev.preventDefault();this.camera.x=g.panX+dx;this.camera.y=g.panY+dy;if(!this.moveFrame)this.moveFrame=requestAnimationFrame(()=>{this.moveFrame=0;this.apply();});}
        };
        window.addEventListener('pointermove',move,{signal,passive:false});window.addEventListener('pointerup',ev=>{if(ev.pointerId===this.gesture?.id){this.apply();this.endGesture();}},{signal});window.addEventListener('pointercancel',()=>this.endGesture(),{signal});window.addEventListener('blur',()=>this.endGesture(),{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)this.endGesture();},{signal});
        if(e.button===1)e.preventDefault();
      });
      this.viewport.addEventListener('lostpointercapture',()=>this.endGesture());this.viewport.addEventListener('dragstart',e=>e.preventDefault());
      this.viewport.addEventListener('pointerover',e=>{const el=e.target.closest('[data-pkt-skill]');if(!el||el.contains(e.relatedTarget)||this.gesture?.moved||e.pointerType==='touch')return;this.hovered=el.dataset.pktSkill;this.highlight();this.hideTip();this.tipTimer=setTimeout(()=>this.showTip(el.dataset.pktSkill,e),420);});
      this.viewport.addEventListener('pointerout',e=>{const el=e.target.closest('[data-pkt-skill]');if(!el||el.contains(e.relatedTarget))return;this.hovered=null;this.highlight();this.hideTip();});
      this.viewport.addEventListener('pointerleave',()=>{this.hovered=null;this.highlight();this.hideTip();});
      this.viewport.addEventListener('keydown',e=>{
        if(e.key==='0'||e.key==='Home'){e.preventDefault();this.fit();return;}if(e.key==='+'||e.key==='='||e.key==='-'){e.preventDefault();this.zoomStep(e.key==='-'?-1:1);return;}
        const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},dir=dirs[e.key];if(!dir)return;e.preventDefault();
        const current=e.target.closest('[data-pkt-skill]')?.dataset.pktSkill||this.selected||'trainer',p=layout().pos[current];let best=null;
        for(const [id,q] of Object.entries(layout().pos)){if(!this.nodeEls.has(id)||id===current)continue;const dx=q.x-p.x,dy=q.y-p.y,forward=dx*dir[0]+dy*dir[1],side=Math.abs(dx*dir[1]-dy*dir[0]);if(forward<=0||side>forward*2)continue;const score=Math.hypot(dx,dy)+side*.8;if(!best||score<best.score)best={id,score};}
        if(best){this.select(best.id);this.ensureNodeVisible(best.id);}
      });
    }
  }
  window.PokeSendaTreeUI={
    render(wrap,api){if(!wrap)return;let view=instances.get(wrap);if(!view){view=new TreeView(wrap,api);instances.set(wrap,view);}else view.api=api;view.refresh();return view;},
    zoom(wrap,v,ax=null,ay=null){const view=instances.get(wrap);if(view){view.init();view.zoomTo(v,ax,ay);}},
    step(wrap,direction){instances.get(wrap)?.zoomStep(direction);},
    fit(wrap){instances.get(wrap)?.fit();},
    layout
  };
})();


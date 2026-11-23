
(()=>{
  'use strict';
  const mq=window.matchMedia('(max-width: 980px)');
  const SPECIAL=new Set(['achievementsOverlay','skillTreeOverlay','mainMenu','pkBootLoader']);
  const watched=new WeakMap(),containers=new WeakSet();
  let raf=0;
  const panelFor=o=>o?.querySelector(':scope > .modal-box,:scope > .menu-box,:scope > .center-card,:scope > .summary-box,:scope > .reward-box,:scope > .evo-card');
  const visible=o=>{if(!o||o.classList.contains('hidden'))return false;const cs=getComputedStyle(o);return cs.display!=='none'&&cs.visibility!=='hidden';};
  function normalizeOne(o){
    if(!mq.matches||!visible(o)||SPECIAL.has(o.id)){o?.classList.remove('pk-mobile-scroll-page');return;}
    const panel=panelFor(o);if(!panel)return;
    const limit=Math.max(260,window.innerHeight-16),r=panel.getBoundingClientRect();
    const needs=(panel.scrollHeight>panel.clientHeight+4)||(panel.scrollHeight>limit)||(r.bottom>window.innerHeight-4);
    o.classList.toggle('pk-mobile-scroll-page',needs);
  }
  function opened(o){
    if(!mq.matches||!visible(o))return;
    requestAnimationFrame(()=>{normalizeOne(o);if(o.classList.contains('pk-mobile-scroll-page'))o.scrollTop=0;o.querySelectorAll('.item-compatible-list,.tm-compatible-list').forEach(x=>x.scrollTop=0);});
  }
  function watch(o){
    if(!o||watched.has(o))return;
    let wasVisible=visible(o);
    const mo=new MutationObserver(()=>{const isVisible=visible(o);if(isVisible&&!wasVisible)opened(o);wasVisible=isVisible;});
    mo.observe(o,{attributes:true,attributeFilter:['class']});watched.set(o,mo);
  }
  function scan(scope=document){if(scope.matches?.('.overlay'))watch(scope);scope.querySelectorAll?.('.overlay').forEach(watch);}
  function sync(){raf=0;document.querySelectorAll('.overlay').forEach(o=>{watch(o);normalizeOne(o);});}
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(sync)};
  function watchContainer(c){
    if(!c||containers.has(c))return;containers.add(c);
    new MutationObserver(ms=>{let added=false;for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1){scan(n);added=true;}if(added)schedule();}).observe(c,{childList:true,subtree:false});
  }
  function refreshContainers(){watchContainer(document.body);watchContainer(document.getElementById('pkRegionRuntimeRoot'));watchContainer(document.getElementById('pkGlobalInfiniteRoot'));}
  function start(){
    scan(document);refreshContainers();sync();
    /* No reanalizar todas las ventanas después de cada toque y no forzar scrollIntoView
       al enfocar controles. Ambas cosas podían mover el viewport en Android/iOS. */
    mq.addEventListener?.('change',schedule);
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(schedule,120),{passive:true});
    window.visualViewport?.addEventListener?.('resize',()=>{if(document.activeElement?.matches?.('input,select,textarea'))return;schedule();},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

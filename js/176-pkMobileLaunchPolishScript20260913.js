
(()=>{
  'use strict';
  const mq=window.matchMedia('(max-width: 980px)');
  const SURFACE='.overlay,.loot-panel,.info-panel,.ux-context-panel';
  const watched=new WeakSet(),containers=new WeakSet();
  let raf=0;
  const rendered=el=>{
    if(!el||el.id==='pkBootLoader'||el.classList.contains('hidden'))return false;
    const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden';
  };
  const visibleModal=()=>{
    if(!mq.matches)return false;
    for(const el of document.querySelectorAll(SURFACE))if(rendered(el))return true;
    return false;
  };
  const sync=()=>{
    raf=0;
    if(!mq.matches){document.body?.classList.remove('pk-mobile-modal-open');return;}
    const open=visibleModal();
    document.body?.classList.toggle('pk-mobile-modal-open',open);
    if(open){document.getElementById('pkMobileMore')?.classList.remove('show');document.body?.classList.remove('pk-mobile-sheet-open');}
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(sync)};
  const watchSurface=el=>{
    if(!el||watched.has(el))return;watched.add(el);
    new MutationObserver(schedule).observe(el,{attributes:true,attributeFilter:['class']});
  };
  const scan=scope=>{
    if(!scope)return;
    if(scope.matches?.(SURFACE))watchSurface(scope);
    scope.querySelectorAll?.(SURFACE).forEach(watchSurface);
  };
  const watchContainer=el=>{
    if(!el||containers.has(el))return;containers.add(el);
    new MutationObserver(ms=>{
      for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)scan(n);
      schedule();
    }).observe(el,{childList:true,subtree:false});
  };
  const refreshContainers=()=>{
    watchContainer(document.body);
    watchContainer(document.getElementById('pkRegionRuntimeRoot'));
    watchContainer(document.getElementById('pkGlobalInfiniteRoot'));
  };
  const start=()=>{
    try{localStorage.removeItem('pokesenda_display_resolution_v1');}catch(_){}
    document.documentElement.removeAttribute('data-pk-display-mode');
    scan(document);refreshContainers();schedule();
    /* Las superficies ya se sincronizan por sus propios cambios; no escanear todo el DOM en cada toque. */
    mq.addEventListener?.('change',()=>{scan(document);schedule();});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});

    /* Accesos móviles Casino / Cloud. */
    document.getElementById('pkMobileMore')?.addEventListener('click',e=>{
      if(e.target.closest?.('#pkRegionRuntimeRoot'))return;
      const b=e.target.closest('[data-mobile-more]'); if(!b)return;
      const a=b.dataset.mobileMore;
      if(a!=='casino'&&a!=='cloud')return;
      e.preventDefault();e.stopImmediatePropagation();
      document.getElementById('pkMobileMore')?.classList.remove('show');
      document.body?.classList.remove('pk-mobile-sheet-open');
      if(a==='casino'){
        const btn=document.getElementById('casinoHudBtn');
        if(btn){btn.click();return;}
        if(window.PokeSendaCasino?.open){window.PokeSendaCasino.open();return;}
      }
      if(a==='cloud'){
        const btn=document.getElementById('optionsCloudSaveBtn');
        if(btn){btn.click();return;}
        if(window.PKCloud?.open){window.PKCloud.open();return;}
      }
    },true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

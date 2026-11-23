
(()=>{
  if(window.__pkFilterResetUx20260914)return;window.__pkFilterResetUx20260914=true;
  const fire=(el,type)=>{if(!el)return;el.dispatchEvent(new Event(type,{bubbles:true}));};
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('[data-pk-filter-reset]');if(!btn)return;
    const mode=btn.dataset.pkFilterReset;
    const overlay=btn.closest(mode==='dex'?'#pokedexOverlay':'#pcBoxOverlay');if(!overlay)return;
    e.preventDefault();e.stopPropagation();
    if(mode==='dex'){
      const search=overlay.querySelector('#pokedexSearch');if(search){search.value='';fire(search,'input');}
      overlay.querySelector('[data-dex-status="all"]')?.click();
      overlay.querySelector('[data-dex-rarity="all"]')?.click();
      overlay.querySelector('[data-dex-route="all"]')?.click();
      search?.focus({preventScroll:true});
    }else if(mode==='box'){
      const search=overlay.querySelector('#pcBoxSearch');if(search){search.value='';fire(search,'input');}
      overlay.querySelector('[data-pc-status="all"]')?.click();
      overlay.querySelector('[data-pc-rarity="all"]')?.click();
      const sort=overlay.querySelector('#pcBoxSortSelect');if(sort){sort.value='dex';fire(sort,'change');}
      search?.focus({preventScroll:true});
    }
  },true);
})();

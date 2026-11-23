
(function(){
  const HELP_GROUPS=[
    {title:'Inicio',items:['start']},
    {title:'Primeros pasos',items:['pokemon','combat','route','capture','items','gyms']},
    {title:'Manual de referencia',items:['interface','natures','tms','casino','tree','achievements','ux','faq']}
  ];
  function labelFor(panel,tab){const btn=panel?.querySelector('[data-help-tab="'+tab+'"]');return (btn?.textContent||tab).trim();}
  function currentTab(panel){return panel?.querySelector('[data-help-tab].active')?.dataset.helpTab||panel?.querySelector('[data-help-page]:not(.hidden)')?.dataset.helpPage||'start';}
  function openTab(panel,tab){if(!panel)return;const btn=panel.querySelector('[data-help-tab="'+tab+'"]');if(btn){btn.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return;}panel.querySelectorAll('[data-help-page]').forEach(p=>p.classList.toggle('hidden',p.dataset.helpPage!==tab));}
  function syncSidebar(panel){if(!panel)return;const cur=currentTab(panel);panel.querySelectorAll('[data-help-sidebar-go]').forEach(b=>b.classList.toggle('active',b.dataset.helpSidebarGo===cur));}
  function buildSidebar(panel,host){if(!host)return;host.innerHTML='';HELP_GROUPS.forEach(group=>{const title=document.createElement('div');title.className='help-ref-title';title.textContent=group.title;host.appendChild(title);group.items.forEach(tab=>{const b=document.createElement('button');b.type='button';b.className='help-ref-link';b.dataset.helpSidebarGo=tab;b.textContent=tab==='start'?'Inicio rápido':labelFor(panel,tab);host.appendChild(b);});});}
  function enhanceTrainerGuidePanel(panel){
    if(!panel)return panel;
    if(panel.dataset.helpGuideEnhanced==='1'){panel.classList.remove('help-quick-mode');panel.classList.add('help-guide-rework','help-manual-mode');return panel;}
    panel.dataset.helpGuideEnhanced='1';panel.classList.add('help-guide-rework','help-manual-mode');
    const pages=[...panel.querySelectorAll('[data-help-page]')],anchor=panel.querySelector('.help-search-results')||panel.querySelector('.help-search-wrap');if(!pages.length||!anchor)return panel;
    const shell=document.createElement('div');shell.className='help-reference-shell';
    const sidebar=document.createElement('aside');sidebar.className='help-reference-sidebar';
    const main=document.createElement('div');main.className='help-reference-main';
    pages[0].insertAdjacentElement('beforebegin',shell);shell.append(sidebar,main);pages.forEach(p=>main.appendChild(p));buildSidebar(panel,sidebar);
    const hint=panel.querySelector('.help-search-hint');if(hint)hint.remove();
    const search=panel.querySelector('.help-search');if(search)search.placeholder='🔎 Busca: MT, Mentas, Gachapon, XP, objetos, Shiny, checkpoints...';
    sidebar.addEventListener('click',e=>{const b=e.target.closest('[data-help-sidebar-go]');if(!b)return;openTab(panel,b.dataset.helpSidebarGo||'start');syncSidebar(panel);try{panel.scrollTo({top:0,behavior:'auto'});}catch(_){}});
    panel.addEventListener('click',e=>{if(e.target.closest('.help-search-hit')||e.target.closest('[data-help-go]'))setTimeout(()=>syncSidebar(panel),0);});
    panel._helpSync=()=>syncSidebar(panel);syncSidebar(panel);return panel;
  }
  window.enhanceTrainerGuidePanel=enhanceTrainerGuidePanel;
  window.setTrainerGuideMode=(panel)=>{enhanceTrainerGuidePanel(panel);panel?.classList.remove('help-quick-mode');panel?.classList.add('help-manual-mode');};
  document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('#infoPanel').forEach(enhanceTrainerGuidePanel);});
})();

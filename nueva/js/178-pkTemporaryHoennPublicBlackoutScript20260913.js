
(()=>{
  'use strict';
  if(window.PokeSendaHoennRelease?.enabled===true)return;

  const HIDE_SEL=[
    '#mainMenu [data-pk-menu-region="hoenn"]',
    '#regionHoennCard',
    '[data-self-profile-region="hoenn"]',
    '[data-profile-region="hoenn"]',
    '[data-gd-region="hoenn"]',
    '[data-gbox-region="hoenn"]',
    '.pk-public-region-panel[data-region="hoenn"]',
    '#pkHoennCloneBadge'
  ].join(',');

  const replacements=[
    [/Kanto \+ Johto \+ Hoenn disponibles · 3 regiones · Infinita Global/g,'Kanto + Johto disponibles · 2 regiones · Infinita Global'],
    [/Kanto \+ Johto \+ Hoenn/g,'Kanto + Johto'],
    [/Kanto, Johto y Hoenn/g,'Kanto y Johto'],
    [/Kanto, Johto o Hoenn/g,'Kanto o Johto'],
    [/Kanto\/Johto\/Hoenn/g,'Kanto/Johto'],
    [/la tercera ruta de Kanto, Johto o Hoenn/gi,'la tercera ruta de Kanto o Johto'],
    [/de Kanto, Johto o Hoenn/gi,'de Kanto o Johto']
  ];

  function hideHoennUI(root=document){
    try{root.querySelectorAll?.(HIDE_SEL).forEach(el=>{el.hidden=true;el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true');});}catch(_){ }
  }

  function hideHoennPatchNotes(root=document){
    try{
      root.querySelectorAll?.('.patch-current').forEach(el=>{
        if(/\bHoenn\b/i.test(el.textContent||'')){
          el.hidden=true;el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true');
        }
      });
    }catch(_){ }
  }

  function hideHoennHelp(root=document){
    try{
      root.querySelectorAll?.('.help-faq,.help-mini-card,.help-tip').forEach(el=>{
        const t=el.textContent||'';
        if(/\bHoenn\b|Archipiélago Celeste|Caldera Magma|Senda Esmeralda/i.test(t)){
          el.hidden=true;el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true');
        }
      });
    }catch(_){ }
  }

  function cleanTextNode(node){
    if(!node||node.nodeType!==Node.TEXT_NODE)return;
    const p=node.parentElement;if(!p||/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/i.test(p.tagName))return;
    let v=node.nodeValue||'',n=v;
    for(const [re,to] of replacements)n=n.replace(re,to);
    if(n!==v)node.nodeValue=n;
  }

  function cleanText(root){
    try{
      if(root.nodeType===Node.TEXT_NODE){cleanTextNode(root);return;}
      if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;
      if(root.nodeType===Node.ELEMENT_NODE&&/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/i.test(root.tagName))return;
      const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let n;while((n=w.nextNode()))cleanTextNode(n);
    }catch(_){ }
  }

  function conceal(root=document){
    hideHoennUI(root);hideHoennPatchNotes(root);hideHoennHelp(root);cleanText(root);
    // Si una elección previa apuntaba a Hoenn, se devuelve silenciosamente a Kanto.
    try{if(localStorage.getItem('pokesenda_menu_region_choice_v1')==='hoenn')localStorage.setItem('pokesenda_menu_region_choice_v1','kanto');}catch(_){ }
    try{sessionStorage.removeItem('pokesenda_active_region_boot_v1');if(sessionStorage.getItem('pokesenda_menu_region_autoplay_v1')==='hoenn')sessionStorage.removeItem('pokesenda_menu_region_autoplay_v1');}catch(_){ }
  }

  function boot(){
    conceal(document);
    try{
      const mo=new MutationObserver(records=>{
        for(const rec of records)for(const n of rec.addedNodes||[]){
          if(n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.DOCUMENT_FRAGMENT_NODE){hideHoennUI(n);hideHoennPatchNotes(n);hideHoennHelp(n);cleanText(n);}
          else if(n.nodeType===Node.TEXT_NODE)cleanTextNode(n);
        }
      });
      mo.observe(document.body||document.documentElement,{childList:true,subtree:false});
    }catch(_){ }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

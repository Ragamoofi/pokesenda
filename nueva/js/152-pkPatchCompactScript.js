
(()=>{
  const PATCH_VISIBLE=4;
  function categoryFor(title=''){
    const t=title.toLowerCase();
    if(/infinita|infinite|gachapon.*hito/.test(t)) return ['♾️','Infinita','infinite'];
    if(/johto|regi[oó]n/.test(t) && /disponible|lanzamiento|ruta|gimnasio|pok[eé]dex enriquecida/.test(t)) return ['🍂','Johto','johto'];
    if(/balance|probabilidad|rareza|econom|escas|drop|dificultad|daño|curva/.test(t)) return ['⚖️','Balance','balance'];
    if(/corr|fix|repara|estable|bug|sin bucle|centrad|paridad|restaurad|bloqueo/.test(t)) return ['🐛','Fix','fix'];
    if(/visual|interfaz|sprite|perfil|hud|diseño|rediseño|pulido|apariencia|icono/.test(t)) return ['🎨','Visual','visual'];
    if(/nuevo|nueva|añade|agrega|llega|disponible|pok[eé]dex|comunidad|casino|logros|avatar/.test(t)) return ['✨','Contenido','content'];
    return ['⚙️','Sistema','system'];
  }
  function decorateEntry(el){
    if(!el || el.dataset.patchCategoryReady==='1') return;
    const titleEl=el.matches('.patch-group')?el.querySelector('.patch-copy>b'):el.querySelector(':scope>b');
    if(!titleEl) return;
    const [icon,label,cls]=categoryFor(titleEl.textContent||'');
    const badge=document.createElement('span');
    badge.className='patch-category-badge '+cls;
    badge.textContent=icon+' '+label;
    titleEl.prepend(badge);
    el.dataset.patchCategoryReady='1';
  }
  function enhance(body){
    if(!body || body.dataset.compactPatchReady==='1') return;
    body.dataset.compactPatchReady='1';
    body.classList.remove('history-expanded');
    body.querySelectorAll('.patch-current,.patch-entry,.patch-group').forEach(decorateEntry);
    const direct=[...body.children].filter(x=>!x.classList.contains('patch-history-toggle-row')&&!x.classList.contains('patch-recent-note'));
    let recent=0, archiveCount=0;
    direct.forEach(el=>{
      const isUpdate=el.matches('.patch-current,.patch-entry,.patch-group,.patch-history');
      if(isUpdate && recent<PATCH_VISIBLE && !el.matches('.patch-history')){recent++;return;}
      el.classList.add('patch-archive-item');
      if(isUpdate) archiveCount++;
    });
    const note=document.createElement('div');
    note.className='patch-recent-note';
    note.textContent='Mostrando las '+Math.min(PATCH_VISIBLE,recent)+' novedades más recientes.';
    const toggleRow=document.createElement('div');
    toggleRow.className='patch-history-toggle-row';
    toggleRow.innerHTML='<button class="btn patch-history-toggle" type="button" data-patch-history-toggle="1">📜 Ver historial completo</button><span class="patch-history-count">El historial anterior se conserva completo.</span>';
    let anchor=[...body.children].filter(x=>!x.classList.contains('patch-archive-item')).pop();
    if(anchor){anchor.after(note);note.after(toggleRow);}else{body.prepend(note,toggleRow);}
  }
  function enhanceAll(root=document){root.querySelectorAll?.('.patch-notes-body').forEach(enhance)}
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-patch-history-toggle]');
    if(!btn)return;
    const body=btn.closest('.patch-notes-body'); if(!body)return;
    const expanded=body.classList.toggle('history-expanded');
    btn.textContent=expanded?'▴ Ocultar historial':'📜 Ver historial completo';
    if(!expanded){const modal=body.closest('.patch-notes-modal'); if(modal)modal.scrollTop=0;}
  },true);
  const resetOverlay=ov=>{const body=ov?.querySelector('.patch-notes-body');if(!body)return;enhance(body);body.classList.remove('history-expanded');const b=body.querySelector('[data-patch-history-toggle]');if(b)b.textContent='📜 Ver historial completo';};
  document.addEventListener('click',e=>{
    const open=e.target.closest?.('#menuPatchNotesBtn,#menuPatchQuickBtn');
    if(open)setTimeout(()=>document.querySelectorAll('#patchNotesOverlay').forEach(resetOverlay),0);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{enhanceAll();setTimeout(()=>enhanceAll(),1200);});else{enhanceAll();setTimeout(()=>enhanceAll(),1200);}
})();

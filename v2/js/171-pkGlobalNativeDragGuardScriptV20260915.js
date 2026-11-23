
(()=>{
  'use strict';
  let recovering=false;

  const hasTransientDragState=()=>
    document.documentElement.classList.contains('pk-formation-pointer-drag') ||
    !!document.querySelector('.pk-formation-drag-ghost,.formation-dragging,.formation-drop-target,.poe-tree-scroll.panning');

  const clearTransientVisuals=()=>{
    document.documentElement.classList.remove('pk-formation-pointer-drag');
    document.querySelectorAll('.pk-formation-drag-ghost').forEach(n=>n.remove());
    document.querySelectorAll('.formation-dragging,.formation-drop-target').forEach(n=>{
      n.classList.remove('formation-dragging','formation-drop-target');
      n.removeAttribute('aria-dropeffect');
    });
    document.querySelectorAll('.formation-drag-handle[aria-grabbed]').forEach(n=>n.removeAttribute('aria-grabbed'));
    document.querySelectorAll('.poe-tree-scroll.panning').forEach(n=>n.classList.remove('panning'));
  };

  const recover=()=>{
    if(recovering)return;
    recovering=true;
    try{window.PokeSendaCancelFormationDrag?.();}catch(_){}
    try{window.PokeSendaCancelJohtoFormationDrag?.();}catch(_){}
    try{clearTransientVisuals();}catch(_){}
    recovering=false;
  };
  window.PokeSendaRecoverInteractions=recover;

  // No hay ninguna mecánica de PokéSenda que dependa del Drag & Drop HTML5.
  // Cancelarlo aquí evita que arrastrar imágenes, sprites, enlaces o texto seleccionado
  // robe el pointerup al juego y deje una captura/estado de interacción colgado.
  document.addEventListener('dragstart',e=>{
    e.preventDefault();
    try{e.dataTransfer?.clearData?.();}catch(_){}
    recover();
  },true);
  document.addEventListener('drop',e=>{e.preventDefault();recover();},true);
  document.addEventListener('dragend',recover,true);

  // Rutas de salida baratas; no hay MutationObservers ni watchdog por frame.
  window.addEventListener('pointercancel',recover,true);
  document.addEventListener('lostpointercapture',()=>{if(hasTransientDragState())recover();},true);
  window.addEventListener('blur',recover,true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)recover();},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&hasTransientDragState())recover();},true);

  const hardenStaticImages=()=>document.querySelectorAll('img').forEach(img=>{
    try{img.draggable=false;img.setAttribute('draggable','false');}catch(_){}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hardenStaticImages,{once:true});
  else hardenStaticImages();
})();


(function(){
  const $=id=>document.getElementById(id);
  function wireMenuPolish(){
    const mainMenu=$('mainMenu');
    const menuBox=mainMenu?.querySelector('.menu-box');
    if(!menuBox) return;
    const sub=menuBox.querySelector('.menu-sub');
    if(sub) sub.textContent='Aventura idle · Explora, entrena y conquista regiones';
    if(!menuBox.querySelector('.menu-mini-links')){
      const row=document.createElement('div');
      row.className='menu-mini-links';
      row.innerHTML='<button id="menuPatchQuickBtn" class="btn" type="button">📝 Novedades</button><button id="menuRecoveryBtn" class="btn" type="button">🛟 Recuperar partida</button>';
      const saveInfo=$('menuSaveInfo');
      if(saveInfo) saveInfo.insertAdjacentElement('afterend',row);
      else menuBox.insertBefore(row, menuBox.querySelector('.menu-timed-gacha') || menuBox.querySelector('.menu-credit'));
      row.querySelector('#menuPatchQuickBtn')?.addEventListener('click',()=>{
        mainMenu.classList.add('hidden');
        $('patchNotesOverlay')?.classList.remove('hidden');
        try{ if(typeof uxMarkVersionSeen==='function') uxMarkVersionSeen(); }catch(_){ }
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wireMenuPolish,{once:true});
  else wireMenuPolish();
  setTimeout(wireMenuPolish,300);
  setTimeout(wireMenuPolish,900);
})();

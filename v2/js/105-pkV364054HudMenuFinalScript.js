
(function(){
  const $=id=>document.getElementById(id);
  function finalizeMenuAndCloud(){
    // El acceso manual ya no ocupa espacio en el menú principal.
    const transferMenu=$('menuTransferSaveBtn');
    if(transferMenu) transferMenu.style.display='none';

    // Añadir transferencia manual dentro de Cloud Save.
    const actions=document.querySelector('#pkCloudOverlay .pk-cloud-actions');
    if(actions && !$('pkCloudManualTransferBtn')){
      const b=document.createElement('button');
      b.id='pkCloudManualTransferBtn';
      b.className='btn';
      b.type='button';
      b.textContent='💾 Transferir / respaldo manual';
      b.title='Exportar o importar una partida .pokesenda manualmente';
      actions.appendChild(b);
      b.addEventListener('click',()=>{
        $('pkCloudOverlay')?.classList.add('hidden');
        // Reutilizamos el sistema manual existente sin duplicar lógica. Primero el API estable; después, fallbacks de UI.
        if(window.PokeSendaTransferSave?.open){window.PokeSendaTransferSave.open();return;}
        const option=$('optionsTransferSaveBtn');if(option){option.click();return;}
        const old=$('menuTransferSaveBtn');if(old)old.click();
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',finalizeMenuAndCloud,{once:true});
  else finalizeMenuAndCloud();
  setTimeout(finalizeMenuAndCloud,350);
  setTimeout(finalizeMenuAndCloud,1000);
})();

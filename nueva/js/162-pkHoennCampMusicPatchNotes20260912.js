
(()=>{
  if(!window.PokeSendaRegionBoot?.isHoennClone)return;
  const CARD='<div class="patch-current"><b>🏕️ Hoenn · campamento definitivo + tema de entrada regional</b><p>El campamento de Hoenn pasa a usar la ilustración costera aprobada, con la aldea tropical y el volcán visible a lo lejos. Además, la canción de entrada de Hoenn se reemplaza por el tema enviado para Región III: al entrar a Hoenn suena una sola vez y completa, y después la música continúa con la playlist habitual del juego. Corregido también el selector real del escenario para que menú, campamento y las tres rutas carguen sus assets externos sin caer en fondos de Kanto.</p></div>';
  const inject=()=>{
    const body=document.querySelector('#patchNotesOverlay .patch-notes-body');
    if(!body)return;
    if(body.innerHTML.includes('campamento definitivo + tema de entrada regional'))return;
    body.insertAdjacentHTML('afterbegin',CARD);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
  setTimeout(inject,240);
  setTimeout(inject,1200);
})();

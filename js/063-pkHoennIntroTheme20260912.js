
(()=>{
  if(!window.PokeSendaRegionBoot?.isHoennClone)return;
  const audio=document.getElementById('introMusic');
  if(!audio)return;
  const src='assets/embedded/hoenn_tema_menu.mp3';
  audio.dataset.pkHoennIntroApplied='1';
  try{audio.pause();audio.currentTime=0;}catch(_){ }
  audio.src=src;
  audio.setAttribute('src',src);
  audio.loop=false;
  audio.preload='auto';
  try{audio.load();}catch(_){ }
})();


(()=>{
  const audio=document.getElementById("introMusic");
  if(!audio)return;
  let volume=.22,started=false;
  try{
    const raw=localStorage.getItem(window.PokeSendaActiveSaveKey||"pokesenda_beta1_save_v1");
    if(raw){
      const saved=Number(JSON.parse(raw)?.options?.musicVolume);
      if(Number.isFinite(saved))volume=Math.max(0,Math.min(1,saved));
    }
  }catch(_){ }
  audio.loop=false;
  audio.autoplay=true;
  audio.preload="auto";
  audio.playsInline=true;
  audio.volume=Math.max(0,Math.min(1,volume*.78));
  const tryImmediateIntroMusic=()=>{
    if(started||audio.dataset.pkIntroDone==="1"||volume<=0||audio.ended||!audio.paused)return;
    started=true;
    try{
      const p=audio.play();
      if(p&&typeof p.catch==="function")p.catch(()=>{started=false;});
    }catch(_){started=false;}
  };
  // Solo intentos de arranque de ESTA carga. No hay pageshow: la intro jamás se rearma al volver al menú o recuperar la pestaña.
  tryImmediateIntroMusic();
  audio.addEventListener("loadeddata",tryImmediateIntroMusic,{once:true});
  audio.addEventListener("canplay",tryImmediateIntroMusic,{once:true});
  document.addEventListener("DOMContentLoaded",tryImmediateIntroMusic,{once:true});
  window.addEventListener("load",tryImmediateIntroMusic,{once:true});
})();

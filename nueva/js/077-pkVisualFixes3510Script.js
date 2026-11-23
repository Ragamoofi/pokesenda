
(function(){
  /* V36.40.63 · Campo: Apoyo izquierda, Asalto centro, Guardia derecha. */
  function updateTeamCountLayout(){
    const line=document.getElementById("teamLine");if(!line)return;
    line.classList.remove("pk-team-one","pk-team-two","pk-team-three");
    const mons=[...line.querySelectorAll(":scope > .mon-wrap")];
    mons.forEach((mon,i)=>{
      const role=Number(mon.dataset.battleRole),column=Number.isInteger(role)&&role>=0&&role<3?({0:3,1:2,2:1}[role]):i+1;
      mon.style.setProperty("grid-row","1","important");
      mon.style.setProperty("grid-column",String(column),"important");
      mon.style.setProperty("transform","none","important");
    });
  }
  const line=document.getElementById("teamLine");
  updateTeamCountLayout();
  if(line)new MutationObserver(updateTeamCountLayout).observe(line,{childList:true});
})();

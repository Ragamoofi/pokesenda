
(()=>{
'use strict';
if(!window.PokeSendaRegionBoot?.isHoennClone)return;
const REPS=[
 ['Ruta Verde','Archipiélago Celeste'],['Cueva Rocosa','Caldera Magma'],['Costa Azul','Senda Esmeralda'],
 ['Casino Azulona','Casino Malvalona'],['CIUDAD AZULONA','CIUDAD MALVALONA'],['Ciudad Azulona','Ciudad Malvalona'],
 ['Gimnasios de Kanto','Gimnasios de Hoenn'],['región de Kanto','región de Hoenn'],['Región de Kanto','Región de Hoenn'],
 ['Pokémon de Kanto','Pokémon de Hoenn'],['Generación I','Generación III'],['Generación 1','Generación III'],['Gen 1','Gen III'],
 ['151 Pokémon','138 especies disponibles'],['151/151','138/138'],['Pokémon Rojo/Azul','Pokémon Rubí/Zafiro/Esmeralda']
];
function rep(v){let out=String(v??'');for(const [a,b] of REPS)out=out.replaceAll(a,b);return out;}
function walk(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){const nv=rep(n.nodeValue);if(nv!==n.nodeValue)n.nodeValue=nv;}root.querySelectorAll?.('[title],[aria-label],[placeholder],[data-help-title]').forEach(el=>{for(const a of ['title','aria-label','placeholder','data-help-title'])if(el.hasAttribute(a))el.setAttribute(a,rep(el.getAttribute(a)));});}
function apply(){
  ['pkFirstWelcomeOverlay','infoPanel','pkCasinoOverlay','mintVendorOverlay','gymSelectOverlay','gymBattleOverlay','gymResultOverlay'].forEach(id=>walk(document.getElementById(id)));
  const welcome=document.getElementById('pkFirstWelcomeTitle');if(welcome&&welcome.textContent!=='BIENVENIDO A POKÉSENDA · HOENN')welcome.textContent='BIENVENIDO A POKÉSENDA · HOENN';
  const steps=document.querySelectorAll('#pkFirstWelcomeOverlay .pk-first-welcome-step');const step3='<b>3 · Sal al Archipiélago Celeste</b><span>Comienza desde 0 m, gana EXP, Pokédolares y recompensas. Los Centros Pokémon sirven como checkpoints.</span>';if(steps[2]&&steps[2].innerHTML!==step3)steps[2].innerHTML=step3;
  const casino=document.getElementById('casinoHudBtn');if(casino){casino.title='Casino Malvalona · Blackjack y Ruleta';casino.setAttribute('aria-label','Abrir Casino Malvalona');}
  const gt=document.getElementById('gymSelectTitle');if(gt&&gt.textContent!=='🏛 Gimnasios de Hoenn')gt.textContent='🏛 Gimnasios de Hoenn';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
setTimeout(apply,150);setTimeout(apply,900);
// No observamos todo el body: partículas, daño flotante y renders de combate no necesitan relocalizar la UI.
document.addEventListener('click',e=>{if(e.target.closest?.('#helpInfoBtn,#casinoHudBtn,#gymHudBtn,[data-help-go],[data-help-tab]'))setTimeout(apply,0);},true);
})();

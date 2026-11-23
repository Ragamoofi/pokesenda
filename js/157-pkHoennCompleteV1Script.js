
(()=>{
'use strict';
if(!window.PokeSendaRegionBoot?.isHoennClone)return;
const $=id=>document.getElementById(id);
function prepStarter(){const o=$('starterOverlay');if(!o)return;const h=o.querySelector('h2'),p=o.querySelector('p'),bs=[...o.querySelectorAll('[data-starter]')],defs=[['treecko',252,'Treecko','Planta · ágil y ofensivo. Evoluciona a Grovyle en Nv.16 y Sceptile en Nv.36.'],['torchic',255,'Torchic','Fuego · ofensivo y veloz. Evoluciona a Combusken en Nv.16 y Blaziken en Nv.36.'],['mudkip',258,'Mudkip','Agua · resistente y equilibrado. Evoluciona a Marshtomp en Nv.16 y Swampert en Nv.36.']];if(h)h.textContent='Elige tu primer compañero de Hoenn';if(p)p.textContent='Tu campaña de Hoenn comienza desde cero con progreso regional independiente.';bs.forEach((b,i)=>{const d=defs[i];if(!d)return;b.dataset.starter=d[0];const im=b.querySelector('img');if(im){im.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d[1]}.png`;im.alt=d[2];}const n=b.querySelector('b'),s=b.querySelector('small');if(n)n.textContent=d[2];if(s)s.textContent=d[3];});}
function ui(){document.title='PokéSenda';document.documentElement.dataset.pkBootRegion='hoenn';document.body?.classList.add('pk-hoenn-complete');document.getElementById('pkHoennCloneBadge')?.remove();const logo=document.querySelector('#mainMenu .menu-logo');if(logo)logo.textContent='PokéSenda';const sub=document.querySelector('#mainMenu .menu-sub');if(sub)sub.innerHTML='<b>HOENN · REGIÓN III</b> · Campaña completa';const info=$('menuSaveInfo');if(info&&info.textContent==='Partida nueva')info.textContent='Partida nueva · Hoenn';}
prepStarter();ui();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{prepStarter();ui();},{once:true});else setTimeout(()=>{prepStarter();ui();},0);
})();

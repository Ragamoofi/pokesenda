import { COUNTRIES } from './countries.mjs';
import { POSITIONS, ATTRS, getClub, getCountry, newCareer, currentDraft, rerollDraft, acceptDraft, academyOffers, signAcademy, advanceSeason, eventInfo, resolveEvent, chooseTransfer, simulateToRetirement, totals } from './engine.mjs';
const STORE='carrera-mundial-demo-v1';
const root=document.getElementById('app');
let state;
try{state=JSON.parse(localStorage.getItem(STORE)||'null');if(state?.version!==1)state=null;}catch{state=null;}
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const btn=(txt,action,extra='',secondary=false)=>`<button class="btn ${secondary?'secondary':''}" type="button" data-action="${action}" ${extra}>${txt}</button>`;
const nat=(c)=>`<span class="country-pill">${escapeHtml(c?.name||'')}</span>`;
const stat=(value,label)=>`<div class="stat"><strong>${escapeHtml(value)}</strong><span>${label}</span></div>`;
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){console.warn('Guardado local no disponible',e);}}
function apply(s){state=s;persist();render();}
function layout(title,sub,inner){
  const country=state&&getCountry(state.country);
  root.innerHTML=`<header class="top"><div class="brand"><span class="logo">⚽</span><span>CARRERA <b>MUNDIAL</b><small>PROTOTIPO DE INVESTIGACIÓN · v0.1</small></span></div><div class="right">${state?`<span class="hide-small">${escapeHtml(state.name)} · ${country.name}</span>${btn('Nueva carrera','reset','',true)}`:'49 países · 166 clubes reales de referencia'}</div></header>
  <main><section class="hero"><div class="eyebrow">SIMULADOR FUTBOLÍSTICO · SISTEMA POR TEMPORADAS</div><h1>${title}</h1><p>${sub}</p></section><div class="content">${inner}</div></main>
  <footer>Proyecto original en preparación. Nombres de clubes reales con fines identificativos; niveles y resultados son ficticios. No afiliado a Copero ni a los clubes.</footer>`;
}
function setup(){
  const countries=COUNTRIES.map(c=>`<option value="${c.code}" ${c.code==='CL'?'selected':''}>${escapeHtml(c.name)}</option>`).join('');
  const positions=POSITIONS.map(p=>`<option value="${p[0]}" ${p[0]==='DC'?'selected':''}>${p[0]} — ${p[1]}</option>`).join('');
  layout('Tu historia empieza con una camiseta','Creá tu futbolista, elegí país y posición. Los tres primeros clubes siempre pertenecen a tu país.',
  `<div class="split"><form id="setup" class="panel"><h2>1 · Identidad del jugador</h2><div class="formgrid"><label>Apellido o nombre<input name="name" value="Sariego" maxlength="30" required></label><label>Dorsal<input type="number" name="number" value="9" min="1" max="99" required></label><label>Nacionalidad<select name="country">${countries}</select></label><label>Posición<select name="position">${positions}</select></label><label>Pierna hábil<select name="foot"><option>Derecha</option><option>Izquierda</option></select></label><label>Draft<select name="mode"><option>Clásico</option><option>Purista</option></select></label></div><button type="submit" class="btn wide">Crear futbolista →</button></form><aside class="panel info"><h2>El recorrido</h2><div class="steps"><p><b>01</b> Armás ocho atributos con leyendas históricas.</p><p><b>02</b> Elegís entre tres clubes reales del país seleccionado.</p><p><b>03</b> Avanzás por temporadas con estadísticas y evolución.</p><p><b>04</b> Recibís decisiones y ofertas internacionales.</p><p><b>05</b> Terminás con un historial de toda la carrera.</p></div><p class="muted">Esta versión es una prueba técnica: no representa todavía todas las ligas, competiciones ni fórmulas de Copero.</p></aside></div>`);
}
function draft(){
 const d=currentDraft(state);const count=state.draftIndex+1;
 const attrs=ATTRS.map(([key,label])=>`<div class="attr"><small>${label}</small><b>${key in state.attributes?state.attributes[key]:'—'}</b></div>`).join('');
 layout('Construí tu perfil',`Ronda ${count} de 8 · ${state.mode}. Cada leyenda recomienda uno de los atributos pendientes.`,
 `<div class="panel"><div class="progress"><span style="width:${state.draftIndex/8*100}%"></span></div><p class="eyebrow">LEYENDA PROPUESTA</p><h2>${escapeHtml(d.legend)}</h2><p>Recomendación para <b>${d.label}</b>: <strong class="big">${d.hidden?'??':d.value}</strong></p><p class="muted">${d.hidden?'Purista: descubrirás el valor después de confirmarlo.':'Clásico: ves la cifra antes de aceptarla.'}</p><div class="actions">${btn('Confirmar atributo','draft-accept')}${btn(`Cambiar leyenda (${5-state.draftRerolls} disponibles)`,'draft-reroll',state.draftRerolls>=5?'disabled':'',true)}</div></div><div class="panel"><h2>Tu carta provisional</h2><div class="attrs">${attrs}</div></div>`);
}
function academy(){
 const offers=academyOffers(state), country=getCountry(state.country);
 layout('Primera oportunidad profesional',`Seleccionaste ${country.name}. Solo aparecen clubes de ese país para empezar tu carrera.`,
 `<div class="panel"><div class="grid3">${offers.map(c=>`<div class="offer"><span class="eyebrow">${escapeHtml(country.league)}</span><h2>${escapeHtml(c.name)}</h2><p>Nivel de desafío: <strong>${c.level}</strong></p><p class="muted">Tu media inicial: ${state.ovr} · Potencial: ${state.potential}</p>${btn('Firmar contrato','academy',`data-id="${c.id}"`)}</div>`).join('')}</div></div>`);
}
function dashboard(extra=''){
 const c=getClub(state.clubId),t=totals(state), seasons=[...state.history].reverse().slice(0,10);
 const timeline=seasons.map(x=>`<tr><td>${x.year}</td><td>${escapeHtml(x.club)}</td><td>${x.matches}</td><td>${x.goals}</td><td>${x.assists}</td><td>${x.ovrAfter}</td></tr>`).join('')||`<tr><td colspan="6">Aún no disputaste temporadas.</td></tr>`;
 return `<div class="playerpanel"><div><small>FICHA DEL FUTBOLISTA</small><h2>${escapeHtml(state.name)} <span class="jersey">#${state.number}</span></h2><p>${nat(getCountry(state.country))} ${state.position} · ${state.age} años · ${escapeHtml(c?.name)}</p></div><div class="ovr"><strong>${state.ovr}</strong><small>OVR</small></div></div><div class="statsgrid">${stat(t.matches,'Partidos')}${stat(t.goals,'Goles')}${stat(t.assists,'Asistencias')}${stat(t.international,'Selección')}${stat(state.trophies.length,'Títulos')}${stat(state.potential,'Potencial')}</div>${extra}<section class="panel"><h2>Historial de temporadas</h2><div class="tablewrap"><table><thead><tr><th>Año</th><th>Club</th><th>PJ</th><th>GLS</th><th>AST</th><th>OVR</th></tr></thead><tbody>${timeline}</tbody></table></div><p class="muted">La evolución, los goles y los títulos usan reglas originales del prototipo. No son resultados ni valoraciones oficiales.</p></section>`;
}
function season(){
 let latest='';const x=state.lastSeason;
 if(x){latest=`<section class="panel highlight"><h2>Última temporada · ${x.year}</h2><p><b>${escapeHtml(x.club)}</b> · ${x.role} · ${x.matches} PJ · ${x.goals} goles · ${x.assists} asistencias · OVR ${x.ovrBefore} → ${x.ovrAfter}</p><p>Posición liguera aproximada: ${x.leaguePosition}° · ${x.titles.length?x.titles.map(escapeHtml).join(', '):'Sin títulos'}${x.worldCupResult?' · Mundial: '+x.worldCupResult:''}</p></section>`;}
 layout('Tu carrera está en marcha','La temporada se simula automáticamente. Vos decidís cómo responder a los eventos y qué clubes aceptar.',dashboard(`${latest}<div class="panel"><h2>Próximo capítulo · ${2026+state.age-16}</h2><p>Club: <b>${escapeHtml(getClub(state.clubId).name)}</b>. Mirá cómo evoluciona tu jugador cuando avanzan los años.</p><div class="actions">${btn('Simular siguiente temporada →','season-next')}${btn('Simular hasta el retiro','retire-auto','',true)}</div></div>`));
}
function eventScreen(){
 const e=eventInfo(state);if(!e){apply({...state,phase:'season'});return;}
 layout('Una decisión cambia el camino','El resultado de tu temporada está guardado. Ahora decidís cómo actuar ante una situación de tu carrera.',dashboard(`<div class="panel event"><p class="eyebrow">DECISIÓN PERSONAL · ${2026+state.age-17}</p><h2>${e.title}</h2><p>${e.body}</p><div class="actions">${e.options.map((o,i)=>btn(escapeHtml(o[0]),'event',`data-option="${i}"`,i===1)).join('')}</div></div>`));
}
function transfers(){
 layout('Mercado de transferencias','Podís aceptar una propuesta o continuar en tu equipo. Un club más grande no garantiza que juguís más minutos.', dashboard(`<section class="panel"><h2>Propuestas para tu carrera</h2><div class="grid3">${state.offers.map(c=>`<div class="offer"><span class="eyebrow">${escapeHtml(c.country)} · ${escapeHtml(c.league)}</span><h3>${escapeHtml(c.name)}</h3><p>Nivel del club: <b>${c.level}</b></p>${btn('Aceptar oferta','transfer',`data-id="${c.id}"`)}</div>`).join('')}</div><div class="actions">${btn('Quedarme en mi club','transfer-stay','',true)}</div></section>`));
}
function retired(){const t=totals(state);const best=Math.max(...state.history.map(s=>s.ovrAfter),state.ovr);const countries=[...new Set(state.history.map(s=>s.country))];
 layout('Tu legado queda escrito',`Te retiraste a los ${state.age} años, después de ${state.history.length} temporadas.`,dashboard(`<section class="panel highlight"><h2>Resumen de tu carrera</h2><div class="statsgrid">${stat(t.matches,'Partidos')}${stat(t.goals,'Goles')}${stat(t.assists,'Asistencias')}${stat(best,'Máx. OVR')}${stat(state.trophies.length,'Copas y ligas')}${stat(countries.length,'Países')}</div><p>Recorriste ${countries.map(escapeHtml).join(', ')}.</p><div class="actions">${btn('Exportar partida JSON','export')}${btn('Nueva carrera','reset','',true)}</div></section>`));
}
function render(){if(!state)return setup();if(state.phase==='draft')return draft();if(state.phase==='academy')return academy();if(state.phase==='season')return season();if(state.phase==='event')return eventScreen();if(state.phase==='transfer')return transfers();if(state.phase==='retired')return retired();return setup();}
root.addEventListener('submit',e=>{if(e.target.id!=='setup')return;e.preventDefault();const data=Object.fromEntries(new FormData(e.target));try{apply(newCareer({...data,seed:`${Date.now()}-${Math.floor(Math.random()*1e7)}`}));}catch(ex){alert(ex.message);}});
root.addEventListener('click',e=>{
 const target=e.target.closest('button[data-action]');if(!target||target.disabled)return;
 const act=target.dataset.action;
 switch(act){
 case 'reset': if(!confirm('¿Crear una carrera nueva? Se reemplazará el guardado de esta demostración.'))return;state=null;localStorage.removeItem(STORE);render();break;
 case 'draft-accept':apply(acceptDraft(state));break;
 case 'draft-reroll':apply(rerollDraft(state));break;
 case 'academy':apply(signAcademy(state,target.dataset.id));break;
 case 'season-next':apply(advanceSeason(state));break;
 case 'event':apply(resolveEvent(state,Number(target.dataset.option)));break;
 case 'transfer':apply(chooseTransfer(state,target.dataset.id));break;
 case 'transfer-stay':apply(chooseTransfer(state));break;
 case 'retire-auto':if(confirm('¿Simular automáticamente las temporadas restantes? El simulador tomará decisiones por tu jugador.'))apply(simulateToRetirement(state));break;
 case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`carrera-${state.name.toLowerCase().replace(/[^a-z0-9]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);break;}
 }
});
render();
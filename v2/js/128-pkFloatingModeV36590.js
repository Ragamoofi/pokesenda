
(()=>{'use strict';
let floatWin=null,pulseTimer=null,uiTimer=null,driverRegion=null,fallbackMode=false,closing=false;
const fmt=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('es-CL');
function jRootVisible(){const r=document.getElementById('pkRegionRuntimeRoot');return !!r&&!r.classList.contains('hidden')}
function bridge(region){return region==='johto'?window.PokeSendaJohtoBattleIsolated:window.PokeSendaKantoGlobalBridge}
function snap(region){try{return bridge(region)?.floatingSnapshot?.()||null}catch(_){return null}}
function preferredRegion(){
 const j=snap('johto'),k=snap('kanto');
 if(j?.active&&jRootVisible())return'johto';
 if(k?.active)return'kanto';
 if(j?.active)return'johto';
 return jRootVisible()?'johto':'kanto';
}
function setDriver(region){
 if(driverRegion===region)return;
 if(driverRegion)try{bridge(driverRegion)?.floatingSetDriver?.(false)}catch(_){}
 driverRegion=region||null;
 if(driverRegion)try{bridge(driverRegion)?.floatingSetDriver?.(true)}catch(_){}
}
function syncDriver(){
 const region=preferredRegion(),s=snap(region);
 if(s?.active||s?.autoRestart)setDriver(region);else setDriver(null);
 return {region,s};
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function pipCSS(){return `
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#071321;color:#eef7ff;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
body{user-select:none}.wrap{height:100%;display:grid;grid-template-rows:auto auto 1fr auto;padding:10px 11px 9px;background:linear-gradient(145deg,#08182a,#0c2239 58%,#101d2d)}
.head{display:flex;align-items:center;gap:8px;min-width:0}.logo{font-size:13px;font-weight:1000;color:#ffcf48;letter-spacing:.4px}.region{font-size:9px;font-weight:900;padding:4px 7px;border:1px solid #39648a;border-radius:999px;color:#acd7ff;background:#0e2945}.live{margin-left:auto;font-size:9px;font-weight:900;color:#6ee29a;display:flex;align-items:center;gap:5px}.dot{width:7px;height:7px;border-radius:50%;background:#6ee29a;box-shadow:0 0 9px #6ee29a}.live.paused{color:#ffd76d}.live.paused .dot{background:#ffd76d;box-shadow:0 0 9px #ffd76d}.live.idle{color:#8095aa}.live.idle .dot{background:#607387;box-shadow:none}
.route{margin-top:7px;display:grid;grid-template-columns:1fr auto;gap:7px;align-items:end}.route b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.route small{display:block;margin-top:2px;font-size:8px;color:#8faec8}.distance{font-size:16px;font-weight:1000;color:#fff;text-align:right;font-variant-numeric:tabular-nums}.bar{height:5px;background:#07101c;border:1px solid #29465f;border-radius:999px;overflow:hidden;margin-top:6px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#3cb8ff,#6ee29a);width:0%}
.mid{display:grid;grid-template-columns:1fr 108px;gap:8px;margin-top:8px;min-height:0}.team{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mon{border:1px solid #294a65;border-radius:8px;background:#0a1b2c;padding:6px;min-width:0}.mon b{display:block;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mon small{font-size:7px;color:#8ca6bd}.hp{height:4px;background:#050c14;border-radius:999px;overflow:hidden;margin-top:5px}.hp i{display:block;height:100%;background:#66d98b}.hp.low i{background:#ef6b67}.stats{border:1px solid #294a65;border-radius:8px;background:#0a1b2c;padding:6px 8px;display:grid;grid-template-columns:1fr 1fr;gap:5px}.stat b{display:block;font-size:10px}.stat small{font-size:6.5px;color:#829bb2;text-transform:uppercase}
.controls{display:flex;gap:6px;align-items:center;margin-top:8px}.controls button{height:29px;border:1px solid #355e80;border-radius:8px;background:#102b47;color:#eaf6ff;font-weight:900;font-size:9px;cursor:pointer;padding:0 10px}.controls button:hover{background:#173a5d}.controls .speed{width:35px;padding:0}.controls .speed.active{background:#2e7a54;border-color:#62d894}.controls .pause{flex:1;background:#183c63}.controls .focus{background:#17283a}.controls .close{width:31px;padding:0;color:#ffb1ae;border-color:#724247;background:#321b24}
.notice{position:absolute;inset:0;background:rgba(5,13,23,.96);display:none;align-items:center;justify-content:center;text-align:center;padding:20px;z-index:10}.notice.show{display:flex}.notice b{font-size:14px;display:block}.notice span{font-size:9px;color:#9eb6ca;display:block;margin-top:7px;line-height:1.45}.notice button{margin-top:12px;height:32px;border-radius:8px;border:1px solid #4c7595;background:#153553;color:#fff;font-weight:900}
.compat{font-size:6.5px;color:#667f94;text-align:center;margin-top:4px}
`;}
function buildDoc(w){
 const d=w.document;d.open();d.write(`<!doctype html><html><head><meta charset="utf-8"><title>PokéSenda · Ventana flotante</title><style>${pipCSS()}</style>
<style id="pkHoennClonePhase2Styles">
#regionHoennCard.available{cursor:pointer;border-color:#4e9b8d;background:linear-gradient(155deg,#10312b,#13252a 58%,#17202a)}
#regionHoennCard.available:hover{transform:translateY(-2px);border-color:#76d1be;filter:brightness(1.07)}
#regionHoennCard.available .region-state-badge{background:#175e51;border-color:#53b6a3;color:#d8fff7}
#pkHoennCloneBadge{position:fixed;right:14px;bottom:14px;z-index:2147483000;width:min(300px,calc(100vw - 28px));padding:10px 11px;border-radius:12px;border:1px solid #4c9f91;background:rgba(8,31,29,.96);box-shadow:0 10px 34px #000a;color:#e8fff9;font-family:system-ui,sans-serif}
#pkHoennCloneBadge b{display:block;font-size:10px;letter-spacing:.45px;color:#8ee6d4}#pkHoennCloneBadge span{display:block;margin-top:3px;font-size:8px;color:#a9c8c2}#pkHoennCloneBadge button{margin-top:7px;width:100%;border:1px solid #558b82;border-radius:8px;background:#183c37;color:#effffb;padding:6px 8px;font-size:8px;font-weight:900;cursor:pointer}
html[data-pk-boot-region="hoenn"] #mainMenu .menu-box{border-color:#4e9b8d!important;box-shadow:0 28px 80px #0009,0 0 0 1px rgba(78,155,141,.18) inset!important}
html[data-pk-boot-region="hoenn"] #mainMenu .menu-sub b{color:#84dccb}
</style>

</head><body><div class="wrap">
 <div class="head"><span class="logo">◓ PokéSenda</span><span id="pkfRegion" class="region">Kanto</span><span id="pkfLive" class="live idle"><i class="dot"></i><span>ESPERANDO</span></span></div>
 <div><div class="route"><div><b id="pkfRoute">Sin expedición activa</b><small id="pkfSub">Inicia una expedición y déjala trabajando aquí.</small></div><div id="pkfDistance" class="distance">0 m</div></div><div class="bar"><i id="pkfProgress"></i></div></div>
 <div class="mid"><div id="pkfTeam" class="team"></div><div class="stats"><div class="stat"><b id="pkfMoney">₽0</b><small>Dinero</small></div><div class="stat"><b id="pkfRound">0</b><small>Oleada</small></div><div class="stat"><b id="pkfEnemies">0</b><small>Rivales</small></div><div class="stat"><b id="pkfSpeedStat">×1</b><small>Velocidad</small></div></div></div>
 <div><div class="controls"><button class="speed" data-pkf-speed="1">×1</button><button class="speed" data-pkf-speed="2">×2</button><button class="speed" data-pkf-speed="4">×4</button><button id="pkfPause" class="pause">⏸ Pausar</button><button id="pkfFocus" class="focus">↗ Juego</button><button id="pkfClose" class="close">×</button></div><div id="pkfCompat" class="compat"></div></div>
 <div id="pkfNotice" class="notice"><div><b id="pkfNoticeTitle">PokéSenda necesita atención</b><span id="pkfNoticeText"></span><button id="pkfNoticeFocus">Volver al juego</button></div></div>
 </div>
<style id="pkJohtoOfficialBadgeFallbackDetails">
#pkRegionRuntimeRoot .gym-badge-fallback{font-style:normal;line-height:1}
</style>

<style id="pkJohtoOfficialBadgeSpritesV36643">
#pkRegionRuntimeRoot .gym-badge-mini img,
#pkRegionRuntimeRoot .profile-badge-medal img,
#pkRegionRuntimeRoot .gym-result-badge img,
#pkRegionRuntimeRoot .pk-public-badge img{
  image-rendering:pixelated!important;
  image-rendering:crisp-edges!important;
  object-fit:contain!important;
}
#pkRegionRuntimeRoot .gym-badge-mini img{width:32px!important;height:32px!important;}
#pkRegionRuntimeRoot .profile-badge-medal img{width:44px!important;height:44px!important;}
#pkRegionRuntimeRoot .gym-result-badge img{width:68px!important;height:68px!important;}
</style>


<style id="pkJohtoRegionalIdentityV36644FinalChrome">
/* V36.64.5 · Cierre de identidad Johto.
   Solo cambia chrome/superficies neutrales del runtime regional. Colores semánticos
   (tipos, rarezas, PS, estados, Shiny, peligro) permanecen intactos. */
#pkRegionRuntimeRoot{
  --j44-bg:#111813;--j44-panel:#1b251d;--j44-panel2:#222d22;
  --j44-olive:#56623a;--j44-olive2:#39462f;--j44-gold:#d8b35a;
  --j44-gold-hi:#f0d58a;--j44-line:#6f6847;--j44-muted:#b9bdad;
}
#pkRegionRuntimeRoot .overlay{
  background:radial-gradient(circle at 50% 24%,rgba(51,63,42,.96),rgba(8,13,10,.975) 62%)!important;
}
#pkRegionRuntimeRoot .game{border-color:#756b43!important;box-shadow:0 25px 80px rgba(0,0,0,.48),0 0 0 1px rgba(216,179,90,.08) inset!important}
#pkRegionRuntimeRoot .top{background:linear-gradient(180deg,#20291f,#171f19)!important;border-bottom-color:#726743!important}
#pkRegionRuntimeRoot .right{background:linear-gradient(180deg,#19231b,#141c17)!important}
#pkRegionRuntimeRoot .route-select{background:#182219!important;border-color:#686248!important;color:#f0ead5!important}
#pkRegionRuntimeRoot .route-select:focus{border-color:#c49e50!important;box-shadow:0 0 0 2px rgba(216,179,90,.12)!important}

/* Ventanas que no usan .modal-box y antes podían conservar azul Kanto. */
#pkRegionRuntimeRoot .summary-box,
#pkRegionRuntimeRoot .reward-box,
#pkRegionRuntimeRoot .evo-card,
#pkRegionRuntimeRoot .center-card,
#pkRegionRuntimeRoot .loot-panel,
#pkRegionRuntimeRoot .info-panel,
#pkRegionRuntimeRoot .patch-notes-modal,
#pkRegionRuntimeRoot .pokemon-detail-modal,
#pkRegionRuntimeRoot .enemy-detail-modal,
#pkRegionRuntimeRoot .dex-lore-modal,
#pkRegionRuntimeRoot .tree-modal,
#pkRegionRuntimeRoot .achievement-modal,
#pkRegionRuntimeRoot .achievement-tm-modal,
#pkRegionRuntimeRoot .incense-vendor-box,
#pkRegionRuntimeRoot .route-event-box{
  background:linear-gradient(180deg,#1d281f,#141d17)!important;
  border-color:#746b46!important;
  box-shadow:0 28px 90px rgba(0,0,0,.6),0 0 0 1px rgba(216,179,90,.055) inset!important;
}
#pkRegionRuntimeRoot .summary-box h2,
#pkRegionRuntimeRoot .modal-box h2,
#pkRegionRuntimeRoot .info-panel-head b,
#pkRegionRuntimeRoot .loot-panel-head b,
#pkRegionRuntimeRoot .patch-notes-head h2{color:#f2ead2!important}
#pkRegionRuntimeRoot .section-title{color:#c7bd91!important}

/* Cabeceras / toolbars pegajosos y superficies de navegación. */
#pkRegionRuntimeRoot .info-panel-head,
#pkRegionRuntimeRoot .help-search-wrap,
#pkRegionRuntimeRoot .help-v3315 .help-tabs,
#pkRegionRuntimeRoot .patch-notes-head{
  background:rgba(22,31,24,.988)!important;
  border-color:#5d5c40!important;
}
#pkRegionRuntimeRoot .loot-panel-head{
  background:linear-gradient(90deg,#4b5732,#293126 58%,#463a24)!important;
  border-bottom:1px solid #8a7542!important;
}

/* Botones de navegación que tenían skins particulares azules/marrones de Kanto. */
#pkRegionRuntimeRoot .top-nav .btn,
#pkRegionRuntimeRoot .pokedex-btn,
#pkRegionRuntimeRoot .loot-btn,
#pkRegionRuntimeRoot .achievement-btn,
#pkRegionRuntimeRoot .tree-btn,
#pkRegionRuntimeRoot .gym-hud-btn,
#pkRegionRuntimeRoot .icon-only-btn:not(.danger){
  background:linear-gradient(180deg,#3b4931,#273329)!important;
  border-color:#6e704e!important;
  color:#f0efe3!important;
}
#pkRegionRuntimeRoot .top-nav .btn:hover,
#pkRegionRuntimeRoot .pokedex-btn:hover,
#pkRegionRuntimeRoot .loot-btn:hover,
#pkRegionRuntimeRoot .achievement-btn:hover,
#pkRegionRuntimeRoot .tree-btn:hover,
#pkRegionRuntimeRoot .gym-hud-btn:hover{filter:brightness(1.13)!important}

/* Resultados/resúmenes/listados neutrales. */
#pkRegionRuntimeRoot .metric,
#pkRegionRuntimeRoot .drop-metric,
#pkRegionRuntimeRoot .infinite-record-metric,
#pkRegionRuntimeRoot .run-stat-row:not(.header),
#pkRegionRuntimeRoot .item-run-row:not(.header),
#pkRegionRuntimeRoot .achievement-metric,
#pkRegionRuntimeRoot .help-now-card,
#pkRegionRuntimeRoot .help-faq,
#pkRegionRuntimeRoot .help-search-results,
#pkRegionRuntimeRoot .help-search-hit,
#pkRegionRuntimeRoot .tm-loadout-summary,
#pkRegionRuntimeRoot .tm-rarity-rule{
  background:#172019!important;
  border-color:#555c43!important;
}
#pkRegionRuntimeRoot .run-stat-row.header,
#pkRegionRuntimeRoot .item-run-row.header,
#pkRegionRuntimeRoot .item-run-title,
#pkRegionRuntimeRoot .run-summary-title{
  background:#20291f!important;
  border-color:#5a5b40!important;
  color:#d8cfaa!important;
}

/* Panel de menú Johto: la imagen de fondo se reemplazará en la tanda de arte,
   pero el cuadro y la capa de lectura ya quedan regionalizados. */
#pkRegionRuntimeRoot #mainMenu .menu-box{
  background:linear-gradient(180deg,rgba(28,38,30,.965),rgba(18,25,20,.975))!important;
  border-color:#7b7047!important;
  box-shadow:0 35px 100px rgba(0,0,0,.6),0 0 0 1px rgba(216,179,90,.07) inset!important;
}
#pkRegionRuntimeRoot #mainMenu::after{
  background:radial-gradient(circle at 50% 46%,rgba(76,86,49,.04) 0 28%,rgba(18,29,20,.22) 70%,rgba(7,12,9,.52) 100%)!important;
}
#pkRegionRuntimeRoot .menu-patch-card,
#pkRegionRuntimeRoot .menu-timed-gacha{background:linear-gradient(135deg,#1e2a20,#191f1a)!important;border-color:#5e6246!important}

/* Barras/scroll neutrales: elimina el último brillo azul sin tocar XP/PS/tipos. */
#pkRegionRuntimeRoot .loot-panel,
#pkRegionRuntimeRoot .info-panel,
#pkRegionRuntimeRoot .modal-box,
#pkRegionRuntimeRoot .summary-box{scrollbar-color:#77734d #141c17!important}
#pkRegionRuntimeRoot .formation-search-count,
#pkRegionRuntimeRoot .tree-zoom-label{background:#1c251e!important;border-color:#595e45!important;color:#d5d5c7!important}

/* Campamento: defensa visual adicional. Una run activa elimina pk-lobby-mode por JS;
   si un observer tardío intenta mostrar nodos de lobby, quedan ocultos fuera del modo lobby. */
#pkRegionRuntimeRoot #field:not(.pk-lobby-mode) #pkLobbyBanner,
#pkRegionRuntimeRoot #field:not(.pk-lobby-mode) #pkLobbyAmbient,
#pkRegionRuntimeRoot #field:not(.pk-lobby-mode) #pkLobbySpeech,
#pkRegionRuntimeRoot #field:not(.pk-lobby-mode) #pkLobbyReturnToast,
#pkRegionRuntimeRoot #field:not(.pk-lobby-mode) #pkLobbyEasterEgg{display:none!important}
</style>






<!-- POKÉSENDA · INFINITA GLOBAL RC 2026-09-11
Enfoque: Kanto Infinite como plantilla visual/funcional.
Extensiones: roster Kanto+Johto + Caja Global.
Verificado en navegador aislado con roster mixto: HP bars, back sprites + orientación Kanto,
daño flotante pk-dmg, Formación 6 slots, pausa/reordenamiento y combate mixto.
-->

<style id="pkGlobalInfiniteNativeVisualV3666">
/* Expedición Infinita Global: MISMA estructura visual que la base Kanto/Johto. */
#pkGlobalInfiniteRoot{
  padding:18px!important;
  align-items:center!important;
  overflow:auto!important;
  background:var(--bg)!important;
}
#pkGlobalInfiniteRoot>.game{
  width:min(1500px,100%)!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  min-height:0!important;
  display:block!important;
  border-radius:18px!important;
}
#pkGlobalInfiniteRoot .main{
  display:grid!important;
  grid-template-columns:minmax(0,1.82fr) minmax(380px,.78fr)!important;
  min-height:690px!important;
}
#pkGlobalInfiniteRoot .field{
  height:auto!important;
  min-height:690px!important;
  border-right:1px solid var(--line)!important;
  border-bottom:0!important;
}
#pkGlobalInfiniteRoot .right{
  height:auto!important;
  max-height:690px!important;
  padding:12px!important;
  overflow:auto!important;
}
/* El prototipo global antiguo forzaba scaleX(-1) y hacía mirar al equipo a la izquierda.
   Ahora el sprite usa la orientación NATIVA (back/front) y solo se escala, igual que las regiones. */
#pkGlobalInfiniteRoot #teamLine .mon img,
#pkGlobalInfiniteRoot #enemyTeamLine .enemy img{
  transform:var(--pk-global-battle-transform,scale(1))!important;
  transform-origin:50% 100%!important;
}
/* HUD clásico: nombre + PS + nivel + tipos en una sola placa sobre cada Pokémon. */
#pkGlobalInfiniteRoot .pk-hud{z-index:14!important}
#pkGlobalInfiniteRoot .pk-hud .battle-hp{position:static!important;display:block!important;visibility:visible!important;opacity:1!important}
#pkGlobalInfiniteRoot .pk-hud .posbadge,
#pkGlobalInfiniteRoot .pk-hud .levelbadge{position:static!important}
#pkGlobalInfiniteRoot .pk-hud .types{display:flex!important;gap:3px!important;justify-content:center!important;margin-top:0!important}
#pkGlobalInfiniteRoot .pk-hud .types .pk-type{display:inline-flex!important}
#pkGlobalInfiniteRoot #teamLine .field-stars{margin-top:3px}
@media(max-width:980px){
  #pkGlobalInfiniteRoot{padding:0!important;align-items:flex-start!important;}
  #pkGlobalInfiniteRoot>.game{border-radius:0!important;width:100%!important;}
  #pkGlobalInfiniteRoot .main{grid-template-columns:1fr!important;min-height:0!important;}
  #pkGlobalInfiniteRoot .field{min-height:520px!important;border-right:0!important;border-bottom:1px solid var(--line)!important;}
  #pkGlobalInfiniteRoot .right{max-height:none!important;height:auto!important;}
}
</style>












</body></html>`);d.close();
 d.querySelectorAll('[data-pkf-speed]').forEach(b=>b.onclick=()=>setSpeed(Number(b.dataset.pkfSpeed)));
 d.getElementById('pkfPause').onclick=togglePause;
 d.getElementById('pkfFocus').onclick=focusGame;
 d.getElementById('pkfClose').onclick=closeFloating;
 d.getElementById('pkfNoticeFocus').onclick=focusGame;
}
function focusGame(){try{window.focus()}catch(_){}}
function setSpeed(s){const r=preferredRegion(),b=bridge(r);if(r==='kanto')b?.floatingSetSpeed?.(s);else b?.setSpeed?.(s);updateUI()}
function togglePause(){const r=preferredRegion(),b=bridge(r);if(r==='kanto')b?.floatingTogglePause?.();else b?.togglePause?.();updateUI()}
function pulse(){
 if(!floatWin||floatWin.closed)return closeFloating();
 const {region,s}=syncDriver();
 if(region==='johto')try{window.PokeSendaJohtoRuntime?.floatingUiPulse?.()}catch(_){}
 if(s?.active||s?.autoRestart)try{bridge(region)?.floatingPulse?.()}catch(_){}
}
function giftState(){
 const o=document.getElementById('pkDevGiftModal');if(!o||o.classList.contains('hidden'))return null;
 return {amount:document.getElementById('pkDevGiftAmount')?.textContent||'',region:document.getElementById('pkDevGiftRegion')?.textContent||'',message:document.getElementById('pkDevGiftMessageText')?.textContent||''};
}
function updateUI(){
 if(!floatWin||floatWin.closed)return;
 const d=floatWin.document,{region,s}=syncDriver();if(!d||!s)return;
 const live=d.getElementById('pkfLive'),status=!s.active?'ESPERANDO':s.paused?'PAUSADA':'FARMEANDO';live.className='live '+(!s.active?'idle':s.paused?'paused':'');live.querySelector('span').textContent=status;
 d.getElementById('pkfRegion').textContent=s.regionName||region;
 d.getElementById('pkfRoute').textContent=s.route||'Expedición';
 d.getElementById('pkfSub').textContent=!s.active?'Inicia una expedición en la ventana principal.':s.blocked?'Hay una decisión o recompensa pendiente.':s.infinite?'Modo Infinita · sin límite de distancia':`${s.enemies} rival${s.enemies===1?'':'es'} activo${s.enemies===1?'':'s'}`;
 d.getElementById('pkfDistance').textContent=s.infinite?`${fmt(s.distance)} m`:`${fmt(s.distance)} m`;
 d.getElementById('pkfProgress').style.width=s.maxDistance?`${Math.max(0,Math.min(100,s.distance/s.maxDistance*100))}%`:'100%';
 d.getElementById('pkfMoney').textContent=`₽${fmt(s.money)}`;d.getElementById('pkfRound').textContent=fmt(s.round);d.getElementById('pkfEnemies').textContent=fmt(s.enemies);d.getElementById('pkfSpeedStat').textContent=`×${s.speed||1}`;
 d.getElementById('pkfTeam').innerHTML=(s.team?.length?s.team:[{name:'—',hp:0,maxHp:1},{name:'—',hp:0,maxHp:1},{name:'—',hp:0,maxHp:1}]).slice(0,3).map(m=>{const pct=Math.max(0,Math.min(100,Number(m.hp||0)/Math.max(1,Number(m.maxHp||1))*100));return `<div class="mon"><b>${escapeHtml(m.name)}</b><small>${m.alive===false?'Debilitado':`${Math.ceil(m.hp||0)} / ${Math.ceil(m.maxHp||1)} PS`}</small><div class="hp ${pct<30?'low':''}"><i style="width:${pct}%"></i></div></div>`}).join('');
 d.querySelectorAll('[data-pkf-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.pkfSpeed)===Number(s.speed||1)));
 const p=d.getElementById('pkfPause');p.disabled=!s.active||!!s.blocked;p.textContent=s.paused?'▶ Continuar':'⏸ Pausar';
 const g=giftState(),n=d.getElementById('pkfNotice');
 if(g){n.classList.add('show');d.getElementById('pkfNoticeTitle').textContent=`🎁 REGALITO RECIBIDO · ${g.amount}`;d.getElementById('pkfNoticeText').textContent=[g.region,g.message].filter(Boolean).join(' · ');}
 else if(s.active&&s.blocked){n.classList.add('show');d.getElementById('pkfNoticeTitle').textContent='PokéSenda necesita atención';d.getElementById('pkfNoticeText').textContent='Hay una recompensa, Centro Pokémon, evento o decisión pendiente. Vuelve un momento al juego para continuar.'}
 else n.classList.remove('show');
 d.getElementById('pkfCompat').textContent=fallbackMode?'Modo compatibilidad · mantén esta ventana abierta':'Ventana siempre visible · el combate se ejecuta desde aquí';
}
function markButtons(active){document.querySelectorAll('.pk-floating-mode-btn').forEach(b=>b.classList.toggle('pk-floating-active',!!active))}
async function openFloating(){
 if(floatWin&&!floatWin.closed){try{floatWin.focus()}catch(_){}return}
 fallbackMode=false;closing=false;
 try{
  if('documentPictureInPicture'in window&&window.documentPictureInPicture?.requestWindow){
   if(document.fullscreenElement)try{await document.exitFullscreen()}catch(_){}
   floatWin=await window.documentPictureInPicture.requestWindow({width:470,height:235});
  }else{
   fallbackMode=true;floatWin=window.open('','pokesenda_floating','popup=yes,width=470,height=260,resizable=yes,scrollbars=no');
   if(!floatWin)throw new Error('popup_blocked');
  }
 }catch(e){
  try{if(typeof window.toast==='function')window.toast('No se pudo abrir la ventana flotante. Permite ventanas emergentes para PokéSenda.')}catch(_){}
  floatWin=null;return;
 }
 buildDoc(floatWin);markButtons(true);syncDriver();updateUI();
 pulseTimer=floatWin.setInterval(pulse,100);uiTimer=floatWin.setInterval(updateUI,300);
 try{floatWin.addEventListener('pagehide',closeFloating,{once:true});floatWin.addEventListener('unload',closeFloating,{once:true})}catch(_){}
}
function closeFloating(){
 if(closing)return;closing=true;
 if(pulseTimer&&floatWin)try{floatWin.clearInterval(pulseTimer)}catch(_){}
 if(uiTimer&&floatWin)try{floatWin.clearInterval(uiTimer)}catch(_){}
 pulseTimer=uiTimer=null;setDriver(null);markButtons(false);
 const w=floatWin;floatWin=null;
 try{if(w&&!w.closed)w.close()}catch(_){}
 setTimeout(()=>{closing=false},50);
}
function installButton(host){
 if(!host||host.querySelector(':scope > .pk-floating-mode-btn'))return;
 const b=document.createElement('button');b.type='button';b.className='btn pk-floating-mode-btn';b.title='Ventana flotante · ver PokéSenda mientras haces otra cosa';b.setAttribute('aria-label','Abrir modo ventana flotante');b.textContent='▣';b.onclick=e=>{e.stopPropagation();openFloating()};host.appendChild(b);
}
function installButtons(){
 const kantoField=[...document.querySelectorAll('.game #field')].find(f=>!f.closest('#pkRegionRuntimeRoot'))||document.querySelector('#field');
 const johtoField=document.querySelector('#pkRegionRuntimeRoot #field');
 installButton(kantoField);
 installButton(johtoField);
}
function boot(){installButtons();setInterval(installButtons,1400);window.addEventListener('beforeunload',closeFloating)}
window.PokeSendaFloatingMode={open:openFloating,close:closeFloating,pulse,update:updateUI,isOpen:()=>!!floatWin&&!floatWin.closed};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

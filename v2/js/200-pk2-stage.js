/* =====================================================================
   PokéSenda V2 · Motor de escena
   - Escenario pixel-art procedural con parallax por bioma.
   - Ciclo día/noche según la hora local y clima visible.
   - Efectos de ataque por tipo (proyectiles, rayos, tajos, explosiones).
   Todo el arte se genera en código: sin imágenes externas.
   API pública: window.PK2Stage
   ===================================================================== */
(() => {
  'use strict';

  // ---------- utilidades ----------
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function rng(seed) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(c1, c2, t) { const a = hex(c1), b = hex(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); }
  function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }
  const reduceMotion = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } })();

  // Ruido periódico (tilea perfecto en el ancho w).
  function periodic(r, w, terms) {
    const ks = []; for (let i = 0; i < terms; i++) ks.push({ k: 1 + Math.floor(r() * (3 + i * 3)), a: 1 / (1 + i * 1.6), p: r() * TAU });
    const norm = ks.reduce((s, x) => s + x.a, 0);
    return x => ks.reduce((s, q) => s + q.a * Math.sin(TAU * q.k * x / w + q.p), 0) / norm;
  }

  // ---------- biomas ----------
  // sky: [arriba, abajo] de día. Las capas se dibujan de lejos a cerca.
  const BIOMES = {
    forest: { name: 'Pradera', sky: ['#5fb4f0', '#c9ecff'], sun: true, ground: '#5aa44a', groundDark: '#3f7f37', path: '#c9a46a', pathDark: '#a5834f',
      layers: [
        { kind: 'ridge', y: .50, amp: .14, color: '#8fb6d6', speed: .06, terms: 4 },
        { kind: 'ridge', y: .58, amp: .10, color: '#6f9fb9', speed: .10, terms: 5, snow: '#e9f4ff' },
        { kind: 'hills', y: .66, amp: .06, color: '#5d9a52', speed: .18 },
        { kind: 'trees', y: .70, color: '#2f6b3a', color2: '#3d8547', speed: .30, density: .55, style: 'mixed' },
        { kind: 'trees', y: .76, color: '#255a30', color2: '#2f7039', speed: .45, density: .35, style: 'round' }
      ], fore: 'grass', ambient: 'fireflies' },
    cave: { name: 'Cueva', sky: ['#14121c', '#2b2533'], indoor: true, ground: '#5b5048', groundDark: '#433a34', path: '#7a6c5f', pathDark: '#62564b',
      layers: [
        { kind: 'ceiling', color: '#1d1922', speed: .08 },
        { kind: 'ridge', y: .52, amp: .16, color: '#2e2834', speed: .10, terms: 6, crystals: ['#7fe0ff', '#c58cff'] },
        { kind: 'stalag', y: .70, color: '#3b3340', speed: .26 },
        { kind: 'torches', y: .62, speed: .26 },
        { kind: 'rocks', y: .78, color: '#4a4048', speed: .45 }
      ], fore: 'pebbles', ambient: 'dust' },
    coast: { name: 'Costa', sky: ['#4aa8ee', '#d4f1ff'], sun: true, ground: '#e6cf94', groundDark: '#cdb377', path: '#f0dca8', pathDark: '#d8c08a',
      layers: [
        { kind: 'sea', y: .58, color: '#2a86c9', color2: '#5cc0f0', speed: .04 },
        { kind: 'islands', y: .58, color: '#4f8fa8', speed: .07 },
        { kind: 'palms', y: .74, color: '#2f6e3f', trunk: '#8a6a43', speed: .38 },
        { kind: 'dunes', y: .76, amp: .03, color: '#ddc387', speed: .5 }
      ], fore: 'shells', ambient: 'sparkleSea' },
    jungle: { name: 'Selva', sky: ['#69c6b4', '#d9f6e6'], sun: true, ground: '#3f8f4a', groundDark: '#2e6d38', path: '#9a7a4e', pathDark: '#7c623d',
      layers: [
        { kind: 'ridge', y: .48, amp: .16, color: '#7fb8a8', speed: .06, terms: 4 },
        { kind: 'trees', y: .64, color: '#2e7a54', color2: '#3d9363', speed: .16, density: .9, style: 'tall' },
        { kind: 'vines', y: .0, color: '#1f5a3a', speed: .32 },
        { kind: 'trees', y: .74, color: '#1d5136', color2: '#2a6b45', speed: .42, density: .6, style: 'round' }
      ], fore: 'ferns', ambient: 'mist' },
    volcano: { name: 'Volcán', sky: ['#3a1a26', '#c7543a'], ashClouds: true, ground: '#4b3532', groundDark: '#36231f', path: '#6b4a3c', pathDark: '#55392d',
      layers: [
        { kind: 'volcano', y: .62, color: '#2a1720', speed: .05 },
        { kind: 'ridge', y: .60, amp: .10, color: '#3d2228', speed: .12, terms: 5 },
        { kind: 'lava', y: .72, speed: .25 },
        { kind: 'rocks', y: .78, color: '#2b1c1c', speed: .45 }
      ], fore: 'ash', ambient: 'embers' },
    islands: { name: 'Archipiélago', sky: ['#3f8fe0', '#bfe6ff'], sun: true, ground: '#7fc46a', groundDark: '#5ea04f', path: '#e3d4a2', pathDark: '#c9b984',
      layers: [
        { kind: 'cloudsea', y: .62, speed: .05 },
        { kind: 'floating', y: .40, speed: .09 },
        { kind: 'trees', y: .74, color: '#3a8a4a', color2: '#4ca35c', speed: .38, density: .3, style: 'round' }
      ], fore: 'grass', ambient: 'petals' },
    cosmos: { name: 'Infinita', sky: ['#07061a', '#2a1650'], indoor: true, stars: true, ground: '#2a2546', groundDark: '#1c1834', path: '#463d70', pathDark: '#362f58',
      layers: [
        { kind: 'nebula', speed: .03 },
        { kind: 'ruins', y: .66, color: '#3a3366', glow: '#9a7bff', speed: .14 },
        { kind: 'ruins', y: .76, color: '#2a2450', glow: '#5fd0ff', speed: .32, small: true }
      ], fore: 'runes', ambient: 'motes' }
  };

  // Fondos pintados (Canva). Si existe, sustituye al escenario procedural del bioma.
  const PAINTED = { forest: 'img/bg-forest.jpg', cave: 'img/bg-cave.jpg', coast: 'img/bg-coast.jpg', jungle: 'img/bg-jungle.jpg', volcano: 'img/bg-volcano.jpg', islands: 'img/bg-islands.jpg', cosmos: 'img/bg-cosmos.jpg' };
  const IMGS = {};
  function paintedImg(biome) {
    const src = PAINTED[biome]; if (!src) return null;
    let im = IMGS[biome]; if (!im) { im = IMGS[biome] = new Image(); im.decoding = 'async'; im.src = src; im.onload = () => { S.dirty = true; resize(); }; }
    return im.complete && im.naturalWidth ? im : null;
  }
  const isPainted = () => !!paintedImg(S.biome);

  const WEATHER_FX = {
    clear: null, sun: { rays: true, tint: '#ffcf6a', tintA: .10 }, rain: { rain: true, tint: '#2b3d5c', tintA: .28, lightning: true },
    sand: { sand: true, tint: '#c79a52', tintA: .22 }, snow: { snow: true, tint: '#cfe3ff', tintA: .16 }, fog: { fog: true, tint: '#9aa6b8', tintA: .20 },
    wind: { leaves: true }, aura: { sparkle: true, tint: '#f6a6e8', tintA: .10 }
  };

  // ---------- estado ----------
  const S = {
    field: null, bg: null, bctx: null, fx: null, fctx: null, W: 320, H: 180, FW: 0, FH: 0, dpr: 1,
    biome: 'forest', weather: 'clear', active: false, scroll: 0, scrollTarget: 0, layers: [], t: 0, last: 0,
    parts: [], bgParts: [], shots: [], flashes: [], shake: 0, lightning: 0, raf: 0, dirty: true, seed: 1, enabled: true
  };

  // ---------- generación de capas (strips que tilean) ----------
  function strip(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
  function col(x, ctx, X, Y, h, color) { ctx.fillStyle = color; ctx.fillRect(X, Y, 1, h); }
  function spanCircle(ctx, cx, cy, r, color, w) {
    ctx.fillStyle = color;
    for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); for (const off of [0, -w, w]) ctx.fillRect(Math.round(cx - dx + off), Math.round(cy + dy), dx * 2 + 1, 1); }
  }
  function rectW(ctx, x, y, w, h, color, W) { ctx.fillStyle = color; for (const off of [0, -W, W]) ctx.fillRect(Math.round(x + off), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }

  function buildLayer(def, i) {
    const W = S.W, H = S.H, r = rng(S.seed * 97 + i * 131 + 7);
    const [c, x] = strip(W, H);
    const y0 = (def.y || 0) * H, lights = [];
    switch (def.kind) {
      case 'ridge': {
        const n = periodic(r, W, def.terms || 4), amp = def.amp * H;
        for (let X = 0; X < W; X++) {
          const top = Math.round(y0 - (n(X) * .5 + .5) * amp);
          col(X, x, X, top, H - top, def.color);
          if (def.snow && top < y0 - amp * .72) col(X, x, X, top, Math.round((y0 - amp * .72) - top), def.snow);
          if (def.crystals && r() < .035) {
            const cc = def.crystals[Math.floor(r() * def.crystals.length)], cy = top + 6 + r() * 16, hh = 4 + Math.floor(r() * 4);
            for (let row = 0; row < hh; row++) { const w = row < hh / 2 ? 1 + row : hh - row; rectW(x, X - w / 2 + .5, cy - hh + row, w, 1, row < 2 ? mix(cc, '#ffffff', .5) : cc, W); }
            rectW(x, X + 2, cy - 3, 1, 3, cc, W);
            lights.push({ x: X, y: cy - hh / 2, c: cc });
          }
        }
        break;
      }
      case 'hills': {
        const n = periodic(r, W, 3), amp = def.amp * H;
        for (let X = 0; X < W; X++) { const top = Math.round(y0 - (n(X) * .5 + .5) * amp); col(X, x, X, top, H - top, def.color); if ((X + top) % 7 === 0) col(X, x, X, top, 1, mix(def.color, '#ffffff', .25)); }
        break;
      }
      case 'dunes': {
        const n = periodic(r, W, 3), amp = def.amp * H;
        for (let X = 0; X < W; X++) { const top = Math.round(y0 - (n(X) * .5 + .5) * amp); col(X, x, X, top, H - top, def.color); col(X, x, X, top, 1, mix(def.color, '#ffffff', .35)); }
        break;
      }
      case 'trees': {
        const count = Math.round(W / 14 * def.density) + 4;
        for (let k = 0; k < count; k++) {
          const tx = r() * W, size = 6 + r() * 10, base = y0 + r() * 6, style = def.style === 'mixed' ? (r() < .5 ? 'pine' : 'round') : def.style;
          const c1 = r() < .5 ? def.color : def.color2;
          if (style === 'pine') { for (let row = 0; row < size * 2; row++) { const w = Math.max(1, (row / (size * 2)) * size * 1.1); rectW(x, tx - w / 2, base - size * 2 + row, w, 1, c1, W); } rectW(x, tx - 1, base, 2, 4, '#4a3323', W); }
          else if (style === 'tall') { rectW(x, tx - 1, base - size * 2.2, 2, size * 2.2 + 4, '#3f3022', W); spanCircle(x, tx, base - size * 2.2, size * .9, c1, W); spanCircle(x, tx - size * .6, base - size * 1.7, size * .6, def.color, W); }
          else { rectW(x, tx - 1, base - 2, 2, 6, '#4a3323', W); spanCircle(x, tx, base - size * .9, size * .8, c1, W); spanCircle(x, tx + size * .4, base - size * .6, size * .55, def.color, W); }
        }
        // relleno del suelo de la capa
        rectW(x, 0, y0 + 4, W, H - y0, def.color, 0);
        break;
      }
      case 'ceiling': {
        const n = periodic(r, W, 5);
        for (let X = 0; X < W; X++) { const h = Math.round(H * (.14 + (n(X) * .5 + .5) * .12)); col(X, x, X, 0, h, def.color); if (r() < .12) col(X, x, X, h, 2 + Math.floor(r() * 8), def.color); }
        break;
      }
      case 'stalag': {
        for (let k = 0; k < W / 18; k++) { const tx = r() * W, h = 10 + r() * 26, w = 4 + r() * 7; for (let row = 0; row < h; row++) rectW(x, tx - (w * (1 - row / h)) / 2, y0 - row, w * (1 - row / h), 1, def.color, W); }
        rectW(x, 0, y0, W, H - y0, def.color, 0);
        break;
      }
      case 'rocks': {
        for (let k = 0; k < W / 22; k++) { const tx = r() * W, rr = 2 + r() * 5; spanCircle(x, tx, y0 + r() * 6, rr, def.color, W); spanCircle(x, tx - rr * .3, y0 + r() * 6 - rr * .4, Math.max(1, rr * .4), mix(def.color, '#ffffff', .15), W); }
        break;
      }
      case 'islands': {
        for (let k = 0; k < 3; k++) { const tx = r() * W, w = 20 + r() * 40, h = 4 + r() * 8; for (let row = 0; row < h; row++) rectW(x, tx - w / 2 * (1 - row / h * .7), y0 - row, w * (1 - row / h * .7), 1, def.color, W); }
        break;
      }
      case 'palms': {
        for (let k = 0; k < W / 60; k++) {
          const tx = r() * W, h = 22 + r() * 16, lean = (r() - .5) * 10, base = y0 + 2;
          for (let row = 0; row < h; row++) rectW(x, tx + lean * (row / h), base - row, 2, 1, def.trunk, W);
          const top = base - h, cx = tx + lean;
          for (let a = 0; a < 6; a++) { const ang = Math.PI + (a / 5) * Math.PI, len = 9 + r() * 5; for (let s = 0; s < len; s++) { const px = cx + Math.cos(ang) * s, py = top + Math.sin(ang) * s * .5 + (s * s) / 28; rectW(x, px, py, 2, 1, def.color, W); } }
        }
        break;
      }
      case 'vines': {
        for (let k = 0; k < W / 16; k++) { const tx = r() * W, len = 8 + r() * 30; for (let s = 0; s < len; s++) rectW(x, tx + Math.sin(s / 4) * 1.5, s, 1, 1, def.color, W); if (r() < .6) spanCircle(x, tx, len, 2, mix(def.color, '#7ad28a', .5), W); }
        for (let X = 0; X < W; X++) col(X, x, X, 0, 3 + Math.round(Math.sin(X / 5) * 2 + 2), def.color);
        break;
      }
      case 'volcano': {
        const cx = W * (.3 + r() * .4), base = y0, h = H * .34, topW = 18;
        for (let row = 0; row < h; row++) { const w = topW + (row / h) * W * .55; rectW(x, cx - w / 2, base - h + row, w, 1, def.color, W); }
        rectW(x, cx - topW / 2, base - h, topW, 2, '#ff6a2a', W);
        for (let s = 0; s < 18; s++) rectW(x, cx - 2 + Math.sin(s) * 2, base - h + 2 + s * 2, 2, 2, '#ff8a3a', W);
        S.volcanoX = cx; S.volcanoTop = base - h;
        break;
      }
      case 'floating': {
        for (let k = 0; k < 4; k++) {
          const tx = r() * W, w = 18 + r() * 30, y = y0 + (r() - .5) * H * .2;
          rectW(x, tx - w / 2, y, w, 3, '#7fc46a', W); for (let row = 0; row < w / 3; row++) rectW(x, tx - (w / 2) * (1 - row / (w / 3)), y + 3 + row, w * (1 - row / (w / 3)), 1, '#8a6c54', W);
          spanCircle(x, tx - w * .2, y - 3, 3, '#4ca35c', W);
        }
        break;
      }
      case 'ruins': {
        for (let k = 0; k < (def.small ? 7 : 4); k++) {
          const tx = r() * W, h = (def.small ? 8 : 18) + r() * (def.small ? 10 : 22), w = def.small ? 3 : 5;
          rectW(x, tx, y0 - h, w, h, def.color, W); rectW(x, tx - 2, y0 - h - 2, w + 4, 2, def.color, W);
          if (r() < .7) rectW(x, tx + 1, y0 - h * .6, w - 2, 2, def.glow, W);
        }
        break;
      }
      // capas animadas: no usan strip estático
      case 'sea': case 'cloudsea': case 'lava': case 'nebula': case 'torches': default: break;
    }
    return { def, canvas: c, lights };
  }

  function rebuild() {
    const b = BIOMES[S.biome] || BIOMES.forest;
    S.layers = b.layers.map((d, i) => buildLayer(d, i));
    const r = rng(S.seed * 13 + 3);
    S.stars = Array.from({ length: 60 }, () => ({ x: r() * S.W, y: r() * S.H * .55, s: r() < .15 ? 2 : 1, tw: r() * TAU }));
    S.clouds = Array.from({ length: 6 }, () => ({ x: r() * S.W, y: 8 + r() * S.H * .25, w: 18 + r() * 34, sp: .02 + r() * .05 }));
    S.foreSeed = Math.floor(r() * 1e9);
    S.bgParts = [];
    S.dirty = false;
  }

  // ---------- día / noche ----------
  function daylight() {
    const d = new Date(), h = S.forceHour != null ? S.forceHour : d.getHours() + d.getMinutes() / 60;
    // 0 = noche cerrada, 1 = pleno día; tonos cálidos al amanecer y atardecer
    const k = [[0, 0], [5, 0], [7, .75], [9, 1], [17, 1], [19, .7], [20.5, .15], [22, 0], [24, 0]];
    for (let i = 0; i < k.length - 1; i++) if (h >= k[i][0] && h <= k[i + 1][0]) { const t = (h - k[i][0]) / (k[i + 1][0] - k[i][0]); return { light: lerp(k[i][1], k[i + 1][1], t), warm: (h > 5 && h < 8.5) || (h > 17.5 && h < 21) ? 1 - Math.abs(((h < 12 ? 6.6 : 19.2) - h) / 1.6) : 0, hour: h }; }
    return { light: 1, warm: 0, hour: h };
  }

  // ---------- dibujo del fondo ----------
  function drawSky(ctx, b, dl) {
    const W = S.W, H = S.H;
    let top = b.sky[0], bot = b.sky[1];
    if (!b.indoor) {
      top = mix('#0b1030', top, dl.light); bot = mix('#26305a', bot, dl.light);
      if (dl.warm > 0) { top = mix(top, '#ff8a5c', dl.warm * .35); bot = mix(bot, '#ffb36b', clamp(dl.warm, 0, 1) * .6); }
    }
    const bands = 12;
    for (let i = 0; i < bands; i++) { ctx.fillStyle = mix(top, bot, i / (bands - 1)); ctx.fillRect(0, Math.floor(i * H * .75 / bands), W, Math.ceil(H * .75 / bands) + 1); }
    ctx.fillStyle = bot; ctx.fillRect(0, Math.floor(H * .75), W, H);
    if (b.stars || (!b.indoor && dl.light < .55)) {
      const a = b.stars ? 1 : clamp((.55 - dl.light) * 2.2, 0, 1);
      for (const s of S.stars) { const tw = .5 + .5 * Math.sin(S.t * 2 + s.tw); ctx.fillStyle = `rgba(255,255,255,${(a * (.35 + .65 * tw)).toFixed(3)})`; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s); }
    }
    if (b.sun && !b.indoor) {
      const day = dl.light > .3, cx = W * (.18 + ((dl.hour % 12) / 12) * .64), cy = H * (.32 - Math.sin(((dl.hour % 12) / 12) * Math.PI) * .2);
      if (day) { ctx.fillStyle = rgba('#fff3b0', .25); spanCircle(ctx, cx, cy, 13, rgba('#fff3b0', .18), 0); spanCircle(ctx, cx, cy, 8, '#fff6c8', 0); }
      else { spanCircle(ctx, cx, cy, 7, '#e8ecff', 0); spanCircle(ctx, cx + 3, cy - 2, 6, mix('#0b1030', b.sky[0], dl.light), 0); }
    }
    if (!b.indoor) for (const c of S.clouds) {
      const x = ((c.x - S.scroll * c.sp * 2 - S.t * 2 * c.sp * 10) % (W + 60) + W + 60) % (W + 60) - 40;
      ctx.fillStyle = b.ashClouds ? 'rgba(60,40,44,.6)' : rgba('#ffffff', .55 * (.4 + dl.light * .6)); ctx.fillRect(Math.round(x), Math.round(c.y), Math.round(c.w), 3); ctx.fillRect(Math.round(x + c.w * .2), Math.round(c.y - 2), Math.round(c.w * .5), 2);
    }
    if (b === BIOMES.cosmos) {
      for (let i = 0; i < 3; i++) { const cx = ((W * (.2 + i * .33) - S.scroll * .03) % W + W) % W, cy = H * (.25 + i * .08); const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 60); g.addColorStop(0, rgba(['#9a5bff', '#3fb8ff', '#ff5fb0'][i], .35)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    }
  }

  function drawAnimatedLayer(ctx, L, off) {
    const d = L.def, W = S.W, H = S.H, y0 = (d.y || 0) * H;
    if (d.kind === 'sea') {
      ctx.fillStyle = d.color; ctx.fillRect(0, y0, W, H - y0);
      for (let row = 0; row < (H - y0) / 3; row++) { const y = y0 + row * 3 + 1, ph = S.t * (1.2 + row * .1) + row; ctx.fillStyle = rgba(d.color2, .55 - row * .04); for (let X = 0; X < W; X += 6) { const w = 2 + Math.round((Math.sin(X * .15 + ph) * .5 + .5) * 3); ctx.fillRect(((X - off * 3 + row * 7) % W + W) % W, y, w, 1); } }
    } else if (d.kind === 'cloudsea') {
      ctx.fillStyle = '#e9f5ff'; ctx.fillRect(0, y0, W, H - y0);
      for (let X = 0; X < W; X++) { const h = 3 + Math.sin((X + off * 4) * .09 + S.t * .6) * 2 + Math.sin((X + off * 4) * .23) * 1.5; ctx.fillStyle = '#ffffff'; ctx.fillRect(X, Math.round(y0 - h), 1, Math.round(h)); }
    } else if (d.kind === 'lava') {
      for (let X = 0; X < W; X++) { const v = Math.sin((X + off * 6) * .12 + S.t * 1.5) * .5 + .5; ctx.fillStyle = mix('#c2311a', '#ffb02e', v); ctx.fillRect(X, y0 + Math.round(Math.sin((X + off * 6) * .05) * 1.5), 1, 5); }
      ctx.fillStyle = '#2a1414'; ctx.fillRect(0, y0 + 5, W, H - y0);
    } else if (d.kind === 'torches') {
      for (let k = 0; k < 4; k++) { const x = ((k * W / 4 + 20 - off * 1) % W + W) % W, y = y0; ctx.fillStyle = '#5a4630'; ctx.fillRect(Math.round(x), Math.round(y), 2, 6); const fl = Math.sin(S.t * 14 + k * 3) * .5 + .5; ctx.fillStyle = mix('#ff7a1a', '#ffe08a', fl); ctx.fillRect(Math.round(x), Math.round(y - 3), 2, 3); S.lights.push({ x, y: y - 2, r: 16 + fl * 4, c: '#ff9a3a', a: .35 }); }
    }
  }

  function drawGround(ctx, b, off) {
    const W = S.W, H = S.H, gy = Math.round(H * .78);
    ctx.fillStyle = b.ground; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = b.groundDark; for (let X = 0; X < W; X += 1) if (((X + Math.floor(off)) * 7919) % 13 < 2) ctx.fillRect(X, gy + ((X * 31) % (H - gy)), 1, 1);
    // camino
    const py = gy + Math.round((H - gy) * .38), ph = Math.round((H - gy) * .34);
    ctx.fillStyle = b.path; ctx.fillRect(0, py, W, ph); ctx.fillStyle = b.pathDark; ctx.fillRect(0, py, W, 1); ctx.fillRect(0, py + ph - 1, W, 1);
    for (let X = 0; X < W; X += 9) { const xx = ((X - off) % W + W) % W; ctx.fillRect(Math.round(xx), py + 2 + (X * 13) % Math.max(1, ph - 4), 2, 1); }
    // borde superior del suelo
    ctx.fillStyle = mix(b.ground, '#ffffff', .18); ctx.fillRect(0, gy, W, 1);
  }

  function drawFore(ctx, b, off) {
    const W = S.W, H = S.H, gy = Math.round(H * .78), r = rng(S.foreSeed);
    const items = 26;
    for (let k = 0; k < items; k++) {
      const bx = r() * W, x = Math.round(((bx - off) % W + W) % W), y = gy + Math.round(r() * (H - gy) * .9), v = r();
      switch (b.fore) {
        case 'grass': { const sway = Math.round(Math.sin(S.t * 2 + bx) * 1); ctx.fillStyle = mix(b.ground, '#bff2a0', .35); ctx.fillRect(x, y - 3, 1, 3); ctx.fillRect(x + 1 + sway, y - 4, 1, 4); ctx.fillRect(x + 2, y - 2, 1, 2); if (v < .25) { ctx.fillStyle = ['#ffd84a', '#ff7aa8', '#ffffff'][k % 3]; ctx.fillRect(x + 1 + sway, y - 5, 1, 1); } break; }
        case 'ferns': { ctx.fillStyle = '#2e8a4a'; for (let s = 0; s < 4; s++) ctx.fillRect(x + s, y - s, 1, 1), ctx.fillRect(x - s, y - s, 1, 1); break; }
        case 'pebbles': { ctx.fillStyle = mix(b.ground, '#000000', .25); ctx.fillRect(x, y, 2, 1); break; }
        case 'shells': { ctx.fillStyle = v < .5 ? '#fff2e0' : '#f6a6a0'; ctx.fillRect(x, y, 2, 1); break; }
        case 'ash': { ctx.fillStyle = '#5a3c36'; ctx.fillRect(x, y, 1, 1); break; }
        case 'runes': { if (v < .3) { const a = .4 + .4 * Math.sin(S.t * 3 + k); ctx.fillStyle = rgba('#9a7bff', a); ctx.fillRect(x, y, 2, 2); } break; }
      }
    }
  }

  function spawnAmbient(b, dl) {
    const W = S.W, H = S.H, P = S.bgParts; if (P.length > 140) return;
    const a = b.ambient;
    if (a === 'fireflies' && dl.light < .5 && Math.random() < .06) P.push({ k: 'glow', x: Math.random() * W, y: H * (.55 + Math.random() * .3), vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 3, life: 4 + Math.random() * 3, c: '#e9ff7a' });
    if (a === 'dust' && Math.random() < .08) P.push({ k: 'dot', x: Math.random() * W, y: Math.random() * H * .8, vx: 1 + Math.random() * 2, vy: -.5 + Math.random(), life: 5, c: 'rgba(220,210,190,.5)' });
    if (a === 'embers' && Math.random() < .25) P.push({ k: 'glow', x: Math.random() * W, y: H * (.75 + Math.random() * .2), vx: (Math.random() - .3) * 6, vy: -8 - Math.random() * 12, life: 2 + Math.random() * 2, c: '#ff9a3a' });
    if (a === 'mist' && Math.random() < .02) P.push({ k: 'fogblob', x: -40, y: H * (.5 + Math.random() * .3), vx: 4 + Math.random() * 3, vy: 0, life: 30, w: 60 + Math.random() * 60, c: 'rgba(230,255,240,.10)' });
    if (a === 'petals' && Math.random() < .05) P.push({ k: 'dot', x: W + 5, y: Math.random() * H * .7, vx: -10 - Math.random() * 6, vy: 3 + Math.random() * 3, life: 8, c: '#ffc4dd' });
    if (a === 'motes' && Math.random() < .1) P.push({ k: 'glow', x: Math.random() * W, y: H * (.3 + Math.random() * .6), vx: 0, vy: -2 - Math.random() * 3, life: 3 + Math.random() * 3, c: Math.random() < .5 ? '#9a7bff' : '#5fd0ff' });
    if (a === 'sparkleSea' && dl.light > .4 && Math.random() < .2) P.push({ k: 'dot', x: Math.random() * W, y: H * (.6 + Math.random() * .15), vx: 0, vy: 0, life: .35, c: '#ffffff' });
    if (b.layers.some(l => l.kind === 'volcano') && Math.random() < .3 && S.volcanoX != null) { const vx = ((S.volcanoX - S.scroll * .05) % W + W) % W; P.push({ k: 'smoke', x: vx, y: S.volcanoTop, vx: 2 + Math.random() * 3, vy: -6 - Math.random() * 4, life: 4, c: 'rgba(70,50,55,.35)', w: 3 }); }
  }

  function spawnWeather(w) {
    const W = S.W, H = S.H, P = S.bgParts, fx = WEATHER_FX[w]; if (!fx || P.length > 320) return;
    if (fx.rain) for (let i = 0; i < 6; i++) P.push({ k: 'rain', x: Math.random() * (W + 40), y: -5, vx: -40, vy: 210 + Math.random() * 60, life: 1.2, c: 'rgba(180,210,255,.55)' });
    if (fx.snow && Math.random() < .7) for (let i = 0; i < 2; i++) P.push({ k: 'snow', x: Math.random() * (W + 30), y: -3, vx: -6, vy: 14 + Math.random() * 10, life: 14, c: '#ffffff', ph: Math.random() * TAU });
    if (fx.sand) for (let i = 0; i < 3; i++) P.push({ k: 'streak', x: W + 5, y: Math.random() * H, vx: -160 - Math.random() * 80, vy: 10, life: 3, c: 'rgba(230,190,120,.45)' });
    if (fx.leaves && Math.random() < .35) P.push({ k: 'leaf', x: W + 5, y: Math.random() * H * .8, vx: -60 - Math.random() * 40, vy: 8, life: 7, c: Math.random() < .5 ? '#8bc34a' : '#d8a23a', ph: Math.random() * TAU });
    if (fx.fog && Math.random() < .04) P.push({ k: 'fogblob', x: W + 60, y: H * (.35 + Math.random() * .5), vx: -6 - Math.random() * 4, vy: 0, life: 60, w: 90 + Math.random() * 80, c: 'rgba(220,228,240,.16)' });
    if (fx.sparkle && Math.random() < .3) P.push({ k: 'glow', x: Math.random() * W, y: Math.random() * H * .8, vx: 0, vy: -3, life: 1.5, c: Math.random() < .5 ? '#ffd1f4' : '#fff6a8' });
  }

  function stepBgParts(ctx, dt) {
    const P = S.bgParts, k = S.px || 1, smooth = k > 1.01;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life -= dt; if (p.life <= 0 || p.y > S.H + 10 * k || p.x < -150 * k) { P.splice(i, 1); continue; }
      let vx = p.vx; if (p.k === 'snow' || p.k === 'leaf') vx += Math.sin(S.t * 2 + p.ph) * 10;
      p.x += vx * dt * k; p.y += p.vy * dt * k;
      ctx.fillStyle = p.c;
      if (p.k === 'rain') { if (smooth) { ctx.strokeStyle = p.c; ctx.lineWidth = 1.2 * k * .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - .8 * k, p.y + 5 * k); ctx.stroke(); } else ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 4); }
      else if (p.k === 'streak') ctx.fillRect(p.x, p.y, 6 * k, .7 * k);
      else if (p.k === 'snow' || p.k === 'dot') { if (smooth) { ctx.beginPath(); ctx.arc(p.x, p.y, .7 * k, 0, TAU); ctx.fill(); } else ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      else if (p.k === 'leaf') { if (smooth) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(S.t * 3 + p.ph); ctx.beginPath(); ctx.ellipse(0, 0, 1.6 * k, .7 * k, 0, 0, TAU); ctx.fill(); ctx.restore(); } else { ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1); ctx.fillRect(Math.round(p.x) + (Math.sin(S.t * 6 + p.ph) > 0 ? 1 : 0), Math.round(p.y) + 1, 1, 1); } }
      else if (p.k === 'fogblob' || p.k === 'smoke') { const w = (p.w || 6) * k; if (smooth) { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, w / 2); g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - w / 2, p.y - w / 2, w, w); } else ctx.fillRect(Math.round(p.x - w / 2), Math.round(p.y), Math.round(w), Math.max(2, Math.round(w / 5))); if (p.k === 'smoke') p.w = (p.w || 3) + dt * 4; }
      else if (p.k === 'glow') { const a = Math.min(1, p.life) * (.6 + .4 * Math.sin(S.t * 8 + i)); ctx.fillStyle = rgba(p.c, a); if (smooth) { ctx.beginPath(); ctx.arc(p.x, p.y, .8 * k, 0, TAU); ctx.fill(); } else ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); S.lights.push({ x: p.x, y: p.y, r: 4 * k, c: p.c, a: a * .4 }); }
    }
  }

  // Modo pintado: ilustración a resolución completa + clima y ambiente encima.
  function renderPainted(dt, b, img) {
    const ctx = S.bctx, W = S.W, H = S.H, wRaw = WEATHER_FX[S.weather];
    const wfx = wRaw && b.indoor ? { tint: wRaw.tint, tintA: (wRaw.tintA || 0) * .5, fog: wRaw.fog, sparkle: wRaw.sparkle } : wRaw;
    S.lights = [];
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.07, iw = img.naturalWidth * s, ih = img.naturalHeight * s;
    const pan = (Math.sin(S.scroll / 1400) * .5 + .5) * (iw - W), bob = Math.sin(S.t * .25) * (ih - H) * .08;
    ctx.drawImage(img, -pan, (H - ih) * .55 + bob, iw, ih);
    spawnAmbient(b, { light: b.indoor || b.stars ? 0 : .8 }); if (S.weather && (!b.indoor || ['fog', 'aura'].includes(S.weather))) spawnWeather(S.weather);
    stepBgParts(ctx, dt);
    if (wfx?.tint) { ctx.fillStyle = rgba(wfx.tint, wfx.tintA * .8); ctx.fillRect(0, 0, W, H); }
    if (S.lights.length) { ctx.globalCompositeOperation = 'lighter'; for (const l of S.lights) { const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); g.addColorStop(0, rgba(l.c, clamp(l.a, 0, .8))); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); } ctx.globalCompositeOperation = 'source-over'; }
    if (wfx?.lightning && !b.indoor) { if (S.lightning > 0) { ctx.fillStyle = `rgba(230,240,255,${(S.lightning * .45).toFixed(3)})`; ctx.fillRect(0, 0, W, H); S.lightning -= dt * 3; } else if (Math.random() < dt * .08) S.lightning = 1; }
    const v = ctx.createRadialGradient(W / 2, H * .55, H * .4, W / 2, H * .55, W * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.22)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function renderBg(dt) {
    const pimg = paintedImg(S.biome);
    if (pimg && S.paintedMode) { renderPainted(dt, BIOMES[S.biome] || BIOMES.forest, pimg); return; }
    if (S.dirty) rebuild();
    const ctx = S.bctx, W = S.W, H = S.H, b = BIOMES[S.biome] || BIOMES.forest, dl = daylight(), wRaw = WEATHER_FX[S.weather];
    // En interiores no llueve ni nieva: solo se conserva el tinte del clima.
    const wfx = wRaw && b.indoor ? { tint: wRaw.tint, tintA: (wRaw.tintA || 0) * .5, fog: wRaw.fog, sparkle: wRaw.sparkle } : wRaw;
    S.lights = [];
    drawSky(ctx, b, dl);
    for (const L of S.layers) {
      const off = S.scroll * L.def.speed;
      if (['sea', 'cloudsea', 'lava', 'torches'].includes(L.def.kind)) { drawAnimatedLayer(ctx, L, off); continue; }
      if (L.def.kind === 'nebula') continue;
      const x = -(((off % W) + W) % W);
      ctx.drawImage(L.canvas, Math.round(x), 0); ctx.drawImage(L.canvas, Math.round(x) + W, 0);
      for (const l of L.lights) { const sx = (((l.x - off) % W) + W) % W; S.lights.push({ x: sx, y: l.y, r: 8, c: l.c, a: .32 + .14 * Math.sin(S.t * 2 + l.x) }); }
    }
    const groundOff = S.scroll * .6;
    drawGround(ctx, b, groundOff);
    drawFore(ctx, b, S.scroll * .75);
    spawnAmbient(b, dl); if (S.weather && (!b.indoor || ['fog', 'aura'].includes(S.weather))) spawnWeather(S.weather);
    stepBgParts(ctx, dt);
    // tinte de noche y de clima
    if (!b.indoor && dl.light < 1) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mix('#3a4a9a', '#ffffff', clamp(dl.light * 1.05, 0, 1)); ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    if (wfx?.tint) { ctx.fillStyle = rgba(wfx.tint, wfx.tintA); ctx.fillRect(0, 0, W, H); }
    if (wfx?.rays && dl.light > .4) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x = ((i * W / 4 + S.t * 3) % (W + 40)) - 20; ctx.fillStyle = 'rgba(255,240,180,.05)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 18, 0); ctx.lineTo(x - 30, H); ctx.lineTo(x - 48, H); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }
    // luces (antorchas, brasas, luciérnagas) brillan más de noche
    if (S.lights.length) { ctx.globalCompositeOperation = 'lighter'; const boost = b.indoor ? 1 : 1.6 - dl.light; for (const l of S.lights) { const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); g.addColorStop(0, rgba(l.c, clamp(l.a * boost, 0, .9))); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); } ctx.globalCompositeOperation = 'source-over'; }
    if (wfx?.lightning) { if (S.lightning > 0) { ctx.fillStyle = `rgba(230,240,255,${(S.lightning * .6).toFixed(3)})`; ctx.fillRect(0, 0, W, H); S.lightning -= dt * 3; } else if (Math.random() < dt * .08) S.lightning = 1; }
    // viñeta suave
    const v = ctx.createRadialGradient(W / 2, H * .55, H * .35, W / 2, H * .55, W * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  // =====================================================================
  //  EFECTOS DE COMBATE
  // =====================================================================
  const TYPE = {
    normal: { c: '#f2efe6', c2: '#b9b3a4', style: 'slash' }, fire: { c: '#ff6a1a', c2: '#ffd04a', style: 'orb', trail: 'ember' },
    water: { c: '#3aa2ff', c2: '#bfe8ff', style: 'orb', trail: 'bubble' }, electric: { c: '#ffe14a', c2: '#ffffff', style: 'bolt' },
    grass: { c: '#5fd45a', c2: '#c8ff8a', style: 'leaves' }, ice: { c: '#9fe8ff', c2: '#ffffff', style: 'shard' },
    fighting: { c: '#ff7a3a', c2: '#ffd2a8', style: 'impact' }, poison: { c: '#b45cff', c2: '#e6b8ff', style: 'glob', trail: 'bubble' },
    ground: { c: '#c8963c', c2: '#7a5a2a', style: 'quake' }, flying: { c: '#cfe8ff', c2: '#ffffff', style: 'wind' },
    psychic: { c: '#ff5fb0', c2: '#ffd1ea', style: 'wave' }, bug: { c: '#a6d42a', c2: '#e8ff9a', style: 'swarm' },
    rock: { c: '#a8885a', c2: '#e0c99a', style: 'boulder' }, ghost: { c: '#7a5cff', c2: '#c8b8ff', style: 'orb', trail: 'wisp' },
    dragon: { c: '#6a5cff', c2: '#ff5fd0', style: 'beam' }, fairy: { c: '#ff9ce6', c2: '#ffffff', style: 'orb', trail: 'star' },
    steel: { c: '#c8d4e0', c2: '#ffffff', style: 'slash' }, dark: { c: '#5a3c6e', c2: '#b08ad0', style: 'crescent' }
  };
  const tdef = t => TYPE[t] || TYPE.normal;
  const MAX_PARTS = 900;

  function fieldPoint(el) {
    if (!el || !S.field) return null;
    const img = el.querySelector?.('img') || el, r = img.getBoundingClientRect(), f = S.field.getBoundingClientRect();
    if (!r.width || !f.width) return null;
    return { x: (r.left - f.left + r.width / 2) * S.dpr, y: (r.top - f.top + r.height * .55) * S.dpr, w: r.width * S.dpr, h: r.height * S.dpr };
  }
  function part(p) { if (S.parts.length >= MAX_PARTS) S.parts.shift(); S.parts.push(Object.assign({ vx: 0, vy: 0, grav: 0, drag: 0, size: 3, life: .6, max: .6, glow: true, shape: 'dot', rot: 0, vr: 0 }, p, { max: p.life || .6 })); }
  function burst(x, y, def, n, speed, opts = {}) {
    const k = S.dpr;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = speed * (.35 + Math.random() * .65) * k;
      part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.up || 0) * k, grav: (opts.grav || 0) * k, drag: opts.drag ?? 2.5, size: (opts.size || 3) * k * (.6 + Math.random() * .8), life: (opts.life || .5) * (.6 + Math.random() * .7), color: Math.random() < .5 ? def.c : def.c2, shape: opts.shape || 'dot', rot: Math.random() * TAU, vr: (Math.random() - .5) * 12 });
    }
  }
  function ring(x, y, color, r0, r1, life, width) { S.flashes.push({ k: 'ring', x, y, c: color, r0: r0 * S.dpr, r1: r1 * S.dpr, life, max: life, w: (width || 3) * S.dpr }); }
  function flashSprite(el, cls) { const t = el?.querySelector?.('img') || el; if (!t) return; t.classList.remove(cls); void t.offsetWidth; t.classList.add(cls); setTimeout(() => t.classList.remove(cls), 260); }

  function impact(pt, type, o = {}) {
    if (!pt) return;
    const d = tdef(type), big = o.crit ? 1.6 : 1, sup = (o.eff || 1) > 1.01;
    ring(pt.x, pt.y, d.c, 4, (sup ? 40 : 28) * big, .32, sup ? 4 : 3);
    if (sup) ring(pt.x, pt.y, d.c2, 2, 56 * big, .42, 2);
    const n = Math.round((o.crit ? 26 : 14) * (sup ? 1.4 : 1));
    switch (d.style) {
      case 'orb': burst(pt.x, pt.y, d, n, 160, { size: 3.4, life: .55, up: 30 }); break;
      case 'bolt': burst(pt.x, pt.y, d, n, 220, { size: 2.2, life: .3, shape: 'spark' }); break;
      case 'leaves': burst(pt.x, pt.y, d, n, 140, { size: 4, life: .8, shape: 'leaf', grav: 60 }); break;
      case 'shard': burst(pt.x, pt.y, d, n, 170, { size: 3.5, life: .6, shape: 'shard', grav: 120 }); break;
      case 'quake': case 'boulder': burst(pt.x, pt.y + 10 * S.dpr, d, n, 150, { size: 4, life: .7, shape: 'rock', grav: 420, up: 120, drag: .6 }); break;
      case 'glob': burst(pt.x, pt.y, d, n, 110, { size: 4.5, life: .8, up: 20, grav: -10 }); break;
      case 'swarm': burst(pt.x, pt.y, d, n * 1.5, 120, { size: 2, life: .6 }); break;
      default: burst(pt.x, pt.y, d, n, 180, { size: 2.8, life: .4, shape: 'spark' });
    }
    if (o.crit) { S.flashes.push({ k: 'text', x: pt.x, y: pt.y - pt.h * .55, text: '¡CRÍTICO!', c: '#ffe14a', life: .8, max: .8 }); shake(7); }
    else if (sup) shake(3.5);
  }

  function shot(from, to, type, o = {}) {
    if (!from || !to) return;
    const d = tdef(type), dist = Math.hypot(to.x - from.x, to.y - from.y);
    const dur = clamp(dist / (900 * S.dpr), .16, .42) * (o.speed || 1);
    S.shots.push({ from, to, type, d, t: 0, dur, o, arc: (d.style === 'boulder' || d.style === 'glob') ? -dist * .25 : 0, seed: Math.random() * 1000, done: false });
  }

  function stepShots(ctx, dt) {
    for (let i = S.shots.length - 1; i >= 0; i--) {
      const s = S.shots[i]; s.t += dt; const k = clamp(s.t / s.dur, 0, 1), d = s.d;
      const ex = lerp(s.from.x, s.to.x, k), ey = lerp(s.from.y, s.to.y, k) + s.arc * Math.sin(Math.PI * k);
      ctx.globalCompositeOperation = 'lighter';
      switch (d.style) {
        case 'bolt': {
          ctx.strokeStyle = d.c2; ctx.lineWidth = 3 * S.dpr; ctx.shadowColor = d.c; ctx.shadowBlur = 16 * S.dpr;
          ctx.beginPath(); ctx.moveTo(s.from.x, s.from.y); const segs = 9;
          for (let j = 1; j <= segs; j++) { const q = j / segs * k; const x = lerp(s.from.x, s.to.x, q), y = lerp(s.from.y, s.to.y, q) + (j < segs ? (Math.random() - .5) * 26 * S.dpr : 0); ctx.lineTo(x, y); }
          ctx.stroke(); ctx.lineWidth = 1.2 * S.dpr; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.shadowBlur = 0; break;
        }
        case 'beam': case 'wave': {
          const w = (d.style === 'beam' ? 10 : 6) * S.dpr * (1 - Math.abs(k - .5));
          const g = ctx.createLinearGradient(s.from.x, s.from.y, ex, ey); g.addColorStop(0, rgba(d.c, .1)); g.addColorStop(1, rgba(d.c2, .9));
          ctx.strokeStyle = g; ctx.lineWidth = w + 2 * S.dpr; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.from.x, s.from.y); ctx.lineTo(ex, ey); ctx.stroke();
          if (d.style === 'wave') for (let j = 0; j < 3; j++) { const q = (k * 3 + j / 3) % 1; ctx.strokeStyle = rgba(d.c, .7 * (1 - q)); ctx.lineWidth = 2 * S.dpr; ctx.beginPath(); ctx.arc(lerp(s.from.x, s.to.x, q), lerp(s.from.y, s.to.y, q), (6 + q * 14) * S.dpr, 0, TAU); ctx.stroke(); }
          break;
        }
        case 'slash': case 'crescent': case 'impact': case 'wind': case 'quake': {
          // golpes cuerpo a cuerpo: se resuelven en el objetivo (pequeño rastro de carrera)
          ctx.fillStyle = rgba(d.c, .5 * (1 - k)); ctx.beginPath(); ctx.arc(ex, ey, 3 * S.dpr, 0, TAU); ctx.fill();
          break;
        }
        case 'leaves': {
          for (let j = 0; j < 4; j++) { const q = clamp(k - j * .07, 0, 1), x = lerp(s.from.x, s.to.x, q), y = lerp(s.from.y, s.to.y, q) + Math.sin(q * 12 + j) * 10 * S.dpr; drawShape(ctx, 'leaf', x, y, 4.5 * S.dpr, j % 2 ? d.c : d.c2, s.t * 14 + j, 1); }
          break;
        }
        case 'swarm': {
          for (let j = 0; j < 10; j++) { const q = clamp(k - j * .03, 0, 1), x = lerp(s.from.x, s.to.x, q) + Math.sin(s.t * 30 + j * 2) * 8 * S.dpr, y = lerp(s.from.y, s.to.y, q) + Math.cos(s.t * 26 + j) * 8 * S.dpr; ctx.fillStyle = d.c; ctx.fillRect(x, y, 2 * S.dpr, 2 * S.dpr); }
          break;
        }
        case 'shard': { drawShape(ctx, 'shard', ex, ey, 7 * S.dpr, d.c, Math.atan2(s.to.y - s.from.y, s.to.x - s.from.x), 1); if (Math.random() < .6) part({ x: ex, y: ey, size: 2 * S.dpr, life: .3, color: d.c2 }); break; }
        case 'boulder': { ctx.globalCompositeOperation = 'source-over'; drawShape(ctx, 'rock', ex, ey, 8 * S.dpr, d.c, s.t * 8, 1); break; }
        default: { // orb / glob
          const r = (d.style === 'glob' ? 7 : 6) * S.dpr;
          const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 2.4); g.addColorStop(0, '#ffffff'); g.addColorStop(.3, d.c2); g.addColorStop(.6, rgba(d.c, .8)); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, r * 2.4, 0, TAU); ctx.fill();
          const tr = d.trail;
          if (tr === 'ember') for (let j = 0; j < 2; j++) part({ x: ex, y: ey, vx: (Math.random() - .5) * 60 * S.dpr, vy: -40 * S.dpr * Math.random(), size: 3 * S.dpr, life: .35, color: Math.random() < .5 ? d.c : d.c2 });
          else if (tr === 'bubble') part({ x: ex + (Math.random() - .5) * 8 * S.dpr, y: ey, vy: -20 * S.dpr, size: 2.5 * S.dpr, life: .45, color: d.c2, shape: 'ring' });
          else if (tr === 'wisp') part({ x: ex, y: ey, vx: (Math.random() - .5) * 30 * S.dpr, vy: -30 * S.dpr, size: 4 * S.dpr, life: .5, color: d.c });
          else if (tr === 'star') part({ x: ex, y: ey, size: 4 * S.dpr, life: .5, color: Math.random() < .5 ? d.c : '#ffffff', shape: 'star', vr: 6 });
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
      if (k >= 1 && !s.done) {
        s.done = true;
        if (d.style === 'slash' || d.style === 'crescent' || d.style === 'wind') S.flashes.push({ k: 'slash', x: s.to.x, y: s.to.y, c: d.c, c2: d.c2, life: .26, max: .26, dir: s.to.x > s.from.x ? 1 : -1, crescent: d.style === 'crescent', n: d.style === 'wind' ? 3 : (d.style === 'slash' ? 2 : 1) });
        if (d.style === 'quake') { for (let j = 0; j < 5; j++) part({ x: s.to.x + (j - 2) * 9 * S.dpr, y: s.to.y + 22 * S.dpr, vy: -260 * S.dpr, grav: 900 * S.dpr, size: 5 * S.dpr, life: .5, color: j % 2 ? d.c : d.c2, shape: 'rock', glow: false }); shake(3); }
        if (d.style === 'impact') { ring(s.to.x, s.to.y, d.c2, 2, 34, .22, 5); }
        if (!s.o.silent) impact(s.to, s.type, s.o);
      }
      if (k >= 1) S.shots.splice(i, 1);
    }
  }

  function drawShape(ctx, shape, x, y, size, color, rot, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.strokeStyle = color;
    switch (shape) {
      case 'leaf': ctx.beginPath(); ctx.ellipse(0, 0, size, size * .45, 0, 0, TAU); ctx.fill(); break;
      case 'shard': ctx.beginPath(); ctx.moveTo(size, 0); ctx.lineTo(-size * .6, size * .35); ctx.lineTo(-size * .6, -size * .35); ctx.closePath(); ctx.fill(); break;
      case 'rock': ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r = size * (.7 + ((i * 37) % 10) / 30); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); break;
      case 'spark': ctx.fillRect(-size, -size * .25, size * 2, size * .5); break;
      case 'ring': ctx.lineWidth = Math.max(1, size * .35); ctx.beginPath(); ctx.arc(0, 0, size, 0, TAU); ctx.stroke(); break;
      case 'star': ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = i % 2 ? size * .4 : size; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); break;
      default: ctx.beginPath(); ctx.arc(0, 0, size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function stepParts(ctx, dt) {
    const P = S.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life -= dt; if (p.life <= 0) { P.splice(i, 1); continue; }
      p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
      drawShape(ctx, p.shape, p.x, p.y, p.size * (.5 + a * .5), p.color, p.rot, a);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function stepFlashes(ctx, dt) {
    for (let i = S.flashes.length - 1; i >= 0; i--) {
      const f = S.flashes[i]; f.life -= dt; if (f.life <= 0) { S.flashes.splice(i, 1); continue; }
      const k = 1 - f.life / f.max;
      if (f.k === 'ring') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(f.c, 1 - k); ctx.lineWidth = f.w * (1 - k * .6); ctx.beginPath(); ctx.arc(f.x, f.y, lerp(f.r0, f.r1, 1 - Math.pow(1 - k, 3)), 0, TAU); ctx.stroke(); }
      else if (f.k === 'slash') {
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let j = 0; j < f.n; j++) {
          const off = (j - (f.n - 1) / 2) * 12 * S.dpr, r = 26 * S.dpr, sweep = Math.min(1, k * 1.8);
          ctx.strokeStyle = rgba(j % 2 ? f.c2 : f.c, 1 - k); ctx.lineWidth = (f.crescent ? 6 : 3.5) * S.dpr * (1 - k * .5);
          ctx.beginPath(); const a0 = f.dir > 0 ? -2.2 : -0.9, a1 = a0 + (f.dir > 0 ? 1.9 : -1.9) * sweep; ctx.arc(f.x + off, f.y - off * .3, r, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
        }
        ctx.lineCap = 'butt';
      }
      else if (f.k === 'text') {
        ctx.globalCompositeOperation = 'source-over'; const s = (1 + (k < .15 ? (1 - k / .15) * .8 : 0)) * 15 * S.dpr;
        ctx.font = `900 ${s}px system-ui,'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 4 * S.dpr; ctx.strokeStyle = 'rgba(30,10,0,.85)'; ctx.globalAlpha = clamp((1 - k) * 2, 0, 1);
        ctx.strokeText(f.text, f.x, f.y - k * 24 * S.dpr); ctx.fillStyle = f.c; ctx.fillText(f.text, f.x, f.y - k * 24 * S.dpr); ctx.globalAlpha = 1;
      }
      else if (f.k === 'vignette') { ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(S.FW / 2, S.FH / 2, S.FH * .2, S.FW / 2, S.FH / 2, S.FW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(f.c, .55 * Math.sin(Math.PI * k))); ctx.fillStyle = g; ctx.fillRect(0, 0, S.FW, S.FH); }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function shake(p) { if (reduceMotion) return; S.shake = Math.min(14, S.shake + p); }

  // ---------- bucle ----------
  function resize() {
    if (!S.field) return;
    const r = S.field.getBoundingClientRect(); if (!r.width || !r.height) return;
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    const painted = isPainted();
    let H, W;
    if (painted) { H = Math.round(r.height * Math.min(1.5, S.dpr)); W = Math.round(r.width * Math.min(1.5, S.dpr)); }
    else { H = r.width < 560 ? 150 : 180; W = Math.max(200, Math.round(H * r.width / r.height)); }
    if (W !== S.W || H !== S.H || painted !== S.paintedMode) {
      S.W = W; S.H = H; S.bg.width = W; S.bg.height = H; S.paintedMode = painted; S.px = painted ? H / 180 : 1;
      S.bctx.imageSmoothingEnabled = painted; S.bg.classList.toggle('painted', painted); S.bgParts = []; S.dirty = true;
      if (S.active) try { renderBg(0); } catch (_) {}
    }
    const FW = Math.round(r.width * S.dpr), FH = Math.round(r.height * S.dpr);
    if (FW !== S.FW || FH !== S.FH) { S.FW = FW; S.FH = FH; S.fx.width = FW; S.fx.height = FH; }
  }
  function frame(now) {
    S.raf = requestAnimationFrame(frame);
    if (!S.enabled || document.hidden) { S.last = now; return; }
    const dt = Math.min(.05, Math.max(0, (now - (S.last || now)) / 1000)); S.last = now; S.t += dt;
    // avance suave del parallax hacia la distancia real recorrida
    const diff = S.scrollTarget - S.scroll; S.scroll += Math.abs(diff) > 400 ? diff : diff * Math.min(1, dt * 3.2);
    if (S.active) renderBg(dt);
    const f = S.fctx; f.clearRect(0, 0, S.FW, S.FH); stepShots(f, dt); stepParts(f, dt); stepFlashes(f, dt);
    if (S.shake > .05) { const x = (Math.random() - .5) * S.shake, y = (Math.random() - .5) * S.shake; S.wrap.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; S.shake *= Math.pow(.02, dt); }
    else if (S.wrap.style.transform) S.wrap.style.transform = '';
  }

  function mount(field) {
    if (S.field === field && S.bg?.isConnected) return true;
    if (!field) return false;
    S.field = field; S.wrap = field;
    S.bg = document.createElement('canvas'); S.bg.className = 'pk2-bg'; S.bg.setAttribute('aria-hidden', 'true');
    S.fx = document.createElement('canvas'); S.fx.className = 'pk2-fx'; S.fx.setAttribute('aria-hidden', 'true');
    field.insertBefore(S.bg, field.firstChild); field.appendChild(S.fx);
    S.bctx = S.bg.getContext('2d'); S.fctx = S.fx.getContext('2d');
    resize(); try { new ResizeObserver(resize).observe(field); } catch (_) { addEventListener('resize', resize); }
    if (!S.raf) S.raf = requestAnimationFrame(frame);
    return true;
  }

  // ---------- API ----------
  const API = {
    BIOMES, TYPE,
    mount,
    setScene({ biome, weather, active, distance, seed } = {}) {
      if (biome && biome !== S.biome && BIOMES[biome]) { S.biome = biome; S.dirty = true; paintedImg(biome); resize(); }
      if (seed != null && seed !== S.seed) { S.seed = seed; S.dirty = true; }
      if (weather !== undefined) S.weather = WEATHER_FX[weather] !== undefined ? weather : 'clear';
      if (active !== undefined && active !== S.active) { S.active = !!active; S.field?.classList.toggle('pk2-stage-on', S.active); if (!S.active) S.bgParts = []; }
      if (distance != null && Number.isFinite(distance)) { const t = distance * 1.2; if (Math.abs(t - S.scrollTarget) > 5000) S.scroll = t; S.scrollTarget = t; }
    },
    setEnabled(on) { S.enabled = !!on; },
    setHour(h) { S.forceHour = h == null ? null : Number(h); },
    attack(fromEl, toEl, type, o = {}) { if (!S.enabled) return; const a = fieldPoint(fromEl), b = fieldPoint(toEl); if (!a || !b) return; shot(a, b, type, o); },
    burstAt(el, type, o = {}) { const p = fieldPoint(el); if (!p) return; const d = tdef(type); ring(p.x, p.y, d.c, 6, 70, .45, 4); burst(p.x, p.y, d, 22, 200, { size: 3, life: .6 }); },
    hit(el, o = {}) { if (!S.enabled || !el) return; flashSprite(el, o.crit ? 'pk2-hit-crit' : 'pk2-hit'); },
    impactOn(el, type, o = {}) { if (!S.enabled || !el) return; impact(fieldPoint(el), type, o); flashSprite(el, o.crit ? 'pk2-hit-crit' : 'pk2-hit'); },
    heal(el) { if (!S.enabled) return; const p = fieldPoint(el); if (!p) return; for (let i = 0; i < 12; i++) part({ x: p.x + (Math.random() - .5) * p.w * .6, y: p.y + p.h * .3, vy: -(60 + Math.random() * 60) * S.dpr, size: (2 + Math.random() * 2) * S.dpr, life: .8, color: Math.random() < .6 ? '#7dffa0' : '#e8ffe0', shape: Math.random() < .3 ? 'star' : 'dot', drag: 1 }); ring(p.x, p.y + p.h * .3, '#7dffa0', 4, 30, .4, 2); },
    koAt(rect, type) {
      if (!S.enabled || !rect || !S.field) return; const f = S.field.getBoundingClientRect(), x = (rect.left - f.left + rect.width / 2) * S.dpr, y = (rect.top - f.top + rect.height * .55) * S.dpr, d = tdef(type);
      for (let i = 0; i < 34; i++) part({ x: x + (Math.random() - .5) * rect.width * .5 * S.dpr, y: y + (Math.random() - .5) * rect.height * .5 * S.dpr, vx: (Math.random() - .5) * 120 * S.dpr, vy: -(40 + Math.random() * 120) * S.dpr, size: (2 + Math.random() * 3) * S.dpr, life: .9, color: Math.random() < .5 ? '#ffffff' : d.c, drag: 1.5, shape: Math.random() < .2 ? 'star' : 'dot' });
      ring(x, y, '#ffffff', 6, 46, .35, 3);
    },
    bossIntro(name) {
      if (!S.enabled || !S.field) return; shake(10); S.flashes.push({ k: 'vignette', c: '#ff2a2a', life: 1.4, max: 1.4 });
      const b = document.createElement('div'); b.className = 'pk2-boss-banner'; b.innerHTML = `<span>⚠ JEFE</span><b>${String(name || '').replace(/[<>&]/g, '')}</b>`; S.field.appendChild(b); setTimeout(() => b.remove(), 2200);
    },
    cross() { if (!S.field) return; S.flashes.push({ k: 'vignette', c: '#ffd666', life: .9, max: .9 }); },
    shake,
    _state: S
  };
  window.PK2Stage = API;
})();

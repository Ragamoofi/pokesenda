/* PokéSenda V2 — aislamiento de partidas
   La versión antigua (/pokesenda/) y la nueva (/pokesenda/v2/) viven en el mismo
   dominio y por eso comparten localStorage, sessionStorage e IndexedDB.
   Este archivo se carga ANTES que todo lo demás y hace que la V2 guarde
   todo bajo su propio prefijo, así nunca lee ni escribe las partidas de la antigua.
   La primera vez copia (no mueve) la partida antigua para seguir jugando desde ahí. */
(() => {
  'use strict';
  const PREFIX = 'pokesenda_v2::';
  const IMPORT_FLAG = PREFIX + '__importado_de_version_antigua';
  // Claves de la versión antigua que se copian al entrar por primera vez.
  const IMPORTABLE = /^(pokesenda|poke_idle)/i;
  // Nunca se copia el vínculo Cloud: así la V2 no puede sobrescribir
  // la copia en la nube de la versión antigua.
  // El bloqueo de pestaña tampoco: es estado temporal de la otra versión.
  const NEVER_IMPORT = new Set(['pokesenda_beta1_cloud_link_v1', 'pokesenda_single_tab_lock_v1']);

  function makeScoped(raw) {
    const own = () => {
      const out = [];
      for (let i = 0; i < raw.length; i++) {
        const k = raw.key(i);
        if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
      }
      return out;
    };
    return {
      getItem: k => raw.getItem(PREFIX + String(k)),
      setItem: (k, v) => raw.setItem(PREFIX + String(k), String(v)),
      removeItem: k => raw.removeItem(PREFIX + String(k)),
      clear: () => own().forEach(k => raw.removeItem(PREFIX + k)),
      key: i => own()[i] ?? null,
      get length() { return own().length; }
    };
  }

  function importOnce(raw) {
    try {
      if (raw.getItem(IMPORT_FLAG)) return;
      const keys = [];
      for (let i = 0; i < raw.length; i++) keys.push(raw.key(i));
      let copied = 0;
      for (const k of keys) {
        // '::' marca claves de otros espacios aislados (futuras versiones); solo copiamos la clásica.
        if (!k || k.includes('::') || !IMPORTABLE.test(k) || NEVER_IMPORT.has(k)) continue;
        if (raw.getItem(PREFIX + k) !== null) continue;
        raw.setItem(PREFIX + k, raw.getItem(k));
        copied++;
      }
      raw.setItem(IMPORT_FLAG, JSON.stringify({ at: Date.now(), copied }));
    } catch (_) { /* sin espacio o almacenamiento bloqueado: se empieza de cero */ }
  }

  function scopeStorage(name, doImport) {
    let raw;
    try { raw = window[name]; if (!raw) return; } catch (_) { return; }
    if (doImport) importOnce(raw);
    try {
      Object.defineProperty(window, name, { value: makeScoped(raw), configurable: true, enumerable: true, writable: false });
    } catch (e) { console.error('PokéSenda V2: no se pudo aislar ' + name, e); }
  }

  scopeStorage('localStorage', true);
  scopeStorage('sessionStorage', false);

  // Respaldos automáticos (SaveGuard / Centro de Recuperación) en su propia base de datos.
  try {
    const idb = window.indexedDB;
    if (idb) {
      const open = idb.open.bind(idb), del = idb.deleteDatabase.bind(idb);
      const map = n => n === 'PokeSendaSafetyDB' ? 'PokeSendaV2SafetyDB' : n;
      idb.open = (n, ...a) => open(map(n), ...a);
      idb.deleteDatabase = (n, ...a) => del(map(n), ...a);
    }
  } catch (_) {}

  window.PokeSendaV2 = { version: 'etapa-1', prefix: PREFIX };
})();

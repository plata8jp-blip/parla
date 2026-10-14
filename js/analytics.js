// Medición de uso con GoatCounter, SOLO si la persona lo acepta.
//
// - Antes de aceptar no se carga ningún script de terceros ni se envía nada.
// - GoatCounter no usa cookies ni guarda nada en el navegador. No guarda la IP:
//   la usa en memoria (máx. 8 h) para saber el país y no contar dos veces la misma visita.
// - Los eventos nunca llevan nombres, correos ni respuestas: solo rutas como
//   "leccion-completada/fr/u1-words".
// - La decisión se guarda en este navegador (parla.consent) y se vuelve a
//   preguntar pasados 12 meses. Se puede cambiar en «Preferencias de privacidad».
//
// Panel de estadísticas: https://parla.goatcounter.com

window.ANALYTICS_CONFIG = {
  goatcounter: "parla",
  consentVersion: 1,
  consentMaxAgeDays: 365
};

(function () {
  const C = window.ANALYTICS_CONFIG;
  const KEY = "parla.consent";
  let loaded = false;

  function readChoice() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!c || c.v !== C.consentVersion) return null;
      if (Date.now() - c.at > C.consentMaxAgeDays * 86400000) return null;
      return c;
    } catch { return null; }
  }

  function load() {
    if (loaded || !C.goatcounter) return;
    loaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${C.goatcounter}.goatcounter.com/count`;
    document.head.appendChild(s);
  }

  const Consent = {
    // null = aún no ha decidido; true/false = su decisión
    analytics() { const c = readChoice(); return c ? c.analytics : null; },
    set(analytics) {
      try { localStorage.setItem(KEY, JSON.stringify({ analytics: !!analytics, at: Date.now(), v: C.consentVersion })); } catch {}
      if (analytics) load();
    }
  };

  window.Consent = Consent;
  window.Analytics = {
    event(path) {
      if (Consent.analytics() !== true || !window.goatcounter?.count) return;
      try { window.goatcounter.count({ path, title: path, event: true }); } catch {}
    }
  };

  if (Consent.analytics() === true) load();
})();

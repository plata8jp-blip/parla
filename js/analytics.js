// Medición de uso con GoatCounter (gratis, sin cookies y sin datos personales).
// No hace falta banner de cookies: no guarda nada en el navegador ni identifica a nadie.
//
// 1. Crea una cuenta gratuita en https://www.goatcounter.com y elige un código, p. ej. "parla".
// 2. Escríbelo abajo. Tu panel estará en https://parla.goatcounter.com
//
// Qué se mide:
// - Visitas y visitantes únicos por día (automático).
// - Eventos del juego: registros, invitados, idioma elegido, lecciones y unidades
//   completadas, lecciones abandonadas y días de racha alcanzados.
// Nunca se envían nombres, correos ni respuestas.

window.ANALYTICS_CONFIG = {
  goatcounter: ""   // tu código de GoatCounter, p. ej. "parla"
};

(function () {
  const code = window.ANALYTICS_CONFIG.goatcounter;
  const queue = [];

  if (code) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
    s.onload = () => { while (queue.length) send(queue.shift()); };
    document.head.appendChild(s);
  }

  function send(path) {
    try { window.goatcounter.count({ path, title: path, event: true }); } catch {}
  }

  window.Analytics = {
    event(path) {
      if (!code) return;
      if (window.goatcounter?.count) send(path); else queue.push(path);
    }
  };
})();

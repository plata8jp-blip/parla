(function () {
  const app = document.getElementById("app");
  const COURSES = window.PARLA_COURSES, STOPS = window.PARLA_STOPS;
  const FREEZE_COST = 100, FREEZE_MAX = 2;

  // ---------- utilidades ----------
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clean = (s) => s.toLowerCase().replace(/[¿?¡!.,;:"«»]/g, "").replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
  const loose = (s) => clean(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
  const words = (s) => s.split(" ").filter((t) => /\p{L}/u.test(t));

  const ICON = {
    flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-9.5z" fill="currentColor"/></svg>',
    stamp: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.2"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    route: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2.5" fill="currentColor"/><circle cx="18" cy="6" r="2.5" fill="currentColor"/><path d="M8 17c6 0 2-9 8-10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2.5 2.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21a8 8 0 0 1 16 0z" fill="currentColor"/></svg>'
  };

  // ---------- voz ----------
  const Voice = {
    voices: [],
    ok: "speechSynthesis" in window,
    init() {
      if (!this.ok) return;
      const load = () => (this.voices = speechSynthesis.getVoices());
      load(); speechSynthesis.onvoiceschanged = load;
    },
    speak(text, lang, slow) {
      if (!this.ok) return toast("Tu navegador no puede reproducir audio de voz.");
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = this.voices.find((v) => v.lang === lang && v.localService) || this.voices.find((v) => v.lang === lang) || this.voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      u.rate = slow ? 0.55 : 0.92;
      speechSynthesis.speak(u);
    }
  };
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---------- UI comunes ----------
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2400);
    setTimeout(() => t.remove(), 2800);
  }

  function modal(html, mount) {
    const el = document.createElement("div");
    el.className = "modal-back";
    el.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-close]")) close(); });
    mount && mount(el.querySelector(".modal"), close);
    el.querySelector("button, input")?.focus();
    return close;
  }

  const u = () => Store.user;
  const course = () => COURSES[u().course];
  const progressOf = (lang) => u().progress[lang] || 0;

  function topbar() {
    return `<header class="topbar">
      <button class="chip chip-lang" data-go="courses" aria-label="Cambiar idioma"><b style="background:${course().color}">${course().flag}</b>${course().name}</button>
      <div class="stats">
        <span class="stat stat-streak" title="Racha de días">${ICON.flame}<b>${u().streak}</b></span>
        <span class="stat stat-stamps" title="Sellos">${ICON.stamp}<b>${u().stamps}</b></span>
      </div>
    </header>`;
  }

  function bottomNav(active) {
    const item = (id, label, icon) => `<button class="nav-item ${active === id ? "on" : ""}" data-go="${id}">${ICON[icon]}<span>${label}</span></button>`;
    return `<nav class="bottomnav">${item("home", "Ruta", "route")}${item("profile", "Perfil", "user")}</nav>`;
  }

  // ---------- pantallas ----------
  const Screens = {};

  Screens.auth = (mode = "login", notice = "") => {
    app.innerHTML = `
    <main class="auth">
      <section class="auth-hero">
        <div class="logo">parla<i></i><span class="beta">beta</span></div>
        <h1>Tu pasaporte a otro idioma.</h1>
        <p class="lead">Lecciones de tres minutos con audio en cada palabra, frases que de verdad usarás y una ruta por ciudades del mundo. Cada unidad que terminas te sella el pasaporte.</p>
        <div class="hero-demo" aria-hidden="true">
          <div class="demo-card">
            <span class="eyebrow">¿Cómo se dice «gracias» en italiano?</span>
            <div class="demo-opts"><span>prego</span><span class="ok">grazie</span><span>ciao</span></div>
          </div>
          <div class="stamp-big"><small>ROMA</small><strong>Unidad 1</strong><small>SELLADO</small></div>
        </div>
        <ul class="facts"><li><b>4</b> idiomas</li><li><b>60</b> paradas</li><li><b>Gratis</b> sin anuncios</li></ul>
      </section>
      <section class="auth-card">
        <div class="tabs" role="tablist">
          <button role="tab" class="${mode === "login" ? "on" : ""}" data-mode="login">Iniciar sesión</button>
          <button role="tab" class="${mode === "register" ? "on" : ""}" data-mode="register">Crear cuenta</button>
        </div>
        ${notice ? `<p class="notice">${esc(notice)}</p>` : ""}
        <form id="authForm" novalidate>
          ${mode === "register" ? `<label for="f-name">Nombre<input id="f-name" autocomplete="name" placeholder="Cómo quieres que te llamemos"></label>` : ""}
          <label for="f-email">Correo electrónico<input id="f-email" type="email" autocomplete="email" placeholder="tu@correo.com"></label>
          <label for="f-pass">Contraseña<input id="f-pass" type="password" autocomplete="${mode === "register" ? "new-password" : "current-password"}" placeholder="Mínimo 6 caracteres"></label>
          <p class="form-error" id="authErr" hidden></p>
          <button class="btn btn-primary btn-block" type="submit">${mode === "register" ? "Crear cuenta gratis" : "Entrar"}</button>
        </form>
        ${u()?.guest ? `<button class="btn btn-text btn-block" data-go="home">← Seguir como invitado</button>` : `<div class="or"><span>o</span></div><button class="btn btn-ghost btn-block" data-act="guest">Probar sin cuenta</button>`}
        <p class="fine">Parla está en beta y es gratis. Tu cuenta y tu progreso se guardan en este navegador. Contamos las visitas de forma anónima, sin cookies.</p>
      </section>
    </main>`;
    app.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => Screens.auth(b.dataset.mode, notice)));
    app.querySelector("#authForm").onsubmit = async (e) => {
      e.preventDefault();
      const err = app.querySelector("#authErr");
      try {
        const email = app.querySelector("#f-email").value, pass = app.querySelector("#f-pass").value;
        if (mode === "register") await Store.register(app.querySelector("#f-name").value, email, pass);
        else await Store.login(email, pass);
        go(u().course ? "home" : "courses");
        toast(mode === "register" ? `Bienvenido a Parla, ${u().name}` : `Hola de nuevo, ${u().name}`);
      } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    };
  };

  Screens.courses = () => {
    const first = !u().course;
    app.innerHTML = `<main class="page courses">
      ${first ? "" : `<button class="link-back" data-go="home">← Volver a la ruta</button>`}
      <h1>${first ? "¿Qué idioma quieres aprender?" : "Cambiar de idioma"}</h1>
      <p class="lead">Tu progreso en cada idioma se guarda por separado.</p>
      <div class="course-grid">
        ${Object.entries(COURSES).map(([id, c]) => {
          const p = progressOf(id), total = c.units.length * STOPS.length;
          return `<button class="course-card ${u().course === id ? "on" : ""}" data-course="${id}">
            <b class="flag" style="background:${c.color}">${c.flag}</b>
            <span class="c-name">${c.name}</span>
            <span class="c-meta">${p ? `${p} de ${total} paradas` : `Empieza en ${c.units[0].city}`}</span>
            <span class="meter"><i style="width:${(p / total) * 100}%"></i></span>
          </button>`;
        }).join("")}
      </div>
    </main>`;
    app.querySelectorAll("[data-course]").forEach((b) => (b.onclick = () => {
      u().course = b.dataset.course; Store.save(); Store.track(`idioma/${b.dataset.course}`);
      go("home");
    }));
  };

  Screens.home = () => {
    Store.tick();
    const c = course(), done = progressOf(u().course);
    const offsets = [0, 46, 70, 46, 0, -46, -70, -46];
    let n = 0;
    const units = c.units.map((unit, ui) => {
      const nodes = STOPS.map((s, si) => {
        const idx = ui * STOPS.length + si, off = offsets[n++ % offsets.length];
        const state = idx < done ? "done" : idx === done ? "current" : "locked";
        const icon = state === "done" ? ICON.check : state === "locked" ? ICON.lock : `<span>${si + 1}</span>`;
        return `<div class="stop" style="--x:${off}px">
          <button class="node node-${state} kind-${s.kind}" data-stop="${ui},${si}" aria-label="${s.label}, unidad ${ui + 1}${state === "locked" ? " (bloqueada)" : ""}">${icon}</button>
          ${state === "current" ? `<span class="node-label">Empezar · ${s.label}</span>` : `<span class="node-cap">${s.label}</span>`}
        </div>`;
      }).join("");
      return `<section class="unit ${unit.plus ? "unit-bonus" : ""}">
        <header class="unit-head" style="--uc:${c.color}">
          <span class="eyebrow">Unidad ${ui + 1} · ${unit.city}${unit.plus ? ' · <em class="plus-tag">Bonus</em>' : ""}</span>
          <h2>${unit.title}</h2>
          <p>${unit.w.slice(0, 3).map((w) => esc(w[0])).join(", ")}…</p>
        </header>
        <div class="stops">${nodes}</div>
      </section>`;
    }).join("");

    app.innerHTML = `${topbar()}
      <main class="page home">
        ${u().guest ? `<div class="guest-bar"><span>Juegas como invitado. Crea una cuenta para no perder tu progreso.</span><button class="btn btn-small" data-act="toRegister">Crear cuenta</button></div>` : ""}
        <div class="level-strip">
          <span>Nivel <b>${Store.level()}</b></span>
          <span class="meter"><i style="width:${u().xp % 100}%"></i></span>
          <span class="xp">${u().xp % 100}/100 XP</span>
        </div>
        <div class="route">${units}</div>
      </main>
      ${bottomNav("home")}`;
    app.querySelectorAll("[data-stop]").forEach((b) => (b.onclick = () => {
      const [ui, si] = b.dataset.stop.split(",").map(Number);
      if (ui * STOPS.length + si > done) return toast("Completa la parada anterior para desbloquear esta.");
      startLesson(ui, si);
    }));
    app.querySelector(".node-current")?.scrollIntoView({ block: "center" });
  };

  Screens.profile = () => {
    const stamps = [];
    Object.entries(COURSES).forEach(([id, c]) => c.units.forEach((unit, ui) => {
      if (progressOf(id) >= (ui + 1) * STOPS.length) stamps.push({ city: unit.city, lang: c.name, color: c.color });
    }));
    const canFreeze = u().freezes < FREEZE_MAX;
    app.innerHTML = `${topbar()}
    <main class="page profile">
      <section class="me">
        <span class="avatar">${esc(u().name[0].toUpperCase())}</span>
        <div><h1>${esc(u().name)}</h1><p>${u().guest ? "Invitado · sin cuenta" : esc(u().email)}</p></div>
      </section>
      <div class="kpis">
        <div><b>${Store.level()}</b><span>Nivel</span></div>
        <div><b>${u().xp}</b><span>XP total</span></div>
        <div><b>${u().streak}</b><span>Días de racha</span></div>
        <div><b>${u().lessonsDone}</b><span>Lecciones</span></div>
      </div>
      <h2 class="section-title">Mi pasaporte</h2>
      <div class="passport">${stamps.length ? stamps.map((s, i) => `<div class="pstamp" style="--c:${s.color};--r:${((i * 37) % 17) - 8}deg"><small>${s.lang}</small><strong>${s.city}</strong><small>SELLADO</small></div>`).join("")
        : `<p class="empty">Termina el desafío de una unidad para conseguir tu primer sello.</p>`}</div>
      <h2 class="section-title">Usa tus sellos</h2>
      <div class="items">
        <div class="item"><div><b>Protector de racha</b><span>Salva tu racha si un día no practicas. Tienes ${u().freezes} de ${FREEZE_MAX}.</span></div>
          <button class="btn btn-small" data-act="freeze" ${canFreeze ? "" : "disabled"}>${ICON.stamp} ${FREEZE_COST}</button></div>
      </div>
      <div class="account">
        ${u().guest ? `<button class="btn btn-primary btn-block" data-act="toRegister">Crear cuenta y guardar progreso</button>` : ""}
        <button class="btn btn-ghost btn-block" data-act="logout">${u().guest ? "Salir del modo invitado" : "Cerrar sesión"}</button>
      </div>
    </main>${bottomNav("profile")}`;
  };

  // ---------- motor de lecciones ----------
  function buildExercises(lang, ui, kind) {
    const c = COURSES[lang], unit = c.units[ui];
    const allW = c.units.flatMap((x) => x.w), allP = c.units.flatMap((x) => x.p);
    const others = (pool, it, n, side) => pick([...new Set(pool.filter((x) => x[0] !== it[0] && x[1] !== it[1]).map((x) => x[side]))], n);
    const meaning = (it, pool) => ({ type: "choice", mode: "meaning", title: "¿Qué significa?", item: it, options: shuffle([it[1], ...others(pool, it, 3, 1)]), answer: it[1] });
    const reverse = (it, pool) => ({ type: "choice", mode: "reverse", title: `¿Cómo se dice «${it[1]}»?`, item: it, options: shuffle([it[0], ...others(pool, it, 3, 0)]), answer: it[0] });
    const listen = (it, pool) => ({ type: "choice", mode: "listen", title: "¿Qué has oído?", item: it, options: shuffle([it[0], ...others(pool, it, 3, 0)]), answer: it[0] });
    const typed = (it) => ({ type: "type", title: "Escribe lo que oyes", item: it, answer: it[0] });
    const build = (it, audio) => {
      const tokens = words(it[0]).map((t) => t.replace(/[¿?¡!.,]/g, ""));
      const extra = pick([...new Set(allP.filter((p) => p !== it).flatMap((p) => words(p[0])))].filter((t) => !tokens.includes(t)), Math.min(3, tokens.length));
      return { type: "build", audio, title: audio ? "Ordena lo que oyes" : "Traduce esta frase", item: it, tiles: shuffle([...tokens, ...extra]), answer: tokens.join(" ") };
    };
    const match = (items) => ({ type: "match", title: "Une cada pareja", pairs: items });
    const speak = (it) => ({ type: "speak", title: "Dilo en voz alta", item: it, answer: it[0] });

    if (kind === "words") {
      const makers = [meaning, reverse, listen];
      return [...shuffle(unit.w.map((w, i) => makers[i % 3](w, allW))), ...pick(unit.w, 2).map(typed), match(unit.w)];
    }
    if (kind === "phrases") {
      const P = unit.p;
      return [build(P[0]), meaning(P[1], allP), build(P[1]), reverse(P[2], allP), build(P[2], true), listen(P[0], allP), meaning(P[2], allP), build(P[1], true)];
    }
    const list = [...pick(unit.w, 2).map((w) => listen(w, allW)), ...pick(unit.w, 2).map(typed), ...pick(unit.p, 2).map((p) => build(p, true)), match(unit.w), typed(pick(unit.p, 1)[0])];
    if (Recognition) list.splice(4, 0, speak(pick(unit.p, 1)[0]));
    return list;
  }

  let L = null; // estado de la lección en curso

  function startLesson(ui, si) {
    const lang = u().course, kind = STOPS[si].kind;
    const queue = buildExercises(lang, ui, kind);
    L = { lang, ui, si, kind, voice: COURSES[lang].voice, queue, total: queue.length, i: 0, firstTry: 0, mistakes: 0, answered: false, value: null };
    renderLesson();
  }

  function say(text, slow) { if (L) Voice.speak(text, L.voice, slow); }

  function renderLesson() {
    const ex = L.queue[L.i];
    L.answered = false; L.value = null;
    app.innerHTML = `<div class="lesson">
      <header class="lesson-top">
        <button class="icon-btn" data-act="quit" aria-label="Salir de la lección">${ICON.close}</button>
        <div class="bar" role="progressbar" aria-valuenow="${L.i}" aria-valuemax="${L.queue.length}"><i style="width:${(L.i / L.queue.length) * 100}%"></i></div>
      </header>
      <section class="ex" id="ex">
        ${ex.retry ? '<span class="eyebrow retry">Error anterior · otra oportunidad</span>' : ""}
        <h2 class="ex-title">${esc(ex.title)}</h2>
        <div class="ex-body"></div>
      </section>
      <footer class="lesson-foot" id="foot">
        <div class="foot-inner">
          <div class="feedback" id="fb"></div>
          <button class="btn btn-primary" id="check" disabled>Comprobar</button>
        </div>
      </footer>
    </div>`;
    const body = app.querySelector(".ex-body");
    const ready = (v) => { L.value = v; app.querySelector("#check").disabled = v == null || v === ""; };
    Renderers[ex.type](ex, body, ready);
    app.querySelector("#check").onclick = () => (L.answered ? next() : check());
    app.querySelector('[data-act="quit"]').onclick = () => modal(`
      <h2>¿Salir de la lección?</h2><p>Perderás el progreso de esta lección.</p>
      <div class="stack"><button class="btn btn-primary btn-block" data-close>Seguir aprendiendo</button>
      <button class="btn btn-text btn-block" data-quit>Salir</button></div>`,
      (m, close) => (m.querySelector("[data-quit]").onclick = () => {
        close(); window.speechSynthesis?.cancel();
        Store.track(`leccion-abandonada/${L.lang}/u${L.ui + 1}-${L.kind}`);
        L = null; go("home");
      }));
  }

  const audioBtns = (text) => `<div class="audio-row">
      <button class="audio-btn" data-say="${esc(text)}" aria-label="Escuchar">${ICON.sound}</button>
      <button class="audio-btn slow" data-say="${esc(text)}" data-slow="1" aria-label="Escuchar despacio">0,5×</button></div>`;
  function wireAudio(root) {
    root.querySelectorAll("[data-say]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); say(b.dataset.say, !!b.dataset.slow); }));
  }

  const Renderers = {
    choice(ex, body, ready) {
      const targetOpts = ex.mode !== "meaning";
      body.innerHTML = `
        ${ex.mode === "meaning" ? `<div class="prompt-card">${audioBtns(ex.item[0])}<p class="prompt-text">${esc(ex.item[0])}</p></div>` : ""}
        ${ex.mode === "listen" ? `<div class="prompt-card listen">${audioBtns(ex.item[0])}</div>` : ""}
        <div class="options">${ex.options.map((o, i) => `<button class="opt" data-v="${esc(o)}"><kbd>${i + 1}</kbd><span>${esc(o)}</span>${targetOpts ? `<i class="opt-sound">${ICON.sound}</i>` : ""}</button>`).join("")}</div>`;
      wireAudio(body);
      body.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        if (L.answered) return;
        body.querySelectorAll(".opt").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel"); ready(b.dataset.v);
        if (targetOpts) say(b.dataset.v);
      }));
      if (ex.mode !== "reverse") setTimeout(() => say(ex.item[0]), 250);
    },

    type(ex, body, ready) {
      body.innerHTML = `<div class="prompt-card listen">${audioBtns(ex.item[0])}</div>
        <label class="sr" for="typed">Escribe lo que oyes</label>
        <textarea id="typed" class="typed" rows="2" placeholder="Escribe en ${COURSES[L.lang].name.toLowerCase()}…" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>`;
      wireAudio(body);
      const t = body.querySelector("#typed");
      t.oninput = () => ready(t.value.trim() || null);
      t.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); if (L.value) check(); } };
      setTimeout(() => { say(ex.item[0]); t.focus(); }, 250);
    },

    build(ex, body, ready) {
      body.innerHTML = `
        ${ex.audio ? `<div class="prompt-card listen">${audioBtns(ex.item[0])}</div>` : `<div class="prompt-card"><p class="prompt-text es">${esc(ex.item[1])}</p></div>`}
        <div class="answer-line" aria-label="Tu respuesta"></div>
        <div class="bank">${ex.tiles.map((t, i) => `<button class="tile" data-i="${i}">${esc(t)}</button>`).join("")}</div>`;
      wireAudio(body);
      const line = body.querySelector(".answer-line"), chosen = [];
      const update = () => {
        line.innerHTML = chosen.map((i) => `<button class="tile in" data-i="${i}">${esc(ex.tiles[i])}</button>`).join("");
        body.querySelectorAll(".bank .tile").forEach((b) => b.classList.toggle("used", chosen.includes(+b.dataset.i)));
        line.querySelectorAll(".tile").forEach((b) => (b.onclick = () => { if (L.answered) return; chosen.splice(chosen.indexOf(+b.dataset.i), 1); update(); }));
        ready(chosen.length ? chosen.map((i) => ex.tiles[i]).join(" ") : null);
      };
      body.querySelectorAll(".bank .tile").forEach((b) => (b.onclick = () => {
        if (L.answered || chosen.includes(+b.dataset.i)) return;
        chosen.push(+b.dataset.i); say(ex.tiles[+b.dataset.i]); update();
      }));
      if (ex.audio) setTimeout(() => say(ex.item[0]), 250);
    },

    match(ex, body, ready) {
      const left = shuffle(ex.pairs.map((p) => p[0])), right = shuffle(ex.pairs.map((p) => p[1]));
      body.innerHTML = `<div class="match">
        <div class="col">${left.map((t) => `<button class="mt" data-side="0" data-v="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        <div class="col">${right.map((t) => `<button class="mt" data-side="1" data-v="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`;
      let sel = [null, null], matched = 0, hadError = false;
      body.querySelectorAll(".mt").forEach((b) => (b.onclick = () => {
        if (b.classList.contains("gone")) return;
        const side = +b.dataset.side;
        if (side === 0) say(b.dataset.v);
        body.querySelectorAll(`.mt[data-side="${side}"]`).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel"); sel[side] = b;
        if (sel[0] && sel[1]) {
          const ok = ex.pairs.some((p) => p[0] === sel[0].dataset.v && p[1] === sel[1].dataset.v);
          const pair = sel; sel = [null, null];
          pair.forEach((x) => x.classList.remove("sel"));
          if (ok) {
            pair.forEach((x) => x.classList.add("gone"));
            if (++matched === ex.pairs.length) { L.matchClean = !hadError; ready("done"); check(); }
          } else {
            hadError = true; L.mistakes++;
            pair.forEach((x) => { x.classList.add("shake"); setTimeout(() => x.classList.remove("shake"), 450); });
          }
        }
      }));
    },

    speak(ex, body, ready) {
      body.innerHTML = `<div class="prompt-card">${audioBtns(ex.item[0])}<p class="prompt-text">${esc(ex.item[0])}</p><p class="prompt-sub">${esc(ex.item[1])}</p></div>
        <button class="mic-btn" id="mic">${ICON.mic}<span>Pulsa y habla</span></button>
        <p class="heard" id="heard" aria-live="polite"></p>
        <button class="btn btn-text" id="skipSpeak">No puedo hablar ahora</button>`;
      wireAudio(body);
      const mic = body.querySelector("#mic"), heard = body.querySelector("#heard");
      mic.onclick = () => {
        const r = new Recognition(); r.lang = L.voice; r.interimResults = false; r.maxAlternatives = 3;
        mic.classList.add("rec"); mic.querySelector("span").textContent = "Escuchando…";
        r.onresult = (e) => {
          const alts = [...e.results[0]].map((a) => a.transcript);
          heard.textContent = `Hemos oído: «${alts[0]}»`;
          const target = loose(ex.answer).split(" ");
          const best = Math.max(...alts.map((a) => { const got = loose(a).split(" "); return target.filter((w) => got.includes(w)).length / target.length; }));
          L.speakScore = best; ready(alts[0]);
        };
        r.onerror = () => { heard.textContent = "No te hemos oído bien. Inténtalo otra vez o salta este ejercicio."; };
        r.onend = () => { mic.classList.remove("rec"); mic.querySelector("span").textContent = "Pulsa y habla"; };
        try { r.start(); } catch { heard.textContent = "El micrófono no está disponible."; }
      };
      body.querySelector("#skipSpeak").onclick = () => { L.speakScore = 1; L.skipped = true; ready("skip"); check(); };
    }
  };

  function check() {
    if (L.answered) return;
    const ex = L.queue[L.i];
    let ok = false, note = "";
    if (ex.type === "choice") ok = L.value === ex.answer;
    else if (ex.type === "build") ok = clean(L.value) === clean(ex.answer);
    else if (ex.type === "type") {
      ok = loose(L.value) === loose(ex.answer);
      if (ok && clean(L.value) !== clean(ex.answer)) note = `Cuidado con los acentos: ${ex.answer}`;
    } else if (ex.type === "match") ok = true;
    else if (ex.type === "speak") { ok = L.speakScore >= 0.6; if (L.skipped) note = "Saltado. Practícalo en otro momento."; L.skipped = false; }

    L.answered = true;
    if (ok) { if (!ex.retry && (ex.type !== "match" || L.matchClean)) L.firstTry++; }
    else {
      L.mistakes++;
      if (!ex.retry) L.queue.push({ ...ex, retry: true });
    }

    const foot = app.querySelector("#foot"), fb = app.querySelector("#fb"), btn = app.querySelector("#check");
    foot.classList.add(ok ? "is-ok" : "is-bad");
    const praise = ["¡Muy bien!", "¡Correcto!", "¡Perfecto!", "¡Así se hace!"][(Math.random() * 4) | 0];
    fb.innerHTML = ok
      ? `<strong>${ex.type === "match" ? "¡Parejas completas!" : praise}</strong>${note ? `<span>${esc(note)}</span>` : ex.item ? `<span>${esc(ex.item[0])} = ${esc(ex.item[1])}</span>` : ""}`
      : `<strong>Respuesta correcta:</strong><span class="sol">${esc(ex.answer)}</span>${ex.item ? `<button class="audio-btn small" data-say="${esc(ex.item[0])}" aria-label="Escuchar">${ICON.sound}</button>` : ""}`;
    wireAudio(fb);
    if (!ok && ex.item) say(ex.item[0]);
    btn.disabled = false; btn.textContent = "Continuar"; btn.focus();
    app.querySelectorAll(".opt").forEach((o) => { if (o.dataset.v === ex.answer) o.classList.add("right"); else if (o.classList.contains("sel")) o.classList.add("wrong"); });
  }

  function next() {
    L.i++;
    if (L.i >= L.queue.length) return finishLesson();
    renderLesson();
  }

  function finishLesson() {
    const unit = COURSES[L.lang].units[L.ui];
    const perfect = L.mistakes === 0, accuracy = Math.round((L.firstTry / L.total) * 100);
    const xp = 10 + (perfect ? 5 : 0) + (L.kind === "challenge" ? 5 : 0);
    const stamps = 5 + (perfect ? 5 : 0);
    const idx = L.ui * STOPS.length + L.si, before = progressOf(L.lang);
    const newStop = idx === before;
    if (newStop) u().progress[L.lang] = before + 1;
    const levelBefore = Store.level();
    Store.completeLesson({ xp, stamps });
    Store.track(`leccion-completada/${L.lang}/u${L.ui + 1}-${L.kind}`);
    const unitDone = newStop && L.kind === "challenge";
    if (unitDone) Store.track(`unidad-completada/${L.lang}/u${L.ui + 1}`);
    const levelUp = Store.level() > levelBefore;

    app.innerHTML = `<main class="page result">
      ${unitDone ? `<div class="stamp-big earned" style="--c:${COURSES[L.lang].color}"><small>${COURSES[L.lang].name.toUpperCase()}</small><strong>${unit.city}</strong><small>SELLADO</small></div>`
        : `<div class="result-mark">${ICON.check}</div>`}
      <h1>${unitDone ? `¡Unidad «${unit.title}» completada!` : perfect ? "¡Lección perfecta!" : "¡Lección completada!"}</h1>
      ${levelUp ? `<p class="levelup">Has subido al nivel ${Store.level()}</p>` : ""}
      <div class="kpis">
        <div><b>+${xp}</b><span>XP</span></div>
        <div><b>${accuracy}%</b><span>Precisión</span></div>
        <div><b>+${stamps}</b><span>Sellos</span></div>
        <div><b>${u().streak}</b><span>Días de racha</span></div>
      </div>
      <button class="btn btn-primary btn-block" id="cont">Continuar</button>
    </main>`;
    const cont = app.querySelector("#cont");
    cont.focus();
    cont.onclick = () => go("home");
    L = null;
  }

  // ---------- navegación ----------
  let current = "home";
  function go(screen) { current = screen; render(); window.scrollTo(0, 0); }
  function render() {
    if (!u()) return Screens.auth();
    if (!u().course && current !== "courses") current = "courses";
    if (L) return renderLesson();
    (Screens[current] || Screens.home)();
  }

  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { e.preventDefault(); document.querySelector(".modal-back")?.remove(); return go(g.dataset.go); }
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "guest") { Store.guest(); go("courses"); }
    if (act === "logout") { Store.logout(); L = null; Screens.auth("login"); toast("Sesión cerrada"); }
    if (act === "toRegister") Screens.auth("register", "Crea tu cuenta y conservarás todo lo que llevas hecho.");
    if (act === "freeze") {
      if (u().stamps < FREEZE_COST) return toast(`Te faltan ${FREEZE_COST - u().stamps} sellos. Gánalos completando lecciones.`);
      u().stamps -= FREEZE_COST; u().freezes++; Store.save();
      toast("Protector de racha activado"); Screens.profile();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!L || document.querySelector(".modal-back")) return;
    if (e.target.matches("textarea, input")) return;
    if (e.key === "Enter") { e.preventDefault(); const b = app.querySelector("#check"); if (b && !b.disabled && !e.repeat) b.click(); }
    const n = +e.key;
    if (n >= 1 && n <= 4 && !L.answered) app.querySelectorAll(".opt")[n - 1]?.click();
  });

  Voice.init();
  Store.restore();
  render();
})();

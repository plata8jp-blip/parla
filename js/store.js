// Cuentas, sesión y progreso.
// Esta versión guarda todo en el navegador (localStorage) para poder usar la app
// sin servidor. Para sincronizar entre dispositivos, sustituye las funciones de
// `Backend` por llamadas a Supabase, Firebase Auth o tu propia API: el resto de la
// app no cambia.

(function () {
  const KEY_USERS = "parla.users";
  const KEY_SESSION = "parla.session";

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento bloqueado */ }
  }

  async function hash(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0;
    return "x" + h;
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

  function newProfile(name, email) {
    return {
      name, email, createdAt: Date.now(),
      course: null, progress: {},           // progress[lang] = número de paradas completadas
      xp: 0, stamps: 40,
      streak: 0, lastDay: null, freezes: 0,
      lessonsDone: 0
    };
  }

  // ---- Backend local (reemplazable) ----
  const Backend = {
    async register(name, email, password) {
      const users = read(KEY_USERS, {});
      const id = email.trim().toLowerCase();
      if (users[id]) throw new Error("Ya existe una cuenta con ese correo. Inicia sesión.");
      const salt = Math.random().toString(36).slice(2);
      users[id] = { salt, hash: await hash(salt + password), profile: newProfile(name.trim(), id) };
      write(KEY_USERS, users);
      return users[id].profile;
    },
    async login(email, password) {
      const users = read(KEY_USERS, {});
      const u = users[email.trim().toLowerCase()];
      if (!u || u.hash !== await hash(u.salt + password)) throw new Error("Correo o contraseña incorrectos.");
      return u.profile;
    },
    save(profile) {
      if (profile.guest) { write("parla.guest", profile); return; }
      const users = read(KEY_USERS, {});
      if (users[profile.email]) { users[profile.email].profile = profile; write(KEY_USERS, users); }
    },
    remove(profile) {
      try {
        if (profile.guest) { localStorage.removeItem("parla.guest"); return; }
        const users = read(KEY_USERS, {});
        delete users[profile.email];
        write(KEY_USERS, users);
      } catch {}
    }
  };

  const Store = {
    user: null,

    restore() {
      const s = read(KEY_SESSION, null);
      if (!s) return null;
      if (s === "guest") this.user = read("parla.guest", null);
      else this.user = read(KEY_USERS, {})[s]?.profile || null;
      if (this.user) this.tick();
      return this.user;
    },

    async register(name, email, password) {
      if (name.trim().length < 2) throw new Error("Escribe tu nombre (mínimo 2 letras).");
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Ese correo no parece válido.");
      if (password.length < 6) throw new Error("La contraseña necesita al menos 6 caracteres.");
      const profile = await Backend.register(name, email, password);
      // Si venía jugando como invitado, conserva su progreso.
      if (this.user?.guest) {
        const keep = ["course", "progress", "xp", "stamps", "streak", "lastDay", "freezes", "lessonsDone", "createdAt"];
        keep.forEach(k => profile[k] = this.user[k]);
        try { localStorage.removeItem("parla.guest"); } catch {}
      }
      this.user = profile; Backend.save(profile);
      write(KEY_SESSION, profile.email);
      this.track("registro");
      return profile;
    },

    async login(email, password) {
      this.user = await Backend.login(email, password);
      write(KEY_SESSION, this.user.email);
      this.tick(); this.track("inicio-sesion");
      return this.user;
    },

    guest() {
      this.user = read("parla.guest", null) || { ...newProfile("Viajero", null), guest: true };
      Backend.save(this.user); write(KEY_SESSION, "guest");
      this.track("invitado");
      return this.user;
    },

    logout() {
      this.user = null;
      try { localStorage.removeItem(KEY_SESSION); } catch {}
    },

    save() { if (this.user) Backend.save(this.user); },

    // Derecho de supresión: borra la cuenta (o el perfil de invitado) de este navegador.
    deleteAccount() {
      if (!this.user) return;
      Backend.remove(this.user);
      this.logout();
    },

    // Derecho de portabilidad: los datos del perfil en JSON (sin la contraseña cifrada).
    exportData() {
      const { name, email, createdAt, course, progress, xp, stamps, streak, lastDay, freezes, lessonsDone, guest, termsAcceptedAt, termsVersion } = this.user;
      return JSON.stringify({ app: "Parla", exportadoEl: new Date().toISOString(), perfil: { name, email, guest: !!guest, createdAt: new Date(createdAt).toISOString(), course, progress, xp, stamps, streak, lastDay, freezes, lessonsDone, termsAcceptedAt, termsVersion } }, null, 2);
    },

    // Comprueba la racha al abrir la app (usa un protector si se saltó un día).
    tick() {
      const u = this.user; if (!u) return;
      if (u.lastDay && daysBetween(u.lastDay, today()) > 1) {
        if (u.freezes > 0) { u.freezes--; u.lastDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10); }
        else u.streak = 0;
      }
      this.save();
    },

    completeLesson({ xp, stamps }) {
      const u = this.user;
      u.xp += xp; u.stamps += stamps; u.lessonsDone++;
      const d = today();
      if (u.lastDay !== d) {
        u.streak = (u.lastDay && daysBetween(u.lastDay, d) === 1) ? u.streak + 1 : 1;
        u.lastDay = d;
        this.track(`racha/${u.streak}-dias`);
      }
      this.save();
    },

    level() { return Math.floor(this.user.xp / 100) + 1; },

    // Eventos anónimos de uso (ver js/analytics.js).
    track(name) { window.Analytics?.event(name); }
  };

  window.Store = Store;
})();

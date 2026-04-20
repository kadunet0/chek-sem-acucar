(function () {
  "use strict";

  const START = new Date(2026, 3, 21); // 21/04/2026 (mês 3 = abril)
  const DAYS_COUNT = 30;
  const PEOPLE = [
    { id: "carlos", label: "C", name: "Carlos" },
    { id: "amanda", label: "Am", name: "Amanda" },
    { id: "ana", label: "An", name: "Ana" },
  ];

  const STORAGE_KEY = "chek-sem-acucar-v1";
  const RT_PATH = "chekSemAcucar";

  /** @type {Record<string, Record<string, boolean>>} */
  let state = {};

  /** @type {any} */
  let dbRef = null;
  let useFirebase = false;
  let migrationChecked = false;

  const cfg = typeof window !== "undefined" ? window.__CHEK_FIREBASE__ : null;

  function isEmptyState(obj) {
    return !obj || typeof obj !== "object" || Object.keys(obj).length === 0;
  }

  /** @returns {Record<string, Record<string, boolean>>} */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveStateMirror() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }

  function formatDay(date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  function weekday(date) {
    return date.toLocaleDateString("pt-BR", { weekday: "long" });
  }

  function isSameCalendarDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  /** @param {string} dayKey */
  function getDayChecks(dayKey) {
    const d = state[dayKey];
    return d && typeof d === "object" ? d : {};
  }

  const tickSvg = `
    <svg class="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const daysEl = document.getElementById("days");
  const statsEl = document.getElementById("stats");
  const resetBtn = document.getElementById("resetBtn");
  const syncStatusEl = document.getElementById("syncStatus");

  function getDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function setSyncStatus() {
    if (!syncStatusEl) return;
    if (useFirebase && dbRef) {
      syncStatusEl.hidden = false;
      syncStatusEl.textContent =
        "Sincronizado em tempo real — quando alguém marca, todo mundo vê na hora.";
      syncStatusEl.classList.remove("sync-offline");
    } else {
      syncStatusEl.hidden = false;
      syncStatusEl.textContent =
        "Só neste aparelho. Preencha firebase-config.js com seu projeto Firebase (Realtime Database) para sincronizar entre todos.";
      syncStatusEl.classList.add("sync-offline");
    }
  }

  function renderStats() {
    const counts = { carlos: 0, amanda: 0, ana: 0 };
    for (let i = 0; i < DAYS_COUNT; i++) {
      const d = addDays(START, i);
      const key = getDayKey(d);
      const day = getDayChecks(key);
      PEOPLE.forEach((p) => {
        if (day[p.id]) counts[p.id]++;
      });
    }
    statsEl.innerHTML = `
      <span class="stat-pill"><strong>Carlos</strong> ${counts.carlos}/${DAYS_COUNT}</span>
      <span class="stat-pill"><strong>Amanda</strong> ${counts.amanda}/${DAYS_COUNT}</span>
      <span class="stat-pill"><strong>Ana</strong> ${counts.ana}/${DAYS_COUNT}</span>
    `;
  }

  function render() {
    const today = new Date();
    daysEl.innerHTML = "";

    for (let i = 0; i < DAYS_COUNT; i++) {
      const date = addDays(START, i);
      const key = getDayKey(date);
      const dayChecks = getDayChecks(key);

      const row = document.createElement("article");
      row.className = "day-row";
      if (isSameCalendarDay(date, today)) row.classList.add("today");

      const info = document.createElement("div");
      info.className = "day-info";
      info.innerHTML = `
        <span class="day-label">Dia ${i + 1} · ${formatDay(date)}</span>
        <span class="day-weekday">${weekday(date)}</span>
      `;

      const checks = document.createElement("div");
      checks.className = "checks";
      checks.setAttribute("role", "group");
      checks.setAttribute("aria-label", `Dia ${i + 1}`);

      PEOPLE.forEach((person) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "check-btn";
        btn.dataset.person = person.id;
        btn.dataset.dayKey = key;
        btn.setAttribute(
          "aria-label",
          `${person.name}, sem açúcar em ${formatDay(date)}`
        );
        const on = !!dayChecks[person.id];
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        if (on) btn.classList.add("on");

        const initial = `<span class="initial" title="${person.name}">${person.label}</span>`;
        btn.innerHTML = initial + tickSvg;

        btn.addEventListener("click", () => {
          const cur = !!getDayChecks(key)[person.id];
          const next = !cur;
          if (useFirebase && dbRef) {
            const leaf = dbRef.child(key).child(person.id);
            if (next) leaf.set(true);
            else leaf.remove();
            return;
          }
          if (!state[key]) state[key] = {};
          if (next) state[key][person.id] = true;
          else delete state[key][person.id];
          if (Object.keys(state[key]).length === 0) delete state[key];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          } catch {
            /* ignore */
          }
          render();
        });

        checks.appendChild(btn);
      });

      row.appendChild(info);
      row.appendChild(checks);
      daysEl.appendChild(row);
    }

    renderStats();
  }

  function initFirebase() {
    if (
      !cfg ||
      !cfg.apiKey ||
      !cfg.databaseURL ||
      typeof firebase === "undefined"
    ) {
      return false;
    }
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      dbRef = firebase.database().ref(RT_PATH);
      useFirebase = true;
      setSyncStatus();

      dbRef.on("value", (snap) => {
        let remote = snap.val();
        if (remote === null || typeof remote !== "object") remote = {};

        if (!migrationChecked) {
          migrationChecked = true;
          if (isEmptyState(remote) && !isEmptyState(loadState())) {
            dbRef.set(loadState());
            return;
          }
        }

        state = remote;
        saveStateMirror();
        render();
      });

      return true;
    } catch (e) {
      console.warn("Firebase init falhou, usando localStorage.", e);
      useFirebase = false;
      dbRef = null;
      return false;
    }
  }

  function initLocalOnly() {
    state = loadState();
    setSyncStatus();
    render();
  }

  resetBtn.addEventListener("click", () => {
    const msg = useFirebase
      ? "Apagar todas as marcações para Carlos, Amanda e Ana em todos os aparelhes?"
      : "Apagar todas as marcações deste aparelho? Esta ação não pode ser desfeita.";
    if (!confirm(msg)) return;

    if (useFirebase && dbRef) {
      dbRef.remove();
    } else {
      state = {};
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* ignore */
      }
      render();
    }
  });

  if (!initFirebase()) {
    initLocalOnly();
  }
})();

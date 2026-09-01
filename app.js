(function () {
  "use strict";

  const START = new Date(2026, 8, 2); // 02/09/2026 (mês 8 = setembro)
  const DAYS_COUNT = 30;
  const PEOPLE = [
    { id: "amanda", label: "Am", name: "Amanda", daysCount: DAYS_COUNT },
    { id: "lorena", label: "Lo", name: "Lorena", daysCount: DAYS_COUNT },
    { id: "todaro", label: "T", name: "Todaro", daysCount: DAYS_COUNT },
  ];
  const ROWS_COUNT = Math.max(...PEOPLE.map((p) => p.daysCount));

  const STORAGE_KEY = "chek-sem-acucar-v2";
  const RT_PATH = "chekSemAcucarV2";

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
    } else if (cfg && cfg.apiKey && cfg.databaseURL) {
      syncStatusEl.hidden = false;
      syncStatusEl.textContent =
        "Só neste aparelho. No Firebase Console, libere leitura/escrita em chekSemAcucar (Realtime Database → Regras).";
      syncStatusEl.classList.add("sync-offline");
    } else {
      syncStatusEl.hidden = false;
      syncStatusEl.textContent =
        "Só neste aparelho. Preencha firebase-config.js com seu projeto Firebase (Realtime Database) para sincronizar entre todos.";
      syncStatusEl.classList.add("sync-offline");
    }
  }

  function renderStats() {
    const counts = Object.fromEntries(PEOPLE.map((p) => [p.id, 0]));
    PEOPLE.forEach((person) => {
      for (let i = 0; i < person.daysCount; i++) {
        const d = addDays(START, i);
        const key = getDayKey(d);
        const day = getDayChecks(key);
        if (day[person.id]) counts[person.id]++;
      }
    });
    statsEl.innerHTML = PEOPLE.map((p) => {
      const pct = p.daysCount ? Math.round((counts[p.id] / p.daysCount) * 100) : 0;
      return `
        <div class="stat-row">
          <span class="stat-name">${p.name}</span>
          <span class="stat-track">
            <span class="stat-fill ${p.id}" style="width: ${pct}%"></span>
          </span>
          <span class="stat-count">${counts[p.id]}/${p.daysCount}</span>
        </div>
      `;
    }).join("");
  }

  function render() {
    const today = new Date();
    daysEl.innerHTML = "";

    for (let i = 0; i < ROWS_COUNT; i++) {
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
        const active = i < person.daysCount;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "check-btn";
        if (!active) btn.classList.add("inactive");
        btn.dataset.person = person.id;
        btn.dataset.dayKey = key;
        btn.disabled = !active;
        btn.setAttribute(
          "aria-label",
          active
            ? `${person.name}, sem açúcar em ${formatDay(date)}`
            : `${person.name}, fora do período neste dia`
        );
        const on = active && !!dayChecks[person.id];
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        if (on) btn.classList.add("on");

        const initial = `<span class="initial" title="${person.name}">${person.label}</span>`;
        btn.innerHTML = initial + tickSvg;

        btn.addEventListener("click", () => {
          if (!active) return;
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

  function disableFirebase(reason, err) {
    console.warn(reason, err || "");
    if (dbRef) {
      dbRef.off();
      dbRef = null;
    }
    useFirebase = false;
    state = loadState();
    setSyncStatus();
    render();
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

      // Mostra os dias na hora; o listener atualiza quando o Firebase responder.
      state = loadState();
      render();

      dbRef.on(
        "value",
        (snap) => {
          let remote = snap.val();
          if (remote === null || typeof remote !== "object") remote = {};

          if (!migrationChecked) {
            migrationChecked = true;
            const local = loadState();
            if (isEmptyState(remote) && !isEmptyState(local)) {
              state = local;
              render();
              dbRef.set(local).catch((e) => {
                disableFirebase(
                  "Não foi possível enviar dados locais ao Firebase.",
                  e
                );
              });
              return;
            }
          }

          state = remote;
          saveStateMirror();
          render();
        },
        (err) => {
          disableFirebase(
            "Firebase sem permissão ou indisponível — usando só este aparelho.",
            err
          );
        }
      );

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
      ? "Apagar todas as marcações para Amanda, Lorena e Todaro em todos os aparelhes?"
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

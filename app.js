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

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const tickSvg = `
    <svg class="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const daysEl = document.getElementById("days");
  const statsEl = document.getElementById("stats");
  const resetBtn = document.getElementById("resetBtn");

  let state = loadState();

  function getDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function renderStats() {
    const counts = { carlos: 0, amanda: 0, ana: 0 };
    for (let i = 0; i < DAYS_COUNT; i++) {
      const d = addDays(START, i);
      const key = getDayKey(d);
      const day = state[key] || {};
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
      if (!state[key]) state[key] = {};

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
        btn.setAttribute("aria-pressed", state[key][person.id] ? "true" : "false");
        if (state[key][person.id]) btn.classList.add("on");

        const initial = `<span class="initial" title="${person.name}">${person.label}</span>`;
        btn.innerHTML = initial + tickSvg;

        btn.addEventListener("click", () => {
          state[key][person.id] = !state[key][person.id];
          btn.classList.toggle("on", state[key][person.id]);
          btn.setAttribute("aria-pressed", state[key][person.id] ? "true" : "false");
          saveState(state);
          renderStats();
        });

        checks.appendChild(btn);
      });

      row.appendChild(info);
      row.appendChild(checks);
      daysEl.appendChild(row);
    }

    renderStats();
  }

  resetBtn.addEventListener("click", () => {
    if (
      confirm(
        "Apagar todas as marcações deste aparelho? Esta ação não pode ser desfeita."
      )
    ) {
      state = {};
      saveState(state);
      render();
    }
  });

  render();
})();

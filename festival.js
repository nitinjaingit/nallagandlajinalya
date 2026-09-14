(() => {
  const data = window.JAIN_FESTIVAL_DARPAN;
  const list = document.querySelector("#festival-list");
  const filters = document.querySelector("#festival-filters");
  const searchInput = document.querySelector("#festival-search");
  const typeSelect = document.querySelector("#festival-type");
  const divasSelect = document.querySelector("#festival-divas");
  const resultCount = document.querySelector("#festival-result-count");
  const emptyState = document.querySelector("#festival-empty");
  const calendar = document.querySelector("#festival-calendar");
  const yearSelect = document.querySelector("#festival-year");
  const monthSelect = document.querySelector("#festival-month");
  const viewToggle = document.querySelector("#festival-view-toggle");
  const periodLabel = document.querySelector("#festival-period-label");
  const pageTitle = document.querySelector("#festival-page-title");

  if (!data || !list || !filters || !searchInput || !typeSelect || !divasSelect || !resultCount || !emptyState
    || !calendar || !yearSelect || !monthSelect || !viewToggle || !periodLabel || !pageTitle) return;

  const typeLabels = {
    tirthankar: "Tirthankar Darpan",
    acharya: "Acharya Darpan"
  };
  const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
  const numberFormatter = new Intl.NumberFormat("en-IN");
  const yearFormatter = new Intl.NumberFormat("en-IN", { useGrouping: false });
  const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" });
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
  const entries = [
    ...data.tirthankarDarpan.map((entry) => ({ ...entry, type: "tirthankar" })),
    ...data.acharyaDarpan.map((entry) => ({ ...entry, type: "acharya" }))
  ].sort((first, second) => first.date.localeCompare(second.date) || first.type.localeCompare(second.type));
  const today = new Date();
  const currentYear = String(today.getFullYear());
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const availableYears = [...new Set(entries.map((entry) => entry.date.slice(0, 4)))].sort();
  let currentView = new URLSearchParams(window.location.search).get("view") === "list" ? "list" : "calendar";

  availableYears.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = yearFormatter.format(Number(year));
    yearSelect.append(option);
  });
  yearSelect.value = availableYears.includes(currentYear) ? currentYear : availableYears.at(-1);

  Array.from({ length: 12 }, (_, index) => index).forEach((monthIndex) => {
    const option = document.createElement("option");
    option.value = String(monthIndex + 1).padStart(2, "0");
    option.textContent = monthFormatter.format(new Date(Date.UTC(2026, monthIndex, 1)));
    monthSelect.append(option);
  });
  monthSelect.value = currentMonth;

  [...new Set(entries.map((entry) => entry.divas))]
    .sort((first, second) => first.localeCompare(second, "hi"))
    .forEach((divas) => {
      const option = document.createElement("option");
      option.value = divas;
      option.textContent = divas;
      divasSelect.append(option);
    });

  const groupEntriesByDate = (items) => items.reduce((groupedEntries, entry) => {
    if (!groupedEntries.has(entry.date)) groupedEntries.set(entry.date, []);
    groupedEntries.get(entry.date).push(entry);
    return groupedEntries;
  }, new Map());

  const renderList = (matches) => {
    const groups = groupEntriesByDate(matches);
    list.innerHTML = [...groups].map(([date, dateEntries]) => `
      <section class="festival-date-group">
        <header class="festival-date-heading">
          <time datetime="${date}">${dateFormatter.format(new Date(`${date}T00:00:00Z`))}</time>
          <span>${numberFormatter.format(dateEntries.length)} ${dateEntries.length === 1 ? "entry" : "entries"}</span>
        </header>
        <div class="festival-date-entries">
          ${dateEntries.map((entry) => `
            <article class="festival-darpan-entry festival-darpan-entry--${entry.type}">
              <span class="festival-type">${typeLabels[entry.type]}</span>
              <h3>${escapeHtml(entry.poojniya)}</h3>
              <p>${escapeHtml(entry.divas)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("");
  };

  const renderCalendar = (matches, selectedYear, selectedMonth) => {
    const year = Number(selectedYear);
    const monthIndex = Number(selectedMonth) - 1;
    const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const entriesByDate = groupEntriesByDate(matches);
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = Array.from({ length: cellCount }, (_, cellIndex) => {
      const day = cellIndex - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) return '<div class="festival-calendar-day is-outside" aria-hidden="true"></div>';

      const date = `${selectedYear}-${selectedMonth}-${String(day).padStart(2, "0")}`;
      const dayEntries = entriesByDate.get(date) || [];
      return `<section class="festival-calendar-day${dayEntries.length ? " has-events" : ""}">
        <time datetime="${date}" aria-label="${dateFormatter.format(new Date(`${date}T00:00:00Z`))}">${numberFormatter.format(day)}</time>
        <div class="festival-calendar-events">
          ${dayEntries.map((entry) => `<article class="festival-calendar-event festival-calendar-event--${entry.type}">
            <span>${entry.type === "tirthankar" ? "तीर्थंकर" : "आचार्य"}</span>
            <strong>${escapeHtml(entry.poojniya)}</strong>
            <small>${escapeHtml(entry.divas)}</small>
          </article>`).join("")}
        </div>
      </section>`;
    }).join("");

    calendar.innerHTML = `
      <div class="festival-calendar-inner">
        <div class="festival-calendar-weekdays" aria-hidden="true">
          ${weekdayLabels.map((day) => `<span>${day}</span>`).join("")}
        </div>
        <div class="festival-calendar-grid">${cells}</div>
      </div>`;
  };

  const updateViewLink = () => {
    const url = new URL(window.location.href);
    if (currentView === "calendar") {
      url.searchParams.set("view", "list");
      viewToggle.textContent = "List View";
    } else {
      url.searchParams.delete("view");
      viewToggle.textContent = "Calendar View";
    }
    viewToggle.href = `${url.pathname}${url.search}`;
  };

  const renderEntries = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("hi-IN");
    const selectedType = typeSelect.value;
    const selectedDivas = divasSelect.value;
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;
    const selectedPeriod = `${selectedYear}-${selectedMonth}`;
    const periodEntries = entries.filter((entry) => entry.date.startsWith(selectedPeriod));
    const matches = periodEntries.filter((entry) => {
      const matchesQuery = !query || `${entry.poojniya} ${entry.divas} ${typeLabels[entry.type]}`.toLocaleLowerCase("hi-IN").includes(query);
      const matchesType = selectedType === "all" || entry.type === selectedType;
      const matchesDivas = selectedDivas === "all" || entry.divas === selectedDivas;
      return matchesQuery && matchesType && matchesDivas;
    });
    const periodDate = new Date(Date.UTC(Number(selectedYear), Number(selectedMonth) - 1, 1));
    const periodText = `${monthFormatter.format(periodDate)} ${yearFormatter.format(Number(selectedYear))}`;

    renderList(matches);
    renderCalendar(matches, selectedYear, selectedMonth);
    periodLabel.textContent = periodText;
    pageTitle.textContent = `जैन दर्पण · ${periodText}`;
    document.title = `जैन दर्पण ${periodText} | श्री दिगंबर जिनालय`;
    resultCount.textContent = `Showing ${numberFormatter.format(matches.length)} of ${numberFormatter.format(periodEntries.length)} entries`;
    list.hidden = currentView !== "list" || matches.length === 0;
    calendar.hidden = currentView !== "calendar";
    emptyState.hidden = matches.length !== 0;
    updateViewLink();
  };

  filters.addEventListener("input", renderEntries);
  filters.addEventListener("reset", () => requestAnimationFrame(renderEntries));
  yearSelect.addEventListener("change", renderEntries);
  monthSelect.addEventListener("change", renderEntries);
  viewToggle.addEventListener("click", (event) => {
    event.preventDefault();
    currentView = currentView === "list" ? "calendar" : "list";
    const url = new URL(window.location.href);
    if (currentView === "list") url.searchParams.set("view", "list");
    else url.searchParams.delete("view");
    window.history.replaceState({}, "", url);
    renderEntries();
  });
  renderEntries();
})();

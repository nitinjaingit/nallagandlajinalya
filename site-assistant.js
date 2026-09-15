(async () => {
  const configuredSources = Array.isArray(window.SITE_ASSISTANT_SOURCES)
    ? window.SITE_ASSISTANT_SOURCES
    : [];

  const isSafeScriptPath = (src) => typeof src === "string"
    && /^(?![a-z]+:|\/\/)[\w./-]+\.js(?:\?[^#]*)?$/i.test(src)
    && !src.split("?")[0].split("/").includes("..");

  const loadSource = (source) => new Promise((resolve) => {
    const globals = Array.isArray(source.globals) ? source.globals : [];
    const sourceUrl = isSafeScriptPath(source.src) ? new URL(source.src, window.location.href) : null;
    const isAlreadyLoaded = sourceUrl && [...document.scripts].some((script) => {
      if (!script.src) return false;
      const scriptUrl = new URL(script.src, window.location.href);
      return scriptUrl.origin === sourceUrl.origin && scriptUrl.pathname === sourceUrl.pathname;
    });

    if (!sourceUrl || isAlreadyLoaded || globals.every((name) => window[name] !== undefined)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = source.src;
    script.async = false;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", resolve, { once: true });
    document.head.append(script);
  });

  await Promise.all(configuredSources.map(loadSource));

  const content = window.TEMPLE_CONTENT || {};
  const temple = content.temple || {};

  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("en-IN")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  const stopWords = new Set([
    "a", "an", "and", "are", "at", "can", "do", "for", "from", "how", "i", "in",
    "is", "it", "me", "of", "on", "please", "the", "to", "what", "when", "where",
    "which", "who", "with", "you", "your"
  ]);

  const relatedTerms = {
    aarti: ["arti", "evening", "timing", "time"],
    arti: ["aarti", "evening", "timing", "time"],
    bank: ["donate", "donation", "payment", "account", "ifsc"],
    call: ["contact", "phone", "telephone"],
    darshan: ["visit", "timing", "hours", "open"],
    donate: ["donation", "payment", "bank", "upi", "contribute"],
    donation: ["donate", "payment", "bank", "upi", "contribute"],
    event: ["events", "program", "programme", "festival", "upcoming"],
    hours: ["timing", "time", "open", "darshan"],
    location: ["address", "directions", "map", "visit"],
    mandir: ["jinalaya", "temple"],
    open: ["hours", "timing", "darshan"],
    phone: ["contact", "call", "telephone"],
    puja: ["pooja", "worship"],
    timing: ["time", "hours", "open", "darshan"],
    timings: ["time", "hours", "open", "darshan"],
    upi: ["donate", "donation", "payment"],
    visit: ["darshan", "address", "directions", "guidance"]
  };

  const tokenize = (value) => {
    const tokens = normalize(value).split(" ").filter((token) => token && !stopWords.has(token));
    return [...new Set(tokens.flatMap((token) => [token, ...(relatedTerms[token] || [])]))];
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
  };

  const formatWeekday = (value) => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return new Intl.DateTimeFormat("hi-IN", { weekday: "long", timeZone: "UTC" }).format(date);
  };

  const compact = (items) => items.filter(Boolean).join(" ");
  const records = [];
  const addRecord = (title, text, url, keywords = "") => {
    if (!text) return;
    records.push({
      title,
      text: String(text).replace(/\s+/g, " ").trim(),
      url,
      titleSearch: normalize(title),
      textSearch: normalize(text),
      keywordSearch: normalize(keywords)
    });
  };

  addRecord(
    "Darshan and prayer timings",
    compact([
      temple.morningHours && `Morning darshan: ${temple.morningHours}.`,
      temple.eveningHours && `Evening darshan: ${temple.eveningHours}.`,
      temple.aartiTime && `Evening aarti: ${temple.aartiTime}.`,
      temple.swadhayaTime && `Swadhaya: ${temple.swadhayaTime}.`
    ]),
    "visit.html",
    "opening closing open hours time timing arti worship pooja puja"
  );

  addRecord(
    "Address and directions",
    compact([temple.address, "Use the directions link on the Visit page to open the Jinalaya in Google Maps."]),
    "visit.html",
    "where location map navigation route nallagandla hyderabad"
  );

  addRecord(
    "Contact the Jinalaya",
    compact([
      temple.phone && `Phone: ${temple.phone}.`,
      temple.email && `Email: ${temple.email}.`
    ]),
    "contact.html",
    "call telephone mobile email committee help"
  );

  addRecord(
    "Visitor guidance",
    "Everyone is welcome. Please dress respectfully, leave footwear in the designated racks, keep phones silent and conversations quiet, and ask before taking photographs inside sacred spaces.",
    "visit.html",
    "rules etiquette clothing dress shoes footwear silence photo photography first visit"
  );

  addRecord(
    "About the Jinalaya",
    temple.about,
    "about.html",
    "ahimsa anekant aparigraha worship learning pathshala seva community values"
  );

  const payment = temple.payment || {};
  addRecord(
    "Donation and bank details",
    compact([
      "Contributions support worship, learning, community care, charitable initiatives, and land purchase for mandir construction.",
      payment.accountName && `Account name: ${payment.accountName}.`,
      payment.bankName && `Bank: ${payment.bankName}.`,
      payment.accountNumber && `Account number: ${payment.accountNumber}.`,
      payment.ifscCode && `IFSC: ${payment.ifscCode}.`,
      payment.branch && `Branch: ${payment.branch}.`,
      payment.upiId && `UPI ID: ${payment.upiId}.`,
      "Mention your name and donation purpose, then contact the Jinalaya for a receipt."
    ]),
    "donate.html",
    "donate contribution payment transfer receipt mandir nirman qr scan"
  );

  (content.events || []).forEach((event) => {
    addRecord(
      event.title,
      compact([
        `${formatDate(event.date)}${event.endDate ? ` to ${formatDate(event.endDate)}` : ""}.`,
        event.time && `Time: ${event.time}.`,
        event.address && `Address: ${event.address}.`,
        event.description,
        ...(event.details || [])
      ]),
      `event-details.html?id=${encodeURIComponent(event.id)}`,
      "upcoming event events programme program celebration schedule"
    );
  });

  (content.eventHistory || []).forEach((event) => {
    addRecord(
      `${event.title} (past event)`,
      compact([formatDate(event.date), event.description, ...(event.details || [])]),
      `event-details.html?id=${encodeURIComponent(event.id)}`,
      "past previous history event photos"
    );
  });

  (content.announcements || []).forEach((announcement, index) => {
    addRecord(
      announcement.title?.text || `Community announcement ${index + 1}`,
      compact([
        announcement.date && formatDate(announcement.date),
        announcement.date && formatWeekday(announcement.date),
        announcement.startDate && announcement.endDate
          ? `${formatDate(announcement.startDate)} to ${formatDate(announcement.endDate)}`
          : "",
        announcement.recurring?.frequency === "weekly" && `Every ${announcement.recurring.day}`,
        announcement.time && `Time: ${announcement.time}.`,
        announcement.title?.text,
        ...(announcement.activities || []).map((activity) => activity.text)
      ]),
      "index.html#announcements-heading",
      "notice news update activity schedule pathshala bhaktambar"
    );
  });

  addRecord(
    "Jain Darpan festival calendar",
    "Browse Jain festival and observance dates by month, including Tirthankar Darpan and Acharya Darpan entries.",
    "festivals.html",
    "calendar dates tirthankar acharya divas jain festival observance"
  );

  addRecord(
    "Jain temples near Hyderabad",
    "Browse the directory of Digambar Jain temples in Hyderabad, Secunderabad, Telangana, Bidar, and nearby areas. Each listing includes an address and directions where available.",
    "temples.html",
    "nearby temples directory mandir jinalaya secunderabad telangana bidar"
  );

  addRecord(
    "Photo gallery",
    "View photographs from the Jinalaya, community celebrations, and past events.",
    "gallery.html",
    "images pictures photos album"
  );

  const titleKeys = ["title", "name", "poojniya", "caption", "alt", "id"];
  const ignoredKeys = new Set(["src", "image", "images", "map", "website", "directionsUrl", "donationUrl", "upiQrImage"]);
  const indexedSignatures = new Set(records.map((record) => `${record.url}\n${record.textSearch}`));

  const scalarText = (value) => {
    if (typeof value === "string" || typeof value === "number") return String(value).trim();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "";
  };

  const objectText = (value) => Object.entries(value)
    .filter(([key]) => !ignoredKeys.has(key))
    .flatMap(([key, item]) => {
      const scalar = scalarText(item);
      if (scalar) return `${key}: ${scalar}`;
      if (Array.isArray(item)) return item.map(scalarText).filter(Boolean);
      return [];
    })
    .join(" · ");

  const indexConfiguredValue = (value, source, path = []) => {
    const dataPath = path.join(".");
    const isExcluded = (source.excludePaths || []).some((excludedPath) =>
      dataPath === excludedPath || dataPath.startsWith(`${excludedPath}.`)
    );
    if (isExcluded) return;

    const route = Object.entries(source.routes || {})
      .filter(([routePath]) => dataPath === routePath || dataPath.startsWith(`${routePath}.`))
      .sort(([left], [right]) => right.length - left.length)[0]?.[1];
    const recordUrl = route || source.url || "index.html";

    if (Array.isArray(value)) {
      value.forEach((item, index) => indexConfiguredValue(item, source, [...path, String(index + 1)]));
      return;
    }

    if (value && typeof value === "object") {
      const text = objectText(value);
      if (text) {
        const titleValue = titleKeys.map((key) => value[key]).find((item) => scalarText(item));
        const title = scalarText(titleValue) || [source.label, ...path].filter(Boolean).join(" - ");
        const signature = `${recordUrl}\n${normalize(text)}`;
        if (!indexedSignatures.has(signature)) {
          indexedSignatures.add(signature);
          addRecord(title || "Website information", text, recordUrl, source.label || "");
        }
      }

      Object.entries(value).forEach(([key, item]) => {
        if (item && typeof item === "object" && !ignoredKeys.has(key)) {
          indexConfiguredValue(item, source, [...path, key]);
        }
      });
      return;
    }

    const text = scalarText(value);
    if (text) addRecord(source.label || "Website information", text, recordUrl);
  };

  configuredSources.forEach((source) => {
    (source.globals || []).forEach((globalName) => {
      if (Object.prototype.hasOwnProperty.call(window, globalName)) {
        indexConfiguredValue(window[globalName], source, [globalName]);
      }
    });
  });

  const scoreRecord = (record, query) => {
    const phrase = normalize(query);
    const tokens = tokenize(query);
    let score = 0;

    if (phrase.length > 2) {
      if (record.titleSearch.includes(phrase)) score += 24;
      if (record.keywordSearch.includes(phrase)) score += 14;
      if (record.textSearch.includes(phrase)) score += 10;
    }

    tokens.forEach((token) => {
      if (record.titleSearch.includes(token)) score += 8;
      if (record.keywordSearch.includes(token)) score += 5;
      if (record.textSearch.includes(token)) score += 2;
    });

    return score;
  };

  const search = (query) => records
    .map((record) => ({ ...record, score: scoreRecord(record, query) }))
    .filter((record) => record.score >= 4)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const launcher = createElement("button", "assistant-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "site-assistant-panel");
  launcher.setAttribute("aria-label", "Ask the Jinalaya assistant");
  launcher.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.4-4.2A9 9 0 1 1 21 12Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg><span>Ask Jinalaya</span>';

  const panel = createElement("section", "assistant-panel");
  panel.id = "site-assistant-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "assistant-title");

  const header = createElement("header", "assistant-header");
  const headingGroup = createElement("div");
  const eyebrow = createElement("span", "assistant-eyebrow", "Jinalaya guide");
  const heading = createElement("h2", "", "How can I help?");
  heading.id = "assistant-title";
  headingGroup.append(eyebrow, heading);
  const closeButton = createElement("button", "assistant-close", "×");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close assistant");
  header.append(headingGroup, closeButton);

  const messages = createElement("div", "assistant-messages");
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions");

  const addBotMessage = (text, results = []) => {
    const message = createElement("div", "assistant-message assistant-message-bot");
    message.append(createElement("p", "", text));

    results.forEach((result) => {
      const link = createElement("a", "assistant-result");
      link.href = result.url;
      link.append(
        createElement("strong", "", result.title),
        createElement("span", "", result.text),
        createElement("span", "assistant-result-action", "Open page →")
      );
      message.append(link);
    });

    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const addUserMessage = (text) => {
    const message = createElement("div", "assistant-message assistant-message-user");
    message.append(createElement("p", "", text));
    messages.append(message);
  };

  const suggestions = createElement("div", "assistant-suggestions");
  ["Darshan timings", "Upcoming events", "How to donate"].forEach((label) => {
    const button = createElement("button", "", label);
    button.type = "button";
    button.dataset.query = label;
    suggestions.append(button);
  });

  const form = createElement("form", "assistant-form");
  const inputLabel = createElement("label", "sr-only", "Ask a question about the Jinalaya");
  inputLabel.htmlFor = "assistant-question";
  const input = createElement("input");
  input.id = "assistant-question";
  input.name = "question";
  input.type = "search";
  input.maxLength = 160;
  input.autocomplete = "off";
  input.placeholder = "Ask about timings, events, visits...";
  const submitButton = createElement("button");
  submitButton.type = "submit";
  submitButton.setAttribute("aria-label", "Send question");
  submitButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
  form.append(inputLabel, input, submitButton);

  panel.append(header, messages, suggestions, form);
  document.body.append(panel, launcher);

  const respond = (query) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    addUserMessage(cleanQuery);
    input.value = "";

    if (/^(hi|hello|hey|namaste|jai jinendra)[.! ]*$/i.test(cleanQuery)) {
      addBotMessage("Jai Jinendra. What would you like to know?");
      return;
    }

    const results = search(cleanQuery);
    if (results.length) {
      addBotMessage(results.length === 1 ? "I found this on the website:" : "These pages look most relevant:", results);
    } else {
      addBotMessage("I could not find that in the website information. Try asking about timings, events, visiting, donations, directions, or contact details.");
    }
  };

  const setOpen = (isOpen) => {
    panel.hidden = !isOpen;
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.classList.toggle("is-hidden", isOpen);
    if (isOpen) input.focus();
    else launcher.focus();
  };

  launcher.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    respond(input.value);
  });
  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-query]");
    if (button) respond(button.dataset.query);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  addBotMessage("Jai Jinendra. What would you like to know?");
})();

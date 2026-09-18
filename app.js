const content = window.TEMPLE_CONTENT;
const { temple } = content;

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

const byId = (id) => document.getElementById(id);
const readPreviewData = () => {
  try {
    return JSON.parse(localStorage.getItem("templeImagePreview") || "null");
  } catch {
    return null;
  }
};
const previewData = readPreviewData();

document.querySelectorAll("[data-temple-name]").forEach((element) => {
  element.textContent = temple.name;
});

setText("brand-name", temple.name);
setText("footer-name", temple.name);
setText("hero-title", temple.fullName);
setText("hero-welcome", temple.welcome);
setText("home-gallery-title", "Life at the Jinalaya");
setText("about-text", temple.about);
setText("opening-time", temple.openingTime);
setText("parkshal-time", temple.parkshalTime);
setText("aarti-time", temple.aartiTime);
setText("swadhaya-time", temple.swadhayaTime);
setText("morning-hours", temple.morningHours);
setText("evening-hours", temple.eveningHours);
setText("short-address", temple.shortAddress);
setText("full-address", temple.address);

const parseTimeRange = (range) => String(range || "").split(/[–-]/).map((value) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return (hours * 60) + Number(match[2]);
});

const now = new Date();
const currentMinutes = (now.getHours() * 60) + now.getMinutes();
const isWithinRange = (range) => {
  const [start, end] = parseTimeRange(range);
  return Number.isFinite(start) && Number.isFinite(end) && currentMinutes >= start && currentMinutes <= end;
};
setText("open-status", isWithinRange(temple.morningHours) || isWithinRange(temple.eveningHours)
  ? "Open now"
  : "Closed now");

const heroImage = byId("hero-image");
if (heroImage) {
  const customHero = previewData?.hero || window.TEMPLE_HERO;
  const heroSource = customHero?.src || temple.heroImage;
  if (heroSource) {
    heroImage.src = heroSource;
    heroImage.alt = customHero?.alt || temple.heroImageAlt;
    heroImage.addEventListener("error", () => heroImage.hidden = true);
  } else {
    heroImage.hidden = true;
  }
}

const directionsLink = byId("directions-link");
if (directionsLink) directionsLink.href = temple.directionsUrl;
const donationLink = byId("donation-link");
if (donationLink) donationLink.href = temple.donationUrl;

const payment = temple.payment;
if (payment) {
  setText("payment-account-name", payment.accountName);
  setText("payment-bank-name", payment.bankName);
  setText("payment-account-number", payment.accountNumber);
  setText("payment-ifsc", payment.ifscCode);
  setText("payment-branch", payment.branch);
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = byId(button.dataset.copyTarget)?.textContent.trim();
    if (!value) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    button.textContent = "Copied";
    window.setTimeout(() => button.textContent = "Copy", 1600);
  });
});

const phoneLink = byId("phone-link");
if (phoneLink) {
  phoneLink.href = `tel:${temple.phone.replace(/\s/g, "")}`;
  phoneLink.textContent = temple.phone;
}
const emailLink = byId("email-link");
if (emailLink) {
  emailLink.href = `mailto:${temple.email}`;
  emailLink.textContent = temple.email;
}

const commiteList = byId("commite-list");
if (commiteList) {
  commiteList.innerHTML = content.commite.map((member) => `
    <li>${member.name}: <a href="tel:${member.phone}">${member.phone}</a></li>
  `).join("");
}

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

const todayDarpanList = byId("today-darpan-list");
if (todayDarpanList && window.JAIN_FESTIVAL_DARPAN) {
  const hyderabadDateParts = Object.fromEntries(new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata"
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const localDate = `${hyderabadDateParts.year}-${hyderabadDateParts.month}-${hyderabadDateParts.day}`;
  const darpanEntries = [
    ...window.JAIN_FESTIVAL_DARPAN.tirthankarDarpan.map((entry) => ({ ...entry, type: "तीर्थंकर" })),
    ...window.JAIN_FESTIVAL_DARPAN.acharyaDarpan.map((entry) => ({ ...entry, type: "आचार्य" }))
  ].filter((entry) => entry.date === localDate);
  const todayDarpanDate = byId("today-darpan-date");
  if (todayDarpanDate) {
    todayDarpanDate.dateTime = localDate;
    todayDarpanDate.textContent = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Kolkata"
    }).format(now);
  }
  todayDarpanList.innerHTML = darpanEntries.length
    ? darpanEntries.map((entry) => `<article><span>${entry.type} दर्पण</span><strong>${escapeHtml(entry.poojniya)}</strong><small>${escapeHtml(entry.divas)}</small></article>`).join("")
    : "<p>No Darpan observance listed for today.</p>";
}

const formatAnnouncementLine = ({ icon = "", text = "" }) => `<span class="announcement-line">
  ${icon ? `<span class="announcement-icon" aria-hidden="true">${escapeHtml(icon)}</span>` : ""}<span>${escapeHtml(text)}</span>
</span>`;
const formatAnnouncementDate = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1].slice(-2)}` : value;
};
const formatAnnouncementWeekday = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("hi-IN", { weekday: "long", timeZone: "UTC" }).format(date);
};
const formatAnnouncementSchedule = (announcement) => {
  if (announcement.date) {
    return `${formatAnnouncementDate(announcement.date)} (${formatAnnouncementWeekday(announcement.date)})`;
  }
  if (announcement.recurring?.frequency === "weekly") return `Every ${announcement.recurring.day}`;
  if (announcement.startDate && announcement.endDate) {
    return `${formatAnnouncementDate(announcement.startDate)} to ${formatAnnouncementDate(announcement.endDate)}`;
  }
  return "Regular program";
};
const announcementList = byId("announcement-list");
if (announcementList) {
  const hyderabadDateParts = Object.fromEntries(new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata"
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const currentDate = `${hyderabadDateParts.year}-${hyderabadDateParts.month}-${hyderabadDateParts.day}`;
  const currentAnnouncements = content.announcements.filter((announcement) => {
    const effectiveEndDate = announcement.endDate || announcement.date || announcement.startDate;
    return !/^\d{4}-\d{2}-\d{2}$/.test(effectiveEndDate || "") || effectiveEndDate >= currentDate;
  });

  announcementList.innerHTML = currentAnnouncements.map((announcement, index) => {
    const schedule = formatAnnouncementSchedule(announcement);
    const details = announcement.activities.length
      ? `<div class="announcement-activities">${announcement.activities.map(formatAnnouncementLine).join("")}</div>`
      : "";
    return `<article class="announcement-item${index >= 4 ? " announcement-extra" : ""}">
      <p class="announcement-date"><span>${escapeHtml(schedule)}</span>${announcement.time ? `<span class="announcement-time">${escapeHtml(announcement.time)}</span>` : ""}</p>
      <div><h3>${formatAnnouncementLine(announcement.title)}</h3>${details}</div>
    </article>`;
  }).join("");

  const announcementToggle = byId("announcement-toggle");
  const extras = announcementList.querySelectorAll(".announcement-extra");
  if (announcementToggle && extras.length) {
    announcementToggle.hidden = false;
    extras.forEach((item) => item.hidden = true);
    announcementToggle.addEventListener("click", () => {
      const expanded = announcementToggle.getAttribute("aria-expanded") === "true";
      announcementToggle.setAttribute("aria-expanded", String(!expanded));
      announcementToggle.textContent = expanded ? "Show all announcements" : "Show fewer announcements";
      extras.forEach((item) => item.hidden = expanded);
    });
  }
}

const allGalleryImages = previewData?.gallery?.length
  ? previewData.gallery
  : (window.TEMPLE_GALLERY || content.gallery);
const homeSlideshow = byId("home-slideshow");
if (homeSlideshow) {
  const activeImages = allGalleryImages.filter((image) => image.active);
  for (let index = activeImages.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [activeImages[index], activeImages[randomIndex]] = [activeImages[randomIndex], activeImages[index]];
  }
  activeImages.splice(10);
  if (!activeImages.length) {
    homeSlideshow.innerHTML = '<div class="empty-state">No photos are selected for the home-page rotation.</div>';
  } else {
    let currentSlide = 0;
    homeSlideshow.innerHTML = `<div class="slideshow-frame">
      ${activeImages.map((image, index) => `<figure class="home-slide${index === 0 ? " is-active" : ""}" aria-hidden="${index !== 0}">
        <button class="home-slide-open" type="button" data-slide-image="${index}" aria-label="View ${image.caption} at full size">
          <img src="${image.src}" alt="${image.alt}"${index === 0 ? "" : ' loading="lazy"'}>
        </button>
        <figcaption>${image.caption}</figcaption>
      </figure>`).join("")}
      ${activeImages.length > 1 ? '<button class="slideshow-button slideshow-previous" type="button" aria-label="Previous photo">‹</button><button class="slideshow-button slideshow-next" type="button" aria-label="Next photo">›</button>' : ""}
    </div>
    <div class="slideshow-indicators" aria-label="Choose a photo">
      ${activeImages.map((image, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-slide="${index}" aria-label="Show ${image.caption}"></button>`).join("")}
    </div>`;

    const showSlide = (index) => {
      currentSlide = (index + activeImages.length) % activeImages.length;
      homeSlideshow.querySelectorAll(".home-slide").forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentSlide;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      homeSlideshow.querySelectorAll(".slideshow-indicators button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === currentSlide);
      });
    };

    homeSlideshow.addEventListener("click", (event) => {
      if (event.target.closest(".slideshow-previous")) {
        showSlide(currentSlide - 1);
        return;
      }
      if (event.target.closest(".slideshow-next")) {
        showSlide(currentSlide + 1);
        return;
      }
      const indicator = event.target.closest("[data-slide]");
      if (indicator) {
        showSlide(Number(indicator.dataset.slide));
        return;
      }
      const imageButton = event.target.closest("[data-slide-image]");
      const imageDialog = byId("home-image-dialog");
      if (imageButton && imageDialog) {
        const image = activeImages[Number(imageButton.dataset.slideImage)];
        imageDialog.querySelector("img").src = image.src;
        imageDialog.querySelector("img").alt = image.alt;
        imageDialog.querySelector("p").textContent = image.caption;
        imageDialog.showModal();
      }
    });

    const imageDialog = byId("home-image-dialog");
    if (imageDialog) {
      imageDialog.querySelector(".dialog-close").addEventListener("click", () => imageDialog.close());
      imageDialog.addEventListener("click", (event) => {
        if (event.target === imageDialog) imageDialog.close();
      });
    }

    if (activeImages.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let rotation;
      const stopRotation = () => window.clearInterval(rotation);
      const startRotation = () => {
        stopRotation();
        rotation = window.setInterval(() => showSlide(currentSlide + 1), 5000);
      };
      startRotation();
      homeSlideshow.addEventListener("mouseenter", stopRotation);
      homeSlideshow.addEventListener("mouseleave", startRotation);
      homeSlideshow.addEventListener("focusin", stopRotation);
      homeSlideshow.addEventListener("focusout", startRotation);
    }
  }
}

const formatDateParts = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
    full: new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date)
  };
};

const nextEventContainer = byId("next-event");
if (nextEventContainer) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextEvent = [...content.events]
    .filter((event) => new Date(`${event.endDate || event.date}T23:59:59`) >= today)
    .sort((first, second) => first.date.localeCompare(second.date))[0];

  if (!nextEvent) {
    nextEventContainer.innerHTML = '<p class="empty-state">The next community event will be announced soon.</p>';
  } else {
    const date = formatDateParts(nextEvent.date);
    const detailUrl = `event-details.html?id=${encodeURIComponent(nextEvent.id)}`;
    const shareText = `${nextEvent.title} · ${date.full}${nextEvent.time ? ` at ${nextEvent.time}` : ""} · ${temple.name}`;
    nextEventContainer.innerHTML = `<article class="next-event reveal">
      <time datetime="${escapeHtml(nextEvent.date)}"><strong>${date.day}</strong><span>${date.month}</span></time>
      <div class="next-event-copy"><p class="event-meta">${escapeHtml([nextEvent.time, nextEvent.address].filter(Boolean).join(" · "))}</p><h3>${escapeHtml(nextEvent.title)}</h3><p>${escapeHtml(nextEvent.description)}</p></div>
      <div class="next-event-actions">
        <a class="button button-primary" href="${detailUrl}">View details</a>
        <a class="button button-secondary" href="${escapeHtml(nextEvent.mapUrl || temple.directionsUrl)}" target="_blank" rel="noreferrer">Get directions</a>
        <a class="text-link" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noreferrer">Share on WhatsApp</a>
      </div>
    </article>`;
  }
}

const eventGrid = byId("event-grid");
if (eventGrid) {
  eventGrid.innerHTML = content.events.map((event, eventIndex) => {
    const date = formatDateParts(event.date);
    const eventMeta = [event.time, event.address].filter(Boolean).join(" · ");
    const detailUrl = `event-details.html?id=${encodeURIComponent(event.id)}`;
    const detailLines = (Array.isArray(event.details)
      ? event.details
      : String(event.details || "More information coming soon.").split(/\r?\n/)
    ).filter(Boolean);
    const eventDetails = detailLines.map((detail) => `<li>${detail}</li>`).join("");
    const eventImages = window.getEventImages(event);
    const eventPhotos = eventImages.length ? `
      <button class="event-photo-trigger" type="button" data-event-index="${eventIndex}" aria-label="View photos from ${event.title}">
        <img src="${eventImages[0].src}" alt="" loading="lazy" />
        <span>View ${eventImages.length} ${eventImages.length === 1 ? "photo" : "photos"}</span>
      </button>` : "";
    return `<article class="event-item reveal">
      <time datetime="${event.date}"><strong>${date.day}</strong><span>${date.month}</span></time>
      <div class="event-summary"><p class="event-meta">${eventMeta}</p><h3>${event.title}</h3><p>${event.description}</p>${eventPhotos}</div>
      <div class="event-details"><strong>Details</strong><ul>${eventDetails}</ul><a class="button button-primary event-details-link" href="${detailUrl}">View details</a></div>
    </article>`;
  }).join("");

  const eventPhotoDialog = byId("event-photo-dialog");
  if (eventPhotoDialog) {
    let selectedEvent;
    let selectedPhotoIndex = 0;
    const photo = eventPhotoDialog.querySelector("img");
    const title = eventPhotoDialog.querySelector("h2");
    const caption = eventPhotoDialog.querySelector("p");
    const count = eventPhotoDialog.querySelector(".event-photo-count");
    const previous = eventPhotoDialog.querySelector(".event-photo-previous");
    const next = eventPhotoDialog.querySelector(".event-photo-next");

    const showEventPhoto = (index) => {
      const images = window.getEventImages(selectedEvent);
      selectedPhotoIndex = (index + images.length) % images.length;
      const image = images[selectedPhotoIndex];
      photo.src = image.src;
      photo.alt = image.alt || selectedEvent.title;
      title.textContent = selectedEvent.title;
      caption.textContent = image.caption || "";
      count.textContent = `${selectedPhotoIndex + 1} of ${images.length}`;
      previous.hidden = images.length < 2;
      next.hidden = images.length < 2;
    };

    eventGrid.addEventListener("click", (event) => {
      const trigger = event.target.closest(".event-photo-trigger");
      if (!trigger) return;
      selectedEvent = content.events[Number(trigger.dataset.eventIndex)];
      showEventPhoto(0);
      eventPhotoDialog.showModal();
    });
    previous.addEventListener("click", () => showEventPhoto(selectedPhotoIndex - 1));
    next.addEventListener("click", () => showEventPhoto(selectedPhotoIndex + 1));
    eventPhotoDialog.querySelector(".dialog-close").addEventListener("click", () => eventPhotoDialog.close());
    eventPhotoDialog.addEventListener("click", (event) => {
      if (event.target === eventPhotoDialog) eventPhotoDialog.close();
    });
  }
}

const historyList = byId("history-list");
if (historyList) {
  const eventsPerPage = 5;
  const historyEvents = [...content.eventHistory]
    .sort((first, second) => second.date.localeCompare(first.date));
  const pageCount = Math.ceil(historyEvents.length / eventsPerPage);
  const pagination = byId("history-pagination");
  const previousButton = byId("history-previous");
  const nextButton = byId("history-next");
  const pageStatus = byId("history-page-status");
  let currentPage = 0;

  const renderHistoryPage = () => {
    const firstEventIndex = currentPage * eventsPerPage;
    historyList.innerHTML = historyEvents
      .slice(firstEventIndex, firstEventIndex + eventsPerPage)
      .map((event) => {
        const date = formatDateParts(event.date);
        const description = event.description || event.note || "";
        return `<article><time datetime="${event.date}">${date.full}</time><div><h4>${event.title}</h4><p>${description}</p><a class="text-link" href="event-details.html?id=${encodeURIComponent(event.id)}">View event</a></div></article>`;
      }).join("");

    if (pagination) pagination.hidden = pageCount <= 1;
    if (previousButton) previousButton.disabled = currentPage === 0;
    if (nextButton) nextButton.disabled = currentPage >= pageCount - 1;
    if (pageStatus) pageStatus.textContent = `Page ${currentPage + 1} of ${pageCount}`;
  };

  renderHistoryPage();

  pagination?.addEventListener("click", (event) => {
    if (event.target.closest("#history-previous") && currentPage > 0) currentPage -= 1;
    else if (event.target.closest("#history-next") && currentPage < pageCount - 1) currentPage += 1;
    else return;
    renderHistoryPage();
    historyList.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const gallery = byId("gallery-grid");
const galleryImages = allGalleryImages;
if (gallery) {
  const imagesPerPage = 15;
  const pageCount = Math.ceil(galleryImages.length / imagesPerPage);
  const pagination = byId("gallery-pagination");
  const previousButton = byId("gallery-previous");
  const nextButton = byId("gallery-next");
  const pageStatus = byId("gallery-page-status");
  let currentPage = 0;

  const renderGalleryPage = () => {
    const firstImageIndex = currentPage * imagesPerPage;
    const pageImages = galleryImages.slice(firstImageIndex, firstImageIndex + imagesPerPage);
    gallery.innerHTML = pageImages.length ? pageImages.map((image, index) => `
      <button class="gallery-item reveal is-visible" type="button" data-index="${firstImageIndex + index}" aria-label="Open ${image.caption}">
        <img src="${image.src}" alt="${image.alt}" loading="lazy" />
        <span class="gallery-item-caption">${image.caption}</span>
      </button>`).join("") : '<div class="empty-state gallery-empty">No photos have been added yet. Use Manage photos to choose your temple images.</div>';

    if (pagination) pagination.hidden = pageCount <= 1;
    if (previousButton) previousButton.disabled = currentPage === 0;
    if (nextButton) nextButton.disabled = currentPage >= pageCount - 1;
    if (pageStatus) pageStatus.textContent = `Page ${currentPage + 1} of ${pageCount}`;
  };

  renderGalleryPage();

  const allView = byId("gallery-all-view");
  const treeView = byId("gallery-tree-view");
  const tree = byId("gallery-tree");
  const filteredGallery = byId("gallery-filtered-grid");
  const selectionTitle = byId("gallery-selection-title");
  const selectionCount = byId("gallery-selection-count");
  const helpText = byId("gallery-help");
  let selectedGroupImageIndexes = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthLookup = Object.fromEntries(monthNames.map((month, index) => [month.slice(0, 3).toLowerCase(), index]));
  const datedGroups = new Map();

  galleryImages.forEach((image, imageIndex) => {
    const dateParts = String(image.date || "").split("-");
    const year = /^\d{4}$/.test(dateParts[2] || "") ? dateParts[2] : "Other";
    const monthIndex = monthLookup[String(dateParts[1] || "").slice(0, 3).toLowerCase()];
    const month = monthIndex === undefined ? "Undated" : monthNames[monthIndex];
    const caption = image.caption || "Gallery photos";
    const key = `${year}|${month}|${caption}`;
    if (!datedGroups.has(key)) datedGroups.set(key, { key, year, month, monthIndex: monthIndex ?? -1, caption, imageIndexes: [] });
    datedGroups.get(key).imageIndexes.push(imageIndex);
  });

  const groups = [...datedGroups.values()].sort((left, right) => {
    const yearDifference = (Number(right.year) || 0) - (Number(left.year) || 0);
    return yearDifference || right.monthIndex - left.monthIndex || left.caption.localeCompare(right.caption);
  });

  const years = new Map();
  groups.forEach((group, groupIndex) => {
    if (!years.has(group.year)) years.set(group.year, new Map());
    const months = years.get(group.year);
    if (!months.has(group.month)) months.set(group.month, []);
    months.get(group.month).push({ ...group, groupIndex });
  });

  if (tree) {
    tree.innerHTML = [...years.entries()].map(([year, months], yearIndex) => `
      <details${yearIndex === 0 ? " open" : ""}>
        <summary>${escapeHtml(year)}</summary>
        ${[...months.entries()].map(([month, monthGroups], monthIndex) => `
          <details${yearIndex === 0 && monthIndex === 0 ? " open" : ""}>
            <summary>${escapeHtml(month)}</summary>
            <div class="gallery-tree-items">
              ${monthGroups.map((group) => `<button class="gallery-tree-button" type="button" data-group-index="${group.groupIndex}">${escapeHtml(group.caption)} (${group.imageIndexes.length})</button>`).join("")}
            </div>
          </details>`).join("")}
      </details>`).join("");
  }

  const renderSelectedGroup = (groupIndex) => {
    const group = groups[groupIndex];
    if (!group || !filteredGallery) return;
    selectedGroupImageIndexes = group.imageIndexes;
    const selectedImages = group.imageIndexes.map((imageIndex) => ({ image: galleryImages[imageIndex], imageIndex }));
    filteredGallery.innerHTML = selectedImages.map(({ image, imageIndex }) => `
      <button class="gallery-item reveal is-visible" type="button" data-index="${imageIndex}" aria-label="Open ${escapeHtml(image.caption)}">
        <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" />
      </button>`).join("");
    selectionTitle.textContent = group.caption;
    selectionCount.textContent = `${selectedImages.length} ${selectedImages.length === 1 ? "photo" : "photos"} · ${group.month} ${group.year}`;
    tree.querySelectorAll(".gallery-tree-button").forEach((button) => {
      const selected = Number(button.dataset.groupIndex) === groupIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
  };

  if (groups.length) renderSelectedGroup(0);

  tree?.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-tree-button");
    if (button) renderSelectedGroup(Number(button.dataset.groupIndex));
  });

  document.querySelectorAll("[data-gallery-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const showTree = button.dataset.galleryView === "tree";
      allView.hidden = showTree;
      treeView.hidden = !showTree;
      if (helpText) helpText.textContent = showTree ? "Choose a caption from the date tree to view its photos." : "Choose any photo to view it at full size.";
      document.querySelectorAll("[data-gallery-view]").forEach((viewButton) => {
        const selected = viewButton === button;
        viewButton.classList.toggle("is-active", selected);
        viewButton.setAttribute("aria-pressed", String(selected));
      });
      if (showTree && groups.length && !tree.querySelector(".gallery-tree-button.is-active")) renderSelectedGroup(0);
    });
  });

  pagination?.addEventListener("click", (event) => {
    if (event.target.closest("#gallery-previous") && currentPage > 0) currentPage -= 1;
    else if (event.target.closest("#gallery-next") && currentPage < pageCount - 1) currentPage += 1;
    else return;
    renderGalleryPage();
    gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const dialog = byId("image-dialog");
  if (dialog) {
    const dialogImage = dialog.querySelector("img");
    const dialogCaption = dialog.querySelector("p");
    const previousImageButton = dialog.querySelector(".dialog-image-previous");
    const nextImageButton = dialog.querySelector(".dialog-image-next");
    let dialogImageIndexes = [];
    let dialogPosition = 0;

    const showDialogImage = () => {
      const image = galleryImages[dialogImageIndexes[dialogPosition]];
      if (!image) return;
      dialogImage.src = image.src;
      dialogImage.alt = image.alt;
      dialogCaption.textContent = `${image.caption} · ${dialogPosition + 1} of ${dialogImageIndexes.length}`;
      previousImageButton.hidden = dialogImageIndexes.length < 2;
      nextImageButton.hidden = dialogImageIndexes.length < 2;
    };

    const moveDialogImage = (direction) => {
      dialogPosition = (dialogPosition + direction + dialogImageIndexes.length) % dialogImageIndexes.length;
      showDialogImage();
    };

    const openGalleryImage = (event) => {
      const item = event.target.closest(".gallery-item");
      if (!item) return;
      const imageIndex = Number(item.dataset.index);
      dialogImageIndexes = event.currentTarget === filteredGallery ? [...selectedGroupImageIndexes] : galleryImages.map((_, index) => index);
      dialogPosition = Math.max(0, dialogImageIndexes.indexOf(imageIndex));
      showDialogImage();
      dialog.showModal();
    };
    gallery.addEventListener("click", openGalleryImage);
    filteredGallery?.addEventListener("click", openGalleryImage);
    previousImageButton.addEventListener("click", () => moveDialogImage(-1));
    nextImageButton.addEventListener("click", () => moveDialogImage(1));
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") moveDialogImage(-1);
      if (event.key === "ArrowRight") moveDialogImage(1);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
}

const menuButton = document.querySelector(".menu-button");
const navigation = byId("primary-nav");
if (menuButton && navigation && !window.SHARED_LAYOUT_ACTIVE) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });
  navigation.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

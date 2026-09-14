const content = window.TEMPLE_CONTENT;
const eventId = new URLSearchParams(window.location.search).get("id");
const allEvents = [...(content.events || []), ...(content.eventHistory || [])];
const selectedEvent = allEvents.find((event) => event.id === eventId);
const isHistoricalEvent = (content.eventHistory || []).some((event) => event.id === eventId);

if (selectedEvent) {
  const formatDate = (dateString) => new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));

  const dateText = selectedEvent.endDate
    ? `${formatDate(selectedEvent.date)} to ${formatDate(selectedEvent.endDate)}`
    : formatDate(selectedEvent.date);
  const description = selectedEvent.description || selectedEvent.note || "";
  const images = Array.isArray(selectedEvent.images) ? selectedEvent.images : [];

  document.title = `${selectedEvent.title} | ${content.temple.name}`;
  document.getElementById("event-detail-title").textContent = selectedEvent.title;
  document.getElementById("event-detail-description").textContent = description;
  document.getElementById("event-detail-content").hidden = false;
  document.getElementById("event-detail-actions").hidden = isHistoricalEvent;

  const compactDate = selectedEvent.date.replaceAll("-", "");
  const calendarEnd = new Date(`${selectedEvent.endDate || selectedEvent.date}T12:00:00`);
  calendarEnd.setDate(calendarEnd.getDate() + 1);
  const compactEnd = `${calendarEnd.getFullYear()}${String(calendarEnd.getMonth() + 1).padStart(2, "0")}${String(calendarEnd.getDate()).padStart(2, "0")}`;
  const calendar = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${compactDate}`, `DTEND;VALUE=DATE:${compactEnd}`,
    `SUMMARY:${selectedEvent.title}`, `DESCRIPTION:${description}`,
    `LOCATION:${selectedEvent.location || content.temple.address}`, "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const calendarLink = document.getElementById("event-calendar-link");
  calendarLink.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`;
  calendarLink.download = `${selectedEvent.id}.ics`;
  document.getElementById("event-share-link").href = `https://wa.me/?text=${encodeURIComponent(`${selectedEvent.title} · ${dateText}${selectedEvent.time ? ` at ${selectedEvent.time}` : ""} · ${content.temple.name}`)}`;
  document.getElementById("event-directions-link").href = content.temple.directionsUrl;

  const facts = [
    ["Date", dateText],
    ["Time", selectedEvent.time],
    ["Location", selectedEvent.location]
  ].filter(([, value]) => value);
  const factsList = document.getElementById("event-detail-facts");
  facts.forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    factsList.append(row);
  });

  const program = document.getElementById("event-detail-program");
  const detailLines = Array.isArray(selectedEvent.details) ? selectedEvent.details : [];
  detailLines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    program.append(item);
  });
  if (!detailLines.length) {
    const item = document.createElement("li");
    item.textContent = "Program information will be added soon.";
    program.append(item);
  }

  const photoNote = document.getElementById("event-photo-note");
  const imageGrid = document.getElementById("event-image-grid");
  if (!images.length) {
    photoNote.textContent = "Photos from this event will be added soon.";
    imageGrid.classList.add("is-empty");
  } else {
    photoNote.textContent = "Select a photo to view it at full size.";
    images.forEach((image, index) => {
      const button = document.createElement("button");
      const thumbnail = document.createElement("img");
      button.className = "gallery-item event-image-item reveal is-visible";
      button.type = "button";
      button.dataset.imageIndex = String(index);
      button.setAttribute("aria-label", `Open ${image.caption || selectedEvent.title}`);
      thumbnail.src = image.src;
      thumbnail.alt = image.alt || selectedEvent.title;
      thumbnail.loading = "lazy";
      button.append(thumbnail);
      imageGrid.append(button);
    });
  }

  const dialog = document.getElementById("event-detail-dialog");
  let currentImageIndex = 0;
  const showImage = (index) => {
    currentImageIndex = (index + images.length) % images.length;
    const image = images[currentImageIndex];
    dialog.querySelector("img").src = image.src;
    dialog.querySelector("img").alt = image.alt || selectedEvent.title;
    dialog.querySelector("h2").textContent = selectedEvent.title;
    dialog.querySelector("p").textContent = image.caption || "";
    dialog.querySelector(".event-photo-count").textContent = `${currentImageIndex + 1} of ${images.length}`;
    dialog.querySelector(".event-photo-previous").hidden = images.length < 2;
    dialog.querySelector(".event-photo-next").hidden = images.length < 2;
  };

  imageGrid.addEventListener("click", (event) => {
    const item = event.target.closest(".event-image-item");
    if (!item) return;
    showImage(Number(item.dataset.imageIndex));
    dialog.showModal();
  });
  dialog.querySelector(".event-photo-previous").addEventListener("click", () => showImage(currentImageIndex - 1));
  dialog.querySelector(".event-photo-next").addEventListener("click", () => showImage(currentImageIndex + 1));
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
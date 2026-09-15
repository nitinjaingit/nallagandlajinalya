const content = window.TEMPLE_CONTENT;
document.querySelectorAll("[data-temple-name]").forEach((element) => element.textContent = content.temple.name);

const input = document.getElementById("photo-input");
const uploadZone = document.getElementById("upload-zone");
const grid = document.getElementById("manager-grid");
const status = document.getElementById("status");
let draft = null;
try {
  draft = JSON.parse(localStorage.getItem("templeImagePreview") || "null");
} catch {
  draft = null;
}
let images = draft?.gallery?.length ? [...draft.gallery] : (window.TEMPLE_GALLERY ? [...window.TEMPLE_GALLERY] : []);
const selectedHero = draft?.hero || window.TEMPLE_HERO;
let heroIndex = selectedHero ? images.findIndex((image) => image.src === selectedHero.src) : 0;
if (heroIndex < 0) heroIndex = 0;

const escapeHtml = (value) => value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

const savePreview = () => {
  const data = { gallery: images, hero: images[heroIndex] || null };
  try {
    localStorage.setItem("templeImagePreview", JSON.stringify(data));
  } catch {
    status.textContent = "Browser preview storage is full. Save the website file to keep these photos.";
  }
};

const render = () => {
  if (!images.length) {
    grid.innerHTML = '<div class="empty-state">No custom photos selected yet.</div>';
    return;
  }
  grid.innerHTML = images.map((image, index) => `<article class="manager-card" data-index="${index}">
    <img src="${image.src}" alt="${escapeHtml(image.alt)}">
    <label>Caption<input type="text" value="${escapeHtml(image.caption)}" data-field="caption"></label>
    <div class="card-actions"><button class="icon-button" type="button" data-action="up" title="Move up" aria-label="Move photo up">↑</button><button class="icon-button" type="button" data-action="down" title="Move down" aria-label="Move photo down">↓</button><button class="icon-button" type="button" data-action="remove" title="Remove" aria-label="Remove photo">×</button></div>
    <label class="hero-choice"><input type="radio" name="hero" value="${index}" ${index === heroIndex ? "checked" : ""}> Use as home-page photo</label>
    <label class="active-choice"><input type="checkbox" data-field="active" ${image.active ? "checked" : ""}> Show in home-page rotation</label>
  </article>`).join("");
};

const compressImage = (file) => new Promise((resolve, reject) => {
  const source = new Image();
  const objectUrl = URL.createObjectURL(file);
  source.onload = () => {
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    resolve({
      src: canvas.toDataURL("image/jpeg", 0.82),
      alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      active: true
    });
  };
  source.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`Could not read ${file.name}`)); };
  source.src = objectUrl;
});

input.addEventListener("change", async () => {
  const files = [...input.files];
  if (!files.length) return;
  status.textContent = `Preparing ${files.length} photo${files.length === 1 ? "" : "s"}...`;
  try {
    const additions = await Promise.all(files.map(compressImage));
    images.push(...additions);
    if (images.length === additions.length) heroIndex = 0;
    savePreview();
    render();
    status.textContent = `${additions.length} photo${additions.length === 1 ? "" : "s"} ready. Save the website file when finished.`;
  } catch (error) {
    status.textContent = error.message;
  }
  input.value = "";
});

["dragenter", "dragover"].forEach((name) => uploadZone.addEventListener(name, (event) => { event.preventDefault(); uploadZone.classList.add("is-dragging"); }));
["dragleave", "drop"].forEach((name) => uploadZone.addEventListener(name, (event) => { event.preventDefault(); uploadZone.classList.remove("is-dragging"); }));
uploadZone.addEventListener("drop", (event) => {
  const transfer = new DataTransfer();
  [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/")).forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
  input.dispatchEvent(new Event("change"));
});

grid.addEventListener("input", (event) => {
  const card = event.target.closest(".manager-card");
  if (!card) return;
  const index = Number(card.dataset.index);
  if (event.target.dataset.field === "caption") {
    images[index].caption = event.target.value;
    images[index].alt = event.target.value || "Temple gallery photo";
  }
  if (event.target.dataset.field === "active") images[index].active = event.target.checked;
  if (event.target.name === "hero") heroIndex = index;
  savePreview();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const index = Number(button.closest(".manager-card").dataset.index);
  const action = button.dataset.action;
  if (action === "remove") {
    images.splice(index, 1);
    heroIndex = Math.max(0, Math.min(heroIndex, images.length - 1));
  } else {
    const target = action === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    if (heroIndex === index) heroIndex = target; else if (heroIndex === target) heroIndex = index;
  }
  savePreview();
  render();
});

const generatedFile = () => `// Generated by manage-images.html\nwindow.TEMPLE_GALLERY = ${JSON.stringify(images)};\nwindow.TEMPLE_HERO = ${JSON.stringify(images[heroIndex] || null)};\n`;

document.getElementById("save-button").addEventListener("click", async () => {
  if (!images.length) { status.textContent = "Choose at least one photo first."; return; }
  const blob = new Blob([generatedFile()], { type: "text/javascript" });
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({ suggestedName: "gallery-data.js", types: [{ description: "JavaScript file", accept: { "text/javascript": [".js"] } }] });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      status.textContent = "Website image file saved. Your gallery and home photo are updated.";
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "gallery-data.js";
      link.click();
      URL.revokeObjectURL(link.href);
      status.textContent = "gallery-data.js downloaded. Replace the file with that name in your website folder.";
    }
  } catch (error) {
    if (error.name !== "AbortError") status.textContent = `Could not save: ${error.message}`;
  }
});

document.getElementById("preview-button").addEventListener("click", () => { savePreview(); location.href = "gallery.html"; });
document.getElementById("clear-button").addEventListener("click", () => { images = []; heroIndex = 0; localStorage.removeItem("templeImagePreview"); render(); status.textContent = "Custom photo preview cleared."; });
render();

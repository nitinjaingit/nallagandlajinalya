// Add gallery images here using paths relative to the website folder.
// Set active to true to include an image in the home-page rotation.
// Add gallery image ranges here using paths relative to the website folder.
// Use notInUse for image numbers that should be skipped.
window.TEMPLE_GALLERY_DATA = [
  {
    baseUrl: "assets/images/Gallery",
    start: 49,
    end: 77,
    padding: 2,
    alt: "Prakshal on 20-Sept-2026",
    caption: "Prakshal",
    date: "20-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 42,
    end: 48,
    padding: 2,
    alt: "Maha aarti on 19-Sept-2026",
    caption: "Maha aarti",
    date: "19-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 36,
    end: 41,
    padding: 2,
    alt: "कौन बनेगा ज्ञानी on 17-Sept-2026",
    caption: "कौन बनेगा ज्ञानी",
    date: "17-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 16,
    end: 35,
    padding: 2,
    alt: "Jains got talent on 16-Sept-2026",
    caption: "Jains got talent",
    date: "16-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 11,
    end: 13,
    padding: 2,
    alt: "Shobha yatra at Shree Digambar Jinalaya",
    caption: "Shobha yatra",
    date: "19-March-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 6,
    end: 6,
    padding: 2,
    alt: "Pathshala at Shree Digambar Jinalaya",
    caption: "Pathshala for  kids",
    date: "6-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 14,
    end: 15,
    padding: 2,
    alt: "Pooja gyan at Shree Digambar Jinalaya",
    caption: "Pooja gyan to kids",
    date: "14-Sept-2026",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 7,
    end: 10,
    padding: 2,
    alt: "Mata ji vihaar",
    date: "20-July-2026",
    caption: "Mata ji vihaar",
    active: true,
    notInUse: []
  },
  {
    baseUrl: "assets/images/Gallery",
    start: 1,
    end: 5,
    padding: 2,
    alt: "Pratima ji manjan at Shree Digambar Jinalaya",
    date: "13-Sept-2026",
    caption: "Pratima ji manjan",
    active: true,
    notInUse: []
  }
];

window.TEMPLE_GALLERY = window.TEMPLE_GALLERY_DATA.flatMap((range) => {
  const start = Number(range.start);
  const end = Number(range.end);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return [];

  const excluded = new Set((range.notInUse || []).map(Number));
  const baseUrl = String(range.baseUrl || "").replace(/\/$/, "");
  const extension = String(range.extension || "jpeg").replace(/^\./, "");
  const padding = Number(range.padding) || 0;

  return Array.from({length: end - start + 1}, (_, index) => start + index)
    .filter((imageNumber) => !excluded.has(imageNumber))
    .map((imageNumber) => ({
      src: `${baseUrl}/${String(imageNumber).padStart(padding, "0")}.${extension}`,
      alt: range.alt,
      caption: range.caption,
      date: range.date,
      active: range.active !== false
    }));
});

window.TEMPLE_HERO = null;

window.TEMPLE_HERO = null;
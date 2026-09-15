// Add approved data-only JavaScript files here for the website assistant.
// Each file must expose its searchable data on window using the listed global names.
window.SITE_ASSISTANT_SOURCES = [
  {
    src: "content.js?v=5",
    globals: ["TEMPLE_CONTENT"],
    label: "Jinalaya information",
    url: "index.html",
    excludePaths: [
      "TEMPLE_CONTENT.temple",
      "TEMPLE_CONTENT.announcements",
      "TEMPLE_CONTENT.events",
      "TEMPLE_CONTENT.eventHistory"
    ],
    routes: {
      "TEMPLE_CONTENT.commite": "contact.html"
    }
  },
  {
    src: "festival-data.js",
    globals: ["JAIN_FESTIVAL_DARPAN"],
    label: "Jain Darpan",
    url: "festivals.html"
  },
  {
    src: "gallery-data.js",
    globals: ["TEMPLE_GALLERY"],
    label: "Photo gallery",
    url: "gallery.html"
  },
  {
    src: "temples.js?v=2",
    globals: ["REGIONAL_TEMPLES"],
    label: "Jain temples near Hyderabad",
    url: "temples.html"
  }
];

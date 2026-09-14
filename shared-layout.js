(() => {
  const temple = window.TEMPLE_CONTENT?.temple;
  const templeName = temple?.name || "Shree Digambar Jinalaya";
  const locationName = temple?.shortAddress || "Nallagandla, Hyderabad";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const navigationItems = [
    ["donate.html", "Donate"],
    ["events.html", "Events"],
    ["gallery.html", "Gallery"],
    ["visit.html", "Visit"],
    ["other", "Other", [["temples.html", "Hyderabad Temples"], ["festivals.html", "Jain Darpan"], ["websites", "Jain websites", [["https://jaingranth.in/", "Jain Granth"], ["https://www.vidyasagar.net/", "Vidyasagar"]]]]],
    ["contact.html", "Contact"],
    ["about.html", "About"]
  ];

  const isNavigationItemActive = (href) => currentPage === href
    || (currentPage === "manage-images.html" && href === "gallery.html")
    || (currentPage === "event-details.html" && href === "events.html");

  const hasActiveChild = ([href, , children]) => children
    ? children.some(hasActiveChild)
    : isNavigationItemActive(href);

  const renderSubmenuItems = (items) => items.map(([href, label, children]) => {
    if (children) {
      const isActive = children.some(hasActiveChild);
      return `<details class="nav-submenu nested-submenu${isActive ? " active" : ""}"><summary>${label}</summary><div class="submenu-items">${renderSubmenuItems(children)}</div></details>`;
    }

    const isActive = isNavigationItemActive(href);
    const externalAttributes = /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a${isActive ? ' class="active" aria-current="page"' : ""} href="${href}"${externalAttributes}>${label}</a>`;
  }).join("");

  const navigation = navigationItems.map(([href, label, children]) => {
    if (children) {
      const isActive = children.some(hasActiveChild);
      const childLinks = renderSubmenuItems(children);
      return `<details class="nav-submenu${isActive ? " active" : ""}"><summary>${label}</summary><div class="submenu-items">${childLinks}</div></details>`;
    }

    const isActive = isNavigationItemActive(href);
    const className = [href === "donate.html" ? "nav-donate" : "", isActive ? "active" : ""]
      .filter(Boolean)
      .join(" ");
    return `<a${className ? ` class="${className}"` : ""} href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");

  const header = document.createElement("header");
  header.className = "site-header";
  header.id = "top";
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="Temple home">
        <span class="brand-mark" aria-hidden="true">卐</span>
        <span>
          <strong>${templeName}</strong>
          <small>${locationName}</small>
        </span>
      </a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav">
        <span class="menu-icon" aria-hidden="true"></span>
        <span class="sr-only">Open navigation</span>
      </button>
      <nav id="primary-nav" aria-label="Primary navigation">${navigation}</nav>
    </div>`;

  const existingHeader = document.querySelector(".site-header");
  if (existingHeader) {
    existingHeader.replaceWith(header);
  } else {
    document.body.prepend(header);
  }

  const menuButton = header.querySelector(".menu-button");
  const navigationElement = header.querySelector("#primary-nav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigationElement.classList.toggle("is-open", !isOpen);
  });
  navigationElement.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menuButton.setAttribute("aria-expanded", "false");
    navigationElement.classList.remove("is-open");
  });
  window.SHARED_LAYOUT_ACTIVE = true;

  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="brand footer-brand">
        <span class="brand-mark" aria-hidden="true">卐</span>
        <span>
          <strong>${templeName}</strong>
          <small>${locationName}</small>
        </span>
      </div>
      <div class="footer-social">
        <span>Follow us</span>
        <div class="social-links">
          <a class="social-link" href="https://www.facebook.com/share/1C2J84jZey/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
          </a>
          <a class="social-link" href="https://www.instagram.com/jainjinalaya.nallagandla?utm_source=qr&stkn=MTY2YXptNjV2dDZ3Mg==" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle class="social-icon-dot" cx="17.5" cy="6.5" r="1" /></svg>
          </a>
        </div>
      </div>
      <a href="#top">Back to top ↑</a>
    </div>`;

  const existingFooter = document.querySelector("footer");
  if (existingFooter) {
    existingFooter.replaceWith(footer);
  } else {
    document.body.append(footer);
  }

  const primaryPhone = (temple?.phone || "").split("/")[0].replace(/\D/g, "");
  const quickActions = document.createElement("nav");
  quickActions.className = "mobile-quick-actions";
  quickActions.setAttribute("aria-label", "Quick visitor actions");
  quickActions.innerHTML = `
    <a href="tel:+${primaryPhone}">Call</a>
    <a href="${temple?.directionsUrl || "visit.html"}" target="_blank" rel="noreferrer">Directions</a>
    <a href="https://wa.me/${primaryPhone}" target="_blank" rel="noreferrer">WhatsApp</a>`;
  document.body.append(quickActions);
})();

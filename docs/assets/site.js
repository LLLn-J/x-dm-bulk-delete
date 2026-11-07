// Applies config.js. The HTML already links to the live Chrome Web Store listing,
// so that path is correct with JavaScript off. An empty or non-store
// chromeWebStoreUrl switches the page back to the "pending review" state.
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var url = typeof config.chromeWebStoreUrl === "string" ? config.chromeWebStoreUrl.trim() : "";

  // Only accept a real Chrome Web Store address, so a typo can't send people elsewhere.
  var live = /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)\/\S+$/.test(url);

  if (live) {
    document.documentElement.setAttribute("data-cws", "live");
    document.querySelectorAll("[data-cws-link]").forEach(function (link) {
      link.setAttribute("href", url);
    });
  } else {
    document.documentElement.removeAttribute("data-cws");
    document.querySelectorAll("[data-cws-link]").forEach(function (link) {
      link.setAttribute("href", "#install");
    });
  }
  document.querySelectorAll("[data-cws-pending]").forEach(function (el) {
    el.hidden = live;
  });
  document.querySelectorAll("[data-cws-live]").forEach(function (el) {
    el.hidden = !live;
  });
})();

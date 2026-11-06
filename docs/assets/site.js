// Applies config.js. Today that is only the Chrome Web Store link: while it is empty
// the page keeps its "pending review" markup; once it is set, every [data-cws-link]
// points at the listing and the [data-cws-live] variants replace [data-cws-pending].
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var url = typeof config.chromeWebStoreUrl === "string" ? config.chromeWebStoreUrl.trim() : "";

  // Only accept a real Chrome Web Store address, so a typo can't send people elsewhere.
  if (!/^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)\/\S+$/.test(url)) return;

  document.documentElement.setAttribute("data-cws", "live");
  document.querySelectorAll("[data-cws-link]").forEach(function (link) {
    link.setAttribute("href", url);
  });
  document.querySelectorAll("[data-cws-pending]").forEach(function (el) {
    el.hidden = true;
  });
  document.querySelectorAll("[data-cws-live]").forEach(function (el) {
    el.hidden = false;
  });
})();

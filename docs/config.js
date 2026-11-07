/*
 * Landing page settings — the one place to edit when a store link changes.
 *
 * Chrome Web Store: the extension is live. The page HTML already uses this
 * official listing, so it is correct with JavaScript off. site.js still
 * reads chromeWebStoreUrl: a store address updates every
 * [data-cws-link], and an empty string (or any other address) shows
 * "Pending review" instead.
 * Only chromewebstore.google.com (or the older
 * chrome.google.com/webstore) addresses are accepted.
 */
window.SITE_CONFIG = {
  chromeWebStoreUrl: "https://chromewebstore.google.com/detail/dm-bulk-delete-for-x/ohiiccddhenbgfbgachigngnggjcgoeo"
};

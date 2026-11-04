// 弹窗文字跟随浏览器语言（chrome.i18n 按 _locales 自动选择，找不到对应语言时用英文）
const msg = (key) => chrome.i18n.getMessage(key);
document.documentElement.lang = chrome.i18n.getUILanguage();
document.title = msg('extName');
for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = msg(el.dataset.i18n);
document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;
document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://x.com/i/chat' });
  window.close();
});

document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://x.com/i/chat' });
  window.close();
});
document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;

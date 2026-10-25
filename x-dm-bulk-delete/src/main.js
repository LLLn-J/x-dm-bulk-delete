// main.js — 入口：读取设置，挂上面板。面板只在 x.com/i/chat 下显示。
(async () => {
  'use strict';
  const XBD = globalThis.XBD;
  if (!XBD || XBD.started) return;
  XBD.started = true;
  XBD.ui.init(await XBD.loadSettings());
})();

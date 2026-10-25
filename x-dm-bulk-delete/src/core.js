// core.js — 通用工具：穿透 shadow DOM 的查询、模拟鼠标事件、等待、日志、设置存储。
(() => {
  'use strict';
  const XBD = (globalThis.XBD = globalThis.XBD || {});

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // 固定间隔上加一点随机抖动，避免完全机械的节奏
  const jitter = (ms) => Math.round(ms * (0.85 + Math.random() * 0.4));

  async function waitFor(fn, { timeout = 3000, interval = 60 } = {}) {
    const deadline = performance.now() + timeout;
    for (;;) {
      let value = null;
      try {
        value = fn();
      } catch {
        value = null;
      }
      if (value) return value;
      if (performance.now() >= deadline) return null;
      await sleep(interval);
    }
  }

  // ---------- 穿透 shadow DOM ----------
  // X Chat 渲染在 x.com 页面里的 open shadow root 中（菜单、确认框也在里面），
  // 普通的 document.querySelector 找不到，所以所有查询都要遍历各个 shadow root。
  const OWN_HOST_ATTR = 'data-xbd-host';
  let rootCache = null;
  let rootCacheAt = 0;

  function collectRoots() {
    const found = [document];
    for (let i = 0; i < found.length; i++) {
      const walker = document.createTreeWalker(found[i], NodeFilter.SHOW_ELEMENT);
      for (let el = walker.nextNode(); el; el = walker.nextNode()) {
        if (el.shadowRoot && !el.hasAttribute(OWN_HOST_ATTR)) found.push(el.shadowRoot);
      }
    }
    return found;
  }

  function roots(force = false) {
    const now = performance.now();
    const stale =
      !rootCache || now - rootCacheAt > 2000 || rootCache.some((r) => r !== document && !r.host.isConnected);
    if (force || stale) {
      rootCache = collectRoots();
      rootCacheAt = now;
    }
    return rootCache;
  }

  function queryAll(selector, force = false) {
    const out = [];
    for (const root of roots(force)) out.push(...root.querySelectorAll(selector));
    return out;
  }

  function query(selector, force = false) {
    for (const root of roots(force)) {
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function deepActiveElement() {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    return el;
  }

  function isShown(el) {
    if (!el || !el.isConnected || !el.getClientRects().length) return false;
    return getComputedStyle(el).visibility !== 'hidden';
  }

  const textOf = (el) => (el ? el.innerText || el.textContent || '' : '').replace(/\s+/g, ' ').trim();

  // ---------- 多语言按钮文字匹配 ----------
  const normLabel = (s) =>
    (s || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[\s.…?？!！:：]+$/u, '');
  let labelSets = null;

  function labelSet(key) {
    if (!labelSets) {
      labelSets = new Map();
      for (const [k, list] of Object.entries(XBD.LABELS || {})) labelSets.set(k, new Set(list.map(normLabel)));
    }
    return labelSets.get(key) || new Set([normLabel(key)]);
  }

  // 元素文字是否恰好是某个按钮（任一界面语言）
  function isLabel(el, ...keys) {
    const t = normLabel(textOf(el));
    return !!t && keys.some((k) => labelSet(k).has(t));
  }

  // ---------- 模拟鼠标 ----------
  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 2),
      y: Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 2),
    };
  }

  const NON_BUBBLING = new Set(['pointerenter', 'pointerleave', 'mouseenter', 'mouseleave']);

  function fire(el, type, opts = {}) {
    const { x, y } = opts.at || centerOf(el);
    const init = {
      bubbles: !NON_BUBBLING.has(type),
      cancelable: true,
      composed: true,
      view: window,
      clientX: x,
      clientY: y,
      screenX: x + (window.screenX || 0),
      screenY: y + (window.screenY || 0),
      button: opts.button ?? 0,
      buttons: opts.buttons ?? 0,
      detail: opts.detail ?? 0,
      relatedTarget: opts.relatedTarget ?? null,
    };
    const ev = type.startsWith('pointer')
      ? new PointerEvent(type, {
          ...init,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true,
          width: 1,
          height: 1,
          pressure: init.buttons ? 0.5 : 0,
        })
      : new MouseEvent(type, init);
    return el.dispatchEvent(ev);
  }

  function hover(el, at) {
    const p = at || centerOf(el);
    for (const t of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove']) {
      fire(el, t, { at: p });
    }
  }

  function unhover(el) {
    if (!el?.isConnected) return;
    const p = centerOf(el);
    for (const t of ['pointerout', 'pointerleave', 'mouseout', 'mouseleave']) fire(el, t, { at: p });
  }

  // 菜单项、对话框按钮：悬停 + 单个 click 就够了（Radix / Base UI 都在 click 上触发选择）
  function activate(el) {
    const p = centerOf(el);
    hover(el, p);
    fire(el, 'click', { at: p, detail: 1 });
  }

  // 完整的按下-松开-点击序列，只在简单 click 打不开菜单时作为兜底
  function press(el) {
    const p = centerOf(el);
    hover(el, p);
    fire(el, 'pointerdown', { at: p, buttons: 1 });
    fire(el, 'mousedown', { at: p, buttons: 1 });
    fire(el, 'pointerup', { at: p });
    fire(el, 'mouseup', { at: p });
    fire(el, 'click', { at: p, detail: 1 });
  }

  function pressKey(key) {
    const el = deepActiveElement() || document.body;
    const code = key === 'Escape' ? 27 : 0;
    const init = { key, code: key, keyCode: code, which: code, bubbles: true, cancelable: true, composed: true };
    el.dispatchEvent(new KeyboardEvent('keydown', init));
    el.dispatchEvent(new KeyboardEvent('keyup', init));
  }

  // ---------- 日志 ----------
  const logLines = [];
  const logListeners = new Set();

  function log(msg, level = 'info') {
    const line = { time: new Date(), msg, level };
    logLines.push(line);
    if (logLines.length > 300) logLines.shift();
    for (const fn of logListeners) fn(line);
    (level === 'error' ? console.warn : console.debug)('[X 私信批量删除]', msg);
  }

  const onLog = (fn) => logListeners.add(fn);

  // ---------- 设置 ----------
  const STORE_KEY = 'xbdSettings';
  const DEFAULTS = {
    tab: null, // conv | msg；首次使用时按当前页面决定
    msgMode: 'me', // me | all | all-only
    msgFilter: 'all', // all | mine | theirs
    leaveGroups: false,
    delayMs: 800,
    panel: { left: null, top: null, collapsed: false },
  };
  const chromeStorage = () => (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) || null;

  async function loadSettings() {
    let saved = {};
    try {
      const store = chromeStorage();
      saved = store ? (await store.get(STORE_KEY))[STORE_KEY] || {} : JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch {
      saved = {};
    }
    return { ...DEFAULTS, ...saved, panel: { ...DEFAULTS.panel, ...(saved.panel || {}) } };
  }

  function saveSettings(settings) {
    try {
      const store = chromeStorage();
      if (store) store.set({ [STORE_KEY]: settings });
      else localStorage.setItem(STORE_KEY, JSON.stringify(settings));
    } catch {
      // 扩展被重新加载后旧页面里的 chrome.storage 会失效，忽略即可
    }
  }

  Object.assign(XBD, {
    OWN_HOST_ATTR,
    sleep,
    jitter,
    waitFor,
    roots,
    queryAll,
    query,
    deepActiveElement,
    isShown,
    textOf,
    isLabel,
    centerOf,
    fire,
    hover,
    unhover,
    activate,
    press,
    pressKey,
    log,
    onLog,
    logLines,
    loadSettings,
    saveSettings,
  });
})();

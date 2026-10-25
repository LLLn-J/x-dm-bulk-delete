// ==UserScript==
// @name               X 私信批量删除
// @name:en            DM Bulk Delete for X
// @name:zh-CN         X 私信批量删除
// @namespace          https://github.com/LLLn-J/x-dm-bulk-delete
// @version            1.0.0
// @description        在 X（Twitter）私信页面批量勾选并删除单条消息或整个会话。在本机模拟点击 X 自己的菜单完成，数据不会离开你的设备。
// @description:en     Bulk-delete X (Twitter) DMs: tick messages or whole chats and delete them in one go. Runs locally; no data leaves your device.
// @description:zh-CN  在 X（Twitter）私信页面批量勾选并删除单条消息或整个会话。在本机模拟点击 X 自己的菜单完成，数据不会离开你的设备。
// @author             Xuan Hu
// @license            MIT
// @homepageURL        https://github.com/LLLn-J/x-dm-bulk-delete
// @supportURL         https://github.com/LLLn-J/x-dm-bulk-delete/issues
// @icon               data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACyUlEQVR42u2az0sVURTH5z8oxQLTQghzEcITxFWLgsBFiwcuRITgCW6KIGpjIEiIEEjkIogoNy1CEmolCW0mUNRNm8xN26BV8N6jX4rhdb6DZ7jvvvl1Z86deWMe+PJ+3JnhfOaee+65c8eyAuxUR2fJ0YIj25HISfaRDyUrrjkH9+TsdBhMT5TzFUfVFnSeBN8qYc6LgqjiFzbVAgFUG8KpRWM+ckzI2Sb1BfsHhsSN8oivDEKUrKM0lepC4zcnRJh93v5iCmCBJXzW1jdcR/H5aP6xp2fPX4hare62GeoJ2+K4EAFcuNjX1AYIgwAiNsCD6ZmGuyuLAHTbSFeuXjcLgLtn0gB5AhAmxDaFArdhkN+6c9f8GGhVaQOgNzCgV96vur2SRMhMXFlJGwCTEpdhAswUAOmO09CLmQKg3uG010tvsg8h1SiW5XJCTb3qMWSYxE4AdE+g4owDANkscwDViTQAHKn0/wNA6uMCSFOFJgbAwOMCyGUmTguAJJBrKZEGAI7Tqq2td1C0D5Wj1X+NF0BdG+gAQKe7L4nOe2/F+Ze12Do3uxUIkjmArvOkrvkdFz5XAISNjtOTH36Lh5t/vd8dw7d5FjRJARDTOs6TEcTZsbliAAy/+ynqewfe+YApDMDlV3Wx8+Ofd+7i9q7XxgYgr8qSAoyu/BIb3/e9u0ta/rrnnYd2uY0NQJ5RAUMTFD1lwG8ZEt9RNsgAcA6GUEHI4D/EOhn+R28YAVDroTiGXpABnnzabXBWdh5GUEYAop5GxwFQw0W2+x//+I4PNgB6VqoubnQB5FAiA1TQAA8CyGx3xg9Azjr4DMtQPgA2ywZHbACnnglKnchK6qBVdaY85bvBUcryUSAKsyS1UPfTb24p0rTFlPUmH3oBhZmu8z51kJ3bNiuqSjiEmI4Swsbnzlebdu0LvdF9LF41OBYvexTxdZtDSI1uYo00CMIAAAAASUVORK5CYII=
// @match              https://x.com/*
// @match              https://twitter.com/*
// @grant              none
// @run-at             document-idle
// @noframes
// @updateURL          https://raw.githubusercontent.com/LLLn-J/x-dm-bulk-delete/userscript/x-dm-bulk-delete.meta.js
// @downloadURL        https://raw.githubusercontent.com/LLLn-J/x-dm-bulk-delete/userscript/x-dm-bulk-delete.user.js
// ==/UserScript==

// ---- src/labels.js ----
// 由 tools/update_labels.py 从 X Chat 自带的语言包生成（42 种界面语言 + 英文），请勿手改。
// 键是 X 源码里的英文原文，值是各语言界面上实际显示的按钮文字。
(() => {
  const XBD = (globalThis.XBD = globalThis.XBD || {});
  XBD.LABELS = {
    "Delete": ["Delete", "حذف", "Изтриване", "মুছে ফেলুন", "Suprimeix", "Smazat", "Slet", "Löschen", "Διαγραφή", "Eliminar", "Poista", "I-delete", "Supprimer", "કાઢી નાખો", "מחק", "मिटाएं", "Izbriši", "Törlés", "Hapus", "Elimina", "削除", "ಅಳಿಸಿ", "삭제하기", "हटवा", "Padam", "Verwijderen", "Slett", "Usuń", "Excluir", "Șterge", "Удалить", "Odstrániť", "Избриши", "Radera", "நீக்கு", "ลบ", "Sil", "Видалити", "Xóa", "删除", "刪除"],
    "Delete for me": ["Delete for me", "حذف لديّ", "Изтриване за мен", "আমার জন্য মুছুন", "Suprimeix per a mi", "Odstranit pro mě", "Slet for mig", "Für mich löschen", "Διαγραφή για μένα", "Eliminar para mí", "حذف کردن برای من", "Poista itseltäni", "I-delete sa akin", "Supprimer pour moi", "મારા માટે કાઢી નાખો", "מחיקה עבורי", "मेरे लिए हटाएँ", "Izbriši za mene", "Törlés nálam", "Hapus untuk saya", "Elimina per me", "自分から削除", "ನನಗಾಗಿ ಅಳಿಸಿ", "내 계정에서만 삭제", "माझ्यासाठी हटवा", "Padamkan untuk saya", "Verwijderen voor mij", "Slett for meg", "Usuń dla mnie", "Excluir para mim", "Șterge pentru mine", "Удалить для меня", "Odstrániť u\\xA0mňa", "Избриши за мене", "Radera för mig", "எனக்கு நீக்கு", "ลบสำหรับฉัน", "Benim için sil", "Видалити для мене", "Xóa cho tôi", "仅删除我的", "為我刪除"],
    "Delete for all": ["Delete for all", "حذف لدى الجميع", "Изтриване за всички", "সকলের জন্য মুছুন", "Esborra per a tots", "Odstranit pro všechny", "Slet for alle", "Für alle löschen", "Διαγραφή για όλους", "Eliminar para todos", "حذف کردن برای همه", "Poista kaikilta", "I-delete sa lahat", "Supprimer pour tous", "સૌના માટે કાઢી નાખો", "מחיקה עבור כולם", "सभी के लिए हटाएँ", "Izbriši za sve", "Törlés mindenkinél", "Hapus untuk semua", "Elimina per tutti", "全員から削除", "ಎಲ್ಲರಿಗಾಗಿ ಅಳಿಸಿ", "모두 삭제", "सर्वांसाठी हटवा", "Padamkan untuk semua", "Voor iedereen verwijderen", "Slett for alle", "Usuń dla wszystkich", "Excluir para todos", "Șterge pentru toți", "Удалить для всех", "Odstrániť u\\xA0všetkých", "Избриши за све", "Radera för alla", "எல்லோருக்கும் நீக்கு", "ลบสำหรับทุกคน", "Herkes için sil", "Видалити для всіх", "Xóa cho tất cả", "删除全部", "為所有人刪除"],
    "Just me": ["Just me", "أنا فقط", "Само аз", "শুধু আমি", "Només jo", "Jen já", "Kun mig", "Nur ich", "Μόνο εγώ", "Solo yo", "فقط من", "Vain minulta", "Ako lang", "Juste moi", "માત્ર હું", "רק אני", "सिर्फ़ मैं", "Samo ja", "Csak én", "Hanya saya", "Solo io", "自分だけ", "ನಾನು ಮಾತ್ರ", "나만", "फक्त मी", "Alleen ik", "Bare meg", "Tylko u mnie", "Só eu", "Doar eu", "Только я", "Len ja", "Само ја", "Bara jag", "நான் மட்டும்", "แค่ฉัน", "Sadece ben", "Тільки я", "Chỉ mình tôi", "只有我"],
    "Everyone": ["Everyone", "الجميع", "Всички", "সবাই", "Tothom", "Všichni", "Alle", "Όλοι", "Todos", "همه", "Kaikki", "Lahat", "Tout le monde", "દરેક", "כולם", "सभी", "Svi", "Mindenki", "Semua orang", "Tutti", "全員", "ಪ್ರತಿಯೊಬ್ಬರೂ", "모든 사람", "प्रत्येकजण", "Iedereen", "Wszyscy", "Qualquer pessoa", "Toți", "Все", "Každý", "Сви", "Alla", "அனைவரும்", "ทุกคน", "Herkes", "Усі", "Tất cả mọi người", "每个人", "所有人"],
    "Cancel": ["Cancel", "إلغاء", "Отказ", "বাতিল", "Cancel·la", "Zrušit", "Annuller", "Abbrechen", "Ακύρωση", "Cancelar", "لغو", "Peruuta", "Kanselahin", "Annuler", "રદ કરો", "ביטול", "रद्द करें", "Odustani", "Mégsem", "Batalkan", "Annulla", "キャンセル", "ರದ್ದು ಮಾಡಿ", "취소", "रद्द करा", "Batal", "Annuleren", "Avbryt", "Anuluj", "Anulează", "Отмена", "Zrušiť", "Откажи", "ரத்துசெய்", "ยกเลิก", "İptal", "Скасувати", "Hủy", "取消"],
    "Confirm": ["Confirm", "تأكيد", "Потвърждаване", "নিশ্চিত", "Confirma", "Potvrdit", "Bekræft", "Bestätigen", "Επιβεβαίωση", "Confirmar", "تایید", "Vahvista", "Kumpirmahin", "Confirmer", "પુષ્ટિ કરો", "אישור", "पुष्टि करें", "Potvrdi", "Megerősítés", "Konfirmasi", "Conferma", "確認する", "ದೃಢೀಕರಿಸಿ", "확인", "पुष्टी करा", "Sahkan", "Bevestigen", "Bekreft", "Potwierdź", "Confirmă", "Подтвердить", "Potvrdiť", "Потврди", "Bekräfta", "உறுதிப்படுத்து", "ตกลง", "Onayla", "Підтвердити", "Xác nhận", "确认", "確認"],
    "Delete conversation": ["Delete conversation", "حذف المحادثة", "Изтриване на разговора", "কথা-বার্তা মুছে ফেলুন", "Suprimeix la conversa", "Smazat konverzaci", "Slet samtalen", "Konversation löschen", "Διαγραφή συζήτησης", "Eliminar conversación", "حذف گفتگو", "Poista keskustelu", "I-delete ang usapan", "Supprimer la conversation", "વાર્તાલાપ કાઢી નાખો", "מחק את השיחה", "बातचीत मिटाएं", "Izbriši razgovor", "Beszélgetés törlése", "Hapus percakapan", "Elimina conversazione", "会話を削除", "ಸಂವಾದವನ್ನು ಅಳಿಸಿ", "대화 삭제", "चर्चा हटवा", "Padam perbualan", "Gesprek verwijderen", "Slett samtalen", "Usuń rozmowę", "Excluir conversa", "Șterge conversația", "Удалить переписку", "Odstrániť konverzáciu", "Обриши разговор", "Radera konversation", "உரையாடலை நீக்கு", "ลบการสนทนา", "Sohbeti sil", "Видалити розмову", "Xóa cuộc trò chuyện", "删除对话", "刪除對話"],
    "Leave conversation": ["Leave conversation", "مغادرة المحادثة", "Напускане на разговора", "কথা-বার্তা ত্যাগ করুন", "Abandona la conversa", "Opustit konverzaci", "Forlad samtale", "Konversatiom verlassen", "Αποχώρηση από τη συζήτηση", "Salir de la conversación", "ترک گفتگو", "Poistu keskustelusta", "Umalis sa usapan", "Quitter la conversation", "વાતચીત છોડો", "צא מהשיחה", "बातचीत छोड़ दें", "Napusti razgovor", "Kilépés a beszélgetésből", "Tinggalkan percakapan", "Abbandona conversazione", "会話を削除する", "ಸಂವಾದವನ್ನು ತೊರೆಯಿರಿ", "대화 나가기", "बाहेर पडा", "Tinggalkan perbualan", "Gesprek verlaten", "Forlat samtalen", "Opuść rozmowę", "Sair da conversa", "Părăsește conversația", "Покинуть переписку", "Opustiť konverzáciu", "Напусти разговор", "Lämna konversationen", "உரையாடலை விட்டு விலகு", "ออกจากบทสนทนา", "Sohbetten ayrıl", "Покинути розмову", "Rời khỏi cuộc trò chuyện", "离开对话", "離開對話"]
  };
})();

// ---- src/core.js ----
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

// ---- src/xchat.js ----
// xchat.js — X Chat 网页版（x.com/i/chat）的页面结构和删除流程。
// 选择器取自 X Chat 前端代码里的 data-testid / data-slot（2026-10，构建 cfb77a3b）。
// 删除全部通过模拟点击 X 自己的菜单完成：新版私信是端到端加密的，删除请求要由 X 的客户端签名，
// 直接调接口做不到，借用它自己的界面是最稳的办法。
(() => {
  'use strict';
  const XBD = globalThis.XBD;
  const { sleep, waitFor, queryAll, query, isShown, isLabel, fire, hover, unhover, activate, press, pressKey } = XBD;

  const esc = (s) => CSS.escape(s);
  const SEL = {
    convScroller: '[data-testid="dm-conversation-scroller"], [data-testid="dm-message-requests-scroller"]',
    convItem: '[data-testid^="dm-conversation-item-"], [data-testid^="dm-message-request-item-"]',
    msgScroller: '[data-testid="dm-message-scroller"]',
    msgRow: '[data-dm-message-row]',
    msgContent: '[data-dm-message-focus-target$=":content"]',
    menu: '[role="menu"]',
    menuItem: '[role="menuitem"]',
    dialog: '[data-slot="xds-modal-surface"], [role="dialog"], [role="alertdialog"]',
    dialogFooter: '[data-slot="xds-modal-footer"]',
  };
  const CONV_ID_RE = /^dm-(?:conversation|message-request)-item-(.+)$/;

  const firstShown = (selector) => queryAll(selector).find(isShown) || null;

  // 会话列表（收件箱和“消息请求”列表结构相同）
  const conv = {
    key: 'conv',
    noun: '会话',
    rows: () => queryAll(SEL.convItem).filter((el) => CONV_ID_RE.test(el.getAttribute('data-testid') || '')),
    idOf: (el) => (el.getAttribute('data-testid') || '').match(CONV_ID_RE)?.[1] ?? null,
    find: (id) =>
      query(`[data-testid="dm-conversation-item-${esc(id)}"], [data-testid="dm-message-request-item-${esc(id)}"]`),
    scrollerOf: (el) => el.closest(SEL.convScroller),
    scroller: () => firstShown(SEL.convScroller),
    // 1:1 会话 id 是 “用户A-用户B”，群聊是 “g” 开头
    isGroup: (id) => /^g\d/.test(id),
  };

  // 当前打开的对话里的消息
  const msg = {
    key: 'msg',
    noun: '消息',
    rows: () => queryAll(SEL.msgRow).filter((el) => el.closest(SEL.msgScroller)),
    idOf: (el) => el.getAttribute('data-dm-message-row'),
    find: (id) => query(`[data-dm-message-row="${esc(id)}"]`),
    scrollerOf: (el) => el.closest(SEL.msgScroller),
    scroller: () => firstShown(SEL.msgScroller),
    // X 用 justify-end 把自己发的消息靠右排
    isMine: (el) =>
      el.classList.contains('justify-end') ||
      (!el.classList.contains('justify-start') && getComputedStyle(el).justifyContent === 'flex-end'),
  };

  // ---------- 菜单与对话框 ----------
  function isOpenPopup(el) {
    if (!isShown(el)) return false;
    if (el.getAttribute('data-state') === 'closed') return false; // Radix
    return !el.hasAttribute('data-closed') && !el.hasAttribute('data-ending-style'); // Base UI
  }

  const openMenus = () => queryAll(SEL.menu).filter(isOpenPopup);
  const openDialogs = () => queryAll(SEL.dialog).filter(isOpenPopup);
  const menuItems = (menu) =>
    [...menu.querySelectorAll(SEL.menuItem)].filter(
      (i) => isShown(i) && i.getAttribute('aria-disabled') !== 'true' && !i.hasAttribute('data-disabled'),
    );
  const isDestructive = (el) => /--x-fg-destructive|text-red-500/.test(el.getAttribute('class') || '');

  async function dismissPopups() {
    for (let i = 0; i < 4 && (openMenus().length || openDialogs().length); i++) {
      pressKey('Escape');
      await sleep(180);
    }
  }

  async function openMenuFrom(trigger) {
    const before = new Set(openMenus());
    const fresh = () => openMenus().find((m) => !before.has(m) && menuItems(m).length);
    // 1) 单个 click（Base UI 按键盘触发处理，直接打开）
    fire(trigger, 'click', { detail: 0 });
    let menu = await waitFor(fresh, { timeout: 700 });
    if (menu) return menu;
    // 2) 新版消息菜单是悬停打开的
    hover(trigger);
    menu = await waitFor(fresh, { timeout: 900 });
    if (menu || !trigger.isConnected) return menu;
    // 3) 完整的按下/松开序列
    press(trigger);
    return waitFor(fresh, { timeout: 1200 });
  }

  // 在确认框里点“确认/删除”。footer 里按钮顺序是 [取消, 确认]，Base UI 还会在末尾塞一个隐藏的关闭按钮
  async function confirmDialog(dlg, keys) {
    const buttons = [...dlg.querySelectorAll('button')].filter(isShown);
    const footer = buttons.filter((b) => b.closest(SEL.dialogFooter));
    const pool = footer.length ? footer : buttons;
    const btn = pool.find((b) => isLabel(b, ...keys)) || pool.filter((b) => !isLabel(b, 'Cancel')).pop();
    if (!btn) return false;
    activate(btn);
    await waitFor(() => !isOpenPopup(dlg), { timeout: 3000 });
    return true;
  }

  // ---------- 定位行 ----------
  // 两个列表都是虚拟滚动：离可视区远的行不在 DOM 里，要先滚过去
  async function locate(kind, id, positions) {
    let el = kind.find(id);
    if (el) return el;
    const scroller = kind.scroller();
    if (!scroller) return null;
    const remembered = positions?.get(id);
    if (remembered != null) {
      scroller.scrollTop = Math.max(0, remembered - scroller.clientHeight / 2);
      el = await waitFor(() => kind.find(id), { timeout: 900 });
      if (el) return el;
    }
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 60; i++) {
        const before = scroller.scrollTop;
        scroller.scrollTop = before + dir * scroller.clientHeight * 0.8;
        await sleep(300);
        el = kind.find(id);
        if (el) return el;
        if (Math.abs(scroller.scrollTop - before) < 2) break;
      }
    }
    return null;
  }

  const fail = (reason) => ({ status: 'fail', reason });
  const skip = (reason) => ({ status: 'skip', reason });

  // ---------- 删除一条消息 ----------
  // mode: me 仅为我删除 | all 为所有人删除（做不到就为我删除）| all-only 只做为所有人删除（做不到就跳过）
  // X 有两套消息菜单：
  //   新版：「删除」(或别人的消息是「仅删除我的」) → 菜单内二级选项「只有我 / 每个人」
  //   旧版：「删除全部」「仅删除我的」 → 弹出确认框
  async function deleteMessage(id, mode, positions) {
    let row = await locate(msg, id, positions);
    if (!row) return fail('没找到这条消息（可能已被删掉或还没加载）');
    row.scrollIntoView({ block: 'center' });
    await sleep(150);
    await dismissPopups();
    row = msg.find(id) || row; // 滚动后虚拟列表可能换了节点

    const btnSel = `[data-testid="message-overflow-button-${esc(id)}"]`;
    const content = row.querySelector(SEL.msgContent) || row;
    let btn = null;
    for (let attempt = 0; attempt < 3 && !btn; attempt++) {
      hover(content); // 悬停后 X 才渲染消息旁边的「更多」按钮
      btn = await waitFor(() => row.querySelector(btnSel) || query(btnSel), { timeout: 900 + attempt * 600 });
    }
    if (!btn) return fail('悬停后没出现「更多」按钮');

    const menu = await openMenuFrom(btn);
    if (!menu) return fail('「更多」菜单没打开');
    let everyoneUsed = false;
    try {
      const items = menuItems(menu);
      const pick = (key) => items.find((i) => isLabel(i, key));
      const forAll = pick('Delete for all');
      const forMe = pick('Delete for me');
      const del = pick('Delete');
      let first = null;
      if (mode !== 'me' && forAll) {
        first = forAll;
        everyoneUsed = true;
      } else if (mode === 'me' && forMe) {
        first = forMe;
      } else if (del) {
        first = del;
      } else if (forMe) {
        if (mode === 'all-only') return skip('这条只能为自己删除');
        first = forMe;
      } else {
        const destructive = items.filter(isDestructive);
        if (destructive.length === 1) first = destructive[0];
      }
      if (!first) return fail('菜单里没有删除选项');

      const dialogsBefore = new Set(openDialogs());
      activate(first);
      const next = await waitFor(
        () => {
          const dlg = openDialogs().find((d) => !dialogsBefore.has(d));
          if (dlg) return { dlg };
          const all = openMenus().flatMap(menuItems);
          const justMe = all.find((i) => isLabel(i, 'Just me'));
          const everyone = all.find((i) => isLabel(i, 'Everyone'));
          if (justMe || everyone) return { justMe, everyone };
          if (!openMenus().length) return { closed: true };
          return null;
        },
        { timeout: 2500 },
      );
      if (!next) return fail('点了删除后没出现确认');

      if (next.dlg) {
        if (!(await confirmDialog(next.dlg, ['Delete for all', 'Delete for me', 'Delete', 'Confirm']))) {
          return fail('确认框里找不到确认按钮');
        }
      } else if (next.justMe || next.everyone) {
        const choice = mode === 'me' ? next.justMe : next.everyone || (mode === 'all' ? next.justMe : null);
        if (!choice) return skip('这条只能为自己删除');
        everyoneUsed = choice === next.everyone;
        activate(choice);
      }

      const gone = await waitFor(() => !msg.find(id), { timeout: 6000, interval: 100 });
      if (!gone) return fail('删除后消息还在列表里');
      return { status: 'ok', note: everyoneUsed ? '已为所有人删除' : '已为我删除' };
    } finally {
      await dismissPopups();
      unhover(row);
    }
  }

  // ---------- 删除一个会话 ----------
  // 会话没有「更多」按钮，操作菜单是右键菜单：「删除对话」(群聊是「离开对话」) → 确认框
  async function deleteConversation(id, { leaveGroups }, positions) {
    const isGroup = conv.isGroup(id);
    if (isGroup && !leaveGroups) return skip('群聊（没勾选“群聊也删除”）');
    let item = await locate(conv, id, positions);
    if (!item) return fail('列表里没找到这个会话（可能已被删掉）');
    item.scrollIntoView({ block: 'nearest' });
    await sleep(150);
    await dismissPopups();
    item = conv.find(id) || item;

    const trigger = item.querySelector('[data-inbox-row]') || item.querySelector('a') || item;
    const before = new Set(openMenus());
    hover(trigger);
    fire(trigger, 'contextmenu', { button: 2, buttons: 2 });
    const menu = await waitFor(() => openMenus().find((m) => !before.has(m)), { timeout: 2000 });
    if (!menu) return fail('右键菜单没打开');
    try {
      // 菜单先只有「在新标签页打开」，会话操作稍后才异步加进来
      const action = await waitFor(
        () => menuItems(menu).find((i) => isLabel(i, 'Delete conversation', 'Leave conversation')),
        { timeout: 3000 },
      );
      if (!action) return fail('右键菜单里没有“删除对话”');

      const dialogsBefore = new Set(openDialogs());
      activate(action);
      const dlg = await waitFor(() => openDialogs().find((d) => !dialogsBefore.has(d)), { timeout: 3000 });
      if (dlg && !(await confirmDialog(dlg, ['Confirm', 'Delete', 'Delete conversation', 'Leave conversation']))) {
        return fail('确认框里找不到确认按钮');
      }
      const gone = await waitFor(() => !conv.find(id), { timeout: 8000, interval: 120 });
      if (!gone) return fail('删除后会话还在列表里');
      return { status: 'ok', note: isGroup ? '已退出并删除' : '已删除' };
    } finally {
      await dismissPopups();
    }
  }

  // ---------- 自动滚动加载（全选用） ----------
  // dir: -1 往上（加载更早的消息），1 往下（加载更多会话）。onStep 收集当前行并返回新出现的行数
  async function sweep(kind, dir, onStep, shouldStop) {
    const scroller = kind.scroller();
    if (!scroller) return;
    let idle = 0;
    for (let step = 0; step < 2000 && !shouldStop(); step++) {
      const added = onStep();
      const before = scroller.scrollTop;
      scroller.scrollTop = before + dir * scroller.clientHeight * 0.85;
      await sleep(450);
      const moved = Math.abs(scroller.scrollTop - before) > 1;
      idle = moved || added ? 0 : idle + 1;
      if (idle >= 6) break; // 连续约 3 秒没滚动也没新行：到头了
    }
    onStep();
  }

  function diagnostics() {
    const count = (sel) => queryAll(sel, true).length;
    const build = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .find((n) => n.includes('/x-web/xchat/embed/'));
    // 优先取 X Chat 根节点上的界面语言，而不是外层 <html lang>
    const langEl = queryAll('[lang]').find((el) => el.getRootNode() !== document) || document.documentElement;
    return {
      path: location.pathname.replace(/\d{4,}/g, '#'),
      xchatBuild: build ? (build.match(/embed\/([0-9a-f]{8})/) || [])[1] : null,
      shadowRoots: XBD.roots(true).length - 1,
      lang: langEl ? langEl.getAttribute('lang') : null,
      counts: {
        inboxPanel: count('[data-testid="dm-inbox-panel"]'),
        convScroller: count(SEL.convScroller),
        convItems: conv.rows().length,
        inboxRows: count('[data-inbox-row]'),
        msgScroller: count(SEL.msgScroller),
        msgRows: msg.rows().length,
        overflowButtons: count('[data-testid^="message-overflow-button-"]'),
        openMenus: openMenus().length,
        openDialogs: openDialogs().length,
      },
    };
  }

  XBD.xchat = {
    SEL,
    conv,
    msg,
    openMenus,
    openDialogs,
    dismissPopups,
    deleteMessage,
    deleteConversation,
    sweep,
    diagnostics,
  };
})();

// ---- src/ui.js ----
// ui.js — 悬浮面板、勾选标记、选择模式和删除队列。
(() => {
  'use strict';
  const XBD = globalThis.XBD;
  const { sleep, jitter, log, onLog, logLines, saveSettings, OWN_HOST_ATTR } = XBD;
  const XC = XBD.xchat;
  const KINDS = { conv: XC.conv, msg: XC.msg };
  const UNIT = { conv: '个会话', msg: '条消息' };
  const HOMEPAGE = 'https://github.com/LLLn-J/x-dm-bulk-delete';
  const VERSION = (() => {
    try {
      return chrome.runtime.getManifest().version;
    } catch {
      // 油猴脚本里没有 chrome.runtime，用管理器提供的 GM_info；本地测试页两者都没有
      return typeof GM_info !== 'undefined' ? GM_info.script.version : 'dev';
    }
  })();

  let settings = null;
  let active = false;
  let rafPending = false;
  let chatPath = null; // 当前对话的 id（见 convKeyOf）
  const $ = {};
  const state = {
    selecting: false,
    busy: null, // null | 'run' | 'sweep'
    stop: false,
    selected: { conv: new Set(), msg: new Set() },
    meta: { conv: new Map(), msg: new Map() }, // id -> { pos, mine }
    anchor: { conv: null, msg: null }, // 上次点击的行，用于 Shift 连选
    flags: { conv: new Map(), msg: new Map() }, // id -> 'current' | 'failed'
    visible: { conv: [], msg: [] },
    marks: new Map(), // id -> 标记元素（只画当前标签页的）
    progress: null,
    armedUntil: 0,
  };

  const CSS_TEXT = `
:host { all: initial; }
* { box-sizing: border-box; }
.wrap { --bg:#fff; --fg:#0f1419; --muted:#536471; --line:#eff3f4; --soft:#f7f9f9; --accent:#1d9bf0; --danger:#f4212e; --ok:#00ba7c;
  font: 13px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: var(--fg); }
.wrap.dark { --bg:#16181c; --fg:#e7e9ea; --muted:#8b98a5; --line:#2f3336; --soft:#202327; }
.panel { position: fixed; z-index: 2147483646; width: 316px; max-height: calc(100vh - 24px); display: flex; flex-direction: column;
  background: var(--bg); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.22); pointer-events: auto; overflow: hidden; }
.head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: move; user-select: none; border-bottom: 1px solid var(--line); }
.head b { font-size: 14px; }
.head .badge { margin-left: auto; font-size: 12px; color: var(--muted); }
.panel.collapsed .body { display: none; }
.panel.collapsed .head { border-bottom: 0; }
.body { padding: 10px 12px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.tabs { display: flex; background: var(--soft); border-radius: 999px; padding: 3px; }
.tabs button { flex: 1; border: 0; background: transparent; color: var(--muted); padding: 5px 0; border-radius: 999px; font: inherit; font-weight: 600; cursor: pointer; }
.tabs button.on { background: var(--bg); color: var(--fg); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.pane { display: flex; flex-direction: column; gap: 8px; }
.pane[hidden] { display: none; }
.stats { color: var(--muted); }
.stats b { color: var(--fg); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
button.btn { border: 1px solid var(--line); background: var(--bg); color: var(--fg); border-radius: 999px; padding: 6px 10px; font: inherit; font-weight: 600; cursor: pointer; }
button.btn:hover:not(:disabled) { background: var(--soft); }
button.btn:disabled { opacity: .45; cursor: default; }
button.btn.on { background: var(--accent); border-color: var(--accent); color: #fff; }
button.icon { border: 0; background: transparent; color: var(--muted); font-size: 16px; line-height: 1; padding: 2px 6px; border-radius: 6px; cursor: pointer; }
button.icon:hover { background: var(--soft); }
button.danger { border: 0; background: var(--danger); color: #fff; border-radius: 999px; padding: 9px 10px; font: inherit; font-weight: 700; cursor: pointer; }
button.danger:disabled { opacity: .4; cursor: default; }
button.danger.armed { background: #b3000c; }
label.opt { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.field { display: flex; align-items: center; gap: 6px; color: var(--muted); }
.field select, .field input { flex: 1; min-width: 0; font: inherit; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 4px 6px; }
.field input { flex: 0 0 76px; }
.hint { color: var(--muted); font-size: 12px; }
.warn { color: var(--danger); font-size: 12px; }
.warn:empty { display: none; }
.progress { display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; background: var(--soft); }
.progress[hidden] { display: none; }
.bar { height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; background: var(--accent); transition: width .2s; }
.progress .line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.log { max-height: 110px; overflow-y: auto; font: 11.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); background: var(--soft); border-radius: 8px; padding: 6px 8px; white-space: pre-wrap; word-break: break-all; }
.log:empty { display: none; }
.log .error { color: var(--danger); }
.foot { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 12px; }
.link { border: 0; background: none; color: var(--accent); font: inherit; padding: 0; cursor: pointer; text-decoration: none; }
a.link:hover { text-decoration: underline; }
textarea.diag { width: 100%; height: 120px; font: 11px ui-monospace, Menlo, monospace; color: var(--fg); background: var(--soft); border: 1px solid var(--line); border-radius: 8px; }
textarea.diag[hidden] { display: none; }
.layer { position: fixed; inset: 0; pointer-events: none; z-index: 2147483640; }
.mark { position: fixed; border-radius: 10px; border: 2px solid transparent; }
/* 勾选圈贴着行的最左边：X 的会话行和消息行左侧都有约 16px 留白，这样不会压住头像 */
.mark .box { position: absolute; left: 1px; top: 50%; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; border: 2px solid var(--accent); background: var(--bg); }
.mark.on { background: rgba(29,155,240,.10); border-color: rgba(29,155,240,.6); }
.mark.on .box { background: var(--accent); }
.mark.on .box::after { content: ""; position: absolute; left: 3.5px; top: 0.5px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.mark.dim .box { opacity: .35; }
.mark.current { border-color: #ffd400; background: rgba(255,212,0,.16); animation: pulse 1s ease-in-out infinite; }
.mark.failed { border-color: var(--danger); background: rgba(244,33,46,.10); }
@keyframes pulse { 50% { background: rgba(255,212,0,.32); } }
.shield { position: fixed; inset: 0; z-index: 2147483644; pointer-events: auto; cursor: progress; }
.shield[hidden] { display: none; }
.shield .banner { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); background: var(--fg); color: var(--bg); padding: 6px 16px; border-radius: 999px; font-size: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.25); white-space: nowrap; }
`;

  const HTML = `
<div class="wrap">
  <div class="layer"></div>
  <div class="shield" hidden><div class="banner">正在删除…删除期间请不要操作页面，按 Esc 或点面板上的「停止」可中断</div></div>
  <div class="panel">
    <div class="head" data-drag>
      <b>私信批量删除</b><span class="badge" data-k="badge"></span>
      <button class="icon" type="button" data-act="collapse" title="收起/展开">–</button>
    </div>
    <div class="body">
      <div class="tabs">
        <button type="button" data-tab="conv">整个会话</button>
        <button type="button" data-tab="msg">单条消息</button>
      </div>
      <div class="pane" data-pane="conv">
        <div class="stats">已选 <b data-k="conv-sel">0</b> 个 · 列表里当前显示 <b data-k="conv-vis">0</b> 个</div>
        <div class="warn" data-k="conv-warn"></div>
        <div class="grid">
          <button class="btn" type="button" data-act="select">进入选择模式</button>
          <button class="btn" type="button" data-act="select-visible">全选当前显示</button>
          <button class="btn" type="button" data-act="sweep">滚动加载并全选</button>
          <button class="btn" type="button" data-act="clear">清空选择</button>
        </div>
        <label class="opt"><input type="checkbox" data-set="leaveGroups"> 群聊也删除（会退出群聊）</label>
        <button class="danger" type="button" data-act="run">删除选中的会话</button>
      </div>
      <div class="pane" data-pane="msg" hidden>
        <div class="stats">已选 <b data-k="msg-sel">0</b> 条 · 当前显示 <b data-k="msg-vis">0</b> 条</div>
        <div class="warn" data-k="msg-warn"></div>
        <div class="grid">
          <button class="btn" type="button" data-act="select">进入选择模式</button>
          <button class="btn" type="button" data-act="select-visible">全选当前显示</button>
          <button class="btn" type="button" data-act="sweep">加载全部历史并全选</button>
          <button class="btn" type="button" data-act="clear">清空选择</button>
        </div>
        <div class="field">全选时 <select data-set="msgFilter">
          <option value="all">所有消息</option><option value="mine">只选我发的</option><option value="theirs">只选对方发的</option>
        </select></div>
        <div class="field">删除方式 <select data-set="msgMode">
          <option value="me">仅为我删除</option>
          <option value="all">为所有人删除（不行就仅为我）</option>
          <option value="all-only">只为所有人删除（不行就跳过）</option>
        </select></div>
        <button class="danger" type="button" data-act="run">删除选中的消息</button>
      </div>
      <div class="field">每条间隔 <input type="number" min="300" max="10000" step="100" data-set="delayMs"> 毫秒</div>
      <div class="progress" hidden>
        <div class="line"><span data-k="prog-text"></span><button class="btn" type="button" data-act="stop">停止</button></div>
        <div class="bar"><i data-k="prog-bar"></i></div>
      </div>
      <div class="hint">选择模式下直接点列表里的行来勾选，按住 Shift 点击可连选，Esc 退出。删除时请让这个标签页保持在前台。</div>
      <div class="log" data-k="log"></div>
      <textarea class="diag" data-k="diag" readonly hidden></textarea>
      <div class="foot">
        <button class="link" type="button" data-act="diag">复制诊断信息</button>
        <span><a class="link" href="${HOMEPAGE}/issues" target="_blank" rel="noopener noreferrer">反馈问题</a> · v${VERSION}</span>
      </div>
    </div>
  </div>
</div>`;

  // ---------- 扫描可见行 ----------
  function passesFilter(kindKey, id) {
    if (kindKey !== 'msg' || settings.msgFilter === 'all') return true;
    const mine = state.meta.msg.get(id)?.mine;
    return settings.msgFilter === 'mine' ? mine === true : mine === false;
  }

  // 记录每行在滚动内容里的位置；虚拟列表在顶部插入更早的消息时，所有位置会整体平移，一并修正
  function reconcile(meta, fresh) {
    const deltas = [];
    for (const [id, pos] of fresh) {
      const old = meta.get(id)?.pos;
      if (old != null) deltas.push(pos - old);
    }
    if (deltas.length >= 2) {
      deltas.sort((a, b) => a - b);
      const d = deltas[deltas.length >> 1];
      if (Math.abs(d) > 1 && deltas.every((x) => Math.abs(x - d) < 2)) for (const m of meta.values()) m.pos += d;
    }
    for (const [id, pos] of fresh) meta.get(id).pos = pos;
  }

  function scan(kindKey) {
    const kind = KINDS[kindKey];
    const meta = state.meta[kindKey];
    const items = [];
    const fresh = new Map();
    for (const el of kind.rows()) {
      const id = kind.idOf(el);
      if (!id) continue;
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      const scroller = kind.scrollerOf(el);
      const s = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight, left: 0, right: innerWidth };
      const it = {
        id,
        top: Math.max(r.top, s.top),
        bottom: Math.min(r.bottom, s.bottom),
        left: Math.max(r.left, s.left),
        right: Math.min(r.right, s.right),
      };
      it.visible = it.bottom - it.top > 6 && it.right - it.left > 6;
      items.push(it);
      if (!meta.has(id)) meta.set(id, { pos: 0, mine: null });
      if (kindKey === 'msg') meta.get(id).mine = kind.isMine(el);
      if (scroller) fresh.set(id, scroller.scrollTop + r.top - s.top);
    }
    reconcile(meta, fresh);
    items.sort((a, b) => a.top - b.top);
    state.visible[kindKey] = items;
    return items;
  }

  function renderMarks(kindKey, items) {
    const show = state.selecting || state.busy === 'run';
    const sel = state.selected[kindKey];
    const flags = state.flags[kindKey];
    const seen = new Set();
    if (show) {
      for (const it of items) {
        if (!it.visible) continue;
        seen.add(it.id);
        let mk = state.marks.get(it.id);
        if (!mk) {
          mk = document.createElement('div');
          mk.innerHTML = '<i class="box"></i>';
          $.layer.append(mk);
          state.marks.set(it.id, mk);
        }
        mk.style.cssText = `left:${it.left}px;top:${it.top}px;width:${it.right - it.left}px;height:${it.bottom - it.top}px`;
        const cls =
          'mark' +
          (sel.has(it.id) ? ' on' : '') +
          (flags.has(it.id) ? ' ' + flags.get(it.id) : '') +
          (!sel.has(it.id) && !passesFilter(kindKey, it.id) ? ' dim' : '');
        if (mk.className !== cls) mk.className = cls;
      }
    }
    for (const [id, mk] of state.marks) {
      if (!seen.has(id)) {
        mk.remove();
        state.marks.delete(id);
      }
    }
  }

  function clearMarks() {
    for (const mk of state.marks.values()) mk.remove();
    state.marks.clear();
  }

  function frame() {
    rafPending = false;
    if (!active) return;
    const tab = settings.tab;
    renderMarks(tab, scan(tab));
    refresh();
    if (state.selecting || state.busy) schedule();
  }

  function schedule() {
    if (!rafPending && active) {
      rafPending = true;
      requestAnimationFrame(frame);
    }
  }

  // ---------- 选择 ----------
  function orderedIds(kindKey) {
    return [...state.meta[kindKey]].sort((a, b) => a[1].pos - b[1].pos).map(([id]) => id);
  }

  function toggle(kindKey, id, shift) {
    const sel = state.selected[kindKey];
    const anchor = state.anchor[kindKey];
    if (shift && anchor && anchor !== id) {
      const order = orderedIds(kindKey);
      const a = order.indexOf(anchor);
      const b = order.indexOf(id);
      if (a >= 0 && b >= 0) {
        // 连选跟随起点的状态；“全选时只选我发的”只作用于全选按钮，这里不过滤
        const on = sel.has(anchor);
        for (const x of order.slice(Math.min(a, b), Math.max(a, b) + 1)) {
          if (on) sel.add(x);
          else sel.delete(x);
        }
        state.anchor[kindKey] = id;
        return;
      }
    }
    if (sel.has(id)) sel.delete(id);
    else sel.add(id);
    state.flags[kindKey].delete(id);
    state.anchor[kindKey] = id;
  }

  function setSelecting(on) {
    state.selecting = on;
    if (!on && state.busy !== 'run') clearMarks();
    refresh();
    schedule();
  }

  function selectVisible(kindKey) {
    let n = 0;
    for (const it of scan(kindKey)) {
      if (it.visible && passesFilter(kindKey, it.id) && !state.selected[kindKey].has(it.id)) {
        state.selected[kindKey].add(it.id);
        n++;
      }
    }
    return n;
  }

  async function sweepSelect(kindKey) {
    const kind = KINDS[kindKey];
    if (state.busy) return;
    if (!kind.scroller()) {
      log(kindKey === 'conv' ? '当前页面没有会话列表' : '请先打开一个对话');
      return;
    }
    state.busy = 'sweep';
    state.stop = false;
    setSelecting(true);
    log(kindKey === 'conv' ? '向下滚动加载全部会话并全选…' : '向上滚动加载这个对话的全部历史并全选…');
    const sel = state.selected[kindKey];
    const meta = state.meta[kindKey];
    await XC.sweep(
      kind,
      kindKey === 'conv' ? 1 : -1,
      () => {
        const seenBefore = meta.size;
        for (const it of scan(kindKey)) if (passesFilter(kindKey, it.id)) sel.add(it.id);
        refresh();
        return meta.size - seenBefore;
      },
      () => state.stop || !active,
    );
    state.busy = null;
    log(state.stop ? `已停止加载，当前选中 ${sel.size} ${UNIT[kindKey]}` : `加载完毕，共选中 ${sel.size} ${UNIT[kindKey]}`);
    refresh();
    schedule();
  }

  // ---------- 删除队列 ----------
  // 1:1 会话 id 是“用户A-用户B”，开头往往就是自己的 id，显示末尾更好区分
  const short = (id) => (id.length > 12 ? '…' + id.slice(-8) : id);

  // 优先处理已经渲染、离视口中心最近的行，尽量少滚动
  function nextTarget(kindKey, pending) {
    const kind = KINDS[kindKey];
    const scroller = kind.scroller();
    const center = scroller ? scroller.scrollTop + scroller.clientHeight / 2 : 0;
    const rendered = new Set(kind.rows().map(kind.idOf));
    let best = null;
    let bestScore = Infinity;
    for (const id of pending) {
      const pos = state.meta[kindKey].get(id)?.pos ?? 0;
      const score = Math.abs(pos - center) - (rendered.has(id) ? 1e9 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = id;
      }
    }
    return best;
  }

  async function run(kindKey) {
    const sel = state.selected[kindKey];
    if (state.busy || !sel.size) return;
    state.busy = 'run';
    state.stop = false;
    const prog = (state.progress = { kindKey, total: sel.size, done: 0, ok: 0, skip: 0, fail: 0 });
    const positions = { get: (id) => state.meta[kindKey].get(id)?.pos };
    const pending = new Set(sel);
    $.shield.hidden = false;
    log(`开始删除 ${prog.total} ${UNIT[kindKey]}…`);
    refresh();
    schedule();
    let streak = 0;
    while (pending.size && !state.stop && active) {
      // X 的部分操作走 requestAnimationFrame，标签页在后台时不会执行，先暂停等切回来
      if (document.hidden) {
        log('标签页在后台，已暂停；切回这个标签页后自动继续');
        while (document.hidden && !state.stop) await sleep(500);
        if (state.stop) break;
      }
      const id = nextTarget(kindKey, pending);
      pending.delete(id);
      state.flags[kindKey].set(id, 'current');
      let res;
      try {
        res =
          kindKey === 'conv'
            ? await XC.deleteConversation(id, { leaveGroups: settings.leaveGroups }, positions)
            : await XC.deleteMessage(id, settings.msgMode, positions);
      } catch (err) {
        res = { status: 'fail', reason: '脚本出错：' + ((err && err.message) || err) };
      }
      state.flags[kindKey].delete(id);
      prog.done++;
      if (res.status === 'ok') {
        prog.ok++;
        streak = 0;
        sel.delete(id);
        state.meta[kindKey].delete(id);
        log(`✓ ${short(id)} ${res.note}`);
      } else if (res.status === 'skip') {
        prog.skip++;
        streak = 0;
        log(`– ${short(id)} 跳过：${res.reason}`);
      } else {
        prog.fail++;
        streak++;
        state.flags[kindKey].set(id, 'failed');
        log(`✗ ${short(id)} 失败：${res.reason}`, 'error');
      }
      refresh();
      if (streak >= 3) {
        log('连续 3 次失败，已自动停止。可能是 X 改了界面或触发了频率限制，稍后再试；仍不行请点“复制诊断信息”。', 'error');
        break;
      }
      if (pending.size && !state.stop) await sleep(jitter(settings.delayMs));
    }
    if (state.stop) log('已手动停止');
    log(`结束：成功 ${prog.ok}，跳过 ${prog.skip}，失败 ${prog.fail}（失败的仍保持勾选，可再次删除重试）`);
    state.busy = null;
    $.shield.hidden = true;
    if (!state.selecting) clearMarks();
    refresh();
    schedule();
  }

  // ---------- 面板 ----------
  // refresh 每帧都会跑，只在值变化时写 DOM
  const setText = (el, v) => {
    v = String(v);
    if (el.textContent !== v) el.textContent = v;
  };

  function refresh() {
    if (!$.panel) return;
    const tab = settings.tab;
    for (const b of $.tabs) {
      b.classList.toggle('on', b.dataset.tab === tab);
      b.disabled = !!state.busy;
    }
    for (const p of $.panes) p.hidden = p.dataset.pane !== tab;
    for (const key of ['conv', 'msg']) {
      setText($[`${key}-sel`], state.selected[key].size);
      setText($[`${key}-vis`], state.visible[key].filter((it) => it.visible).length);
    }
    const pane = $.panes.find((p) => p.dataset.pane === tab);
    const n = state.selected[tab].size;
    const available = !!KINDS[tab].scroller();
    setText(
      $[`${tab}-warn`],
      available ? '' : tab === 'conv' ? '当前页面没看到会话列表（窄屏下请先返回列表）' : '请先在左侧打开一个对话',
    );
    const armed = Date.now() < state.armedUntil;
    for (const b of pane.querySelectorAll('[data-act]')) {
      const act = b.dataset.act;
      if (act === 'select') {
        b.classList.toggle('on', state.selecting);
        setText(b, state.selecting ? '退出选择模式' : '进入选择模式');
        b.disabled = !!state.busy;
      } else if (act === 'run') {
        b.disabled = !!state.busy || !n;
        b.classList.toggle('armed', armed);
        setText(b, armed ? `再点一次：确认删除 ${n} ${UNIT[tab]}（不可撤销）` : `删除选中的 ${n} ${UNIT[tab]}`);
      } else {
        b.disabled = !!state.busy || (act !== 'clear' && !available);
      }
    }
    const total = state.selected.conv.size + state.selected.msg.size;
    const p = state.progress;
    setText($.badge, state.busy === 'run' && p ? `${p.done}/${p.total}` : total ? `已选 ${total}` : '');
    $.progress.hidden = !state.busy;
    if (state.busy === 'run' && p) {
      setText($['prog-text'], `${p.done}/${p.total} · 成功 ${p.ok} · 跳过 ${p.skip} · 失败 ${p.fail}`);
      $['prog-bar'].style.width = `${(p.done / p.total) * 100}%`;
    } else if (state.busy === 'sweep') {
      setText($['prog-text'], `正在滚动加载… 已选 ${state.selected[tab].size}`);
      $['prog-bar'].style.width = '100%';
    }
  }

  function appendLog(line) {
    if (!$.log) return;
    const div = document.createElement('div');
    const t = line.time;
    div.textContent = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')} ${line.msg}`;
    if (line.level === 'error') div.className = 'error';
    $.log.append(div);
    while ($.log.childElementCount > 200) $.log.firstElementChild.remove();
    $.log.scrollTop = $.log.scrollHeight;
  }

  async function copyDiagnostics() {
    const info = {
      version: VERSION,
      ...XC.diagnostics(),
      settings: { tab: settings.tab, msgMode: settings.msgMode, msgFilter: settings.msgFilter, leaveGroups: settings.leaveGroups, delayMs: settings.delayMs },
      selected: { conv: state.selected.conv.size, msg: state.selected.msg.size },
      log: logLines.slice(-40).map((l) => l.msg),
    };
    const text = JSON.stringify(info, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      log('诊断信息已复制到剪贴板（只有页面结构统计和日志，不含消息内容）');
    } catch {
      $.diag.hidden = false;
      $.diag.value = text;
      $.diag.select();
      log('无法写入剪贴板，诊断信息显示在下方文本框里');
    }
  }

  function onAction(act) {
    const tab = settings.tab;
    if (act === 'collapse') {
      settings.panel.collapsed = !settings.panel.collapsed;
      $.panel.classList.toggle('collapsed', settings.panel.collapsed);
      saveSettings(settings);
    } else if (act === 'select') {
      setSelecting(!state.selecting);
    } else if (act === 'select-visible') {
      const n = selectVisible(tab);
      setSelecting(true);
      log(`新勾选了 ${n} ${UNIT[tab]}`);
    } else if (act === 'sweep') {
      sweepSelect(tab);
    } else if (act === 'clear') {
      state.selected[tab].clear();
      state.flags[tab].clear();
      state.anchor[tab] = null;
    } else if (act === 'run') {
      if (Date.now() >= state.armedUntil) {
        state.armedUntil = Date.now() + 4000;
        setTimeout(refresh, 4100);
      } else {
        state.armedUntil = 0;
        run(tab);
      }
    } else if (act === 'stop') {
      state.stop = true;
    } else if (act === 'diag') {
      copyDiagnostics();
    }
    refresh();
    schedule();
  }

  function placePanel() {
    const { left, top } = settings.panel;
    const w = $.panel.offsetWidth || 316;
    const x = Math.min(Math.max(0, left == null ? innerWidth - w - 16 : left), Math.max(0, innerWidth - 60));
    const y = Math.min(Math.max(0, top == null ? 72 : top), Math.max(0, innerHeight - 40));
    $.panel.style.left = `${x}px`;
    $.panel.style.top = `${y}px`;
  }

  function enableDrag() {
    const head = $.panel.querySelector('[data-drag]');
    head.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      const start = { x: e.clientX, y: e.clientY, left: $.panel.offsetLeft, top: $.panel.offsetTop };
      head.setPointerCapture(e.pointerId);
      const move = (ev) => {
        settings.panel.left = start.left + ev.clientX - start.x;
        settings.panel.top = start.top + ev.clientY - start.y;
        placePanel();
      };
      const up = () => {
        head.removeEventListener('pointermove', move);
        head.removeEventListener('pointerup', up);
        saveSettings(settings);
      };
      head.addEventListener('pointermove', move);
      head.addEventListener('pointerup', up);
    });
  }

  function isDarkPage() {
    const parse = (el) => (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || []).map(Number);
    let rgba = parse(document.body);
    if (!rgba.length || rgba[3] === 0) rgba = parse(document.documentElement);
    if (!rgba.length || rgba[3] === 0) return matchMedia('(prefers-color-scheme: dark)').matches;
    const [r, g, b] = rgba;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
  }

  function build() {
    const host = document.createElement('div');
    host.setAttribute(OWN_HOST_ATTR, '');
    // 挂在 <html> 下而不是 <body>：X 的弹出菜单打开时会给 body 设 pointer-events:none / aria-hidden
    document.documentElement.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = CSS_TEXT;
    shadow.append(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = HTML;
    shadow.append(tpl.content);

    $.host = host;
    $.wrap = shadow.querySelector('.wrap');
    $.panel = shadow.querySelector('.panel');
    $.layer = shadow.querySelector('.layer');
    $.shield = shadow.querySelector('.shield');
    $.progress = shadow.querySelector('.progress');
    $.tabs = [...shadow.querySelectorAll('[data-tab]')];
    $.panes = [...shadow.querySelectorAll('[data-pane]')];
    for (const el of shadow.querySelectorAll('[data-k]')) $[el.dataset.k] = el;

    $.panel.classList.toggle('collapsed', settings.panel.collapsed);
    $.panel.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn && !state.busy && tabBtn.dataset.tab !== settings.tab) {
        settings.tab = tabBtn.dataset.tab;
        state.armedUntil = 0;
        clearMarks();
        saveSettings(settings);
        refresh();
        schedule();
        return;
      }
      const btn = e.target.closest('[data-act]');
      if (btn && !btn.disabled) onAction(btn.dataset.act);
    });
    for (const input of shadow.querySelectorAll('[data-set]')) {
      const key = input.dataset.set;
      if (input.type === 'checkbox') input.checked = !!settings[key];
      else input.value = settings[key];
      input.addEventListener('change', () => {
        if (input.type === 'checkbox') settings[key] = input.checked;
        else if (input.type === 'number') {
          settings[key] = Math.min(10000, Math.max(300, Number(input.value) || 800));
          input.value = settings[key];
        } else settings[key] = input.value;
        saveSettings(settings);
        refresh();
        schedule();
      });
    }
    enableDrag();
    for (const line of logLines) appendLog(line);
    onLog(appendLog);
  }

  // 选择模式下拦截用户对列表行的真实点击（isTrusted），改成勾选；插件自己派发的模拟事件不受影响
  const INTERCEPT = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu'];
  function intercept(e) {
    if (!active || !state.selecting || state.busy === 'run' || !e.isTrusted) return;
    const path = e.composedPath();
    if (path.includes($.host)) return;
    const tab = settings.tab;
    const kind = KINDS[tab];
    const row = path.find(
      (n) => n.nodeType === 1 && (tab === 'conv' ? n.matches(XC.SEL.convItem) : n.hasAttribute('data-dm-message-row')),
    );
    if (!row) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.type === 'click') {
      const id = kind.idOf(row);
      if (id) toggle(tab, id, e.shiftKey);
      refresh();
      schedule();
    }
  }

  function onKey(e) {
    if (!active || !e.isTrusted || e.composedPath().includes($.host)) return;
    if (state.busy === 'run') {
      // 删除期间屏蔽键盘，避免误触；Esc 用来停止
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'keydown' && e.key === 'Escape') state.stop = true;
    } else if (e.type === 'keydown' && e.key === 'Escape' && state.selecting) {
      setSelecting(false);
    }
  }

  const convKeyOf = (path) => (path.match(/\/i\/chat\/([^/?#]+)/) || [null, path])[1];

  function isChatPage() {
    return location.pathname.startsWith('/i/chat') || document.documentElement.hasAttribute('data-xbd-force');
  }

  function tick() {
    const on = isChatPage();
    if (on !== active) {
      active = on;
      $.host.style.display = on ? '' : 'none';
      if (!on) {
        state.stop = true;
        state.selecting = false;
        clearMarks();
      }
    }
    if (!active) return;
    // 切换到别的对话后，上一个对话里勾选的消息就没意义了（/i/chat/<id>/info 这类同一对话内的跳转不算）
    const key = convKeyOf(location.pathname);
    if (key !== chatPath) {
      chatPath = key;
      if (state.busy && settings.tab === 'msg') state.stop = true;
      state.selected.msg.clear();
      state.meta.msg.clear();
      state.flags.msg.clear();
      state.anchor.msg = null;
    }
    $.wrap.classList.toggle('dark', isDarkPage());
    if (!state.selecting && !state.busy) {
      scan('conv');
      scan('msg');
      refresh();
    }
  }

  function init(loaded) {
    settings = loaded;
    if (!settings.tab) settings.tab = /^\/i\/chat\/(?!requests)[^/]+/.test(location.pathname) ? 'msg' : 'conv';
    build();
    placePanel();
    addEventListener('resize', placePanel);
    for (const t of INTERCEPT) addEventListener(t, intercept, true);
    addEventListener('keydown', onKey, true);
    addEventListener('keyup', onKey, true);
    $.host.style.display = 'none';
    tick();
    setInterval(tick, 700);
    refresh();
  }

  XBD.ui = { init, state };
})();

// ---- src/main.js ----
// main.js — 入口：读取设置，挂上面板。面板只在 x.com/i/chat 下显示。
(async () => {
  'use strict';
  const XBD = globalThis.XBD;
  if (!XBD || XBD.started) return;
  XBD.started = true;
  XBD.ui.init(await XBD.loadSettings());
})();

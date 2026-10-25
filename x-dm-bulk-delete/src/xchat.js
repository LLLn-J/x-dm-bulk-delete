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

// mock-xchat.js — 用纯 JS 仿造 X Chat 网页版的 DOM 结构和交互，在本地端到端测试扩展。
// 对照 X Chat 前端代码还原：open shadow root、data-testid / data-slot、虚拟滚动、
// Radix 右键菜单（会话）、Base UI 菜单和确认框（消息，新旧两种菜单）。
// URL 参数：?lang=zh-cn|en  ?variant=new|old
(() => {
  const params = new URLSearchParams(location.search);
  const LANG = params.get('lang') === 'en' ? 'en' : 'zh-cn';
  const VARIANT = params.get('variant') === 'old' ? 'old' : 'new';
  const BASE_PATH = location.pathname.replace(/\/c\/.*$/, '');

  // 中文取自 X Chat 的 zh-cn 语言包（Open in a new tab 在 X 里本来就没翻译）
  const T = {
    en: {
      openTab: 'Open in a new tab', markRead: 'Mark as read', pinConv: 'Pin conversation', muteConv: 'Mute conversation',
      deleteConv: 'Delete conversation', leaveConv: 'Leave conversation', confirm: 'Confirm', cancel: 'Cancel',
      convDesc: 'This conversation will be deleted from your inbox. Other people in the conversation will still be able to see it.',
      del: 'Delete', delForMe: 'Delete for me', delForAll: 'Delete for all', justMe: 'Just me', everyone: 'Everyone',
      delFor: 'Delete this message for…', delMsg: 'Delete message', sure: 'Are you sure you want to delete this message?',
      reply: 'Reply', copy: 'Copy', edit: 'Edit', forward: 'Forward', pin: 'Pin', info: 'Info', report: 'Report', more: 'More',
      chat: 'Chat', loading: 'Loading…', composer: 'Start a message',
    },
    'zh-cn': {
      openTab: 'Open in a new tab', markRead: '标记为已读', pinConv: '置顶对话', muteConv: '静音对话',
      deleteConv: '删除对话', leaveConv: '离开对话', confirm: '确认', cancel: '取消',
      convDesc: '此对话将从你的收件箱中删除。对话中的其他人仍然可以看到它。',
      del: '删除', delForMe: '仅删除我的', delForAll: '删除全部', justMe: '只有我', everyone: '每个人',
      delFor: '删除这条私信…', delMsg: '删除私信', sure: '确定要删除这条私信吗？',
      reply: '回复', copy: '复制', edit: '编辑', forward: '转发', pin: '置顶', info: '信息', report: '举报', more: '更多',
      chat: '聊天', loading: '加载中…', composer: '开始写私信',
    },
  }[LANG];

  // ---------- 数据 ----------
  const ME = '1700000000000000001';
  const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Niaj'];
  const CONV_TOTAL = 70;
  const convs = [];
  let convLoading = false;
  const stats = { convDeleted: 0, groupsLeft: 0, msgForMe: 0, msgForAll: 0 };

  function makeConv(i) {
    const group = i % 7 === 3;
    const id = group ? `g18${String(i).padStart(16, '0')}` : `${ME}-${1800000000000000000n + BigInt(i)}`;
    return { id, group, name: group ? `群聊 #${i}` : `${NAMES[i % NAMES.length]} #${i}`, preview: `最近一条消息 · ${i}` };
  }
  for (let i = 0; i < 30; i++) convs.push(makeConv(i));

  let activeConv = convs[0];
  let msgs = [];
  let olderLeft = 0;
  let olderLoading = false;
  let msgSeq = 0;

  function makeMsg(n) {
    const mine = n % 3 !== 0;
    const long = n % 5 === 0;
    const id = `0193${(0x1000 + n).toString(16)}-7c3e-7b2a-9f1e-${(n * 2654435761 >>> 0).toString(16).padStart(8, '0')}`;
    return {
      id,
      mine,
      text: long ? `第 ${n} 条消息：这是一条比较长的消息，用来测试多行气泡和不同行高的虚拟滚动。` : `第 ${n} 条消息`,
      h: long ? 72 : 48,
    };
  }

  function loadConversation(conv) {
    activeConv = conv;
    msgSeq = 1000;
    msgs = [];
    for (let i = 0; i < 40; i++) msgs.push(makeMsg(msgSeq + i));
    olderLeft = 60; // 往上还能再加载 3 页，每页 20 条
    hoverId = null;
    closeMenus();
  }

  // ---------- DOM ----------
  const host = document.getElementById('chat-host');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
<style>
  .root { position: fixed; inset: 0; font: 15px/1.4 -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; color: #0f1419; background: #fff; }
  .app { position: absolute; inset: 0; display: flex; }
  .inbox { width: 380px; border-right: 1px solid #eff3f4; display: flex; flex-direction: column; }
  .inbox-head { padding: 14px 16px; font-weight: 800; font-size: 20px; }
  .scroller { flex: 1; overflow-y: auto; position: relative; overflow-anchor: none; }
  .spacer { position: relative; width: 100%; }
  .conv-item { position: absolute; left: 0; width: 100%; height: 72px; }
  .conv-item a { display: block; height: 100%; color: inherit; text-decoration: none; }
  [data-inbox-row] { margin: 0 16px; height: 100%; display: flex; gap: 12px; align-items: center; padding: 0 8px; border-radius: 8px; }
  [data-inbox-row]:hover { background: #f7f9f9; }
  [data-selected="true"] [data-inbox-row] { background: #eff3f4; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; background: #cfd9de; flex: none; }
  .group .avatar { background: #8ecdf7; }
  .meta { min-width: 0; }
  .name { font-weight: 700; }
  .preview { color: #536471; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .loading { text-align: center; padding: 12px; color: #536471; font-size: 13px; }
  .conv-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .conv-head { padding: 14px 16px; border-bottom: 1px solid #eff3f4; font-weight: 700; }
  .msg-wrap { position: absolute; left: 0; top: 0; width: 100%; }
  .msg-row { position: relative; display: flex; width: 100%; padding: 4px 16px; box-sizing: border-box; align-items: center; }
  .justify-start { justify-content: flex-start; }
  .justify-end { justify-content: flex-end; }
  .bubble { max-width: 55%; padding: 8px 12px; border-radius: 18px; background: #eff3f4; }
  .msg-avatar { flex: none; width: 32px; height: 32px; margin-right: 8px; border-radius: 50%; background: #f6c89f; align-self: flex-end; }
  .justify-end .bubble { background: #1d9bf0; color: #fff; }
  .actions { display: flex; gap: 4px; margin: 0 8px; }
  .justify-end .actions { order: -1; }
  .actions button { border: 0; width: 30px; height: 30px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.25); cursor: pointer; }
  .composer { border-top: 1px solid #eff3f4; padding: 14px 16px; color: #536471; }
  .menu { position: fixed; z-index: 50; min-width: 220px; background: #fff; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.2); padding: 6px; }
  .item { padding: 9px 12px; border-radius: 8px; cursor: pointer; }
  .item:hover { background: #f7f9f9; }
  .text-red-500, .tone-destructive { color: #f4212e; }
  .sep { height: 1px; background: #eff3f4; margin: 4px 0; }
  .group-label { padding: 4px 12px; font-size: 13px; color: #536471; }
  .backdrop { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.4); }
  .modal { position: fixed; z-index: 61; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 360px; background: #fff; border-radius: 16px; padding: 22px 24px; }
  .modal h2 { margin: 0 0 6px; font-size: 18px; }
  .modal p { margin: 0; color: #536471; }
  .footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  .footer button { border: 1px solid #cfd9de; background: #fff; border-radius: 999px; padding: 8px 16px; font: inherit; font-weight: 700; cursor: pointer; }
  .footer .destructive { background: #f4212e; border-color: #f4212e; color: #fff; }
</style>
<div class="root" lang="${LANG}">
  <div class="app">
    <div class="inbox" data-testid="dm-inbox-panel">
      <div class="inbox-head" data-testid="dm-inbox-title">${T.chat}</div>
      <div class="scroller" data-testid="dm-conversation-scroller" id="x-chat-conversation-list" tabindex="-1"><div class="spacer"></div></div>
    </div>
    <div class="conv-panel" data-testid="dm-conversation-panel">
      <div class="conv-head" data-testid="dm-conversation-header"></div>
      <div class="scroller" data-testid="dm-message-scroller" data-virtualizer="tanstack" role="log" tabindex="0"><div class="spacer"></div></div>
      <div class="composer" data-testid="dm-composer-container">${T.composer}</div>
    </div>
  </div>
  <div class="portal"></div>
</div>`;

  const app = shadow.querySelector('.app');
  const portal = shadow.querySelector('.portal');
  const convScroller = shadow.querySelector('[data-testid="dm-conversation-scroller"]');
  const convSpacer = convScroller.firstElementChild;
  const msgScroller = shadow.querySelector('[data-testid="dm-message-scroller"]');
  const msgSpacer = msgScroller.firstElementChild;
  const convHead = shadow.querySelector('[data-testid="dm-conversation-header"]');

  const h = (tag, attrs = {}, text) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text != null) el.textContent = text;
    return el;
  };

  // ---------- 会话列表（虚拟滚动，行按 id 复用） ----------
  const ROW_H = 72;
  const convEls = new Map();
  let convFooter = null;

  function renderConvs() {
    convSpacer.style.height = `${convs.length * ROW_H}px`;
    const from = Math.max(0, Math.floor((convScroller.scrollTop - 150) / ROW_H));
    const to = Math.min(convs.length, Math.ceil((convScroller.scrollTop + convScroller.clientHeight + 150) / ROW_H));
    const keep = new Set();
    for (let i = from; i < to; i++) {
      const c = convs[i];
      keep.add(c.id);
      let el = convEls.get(c.id);
      if (!el) {
        el = h('div', { 'data-testid': `dm-conversation-item-${c.id}`, class: 'conv-item' + (c.group ? ' group' : '') });
        const a = h('a', { href: `${BASE_PATH}/c/${c.id}${location.search}`, draggable: 'false' });
        const row = h('div', { 'data-inbox-row': '', 'data-state': 'closed' });
        const meta = h('div', { class: 'meta' });
        meta.append(h('div', { class: 'name' }, c.name), h('div', { class: 'preview' }, c.preview));
        const avatar = h('div', { class: 'avatar' });
        avatar.style.background = `hsl(${(i * 47) % 360} 55% ${c.group ? 62 : 74}%)`;
        row.append(avatar, meta);
        a.append(row);
        el.append(a);
        convEls.set(c.id, el);
        convSpacer.append(el);
      }
      el.setAttribute('data-index', i);
      el.setAttribute('data-selected', String(c === activeConv));
      el.style.top = `${i * ROW_H}px`;
    }
    for (const [id, el] of convEls) {
      if (!keep.has(id)) {
        el.remove();
        convEls.delete(id);
      }
    }
    if (convLoading && !convFooter) {
      convFooter = h('div', { class: 'loading', 'data-testid': 'dm-conversation-list-loading-footer', role: 'status' }, T.loading);
      convFooter.style.cssText = `position:absolute;left:0;width:100%;top:${convs.length * ROW_H}px`;
      convSpacer.append(convFooter);
      convSpacer.style.height = `${convs.length * ROW_H + 44}px`;
    } else if (!convLoading && convFooter) {
      convFooter.remove();
      convFooter = null;
    }
  }

  convScroller.addEventListener('scroll', () => {
    requestAnimationFrame(renderConvs);
    const nearEnd = convScroller.scrollTop + convScroller.clientHeight > convScroller.scrollHeight - 200;
    if (nearEnd && !convLoading && convs.length < CONV_TOTAL) {
      convLoading = true;
      renderConvs();
      setTimeout(() => {
        const start = convs.length + stats.convDeleted + stats.groupsLeft;
        for (let i = 0; i < 20 && start + i < CONV_TOTAL; i++) convs.push(makeConv(start + i));
        convLoading = false;
        renderConvs();
        updateStatus();
      }, 500);
    }
  });

  // ---------- 消息列表（变高虚拟滚动） ----------
  const msgEls = new Map();
  let hoverId = null;
  const TOP_PAD = 48; // 顶部留给“加载中”

  function offsets() {
    const tops = [];
    let y = TOP_PAD;
    for (const m of msgs) {
      tops.push(y);
      y += m.h;
    }
    return { tops, total: y + 16 };
  }

  function renderActions(row, m) {
    row.querySelector('.actions')?.remove();
    if (hoverId !== m.id) return;
    const bar = h('div', { class: 'actions' });
    bar.append(
      h('button', { type: 'button', 'aria-label': 'React', 'data-testid': `message-reaction-button-${m.id}` }, '☺'),
      h('button', { type: 'button', 'aria-label': T.more, 'data-testid': `message-overflow-button-${m.id}` }, '…'),
    );
    row.append(bar);
  }

  function renderMsgs() {
    const { tops, total } = offsets();
    msgSpacer.style.height = `${total}px`;
    const top = msgScroller.scrollTop - 200;
    const bottom = msgScroller.scrollTop + msgScroller.clientHeight + 200;
    const keep = new Set();
    msgs.forEach((m, i) => {
      if (tops[i] + m.h < top || tops[i] > bottom) return;
      keep.add(m.id);
      let wrap = msgEls.get(m.id);
      if (!wrap) {
        wrap = h('div', { class: 'msg-wrap' });
        const row = h('div', {
          'data-dm-message-row': m.id,
          'data-testid': `message-${m.id}`,
          'data-send-status': 'sent',
          class: `relative flex w-full px-4 msg-row ${m.mine ? 'justify-end' : 'justify-start'}`,
        });
        const bubble = h('div', { class: 'bubble', role: 'article', 'data-dm-message-focus-target': `${m.id}:content` });
        bubble.append(h('span', { 'data-testid': `message-text-${m.id}` }, m.text));
        // 和 X 一样，对方的消息左边有一列头像
        if (!m.mine) row.append(h('div', { class: 'msg-avatar' }));
        row.append(bubble);
        wrap.append(row);
        msgEls.set(m.id, wrap);
        msgSpacer.append(wrap);
      }
      wrap.setAttribute('data-index', i);
      wrap.style.top = `${tops[i]}px`;
      wrap.style.height = `${m.h}px`;
      const row = wrap.firstElementChild;
      if (!!row.querySelector('.actions') !== (hoverId === m.id)) renderActions(row, m);
    });
    for (const [id, el] of msgEls) {
      if (!keep.has(id)) {
        el.remove();
        msgEls.delete(id);
      }
    }
    let spinner = msgSpacer.querySelector('[data-testid="dm-message-list-spinner-slot"]');
    if (!spinner) {
      spinner = h('div', { class: 'loading', role: 'status', 'data-testid': 'dm-message-list-spinner-slot' });
      spinner.style.cssText = 'position:absolute;left:0;top:0;width:100%';
      msgSpacer.append(spinner);
    }
    spinner.textContent = olderLoading ? T.loading : olderLeft ? '' : '—— 对话开始 ——';
  }

  msgScroller.addEventListener('scroll', () => {
    requestAnimationFrame(renderMsgs);
    if (msgScroller.scrollTop < 80 && olderLeft > 0 && !olderLoading) {
      olderLoading = true;
      renderMsgs();
      setTimeout(() => {
        const older = [];
        for (let i = 20; i >= 1; i--) older.push(makeMsg(msgSeq - i));
        msgSeq -= 20;
        olderLeft -= 20;
        const added = older.reduce((s, m) => s + m.h, 0);
        msgs = older.concat(msgs);
        olderLoading = false;
        renderMsgs();
        msgScroller.scrollTop += added; // 和真实聊天一样，插入更早的消息后保持当前视野不跳
        updateStatus();
      }, 600);
    }
  });

  function setHover(id) {
    if (hoverId === id) return;
    hoverId = id;
    renderMsgs();
  }

  // ---------- 菜单（portal 到 shadow root 里） ----------
  let openMenu = null;

  function closeMenus() {
    if (!openMenu) return;
    const { menu, convId } = openMenu;
    openMenu = null;
    if (menu.hasAttribute('data-state')) menu.setAttribute('data-state', 'closed');
    else {
      menu.removeAttribute('data-open');
      menu.setAttribute('data-closed', '');
    }
    if (convId) convEls.get(convId)?.querySelector('[data-inbox-row]')?.setAttribute('data-state', 'closed');
    setTimeout(() => menu.remove(), 100);
  }

  function addItem(menu, text, onSelect, { destructive = false, radix = false, closeOnClick = true } = {}) {
    const cls = radix
      ? `item${destructive ? ' text-red-500' : ''}`
      : `item${destructive ? ' text-[var(--x-fg-destructive)]! tone-destructive' : ''}`;
    const item = h('div', { role: 'menuitem', tabindex: '-1', class: cls }, text);
    if (!radix) item.setAttribute('data-slot', 'xds-menu-item');
    item.addEventListener('click', () => {
      if (closeOnClick) closeMenus();
      onSelect?.();
    });
    menu.append(item);
    return item;
  }

  function openConvMenu(conv, x, y) {
    closeMenus();
    // Radix ContextMenu：data-state="open"
    const menu = h('div', { role: 'menu', 'data-state': 'open', 'data-radix-menu-content': '', class: 'menu' });
    menu.style.left = `${Math.min(x, innerWidth - 240)}px`;
    menu.style.top = `${Math.min(y, innerHeight - 260)}px`;
    addItem(menu, T.openTab, null, { radix: true });
    portal.append(menu);
    openMenu = { menu, convId: conv.id };
    convEls.get(conv.id)?.querySelector('[data-inbox-row]')?.setAttribute('data-state', 'open');
    // 会话操作是异步加进来的，和真实页面一样
    setTimeout(() => {
      if (openMenu?.menu !== menu) return;
      addItem(menu, T.markRead, null, { radix: true });
      addItem(menu, T.pinConv, null, { radix: true });
      addItem(menu, T.muteConv, null, { radix: true });
      addItem(menu, conv.group ? T.leaveConv : T.deleteConv, () => requestAnimationFrame(() => confirmDeleteConv(conv)), {
        radix: true,
        destructive: true,
      });
    }, 150);
  }

  function openDialog({ title, desc, confirmLabel, onConfirm, initialFocus = 'confirm' }) {
    const backdrop = h('div', { 'data-slot': 'xds-modal-backdrop', class: 'backdrop' });
    const dlg = h('div', { role: 'dialog', 'data-slot': 'xds-modal-surface', 'data-open': '', class: 'modal' });
    dlg.append(h('h2', {}, title), h('p', {}, desc));
    const footer = h('div', { 'data-slot': 'xds-modal-footer', class: 'footer' });
    const cancel = h('button', { type: 'button', 'data-slot': 'xds-button' }, T.cancel);
    const ok = h('button', { type: 'button', 'data-slot': 'xds-button', class: 'destructive' }, confirmLabel);
    footer.append(cancel, ok);
    const hiddenClose = h('button', { type: 'button', class: 'hidden', tabindex: '-1' });
    hiddenClose.style.display = 'none'; // Base UI 在弹窗末尾放的隐藏关闭按钮
    dlg.append(footer, hiddenClose);
    portal.append(backdrop, dlg);
    const close = () => {
      dlg.removeAttribute('data-open');
      dlg.setAttribute('data-ending-style', '');
      setTimeout(() => {
        dlg.remove();
        backdrop.remove();
      }, 120);
    };
    cancel.addEventListener('click', close);
    ok.addEventListener('click', () => {
      close();
      onConfirm();
    });
    (initialFocus === 'cancel' ? cancel : ok).focus();
    openMenu = null;
    return dlg;
  }

  function confirmDeleteConv(conv) {
    openDialog({
      title: conv.group ? T.leaveConv : T.deleteConv,
      desc: T.convDesc,
      confirmLabel: T.confirm,
      initialFocus: 'cancel',
      onConfirm: () =>
        setTimeout(() => {
          const i = convs.indexOf(conv);
          if (i >= 0) convs.splice(i, 1);
          if (conv.group) stats.groupsLeft++;
          else stats.convDeleted++;
          if (activeConv === conv && convs.length) {
            loadConversation(convs[0]);
            renderAll();
          }
          renderConvs();
          updateStatus();
        }, 400),
    });
  }

  function deleteMsg(m, forAll) {
    setTimeout(() => {
      const i = msgs.indexOf(m);
      if (i < 0) return;
      msgs.splice(i, 1);
      if (forAll) stats.msgForAll++;
      else stats.msgForMe++;
      if (hoverId === m.id) hoverId = null;
      renderMsgs();
      updateStatus();
    }, 250);
  }

  function renderMsgMenu(menu, m, confirming) {
    menu.textContent = '';
    if (VARIANT === 'old') {
      // 旧版：直接列出「删除全部」「仅删除我的」，点了弹确认框
      addItem(menu, T.reply);
      addItem(menu, T.copy);
      addItem(menu, T.forward);
      const ask = (forAll) =>
        openDialog({
          title: T.delMsg,
          desc: T.sure,
          confirmLabel: forAll ? T.delForAll : T.delForMe,
          onConfirm: () => deleteMsg(m, forAll),
        });
      if (m.mine) addItem(menu, T.delForAll, () => ask(true), { destructive: true });
      addItem(menu, T.delForMe, () => ask(false), { destructive: true });
      return;
    }
    // 新版：先「删除」，再在菜单里选「只有我 / 每个人」
    addItem(menu, T.reply);
    addItem(menu, T.copy);
    if (m.mine) addItem(menu, T.edit);
    addItem(menu, T.forward);
    addItem(menu, T.pin);
    menu.append(h('div', { class: 'sep', role: 'separator' }));
    addItem(menu, T.info);
    menu.append(h('div', { class: 'sep', role: 'separator' }));
    if (!confirming) {
      if (!m.mine) addItem(menu, T.report);
      addItem(menu, m.mine ? T.del : T.delForMe, () => renderMsgMenu(menu, m, true), {
        destructive: true,
        closeOnClick: false,
      });
      return;
    }
    const group = h('div', { role: 'group' });
    group.append(h('div', { class: 'group-label' }, T.delFor));
    menu.append(group);
    addItem(group, T.justMe, () => deleteMsg(m, false), { destructive: !m.mine });
    if (m.mine) addItem(group, T.everyone, () => deleteMsg(m, true), { destructive: true });
    else addItem(group, T.cancel, () => renderMsgMenu(menu, m, false), { closeOnClick: false });
  }

  function openMsgMenu(m, btn) {
    closeMenus();
    // Base UI Menu：打开时有 data-open
    const menu = h('div', { role: 'menu', 'data-open': '', class: 'menu' });
    const r = btn.getBoundingClientRect();
    renderMsgMenu(menu, m, false);
    portal.append(menu);
    menu.style.left = `${Math.max(8, Math.min(r.right - 220, innerWidth - 240))}px`;
    menu.style.top = `${Math.max(8, r.top - menu.offsetHeight - 6)}px`;
    openMenu = { menu, msgId: m.id };
  }

  // ---------- 事件委托（和 React 一样挂在 shadow root 里的容器上） ----------
  app.addEventListener('mouseover', onPointerOverMsg);
  app.addEventListener('mousemove', onPointerOverMsg);
  function onPointerOverMsg(e) {
    const row = e.target.closest?.('[data-dm-message-row]');
    if (row) setHover(row.getAttribute('data-dm-message-row'));
  }
  app.addEventListener('mouseout', (e) => {
    const row = e.target.closest?.('[data-dm-message-row]');
    if (!row || (e.relatedTarget && row.contains(e.relatedTarget))) return;
    if (openMenu?.msgId === row.getAttribute('data-dm-message-row')) return; // 菜单开着时保持悬停
    setHover(null);
  });

  app.addEventListener('click', (e) => {
    const more = e.target.closest?.('[data-testid^="message-overflow-button-"]');
    if (more) {
      const id = more.getAttribute('data-testid').slice('message-overflow-button-'.length);
      const m = msgs.find((x) => x.id === id);
      if (openMenu?.msgId === id) closeMenus();
      else if (m) openMsgMenu(m, more);
      return;
    }
    const link = e.target.closest?.('.conv-item a');
    if (link && e.button === 0) {
      e.preventDefault();
      const id = link.closest('.conv-item').getAttribute('data-testid').slice('dm-conversation-item-'.length);
      const conv = convs.find((c) => c.id === id);
      if (conv && conv !== activeConv) {
        history.pushState(null, '', link.getAttribute('href'));
        loadConversation(conv);
        renderAll();
      }
    }
  });

  app.addEventListener('contextmenu', (e) => {
    const row = e.target.closest?.('[data-inbox-row]');
    if (!row) return;
    e.preventDefault();
    const id = row.closest('.conv-item').getAttribute('data-testid').slice('dm-conversation-item-'.length);
    const conv = convs.find((c) => c.id === id);
    if (conv) openConvMenu(conv, e.clientX, e.clientY);
  });

  // 点菜单外面关闭（Radix / Base UI 都是 pointerdown）；Esc 关闭最上层
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (openMenu && !e.composedPath().includes(openMenu.menu)) closeMenus();
    },
    true,
  );
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape') return;
      const dlg = portal.querySelector('[role="dialog"][data-open]');
      if (dlg) dlg.querySelector('[data-slot="xds-modal-footer"] button').click();
      else closeMenus();
    },
    true,
  );

  // ---------- 状态栏（页面左下角，给测试读数用） ----------
  const status = document.getElementById('mock-status');
  function updateStatus() {
    Object.assign(status.dataset, {
      convs: convs.length,
      msgs: msgs.length,
      convDeleted: stats.convDeleted,
      groupsLeft: stats.groupsLeft,
      msgForMe: stats.msgForMe,
      msgForAll: stats.msgForAll,
    });
    status.textContent =
      `[mock · ${LANG} · 消息菜单${VARIANT === 'new' ? '新版' : '旧版'}]  ` +
      `会话 ${convs.length}（已删 ${stats.convDeleted}，退出群 ${stats.groupsLeft}）｜` +
      `当前对话消息 ${msgs.length}（为我删 ${stats.msgForMe}，为所有人删 ${stats.msgForAll}）`;
  }

  function renderAll() {
    convHead.textContent = activeConv ? activeConv.name : '';
    renderConvs();
    renderMsgs();
    msgScroller.scrollTop = msgScroller.scrollHeight;
    renderMsgs();
    updateStatus();
  }

  // 演示用：直接移除若干会话（截图里“已删除”的那几个）
  function removeConvs(ids) {
    for (const id of ids) {
      const i = convs.findIndex((c) => c.id === id);
      if (i >= 0) convs.splice(i, 1);
    }
    if (!convs.includes(activeConv) && convs.length) loadConversation(convs[0]);
    renderAll();
  }

  loadConversation(convs[0]);
  renderAll();
  window.__mock = { convs: () => convs, msgs: () => msgs, removeConvs, stats, T, VARIANT, LANG };
})();

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

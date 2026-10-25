// demo.js — 生成商店截图用：等扩展面板就绪后直接摆出界面状态，不会真的删除任何东西。
// 用法：mock-xchat.html?demo=conv | msg | run（由 tools/make_store_assets.py 调用）
(async () => {
  const demo = new URLSearchParams(location.search).get('demo');
  if (!demo) return;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let ui = null;
  while (!(ui = document.querySelector('[data-xbd-host]')?.shadowRoot)?.querySelector('.panel') || !window.XBD?.ui) {
    await sleep(20);
  }
  const { state } = XBD.ui;
  const mock = window.__mock;
  const click = (sel) => ui.querySelector(sel).click();
  const set = (key, val) => {
    const el = ui.querySelector(`[data-set="${key}"]`);
    if (el.type === 'checkbox') el.checked = val;
    else el.value = val;
    el.dispatchEvent(new Event('change'));
  };
  const short = (id) => '…' + id.slice(-8);
  set('delayMs', 800);
  set('leaveGroups', false);
  set('msgFilter', 'all');
  set('msgMode', 'me');

  if (demo === 'conv') {
    click('[data-tab="conv"]');
    // 跳过当前打开的第一个会话，免得 X 自己的选中底色和勾选叠在一起
    for (const c of mock.convs().filter((c) => !c.group).slice(1, 7)) state.selected.conv.add(c.id);
    click('[data-pane="conv"] [data-act="select"]');
  } else if (demo === 'msg') {
    click('[data-tab="msg"]');
    set('msgMode', 'all');
    const ids = mock.msgs().slice(-10).map((m) => m.id);
    for (const i of [1, 2, 4, 5, 8]) state.selected.msg.add(ids[i]);
    click('[data-pane="msg"] [data-act="select"]');
  } else if (demo === 'run') {
    click('[data-tab="conv"]');
    const convs = mock.convs().slice(0, 14);
    const deleted = [convs[0], convs[4], convs[5], convs[6]];
    XBD.log('开始删除 14 个会话…');
    XBD.log(`✓ ${short(deleted[0].id)} 已删除`);
    XBD.log(`– ${short(convs[3].id)} 跳过：群聊（没勾选“群聊也删除”）`);
    for (const c of deleted.slice(1)) XBD.log(`✓ ${short(c.id)} 已删除`);
    mock.removeConvs(deleted.map((c) => c.id));
    for (const c of convs) if (!deleted.includes(c)) state.selected.conv.add(c.id);
    click('[data-pane="conv"] [data-act="select"]');
    state.busy = 'run';
    state.progress = { kindKey: 'conv', total: 14, done: 5, ok: 4, skip: 1, fail: 0 };
    state.flags.conv.set(convs[1].id, 'current');
    ui.querySelector('.shield').hidden = false;
  }
  document.documentElement.setAttribute('data-demo-ready', demo);
})();

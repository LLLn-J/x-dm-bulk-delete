// i18n.js — 面板文字（中文 / English）。
// 界面语言优先跟随 X 的界面语言（X Chat 根节点上的 lang），取不到时看 x.com 的 <html lang>，再取不到看浏览器语言；
// 面板里也可以手动指定。以 zh 开头的都用中文（繁体用户看简体），其余一律英文。
(() => {
  'use strict';
  const XBD = globalThis.XBD;

  const count = {
    zh: ({ n, kind }) => `${n} ${kind === 'conv' ? '个会话' : '条消息'}`,
    en: ({ n, kind }) => `${n} ${kind === 'conv' ? 'conversation' : 'message'}${n === 1 ? '' : 's'}`,
  };

  const STRINGS = {
    zh: {
      // 面板
      title: '私信批量删除',
      collapse: '收起/展开',
      tabConv: '整个会话',
      tabMsg: '单条消息',
      startSelect: '进入选择模式',
      stopSelect: '退出选择模式',
      selectVisible: '全选当前显示',
      sweepConv: '滚动加载并全选',
      sweepMsg: '加载全部历史并全选',
      clear: '清空选择',
      leaveGroups: '群聊也删除（会退出群聊）',
      filterLabel: '全选时',
      filterAll: '所有消息',
      filterMine: '只选我发的',
      filterTheirs: '只选对方发的',
      modeLabel: '删除方式',
      modeMe: '仅为我删除',
      modeAll: '为所有人删除（不行就仅为我）',
      modeAllOnly: '只为所有人删除（不行就跳过）',
      delayLabel: '每条间隔',
      ms: '毫秒',
      langLabel: '界面语言',
      langAuto: '自动',
      stop: '停止',
      hint: '选择模式下直接点列表里的行来勾选，按住 Shift 点击可连选，Esc 退出。删除时请让这个标签页保持在前台。',
      copyDiag: '复制诊断信息',
      feedback: '反馈问题',
      shield: '正在删除…删除期间请不要操作页面，按 Esc 或点面板上的「停止」可中断',
      convStats: ({ sel, vis }) => `已选 <b>${sel}</b> 个 · 列表里当前显示 <b>${vis}</b> 个`,
      msgStats: ({ sel, vis }) => `已选 <b>${sel}</b> 条 · 当前显示 <b>${vis}</b> 条`,
      warnNoConv: '当前页面没看到会话列表（窄屏下请先返回列表）',
      warnNoMsg: '请先在左侧打开一个对话',
      runBtn: (v) => `删除选中的 ${count.zh(v)}`,
      runArmed: (v) => `再点一次：确认删除 ${count.zh(v)}（不可撤销）`,
      badgeSel: ({ n }) => `已选 ${n}`,
      progress: ({ done, total, ok, skip, fail }) => `${done}/${total} · 成功 ${ok} · 跳过 ${skip} · 失败 ${fail}`,
      sweeping: ({ n }) => `正在滚动加载… 已选 ${n}`,
      count: count.zh,
      // 日志
      logSelected: ({ count }) => `新勾选了 ${count}`,
      logNoConvList: '当前页面没有会话列表',
      logOpenConv: '请先打开一个对话',
      logSweepConv: '向下滚动加载全部会话并全选…',
      logSweepMsg: '向上滚动加载这个对话的全部历史并全选…',
      logSweepStopped: ({ count }) => `已停止加载，当前选中 ${count}`,
      logSweepDone: ({ count }) => `加载完毕，共选中 ${count}`,
      logRunStart: ({ count }) => `开始删除 ${count}…`,
      logPaused: '页面没在前台显示（标签页在后台或窗口被挡住），已暂停；回到这个页面后自动继续',
      logOk: ({ id, note }) => `✓ ${id} ${note}`,
      logSkip: ({ id, reason }) => `– ${id} 跳过：${reason}`,
      logFail: ({ id, reason }) => `✗ ${id} 失败：${reason}`,
      logScriptError: ({ msg }) => `脚本出错：${msg}`,
      logStreak: '连续 3 次失败，已自动停止。可能是 X 改了界面或触发了频率限制，稍后再试；仍不行请点“复制诊断信息”。',
      logStopped: '已手动停止',
      logRunEnd: ({ ok, skip, fail }) => `结束：成功 ${ok}，跳过 ${skip}，失败 ${fail}（失败的仍保持勾选，可再次删除重试）`,
      logDiagCopied: '诊断信息已复制到剪贴板（只有页面结构统计和日志，不含消息内容）',
      logDiagFallback: '无法写入剪贴板，诊断信息显示在下方文本框里',
      // 删除结果
      rMsgNotFound: '没找到这条消息（可能已被删掉或还没加载）',
      rNoMoreButton: '悬停后没出现「更多」按钮',
      rMenuNotOpen: '「更多」菜单没打开',
      rOnlyForMe: '这条只能为自己删除',
      rNoDeleteOption: '菜单里没有删除选项',
      rNoConfirmShown: '点了删除后没出现确认',
      rNoConfirmButton: '确认框里找不到确认按钮',
      rMsgStillThere: '删除后消息还在列表里',
      rGroupSkipped: '群聊（没勾选“群聊也删除”）',
      rConvNotFound: '列表里没找到这个会话（可能已被删掉）',
      rContextMenuNotOpen: '右键菜单没打开',
      rNoDeleteConv: '右键菜单里没有“删除对话”',
      rConvStillThere: '删除后会话还在列表里',
      nDeletedForAll: '已为所有人删除',
      nDeletedForMe: '已为我删除',
      nLeftAndDeleted: '已退出并删除',
      nDeleted: '已删除',
    },
    en: {
      title: 'DM Bulk Delete',
      collapse: 'Collapse / expand',
      tabConv: 'Conversations',
      tabMsg: 'Messages',
      startSelect: 'Start selecting',
      stopSelect: 'Stop selecting',
      selectVisible: 'Select all shown',
      sweepConv: 'Load all & select',
      sweepMsg: 'Load all & select',
      clear: 'Clear selection',
      leaveGroups: 'Also delete group chats (leaves them)',
      filterLabel: 'Select all:',
      filterAll: 'All messages',
      filterMine: 'Only mine',
      filterTheirs: 'Only theirs',
      modeLabel: 'Delete:',
      modeMe: 'For me only',
      modeAll: 'For everyone (else for me)',
      modeAllOnly: 'For everyone only (else skip)',
      delayLabel: 'Delay per item',
      ms: 'ms',
      langLabel: 'Language',
      langAuto: 'Auto',
      stop: 'Stop',
      hint: 'In selection mode, click rows to tick them, Shift-click to select a range, and press Esc to exit. Keep this tab in the foreground while deleting.',
      copyDiag: 'Copy diagnostics',
      feedback: 'Report a problem',
      shield: 'Deleting… Please don’t use the page in the meantime. Press Esc or click “Stop” in the panel to cancel.',
      convStats: ({ sel, vis }) => `<b>${sel}</b> selected · <b>${vis}</b> shown in the list`,
      msgStats: ({ sel, vis }) => `<b>${sel}</b> selected · <b>${vis}</b> shown`,
      warnNoConv: 'No conversation list on this page (in a narrow window, go back to the list first)',
      warnNoMsg: 'Open a conversation on the left first',
      runBtn: (v) => `Delete ${count.en(v).replace(/^(\d+) /, '$1 selected ')}`,
      runArmed: (v) => `Click again to delete ${count.en(v)} (can’t be undone)`,
      badgeSel: ({ n }) => `${n} selected`,
      progress: ({ done, total, ok, skip, fail }) => `${done}/${total} · ${ok} done · ${skip} skipped · ${fail} failed`,
      sweeping: ({ n }) => `Loading… ${n} selected`,
      count: count.en,
      logSelected: ({ count }) => `Selected ${count} more`,
      logNoConvList: 'There is no conversation list on this page',
      logOpenConv: 'Open a conversation first',
      logSweepConv: 'Scrolling down to load and select all conversations…',
      logSweepMsg: 'Scrolling up to load and select this chat’s full history…',
      logSweepStopped: ({ count }) => `Stopped loading; ${count} selected`,
      logSweepDone: ({ count }) => `Finished loading; ${count} selected`,
      logRunStart: ({ count }) => `Deleting ${count}…`,
      logPaused: 'Paused because the page isn’t on screen (tab in the background or window covered); it resumes when you come back',
      logOk: ({ id, note }) => `✓ ${id} ${note}`,
      logSkip: ({ id, reason }) => `– ${id} skipped: ${reason}`,
      logFail: ({ id, reason }) => `✗ ${id} failed: ${reason}`,
      logScriptError: ({ msg }) => `Script error: ${msg}`,
      logStreak: 'Stopped after 3 failures in a row. X may have changed its interface or rate-limited you; try again later, and if it keeps failing, click “Copy diagnostics”.',
      logStopped: 'Stopped',
      logRunEnd: ({ ok, skip, fail }) => `Finished: ${ok} succeeded, ${skip} skipped, ${fail} failed (failed items stay ticked so you can retry)`,
      logDiagCopied: 'Diagnostics copied to the clipboard (page-structure counts and the log only, no message content)',
      logDiagFallback: 'Couldn’t write to the clipboard; the diagnostics are in the box below',
      rMsgNotFound: 'message not found (already deleted or not loaded yet)',
      rNoMoreButton: 'the “More” button didn’t appear on hover',
      rMenuNotOpen: 'the “More” menu didn’t open',
      rOnlyForMe: 'this one can only be deleted for you',
      rNoDeleteOption: 'no delete option in the menu',
      rNoConfirmShown: 'no confirmation appeared after clicking Delete',
      rNoConfirmButton: 'couldn’t find the confirm button',
      rMsgStillThere: 'the message is still listed after deleting',
      rGroupSkipped: 'group chat (“Also delete group chats” is off)',
      rConvNotFound: 'conversation not found in the list (maybe already deleted)',
      rContextMenuNotOpen: 'the right-click menu didn’t open',
      rNoDeleteConv: 'no “Delete conversation” in the right-click menu',
      rConvStillThere: 'the conversation is still listed after deleting',
      nDeletedForAll: 'deleted for everyone',
      nDeletedForMe: 'deleted for you',
      nLeftAndDeleted: 'left and deleted',
      nDeleted: 'deleted',
    },
  };

  let lang = 'en';

  const isChinese = (tag) => /^zh(?:[-_]|$)/i.test(tag);

  // pref: 'auto' | 'zh' | 'en'（面板里的「界面语言」设置）
  function detectLang(pref) {
    if (pref === 'zh' || pref === 'en') return pref;
    // X Chat 在自己的根节点上设置 lang，跟随 X 的界面语言；它在 shadow root 里，closest 正好停在根节点
    const anchor = XBD.query(
      '[data-testid="dm-inbox-panel"], [data-testid="dm-conversation-panel"], [data-testid="dm-message-list"]',
    );
    const tags = [
      anchor?.closest('[lang]')?.getAttribute('lang'),
      document.documentElement.getAttribute('lang'),
      ...(navigator.languages || []),
      navigator.language,
    ];
    const first = tags.find((tag) => tag && tag.trim());
    return first && isChinese(first) ? 'zh' : 'en';
  }

  function setLang(next) {
    lang = next === 'zh' ? 'zh' : 'en';
  }

  function t(key, vars) {
    const value = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return typeof value === 'function' ? value(vars || {}) : value;
  }

  Object.assign(XBD, { STRINGS, detectLang, setLang, t, getLang: () => lang });
})();

# 隐私政策 / Privacy Policy

适用于「X 私信批量删除」（DM Bulk Delete for X）的 Chrome 扩展和油猴脚本。最后更新：2026-10-24。

## 中文

**所有处理都只在你的浏览器里进行，不会有任何数据离开你的设备。**

### 会接触到哪些数据、怎么用

- 扩展只在 `x.com` 和 `twitter.com` 上运行，面板只在私信页（`x.com/i/chat`）显示。
- **私信（个人通信）**：为了完成你要求的删除，扩展会在页面上定位你的会话和消息，读取它们在页面里的内部 ID（会话 ID 由参与者的数字用户 ID 组成）、位置，以及消息是你发的还是对方发的，然后模拟点击 X 自己的菜单把你勾选的那些删掉。它不读取、不保存消息正文。
- **网页内容**：扩展会读取私信页的界面结构和菜单、按钮上的文字，用来找到「删除」「确认」等按钮。
- 以上信息只保存在当前页面的内存里，只用于你发起的删除操作；关闭或刷新页面即消失。

### 保存与传输

- 唯一持久保存的是面板设置（删除方式、间隔时间、面板位置等），存在你浏览器本地的 `chrome.storage.local`（油猴脚本里是 `localStorage`），不会同步到别处，卸载即清除。
- 扩展不发送任何网络请求，不使用任何统计、广告或第三方服务，不会把任何数据传给作者或其他任何人，也不会出售或转让。
- 「复制诊断信息」只把页面结构的统计数字和运行日志（其中的 ID 只保留末尾几位）复制到你的剪贴板，是否分享由你决定；其中不含消息内容。

如有疑问，请在 <https://github.com/LLLn-J/x-dm-bulk-delete/issues> 提问。

## English

**Everything happens inside your browser. No data ever leaves your device.**

### What the extension touches and why

- It runs only on `x.com` and `twitter.com`; its panel appears only on the messages page (`x.com/i/chat`).
- **Personal communications (your DMs):** to carry out the deletions you ask for, it locates your conversations and messages on the page and reads their internal IDs (conversation IDs are made of the participants' numeric user IDs), their positions, and whether each message was sent by you, then simulates clicks on X's own menus to delete the ones you ticked. It does not read or store message text.
- **Website content:** it reads the structure of the messages page and the text on menus and buttons to find controls such as "Delete" and "Confirm".
- This information is held only in the page's memory, used only for the deletions you start, and gone when the page is closed or reloaded.

### Storage and transmission

- The only thing stored persistently is the panel settings (delete mode, delay, panel position, etc.), kept locally via `chrome.storage.local` (`localStorage` for the userscript). Nothing is synced elsewhere; uninstalling removes it.
- It makes no network requests, uses no analytics, advertising or third-party services, and never sends, sells or transfers any data to the author or anyone else.
- "Copy diagnostics" copies page-structure counts and the run log (IDs truncated to their last few characters) to your clipboard; sharing it is up to you. It contains no message content.

Questions: <https://github.com/LLLn-J/x-dm-bulk-delete/issues>.

---

本项目与 X Corp. 无关，不是 X 官方产品。X 是 X Corp. 的商标。
This project is not affiliated with or endorsed by X Corp. "X" is a trademark of X Corp.

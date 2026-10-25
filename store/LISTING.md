# Chrome 网上应用店：后台各栏填写内容

上传 `dist/x-dm-bulk-delete-v<版本>.zip` 后，名称和简介会从扩展的 `_locales` 自动带出（中文为默认语言，另有英文），不用手填。下面是需要手动填写的栏目，直接复制即可。

---

## 一、商品详情（Store listing）

### 详细说明 — 中文（简体，默认语言）

```
在 X（Twitter）私信页批量删除消息和会话。X 自己只能一条条删，这个扩展让你勾选多个后一次删完。

【功能】
• 批量删除整个会话：在会话列表里勾选多个，一次删完；「消息请求」列表同样支持；群聊可选择一并退出
• 批量删除单条消息：在对话里勾选多条，可选「仅为我删除」或「为所有人删除」
• 快速勾选：点击即选、Shift 连选、全选当前显示，或自动滚动加载全部会话 / 全部历史消息后一键全选；可只选自己或对方发的消息
• 安全可控：删除前二次确认；删除过程中有遮罩防误触，随时按 Esc 或点「停止」中断；失败的项目保留勾选，可直接重试

【使用方法】
1. 打开 x.com/i/chat，页面右上角会出现「私信批量删除」面板
2. 选「整个会话」或「单条消息」，点「进入选择模式」后勾选
3. 点删除并再次确认，保持标签页在前台等待完成

【隐私】
• 所有处理都在你的浏览器里完成，不发送任何网络请求，数据不会离开你的设备
• 删除是在本机模拟点击 X 自己的菜单完成的，和手动操作一样
• 只申请了 storage 权限，用来保存面板设置
• 开源：https://github.com/LLLn-J/x-dm-bulk-delete

【注意】
• 删除不可撤销。「仅为我删除」和删除会话只影响你这边，对方仍能看到
• 「为所有人删除」只适用于你自己发的消息
• 本扩展不是 X 官方产品，与 X Corp. 无关
```

### Detailed description — English

在后台「商品详情」里添加语言 English 后填写：

```
Bulk-delete your X (Twitter) DMs. X only lets you delete messages one at a time; this extension lets you tick many and delete them in one go.

FEATURES
• Delete whole conversations in bulk, in the inbox and in message requests; group chats can optionally be left and deleted
• Delete individual messages in bulk with "Delete for me" or "Delete for everyone"
• Fast selection: click to tick, Shift-click for ranges, select everything shown, or auto-scroll to load all conversations or a chat's full history and select it all; optionally only your own or only the other person's messages
• Safe: two-step confirmation; while it runs, an overlay prevents stray clicks, and Esc or "Stop" halts it at any time; failed items stay ticked so you can retry

HOW TO USE
1. Open x.com/i/chat; the panel appears at the top right
2. Choose conversations or messages, enter selection mode and tick
3. Click delete, confirm, and keep the tab in the foreground until it finishes

PRIVACY
• Everything runs inside your browser; it makes no network requests and no data leaves your device
• Deletion works by clicking X's own menus in your browser, exactly as you would by hand
• The only permission is storage, for your panel settings
• Open source: https://github.com/LLLn-J/x-dm-bulk-delete

NOTES
• The panel's interface is currently in Simplified Chinese
• Deletion cannot be undone. "Delete for me" and deleting a conversation only affect your side
• "Delete for everyone" only works on messages you sent
• Not affiliated with or endorsed by X Corp.
```

### 其他栏目

| 栏目 | 填写 |
| --- | --- |
| 类别 Category | Lifestyle → Social Networking（社交网络）；也可选 Productivity → Communication |
| 语言 Language | 中文（简体）；再添加 English |
| 商店图标 Store icon | `store/icon-128.png` |
| 屏幕截图 Screenshots | `store/screenshots/1-conversations.png`、`2-messages.png`、`3-deleting.png`（1280×800） |
| 小宣传图 Small promo tile | `store/promo-440x280.png` |
| 大宣传图 Marquee（可选） | `store/promo-1400x560.png` |
| 官方网址 / 首页 Homepage URL | `https://github.com/LLLn-J/x-dm-bulk-delete` |
| 支持网址 Support URL | `https://github.com/LLLn-J/x-dm-bulk-delete/issues` |
| 成人内容 Mature content | 否 |

---

## 二、隐私权规范（Privacy practices）

### 单一用途说明 Single purpose

```
在 X（Twitter）私信页面上，批量删除用户自己勾选的消息或会话。
Bulk-delete the messages or conversations the user selects on the X (Twitter) messages page.
```

### 权限理由 Permission justification

**storage**

```
仅用于在本地保存面板设置（删除方式、每条间隔、面板位置）。不存储任何消息或账号数据。
Stores the panel settings (delete mode, delay between items, panel position) locally. No message or account data is stored.
```

**主机权限 Host permissions**（内容脚本运行在 `https://x.com/*`、`https://twitter.com/*`）

```
需要在 X 的私信页面上显示批量删除面板，并模拟点击 X 自身的菜单来完成用户选定的删除操作。只在 x.com 和 twitter.com 上运行，面板只在私信页出现。
Needed to show the bulk-delete panel on X's messages page and to simulate clicks on X's own menus to carry out the deletions the user selects. Runs only on x.com and twitter.com; the panel only appears on the messages page.
```

### 远程代码 Remote code

选 **No, I am not using remote code**（不，我没有使用远程代码）。所有代码都在扩展包里。

### 数据使用 Data usage

商店要求：即使数据只在本地处理、从不离开设备，也必须申报（见 [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)）。按实际情况勾选：

- [x] **Personal communications（个人通信）**：在本机定位并删除用户勾选的私信和会话
- [x] **Website content（网站内容）**：读取私信页的界面结构和菜单文字，以找到删除、确认按钮
- 其余类别都不勾选

再勾选下面三项声明：

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

### 隐私权政策网址 Privacy policy URL

```
https://github.com/LLLn-J/x-dm-bulk-delete/blob/main/PRIVACY.md
```

---

## 三、分发 Distribution

- 公开范围：Public（公开）
- 地区：所有地区
- 价格：免费

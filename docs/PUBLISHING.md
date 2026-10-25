# 发布流程

三个渠道共用同一份源码，版本号只在 `x-dm-bulk-delete/manifest.json` 里改。

| 渠道 | 产物 | 更新方式 |
| --- | --- | --- |
| GitHub Releases | `x-dm-bulk-delete-v<版本>.zip`、`.user.js`、`.meta.js` | 推送 `v*` 标签，Actions 自动发布 |
| 油猴（GitHub 直装） | `userscript` 分支上的 `.user.js` | 同上，Actions 自动推送；用户的管理器按 `@updateURL` 自动更新 |
| Chrome 网上应用店 | Release 里的 zip | 手动上传到开发者后台，等审核 |
| Greasy Fork | `userscript` 分支上的 `.user.js` | 设置同步后自动，或每次手动更新 |

## 每次发版

1. 改 `x-dm-bulk-delete/manifest.json` 里的 `version`（如 `1.0.1`），在 `CHANGELOG.md` 最上面加一节 `## v1.0.1 — 日期`
2. 本地检查并打包：`python3 tools/build.py`。界面有变化时顺便重做截图：`python3 tools/make_store_assets.py`
3. 提交、打标签、推送：

   ```bash
   git commit -am "v1.0.1"
   git tag v1.0.1
   git push origin main v1.0.1
   ```

4. GitHub Actions 的 Release 工作流会：核对标签和 manifest 版本一致 → 打包 → 创建 Release 并附上 zip、user.js、meta.js → 更新 `userscript` 分支
5. 到 Chrome 网上应用店后台上传新 zip（见下文）；如果 Greasy Fork 没设同步，去那边更新一次

## GitHub（首次）

1. 创建公开仓库 `LLLn-J/x-dm-bulk-delete`，推送 `main`
2. 推送第一个标签 `v1.0.0`，等 Actions 跑完，确认 Releases 页有三个附件、出现了 `userscript` 分支
3. 仓库 About 栏建议填：简介 `Bulk-delete X (Twitter) DMs — Chrome extension & userscript`，网址填商店链接（审核通过后），Topics 加 `chrome-extension`、`userscript`、`twitter`、`x`、`dm`

## Chrome 网上应用店

**首次上架**

1. 注册开发者账号：<https://chrome.google.com/webstore/devconsole>（一次性 5 美元，需要验证邮箱）。后台的联系邮箱会公开显示在商店页，可以考虑用专门的邮箱
2. 「新增商品」→ 上传 Release 里的 `x-dm-bulk-delete-v1.0.0.zip`（或本地 `dist/` 里的）
3. 「商品详情」和「隐私权规范」照 [store/LISTING.md](../store/LISTING.md) 逐栏填写，图片都在 `store/` 里
4. 「分发」选公开、所有地区，提交审核。一般几个工作日内有结果，涉及第三方网站的扩展有时会更久

**更新版本**：后台「软件包」→ 上传新版本 zip（版本号必须比上一版大）→ 有需要就更新截图和说明 → 提交审核。

**审核注意**

- 名称里有 X，说明里已写明「不是 X 官方产品、与 X Corp. 无关」，图标也没用 X 的标志，避免被判为冒充
- 隐私权规范要如实申报：即使数据只在本地处理，也要勾选「个人通信」「网站内容」（LISTING.md 里写了原因）
- 说明里不要堆关键词，否则会触发 Keyword spam 政策
- 被拒时邮件会给出违反的具体政策条款，按条修改后重新提交即可

## 油猴脚本

**GitHub 直装**：README 里的一键安装链接指向
`https://raw.githubusercontent.com/LLLn-J/x-dm-bulk-delete/userscript/x-dm-bulk-delete.user.js`。
第一次发版后这个地址才生效；之后每次发版自动更新，已安装的用户会在管理器检查更新时收到新版本。

**Greasy Fork**（<https://greasyfork.org>）

1. 注册登录后点「发布你编写的脚本」
2. 推荐用「从 URL 导入」并开启同步，地址填上面的 raw 链接；Greasy Fork 会定期去抓新版本。想推送后立刻同步，可按 Greasy Fork 账号页里的说明给仓库加 webhook
3. 不想设同步，也可以把 Release 里的 `x-dm-bulk-delete.user.js` 内容粘贴进去，每次发版手动更新
4. 脚本头里已经写好了中英文名称和简介、`@license MIT`、主页和反馈地址；Greasy Fork 会自动去掉 `@updateURL` / `@downloadURL`，改由它自己负责更新，不用手动删
5. 每次更新 `@version` 都必须变大（`tools/build.py` 直接从 manifest 读，不会忘）

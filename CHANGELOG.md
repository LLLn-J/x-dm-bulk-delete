# 更新日志

## v1.1.0 — 2026-11-04

- 面板新增英文界面：自动跟随 X 的界面语言，取不到时跟随浏览器语言；也可以在面板里手动选「自动 / 中文 / English」
- 删除日志和失败原因也按界面语言显示
- 扩展名称、简介和工具栏弹窗支持英文、简体中文、繁体中文，默认语言改为英文（其他语言的浏览器看到英文）
- 商店截图新增英文版
- 删除过程中如果页面没在屏幕上渲染（标签页在后台、窗口被挡住），会自动暂停等待，不再把剩下的逐条判为失败
- Added an English interface. It follows X's interface language (falling back to the browser language) and can be switched manually in the panel
- Deletion now pauses while the page isn't being rendered (background tab, covered window) instead of failing the remaining items

## v1.0.0 — 2026-10-24

首个公开版本。

- 批量删除整个会话（收件箱和「消息请求」列表都支持）；群聊可选择退出并删除
- 批量删除单条消息，三种方式：仅为我删除 / 为所有人删除（不行就仅为我）/ 只为所有人删除（不行就跳过）
- 选择模式：点击勾选、Shift 连选、全选当前显示、自动滚动加载全部并全选（可只选自己或对方发的消息）
- 删除过程有遮罩防误触，Esc 或「停止」随时中断，标签页切到后台自动暂停，连续失败 3 次自动停止
- 识别 X Chat 网页版全部 42 种界面语言的按钮文字
- 同时提供 Chrome 扩展和油猴脚本两种安装方式

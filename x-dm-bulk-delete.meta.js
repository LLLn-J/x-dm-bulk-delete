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

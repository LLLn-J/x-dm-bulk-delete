#!/usr/bin/env python3
"""用本机 Chrome 的无头模式生成 Chrome 网上应用店素材到 store/：

    python3 tools/make_store_assets.py

    store/screenshots/1-conversations.png   1280×800  批量勾选会话
    store/screenshots/2-messages.png        1280×800  批量勾选消息、选删除方式
    store/screenshots/3-deleting.png        1280×800  删除进行中
    store/promo-440x280.png                 小宣传图
    store/promo-1400x560.png                大宣传图（可选）
    store/icon-128.png                      商店图标（就是扩展里的 icon128）

截图来自 test/mock-xchat.html 的演示模式（仿 X Chat 界面 + 真实的扩展面板，数据都是假的）。
找不到 Chrome 时可用环境变量 CHROME 指定可执行文件路径。
"""
import importlib.util
import json
import os
import pathlib
import shutil
import struct
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
STORE = ROOT / "store"
SHOTS = [("1-conversations", "conv"), ("2-messages", "msg"), ("3-deleting", "run")]
CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
]


def find_chrome():
    for c in [os.environ.get("CHROME"), *CHROME_CANDIDATES]:
        if c and (pathlib.Path(c).is_file() or shutil.which(c)):
            return shutil.which(c) or c
    sys.exit("找不到 Chrome，请用环境变量 CHROME 指定可执行文件路径")


def capture(chrome, url, out, width, height):
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as profile:  # 临时配置目录，不碰你自己的 Chrome 资料
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--no-first-run",
                "--no-default-browser-check",
                "--force-device-scale-factor=1",
                f"--user-data-dir={profile}",
                f"--window-size={width},{height}",
                "--virtual-time-budget=5000",  # 给页面脚本和动画留时间跑完
                f"--screenshot={out}",
                url,
            ],
            check=True,
            capture_output=True,
        )
    w, h = struct.unpack(">II", out.read_bytes()[16:24])
    if (w, h) != (width, height):
        sys.exit(f"{out.name} 尺寸是 {w}×{h}，不是 {width}×{height}")
    print(f"  {out.relative_to(ROOT)}  {w}×{h}")


def main():
    chrome = find_chrome()
    spec = importlib.util.spec_from_file_location("make_icons", ROOT / "tools" / "make_icons.py")
    icons = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(icons)
    (STORE / "assets").mkdir(parents=True, exist_ok=True)
    (STORE / "assets" / "icon-512.png").write_bytes(icons.render(512))
    shutil.copyfile(ROOT / "x-dm-bulk-delete" / "icons" / "icon128.png", STORE / "icon-128.png")

    version = json.loads((ROOT / "x-dm-bulk-delete" / "manifest.json").read_text(encoding="utf-8"))["version"]
    mock = (ROOT / "test" / "mock-xchat.html").as_uri()
    for name, demo in SHOTS:
        capture(chrome, f"{mock}?demo={demo}&version={version}", STORE / "screenshots" / f"{name}.png", 1280, 800)
    promo = (STORE / "promo.html").as_uri()
    capture(chrome, promo, STORE / "promo-440x280.png", 440, 280)
    capture(chrome, promo, STORE / "promo-1400x560.png", 1400, 560)
    print(f"  {(STORE / 'icon-128.png').relative_to(ROOT)}  128×128")


if __name__ == "__main__":
    main()

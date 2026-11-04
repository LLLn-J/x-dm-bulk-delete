#!/usr/bin/env python3
"""打包发布产物到 dist/：

    python3 tools/build.py              检查并打包
    python3 tools/build.py --notes      只打印 CHANGELOG 里当前版本的说明（发 Release 用）

产物：
    x-dm-bulk-delete-v<版本>.zip   上传 Chrome 网上应用店（zip 根目录就是 manifest.json）
    x-dm-bulk-delete.user.js       油猴脚本（GitHub Release / Greasy Fork）
    x-dm-bulk-delete.meta.js       只有元数据头，油猴管理器检查更新时用

版本号只在 x-dm-bulk-delete/manifest.json 里改，其余地方都从这里读。
"""
import base64
import json
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXT = ROOT / "x-dm-bulk-delete"
DIST = ROOT / "dist"
REPO = "LLLn-J/x-dm-bulk-delete"
HOMEPAGE = f"https://github.com/{REPO}"
# 发版时 GitHub Actions 把油猴脚本推到 userscript 分支，地址固定，供安装、自动更新和 Greasy Fork 同步
USERSCRIPT_RAW = f"https://raw.githubusercontent.com/{REPO}/userscript"
AUTHOR = "Xuan Hu"
LICENSE = "MIT"
# 油猴里各语言的键名（Greasy Fork / Tampermonkey 用 BCP 47 语言代码）
USERSCRIPT_LOCALES = {"en": "en", "zh_CN": "zh-CN", "zh_TW": "zh-TW"}
# 读出 i18n.js 里中英文两张表的键（i18n.js 只在函数里用到浏览器 API，node 里可以直接加载）
NODE_DUMP_STRINGS = (
    "globalThis.XBD = {}; require(process.argv[1]); const s = globalThis.XBD.STRINGS;"
    "console.log(JSON.stringify(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Object.keys(v)]))));"
)


def fail(msg):
    sys.exit(f"✗ {msg}")


def load_manifest():
    manifest = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))
    messages = {}
    for d in sorted((EXT / "_locales").iterdir()):
        if d.is_dir():
            messages[d.name] = json.loads((d / "messages.json").read_text(encoding="utf-8"))
    return manifest, messages


def localize(value, messages, locale):
    def sub(m):
        try:
            return messages[locale][m.group(1)]["message"]
        except KeyError:
            fail(f"_locales/{locale}/messages.json 缺少 {m.group(1)}")

    return re.sub(r"__MSG_(\w+)__", sub, value)


def check(manifest, messages):
    version = manifest["version"]
    if not re.fullmatch(r"\d+(\.\d+){0,3}", version):
        fail(f"版本号 {version} 不符合 Chrome 要求（1 到 4 段数字）")
    default = manifest.get("default_locale")
    if default not in messages:
        fail(f"default_locale={default} 但没有对应的 _locales 目录")
    for locale in messages:
        name = localize(manifest["name"], messages, locale)
        desc = localize(manifest["description"], messages, locale)
        if len(name) > 75:
            fail(f"[{locale}] 名称超过 75 个字符：{name}")
        if len(desc) > 132:
            fail(f"[{locale}] 简介超过 132 个字符（{len(desc)}）：{desc}")
    referenced = [*manifest["icons"].values(), manifest["action"]["default_popup"]]
    referenced += [p for cs in manifest["content_scripts"] for p in cs["js"]]
    for rel in referenced:
        if not (EXT / rel).is_file():
            fail(f"manifest 引用的文件不存在：{rel}")
    # _locales：每种语言的条目要和默认语言一致，弹窗用到的条目都要有
    keys = set(messages[default])
    for locale, msgs in messages.items():
        if set(msgs) != keys:
            fail(f"_locales/{locale} 和默认语言的条目不一致：{sorted(set(msgs) ^ keys)}")
    popup = (EXT / manifest["action"]["default_popup"]).read_text(encoding="utf-8")
    for key in re.findall(r'data-i18n="(\w+)"', popup):
        if key not in keys:
            fail(f"弹窗用到的 {key} 不在 _locales 里")
    node = shutil.which("node")
    if node:
        for js in sorted(EXT.rglob("*.js")):
            r = subprocess.run([node, "--check", str(js)], capture_output=True, text=True)
            if r.returncode:
                fail(f"语法错误 {js.relative_to(ROOT)}\n{r.stderr}")
        check_panel_strings(node)
    else:
        print("（没装 node，跳过 JS 语法检查和面板文字检查）")


def check_panel_strings(node):
    """面板的中英文两张表键要一样，代码里用到的键都要在表里"""
    r = subprocess.run([node, "-e", NODE_DUMP_STRINGS, str(EXT / "src" / "i18n.js")], capture_output=True, text=True)
    if r.returncode:
        fail(f"加载 i18n.js 失败\n{r.stderr}")
    tables = {lang: set(k) for lang, k in json.loads(r.stdout).items()}
    zh, en = tables["zh"], tables["en"]
    if zh != en:
        fail(f"面板文字的中英文条目不一致：只有中文 {sorted(zh - en)}，只有英文 {sorted(en - zh)}")
    used = set()
    for js in [*sorted((EXT / "src").glob("*.js")), ROOT / "test" / "demo.js"]:
        src = js.read_text(encoding="utf-8")
        used |= set(re.findall(r'data-i18n(?:-title)?="(\w+)"', src))
        for call in re.findall(r"\bt\(([^()]*)", src):  # 也覆盖 t(cond ? 'a' : 'b')
            call = re.sub(r"[=!]==?\s*'\w+'", "", call)  # 去掉 kind === 'conv' 这类比较里的字面量
            used |= set(re.findall(r"'(\w+)'", call))
    missing = sorted(used - zh)
    if missing:
        fail(f"代码里用到但面板文字表里没有：{missing}")


def build_zip(version):
    out = DIST / f"x-dm-bulk-delete-v{version}.zip"
    files = sorted(p for p in EXT.rglob("*") if p.is_file() and not any(part.startswith(".") for part in p.parts))
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in files:
            # 固定时间戳，同样的源码打出同样的 zip
            info = zipfile.ZipInfo(p.relative_to(EXT).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, p.read_bytes())
    return out, len(files)


def userscript_header(manifest, messages):
    default = manifest["default_locale"]
    icon = base64.b64encode((EXT / "icons" / "icon48.png").read_bytes()).decode()
    lines = [("name", localize(manifest["name"], messages, default))]
    lines += [(f"name:{USERSCRIPT_LOCALES[l]}", localize(manifest["name"], messages, l)) for l in messages]
    lines += [
        ("namespace", HOMEPAGE),
        ("version", manifest["version"]),
        ("description", localize(manifest["description"], messages, default)),
    ]
    lines += [(f"description:{USERSCRIPT_LOCALES[l]}", localize(manifest["description"], messages, l)) for l in messages]
    lines += [
        ("author", AUTHOR),
        ("license", LICENSE),
        ("homepageURL", HOMEPAGE),
        ("supportURL", f"{HOMEPAGE}/issues"),
        ("icon", f"data:image/png;base64,{icon}"),
    ]
    lines += [("match", m) for cs in manifest["content_scripts"] for m in cs["matches"]]
    lines += [
        ("grant", "none"),
        ("run-at", "document-idle"),
        ("noframes", ""),
        # Greasy Fork 上传时会自动去掉这两行，改由它自己负责更新
        ("updateURL", f"{USERSCRIPT_RAW}/x-dm-bulk-delete.meta.js"),
        ("downloadURL", f"{USERSCRIPT_RAW}/x-dm-bulk-delete.user.js"),
    ]
    width = max(len(k) for k, _ in lines) + 2
    body = "\n".join(f"// @{k.ljust(width)}{v}".rstrip() for k, v in lines)
    return f"// ==UserScript==\n{body}\n// ==/UserScript==\n"


def build_userscript(manifest, messages):
    header = userscript_header(manifest, messages)
    files = manifest["content_scripts"][0]["js"]
    body = "\n".join(f"// ---- {f} ----\n" + (EXT / f).read_text(encoding="utf-8") for f in files)
    user = DIST / "x-dm-bulk-delete.user.js"
    meta = DIST / "x-dm-bulk-delete.meta.js"
    user.write_text(header + "\n" + body, encoding="utf-8")
    meta.write_text(header, encoding="utf-8")
    node = shutil.which("node")
    if node:
        r = subprocess.run([node, "--check", str(user)], capture_output=True, text=True)
        if r.returncode:
            fail(f"油猴脚本语法错误\n{r.stderr}")
    return user, meta


def release_notes(version):
    text = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    m = re.search(rf"^## v{re.escape(version)}\b.*?$(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not m:
        fail(f"CHANGELOG.md 里没有 v{version} 的条目")
    return m.group(1).strip()


def main():
    manifest, messages = load_manifest()
    version = manifest["version"]
    if "--notes" in sys.argv:
        print(release_notes(version))
        return
    check(manifest, messages)
    release_notes(version)  # 发版前确认写了更新日志
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    zip_path, n = build_zip(version)
    user, meta = build_userscript(manifest, messages)
    print(f"✓ v{version}")
    print(f"  {zip_path.relative_to(ROOT)}（{n} 个文件，{zip_path.stat().st_size // 1024} KB）")
    print(f"  {user.relative_to(ROOT)}（{user.stat().st_size // 1024} KB）")
    print(f"  {meta.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

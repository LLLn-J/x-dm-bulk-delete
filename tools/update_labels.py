#!/usr/bin/env python3
"""从 X Chat 线上的语言包重新生成 x-dm-bulk-delete/src/labels.js。

X 改了按钮文案或新增语言时运行一次：
    python3 tools/update_labels.py

只用标准库；只下载 chat.x.com 的清单和 abs.twimg.com 上的语言包，不执行其中任何代码。
"""
import json
import pathlib
import re
import sys
import urllib.request

MANIFEST_URL = "https://chat.x.com/embed-v1.json"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
KEYS = ["Delete", "Delete for me", "Delete for all", "Just me", "Everyone", "Cancel", "Confirm",
        "Delete conversation", "Leave conversation"]
# en-ss / en-xx 是 X 的伪语言（测试用），跳过
LOCALE_RE = re.compile(r"assets/((?:[a-z]{2,3})(?:-(?!ss-|xx-)[a-z]{2,3})?)-[A-Za-z0-9_-]{8}\.js$")
OUT = pathlib.Path(__file__).resolve().parent.parent / "x-dm-bulk-delete" / "src" / "labels.js"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def walk_strings(o):
    if isinstance(o, dict):
        for v in o.values():
            yield from walk_strings(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk_strings(v)
    elif isinstance(o, str):
        yield o


def parse_locale(src):
    """语言包形如  var b=`删除`,…;  {…,Delete:b,"Delete for me":`仅删除我的`,…}"""
    consts = dict(re.findall(r"(?:var |,)([A-Za-z_$][\w$]*)=`([^`]*)`", src))
    row = {}
    for key in KEYS:
        alts = [re.escape(json.dumps(key, ensure_ascii=False))]
        if re.fullmatch(r"[A-Za-z_$][\w$]*", key):
            alts.append(re.escape(key))
        m = re.search(r"[{,](?:%s):(?:`([^`]*)`|([A-Za-z_$][\w$]*))" % "|".join(alts), src)
        if m:
            val = m.group(1) if m.group(1) is not None else consts.get(m.group(2))
            if val:
                row[key] = val
    return row


def main():
    manifest = json.loads(fetch(MANIFEST_URL))
    public_path = manifest["metaData"]["publicPath"]
    locales = {}
    for s in walk_strings(manifest.get("exposes", [])):
        m = LOCALE_RE.match(s)
        if m and m.group(1) != "en":
            locales[m.group(1)] = s
    if not locales:
        sys.exit("清单里没找到语言包，X 可能改了打包方式")

    labels = {k: [k] for k in KEYS}
    accepted = 0
    for loc in sorted(locales):
        row = parse_locale(fetch(public_path + locales[loc]))
        # 文件名像语言代码的普通代码块（hls、rfb…）只会碰巧命中零星几个键，丢掉
        if len(row) < len(KEYS) - 3:
            continue
        accepted += 1
        for k, v in row.items():
            if v not in labels[k]:
                labels[k].append(v)
        print(f"{loc:6} {len(row)}/{len(KEYS)}")

    lines = ",\n".join(f"    {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}" for k, v in labels.items())
    OUT.write_text(
        f"// 由 tools/update_labels.py 从 X Chat 自带的语言包生成（{accepted} 种界面语言 + 英文），请勿手改。\n"
        "// 键是 X 源码里的英文原文，值是各语言界面上实际显示的按钮文字。\n"
        "(() => {\n"
        "  const XBD = (globalThis.XBD = globalThis.XBD || {});\n"
        f"  XBD.LABELS = {{\n{lines}\n  }};\n"
        "})();\n",
        encoding="utf-8",
    )
    print(f"已写入 {OUT}（构建 {public_path.rstrip('/').rsplit('/', 1)[-1][:12]}）")


if __name__ == "__main__":
    main()

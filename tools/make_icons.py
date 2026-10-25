#!/usr/bin/env python3
"""生成扩展图标：黑色圆角方块 + 白色垃圾桶 + 蓝色勾选框。只用标准库。

    python3 tools/make_icons.py

- icon16/32/48：工具栏用，铺满画布
- icon128：商店和扩展管理页用，按 Chrome 网上应用店规范留 16px 透明边（图案 96×96），
  外加一圈很淡的白色外发光，保证在深色背景上也看得清
"""
import math
import pathlib
import struct
import zlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "x-dm-bulk-delete" / "icons"
DARK = (15, 20, 25)
WHITE = (255, 255, 255)
BLUE = (29, 155, 240)


def round_rect_dist(x, y, x0, y0, x1, y1, r):
    """到圆角矩形边界的有符号距离（内部为负）"""
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    if x0 + r <= x <= x1 - r or y0 + r <= y <= y1 - r:
        return max(x0 - x, x - x1, y0 - y, y - y1)
    return math.hypot(x - cx, y - cy) - r


def inside(x, y, x0, y0, x1, y1, r):
    return round_rect_dist(x, y, x0, y0, x1, y1, r) <= 0


def seg_dist(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    t = max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def artwork(x, y):
    """128 单位坐标系里的图案颜色；圆角方块外返回 None"""
    if not inside(x, y, 0, 0, 128, 128, 28):
        return None
    if inside(x, y, 74, 74, 116, 116, 10):  # 右下角蓝色勾选框
        if seg_dist(x, y, 84, 95, 92, 104) <= 3.6 or seg_dist(x, y, 92, 104, 107, 85) <= 3.6:
            return WHITE
        return BLUE
    if inside(x, y, 70, 70, 120, 120, 13):  # 勾选框外的描边间隙
        return DARK
    if inside(x, y, 46, 18, 70, 30, 5) and not inside(x, y, 51, 23, 65, 34, 2):  # 盖子把手
        return WHITE
    if inside(x, y, 26, 28, 90, 37, 3):  # 盖子
        return WHITE
    if 41 <= y <= 104:  # 桶身，上宽下窄，三道竖槽
        t = (y - 41) / 63
        if inside(x, y, 31 + 5 * t, 41, 85 - 5 * t, 104, 7):
            if 51 <= y <= 94 and any(abs(x - sx) <= 2.6 for sx in (46, 58, 70)):
                return DARK
            return WHITE
    return DARK


def render(size, pad=0, glow=0.0):
    ss = 4  # 4x4 超采样抗锯齿
    scale = 128 / (size - 2 * pad)
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            r = g = b = a = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx + 0.5) / ss - pad) * scale
                    y = (py + (sy + 0.5) / ss - pad) * scale
                    c = artwork(x, y)
                    if c:
                        r += c[0]; g += c[1]; b += c[2]; a += 1
                    elif glow:
                        d = round_rect_dist(x, y, 0, 0, 128, 128, 28) / scale  # 换算成输出像素
                        if d < 3:
                            w = glow * (1 - d / 3) ** 2
                            r += 255 * w; g += 255 * w; b += 255 * w; a += w
            if a:
                row += bytes([round(r / a), round(g / a), round(b / a), round(255 * a / (ss * ss))])
            else:
                row += bytes(4)
        rows.append(bytes(row))

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    return png


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48):
        (OUT / f"icon{size}.png").write_bytes(render(size))
    (OUT / "icon128.png").write_bytes(render(128, pad=16, glow=0.35))
    print(f"已生成 {OUT}/icon{{16,32,48,128}}.png")


if __name__ == "__main__":
    main()

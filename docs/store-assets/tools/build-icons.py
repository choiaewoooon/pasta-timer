#!/usr/bin/env python3
"""로고 원본(투명 PNG) 하나에서 아이콘 세트 전체를 굽는다.

일반 아이콘과 maskable 아이콘의 여백이 다르다:
- 일반: 내용물 80% — 타일 안에 꽉 차게
- maskable: 내용물 60% — 안드로이드가 원/스퀴클로 잘라내는 세이프존(안쪽 80% 원) 안에
  들어와야 링이 안 잘린다. 이걸 안 지키면 홈화면에서 로고 가장자리가 잘려 나간다
"""
import sys
from PIL import Image

CREAM = (250, 243, 224)


def bake(src, dst, size, frac):
    im = Image.open(src).convert("RGBA")
    target = int(round(size * frac))
    scale = target / max(im.size)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), CREAM + (255,))
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    canvas.convert("RGB").save(dst, optimize=True)
    print(f"  {dst.split('/')[-1]:<28} {size}px  내용물 {frac:.0%}")


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    print("일반 아이콘 (내용물 80%)")
    bake(src, f"{out}/icons/icon-192.png", 192, 0.80)
    bake(src, f"{out}/icons/icon-512.png", 512, 0.80)
    bake(src, f"{out}/icons/apple-touch-icon.png", 180, 0.80)
    bake(src, f"{out}/favicon.png", 32, 0.86)
    print("maskable 아이콘 (내용물 60% — 세이프존)")
    bake(src, f"{out}/icons/icon-maskable-192.png", 192, 0.60)
    bake(src, f"{out}/icons/icon-maskable-512.png", 512, 0.60)

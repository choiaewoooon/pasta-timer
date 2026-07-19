#!/usr/bin/env python3
"""링 마커용 캐릭터 포즈를 기존 에셋과 같은 프레이밍으로 맞춘다.

두 가지를 보장한다:
1. 내용물이 프레임에서 차지하는 비율을 통일 → 상태 전환 시 캐릭터 크기가 튀지 않는다
2. 내용물이 내접원 안에 들어온다 → borderRadius:50% 크롭에 팔다리가 안 잘린다
   (정사각 bbox가 내접원에 들어오려면 대각선 기준 비율 ≤ 1/√2 ≈ 0.707)
"""
import sys
import numpy as np
from PIL import Image

CREAM_CARD = (255, 251, 242)


def normalize(src, dst, frac=0.70, size=128, bg=CREAM_CARD):
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 8)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    # 긴 변이 frac 비율이 되도록 축소 후 정사각 캔버스 중앙 배치
    target = int(round(size * frac))
    scale = target / max(im.size)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), bg + (255,))
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    canvas.convert("RGB").save(dst, optimize=True)
    print(f"{dst}  {size}x{size}  내용물 {frac:.2f}")


if __name__ == "__main__":
    a = sys.argv[1:]
    kw = {k.split("=")[0].lstrip("-"): float(k.split("=")[1]) for k in a if k.startswith("--")}
    pos = [x for x in a if not x.startswith("--")]
    normalize(pos[0], pos[1], frac=kw.get("frac", 0.70), size=int(kw.get("size", 128)))

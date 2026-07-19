#!/usr/bin/env python3
"""마젠타 크로마키 배경을 투명 알파로 바꾼다.

Codex의 image_gen은 투명 배경을 직접 못 만들어서 #FF00FF 단색 위에 그린다.
단순 색상 매칭으로 지우면 경계에 마젠타 실선(fringe)이 남으므로,
'마젠타스러움'을 연속값으로 계산해 알파를 만들고 색 번짐(spill)까지 제거한다.

사용법: python3 dechroma.py <입력> <출력> [--size N]
"""
import sys
import numpy as np
from PIL import Image


def dechroma(src, dst, size=None):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    # 마젠타 = R,B 높고 G 낮음. 초록 결핍 정도를 키로 쓴다.
    mag = np.minimum(r, b) - g              # 1.0에 가까울수록 순수 마젠타
    alpha = np.clip(1.0 - (mag - 0.15) / 0.35, 0.0, 1.0)  # 0.15~0.50 구간에서 부드럽게

    # 스필 제거: 남은 반투명 경계에서 R,B를 G 수준으로 끌어내려 자주색 테두리를 없앤
    spill = (mag > 0.0) & (alpha > 0.0)
    cap = g + np.maximum(mag, 0.0) * 0.35
    r = np.where(spill, np.minimum(r, cap), r)
    b = np.where(spill, np.minimum(b, cap), b)

    rgba = np.dstack([r, g, b, alpha])
    out = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA")

    # 알파 바운딩박스로 crop — 여백 편차를 없애 UI에서 크기가 일정해진다
    bbox = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        out = out.crop(bbox)
        side = max(out.size)
        sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        sq.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
        out = sq

    if size:
        out = out.resize((size, size), Image.LANCZOS)
    out.save(dst, optimize=True)

    op = np.asarray(out)[..., 3]
    print(f"{dst}  {out.size[0]}x{out.size[1]}  불투명픽셀 {(op > 8).mean() * 100:.1f}%")


if __name__ == "__main__":
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    size = next((int(x.split("=")[1]) for x in sys.argv[1:] if x.startswith("--size=")), None)
    dechroma(args[0], args[1], size)

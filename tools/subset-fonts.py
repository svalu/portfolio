"""
프리텐다드 서브셋 — 이 사이트가 실제로 쓰는 글자만 남긴다.

왜: 한글 폰트는 음절 11,172자를 전부 담아 굵기당 750KB가 넘는다.
    포트폴리오는 글이 고정이라, 쓰는 글자만 남기면 한 자릿수 KB~수십 KB로 줄어든다.
    첫 화면 전송량의 대부분이 폰트였다.

언제 다시 돌리나: **문장을 고치면 반드시 다시 돌린다.** 새로 쓴 글자가 빠져 있으면
    그 글자만 시스템 폰트로 나와 눈에 띈다.

    python tools/subset-fonts.py

원본은 data/AIR_Connect_Design (2)/.../libs 에 그대로 있다(서브셋본만 assets 에 둔다).
"""
import re, sys, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "data/AIR_Connect_Design (2)/AIR_Connect_Design/05_18/libs"
OUT  = ROOT / "assets/fonts"
WEIGHTS = ["ExtraLight", "Light", "Regular", "Medium"]

# 글자를 긁어올 파일 — 이 폰트를 쓰는 모든 화면
TARGETS = [
    "index.html", "m/index.html", "README.md",
    "work/os-ui/2023/main.html", "work/os-ui/2023/login.html", "work/os-ui/2023/error.html",
    "work/os-ui/2023/css/main.css",
]

# 항상 넣어 두는 것 — 라틴·숫자·문장부호·자모. 글을 조금 고쳐도 깨지지 않게
ALWAYS = set(chr(c) for c in range(0x20, 0x7F))
ALWAYS |= set("·…—–‘’“”→←↑↓⟨⟩《》「」『』〈〉№※℃±×÷≤≥≠∞°㎡㎏₩$€¥%‰㈜©®™")
ALWAYS |= set(chr(c) for c in range(0x3130, 0x3190))      # 한글 자모
ALWAYS |= set(chr(c) for c in range(0x2010, 0x2030))      # 각종 하이픈·따옴표
ALWAYS |= set("　")                                        # 전각 공백

def collect():
    chars = set(ALWAYS)
    for rel in TARGETS:
        p = ROOT / rel
        if not p.exists():
            print("  (없음, 건너뜀)", rel); continue
        chars |= set(p.read_text(encoding="utf-8", errors="ignore"))
    # 제어문자 제거
    return {c for c in chars if ord(c) >= 0x20 and c != "﻿"}

def main():
    if not SRC.exists():
        sys.exit("원본 폰트 폴더를 찾을 수 없습니다: %s" % SRC)
    chars = collect()
    hangul = sum(1 for c in chars if 0xAC00 <= ord(c) <= 0xD7A3)
    print("수집한 글자 %d자 (한글 음절 %d자)" % (len(chars), hangul))
    unicodes = ",".join("U+%04X" % ord(c) for c in sorted(chars))

    total_before = total_after = 0
    for w in WEIGHTS:
        src = SRC / ("Pretendard-%s.woff2" % w)
        dst = OUT / ("Pretendard-%s.woff2" % w)
        before = src.stat().st_size
        subprocess.run([
            sys.executable, "-m", "fontTools.subset", str(src),
            "--flavor=woff2", "--layout-features=kern,liga",
            "--drop-tables+=DSIG", "--no-hinting", "--desubroutinize",
            "--unicodes=%s" % unicodes, "--output-file=%s" % dst,
        ], check=True)
        after = dst.stat().st_size
        total_before += before; total_after += after
        print("  %-11s %7.1fKB → %6.1fKB" % (w, before/1024, after/1024))
    print("합계 %.2fMB → %.2fMB (%.0f%% 감소)" % (
        total_before/1048576, total_after/1048576, (1-total_after/total_before)*100))

if __name__ == "__main__":
    main()

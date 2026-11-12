"""태엽 마을 — 제6~7막 「오르골 여왕」 소리 생성기 (jobs/AUDIO3.md 기준, numpy + scipy 절차 합성)

실행:  python tools/gen_audio_act6_7.py               # 전체
       python tools/gen_audio_act6_7.py act6          # 묶음 단위 (act6 | act7 | boss)
       python tools/gen_audio_act6_7.py sfx_comb      # 이름 일부

tools/gen_audio.py · gen_audio_act3_5.py · gen_audio_act3_5b.py의 도구 함수를 가져다 쓴다. 기존 곡은 바꾸지 않는다.
소리 방향: 중심 악기 = 오르골. 너무 감김 = 빠르고 살짝 뜬 음정·쉬지 않는 왈츠·끼이익 / 풀림 = 제 템포·따뜻한 잔향·피아노
멜로디 테마: 8마디(+변주 8마디) 3/4 왈츠, C장조. 마디마다 코드가 그라모의 마을 곡(AWAKE_PROG)과 같아서 겹쳐 연주할 수 있다.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_audio as GA  # noqa: E402
from gen_audio import (CHORDS, SR, Track, bell_hit, bp, brush, chord_tones, clarinet, env_adsr, fade,  # noqa: E402
                       film_noise, hp, hz, kick, lp, midi, musicbox, noise, norm, piano, reverb, save, t_axis,
                       tick, tuba, woodblock)
from gen_audio_act3_5 import (AWAKE_PROG, BSR, awake_melody, creak, horn, jingle_mix, loop_filter, metal,  # noqa: E402
                              paper, place, sine, sweep)
from gen_audio_act3_5b import loop_tone, saw  # noqa: E402

TIGHT = 2 ** (18 / 1200)  # 너무 감긴 오르골: 음정이 18센트 뜸

# ───────────────────────── 멜로디 테마 ─────────────────────────
# (마디 안 박, midi, 길이) — 3/4. 앞 8마디 = 테마, 뒤 8마디 = 변주(마을 곡 9~16마디 코드에 맞춤)
THEME_BARS = [
    [(0, 79, 2), (2, 76, 1)],                # C      G5 E5   ← 첫 4음: G5 E5 A5 G5
    [(0, 81, 1.5), (1.5, 79, .5), (2, 76, 1)],  # A7  A5 G5 E5
    [(0, 77, 2), (2, 74, 1)],                # Dm7    F5 D5
    [(0, 71, 1), (1, 74, 1), (2, 77, 1)],    # G7     B4 D5 F5
    [(0, 76, 2), (2, 79, 1)],                # C      E5 G5
    [(0, 82, 1.5), (1.5, 81, .5), (2, 79, 1)],  # C7  Bb5 A5 G5
    [(0, 81, 1), (1, 77, 1), (2, 72, 1)],    # F      A5 F5 C5
    [(0, 80, 2), (2, 79, 1)],                # Fm     Ab5 G5
    [(0, 79, 2), (2, 76, 1)],                # C
    [(0, 81, 1.5), (1.5, 79, .5), (2, 76, 1)],  # A7
    [(0, 78, 2), (2, 74, 1)],                # D7     F#5 D5
    [(0, 71, 1), (1, 74, 1), (2, 77, 1)],    # G7
    [(0, 76, 2), (2, 79, 1)],                # C
    [(0, 81, 1.5), (1.5, 79, .5), (2, 73, 1)],  # A7  A5 G5 C#5
    [(0, 77, 1), (1, 81, 1), (2, 74, 1)],    # Dm7    F5 A5 D5
    [(0, 74, 1), (1, 71, 1), (2, 67, 1)],    # G7     D5 B4 G4 → 다시 C로
]
THEME_PROG = AWAKE_PROG  # 마을 곡과 같은 16마디 코드 (C장조)


def theme(bars=16, beats_per_bar=3, start_bar=0):
    """[(절대 박, midi, 길이)]. beats_per_bar=4면 3/4 테마를 4/4 마디에 늘여서 얹는다"""
    k = beats_per_bar / 3
    out = []
    for i in range(bars):
        for b, m, d in THEME_BARS[(start_bar + i) % 16]:
            out.append(((i) * beats_per_bar + b * k, m, d * k))
    return out


# ───────────────────────── 악기·도구 ─────────────────────────
def mbox(f, dur, sr, vel=1.0, vib=0.0, ring=2.4):
    """오르골 빗살: gen_audio.musicbox에 떨림(vib)과 감쇠 조절(ring)을 더한 판"""
    t = t_axis(dur + 1.2, sr)
    ff = f * (1 + vib * np.sin(2 * np.pi * 6.0 * t))
    ph = 2 * np.pi * np.cumsum(ff) / sr
    x = np.sin(ph) + 0.35 * np.sin(3.01 * ph) * np.exp(-t * 6) + 0.18 * np.sin(5.43 * ph) * np.exp(-t * 10)
    return x * np.exp(-t * ring) * np.minimum(1, t / 0.0015) * vel


def strings(f, dur, sr, vel=1.0):
    """현악풍 합성: 살짝 어긋난 톱니파 3개 + 느린 어택 + 비브라토"""
    t = t_axis(dur, sr)
    x = np.zeros_like(t)
    for det in (0.996, 1.0, 1.004):
        ff = f * det * (1 + 0.004 * np.sin(2 * np.pi * 5.3 * t + det * 40))
        ph = 2 * np.pi * np.cumsum(ff) / sr
        x += sum(((-1) ** (k + 1)) * np.sin(k * ph) / k for k in range(1, 9))
    x = lp(x, 3200, sr)
    return x * env_adsr(len(t), sr, a=0.09, d=0.1, s=0.8, r=min(0.15, dur * 0.4)) * vel * 0.25


def place_wrap(buf, sig, sec, sr):
    """루프 버퍼에 놓되 끝을 넘친 꼬리는 앞으로 감는다"""
    n = len(buf)
    i = int(sec * sr) % n
    k = min(len(sig), n - i)
    buf[i:i + k] += sig[:k]
    rest = sig[k:]
    while len(rest):
        m = min(len(rest), n)
        buf[:m] += rest[:m]
        rest = rest[m:]
    return buf


def squeal(dur, sr, f=2600, vel=1.0, seed=0):
    """금속 끼이익: 떨리며 미끄러지는 고음 + 마찰 잡음"""
    r = np.random.default_rng(seed)
    t = t_axis(dur, sr)
    ff = f * (1 + 0.04 * np.sin(2 * np.pi * r.uniform(7, 11) * t) + 0.06 * t / dur)
    ph = 2 * np.pi * np.cumsum(ff) / sr
    x = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * bp(noise(len(t)), f * 0.7, f * 1.6, sr)
    return x * np.sin(np.pi * t / dur) ** 0.6 * vel


def waltz_comp(tr, sr, bars, bpb=3, inst="mbox", tight=1.0, vel=1.0, start_bar=0):
    """왈츠 반주: 1박 저음, 2·3박 화음"""
    for bar in range(bars):
        ch = THEME_PROG[(start_bar + bar) % 16]
        b0 = bar * bpb
        root = 48 + CHORDS[ch][0] % 12
        top = chord_tones(ch, 60)
        if inst == "mbox":
            tr.add(b0, mbox(hz(root) * tight, 0.4, sr, 0.35 * vel, ring=4))
            for b in (1, 2):
                for m in top:
                    tr.add(b0 + b, mbox(hz(m + 12) * tight, 0.2, sr, 0.09 * vel, ring=6))
        else:
            tr.add(b0, piano(hz(root - 12), 0.5, sr, 0.3 * vel, 0.6))
            for b in (1, 2):
                for m in top:
                    tr.add(b0 + b, piano(hz(m), 0.25, sr, 0.1 * vel, 0.7))


# ───────────────────────── 6막 ─────────────────────────
def bgm_flashback_duet():
    """6막 회상(세피아): 축음기 지글 + 피아노(그라모) + 오르골(멜로디) 듀엣. 왈츠 96BPM 16마디.
    앞 8마디는 오르골이 테마, 피아노가 받쳐 줌 / 뒤 8마디는 피아노가 테마 변주, 오르골이 위에서 펼친 화음"""
    sr = BSR
    tr = Track(96, 48, sr)
    waltz_comp(tr, sr, 16, inst="piano", vel=0.9)
    for b, m, d in theme():
        if b < 24:
            tr.add(b, mbox(hz(m + 12), d * tr.beat, sr, 0.42, ring=1.8))
        else:
            tr.add(b, piano(hz(m), d * tr.beat, sr, 0.4, 1.0))
    for bar in range(8, 16):
        top = chord_tones(THEME_PROG[bar], 84)
        for k, m in enumerate(top[:3]):
            tr.add(bar * 3 + k, mbox(hz(m), 0.3, sr, 0.1))
    return tr.render_loop(rev_mix=0.28, lofi=2700, crackle=0.035)


def bgm_parcel():
    """6막 소포·풀기 연습: 마을 곡을 조용하게(110BPM, 피아노·클라리넷 작게). 6·14마디 끝에 오르골 비명이 섞임"""
    sr = BSR
    tr = Track(110, 64, sr, swing=0.25)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, piano(hz(root), 0.6, sr, 0.22, 0.5))
        tr.add(b0 + 2, piano(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.6, sr, 0.18, 0.5))
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.2, sr, 0.08, 0.6))
            tr.add(b0 + b, brush(0.1, sr), 0.08)
    for b, m, d in awake_melody():
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.92, sr, vib=4.8), 0.16)
    for bar in (5, 13):  # 오르골 비명: 빨라지는 높은 빗살 + 끼이익
        st = bar * 4 + 2
        tpos = 0.0
        k = 0
        while tpos < 2.0:
            m = [88, 91, 86, 93, 89, 95][k % 6]
            tr.add(st + tpos, mbox(hz(m) * TIGHT * (1 + 0.004 * k), 0.08, sr, 0.12, ring=8))
            tpos += max(0.06, 0.25 * 0.85 ** k)
            k += 1
        tr.add(st + 0.6, squeal(0.9, sr, 2400, 0.05, seed=bar))
    return tr.render_loop(rev_mix=0.2, lofi=3600, crackle=0.010)


def jingle_unwind_done():
    """풀기 성공: 내려가는 오르골 아르페지오가 느려지며 부드럽게 멈춤 (2초)"""
    sr = SR
    buf = np.zeros(int(2.0 * sr))
    tpos, gap = 0.0, 0.09
    for m in [96, 91, 88, 84, 79, 76, 72]:
        place(buf, mbox(hz(m), 0.3, sr, 0.45, ring=2.2 if m > 72 else 1.2), tpos, sr)
        tpos += gap
        gap *= 1.25
    place(buf, piano(hz(48), 1.0, sr, 0.15, 0.5), tpos - gap / 1.25, sr)
    return jingle_mix(buf, sr, rev=0.3, lofi=7000, fo=0.5, peak=0.8)


def sfx_parcel_shake():
    """소포가 덜덜 떨리는 동안(루프 1초): 종이 상자 덜그럭 + 안에서 끼익"""
    r = np.random.default_rng(61)
    n = SR
    x = np.zeros(n)
    for k in range(10):
        m = int(0.03 * SR)
        hit = bp(noise(m), 250, 2200, SR) * np.exp(-np.arange(m) / SR * 90) * r.uniform(0.5, 1)
        hit[: int(0.02 * SR)] += woodblock(SR, r.uniform(180, 260), 0.3, 0.02)
        place_wrap(x, hit, k / 10 + r.uniform(-0.01, 0.01), SR)
    sq_ = squeal(0.35, SR, 2900, 0.12, seed=3)
    place_wrap(x, sq_, 0.55, SR)
    return norm(x, 0.6)


def sfx_parcel_open():
    """소포 뜯기: 끈 '툭' + 종이 찢김 (1.1초)"""
    x = np.zeros(int(1.1 * SR))
    t = t_axis(0.2, SR)
    place(x, np.sin(2 * np.pi * np.cumsum(180 + 300 * np.exp(-t * 40)) / SR) * np.exp(-t * 20), 0, SR, 0.6)
    place(x, tick(SR, 0.5, 1800), 0, SR)
    rip = paper(0.7, seed=8)
    rip *= np.linspace(0.6, 1.0, len(rip))
    place(x, lp(rip, 7000, SR), 0.22, SR, 1.0)
    return fade(norm(x, 0.7), SR, 0.001, 0.08)


def amb_orgel_scream():
    """너무 감긴 오르골 근처(루프 2초): 2초마다 점점 빨라지는 높은 빗살 + 금속 끼이익. 귀를 막을 만큼, 아프지 않게"""
    n = 2 * SR
    x = np.zeros(n)
    pat = [84, 88, 91, 96, 93, 89, 86, 91]
    tpos, k = 0.0, 0
    while tpos < 2.0:
        f = hz(pat[k % 8] + (k // 8)) * TIGHT
        place_wrap(x, mbox(f, 0.06, SR, 0.4, ring=9)[: int(0.5 * SR)], tpos, SR)
        tpos += 0.16 * (1 - 0.72 * tpos / 2.0)
        k += 1
    for st, f, sd in ((0.2, 2700, 1), (1.1, 3100, 2)):
        place_wrap(x, squeal(0.8, SR, f, 0.35, seed=sd), st, SR)
    x = loop_filter(x, SR, 6500)
    return norm(x, 0.6)


def sfx_unwind_tick():
    """풀기 진행: 감기 래칫의 역방향, 낮고 부드러운 '톡' (게임이 진행에 따라 피치를 내림)"""
    x = np.zeros(int(0.16 * SR))
    place(x, woodblock(SR, 420, 0.8, 0.12), 0, SR)
    place(x, lp(kick(SR, 0.25), 400, SR)[: int(0.1 * SR)], 0, SR)
    return fade(norm(lp(x, 2500, SR), 0.5), SR, 0.001, 0.03)


def sfx_unwind_good():
    """풀기 속도가 초록 띠 안(루프 2초): 은은한 오르골 지속음. C장조 화음, 모두 2초에 정수 주기"""
    n = 2 * SR
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f, a, trem in ((523.25, 1.0, 1), (783.99, 0.6, 2), (1318.5, 0.35, 3)):
        x += loop_tone(n, SR, f, ((1, 1), (3.0, 0.08))) * a * (0.75 + 0.25 * np.sin(2 * np.pi * trem * t / 2 + f))
    for k, m in enumerate([84, 88, 91, 88]):  # 0.5초마다 아주 작은 빗살
        place_wrap(x, mbox(hz(m), 0.2, SR, 0.25, ring=3)[: int(1.5 * SR)], k * 0.5, SR)
    return norm(x, 0.4)


def sfx_unwind_snap():
    """너무 빨리 풀어 튕김: 스프링 '팅!' + 금속 진동 (0.9초)"""
    x = np.zeros(int(0.9 * SR))
    place(x, metal(2600, 0.6, SR, 1.0, 9), 0, SR)
    t = t_axis(0.7, SR)
    f = 420 * (1 + 0.25 * np.sin(2 * np.pi * 26 * t) * np.exp(-t * 5))
    place(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.5, 0.01, SR)
    place(x, tick(SR, 0.7, 4200), 0, SR)
    return fade(norm(x, 0.8), SR, 0.001, 0.1)


def sfx_unwind_creep():
    """너무 느려 다시 감김: '끼… 끼…' 조여지는 소리 (1.0초)"""
    x = np.zeros(int(1.0 * SR))
    for i, st in enumerate((0, 0.5)):
        place(x, creak(0.3, SR, 20 + i * 10, 45 + i * 10, seed=30 + i), st, SR, 0.7)
        place(x, squeal(0.3, SR, 1500 + i * 250, 0.12, seed=40 + i), st, SR)
    return fade(norm(x, 0.6), SR, 0.002, 0.06)


def sfx_orgel_voice():
    """6막 숨은 목소리: 멜로디 테마 첫 4음(G5 E5 A5 G5)을 아주 느리게, 떨리는 오르골로 (6.5초, 말소리 합성 없음)"""
    sr = SR
    buf = np.zeros(int(6.5 * sr))
    for st, m in zip((0.0, 1.35, 2.85, 4.5), (79, 76, 81, 79)):
        place(buf, mbox(hz(m), 1.5, sr, 0.5, vib=0.006, ring=1.1), st, sr)
        place(buf, mbox(hz(m - 12), 1.5, sr, 0.12, vib=0.006, ring=1.4), st + 0.01, sr)
    buf += film_noise(len(buf), sr) * 0.012
    return jingle_mix(buf, sr, rev=0.35, lofi=6000, fo=0.8, peak=0.75)


# ───────────────────────── 7막 구간 ─────────────────────────
def bgm_orgel_town():
    """7막 구간1 오르골 거리: 쉬지 않는 오르골 왈츠 168BPM 32마디. 음정이 18센트 뜨고, 8분음 펼친 화음이 한 번도 쉬지 않음"""
    sr = BSR
    tr = Track(168, 96, sr)
    for rep in (0, 48):
        for bar in range(16):
            ch = THEME_PROG[bar]
            b0 = rep + bar * 3
            root = 48 + CHORDS[ch][0] % 12
            tr.add(b0, mbox(hz(root) * TIGHT, 0.3, sr, 0.35, ring=4))
            tones = chord_tones(ch, 72)
            for k in range(6):
                tr.add(b0 + k * 0.5, mbox(hz(tones[k % len(tones)]) * TIGHT, 0.1, sr, 0.1, ring=7))
        for b, m, d in theme():
            tr.add(rep + b, mbox(hz(m + 12 * (rep > 0)) * TIGHT, d * tr.beat, sr, 0.38, ring=3))
    return tr.render_loop(rev_mix=0.1, lofi=7500, crackle=0.004)


def bgm_ballroom():
    """7막 구간2 무도회장: 같은 왈츠 168BPM 32마디를 현악풍으로 + 빗살 원통 '틱'이 정확히 2박마다 (원통 박자 = 60/168×2 = 0.714초)"""
    sr = BSR
    tr = Track(168, 96, sr)
    for rep in (0, 48):
        for bar in range(16):
            ch = THEME_PROG[bar]
            b0 = rep + bar * 3
            root = 36 + CHORDS[ch][0] % 12
            tr.add(b0, piano(hz(root), 0.3, sr, 0.3, 0.5))
            tr.add(b0, strings(hz(root + 12), 3 * tr.beat, sr, 0.5))
            for b in (1, 2):
                for m in chord_tones(ch, 60):
                    tr.add(b0 + b, strings(hz(m), 0.8 * tr.beat, sr, 0.22))
        for b, m, d in theme():
            tr.add(rep + b, strings(hz(m + (12 if rep else 0)) * TIGHT, d * tr.beat, sr, 0.7))
    for b in range(0, 96, 2):  # 빗살 원통 틱
        tr.add(b, mbox(hz(96), 0.04, sr, 0.25, ring=14)[: int(0.25 * sr)])
        tr.add(b, metal(5200, 0.02, sr, 0.12, 220))
    return tr.render_loop(rev_mix=0.16, lofi=6500, crackle=0.004, wow=False)


def sfx_dance_lock():
    """춤 상태 깡충: 고무 '보잉' 짧게 (0.25초. 음정 랜덤은 게임에서 rate로)"""
    t = t_axis(0.25, SR)
    f = 300 * (1 + 0.8 * (1 - np.exp(-t * 30))) * (1 + 0.15 * np.sin(2 * np.pi * 28 * t) * np.exp(-t * 10))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.exp(-t * 12) * np.minimum(1, t / 0.003)
    return fade(norm(x, 0.55), SR, 0.001, 0.03)


def sfx_dancer_rest():
    """주민이 풀려 털썩 앉음: 털썩 + 긴 한숨 같은 하강 글리산도 (목소리 아님, 1.8초)"""
    x = np.zeros(int(1.8 * SR))
    place(x, lp(kick(SR, 0.9), 300, SR), 0, SR)
    place(x, woodblock(SR, 200, 0.4, 0.1), 0, SR)
    place(x, lp(noise(int(0.15 * SR)), 1200, SR) * np.exp(-np.arange(int(0.15 * SR)) / SR * 25), 0, SR, 0.4)
    t = t_axis(1.4, SR)
    f = 620 * 0.4 ** (t / 1.4)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sigh = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.sin(np.pi * t / 1.4) ** 0.8 * 0.35
    sigh += lp(noise(len(t)), 1500, SR) * np.sin(np.pi * t / 1.4) * 0.05
    place(x, sigh, 0.2, SR)
    return fade(norm(reverb(x, SR, mix=0.15, dur=0.6)[: len(x)], 0.65), SR, 0.002, 0.1)


def sfx_speaker_off():
    """스피커 상자를 풀어 끔: 왈츠 한 소절이 테이프처럼 늘어지며 꺼짐 (1.8초)"""
    src_ = np.zeros(int(1.6 * SR))
    beat = 60 / 168
    for k, m in enumerate([79, 84, 88, 91, 88, 84, 79, 84, 88]):
        place(src_, mbox(hz(m) * TIGHT, 0.1, SR, 0.4, ring=5)[: int(0.6 * SR)], k * beat / 2, SR)
        if k % 3 == 0:
            place(src_, mbox(hz(48), 0.3, SR, 0.4, ring=4)[: int(0.6 * SR)], k * beat / 2, SR)
    n = int(1.8 * SR)
    rate = np.clip(1 - np.arange(n) / n * 1.15, 0, 1) ** 1.3  # 재생 속도가 1 → 0
    pos = np.cumsum(rate)
    x = np.interp(pos, np.arange(len(src_)), src_, right=0)
    x *= np.clip(rate * 3, 0, 1)
    return fade(norm(lp(x, 5000, SR), 0.65), SR, 0.001, 0.05)


def sfx_comb_pluck():
    """빗살이 튀어나옴: 맑은 '팅' C6 한 음 (게임이 rate로 여러 음정)"""
    x = mbox(hz(84), 0.2, SR, 1, ring=4)[: int(0.7 * SR)]
    x[: int(0.003 * SR)] += tick(SR, 0.3, 5000)[: int(0.003 * SR)]
    return fade(norm(x, 0.55), SR, 0.001, 0.15)


# ───────────────────────── 보스 · 결말 ─────────────────────────
def bgm_melody_boss():
    """보스 1~2라운드: 멜로디 테마를 빠르고 날카롭게 176BPM 3/4 32마디. 오르골 + 튜바 저음, 8마디 끝마다 끼이익"""
    sr = BSR
    tr = Track(176, 96, sr)
    for rep in (0, 48):
        for bar in range(16):
            ch = THEME_PROG[bar]
            b0 = rep + bar * 3
            root = 36 + CHORDS[ch][0] % 12
            tr.add(b0, tuba(hz(root), 0.3, sr), 0.6)
            tr.add(b0, kick(sr), 0.35)
            for b in (1, 2):
                for m in chord_tones(ch, 72):
                    tr.add(b0 + b, mbox(hz(m) * TIGHT, 0.08, sr, 0.08, ring=9))
                tr.add(b0 + b, metal(5000, 0.02, sr, 0.08, 220))
            if bar % 8 == 7:
                tr.add(b0 + 2, squeal(0.4, sr, 2800, 0.12, seed=bar + rep))
        for b, m, d in theme():
            tr.add(rep + b, mbox(hz(m + 12) * TIGHT, d * tr.beat, sr, 0.36, ring=4))
            tr.add(rep + b, saw(hz(m) * TIGHT, d * tr.beat * 0.7, sr, 0.05 + 0.03 * (rep > 0), r=0.01))
    return tr.render_loop(rev_mix=0.08, lofi=8000, crackle=0.003, wow=False)


def bgm_melody_final():
    """최종 라운드(라디오 씨의 느린 방송): 84BPM 4/4 16마디. 그라모의 마을 곡(피아노) 위에
    멜로디 테마(오르골)를 4/4로 늘여 한 옥타브 위에 천천히 얹음. 코드가 마디마다 같아 두 선율이 어울림"""
    sr = BSR
    tr = Track(84, 64, sr, swing=0.2)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, piano(hz(root), 0.8, sr, 0.28, 0.5))
        tr.add(b0 + 2, piano(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.8, sr, 0.22, 0.5))
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.35, sr, 0.1, 0.6))
        tr.add(b0, tuba(hz(root - 12 + 12), 0.8, sr), 0.18)
    for b, m, d in awake_melody():
        tr.add(b, piano(hz(m), d * tr.beat, sr, 0.3, 0.9))
    for b, m, d in theme(16, 4):
        tr.add(b, mbox(hz(m + 12), d * tr.beat, sr, 0.33, ring=1.6))
    return tr.render_loop(rev_mix=0.26, lofi=4200, crackle=0.010)


def jingle_memory():
    """보스전 기억 컷: 세피아 지글 + 멜로디 테마 2마디 (3초)"""
    sr = SR
    buf = np.zeros(int(3.0 * sr))
    beat = 60 / 120
    for b, m, d in theme(2):
        place(buf, mbox(hz(m + 12), d * beat, sr, 0.45, ring=2), b * beat, sr)
    for bar, ch in enumerate(THEME_PROG[:2]):
        place(buf, piano(hz(48 + CHORDS[ch][0] % 12 - 12), 0.8, sr, 0.25, 0.5), bar * 3 * beat, sr)
        for b in (1, 2):
            for m in chord_tones(ch, 60):
                place(buf, piano(hz(m), 0.3, sr, 0.08, 0.6), (bar * 3 + b) * beat, sr)
    place(buf, mbox(hz(84), 0.6, sr, 0.3, ring=1.5), 6 * beat, sr)
    buf = lp(buf, 3000, sr) + film_noise(len(buf), sr) * 0.03
    return jingle_mix(buf, sr, rev=0.25, lofi=3000, fo=0.5)


def jingle_melody_rest():
    """멜로디가 처음으로 멈춤 (6초): 테마 두 마디가 태엽이 풀리듯 점점 느려지고 처지며, 마지막 C5가 길게"""
    sr = SR
    buf = np.zeros(int(6.0 * sr))
    notes = [79, 76, 81, 79, 76]
    tpos, gap = 0.0, 0.4
    for i, m in enumerate(notes):
        sag = 1 - 0.004 * i  # 음정이 살짝 처짐
        place(buf, mbox(hz(m) * sag, 0.4, sr, 0.42, ring=1.6), tpos, sr)
        tpos += gap
        gap *= 1.32
    f = hz(72) * 0.985
    t = t_axis(6.0 - tpos, sr)
    last = mbox(f, len(t) / sr, sr, 0.5, ring=0.9)[: len(t)]
    last += np.sin(2 * np.pi * f * t) * np.exp(-t * 0.7) * 0.18 * np.minimum(1, t / 0.01)
    place(buf, last, tpos, sr)
    place(buf, piano(hz(48), 2.0, sr, 0.15, 0.4), tpos, sr)
    return jingle_mix(buf, sr, rev=0.35, lofi=6000, fo=1.0, peak=0.8)


def bgm_duet_ending():
    """7막 결말·이후 마을: 그라모(피아노) + 멜로디(오르골) + 라디오 씨(나팔)가 마을 곡을 셋이서. 120BPM 스윙 16마디.
    1~4마디 피아노, 5~8 오르골, 9~12 나팔, 13~16 셋이 옥타브로 함께. 다른 둘은 아래·위에서 받쳐 줌"""
    sr = BSR
    tr = Track(120, 64, sr, swing=0.3)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, tuba(hz(root), 0.4, sr), 0.4)
        tr.add(b0 + 2, tuba(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.4, sr), 0.35)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.16, sr, 0.13, 0.8))
            tr.add(b0 + b, brush(0.1, sr), 0.18)
        top = chord_tones(ch, 84)
        if bar < 12:
            tr.add(b0 + 1.5, mbox(hz(top[-1]), 0.2, sr, 0.06))
    for b, m, d in awake_melody():
        sec = int(b // 16)
        if sec in (0, 3):
            tr.add(b, piano(hz(m), d * tr.beat, sr, 0.38, 1.0))
        if sec in (1, 3):
            tr.add(b, mbox(hz(m + 12), d * tr.beat, sr, 0.3 if sec == 1 else 0.2, ring=2.2))
        if sec in (2, 3):
            tr.add(b, horn(hz(m), d * tr.beat * 0.92, sr), 0.38 if sec == 2 else 0.25)
        if sec == 2 and d >= 1:
            tr.add(b, piano(hz(m + 12), 0.2, sr, 0.12))
    return tr.render_loop(rev_mix=0.17, lofi=4800, crackle=0.008)


def sfx_music_wave():
    """과감기 선율 파동: 오르골 화음이 '와앙' 퍼짐 (1.5초)"""
    n = int(1.5 * SR)
    x = np.zeros(n)
    for i, m in enumerate([72, 76, 79, 84, 88]):
        place(x, mbox(hz(m) * TIGHT, 0.5, SR, 0.4, vib=0.004, ring=1.8)[: n], i * 0.012, SR)
    t = np.arange(n) / SR
    swell = np.clip(t / 0.25, 0, 1) * np.exp(-np.maximum(0, t - 0.25) * 2.5)
    x = x * (0.5 + 0.5 * swell * (1 + 0.3 * np.sin(2 * np.pi * 7 * t)))
    x += bp(noise(n), 800, 4000, SR) * swell * 0.1
    return fade(norm(reverb(x, SR, mix=0.3)[:n], 0.75), SR, 0.002, 0.25)


def sfx_note_tornado():
    """음표 회오리가 화면에 있는 동안(루프 2초): 빠르게 도는 오르골 트릴 + 바람 (모두 2초 주기)"""
    n = 2 * SR
    t = np.arange(n) / SR
    x = np.zeros(n)
    pat = [84, 88, 91, 96, 91, 88]
    for k in range(32):  # 16음/초
        place_wrap(x, mbox(hz(pat[k % 6]) * TIGHT, 0.04, SR, 0.25, ring=10)[: int(0.4 * SR)], k / 16, SR)
    wind = loop_filter(loop_filter(noise(n), SR, 2500), SR, 400, "hp")
    wind *= 0.7 + 0.3 * np.sin(2 * np.pi * 4 * t / 2)  # 2초에 4번 휘돌기
    x += wind * 0.35
    return norm(x, 0.55)


def sfx_comb_warn():
    """빗살 비 그림자 예고: 높은 '쉬익' (0.5초)"""
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    x = bp(noise(n), 5000, 12000, SR) * (t / 0.5) ** 1.5 * np.clip((0.5 - t) / 0.05, 0, 1)
    x += sweep(3000, 5200, 0.5, SR) * (t / 0.5) ** 2 * 0.08
    return fade(norm(x, 0.5), SR, 0.002, 0.02)


def sfx_comb_fall():
    """빗살이 바닥에 꽂힘: '짱!' 금속 (0.8초)"""
    x = np.zeros(int(0.8 * SR))
    place(x, metal(1850, 0.7, SR, 1.0, 7), 0, SR)
    place(x, metal(3300, 0.3, SR, 0.4, 20), 0, SR)
    place(x, lp(kick(SR, 0.6), 300, SR), 0, SR)
    place(x, tick(SR, 0.8, 6000), 0, SR)
    return fade(norm(x, 0.85), SR, 0.001, 0.12)


def sfx_melody_creak():
    """멜로디가 너무 감겨 굳음: 큰 삐걱 + 스프링이 늘어나는 긴장음 (1.6초)"""
    x = np.zeros(int(1.6 * SR))
    place(x, creak(0.9, SR, 18, 40, seed=51), 0, SR, 1.0)
    place(x, metal(600, 0.4, SR, 0.5, 15), 0, SR)
    t = t_axis(1.4, SR)
    f = 180 * 1.6 ** (t / 1.4) * (1 + 0.01 * np.sin(2 * np.pi * 11 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    ten = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.clip(t / 0.3, 0, 1) * np.clip((1.4 - t) / 0.2, 0, 1)
    place(x, lp(ten, 2000, SR) * 0.3, 0.15, SR)
    place(x, squeal(0.6, SR, 2200, 0.15, seed=52), 0.5, SR)
    return fade(norm(x, 0.8), SR, 0.002, 0.08)


def sfx_melody_spin():
    """회전 발레 시작: 휘이잉 + 오르골 상승 (1.3초)"""
    x = np.zeros(int(1.3 * SR))
    place(x, GA.whoosh(1.0, up=True), 0, SR, 0.6)
    for i, m in enumerate([72, 76, 79, 84, 88, 91, 96]):
        place(x, mbox(hz(m) * TIGHT, 0.1, SR, 0.4, ring=5)[: int(0.5 * SR)], 0.1 + i * 0.09, SR)
    return fade(norm(reverb(x, SR, mix=0.18)[: len(x)], 0.7), SR, 0.002, 0.15)


def sfx_memory_flash():
    """기억 컷 번쩍: 필름 영사기 '철컥' + 반짝 (1.1초)"""
    x = np.zeros(int(1.1 * SR))
    for d in (0, 0.045, 0.09):
        place(x, metal(1400, 0.05, SR, 0.6, 90), d, SR)
        place(x, woodblock(SR, 600, 0.3, 0.04), d, SR)
    place(x, GA.sparkle(0.8, 6, 2400, seed=71), 0.12, SR, 0.5)
    x[: int(0.5 * SR)] += film_noise(int(0.5 * SR), SR) * 0.05
    return fade(norm(reverb(x, SR, mix=0.15)[: len(x)], 0.7), SR, 0.001, 0.2)


# ───────────────────────── 실행 ─────────────────────────
GROUPS = {
    "act6": ({"bgm_flashback_duet": bgm_flashback_duet, "bgm_parcel": bgm_parcel,
              "jingle_unwind_done": jingle_unwind_done},
             {"sfx_parcel_shake": sfx_parcel_shake, "sfx_parcel_open": sfx_parcel_open,
              "amb_orgel_scream": amb_orgel_scream, "sfx_unwind_tick": sfx_unwind_tick,
              "sfx_unwind_good": sfx_unwind_good, "sfx_unwind_snap": sfx_unwind_snap,
              "sfx_unwind_creep": sfx_unwind_creep, "sfx_orgel_voice": sfx_orgel_voice}),
    "act7": ({"bgm_orgel_town": bgm_orgel_town, "bgm_ballroom": bgm_ballroom},
             {"sfx_dance_lock": sfx_dance_lock, "sfx_dancer_rest": sfx_dancer_rest,
              "sfx_speaker_off": sfx_speaker_off, "sfx_comb_pluck": sfx_comb_pluck}),
    "boss": ({"bgm_melody_boss": bgm_melody_boss, "bgm_melody_final": bgm_melody_final,
              "bgm_duet_ending": bgm_duet_ending, "jingle_memory": jingle_memory,
              "jingle_melody_rest": jingle_melody_rest},
             {"sfx_music_wave": sfx_music_wave, "sfx_note_tornado": sfx_note_tornado,
              "sfx_comb_warn": sfx_comb_warn, "sfx_comb_fall": sfx_comb_fall,
              "sfx_melody_creak": sfx_melody_creak, "sfx_melody_spin": sfx_melody_spin,
              "sfx_memory_flash": sfx_memory_flash}),
}


def run(flt=""):
    for grp, (bgm, sfx) in GROUPS.items():
        pick = (lambda name: True) if (not flt or flt == grp) else (lambda name: flt in name)
        print(f"[{grp}]")
        for name, fn in bgm.items():
            if pick(name):
                save(name, fn(), SR if name.startswith("jingle") else BSR, "bgm")  # 징글은 기존처럼 44100Hz
        for name, fn in sfx.items():
            if pick(name):
                save(name, fn(), SR, "sfx")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "")

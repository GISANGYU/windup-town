"""태엽 마을 — 제3~5막 소리 생성기 (jobs/AUDIO.md 기준, numpy + scipy 절차 합성)

실행:  python tools/gen_audio_act3_5.py            # 전체
       python tools/gen_audio_act3_5.py act3       # 막 단위 (act3 | act4 | act5)
       python tools/gen_audio_act3_5.py sfx_swap   # 이름 일부

기존 tools/gen_audio.py의 악기·도구 함수를 가져다 쓴다. 기존 곡은 바꾸지 않는다.
소리 방향: 태엽 쪽 = 스윙·잔향·필름 잡음 / 건전지 쪽 = 정확한 박자·건조함·전자음
"""
import sys
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_audio as GA  # noqa: E402
from gen_audio import (CHORDS, SR, Track, bell_hit, banjo, bp, brush, chord_tones, clarinet, env_adsr,  # noqa: E402
                       fade, film_noise, hp, hz, kick, lp, melody_line, midi, musicbox, noise, norm, piano,
                       porcelain, reverb, reverb_ir, save, t_axis, tick, tuba, woodblock)

BSR = 22050  # BGM 샘플레이트
CHORDS.update({"B7": [11, 15, 18, 21], "Bb7": [10, 14, 17, 20], "C9": [0, 4, 7, 10, 14], "Cm": [0, 3, 7],
               "F7": [5, 9, 12, 15], "Gsus": [7, 12, 14], "Em7": [4, 7, 11, 14], "Bbmaj7": [10, 14, 17, 21]})


# ───────────────────────── 공용 도구 ─────────────────────────
def place(buf, sig, sec, sr, gain=1.0):
    i = int(sec * sr)
    if i >= len(buf): return buf
    k = min(len(sig), len(buf) - i)
    buf[i:i + k] += sig[:k] * gain
    return buf


def sq(f, dur, sr, vel=1.0, a=0.003, r=0.02, s=0.85):
    """대역 제한 사각파 (건전지 쪽 리드)"""
    t = t_axis(dur, sr)
    x = np.zeros_like(t)
    k = 1
    while k * f < sr * 0.4:
        x += np.sin(2 * np.pi * f * k * t) / k
        k += 2
    return x * 0.8 * env_adsr(len(t), sr, a=a, d=0.02, s=s, r=r) * vel


def sine(f, dur, sr, vel=1.0, a=0.003, r=0.03):
    t = t_axis(dur, sr)
    return np.sin(2 * np.pi * f * t) * env_adsr(len(t), sr, a=a, d=0.01, s=1, r=r) * vel


def sweep(f0, f1, dur, sr, curve="exp", harm=(1,)):
    t = t_axis(dur, sr)
    p = t / dur
    f = f0 * (f1 / f0) ** p if curve == "exp" else f0 + (f1 - f0) * p
    ph = 2 * np.pi * np.cumsum(f) / sr
    return sum(np.sin(k * ph) / k for k in harm)


def mains_hum(n, sr, f=60.0):
    """일정한 전기 험. n/sr 초 안에 정수 주기면 끊김 없이 반복"""
    t = np.arange(n) / sr
    return np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)


def static(n, sr, rate=90, lo=900, hi=6500):
    """라디오 지지직: 대역 잡음 × 빠르게 바뀌는 무작위 세기"""
    seg = max(1, int(sr / rate))
    steps = GA.rng.uniform(0, 1, n // seg + 2) ** 2
    gate = np.repeat(steps, seg)[:n]
    gate = lp(gate, rate * 1.5, sr, 1)
    x = bp(noise(n), lo, hi, sr) * gate
    pops = np.zeros(n)
    for i in GA.rng.integers(0, n, size=max(1, int(n / sr * 25))):
        pops[i] = GA.rng.uniform(-1, 1) * 3
    return x + lp(pops, 5000, sr)


def loop_filter(x, sr, f, kind="lp"):
    """3번 이어 붙여 거른 뒤 가운데만: 반복 이음새가 매끄러움"""
    n = len(x)
    fn = lp if kind == "lp" else hp
    return fn(np.tile(x, 3), f, sr)[n:2 * n]


def metal(f, dur, sr, vel=1.0, decay=60):
    """마른 금속 '탁' (비조화 배음, 잡음 없음 → 매번 같은 소리)"""
    t = t_axis(dur, sr)
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * decay * (1 + k * 0.4)) for k, a in
               [(1, 1), (2.41, .6), (3.87, .4), (5.93, .25)]) * vel


def clap(sr, vel=1.0):
    x = np.zeros(int(0.15 * sr))
    for d in (0, 0.008, 0.017):
        n = int(0.12 * sr)
        place(x, bp(noise(n), 900, 5000, sr) * np.exp(-np.arange(n) / sr * 45), d, sr)
    return x * vel


def creak(dur, sr, rate0=35, rate1=60, seed=0):
    """나무 삐걱: 막대가 미끄러지며 걸리는 펄스열"""
    r = np.random.default_rng(seed)
    n = int(dur * sr)
    x = np.zeros(n)
    tpos = 0.0
    while tpos < dur:
        p = tpos / dur
        i = int(tpos * sr)
        x[i] = r.uniform(0.6, 1)
        tpos += 1 / (rate0 + (rate1 - rate0) * p) * r.uniform(0.85, 1.15)
    return bp(fftconvolve(x, np.exp(-np.arange(int(0.004 * sr)) / sr * 900))[:n], 350, 2400, sr)


def render_dry(tr, lofi=9000, rev=0.03):
    """건전지 쪽 BGM: 잔향 거의 없음, 흔들림·필름 잡음 없음"""
    return tr.render_loop(rev_mix=rev, lofi=lofi, crackle=0.0, wow=False)


def render_stems(tracks, sr, rev_mix=0.14, lofi=4200, crackle=0.010, crackle_on=0, peak=0.8):
    """여러 스템을 같은 잔향 IR·같은 흔들림·같은 필터로 처리하고, 합친 소리 기준으로 한 번에 크기를 맞춘다"""
    n = tracks[0].len
    ir = reverb_ir(sr, dur=1.0)
    cyc = max(1, round(n / sr / 1.6))
    idx = np.arange(n) + 0.0009 * sr * np.sin(2 * np.pi * cyc * np.arange(n) / n)
    outs = []
    for tr in tracks:
        wet = fftconvolve(tr.buf, ir)[: len(tr.buf) + len(ir)]
        x = np.pad(tr.buf, (0, len(wet) - len(tr.buf))) * (1 - rev_mix) + wet * rev_mix
        body = x[:n].copy()
        tail = x[n:]
        while len(tail):  # 꼬리를 앞으로 접기
            k = min(n, len(tail))
            body[:k] += tail[:k]
            tail = tail[k:]
        body = np.interp(idx, np.arange(n), body, period=n)
        body = lp(hp(np.tile(body, 3), 90, sr), lofi, sr)[n:2 * n]
        outs.append(body)
    g = peak / (np.max(np.abs(sum(outs))) + 1e-9)
    outs = [o * g for o in outs]
    if crackle:
        outs[crackle_on] = outs[crackle_on] + film_noise(n, sr) * crackle
    return outs


def jingle_mix(buf, sr, rev=0.2, lofi=5000, fo=0.4, peak=0.85, dry=False):
    if not dry:
        buf = reverb(buf, sr, mix=rev)[: len(buf)]
    buf = lp(hp(buf, 80, sr), lofi, sr)
    return fade(norm(buf, peak), sr, 0.001, fo)


# ───────────────────────── 2절 · 마을 BGM 스템 ─────────────────────────
AWAKE_PROG = ["C", "A7", "Dm7", "G7", "C", "C7", "F", "Fm", "C", "A7", "D7", "G7", "C", "A7", "Dm7", "G7"]


def awake_melody():
    """gen_audio.bgm_town_awake()와 같은 선율 (seed 7)"""
    ra = [(0, .5), (.5, .5), (1, 1), (2, .5), (2.5, .5), (3, 1)]
    rb = [(0, 1.5), (1.5, .5), (2, .5), (2.5, 1.5)]
    rc = [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, 2)]
    rend = [(0, 1), (1, 1), (2, 2)]
    rh = [ra, rb, ra, rc] * 3 + [ra, rb, rc, rend]
    mel = melody_line(AWAKE_PROG, rh, start=72, seed=7)
    mel[-1] = (mel[-1][0], 72, mel[-1][2])
    return mel


def town_stems():
    """bgm_town_awake 편곡(138BPM, 16마디, 스윙 .33)을 악기별로 나눔
    base = 튜바·킥·피아노 코드·브러시 (그라모) / pip = 클라리넷 멜로디 + 피아노 옥타브 겹침 / lamp = 밴조 + 오르골 대선율"""
    sr = BSR
    base, pip, lamp = (Track(138, 64, sr, swing=0.33) for _ in range(3))
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        fifth = root + 7 if CHORDS[ch][0] < 5 else root - 5
        base.add(b0, tuba(hz(root), 0.4, sr), 0.55)
        base.add(b0 + 2, tuba(hz(fifth), 0.4, sr), 0.5)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                base.add(b0 + b, piano(hz(m), 0.18, sr, 0.2, 0.8))
            base.add(b0 + b, brush(0.12, sr), 0.25)
        for b in (0, 2):
            base.add(b0 + b, kick(sr), 0.3)
        # 가로등: 원곡의 밴조 한 음 + 엇박 밴조 + 깜빡이듯 반짝이는 오르골 대선율
        top = chord_tones(ch, 60)
        lamp.add(b0 + 3.5, banjo(hz(top[-1]), 0.1, sr), 0.12)
        lamp.add(b0 + 1.5, banjo(hz(top[1]), 0.1, sr), 0.09)
        hi = sorted(m for m in chord_tones(ch, 72) + chord_tones(ch, 84) if 79 <= m <= 91)
        lamp.add(b0, musicbox(hz(hi[0]), 0.8, sr, 0.13))
        lamp.add(b0 + 2, musicbox(hz(hi[min(1, len(hi) - 1)]), 0.8, sr, 0.11))
    for b, m, d in awake_melody():
        pip.add(b, clarinet(hz(m), d * pip.beat * 0.95, sr), 0.32)
        if d >= 1:
            pip.add(b, piano(hz(m + 12), 0.15, sr, 0.08))
    outs = render_stems([base, pip, lamp], sr, peak=0.9)  # 합친 크기를 원곡(rms .163)에 맞춤
    return {"bgm_town_awake_base": outs[0], "bgm_town_awake_pip": outs[1], "bgm_town_awake_lamp": outs[2]}


# ───────────────────────── 3막 BGM · 징글 ─────────────────────────
RADIO_MOTIF = [(0, "C5", .5), (.5, "E5", .5), (1, "G5", .5), (1.5, "E5", .5), (2, "A5", 1), (3, "G5", 1),
               (4, "F5", .5), (4.5, "F5", .5), (5, "E5", .5), (5.5, "D5", .5), (6, "G5", 2)]


def bgm_festival():
    """3막 축제 준비: 밝은 폴카 124BPM, F장조 16마디. 튜바 '쿵' + 밴조 엇박 '짝' + 손뼉"""
    sr = BSR
    prog = ["F", "F", "C7", "F", "Bb", "F", "C7", "F", "F", "F7", "Bb", "Bb", "F", "C7", "F", "C7"]
    tr = Track(124, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 41 + (CHORDS[ch][0] - 5) % 12
        for b in (0, 1, 2, 3):
            tr.add(b0 + b, tuba(hz(root if b % 2 == 0 else root + 7 - 12 * (root + 7 > 52)), 0.3, sr), 0.5)
            for m in chord_tones(ch, 60):
                tr.add(b0 + b + 0.5, banjo(hz(m), 0.12, sr), 0.07)
        for b in (1, 3):
            tr.add(b0 + b, clap(sr), 0.35)
        tr.add(b0, kick(sr), 0.25)
    ra = [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, 1), (3, 1)]
    rb = [(0, 1), (1, .5), (1.5, .5), (2, 2)]
    rc = [(0, .25), (.25, .25), (.5, .5), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1)]
    rend = [(0, 1), (1, 1), (2, 2)]
    rh = [ra, rb, rc, rb] * 3 + [ra, rc, rb, rend]
    mel = melody_line(prog, rh, start=72, lo=65, hi=84, seed=33, scale=(0, 2, 4, 5, 7, 9, 10), key=0)
    mel[-1] = (mel[-1][0], 72, mel[-1][2])
    for b, m, d in mel:
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.9, sr), 0.3)
        tr.add(b, piano(hz(m + 12), 0.1, sr, 0.06))
    return tr.render_loop(rev_mix=0.15, lofi=4500, crackle=0.010)


def bgm_radio_theme():
    """라디오 씨 테마: 광고 노래처럼 귀에 붙는 4마디 반복 ×2. 사각파 리드, 정확한 박자, 살짝 지지직"""
    sr = BSR
    prog = ["C", "Am", "F", "G7", "C", "Am", "F", "G7"]
    tr = Track(120, 32, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0] % 12
        for b in range(8):
            tr.add(b0 + b * 0.5, sine(hz(root + (12 if b % 2 else 0)), 0.2, sr, 0.35))
        for b in range(4):
            tr.add(b0 + b, metal(3000, 0.03, sr, 0.15, 120))
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, sq(hz(m), 0.12, sr, 0.04))
    for rep in (0, 16):
        for half in (0, 8):
            for b, n, d in RADIO_MOTIF:
                tr.add(rep + half + b, sq(hz(midi(n)), d * tr.beat * 0.8, sr, 0.16 if half == 0 else 0.13))
    x = render_dry(tr, lofi=7000, rev=0.04)
    x = x + loop_filter(static(len(x), sr, lo=1500, hi=6000), sr, 7000) * 0.03
    return norm(x, 0.8)


def jingle_radio_crank():
    """크랭크 감기 완료 → 태엽 라디오: 라디오 테마를 래그타임 피아노·클라리넷으로 (4초 이내)"""
    sr = SR
    beat = 60 / 150
    buf = np.zeros(int(4.0 * sr))
    sw = lambda b: b + (0.16 if abs(b % 1 - 0.5) < 1e-6 else 0)  # 스윙
    for b, n, d in RADIO_MOTIF[:6]:
        f = hz(midi(n))
        place(buf, clarinet(f, d * beat * 0.95, sr) * 0.5, sw(b) * beat, sr)
        place(buf, piano(f * 2, d * beat, sr, 0.2), sw(b) * beat, sr)
    end = 4 * beat
    place(buf, clarinet(hz(midi("C6")), 1.2, sr) * 0.5, end, sr)
    for b, ch in [(0, "C"), (1, "C"), (2, "F"), (3, "G7")]:
        place(buf, tuba(hz(36 + CHORDS[ch][0]), 0.35, sr), b * beat, sr, 0.5)
        for m in chord_tones(ch, 60):
            place(buf, piano(hz(m), 0.15, sr, 0.15), (b + 0.5) * beat, sr)
    for m in ("C4", "E4", "G4", "C5"):
        place(buf, piano(hz(midi(m)), 1.0, sr, 0.3), end, sr)
    place(buf, tuba(hz(midi("C2")), 0.8, sr), end, sr, 0.4)
    place(buf, brush(0.4, sr), end, sr, 0.25)
    return jingle_mix(buf, sr, fo=0.5)


def jingle_name_given():
    """가로등이 이름을 얻음: 오르골 상승 + 맑은 종 (약 2.6초)"""
    sr = SR
    buf = np.zeros(int(2.6 * sr))
    for i, n in enumerate(["G5", "C6", "E6", "G6"]):
        place(buf, musicbox(hz(midi(n)), 0.4, sr, 0.5), i * 0.16, sr)
    for f in (1046.5, 1568):
        place(buf, bell_hit(sr, f, 1.6, 0.35), 0.7, sr)
    place(buf, musicbox(hz(midi("C7")), 1.0, sr, 0.3), 0.7, sr)
    return jingle_mix(buf, sr, rev=0.3, lofi=7000, fo=0.6)


def jingle_city_signal():
    """3막 끝 · 도시 신호: 마을 곡 한 소절이 잡음에 먹히고, 단조 차임 3음으로 끝 (약 5초)"""
    sr = SR
    beat = 60 / 138
    n_all = int(5.0 * sr)
    town = np.zeros(n_all)
    mel = [(b, m, d) for b, m, d in awake_melody() if b < 4]
    for b, m, d in mel:
        place(town, clarinet(hz(m), d * beat * 0.95, sr) * 0.4, b * beat, sr)
    for b in (1, 3):
        for m in chord_tones("C", 60):
            place(town, piano(hz(m), 0.18, sr, 0.15), b * beat, sr)
    place(town, tuba(hz(36), 0.4, sr), 0, sr, 0.5)
    place(town, tuba(hz(43), 0.4, sr), 2 * beat, sr, 0.5)
    town = lp(reverb(town, sr, mix=0.18)[:n_all], 4500, sr)
    t = np.arange(n_all) / sr
    eat = np.clip((t - 0.6) / 1.6, 0, 1)  # 0.6초부터 2.2초까지 잡음이 덮음
    town *= (1 - eat) * (t < 2.4)
    stat = static(n_all, sr) * np.clip(eat * 1.2, 0, 1) * np.clip((3.0 - t) / 0.6, 0, 1) * 0.5
    chime = np.zeros(n_all)
    for i, n in enumerate(["E5", "C5", "A4"]):  # 단조 차임 — 건조하고 깨끗하게
        f = hz(midi(n))
        tt = t_axis(1.6, sr)
        c = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt * 2.2)
        place(chime, c, 2.6 + i * 0.55, sr, 0.5)
    x = town / (np.max(np.abs(town)) + 1e-9) * 0.7 + stat + chime
    return fade(norm(x, 0.85), sr, 0.001, 0.4)


# ───────────────────────── 3막 SFX ─────────────────────────
def sfx_radio_on():
    """진공관 예열 웅 → 지지직 → 맑아짐 (1.6초)"""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    warm = mains_hum(n, SR, 60) * np.clip(t / 0.5, 0, 1) * 0.35
    tone_f = 300 + 140 * np.clip(t / 0.6, 0, 1)
    tube = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * np.clip(t / 0.6, 0, 1) * (t < 0.7) * 0.25
    stat = static(n, SR) * np.clip((t - 0.4) / 0.1, 0, 1) * np.clip((1.15 - t) / 0.3, 0, 1) * 0.6
    clear = np.zeros(n)
    for f in (523.25, 659.25, 783.99):
        clear += np.sin(2 * np.pi * f * t) * np.clip((t - 0.9) / 0.2, 0, 1) * np.exp(-np.maximum(0, t - 1.1) * 4) * 0.2
    x = warm * np.exp(-np.maximum(0, t - 1.0) * 3) + tube + stat + clear
    return fade(norm(x, 0.75), SR, 0.002, 0.15)


def sfx_radio_off():
    """건전지 닳아 꺼짐: 음이 천천히 내려가며 지지직 끊김 (2초)"""
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    f = 660 * (0.12 + 0.88 * np.exp(-t * 1.4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + 0.3 * np.sign(np.sin(ph))) * 0.35
    gate = np.ones(n)
    r = np.random.default_rng(5)
    tpos = 0.5
    while tpos < 2.0:  # 뒤로 갈수록 자주 끊김
        k = int(r.uniform(0.02, 0.06 + tpos * 0.05) * SR)
        i = int(tpos * SR)
        gate[i:i + k] = 0
        tpos += r.uniform(0.08, 0.25) if tpos < 1.2 else r.uniform(0.05, 0.12)
    gate = lp(gate, 200, SR, 1)
    stat = static(n, SR) * (0.15 + 0.35 * (1 - gate)) * np.clip(t / 0.3, 0, 1)
    env = np.clip((2.0 - t) / 0.6, 0, 1)
    hum = mains_hum(n, SR, 60) * 0.2 * np.exp(-t * 1.2)
    x = (tone * gate + stat + hum) * env
    return fade(norm(lp(x, 5000, SR), 0.75), SR, 0.002, 0.1)


def sfx_radio_static():
    n = int(0.3 * SR)
    x = static(n, SR, rate=120) * np.sin(np.pi * np.arange(n) / n) ** 0.5
    return fade(norm(x, 0.6), SR, 0.003, 0.03)


def amb_radio_static():
    """라디오 씨 근처 잡음 바닥 (2초 반복)"""
    n = 2 * SR
    x = loop_filter(noise(n), SR, 4500)
    x = loop_filter(x, SR, 700, "hp") * 0.5
    t = np.arange(n) / SR
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 3 * t)  # 2초에 정수 주기
    x += mains_hum(n, SR, 60) * 0.05
    return norm(x, 0.4)


def sfx_text_blip_radio():
    return fade(norm(lp(sq(988, 0.04, SR, 1, r=0.008), 6000, SR), 0.45), SR, 0.001, 0.005)


def battery_click():
    x = metal(3200, 0.05, SR, 0.8, 120)
    return place(x, metal(2100, 0.04, SR, 0.6, 140), 0.012, SR)


def sfx_battery_in():
    """건전지 넣기: 금속 딸깍 + 전자음 상승 + 험 시작 (0.9초)"""
    n = int(0.9 * SR)
    x = np.zeros(n)
    place(x, battery_click(), 0, SR)
    s = sweep(220, 880, 0.35, SR, harm=(1, 3)) * np.sin(np.pi * np.linspace(0, 1, int(0.35 * SR))) * 0.45
    place(x, s, 0.06, SR)
    t = np.arange(n) / SR
    x += mains_hum(n, SR) * 0.22 * np.clip((t - 0.3) / 0.2, 0, 1)
    return fade(norm(x, 0.75), SR, 0.001, 0.15)


def sfx_battery_out():
    """건전지 빼기: 딸깍 + 전자음 하강 (0.6초)"""
    n = int(0.6 * SR)
    x = np.zeros(n)
    t = np.arange(n) / SR
    x += mains_hum(n, SR) * 0.2 * np.exp(-t * 12)
    place(x, battery_click(), 0, SR)
    s = sweep(880, 200, 0.35, SR, harm=(1, 3)) * np.sin(np.pi * np.linspace(0, 1, int(0.35 * SR))) * 0.45
    place(x, s, 0.05, SR)
    return fade(norm(x, 0.75), SR, 0.001, 0.08)


def sfx_battery_hum():
    """건전지 상태 반복 험: 60Hz 계열, 아주 일정 (2초 = 120주기)"""
    n = 2 * SR
    x = mains_hum(n, SR, 60) + 0.04 * np.sin(2 * np.pi * 1200 * np.arange(n) / SR)
    return norm(x, 0.45)


def sfx_jump_blocked():
    """건전지 상태 Space: 둔한 금속 '덜컥' (점프 실패판)"""
    n = int(0.3 * SR)
    x = np.zeros(n)
    place(x, metal(420, 0.25, SR, 0.8, 25), 0, SR)
    place(x, lp(kick(SR, 0.7), 300, SR), 0, SR)
    t = t_axis(0.12, SR)
    place(x, np.sin(2 * np.pi * np.cumsum(240 - 600 * t) / SR) * np.exp(-t * 25) * 0.4, 0.02, SR)  # 오르려다 꺾임
    return fade(norm(x, 0.7), SR, 0.001, 0.05)


def paper(dur, seed=1):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    g = np.repeat(r.uniform(0, 1, n // 300 + 1) ** 3, 300)[:n]
    return bp(noise(n), 2500, 9000, SR) * g * np.sin(np.pi * np.arange(n) / n)


def sfx_sheet_pickup():
    """악보 조각 줍기: 종이 바스락 + 클라리넷 두 음 (1초)"""
    x = np.zeros(int(1.0 * SR))
    place(x, paper(0.3), 0, SR, 0.6)
    place(x, clarinet(hz(midi("G5")), 0.16, SR), 0.12, SR, 0.5)
    place(x, clarinet(hz(midi("C6")), 0.4, SR), 0.3, SR, 0.5)
    return fade(norm(reverb(x, SR, mix=0.18)[: len(x)], 0.75), SR, 0.002, 0.2)


def sfx_pip_song():
    """피프의 노래 편지가 돌아옴: 신나는 클라리넷 짧은 멜로디 (약 2.6초)"""
    beat = 60 / 160
    notes = [(0, "G4", .5), (.5, "C5", .5), (1, "E5", .5), (1.5, "G5", .5), (2, "E5", .5), (2.5, "G5", .5),
             (3, "A5", 1), (4, "G5", .5), (4.5, "E5", .5), (5, "C6", 1.5)]
    buf = np.zeros(int(3.0 * SR))
    for b, n, d in notes:
        sb = b + (0.15 if abs(b % 1 - 0.5) < 1e-6 else 0)
        place(buf, clarinet(hz(midi(n)), d * beat * 0.92, SR) * 0.5, sb * beat, SR)
    for b, ch in [(0, "C"), (1, "C"), (2, "C"), (3, "F"), (4, "G7"), (5, "C")]:
        place(buf, tuba(hz(36 + CHORDS[ch][0]), 0.3, SR), b * beat, SR, 0.35)
        for m in chord_tones(ch, 60):
            place(buf, piano(hz(m), 0.12, SR, 0.12), (b + 0.5) * beat, SR)
    return jingle_mix(buf, SR, fo=0.4, peak=0.8)


def sfx_pip_flat():
    """건전지 피프 '배달 완료': 감정 없는 사인파 두 음 '삐-삐'"""
    x = np.zeros(int(0.5 * SR))
    place(x, sine(880, 0.12, SR, 1, r=0.005), 0, SR)
    place(x, sine(880, 0.12, SR, 1, r=0.005), 0.22, SR)
    return norm(x, 0.5)


def lamp_blink(hum_dur):
    n = int((hum_dur + 0.12) * SR)
    x = np.zeros(n)
    place(x, porcelain(3400, 0.08, 0.7), 0, SR)
    tt = t_axis(hum_dur, SR)
    h = (np.sin(2 * np.pi * 120 * tt) + 0.4 * np.sin(2 * np.pi * 240 * tt) + 0.1 * np.sin(2 * np.pi * 1800 * tt))
    h *= env_adsr(len(tt), SR, a=0.01, d=0.02, s=0.8, r=0.05) * 0.35
    place(x, h, 0.01, SR)
    return fade(norm(x, 0.6), SR, 0.001, 0.03)


def sfx_lamp_blink_short():
    return lamp_blink(0.15)


def sfx_lamp_blink_long():
    return lamp_blink(0.5)


def sfx_blink_right():
    """깜빡임 한 칸 맞음: 오르골 한 음 C6 (칸마다 코드가 rate로 올림)"""
    x = musicbox(hz(midi("C6")), 0.2, SR, 1)[: int(0.7 * SR)]
    return fade(norm(x, 0.6), SR, 0.001, 0.2)


def sfx_blink_wrong():
    """틀림: 낮은 부저 '부-'"""
    x = sq(110, 0.45, SR, 0.5, r=0.05) + sq(116.5, 0.45, SR, 0.5, r=0.05)
    return fade(norm(lp(x, 1800, SR), 0.55), SR, 0.003, 0.04)


def sfx_crank():
    """나무 크랭크 '드륵': 래칫보다 둥글고 낮게"""
    x = np.zeros(int(0.12 * SR))
    for k, d in enumerate([0, 0.028, 0.056]):
        place(x, woodblock(SR, 560 - k * 40, 0.8 - k * 0.15, 0.05), d, SR)
    x += lp(noise(len(x)), 500, SR) * np.exp(-np.arange(len(x)) / SR * 30) * 0.3
    return fade(norm(x, 0.55), SR, 0.001, 0.02)


def sfx_festival_cheer():
    """무대 꾸미기 완료: 손뼉 + 휘파람 같은 상승음 (1.6초)"""
    r = np.random.default_rng(12)
    x = np.zeros(int(1.6 * SR))
    for k in range(26):
        place(x, clap(SR, r.uniform(0.3, 0.7)), r.uniform(0, 1.1) ** 1.3, SR)
    t = t_axis(0.9, SR)
    f = 700 * (2.6 ** (t / 0.9)) * (1 + 0.02 * np.sin(2 * np.pi * 7 * t))
    wh = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.9) ** 0.7 * 0.35
    place(x, wh, 0.15, SR)
    return fade(norm(reverb(x, SR, mix=0.15)[: len(x)], 0.75), SR, 0.002, 0.3)


# ───────────────────────── 4막 BGM · 징글 ─────────────────────────
def to_minor(m):
    """C장조 선율 → A단조 (같은 윤곽, 단3·단6, 이끎음 G#은 유지)"""
    m -= 3
    return m - 1 if m % 12 in (1, 6) else m


def bgm_act4_tension():
    """측량기가 마을에 있는 동안: 마을 곡을 A단조로 + 메트로놈 '틱'. 112BPM 스윙 없음, 16마디.
    뒤 8마디는 틱이 8분음으로 촘촘해지고 낮은 드론이 깔려 더 불안해짐"""
    sr = BSR
    prog = ["Am", "F", "Dm7", "E7", "Am", "A7", "Dm", "Bdim", "Am", "F", "B7", "E7", "Am", "F", "Dm7", "E7"]
    tr = Track(112, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 33 + CHORDS[ch][0] % 12
        root += 12 if root < 36 else 0
        tr.add(b0, tuba(hz(root), 0.5, sr), 0.5)
        tr.add(b0 + 2, tuba(hz(root + 7 if root + 7 <= 47 else root - 5), 0.5, sr), 0.42)
        for b in (1, 3):
            for m in chord_tones(ch, 57):
                tr.add(b0 + b, piano(hz(m), 0.25, sr, 0.13, 0.6))
        ticks = 4 if bar < 8 else 8
        for k in range(ticks):
            tr.add(b0 + k * 4 / ticks, metal(2800, 0.03, sr, 0.16 if k % (ticks // 4) == 0 else 0.09, 140))
        if bar >= 8:
            tr.add(b0, sine(55, 4 * tr.beat, sr, 0.18, a=0.4, r=0.4))
    for b, m, d in awake_melody():
        tr.add(b, clarinet(hz(to_minor(m)), d * tr.beat * 0.92, sr, vib=4.5), 0.27)
    return tr.render_loop(rev_mix=0.13, lofi=3800, crackle=0.008, wow=False)


def bgm_chase():
    """건전지 추격 30초: 전자 리듬 160BPM, 스윙 없음. 4마디마다 래그타임 피아노 조각이 끼어듦 (16마디)"""
    sr = BSR
    prog = ["Em", "Em", "C", "B7", "Em", "Em", "C", "B7", "Am", "Em", "C", "B7", "Am", "C", "B7", "B7"]
    tr = Track(160, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 28 + (CHORDS[ch][0] - 4) % 12
        for k in range(8):
            tr.add(b0 + k * 0.5, sq(hz(root + (12 if k % 2 else 0)), 0.14, sr, 0.22, r=0.01))
            tr.add(b0 + k * 0.5, metal(5200, 0.02, sr, 0.08, 220))
        for b in range(4):
            tr.add(b0 + b, kick(sr), 0.45)
        for b in (1, 3):
            n = int(0.08 * sr)
            tr.add(b0 + b, bp(noise(n), 1500, 7000, sr) * np.exp(-np.arange(n) / sr * 50), 0.25)
        arp = chord_tones(ch, 64)
        for k in range(16):
            tr.add(b0 + k * 0.25, sine(hz(arp[k % len(arp)] + 12), 0.08, sr, 0.07, r=0.02))
        if bar % 4 == 3:  # 래그타임 조각: 마지막 두 박에 스윙 피아노 런
            run = [72, 74, 76, 79, 81, 79, 76, 74]
            for k, m in enumerate(run):
                tr.add(b0 + 2 + k * 0.25 + (0.06 if k % 2 else 0), piano(hz(m), 0.12, sr, 0.22))
    return render_dry(tr, lofi=8000, rev=0.05)


def bgm_flashback():
    """라디오 씨 회상: 지글거리는 축음기 질감 + 쓸쓸한 피아노. 70BPM, D단조 8마디.
    라디오 테마를 단조로 바꿔 두 배 느리게 연주한다 (밝던 광고 노래의 원래 모습)"""
    sr = BSR
    prog = ["Dm", "Bb", "Gm", "A7", "Dm", "Bb", "Gm", "A7"]
    tr = Track(70, 32, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 38 + (CHORDS[ch][0] - 2) % 12
        tr.add(b0, piano(hz(root), 2.0, sr, 0.3, 0.5))
        for b, m in zip((1, 2, 3), chord_tones(ch, 57)):
            tr.add(b0 + b, piano(hz(m), 0.6, sr, 0.1, 0.6))
    motif_minor = {"C5": "D5", "E5": "F5", "G5": "A5", "A5": "Bb5", "F5": "G5", "D5": "E5"}
    for start in (0, 16):
        for b, n, d in RADIO_MOTIF:
            tr.add(start + b * 2, piano(hz(midi(motif_minor[n])), d * 2 * tr.beat * 0.9, sr, 0.3, 0.9))
    x = tr.render_loop(rev_mix=0.3, lofi=2600, crackle=0.035)
    return norm(x, 0.75)


def jingle_map_get():
    """지도 획득: 짧은 발견 팡파르, 끝음이 단조로 꺾임 (약 2.8초)"""
    notes = [(0, "G4", .25), (.25, "C5", .25), (.5, "E5", .25), (.75, "G5", .75), (1.5, "E5", .25), (1.75, "Eb5", 1.5)]
    return GA.jingle(notes, 150, SR, chord=(1.75, ["C3", "G3", "C4", "Eb4"]), tail=1.0)


# ───────────────────────── 4막 SFX ─────────────────────────
def sfx_surveyor_step():
    """측량기 걸음: 마른 금속 '탁', 잡음 없이 매번 같은 소리"""
    x = metal(1700, 0.09, SR, 1, 70)
    x += lp(kick(SR, 0.3)[: len(x)], 300, SR)
    return fade(norm(x, 0.55), SR, 0.001, 0.01)


def sfx_surveyor_scan():
    """렌즈로 살핌: '삐빅' + 짧은 스윕"""
    x = np.zeros(int(0.55 * SR))
    place(x, sine(1500, 0.05, SR, 0.6, r=0.005), 0, SR)
    place(x, sine(2000, 0.05, SR, 0.6, r=0.005), 0.07, SR)
    s = sweep(700, 2600, 0.3, SR, harm=(1, 2)) * np.sin(np.pi * np.linspace(0, 1, int(0.3 * SR))) * 0.35
    place(x, s, 0.18, SR)
    return norm(x, 0.55)


def sfx_stake_hammer():
    """말뚝 박기: 나무 '쾅' 두 번"""
    x = np.zeros(int(0.75 * SR))
    for d, v in [(0, 1), (0.28, 0.85)]:
        place(x, lp(kick(SR, 1), 400, SR), d, SR, v)
        place(x, woodblock(SR, 280, 0.8, 0.15), d, SR, v)
        n = int(0.06 * SR)
        place(x, lp(noise(n), 2500, SR) * np.exp(-np.arange(n) / SR * 60), d, SR, 0.5 * v)
    return fade(norm(reverb(x, SR, mix=0.08, dur=0.4)[: len(x)], 0.8), SR, 0.001, 0.1)


def sfx_stake_pull():
    """말뚝 뽑는 동안: 나무 삐걱 반복 (1초 루프, 삐걱 2번. 시작·끝 세기가 0이라 이음새 없음)"""
    n = SR
    x = creak(1.0, SR, 30, 55, seed=4)
    t = np.arange(n) / n
    x *= np.sin(2 * np.pi * t) ** 2  # 0.5초마다 한 번씩 부풀었다 사라짐
    x += loop_filter(noise(n), SR, 300) * 0.08
    return norm(x, 0.75)


def sfx_stake_out():
    """말뚝이 뽑힘: '퐁!' + 흙 부스러기"""
    x = np.zeros(int(0.8 * SR))
    t = t_axis(0.18, SR)
    pop = np.sin(2 * np.pi * np.cumsum(350 + 700 * np.exp(-t * 30)) / SR) * np.exp(-t * 18)
    place(x, pop, 0, SR, 0.8)
    n = int(0.02 * SR)
    place(x, bp(noise(n), 1000, 6000, SR), 0, SR, 0.5)
    r = np.random.default_rng(8)
    for _ in range(20):
        g = int(r.uniform(0.004, 0.012) * SR)
        place(x, lp(noise(g), 1800, SR) * np.hanning(g), r.uniform(0.08, 0.6), SR, r.uniform(0.15, 0.4))
    return fade(norm(x, 0.75), SR, 0.001, 0.1)


def sfx_grey_spread():
    """회색이 번지기 시작: 음이 내려가는 스윕 + 잔향이 빠지며 소리가 건조해짐 (1.4초)"""
    n = int(1.4 * SR)
    s = sweep(1200, 180, 1.4, SR, harm=(1, 2, 3)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 * 0.4
    wet = reverb(s, SR, mix=0.6, dur=1.0)[:n]
    k = np.linspace(0, 1, n)
    x = wet * (1 - k) + s * k
    x = lp(x, 4000, SR) * (1 - 0.6 * k) + lp(x, 900, SR) * 0.6 * k  # 고음도 함께 빠짐
    return fade(norm(x, 0.65), SR, 0.002, 0.1)


def sfx_grey_recede():
    """회색 원이 줄어들며 색이 돌아옴: 위로 오르는 스윕 + 오르골 반짝"""
    n = int(1.5 * SR)
    x = np.zeros(n)
    s = sweep(180, 1200, 1.0, SR, harm=(1, 2, 3)) * np.sin(np.pi * np.linspace(0, 1, int(1.0 * SR))) ** 0.6 * 0.35
    place(x, s, 0, SR)
    for i, m in enumerate(["C6", "E6", "G6", "C7"]):
        place(x, musicbox(hz(midi(m)), 0.2, SR, 0.4)[: int(0.6 * SR)], 0.75 + i * 0.08, SR)
    return fade(norm(reverb(x, SR, mix=0.25)[:n], 0.75), SR, 0.002, 0.25)


def sfx_radio_jam():
    """라디오 씨 잡음 방송 발사: 큰 지지직 파동 0.6초"""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    wave = 0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)
    env = np.clip(t / 0.03, 0, 1) * np.clip((0.6 - t) / 0.2, 0, 1)
    buzz = sq(90, 0.6, SR, 0.35) * (1 + 0.3 * np.sin(2 * np.pi * 6 * t))
    x = (static(n, SR, rate=140, lo=500, hi=8000) * wave + buzz) * env
    return fade(norm(x, 0.85), SR, 0.002, 0.03)


def sfx_surveyor_stun():
    """측량기 3초 멈춤: 전자음이 꼬이며 '삐요요'"""
    t = t_axis(1.0, SR)
    depth = 0.05 + 0.25 * t
    f = (1300 - 800 * t) * (1 + depth * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.25 * np.sign(np.sin(ph))) * np.clip((1.0 - t) / 0.3, 0, 1)
    return fade(norm(lp(x, 6000, SR), 0.6), SR, 0.002, 0.05)


def sfx_surveyor_stop():
    """건전지를 빼서 완전 정지: 빼기 딸깍 + 모터가 천천히 멈춤 (1.7초)"""
    n = int(1.7 * SR)
    x = np.zeros(n)
    place(x, sfx_battery_out(), 0, SR, 0.8)
    t = t_axis(1.5, SR)
    f = 140 * np.exp(-t * 1.8) + 8
    ph = 2 * np.pi * np.cumsum(f) / SR
    motor = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.exp(-t * 1.6) * 0.5
    place(x, lp(motor, 1200, SR), 0.15, SR)
    place(x, metal(900, 0.2, SR, 0.4, 30), 1.45, SR)  # 마지막에 몸체가 '덜컹' 내려앉음
    return fade(norm(x, 0.75), SR, 0.001, 0.1)


def sfx_battery_low():
    """건전지 잔량 20% 이하: 짧은 '삐-삐'"""
    x = np.zeros(int(0.3 * SR))
    place(x, sq(1046.5, 0.07, SR, 1, r=0.005), 0, SR)
    place(x, sq(1046.5, 0.07, SR, 1, r=0.005), 0.13, SR)
    return norm(lp(x, 5000, SR), 0.5)


def sfx_battery_empty():
    """건전지 0: 하강음 + 털썩"""
    n = int(1.1 * SR)
    x = np.zeros(n)
    s = sweep(700, 90, 0.75, SR, harm=(1, 3, 5)) * np.linspace(1, 0.3, int(0.75 * SR)) * 0.4
    place(x, s, 0, SR)
    place(x, lp(kick(SR, 1), 300, SR), 0.8, SR, 0.9)
    place(x, porcelain(1500, 0.15, 0.3), 0.8, SR)
    return fade(norm(x, 0.8), SR, 0.002, 0.1)


def sfx_broadcast_chime():
    """철거 방송 시작 전: 단조 '딩-동-댕' 안내음 + 잡음"""
    n = int(2.6 * SR)
    x = np.zeros(n)
    for i, m in enumerate(["E5", "C5", "A4"]):
        f = hz(midi(m))
        tt = t_axis(1.5, SR)
        c = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt) + 0.1 * np.sin(2 * np.pi * f * 3 * tt))
        place(x, c * np.exp(-tt * 2.0) * np.clip(tt / 0.005, 0, 1), i * 0.5, SR, 0.5)
    x = bp(x, 300, 3500, SR)  # 확성기 대역
    x += static(n, SR, lo=1500, hi=5000) * 0.06
    return fade(norm(x, 0.75), SR, 0.002, 0.3)


# ───────────────────────── 실행 ─────────────────────────
ACT4_BGM = {"bgm_act4_tension": bgm_act4_tension, "bgm_chase": bgm_chase, "bgm_flashback": bgm_flashback,
            "jingle_map_get": jingle_map_get}
ACT4_SFX = {"sfx_surveyor_step": sfx_surveyor_step, "sfx_surveyor_scan": sfx_surveyor_scan,
            "sfx_stake_hammer": sfx_stake_hammer, "sfx_stake_pull": sfx_stake_pull, "sfx_stake_out": sfx_stake_out,
            "sfx_grey_spread": sfx_grey_spread, "sfx_grey_recede": sfx_grey_recede, "sfx_radio_jam": sfx_radio_jam,
            "sfx_surveyor_stun": sfx_surveyor_stun, "sfx_surveyor_stop": sfx_surveyor_stop,
            "sfx_battery_low": sfx_battery_low, "sfx_battery_empty": sfx_battery_empty,
            "sfx_broadcast_chime": sfx_broadcast_chime}
ACT3_BGM = {"bgm_festival": bgm_festival, "bgm_radio_theme": bgm_radio_theme,
            "jingle_radio_crank": jingle_radio_crank, "jingle_name_given": jingle_name_given,
            "jingle_city_signal": jingle_city_signal}
ACT3_SFX = {"sfx_radio_on": sfx_radio_on, "sfx_radio_off": sfx_radio_off, "sfx_radio_static": sfx_radio_static,
            "amb_radio_static": amb_radio_static, "sfx_text_blip_radio": sfx_text_blip_radio,
            "sfx_battery_in": sfx_battery_in, "sfx_battery_out": sfx_battery_out,
            "sfx_battery_hum": sfx_battery_hum, "sfx_jump_blocked": sfx_jump_blocked,
            "sfx_sheet_pickup": sfx_sheet_pickup, "sfx_pip_song": sfx_pip_song, "sfx_pip_flat": sfx_pip_flat,
            "sfx_lamp_blink_short": sfx_lamp_blink_short, "sfx_lamp_blink_long": sfx_lamp_blink_long,
            "sfx_blink_right": sfx_blink_right, "sfx_blink_wrong": sfx_blink_wrong, "sfx_crank": sfx_crank,
            "sfx_festival_cheer": sfx_festival_cheer}
# ───────────────────────── 5막 BGM · 징글 (태엽 모드로 들었을 때 기준) ─────────────────────────
def bgm_road1():
    """구간1 들판길: 경쾌한 래그타임 행진 132BPM, 마을 곡 동기. 튜바 행진 베이스 + 스네어 + 밴조"""
    sr = BSR
    tr = Track(132, 64, sr, swing=0.2)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        for b in (0, 2):
            tr.add(b0 + b, tuba(hz(root if b == 0 else (root + 7 if CHORDS[ch][0] < 5 else root - 5)), 0.35, sr), 0.55)
            tr.add(b0 + b, kick(sr), 0.3)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.15, sr, 0.17, 0.8))
            tr.add(b0 + b, brush(0.1, sr), 0.4)
            n = int(0.04 * sr)
            tr.add(b0 + b, bp(noise(n), 2500, 8000, sr) * np.exp(-np.arange(n) / sr * 70), 0.2)
        if bar % 2 == 1:  # 행진 스네어 꾸밈음
            for k in range(3):
                tr.add(b0 + 3.5 + k / 6, brush(0.06, sr), 0.2)
        tones = chord_tones(ch, 60)
        for k in (1, 3, 5, 7):
            tr.add(b0 + k * 0.5, banjo(hz(tones[(k // 2) % len(tones)]), 0.1, sr), 0.08)
    for b, m, d in awake_melody():
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.9, sr), 0.3)
        tr.add(b, musicbox(hz(m + 12), 0.15, sr, 0.05))
    return tr.render_loop(rev_mix=0.14, lofi=4300, crackle=0.010)


def hammer_hit(sr, vel=1.0):
    x = metal(620, 0.25, sr, 0.7, 25)
    return (x + lp(kick(sr, 0.8), 400, sr)[: len(x)]) * vel


def steam(sr, dur=0.3, vel=1.0):
    n = int(dur * sr)
    t = np.arange(n) / sr
    return bp(noise(n), 3000, min(9000, sr * 0.44), sr) * np.clip(t / 0.02, 0, 1) * np.exp(-t * 7) * vel


def bgm_road2():
    """구간2 공장 지대: 래그타임 반 + 기계 리듬 반. 망치·증기 타악, 일정한 8분 틱. 126BPM D단조 16마디"""
    sr = BSR
    prog = ["Dm", "Dm", "Gm", "A7", "Dm", "F", "Gm", "A7", "Bb", "F", "Gm", "A7", "Dm", "Bb", "Gm", "A7"]
    tr = Track(126, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 38 + (CHORDS[ch][0] - 2) % 12
        tr.add(b0, hammer_hit(sr), 0.5)  # 기계: 쾅 · (쾅) · 치익
        tr.add(b0 + 2.5, hammer_hit(sr), 0.35)
        tr.add(b0 + 3, steam(sr), 0.25)
        for k in range(8):
            tr.add(b0 + k * 0.5, metal(3600, 0.02, sr, 0.09, 200))
        tr.add(b0, sq(hz(root - 12), 4 * tr.beat * 0.95, sr, 0.06, a=0.05, r=0.1))  # 공장 드론
        lag = 0.04 if bar % 2 else 0  # 래그타임 쪽: 사람 손처럼 살짝 밀리는 스트라이드
        for b in (0, 2):
            tr.add(b0 + b + lag, piano(hz(root), 0.3, sr, 0.35, 0.6))
            for m in chord_tones(ch, 57):
                tr.add(b0 + b + 1 + lag, piano(hz(m), 0.18, sr, 0.15, 0.7))
    ra = [(0, .5), (.5, .5), (1, 1), (2, .5), (2.5, .5), (3, 1)]
    rb = [(0, 1), (1, .5), (1.5, .5), (2, 2)]
    mel = melody_line(prog, [ra, rb] * 8, start=74, lo=67, hi=84, seed=55, scale=(2, 4, 5, 7, 9, 10, 1))
    for b, m, d in mel:
        if (b // 8) % 2 == 0:  # 멜로디는 두 마디 연주, 두 마디 쉼 → 기계 리듬이 드러남
            tr.add(b, clarinet(hz(m), d * tr.beat * 0.9, sr), 0.3)
    return tr.render_loop(rev_mix=0.1, lofi=5000, crackle=0.006, wow=False)


def bgm_road3():
    """구간3 도시: 거의 전자 리듬 128BPM A단조. 마을 멜로디는 멀리서 희미하게 (따로 렌더해 잔향 많이·고음 차단)"""
    sr = BSR
    prog = ["Am", "Am", "F", "E7", "Am", "Am", "F", "E7", "Dm", "Am", "F", "E7", "Dm", "F", "E7", "E7"]
    city = Track(128, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 33 + CHORDS[ch][0] % 12
        for b in range(4):
            city.add(b0 + b, kick(sr), 0.5)
            for m in chord_tones(ch, 60):
                city.add(b0 + b + 0.5, sine(hz(m), 0.1, sr, 0.06, r=0.03))
        for k in range(8):
            city.add(b0 + k * 0.5, sq(hz(root + (12 if k % 2 else 0)), 0.13, sr, 0.2, r=0.01))
        for k in range(16):
            city.add(b0 + k * 0.25, metal(6000, 0.015, sr, 0.07 if k % 2 else 0.04, 260))
        for b in (1, 3):
            n = int(0.07 * sr)
            city.add(b0 + b, bp(noise(n), 1800, 7000, sr) * np.exp(-np.arange(n) / sr * 60), 0.2)
    far = Track(128, 64, sr)
    for b, m, d in awake_melody():
        far.add(b, clarinet(hz(to_minor(m)), d * far.beat * 0.9, sr), 0.3)
    c = render_dry(city, lofi=8500, rev=0.04)
    f = far.render_loop(rev_mix=0.55, lofi=1600, crackle=0.02)
    return norm(c + f * 0.16, 0.8)


def bgm_finale():
    """송신탑 결말: 마을 멜로디(클라리넷·피아노·튜바·밴조) + 도시의 일정한 리듬(킥·사인 베이스·틱)이 합쳐짐.
    뒤 8마디에는 라디오 테마가 사각파 대선율로 들어옴. 132BPM C장조 16마디, 스윙 없음"""
    sr = BSR
    tr = Track(132, 64, sr)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, tuba(hz(root), 0.4, sr), 0.45)  # 마을
        tr.add(b0 + 2, tuba(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.4, sr), 0.4)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.18, sr, 0.17, 0.8))
        tr.add(b0 + 3.5, banjo(hz(chord_tones(ch, 60)[-1]), 0.1, sr), 0.1)
        for b in range(4):  # 도시
            tr.add(b0 + b, kick(sr), 0.32)
        for k in range(8):
            tr.add(b0 + k * 0.5, sine(hz(root + 12 * (k % 2)), 0.18, sr, 0.16))
            tr.add(b0 + k * 0.5, metal(4200, 0.02, sr, 0.06, 200))
    for b, m, d in awake_melody():
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.92, sr), 0.3)
        if d >= 1:
            tr.add(b, piano(hz(m + 12), 0.15, sr, 0.08))
    for start in (32, 40, 48, 56):
        for b, n, d in RADIO_MOTIF:
            tr.add(start + b, sq(hz(midi(n) - 12), d * tr.beat * 0.8, sr, 0.05))
    return tr.render_loop(rev_mix=0.14, lofi=5200, crackle=0.004, wow=False)


def horn(f, dur, sr, vel=1.0):
    """축음기 나팔: 짝수 배음까지 넣고 나팔 대역으로 좁힌 관악기"""
    t = t_axis(dur, sr)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t))) / sr
    x = sum(a * np.sin(k * ph) for k, a in [(1, 1), (2, .7), (3, .5), (4, .35), (5, .2), (6, .1)])
    return bp(x, 450, 3200, sr) * env_adsr(len(t), sr, a=0.025, d=0.05, s=0.75, r=0.08) * vel


def jingle_checkpoint():
    """체크포인트: 축음기 나팔 짧은 3음 (1.6초)"""
    sr = SR
    buf = np.zeros(int(1.6 * sr))
    for i, (n, d) in enumerate([("G4", 0.14), ("C5", 0.14), ("E5", 0.6)]):
        place(buf, horn(hz(midi(n)), d, sr), i * 0.16, sr, 0.6)
    place(buf, horn(hz(midi("C4")), 0.6, sr), 0.32, sr, 0.25)
    buf += film_noise(len(buf), sr) * 0.01
    return jingle_mix(buf, sr, rev=0.18, lofi=4500, fo=0.4)


def jingle_zone_clear():
    """구간 끝: 2.6초 팡파르 (G장조)"""
    notes = [(0, "D5", .25), (.25, "G5", .25), (.5, "B5", .25), (.75, "D6", .5), (1.25, "C6", .25),
             (1.5, "B5", .25), (1.75, "A5", .25), (2, "G5", 1.25)]
    return GA.jingle(notes, 160, SR, chord=(2, ["G3", "D4", "G4", "B4"]), tail=1.0)


# ───────────────────────── 5막 SFX ─────────────────────────
def sfx_swap():
    """Q 갈아끼우기: 덮개 열림 → 빼기 → 끼우기 딸깍. 정확히 0.6초 (26460샘플)"""
    n = int(0.6 * SR)
    x = np.zeros(n)
    place(x, metal(2400, 0.04, SR, 0.6, 140), 0, SR)  # 덮개 걸쇠
    place(x, creak(0.1, SR, 60, 90, seed=2), 0.02, SR, 0.4)  # 덮개 경첩
    m = int(0.14 * SR)
    place(x, bp(noise(m), 1500, 6000, SR) * np.hanning(m), 0.16, SR, 0.35)  # 빼는 스침
    k = int(0.12 * SR)
    place(x, sweep(700, 300, 0.12, SR) * np.hanning(k) * 0.25, 0.18, SR)  # 빠짐
    place(x, sweep(300, 700, 0.12, SR) * np.hanning(k) * 0.25, 0.36, SR)  # 밀어 넣음
    place(x, battery_click(), 0.5, SR)
    place(x, lp(kick(SR, 0.4), 300, SR)[: int(0.09 * SR)], 0.5, SR)
    return fade(norm(x, 0.75), SR, 0.001, 0.008)


def sfx_auto_swap():
    """건전지 0 → 자동 태엽 전환: 짧은 경고 + 딸깍 (0.5초)"""
    x = np.zeros(int(0.5 * SR))
    place(x, sq(880, 0.06, SR, 0.7, r=0.005), 0, SR)
    place(x, sq(660, 0.06, SR, 0.7, r=0.005), 0.09, SR)
    place(x, battery_click(), 0.32, SR)
    return fade(norm(lp(x, 6000, SR), 0.7), SR, 0.001, 0.05)


def sfx_jump_charge():
    """충전 점프 누르는 동안(루프 0.5초): 스프링 째깍 + 팽팽한 톤.
    '1초에 최고'로 오르는 것은 코드에서 playbackRate를 0.6 → 1.0 (1초)으로 올려 처리한다"""
    n = SR // 2
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 600 * t + 0.6 * np.sin(2 * np.pi * 6 * t)) * 0.18 + np.sin(2 * np.pi * 1200 * t) * 0.05
    for k in range(8):
        place(x, metal(3000, 0.03, SR, 0.35, 150), k / 16, SR)
    return norm(x, 0.55)


def sfx_jump_big():
    """충전 점프 발사: 스프링 '뾰옹' 큰 버전"""
    t = t_axis(0.75, SR)
    f = (160 + 900 * (1 - np.exp(-t * 7))) * (1 + 0.12 * np.sin(2 * np.pi * 22 * t) * np.exp(-t * 3))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * np.exp(-t * 4) * np.minimum(1, t / 0.004)
    place(x, lp(kick(SR, 0.6), 300, SR)[: int(0.1 * SR)], 0, SR)
    return fade(norm(reverb(x, SR, mix=0.12, dur=0.6)[: len(x)], 0.8), SR, 0.001, 0.06)


def sfx_dash_step():
    """건전지 모드 발소리: 금속 '틱', 매번 같음"""
    return fade(norm(metal(4200, 0.05, SR, 1, 110), 0.45), SR, 0.001, 0.005)


def sfx_wind_self():
    """체크포인트에서 스스로 감기: 래칫 드르륵 3번 + 딸깍 (1초)"""
    x = np.zeros(int(1.0 * SR))
    for d in (0, 0.18, 0.36):
        place(x, GA.sfx_wind_ratchet(), d, SR, 0.8)
    place(x, GA.sfx_wind_notch(), 0.58, SR)
    return fade(norm(x, 0.8), SR, 0.001, 0.1)


def sfx_wind_low():
    """태엽 게이지 20% 이하: 느려지는 오르골 두 음 (두 번째 음이 늦고 처짐)"""
    x = np.zeros(int(1.3 * SR))
    place(x, musicbox(hz(midi("G5")), 0.3, SR, 0.6)[: int(0.7 * SR)], 0, SR)
    place(x, musicbox(hz(midi("E5")) * 0.985, 0.4, SR, 0.5)[: int(0.9 * SR)], 0.42, SR)
    return fade(norm(reverb(x, SR, mix=0.2)[: len(x)], 0.65), SR, 0.001, 0.3)


def sfx_short_circuit():
    """건전지 모드로 물에 닿음: 지지직 → 펑 → 치익 (1.2초)"""
    x = np.zeros(int(1.2 * SR))
    m = int(0.35 * SR)
    buzz = (static(m, SR, rate=200, lo=800, hi=9000) + sq(100, 0.35, SR, 0.5)) * np.linspace(0.6, 1, m)
    place(x, buzz, 0, SR, 0.6)
    place(x, kick(SR, 1), 0.35, SR, 0.8)
    k = int(0.08 * SR)
    place(x, lp(noise(k), 3000, SR) * np.exp(-np.arange(k) / SR * 40), 0.35, SR, 0.8)
    place(x, steam(SR, 0.75, 1), 0.42, SR, 0.4)
    return fade(norm(x, 0.85), SR, 0.001, 0.15)


def sfx_splash():
    """태엽 모드로 물웅덩이: 가벼운 첨벙 + 물방울"""
    x = np.zeros(int(0.6 * SR))
    m = int(0.3 * SR)
    t = np.arange(m) / SR
    place(x, bp(noise(m), 700, 6000, SR) * np.clip(t / 0.005, 0, 1) * np.exp(-t * 14), 0, SR, 0.7)
    r = np.random.default_rng(21)
    for _ in range(6):
        d = t_axis(0.05, SR)
        drop = np.sin(2 * np.pi * np.cumsum(r.uniform(1200, 2600) * (1 + 0.8 * d / 0.05)) / SR) * np.exp(-d * 60)
        place(x, drop, r.uniform(0.05, 0.4), SR, r.uniform(0.15, 0.3))
    return fade(norm(x, 0.65), SR, 0.001, 0.08)


def sfx_charge():
    """충전소 충전 중(루프 2초): 일정한 험 + 올라가는 네 음 반복 (진행도에 따라 rate를 올려도 됨)"""
    x = mains_hum(2 * SR, SR, 60) * 0.25
    for i, m in enumerate(["C5", "E5", "G5", "C6"]):
        place(x, sine(hz(midi(m)), 0.42, SR, 0.22, a=0.04, r=0.15), i * 0.5, SR)
    return norm(x, 0.5)


def sfx_charge_full():
    """충전 완료: 맑은 '띵' 두 번"""
    x = np.zeros(int(0.9 * SR))
    tt = t_axis(0.6, SR)
    ding = (np.sin(2 * np.pi * 1760 * tt) + 0.2 * np.sin(2 * np.pi * 3520 * tt)) * np.exp(-tt * 6)
    for d in (0, 0.18):
        place(x, ding, d, SR, 0.5)
    return fade(norm(x, 0.6), SR, 0.001, 0.15)


def shutter_rattle(dur, f0, f1, seed=3):
    r = np.random.default_rng(seed)
    x = np.zeros(int(dur * SR))
    tpos = 0.0
    while tpos < dur - 0.03:
        place(x, metal(f0 + (f1 - f0) * tpos / dur, 0.03, SR, r.uniform(0.3, 0.6), 120), tpos, SR)
        tpos += 1 / 28
    return x


def sfx_shutter_close():
    """셔터 닫힘: 철판 드르륵 → 쾅"""
    x = np.zeros(int(1.1 * SR))
    place(x, shutter_rattle(0.55, 900, 700), 0, SR)
    place(x, lp(kick(SR, 1), 350, SR), 0.55, SR)
    place(x, metal(380, 0.45, SR, 0.7, 12), 0.55, SR)
    return fade(norm(reverb(x, SR, mix=0.1, dur=0.5)[: len(x)], 0.85), SR, 0.001, 0.15)


def sfx_shutter_open():
    """셔터 열림: 철판 드르륵 위로 + 끝에 작은 '철컥'"""
    x = np.zeros(int(0.85 * SR))
    place(x, shutter_rattle(0.65, 650, 1100, seed=4), 0, SR)
    place(x, metal(1400, 0.08, SR, 0.5, 60), 0.68, SR)
    return fade(norm(x, 0.7), SR, 0.001, 0.08)


def sfx_door_auto():
    """자동문 열림: 공기 '슉' + 작은 전자음"""
    x = np.zeros(int(0.5 * SR))
    m = int(0.28 * SR)
    place(x, bp(noise(m), 1200, 7000, SR) * np.sin(np.pi * np.arange(m) / m) ** 1.5, 0, SR, 0.6)
    place(x, sine(1320, 0.05, SR, 0.3, r=0.01), 0.02, SR)
    place(x, sine(1760, 0.07, SR, 0.3, r=0.02), 0.08, SR)
    return fade(norm(x, 0.6), SR, 0.001, 0.05)


def sfx_elevator():
    """승강기 움직이는 동안(루프 2초): 모터 웅 + 가는 회전음 (모두 2초 안에 정수 주기)"""
    n = 2 * SR
    t = np.arange(n) / SR
    ph = 2 * np.pi * 90 * t
    x = loop_filter(sum(np.sin(k * ph) / k for k in range(1, 7)) * 0.4, SR, 900)
    x += np.sin(2 * np.pi * 700 * t) * 0.04
    x *= 0.9 + 0.1 * np.sin(2 * np.pi * 2 * t)
    return norm(x, 0.5)


def sfx_conveyor():
    """컨베이어 위(루프 1초): 롤러 덜덜덜 12번 + 낮은 굉음"""
    x = loop_filter(noise(SR), SR, 220) * 0.5
    for k in range(12):
        place(x, metal(900 + (k % 3) * 80, 0.04, SR, 0.4, 90), k / 12, SR)
    return norm(x, 0.5)


def sfx_lift_wind():
    """태엽 승강 발판이 올라감: 톱니 째깍째깍 상승 + 끝에 '척'"""
    x = np.zeros(int(1.4 * SR))
    tpos, k = 0.0, 0
    while tpos < 1.1:
        place(x, tick(SR, 0.45, 1600 + k * 45), tpos, SR)
        place(x, woodblock(SR, 500 + k * 15, 0.15, 0.04), tpos, SR)
        tpos += 0.075
        k += 1
    place(x, metal(1100, 0.15, SR, 0.6, 40), 1.15, SR)
    return fade(norm(x, 0.7), SR, 0.001, 0.1)


def sfx_drawbridge():
    """도개교 내려옴: 쇠사슬 촤르르 → 쿵 (1.9초)"""
    r = np.random.default_rng(31)
    x = np.zeros(int(1.9 * SR))
    for _ in range(90):
        place(x, metal(r.uniform(1800, 4200), 0.03, SR, r.uniform(0.15, 0.4), 150), r.uniform(0, 1.05) ** 0.9, SR)
    place(x, lp(kick(SR, 1), 250, SR), 1.15, SR)
    m = int(0.4 * SR)
    place(x, lp(noise(m), 800, SR) * np.exp(-np.arange(m) / SR * 10), 1.15, SR, 0.5)
    place(x, woodblock(SR, 160, 0.6, 0.3), 1.15, SR)
    return fade(norm(reverb(x, SR, mix=0.15, dur=0.8)[: len(x)], 0.85), SR, 0.001, 0.2)


def sfx_fall():
    """구덩이에 떨어짐: 카툰식 하강 휘파람 '휘이익'"""
    t = t_axis(1.2, SR)
    f = 1600 * (0.18 ** (t / 1.2)) * (1 + 0.025 * np.sin(2 * np.pi * 7 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(t / 0.05, 0, 1) * np.clip((1.2 - t) / 0.2, 0, 1)
    x += bp(noise(len(t)), 500, 3000, SR) * 0.04
    return fade(norm(x, 0.6), SR, 0.002, 0.05)


def sfx_spark_hit():
    """감전 전선 피격: 짧은 지지직 + 기존 sfx_player_hit"""
    x = np.zeros(int(0.65 * SR))
    m = int(0.18 * SR)
    place(x, static(m, SR, rate=220, lo=1000, hi=9000) + sq(120, 0.18, SR, 0.4), 0, SR, 0.6)
    place(x, GA.sfx_player_hit(), 0.08, SR, 0.8)
    return fade(norm(x, 0.8), SR, 0.001, 0.08)


ACT5_BGM = {"bgm_road1": bgm_road1, "bgm_road2": bgm_road2, "bgm_road3": bgm_road3, "bgm_finale": bgm_finale,
            "jingle_checkpoint": jingle_checkpoint, "jingle_zone_clear": jingle_zone_clear}
ACT5_SFX = {"sfx_swap": sfx_swap, "sfx_auto_swap": sfx_auto_swap, "sfx_jump_charge": sfx_jump_charge,
            "sfx_jump_big": sfx_jump_big, "sfx_dash_step": sfx_dash_step, "sfx_wind_self": sfx_wind_self,
            "sfx_wind_low": sfx_wind_low, "sfx_short_circuit": sfx_short_circuit, "sfx_splash": sfx_splash,
            "sfx_charge": sfx_charge, "sfx_charge_full": sfx_charge_full, "sfx_shutter_close": sfx_shutter_close,
            "sfx_shutter_open": sfx_shutter_open, "sfx_door_auto": sfx_door_auto, "sfx_elevator": sfx_elevator,
            "sfx_conveyor": sfx_conveyor, "sfx_lift_wind": sfx_lift_wind, "sfx_drawbridge": sfx_drawbridge,
            "sfx_fall": sfx_fall, "sfx_spark_hit": sfx_spark_hit}
ACTS = {"act3": (ACT3_BGM, ACT3_SFX), "act4": (ACT4_BGM, ACT4_SFX), "act5": (ACT5_BGM, ACT5_SFX)}
JINGLE_SR = SR  # 징글은 SFX와 같은 44100Hz (기존 jingle_* 와 동일)


STEM_IDS = ["bgm_town_awake_base", "bgm_town_awake_pip", "bgm_town_awake_lamp"]


def run(flt=""):
    for act, (bgm, sfx) in ACTS.items():
        pick = (lambda name: True) if (not flt or flt == act) else (lambda name: flt in name)
        print(f"[{act}]")
        if act == "act3" and any(pick(s) for s in STEM_IDS):  # 스템 3개는 항상 함께 생성
            for name, x in town_stems().items():
                save(name, x, BSR, "bgm")
        for name, fn in bgm.items():
            if pick(name):
                save(name, fn(), JINGLE_SR if name.startswith("jingle") else BSR, "bgm")
        for name, fn in sfx.items():
            if pick(name):
                save(name, fn(), SR, "sfx")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "")

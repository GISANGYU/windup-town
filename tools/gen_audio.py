"""태엽 마을 — 배경음악·효과음 절차 생성기 (numpy + scipy, 외부 음원 없음)

실행:  python tools/gen_audio.py          # 전체 생성
       python tools/gen_audio.py sfx_jump  # 이름 일부가 맞는 것만

출력:  assets/audio/bgm/*.wav, assets/audio/sfx/*.wav  (모노 16bit)
       BGM 22050Hz(용량 절약), SFX 44100Hz
분위기: 1930년대 카툰 필름. 래그타임 피아노·클라리넷·튜바, 오르골, 필름 잡음.
"""
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "audio"
rng = np.random.default_rng(1930)

# ───────────────────────── 기본 도구 ─────────────────────────
NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
        "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def midi(name):
    """'C4' → 60, 'Bb3' → 58"""
    p, o = (name[:2], name[2:]) if len(name) > 2 and name[1] in "#b" else (name[:1], name[1:])
    return NOTE[p] + 12 * (int(o) + 1)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_axis(dur, sr):
    return np.arange(int(dur * sr)) / sr


def env_adsr(n, sr, a=0.005, d=0.1, s=0.6, r=0.1):
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([np.linspace(0, 1, max(a_n, 1)), np.linspace(1, s, max(d_n, 1)),
                        np.full(s_n, s), np.linspace(s, 0, max(r_n, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def lp(x, f, sr, order=2):
    return sosfilt(butter(order, min(f, sr * 0.45), "low", fs=sr, output="sos"), x)


def hp(x, f, sr, order=2):
    return sosfilt(butter(order, f, "high", fs=sr, output="sos"), x)


def bp(x, lo, hi, sr, order=2):
    return sosfilt(butter(order, [lo, min(hi, sr * 0.45)], "band", fs=sr, output="sos"), x)


def noise(n):
    return rng.uniform(-1, 1, n)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


def fade(x, sr, fi=0.002, fo=0.01):
    x = x.copy()
    a, b = int(fi * sr), int(fo * sr)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x


def reverb_ir(sr, dur=1.2, decay=3.5, bright=4000):
    n = int(dur * sr)
    ir = noise(n) * np.exp(-decay * np.arange(n) / sr)
    ir = lp(ir, bright, sr)
    ir[0] = 1.0
    return ir / np.sqrt(np.sum(ir ** 2))


def reverb(x, sr, mix=0.18, **kw):
    wet = fftconvolve(x, reverb_ir(sr, **kw))[: len(x) + int(kw.get("dur", 1.2) * sr)]
    out = np.pad(x, (0, len(wet) - len(x))) * (1 - mix) + wet * mix
    return out


def save(name, x, sr, sub):
    path = OUT / sub / f"{name}.wav"
    path.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(path, sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    print(f"  {sub}/{name}.wav  {len(x) / sr:5.2f}s  {path.stat().st_size // 1024}KB")


# ───────────────────────── 악기 ─────────────────────────
def piano(f, dur, sr, vel=1.0, bright=1.0):
    t = t_axis(dur + 0.25, sr)
    x = np.zeros_like(t)
    for k, amp in enumerate([1, 0.55, 0.32, 0.2, 0.12, 0.07], start=1):
        detune = 1 + 0.0007 * k * k  # 현의 비조화성
        x += amp * bright ** (k - 1) * np.sin(2 * np.pi * f * k * detune * t) * np.exp(-t * (1.6 + 0.9 * k))
    x *= np.minimum(1, t / 0.003)
    rel = int(dur * sr)
    x[rel:] *= np.exp(-np.arange(len(x) - rel) / sr * 18)
    hammer = lp(noise(int(0.01 * sr)), 3000, sr) * 0.15
    x[: len(hammer)] += hammer
    return x * vel


def musicbox(f, dur, sr, vel=1.0):
    t = t_axis(dur + 1.2, sr)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6)
         + 0.18 * np.sin(2 * np.pi * f * 5.43 * t) * np.exp(-t * 10))
    x *= np.exp(-t * 2.4) * np.minimum(1, t / 0.0015)
    return x * vel


def clarinet(f, dur, sr, vel=1.0, vib=5.2):
    t = t_axis(dur, sr)
    vibr = 1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.25)
    ph = 2 * np.pi * np.cumsum(f * vibr) / sr
    x = sum(a * np.sin(k * ph) for k, a in [(1, 1), (3, 0.42), (5, 0.22), (7, 0.1), (9, 0.05)])
    x += 0.03 * lp(noise(len(t)), 2500, sr)  # 숨소리
    return x * env_adsr(len(t), sr, a=0.03, d=0.06, s=0.8, r=min(0.08, dur * 0.3)) * vel


def tuba(f, dur, sr, vel=1.0):
    t = t_axis(dur, sr)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) + 0.25 * np.sin(6 * np.pi * f * t)
    x = lp(x, 700, sr)
    return x * env_adsr(len(t), sr, a=0.02, d=0.08, s=0.55, r=0.06) * vel


def banjo(f, dur, sr, vel=1.0):
    t = t_axis(dur + 0.1, sr)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (7 + 4 * k)) for k, a in
            [(1, 1), (2, 0.8), (3, 0.6), (4, 0.4), (5, 0.25)])
    return x * np.minimum(1, t / 0.001) * vel


def brush(dur, sr, vel=1.0):
    n = int(dur * sr)
    x = bp(noise(n), 2000, 9000, sr) * np.exp(-np.arange(n) / sr * 28)
    return x * vel


def woodblock(sr, f=900, vel=1.0, dur=0.12):
    t = t_axis(dur, sr)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 55) + 0.4 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t * 80)
    return x * vel


def kick(sr, vel=1.0):
    t = t_axis(0.25, sr)
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 14) * vel


def tick(sr, vel=1.0, f=3200):
    t = t_axis(0.03, sr)
    return (bp(noise(len(t)), f * 0.7, f * 1.4, sr) * np.exp(-t * 260) + np.sin(2 * np.pi * f * t) * np.exp(-t * 300)) * vel


# ───────────────────────── 트랙 조립 ─────────────────────────
class Track:
    def __init__(self, bpm, beats, sr, swing=0.0):
        self.sr, self.bpm, self.swing = sr, bpm, swing
        self.beat = 60 / bpm
        self.len = int(beats * self.beat * sr)
        self.buf = np.zeros(self.len + sr * 3)

    def at(self, beat):
        # 8분음 스윙: 반박자 위치를 뒤로 민다
        whole, frac = divmod(beat, 1)
        if self.swing and abs(frac - 0.5) < 1e-6:
            frac = 0.5 + self.swing * 0.5
        return int((whole + frac) * self.beat * self.sr)

    def add(self, beat, sig, gain=1.0):
        i = self.at(beat)
        if i >= len(self.buf): return
        sig = sig[: len(self.buf) - i]
        self.buf[i:i + len(sig)] += sig * gain

    def render_loop(self, rev_mix=0.16, lofi=3800, crackle=0.012, wow=True):
        sr = self.sr
        x = reverb(self.buf, sr, mix=rev_mix, dur=1.0)
        # 꼬리를 앞쪽으로 접어서 끊김 없는 루프
        body, tail = x[: self.len].copy(), x[self.len:]
        body[: len(tail)] += tail[: len(body)]
        if wow:  # 테이프·축음기의 미세한 음정 흔들림 (루프 주기에 맞춤)
            n = len(body)
            cyc = max(1, round(n / sr / 1.6))
            idx = np.arange(n) + 0.0009 * sr * np.sin(2 * np.pi * cyc * np.arange(n) / n)
            body = np.interp(idx % n, np.arange(n), body)
        # 오래된 녹음 대역. 3번 이어 붙여 필터한 뒤 가운데만 써서 루프 이음새를 매끄럽게
        n = len(body)
        body = lp(hp(np.tile(body, 3), 90, sr), lofi, sr)[n:2 * n]
        body += film_noise(len(body), sr) * crackle
        return norm(body, 0.8)


def film_noise(n, sr):
    hiss = lp(noise(n), 5000, sr) * 0.25
    pops = np.zeros(n)
    for i in rng.integers(0, n, size=int(n / sr * 7)):
        k = int(rng.integers(20, 80))
        pops[i:i + k] += rng.uniform(-1, 1) * np.exp(-np.arange(min(k, n - i)) / 8)
    return hiss + pops * 2.5


CHORDS = {
    "C": [0, 4, 7], "C7": [0, 4, 7, 10], "Cmaj7": [0, 4, 7, 11], "Am": [9, 12, 16], "A7": [9, 13, 16, 19],
    "Dm": [2, 5, 9], "Dm7": [2, 5, 9, 12], "D7": [2, 6, 9, 12], "G7": [7, 11, 14, 17], "G": [7, 11, 14],
    "F": [5, 9, 12], "Fm": [5, 8, 12], "Fmaj7": [5, 9, 12, 16], "E7": [4, 8, 11, 14], "Bb": [10, 14, 17],
    "Gm": [7, 10, 14], "Gm7": [7, 10, 14, 17], "A": [9, 13, 16], "Bdim": [11, 14, 17], "Em": [4, 7, 11],
}


def chord_tones(name, base):
    return [base + c for c in CHORDS[name]]


def melody_line(prog, rhythms, start=72, lo=67, hi=84, seed=0, scale=(0, 2, 4, 5, 7, 9, 11), key=0):
    """코드 톤 중심의 간단한 선율 생성. 반환: [(beat, midi, dur)]"""
    r = np.random.default_rng(seed)
    out, cur = [], start
    for bar, (ch, rh) in enumerate(zip(prog, rhythms)):
        tones = sorted({(key + c) % 12 for c in CHORDS[ch]})
        scl = [(key + s) % 12 for s in scale]
        for j, (b, d) in enumerate(rh):
            strong = abs(b - round(b)) < 1e-6
            pool = tones if strong or j == 0 else scl
            cands = [m for m in range(lo, hi + 1) if m % 12 in pool]
            w = np.array([np.exp(-abs(m - cur) / 2.2) for m in cands])
            cur = int(r.choice(cands, p=w / w.sum()))
            out.append((bar * 4 + b, cur, d))
    return out


# ───────────────────────── BGM ─────────────────────────
def bgm_town_awake():
    """음악이 돌아온 마을: 통통 튀는 래그타임 스윙 (C장조, 138 BPM, 16마디)"""
    sr = 22050
    prog = ["C", "A7", "Dm7", "G7", "C", "C7", "F", "Fm", "C", "A7", "D7", "G7", "C", "A7", "Dm7", "G7"]
    tr = Track(138, 64, sr, swing=0.33)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        fifth = root + 7 if CHORDS[ch][0] < 5 else root - 5
        tr.add(b0, tuba(hz(root), 0.4, sr), 0.55)  # 움(oom)
        tr.add(b0 + 2, tuba(hz(fifth), 0.4, sr), 0.5)
        for b in (1, 3):  # 파(pah) — 피아노 코드
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.18, sr, 0.2, 0.8))
            tr.add(b0 + b, brush(0.12, sr), 0.25)
        for b in (0, 2):
            tr.add(b0 + b, kick(sr), 0.3)
        tr.add(b0 + 3.5, banjo(hz(chord_tones(ch, 60)[-1]), 0.1, sr), 0.12)
    rhythm_a = [(0, .5), (.5, .5), (1, 1), (2, .5), (2.5, .5), (3, 1)]
    rhythm_b = [(0, 1.5), (1.5, .5), (2, .5), (2.5, 1.5)]
    rhythm_c = [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, 2)]
    rhythm_end = [(0, 1), (1, 1), (2, 2)]
    rh = [rhythm_a, rhythm_b, rhythm_a, rhythm_c] * 3 + [rhythm_a, rhythm_b, rhythm_c, rhythm_end]
    mel = melody_line(prog, rh, start=72, seed=7)
    mel[-1] = (mel[-1][0], 72, mel[-1][2])  # 도로 끝 → 처음과 이어짐
    for b, m, d in mel:
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.95, sr), 0.32)
        if d >= 1:
            tr.add(b, piano(hz(m + 12), 0.15, sr, 0.08))
    return tr.render_loop(rev_mix=0.14, lofi=4200, crackle=0.010), sr


def bgm_town_sleepy():
    """음악이 멈춘 마을: 태엽 풀린 오르골. 느리고 처지는 A단조 (66 BPM, 8마디)"""
    sr = 22050
    prog = ["Am", "Fmaj7", "Dm", "E7", "Am", "Fmaj7", "Dm", "E7"]
    tr = Track(66, 32, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        tones = chord_tones(ch, 57)
        for i, b in enumerate([0, 1, 2, 3]):
            m = tones[i % len(tones)]
            # 태엽이 풀리듯 박자가 조금씩 늦어지고 음정이 처짐
            late = 0.06 * i
            tr.add(b0 + b + late, musicbox(hz(m) * (1 - 0.004 * i), 0.5, sr, 0.25))
        tr.add(b0, piano(hz(33 + CHORDS[ch][0]), 1.5, sr, 0.25, 0.5))
        for b in range(8):  # 멀리서 들리는 시계 소리
            tr.add(b0 + b * 0.5, tick(sr, 0.05 if b % 2 else 0.08, 2600 if b % 2 else 3000))
    mel = [(0, "E5", 2), (2, "C5", 2), (4, "A4", 3), (8, "F5", 2), (10, "E5", 1), (11, "D5", 1),
           (12, "B4", 4), (16, "E5", 2), (18, "C5", 2), (20, "A4", 3), (24, "D5", 1.5), (25.6, "C5", 1.4),
           (27.2, "B4", 1.6), (29, "G#4", 3)]
    for b, n, d in mel:
        tr.add(b + 0.05, musicbox(hz(midi(n)) * 0.997, d * tr.beat, sr, 0.5))
    return tr.render_loop(rev_mix=0.28, lofi=3000, crackle=0.016), sr


def bgm_house():
    """새집 꾸미기: 따뜻한 왈츠 (F장조 3/4, 108 BPM, 16마디)"""
    sr = 22050
    prog = ["F", "Dm", "Gm7", "C7", "F", "Am", "Bb", "C7", "Dm", "Am", "Bb", "F", "Gm7", "C7", "F", "C7"]
    tr = Track(108, 48, sr)
    mel = {0: ("A4", 2), 2: ("C5", 1), 3: ("D5", 3), 6: ("Bb4", 2), 8: ("A4", 1), 9: ("G4", 3),
           12: ("A4", 2), 14: ("C5", 1), 15: ("E5", 2), 17: ("D5", 1), 18: ("D5", 2), 20: ("C5", 1), 21: ("C5", 3),
           24: ("D5", 2), 26: ("F5", 1), 27: ("E5", 3), 30: ("D5", 2), 32: ("Bb4", 1), 33: ("A4", 3),
           36: ("Bb4", 2), 38: ("G4", 1), 39: ("E4", 2), 41: ("G4", 1), 42: ("F4", 3), 45: ("G4", 2), 47: ("E4", 1)}
    for bar, ch in enumerate(prog):
        b0 = bar * 3
        tr.add(b0, piano(hz(41 + (CHORDS[ch][0] - 5) % 12), 0.6, sr, 0.35, 0.6))
        for b in (1, 2):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.2, sr, 0.12, 0.7))
        tr.add(b0, woodblock(sr, 700, 0.06))
    for b, (n, d) in mel.items():
        tr.add(b, piano(hz(midi(n)), d * tr.beat * 0.9, sr, 0.42, 1.0))
        tr.add(b, musicbox(hz(midi(n) + 12), 0.3, sr, 0.10))
    return tr.render_loop(rev_mix=0.22, lofi=3600, crackle=0.010), sr


def bgm_story():
    """오프닝 컷신: 무성영화 반주 피아노. 수상하지만 귀여운 D단조 (100 BPM, 8마디)"""
    sr = 22050
    prog = ["Dm", "Dm", "Gm", "A7", "Dm", "Bb", "Gm", "A7"]
    tr = Track(100, 32, sr, swing=0.2)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 38 + (CHORDS[ch][0] - 2) % 12
        for b in (0, 2):  # 스트라이드: 낮은 베이스 → 가운데 코드
            tr.add(b0 + b, piano(hz(root if b == 0 else root - 5 + 12 * (root < 43)), 0.3, sr, 0.4, 0.6))
            for m in chord_tones(ch, 57):
                tr.add(b0 + b + 1, piano(hz(m), 0.2, sr, 0.17, 0.7))
    phrase = [(0, "A4", .5), (.5, "Bb4", .5), (1, "A4", .5), (1.5, "G#4", .5), (2, "A4", 1), (3, "D5", 1)]
    bars = [0, 4, 16, 20]
    for bb in bars:
        for b, n, d in phrase:
            tr.add(bb + b, piano(hz(midi(n) + 12), d * tr.beat, sr, 0.33))
    answer = [(8, "D5", 1), (9, "C#5", .5), (9.5, "D5", .5), (10, "E5", 1), (11, "G5", 1),
              (12, "F5", .5), (12.5, "E5", .5), (13, "D5", .5), (13.5, "C#5", .5), (14, "E5", 2),
              (24, "Bb4", 1), (25, "D5", 1), (26, "G5", 2), (28, "E5", 1), (29, "C#5", 1), (30, "A4", 2)]
    for b, n, d in answer:
        tr.add(b, piano(hz(midi(n) + 12), d * tr.beat, sr, 0.3))
    # 째깍 그림자 복선: 낮은 시계 소리
    for b in range(32):
        tr.add(b, tick(sr, 0.05, 1800))
    return tr.render_loop(rev_mix=0.2, lofi=3200, crackle=0.02), sr


def jingle(notes, bpm, sr, inst="clarinet", chord=None, tail=1.2):
    beat = 60 / bpm
    total = max(b + d for b, _, d in notes) * beat + tail
    buf = np.zeros(int(total * sr) + sr)
    for b, n, d in notes:
        i = int(b * beat * sr)
        f = hz(midi(n))
        if inst == "clarinet":
            a, p = clarinet(f, d * beat, sr) * 0.5, piano(f * 2, d * beat, sr, 0.25)
            s = p.copy()
            s[: len(a)] += a
        elif inst == "box":
            s = musicbox(f, d * beat, sr, 0.6)
        else:
            s = piano(f, d * beat, sr, 0.6)
        buf[i:i + len(s)] += s[: len(buf) - i]
    if chord:
        b, names = chord
        i = int(b * beat * sr)
        for n in names:
            s = piano(hz(midi(n)), 1.2, sr, 0.3)
            if n == names[0]:
                tb = tuba(hz(midi(n) - 12), 0.9, sr, 0.3)
                s[: len(tb)] += tb
            buf[i:i + len(s)] += s[: len(buf) - i]
    buf = reverb(buf, sr, mix=0.2)
    buf = lp(hp(buf, 80, sr), 5000, sr)
    end = int(total * sr)
    return fade(norm(buf[:end], 0.85), sr, 0.001, 0.4)


def jingle_quest_clear():
    """태엽을 끝까지 감은 순간 → 음악이 돌아옴 (약 4초)"""
    sr = 44100
    n = [(0, "C5", .25), (.25, "E5", .25), (.5, "G5", .25), (.75, "C6", .75), (1.5, "B5", .25),
         (1.75, "C6", .25), (2, "D6", .5), (2.5, "E6", 1.5)]
    x = jingle(n, 150, sr, chord=(2.5, ["C4", "E4", "G4", "C5"]))
    for k in range(3):  # 마지막 박에 심벌 대신 브러시 롤
        i = int((2.5 + k * 0.08) * 0.4 * sr)
        b = brush(0.4, sr) * 0.2
        x[i:i + len(b)] += b[: len(x) - i]
    return norm(x, 0.85), sr


def jingle_act_end():
    """「제1막 끝」 카드: 무성영화식 마무리 (약 3초)"""
    sr = 44100
    n = [(0, "G4", .5), (.5, "A4", .5), (1, "B4", .5), (1.5, "C5", .5), (2, "G4", .5), (2.5, "C5", 1.5)]
    return jingle(n, 120, sr, inst="piano", chord=(2.5, ["C3", "G3", "C4", "E4"]), tail=1.5), sr


def jingle_tease():
    """제2막 예고: 시계탑 실루엣. 낮은 종 + 불협 (약 3.5초)"""
    sr = 44100
    t = t_axis(3.5, sr)
    x = np.zeros_like(t)
    for st, f in [(0, 98), (0.9, 92.5), (1.8, 87.3)]:
        i = int(st * sr)
        tt = t[: len(t) - i]
        bell = sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (1.2 + k * .6)) for k, a in
                   [(1, 1), (2.76, .5), (5.4, .25), (8.9, .12)])
        x[i:] += bell * 0.6
    for k in range(14):
        i = int((k * 0.25) * sr)
        s = tick(sr, 0.25 if k % 2 == 0 else 0.15, 1500)
        x[i:i + len(s)] += s[: len(x) - i]
    x = reverb(x, sr, mix=0.3, dur=1.8)[: len(t)]
    return fade(norm(lp(x, 4000, sr), 0.85), sr, 0.001, 0.6), sr


# ───────────────────────── SFX ─────────────────────────
SR = 44100


def sfx_ui_click():
    return fade(norm(woodblock(SR, 1400, 1, 0.06), 0.6), SR)


def sfx_ui_toggle():
    a = woodblock(SR, 1100, 1, 0.05)
    b = woodblock(SR, 1650, 1, 0.07)
    x = np.zeros(int(0.13 * SR))
    x[:len(a)] += a
    x[int(0.055 * SR):int(0.055 * SR) + len(b)] += b
    return fade(norm(x, 0.6), SR)


def sfx_toast():
    x = musicbox(hz(midi("G5")), 0.2, SR, 1)[: int(0.5 * SR)]
    y = musicbox(hz(midi("C6")), 0.2, SR, 1)[: int(0.45 * SR)]
    out = np.zeros(int(0.55 * SR))
    out[:len(x)] += x * 0.6
    out[int(0.08 * SR):int(0.08 * SR) + len(y)] += y[: len(out) - int(0.08 * SR)] * 0.6
    return fade(norm(out, 0.6), SR, 0.001, 0.15)


def sfx_dialog_open():
    """자막 카드가 뜰 때: 영사기 셔터 '찰칵' + 낮은 덜컥"""
    x = np.zeros(int(0.3 * SR))
    for i, (d, f, v) in enumerate([(0, 2500, 1), (0.045, 1800, .7)]):
        s = tick(SR, v, f)
        j = int(d * SR)
        x[j:j + len(s)] += s
    thump = kick(SR, 0.5)[: int(0.15 * SR)]
    x[:len(thump)] += lp(thump, 400, SR)
    return fade(norm(reverb(x, SR, mix=.1, dur=.3)[: len(x)], .8), SR)


def sfx_dialog_next():
    s = tick(SR, 1, 2200)
    x = np.zeros(int(0.08 * SR))
    x[:len(s)] += s
    x += woodblock(SR, 600, 0.3, 0.08)
    return fade(norm(x, 0.6), SR)


def blip(f, dur, wob=0):
    t = t_axis(dur, SR)
    ff = f * (1 + wob * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(ff) / SR
    x = (np.sign(np.sin(ph)) * 0.3 + np.sin(ph)) * np.exp(-t * 18)
    return fade(lp(x, 2500, SR), SR, 0.002, 0.01)


def sfx_text_blip_awake():
    """깨어 있는 말투: 짧고 높은 '뽁'(글자마다, 피치는 코드에서 랜덤 0.9~1.1)"""
    return norm(blip(620, 0.045), 0.5)


def sfx_text_blip_sleepy():
    """졸린 말투: 낮고 늘어지는 '우웅'"""
    t = t_axis(0.11, SR)
    f = 260 * (1 - 0.15 * t / 0.11)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.3 * np.sin(3 * ph)) * env_adsr(len(t), SR, .01, .03, .6, .05)
    return norm(lp(x, 1500, SR), 0.45)


def porcelain(f, dur, v=1.0):
    t = t_axis(dur, SR)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (30 + 12 * k)) for k, a in
            [(1, 1), (2.32, .6), (4.1, .35), (6.7, .2)])
    return x * v


def sfx_step(n):
    """찻주전자 발소리: 도자기 '톡' + 바닥 스침"""
    f = 1900 if n == 1 else 2150
    x = porcelain(f, 0.09, 0.5)
    x += lp(noise(len(x)), 1200, SR) * np.exp(-np.arange(len(x)) / SR * 60) * 0.5
    return fade(norm(x, 0.5), SR)


def sfx_jump():
    """스프링 '보잉'"""
    t = t_axis(0.4, SR)
    f = 220 + 520 * (1 - np.exp(-t * 9))
    f *= 1 + 0.08 * np.sin(2 * np.pi * 26 * t) * np.exp(-t * 5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.exp(-t * 6) * np.minimum(1, t / 0.005)
    return fade(norm(x, 0.7), SR, 0.001, 0.05)


def sfx_land():
    x = lp(kick(SR, 1)[: int(0.15 * SR)], 500, SR) * 0.8
    c = porcelain(1700, 0.12, 0.45)
    x[:len(c)] += c
    return fade(norm(x, 0.7), SR)


def sfx_bump():
    """막힌 곳에 부딪힘: 둔한 '퉁'"""
    t = t_axis(0.18, SR)
    x = np.sin(2 * np.pi * (180 - 80 * t / .18) * t) * np.exp(-t * 25)
    x += lp(noise(len(t)), 600, SR) * np.exp(-t * 50) * 0.6
    return fade(norm(x, 0.55), SR)


def sparkle(dur=0.9, n=7, base=2000, seed=3):
    r = np.random.default_rng(seed)
    x = np.zeros(int(dur * SR))
    for k in range(n):
        f = base * 2 ** (r.integers(0, 12) / 12) * (1 + k * 0.08)
        s = musicbox(f, 0.1, SR, 0.4)[: int(0.5 * SR)]
        i = int(k * dur / n * 0.7 * SR)
        x[i:i + len(s)] += s[: len(x) - i]
    return x


def sfx_key_appear():
    """퀘스트 시작 → 열쇠가 맵에 반짝이며 나타남"""
    x = sparkle(1.1, 9, 1600, 5)
    x = reverb(x, SR, mix=.3)[: len(x)]
    return fade(norm(x, 0.6), SR, 0.001, 0.3)


def sfx_quest_start():
    n = [(0, "G4", .5), (.5, "C5", .5), (1, "E5", 1)]
    return jingle(n, 160, SR, inst="clarinet", tail=0.6)


def sfx_key_pickup():
    """열쇠 줍기: 쇠 '찰랑' + 상승 3음"""
    x = np.zeros(int(0.9 * SR))
    for i, n in enumerate(["E6", "G6", "C7"]):
        s = musicbox(hz(midi(n)), 0.1, SR, 0.6)[: int(0.6 * SR)]
        j = int(i * 0.07 * SR)
        x[j:j + len(s)] += s[: len(x) - j]
    jingle_metal = bp(noise(int(0.25 * SR)), 5000, 12000, SR) * np.exp(-np.arange(int(0.25 * SR)) / SR * 20) * 0.3
    x[:len(jingle_metal)] += jingle_metal
    return fade(norm(reverb(x, SR, mix=.2)[: len(x)], 0.75), SR, 0.001, 0.2)


def sfx_keys_complete():
    """열쇠 3개 모두 모음"""
    n = [(0, "C5", .25), (.25, "E5", .25), (.5, "G5", .25), (.75, "C6", 1)]
    return jingle(n, 170, SR, inst="box", tail=0.8)


def sfx_wind_ratchet():
    """태엽 감기 입력 1회(마우스 원 일정 각도 / A·D 1회): 래칫 '드륵'"""
    x = np.zeros(int(0.07 * SR))
    for k, d in enumerate([0, 0.02, 0.04]):
        s = tick(SR, 0.7 - k * 0.15, 3400 - k * 300)
        j = int(d * SR)
        x[j:j + len(s)] += s[: len(x) - j]
    x += lp(noise(len(x)), 900, SR) * np.exp(-np.arange(len(x)) / SR * 50) * 0.3
    return fade(norm(x, 0.55), SR)


def sfx_wind_notch():
    """1/3, 2/3 고정 '딸깍!'"""
    x = np.zeros(int(0.35 * SR))
    s1, s2 = tick(SR, 1, 2800), tick(SR, 1, 2000)
    x[:len(s1)] += s1
    j = int(0.03 * SR)
    x[j:j + len(s2)] += s2
    c = porcelain(1300, 0.3, 0.5)
    x[:len(c)] += c
    return fade(norm(reverb(x, SR, mix=.12, dur=.4)[: len(x)], 0.85), SR)


def sfx_wind_unwind():
    """손을 떼면 천천히 풀림: 느려지는 째깍 (루프 가능, 1.2초)"""
    x = np.zeros(int(1.2 * SR))
    tpos = 0.0
    k = 0
    while tpos < 1.15:
        s = tick(SR, 0.35, 2400 - k * 40)
        j = int(tpos * SR)
        x[j:j + len(s)] += s[: len(x) - j]
        tpos += 0.06 + k * 0.012
        k += 1
    return fade(norm(x, 0.45), SR, 0.001, 0.05)


def sfx_wind_complete():
    """끝까지 감았다! 마지막 딸깍 + 스프링 진동"""
    x = np.zeros(int(1.4 * SR))
    n = sfx_wind_notch()
    x[:len(n)] += n
    t = t_axis(1.2, SR)
    spring = np.sin(2 * np.pi * (330 + 40 * np.sin(2 * np.pi * 18 * t)) * t) * np.exp(-t * 3.5) * 0.5
    j = int(0.08 * SR)
    x[j:j + len(spring)] += spring[: len(x) - j]
    return fade(norm(x, 0.85), SR, 0.001, 0.2)


def sfx_gramo_wake():
    """그라모가 덜컹거리다 깨어남: 덜컹 3번 → 바늘 내려앉는 '치익' → 회전 올라가는 음"""
    x = np.zeros(int(2.0 * SR))
    for k, d in enumerate([0, 0.18, 0.33]):
        s = lp(kick(SR, 0.8), 800, SR)
        j = int(d * SR)
        x[j:j + len(s)] += s[: len(x) - j]
        w = woodblock(SR, 500 + k * 80, 0.5, 0.1)
        x[j:j + len(w)] += w
    j = int(0.55 * SR)
    t = t_axis(0.35, SR)
    needle = bp(noise(len(t)), 1500, 7000, SR) * np.exp(-t * 6) * 0.5
    x[j:j + len(needle)] += needle
    t = t_axis(1.1, SR)
    f = 130 * (0.4 + 0.6 * (1 - np.exp(-t * 4)))  # 턴테이블 회전이 올라옴
    ph = 2 * np.pi * np.cumsum(f) / SR
    spin = (np.sin(ph) + .3 * np.sin(2 * ph) + .15 * np.sin(3 * ph)) * np.minimum(1, t / .1) * np.exp(-np.maximum(0, t - .7) * 6)
    j = int(0.75 * SR)
    x[j:j + len(spin)] += spin[: len(x) - j] * 0.5
    x += film_noise(len(x), SR) * 0.02
    return fade(norm(reverb(x, SR, mix=.15)[: len(x)], 0.85), SR, 0.001, 0.2)


def whoosh(dur, up=True):
    t = t_axis(dur, SR)
    n = noise(len(t))
    out = np.zeros_like(t)
    seg = 256
    for i in range(0, len(t), seg):
        p = i / len(t)
        fc = 300 + 2200 * (p if up else 1 - p)
        out[i:i + seg] = bp(n[i:i + seg + 0], fc * 0.6, fc * 1.6, SR)[: len(out[i:i + seg])]
    e = np.sin(np.pi * np.minimum(1, t / dur)) ** 1.5
    return lp(out, 4000, SR) * e


def sfx_iris_close():
    """원형 전환 닫힘: 오므라드는 '슈욱' + 끝에 '퐁'"""
    x = whoosh(0.45, up=False) * 0.8
    x = np.pad(x, (0, int(0.15 * SR)))
    p = blip(330, 0.12) * 0.8
    j = int(0.42 * SR)
    x[j:j + len(p)] += p[: len(x) - j]
    return fade(norm(x, 0.7), SR)


def sfx_iris_open():
    x = whoosh(0.45, up=True) * 0.8
    return fade(norm(x, 0.6), SR)


def sfx_door():
    """집 문 열림: 나무 문 '끼익' + 문고리"""
    t = t_axis(0.5, SR)
    f = 420 + 140 * np.sin(2 * np.pi * 2.2 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    creak = np.sign(np.sin(ph)) * (rng.uniform(0.5, 1, len(t)) > 0.7) * np.exp(-t * 3)
    creak = bp(creak.astype(float), 400, 2500, SR) * 0.5
    latch = tick(SR, 1, 1900)
    x = np.zeros(int(0.55 * SR))
    x[:len(latch)] += latch
    x[int(0.04 * SR):int(0.04 * SR) + len(creak)] += creak[: len(x) - int(0.04 * SR)]
    return fade(norm(x, 0.6), SR)


def sfx_furn_select():
    """가구 고르기/집기: 가벼운 '폭'"""
    return norm(blip(880, 0.07), 0.45)


def sfx_furn_place():
    """가구 놓기: 나무 '쿵'"""
    x = lp(kick(SR, 1)[: int(0.2 * SR)], 700, SR) * 0.7
    w = woodblock(SR, 420, 0.6, 0.12)
    x[:len(w)] += w
    return fade(norm(x, 0.7), SR)


def sfx_furn_flip():
    """좌우 뒤집기: 짧은 '휙'"""
    return fade(norm(whoosh(0.16, True), 0.5), SR)


def sfx_furn_delete():
    """가구 삭제: 연기 '펑'"""
    t = t_axis(0.35, SR)
    x = lp(noise(len(t)), 1800, SR) * np.exp(-t * 12)
    x += np.sin(2 * np.pi * (200 - 120 * t / .35) * t) * np.exp(-t * 15) * 0.6
    return fade(norm(x, 0.6), SR)


def sfx_reward_unlock():
    """피프의 배달: 우체통 종 '딸랑딸랑' + 새 가구 해금"""
    x = np.zeros(int(1.3 * SR))
    for k in range(4):
        t = t_axis(0.7, SR)
        f = 1760 if k % 2 == 0 else 2093
        bell = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (5 + m * 2)) for m, a in
                   [(1, 1), (2.4, .4), (3.9, .2)])
        j = int(k * 0.11 * SR)
        x[j:j + len(bell)] += bell[: len(x) - j] * 0.4
    s = sparkle(0.6, 5, 2400, 9)
    j = int(0.5 * SR)
    x[j:j + len(s)] += s[: len(x) - j]
    return fade(norm(reverb(x, SR, mix=.2)[: len(x)], 0.75), SR, 0.001, 0.3)


def sfx_story_next():
    """컷신 다음 카드: 영사기 필름 넘김 '촤락'"""
    x = np.zeros(int(0.25 * SR))
    for k in range(5):
        s = tick(SR, 0.8 - k * 0.12, 2200)
        j = int(k * 0.025 * SR)
        x[j:j + len(s)] += s[: len(x) - j]
    x += lp(noise(len(x)), 3000, SR) * np.exp(-np.arange(len(x)) / SR * 25) * 0.15
    return fade(norm(x, 0.6), SR)


def amb_projector():
    """컷신·필름 분위기 루프: 영사기 돌아가는 소리 (2초 루프, 24fps 셔터)"""
    dur = 2.0
    n = int(dur * SR)
    x = lp(noise(n), 1200, SR) * 0.15
    for k in range(int(dur * 24)):
        s = tick(SR, 0.25 + 0.05 * (k % 2), 1400)
        j = int(k / 24 * SR)
        x[j:j + len(s)] += s[: n - j]
    t = np.arange(n) / SR
    x += np.sin(2 * np.pi * 48 * t) * 0.05  # 모터 험 (2초 안에 정수 주기)
    x += film_noise(n, SR) * 0.05
    return norm(x, 0.5)


# ───────────────────────── 제2막 보스: 째깍 백작 ─────────────────────────
def bgm_boss():
    """보스전: 빠른 갤럽 + 째깍 하이햇. E단조, 168 BPM, 16마디. 무섭기보다 소란스러운 카툰 추격"""
    sr = 22050
    prog = ["Em", "Em", "Am", "B7", "Em", "Em", "C", "B7", "Am", "Em", "Am", "B7", "C", "Am", "B7", "B7"]
    CHORDS["B7"] = [11, 15, 18, 21]
    tr = Track(168, 64, sr)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 40 + (CHORDS[ch][0] - 4) % 12
        for b in (0, 2):
            tr.add(b0 + b, tuba(hz(root), 0.25, sr), 0.6)
            tr.add(b0 + b, kick(sr), 0.35)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.12, sr, 0.17, 0.9))
            tr.add(b0 + b, brush(0.1, sr), 0.35)
        for k in range(8):  # 째깍째깍
            tr.add(b0 + k * 0.5, tick(sr, 0.13 if k % 2 else 0.2, 3400 if k % 2 else 2600))
    run = [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1)]
    stab = [(0, 1), (1, .5), (1.5, .5), (2, 2)]
    rh = [run, stab, run, run] * 4
    mel = melody_line(prog, rh, start=76, lo=69, hi=88, seed=21, scale=(0, 2, 3, 5, 7, 8, 11), key=4)
    for b, m, d in mel:
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.85, sr, vib=6.5), 0.3)
        tr.add(b, piano(hz(m), 0.1, sr, 0.12))
    for bar in (3, 7, 11, 15):  # 마디 끝마다 자명종 '따르릉'
        for k in range(6):
            tr.add(bar * 4 + 3 + k / 6, bell_hit(sr, 1320, 0.12, 0.15))
    return tr.render_loop(rev_mix=0.12, lofi=4500, crackle=0.010), sr


def bell_hit(sr, f, dur, vel):
    t = t_axis(dur + 0.3, sr)
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (8 + 3 * k)) for k, a in
               [(1, 1), (2.76, .45), (5.4, .2)]) * vel


def jingle_boss_clear():
    """백작이 뻐꾸기시계가 됨 → 승리 (약 4초)"""
    sr = 44100
    n = [(0, "G4", .25), (.25, "C5", .25), (.5, "E5", .25), (.75, "G5", .25), (1, "C6", .5), (1.5, "G5", .25),
         (1.75, "C6", .25), (2, "E6", .5), (2.5, "D6", .25), (2.75, "E6", .25), (3, "C6", 1.5)]
    return jingle(n, 150, sr, chord=(3, ["C3", "G3", "C4", "E4", "G4"]), tail=1.5), sr


def sfx_boss_slam():
    """째깍 충격파: 바닥 '쿵' + 금속 울림 + 퍼지는 링"""
    x = np.zeros(int(1.0 * SR))
    k = kick(SR, 1)
    x[:len(k)] += lp(k, 300, SR) * 1.2
    t = t_axis(0.9, SR)
    ring = np.sin(2 * np.pi * (180 + 60 * np.exp(-t * 4)) * t) * np.exp(-t * 4) * 0.4
    x[:len(ring)] += ring
    x[:int(0.2 * SR)] += lp(noise(int(0.2 * SR)), 900, SR) * np.exp(-np.arange(int(0.2 * SR)) / SR * 25) * 0.6
    return fade(norm(reverb(x, SR, mix=.2)[: len(x)], 0.9), SR, 0.001, 0.2)


def sfx_boss_tele():
    """공격 예고: 태엽 감기는 '끼리릭' 상승 (0.6초)"""
    x = np.zeros(int(0.6 * SR))
    k, tpos = 0, 0.0
    while tpos < 0.55:
        s = tick(SR, 0.3 + k * 0.02, 1800 + k * 90)
        j = int(tpos * SR)
        x[j:j + len(s)] += s[: len(x) - j]
        tpos += max(0.02, 0.07 - k * 0.004)
        k += 1
    return fade(norm(x, 0.55), SR)


def sfx_gear_warn():
    """톱니 등장 경고: 짧은 '띵띵'"""
    x = np.zeros(int(0.4 * SR))
    for j in (0, int(0.12 * SR)):
        s = bell_hit(SR, 1760, 0.05, 0.5)[: len(x) - j]
        x[j:j + len(s)] += s
    return fade(norm(x, 0.5), SR, 0.001, 0.1)


def sfx_gear_roll():
    """톱니 굴러감: 덜거덕 루프 (1초, 반복 재생)"""
    n = SR
    x = lp(noise(n), 700, SR) * 0.25
    for k in range(16):
        s = tick(SR, 0.4, 1200 + (k % 4) * 150)
        j = int(k / 16 * n)
        x[j:j + len(s)] += s[: n - j]
    t = np.arange(n) / SR
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 4 * t)
    return norm(x, 0.5)


def sfx_boss_bell():
    """졸음 종소리: 느리게 울리는 낮은 종 + 하품하듯 내려가는 음"""
    x = np.zeros(int(2.4 * SR))
    for j, f in [(0, 523), (int(0.5 * SR), 494)]:
        s = bell_hit(SR, f, 1.5, 0.6)[: len(x) - j]
        x[j:j + len(s)] += s
    t = t_axis(1.4, SR)
    yawn = np.sin(2 * np.pi * np.cumsum(330 * (1 - 0.35 * t / 1.4)) / SR) * np.sin(np.pi * t / 1.4) * 0.25
    j = int(0.9 * SR)
    x[j:j + len(yawn)] += yawn
    return fade(norm(reverb(x, SR, mix=.35, dur=1.6)[: len(x)], 0.8), SR, 0.001, 0.5)


def sfx_player_hit():
    """보글 피격: 태엽 1칸 풀림 — '뾰잉' 하강 + 도자기 '쨍'"""
    t = t_axis(0.5, SR)
    f = 700 * np.exp(-t * 2.5) + 150
    f *= 1 + 0.1 * np.sin(2 * np.pi * 22 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    c = porcelain(2400, 0.2, 0.6)
    x[:len(c)] += c
    return fade(norm(x, 0.75), SR, 0.001, 0.08)


def sfx_player_faint():
    """태엽 다 풀림 → 잠듦: 길게 풀리는 째깍 + 내려가는 음"""
    x = np.zeros(int(2.0 * SR))
    u = sfx_wind_unwind()
    x[:len(u)] += u
    t = t_axis(1.8, SR)
    f = 400 * (1 - 0.6 * t / 1.8)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.4
    j = int(0.2 * SR)
    x[j:j + len(s)] += s
    return fade(norm(x, 0.7), SR, 0.001, 0.3)


def sfx_boss_tired():
    """백작이 지쳐 주저앉음: '치익' 김 빠지는 소리"""
    t = t_axis(1.2, SR)
    x = bp(noise(len(t)), 2500, 9000, SR) * (np.minimum(1, t / 0.05)) * np.exp(-t * 2.2)
    k = lp(kick(SR, 0.6), 400, SR)
    x[:len(k)] += k
    return fade(norm(x, 0.6), SR, 0.001, 0.2)


def sfx_spring_pop():
    """과감기 성공 → 스프링이 튕겨 나감: 큰 '뽀요옹'"""
    t = t_axis(0.9, SR)
    f = 180 + 900 * (1 - np.exp(-t * 6))
    f *= 1 + 0.15 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 2)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.exp(-t * 3)
    s = tick(SR, 1, 2500)
    x[:len(s)] += s
    return fade(norm(reverb(x, SR, mix=.15)[: len(x)], 0.85), SR, 0.001, 0.15)


def sfx_boss_cuckoo():
    """백작이 뻐꾸기시계로 돌아감: '뻐꾹 뻐꾹'"""
    x = np.zeros(int(1.6 * SR))
    for j0 in (0, int(0.7 * SR)):
        for d, f in [(0, 784), (0.18, 622)]:
            t = t_axis(0.2, SR)
            s = (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env_adsr(len(t), SR, .01, .05, .7, .08)
            j = j0 + int(d * SR)
            x[j:j + len(s)] += s[: len(x) - j]
    w = woodblock(SR, 800, 0.4)
    x[:len(w)] += w
    return fade(norm(reverb(x, SR, mix=.25)[: len(x)], 0.75), SR, 0.001, 0.2)


def sfx_round_card():
    """라운드 시작 카드: 시계탑 종 1번 + 드럼 '둥'"""
    x = np.zeros(int(1.6 * SR))
    b = bell_hit(SR, 392, 1.2, 0.7)
    x[:len(b)] += b
    k = kick(SR, 1)
    x[:len(k)] += k * 0.6
    return fade(norm(reverb(x, SR, mix=.3, dur=1.4)[: len(x)], 0.8), SR, 0.001, 0.4)


BGM = {
    "bgm_town_sleepy": bgm_town_sleepy,
    "bgm_town_awake": bgm_town_awake,
    "bgm_house": bgm_house,
    "bgm_story": bgm_story,
    "jingle_quest_clear": jingle_quest_clear,
    "jingle_act_end": jingle_act_end,
    "jingle_tease": jingle_tease,
    "bgm_boss": bgm_boss,
    "jingle_boss_clear": jingle_boss_clear,
}
SFX = {
    "sfx_ui_click": sfx_ui_click, "sfx_ui_toggle": sfx_ui_toggle, "sfx_toast": sfx_toast,
    "sfx_dialog_open": sfx_dialog_open, "sfx_dialog_next": sfx_dialog_next,
    "sfx_text_blip_awake": sfx_text_blip_awake, "sfx_text_blip_sleepy": sfx_text_blip_sleepy,
    "sfx_step_01": lambda: sfx_step(1), "sfx_step_02": lambda: sfx_step(2),
    "sfx_jump": sfx_jump, "sfx_land": sfx_land, "sfx_bump": sfx_bump,
    "sfx_quest_start": sfx_quest_start, "sfx_key_appear": sfx_key_appear,
    "sfx_key_pickup": sfx_key_pickup, "sfx_keys_complete": sfx_keys_complete,
    "sfx_wind_ratchet": sfx_wind_ratchet, "sfx_wind_notch": sfx_wind_notch,
    "sfx_wind_unwind": sfx_wind_unwind, "sfx_wind_complete": sfx_wind_complete,
    "sfx_gramo_wake": sfx_gramo_wake,
    "sfx_iris_close": sfx_iris_close, "sfx_iris_open": sfx_iris_open, "sfx_door": sfx_door,
    "sfx_furn_select": sfx_furn_select, "sfx_furn_place": sfx_furn_place,
    "sfx_furn_flip": sfx_furn_flip, "sfx_furn_delete": sfx_furn_delete,
    "sfx_reward_unlock": sfx_reward_unlock, "sfx_story_next": sfx_story_next,
    "amb_projector": amb_projector,
    "sfx_boss_slam": sfx_boss_slam, "sfx_boss_tele": sfx_boss_tele, "sfx_gear_warn": sfx_gear_warn,
    "sfx_gear_roll": sfx_gear_roll, "sfx_boss_bell": sfx_boss_bell, "sfx_player_hit": sfx_player_hit,
    "sfx_player_faint": sfx_player_faint, "sfx_boss_tired": sfx_boss_tired, "sfx_spring_pop": sfx_spring_pop,
    "sfx_boss_cuckoo": sfx_boss_cuckoo, "sfx_round_card": sfx_round_card,
}

if __name__ == "__main__":
    flt = sys.argv[1] if len(sys.argv) > 1 else ""
    print("BGM / 징글")
    for name, fn in BGM.items():
        if flt in name:
            x, sr = fn()
            save(name, x, sr, "bgm")
    print("SFX")
    for name, fn in SFX.items():
        if flt in name:
            out = fn()
            x, sr = out if isinstance(out, tuple) else (out, SR)
            save(name, x, sr, "sfx")

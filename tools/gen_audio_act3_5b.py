"""태엽 마을 — 새 3~5막(볼트 남작 이야기) 소리 생성기 (jobs/AUDIO2.md 기준, numpy + scipy 절차 합성)

실행:  python tools/gen_audio_act3_5b.py            # 전체
       python tools/gen_audio_act3_5b.py act3       # 막 단위 (act3 | act4 | act5)
       python tools/gen_audio_act3_5b.py sfx_freeze # 이름 일부

tools/gen_audio.py · tools/gen_audio_act3_5.py의 악기·도구 함수를 가져다 쓴다. 기존 곡은 바꾸지 않는다.
소리 방향: 태엽 쪽 = 래그타임·스윙·오르골 / 볼트 남작 = 발전기 험·톱니파·정확한 박자 / 문지기 = 튜바 + 전기 버즈
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_audio as GA  # noqa: E402
from gen_audio import (CHORDS, SR, Track, bell_hit, banjo, bp, brush, chord_tones, clarinet, env_adsr,  # noqa: E402
                       fade, film_noise, hp, hz, kick, lp, melody_line, midi, musicbox, noise, norm, piano,
                       porcelain, reverb, save, t_axis, tick, tuba, woodblock)
from gen_audio_act3_5 import (AWAKE_PROG, BSR, battery_click, clap, creak, horn, jingle_mix, loop_filter,  # noqa: E402
                              mains_hum, metal, place, render_dry, sine, sq, static, steam, sweep, awake_melody)

CHORDS.update({"Eb": [3, 7, 10], "Cm": [0, 3, 7], "B7": [11, 15, 18, 21]})


# ───────────────────────── 공용 도구 ─────────────────────────
def saw(f, dur, sr, vel=1.0, a=0.003, r=0.02, s=0.85):
    """대역 제한 톱니파 (볼트 남작 쪽 리프)"""
    t = t_axis(dur, sr)
    x = np.zeros_like(t)
    k = 1
    while k * f < sr * 0.4:
        x += ((-1) ** (k + 1)) * np.sin(2 * np.pi * f * k * t) / k
        k += 1
    return x * 0.6 * env_adsr(len(t), sr, a=a, d=0.02, s=s, r=r) * vel


def loop_tone(n, sr, f, harm=((1, 1),)):
    """n 샘플 안에 정수 주기가 들어가도록 주파수를 맞춘 지속음 → 루프 이음새 없음"""
    cyc = max(1, round(f * n / sr))
    ph = 2 * np.pi * cyc * np.arange(n) / n
    return sum(a * np.sin(k * ph) for k, a in harm)


def zap(dur, sr, vel=1.0, lo=1200, hi=9000):
    """짧은 파지직: 빠른 지지직 + 낮은 사각파 버즈"""
    n = int(dur * sr)
    t = np.arange(n) / sr
    x = static(n, sr, rate=260, lo=lo, hi=min(hi, sr * 0.44)) + sq(90, dur, sr, 0.35, r=0.005)
    return x * np.clip(t / 0.003, 0, 1) * np.exp(-t * 4 / max(dur, 0.05)) * vel


def ratchet_click(sr=SR, vel=1.0, f=2600):
    """태엽 래칫 '긱' 한 번"""
    x = np.zeros(int(0.06 * sr))
    place(x, tick(sr, vel, f), 0, sr)
    place(x, woodblock(sr, 700, 0.35 * vel, 0.04), 0.004, sr)
    return x


def croak_tuba(f, dur, sr, vel=1.0):
    """개굴 튜바: 음 첫머리가 위에서 미끄러져 내려앉는 통통한 저음"""
    t = t_axis(dur, sr)
    ff = f * (1 + 0.12 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(ff) / sr
    x = np.sin(ph) + 0.55 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.12 * np.sin(4 * ph)
    return lp(x, 900, sr) * env_adsr(len(t), sr, a=0.01, d=0.05, s=0.5, r=0.04) * vel


def buzz_hit(sr, vel=1.0):
    """전기 버즈 타악 '브즛' (스네어 자리)"""
    n = int(0.11 * sr)
    t = np.arange(n) / sr
    x = (sq(70, 0.11, sr, 0.6, r=0.01) + static(n, sr, rate=300, lo=900, hi=min(7000, sr * 0.44)) * 0.6)
    return x * np.exp(-t * 28) * vel


# ───────────────────────── 3막 BGM · SFX ─────────────────────────
def bgm_recall_night():
    """회수 신호 밤·고백: 불길한 저음 드론 + 멀리서 울리는 사이렌 사인파. 60BPM A단조 8마디(32초)"""
    sr = BSR
    tr = Track(60, 32, sr)
    n = tr.len
    t = np.arange(n) / sr
    T = n / sr
    drone = loop_tone(n, sr, 55, ((1, 1), (2, .35), (3, .12))) * 0.22
    drone += loop_tone(n, sr, 82.6, ((1, 1),)) * 0.08 * (0.6 + 0.4 * np.sin(2 * np.pi * 2 * t / T))  # 5도가 느리게 숨쉼
    f_siren = round(560 * T) / T + 110 * np.sin(2 * np.pi * 4 * t / T)  # 8초에 한 번 오르내림
    siren = np.sin(2 * np.pi * np.cumsum(f_siren) / sr) * (0.5 - 0.5 * np.cos(2 * np.pi * 4 * t / T)) ** 2
    siren = loop_filter(siren, sr, 1400) * 0.07
    tr.buf[:n] += drone + siren
    prog = ["Am", "F", "Dm", "E7", "Am", "F", "Bdim", "E7"]
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        tr.add(b0, piano(hz(33 + CHORDS[ch][0] % 12 + 12), 2.5, sr, 0.22, 0.5))
        top = chord_tones(ch, 57)
        tr.add(b0 + 2, piano(hz(top[-1]), 1.5, sr, 0.09, 0.6))
        if bar % 2 == 1:  # 단2도 부딪힘 한 번
            tr.add(b0 + 3, piano(hz(top[-1] + 1), 0.8, sr, 0.05, 0.6))
    return tr.render_loop(rev_mix=0.35, lofi=2800, crackle=0.010)


def bgm_departure():
    """그라모의 열쇠·출발: 마을 곡 선율을 오르골로 느리게. 72BPM 16마디, 따뜻하고 쓸쓸하게"""
    sr = BSR
    tr = Track(72, 64, sr, swing=0.15)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 48 + CHORDS[ch][0] % 12
        tr.add(b0, piano(hz(root - 12), 2.0, sr, 0.18, 0.5))
        for k, m in enumerate(chord_tones(ch, 55)):  # 펼친 화음
            tr.add(b0 + 1 + k * 0.5, piano(hz(m), 1.2, sr, 0.07, 0.5))
    for b, m, d in awake_melody():
        tr.add(b, musicbox(hz(m + 12), d * tr.beat, sr, 0.3))
        if d >= 2:
            tr.add(b + 0.02, musicbox(hz(m), d * tr.beat, sr, 0.1))
    return tr.render_loop(rev_mix=0.28, lofi=3800, crackle=0.012)


def sfx_battery_insert():
    """건전지 끼우기 완료: 덮개 열림 → 밀어 넣는 마찰 → 딸깍 → 전자음 상승 (0.85초)"""
    n = int(0.85 * SR)
    x = np.zeros(n)
    place(x, metal(2400, 0.04, SR, 0.5, 140), 0, SR)
    place(x, creak(0.09, SR, 60, 90, seed=6), 0.02, SR, 0.35)
    m = int(0.2 * SR)
    fr = bp(noise(m), 900, 4500, SR) * np.linspace(0.3, 1, m) * np.hanning(m) ** 0.4
    place(x, fr, 0.12, SR, 0.45)
    place(x, battery_click(), 0.33, SR)
    place(x, lp(kick(SR, 0.4), 300, SR)[: int(0.08 * SR)], 0.33, SR)
    k = int(0.3 * SR)
    place(x, sweep(330, 1320, 0.3, SR, harm=(1, 3)) * np.sin(np.pi * np.linspace(0, 1, k)) * 0.35, 0.4, SR)
    return fade(norm(x, 0.75), SR, 0.001, 0.1)


def sfx_battery_shake():
    """건전지 빼기 모달 A·D 한 번: 금속 덜그럭 (0.18초)"""
    r = np.random.default_rng(41)
    x = np.zeros(int(0.18 * SR))
    for d in (0, 0.025, 0.05, 0.085):
        place(x, metal(r.uniform(1600, 2600), 0.05, SR, r.uniform(0.4, 0.8), 110), d, SR)
    place(x, lp(noise(len(x)), 1500, SR) * np.exp(-np.arange(len(x)) / SR * 25), 0, SR, 0.15)
    return fade(norm(x, 0.6), SR, 0.001, 0.02)


def sfx_battery_pop():
    """건전지가 빠짐: 뽁! + 전자음 하강 + 태엽 래칫 한 번 (0.9초)"""
    x = np.zeros(int(0.9 * SR))
    t = t_axis(0.15, SR)
    pop = np.sin(2 * np.pi * np.cumsum(420 + 900 * np.exp(-t * 35)) / SR) * np.exp(-t * 22)
    place(x, pop, 0, SR, 0.8)
    place(x, bp(noise(int(0.015 * SR)), 1200, 6000, SR), 0, SR, 0.4)
    k = int(0.35 * SR)
    place(x, sweep(1000, 180, 0.35, SR, harm=(1, 3)) * np.linspace(1, 0, k) ** 0.7 * 0.35, 0.08, SR)
    place(x, ratchet_click(SR, 0.9), 0.55, SR)
    return fade(norm(x, 0.75), SR, 0.001, 0.08)


def sfx_recall_signal():
    """회수 신호: 멀리서 다가오며 커지는 붉은 사이렌 파동 3번 (3.3초)"""
    n = int(3.3 * SR)
    x = np.zeros(n)
    for i in range(3):
        d = 0.9
        tt = t_axis(d, SR)
        f = 520 + 380 * np.sin(np.pi * tt / d)  # 오르고 내리는 한 번의 '위잉'
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        s *= np.sin(np.pi * tt / d) ** 1.5
        s = lp(s, 900 + i * 1200, SR)  # 가까워질수록 밝아짐
        place(x, s, i * 1.0, SR, [0.3, 0.6, 1.0][i])
    x = reverb(x, SR, mix=0.35, dur=1.4)[:n]
    x += mains_hum(n, SR, 50) * 0.04 * np.linspace(0.3, 1, n)
    return fade(norm(x, 0.8), SR, 0.002, 0.3)


def sfx_thread_pull():
    """태엽 힘이 실로 빠져나감: 스프링이 풀리며 쭉 늘어나는 하강 글리산도 (1.4초)"""
    t = t_axis(1.4, SR)
    f = 1100 * (0.12 ** (t / 1.4)) * (1 + 0.06 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 1.5))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3.02 * ph)) * np.clip(t / 0.02, 0, 1)
    x *= np.clip((1.4 - t) / 0.4, 0, 1)
    tpos, k = 0.0, 0
    while tpos < 1.0:  # 풀리는 래칫이 점점 느려짐
        place(x, tick(SR, 0.25, 2600 - k * 60), tpos, SR)
        tpos += 0.035 + k * 0.009
        k += 1
    return fade(norm(reverb(x, SR, mix=0.15, dur=0.6)[: len(x)], 0.7), SR, 0.002, 0.05)


def sfx_freeze():
    """사물이 회색으로 굳음: 하강음 + 금속 정적, 끝이 뚝 끊김 (0.9초)"""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = sweep(900, 140, 0.9, SR, harm=(1, 2, 3)) * 0.35
    ring = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1830, 1), (2740, .6), (4410, .3)]) * 0.06
    stat = bp(noise(n), 3000, 9000, SR) * 0.08 * np.linspace(0.3, 1, n)
    x = (s + ring + stat) * np.clip(t / 0.01, 0, 1)
    x[int(0.86 * SR):] *= np.linspace(1, 0, n - int(0.86 * SR)) ** 4  # 뚝 끊김 (클릭만 막음)
    return norm(x, 0.7)


def sfx_key_give():
    """그라모가 열쇠를 뽑아 건넴: 금속 딸깍 + 따뜻한 오르골 한 음 (1.8초)"""
    x = np.zeros(int(1.8 * SR))
    place(x, metal(2900, 0.05, SR, 0.7, 120), 0, SR)
    place(x, metal(1900, 0.04, SR, 0.5, 140), 0.015, SR)
    place(x, musicbox(hz(midi("E5")), 0.6, SR, 0.55), 0.18, SR)
    place(x, musicbox(hz(midi("C5")), 0.6, SR, 0.2), 0.19, SR)
    return fade(norm(reverb(x, SR, mix=0.25)[: len(x)], 0.7), SR, 0.001, 0.4)


# ───────────────────────── 4막 · 두꺼비집 문지기 ─────────────────────────
def bgm_toad_boss():
    """4막 중간 보스: 150BPM G단조 16마디. 개굴개굴 통통 튀는 튜바 베이스 + 전기 버즈 타악, 클라리넷 스타카토"""
    sr = BSR
    prog = ["Gm", "Gm", "Cm", "D7", "Gm", "Gm", "Cm", "D7", "Eb", "Eb", "Gm", "Gm", "Cm", "D7", "Gm", "D7"]
    tr = Track(150, 64, sr, swing=0.12)
    for bar, ch in enumerate(prog):
        b0 = bar * 4
        root = 31 + (CHORDS[ch][0] - 7) % 12
        fifth = root + 7
        for b, m, d, v in [(0, root, .35, .6), (.5, root + 12, .15, .4), (1, fifth, .3, .5), (2, root, .35, .6),
                           (2.5, root + 12, .15, .4), (3, fifth, .2, .45), (3.5, fifth + 2 if bar % 2 else root + 11, .15, .4)]:
            tr.add(b0 + b, croak_tuba(hz(m), d, sr), v)
        tr.add(b0, kick(sr), 0.4)
        tr.add(b0 + 2, kick(sr), 0.3)
        for b in (1, 3):
            tr.add(b0 + b, buzz_hit(sr), 0.32)
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, banjo(hz(m), 0.08, sr), 0.06)
        for k in range(8):
            tr.add(b0 + k * 0.5, metal(4500, 0.02, sr, 0.06, 200))
    ra = [(0, .5), (.5, .5), (1, .5), (2, .5), (2.5, .5), (3, .5)]
    rb = [(0, .25), (.25, .25), (.5, .5), (1, 1), (2, .5), (3, .5)]
    mel = melody_line(prog, [ra, rb] * 8, start=74, lo=67, hi=82, seed=77, scale=(7, 9, 10, 0, 2, 3, 6))
    for b, m, d in mel:
        tr.add(b, clarinet(hz(m), d * tr.beat * 0.55, sr), 0.27)  # 스타카토
    for bar in (3, 7, 13, 15):  # 마디 끝 '개굴' 응답
        tr.add(bar * 4 + 3.5, croak_tuba(hz(55), 0.12, sr), 0.4)
    return tr.render_loop(rev_mix=0.1, lofi=5200, crackle=0.006, wow=False)


def jingle_toad_defeat():
    """문지기 쓰러짐: 퓨즈 펑 + 하강하는 튜바 + 짧은 승리 3음 (3.2초)"""
    sr = SR
    buf = np.zeros(int(3.2 * sr))
    place(buf, kick(sr, 1), 0, sr)
    m = int(0.15 * sr)
    place(buf, lp(noise(m), 3500, sr) * np.exp(-np.arange(m) / sr * 30), 0, sr, 0.8)
    place(buf, zap(0.25, sr, 0.5), 0.02, sr)
    for i, n in enumerate(["Bb2", "A2", "Ab2", "G2"]):  # 와-와-와-와아
        d = 0.22 if i < 3 else 0.6
        place(buf, croak_tuba(hz(midi(n)), d, sr) * (1 + 0.3 * (i == 3)), 0.3 + i * 0.24, sr, 0.7)
    for i, (n, d) in enumerate([("G4", 0.12), ("C5", 0.12), ("E5", 0.9)]):
        place(buf, clarinet(hz(midi(n)), d, sr), 1.55 + i * 0.14, sr, 0.5)
        place(buf, piano(hz(midi(n)) * 2, d, sr, 0.2), 1.55 + i * 0.14, sr)
    for nn in ("C4", "E4", "G4"):
        place(buf, piano(hz(midi(nn)), 1.0, sr, 0.25), 1.83, sr)
    place(buf, tuba(hz(midi("C2")), 0.7, sr), 1.83, sr, 0.4)
    return jingle_mix(buf, sr, rev=0.18, fo=0.5)


def sfx_toad_croak():
    """문지기 방전 울음: 낮은 '개-굴' + 전기 버즈 (0.9초)"""
    x = np.zeros(int(0.9 * SR))
    for st, d, f in [(0, 0.22, 95), (0.3, 0.38, 82)]:
        t = t_axis(d, SR)
        ph = 2 * np.pi * np.cumsum(f * (1 - 0.15 * t / d)) / SR
        body = sum(np.sin(k * ph) / k for k in range(1, 12))
        pulse = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 26 * t))) * np.sin(np.pi * t / d) ** 0.5  # 드르르 떨림
        place(x, bp(body, 120, 1400, SR) * pulse, st, SR, 0.8)
    n = len(x)
    tt = np.arange(n) / SR
    x += (sq(60, 0.9, SR, 0.25) + static(n, SR, rate=180, lo=1500, hi=7000) * 0.3) * np.exp(-tt * 3)
    return fade(norm(x, 0.8), SR, 0.002, 0.08)


def sfx_toad_tongue():
    """자석 혀 발사: 쭉 늘어나는 고무 소리 + 자석 '웅' (0.8초)"""
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    f = 180 + 700 * (1 - np.exp(-t * 6))
    f *= 1 + 0.08 * np.sin(2 * np.pi * 18 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    rub = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * np.clip(t / 0.01, 0, 1) * np.exp(-t * 2.5) * 0.5
    hum = (np.sin(2 * np.pi * 75 * t) + 0.5 * np.sin(2 * np.pi * 150 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
    hum *= np.clip((t - 0.1) / 0.15, 0, 1) * np.clip((0.8 - t) / 0.3, 0, 1) * 0.45
    return fade(norm(rub + hum, 0.75), SR, 0.002, 0.05)


def sfx_breaker():
    """차단기 레버 내림: 큰 금속 '철컥' + 전원 꺼지는 하강 (1.3초)"""
    x = np.zeros(int(1.3 * SR))
    place(x, metal(700, 0.3, SR, 1, 22), 0, SR)
    place(x, metal(1500, 0.1, SR, 0.6, 60), 0.012, SR)
    place(x, lp(kick(SR, 0.8), 350, SR), 0, SR)
    t = t_axis(1.1, SR)
    f = 120 * np.exp(-t * 2) + 15
    ph = 2 * np.pi * np.cumsum(f) / SR
    down = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.exp(-t * 2.2) * 0.45
    place(x, down, 0.08, SR)
    place(x, zap(0.12, SR, 0.3), 0.04, SR)
    return fade(norm(reverb(x, SR, mix=0.1, dur=0.5)[: len(x)], 0.85), SR, 0.001, 0.1)


def sfx_floor_charge():
    """바닥 칸 경고: 지지직이 점점 커지는 상승. 정확히 0.8초"""
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    rise = (t / 0.8) ** 1.6
    tone = sweep(200, 900, 0.8, SR, harm=(1, 3, 5)) * 0.3
    x = (static(n, SR, rate=120 + 200 * 0.5, lo=1200, hi=8000) * 0.8 + tone) * rise
    x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    return norm(x, 0.7)


def sfx_floor_zap():
    """바닥 칸 감전: 짧은 파지직 (0.35초)"""
    x = np.zeros(int(0.35 * SR))
    place(x, zap(0.3, SR, 1), 0, SR)
    place(x, lp(kick(SR, 0.5), 300, SR)[: int(0.1 * SR)], 0, SR)
    return fade(norm(x, 0.8), SR, 0.001, 0.04)


def sfx_magnet_loop():
    """자석 흡입 동안(루프 1초): 낮은 웅웅이 4번 맥동 (모두 1초 안에 정수 주기)"""
    n = SR
    t = np.arange(n) / SR
    x = loop_tone(n, SR, 70, ((1, 1), (2, .5), (3, .25), (4, .1)))
    x *= 0.55 + 0.45 * np.sin(2 * np.pi * 4 * t) ** 2
    x += loop_tone(n, SR, 1400, ((1, 1),)) * 0.03 * np.sin(2 * np.pi * 4 * t) ** 2
    return norm(x, 0.55)


# ───────────────────────── 5막 · 볼트 남작 ─────────────────────────
VOLT_PROG = ["Em", "Em", "C", "B7", "Em", "Em", "C", "B7", "Am", "Am", "Em", "Em", "C", "B7", "Em", "B7"]
VOLT_RIFF = [0, 0, 12, 0, 3, 0, 10, 7]  # 8분음 톱니파 리프 (근음 기준)


def volt_rhythm(tr, sr, gain=1.0, riff=True):
    """남작 쪽 리듬: 발전기 험 + 킥 + 금속 '쾅' + 16분 틱 + 톱니 리프"""
    n = tr.len
    tr.buf[:n] += loop_tone(n, sr, 55, ((1, 1), (2, .5), (3, .3), (4, .15))) * 0.07 * gain
    for bar, ch in enumerate(VOLT_PROG):
        b0 = bar * 4
        root = 28 + (CHORDS[ch][0] - 4) % 12
        for b in range(4):
            tr.add(b0 + b, kick(sr), 0.45 * gain)
        for b in (1, 3):
            tr.add(b0 + b, metal(520, 0.18, sr, 0.5, 30), 0.35 * gain)
            m = int(0.06 * sr)
            tr.add(b0 + b, bp(noise(m), 2000, 8000, sr) * np.exp(-np.arange(m) / sr * 60), 0.2 * gain)
        for k in range(16):
            tr.add(b0 + k * 0.25, metal(6200, 0.015, sr, 0.06 if k % 2 else 0.1, 260), gain)
        if riff:
            for k, o in enumerate(VOLT_RIFF):
                tr.add(b0 + k * 0.5, saw(hz(root + 12 + o), 0.16, sr, 0.3, r=0.01), gain)
        if bar % 4 == 3:  # 번개 같은 고음 지지직
            m = int(0.18 * sr)
            tr.add(b0 + 3.5, bp(static(m, sr, rate=300, lo=3000, hi=10000), 3000, 10000, sr), 0.25 * gain)


def bgm_volt_boss():
    """5막 보스 1·2라운드: 168BPM E단조 16마디. 발전기 험 위에 톱니파 리프, 정확한 박자, 위협적이지만 카툰"""
    sr = BSR
    tr = Track(168, 64, sr)
    volt_rhythm(tr, sr)
    for bar, ch in enumerate(VOLT_PROG):
        b0 = bar * 4
        for b in (1.5, 3.5):  # 엇박 화음 찌르기
            for m in chord_tones(ch, 64):
                tr.add(b0 + b, saw(hz(m), 0.1, sr, 0.07, r=0.01))
        if bar % 2 == 1:  # 카툰식 '부웅' 꺾임
            tr.add(b0 + 2, saw(hz(40), 0.5, sr, 0.25, r=0.05) * np.linspace(1, 0.4, int(0.5 * sr)))
    lead = [(0, 64, 1), (1, 67, .5), (1.5, 66, .5), (2, 64, 1), (3, 59, 1)]
    for bar in (8, 9, 12, 13):
        for b, m, d in lead:
            tr.add(bar * 4 + b, sq(hz(m), d * tr.beat * 0.8, sr, 0.12))
    return render_dry(tr, lofi=7500, rev=0.05)


def bgm_volt_final():
    """최종 라운드(라디오 씨 변신 후): 같은 168BPM에 마을 곡 멜로디를 래그타임 금관으로 크게. 보스 리듬은 아래에 깔림"""
    sr = BSR
    tr = Track(168, 64, sr)
    volt_rhythm(tr, sr, gain=0.45, riff=False)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, tuba(hz(root), 0.3, sr), 0.55)
        tr.add(b0 + 2, tuba(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.3, sr), 0.5)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.14, sr, 0.18, 0.9))
            tr.add(b0 + b, brush(0.08, sr), 0.25)
        for k in range(8):  # 남작의 톱니 베이스가 아래에서 같이 달림
            tr.add(b0 + k * 0.5, saw(hz(root - 12 + (12 if k % 2 else 0)), 0.12, sr, 0.09, r=0.01))
    for b, m, d in awake_melody():
        tr.add(b, horn(hz(m), d * tr.beat * 0.92, sr), 0.5)
        tr.add(b, horn(hz(m - 12), d * tr.beat * 0.92, sr), 0.22)
        tr.add(b, clarinet(hz(m + 12), d * tr.beat * 0.9, sr), 0.07)
    return tr.render_loop(rev_mix=0.12, lofi=5500, crackle=0.005, wow=False)


def jingle_radio_reborn():
    """라디오 씨 변신 (7.2초): 꺼진 정적 → 열쇠 감는 래칫(빨라짐) → 나팔 팡파르로 터지는 마을 곡"""
    sr = SR
    buf = np.zeros(int(7.2 * sr))
    n = int(1.2 * sr)
    tt = np.arange(n) / sr
    place(buf, static(n, sr, lo=1500, hi=6000) * np.exp(-tt * 4) * 0.25, 0, sr)  # 남은 지직이 꺼짐
    tpos, gap = 1.3, 0.28
    while tpos < 3.2:
        place(buf, ratchet_click(sr, 0.8), tpos, sr)
        tpos += gap
        gap = max(0.06, gap * 0.85)
    place(buf, sweep(200, 900, 0.9, sr, harm=(1, 2)) * np.linspace(0, 1, int(0.9 * sr)) ** 2 * 0.25, 2.4, sr)
    beat = 60 / 150
    st = 3.35
    mel = [(b, m, d) for b, m, d in awake_melody() if b < 8]
    for b, m, d in mel:
        place(buf, horn(hz(m), d * beat * 0.92, sr), st + b * beat, sr, 0.6)
        place(buf, horn(hz(m - 12), d * beat * 0.92, sr), st + b * beat, sr, 0.25)
    for bar, ch in enumerate(["C", "A7"]):
        for b in range(4):
            r = 36 + CHORDS[ch][0]
            if b % 2 == 0:
                place(buf, tuba(hz(r if b == 0 else r + 7), 0.3, sr), st + (bar * 4 + b) * beat, sr, 0.5)
            else:
                for m in chord_tones(ch, 60):
                    place(buf, piano(hz(m), 0.15, sr, 0.2), st + (bar * 4 + b) * beat, sr)
                place(buf, brush(0.1, sr), st + (bar * 4 + b) * beat, sr, 0.3)
    end = st + 8 * beat
    for m in ("C4", "E4", "G4", "C5"):
        place(buf, horn(hz(midi(m)), 1.2, sr), end, sr, 0.3)
        place(buf, piano(hz(midi(m)), 1.2, sr, 0.3), end, sr)
    place(buf, tuba(hz(midi("C2")), 1.0, sr), end, sr, 0.5)
    place(buf, GA.sparkle(1.0, 8, 2200, seed=9), end, sr, 0.5)
    place(buf, kick(sr, 1), st, sr, 0.6)
    return jingle_mix(buf, sr, rev=0.2, lofi=6000, fo=0.6)


def jingle_volt_defeat():
    """남작이 작은 발전기가 됨 (5.2초): 큰 기계 화음이 높아지고 작아지며 쪼그라들다 오르골 한 소절로"""
    sr = SR
    n_all = int(5.2 * sr)
    buf = np.zeros(n_all)
    d = 2.2
    t = t_axis(d, sr)
    shrink = 2 ** (t / d * 2.2)  # 두 옥타브 남짓 올라감 = 몸이 작아짐
    big = np.zeros(len(t))
    for m in (40, 47, 52, 55):
        ph = 2 * np.pi * np.cumsum(hz(m) * shrink) / sr
        big += sum(((-1) ** (k + 1)) * np.sin(k * ph) / k for k in range(1, 10))
    big += mains_hum(len(t), sr, 55) * 0.6
    big *= np.clip(t / 0.02, 0, 1) * np.linspace(1, 0.05, len(t)) ** 1.3 * 0.25
    place(buf, lp(big, 5000, sr), 0, sr)
    place(buf, metal(500, 0.4, sr, 0.8, 18), 0, sr)
    place(buf, lp(kick(sr, 1), 300, sr), 0, sr)
    place(buf, metal(4200, 0.05, sr, 0.5, 120), 2.15, sr)  # 작은 '딸깍'
    beat = 60 / 100
    for b, m, dd in [(b, m, dd) for b, m, dd in awake_melody() if b < 4]:
        place(buf, musicbox(hz(m + 12), dd * beat, sr, 0.45), 2.4 + b * beat, sr)
    place(buf, musicbox(hz(midi("C6")), 1.0, sr, 0.35), 2.4 + 4 * beat, sr)
    place(buf, musicbox(hz(midi("G5")), 1.0, sr, 0.15), 2.4 + 4 * beat, sr)
    return jingle_mix(buf, sr, rev=0.22, lofi=7000, fo=0.6)


def bgm_ending():
    """결말·이후 마을: 마을 곡을 그라모(피아노)와 라디오 씨(나팔 금관) 듀엣으로. 126BPM 스윙 16마디.
    앞 8마디는 피아노가 선율·나팔이 아래 화음, 뒤 8마디는 나팔이 선율·피아노가 옥타브 위에서 받음"""
    sr = BSR
    tr = Track(126, 64, sr, swing=0.3)
    for bar, ch in enumerate(AWAKE_PROG):
        b0 = bar * 4
        root = 36 + CHORDS[ch][0]
        tr.add(b0, tuba(hz(root), 0.4, sr), 0.45)
        tr.add(b0 + 2, tuba(hz(root + 7 if CHORDS[ch][0] < 5 else root - 5), 0.4, sr), 0.4)
        for b in (1, 3):
            for m in chord_tones(ch, 60):
                tr.add(b0 + b, piano(hz(m), 0.16, sr, 0.14, 0.8))
            tr.add(b0 + b, brush(0.1, sr), 0.2)
        tr.add(b0 + 3.5, banjo(hz(chord_tones(ch, 60)[-1]), 0.1, sr), 0.08)
    for b, m, d in awake_melody():
        bar = int(b // 4)
        ch = AWAKE_PROG[bar]
        below = max([c for c in chord_tones(ch, 48) + chord_tones(ch, 60) + chord_tones(ch, 72) if c <= m - 3] or [m - 12])
        if bar < 8:
            tr.add(b, piano(hz(m), d * tr.beat, sr, 0.42, 1.0))
            if d >= 1:
                tr.add(b, horn(hz(below), d * tr.beat * 0.9, sr), 0.22)
        else:
            tr.add(b, horn(hz(m), d * tr.beat * 0.92, sr), 0.42)
            if d >= 1:
                tr.add(b + 0.5, piano(hz(m + 12), 0.2, sr, 0.18))
    return tr.render_loop(rev_mix=0.16, lofi=4600, crackle=0.010)


def sfx_coolant_spray():
    """냉각수 분사: 치이익 (화이트노이즈 + 저역 필터, 1초)"""
    n = int(1.0 * SR)
    t = np.arange(n) / SR
    x = lp(noise(n), 4500, SR) + 0.5 * bp(noise(n), 5000, 11000, SR) * np.exp(-t * 6)
    x *= np.clip(t / 0.015, 0, 1) * (0.7 + 0.3 * np.exp(-t * 5)) * np.clip((1.0 - t) / 0.35, 0, 1)
    return fade(norm(hp(x, 300, SR), 0.65), SR, 0.001, 0.05)


def sfx_lightning_warn():
    """낙뢰 경고: 짧은 고음 '띠링' (0.35초)"""
    x = np.zeros(int(0.35 * SR))
    for d, f in ((0, 2637), (0.07, 3520)):
        tt = t_axis(0.25, SR)
        place(x, (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 14), d, SR, 0.5)
    return fade(norm(x, 0.55), SR, 0.001, 0.03)


def sfx_lightning_strike():
    """낙뢰: '쾅' + 지지직 꼬리 (1.4초)"""
    n = int(1.4 * SR)
    x = np.zeros(n)
    m = int(0.06 * SR)
    place(x, bp(noise(m), 2000, 12000, SR) * np.exp(-np.arange(m) / SR * 50), 0, SR, 1.0)  # 갈라지는 '쩍'
    place(x, lp(kick(SR, 1), 200, SR), 0.01, SR, 1.0)
    k = int(0.8 * SR)
    place(x, lp(noise(k), 400, SR) * np.exp(-np.arange(k) / SR * 5), 0.01, SR, 0.9)  # 우르릉
    tail = int(1.1 * SR)
    tt = np.arange(tail) / SR
    place(x, static(tail, SR, rate=150, lo=1500, hi=9000) * np.exp(-tt * 3.5), 0.15, SR, 0.35)
    return fade(norm(reverb(x, SR, mix=0.15, dur=0.8)[:n], 0.9), SR, 0.001, 0.2)


def sfx_bomb_roll():
    """건전지 폭탄이 구르는 동안(루프 1초): 덜컹 6번 + 도화선 치익"""
    n = SR
    x = loop_filter(bp(noise(n), 4000, 10000, SR), SR, 9000) * 0.12
    t = np.arange(n) / SR
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 9 * t)
    r = np.random.default_rng(14)
    for k in range(6):
        h = woodblock(SR, 300 + r.uniform(-30, 30), 0.6, 0.07)
        h[: int(0.05 * SR)] += metal(1100 + k % 2 * 200, 0.05, SR, 0.3, 90)
        i = int(k / 6 * n)
        seg = h[: n - i]
        x[i:i + len(seg)] += seg
        if len(h) > len(seg):
            x[: len(h) - len(seg)] += h[len(seg):]  # 넘친 꼬리는 앞으로
    return norm(x, 0.55)


def sfx_bomb_boom():
    """폭탄 터짐: 카툰 '펑' (1.0초)"""
    n = int(1.0 * SR)
    x = np.zeros(n)
    t = t_axis(0.6, SR)
    body = np.sin(2 * np.pi * np.cumsum(45 + 120 * np.exp(-t * 18)) / SR) * np.exp(-t * 6)
    place(x, body, 0, SR, 1.0)
    k = int(0.5 * SR)
    place(x, lp(noise(k), 1800, SR) * np.exp(-np.arange(k) / SR * 9), 0, SR, 0.8)
    place(x, porcelain(1600, 0.1, 0.3), 0.05, SR)
    return fade(norm(reverb(x, SR, mix=0.12, dur=0.6)[:n], 0.9), SR, 0.001, 0.15)


def sfx_plug_pull():
    """보스 플러그 뽑기: 뽁! + 큰 스파크 + 남작의 비명 같은 하강 버즈 (1.7초)"""
    n = int(1.7 * SR)
    x = np.zeros(n)
    t = t_axis(0.15, SR)
    place(x, np.sin(2 * np.pi * np.cumsum(380 + 1100 * np.exp(-t * 30)) / SR) * np.exp(-t * 20), 0, SR, 0.9)
    place(x, zap(0.45, SR, 1.0, lo=800, hi=12000), 0.03, SR, 0.8)
    tt = t_axis(1.3, SR)
    f = 520 * (0.2 ** (tt / 1.3)) * (1 + 0.05 * np.sin(2 * np.pi * 11 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    scream = sum(((-1) ** (k + 1)) * np.sin(k * ph) / k for k in range(1, 14))
    scream = bp(scream, 300, 3000, SR) * np.clip(tt / 0.05, 0, 1) * np.clip((1.3 - tt) / 0.4, 0, 1)
    place(x, scream, 0.25, SR, 0.5)
    return fade(norm(x, 0.85), SR, 0.001, 0.1)


def sfx_volt_laugh():
    """남작 웃음: 톱니파를 음절처럼 끊은 '하-하-하-하' 기계음 (목소리 합성 아님, 1.1초)"""
    x = np.zeros(int(1.1 * SR))
    for i, f in enumerate([233, 220, 208, 196, 175]):
        d = 0.12 if i < 4 else 0.26
        tt = t_axis(d, SR)
        ph = 2 * np.pi * np.cumsum(np.full(len(tt), f)) / SR
        s = sum(((-1) ** (k + 1)) * np.sin(k * ph) / k for k in range(1, 30))
        s = bp(s, 550, 1300, SR) + 0.4 * bp(s, 1700, 2600, SR)  # 기계식 '아' 대역
        s *= np.sign(np.sin(2 * np.pi * 45 * tt)) * 0.15 + 0.85  # 계단식 떨림
        s *= env_adsr(len(tt), SR, a=0.008, d=0.02, s=0.8, r=0.03)
        place(x, s, i * 0.17, SR)
        place(x, bp(noise(int(0.02 * SR)), 2000, 6000, SR) * 0.15, i * 0.17, SR)
    x += sq(60, 1.1, SR, 0.06)[: len(x)]
    return fade(norm(x, 0.75), SR, 0.002, 0.1)


def sfx_volt_overheat():
    """남작 과열: 김 빠지는 '치이익' + 경보 두 번 (1.4초)"""
    x = np.zeros(int(1.4 * SR))
    place(x, steam(SR, 1.2, 1.0), 0, SR, 0.6)
    for d in (0.25, 0.75):
        place(x, sq(988, 0.16, SR, 0.4, r=0.01), d, SR)
        place(x, sq(784, 0.16, SR, 0.4, r=0.01), d + 0.18, SR)
    return fade(norm(lp(x, 8000, SR), 0.75), SR, 0.001, 0.1)


def sfx_radio_jam_beam():
    """라디오 씨 잡음 빔 1.5초: 지지직 빔이 길게, 끝에 힘이 빠짐 (1.6초)"""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    strength = np.clip(t / 0.05, 0, 1) * np.where(t < 1.1, 1.0, np.clip((1.6 - t) / 0.5, 0, 1) ** 1.5)
    f = 110 * np.where(t < 1.1, 1.0, 1 - 0.5 * (t - 1.1) / 0.5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    buzz = (np.sign(np.sin(ph)) * 0.4 + np.sin(2 * ph) * 0.3) * (1 + 0.25 * np.sin(2 * np.pi * 13 * t))
    beam = static(n, SR, rate=180, lo=600, hi=9000) * (0.7 + 0.3 * np.sin(2 * np.pi * 8 * t))
    x = (lp(buzz, 3000, SR) * 0.5 + beam) * strength
    return fade(norm(x, 0.8), SR, 0.002, 0.05)


def sfx_radio_collapse():
    """라디오 씨 쓰러짐: 전원이 천천히 꺼지며 마지막 '지직' 한 번 (2.4초)"""
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    f = 440 * (0.15 + 0.85 * np.exp(-t * 1.1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + 0.25 * np.sign(np.sin(ph))) * 0.3 * np.clip((2.0 - t) / 1.2, 0, 1)
    hum = mains_hum(n, SR, 60) * 0.18 * np.exp(-t * 1.0)
    x = lp(tone + hum, 4000, SR)
    place(x, zap(0.12, SR, 0.7), 2.1, SR)
    place(x, lp(kick(SR, 0.5), 250, SR), 1.7, SR)  # 몸이 털썩
    return fade(norm(x, 0.75), SR, 0.002, 0.05)


def sfx_reborn_horn():
    """변신 중 나팔이 피어남: 금관 글리산도 상승 + 반짝 (1.8초)"""
    x = np.zeros(int(1.8 * SR))
    t = t_axis(1.0, SR)
    f = hz(midi("C4")) * 2 ** (t / 1.0 * 1.0)  # 한 옥타브 미끄러져 오름
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t))) / SR
    br = sum(a * np.sin(k * ph) for k, a in [(1, 1), (2, .7), (3, .5), (4, .35), (5, .2), (6, .1)])
    br = bp(br, 300, 3500, SR) * np.clip(t / 0.1, 0, 1) * np.linspace(0.5, 1, len(t))
    place(x, br, 0, SR, 0.5)
    place(x, horn(hz(midi("C5")), 0.6, SR), 1.0, SR, 0.5)
    place(x, GA.sparkle(0.8, 7, 2400, seed=17), 0.9, SR, 0.6)
    return fade(norm(reverb(x, SR, mix=0.22)[: len(x)], 0.8), SR, 0.002, 0.3)


def sfx_crank_rusty():
    """남작 크랭크 과감기: 녹슨 '끼익' + 래칫 '덜컥' (0.35초)"""
    x = np.zeros(int(0.35 * SR))
    place(x, creak(0.22, SR, 25, 40, seed=11), 0, SR, 0.7)
    t = t_axis(0.2, SR)
    squeal = np.sin(2 * np.pi * np.cumsum(1400 + 300 * np.sin(2 * np.pi * 9 * t)) / SR) * np.sin(np.pi * t / 0.2) * 0.12
    place(x, squeal, 0.02, SR)
    place(x, metal(1300, 0.08, SR, 0.7, 60), 0.22, SR)
    return fade(norm(x, 0.65), SR, 0.001, 0.03)


def sfx_volt_shrink():
    """남작이 작아짐: '뾰로롱' 하강 + 작은 딸깍 (1.0초)"""
    x = np.zeros(int(1.0 * SR))
    for i, m in enumerate([88, 84, 81, 76, 72, 69, 64]):
        place(x, sine(hz(m), 0.09, SR, 0.5, r=0.04), i * 0.07, SR)
    t = t_axis(0.5, SR)
    place(x, np.sin(2 * np.pi * np.cumsum(1500 * 0.4 ** (t / 0.5)) / SR) * np.exp(-t * 4) * 0.25, 0, SR)
    place(x, metal(4500, 0.04, SR, 0.5, 140), 0.62, SR)
    return fade(norm(reverb(x, SR, mix=0.15, dur=0.5)[: len(x)], 0.65), SR, 0.001, 0.1)


def sfx_timestop():
    """Q 갈아끼우기 순간 시간 정지: 낮게 가라앉는 '우웅~'. 피치가 떨어지며 늘어짐. 정확히 0.6초"""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 260 * 0.3 ** ((t / 0.6) ** 0.7)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(a * np.sin(k * ph) for k, a in [(1, 1), (2, .5), (3, .3), (5, .12)])
    x = lp(x, 2500, SR) * np.clip(t / 0.02, 0, 1) * (1 - 0.4 * t / 0.6)
    x += lp(noise(n), 600, SR) * 0.15 * np.exp(-t * 4)
    x[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return norm(reverb(x, SR, mix=0.2, dur=0.5)[:n], 0.7)


def sfx_swap_wind():
    """태엽으로 갈아끼울 때: '끼기기긱' 래칫 4번이 빠르게 (0.5초)"""
    x = np.zeros(int(0.5 * SR))
    for i in range(4):
        place(x, ratchet_click(SR, 0.9 - i * 0.05, 2300 + i * 150), i * 0.09, SR)
        place(x, creak(0.05, SR, 70, 90, seed=20 + i), i * 0.09 + 0.01, SR, 0.25)
    place(x, metal(1800, 0.06, SR, 0.4, 90), 0.38, SR)
    return fade(norm(x, 0.7), SR, 0.001, 0.05)


def sfx_threads_return():
    """결말: 빛줄기가 마을로 돌아옴. 반짝이는 상승 아르페지오 (2.6초)"""
    x = np.zeros(int(2.6 * SR))
    notes = ["C5", "E5", "G5", "C6", "E6", "G6", "C7"]
    for i, m in enumerate(notes):
        place(x, musicbox(hz(midi(m)), 0.3, SR, 0.5)[: int(1.4 * SR)], i * 0.11, SR)
        place(x, musicbox(hz(midi(m)) * 1.5, 0.2, SR, 0.12)[: int(0.8 * SR)], i * 0.11 + 0.05, SR)
    for f in (1046.5, 2093):
        place(x, bell_hit(SR, f, 1.6, 0.25), 0.8, SR)
    place(x, GA.sparkle(1.0, 9, 2600, seed=23), 0.4, SR, 0.5)
    return fade(norm(reverb(x, SR, mix=0.3)[: len(x)], 0.75), SR, 0.002, 0.5)


# ───────────────────────── 실행 ─────────────────────────
ACT3_BGM = {"bgm_recall_night": bgm_recall_night, "bgm_departure": bgm_departure}
ACT3_SFX = {"sfx_battery_insert": sfx_battery_insert, "sfx_battery_shake": sfx_battery_shake,
            "sfx_battery_pop": sfx_battery_pop, "sfx_recall_signal": sfx_recall_signal,
            "sfx_thread_pull": sfx_thread_pull, "sfx_freeze": sfx_freeze, "sfx_key_give": sfx_key_give}
ACT4_BGM = {"bgm_toad_boss": bgm_toad_boss, "jingle_toad_defeat": jingle_toad_defeat}
ACT4_SFX = {"sfx_toad_croak": sfx_toad_croak, "sfx_toad_tongue": sfx_toad_tongue, "sfx_breaker": sfx_breaker,
            "sfx_floor_charge": sfx_floor_charge, "sfx_floor_zap": sfx_floor_zap, "sfx_magnet_loop": sfx_magnet_loop}
ACT5_BGM = {"bgm_volt_boss": bgm_volt_boss, "bgm_volt_final": bgm_volt_final, "jingle_radio_reborn": jingle_radio_reborn,
            "jingle_volt_defeat": jingle_volt_defeat, "bgm_ending": bgm_ending}
ACT5_SFX = {"sfx_coolant_spray": sfx_coolant_spray, "sfx_lightning_warn": sfx_lightning_warn,
            "sfx_lightning_strike": sfx_lightning_strike, "sfx_bomb_roll": sfx_bomb_roll, "sfx_bomb_boom": sfx_bomb_boom,
            "sfx_plug_pull": sfx_plug_pull, "sfx_volt_laugh": sfx_volt_laugh, "sfx_volt_overheat": sfx_volt_overheat,
            "sfx_radio_jam_beam": sfx_radio_jam_beam, "sfx_radio_collapse": sfx_radio_collapse,
            "sfx_reborn_horn": sfx_reborn_horn, "sfx_crank_rusty": sfx_crank_rusty, "sfx_volt_shrink": sfx_volt_shrink,
            "sfx_timestop": sfx_timestop, "sfx_swap_wind": sfx_swap_wind, "sfx_threads_return": sfx_threads_return}
ACTS = {"act3": (ACT3_BGM, ACT3_SFX), "act4": (ACT4_BGM, ACT4_SFX), "act5": (ACT5_BGM, ACT5_SFX)}


def run(flt=""):
    for act, (bgm, sfx) in ACTS.items():
        pick = (lambda name: True) if (not flt or flt == act) else (lambda name: flt in name)
        print(f"[{act}]")
        for name, fn in bgm.items():
            if pick(name):
                save(name, fn(), SR if name.startswith("jingle") else BSR, "bgm")  # 징글은 기존처럼 44100Hz
        for name, fn in sfx.items():
            if pick(name):
                save(name, fn(), SR, "sfx")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "")

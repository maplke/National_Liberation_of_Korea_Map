"""Original synthesized score for the Everyline: Rail launch teaser.
100 BPM (beat = 0.6 s). Hits are placed on the same clock as comp.html."""
import sys
import numpy as np

SR = 48000
DUR = 45.0
BEAT = 0.6
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l * 1.414
    R[i:i + len(sig)] += sig * r * 1.414


def tt(d):
    return np.arange(int(d * SR)) / SR


def lowpass(x, fc):
    # one-pole lowpass, fc may be array
    a = np.exp(-2 * np.pi * np.asarray(fc) / SR)
    y = np.empty_like(x)
    acc = 0.0
    if np.ndim(a) == 0:
        b = 1 - a
        for k in range(len(x)):
            acc = b * x[k] + a * acc
            y[k] = acc
    else:
        for k in range(len(x)):
            acc = (1 - a[k]) * x[k] + a[k] * acc
            y[k] = acc
    return y


def fft_lp(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def fft_hp(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


# ---------- instruments ----------
def pad(midis, d, att=1.2, rel=1.5):
    t = tt(d + rel)
    s = np.zeros(len(t))
    for m in midis:
        for det in (-0.08, 0.0, 0.07):
            f = mtof(m + det)
            for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)):
                s += a * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28))
    env = np.minimum(1, t / att) * np.where(t < d, 1, np.exp(-(t - d) / (rel / 3)))
    return s * env / (len(midis) * 6)


def pluck(m, d=1.2, bright=1.0):
    t = tt(d)
    f = mtof(m)
    s = np.zeros(len(t))
    for h, a in ((1, 1), (2, .5 * bright), (3, .25 * bright), (4, .12 * bright), (6, .05 * bright)):
        s += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + h * 2.2))
    return s * np.minimum(1, t / .003) * .5


def bell(m, d=3.0):
    t = tt(d)
    f = mtof(m)
    s = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 2)
         + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 4))
    return s * np.exp(-t * 1.1) * np.minimum(1, t / .002) * .4


def kick(g=1.0):
    t = tt(.5)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * g


def snare():
    t = tt(.35)
    n = fft_hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 16) * .5
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .4
    return n + tone


def hat(open_=False):
    t = tt(.25 if open_ else .08)
    n = fft_hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (10 if open_ else 60)) * .18


def boom(g=1.0, d=4.0):
    t = tt(d)
    f = 32 + 40 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.0)
    n = fft_lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 5) * .5
    return (s + n) * g


def swell(d=1.2, hp=2500):
    # reverse-cymbal style swell that ends exactly at the hit
    t = tt(d)
    n = fft_hp(rng.standard_normal(len(t)), hp)
    return n * (t / d) ** 3 * .35


def riser(d=2.4):
    t = tt(d)
    n = rng.standard_normal(len(t))
    k = t / d
    n = lowpass(n, 300 + 9000 * k ** 2)
    f = 200 + 900 * k ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * .15
    return (n * .5 + tone) * k ** 2


def sub(m, d):
    t = tt(d)
    s = np.sin(2 * np.pi * mtof(m) * t) + .25 * np.sin(2 * np.pi * mtof(m) * 2 * t)
    return s * np.minimum(1, t / .01) * np.exp(-t * .9) * .42


# ---------- harmony: Bm - G - D - A (vi-IV-I-V in D), one chord per bar (2.4 s) ----------
BAR = 4 * BEAT
CH = [  # (bass root, pad voicing, arp notes)
    (47, [59, 62, 66, 69], [71, 74, 78, 74, 81, 78, 74, 78]),   # Bm(add9 feel)
    (43, [59, 62, 67, 71], [67, 71, 74, 71, 79, 74, 71, 74]),   # Gmaj7
    (50, [57, 62, 66, 69], [69, 74, 78, 74, 81, 78, 74, 78]),   # D
    (45, [57, 61, 64, 69], [69, 73, 76, 73, 81, 76, 73, 76]),   # A
]


def chord_at(t):
    return CH[int(t // BAR) % 4]


# pads through the whole piece
END = 41.4  # final hit / end card
for b in range(int(DUR / BAR) + 1):
    t0 = b * BAR
    if t0 >= END:
        break
    root, voic, _ = chord_at(t0)
    g = .32 if t0 < 7.8 else .26
    add(pad(voic, min(BAR, END - t0), att=.9, rel=1.4), t0, pan=-.15, gain=g)
    add(pad([v + 12 for v in voic[1:3]], min(BAR, END - t0), att=1.2, rel=1.4), t0, pan=.25, gain=g * .35)

# opening drone + shimmer
add(pad([35, 47], 8.4, att=2.5, rel=2.0), 0.0, gain=.5)
for k in range(9):
    add(bell(83 + [0, 3, 7, 10, 12][k % 5], 2.5), 0.4 + k * 0.82, pan=((k % 3) - 1) * .5, gain=.06)

# logo hits: Maplegrid 0.8, ER 4.4
add(swell(.8), 0.0, gain=.6)
add(bell(74, 4) + bell(86, 4) * .5, .8, gain=.35)
add(boom(.45, 3.0), .8)
add(swell(1.2), 3.2, gain=.7)
add(boom(.75, 4.0), 4.4)
add(bell(62, 4) + bell(69, 4) * .6 + bell(74, 4) * .4, 4.4, gain=.35)


def arps(t0, t1, gain, bright=1.0, every=1):
    t = t0
    k = 0
    while t < t1 - 1e-6:
        _, _, arp = chord_at(t)
        if k % every == 0:
            add(pluck(arp[k % 8], 1.4, bright), t, pan=(.35 if k % 2 else -.35), gain=gain)
        t += BEAT / 2
        k += 1


def groove(t0, t1, kick_g=.9, snare_g=.8, sub_g=.9, arp_g=.26, bright=1.3):
    for i, t in enumerate(np.arange(t0, t1 - 1e-6, BEAT)):
        add(kick(kick_g), t)
        if snare_g and i % 2 == 1:
            add(snare(), t, gain=snare_g)
        add(hat(), t + BEAT / 2, pan=.3)
        if i % 8 == 7:
            add(hat(True), t + BEAT / 2, pan=-.3)
    for t in np.arange(t0, t1 - 1e-6, BAR):
        add(sub(chord_at(t)[0] - 12, min(BAR, t1 - t)), t, gain=sub_g)
    arps(t0, t1, arp_g, bright)


# 7.8 - 12.0: night, gentle arpeggio
arps(7.8, 12.0, .34, .8)
add(pad([47, 54], 4.2, att=1.5, rel=1.5), 7.8, gain=.25)
add(swell(1.2), 10.8, gain=.8)

# 12.0 - 18.0: golden drive; hits on every caption change
for t in np.arange(12.0, 18.0 - 1e-6, BEAT):
    add(kick(.8), t)
for t in np.arange(12.0, 18.0 - 1e-6, BAR):
    add(sub(chord_at(t)[0] - 12, BAR), t, gain=.6)
arps(12.0, 18.0, .26, 1.0)
add(boom(.6, 3.0), 12.0)
add(boom(.5, 2.0), 12.6)
for t in (14.4, 15.6, 16.8):
    add(boom(.35, 1.5), t)
    add(bell(chord_at(t)[2][0] + 12, 1.5), t, gain=.18)
add(swell(.6), 17.4, gain=.6)

# 18.0 - 21.6: skins — hats, a hit on each switch
for t in np.arange(18.0, 21.6 - 1e-6, BEAT):
    add(kick(.75), t)
    add(hat(), t + BEAT / 2, pan=.3)
for t in np.arange(18.0, 21.6 - 1e-6, BAR):
    add(sub(chord_at(t)[0] - 12, BAR), t, gain=.6)
arps(18.0, 21.6, .26, 1.2)
for t in (18.0, 19.2, 20.4):
    add(boom(.4, 1.2), t)
    add(snare(), t + BEAT, gain=.5)

# 21.6 - 25.2: "쉽게 잇다" — lighter, riser into the era section
add(boom(.5, 2.5), 21.6)
arps(21.6, 25.2, .2, .8)
for t in np.arange(21.6, 25.2 - 1e-6, BAR):
    add(sub(chord_at(t)[0] - 12, min(BAR, 25.2 - t)), t, gain=.45)
add(riser(2.0), 23.2, gain=.5)
add(swell(1.2), 24.0, gain=.8)

# 25.2 - 33.6: era groove; ticking during each year roll, a hit when the year lands
groove(25.2, 33.6)
for land in (27.3, 29.4, 31.5, 33.3):
    for k, t in enumerate(np.arange(land - .75, land - 1e-6, .075)):
        add(hat(), t, pan=(.4 if k % 2 else -.4), gain=.7)
    add(boom(.45, 1.8), land)
    add(bell(86, 1.5), land, gain=.14)
add(boom(.55, 2.0), 25.2)

# 33.6 - 37.2: feature glimpses — groove continues, hit per window
groove(33.6, 37.2, kick_g=.8, snare_g=.6, sub_g=.8, arp_g=.24, bright=1.2)
for t in (33.6, 34.8, 36.0):
    add(boom(.45, 1.4), t)
    add(bell(chord_at(t)[2][2] + 12, 1.2), t, gain=.15)
add(swell(.6), 36.6, gain=.8)

# 37.2 - 41.4: breakdown, build to the logo
add(boom(.7, 4.0), 37.2)
arps(37.2, 41.4, .2, .7, every=2)
add(riser(2.6), 38.8, gain=.55)
add(swell(1.4), 40.0, gain=.9)
for i, t in enumerate(np.arange(39.6, 41.4 - 1e-6, BEAT / 2)):
    add(kick(.35 + i * .08), t)

# 41.4: final hit and ring-out (release date at 42.6)
add(boom(1.0, 4.0), END)
for m, g in ((50, .5), (57, .4), (62, .4), (66, .35), (69, .3), (74, .25)):
    add(pad([m], 2.4, att=.02, rel=1.6), END, gain=g * .9)
add(bell(74, 4) + bell(81, 4) * .6 + bell(86, 4) * .4, 41.6, gain=.32)
add(bell(78, 3), 42.6, gain=.18)
add(bell(86, 3), 43.2, gain=.12)

# ---------- reverb (FFT convolution with synthetic IR) ----------
def reverb(x, secs=2.6, mix=.28, seed=1):
    r = np.random.default_rng(seed)
    t = np.arange(int(secs * SR)) / SR
    ir = r.standard_normal(len(t)) * np.exp(-t * 3.2)
    ir = fft_lp(ir, 6000)
    ir /= np.sqrt((ir ** 2).sum())
    n = len(x) + len(ir)
    nf = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]
    return x + mix * y


L = reverb(L, seed=1)
R = reverb(R, seed=2)

# master: fade out, soft clip, normalize
t = np.arange(N) / SR
fade = np.clip((DUR - t) / 1.2, 0, 1)
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.4) / np.tanh(1.4) * .89
R = np.tanh(R / peak * 1.4) / np.tanh(1.4) * .89
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')

import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1], DUR, 's')

// 소리 (Web Audio API). 기준: assets/audio/audio_manifest.js
// 이미지와 같은 원칙: 파일이 없거나 불러오기·해석에 실패해도 게임은 그대로 돈다(조용할 뿐).
// 배포 사이트에서는 압축본(assets_web/audio/*.ogg)을 먼저 시도하고, 실패하면 원본 WAV.
window.WT = window.WT || {};
(function () {
  const M = window.AUDIO_MANIFEST || { bgm: [], sfx: [] };
  const defs = {};
  [...(M.bgm || []), ...(M.sfx || [])].forEach((d) => { defs[d.id] = d; });

  let ctx = null, master = null, bgmBus = null, sfxBus = null, thinF = null, thinG = null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      ctx = new AC();
      master = ctx.createGain(); master.connect(ctx.destination);
      // BGM → (얇아지는 필터) → master. 건전지가 늘수록 고음이 깎이고 작아진다(기계화).
      bgmBus = ctx.createGain();
      thinF = ctx.createBiquadFilter(); thinF.type = 'lowpass'; thinF.frequency.value = 20000; thinF.Q.value = 0.5;
      thinG = ctx.createGain();
      bgmBus.connect(thinF); thinF.connect(thinG); thinG.connect(master);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
    }
  } catch (e) { ctx = null; }

  const buffers = {};       // id → AudioBuffer
  const state = {};         // id → 'loading' | 'ok' | 'fail'
  const loops = {};         // id → { src, gain }
  let cur = null;           // 현재 BGM { id, src, gain, rate }
  let lay = null;           // 스템 묶음 { key, parts: { id: { src, g } } }
  let want = null;          // 원하는 BGM (버퍼가 늦게 오면 도착할 때 시작)
  let muted = false;
  try { muted = localStorage.getItem('wt-muted') === '1'; } catch (e) { /* 저장 불가 */ }
  if (master) master.gain.value = muted ? 0 : 1;

  const now = () => (ctx ? ctx.currentTime : 0);
  const useWeb = () => WT.Assets && WT.Assets.useWeb;

  function fetchDecode(url) {
    return fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => {
        try { const p = ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); }
      }));
  }
  function loadOne(id) {
    const d = defs[id];
    if (!ctx || !d || state[id]) return;
    state[id] = 'loading';
    const wav = 'assets/' + d.file;
    const ogg = 'assets_web/' + d.file.replace(/\.wav$/i, '.ogg');
    (useWeb() ? fetchDecode(ogg).catch(() => fetchDecode(wav)) : fetchDecode(wav))
      .then((buf) => {
        buffers[id] = buf; state[id] = 'ok';
        if (want && want.id === id && (!cur || cur.id !== id)) startBgm(want.id, want.rate, 0.8);
        if (loops[id] && loops[id].pending) { const v = loops[id].vol; delete loops[id]; A.loop(id, { vol: v }); }
      })
      .catch(() => { state[id] = 'fail'; });
  }

  function startBgm(id, rate, fade) {
    const t = now();
    if (cur) { const old = cur; old.gain.gain.cancelScheduledValues(t); old.gain.gain.setValueAtTime(old.gain.gain.value, t); old.gain.gain.linearRampToValueAtTime(0, t + fade); try { old.src.stop(t + fade + 0.05); } catch (e) { /* 이미 정지 */ } cur = null; }
    if (!id || !buffers[id]) return;
    const d = defs[id];
    const src = ctx.createBufferSource(); src.buffer = buffers[id]; src.loop = d.loop !== false; src.playbackRate.value = rate || 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(d.vol ?? 0.5, t + fade);
    src.connect(g); g.connect(bgmBus); src.start(t);
    cur = { id, src, gain: g, rate: rate || 1, t0: t };
  }

  const A = WT.Audio = {
    defs,
    get ready() { return !!ctx; },
    get muted() { return muted; },
    // manifest 전체를 미리 불러온다 (배포 사이트에서는 이미지가 어느 정도 온 뒤 main.js가 호출)
    started: false,
    load() {
      if (A.started) return; A.started = true;
      const order = [...(M.bgm || []), ...(M.sfx || [])].map((d) => d.id)
        .sort((a, b) => (/^bgm_story|^bgm_town_sleepy|^sfx_(dialog|text|step|story)/.test(b) ? 1 : 0) - (/^bgm_story|^bgm_town_sleepy|^sfx_(dialog|text|step|story)/.test(a) ? 1 : 0));
      order.forEach(loadOne);
    },
    attempted() { return Object.keys(state).length; },
    loaded() { return Object.values(state).filter((s) => s === 'ok').length; },
    // 자동재생 제한: 첫 입력에서 호출
    unlock() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },

    play(id, o) {
      o = o || {};
      if (!ctx || !buffers[id]) return null;
      try {
        const d = defs[id];
        const src = ctx.createBufferSource(); src.buffer = buffers[id]; src.playbackRate.value = o.rate || 1;
        const g = ctx.createGain(); g.gain.value = (o.vol ?? d.vol ?? 0.5);
        src.connect(g); g.connect(sfxBus); src.start(now() + (o.delay || 0));
        return src;
      } catch (e) { return null; }
    },
    // 같은 id 는 한 개만 반복 재생
    loop(id, o) {
      o = o || {};
      if (!ctx || loops[id]) return;
      if (!buffers[id]) { if (state[id] === 'loading' || !state[id]) loops[id] = { pending: true, vol: o.vol }; return; }
      try {
        const d = defs[id], t = now();
        const src = ctx.createBufferSource(); src.buffer = buffers[id]; src.loop = true;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol ?? d.vol ?? 0.3, t + 0.08);
        src.connect(g); g.connect(sfxBus); src.start(t);
        loops[id] = { src, gain: g };
      } catch (e) { /* 무시 */ }
    },
    stop(id, fade) {
      const l = loops[id];
      if (!l) return;
      delete loops[id];
      if (l.pending || !l.src) return;
      const t = now(), f = fade ?? 0.12;
      try { l.gain.gain.cancelScheduledValues(t); l.gain.gain.setValueAtTime(l.gain.gain.value, t); l.gain.gain.linearRampToValueAtTime(0, t + f); l.src.stop(t + f + 0.02); } catch (e) { /* 무시 */ }
    },
    // 조건이 참인 동안만 반복 (매 프레임 호출해도 됨)
    loopIf(id, cond, o) { if (cond) { A.loop(id, o); if (o && o.vol != null) A.loopVol(id, o.vol); } else if (loops[id]) A.stop(id); },
    // 반복 중인 소리의 볼륨을 부드럽게 바꿈 (예: 졸음 게이지)
    loopVol(id, v) { const l = loops[id]; if (l && l.gain) { try { l.gain.gain.setTargetAtTime(v, now(), 0.1); } catch (e) { /* 무시 */ } } },
    stopAllLoops() { Object.keys(loops).forEach((id) => A.stop(id)); },

    // BGM 전환(크로스페이드 0.8초). 같은 곡이면 재생 속도만 맞춘다. id=null 이면 페이드아웃.
    bgm(id, o) {
      o = o || {};
      const rate = o.rate || 1;
      if (want && want.id === id && want.rate === rate) return;
      want = { id, rate };
      if (!ctx) return;
      if (cur && cur.id === id) {
        if (cur.rate !== rate) { cur.src.playbackRate.setTargetAtTime(rate, now(), 0.3); cur.rate = rate; }
        return;
      }
      startBgm(id, rate, o.fade ?? 0.8);
    },
    currentBgm() { return cur ? cur.id : null; },
    // 지금 BGM이 id면 곡 안의 재생 위치(초), 아니면 null (박자 맞춤용)
    bgmPos(id) { if (!cur || cur.id !== id || !buffers[id]) return null; const d = buffers[id].duration; return (((now() - cur.t0) * cur.rate) % d + d) % d; },
    // 징글: 1회 재생, 그동안 BGM 을 비워 둠
    holdUntil: 0,
    jingle(id) {
      const src = A.play(id);
      const dur = buffers[id] ? buffers[id].duration : 0;
      A.holdUntil = performance.now() / 1000 + (dur || 0);
      return src;
    },
    held() { return performance.now() / 1000 < A.holdUntil; },

    // 0 = 원래 소리, 1 = 거의 안 들림(고음 없음)
    thinK: 0,
    thin(k) {
      k = Math.max(0, Math.min(1, k || 0));
      if (Math.abs(k - A.thinK) < 0.005 || !thinF) { A.thinK = k; return; }
      A.thinK = k;
      const t = now();
      try { thinF.frequency.setTargetAtTime(20000 * Math.pow(500 / 20000, k), t, 0.4); thinG.gain.setTargetAtTime(1 - k * 0.55, t, 0.4); } catch (e) { /* 무시 */ }
    },
    // 스템(같은 길이 BGM 여러 개)을 동시에 시작해 볼륨만 따로 조절. 하나라도 없으면 false.
    layers(ids, gains) {
      if (!ctx) return false;
      const key = ids ? ids.join('|') : null;
      if (!key) { if (lay) { const t = now(); Object.values(lay.parts).forEach((q) => { try { q.g.gain.setTargetAtTime(0, t, 0.2); q.src.stop(t + 1); } catch (e) { /* 무시 */ } }); lay = null; } return true; }
      if (!ids.every((id) => buffers[id])) { ids.forEach(loadOne); return false; }
      if (!lay || lay.key !== key) {
        A.layers(null);
        A.bgm(null);
        const t = now() + 0.05, parts = {};
        ids.forEach((id) => {
          const src = ctx.createBufferSource(); src.buffer = buffers[id]; src.loop = true;
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
          src.connect(g); g.connect(bgmBus); src.start(t); parts[id] = { src, g };
        });
        lay = { key, parts };
      }
      const t = now();
      ids.forEach((id, i) => { const v = (defs[id].vol ?? 0.5) * (gains ? gains[i] : 1); try { lay.parts[id].g.gain.setTargetAtTime(v, t, 0.5); } catch (e) { /* 무시 */ } });
      return true;
    },
    layering() { return !!lay; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('wt-muted', muted ? '1' : '0'); } catch (e) { /* 무시 */ }
      if (master) { const t = now(); master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.05); }
      return muted;
    }
  };
})();

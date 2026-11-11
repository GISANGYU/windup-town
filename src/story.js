// 무성영화식 컷신 (오프닝, 막 끝, 예고). 이미지(story_0n)가 있으면 그것을, 없으면 코드 그림을 쓴다.
(function () {
  const C = WT.C, PH = WT.PH;
  const S = WT.Story = {};

  // panels: DIALOGUE.opening 같은 배열, onEnd: 끝났을 때
  // 컷과 컷 사이는 1930년대 만화처럼 원형(아이리스)으로 닫혔다 열린다.
  const TR = 0.9;
  S.play = function (panels, onEnd) {
    const busy = !!WT.Game.state.ui.transition; // 게임 쪽 아이리스가 이미 열어 주는 중이면 따로 열지 않음
    WT.Game.state.ui.story = { panels, i: 0, t: 0, onEnd, tr: busy ? null : { t: TR / 2, dur: TR, fired: true } };
  };
  S.active = () => !!WT.Game.state.ui.story;
  function go() {
    const st = WT.Game.state.ui.story;
    if (!st || st.tr) return;
    st.tr = { t: 0, dur: TR, fired: false };
    WT.Audio.play('sfx_story_next');
  }
  S.next = function () {
    const st = WT.Game.state.ui.story;
    if (!st || st.t < 0.35) return; // 연타 방지
    go();
  };
  S.skip = function () { if (WT.Game.state.ui.story) S.end(); };
  S.end = function () {
    const st = WT.Game.state.ui.story;
    WT.Game.state.ui.story = null;
    if (st && st.onEnd) st.onEnd();
    if (!WT.Game.state.ui.story && !WT.Game.state.ui.transition) WT.Game.irisOpen();
  };
  S.update = function (dt) {
    const st = WT.Game.state.ui.story;
    if (!st) return;
    st.t += dt;
    if (st.tr) {
      st.tr.t += dt;
      if (!st.tr.fired && st.tr.t >= st.tr.dur / 2) {
        st.tr.fired = true; st.i++; st.t = 0;
        if (st.i >= st.panels.length) { S.end(); return; }
      }
      if (st.tr.t >= st.tr.dur) st.tr = null;
      return;
    }
    const p = st.panels[st.i];
    const auto = p.text ? 4.5 + p.text.length * 0.07 : 3.2;
    if (st.t > auto) go();
  };

  // ───────── 코드 그림 ─────────
  function bg(ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, WT.H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
  }
  function ground(ctx, color) {
    ctx.fillStyle = color; ctx.strokeStyle = C.outline; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 470); ctx.quadraticCurveTo(WT.W / 2, 420, WT.W, 470); ctx.lineTo(WT.W, WT.H); ctx.lineTo(0, WT.H); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function clockShadow(ctx, x, y, s, t, eyes) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#1d1720';
    // 다리·팔 (길고 가는 러버호스)
    ctx.strokeStyle = '#1d1720'; ctx.lineCap = 'round'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(-40, 60); ctx.quadraticCurveTo(-70, 140, -50, 210); ctx.moveTo(40, 60); ctx.quadraticCurveTo(70, 140, 50, 210); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-80, 0); ctx.quadraticCurveTo(-170, -40 + Math.sin(t * 2) * 10, -230, 30); ctx.moveTo(80, 0); ctx.quadraticCurveTo(170, -60, 210, -10 + Math.sin(t * 2 + 1) * 10); ctx.stroke();
    // 몸(자명종)
    ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-70, -90, 34, 0, Math.PI * 2); ctx.arc(70, -90, 34, 0, Math.PI * 2); ctx.fill();
    if (eyes) {
      ctx.fillStyle = C.yellow;
      ctx.beginPath(); ctx.ellipse(-34, -10, 16, 24, -0.3, 0, Math.PI * 2); ctx.ellipse(34, -10, 16, 24, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 30, 40, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }
  function keyAt(ctx, x, y, h, rot) { WT.drawThing(ctx, 'prop_key', PH.key, x, y, { h, rot }); }

  const ART = {
    title(ctx) { bg(ctx, '#221a20', '#1a1418'); },
    curtain(ctx, t) {
      bg(ctx, '#2a1a1e', '#1a1014');
      ctx.fillStyle = '#8f2f2a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5;
      for (let i = 0; i < 2; i++) {
        const dir = i ? 1 : -1, x0 = i ? WT.W : 0;
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(WT.W / 2 + dir * (60 + Math.sin(t) * 10), 0);
        ctx.quadraticCurveTo(WT.W / 2 + dir * 180, WT.H / 2, WT.W / 2 + dir * 260, WT.H); ctx.lineTo(x0, WT.H); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    },
    town(ctx, t) {
      bg(ctx, '#e9d6ad', '#d7be97'); ground(ctx, '#a3a578');
      PH.stage && WT.drawThing(ctx, 'prop_stage', PH.stage, 640, 560, { h: 150, anchor: 'center' });
      const b = Math.abs(Math.sin(t * 3.5));
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 640, 545 - b * 10, { h: 260, mood: 'awake', t, sy: 1 + b * 0.05 });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 330, 600 - b * 8, { h: 170, mood: 'awake', t });
      WT.drawThing(ctx, 'prop_tree_round', PH.tree, 1000, 600, { h: 280, sy: 1 + b * 0.05 });
      WT.drawThing(ctx, 'prop_house', PH.house, 160, 520, { h: 260, sy: 1 + b * 0.03 });
      for (let i = 0; i < 5; i++) WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 540 + i * 50 + Math.sin(t * 2 + i) * 20, 220 - ((t * 60 + i * 50) % 200), { h: 42, anchor: 'center' });
    },
    thief(ctx, t) {
      bg(ctx, '#2a2c44', '#14141f');
      ctx.fillStyle = '#f4e6c8'; ctx.beginPath(); ctx.arc(1080, 120, 50, 0, Math.PI * 2); ctx.fill();
      // 시계탑
      ctx.fillStyle = '#1d1720'; ctx.fillRect(900, 160, 160, 560); ctx.beginPath(); ctx.moveTo(880, 170); ctx.lineTo(980, 60); ctx.lineTo(1080, 170); ctx.fill();
      ground(ctx, '#3b3d52');
      WT.drawThing(ctx, 'npc_gramo_sleepy', PH.gramo, 470, 600, { h: 240, mood: 'sleepy', t, rot: 0.08 });
      clockShadow(ctx, 760, 330, 1, t, true);
      [0, 1, 2].forEach((i) => keyAt(ctx, 560 - i * 40 + Math.sin(t * 3 + i) * 6, 380 + i * 30, 50, -0.4 + i * 0.3));
    },
    sleep(ctx, t) {
      bg(ctx, '#b9ad98', '#a19784'); ground(ctx, '#8d8b72');
      WT.drawThing(ctx, 'prop_house', PH.house, 200, 520, { h: 240, rot: -0.05 });
      WT.drawThing(ctx, 'npc_gramo_sleepy', PH.gramo, 640, 600, { h: 240, mood: 'sleepy', t, rot: 0.1 });
      WT.drawThing(ctx, 'npc_pip_sleepy', PH.pip, 900, 620, { h: 170, mood: 'sleepy', t, rot: 0.12 });
      WT.drawThing(ctx, 'prop_tree_round', PH.tree, 1120, 600, { h: 260, rot: 0.06 });
      for (let i = 0; i < 4; i++) WT.drawThing(ctx, 'fx_zzz', PH.zzz, 680 + i * 90, 260 - ((t * 30 + i * 40) % 120), { h: 40, anchor: 'center', alpha: 0.8 });
      [[260, 200], [700, 140], [1100, 230]].forEach(([x, y], i) => keyAt(ctx, x + Math.sin(t + i) * 10, y + Math.cos(t * 1.3 + i) * 8, 46, t + i));
    },
    arrive(ctx, t) {
      bg(ctx, '#f6dcae', '#e9c08a');
      ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(640, 470, 140, Math.PI, 0); ctx.fill();
      ground(ctx, '#a3a578');
      const walk = (t * 70) % 1400;
      const x = Math.min(640, -100 + t * 160);
      const moving = x < 640;
      WT.drawThing(ctx, moving ? ['player_walk_side_01', 'player_idle_side'] : ['player_happy', 'player_idle_down'], PH.bogle, x, 640 - (moving ? Math.abs(Math.sin(t * 12)) * 10 : 0),
        { h: 230, pose: moving ? 'walk' : 'happy', dir: moving ? 'side' : 'down', t });
      ctx.save(); ctx.translate(x - 90, 640); // 여행 가방
      ctx.fillStyle = C.red; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-40, -70, 80, 64, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-14, -70); ctx.lineTo(-14, -86); ctx.lineTo(14, -86); ctx.lineTo(14, -70); ctx.stroke(); ctx.restore();
      void walk;
    },
    cuckoo(ctx, t) {
      bg(ctx, '#f0d9a8', '#d7be97'); ground(ctx, '#a3a578');
      WT.drawThing(ctx, 'boss_cuckoo', PH.boss, 640, 560 - Math.abs(Math.sin(t * 3)) * 10, { h: 300, pose: 'cuckoo', t });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 330, 600, { h: 220, mood: 'awake', t });
      WT.drawThing(ctx, 'player_happy', PH.bogle, 940, 610, { h: 180, pose: 'happy', t });
      for (let i = 0; i < 5; i++) WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 420 + i * 110, 200 - ((t * 50 + i * 40) % 160), { h: 40, anchor: 'center' });
    },
    teaser(ctx, t) {
      bg(ctx, '#1f1a2a', '#0e0b12');
      ctx.fillStyle = '#1d1720'; ctx.fillRect(520, 260, 240, 460);
      ctx.beginPath(); ctx.moveTo(500, 270); ctx.lineTo(640, 120); ctx.lineTo(780, 270); ctx.fill();
      clockShadow(ctx, 640, 210, 0.75, t, true);
      ctx.fillStyle = 'rgba(242,193,78,.12)'; ctx.beginPath(); ctx.arc(640, 210, 180 + Math.sin(t * 6) * 8, 0, Math.PI * 2); ctx.fill();
    }
  };

  // ───────── 그리기 ─────────
  S.draw = function (ctx, time) {
    const st = WT.Game.state.ui.story;
    if (!st) return;
    const p = st.panels[st.i];
    if (!p) return;
    const fade = Math.min(1, st.t / 0.4);
    ctx.save();
    // 필름 흔들림(게이트 위브)
    if (Math.random() < 0.35) ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    if (p.asset && WT.Assets.has(p.asset)) WT.drawThing(ctx, p.asset, null, WT.W / 2, WT.H, { h: WT.H, sx: WT.W / (WT.H * WT.Assets.aspect(p.asset)) });
    else (ART[p.art] || ART.title)(ctx, st.t);
    // 자막 카드 / 제목 카드
    ctx.globalAlpha = fade;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (p.title) {
      ctx.fillStyle = 'rgba(26,20,24,.55)'; ctx.fillRect(0, 0, WT.W, WT.H);
      ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.strokeRect(220, 190, 840, 340); ctx.lineWidth = 2; ctx.strokeRect(236, 206, 808, 308);
      [[220, 190, 1], [1060, 190, -1], [220, 530, 1], [1060, 530, -1]].forEach(([x, y, d], i) => { ctx.save(); ctx.translate(x, y); ctx.scale(d, i < 2 ? 1 : -1); ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(26, 26, 18, Math.PI, Math.PI * 1.5); ctx.moveTo(8, 50); ctx.quadraticCurveTo(8, 8, 50, 8); ctx.stroke(); ctx.restore(); });
      ctx.fillStyle = C.cream; ctx.font = (p.title.length > 8 ? '64px' : '86px') + ' "Do Hyeon", sans-serif'; ctx.fillText(p.title, WT.W / 2, 330);
      ctx.font = '28px "Gowun Dodum", sans-serif'; ctx.fillText(p.sub || '', WT.W / 2, 410);
    } else if (p.text) {
      const lines = p.text.split('\n');
      const h = 60 + lines.length * 46;
      ctx.fillStyle = 'rgba(43,34,48,.94)'; ctx.strokeStyle = C.cream; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(110, WT.H - h - 30, WT.W - 220, h, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.cream; ctx.font = '32px "Do Hyeon", sans-serif';
      lines.forEach((l, i) => ctx.fillText(l, WT.W / 2, WT.H - h - 30 + 52 + i * 46));
    }
    ctx.globalAlpha = 0.65; ctx.font = '17px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.cream; ctx.textAlign = 'right';
    ctx.fillText(`${st.i + 1} / ${st.panels.length}   E · Space 다음   Esc 건너뛰기`, WT.W - 26, 28);
    ctx.restore();
    // 컷 전환 아이리스
    if (st.tr) {
      const half = st.tr.dur / 2, k = st.tr.t < half ? 1 - st.tr.t / half : (st.tr.t - half) / half;
      const r = k * k * (3 - 2 * k) * Math.hypot(WT.W, WT.H) * 0.6;
      ctx.save(); ctx.fillStyle = '#120d10';
      ctx.beginPath(); ctx.rect(0, 0, WT.W, WT.H); ctx.arc(WT.W / 2, WT.H / 2, Math.max(0, r), 0, Math.PI * 2, true); ctx.fill('evenodd');
      ctx.strokeStyle = C.cream; ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(WT.W / 2, WT.H / 2, Math.max(0, r), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    void time;
  };
})();

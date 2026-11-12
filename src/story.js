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
    festival(ctx, t) {
      bg(ctx, '#f2d9a6', '#dcc39a'); ground(ctx, '#a3a578');
      PH.stage && WT.drawThing(ctx, 'prop_stage', PH.stage, 640, 560, { h: 150, anchor: 'center' });
      const b = Math.abs(Math.sin(t * 3.5));
      WT.drawThing(ctx, 'furn_bunting', PH.bunting, 640, 300, { h: 200, sx: 3.2 });
      WT.drawThing(ctx, 'furn_lantern', PH.lantern, 230, 600, { h: 200 }); WT.drawThing(ctx, 'furn_lantern', PH.lantern, 1060, 600, { h: 200, flip: true });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 640, 545 - b * 6, { h: 240, mood: 'awake', t, rot: Math.sin(t) * 0.04 });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 400, 620 - b * 10, { h: 160, mood: 'awake', t });
      WT.drawThing(ctx, 'player_happy', PH.bogle, 880, 630 - b * 12, { h: 170, pose: 'happy', t });
      for (let i = 0; i < 5; i++) WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 520 + i * 60, 260 - ((t * 50 + i * 40) % 160), { h: 40, anchor: 'center' });
    },
    radioArrive(ctx, t) {
      bg(ctx, '#e8cf9e', '#cdb48c'); ground(ctx, '#9a9c74');
      const x = Math.min(700, -120 + t * 200);
      ctx.save(); ctx.filter = 'grayscale(1)';
      ctx.fillStyle = '#7d8590'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x - 230, 520, 170, 70, 10); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) WT.drawThing(ctx, 'prop_battery', PH.battery, x - 215 + (i % 3) * 52, 525 - Math.floor(i / 3) * 40, { h: 44 });
      [[x - 200, 600], [x - 90, 600]].forEach(([cx, cy]) => { ctx.fillStyle = '#4a505a'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, 7); ctx.fill(); ctx.stroke(); });
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, x, 610, { h: 230, power: 'battery', t });
      ctx.restore();
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 1060, 600, { h: 210, mood: 'awake', t });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 920, 630, { h: 150, mood: 'awake', t });
    },
    radioDown(ctx, t) {
      bg(ctx, '#c79a7a', '#8a6f66'); ground(ctx, '#7f7d66');
      ctx.save(); ctx.filter = 'grayscale(1) brightness(.85)';
      WT.drawThing(ctx, 'npc_radio_off', PH.radio, 640, 600, { h: 230, power: 'battery', off: true, t, rot: 0.2 });
      ctx.restore();
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 330, 600, { h: 220, mood: 'awake', t });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 960, 620, { h: 150, mood: 'awake', t });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 820, 630, { h: 160, dir: 'side', t, flip: true });
    },
    broadcast(ctx, t) {
      bg(ctx, '#f6dcae', '#e9c08a'); ground(ctx, '#a3a578');
      const b = Math.abs(Math.sin(t * 3.5));
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 520, 560 - b * 8, { h: 230, mood: 'awake', t });
      WT.drawThing(ctx, 'npc_radio_crank', PH.radio, 760, 570 - b * 10, { h: 220, power: 'wind', crank: true, t });
      for (let i = 0; i < 9; i++) { const k = (t * 0.3 + i / 9) % 1; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 780 + k * 520, 380 - Math.sin(k * 6 + i) * 60 - k * 120, { h: 40, anchor: 'center', alpha: 1 - k }); }
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 230, 630 - b * 10, { h: 150, mood: 'awake', t });
    },
    citySignal(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, WT.W, 0); g.addColorStop(0, '#e9c08a'); g.addColorStop(0.55, '#a39a90'); g.addColorStop(1, '#5f636c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      ctx.fillStyle = '#4a4e57'; for (let i = 0; i < 9; i++) ctx.fillRect(820 + i * 50, 380 - (i * 37 % 120), 40, 400);
      ctx.fillRect(1050, 150, 16, 300); ctx.beginPath(); ctx.moveTo(1030, 450); ctx.lineTo(1058, 150); ctx.lineTo(1086, 450); ctx.fill();
      ctx.fillStyle = Math.sin(t * 4) > 0 ? '#e0473c' : '#7a2a25'; ctx.beginPath(); ctx.arc(1058, 146, 9, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(232,237,242,.7)'; ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) { const x0 = 1000 - ((t * 120 + i * 140) % 560); ctx.beginPath(); for (let y = 200; y < 460; y += 26) ctx.lineTo(x0 + ((y / 26) % 2 ? 14 : -14), y); ctx.stroke(); }
      ctx.fillStyle = '#1a1418'; ctx.fillRect(0, 470, WT.W, 250);
      WT.drawThing(ctx, 'npc_radio_crank', PH.radio, 300, 640, { h: 260, power: 'wind', crank: true, t });
    },
    surveyors(ctx, t) {
      bg(ctx, '#ead6ad', '#cbb593'); ground(ctx, '#a3a578');
      ctx.fillStyle = 'rgba(215,190,151,.8)'; ctx.fillRect(0, 560, WT.W, 60);
      for (let i = 0; i < 3; i++) { const x = Math.min(380 + i * 190, -200 + t * 120 + i * 190); WT.drawThing(ctx, ['npc_surveyor_walk_01', 'npc_surveyor_idle'], PH.surveyor, x, 610, { h: 210, state: 'walk', t: t + i * 0.3 }); }
      WT.drawThing(ctx, 'prop_tree_round', PH.tree, 1060, 600, { h: 260 });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 1000, 620, { h: 130, mood: 'awake', t, alpha: 0.9 });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 1160, 610, { h: 190, mood: 'awake', t });
    },
    greySpread(ctx, t) {
      bg(ctx, '#e9d6ad', '#d7be97'); ground(ctx, '#9fae6a');
      for (let i = 0; i < 40; i++) { const x = (i * 97) % WT.W, y = 500 + (i * 53) % 200; ctx.fillStyle = [C.red, C.yellow, C.blue][i % 3]; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); }
      WT.drawThing(ctx, 'prop_stake', PH.stake, 640, 600, { h: 150, t });
      const r = Math.min(380, t * 90);
      ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.beginPath(); ctx.ellipse(640, 590, r, r * 0.45, 0, 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(240,240,240,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(640 - r, 590); ctx.lineTo(640 + r, 590); ctx.moveTo(640, 590 - r * 0.45); ctx.lineTo(640, 590 + r * 0.45); ctx.stroke();
      WT.drawThing(ctx, ['npc_surveyor_walk_01', 'npc_surveyor_idle'], PH.surveyor, 1050, 560, { h: 160, state: 'walk', t, alpha: 0.85 });
    },
    chase(ctx, t) {
      bg(ctx, '#ead6ad', '#cbb593'); ground(ctx, '#a3a578');
      const sx = 900 + Math.sin(t) * 10;
      WT.drawThing(ctx, ['npc_surveyor_walk_02', 'npc_surveyor_idle'], PH.surveyor, sx, 620, { h: 200, state: 'flee', t });
      WT.drawThing(ctx, 'prop_city_map', PH.cityMap, sx + 40, 520, { h: 60 });
      ctx.save(); ctx.filter = 'grayscale(1)';
      WT.drawThing(ctx, ['player_walk_side_01', 'player_idle_side'], PH.bogle, 420, 630, { h: 190, pose: 'walk', dir: 'side', t });
      WT.drawThing(ctx, 'prop_battery_pack', PH.batteryPack, 350, 540, { h: 60, anchor: 'center' });
      ctx.restore();
      ctx.strokeStyle = 'rgba(61,51,70,.5)'; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { const y = 470 + i * 34; ctx.beginPath(); ctx.moveTo(80 + (t * 400 + i * 90) % 200, y); ctx.lineTo(260 + (t * 400 + i * 90) % 200, y); ctx.stroke(); }
    },
    radioPast(ctx, t) {
      bg(ctx, '#8d8a86', '#5e5c5a');
      ctx.fillStyle = '#4a4846'; ctx.fillRect(140, 330, 1000, 26);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#9ea4ab'; ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(200 + i * 190, 210, 120, 120, 8); ctx.fill(); ctx.stroke(); WT.dotEyes && WT.dotEyes(ctx, 240 + i * 190, 280 + i * 190, 260, 4, true); }
      const drop = Math.min(1, t / 2.5);
      ctx.save(); ctx.filter = 'grayscale(1) sepia(.4)';
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, 640, 330 + drop * 260, { h: 170, power: 'battery', t, rot: drop * 0.5 });
      ctx.restore();
      ctx.fillStyle = '#3a3836'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(520, 620); ctx.lineTo(760, 620); ctx.lineTo(740, 720); ctx.lineTo(540, 720); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    roadOpen(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, WT.W, 0); g.addColorStop(0, '#f2c98a'); g.addColorStop(0.6, '#cdbca0'); g.addColorStop(1, '#7c7f86');
      ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      ctx.fillStyle = '#5f636c'; for (let i = 0; i < 7; i++) ctx.fillRect(980 + i * 40, 300 - (i * 31 % 90), 30, 200); ctx.fillRect(1120, 130, 10, 220);
      ctx.fillStyle = Math.sin(t * 4) > 0 ? '#e0473c' : '#7a2a25'; ctx.beginPath(); ctx.arc(1125, 126, 7, 0, 7); ctx.fill();
      ground(ctx, '#a3a578');
      ctx.fillStyle = C.sand; ctx.beginPath(); ctx.moveTo(560, WT.H); ctx.quadraticCurveTo(820, 520, 1120, 460); ctx.lineTo(1140, 470); ctx.quadraticCurveTo(880, 560, 760, WT.H); ctx.fill();
      WT.drawThing(ctx, 'player_idle_up', PH.bogle, 600, 650, { h: 170, dir: 'up', t });
      WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, 760, 640, { h: 150, power: 'wind', crank: true, t });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 200, 620, { h: 200, mood: 'awake', t });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 330, 650, { h: 130, mood: 'awake', t });
    },
    roadStart(ctx, t) {
      bg(ctx, '#f6c98e', '#e9b47a');
      ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(1000, 470, 110, Math.PI, 0); ctx.fill();
      ground(ctx, '#a3a578');
      ctx.fillStyle = C.sand; ctx.beginPath(); ctx.moveTo(200, WT.H); ctx.quadraticCurveTo(700, 520, 1280, 470); ctx.lineTo(1280, 500); ctx.quadraticCurveTo(760, 560, 420, WT.H); ctx.fill();
      WT.drawThing(ctx, 'prop_house', PH.house, 140, 520, { h: 200 });
      const x = Math.min(560, 300 + t * 60);
      WT.drawThing(ctx, ['player_walk_side_01', 'player_idle_side'], PH.bogle, x, 640 - Math.abs(Math.sin(t * 10)) * 8, { h: 180, pose: 'walk', dir: 'side', t });
      WT.drawThing(ctx, 'prop_battery', PH.battery, x - 70, 560, { h: 50 });
      WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, x - 150, 640, { h: 140, power: 'wind', crank: true, t });
    },
    factory(ctx, t) {
      bg(ctx, '#b6aa98', '#8d877e');
      ctx.fillStyle = '#6e6a66'; for (let i = 0; i < 6; i++) { ctx.fillRect(80 + i * 200, 180 + (i % 2) * 60, 130, 400); ctx.fillRect(120 + i * 200, 90 + (i % 2) * 60, 26, 100); }
      ground(ctx, '#7a7f88');
      ctx.save(); ctx.filter = 'grayscale(1)';
      for (let i = 0; i < 6; i++) { const x = ((t * 40 + i * 180) % 1300) - 60; WT.drawThing(ctx, i % 2 ? 'boss_cuckoo' : 'npc_lamp_on', i % 2 ? PH.cuckoo : PH.lamp, x, 620, { h: i % 2 ? 110 : 150, pose: 'cuckoo', t: 0 }); }
      ctx.restore();
      ctx.fillStyle = '#8b6a4a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(980, 560, 140, 100, 8); ctx.fill(); ctx.stroke();
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 1060, 570, { h: 120, dir: 'side', flip: true, t });
    },
    cityGate(ctx, t) {
      bg(ctx, '#8d9198', '#5f636c');
      ctx.fillStyle = '#4a4e57'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 110, 160 + (i * 47 % 140), 90, 600);
      ctx.fillStyle = '#3a3e46'; ctx.fillRect(620, 40, 40, 500); ctx.beginPath(); ctx.moveTo(560, 540); ctx.lineTo(640, 40); ctx.lineTo(720, 540); ctx.fill();
      ctx.fillStyle = Math.sin(t * 4) > 0 ? '#e0473c' : '#7a2a25'; ctx.beginPath(); ctx.arc(640, 36, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#6e7884'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.fillRect(360, 360, 560, 360); ctx.strokeRect(360, 360, 560, 360);
      ctx.fillStyle = '#2a2e36'; ctx.fillRect(520, 470, 240, 250);
      WT.drawThing(ctx, 'player_idle_up', PH.bogle, 640, 700, { h: 120, dir: 'up', t });
    },
    towerTop(ctx, t) {
      bg(ctx, '#2a2c44', '#14141f');
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(242,193,78,${0.3 + (i % 3) * 0.2})`; ctx.fillRect((i * 131) % WT.W, 560 + (i * 37) % 140, 6, 6); }
      ctx.fillStyle = '#4a4e57'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.fillRect(700, 260, 300, 260); ctx.strokeRect(700, 260, 300, 260);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#9ba3ae'; ctx.beginPath(); ctx.arc(750 + (i % 3) * 100, 320 + Math.floor(i / 3) * 80, 26, 0, 7); ctx.fill(); ctx.stroke(); }
      WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, 520, 540, { h: 200, power: 'wind', crank: true, t });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(540, 330); ctx.quadraticCurveTo(620, 240, 700, 300); ctx.stroke();
      WT.drawThing(ctx, 'player_happy', PH.bogle, 340, 550, { h: 160, pose: 'happy', t });
      for (let i = 0; i < 6; i++) { const k = (t * 0.4 + i / 6) % 1; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 850 + Math.sin(k * 6 + i) * 80, 250 - k * 220, { h: 40, anchor: 'center', alpha: 1 - k }); }
    },
    musicSpreads(ctx, t) {
      bg(ctx, '#9ea3aa', '#7d8189');
      const r = 200 + (t * 160) % 900;
      ctx.save(); ctx.beginPath(); ctx.arc(640, 160, r, 0, 7); ctx.clip();
      bg(ctx, '#f6dcae', '#e9c08a'); ctx.restore();
      ctx.fillStyle = '#3a3e46'; ctx.fillRect(624, 40, 32, 300);
      for (let i = 0; i < 7; i++) { const x = 120 + i * 170, inR = Math.hypot(x - 640, 600 - 160) < r, b = inR ? Math.abs(Math.sin(t * 6 + i)) : 0;
        ctx.save(); if (!inR) ctx.filter = 'grayscale(1)';
        WT.drawThing(ctx, i % 3 === 0 ? 'npc_lamp_on' : i % 3 === 1 ? 'boss_cuckoo' : 'npc_pip_awake', i % 3 === 0 ? PH.lamp : i % 3 === 1 ? PH.cuckoo : PH.pip, x, 640 - b * 20, { h: 130, mood: 'awake', pose: 'cuckoo', t, sy: 1 + b * 0.08, rot: inR ? Math.sin(t * 6 + i) * 0.08 : 0 });
        ctx.restore(); }
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 640 + Math.cos(a) * r * 0.8, 160 + Math.sin(a) * r * 0.5, { h: 40, anchor: 'center' }); }
    },
    gramoUnwind(ctx, t) {
      bg(ctx, '#2a2c44', '#3b3046'); ground(ctx, '#5f6650');
      for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(242,193,78,.8)'; ctx.beginPath(); ctx.arc(160 + i * 190, 150 + (i % 2) * 30, 14, 0, 7); ctx.fill(); }
      PH.stage && WT.drawThing(ctx, 'prop_stage', PH.stage, 640, 560, { h: 150, anchor: 'center' });
      const k = Math.min(1, t / 3);
      WT.drawThing(ctx, ['npc_gramo_sleepy', 'npc_gramo_awake'], PH.gramo, 640, 545, { h: 240, mood: k > 0.5 ? 'sleepy' : 'awake', t, rot: k * 0.18 });
      for (let i = 0; i < 5; i++) WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 560 + i * 45, 260 + k * 160 + i * 12, { h: 40, anchor: 'center', rot: k * 1.2, sy: 1 + k * 0.6, alpha: 1 - k * 0.5 });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 330, 610, { h: 150, mood: 'awake', t, rot: k * 0.25 });
    },
    montage(ctx, t) {
      ctx.fillStyle = '#d7be97'; ctx.fillRect(0, 0, WT.W / 2, WT.H); ctx.fillStyle = '#2a2c44'; ctx.fillRect(WT.W / 2, 0, WT.W / 2, WT.H);
      ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(WT.W / 2, 0); ctx.lineTo(WT.W / 2, WT.H); ctx.stroke();
      ctx.save(); ctx.filter = 'grayscale(.8)';
      const x = 120 + ((t * 300) % 420);
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, x, 600, { h: 170, mood: 'awake', t, rot: 0.15 });
      ctx.strokeStyle = 'rgba(61,51,70,.5)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 160, 470 + i * 30); ctx.lineTo(x - 70, 470 + i * 30); ctx.stroke(); }
      WT.drawThing(ctx, 'npc_lamp_on', PH.lamp, 960, 640, { h: 380, mood: 'awake' });
      ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(240,245,255,.35)'; ctx.beginPath(); ctx.arc(1010, 330, 120, 0, 7); ctx.fill(); ctx.restore();
    },
    recall(ctx, t) {
      bg(ctx, '#160f18', '#2a1a22');
      ctx.fillStyle = '#3a2a30'; for (let i = 0; i < 8; i++) ctx.fillRect(820 + i * 55, 300 - (i * 37 % 100), 40, 300);
      const g = ctx.createRadialGradient(1050, 260, 10, 1050, 260, 360); g.addColorStop(0, `rgba(224,71,60,${0.6 + Math.sin(t * 6) * 0.2})`); g.addColorStop(1, 'rgba(224,71,60,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      ground(ctx, '#3a3d34');
      ctx.save(); ctx.filter = 'grayscale(1) brightness(.85)';
      WT.drawThing(ctx, 'npc_pip_sleepy', PH.pip, 300, 620, { h: 160, mood: 'sleepy', rot: 0.1 }); WT.drawThing(ctx, 'npc_lamp_off', PH.lamp, 520, 640, { h: 300, mood: 'sleepy' });
      ctx.restore();
      ctx.strokeStyle = 'rgba(242,193,78,.9)'; ctx.lineWidth = 4;
      [[300, 520], [540, 380]].forEach(([x, y], i) => { const k = (t * 0.4 + i * 0.3) % 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 200, y - 200, 900, 200 + Math.sin(t * 3 + i) * 40, x + (1050 - x) * k, y + (260 - y) * k); ctx.stroke(); });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 760, 650, { h: 150, dir: 'side', t, flip: true });
    },
    confess(ctx, t) {
      bg(ctx, '#232338', '#1a1828'); ground(ctx, '#3f4436');
      ctx.fillStyle = '#6b4a2a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.fillRect(540, 560, 160, 70); ctx.strokeRect(540, 560, 160, 70);
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, 620, 570, { h: 190, power: 'battery', t, rot: 0.08, alpha: 0.9 });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 820, 640, { h: 150, dir: 'side', t, flip: true });
      WT.drawThing(ctx, 'npc_gramo_sleepy', PH.gramo, 330, 620, { h: 200, mood: 'sleepy', t });
    },
    gramoKey(ctx, t) {
      bg(ctx, '#3a2a30', '#2a1d22');
      ctx.fillStyle = 'rgba(242,193,78,.25)'; ctx.beginPath(); ctx.arc(640, 360, 300, 0, 7); ctx.fill();
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 470, 640, { h: 380, mood: 'awake', t, flip: true });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 860, 650, { h: 220, dir: 'side', t, flip: true });
      const k = Math.min(1, t / 2.5);
      WT.drawThing(ctx, 'prop_key', PH.key, 560 + k * 200, 360 + Math.sin(t * 3) * 6, { h: 90, rot: k * 0.6 });
    },
    departure(ctx, t) {
      bg(ctx, '#f6c98e', '#e9b47a');
      ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(1000, 470, 110, Math.PI, 0); ctx.fill();
      ground(ctx, '#a3a578');
      ctx.fillStyle = C.sand; ctx.beginPath(); ctx.moveTo(500, WT.H); ctx.quadraticCurveTo(820, 520, 1280, 470); ctx.lineTo(1280, 500); ctx.quadraticCurveTo(860, 560, 700, WT.H); ctx.fill();
      const x = Math.min(860, 620 + t * 50);
      WT.drawThing(ctx, ['player_walk_side_01', 'player_idle_side'], PH.bogle, x, 640 - Math.abs(Math.sin(t * 10)) * 6, { h: 170, pose: 'walk', dir: 'side', t });
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, x - 130, 640, { h: 140, power: 'battery', t });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 220, 620, { h: 210, mood: 'awake', t, rot: Math.sin(t * 2) * 0.05 });
      ctx.save(); ctx.filter = 'grayscale(1)'; WT.drawThing(ctx, 'npc_pip_sleepy', PH.pip, 380, 640, { h: 120, mood: 'sleepy' }); ctx.restore();
    },
    toadGate(ctx, t) {
      bg(ctx, '#b0827a', '#6e5a62');
      ctx.fillStyle = '#5c6470'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.fillRect(300, 120, 680, 520); ctx.strokeRect(300, 120, 680, 520);
      ctx.fillStyle = '#e07a3a'; for (let x = 310; x < 970; x += 60) ctx.fillRect(x, 130, 30, 14);
      ground(ctx, '#5a5e66');
      WT.drawThing(ctx, ['boss_toad_croak', 'boss_toad_idle'], PH.toad, 760, 610, { h: 330, t, atk: 'floor' });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 280, 650, { h: 130, dir: 'side', t });
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, 170, 650, { h: 120, power: 'battery', t });
    },
    voltReveal(ctx, t) {
      bg(ctx, '#3a2a2a', '#1e1618');
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI - Math.PI; ctx.strokeStyle = 'rgba(242,193,78,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(640 + Math.cos(a) * 640, 360 + Math.sin(a) * 300); ctx.quadraticCurveTo(700, 200, 820, 330 + Math.sin(t * 2 + i) * 10); ctx.stroke(); }
      ground(ctx, '#3a3436');
      WT.drawThing(ctx, ['boss_volt_idle'], PH.volt, 860, 640, { h: 470, t, state: 'attack' });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 300, 660, { h: 120, dir: 'side', t });
      WT.drawThing(ctx, 'npc_radio_idle', PH.radio, 190, 660, { h: 110, power: 'battery', t });
    },
    radioCollapse(ctx, t) {
      bg(ctx, '#2a2226', '#161013'); ground(ctx, '#3a3436');
      ctx.save(); ctx.filter = 'grayscale(1) brightness(.8)'; WT.drawThing(ctx, 'npc_radio_off', PH.radio, 520, 640, { h: 200, power: 'battery', off: true, rot: 0.3 }); ctx.restore();
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 360, 650, { h: 150, dir: 'side', t });
      ctx.globalAlpha = 0.85; WT.drawThing(ctx, ['boss_volt_idle'], PH.volt, 1050, 640, { h: 420, t, state: 'attack' }); ctx.globalAlpha = 1;
    },
    radioReborn(ctx, t) {
      bg(ctx, '#3a2a1a', '#1e1610');
      const g = ctx.createRadialGradient(560, 420, 10, 560, 420, 420); g.addColorStop(0, 'rgba(242,193,78,.9)'); g.addColorStop(1, 'rgba(242,193,78,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      ground(ctx, '#4a3e30');
      const k = Math.min(1, t / 1.5);
      WT.drawThing(ctx, ['npc_radio_reborn_broadcast', 'npc_radio_reborn_idle'], PH.radio, 560, 640, { h: 200 + k * 60, reborn: true, t, sy: 0.8 + k * 0.2 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 560 + Math.cos(a) * 240 * k, 380 + Math.sin(a) * 160 * k, { h: 44, anchor: 'center' }); }
      WT.drawThing(ctx, ['boss_volt_idle'], PH.volt, 1100, 640, { h: 380, t, state: 'over', alpha: 0.8 });
    },
    voltSmall(ctx, t) {
      bg(ctx, '#4a3a30', '#2a2220'); ground(ctx, '#4a4440');
      WT.drawThing(ctx, 'boss_volt_small', PH.volt, 640, 640, { h: 170, t, state: 'small' });
      WT.drawThing(ctx, 'player_happy', PH.bogle, 430, 650, { h: 160, pose: 'happy', t });
      WT.drawThing(ctx, ['npc_radio_reborn_dance', 'npc_radio_reborn_idle'], PH.radio, 880, 650, { h: 190, reborn: true, t });
    },
    home(ctx, t) {
      bg(ctx, '#f6dcae', '#e9c08a'); ground(ctx, '#a3a578');
      PH.stage && WT.drawThing(ctx, 'prop_stage', PH.stage, 640, 560, { h: 150, anchor: 'center' });
      const b = Math.abs(Math.sin(t * 3.5));
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 560, 545 - b * 8, { h: 230, mood: 'awake', t });
      WT.drawThing(ctx, ['npc_radio_reborn_dance', 'npc_radio_reborn_idle'], PH.radio, 740, 550 - b * 10, { h: 230, reborn: true, t });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 260, 630 - b * 10, { h: 150, mood: 'awake', t });
      WT.drawThing(ctx, 'npc_lamp_on', PH.lamp, 1050, 660, { h: 300, mood: 'awake' });
      for (let i = 0; i < 8; i++) { const k = (t * 0.4 + i / 8) % 1; ctx.strokeStyle = `rgba(242,193,78,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(100 + i * 150, -20 + k * 300); ctx.lineTo(110 + i * 150, 20 + k * 300); ctx.stroke(); }
    },
    shadowHall(ctx, t) {
      bg(ctx, '#140e12', '#22161a');
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#2c2228'; ctx.fillRect(80 + i * 240, 60, 90, 360); }
      // 마을에서 끌려오는 실
      for (let i = 0; i < 8; i++) { const sx = 60 + i * 150, k = (t * 0.35 + i * 0.13) % 1; ctx.strokeStyle = `rgba(242,193,78,${0.5 + 0.4 * Math.sin(t * 3 + i)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, 120); ctx.quadraticCurveTo(sx + (760 - sx) * 0.5, 80 + i * 10, 760, 330); ctx.stroke(); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(sx + (760 - sx) * k, 120 + (330 - 120) * k * k, 5, 0, 7); ctx.fill(); }
      const g = ctx.createRadialGradient(760, 330, 10, 760, 330, 260); g.addColorStop(0, 'rgba(242,193,78,.35)'); g.addColorStop(1, 'rgba(242,193,78,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      // 그림자 둘
      ctx.save(); ctx.filter = 'brightness(0)';
      WT.drawThing(ctx, 'boss_volt_idle', PH.volt, 820, 640, { h: 540, t, state: 'attack' });
      ctx.fillRect(300, 470, 260, 260); // 문지기가 올라선 단(자막에 가리지 않게)
      WT.drawThing(ctx, 'boss_toad_idle', PH.toad, 430, 470, { h: 210, t });
      ctx.restore();
      ctx.fillStyle = C.yellow; [[770, 230], [812, 230], [384, 350], [412, 350]].forEach(([x, y], i) => { ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2 + i); ctx.beginPath(); ctx.ellipse(x, y, i < 2 ? 12 : 7, i < 2 ? 7 : 5, 0, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    },
    shadowPlan(ctx, t) {
      bg(ctx, '#0e0a0c', '#2a1012');
      const g = ctx.createLinearGradient(0, WT.H, 0, 0); g.addColorStop(0, 'rgba(224,71,60,.45)'); g.addColorStop(1, 'rgba(224,71,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
      // 탁자 위 지도: 마을마다 건전지 표시
      ctx.fillStyle = '#5a4030'; ctx.fillRect(140, 520, 1000, 200);
      ctx.fillStyle = '#c9b48a'; ctx.beginPath(); ctx.roundRect(260, 500, 760, 120, 8); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(320 + i * 120, 560 + (i % 2) * 20); WT.PH.battery(ctx, 26); ctx.restore(); }
      ctx.save(); ctx.filter = 'brightness(0)';
      WT.drawThing(ctx, 'boss_volt_magnet', PH.volt, 760, 520, { h: 520, t, atk: 'magnet' });
      WT.drawThing(ctx, 'boss_toad_idle', PH.toad, 300, 520, { h: 200, t });
      ctx.restore();
      // 들어 올린 건전지 + 빨려 나가는 실
      WT.drawThing(ctx, 'prop_battery', PH.battery, 560, 250 + Math.sin(t * 2) * 4, { h: 70 });
      ctx.strokeStyle = 'rgba(242,193,78,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(560, 220); ctx.quadraticCurveTo(650, 160 + Math.sin(t * 3) * 20, 740, 280); ctx.stroke();
      ctx.fillStyle = C.yellow; [[715, 210], [752, 210], [262, 405], [284, 405]].forEach(([x, y], i) => { ctx.beginPath(); ctx.ellipse(x, y, i < 2 ? 11 : 6, i < 2 ? 6 : 4, 0, 0, 7); ctx.fill(); });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(733, 240, 26, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    },
    parcel(ctx, t) {
      bg(ctx, '#f6dcae', '#e9c08a'); ground(ctx, '#a3a578');
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 640, 545, { h: 230, mood: 'awake', t });
      WT.drawThing(ctx, ['npc_radio_reborn_idle'], PH.radio, 820, 560, { h: 200, reborn: true, t });
      const x = Math.min(420, -100 + t * 260);
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, x, 640 - Math.abs(Math.sin(t * 12)) * 10, { h: 150, mood: 'awake', t });
      WT.drawThing(ctx, 'prop_parcel_closed', (c) => { c.fillStyle = '#b98a5a'; c.strokeStyle = C.outline; c.lineWidth = 4; c.fillRect(-26, -40, 52, 40); c.strokeRect(-26, -40, 52, 40); }, x + 60, 520 + Math.sin(t * 40) * 3, { h: 50 });
    },
    orgelScream(ctx, t) {
      bg(ctx, '#f0c8b0', '#d9a090'); ground(ctx, '#a3a578');
      WT.drawThing(ctx, 'prop_orgel_wild', PH.orgel, 640 + (Math.random() - 0.5) * 6, 620, { h: 160, wild: true, t });
      ctx.strokeStyle = '#e07a3a'; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 4; ctx.beginPath(); ctx.moveTo(640 + Math.cos(a) * 120, 520 + Math.sin(a) * 80); ctx.lineTo(640 + Math.cos(a) * 170, 520 + Math.sin(a) * 110); ctx.stroke(); }
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 330, 640, { h: 140, mood: 'awake', t, rot: -0.15 });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 930, 650, { h: 150, dir: 'side', t, flip: true, rot: 0.1 });
    },
    flashStage(ctx, t) {
      ctx.save(); ctx.filter = 'sepia(1) contrast(1.05)';
      bg(ctx, '#3a2a20', '#1e1612');
      ctx.fillStyle = '#8f2f2a'; ctx.fillRect(0, 0, 160, WT.H); ctx.fillRect(WT.W - 160, 0, 160, WT.H);
      ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.beginPath(); ctx.moveTo(500, 0); ctx.lineTo(780, 0); ctx.lineTo(900, 640); ctx.lineTo(380, 640); ctx.fill();
      ctx.fillStyle = '#6a4a30'; ctx.fillRect(200, 600, 880, 40);
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 520, 600, { h: 260, mood: 'awake', t, rot: Math.sin(t * 2) * 0.04 });
      WT.drawThing(ctx, ['npc_melody', 'boss_melody_calm'], PH.melody, 780, 600, { h: 260, state: 'calm', t });
      ctx.restore();
    },
    flashGift(ctx, t) {
      ctx.save(); ctx.filter = 'sepia(1) contrast(1.05)';
      bg(ctx, '#d9b08a', '#8a6a50'); ground(ctx, '#6a5a4a');
      ctx.fillStyle = '#4a3a30'; ctx.fillRect(900, 300, 380, 320); ctx.fillRect(880, 280, 420, 30);
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 470, 620, { h: 260, mood: 'awake', t });
      WT.drawThing(ctx, ['npc_melody', 'boss_melody_calm'], PH.melody, 740, 620, { h: 240, state: 'calm', t });
      WT.drawThing(ctx, 'prop_orgel_calm', PH.orgel, 610, 470, { h: 70, t });
      ctx.restore();
    },
    hiddenVoice(ctx, t) {
      bg(ctx, '#3a2a30', '#2a1d22');
      ctx.fillStyle = 'rgba(232,160,168,.18)'; ctx.beginPath(); ctx.arc(640, 360, 280, 0, 7); ctx.fill();
      WT.drawThing(ctx, 'prop_orgel_calm', PH.orgel, 640, 560, { h: 150, t });
      ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(t * 2) * 0.1; WT.drawThing(ctx, ['portrait_melody_calm', 'npc_melody'], PH.melody, 640, 300, { h: 220, anchor: 'center', state: 'calm', t }); ctx.restore();
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 330, 640, { h: 220, mood: 'awake', t });
    },
    waltzSignal(ctx, t) {
      bg(ctx, '#f3c6c8', '#d79aa8'); ground(ctx, '#a3a578');
      ctx.fillStyle = '#c48296'; ctx.fillRect(1000, 260, 180, 220); ctx.beginPath(); ctx.moveTo(990, 260); ctx.lineTo(1090, 170); ctx.lineTo(1190, 260); ctx.fill();
      for (let i = 0; i < 5; i++) { const k = (t * 0.6 + i / 5) % 1; ctx.strokeStyle = `rgba(232,160,168,${1 - k})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(1090, 300, 30 + k * 600, Math.PI * 0.7, Math.PI * 1.3); ctx.stroke(); }
      WT.drawThing(ctx, ['npc_radio_reborn_broadcast', 'npc_radio_reborn_idle'], PH.radio, 520, 640, { h: 220, reborn: true, t });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 700, 650, { h: 150, dir: 'side', t });
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 260, 620, { h: 210, mood: 'awake', t });
    },
    orgelTown(ctx, t) {
      bg(ctx, '#f3c6c8', '#e2a9b6'); ground(ctx, '#c48296');
      for (let i = 0; i < 6; i++) { const k = ['tin', 'bird', 'top'][i % 3], b = Math.abs(Math.sin(t * 9 + i)); WT.drawThing(ctx, [`npc_${k}_dance_0${Math.floor(t * 6 + i) % 2 + 1}`], PH.dancer, 140 + i * 200, 640 - b * 16, { h: 140, kind: k, on: true, t: t + i, rot: Math.sin(t * 9 + i) * 0.15 }); }
    },
    ballroom(ctx, t) {
      bg(ctx, '#5a2a3a', '#2a1420');
      ctx.fillStyle = 'rgba(242,193,78,.2)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(200 + i * 300, 80, 40, 0, 7); ctx.fill(); }
      ground(ctx, '#8a5a6a');
      WT.drawThing(ctx, 'boss_melody_idle', PH.melody, 760, 620, { h: 420, state: 'attack', t });
      WT.drawThing(ctx, 'player_idle_side', PH.bogle, 300, 650, { h: 120, dir: 'side', t });
    },
    memory1(ctx, t) { ART.flashStage(ctx, t); },
    memory2(ctx, t) {
      ctx.save(); ctx.filter = 'sepia(1) brightness(.8)';
      bg(ctx, '#1a1418', '#0e0a0c');
      ctx.fillStyle = 'rgba(255,240,200,.12)'; ctx.beginPath(); ctx.arc(640, 420, 200, 0, 7); ctx.fill();
      WT.drawThing(ctx, ['npc_melody', 'boss_melody_calm'], PH.melody, 640, 600, { h: 200, state: 'calm', t, rot: 0.08 });
      ctx.restore();
    },
    melodyStops(ctx, t) {
      bg(ctx, '#f3c6c8', '#e2a9b6'); ground(ctx, '#c48296');
      WT.drawThing(ctx, ['boss_melody_calm', 'npc_melody'], PH.melody, 760, 620, { h: 340, state: 'calm', t });
      WT.drawThing(ctx, ['npc_radio_reborn_broadcast', 'npc_radio_reborn_idle'], PH.radio, 360, 640, { h: 220, reborn: true, t });
      for (let i = 0; i < 6; i++) { const k = (t * 0.25 + i / 6) % 1; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 420 + k * 300, 380 - Math.sin(k * 3 + i) * 40, { h: 34, anchor: 'center', alpha: 1 - k }); }
      ['tin', 'bird', 'top'].forEach((k, i) => WT.drawThing(ctx, [`npc_${k}_rest`], PH.dancer, 120 + i * 90, 660, { h: 90, kind: k, on: false, t }));
    },
    duet(ctx, t) {
      bg(ctx, '#e9b47a', '#c48a5a'); ground(ctx, '#a3a578');
      PH.stage && WT.drawThing(ctx, 'prop_stage', PH.stage, 640, 560, { h: 150, anchor: 'center' });
      const b = Math.abs(Math.sin(t * 2));
      WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, 560, 545 - b * 4, { h: 230, mood: 'awake', t });
      WT.drawThing(ctx, ['npc_melody', 'boss_melody_calm'], PH.melody, 740, 550, { h: 220, state: 'calm', t, rot: Math.sin(t) * 0.05 });
      WT.drawThing(ctx, ['npc_radio_reborn_idle'], PH.radio, 960, 600, { h: 180, reborn: true, t });
      WT.drawThing(ctx, 'npc_pip_awake', PH.pip, 250, 630, { h: 140, mood: 'awake', t });
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
      // 넘기는 방법 안내 (상자 오른쪽 아래, 깜빡임)
      ctx.save(); ctx.globalAlpha = fade * (0.55 + 0.45 * Math.abs(Math.sin(time * 2.5)));
      ctx.textAlign = 'right'; ctx.font = '19px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.yellow;
      ctx.fillText('Space ▶ 다음', WT.W - 134, WT.H - 48);
      ctx.restore();
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
  };
})();

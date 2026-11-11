// 시작 화면: 배경·제목(캔버스) + 시작/게임설명 버튼(HTML) + 게임설명 모달
// 배치·문구 기준: assets/sheets/INTRO_layout.json (Codex 제안)
(function () {
  const C = WT.C;
  const I = WT.Intro = { active: false, helpOpen: false };
  const $ = (s) => document.querySelector(s);
  const LAYOUT = {
    title: { text: '태엽 마을', x: 640, y: 190, size: 92 },
    sub: { text: '멈춘 마을에 다시 음악을', x: 640, y: 275, size: 24 }
  };
  const BG = { 'ui_button_start': '#btnStart', 'ui_button_help': '#btnHelp', 'ui_help_modal': '#helpPanel' };
  const applied = {};

  I.init = function () {
    $('#btnStart').addEventListener('click', () => { WT.Audio.unlock(); WT.Audio.play('sfx_ui_click'); I.start(); });
    $('#btnHelp').addEventListener('click', () => { WT.Audio.unlock(); I.openHelp(); });
    $('#helpClose').addEventListener('click', () => I.closeHelp());
    $('#help').addEventListener('click', (e) => { if (e.target.id === 'help') I.closeHelp(); }); // 바깥 클릭
  };

  I.show = function () {
    const s = WT.Game.state;
    s.scene = 'intro';
    I.active = true;
    document.body.dataset.scene = 'intro';
    WT.UI.setScene('intro');
    setTimeout(() => $('#btnStart').focus(), 50);
  };

  I.start = function () {
    if (!I.active || WT.Game.state.ui.transition) return;
    if (I.helpOpen) I.closeHelp();
    const s = WT.Game.state;
    WT.Game.irisThen(640, 410, () => {
      I.active = false;
      s.scene = 'town';
      WT.UI.setScene('town');
      WT.Story.play(WT.DIALOGUE.opening);
    });
  };

  I.openHelp = function () {
    if (!I.active || I.helpOpen) return;
    I.helpOpen = true;
    $('#help').classList.add('open');
    WT.Audio.play('sfx_dialog_open');
    setTimeout(() => $('#helpClose').focus(), 30);
  };
  I.closeHelp = function () {
    if (!I.helpOpen) return;
    I.helpOpen = false;
    $('#help').classList.remove('open');
    WT.Audio.play('sfx_ui_click');
    $('#btnHelp').focus(); // 닫으면 설명 버튼으로 초점 복귀
  };

  // 키: Enter/Space/E 시작(초점이 설명 버튼이면 설명), H 또는 ? 설명, Esc 닫기, ←→↑↓ 버튼 이동
  I.key = function (e) {
    const c = e.code;
    if (I.helpOpen) {
      if (c === 'Escape' || c === 'Enter' || c === 'Space' || c === 'KeyE') { e.preventDefault(); I.closeHelp(); }
      else if (c === 'Tab') { e.preventDefault(); $('#helpClose').focus(); } // 모달 안에 초점 가둠
      return true;
    }
    if (c === 'KeyH' || e.key === '?') { I.openHelp(); return true; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS'].includes(c)) {
      e.preventDefault();
      (document.activeElement === $('#btnStart') ? $('#btnHelp') : $('#btnStart')).focus();
      return true;
    }
    if (c === 'Enter' || c === 'Space' || c === 'KeyE') {
      e.preventDefault();
      if (document.activeElement === $('#btnHelp')) I.openHelp(); else I.start();
      return true;
    }
    return c !== 'KeyM' && c !== 'Backquote' && c !== 'F8';
  };

  // 버튼·모달 바탕 이미지: 불러오면 CSS 배경으로 씀. 없으면 CSS 대체 모양 그대로.
  I.update = function () {
    Object.entries(BG).forEach(([id, sel]) => {
      if (applied[id]) return;
      const t = WT.Assets.tex(id);
      if (t && t.src) { const el = $(sel); el.style.backgroundImage = `url("${t.src}")`; el.classList.add('img'); applied[id] = true; }
    });
  };

  // ───────── 캔버스: 배경과 제목 ─────────
  function phBg(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, WT.H);
    g.addColorStop(0, '#f2c98a'); g.addColorStop(0.55, '#f6dfb4'); g.addColorStop(1, '#c9b27a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
    ctx.fillStyle = '#a3a578'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 520); ctx.quadraticCurveTo(640, 440, WT.W, 520); ctx.lineTo(WT.W, WT.H); ctx.lineTo(0, WT.H); ctx.closePath(); ctx.fill(); ctx.stroke();
    WT.drawThing(ctx, 'prop_house', WT.PH.house, 150, 560, { h: 280 });
    WT.drawThing(ctx, 'prop_tree_round', WT.PH.tree, 1120, 580, { h: 300 });
  }
  I.draw = function (ctx, t) {
    if (WT.Assets.has('bg_intro')) WT.drawThing(ctx, 'bg_intro', null, WT.W / 2, WT.H, { h: WT.H, sx: WT.W / (WT.H * WT.Assets.aspect('bg_intro')) });
    else phBg(ctx);
    // 제목: 크림 테두리 + 고무줄처럼 통통
    const L = LAYOUT.title, b = Math.abs(Math.sin(t * 2.2));
    ctx.save();
    ctx.translate(L.x, L.y + 10 - b * 8); ctx.scale(1 + b * 0.03, 1 - b * 0.03); ctx.rotate(Math.sin(t * 1.1) * 0.015);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${L.size}px "Do Hyeon", sans-serif`;
    ctx.lineJoin = 'round'; ctx.strokeStyle = C.cream; ctx.lineWidth = 16; ctx.strokeText(L.text, 0, 0);
    ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.strokeText(L.text, 0, 0);
    ctx.fillStyle = C.red; ctx.fillText(L.text, 0, 0);
    ctx.restore();
    const S = LAYOUT.sub;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${S.size}px "Gowun Dodum", sans-serif`;
    const w = ctx.measureText(S.text).width + 48;
    ctx.fillStyle = 'rgba(244,230,200,.9)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(S.x - w / 2, S.y - 22, w, 44, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.outline; ctx.fillText(S.text, S.x, S.y + 1);
    // 양옆 태엽 열쇠 장식 (빙글빙글)
    [[S.x - w / 2 - 34, 1], [S.x + w / 2 + 34, -1]].forEach(([x, d]) => WT.drawThing(ctx, 'prop_key', WT.PH.key, x, S.y + 22, { h: 44, rot: Math.sin(t * 3) * 0.3 * d }));
    // 떠다니는 음표
    for (let i = 0; i < 4; i++) {
      const k = (t * 0.25 + i / 4) % 1;
      WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], WT.PH.note, 260 + i * 250 + Math.sin(t + i) * 30, 640 - k * 520, { h: 34, anchor: 'center', alpha: Math.sin(k * Math.PI) * 0.8 });
    }
    ctx.globalAlpha = 0.75; ctx.font = '16px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.outline;
    ctx.fillText('Enter 시작 · H 게임설명 · M 소리', WT.W / 2, 690);
    ctx.restore();
  };
})();

// DOM UI: 무성영화 자막 카드 대화창, 집 꾸미기 툴바, 조작 안내, 디버그 패널
(function () {
  const $ = (s) => document.querySelector(s);
  const UI = WT.UI = {};
  let typing = null;

  UI.init = function () {
    $('#card').addEventListener('click', UI.advance);
    $('#btnExit').addEventListener('click', () => { WT.Audio.play('sfx_ui_click'); WT.Game.exitHouse(); });
    $('#btnSnap').addEventListener('click', () => { WT.Game.toggleSnap(); UI.refreshToolbar(); });
    $('#btnDel').addEventListener('click', () => WT.Game.deleteSelected());
    $('#btnFlip').addEventListener('click', () => WT.Game.flipSelected());
    UI.setScene('town');
  };

  // ───────── 대화 ─────────
  // opt: { who, name, mood, lines[], onClose }
  UI.dialog = function (opt) {
    const s = WT.Game.state;
    s.ui.dialog = Object.assign({ i: 0 }, opt);
    const card = $('#card');
    card.classList.remove('closing');
    card.classList.add('open');
    WT.Audio.play('sfx_dialog_open');
    card.setAttribute('aria-hidden', 'false');
    card.dataset.mood = opt.mood || 'sleepy';
    $('#cardName').textContent = opt.name;
    drawPortrait(opt);
    showLine();
  };
  function drawPortrait(opt) {
    const cv = $('#cardPortrait'), c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    const id = `portrait_${opt.who}_${opt.mood}`;
    if (opt.who === 'boss') {
      const pid = opt.mood === 'cuckoo' ? 'portrait_boss_cuckoo' : 'portrait_boss_angry';
      if (WT.Assets.has(pid)) { WT.drawThing(c, pid, null, cv.width / 2, cv.height / 2, { h: cv.height * 0.9, anchor: 'center' }); return; }
      WT.drawThing(c, opt.mood === 'cuckoo' ? 'boss_cuckoo' : 'boss_idle', WT.PH.boss, cv.width / 2, cv.height * 0.98, { h: cv.height * 0.95, pose: opt.mood === 'cuckoo' ? 'cuckoo' : 'idle', t: 0 });
      return;
    }
    const npcId = { gramo: `npc_gramo_${opt.mood}`, pip: `npc_pip_${opt.mood}`, lamp: opt.mood === 'awake' ? 'npc_lamp_on' : 'npc_lamp_off' }[opt.who];
    const ph = (ctx, h, o) => WT.PH.portrait(ctx, h, Object.assign({ who: opt.who }, o));
    if (WT.Assets.has(id)) WT.drawThing(c, id, null, cv.width / 2, cv.height / 2, { h: cv.height * 0.9, anchor: 'center' });
    else WT.drawThing(c, npcId, ph, cv.width / 2, cv.height * 0.95, { h: cv.height * 0.85, mood: opt.mood, t: 0 });
  }
  function showLine() {
    const d = WT.Game.state.ui.dialog;
    const text = d.lines[d.i] || '';
    const el = $('#cardTyped');
    $('#cardText').dataset.line = text;
    $('#card').dataset.typing = 'true';
    $('#cardAction').textContent = '바로 읽기';
    $('#cardProgress').textContent = String(d.i + 1).padStart(2, '0') + ' / ' + String(d.lines.length).padStart(2, '0');
    el.textContent = '';
    clearInterval(typing && typing.timer);
    const speed = d.mood === 'awake' ? WT.CFG.typeAwake : WT.CFG.typeSleepy;
    typing = { text, n: 0, timer: setInterval(() => {
      typing.n++;
      // 글자 출력음: 깨어 있으면 2글자, 졸리면 3글자마다. 공백은 건너뜀
      const sleepy = d.mood === 'sleepy', every = sleepy ? 3 : 2, ch = text[typing.n - 1];
      const blip = d.who === 'boss' ? 'sfx_text_blip_boss' : sleepy ? 'sfx_text_blip_sleepy' : 'sfx_text_blip_awake';
      if (typing.n % every === 1 && ch && ch.trim()) WT.Audio.play(blip, { rate: 0.9 + Math.random() * 0.2 });
      el.textContent = text.slice(0, typing.n);
      if (typing.n >= text.length) { clearInterval(typing.timer); typing.timer = null; lineReady(); }
    }, speed) };
    $('#cardMore').textContent = d.i < d.lines.length - 1 ? '◆' : '■';
  }
  function lineReady() {
    const d = WT.Game.state.ui.dialog;
    $('#card').dataset.typing = 'false';
    $('#cardAction').textContent = d && d.i < d.lines.length - 1 ? '계속' : '대화 마치기';
  }
  UI.advance = function () {
    const d = WT.Game.state.ui.dialog;
    if (!d) return;
    if (typing && typing.timer) { clearInterval(typing.timer); typing.timer = null; $('#cardTyped').textContent = typing.text; lineReady(); return; }
    d.i++;
    if (d.i < d.lines.length) { WT.Audio.play('sfx_dialog_next'); showLine(); } else UI.closeDialog();
  };
  UI.closeDialog = function () {
    const s = WT.Game.state, d = s.ui.dialog;
    if (!d) return;
    if (typing) clearInterval(typing.timer);
    s.ui.dialog = null;
    const card = $('#card');
    card.classList.add('closing');
    card.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!WT.Game.state.ui.dialog) card.classList.remove('open', 'closing'); }, 260);
    if (d.onClose) d.onClose();
  };
  UI.shake = function (k) { WT.Render.shakeT = Math.max(WT.Render.shakeT, k); };
  UI.flash = function () { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };

  // ───────── 장면별 UI ─────────
  UI.setScene = function (scene) {
    document.body.dataset.scene = scene;
    $('#hint').innerHTML = scene === 'town'
      ? '<b>WASD</b> 이동 · <b>Shift</b> 빨리 · <b>Space</b> 점프 · <b>E</b> 상호작용 · <b>M</b> 소리'
      : scene === 'intro' ? ''
      : scene === 'arena' ? '<b>WASD</b> 이동 · <b>Space</b> 점프(링·작은 톱니 회피) · <b>E</b> 과감기'
      : '<b>클릭</b> 놓기·선택 · <b>드래그</b> 옮기기 · <b>R</b> 뒤집기 · <b>Delete</b> 삭제 · <b>G</b> 격자 · <b>Esc</b> 취소/나가기';
    UI.refreshToolbar();
  };
  UI.refreshToolbar = function () {
    const s = WT.Game.state;
    if (!s) return;
    const h = s.house, box = $('#furnBtns');
    box.innerHTML = '';
    Object.entries(WT.FURN).forEach(([type, def]) => {
      const b = document.createElement('button');
      const locked = !h.unlocked.includes(type);
      b.className = 'furn' + (h.placing === type ? ' on' : '') + (locked ? ' locked' : '');
      b.disabled = locked;
      b.title = locked ? '퀘스트 보상으로 열림' : `${def.label} (${def.key})`;
      const cv = document.createElement('canvas'); cv.width = 72; cv.height = 64;
      WT.drawThing(cv.getContext('2d'), def.asset, WT.PH[type], 36, 60, { h: 54 });
      b.appendChild(cv);
      const sp = document.createElement('span'); sp.textContent = locked ? '잠김' : `${def.key} ${def.label}`; b.appendChild(sp);
      b.addEventListener('click', () => WT.Game.selectPlacing(type));
      box.appendChild(b);
    });
    $('#btnSnap').classList.toggle('on', h.snap);
    $('#btnDel').disabled = h.selected == null;
    $('#btnFlip').disabled = h.selected == null;
    $('#houseMsg').textContent = h.placing ? `${WT.FURN[h.placing].label}: 바닥을 클릭해 놓기` : h.selected != null ? '선택됨: 드래그로 옮기기 · R 뒤집기 · Delete 삭제' : `놓은 가구 ${h.furniture.length}개`;
  };

  // ───────── 디버그 패널 ─────────
  UI.debug = function () {
    const s = WT.Game.state, el = $('#debug');
    el.hidden = !s.ui.debug;
    if (!s.ui.debug) return;
    const st = WT.Assets.status();
    el.innerHTML = `<b>리소스 ${st.ok}/${st.all}</b>${location.protocol === 'file:' ? '<br><span class="warn">file:// 실행 중 — 자동 자르기·배경 제거 꺼짐</span>' : ''}`
      + (st.raw ? `<br>정리 안 된 이미지 ${st.raw}` : '')
      + (st.missReq.length ? `<br>필수 없음 ${st.missReq.length}<br><small>${st.missReq.join('<br>')}</small>` : '<br>필수 리소스 완료')
      + `<br><small>F8 다시 불러오기 · \` 닫기</small>`;
  };
})();

// 맵 배치와 충돌 박스. 좌표는 모두 발끝(아래 중앙) 기준.
// foot: [가로, 세로] 발밑 충돌 박스 크기. low: true 면 점프로 넘을 수 있음.
(function () {
  const P = [];
  const add = (o) => { P.push(o); return o; };

  // 집 (문은 아래 가운데)
  add({ kind: 'house', asset: 'prop_house', x: 230, y: 330, h: 260, foot: [230, 62] });

  // 나무
  [[90, 520, 'round'], [60, 708, 'tall'], [1000, 215, 'round'], [1190, 252, 'tall'],
   [760, 215, 'tall'], [905, 702, 'round'], [1228, 708, 'tall'], [330, 700, 'round']].forEach(([x, y, t]) =>
    add({ kind: 'tree', type: t, asset: t === 'round' ? 'prop_tree_round' : 'prop_tree_tall', x, y,
          h: t === 'round' ? 190 : 230, foot: t === 'round' ? [62, 24] : [50, 22] }));

  // 울타리 (윗줄)
  for (let x = 440; x <= 1220; x += 120) add({ kind: 'fence', asset: 'prop_fence', x, y: 168, h: 70, foot: [120, 16] });

  // 세 번째 열쇠를 둘러싼 덤불·돌 울타리 (점프로만 들어감)
  [1000, 1080, 1160].forEach((x) => {
    add({ kind: 'bush', asset: 'prop_bush', x, y: 430, h: 56, foot: [90, 28], low: true });
    add({ kind: 'bush', asset: 'prop_bush', x, y: 545, h: 56, foot: [90, 28], low: true });
  });
  [458, 486, 517].forEach((y) => {
    add({ kind: 'rock', asset: 'prop_rock', x: 950, y, h: 44, foot: [56, 24], low: true });
    add({ kind: 'rock', asset: 'prop_rock', x: 1210, y, h: 44, foot: [56, 24], low: true });
  });

  WT.WORLD = {
    bounds: { x1: 24, x2: 1256, y1: 150, y2: 712 },
    start: { x: 230, y: 410 },
    door: { x: 230, y: 346 },
    // 바닥형(그림자·깊이 정렬 없이 먼저 그림)
    ground: [
      { kind: 'stage', asset: 'prop_stage', x: 640, y: 372, h: 150, solid: null },
      { kind: 'pond', asset: 'prop_pond', x: 560, y: 600, h: 170, solid: { x: 418, y: 548, w: 284, h: 104 } }
    ],
    props: P,
    npcs: {
      gramo: { x: 640, y: 352, h: 160, foot: [84, 26], name: '그라모 영감' },
      pip:   { x: 420, y: 470, h: 120, foot: [54, 22], name: '피프' },
      lamp:  { x: 845, y: 300, h: 200, foot: [30, 16], name: '가로등' }
    },
    keys: [
      { id: 1, x: 470, y: 238 },
      { id: 2, x: 792, y: 652 },
      { id: 3, x: 1080, y: 486 }
    ]
  };

  // 충돌 박스 목록
  WT.footRect = (x, y, w, h) => ({ x: x - w / 2, y: y - h, w, h });
  WT.buildSolids = function () {
    const s = [];
    P.forEach((p) => s.push(Object.assign(WT.footRect(p.x, p.y, p.foot[0], p.foot[1]), { low: !!p.low, src: p.kind })));
    WT.WORLD.ground.forEach((g) => g.solid && s.push(Object.assign({}, g.solid, { low: false, src: g.kind })));
    Object.entries(WT.WORLD.npcs).filter(([id]) => !WT.npcVisible || WT.npcVisible(id)).forEach(([id, n]) => s.push(Object.assign(WT.footRect(n.x, n.y, n.foot[0], n.foot[1]), { low: false, src: id })));
    return s;
  };
})();

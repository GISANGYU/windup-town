// 제5막 횡스크롤 구간 데이터. 좌표: x = 길 위 위치(px), 땅 윗면 y = WT.ROAD_GY.
// ground: 땅 구간 [시작, 끝] — 사이의 빈 곳은 구덩이.
// items 종류
//   checkpoint {x}            축음기 나팔 기둥. 지나가면 체크포인트 + 태엽 100
//   charger {x}               충전소. E로 건전지 100
//   bush {x, tall?}           덤불(높이 90, tall이면 150). 점프로만 넘음
//   ledge {x, w, h}           턱/벽. h 120 이하는 그냥 점프, 190 정도는 충전 점프
//   gate {x, w}               셔터 터널. 들어가면 1.05초 뒤 끝의 셔터가 닫힘 → 건전지 속도 필요
//   conveyor {x, w, v}        거꾸로 미는 벨트(v<0)
//   puddle {x, w}             물웅덩이. 건전지면 합선
//   door {x}                  자동문. 건전지 모드로 다가가야 열림
//   elevator {x, w, h}        건전지 모드로 올라타면 h만큼 올라감
//   lift {x, w, h}            태엽 발판. E로 감으면 h만큼 올라감
//   bridge {x, w, post}       도개교(구덩이 위). post 위치에서 E로 감으면 내려옴
//   wire {x}                  감전 전선. 닿으면 피해 → 태엽으로 뛰어넘기
//   end {x}                   구간 끝
// tip: 해당 장애물 앞에서 모드별 안내(dialogue.js act5.tip)
WT.ROAD_GY = 600;
WT.ROAD_LEVELS = [
  { // 구간 1 · 들판길 (태엽 위주, 첫 갈아끼우기)
    kind: 'grass', len: 5400, bg: 'bg_road1', bgm: 'bgm_road1',
    ground: [[0, 1500], [1640, 3520], [3660, 5400]],
    items: [
      { type: 'checkpoint', x: 140 },
      { type: 'bush', x: 640, tip: 'bush' },
      { type: 'ledge', x: 960, w: 260, h: 100, tip: 'bush' },
      { type: 'pit', x: 1500, w: 140, tip: 'pit' },
      { type: 'checkpoint', x: 1820 },
      { type: 'lift', x: 2090, w: 110, h: 240, tip: 'lift' },
      { type: 'ledge', x: 2200, w: 240, h: 240 },
      { type: 'charger', x: 2640, tip: 'charger' },
      { type: 'gate', x: 2900, w: 340, tip: 'gate' },
      { type: 'checkpoint', x: 3330 },
      { type: 'pit', x: 3520, w: 140, tip: 'pit' },
      { type: 'bush', x: 4150, tip: 'bush' },
      { type: 'ledge', x: 4560, w: 240, h: 190, tip: 'tall' },
      { type: 'end', x: 5250 }
    ]
  },
  { // 구간 2 · 공장 지대 (반반, 교체 타이밍)
    kind: 'metal', len: 5800, bg: 'bg_road2', bgm: 'bgm_road2',
    ground: [[0, 1640], [1780, 2420], [2720, 3560], [3700, 5800]],
    items: [
      { type: 'checkpoint', x: 140 },
      { type: 'charger', x: 330, tip: 'charger' },
      { type: 'conveyor', x: 560, w: 520, v: -270, tip: 'conveyor' },
      { type: 'puddle', x: 1260, w: 170, tip: 'puddle' },
      { type: 'pit', x: 1640, w: 140, tip: 'pit' },
      { type: 'checkpoint', x: 1920 },
      { type: 'bridge', x: 2420, w: 300, post: 2300, tip: 'bridge' },
      { type: 'checkpoint', x: 2850 },
      { type: 'charger', x: 2990, tip: 'charger' },
      { type: 'gate', x: 3140, w: 340, tip: 'gate' },
      { type: 'pit', x: 3560, w: 140, tip: 'pit' },
      { type: 'checkpoint', x: 3860 },
      { type: 'charger', x: 4020, tip: 'charger' },
      { type: 'conveyor', x: 4220, w: 600, v: -270, tip: 'conveyor' },
      { type: 'puddle', x: 4980, w: 170, tip: 'puddle' },
      { type: 'bush', x: 5320, tip: 'bush' },
      { type: 'end', x: 5650 }
    ]
  },
  { // 구간 3 · 도시 (건전지 위주, 마지막은 태엽)
    kind: 'metal', len: 5800, bg: 'bg_road3', bgm: 'bgm_road3',
    ground: [[0, 4100], [4240, 5800]],
    items: [
      { type: 'checkpoint', x: 140 },
      { type: 'charger', x: 330, tip: 'charger' },
      { type: 'door', x: 720, tip: 'door' },
      { type: 'elevator', x: 1060, w: 120, h: 250, tip: 'elevator' },
      { type: 'ledge', x: 1180, w: 320, h: 250 },
      { type: 'wire', x: 1760, tip: 'wire' },
      { type: 'checkpoint', x: 1980 },
      { type: 'charger', x: 2160, tip: 'charger' },
      { type: 'door', x: 2420, tip: 'door' },
      { type: 'door', x: 2700, tip: 'door' },
      { type: 'gate', x: 3000, w: 360, tip: 'gate' },
      { type: 'checkpoint', x: 3480 },
      { type: 'charger', x: 3620, tip: 'charger' },
      { type: 'conveyor', x: 3760, w: 300, v: -270, tip: 'conveyor' },
      { type: 'pit', x: 4100, w: 140, tip: 'pit' },
      { type: 'puddle', x: 4420, w: 170, tip: 'puddle' },
      { type: 'wire', x: 4800, tip: 'wire' },
      { type: 'bush', x: 5080, tall: true, tip: 'tall' },
      { type: 'end', x: 5650 }
    ]
  }
];

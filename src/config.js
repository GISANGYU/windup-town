// 상수와 키 설정
window.WT = window.WT || {};

WT.W = 1280;
WT.H = 720;

WT.C = {
  outline: '#3d3346', red: '#d2463c', blue: '#3e6db5', yellow: '#f2c14e', cream: '#f4e6c8',
  white: '#fbf6ea', wood: '#8b4a2f', beige: '#cfac8d', sand: '#d7be97', navy: '#4e546e',
  olive: '#8a9a6b', grey: '#907f77', teal: '#7fa6a0', black: '#2a2230'
};

WT.CFG = {
  speed: 210,          // px/s
  runMul: 1.55,        // Shift
  jumpV: 560,          // 점프 초속
  gravity: 1750,
  lowClear: 16,        // 이 높이(z)보다 높으면 낮은 장애물을 넘음
  talkRange: 90,
  pickRange: 62,
  doorRange: 62,
  bpm: 104,
  lineW: 4,
  windTime: 1.6,       // 태엽 감기 연출 시간
  typeSleepy: 55,      // 자막 한 글자 ms
  typeAwake: 22,
  assetRetryMs: 2000
};

WT.KEY = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'], jump: ['Space'], act: ['KeyE'], cancel: ['Escape'],
  del: ['Delete', 'Backspace'], flip: ['KeyR'], snap: ['KeyG'], debug: ['Backquote'], reload: ['F8']
};

WT.FURN = {
  chair:      { asset: 'furn_chair',           h: 110, foot: 70,  label: '의자',       key: '1' },
  table:      { asset: 'furn_table',           h: 95,  foot: 100, label: '테이블',     key: '2' },
  plant:      { asset: 'furn_plant',           h: 115, foot: 54,  label: '화분',       key: '3' },
  gramophone: { asset: 'furn_gramophone_mini', h: 120, foot: 70,  label: '미니 축음기', key: '4' },
  cuckoo:     { asset: 'furn_cuckoo',          h: 130, foot: 64,  label: '뻐꾸기시계', key: '5' },
  bunting:    { asset: 'furn_bunting',         h: 110, foot: 110, label: '깃발 줄',    key: '6' },
  lantern:    { asset: 'furn_lantern',         h: 120, foot: 40,  label: '등불',       key: '7' },
  banner:     { asset: 'furn_banner',          h: 130, foot: 40,  label: '깃대',       key: '8' }
};
WT.ROOM = { x1: 150, x2: 1130, y1: 330, y2: 690, grid: 20 };

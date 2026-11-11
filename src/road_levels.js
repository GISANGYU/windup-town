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
// 구간 1·2(길) → 구간 3 문지기 아레나 → 구간 4 볼트 남작 아레나. 아레나는 len 1280, level.boss로 road_boss.js가 맡는다.
// 태엽·건전지가 닳으므로 건전지 구간 앞마다 충전소를 둔다.
WT.ROAD_LEVELS = [
 { kind: 'metal', len: 3000, bg: 'bg_road2', bgm: 'bgm_road2', ground: [[0, 1560], [1700, 3000]], items: [
  {type:'checkpoint', x:140}, {type:'charger', x:300, tip:'charger'}, {type:'conveyor', x:450, w:400, v:-270, tip:'conveyor'},
  {type:'gate', x:1000, w:260, tip:'gate'}, {type:'pit', x:1560, w:140, tip:'pit'},
  {type:'checkpoint', x:1850}, {type:'puddle', x:2100, w:150, tip:'puddle'}, {type:'end', x:2800}
 ]},
 { kind: 'metal', len: 3400, bg: 'bg_road3', bgm: 'bgm_road3', ground: [[0, 3400]], items: [
  {type:'checkpoint', x:140}, {type:'charger', x:300, tip:'charger'}, {type:'door', x:500, tip:'door'}, {type:'wire', x:930, tip:'wire'},
  {type:'checkpoint', x:1250}, {type:'charger', x:1330, tip:'charger'}, {type:'gate', x:1450, w:260, tip:'gate'},
  {type:'wire', x:2000, tip:'wire'}, {type:'end', x:2350}
 ]},
 // 구간 3 · 발전소 정문: 두꺼비집 문지기 (한 화면 아레나)
 { kind: 'metal', len: 1280, bg: 'bg_gate_arena', bgm: 'bgm_toad_boss', boss: 'toad', ground: [[0, 1280]], items: [
  {type:'checkpoint', x:200}, {type:'charger', x:320, tip:'charger'}, {type:'platform', x:430, w:140, h:100}, {type:'platform', x:790, w:130, h:170}
 ]},
 // 구간 4 · 발전소 중심 홀: 볼트 남작 (한 화면 아레나)
 { kind: 'metal', len: 1280, bg: 'bg_volt_arena', bgm: 'bgm_volt_boss', boss: 'volt', ground: [[0, 1280]], items: [
  {type:'checkpoint', x:220}, {type:'charger', x:490, tip:'charger'}, {type:'platform', x:300, w:140, h:110}, {type:'platform', x:540, w:140, h:190}, {type:'platform', x:760, w:140, h:260}
 ]}
];

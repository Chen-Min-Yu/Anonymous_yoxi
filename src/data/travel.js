// 出發選項（富錦街 → 瑞光路 399 號）
//
// 資料來源分兩類，畫面上有標注：
// - 叫車的等車與車程：yoxi 行程資料（analysis/analyze.py，見 real.json 的 demo_corridor）
// - 車型加成、捷運時刻與票價、接駁時間：示意值。原始 CSV 沒有車型欄位，也沒有大眾運輸資料
import { me } from './scenario'
import { corridor } from './pulse'

const at815 = corridor.curve.find((d) => d.t === '08:15')
export const SOLO_WAIT = Math.round(at815.wait) // 資料：08:15 等車中位數
export const SOLO_RIDE = Math.round(at815.ride) // 資料：08:15 車程中位數
export const POOL_RIDE = SOLO_RIDE + 2 // 共乘多停 2 站，約多 2 分鐘

// yoxi 車型（費率加成為示意值，正式提案需向主辦方確認）
export const carTypes = [
  { id: 'ev', name: '純電', desc: '電動車，零排放', seats: 4, mult: 1, icon: 'bolt', eco: true },
  { id: 'comfort', name: '舒適', desc: '一般轎車', seats: 4, mult: 1, icon: 'car' },
  { id: 'premium', name: '尊榮', desc: '高階車款', seats: 4, mult: 1.35, icon: 'star' },
  { id: 'van', name: '六人座', desc: '可共乘 5 人', seats: 6, mult: 1.5, icon: 'users' },
]

const MRT_FARE = 25 // 文湖線 中山國中 → 港墘（示意）
const SHUTTLE_FARE = 45 // 港墘站 → 園區共乘接駁（示意）
const BUS_FARE = 30 // 民生社區 → 內科，兩段票（示意）

export const DEPART = '08:15'
const DEST = '瑞光路 399 號'

// 大眾運輸路線的逐段走法。「怎麼去」的捷運選項直接用同一份 steps 當 legs，兩邊時間才不會對不起來
const MRT_LINE = { kind: 'mrt', min: 11, label: '文湖線 往南港展覽館', detail: '中山國中 → 港墘 · 5 站' }
const transitSteps = {
  mrt: [
    { kind: 'walk', min: 12, label: '步行到中山國中站', detail: '約 900 公尺' },
    MRT_LINE,
    { kind: 'walk', min: 8, label: `步行到${DEST}`, detail: '港墘站出站，約 600 公尺' },
  ],
  mrt_pool: [
    { kind: 'walk', min: 10, label: '步行到中山國中站', detail: '約 900 公尺' },
    MRT_LINE,
    { kind: 'ride', min: 5, label: 'yoxi 共乘接駁', detail: '港墘站上車，直達公司門口' },
  ],
  bus: [
    { kind: 'walk', min: 4, label: '步行到民生社區站牌', detail: '約 300 公尺' },
    { kind: 'wait', min: 6, label: '等公車', detail: '尖峰班距約 8 至 12 分' },
    { kind: 'bus', min: 24, label: '內科通勤公車', detail: '民生社區 → 瑞光路 · 9 站' },
    { kind: 'walk', min: 3, label: `步行到${DEST}`, detail: '約 200 公尺' },
  ],
}

function addMin(hhmm, min) {
  const [h, m] = hhmm.split(':').map(Number)
  const t = h * 60 + m + min
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const shuttleFare = (car) => Math.round((SHUTTLE_FARE * car.mult) / 5) * 5
// 接駁車的上車時間 = 出發時間 + 走到站 + 捷運
const shuttleAt = addMin(DEPART, transitSteps.mrt_pool.slice(0, 2).reduce((s, l) => s + l.min, 0))

// 大眾運輸路線推薦：每段附上開始時間，畫面直接排成時間軸
export function transitRoutesFor(car) {
  return [
    { k: 'mrt', title: '捷運 + 步行', tag: '推薦', why: '時間最穩、票價最低', fare: MRT_FARE },
    {
      k: 'mrt_pool', title: '捷運 + 接駁', tag: '最快', why: '出站不用走，共乘車接最後一哩',
      fare: MRT_FARE + shuttleFare(car),
      action: { text: '預約接駁', toast: `已預約 ${shuttleAt} 港墘站接駁` },
    },
    { k: 'bus', title: '公車直達', tag: '少走路', why: '不用轉乘，但尖峰車程較不穩', fare: BUS_FARE },
  ].map((r) => {
    let t = 0
    const steps = transitSteps[r.k].map((s) => {
      const at = addMin(DEPART, t)
      t += s.min
      return { ...s, at }
    })
    const walk = steps.filter((s) => s.kind === 'walk').reduce((s, l) => s + l.min, 0)
    return { ...r, steps, total: t, walk, arrive: addMin(DEPART, t), dest: DEST }
  })
}

// leg.kind 對應顏色：walk 步行、wait 等車、ride 車程、mrt 捷運
export function optionsFor(car) {
  const m = car.mult
  const poolSeats = car.seats === 6 ? 5 : 3
  return [
    {
      k: 'pool', title: '順路共乘', badge: 'yoxi',
      legs: [
        { kind: 'walk', min: me.walk.minutes, label: '走到集合點' },
        { kind: 'ride', min: POOL_RIDE, label: `與 ${poolSeats - 1} 人共乘` },
      ],
      // 六人座車資較高，但同一趟可分攤的人數也較多，每人反而更省
      fare: Math.round((me.pay * m * (3 / poolSeats)) / 5) * 5,
      note: poolSeats > 3 ? `${poolSeats} 人分攤，每人更省` : '集合點上車，3 人共乘',
      action: { text: '查看媒合', to: 'm-pool' },
      highlight: true,
    },
    {
      k: 'solo', title: '自己叫車', badge: 'yoxi',
      legs: [
        { kind: 'wait', min: SOLO_WAIT, label: '等車' },
        { kind: 'ride', min: SOLO_RIDE, label: '車程' },
      ],
      fare: Math.round((me.solo * m) / 5) * 5,
      note: '門口上車，不必步行',
    },
    {
      k: 'mrt_pool', title: '捷運 + 共乘接駁', badge: 'yoxi',
      legs: transitSteps.mrt_pool,
      fare: MRT_FARE + shuttleFare(car),
      note: '捷運到站後，共乘車接最後一哩',
      action: { text: '看路線', route: 'mrt_pool' },
    },
    {
      k: 'mrt', title: '捷運 + 步行',
      legs: transitSteps.mrt,
      fare: MRT_FARE,
      note: '最便宜，但要走 20 分鐘',
      action: { text: '看路線', route: 'mrt' },
    },
  ].map((o) => ({ ...o, total: o.legs.reduce((s, l) => s + l.min, 0) }))
}

export const legStyles = {
  walk: { color: '#B8C8DC', label: '步行' },
  wait: { color: '#778AA4', label: '等車' },
  ride: { color: '#F14A42', label: '乘車' },
  mrt: { color: '#0C4C80', label: '捷運' },
}
// 路線推薦多一種公車，不放進 legStyles 是因為「怎麼去」的圖例會整份列出來
export const stepStyles = {
  walk: { ...legStyles.walk, icon: 'walk' },
  wait: { ...legStyles.wait, icon: 'clock' },
  ride: { ...legStyles.ride, icon: 'car' },
  mrt: { ...legStyles.mrt, icon: 'train' },
  bus: { color: '#2E8B7A', label: '公車', icon: 'bus' },
}

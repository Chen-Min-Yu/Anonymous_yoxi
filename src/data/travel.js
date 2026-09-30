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
      legs: [
        { kind: 'walk', min: 10, label: '走到中山國中站' },
        { kind: 'mrt', min: 11, label: '文湖線到港墘站' },
        { kind: 'ride', min: 5, label: '接駁進園區' },
      ],
      fare: MRT_FARE + Math.round((SHUTTLE_FARE * m) / 5) * 5,
      note: '捷運到站後，共乘車接最後一哩',
      action: { text: '預約接駁', toast: '已預約 08:05 港墘站接駁' },
    },
    {
      k: 'mrt', title: '捷運 + 步行',
      legs: [
        { kind: 'walk', min: 12, label: '走到中山國中站' },
        { kind: 'mrt', min: 11, label: '文湖線到港墘站' },
        { kind: 'walk', min: 8, label: '走到公司' },
      ],
      fare: MRT_FARE,
      note: '最便宜，但要走 20 分鐘',
    },
  ].map((o) => ({ ...o, total: o.legs.reduce((s, l) => s + l.min, 0) }))
}

export const legStyles = {
  walk: { color: '#B8C8DC', label: '步行' },
  wait: { color: '#778AA4', label: '等車' },
  ride: { color: '#F14A42', label: '乘車' },
  mrt: { color: '#0C4C80', label: '捷運' },
}

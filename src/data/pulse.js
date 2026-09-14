// 城市脈動：以 yoxi 真實行程資料（2026/02/01–04/30，96.5 萬筆）計算的等車時間
// 等車時間 = 行程開始時間 OrderStartDateTime − 叫車時間 OrderFormCreatedTime；只取 30 分鐘內的即時叫車（占 98.6%）
// 產生方式：analysis/analyze.py → src/data/real.json
import real from './real.json'

export { real }

export const places = {
  arena: { name: '台北小巨蛋', ll: [25.0513, 121.5497] },
  airport: { name: '松山機場', ll: [25.0632, 121.552] },
  neihu: { name: '內湖科學園區', ll: [25.079, 121.575] },
  nanjing: { name: '南京復興', ll: [25.052, 121.544] },
  minsheng: { name: '民生社區', ll: [25.0598, 121.5575] },
  dazhi: { name: '大直', ll: [25.0805, 121.5455] },
}

// 各格等車中位數的分級（循序色階：單一紅色系，淺到深）
export const bins = [
  { max: 5, color: '#FDECEB', label: '5 分內' },
  { max: 6, color: '#F9C4C0', label: '5–6 分' },
  { max: 7, color: '#F48C85', label: '6–7 分' },
  { max: 8, color: '#F14A42', label: '7–8 分' },
  { max: Infinity, color: '#B8261F', label: '8 分以上' },
]
export const binOf = (w) => bins.find((b) => w < b.max)

const fmt = (n) => n.toLocaleString('en-US')
const g = real.pulse_grid
const a = real.areas
const band = (mid) => (mid ? `$${mid - 50}–${mid + 50}` : '—')

export const slots = [
  {
    id: 'now', label: '07:30', sub: '平日早高峰', time: '平日 07:30–08:30',
    summary: `平日早高峰全區等車中位數 ${g.now.wait_median.toFixed(1)} 分鐘（近 90 天 ${fmt(g.now.trips)} 筆）。內湖科學園區最久，中位 ${a.neihu.slots.now.wait} 分，且有 10% 的叫車超過 ${a.neihu.slots.now.p90} 分；民生社區相對好叫，中位 ${a.minsheng.slots.now.wait} 分。`,
    tip: { text: '民生社區往內湖：加入 08:15 順路車，車資省一半', to: 'match' },
  },
  {
    id: 'h9', label: '09:00', sub: '通勤潮後', time: '平日 09:00–10:00',
    summary: `09 點通勤潮過後，全區中位數降到 ${g.h9.wait_median.toFixed(1)} 分。內湖科學園區中位 ${a.neihu.slots.h9.wait} 分，是這區一天中最好叫車的時段之一。`,
    tip: { text: '時間彈性？這個時段叫車等候最短', to: null },
  },
  {
    id: 'h18', label: '18:00', sub: '平日下班', time: '平日 18:00–19:00',
    summary: `平日 18 點是全天最難叫車的時段。內湖科學園區中位 ${a.neihu.slots.h18.wait} 分，10% 的叫車超過 ${a.neihu.slots.h18.p90} 分，車資多落在 ${band(a.neihu.slots.h18.pay_mid)}。預約回程順路車可以避開這段不確定。`,
    tip: { text: '預約 18:20 回程順路車，不用在路邊等', to: 'forecast' },
  },
  {
    id: 'h2130', label: '21:00', sub: '夜間', time: '每日 21:00–22:00',
    event: `小巨蛋活動夜叫車量約平日 ${Math.round(real.arena_events.top_days[0].trips / real.arena_events.normal_day_trips)} 倍`,
    summary: `21 點南京復興周邊近 90 天有 ${fmt(a.nanjing.slots.h2130.n)} 筆上車，是東區夜間最熱的上車點，中位等車 ${a.nanjing.slots.h2130.wait} 分。小巨蛋有活動的晚上，周邊 21–23 點叫車量約 ${real.arena_events.top_days[0].trips} 筆，一般晚上約 ${real.arena_events.normal_day_trips} 筆。`,
    tip: { text: '活動散場前 30 分鐘提醒我叫車', to: null },
  },
]

// 六角格邊長約 450 m（與 analysis/analyze.py 相同參數）
const R_LAT = 0.0036
const R_LNG = R_LAT / Math.cos((25.065 * Math.PI) / 180)
export function hexPolygon(lat, lng) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i + Math.PI / 6
    pts.push([lat + R_LAT * Math.sin(ang) * 0.98, lng + R_LNG * Math.cos(ang) * 0.98])
  }
  return pts
}

export function cellsFor(slot) {
  return g[slot.id].cells.map((c) => ({ ...c, id: `${c.lat},${c.lng}`, ll: [c.lat, c.lng], poly: hexPolygon(c.lat, c.lng) }))
}

export function areaStats(slotId) {
  return Object.entries(places).map(([k, p]) => {
    const s = a[k].slots[slotId]
    return { k, name: p.name, wait: s.wait, p90: s.p90, n: s.n, price: band(s.pay_mid) }
  })
}

export const areaList = Object.keys(places)

// 個人移動預報：民生社區 → 內湖科學園區走廊，平日各 15 分鐘出發的等車與車程中位數
export const corridor = real.demo_corridor
export const commuteCurve = corridor.curve.filter((d) => d.t >= '07:30' && d.t <= '09:00')

// 城市版圖：個人去過的格子（示意使用者）
export const cells = (() => {
  const S = 25.036, N = 25.094, W = 121.525, E = 121.598
  const dy = R_LAT * 1.5, dx = R_LNG * Math.sqrt(3)
  const out = []
  let row = 0
  for (let lat = S; lat <= N + 1e-9; lat += dy, row++) {
    for (let lng = W + (row % 2 ? dx / 2 : 0); lng <= E + 1e-9; lng += dx) {
      out.push({ id: `${row}-${out.length}`, ll: [lat, lng], poly: hexPolygon(lat, lng) })
    }
  }
  return out
})()

export const visited = {
  home: [25.0598, 121.5528], work: [25.0795, 121.576],
  extra: [
    [25.0513, 121.5497], [25.052, 121.544], [25.0697, 121.552], [25.0805, 121.5455],
    [25.0493, 121.578], [25.0578, 121.55], [25.0788, 121.5705], [25.064, 121.5655],
  ],
}

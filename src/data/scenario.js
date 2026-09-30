import routes from './routes.json'

// 台北計程車跳表：起跳 1.25 km $85，之後每 200 m $5
export function meterFare(meters) {
  if (meters <= 1250) return 85
  return 85 + Math.ceil((meters - 1250) / 200) * 5
}

// 依 yoxi 行程資料校準：5–6.5 km 行程 89% 落在 $200–300 區間（中位 $250），約為跳表的 1.25 倍
const FARE_FACTOR = 1.25
export const yoxiFare = (meters) => Math.round((meterFare(meters) * FARE_FACTOR) / 5) * 5

const EMISSION_KG_PER_KM = 0.173 // 油電計程車每人公里排放估算值（示意）
const SERVICE_FEE = 10 // 每位乘客共乘媒合服務費

export const places = {
  meetup: { name: '民生東路四段 集合點', sub: '民生敦化路口 7-ELEVEN 前', latlng: [25.0578, 121.55] },
  driverStart: { latlng: [25.053, 121.5445] },
}

// 三段路線：大家都會經過的共同路段，以及只為個別乘客行駛的專屬路段
export const segments = [
  { key: 'shared3', label: '共同路段', from: '集合點', to: '洲子街', meters: 5788, seconds: 568, riders: ['A', 'B', 'C'] },
  { key: 'shared2', label: '共同路段', from: '洲子街', to: '瑞光路', meters: 937, seconds: 167, riders: ['A', 'C'] },
  { key: 'soloC', label: '專屬路段', from: '瑞光路', to: '港墘路', meters: 543, seconds: 89, riders: ['C'] },
]

export const riders = [
  {
    id: 'A', name: '你', initial: '你', company: '瑞光科技', home: '富錦街', dest: '瑞光路 399 號',
    walk: { key: 'walkA', meters: 489, minutes: 6 }, soloMeters: 5745, soloRoute: 'soloA', me: true,
    latlng: [25.0598, 121.5528], dropLatlng: [25.0795, 121.576],
  },
  {
    id: 'B', name: '陳小姐', initial: '陳', company: '瑞光科技', home: '民權東路三段', dest: '洲子街 88 號',
    walk: { key: 'walkB', meters: 404, minutes: 5 }, soloMeters: 5734, soloRoute: 'soloB',
    latlng: [25.0598, 121.5482], dropLatlng: [25.0788, 121.5705],
  },
  {
    id: 'C', name: '林先生', initial: '林', company: '內湖科學園區', home: '南京東路四段', dest: '港墘路 221 號',
    walk: { key: 'walkC', meters: 630, minutes: 8 }, soloMeters: 6203, soloRoute: 'soloC_full',
    latlng: [25.0552, 121.5515], dropLatlng: [25.081, 121.579],
  },
]

// 透明化分攤：每段車資依里程計算，只由經過該段的乘客平均分攤
export function computeSplit() {
  const totalMeters = segments.reduce((s, seg) => s + seg.meters, 0)
  const totalFare = yoxiFare(totalMeters)
  const perMeter = totalFare / totalMeters

  const result = riders.map((r) => {
    const parts = segments
      .filter((seg) => seg.riders.includes(r.id))
      .map((seg) => ({
        ...seg,
        segFare: seg.meters * perMeter,
        share: (seg.meters * perMeter) / seg.riders.length,
      }))
    const rideShare = parts.reduce((s, p) => s + p.share, 0)
    const pay = Math.round(rideShare) + SERVICE_FEE
    const solo = yoxiFare(r.soloMeters)
    const attributedKm = parts.reduce((s, p) => s + p.meters / p.riders.length, 0) / 1000
    const savedKm = r.soloMeters / 1000 - attributedKm
    return {
      ...r,
      parts,
      rideShare: Math.round(rideShare),
      serviceFee: SERVICE_FEE,
      pay,
      solo,
      saved: solo - pay,
      savedPct: Math.round(((solo - pay) / solo) * 100),
      co2: +(savedKm * EMISSION_KG_PER_KM).toFixed(2),
      subsidy: Math.round(pay * 0.5),
    }
  })

  return { totalMeters, totalFare, perMeter, riders: result }
}

export const split = computeSplit()

// 里程占比分攤（Llona 分支採用）：每人依自己實際共乘的里程占總里程的比例分攤。
// 目前畫面統一用這一套，逐段分攤的 computeSplit() 保留在上面，要換規則改這裡即可。
export function computePctSplit() {
  const own = riders.map((r) => ({
    ...r,
    ownMeters: segments.filter((s) => s.riders.includes(r.id)).reduce((sum, s) => sum + s.meters, 0),
  }))
  const totalOwn = own.reduce((sum, x) => sum + x.ownMeters, 0)
  return own.map((r) => {
    const base = split.riders.find((x) => x.id === r.id)
    const rideShare = Math.round((r.ownMeters / totalOwn) * split.totalFare)
    const pay = rideShare + SERVICE_FEE
    const attributedKm = r.ownMeters / 1000
    const savedKm = r.soloMeters / 1000 - attributedKm
    return {
      ...base,
      ownMeters: r.ownMeters,
      pct: Math.round((r.ownMeters / totalOwn) * 100),
      rideShare,
      pay,
      saved: base.solo - pay,
      savedPct: Math.round(((base.solo - pay) / base.solo) * 100),
      co2: +(savedKm * EMISSION_KG_PER_KM).toFixed(2),
      subsidy: Math.round(pay * 0.5),
    }
  })
}

export const pctSplit = computePctSplit()
export const me = pctSplit.find((r) => r.me)

export const driver = {
  name: '王大哥', car: 'Toyota Prius', plate: 'TDA-6608', rating: 4.96,
  approachMeters: 1326, approachSeconds: 164,
  poolFare: split.totalFare, poolBonus: 30,
  soloEquivalent: 250,
}

export { routes }

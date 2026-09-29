// 整合版：沿用 yoxi 實機介面的版面與元件，情境改成我們分析過的民生社區 → 內湖科學園區走廊
import { me, riders, routes, places, split, segments } from './scenario'

export const trip = {
  pickup: '松山區富錦街 172 巷',
  dropoff: '內湖區瑞光路 399 號',
  pickupLL: riders[0].latlng,
  dropoffLL: riders[0].dropLatlng,
  etaMin: 3,
  route: routes.soloA,
  soloFare: me.solo,
}

export { me, riders, routes, places, split, segments }

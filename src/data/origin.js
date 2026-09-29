// yoxi 原版叫車介面的還原（依 2026/09/29 App 實機錄影逐格比對）
// 文案、車種、價格、流程順序與錯誤訊息皆取自錄影畫面，未自行改寫

export const user = { name: '陳旻妤', greeting: '晚安' }

export const trip = {
  pickup: '大安區信義路三段157巷9號',
  dropoff: '大安區復興南路二段6號',
  pickupLL: [25.0333, 121.54049],
  dropoffLL: [25.03274, 121.54345],
  etaMin: 3, // 司機抵達上車點的分鐘數
  // OSRM 依實際道路計算
  route: [
    [25.03336, 121.54049], [25.03336, 121.54078], [25.03333, 121.54177], [25.03333, 121.5419],
    [25.03333, 121.54202], [25.0333, 121.54336], [25.0333, 121.54339], [25.0333, 121.54354],
    [25.03315, 121.54353], [25.03274, 121.54353], [25.03274, 121.54345],
  ],
}

// art 對應 CarArt.vue 的車型；badge 為車種圖示左上角的小標
export const cars = [
  {
    id: 'any', name: '不限車種', price: '$ 85 - $ 110', eta: 3, art: 'suv', badge: 'bolt',
    desc: '車資：多元 $110、小黃 $85-$100。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: false,
  },
  {
    id: 'taxi', name: '小黃/跳表多元', price: '$ 85 - $ 100', eta: 3, art: 'taxi',
    desc: '依跳表收費，預估車資僅供參考。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: true,
  },
  {
    id: 'multi', name: '多元計程車', price: '$ 110', eta: 3, art: 'sedan',
    desc: '安排舒適多元車款，依顯示固定車資付款。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: true,
  },
  {
    id: 'premium', name: '尊榮多元', price: '$ 142', eta: 4, art: 'black',
    desc: '安排高階車款，依顯示固定車資付款。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: true,
  },
  {
    // 錄影中預約模式的清單被面板裁切，樂聚多元是否可預約未親眼確認，此處先假設可以
    id: 'van', name: '樂聚多元', price: '$ 142', eta: 3, art: 'van',
    desc: '安排樂聚多元 6 人座，依顯示固定車資付款。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: true,
  },
  {
    id: 'eco_multi', name: '減碳多元', price: '$ 110', eta: 3, art: 'suv', badge: 'leaf',
    desc: '隨機安排電車或油電車，依顯示固定車資付款。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: false,
  },
  {
    id: 'eco_taxi', name: '減碳小黃', price: '$ 85 - $ 100', eta: 4, art: 'taxi', badge: 'leaf',
    desc: '隨機安排電車或油電車，依跳表收費，預估車資僅供參考。若司機已抵達上車點後等待超過 5 分鐘，將酌收等候費。',
    instant: true, scheduled: false,
  },
]

// 付款方式（錄影中「請選擇付款方式」的完整清單）
// 錄影帳號未綁卡，因此清單中沒有可預約的付款方式；原型的「新增付款方式」會補一張信用卡，
// 讓預約流程走得完（見 OriginBook.vue 的 addCard）
export const payments = [
  { id: 'cash', name: '現金付款', scheduled: false },
  { id: 'easycard', name: '實體悠遊卡/一卡通', scheduled: false },
  { id: 'credit', name: '實體信用卡', scheduled: false },
  { id: 'tpe_senior', name: '臺北市敬老愛心卡', scheduled: false },
  { id: 'tyn_senior', name: '桃園市敬老愛心卡', scheduled: false },
  { id: 'ntpc_senior', name: '新北市敬老愛心卡', scheduled: false },
  { id: 'tpe_baby', name: '臺北市好孕乘車金', scheduled: false },
  { id: 'tyn_life', name: '桃園市一生好運卡', scheduled: false },
]

export const SCHEDULE_BLOCKED =
  '很抱歉！預約叫車只能以信用卡、電子支付或企業簽單支付車資，請變更付款方式。'

export const menuItems = [
  '行程紀錄', '行程匯出', '付款設定', '乘車設定', '優惠券', '好康任務', '客服中心', '點歡商城', '和泰 Points',
]

export const tripTabs = ['個人行程', '企業簽單', '預約叫車(0)', '海外叫車']

export const banners = [
  { id: 'coupon', text: '優惠天天領', sub: '最高單趟折 $50', tone: 'cream' },
  { id: 'task', text: 'yoxi 好康任務', sub: '多種好禮 等你來領！', tone: 'red' },
  { id: 'card', text: '和泰聯名卡', sub: '趟趟搭乘最高 10% 回饋', tone: 'dark' },
]

export const defaultSchedule = { date: '2026/09/29', time: '19:05' }

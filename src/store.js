import { reactive } from 'vue'

export const flows = {
  passenger: [
    { id: 'lock', title: '通勤推播', desc: 'AI 偵測通勤模式，主動推播共乘邀請' },
    { id: 'home', title: '首頁', desc: '每日通勤預報、城市脈動、順路圈狀態' },
    { id: 'pulse', title: '城市脈動', desc: '叫車熱點地圖，可切換需求熱度與等車時間' },
    { id: 'forecast', title: '我的移動預報', desc: '出發時間、車型與大眾運輸方案比較' },
    { id: 'match', title: '媒合詳情', desc: '智慧集合點與共同／專屬路段' },
    { id: 'fare', title: '分攤試算', desc: '透明化逐段分攤與企業補助' },
    { id: 'meetup', title: '前往集合點', desc: '步行導航與司機到點倒數' },
    { id: 'ride', title: '行程中', desc: '依序下車，即時顯示路段' },
    { id: 'done', title: '行程完成', desc: '省錢、減碳、點數累積' },
    { id: 'circle', title: '我的順路圈', desc: '通勤走廊、常用集合點、長期回饋' },
    { id: 'atlas', title: '城市版圖', desc: '街區探索與每月移動人格' },
    { id: 'enterprise', title: '企業方案', desc: '員工加入、月結、ESG 報告' },
  ],
  driver: [
    { id: 'd-home', title: '司機首頁', desc: '熱門共乘走廊與效率獎金' },
    { id: 'd-offer', title: '共乘派單', desc: '比照單人叫車，接單前只看集合點與預估時間' },
    { id: 'd-trip', title: '共乘行程', desc: '集合點接人、依序送達' },
    { id: 'd-earn', title: '收入分析', desc: '共乘單與一般單時薪比較' },
  ],
  merged: [
    { id: 'm-home', title: '首頁', desc: 'yoxi 原版面板 + 城市脈動列 + 順路圈邀請' },
    { id: 'm-book', title: '叫車', desc: '原本兩個分頁旁新增「順路共乘」' },
    { id: 'm-pool', title: '順路共乘詳情', desc: '集合點理由與逐段分攤' },
  ],
  origin: [
    { id: 'o-home', title: '首頁', desc: '地圖、上下車點輸入、活動橫幅、側選單' },
    { id: 'o-dest', title: '設定下車地點', desc: '搜尋或在地圖上選點' },
    { id: 'o-book', title: '叫車', desc: '立即叫車／預約切換、車種、付款、點數' },
    { id: 'o-trips', title: '行程紀錄', desc: '預約叫車分頁與空狀態' },
  ],
}

export const store = reactive({
  role: 'passenger',
  screen: 'lock',
  direction: 'forward',
  history: [],
  toast: '',
})

export function go(id, opts = {}) {
  if (id === store.screen) return
  store.direction = opts.back ? 'back' : 'forward'
  if (!opts.back && !opts.replace) store.history.push(store.screen)
  store.screen = id
  const role = id.startsWith('d-') ? 'driver' : id.startsWith('o-') ? 'origin' : id.startsWith('m-') ? 'merged' : 'passenger'
  store.role = role
}

export function back() {
  const prev = store.history.pop()
  if (prev) go(prev, { back: true })
}

export function switchRole(role) {
  store.history = []
  store.direction = 'forward'
  store.role = role
  store.screen = flows[role][0].id
}

export function step(delta) {
  const list = flows[store.role]
  const i = list.findIndex((s) => s.id === store.screen)
  const next = list[Math.min(list.length - 1, Math.max(0, i + delta))]
  if (next.id === store.screen) return
  if (delta < 0) {
    store.history.pop()
    go(next.id, { back: true })
  } else {
    go(next.id)
  }
}

let toastTimer
export function toast(msg) {
  store.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (store.toast = ''), 2200)
}

<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { slots, cellsFor, places, areaList, areaStats, real, mapModes, dotRadius, HOTSPOT_MIN, GREY } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const slotId = ref('now')
const slot = computed(() => slots.find((s) => s.id === slotId.value))
const picked = ref(null)
const modeId = ref('demand')
const mode = computed(() => mapModes.find((m) => m.id === modeId.value))

function pickSlot(id) {
  slotId.value = id
  picked.value = null
}

const cells = computed(() => cellsFor(slot.value))
const hotCount = computed(() => cells.value.filter((c) => c.per_day >= HOTSPOT_MIN).length)

// 需求熱點不再用整格色塊表示（色弱不易辨識、格線也太搶眼），
// 改為灰階底格 + 點的大小／深淺雙重編碼：點越大越深＝等車越久
const layers = computed(() => {
  // 熱點以彩色圓點呈現（點越大＝叫車越多），非熱點格子一律灰色小點
  const dots = cells.value
    .slice()
    .sort((a, b) => b.per_day - a.per_day)
    .map((c) => {
      const hot = c.per_day >= HOTSPOT_MIN
      const on = picked.value?.id === c.id
      return {
        type: 'dot', latlng: c.ll, radius: hot ? dotRadius(c.per_day) : 4,
        fill: hot ? mode.value.colorOf(c) : GREY,
        fillOpacity: hot ? 0.9 : 0.5,
        stroke: on ? '#051122' : '#fff', weight: on ? 3 : hot ? 1.5 : 1,
        onClick: () => (picked.value = c),
      }
    })
  // 幾乎透明的六角格，只是為了讓小點也有夠大的點擊範圍（取自 Llona 分支）
  const hexes = cells.value.map((c) => ({
    type: 'poly', coords: c.poly, fill: '#0C4C80',
    fillOpacity: picked.value?.id === c.id ? 0.1 : 0.025,
    stroke: picked.value?.id === c.id ? '#051122' : '#fff',
    weight: picked.value?.id === c.id ? 2 : 1,
    onClick: () => (picked.value = c),
  }))
  const labels = areaList.map((k) => ({
    type: 'marker', latlng: [places[k].ll[0] + (labelShift[k]?.[0] || 0), places[k].ll[1] + (labelShift[k]?.[1] || 0)], size: [0, 0], z: 300,
    html: `<span class="pulse-lab">${places[k].name}</span>`,
  }))
  return [...hexes, ...dots, ...labels]
})
function legendDot(b) {
  const d = dotStyle(b.mid, 6, 15)
  return { width: d.size + 'px', height: d.size + 'px', background: d.color }
}
const fit = [[25.048, 121.541], [25.083, 121.581]]
const labelShift = { arena: [0.0015, 0.0048], nanjing: [0.0028, -0.0018] }

const areas = computed(() => areaStats(slotId.value).filter((x) => x.wait).sort((x, y) => y.wait - x.wait))
const maxWait = 10
const ov = real.overview

function followTip() {
  if (slot.value.tip.to) go(slot.value.tip.to)
  else toast('已開啟提醒，出發前 30 分鐘通知你')
}
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <button class="scr-back" @click="back"><Icon name="back" :size="20" /></button>
      <header class="head pad">
        <div>
          <div class="eyebrow"><span class="live"></span> 城市脈動 · 台北東區</div>
          <div class="h1">現在叫車，要等多久？</div>
        </div>
      </header>

      <div class="pad">
        <div class="slots" role="tablist">
          <button v-for="s in slots" :key="s.id" :class="{ on: s.id === slotId }" @click="pickSlot(s.id)">
            <b class="num">{{ s.label }}</b>
            <small>{{ s.sub }}</small>
          </button>
        </div>
      </div>

      <div class="pad modes">
        <div class="seg">
          <button v-for="m in mapModes" :key="m.id" :class="{ on: m.id === modeId }" @click="modeId = m.id">{{ m.label }}</button>
        </div>
        <span class="hot-n">熱點 {{ hotCount }} 處</span>
      </div>

      <div class="map-card">
        <RouteMap :layers="layers" :fit="fit" :show-labels="false" :padding-top="16" :padding-bottom="62" :padding="[4, 4]" />

        <Transition name="pop">
          <div v-if="picked" class="tip">
            <div>
              <span class="tip-k">{{ slot.time }} · 近 90 天 {{ picked.n }} 筆</span>
              <b class="num">每天 {{ picked.per_day }} 筆 · 等車 {{ picked.wait }} 分</b>
              <span class="tip-d">{{ picked.per_day >= HOTSPOT_MIN ? '叫車熱點' : '需求稀疏，共乘不易成團' }}</span>
            </div>
            <button class="icon-btn" @click="picked = null"><Icon name="close" :size="18" /></button>
          </div>
        </Transition>

        <div class="legend">
          <span class="lg-t">{{ mode.unit }}</span>
          <span v-for="b in mode.bins" :key="b.label" class="lg-i"><i :style="{ background: b.color }"></i>{{ b.label }}</span>
          <span class="lg-i"><i :style="{ background: GREY }"></i>非熱點</span>
        </div>
      </div>

      <div class="pad">
        <section class="ai card">
          <div class="ai-h">
            <span><Icon name="sparkle" :size="15" /> AI 城市摘要 · {{ slot.time }}</span>
            <span class="muted small">依近 90 天資料</span>
          </div>
          <p>{{ slot.summary }}</p>
          <button class="tip-btn" @click="followTip">
            <span>{{ slot.tip.text }}</span>
            <Icon name="arrow" :size="16" />
          </button>
        </section>

        <section class="block">
          <div class="block-h">
            <span class="h2">各區等車時間</span>
            <span class="muted small">中位數 · 10% 最久</span>
          </div>
          <div class="areas card">
            <div v-for="a in areas" :key="a.k" class="area" :title="`${a.name}：中位 ${a.wait} 分，10% 超過 ${a.p90} 分，${a.n} 筆，車資多在 ${a.price}`">
              <span class="an">{{ a.name }}</span>
              <span class="ab"><i :style="{ width: (a.wait / maxWait) * 100 + '%' }"></i></span>
              <b class="num">{{ a.wait }} 分</b>
              <span class="ap num">{{ a.p90 }} 分</span>
            </div>
          </div>
        </section>

        <div class="source">
          <Icon name="info" :size="14" />
          <span>等車時間 = yoxi 行程資料「叫車時間」到「行程開始時間」的差。資料：{{ ov.date_from }} 至 {{ ov.date_to }}，共 {{ ov.trips.toLocaleString('en-US') }} 筆行程，只計 30 分鐘內的即時叫車；每格至少 15 筆才顯示。上線後可再加入天氣與場館活動做即時預測。</span>
        </div>
        <div style="height: 20px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head { padding-top: 96px; padding-bottom: 12px; }
.live { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--red); margin-right: 4px; vertical-align: 1px; animation: blinkLive 1.4s infinite; }
@keyframes blinkLive { 50% { opacity: .3; } }
.small { font-size: 12px; }

.slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.slots button { background: #fff; border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; border: 1.5px solid var(--line); transition: all .2s; }
.slots b { font-size: 14px; font-weight: 800; }
.slots small { font-size: 10px; color: var(--ink-3); white-space: nowrap; }
.slots button.on { background: var(--navy); border-color: var(--navy); color: #fff; }
.slots button.on small { color: rgba(255,255,255,.7); }

.modes { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.seg { flex: 1; display: grid; grid-template-columns: 1fr 1fr; background: var(--mist); border-radius: 11px; padding: 3px; }
.seg button { height: 32px; border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--ink-2); }
.seg button.on { background: #fff; color: var(--navy); box-shadow: var(--shadow-card); }
.hot-n { font-size: 12px; font-weight: 700; color: var(--ink-3); white-space: nowrap; }

.map-card { position: relative; height: 340px; margin: 10px 18px 0; border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-card); }
.tip { position: absolute; left: 10px; right: 10px; top: 10px; z-index: 650; background: #fff; border-radius: 14px; padding: 10px 8px 10px 14px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: var(--shadow-float); }
.tip-k { font-size: 11px; color: var(--ink-3); display: block; }
.tip b { font-size: 16px; font-weight: 800; display: block; line-height: 1.2; }
.tip-d { font-size: 11px; color: var(--ink-2); }
.pop-enter-active, .pop-leave-active { transition: all .2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }

.legend { position: absolute; left: 8px; right: 8px; bottom: 8px; z-index: 600; background: rgba(255,255,255,.94); border-radius: 10px; padding: 6px 9px; display: flex; flex-wrap: wrap; gap: 4px 9px; align-items: center; font-size: 10px; color: var(--ink-2); font-weight: 600; }
.lg-t { color: var(--navy); font-weight: 800; width: 100%; }
.lg-i { display: inline-flex; align-items: center; gap: 4px; }
.lg-i i { width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(5,17,34,.1); }

.ai { padding: 14px 16px; margin-top: 14px; }
.ai-h { display: flex; justify-content: space-between; align-items: center; }
.ai-h > span:first-child { font-size: 12px; font-weight: 700; color: var(--red-deep); display: flex; align-items: center; gap: 5px; }
.ai p { font-size: 14px; line-height: 1.75; color: var(--ink); margin: 8px 0 12px; }
.tip-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left; background: var(--red-soft); color: var(--red-deep); border-radius: 12px; padding: 10px 12px; font-size: 13px; font-weight: 700; }

.block { margin-top: 20px; }
.block-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.areas { padding: 6px 14px; }
.area { display: grid; grid-template-columns: 86px 1fr 50px 50px; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; }
.area + .area { border-top: 1px solid var(--line); }
.an { font-weight: 600; white-space: nowrap; }
.ab { height: 10px; border-radius: 0 4px 4px 0; background: var(--bg); overflow: hidden; }
.ab i { display: block; height: 100%; background: var(--red); border-radius: 0 4px 4px 0; transition: width .5s cubic-bezier(.3,.8,.3,1); }
.area b { font-size: 14px; font-weight: 800; text-align: right; }
.ap { font-size: 12px; color: var(--ink-3); text-align: right; }

.source { display: flex; gap: 8px; margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: var(--blue-soft); color: var(--blue); font-size: 11.5px; line-height: 1.6; }
.source svg { flex-shrink: 0; margin-top: 2px; }
</style>

<style>
.pulse-lab {
  position: absolute; transform: translate(-50%, -50%); white-space: nowrap; pointer-events: none;
  font-size: 11px; font-weight: 800; color: #051122; font-family: 'Noto Sans TC', sans-serif;
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff;
}
</style>

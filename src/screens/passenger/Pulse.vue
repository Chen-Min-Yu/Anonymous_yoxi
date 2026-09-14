<script setup>
import { computed, ref } from 'vue'
import { go, toast } from '../../store'
import { slots, cellsFor, bins, binOf, places, areaList, areaStats, real } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import TabBar from '../../components/TabBar.vue'

const slotId = ref('now')
const slot = computed(() => slots.find((s) => s.id === slotId.value))
const picked = ref(null)

function pickSlot(id) {
  slotId.value = id
  picked.value = null
}


const layers = computed(() => {
  const cs = cellsFor(slot.value)
  const hexes = cs.map((c) => ({
    type: 'poly', coords: c.poly, fill: binOf(c.wait).color,
    fillOpacity: picked.value?.id === c.id ? 0.95 : 0.72,
    stroke: picked.value?.id === c.id ? '#051122' : '#fff', weight: picked.value?.id === c.id ? 2.5 : 1.2,
    onClick: () => (picked.value = c),
  }))
  const labels = areaList.map((k) => ({
    type: 'marker', latlng: [places[k].ll[0] + (labelShift[k]?.[0] || 0), places[k].ll[1] + (labelShift[k]?.[1] || 0)], size: [0, 0], z: 300,
    html: `<span class="pulse-lab">${places[k].name}</span>`,
  }))
  return [...hexes, ...labels]
})
const fit = [[25.048, 121.541], [25.083, 121.581]]
const labelShift = { arena: [-0.0022, 0.002], nanjing: [0.0022, 0.0035] }

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

      <div class="map-card">
        <RouteMap :layers="layers" :fit="fit" :show-labels="false" :padding-top="30" :padding-bottom="34" :padding="[4, 4]" />
        <div v-if="slot.event" class="event chip chip-navy"><Icon name="calendar" :size="13" /> {{ slot.event }}</div>

        <Transition name="pop">
          <div v-if="picked" class="tip">
            <div>
              <span class="tip-k">這一格等車中位數 · {{ slot.time }}</span>
              <b class="num">{{ picked.wait }} 分鐘</b>
              <span class="tip-d">近 90 天 {{ picked.n }} 筆，平均每天 {{ picked.per_day }} 筆</span>
            </div>
            <button class="icon-btn" @click="picked = null"><Icon name="close" :size="18" /></button>
          </div>
        </Transition>

        <div class="legend">
          <span class="lg-t">等車中位數</span>
          <span v-for="b in bins" :key="b.label" class="lg-i"><i :style="{ background: b.color }"></i>{{ b.label }}</span>
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
    <TabBar active="pulse" />
  </div>
</template>

<style scoped>
.head { padding-top: 62px; padding-bottom: 12px; }
.live { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--red); margin-right: 4px; vertical-align: 1px; animation: blinkLive 1.4s infinite; }
@keyframes blinkLive { 50% { opacity: .3; } }
.small { font-size: 12px; }

.slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.slots button { background: #fff; border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; border: 1.5px solid var(--line); transition: all .2s; }
.slots b { font-size: 14px; font-weight: 800; }
.slots small { font-size: 10px; color: var(--ink-3); white-space: nowrap; }
.slots button.on { background: var(--navy); border-color: var(--navy); color: #fff; }
.slots button.on small { color: rgba(255,255,255,.7); }

.map-card { position: relative; height: 360px; margin: 12px 18px 0; border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-card); }
.event { position: absolute; top: 10px; left: 10px; z-index: 600; }
.tip { position: absolute; left: 10px; right: 10px; top: 44px; z-index: 650; background: #fff; border-radius: 14px; padding: 10px 8px 10px 14px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: var(--shadow-float); }
.tip-k { font-size: 11px; color: var(--ink-3); display: block; }
.tip b { font-size: 20px; font-weight: 800; display: block; line-height: 1.2; }
.tip-d { font-size: 11px; color: var(--ink-2); }
.pop-enter-active, .pop-leave-active { transition: all .2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }

.legend { position: absolute; left: 8px; right: 8px; bottom: 8px; z-index: 600; background: rgba(255,255,255,.94); border-radius: 10px; padding: 6px 8px; display: flex; flex-wrap: wrap; gap: 3px 8px; align-items: center; font-size: 10px; color: var(--ink-2); font-weight: 600; }
.lg-t { color: var(--navy); font-weight: 800; margin-right: 2px; }
.lg-i { display: inline-flex; align-items: center; gap: 3px; }
.lg-i i { width: 10px; height: 10px; border-radius: 3px; border: 1px solid rgba(5,17,34,.08); }

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

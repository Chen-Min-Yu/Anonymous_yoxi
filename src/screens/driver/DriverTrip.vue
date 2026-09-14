<script setup>
import { computed, ref, watch } from 'vue'
import { go, toast } from '../../store'
import { split, places } from '../../data/scenario'
import { meetPin, dropPin, carPin, riders, routes, riderColor } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const stage = ref(0)
const boarded = ref([])

const stages = [
  { title: '前往集合點', place: places.meetup.name, sub: '1.3 km · 約 3 分鐘', leg: 'approach', btn: '已抵達集合點', icon: 'nav' },
  { title: '集合點接乘客', place: '民生敦化路口 7-ELEVEN 前', sub: '乘客到齊後出發，最多等候 3 分鐘', leg: null, btn: '全員上車，出發', icon: 'users' },
  { title: '第 1 站 下車', place: '洲子街 88 號 · 陳小姐', sub: '5.8 km · 約 10 分鐘', leg: 'shared3', btn: '陳小姐已下車', icon: 'pin' },
  { title: '第 2 站 下車', place: '瑞光路 399 號 · 敏瑜', sub: '0.9 km · 約 3 分鐘', leg: 'shared2', btn: '敏瑜已下車', icon: 'pin' },
  { title: '第 3 站 下車', place: '港墘路 221 號 · 林先生', sub: '0.5 km · 約 2 分鐘', leg: 'soloC', btn: '完成共乘行程', icon: 'pin' },
]
const cur = computed(() => stages[stage.value])

const layers = computed(() => {
  const legs = ['approach', 'shared3', 'shared2', 'soloC']
  const activeLeg = cur.value.leg
  const doneIdx = stage.value <= 1 ? 0 : legs.indexOf(activeLeg)
  const out = legs.map((k, i) => {
    const active = k === activeLeg
    const done = (stage.value >= 1 && k === 'approach') || (i < doneIdx)
    return {
      type: 'line', coords: routes[k], weight: active ? 7 : 5, casing: active,
      color: active ? '#F14A42' : done ? '#B8C3D3' : '#0C4C80',
      opacity: active ? 1 : done ? 0.8 : 0.5,
      dash: k === 'approach' && !active ? '6 8' : undefined,
    }
  })
  const carAt = stage.value === 0 ? routes.approach[0] : stage.value === 1 ? places.meetup.latlng : routes[activeLeg][0]
  return [
    ...out, meetPin(),
    dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
    carPin(carAt),
  ]
})
const fit = computed(() => {
  if (stage.value === 0) return [...routes.approach, places.meetup.latlng]
  if (stage.value === 1) return [...routes.walkA, ...routes.walkB, ...routes.walkC, places.meetup.latlng]
  return [...routes[cur.value.leg], ...routes.shared2]
})

watch(stage, (s) => {
  if (s === 1) {
    boarded.value = []
    riders.forEach((r, i) => setTimeout(() => boarded.value.push(r.id), 700 + i * 700))
  }
})

const mapKey = computed(() => 'm' + stage.value)
const allIn = computed(() => boarded.value.length === 3)

function next() {
  if (stage.value === 1 && !allIn.value) return toast('等待乘客到齊')
  if (stage.value < stages.length - 1) stage.value++
  else go('d-earn')
}
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap :key="mapKey" :layers="layers" :fit="fit" :padding-top="180" :padding-bottom="10" />
      <div class="instr">
        <span class="i-ic"><Icon :name="cur.icon" :size="24" :stroke="2.3" /></span>
        <div class="i-t">
          <small>{{ cur.title }}</small>
          <b>{{ cur.place }}</b>
          <span>{{ cur.sub }}</span>
        </div>
      </div>
      <div class="progress">
        <span v-for="(s, i) in stages" :key="i" :class="{ done: i < stage, on: i === stage }"></span>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="inner">
        <div class="riders">
          <div v-for="r in split.riders" :key="r.id" class="rd"
            :class="{ in: boarded.includes(r.id) || stage > 1, off: (r.id === 'B' && stage > 2) || (r.id === 'A' && stage > 3) }">
            <div class="avatar" :style="{ background: riderColor[r.id] }">{{ r.initial }}</div>
            <b>{{ r.me ? '敏瑜' : r.name }}</b>
            <span v-if="(r.id === 'B' && stage > 2) || (r.id === 'A' && stage > 3)">已下車</span>
            <span v-else-if="boarded.includes(r.id) || stage > 1">已上車</span>
            <span v-else>{{ stage === 0 ? `步行中` : '等候中' }}</span>
          </div>
        </div>

        <div class="note">
          <Icon name="shield" :size="16" />
          <span v-if="stage <= 1">乘客已在 App 內確認分攤金額，你不需要向乘客收費或解釋。</span>
          <span v-else>車資由系統自動拆帳，行程結束後統一入帳。</span>
        </div>

        <button class="btn btn-red" :class="{ wait: stage === 1 && !allIn }" @click="next">
          {{ stage === 1 && !allIn ? `乘客上車中 ${boarded.length} / 3` : cur.btn }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-area { position: relative; flex: 1; }
.instr { position: absolute; top: 54px; left: 12px; right: 12px; z-index: 600; background: var(--navy); color: #fff; border-radius: 20px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: var(--shadow-float); }
.i-ic { width: 50px; height: 50px; border-radius: 15px; background: var(--red); display: grid; place-items: center; flex-shrink: 0; }
.i-t { display: flex; flex-direction: column; line-height: 1.35; }
.i-t small { font-size: 12px; opacity: .7; }
.i-t b { font-size: 18px; }
.i-t span { font-size: 12px; opacity: .8; }
.progress { position: absolute; top: 146px; left: 24px; right: 24px; z-index: 600; display: flex; gap: 5px; }
.progress span { flex: 1; height: 5px; border-radius: 3px; background: rgba(5,17,34,.18); }
.progress span.done { background: var(--navy); }
.progress span.on { background: var(--red); }

.sheet { margin-top: -24px; flex-shrink: 0; }
.inner { padding: 8px 18px 30px; }
.riders { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.rd { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 14px; border: 1.5px dashed var(--line); transition: all .3s; }
.rd .avatar { opacity: .45; transition: opacity .3s; }
.rd b { font-size: 13px; }
.rd span { font-size: 11px; color: var(--ink-3); font-weight: 600; }
.rd.in { border-style: solid; border-color: var(--blue); background: var(--blue-soft); }
.rd.in .avatar { opacity: 1; }
.rd.in span { color: var(--blue); }
.rd.off { border-color: var(--line); background: var(--bg); }
.rd.off .avatar { opacity: .35; }
.rd.off span { color: var(--ink-3); }

.note { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; line-height: 1.6; color: var(--ink-2); background: var(--bg); padding: 10px 12px; border-radius: 12px; margin: 12px 0; }
.note svg { color: var(--blue); flex-shrink: 0; margin-top: 2px; }
.btn.wait { background: var(--steel); box-shadow: none; }
</style>

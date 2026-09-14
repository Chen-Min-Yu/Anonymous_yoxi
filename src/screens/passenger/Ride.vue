<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { go, toast } from '../../store'
import { split, segments, me } from '../../data/scenario'
import { lines, meetPin, dropPin, carPin, riders, allRoute, sampleAlong, riderColor } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const DURATION = 12000
const myEnd = (segments[0].meters + segments[1].meters) / split.totalMeters
const t = ref(0) // 0..1，到你下車為止
const mapRef = ref(null)
let raf, start

const layers = [
  lines.shared3, lines.shared2, lines.soloC,
  meetPin(),
  dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
  carPin(allRoute[0]),
]

function tick(now) {
  if (!start) start = now
  t.value = Math.min(1, (now - start) / DURATION)
  mapRef.value && mapRef.value.moveMarker('car', sampleAlong(allRoute, t.value * myEnd))
  if (t.value < 1) raf = requestAnimationFrame(tick)
}
onMounted(() => setTimeout(() => (raf = requestAnimationFrame(tick)), 500))
onBeforeUnmount(() => cancelAnimationFrame(raf))

const traveled = computed(() => t.value * myEnd * split.totalMeters)
const phase = computed(() => (traveled.value < segments[0].meters ? 0 : 1))
const seg = computed(() => segments[phase.value])
const myShare = computed(() => {
  const d = traveled.value
  const s0 = Math.min(d, segments[0].meters) * split.perMeter / 3
  const s1 = Math.max(0, d - segments[0].meters) * split.perMeter / 2
  return s0 + s1
})
const arrived = computed(() => t.value >= 1)

const stops = computed(() => [
  { name: '陳小姐 · 洲子街', id: 'B', done: traveled.value >= segments[0].meters },
  { name: '你 · 瑞光路', id: 'A', done: arrived.value, me: true },
  { name: '林先生 · 港墘路', id: 'C', done: false },
])
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap ref="mapRef" :layers="layers" :fit="allRoute" :padding-top="130" :padding-bottom="20" />
      <div class="live">
        <div class="live-l">
          <span class="pulse"></span>
          <div>
            <b>{{ arrived ? '即將抵達你的下車點' : seg.label + '中' }}</b>
            <small>{{ arrived ? '瑞光路 399 號' : `${seg.riders.length} 人分攤 · ${seg.from} 到 ${seg.to}` }}</small>
          </div>
        </div>
        <div class="live-faces">
          <i v-for="id in seg.riders" :key="id" :style="{ background: riderColor[id] }"></i>
        </div>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="inner">
        <div class="meter">
          <div>
            <span class="k">你的分攤即時累計</span>
            <b class="num">${{ myShare.toFixed(1) }}</b>
          </div>
          <div class="r">
            <span class="k">預估抵達</span>
            <b class="num">08:{{ String(15 + Math.round(13 * t)).padStart(2, '0') }}</b>
          </div>
        </div>

        <div class="stops">
          <div v-for="(s, i) in stops" :key="s.id" class="stop" :class="{ done: s.done, me: s.me }">
            <span class="sn num">{{ i + 1 }}</span>
            <span class="st">{{ s.name }}</span>
            <span class="ss">
              <template v-if="s.done"><Icon name="check" :size="14" :stroke="2.6" /> {{ s.me ? '抵達' : '已下車' }}</template>
              <template v-else>{{ s.me ? '下一站' : '稍後' }}</template>
            </span>
          </div>
        </div>

        <div class="acts">
          <button class="btn btn-ghost" @click="toast('已分享行程給緊急聯絡人')"><Icon name="shield" :size="18" /> 安全分享</button>
          <button class="btn" :class="arrived ? 'btn-red' : 'btn-navy'" :disabled="!arrived" @click="go('done')">
            {{ arrived ? '完成行程' : '行駛中' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-area { position: relative; flex: 1; }
.live {
  position: absolute; top: 56px; left: 12px; right: 12px; z-index: 600; background: #fff; border-radius: 18px; padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-float);
}
.live-l { display: flex; align-items: center; gap: 12px; }
.live-l b { font-size: 15px; display: block; }
.live-l small { font-size: 12px; color: var(--ink-3); }
.pulse { width: 12px; height: 12px; border-radius: 50%; background: var(--blue); box-shadow: 0 0 0 0 rgba(12,76,128,.5); animation: pl 1.6s infinite; flex-shrink: 0; }
@keyframes pl { 100% { box-shadow: 0 0 0 12px rgba(12,76,128,0); } }
.live-faces { display: flex; }
.live-faces i { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid #fff; margin-left: -6px; }

.sheet { margin-top: -24px; flex-shrink: 0; }
.inner { padding: 8px 18px 30px; }
.meter { display: flex; justify-content: space-between; align-items: flex-end; }
.meter .k { font-size: 12px; color: var(--ink-3); display: block; }
.meter b { font-size: 32px; font-weight: 800; line-height: 1.1; }
.meter .r { text-align: right; }
.meter .r b { font-size: 22px; }

.stops { margin-top: 12px; background: var(--bg); border-radius: 14px; padding: 4px 12px; }
.stop { display: flex; align-items: center; gap: 10px; padding: 10px 0; font-size: 14px; }
.stop + .stop { border-top: 1px solid var(--line); }
.sn { width: 22px; height: 22px; border-radius: 7px; background: var(--navy); color: #fff; font-size: 12px; font-weight: 700; display: grid; place-items: center; }
.st { flex: 1; font-weight: 600; }
.stop.me .st { color: var(--red-deep); font-weight: 700; }
.stop.me .sn { background: var(--red); }
.ss { font-size: 12px; color: var(--ink-3); display: flex; align-items: center; gap: 3px; }
.stop.done .ss { color: var(--blue); font-weight: 700; }
.stop.done:not(.me) .st { color: var(--ink-3); text-decoration: line-through; }

.acts { display: grid; grid-template-columns: 1fr 1.3fr; gap: 10px; margin-top: 14px; }
.btn:disabled { opacity: .75; cursor: default; }
</style>

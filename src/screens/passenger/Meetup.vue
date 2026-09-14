<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { back, go, toast } from '../../store'
import { driver, places, me } from '../../data/scenario'
import { lines, riderPin, meetPin, carPin, riderColor, riders, routes, sampleAlong } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const DURATION = 9000
const t = ref(0)
const mapRef = ref(null)
let raf, start

const layers = [
  lines.approach,
  lines.walk(riders[0], { weight: 5 }),
  lines.walk(riders[1], { opacity: 0.45 }),
  lines.walk(riders[2], { opacity: 0.45 }),
  meetPin(),
  { ...riderPin(riders[0]), id: 'A' },
  { ...riderPin(riders[1]), id: 'B' },
  { ...riderPin(riders[2]), id: 'C' },
  carPin(routes.approach[0]),
]
const fit = [...routes.approach, ...riders.map((r) => r.latlng), places.meetup.latlng]

function tick(now) {
  if (!start) start = now
  t.value = Math.min(1, (now - start) / DURATION)
  const m = mapRef.value
  if (m) {
    m.moveMarker('A', sampleAlong(routes.walkA, t.value))
    m.moveMarker('B', sampleAlong(routes.walkB, Math.min(1, t.value * 1.35)))
    m.moveMarker('C', sampleAlong(routes.walkC, t.value * 0.95))
    m.moveMarker('car', sampleAlong(routes.approach, Math.max(0, (t.value - 0.15) / 0.85)))
  }
  if (t.value < 1) raf = requestAnimationFrame(tick)
}
onMounted(() => setTimeout(() => (raf = requestAnimationFrame(tick)), 500))
onBeforeUnmount(() => cancelAnimationFrame(raf))

const arrived = computed(() => t.value >= 1)
const walkLeft = computed(() => Math.max(0, Math.ceil(me.walk.minutes * (1 - t.value))))
const carLeft = computed(() => Math.max(0, Math.ceil(3 * (1 - Math.max(0, (t.value - 0.15) / 0.85)))))
const mateStatus = computed(() => [
  { r: riders[1], text: t.value > 0.74 ? '已抵達集合點' : '步行中', done: t.value > 0.74 },
  { r: riders[2], text: t.value >= 1 ? '即將抵達' : '步行中', done: false },
])
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap ref="mapRef" :layers="layers" :fit="fit" :padding-top="150" :padding-bottom="10" />
      <div class="nav-card" :class="{ ok: arrived }">
        <button class="nav-back" @click="back"><Icon name="back" :size="20" /></button>
        <div class="nav-ic"><Icon :name="arrived ? 'check' : 'walk'" :size="24" :stroke="2.4" /></div>
        <div class="nav-t">
          <b v-if="!arrived">往民生東路直走 <span class="num">{{ Math.round(me.walk.meters * (1 - t)) }}</span> 公尺</b>
          <b v-else>你已抵達集合點</b>
          <span>{{ places.meetup.sub }}</span>
        </div>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="inner">
        <div class="eta">
          <div class="eta-col">
            <span>你步行</span>
            <b class="num">{{ walkLeft }}<small>分</small></b>
          </div>
          <div class="eta-bar">
            <div class="eta-fill" :style="{ width: t * 100 + '%' }"></div>
          </div>
          <div class="eta-col r">
            <span>司機抵達</span>
            <b class="num">{{ carLeft }}<small>分</small></b>
          </div>
        </div>

        <div class="drv card-flat">
          <div class="avatar" style="background: var(--navy)">王</div>
          <div class="drv-t">
            <b>{{ driver.name }} <span class="rate num"><Icon name="star" :size="12" /> {{ driver.rating }}</span></b>
            <span>{{ driver.car }} · 白色</span>
          </div>
          <div class="plate num">{{ driver.plate }}</div>
        </div>

        <div class="mates">
          <div v-for="m in mateStatus" :key="m.r.id" class="mate">
            <i :style="{ background: riderColor[m.r.id] }">{{ m.r.initial }}</i>
            <span>{{ m.r.name }}</span>
            <em :class="{ done: m.done }">{{ m.text }}</em>
          </div>
        </div>

        <div class="acts">
          <button class="btn btn-ghost" @click="toast('已透過 yoxi 匿名電話聯絡司機')"><Icon name="phone" :size="18" /> 聯絡司機</button>
          <button class="btn" :class="arrived ? 'btn-red' : 'btn-navy'" :disabled="!arrived" @click="go('ride')">
            {{ arrived ? '我已上車' : '前往集合點中' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-area { position: relative; flex: 1; }
.nav-card {
  position: absolute; top: 54px; left: 12px; right: 12px; z-index: 600; background: var(--navy); color: #fff;
  border-radius: 20px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-float); transition: background .4s;
}
.nav-card.ok { background: var(--blue); }
.nav-back { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,.12); display: grid; place-items: center; color: #fff; }
.nav-ic { width: 44px; height: 44px; border-radius: 14px; background: var(--red); display: grid; place-items: center; }
.nav-card.ok .nav-ic { background: #fff; color: var(--blue); }
.nav-t { display: flex; flex-direction: column; }
.nav-t b { font-size: 17px; font-weight: 700; }
.nav-t span { font-size: 12px; opacity: .75; }

.sheet { margin-top: -24px; flex-shrink: 0; }
.inner { padding: 8px 18px 30px; }
.eta { display: flex; align-items: center; gap: 12px; }
.eta-col { display: flex; flex-direction: column; }
.eta-col.r { text-align: right; }
.eta-col span { font-size: 12px; color: var(--ink-3); }
.eta-col b { font-size: 30px; font-weight: 800; line-height: 1.05; }
.eta-col small { font-size: 13px; margin-left: 2px; font-weight: 700; }
.eta-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--mist); overflow: hidden; }
.eta-fill { height: 100%; background: var(--red); border-radius: 3px; }

.card-flat { background: var(--bg); border-radius: 14px; }
.drv { display: flex; align-items: center; gap: 12px; padding: 12px; margin-top: 14px; }
.drv-t { flex: 1; display: flex; flex-direction: column; }
.drv-t b { font-size: 15px; display: flex; align-items: center; gap: 6px; }
.rate { font-size: 12px; color: var(--ink-2); display: inline-flex; align-items: center; gap: 2px; }
.drv-t span { font-size: 12px; color: var(--ink-3); }
.plate { font-size: 15px; font-weight: 800; background: #fff; border: 1.5px solid var(--navy); border-radius: 8px; padding: 4px 8px; }

.mates { display: flex; gap: 8px; margin-top: 10px; }
.mate { flex: 1; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 8px 10px; border: 1px solid var(--line); border-radius: 12px; }
.mate i { width: 22px; height: 22px; border-radius: 50%; color: #fff; font-style: normal; font-size: 11px; display: grid; place-items: center; }
.mate em { margin-left: auto; font-style: normal; font-size: 11px; color: var(--ink-3); }
.mate em.done { color: var(--blue); font-weight: 700; }

.acts { display: grid; grid-template-columns: 1fr 1.3fr; gap: 10px; margin-top: 14px; }
.btn:disabled { opacity: .75; cursor: default; }
</style>

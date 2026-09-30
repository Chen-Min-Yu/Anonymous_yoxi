<script setup>
import { ref } from 'vue'
import { back, go } from '../../store'
import { pctSplit, places, me } from '../../data/scenario'
import { lines, riderPin, meetPin, dropPin, riderColor, riders, routes } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const view = ref('meet')
const mapRef = ref(null)

const layers = [
  ...riders.map((r) => lines.walk(r)),
  lines.shared3, lines.shared2, lines.soloC,
  dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
  ...riders.map((r) => riderPin(r)),
  meetPin(),
]
const fitMeet = [...riders.flatMap((r) => routes[r.walk.key]), places.meetup.latlng]
const fitAll = [...routes.shared3, ...routes.shared2, ...routes.soloC, ...riders.map((r) => r.latlng)]
function setView(v) {
  view.value = v
  mapRef.value.flyTo(v === 'meet' ? fitMeet : fitAll)
}

const timeline = [
  { t: '08:09', title: '從富錦街出發步行', sub: `${me.walk.meters} 公尺，約 ${me.walk.minutes} 分鐘`, kind: 'walk' },
  { t: '08:15', title: places.meetup.name, sub: '3 人上車，司機不需逐一繞路接送', kind: 'meet' },
  { t: '08:25', title: '陳小姐 洲子街下車', sub: '共同路段 5.8 km', kind: 'drop' },
  { t: '08:28', title: '你 瑞光路下車', sub: '共同路段 0.9 km', kind: 'me' },
  { t: '08:30', title: '林先生 港墘路下車', sub: '專屬路段 0.5 km', kind: 'drop' },
]
</script>

<template>
  <div class="scr yx">
    <RouteMap ref="mapRef" :layers="layers" :fit="fitMeet" :padding-top="70" :padding-bottom="420" :padding="[20, 20]" />
    <button class="yx-fab dark bk" @click="back"><Icon name="back" :size="20" /></button>
    <div class="views">
      <button :class="{ on: view === 'meet' }" @click="setView('meet')">集合點</button>
      <button :class="{ on: view === 'all' }" @click="setView('all')">全程路線</button>
    </div>

    <div class="yx-sheet panel">
      <div class="yx-grab"></div>
      <div class="scroll">
        <div class="eyebrow">AI 智慧集合點 <span class="yx-new">新</span></div>
        <b class="ttl">{{ places.meetup.name }}</b>
        <span class="sub">{{ places.meetup.sub }} · 08:15 上車</span>

        <!-- 集合點的存在理由：司機少繞路，乘客只走幾分鐘 -->
        <div class="why">
          <div class="w-col">
            <span>逐一到家門口接</span>
            <b class="num">10.7 km · 21 分</b>
          </div>
          <Icon name="arrow" :size="14" class="w-ar" />
          <div class="w-col good">
            <span>集合點一次上車</span>
            <b class="num">7.3 km · 14 分</b>
          </div>
        </div>

        <div class="mates">
          <div v-for="r in pctSplit" :key="r.id" class="mate" :class="{ me: r.me }">
            <span class="av" :style="{ background: riderColor[r.id] }">{{ r.initial }}</span>
            <span class="m-t">
              <b>{{ r.me ? '你' : r.name }}<em v-if="!r.me"><Icon name="shield" :size="11" /> {{ r.company }}</em></b>
              <small><Icon name="walk" :size="11" /> 步行 {{ r.walk.minutes }} 分 · 到 {{ r.dest.replace(/ \d+ 號/, '') }}</small>
            </span>
            <b class="m-p num">${{ r.pay }}</b>
          </div>
        </div>

        <div class="tl">
          <div v-for="(s, i) in timeline" :key="i" class="tl-row" :class="s.kind">
            <span class="tl-t num">{{ s.t }}</span>
            <span class="tl-dot"></span>
            <span class="tl-c"><b>{{ s.title }}</b><small>{{ s.sub }}</small></span>
          </div>
        </div>
        <div style="height: 88px"></div>
      </div>

      <div class="cta">
        <div class="c-p">
          <span>你付</span>
          <b class="num">${{ me.pay }}</b>
        </div>
        <button class="yx-btn" @click="go('fare')">看分攤怎麼算</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bk { top: 58px; left: 14px; width: 42px; height: 42px; }
.views { position: absolute; left: 14px; bottom: calc(54% + 10px); z-index: 600; display: flex; background: #fff; border-radius: 6px; padding: 3px; box-shadow: 0 3px 10px rgba(5,17,34,.22); }
.views button { height: 28px; padding: 0 12px; border-radius: 4px; font-size: 12px; font-weight: 600; color: var(--yx-ink2); }
.views button.on { background: var(--yx-navy); color: #fff; }

.panel { display: flex; flex-direction: column; height: 54%; }
.scroll { flex: 1; overflow-y: auto; padding: 0 16px; scrollbar-width: none; }
.scroll::-webkit-scrollbar { display: none; }
.eyebrow { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--yx-ink2); }
.ttl { display: block; font-size: 19px; font-weight: 700; color: var(--yx-ink); margin-top: 3px; }
.sub { font-size: 12px; color: var(--yx-ink2); }

.why { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px; border-radius: 8px; background: var(--yx-field); }
.w-col { flex: 1; display: flex; flex-direction: column; }
.w-col span { font-size: 11px; color: var(--yx-ink2); }
.w-col b { font-size: 14px; font-weight: 700; color: var(--yx-ink); }
.w-col.good b { color: var(--yx-red); }
.w-ar { color: var(--yx-ink3); flex-shrink: 0; }

.mates { margin-top: 14px; display: flex; flex-direction: column; gap: 2px; }
.mate { display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 8px; }
.mate.me { background: #FCEDEC; }
.av { width: 32px; height: 32px; border-radius: 50%; color: #fff; font-size: 13px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }
.m-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.m-t b { font-size: 14px; color: var(--yx-ink); display: flex; align-items: center; gap: 6px; }
.m-t em { font-style: normal; font-size: 11px; font-weight: 600; color: #0C4C80; display: inline-flex; align-items: center; gap: 2px; }
.m-t small { font-size: 11px; color: var(--yx-ink2); display: flex; align-items: center; gap: 3px; }
.m-p { font-size: 16px; font-weight: 800; color: var(--yx-ink); }
.mate.me .m-p { color: var(--yx-red); }

.tl { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--yx-line2); }
.tl-row { display: grid; grid-template-columns: 42px 14px 1fr; gap: 8px; position: relative; padding-bottom: 12px; }
.tl-row:not(:last-child)::after { content: ''; position: absolute; left: 55px; top: 14px; bottom: -2px; width: 2px; background: var(--yx-line); }
.tl-t { font-size: 11px; font-weight: 700; color: var(--yx-ink2); padding-top: 2px; }
.tl-dot { width: 11px; height: 11px; border-radius: 50%; background: #fff; border: 2.5px solid #9AA6B3; margin-top: 3px; z-index: 1; }
.tl-row.meet .tl-dot { background: var(--yx-red); border-color: var(--yx-red); }
.tl-row.me .tl-dot { border-color: var(--yx-red); }
.tl-row.drop .tl-dot { border-color: var(--yx-navy); }
.tl-c { display: flex; flex-direction: column; }
.tl-c b { font-size: 13px; color: var(--yx-ink); }
.tl-row.me b, .tl-row.meet b { color: var(--yx-red); }
.tl-c small { font-size: 11px; color: var(--yx-ink2); }

.cta { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 16px 24px; background: #fff; border-top: 1px solid var(--yx-line2); display: flex; align-items: center; gap: 14px; }
.c-p { display: flex; flex-direction: column; line-height: 1.15; flex-shrink: 0; }
.c-p span { font-size: 11px; color: var(--yx-ink2); }
.c-p b { font-size: 24px; font-weight: 800; color: var(--yx-ink); }
.cta .yx-btn { flex: 1; font-size: 16px; }
</style>

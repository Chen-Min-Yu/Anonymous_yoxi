<script setup>
import { ref } from 'vue'
import { back, go } from '../../store'
import { split, me, places } from '../../data/scenario'
import { lines, riderPin, meetPin, dropPin, riderColor, riders, routes, allRoute } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const why = ref(false)
const rs = split.riders

const layers = [
  lines.shared3, lines.shared2, lines.soloC,
  ...riders.map((r) => lines.walk(r)),
  dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
  ...riders.map((r) => riderPin(r)),
  meetPin('集合點'),
]
const fitAll = [...allRoute, ...riders.map((r) => r.latlng)]
const fitMeet = [...riders.flatMap((r) => routes[r.walk.key]), places.meetup.latlng]
const view = ref('meet')
const mapRef = ref(null)
function setView(v) {
  view.value = v
  mapRef.value.flyTo(v === 'meet' ? fitMeet : fitAll)
}

const timeline = [
  { t: '08:09', title: '從富錦街出發步行', sub: `${me.walk.meters} 公尺，約 ${me.walk.minutes} 分鐘`, kind: 'walk' },
  { t: '08:15', title: places.meetup.name, sub: '3 人上車，司機不需逐一繞路接送', kind: 'meet' },
  { t: '08:25', title: '陳小姐 洲子街下車', sub: '共同路段 5.8 km，三人分攤', kind: 'drop' },
  { t: '08:28', title: '你 瑞光路下車', sub: '共同路段 0.9 km，兩人分攤', kind: 'me' },
  { t: '08:30', title: '林先生 港墘路下車', sub: '專屬路段 0.5 km，由林先生負擔', kind: 'drop' },
]
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap ref="mapRef" :layers="layers" :fit="fitMeet" :padding-top="110" :padding-bottom="44" :padding="[30, 30]" />
      <div class="views">
        <button :class="{ on: view === 'meet' }" @click="setView('meet')">集合點</button>
        <button :class="{ on: view === 'all' }" @click="setView('all')">全程路線</button>
      </div>
      <div class="map-top">
        <button class="fab" @click="back"><Icon name="back" /></button>
        <div class="legend">
          <span><i class="lg walk"></i>步行</span>
          <span><i class="lg shared"></i>共同路段</span>
          <span><i class="lg solo"></i>專屬路段</span>
        </div>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="scroll inner">
        <div class="s-head">
          <div>
            <div class="eyebrow">AI 智慧集合點</div>
            <div class="h2">{{ places.meetup.name }}</div>
            <div class="sub">{{ places.meetup.sub }} · 08:15 上車</div>
          </div>
          <button class="why" :class="{ on: why }" @click="why = !why"><Icon name="info" :size="15" /> 為何選這裡</button>
        </div>

        <Transition name="fold">
          <div v-if="why" class="why-box">
            <div class="why-title"><Icon name="sparkle" :size="14" /> 集合點目標函數：司機繞路 + 乘客步行 最小化</div>
            <div class="cmp">
              <div class="cmp-col">
                <span class="cmp-k">逐一到家門口接</span>
                <b class="num">10.7 km · 21 分</b>
                <span class="cmp-d">司機要多繞 3 個巷弄</span>
              </div>
              <Icon name="arrow" :size="16" class="muted" />
              <div class="cmp-col good">
                <span class="cmp-k">智慧集合點</span>
                <b class="num">7.3 km · 14 分</b>
                <span class="cmp-d">少繞 3.4 km，平均步行 6 分</span>
              </div>
            </div>
          </div>
        </Transition>

        <div class="mates">
          <div v-for="r in rs" :key="r.id" class="mate" :class="{ me: r.me }">
            <div class="avatar" :style="{ background: riderColor[r.id] }">{{ r.initial }}</div>
            <div class="m-t">
              <b>{{ r.me ? '你' : r.name }} <span v-if="!r.me" class="verified"><Icon name="shield" :size="12" /> {{ r.company }}</span></b>
              <span><Icon name="walk" :size="12" /> 步行 {{ r.walk.minutes }} 分 · 到 {{ r.dest.replace(/ \d+ 號/, '') }}</span>
            </div>
            <div class="m-p num">${{ r.pay }}</div>
          </div>
        </div>

        <div class="tl">
          <div v-for="(s, i) in timeline" :key="i" class="tl-row" :class="s.kind">
            <span class="tl-t num">{{ s.t }}</span>
            <span class="tl-dot"></span>
            <span class="tl-c"><b>{{ s.title }}</b><small>{{ s.sub }}</small></span>
          </div>
        </div>
        <div style="height: 90px"></div>
      </div>
      <div class="cta">
        <div class="cta-p">
          <span>你付</span>
          <b class="num">${{ me.pay }}</b>
        </div>
        <button class="btn btn-red" @click="go('fare')">看分攤怎麼算 <Icon name="arrow" :size="18" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-area { position: relative; height: 46%; flex-shrink: 0; }
.map-top { position: absolute; top: 56px; left: 14px; right: 14px; display: flex; align-items: center; gap: 10px; z-index: 600; }
.views { position: absolute; left: 14px; bottom: 36px; z-index: 600; display: flex; background: #fff; border-radius: 12px; padding: 3px; box-shadow: var(--shadow-float); }
.views button { height: 30px; padding: 0 12px; border-radius: 9px; font-size: 12px; font-weight: 700; color: var(--ink-2); }
.views button.on { background: var(--navy); color: #fff; }
.cta { z-index: 5; }
.fab { width: 40px; height: 40px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-float); display: grid; place-items: center; }
.legend { display: flex; gap: 10px; background: rgba(255,255,255,.95); padding: 8px 12px; border-radius: 99px; box-shadow: var(--shadow-card); font-size: 11px; font-weight: 700; color: var(--ink-2); }
.legend span { display: flex; align-items: center; gap: 5px; }
.lg { width: 16px; height: 4px; border-radius: 2px; display: inline-block; }
.lg.walk { background: repeating-linear-gradient(90deg, var(--red) 0 3px, transparent 3px 6px); }
.lg.shared { background: var(--blue); }
.lg.solo { background: var(--red); }

.sheet { flex: 1; margin-top: -24px; display: flex; flex-direction: column; min-height: 0; }
.inner { padding: 6px 18px 0; }
.s-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.s-head .h2 { font-size: 19px; font-weight: 900; margin-top: 2px; }
.why { flex-shrink: 0; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--blue); background: var(--blue-soft); height: 32px; padding: 0 10px; border-radius: 10px; }
.why.on { background: var(--blue); color: #fff; }
.why-box { margin-top: 12px; background: var(--bg); border-radius: 14px; padding: 12px; overflow: hidden; }
.why-title { font-size: 12px; font-weight: 700; color: var(--blue); display: flex; align-items: center; gap: 5px; }
.cmp { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.cmp-col { flex: 1; background: #fff; border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; border: 1px solid var(--line); }
.cmp-col.good { border-color: var(--blue); }
.cmp-k { font-size: 11px; color: var(--ink-3); font-weight: 600; }
.cmp-col b { font-size: 15px; font-weight: 800; }
.cmp-col.good b { color: var(--blue); }
.cmp-d { font-size: 11px; color: var(--ink-2); }
.fold-enter-active, .fold-leave-active { transition: all .3s ease; max-height: 200px; }
.fold-enter-from, .fold-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

.mates { margin-top: 16px; display: flex; flex-direction: column; gap: 2px; }
.mate { display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: 12px; }
.mate.me { background: var(--red-soft); }
.m-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.m-t b { font-size: 14px; display: flex; align-items: center; gap: 6px; }
.m-t > span { font-size: 12px; color: var(--ink-3); display: flex; align-items: center; gap: 3px; }
.verified { font-size: 11px; font-weight: 600; color: var(--blue); display: inline-flex; align-items: center; gap: 2px; }
.m-p { font-size: 16px; font-weight: 800; }
.mate.me .m-p { color: var(--red); }

.tl { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); }
.tl-row { display: grid; grid-template-columns: 44px 16px 1fr; gap: 8px; position: relative; padding-bottom: 12px; }
.tl-row:not(:last-child)::after { content: ''; position: absolute; left: 59px; top: 14px; bottom: -2px; width: 2px; background: var(--line); }
.tl-t { font-size: 12px; font-weight: 700; color: var(--ink-3); padding-top: 1px; }
.tl-dot { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2.5px solid var(--steel); margin-top: 3px; z-index: 1; }
.tl-row.meet .tl-dot { background: var(--red); border-color: var(--red); }
.tl-row.me .tl-dot { border-color: var(--red); }
.tl-row.drop .tl-dot { border-color: var(--navy); }
.tl-c { display: flex; flex-direction: column; }
.tl-c b { font-size: 14px; }
.tl-row.me b, .tl-row.meet b { color: var(--red-deep); }
.tl-c small { font-size: 12px; color: var(--ink-3); }

.cta { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 18px 30px; background: #fff; border-top: 1px solid var(--line); display: flex; gap: 14px; align-items: center; }
.cta-p { display: flex; flex-direction: column; line-height: 1.1; }
.cta-p span { font-size: 12px; color: var(--ink-3); }
.cta-p b { font-size: 26px; font-weight: 800; }
.cta .btn { flex: 1; }
</style>

<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { commuteCurve, corridor } from '../../data/pulse'
import { carTypes, optionsFor, legStyles } from '../../data/travel'
import Icon from '../../components/Icon.vue'

const hover = ref(commuteCurve.findIndex((d) => d.t === '08:15'))
const maxTotal = Math.ceil(Math.max(...commuteCurve.map((d) => d.wait + d.ride)) / 10) * 10
const H = 110
const cur = computed(() => commuteCurve[hover.value])

const carId = ref('ev')
const car = computed(() => carTypes.find((c) => c.id === carId.value))
const options = computed(() => optionsFor(car.value))
const maxLen = computed(() => Math.max(...options.value.map((o) => o.total)))
const fastest = computed(() => Math.min(...options.value.map((o) => o.total)))
const cheapest = computed(() => Math.min(...options.value.map((o) => o.fare)))

const upcoming = ref([
  { t: '今天 18:20', title: '下班回民生社區', note: '18 點最難叫車，預約回程可保留座位', act: '預約順路車', done: false, warn: true },
  { t: '週五 19:00', title: '南京復興聚餐', note: '近 4 週有 3 次週五去這裡', act: '出發提醒', done: false },
])

function tap(o) {
  if (!o.action) return toast(o.k === 'mrt' ? '大眾運輸資訊由台北捷運提供' : '一般叫車沿用 yoxi 現有流程')
  if (o.action.to) go(o.action.to)
  else toast(o.action.toast)
}
function doAct(u) {
  u.done = true
  toast(`已設定：${u.act}`)
}
</script>

<template>
  <div class="scr">
    <div class="topbar" style="margin-top: 50px">
      <button class="icon-btn" @click="back"><Icon name="back" /></button>
      <span class="t">我的移動預報</span>
    </div>

    <div class="scroll">
      <div class="pad">
        <!-- 幾點出發 -->
        <section class="card chart-card">
          <div class="cc-h">
            <div>
              <div class="h2">富錦街 到 瑞光路</div>
              <div class="eyebrow">平日早班 · 近 90 天 {{ corridor.trips }} 筆</div>
            </div>
            <div class="readout">
              <b class="num">{{ Math.round(cur.wait + cur.ride) }}<small>分</small></b>
              <span class="num">{{ cur.t }} 叫車</span>
            </div>
          </div>

          <div class="chart" role="img" aria-label="各出發時間自己叫車的門到門分鐘數">
            <div class="plot">
              <div class="grid"><i></i><i></i></div>
              <button
                v-for="(d, i) in commuteCurve" :key="d.t" class="col" :class="{ on: hover === i }"
                @mouseenter="hover = i" @focus="hover = i" @click="hover = i"
              >
                <span class="stack" :style="{ height: ((d.wait + d.ride) / maxTotal) * H + 'px' }">
                  <span class="seg wait" :style="{ flex: d.wait }"></span>
                  <span class="seg ride" :style="{ flex: d.ride }"></span>
                </span>
                <span class="xl num">{{ d.t.slice(0, 5) }}</span>
              </button>
            </div>
          </div>
          <div class="legend">
            <span><i style="background: #778AA4"></i>等車</span>
            <span><i style="background: #F14A42"></i>車程</span>
            <span class="muted">中位數 · 分鐘</span>
          </div>
        </section>

        <!-- 車型 -->
        <section class="block">
          <div class="block-h">
            <span class="h2">車型</span>
            <span class="muted small">{{ car.desc }}</span>
          </div>
          <div class="cars">
            <button v-for="c in carTypes" :key="c.id" class="car" :class="{ on: c.id === carId }" @click="carId = c.id">
              <Icon :name="c.icon" :size="19" />
              <span>{{ c.name }}</span>
            </button>
          </div>
        </section>

        <!-- 怎麼去 -->
        <section class="block">
          <div class="block-h">
            <span class="h2">08:15 怎麼去</span>
            <span class="muted small">含大眾運輸</span>
          </div>
          <div class="opts">
            <button v-for="o in options" :key="o.k" class="opt card" :class="{ hl: o.highlight }" @click="tap(o)">
              <div class="o-top">
                <b>{{ o.title }}</b>
                <span v-if="o.total === fastest" class="chip chip-navy">最快</span>
                <span v-if="o.fare === cheapest" class="chip chip-blue">最省</span>
                <span class="o-fare num">${{ o.fare }}</span>
              </div>
              <div class="bar">
                <span
                  v-for="(l, i) in o.legs" :key="i" class="lseg"
                  :style="{ flex: l.min, background: legStyles[l.kind].color }" :title="`${l.label} ${l.min} 分`"
                ><em v-if="l.min >= 8">{{ l.min }}</em></span>
                <span class="pad-rest" :style="{ flex: maxLen - o.total }"></span>
              </div>
              <div class="o-foot">
                <span class="o-total num">{{ o.total }} 分鐘</span>
                <span class="o-note">{{ o.note }}</span>
                <span v-if="o.action" class="o-go">{{ o.action.text }} <Icon name="chevron" :size="13" /></span>
              </div>
            </button>
          </div>
          <div class="leg-key">
            <span v-for="(v, k) in legStyles" :key="k"><i :style="{ background: v.color }"></i>{{ v.label }}</span>
          </div>
        </section>

        <!-- 接下來 -->
        <section class="block">
          <div class="h2">接下來的移動</div>
          <div class="ups card">
            <div v-for="u in upcoming" :key="u.t" class="up">
              <span class="up-t num">{{ u.t }}</span>
              <div class="up-c">
                <b>{{ u.title }}</b>
                <span :class="{ warn: u.warn }">{{ u.note }}</span>
              </div>
              <button class="up-a" :class="{ done: u.done }" @click="doAct(u)">
                <Icon :name="u.done ? 'check' : 'bell'" :size="14" />
              </button>
            </div>
          </div>
        </section>

        <div class="source">
          <Icon name="info" :size="14" />
          <span>等車與車程為 yoxi 行程資料中位數；車型費率、捷運時刻與接駁時間為示意值，正式提案需以官方費率與大眾運輸 API 校準。</span>
        </div>
        <div style="height: 30px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.small { font-size: 12px; }
.chart-card { padding: 14px 16px 12px; }
.cc-h { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.cc-h .h2 { font-size: 17px; font-weight: 800; }
.readout { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.readout b { font-size: 26px; font-weight: 800; color: var(--navy); }
.readout b small { font-size: 12px; margin-left: 1px; }
.readout span { font-size: 11px; color: var(--ink-3); font-weight: 600; }

.chart { margin-top: 10px; }
.plot { position: relative; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; align-items: end; height: 130px; }
.grid { position: absolute; left: 0; right: 0; top: 0; height: 110px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.grid i { height: 1px; background: var(--line); }
.col { position: relative; height: 130px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 20px; border-radius: 8px; }
.col.on { background: rgba(5,17,34,.04); }
.stack { width: 64%; display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 1; }
.seg { display: block; min-height: 2px; }
.seg:first-child { border-radius: 4px 4px 0 0; }
.seg.wait { background: #778AA4; }
.seg.ride { background: var(--red); opacity: .45; }
.col.on .seg.ride { opacity: 1; }
.xl { position: absolute; bottom: 2px; font-size: 10px; color: var(--ink-3); font-weight: 600; }
.col.on .xl { color: var(--navy); font-weight: 800; }
.legend { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; font-weight: 600; color: var(--ink-2); }
.legend span { display: flex; align-items: center; gap: 4px; }
.legend i { width: 9px; height: 9px; border-radius: 3px; }
.legend .muted { margin-left: auto; }

.block { margin-top: 18px; }
.block > .h2 { margin-bottom: 8px; }
.block-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }

.cars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.car { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 2px; border-radius: 12px; background: #fff; border: 1.5px solid var(--line); color: var(--ink-2); font-size: 12px; font-weight: 700; transition: all .18s; }
.car.on { border-color: var(--red); background: var(--red-soft); color: var(--red-deep); }

.opts { display: flex; flex-direction: column; gap: 8px; }
.opt { width: 100%; padding: 12px 14px; text-align: left; }
.opt.hl { border: 2px solid var(--red); }
.o-top { display: flex; align-items: center; gap: 6px; }
.o-top b { font-size: 15px; }
.o-fare { margin-left: auto; font-size: 18px; font-weight: 800; }
.opt.hl .o-fare { color: var(--red); }
.bar { display: flex; gap: 2px; height: 16px; margin: 9px 0 7px; }
.lseg { border-radius: 3px; display: grid; place-items: center; min-width: 3px; }
.lseg em { font-style: normal; font-size: 10px; font-weight: 700; color: #fff; font-family: var(--num); }
.pad-rest { background: none; }
.o-foot { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.o-total { font-weight: 800; color: var(--navy); }
.o-note { color: var(--ink-3); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.o-go { display: flex; align-items: center; gap: 1px; font-weight: 700; color: var(--red); flex-shrink: 0; }
.leg-key { display: flex; gap: 12px; margin-top: 8px; font-size: 11px; font-weight: 600; color: var(--ink-2); }
.leg-key span { display: flex; align-items: center; gap: 4px; }
.leg-key i { width: 9px; height: 9px; border-radius: 3px; }

.ups { padding: 2px 14px; }
.up { display: flex; align-items: center; gap: 10px; padding: 11px 0; }
.up + .up { border-top: 1px solid var(--line); }
.up-t { font-size: 11px; font-weight: 700; color: var(--ink-3); width: 64px; flex-shrink: 0; }
.up-c { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.up-c b { font-size: 14px; }
.up-c > span { font-size: 12px; color: var(--ink-3); line-height: 1.5; }
.up-c > span.warn { color: var(--red-deep); }
.up-a { width: 34px; height: 34px; border-radius: 11px; background: var(--navy); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.up-a.done { background: var(--blue-soft); color: var(--blue); }

.source { display: flex; gap: 8px; margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: var(--blue-soft); color: var(--blue); font-size: 11.5px; line-height: 1.6; }
.source svg { flex-shrink: 0; margin-top: 2px; }
</style>

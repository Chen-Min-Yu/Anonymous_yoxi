<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { commuteCurve, corridor } from '../../data/pulse'
import { me } from '../../data/scenario'
import Icon from '../../components/Icon.vue'

const hover = ref(commuteCurve.findIndex((d) => d.t === '08:15'))
const maxTotal = Math.ceil(Math.max(...commuteCurve.map((d) => d.wait + d.ride)) / 10) * 10
const POOL_RIDE = 22 // 08:15 車程中位 20 分 + 多停 2 站約 2 分
const total = (d) => Math.round(d.wait + d.ride)
const H = 120
const cur = computed(() => commuteCurve[hover.value])

const options = [
  { k: 'pool', title: '順路共乘', time: '08:15 集合點上車', meta: `步行 ${me.walk.minutes} 分 · 車程約 ${POOL_RIDE} 分`, price: `$${me.pay}`, tag: `省 $${me.saved}`, action: '查看媒合' },
  { k: 'solo', title: '自己叫車', time: '08:15 叫車', meta: '中位等 5 分 · 車程 20 分', price: '$200–300' },
  { k: 'book', title: '預約叫車', time: '08:15 準時到門口', meta: '免等車 · 車程 20 分', price: '$250–300' },
]

const upcoming = ref([
  { t: '今天 18:20', title: '下班回民生社區', note: '雷陣雨，自己叫車預估等 14 分鐘', act: '預約回程順路車', done: false, warn: true },
  { t: '週五 19:00', title: '南京復興聚餐', note: '你近 4 週有 3 次週五去這裡；18:40 出發可避開散場潮', act: '開啟出發提醒', done: false },
  { t: '週日 06:30', title: '松山機場送機', note: '機場清晨供車少，建議前一晚預約', act: '預約叫車', done: false },
])

const pushes = ref([
  { k: '平日 07:30 通勤預報', on: true },
  { k: '下班前 17:30 回程預報', on: true },
  { k: '周邊活動散場提醒', on: false },
])

function doAct(u) {
  u.done = true
  toast(`已完成：${u.act}`)
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
        <section class="card chart-card">
          <div class="cc-h">
            <div>
              <div class="eyebrow">平日早班 · 近 90 天 {{ corridor.trips }} 筆同走廊行程</div>
              <div class="h2">富錦街 到 瑞光路</div>
            </div>
            <span class="chip chip-red">今天</span>
          </div>

          <div class="readout">
            <span class="num ro-t">{{ cur.t }} 自己叫車 · 樣本 {{ cur.n }} 筆</span>
            <span class="ro-v">
              門到門約 <b class="num">{{ total(cur) }} 分</b>
              <small>（等車中位 {{ cur.wait }} 分 + 車程中位 {{ cur.ride }} 分）</small>
            </span>
          </div>

          <div class="chart" role="img" aria-label="不同出發時間的門到門分鐘數">
            <div class="y">
              <span class="num">{{ maxTotal }}</span>
              <span class="num">{{ Math.round(maxTotal / 2) }}</span>
              <span class="num">0</span>
            </div>
            <div class="plot">
              <div class="grid"><i></i><i></i><i></i></div>
              <button
                v-for="(d, i) in commuteCurve" :key="d.t" class="col" :class="{ on: hover === i, mine: d.t === '08:15' }"
                @mouseenter="hover = i" @focus="hover = i" @click="hover = i"
              >
                <span class="stack" :style="{ height: ((d.wait + d.ride) / maxTotal) * H + 'px' }">
                  <span class="seg wait" :style="{ flex: d.wait }"></span>
                  <span class="seg ride" :style="{ flex: d.ride }"></span>
                </span>
                <span class="xl num">{{ d.t }}</span>
                <span v-if="d.t === '08:15'" class="best">你常搭</span>
              </button>
            </div>
          </div>
          <div class="legend">
            <span><i class="lw"></i>等車</span>
            <span><i class="lr"></i>車程</span>
            <span class="muted">中位數，單位：分鐘</span>
          </div>
          <p class="pool-cmp">同一時間改搭順路共乘：步行 {{ me.walk.minutes }} 分 + 車程約 {{ POOL_RIDE }} 分，門到門多約 3 分鐘，車資 ${{ me.pay }}（自己叫車約 ${{ me.solo }}）。</p>
        </section>

        <section class="block">
          <div class="h2">08:15 怎麼去</div>
          <div class="opts">
            <div v-for="o in options" :key="o.k" class="opt card" :class="o.k">
              <div class="o-l">
                <div class="o-t"><b>{{ o.title }}</b><span v-if="o.tag" class="chip chip-red">{{ o.tag }}</span></div>
                <span class="o-time">{{ o.time }}</span>
                <span class="o-meta">{{ o.meta }}</span>
              </div>
              <div class="o-r">
                <b class="num">{{ o.price }}</b>
                <button v-if="o.action" class="mini red" @click="go('match')">{{ o.action }}</button>
                <button v-else class="mini" @click="toast(o.k === 'book' ? '已預約 08:15 到車' : '一般叫車沿用 yoxi 現有流程')">{{ o.k === 'book' ? '預約' : '叫車' }}</button>
              </div>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="h2">接下來的移動</div>
          <p class="sub" style="margin-bottom: 8px">AI 從你的常用地點與時段，提前幫你看好要不要叫車、幾點出門。</p>
          <div class="ups card">
            <div v-for="u in upcoming" :key="u.t" class="up">
              <span class="up-t num">{{ u.t }}</span>
              <div class="up-c">
                <b>{{ u.title }}</b>
                <span :class="{ warn: u.warn }">{{ u.note }}</span>
                <button class="up-a" :class="{ done: u.done }" @click="doAct(u)">
                  <Icon :name="u.done ? 'check' : 'bell'" :size="14" /> {{ u.done ? '已設定' : u.act }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="h2">推播設定</div>
          <div class="pushes card">
            <button v-for="p in pushes" :key="p.k" class="push" @click="p.on = !p.on">
              <span>{{ p.k }}</span>
              <span class="sw" :class="{ on: p.on }"><i></i></span>
            </button>
          </div>
        </section>
        <div style="height: 36px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card { padding: 16px; }
.cc-h { display: flex; justify-content: space-between; align-items: flex-start; }
.cc-h .h2 { margin-top: 2px; }
.readout { margin: 12px 0 8px; padding: 10px 12px; background: var(--bg); border-radius: 12px; display: flex; flex-direction: column; }
.ro-t { font-size: 12px; font-weight: 700; color: var(--ink-3); }
.ro-v { font-size: 13px; color: var(--ink-2); }
.ro-v b { font-size: 22px; font-weight: 800; color: var(--navy); margin: 0 2px; }
.ro-v small { font-size: 12px; color: var(--ink-3); }

.chart { display: grid; grid-template-columns: 22px 1fr; gap: 6px; margin-top: 10px; }
.y { display: flex; flex-direction: column; justify-content: space-between; height: 120px; font-size: 10px; color: var(--ink-3); text-align: right; transform: translateY(-5px); }
.plot { position: relative; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; align-items: end; height: 142px; }
.grid { position: absolute; left: 0; right: 0; top: 0; height: 120px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.grid i { height: 1px; background: var(--line); }
.col { position: relative; height: 142px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 22px; border-radius: 8px; }
.col.on { background: rgba(5,17,34,.04); }
.stack { width: 62%; display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 1; }
.seg { display: block; min-height: 2px; }
.seg:first-child { border-radius: 4px 4px 0 0; }
.seg.wait { background: #B8C8DC; }
.seg.ride { background: var(--blue); }
.col.mine .seg.ride { background: var(--red); }
.pool-cmp { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: var(--red-soft); color: var(--red-deep); font-size: 12px; line-height: 1.6; font-weight: 600; }
.col.on .stack { outline: 2px solid var(--navy); outline-offset: 2px; border-radius: 4px 4px 0 0; }
.xl { position: absolute; bottom: 2px; font-size: 10px; color: var(--ink-3); font-weight: 600; }
.col.on .xl { color: var(--navy); font-weight: 800; }
.best { position: absolute; top: -4px; white-space: nowrap; font-size: 10px; font-weight: 800; color: var(--red-deep); background: var(--red-soft); padding: 1px 5px; border-radius: 6px; }
.legend { display: flex; gap: 12px; margin-top: 8px; font-size: 11px; font-weight: 600; color: var(--ink-2); }
.legend span { display: flex; align-items: center; gap: 4px; }
.legend i { width: 10px; height: 10px; border-radius: 3px; }
.lw { background: #B8C8DC; } .lr { background: var(--blue); } .lp { background: var(--red); }
.legend .muted { margin-left: auto; }

.block { margin-top: 20px; }
.block > .h2 { margin-bottom: 8px; }
.opts { display: flex; flex-direction: column; gap: 8px; }
.opt { display: flex; justify-content: space-between; padding: 12px 14px; gap: 10px; }
.opt.pool { border: 2px solid var(--red); }
.o-l { display: flex; flex-direction: column; min-width: 0; }
.o-t { display: flex; align-items: center; gap: 6px; }
.o-t b { font-size: 15px; }
.o-time { font-size: 13px; color: var(--navy); font-weight: 600; margin-top: 2px; }
.o-meta { font-size: 12px; color: var(--ink-3); }
.o-r { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px; flex-shrink: 0; }
.o-r b { font-size: 18px; font-weight: 800; }
.opt.pool .o-r b { color: var(--red); }
.mini { height: 30px; padding: 0 12px; border-radius: 9px; font-size: 12px; font-weight: 700; background: var(--bg); color: var(--navy); border: 1px solid var(--line); }
.mini.red { background: var(--red); color: #fff; border-color: var(--red); }

.ups { padding: 4px 14px; }
.up { display: grid; grid-template-columns: 72px 1fr; gap: 8px; padding: 12px 0; }
.up + .up { border-top: 1px solid var(--line); }
.up-t { font-size: 12px; font-weight: 700; color: var(--ink-3); padding-top: 2px; }
.up-c { display: flex; flex-direction: column; align-items: flex-start; }
.up-c b { font-size: 14px; }
.up-c > span { font-size: 12px; color: var(--ink-2); line-height: 1.55; }
.up-c > span.warn { color: var(--red-deep); }
.up-a { margin-top: 6px; height: 28px; padding: 0 10px; border-radius: 8px; background: var(--navy); color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.up-a.done { background: var(--blue-soft); color: var(--blue); }

.pushes { padding: 2px 14px; }
.push { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 14px; font-weight: 600; }
.push + .push { border-top: 1px solid var(--line); }
.sw { width: 44px; height: 26px; border-radius: 13px; background: var(--mist); position: relative; transition: background .2s; }
.sw i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(5,17,34,.3); transition: transform .2s; }
.sw.on { background: var(--red); }
.sw.on i { transform: translateX(18px); }
</style>

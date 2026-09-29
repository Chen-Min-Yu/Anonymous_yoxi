<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { commuteCurve, corridor } from '../../data/pulse'
import { me } from '../../data/scenario'
import Icon from '../../components/Icon.vue'

const total = (d) => Math.round(d.wait + d.ride)
const cur = computed(() => commuteCurve.find((d) => d.t === '08:15'))

// 車型選擇：只影響順路共乘的車資試算，字級與說明盡量精簡
const vehicles = [
  { k: 'ev', label: '純電', icon: 'bolt', mult: 1 },
  { k: 'comfort', label: '舒適', icon: 'car', mult: 1 },
  { k: 'premium', label: '尊榮', icon: 'star', mult: 1.6 },
  { k: 'xl', label: '六人座', icon: 'users', mult: 1.35 },
]
const vehicle = ref('comfort')
const mult = computed(() => vehicles.find((v) => v.k === vehicle.value).mult)
// 三種方式都依車型倍率調整，取整到 $5
const price = (n) => Math.round((n * mult.value) / 5) * 5
const range = (lo, hi) => `$${price(lo)}–${price(hi)}`

const options = computed(() => [
  { k: 'pool', title: '順路共乘', time: '08:15 集合點上車', meta: `步行 ${me.walk.minutes} 分`, price: `$${price(me.pay)}`, tag: `省 $${price(me.solo) - price(me.pay)}`, action: '查看媒合' },
  { k: 'solo', title: '自己叫車', time: '08:15 叫車', meta: '中位等 5 分', price: range(200, 300) },
  { k: 'book', title: '預約叫車', time: '08:15 準時到門口', meta: '免等車', price: range(250, 300) },
])

const upcoming = ref([
  { t: '今天 18:20', title: '下班回民生社區', note: '雷陣雨，叫車約等 14 分', act: '預約回程順路車', done: false, warn: true },
  { t: '週五 19:00', title: '南京復興聚餐', note: '18:40 出發可避開散場潮', act: '開啟出發提醒', done: false },
  { t: '週日 06:30', title: '松山機場送機', note: '清晨車少，建議前一晚預約', act: '預約叫車', done: false },
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
            <span class="num ro-t">{{ cur.t }} 自己叫車</span>
            <span class="ro-v">門到門約 <b class="num">{{ total(cur) }} 分</b></span>
          </div>
        </section>

        <section class="block">
          <div class="h2">08:15 怎麼去</div>
          <div class="veh-select" role="tablist">
            <button v-for="v in vehicles" :key="v.k" :class="{ on: vehicle === v.k }" @click="vehicle = v.k">
              <Icon :name="v.icon" :size="15" />{{ v.label }}
            </button>
          </div>
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
          <p class="sub" style="margin-bottom: 8px">AI 提前幫你看好要不要叫車</p>
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

.block { margin-top: 20px; }
.block > .h2 { margin-bottom: 8px; }
.veh-select { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px; }
.veh-select button { display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 1.5px solid var(--line); border-radius: 12px; padding: 8px 2px; font-size: 11px; font-weight: 700; color: var(--ink-3); transition: all .2s; }
.veh-select button.on { background: var(--navy); border-color: var(--navy); color: #fff; }
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

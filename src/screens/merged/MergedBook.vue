<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { cars, defaultSchedule } from '../../data/origin'
import { trip } from '../../data/merged'
import { me, places, routes } from '../../data/scenario'
import { corridor } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import CarArt from '../../components/CarArt.vue'

// 在 yoxi 原本的「立即叫車／預約」之外，加入第三個分頁「順路共乘」
const mode = ref('instant')
const sched = ref({ ...defaultSchedule })
const picked = ref('any')
const showPicker = ref(false)

// 順路共乘的兩種車型：一般四人座與六人座（六人座可分攤人數多，每人更省）
const poolCars = [
  {
    id: 'pool3', name: '順路共乘', price: `$ ${me.pay}`, art: 'suv', badge: 'bolt', seats: 3,
    desc: `與 2 位同走廊夥伴共乘，${places.meetup.sub}上車。車資依實際里程逐段分攤。`,
  },
  {
    id: 'pool5', name: '順路共乘 六人座', price: `$ ${Math.round((me.pay * 1.5 * 3 / 5) / 5) * 5}`, art: 'van', seats: 5,
    desc: '同一趟可分攤的人數更多，每人反而比四人座更省。車資依實際里程逐段分攤。',
  },
]

const list = computed(() => {
  if (mode.value === 'pool') return poolCars
  return cars.filter((c) => (mode.value === 'instant' ? c.instant : c.scheduled))
})

// 城市脈動：把各出發時間的等車中位數帶進預約時間選單
const slots = corridor.curve
  .filter((d) => d.t >= '07:30' && d.t <= '09:00')
  .map((d) => ({ t: d.t, wait: Math.round(d.wait), pool: d.t === '08:15' }))

function pickMode(m) {
  if (m === 'scheduled') return (showPicker.value = true)
  mode.value = m
  picked.value = m === 'pool' ? 'pool3' : 'any'
}
function confirmSchedule() {
  mode.value = 'scheduled'
  showPicker.value = false
  if (!list.value.some((c) => c.id === picked.value)) picked.value = list.value[0].id
}
const cta = computed(() =>
  mode.value === 'pool' ? '確認加入順路車' : mode.value === 'scheduled' ? '確認預約' : '確認叫車',
)

const layers = [
  { type: 'line', coords: trip.route, color: '#8C1B27', weight: 5 },
  { type: 'marker', latlng: trip.pickupLL, size: [18, 18], z: 300, html: '<div class="o-dot red"></div>' },
  { type: 'marker', latlng: trip.dropoffLL, size: [22, 28], anchor: [11, 28], z: 300, html: '<div class="o-pin navy"><span></span></div>' },
]
const fit = [...routes.soloA]
</script>

<template>
  <div class="scr yx">
    <RouteMap :layers="layers" :fit="fit" :padding-top="150" :padding-bottom="450" :padding="[24, 24]" />

    <button class="yx-fab dark bk" @click="back"><Icon name="back" :size="20" /></button>

    <div class="addr pick">
      <span class="sq red"><i></i></span>
      <span class="a-t">{{ trip.pickup }}</span>
      <Icon name="pencil" :size="12" class="pen" />
    </div>
    <div class="addr drop">
      <span class="sq navy"><b class="num">{{ trip.etaMin }}</b><small>分鐘</small></span>
      <span class="a-t">{{ trip.dropoff }}</span>
      <Icon name="pencil" :size="12" class="pen" />
    </div>

    <div class="yx-sheet panel">
      <div class="yx-grab"></div>

      <!-- yoxi 原本兩個分頁 + 新增的順路共乘 -->
      <div class="tabs">
        <button class="tab" :class="{ on: mode === 'instant' }" @click="pickMode('instant')">立即叫車</button>
        <button v-if="mode !== 'scheduled'" class="tab" @click="pickMode('scheduled')">預 約</button>
        <button v-else class="tab wide on" @click="showPicker = true">{{ sched.date }} {{ sched.time }}</button>
        <button class="tab pool" :class="{ on: mode === 'pool' }" @click="pickMode('pool')">
          順路共乘 <span class="yx-new">新</span>
        </button>
      </div>

      <!-- 順路共乘才出現的集合點資訊 -->
      <button v-if="mode === 'pool'" class="meet" @click="go('m-pool')">
        <span class="m-ic"><Icon name="walk" :size="16" /></span>
        <span class="m-t">
          <b>{{ places.meetup.sub }}</b>
          <small>走 {{ me.walk.minutes }} 分到集合點 · 08:15 上車 · 省 ${{ me.saved }}</small>
        </span>
        <span class="m-go">看路線與分攤 <Icon name="chevron" :size="12" /></span>
      </button>

      <div class="cars">
        <button v-for="c in list" :key="c.id" class="car" :class="{ on: picked === c.id }" @click="picked = c.id">
          <CarArt :art="c.art" :badge="c.badge" :size="74" />
          <div class="c-b">
            <div class="c-top">
              <b>{{ c.name }}</b>
              <span class="c-p num">{{ c.price }}</span>
            </div>
            <span v-if="mode === 'instant'" class="c-eta">{{ c.eta }}分鐘後抵達</span>
            <span v-else-if="mode === 'pool'" class="c-eta pool">{{ c.seats }} 人分攤 · 逐段計價</span>
            <span class="c-d">{{ c.desc }}</span>
          </div>
        </button>
      </div>

      <div class="opts">
        <button @click="toast('付款方式')"><Icon name="coin" :size="15" /> 現金付款</button>
        <button @click="toast('點數折抵')"><Icon name="wallet" :size="15" /> 點數折抵</button>
        <button @click="toast('乘車需求')"><Icon name="doc" :size="15" /> 乘車需求</button>
      </div>

      <button class="yx-btn cta" @click="toast(mode === 'pool' ? '已加入 08:15 順路車' : '已送出')">{{ cta }}</button>
    </div>

    <!-- 預約時間選擇：每個時段標上城市脈動的等車時間 -->
    <Transition name="fade"><div v-if="showPicker" class="scrim" @click="showPicker = false"></div></Transition>
    <Transition name="rise">
      <div v-if="showPicker" class="modal">
        <button class="m-x" @click="showPicker = false"><Icon name="close" :size="20" /></button>
        <label>預約日期</label>
        <div class="sel">
          <select v-model="sched.date">
            <option>2026/09/29</option><option>2026/09/30</option><option>2026/10/01</option>
          </select>
          <Icon name="chevron" :size="14" class="caret" />
        </div>

        <label class="lb">預約時間 <span class="yx-new">新</span> <em>附城市脈動的等車預估</em></label>
        <div class="times">
          <button
            v-for="s in slots" :key="s.t" class="time" :class="{ on: sched.time === s.t }"
            @click="sched.time = s.t"
          >
            <b class="num">{{ s.t }}</b>
            <small class="num">等 {{ s.wait }} 分</small>
            <span v-if="s.pool" class="t-pool">有順路車</span>
          </button>
        </div>

        <button class="yx-btn" @click="confirmSchedule">確定</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bk { top: 58px; left: 14px; width: 42px; height: 42px; }
.addr { position: absolute; z-index: 600; display: flex; align-items: center; background: #fff; box-shadow: 0 2px 8px rgba(5,17,34,.2); }
.addr.pick { top: 116px; left: 0; }
.addr.drop { top: 190px; left: 12px; }
.sq { width: 32px; align-self: stretch; display: grid; place-items: center; flex-shrink: 0; }
.sq.red { background: var(--yx-red); }
.sq.red i { width: 11px; height: 11px; border-radius: 50%; background: #fff; }
.sq.navy { background: var(--yx-navy); color: #fff; flex-direction: column; padding: 3px 0; line-height: 1; }
.sq.navy b { font-size: 15px; font-weight: 700; }
.sq.navy small { font-size: 8px; }
.a-t { padding: 7px 8px 7px 10px; font-size: 13px; color: var(--yx-ink); white-space: nowrap; }
.pen { color: var(--yx-red); margin-right: 10px; flex-shrink: 0; }

.panel { padding-bottom: 24px; display: flex; flex-direction: column; max-height: 64%; }
.tabs { display: flex; gap: 7px; padding: 0 14px 10px; flex-shrink: 0; }
.tab { height: 38px; padding: 0 13px; border-radius: 4px; border: 1px solid var(--yx-line); background: #fff; font-size: 14px; color: var(--yx-ink); white-space: nowrap; }
.tab.on { border: 2px solid var(--yx-navy); font-weight: 600; }
.tab.wide { font-size: 13px; padding: 0 10px; }
.tab.pool { display: inline-flex; align-items: center; gap: 5px; }

.meet { display: flex; align-items: center; gap: 10px; margin: 0 14px 10px; padding: 9px 11px; border-radius: 8px; background: var(--yx-field); text-align: left; flex-shrink: 0; }
.m-ic { width: 30px; height: 30px; border-radius: 50%; background: var(--yx-red); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.m-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.m-t b { font-size: 13px; color: var(--yx-ink); }
.m-t small { font-size: 11px; color: var(--yx-ink2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-go { display: flex; align-items: center; gap: 1px; font-size: 11px; font-weight: 700; color: var(--yx-red); flex-shrink: 0; }

.cars { overflow-y: auto; padding: 0 14px; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; }
.cars::-webkit-scrollbar { display: none; }
.car { display: flex; align-items: center; gap: 4px; padding: 8px 12px 8px 4px; border: 1px solid var(--yx-line); border-radius: 8px; background: #fff; text-align: left; }
.car.on { border: 2px solid var(--yx-navy); padding: 7px 11px 7px 3px; }
.c-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.c-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.c-top b { font-size: 16px; font-weight: 600; color: var(--yx-ink); }
.c-p { font-size: 14px; color: var(--yx-ink); white-space: nowrap; }
.c-eta { font-size: 11px; color: #98A2AE; }
.c-eta.pool { color: var(--yx-red); font-weight: 600; }
.c-d { font-size: 11px; color: var(--yx-ink3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.opts { display: flex; margin: 12px 14px 0; padding-top: 10px; border-top: 1px solid var(--yx-line2); flex-shrink: 0; }
.opts button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 12px; color: var(--yx-ink); }
.opts button + button { border-left: 1px solid var(--yx-line2); }
.cta { margin: 12px 14px 0; width: calc(100% - 28px); flex-shrink: 0; }

.scrim { position: absolute; inset: 0; background: rgba(5,17,34,.4); z-index: 900; }
.modal { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1000; background: #fff; border-radius: 10px 10px 0 0; padding: 14px 18px 26px; }
.m-x { position: absolute; top: 12px; right: 14px; color: #B9C2CC; }
.modal label { display: block; font-size: 12px; color: #98A2AE; margin: 10px 0 5px; }
.modal label.lb { display: flex; align-items: center; gap: 6px; margin-top: 16px; }
.modal label em { font-style: normal; font-size: 11px; color: var(--yx-ink2); }
.sel { position: relative; }
.sel select { width: 100%; height: 46px; padding: 0 34px 0 12px; border: none; border-radius: 2px; background: var(--yx-field); font: inherit; font-size: 16px; color: var(--yx-ink); appearance: none; }
.caret { position: absolute; right: 12px; top: 50%; transform: translateY(-50%) rotate(90deg); color: var(--yx-ink); pointer-events: none; }

.times { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.time { position: relative; padding: 8px 2px 7px; border-radius: 4px; background: var(--yx-field); display: flex; flex-direction: column; align-items: center; gap: 1px; border: 1.5px solid transparent; }
.time b { font-size: 14px; font-weight: 700; color: var(--yx-ink); }
.time small { font-size: 10px; color: var(--yx-ink2); }
.time.on { border-color: var(--yx-navy); background: #fff; }
.t-pool { position: absolute; top: -7px; right: 0; font-size: 9px; font-weight: 700; color: #fff; background: var(--yx-red); padding: 1px 4px; border-radius: 3px; white-space: nowrap; }
.times + .yx-btn { margin-top: 18px; }

.rise-enter-active, .rise-leave-active { transition: transform .26s cubic-bezier(.32,.72,0,1); }
.rise-enter-from, .rise-leave-to { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

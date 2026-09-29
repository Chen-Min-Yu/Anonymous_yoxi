<script setup>
import { computed, ref } from 'vue'
import { back, toast } from '../../store'
import { trip, cars, payments, SCHEDULE_BLOCKED, defaultSchedule } from '../../data/origin'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import CarArt from '../../components/CarArt.vue'

const mode = ref('instant') // instant | scheduled
const sched = ref({ ...defaultSchedule })
const picked = ref('any')
const pay = ref('cash')
const methods = ref([...payments])
const sheet = ref(null) // null | 'picker' | 'pay' | 'points'
const alert = ref(false)
const autoPoints = ref(false)

// 預約模式的車種比立即叫車少，且不顯示「N 分鐘後抵達」
const list = computed(() => cars.filter((c) => (mode.value === 'instant' ? c.instant : c.scheduled)))
const payName = computed(() => methods.value.find((p) => p.id === pay.value).name)

const layers = [
  { type: 'line', coords: trip.route, color: '#8C1B27', weight: 5 },
  { type: 'marker', latlng: trip.pickupLL, size: [18, 18], z: 300, html: '<div class="o-dot red"></div>' },
  { type: 'marker', latlng: trip.dropoffLL, size: [22, 28], anchor: [11, 28], z: 300, html: '<div class="o-pin navy"><span></span></div>' },
]
const fit = [[25.0318, 121.5386], [25.0344, 121.5450]]

const dates = ['2026/09/29', '2026/09/30', '2026/10/01', '2026/10/02']
const times = ['18:35', '18:50', '19:05', '19:20', '19:35', '20:00']

function openSchedule() {
  // 錄影中的規則：現金付款不能預約，會先跳出提醒要求改付款方式
  if (!methods.value.find((p) => p.id === pay.value).scheduled) return (alert.value = true)
  sheet.value = 'picker'
}
function confirmSchedule() {
  mode.value = 'scheduled'
  sheet.value = null
  if (!list.value.some((c) => c.id === picked.value)) picked.value = list.value[0].id
}
// 錄影中此帳號沒有綁卡，所以無法預約；示範時用這個按鈕補綁一張卡，流程才走得下去
function addCard() {
  if (!methods.value.some((m) => m.id === 'card')) {
    methods.value.splice(1, 0, { id: 'card', name: '信用卡 **** 4885', scheduled: true })
  }
  pay.value = 'card'
  sheet.value = null
  toast('已綁定信用卡，可以預約叫車了')
}
function choosePay(id) {
  pay.value = id
  sheet.value = null
}
</script>

<template>
  <div class="scr o">
    <RouteMap :layers="layers" :fit="fit" :padding-top="150" :padding-bottom="430" :padding="[24, 24]" />

    <button class="fab" @click="back"><Icon name="back" :size="20" /></button>
    <button class="fab nav" @click="toast('路線導覽')"><Icon name="route" :size="18" /></button>

    <!-- 地圖上的地址標籤 -->
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

    <!-- 叫車面板 -->
    <div class="panel">
      <div class="grab"></div>

      <div class="tabs">
        <button class="tab" :class="{ on: mode === 'instant' }" @click="mode = 'instant'">立即叫車</button>
        <button v-if="mode === 'instant'" class="tab" @click="openSchedule">預 約</button>
        <button v-else class="tab wide on" @click="sheet = 'picker'">{{ sched.date }} {{ sched.time }}</button>
      </div>

      <div class="cars">
        <button
          v-for="c in list" :key="c.id" class="car" :class="{ on: picked === c.id }" @click="picked = c.id"
        >
          <CarArt :art="c.art" :badge="c.badge" :size="76" />
          <div class="c-b">
            <div class="c-top">
              <b>{{ c.name }}</b>
              <span class="c-p num">{{ c.price }}</span>
            </div>
            <span v-if="mode === 'instant'" class="c-eta">{{ c.eta }}分鐘後抵達</span>
            <span class="c-d">{{ c.desc }}</span>
          </div>
        </button>
      </div>

      <div class="opts">
        <button @click="sheet = 'pay'"><Icon name="coin" :size="15" /> {{ payName }}</button>
        <button @click="sheet = 'points'"><Icon name="wallet" :size="15" /> 點數折抵</button>
        <button @click="toast('乘車需求')"><Icon name="doc" :size="15" /> 乘車需求</button>
      </div>

      <button class="cta" @click="toast(mode === 'instant' ? '已送出叫車' : `已預約 ${sched.date} ${sched.time}`)">
        確認叫車
      </button>
    </div>

    <!-- 底部彈出層 -->
    <Transition name="fade"><div v-if="sheet" class="scrim" @click="sheet = null"></div></Transition>

    <Transition name="rise">
      <div v-if="sheet === 'picker'" class="modal">
        <button class="m-x" @click="sheet = null"><Icon name="close" :size="20" /></button>
        <label>預約日期</label>
        <div class="sel">
          <select v-model="sched.date"><option v-for="d in dates" :key="d">{{ d }}</option></select>
          <Icon name="chevron" :size="14" class="caret" />
        </div>
        <label>預約時間</label>
        <div class="sel">
          <select v-model="sched.time"><option v-for="t in times" :key="t">{{ t }}</option></select>
          <Icon name="chevron" :size="14" class="caret" />
        </div>
        <button class="m-btn" @click="confirmSchedule">確定</button>
      </div>
    </Transition>

    <Transition name="rise">
      <div v-if="sheet === 'pay'" class="modal tall">
        <button class="m-x" @click="sheet = null"><Icon name="close" :size="20" /></button>
        <div class="m-t">請選擇付款方式</div>
        <div class="m-scroll">
          <div class="grp">個人</div>
          <button class="p-row" @click="addCard">
            <span class="p-add"><Icon name="plus" :size="14" /></span>
            <span class="p-n">新增付款方式
              <small><Icon name="bell" :size="11" /> 綁定支付可享更多乘車優惠唷</small>
            </span>
          </button>
          <button v-for="p in methods" :key="p.id" class="p-row" @click="choosePay(p.id)">
            <span class="p-rd" :class="{ on: pay === p.id }"><Icon v-if="pay === p.id" name="check" :size="12" :stroke="3" /></span>
            <span class="p-n">{{ p.name }}</span>
          </button>
        </div>
        <button class="m-btn" @click="sheet = null">確認</button>
      </div>
    </Transition>

    <Transition name="rise">
      <div v-if="sheet === 'points'" class="modal">
        <button class="m-x" @click="sheet = null"><Icon name="close" :size="20" /></button>
        <div class="pt-chip"><Icon name="coin" :size="14" /> 點數</div>
        <div class="pt-h">綁定點數，享更多優惠</div>
        <button class="pt-row" @click="toast('和泰 Points')">
          <Icon name="coin" :size="16" /> 和泰 Points
          <Icon name="chevron" :size="14" class="caret" />
        </button>
        <label class="pt-chk" @click="autoPoints = !autoPoints">
          <span class="box" :class="{ on: autoPoints }"><Icon v-if="autoPoints" name="check" :size="11" :stroke="3" /></span>
          自動折抵車資
        </label>
        <div class="pt-note">1 點 = 1 元，單筆最高折抵 50 點</div>
        <button class="m-btn" @click="sheet = null">確定</button>
      </div>
    </Transition>

    <!-- 現金不能預約的提醒 -->
    <Transition name="fade">
      <div v-if="alert" class="alert-wrap">
        <div class="alert">
          <p>{{ SCHEDULE_BLOCKED }}</p>
          <button @click="alert = false; sheet = 'pay'">我知道了</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.o { background: #EDEDED; }
.fab { position: absolute; top: 58px; left: 14px; z-index: 600; width: 42px; height: 42px; border-radius: 50%; background: #0B1F36; color: #fff; display: grid; place-items: center; box-shadow: 0 3px 10px rgba(5,17,34,.3); }
.fab.nav { left: auto; right: 14px; top: 132px; background: #fff; color: #0B1F36; }

.addr { position: absolute; z-index: 600; display: flex; align-items: center; background: #fff; box-shadow: 0 2px 8px rgba(5,17,34,.2); }
.addr.pick { top: 116px; left: 0; }
.addr.drop { top: 190px; left: 12px; }
.sq { width: 32px; align-self: stretch; display: grid; place-items: center; flex-shrink: 0; }
.sq.red { background: #D8303C; }
.sq.red i { width: 11px; height: 11px; border-radius: 50%; background: #fff; }
.sq.navy { background: #0B1F36; color: #fff; flex-direction: column; padding: 3px 0; line-height: 1; }
.sq.navy b { font-size: 15px; font-weight: 700; }
.sq.navy small { font-size: 8px; }
.a-t { padding: 7px 8px 7px 10px; font-size: 13px; color: #1C2430; white-space: nowrap; }
.pen { color: #D8303C; margin-right: 10px; flex-shrink: 0; }

.panel { position: absolute; left: 0; right: 0; bottom: 0; z-index: 700; background: #fff; border-radius: 16px 16px 0 0; padding: 0 0 24px; box-shadow: 0 -6px 22px rgba(5,17,34,.14); display: flex; flex-direction: column; max-height: 62%; }
.grab { width: 40px; height: 4px; border-radius: 2px; background: #D8DEE5; margin: 8px auto 10px; flex-shrink: 0; }
.tabs { display: flex; gap: 10px; padding: 0 14px 10px; flex-shrink: 0; }
.tab { height: 38px; padding: 0 18px; border-radius: 4px; border: 1px solid #DCE2E9; background: #fff; font-size: 15px; font-weight: 500; color: #1C2430; }
.tab.on { border: 2px solid #0B1F36; font-weight: 600; }
.tab.wide { padding: 0 14px; font-size: 14px; }

.cars { overflow-y: auto; padding: 0 14px; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; }
.cars::-webkit-scrollbar { display: none; }
.car { display: flex; align-items: center; gap: 4px; padding: 8px 12px 8px 4px; border: 1px solid #E3E8EE; border-radius: 8px; background: #fff; text-align: left; }
.car.on { border: 2px solid #0B1F36; padding: 7px 11px 7px 3px; }
.c-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.c-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.c-top b { font-size: 16px; font-weight: 600; color: #1C2430; }
.c-p { font-size: 14px; font-weight: 500; color: #1C2430; white-space: nowrap; }
.c-eta { font-size: 11px; color: #98A2AE; }
.c-d { font-size: 11px; color: #A8B1BC; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.opts { display: flex; margin: 12px 14px 0; padding-top: 10px; border-top: 1px solid #EDF1F5; flex-shrink: 0; }
.opts button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 12px; color: #1C2430; }
.opts button + button { border-left: 1px solid #EDF1F5; }
.cta { height: 50px; margin: 12px 14px 0; border-radius: 4px; background: #0B1F36; color: #fff; font-size: 17px; font-weight: 600; flex-shrink: 0; }

.scrim { position: absolute; inset: 0; background: rgba(5,17,34,.4); z-index: 900; }
.modal { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1000; background: #fff; border-radius: 10px 10px 0 0; padding: 14px 18px 26px; }
.modal.tall { max-height: 74%; display: flex; flex-direction: column; }
.m-x { position: absolute; top: 12px; right: 14px; color: #B9C2CC; }
.m-t { font-size: 18px; font-weight: 600; color: #1C2430; margin: 4px 0 18px; }
.m-scroll { overflow-y: auto; scrollbar-width: none; }
.m-scroll::-webkit-scrollbar { display: none; }
.modal label { display: block; font-size: 12px; color: #98A2AE; margin: 12px 0 5px; }
.sel { position: relative; }
.sel select { width: 100%; height: 48px; padding: 0 34px 0 12px; border: none; border-radius: 2px; background: #F0F6F9; font: inherit; font-size: 17px; color: #1C2430; appearance: none; }
.caret { position: absolute; right: 12px; top: 50%; transform: translateY(-50%) rotate(90deg); color: #1C2430; pointer-events: none; }
.m-btn { width: 100%; height: 48px; margin-top: 20px; border-radius: 3px; background: #0B1F36; color: #fff; font-size: 16px; font-weight: 600; flex-shrink: 0; }

.grp { font-size: 13px; color: #6B7684; padding: 4px 0 10px; border-bottom: 1px solid #EDF1F5; }
.p-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 13px 0; border-bottom: 1px solid #EDF1F5; text-align: left; }
.p-add { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #6B7684; color: #6B7684; display: grid; place-items: center; flex-shrink: 0; }
.p-rd { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #C8D0D9; display: grid; place-items: center; flex-shrink: 0; color: #fff; }
.p-rd.on { background: #0B1F36; border-color: #0B1F36; }
.p-n { font-size: 15px; color: #1C2430; display: flex; flex-direction: column; gap: 3px; }
.p-n small { font-size: 11px; color: #D8303C; display: flex; align-items: center; gap: 4px; }

.pt-chip { display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 10px; border-radius: 13px; background: #0B1F36; color: #fff; font-size: 12px; font-weight: 600; }
.pt-h { font-size: 13px; color: #6B7684; margin: 14px 0 10px; }
.pt-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 0; border-bottom: 1px solid #EDF1F5; font-size: 15px; color: #1C2430; }
.pt-row .caret { position: static; transform: rotate(0); margin-left: auto; color: #B9C2CC; }
.pt-chk { display: flex; align-items: center; gap: 9px; padding: 14px 0 6px; font-size: 14px; color: #1C2430; cursor: pointer; }
.box { width: 17px; height: 17px; border-radius: 2px; border: 1.5px solid #C8D0D9; display: grid; place-items: center; color: #fff; }
.box.on { background: #0B1F36; border-color: #0B1F36; }
.pt-note { font-size: 12px; color: #98A2AE; padding-left: 26px; }

.alert-wrap { position: absolute; inset: 0; z-index: 1100; background: rgba(5,17,34,.4); display: grid; place-items: center; padding: 0 30px; }
.alert { background: #fff; border-radius: 4px; width: 100%; }
.alert p { font-size: 16px; line-height: 1.7; color: #1C2430; padding: 24px 20px 20px; }
.alert button { width: calc(100% - 32px); height: 46px; margin: 0 16px 16px; border-radius: 3px; background: #0B1F36; color: #fff; font-size: 16px; font-weight: 600; }

.rise-enter-active, .rise-leave-active { transition: transform .26s cubic-bezier(.32,.72,0,1); }
.rise-enter-from, .rise-leave-to { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<style>
.o-dot.red { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 5px solid #D8303C; box-sizing: border-box; box-shadow: 0 1px 4px rgba(5,17,34,.35); }
.o-pin.navy { width: 22px; height: 28px; position: relative; }
.o-pin.navy::before { content: ''; position: absolute; inset: 0 0 5px 0; border-radius: 50%; background: #0B1F36; }
.o-pin.navy::after { content: ''; position: absolute; left: 9px; bottom: 0; width: 4px; height: 8px; background: #0B1F36; }
.o-pin.navy span { position: absolute; left: 7px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: #fff; z-index: 1; }
</style>

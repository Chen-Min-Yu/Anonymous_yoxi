<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { store, flows, go, step, switchRole } from './store'
import Icon from './components/Icon.vue'
import YoxiLogo from './components/YoxiLogo.vue'
import StatusBar from './components/StatusBar.vue'

import Fare from './screens/passenger/Fare.vue'
import Meetup from './screens/passenger/Meetup.vue'
import Ride from './screens/passenger/Ride.vue'
import Done from './screens/passenger/Done.vue'
import Circle from './screens/passenger/Circle.vue'
import Enterprise from './screens/passenger/Enterprise.vue'
import Pulse from './screens/passenger/Pulse.vue'
import Forecast from './screens/passenger/Forecast.vue'
import Atlas from './screens/passenger/Atlas.vue'
import DHome from './screens/driver/DriverHome.vue'
import DOffer from './screens/driver/DriverOffer.vue'
import DTrip from './screens/driver/DriverTrip.vue'
import DEarn from './screens/driver/DriverEarn.vue'
import OHome from './screens/origin/OriginHome.vue'
import ODest from './screens/origin/OriginDest.vue'
import OBook from './screens/origin/OriginBook.vue'
import OTrips from './screens/origin/OriginTrips.vue'
import MHome from './screens/merged/MergedHome.vue'
import MBook from './screens/merged/MergedBook.vue'
import MPool from './screens/merged/MergedPool.vue'

const screens = {
  fare: Fare, meetup: Meetup, ride: Ride,
  done: Done, circle: Circle, enterprise: Enterprise, pulse: Pulse, forecast: Forecast, atlas: Atlas,
  'd-home': DHome, 'd-offer': DOffer, 'd-trip': DTrip, 'd-earn': DEarn,
  'o-home': OHome, 'o-dest': ODest, 'o-book': OBook, 'o-trips': OTrips,
  'm-home': MHome, 'm-book': MBook, 'm-pool': MPool,
}

const current = computed(() => screens[store.screen])
const darkStatus = computed(() => ['d-home', 'd-earn', 'done', 'o-trips'].includes(store.screen))
const solidStatus = computed(() => ['pulse', 'forecast', 'fare', 'circle', 'atlas', 'enterprise'].includes(store.screen))
const presenting = ref(false)
const list = computed(() => flows[store.role])
const idx = computed(() => list.value.findIndex((s) => s.id === store.screen))

function onKey(e) {
  if (e.target.tagName === 'INPUT') return
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'p' || e.key === 'P') presenting.value = !presenting.value
  else if (e.key === 'd' || e.key === 'D') switchRole(store.role === 'passenger' ? 'driver' : 'passenger')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="stage" :class="{ presenting }">
    <aside class="panel">
      <div class="brand">
        <YoxiLogo :height="26" />
        <div class="brand-sub">
          <b>順路圈</b>
          <span>RideTogether 互動原型</span>
        </div>
      </div>
      <p class="pitch">不搭車，也打開 yoxi。城市脈動每天告訴你各區叫車要等多久、幾點出門最好；需要出門時，順路圈幫你找到同路線夥伴，集合點上車，車資逐段透明分攤。</p>

      <div class="seg" role="tablist">
        <button :class="{ on: store.role === 'passenger' }" @click="switchRole('passenger')">
          <Icon name="user" :size="16" /> 乘客端
        </button>
        <button :class="{ on: store.role === 'driver' }" @click="switchRole('driver')">
          <Icon name="car" :size="16" /> 司機端
        </button>
        <button :class="{ on: store.role === 'origin' }" @click="switchRole('origin')">
          <Icon name="phone" :size="16" /> yoxi 現況
        </button>
      </div>
      <p v-if="store.role === 'origin'" class="origin-note">
        依 2026/09/29 yoxi App 實機錄影還原的現行預約叫車流程，作為提案前後對照用。
      </p>
      <p v-else-if="store.role === 'passenger'" class="origin-note">
        沿用 yoxi 現行介面的版面、配色與叫車動線，標 <span class="yx-new">新</span> 的是提案新增的部分。
      </p>

      <ol class="flow">
        <li v-for="(s, i) in list" :key="s.id" :class="{ on: s.id === store.screen, past: i < idx }" @click="go(s.id)">
          <span class="n num">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="txt">
            <b>{{ s.title }}</b>
            <small v-if="s.id === store.screen">{{ s.desc }}</small>
          </span>
        </li>
      </ol>

      <div class="keys">
        <span><kbd>←</kbd><kbd>→</kbd> 切換步驟</span>
        <span><kbd>D</kbd> 切換身分</span>
        <span><kbd>P</kbd> 錄影模式</span>
      </div>
    </aside>

    <main class="phone-wrap">
      <div class="phone">
        <div class="island"></div>
        <div class="screen">
          <StatusBar :dark="darkStatus" :solid="solidStatus" />
          <Transition :name="store.direction === 'back' ? 'slide-back' : 'slide'">
            <component :is="current" :key="store.screen" />
          </Transition>
          <Transition name="toast">
            <div v-if="store.toast" class="toast">{{ store.toast }}</div>
          </Transition>
          <div class="home-ind"></div>
        </div>
      </div>
      <div class="step-ctrl">
        <button class="sc" :disabled="idx <= 0" @click="step(-1)"><Icon name="back" :size="18" /></button>
        <span class="num">{{ idx + 1 }} / {{ list.length }}</span>
        <button class="sc" :disabled="idx >= list.length - 1" @click="step(1)"><Icon name="chevron" :size="18" /></button>
        <button class="sc wide" @click="presenting = !presenting">{{ presenting ? '顯示面板' : '錄影模式' }}</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.stage {
  min-height: 100%; display: grid; grid-template-columns: 340px 1fr; gap: 24px;
  padding: 28px 40px; max-width: 1180px; margin: 0 auto; align-items: center;
}
.stage.presenting { grid-template-columns: 1fr; }
.stage.presenting .panel { display: none; }
.panel { align-self: center; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand-sub { display: flex; flex-direction: column; border-left: 1.5px solid var(--line); padding-left: 14px; line-height: 1.25; }
.brand-sub b { font-size: 17px; font-weight: 900; }
.brand-sub span { font-size: 12px; color: var(--ink-3); font-weight: 500; }
.pitch { margin: 18px 0 22px; font-size: 14px; line-height: 1.8; color: var(--ink-2); }

.seg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #fff; border-radius: 14px; padding: 4px; box-shadow: var(--shadow-card); }
.seg button { height: 40px; border-radius: 10px; font-size: 13px; font-weight: 700; color: var(--ink-3); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s; }
.seg button.on { background: var(--navy); color: #fff; }

.origin-note { font-size: 12px; line-height: 1.9; color: var(--ink-3); margin: 10px 2px 0; }
.origin-note .yx-new { background: #D8303C; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 10px; font-weight: 700; }
.flow { list-style: none; margin: 18px 0 0; }
.flow li { display: grid; grid-template-columns: 34px 1fr; gap: 8px; padding: 7px 12px; border-radius: 12px; cursor: pointer; transition: background .15s; position: relative; }
.flow li:hover { background: rgba(255,255,255,.6); }
.flow li.on { background: #fff; box-shadow: var(--shadow-card); }
.flow li.on::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 3px; background: var(--red); }
.flow .n { font-size: 12px; font-weight: 700; color: var(--ink-3); padding-top: 2px; }
.flow li.on .n { color: var(--red); }
.flow li.past .n { color: var(--navy); }
.flow .txt { display: flex; flex-direction: column; }
.flow b { font-size: 14px; font-weight: 700; }
.flow small { font-size: 12px; color: var(--ink-3); line-height: 1.5; }

.keys { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 18px; font-size: 12px; color: var(--ink-3); }
kbd { display: inline-block; min-width: 20px; padding: 1px 5px; margin-right: 3px; border-radius: 5px; background: #fff; border: 1px solid var(--line); font-family: var(--num); font-size: 11px; text-align: center; color: var(--ink-2); }

.phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.phone {
  width: 390px; height: 844px; border-radius: 56px; padding: 12px; background: #0b0f16; position: relative;
  box-shadow: 0 0 0 2px #2a303a, 0 40px 80px -30px rgba(5,17,34,.55), inset 0 0 0 1.5px #3a414d;
  flex-shrink: 0;
}
.island { position: absolute; top: 23px; left: 50%; transform: translateX(-50%); width: 118px; height: 34px; border-radius: 20px; background: #000; z-index: 2000; }
.screen { position: relative; width: 100%; height: 100%; border-radius: 44px; overflow: hidden; background: var(--bg); isolation: isolate; }
.home-ind { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 130px; height: 5px; border-radius: 3px; background: var(--navy); z-index: 1500; opacity: .85; pointer-events: none; }
.home-ind.light { background: #fff; }

.toast {
  position: absolute; left: 50%; bottom: 110px; transform: translateX(-50%); z-index: 1800;
  background: var(--navy); color: #fff; font-size: 13px; font-weight: 500; padding: 10px 16px; border-radius: 12px; white-space: nowrap;
  box-shadow: var(--shadow-float);
}
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }

.step-ctrl { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink-3); font-weight: 600; }
.sc { height: 34px; min-width: 34px; border-radius: 10px; background: #fff; box-shadow: var(--shadow-card); display: grid; place-items: center; color: var(--navy); }
.sc:disabled { opacity: .35; cursor: default; }
.sc.wide { padding: 0 12px; font-size: 12px; font-weight: 700; }
.presenting .step-ctrl { opacity: 0; transition: opacity .2s; }
.presenting .step-ctrl:hover { opacity: 1; }

@media (max-width: 900px) {
  .stage { grid-template-columns: 1fr; padding: 20px 16px; }
  .panel { order: 2; }
}
@media (max-height: 900px) {
  .phone { transform: scale(calc((100vh - 90px) / 844)); transform-origin: top center; margin-bottom: calc((100vh - 90px) - 844px); }
}
</style>

<style>
.slide-enter-active, .slide-leave-active, .slide-back-enter-active, .slide-back-leave-active {
  transition: transform .42s cubic-bezier(.32,.72,0,1), opacity .42s ease;
}
.slide-enter-from { transform: translateX(100%); }
.slide-leave-to { transform: translateX(-28%); opacity: .6; }
.slide-back-enter-from { transform: translateX(-28%); opacity: .6; }
.slide-back-leave-to { transform: translateX(100%); }
.slide-enter-active, .slide-back-leave-active { z-index: 2; box-shadow: -10px 0 30px rgba(5,17,34,.12); }
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { go } from '../../store'
import { routes, driver, split } from '../../data/scenario'
import { meetPin, carPin } from '../../components/mapkit'
import { slots, cellsFor, demandBinOf, dotRadius, HOTSPOT_MIN } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import TabBar from '../../components/TabBar.vue'

const online = ref(true)
const incoming = ref(false)
let timer
onMounted(() => (timer = setTimeout(() => (incoming.value = true), 2200)))
onBeforeUnmount(() => clearTimeout(timer))

// 與乘客端城市脈動共用同一套需求資料：點越大越深，代表該區叫車越多
const demand = cellsFor(slots[0])
  .filter((c) => c.per_day >= HOTSPOT_MIN)
  .map((c) => ({
    type: 'dot', latlng: c.ll, radius: dotRadius(c.per_day),
    fill: demandBinOf(c.per_day).color, fillOpacity: 0.75, weight: 1.5,
  }))
const layers = [
  ...demand,
  { type: 'line', coords: routes.soloB, color: '#F14A42', weight: 9, opacity: 0.25 },
  { type: 'line', coords: routes.soloC_full, color: '#F14A42', weight: 9, opacity: 0.25 },
  { type: 'line', coords: [...routes.shared3, ...routes.shared2], color: '#F14A42', weight: 9, opacity: 0.7 },
  meetPin('需求熱點'),
  carPin(routes.approach[0]),
]
const fit = [...routes.approach, ...routes.shared3]
</script>

<template>
  <div class="scr">
    <header class="dh">
      <div class="dh-top">
        <div class="avatar" style="background: var(--red)">王</div>
        <div class="dh-name">
          <b>{{ driver.name }}</b>
          <span class="num">{{ driver.plate }} · <Icon name="star" :size="11" /> {{ driver.rating }}</span>
        </div>
        <button class="toggle" :class="{ on: online }" @click="online = !online">
          <i></i>{{ online ? '上線中' : '休息中' }}
        </button>
      </div>
      <div class="earn">
        <div>
          <span>今日收入</span>
          <b class="num">$2,860</b>
        </div>
        <div class="bonus">
          <div class="bn-h"><span>共乘效率獎金</span><b class="num">3 / 5 趟</b></div>
          <div class="bn-bar"><i style="width: 60%"></i></div>
          <small>再 2 趟共乘單，加發 $150</small>
        </div>
      </div>
    </header>

    <div class="map-area">
      <RouteMap :layers="layers" :fit="fit" :padding-top="120" :padding-bottom="200" />
      <div class="ai-tip">
        <span class="ai-ic"><Icon name="sparkle" :size="16" /></span>
        <div>
          <b>08:00–09:00 民生社區往內湖走廊需求高</b>
          <small>共用城市脈動預測 · 預估 14 張共乘單</small>
        </div>
      </div>

      <Transition name="rise">
        <button v-if="incoming && online" class="offer" @click="go('d-offer')">
          <span class="of-badge">共乘派單</span>
          <div class="of-main">
            <div>
              <b>3 位乘客 · 1 個集合點</b>
              <small>民生敦化路口 → 內湖科學園區</small>
            </div>
            <div class="of-p">
              <b class="num">${{ split.totalFare + driver.poolBonus }}</b>
              <small>含獎金</small>
            </div>
          </div>
          <span class="of-go">查看派單 <Icon name="arrow" :size="16" /></span>
        </button>
      </Transition>
    </div>
    <TabBar driver active="d-home" />
  </div>
</template>

<style scoped>
.dh { background: var(--navy); color: #fff; padding: 58px 16px 16px; flex-shrink: 0; position: relative; z-index: 600; border-radius: 0 0 22px 22px; }
.dh-top { display: flex; align-items: center; gap: 10px; }
.dh-name { flex: 1; display: flex; flex-direction: column; line-height: 1.3; }
.dh-name b { font-size: 16px; }
.dh-name span { font-size: 12px; opacity: .7; display: flex; align-items: center; gap: 3px; }
.toggle { display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 12px 0 8px; border-radius: 99px; background: rgba(255,255,255,.12); color: #fff; font-size: 13px; font-weight: 700; }
.toggle i { width: 18px; height: 18px; border-radius: 50%; background: var(--steel); transition: background .2s; }
.toggle.on i { background: #3ecf8e; box-shadow: 0 0 0 4px rgba(62,207,142,.25); }
.earn { display: flex; gap: 14px; margin-top: 14px; align-items: stretch; }
.earn > div:first-child { display: flex; flex-direction: column; justify-content: center; }
.earn span { font-size: 12px; opacity: .7; }
.earn > div > b { font-size: 30px; font-weight: 800; line-height: 1.1; }
.bonus { flex: 1; background: rgba(255,255,255,.08); border-radius: 14px; padding: 10px 12px; }
.bn-h { display: flex; justify-content: space-between; font-size: 12px; }
.bn-h span { opacity: .8; }
.bn-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,.15); margin: 7px 0 5px; overflow: hidden; }
.bn-bar i { display: block; height: 100%; background: var(--red); border-radius: 3px; }
.bonus small { font-size: 11px; opacity: .75; }

.map-area { position: relative; flex: 1; margin-top: -22px; }
.ai-tip { position: absolute; top: 34px; left: 12px; right: 12px; z-index: 500; background: #fff; border-radius: 14px; padding: 10px 12px; display: flex; gap: 10px; align-items: center; box-shadow: var(--shadow-float); }
.ai-ic { width: 32px; height: 32px; border-radius: 10px; background: var(--red-soft); color: var(--red); display: grid; place-items: center; flex-shrink: 0; }
.ai-tip b { font-size: 13px; display: block; }
.ai-tip small { font-size: 12px; color: var(--ink-3); }

.offer { position: absolute; left: 12px; right: 12px; bottom: 14px; z-index: 600; background: #fff; border-radius: 20px; padding: 14px; text-align: left; box-shadow: 0 20px 44px -10px rgba(5,17,34,.45); border: 2px solid var(--red); }
.of-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #fff; background: var(--red); padding: 3px 9px; border-radius: 99px; animation: blink 1.2s infinite; }
@keyframes blink { 50% { opacity: .6; } }
.of-main { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; }
.of-main b { font-size: 17px; display: block; }
.of-main small { font-size: 12px; color: var(--ink-3); }
.of-p { text-align: right; }
.of-p b { font-size: 28px; font-weight: 800; color: var(--red); line-height: 1.05; }
.of-go { display: flex; align-items: center; justify-content: center; gap: 4px; height: 42px; border-radius: 12px; background: var(--navy); color: #fff; font-size: 14px; font-weight: 700; margin-top: 12px; }
.rise-enter-active { transition: all .5s cubic-bezier(.2,.9,.3,1.15); }
.rise-enter-from { transform: translateY(120%); opacity: 0; }
</style>

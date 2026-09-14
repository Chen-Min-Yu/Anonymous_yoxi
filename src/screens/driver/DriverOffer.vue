<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { back, go, toast } from '../../store'
import { driver, split } from '../../data/scenario'
import { lines, meetPin, dropPin, carPin, riders, routes, allRoute } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const TOTAL = 20
const left = ref(TOTAL)
let iv
onMounted(() => (iv = setInterval(() => (left.value = Math.max(0, left.value - 1)), 1000)))
onBeforeUnmount(() => clearInterval(iv))
const dash = computed(() => 2 * Math.PI * 22 * (left.value / TOTAL))

const layers = [
  lines.approach, lines.shared3, lines.shared2, lines.soloC,
  meetPin('3 人'),
  dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
  carPin(routes.approach[0]),
]
const fit = [...routes.approach, ...allRoute]
const income = split.totalFare + driver.poolBonus
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap :layers="layers" :fit="fit" :padding-top="110" :padding-bottom="10" />
      <div class="top">
        <button class="fab" @click="back"><Icon name="back" /></button>
        <div class="legend">
          <span><i class="lg ap"></i>前往集合點</span>
          <span><i class="lg sh"></i>共乘路段</span>
        </div>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="inner">
        <div class="s-top">
          <div>
            <span class="chip chip-red">共乘派單</span>
            <div class="h2 title">一次接 3 位，只停 1 個點</div>
          </div>
          <div class="ring">
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="#DFE4ED" stroke-width="5" />
              <circle cx="27" cy="27" r="22" fill="none" stroke="#F14A42" stroke-width="5" stroke-linecap="round"
                :stroke-dasharray="`${dash} 999`" transform="rotate(-90 27 27)" style="transition: stroke-dasharray 1s linear" />
            </svg>
            <b class="num">{{ left }}</b>
          </div>
        </div>

        <div class="money">
          <div class="m-main">
            <span>本單收入</span>
            <b class="num">${{ income }}</b>
          </div>
          <div class="m-break">
            <div><span>跳表車資（三人合計）</span><b class="num">${{ split.totalFare }}</b></div>
            <div class="bonus"><span>共乘效率獎金</span><b class="num">+${{ driver.poolBonus }}</b></div>
            <div class="vs"><span>同時段一般單平均</span><b class="num">${{ driver.soloEquivalent }}</b></div>
          </div>
        </div>

        <div class="facts">
          <div><Icon name="car" :size="18" /><b class="num">1.3 km</b><span>到集合點</span></div>
          <div><Icon name="route" :size="18" /><b class="num">7.3 km</b><span>共乘里程</span></div>
          <div class="good"><Icon name="target" :size="18" /><b class="num">-3.4 km</b><span>比逐一接送少繞</span></div>
        </div>

        <div class="drops">
          <span class="d-l">下車順序</span>
          <span class="d-i"><i>1</i>洲子街</span>
          <Icon name="chevron" :size="12" class="muted" />
          <span class="d-i"><i>2</i>瑞光路</span>
          <Icon name="chevron" :size="12" class="muted" />
          <span class="d-i"><i>3</i>港墘路</span>
        </div>

        <div class="acts">
          <button class="btn btn-ghost" @click="toast('已略過，本單不影響接單率'); back()">略過</button>
          <button class="btn btn-red" @click="go('d-trip')">接受共乘單</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-area { position: relative; flex: 1; }
.top { position: absolute; top: 56px; left: 14px; right: 14px; display: flex; align-items: center; gap: 10px; z-index: 600; }
.fab { width: 40px; height: 40px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-float); display: grid; place-items: center; }
.legend { display: flex; gap: 12px; background: rgba(255,255,255,.95); padding: 8px 12px; border-radius: 99px; box-shadow: var(--shadow-card); font-size: 11px; font-weight: 700; color: var(--ink-2); }
.legend span { display: flex; align-items: center; gap: 5px; }
.lg { width: 16px; height: 4px; border-radius: 2px; }
.lg.ap { background: repeating-linear-gradient(90deg, var(--steel) 0 4px, transparent 4px 7px); }
.lg.sh { background: var(--blue); }

.sheet { margin-top: -24px; flex-shrink: 0; }
.inner { padding: 6px 18px 30px; }
.s-top { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 19px; font-weight: 900; margin-top: 6px; }
.ring { position: relative; width: 54px; height: 54px; }
.ring b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; font-weight: 800; }

.money { display: flex; gap: 12px; margin-top: 12px; background: var(--navy); color: #fff; border-radius: 16px; padding: 12px 14px; }
.m-main { display: flex; flex-direction: column; justify-content: center; padding-right: 12px; border-right: 1px solid rgba(255,255,255,.15); }
.m-main span { font-size: 12px; opacity: .7; }
.m-main b { font-size: 34px; font-weight: 800; line-height: 1.05; }
.m-break { flex: 1; display: flex; flex-direction: column; gap: 3px; font-size: 12px; }
.m-break div { display: flex; justify-content: space-between; }
.m-break span { opacity: .78; }
.m-break .bonus b { color: #ff8f89; }
.m-break .vs { border-top: 1px dashed rgba(255,255,255,.2); padding-top: 3px; opacity: .75; }

.facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.facts div { background: var(--bg); border-radius: 12px; padding: 9px 10px; display: flex; flex-direction: column; color: var(--ink-2); }
.facts b { font-size: 16px; font-weight: 800; color: var(--navy); margin-top: 3px; }
.facts span { font-size: 11px; color: var(--ink-3); }
.facts .good { background: var(--blue-soft); color: var(--blue); }
.facts .good b { color: var(--blue); }

.drops { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 13px; font-weight: 600; }
.d-l { font-size: 12px; color: var(--ink-3); margin-right: 2px; }
.d-i { display: flex; align-items: center; gap: 4px; }
.d-i i { width: 18px; height: 18px; border-radius: 5px; background: var(--navy); color: #fff; font-style: normal; font-size: 11px; display: grid; place-items: center; font-family: var(--num); }

.acts { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 14px; }
</style>

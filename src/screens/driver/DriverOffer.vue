<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { back, go, toast } from '../../store'
import { driver, places } from '../../data/scenario'
import { lines, meetPin, carPin, routes } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const TOTAL = 20
const left = ref(TOTAL)
let iv
onMounted(() => (iv = setInterval(() => (left.value = Math.max(0, left.value - 1)), 1000)))
onBeforeUnmount(() => clearInterval(iv))
const dash = computed(() => 2 * Math.PI * 22 * (left.value / TOTAL))

// 接單前資訊揭露比照單人叫車：只看得到集合點位置、距離與預計抵達時間，
// 看不到目的地、共乘里程與車資，避免司機挑單；用「共乘派單」標籤＋獎勵提示讓司機知道這是共乘單
const layers = [lines.approach, meetPin('3 人'), carPin(routes.approach[0])]
const fit = [...routes.approach, places.meetup.latlng]
const etaMin = Math.round(driver.approachSeconds / 60)
</script>

<template>
  <div class="scr">
    <div class="map-area">
      <RouteMap :layers="layers" :fit="fit" :padding-top="110" :padding-bottom="10" />
      <div class="top">
        <button class="fab" @click="back"><Icon name="back" /></button>
        <div class="legend">
          <span><i class="lg ap"></i>前往集合點</span>
        </div>
      </div>
    </div>

    <div class="bottom-sheet sheet">
      <div class="grabber"></div>
      <div class="inner">
        <div class="s-top">
          <div>
            <span class="chip chip-red">共乘派單</span>
            <span class="perk">接共乘單有額外獎勵</span>
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

        <div class="facts">
          <div><Icon name="car" :size="18" /><b class="num">1.3 km</b><span>到集合點</span></div>
          <div><Icon name="clock" :size="18" /><b class="num">{{ etaMin }} 分</b><span>預估抵達</span></div>
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

.sheet { margin-top: -24px; flex-shrink: 0; }
.inner { padding: 6px 18px 30px; }
.s-top { display: flex; justify-content: space-between; align-items: center; }
.perk { display: inline-block; margin-left: 6px; font-size: 12px; font-weight: 700; color: var(--red-deep); }
.title { font-size: 19px; font-weight: 900; margin-top: 6px; }
.ring { position: relative; width: 54px; height: 54px; }
.ring b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; font-weight: 800; }

.facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 16px; }
.facts div { background: var(--bg); border-radius: 12px; padding: 9px 10px; display: flex; flex-direction: column; color: var(--ink-2); }
.facts b { font-size: 16px; font-weight: 800; color: var(--navy); margin-top: 3px; }
.facts span { font-size: 11px; color: var(--ink-3); }

.acts { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 14px; }
</style>

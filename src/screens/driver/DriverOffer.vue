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

// 與單人叫車一致：接單前只顯示上車（集合）地點，不透露目的地與車程
const layers = [lines.approach, meetPin('3 人'), carPin(routes.approach[0])]
const fit = [...routes.approach, places.meetup.latlng]
const approachKm = (driver.approachMeters / 1000).toFixed(1)
const approachMin = Math.round(driver.approachSeconds / 60)
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

        <div class="pickup">
          <Icon name="pin" :size="20" />
          <div class="pk-c">
            <b>{{ places.meetup.name }}</b>
            <span>{{ places.meetup.sub }}</span>
          </div>
        </div>

        <div class="facts">
          <div><Icon name="car" :size="18" /><b class="num">{{ approachKm }} km</b><span>到集合點</span></div>
          <div><Icon name="clock" :size="18" /><b class="num">約 {{ approachMin }} 分</b><span>抵達時間</span></div>
          <div><Icon name="users" :size="18" /><b class="num">3 位</b><span>同點上車</span></div>
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
.title { font-size: 19px; font-weight: 900; margin-top: 6px; }
.ring { position: relative; width: 54px; height: 54px; }
.ring b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; font-weight: 800; }

.pickup { display: flex; align-items: center; gap: 10px; margin-top: 12px; background: var(--bg); border-radius: 14px; padding: 12px 14px; color: var(--red); }
.pk-c { display: flex; flex-direction: column; }
.pk-c b { font-size: 15px; font-weight: 800; color: var(--navy); }
.pk-c span { font-size: 12px; color: var(--ink-3); }

.facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.facts div { background: var(--bg); border-radius: 12px; padding: 9px 10px; display: flex; flex-direction: column; color: var(--ink-2); }
.facts b { font-size: 16px; font-weight: 800; color: var(--navy); margin-top: 3px; }
.facts span { font-size: 11px; color: var(--ink-3); }
.acts { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 14px; }
</style>

<script setup>
import { back, go, toast } from '../../store'
import { routes, places } from '../../data/scenario'
import { meetPin } from '../../components/mapkit'
import { corridor } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const layers = [
  { type: 'line', coords: routes.soloB, color: '#778AA4', weight: 7, opacity: 0.35 },
  { type: 'line', coords: routes.soloC_full, color: '#778AA4', weight: 7, opacity: 0.35 },
  { type: 'line', coords: [...routes.shared3, ...routes.shared2], color: '#F14A42', weight: 7, casing: true },
  meetPin(),
]
const fit = [...routes.shared3, ...routes.soloC_full]

const spots = [
  { name: '民生敦化路口', note: '常設集合點 · 你用過 23 次', fixed: true, walk: 6 },
  { name: '捷運中山國中站 2 號出口', note: '雨天替代點 · 8 次', walk: 9 },
  { name: '瑞光路 399 號', note: '公司下車點 · 31 次', walk: 0, drop: true },
]
const rewards = [
  { name: '7-ELEVEN 早餐組合', pts: 800, icon: 'gift' },
  { name: '下次共乘折抵 $50', pts: 500, icon: 'coin' },
  { name: '捐給城市植樹計畫', pts: 1000, icon: 'leaf' },
]
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <button class="scr-back" @click="back"><Icon name="back" :size="20" /></button>
      <div class="head pad">
        <div class="eyebrow">我的順路圈</div>
        <div class="h1">民生社區 到 內湖科學園區</div>
      </div>

      <div class="pad">
        <div class="corridor card">
          <div class="map-box">
            <RouteMap :layers="layers" :fit="fit" :interactive="false" :padding-top="40" :padding="[16, 10]" />
            <span class="map-tag chip chip-navy">你的通勤走廊</span>
          </div>
          <div class="cor-stats">
            <div><b class="num">{{ corridor.riders }}</b><span>近 90 天走廊乘客</span></div>
            <div><b class="num">{{ corridor.trips_per_weekday }}</b><span>每個平日趟數</span></div>
            <div><b class="num">{{ (corridor.dist_median_m / 1000).toFixed(1) }}<small>km</small></b><span>中位里程</span></div>
          </div>
        </div>

        <button class="atlas card" @click="go('atlas')">
          <span class="at-ic"><Icon name="map" :size="20" /></span>
          <span class="at-t"><b>我的城市版圖</b><small>已走過 12 個街區 · 9 月移動人格已生成</small></span>
          <Icon name="chevron" :size="18" class="muted" />
        </button>

        <section class="insight">
          <div class="ins-h"><Icon name="sparkle" :size="15" /> AI 通勤洞察</div>
          <p><b>週三建議改搭 08:25 班</b>，一樣有 3 位熟識夥伴同車。</p>
          <button @click="toast('已將週三改為 08:25 班')">套用</button>
        </section>

        <section class="block">
          <div class="h2">共乘紀錄</div>
          <div class="report card">
            <div class="rp-l">
              <div class="rp-big"><span>本月省下</span><b class="num">$1,974</b></div>
              <div class="rp-row"><span>減碳</span><b class="num">6.9 kg</b></div>
              <div class="rp-row"><span>相當於</span><b>0.6 棵樹一年吸收量</b></div>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="h2">常用集合點</div>
          <p class="sub">走廊內使用次數夠多的集合點，會固定成常設上車點。</p>
          <div class="spots card">
            <div v-for="s in spots" :key="s.name" class="spot">
              <span class="sp-ic" :class="{ fixed: s.fixed, drop: s.drop }"><Icon :name="s.drop ? 'building' : 'pin'" :size="18" /></span>
              <span class="sp-t"><b>{{ s.name }}</b><small>{{ s.note }}</small></span>
              <span v-if="s.walk" class="sp-w num"><Icon name="walk" :size="13" /> {{ s.walk }} 分</span>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="block-h">
            <span class="h2">點數兌換</span>
            <span class="pts num"><Icon name="coin" :size="15" /> 1,329</span>
          </div>
          <div class="rewards">
            <button v-for="r in rewards" :key="r.name" class="rw card" @click="toast(`已兌換：${r.name}`)">
              <span class="rw-ic"><Icon :name="r.icon" :size="20" /></span>
              <b>{{ r.name }}</b>
              <span class="num">{{ r.pts }} 點</span>
            </button>
          </div>
        </section>
        <div style="height: 24px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head { padding-top: 96px; padding-bottom: 12px; }
.corridor { overflow: hidden; }
.map-box { position: relative; height: 180px; }
.map-tag { position: absolute; left: 10px; top: 10px; z-index: 500; }
.cor-stats { display: grid; grid-template-columns: repeat(3, 1fr); padding: 12px 6px; }
.cor-stats div { display: flex; flex-direction: column; align-items: center; }
.cor-stats div + div { border-left: 1px solid var(--line); }
.cor-stats b { font-size: 20px; font-weight: 800; }
.cor-stats span { font-size: 12px; color: var(--ink-3); }

.atlas { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin-top: 12px; text-align: left; }
.at-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--blue); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.at-t { flex: 1; display: flex; flex-direction: column; }
.at-t b { font-size: 14px; }
.at-t small { font-size: 12px; color: var(--ink-3); }
.insight { margin-top: 12px; background: var(--navy); color: #fff; border-radius: var(--r-md); padding: 14px 16px; }
.ins-h { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; color: #ffb3ae; }
.insight p { font-size: 14px; line-height: 1.65; margin: 6px 0 10px; }
.insight button { height: 34px; padding: 0 14px; border-radius: 10px; background: var(--red); color: #fff; font-size: 13px; font-weight: 700; }

.block { margin-top: 22px; }
.block .h2 { margin-bottom: 8px; }
.block .sub { font-size: 12px; margin: -4px 0 10px; }
.block-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.block-h .h2 { margin: 0; }

.report { display: flex; padding: 14px 16px; gap: 10px; }
.rp-l { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.rp-big span { font-size: 12px; color: var(--ink-3); display: block; }
.rp-big b { font-size: 28px; font-weight: 800; color: var(--red); line-height: 1.1; }
.rp-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-2); padding-top: 4px; border-top: 1px solid var(--line); }
.rp-row b { color: var(--navy); }

.spots { padding: 2px 14px; }
.spot { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
.spot + .spot { border-top: 1px solid var(--line); }
.sp-ic { width: 36px; height: 36px; border-radius: 10px; background: var(--bg); color: var(--ink-2); display: grid; place-items: center; }
.sp-ic.fixed { background: var(--red); color: #fff; }
.sp-ic.drop { background: var(--blue-soft); color: var(--blue); }
.sp-t { flex: 1; display: flex; flex-direction: column; }
.sp-t b { font-size: 14px; }
.sp-t small { font-size: 12px; color: var(--ink-3); }
.sp-w { font-size: 12px; color: var(--ink-2); font-weight: 600; display: flex; align-items: center; gap: 2px; }

.pts { font-size: 14px; font-weight: 800; color: var(--red); display: flex; align-items: center; gap: 4px; }
.rewards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.rw { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 10px; text-align: left; }
.rw-ic { width: 34px; height: 34px; border-radius: 10px; background: var(--red-soft); color: var(--red); display: grid; place-items: center; }
.rw b { font-size: 12px; line-height: 1.4; min-height: 34px; }
.rw span { font-size: 12px; color: var(--ink-3); font-weight: 700; }
</style>

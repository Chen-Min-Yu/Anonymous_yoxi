<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { go, toast } from '../../store'
import { user, banners } from '../../data/origin'
import { trip } from '../../data/merged'
import { areaStats } from '../../data/pulse'
import { me, split } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import YoxiLogo from '../../components/YoxiLogo.vue'

const bi = ref(0)
const timer = setInterval(() => (bi.value = (bi.value + 1) % banners.length), 3200)
onBeforeUnmount(() => clearInterval(timer))

const pulse = areaStats('now').filter((a) => ['minsheng', 'nanjing', 'neihu'].includes(a.k))
const mates = split.riders.filter((r) => !r.me)

const layers = [
  { type: 'marker', latlng: trip.pickupLL, size: [26, 34], anchor: [13, 34], z: 300, html: '<div class="o-pin"><span></span></div>' },
]
const fit = [[25.0565, 121.5486], [25.0632, 121.5572]]
</script>

<template>
  <div class="scr yx">
    <RouteMap :layers="layers" :fit="fit" :padding-top="80" :padding-bottom="470" :padding="[20, 20]" />

    <button class="yx-fab dark menu" @click="toast('側選單')"><Icon name="menu" :size="20" :stroke="2.4" /></button>
    <div class="fab-right">
      <button class="yx-fab" @click="toast('全螢幕地圖')"><Icon name="target" :size="18" /></button>
      <button class="yx-fab" @click="toast('沒有新通知')"><Icon name="bell" :size="18" /></button>
    </div>

    <div class="yx-sheet sheet">
      <div class="banner" :class="banners[bi].tone">
        <div class="b-txt">
          <b>{{ banners[bi].text }}</b>
          <span>{{ banners[bi].sub }}</span>
        </div>
        <YoxiLogo :height="14" :color="banners[bi].tone === 'cream' ? '#D8303C' : '#fff'" />
      </div>

      <div class="greet">{{ user.greeting }}，{{ user.name }}今天要去哪？</div>

      <!-- yoxi 原本的上下車點輸入，維持原樣 -->
      <div class="inputs">
        <div class="row">
          <span class="dot start"></span>
          <div class="f"><small>上車點</small><b>{{ trip.pickup }}</b></div>
          <Icon name="pencil" :size="14" class="pen" />
        </div>
        <div class="row" @click="go('m-book')">
          <span class="dot end"></span>
          <div class="f"><span class="ph">請輸入下車地點可預估車資</span></div>
          <Icon name="pencil" :size="14" class="pen" />
        </div>
      </div>

      <!-- 新增一：城市脈動。不輸入目的地也有內容可看 -->
      <button class="pulse" @click="go('pulse')">
        <div class="p-h">
          <span class="p-t"><i class="live"></i> 城市脈動 <span class="yx-new">新</span></span>
          <span class="p-more">現在各區要等多久 <Icon name="chevron" :size="12" /></span>
        </div>
        <div class="p-rows">
          <div v-for="a in pulse" :key="a.k" class="p-row">
            <span class="p-n">{{ a.name }}</span>
            <span class="p-b"><i :style="{ width: (a.wait / 10) * 100 + '%' }"></i></span>
            <b class="num">{{ a.wait }} 分</b>
          </div>
        </div>
      </button>

      <!-- 新增二：順路圈邀請。直接接到 yoxi 的叫車面板 -->
      <button class="pool" @click="go('m-book')">
        <div class="po-h">
          <span class="po-t"><Icon name="users" :size="14" /> 順路圈 <span class="yx-new">新</span></span>
          <span class="po-time">08:15 出發 · 剩 18 分可加入</span>
        </div>
        <div class="po-b">
          <div class="faces">
            <span class="fa" :style="{ background: riderColor.A }">你</span>
            <span v-for="m in mates" :key="m.id" class="fa" :style="{ background: riderColor[m.id] }">{{ m.initial }}</span>
          </div>
          <div class="po-txt">
            <b>2 位夥伴和你同一條通勤走廊</b>
            <span>走 {{ me.walk.minutes }} 分到民生敦化路口集合</span>
          </div>
          <div class="po-p">
            <b class="num">${{ me.pay }}</b>
            <s class="num">${{ me.solo }}</s>
          </div>
        </div>
      </button>

      <div class="quick">
        <button class="q-air" @click="toast('機場接送')"><Icon name="nav" :size="14" /> 機場接送</button>
        <span class="q-hint">輸入下車地點，繼續叫車</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu { top: 58px; left: 14px; }
.fab-right { position: absolute; top: 58px; right: 14px; z-index: 600; display: flex; gap: 8px; }
.fab-right .yx-fab { position: relative; }

.sheet { padding-bottom: 24px; }
.banner { height: 58px; border-radius: 16px 16px 0 0; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; }
.banner.cream { background: linear-gradient(100deg, #FBF3E2, #F6E7CF); }
.banner.red { background: linear-gradient(100deg, #E0242B, #B8161C); }
.banner.dark { background: linear-gradient(100deg, #1C2430, #0B1F36); }
.b-txt { display: flex; flex-direction: column; line-height: 1.3; }
.b-txt b { font-size: 15px; font-weight: 900; }
.b-txt span { font-size: 12px; font-weight: 700; }
.banner.cream .b-txt b { color: var(--yx-red); }
.banner.cream .b-txt span { color: #8A5A22; }
.banner.red .b-txt, .banner.dark .b-txt { color: #fff; }

.greet { font-size: 14px; color: var(--yx-ink); padding: 12px 16px 8px; }
.inputs { margin: 0 16px; border: 1px solid var(--yx-line); border-radius: 6px; }
.row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; }
.row + .row { border-top: 1px solid var(--yx-line2); }
.dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.dot.start { background: var(--yx-navy); }
.dot.end { background: var(--yx-red); }
.f { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.f small { font-size: 10px; color: #98A2AE; }
.f b { font-size: 14px; font-weight: 500; color: var(--yx-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph { font-size: 14px; color: var(--yx-ink3); }
.pen { color: var(--yx-red); flex-shrink: 0; }

.pulse { display: block; width: 100%; text-align: left; margin: 12px 16px 0; width: calc(100% - 32px); padding: 11px 12px; border: 1px solid var(--yx-line); border-radius: 8px; background: #fff; }
.p-h { display: flex; align-items: center; justify-content: space-between; }
.p-t { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--yx-ink); }
.live { width: 7px; height: 7px; border-radius: 50%; background: var(--yx-red); animation: lv 1.4s infinite; }
@keyframes lv { 50% { opacity: .25; } }
.p-more { display: flex; align-items: center; gap: 1px; font-size: 11px; color: var(--yx-ink2); }
.p-rows { margin-top: 8px; display: flex; flex-direction: column; gap: 5px; }
.p-row { display: grid; grid-template-columns: 78px 1fr 36px; align-items: center; gap: 8px; font-size: 12px; }
.p-n { color: var(--yx-ink2); }
.p-b { height: 7px; background: var(--yx-field); border-radius: 0 4px 4px 0; overflow: hidden; }
.p-b i { display: block; height: 100%; background: var(--yx-red); border-radius: 0 4px 4px 0; }
.p-row b { text-align: right; font-weight: 700; color: var(--yx-ink); }

.pool { display: block; width: calc(100% - 32px); text-align: left; margin: 8px 16px 0; padding: 11px 12px; border: 1.5px solid var(--yx-navy); border-radius: 8px; background: #fff; }
.po-h { display: flex; align-items: center; justify-content: space-between; }
.po-t { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--yx-ink); }
.po-time { font-size: 11px; color: var(--yx-ink2); }
.po-b { display: flex; align-items: center; gap: 10px; margin-top: 9px; }
.faces { display: flex; flex-shrink: 0; }
.fa { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #fff; margin-left: -7px; color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center; }
.fa:first-child { margin-left: 0; }
.po-txt { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.po-txt b { font-size: 13px; color: var(--yx-ink); }
.po-txt span { font-size: 11px; color: var(--yx-ink2); }
.po-p { text-align: right; flex-shrink: 0; line-height: 1.2; }
.po-p b { display: block; font-size: 18px; font-weight: 800; color: var(--yx-red); }
.po-p s { font-size: 11px; color: var(--yx-ink3); }

.quick { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0; }
.q-air { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: 15px; background: var(--yx-navy); color: #fff; font-size: 12px; font-weight: 600; }
.q-hint { font-size: 11px; color: var(--yx-ink3); }
</style>

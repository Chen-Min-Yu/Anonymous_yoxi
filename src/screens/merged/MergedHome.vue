<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { go, store, toast } from '../../store'
import { user, banners, menuItems } from '../../data/origin'
import { trip } from '../../data/merged'
import { areaStats, slots, cellsFor, dotRadius, demandBinOf, HOTSPOT_MIN } from '../../data/pulse'
import { me, split } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import YoxiLogo from '../../components/YoxiLogo.vue'

const bi = ref(0)
const timer = setInterval(() => (bi.value = (bi.value + 1) % banners.length), 3200)
onBeforeUnmount(() => clearInterval(timer))

const menu = ref(false)
const pulse = areaStats('now').filter((a) => ['minsheng', 'nanjing', 'neihu'].includes(a.k))
const mates = split.riders.filter((r) => !r.me)

// 移動預報改成跑馬燈，不佔版面，點了才進去看完整內容
const ticker = [
  `08:15 出發最順，門到門約 25 分`,
  `自己叫車中位等 5 分，順路共乘省 $${me.saved}`,
  `18 點內湖科學園區最難叫，10% 要等 15 分以上`,
]

// 首頁地圖直接疊上叫車熱點，不用進城市脈動也看得到。
// 首頁只畫熱點本身，非熱點不畫，避免淡色點在底圖上變成雜訊
const hotspots = cellsFor(slots[0])
  .filter((c) => c.per_day >= HOTSPOT_MIN)
  .map((c) => ({
    type: 'dot', latlng: c.ll, radius: dotRadius(c.per_day),
    fill: demandBinOf(c.per_day).color, fillOpacity: 0.85, weight: 1.5,
  }))
const layers = [
  ...hotspots,
  { type: 'marker', latlng: trip.pickupLL, size: [26, 34], anchor: [13, 34], z: 400, html: '<div class="o-pin"><span></span></div>' },
]
const fit = [[25.0495, 121.5405], [25.0665, 121.5655]]

// 側選單：把企業方案、城市版圖、我的順路圈收進來
const newItems = [
  { label: '我的順路圈', to: 'circle' },
  { label: '城市版圖', to: 'atlas' },
  { label: '企業方案', to: 'enterprise' },
]
// 從首頁的順路圈卡片進來，直接停在「順路共乘」分頁
function openPool() {
  store.bookMode = 'pool'
  go('m-book')
}
function openMenu(item) {
  menu.value = false
  go(item.to)
}
</script>

<template>
  <div class="scr yx">
    <RouteMap :layers="layers" :fit="fit" :padding-top="80" :padding-bottom="470" :padding="[16, 16]" />

    <button class="yx-fab dark menu" @click="menu = true"><Icon name="menu" :size="20" :stroke="2.4" /></button>
    <div class="fab-right">
      <button class="yx-fab" @click="toast('全螢幕地圖')"><Icon name="target" :size="18" /></button>
      <button class="yx-fab" @click="toast('沒有新通知')"><Icon name="bell" :size="18" /></button>
    </div>
    <div class="map-key">
      <span class="mk-t">叫車熱點 <span class="yx-new">新</span></span>
      <span class="mk-i"><i style="background: #9BBFDC"></i><i style="background: #5C93C2"></i><i style="background: #0C4C80"></i>越深越多人叫車</span>
    </div>

    <div class="yx-sheet sheet">
      <div class="banner" :class="banners[bi].tone">
        <div class="b-txt">
          <b>{{ banners[bi].text }}</b>
          <span>{{ banners[bi].sub }}</span>
        </div>
        <YoxiLogo :height="14" :color="banners[bi].tone === 'cream' ? '#D8303C' : '#fff'" />
      </div>

      <!-- 新增一：移動預報跑馬燈 -->
      <button class="ticker" @click="go('forecast')">
        <span class="tk-ic"><Icon name="sparkle" :size="13" /></span>
        <span class="tk-win">
          <span class="tk-track">
            <span v-for="(t, i) in [...ticker, ...ticker]" :key="i" class="tk-item">{{ t }}</span>
          </span>
        </span>
        <span class="tk-go"><Icon name="chevron" :size="13" /></span>
      </button>

      <div class="greet">{{ user.greeting }}，{{ user.name }}今天要去哪？</div>

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

      <!-- 新增二：城市脈動 -->
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

      <!-- 新增三：順路圈邀請 -->
      <button class="pool" @click="openPool">
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

    <!-- 側選單：企業方案、城市版圖、我的順路圈收在這裡 -->
    <Transition name="fade"><div v-if="menu" class="scrim" @click="menu = false"></div></Transition>
    <Transition name="drawer">
      <div v-if="menu" class="drawer">
        <div class="d-head">
          <div class="d-user">
            <span class="ava"><Icon name="user" :size="20" /></span>
            <b>{{ user.name }}</b>
            <Icon name="chevron" :size="16" />
          </div>
          <button class="d-close" @click="menu = false"><Icon name="close" :size="20" /></button>
        </div>
        <nav class="d-nav">
          <button v-for="n in newItems" :key="n.label" class="d-new" @click="openMenu(n)">
            {{ n.label }} <span class="yx-new">新</span>
          </button>
          <div class="d-sep"></div>
          <button v-for="m in menuItems" :key="m" @click="toast(m)">{{ m }}</button>
        </nav>
        <div class="d-foot">邀請好友賺招車金 <Icon name="gift" :size="14" /></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu { top: 58px; left: 14px; }
.fab-right { position: absolute; top: 58px; right: 14px; z-index: 600; display: flex; gap: 8px; }
.fab-right .yx-fab { position: relative; }
.map-key { position: absolute; top: 108px; left: 14px; z-index: 600; background: rgba(255,255,255,.94); border-radius: 8px; padding: 6px 9px; display: flex; flex-direction: column; gap: 3px; box-shadow: 0 2px 8px rgba(5,17,34,.14); }
.mk-t { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--yx-ink); }
.mk-i { display: flex; align-items: center; gap: 3px; font-size: 10px; color: var(--yx-ink2); }
.mk-i i { width: 9px; height: 9px; border-radius: 50%; }
.mk-i i:last-of-type { margin-right: 3px; }

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

.ticker { display: flex; align-items: center; gap: 8px; width: 100%; height: 34px; padding: 0 12px; background: var(--yx-field); border-bottom: 1px solid var(--yx-line2); }
.tk-ic { width: 20px; height: 20px; border-radius: 50%; background: var(--yx-red); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.tk-win { flex: 1; overflow: hidden; height: 18px; position: relative; }
.tk-track { display: flex; gap: 28px; white-space: nowrap; animation: tk 18s linear infinite; }
.tk-item { font-size: 12px; color: var(--yx-ink); line-height: 18px; }
@keyframes tk { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.tk-go { color: var(--yx-ink3); flex-shrink: 0; }

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

.pulse { display: block; text-align: left; margin: 12px 16px 0; width: calc(100% - 32px); padding: 11px 12px; border: 1px solid var(--yx-line); border-radius: 8px; background: #fff; }
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

.scrim { position: absolute; inset: 0; background: rgba(5,17,34,.35); z-index: 900; }
.drawer { position: absolute; top: 0; bottom: 0; left: 0; width: 72%; z-index: 1000; background: #DE262A; color: #fff; display: flex; flex-direction: column; padding: 52px 0 18px; }
.d-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 0 16px; }
.d-user { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; }
.ava { width: 36px; height: 36px; border-radius: 50%; background: #fff; color: #DE262A; display: grid; place-items: center; }
.d-close { color: #fff; }
.d-nav { display: flex; flex-direction: column; margin-top: 22px; overflow-y: auto; scrollbar-width: none; }
.d-nav::-webkit-scrollbar { display: none; }
.d-nav button { display: flex; align-items: center; justify-content: flex-end; gap: 7px; text-align: right; padding: 10px 22px; font-size: 15px; font-weight: 500; color: #fff; flex-shrink: 0; }
.d-nav .d-new { font-weight: 700; }
.d-nav .yx-new { background: #fff; color: #DE262A; }
.d-sep { height: 1px; background: rgba(255,255,255,.28); margin: 8px 22px; flex-shrink: 0; }
.d-foot { margin-top: auto; text-align: center; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px; padding-top: 12px; }
.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.32,.72,0,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity .28s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

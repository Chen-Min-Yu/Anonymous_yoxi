<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { go, toast } from '../../store'
import { user, trip, banners, menuItems } from '../../data/origin'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'
import YoxiLogo from '../../components/YoxiLogo.vue'

const menu = ref(false)
const bi = ref(0)
const layers = [
  {
    type: 'marker', latlng: trip.pickupLL, size: [26, 34], anchor: [13, 34], z: 300,
    html: '<div class="o-pin"><span></span></div>',
  },
]
const fit = [[25.0308, 121.5368], [25.0358, 121.5442]]

const timer = setInterval(() => (bi.value = (bi.value + 1) % banners.length), 3200)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="scr o">
    <RouteMap :layers="layers" :fit="fit" :padding-top="80" :padding-bottom="336" :padding="[20, 20]" />

    <!-- 地圖上的浮動控制項 -->
    <button class="fab menu" @click="menu = true"><Icon name="menu" :size="20" :stroke="2.4" /></button>
    <div class="fab-right">
      <button class="fab" @click="toast('全螢幕地圖')"><Icon name="target" :size="18" /></button>
      <button class="fab" @click="toast('沒有新通知')"><Icon name="bell" :size="18" /></button>
    </div>
    <button class="fab locate" @click="toast('定位到目前位置')"><Icon name="target" :size="18" /></button>

    <!-- 底部面板 -->
    <div class="sheet">
      <div class="banner" :class="banners[bi].tone">
        <div class="b-txt">
          <b>{{ banners[bi].text }}</b>
          <span>{{ banners[bi].sub }}</span>
        </div>
        <div class="b-art"><YoxiLogo :height="14" :color="banners[bi].tone === 'cream' ? '#D8303C' : '#fff'" /></div>
      </div>

      <div class="greet">{{ user.greeting }}，{{ user.name }}今天要去哪？</div>

      <div class="inputs">
        <div class="row">
          <span class="dot start"></span>
          <div class="f">
            <small>上車點</small>
            <b>{{ trip.pickup }}</b>
          </div>
          <Icon name="pencil" :size="14" class="pen" />
        </div>
        <div class="row" @click="go('o-dest')">
          <span class="dot end"></span>
          <div class="f"><span class="ph">請輸入下車地點可預估車資</span></div>
          <Icon name="pencil" :size="14" class="pen" />
        </div>
      </div>

      <div class="quick">
        <button class="q-air" @click="toast('機場接送')"><Icon name="nav" :size="14" /> 機場接送</button>
        <span class="q-hint">輸入下車地點，繼續叫車</span>
      </div>
    </div>

    <!-- 側選單 -->
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
        <div class="d-bind">
          <Icon name="bolt" :size="15" />
          <span>綁定信用卡即可開始<br />累積會員總支</span>
          <Icon name="chevron" :size="14" />
        </div>
        <nav class="d-nav">
          <button v-for="m in menuItems" :key="m" @click="m === '行程紀錄' ? (menu = false, go('o-trips')) : toast(m)">{{ m }}</button>
        </nav>
        <div class="d-foot">邀請好友賺招車金 <Icon name="gift" :size="14" /></div>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="menu" class="scrim" @click="menu = false"></div>
    </Transition>
  </div>
</template>

<style scoped>
.o { background: #EDEDED; }
.fab { position: absolute; z-index: 600; width: 40px; height: 40px; border-radius: 50%; background: #fff; box-shadow: 0 3px 10px rgba(5,17,34,.22); display: grid; place-items: center; color: #0B1F36; }
.menu { top: 58px; left: 14px; background: #0B1F36; color: #fff; }
.fab-right { position: absolute; top: 58px; right: 14px; z-index: 600; display: flex; gap: 8px; }
.fab-right .fab { position: relative; }
.locate { bottom: 342px; right: 14px; }

.sheet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 700; background: #fff; border-radius: 18px 18px 0 0; padding: 0 0 26px; box-shadow: 0 -6px 24px rgba(5,17,34,.16); }
.banner { height: 62px; border-radius: 18px 18px 0 0; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; }
.banner.cream { background: linear-gradient(100deg, #FBF3E2, #F6E7CF); }
.banner.red { background: linear-gradient(100deg, #E0242B, #B8161C); }
.banner.dark { background: linear-gradient(100deg, #1C2430, #0B1F36); }
.b-txt { display: flex; flex-direction: column; line-height: 1.3; }
.b-txt b { font-size: 15px; font-weight: 900; }
.b-txt span { font-size: 12px; font-weight: 700; }
.banner.cream .b-txt b { color: #D8303C; }
.banner.cream .b-txt span { color: #8A5A22; }
.banner.red .b-txt, .banner.dark .b-txt { color: #fff; }
.b-art { opacity: .9; }

.greet { font-size: 14px; font-weight: 500; color: #1C2430; padding: 13px 16px 9px; }
.inputs { margin: 0 16px; border: 1px solid #E3E8EE; border-radius: 6px; }
.row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; }
.row + .row { border-top: 1px solid #EDF1F5; }
.dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.dot.start { background: #0B1F36; }
.dot.end { background: #D8303C; }
.f { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.f small { font-size: 10px; color: #98A2AE; }
.f b { font-size: 14px; font-weight: 500; color: #1C2430; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph { font-size: 14px; color: #A8B1BC; }
.pen { color: #D8303C; flex-shrink: 0; }

.quick { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0; }
.q-air { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: 15px; background: #0B1F36; color: #fff; font-size: 12px; font-weight: 600; }
.q-hint { font-size: 11px; color: #A8B1BC; }

.scrim { position: absolute; inset: 0; background: rgba(5,17,34,.35); z-index: 900; }
.drawer { position: absolute; top: 0; bottom: 0; left: 0; width: 72%; z-index: 1000; background: #DE262A; color: #fff; display: flex; flex-direction: column; padding: 52px 0 18px; }
.d-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 0 16px; }
.d-user { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; }
.ava { width: 36px; height: 36px; border-radius: 50%; background: #fff; color: #DE262A; display: grid; place-items: center; }
.d-close { color: #fff; }
.d-bind { display: flex; align-items: center; gap: 8px; margin: 16px 16px 0; padding: 9px 11px; border-radius: 8px; background: rgba(255,255,255,.16); font-size: 11px; line-height: 1.4; }
.d-bind span { flex: 1; }
.d-nav { display: flex; flex-direction: column; margin-top: 18px; }
.d-nav button { text-align: right; padding: 11px 22px; font-size: 15px; font-weight: 500; color: #fff; }
.d-foot { margin-top: auto; text-align: center; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px; }
.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.32,.72,0,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity .28s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<style>
.o-pin { width: 26px; height: 34px; position: relative; }
.o-pin::before {
  content: ''; position: absolute; inset: 0 0 6px 0; border-radius: 50% 50% 50% 50% / 58% 58% 42% 42%;
  background: #0B1F36; box-shadow: 0 2px 6px rgba(5,17,34,.4);
}
.o-pin::after { content: ''; position: absolute; left: 11px; bottom: 0; width: 4px; height: 9px; background: #0B1F36; }
.o-pin span { position: absolute; left: 8px; top: 8px; width: 10px; height: 10px; border-radius: 50%; background: #fff; z-index: 1; }
</style>

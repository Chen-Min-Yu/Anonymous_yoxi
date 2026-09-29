<script setup>
import { ref } from 'vue'
import { back, go, toast } from '../../store'
import { trip } from '../../data/origin'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

// 錄影中此頁有兩個狀態：先是搜尋欄，接著切成「在地圖上設定地點」的拖曳選點
const onMap = ref(false)
const q = ref('')

const layers = [
  {
    type: 'marker', latlng: trip.dropoffLL, size: [26, 34], anchor: [13, 34], z: 300,
    html: '<div class="o-pin"><span></span></div>',
  },
]
const fit = [[25.0310, 121.5400], [25.0348, 121.5470]]
</script>

<template>
  <div class="scr o">
    <template v-if="!onMap">
      <div class="topbar">
        <button class="icon-btn" @click="back"><Icon name="back" /></button>
        <span class="t">設定下車地點</span>
        <button class="skip" @click="toast('略過')">略過</button>
      </div>

      <div class="search">
        <span class="dot end"></span>
        <input v-model="q" placeholder="您要去哪裡？" />
        <button @click="toast('拍照辨識地址')"><Icon name="camera" :size="18" /></button>
        <button @click="toast('新增常用地點')"><Icon name="plus" :size="20" /></button>
      </div>

      <button class="on-map" @click="onMap = true">
        <span class="om-ic"><Icon name="pin" :size="16" /></span>
        在地圖上設定地點
      </button>
      <div class="rest"></div>
    </template>

    <template v-else>
      <RouteMap :layers="layers" :fit="fit" :padding-top="70" :padding-bottom="150" :padding="[20, 20]" />
      <button class="fab" @click="onMap = false"><Icon name="back" :size="20" /></button>
      <button class="fab locate" @click="toast('定位到目前位置')"><Icon name="target" :size="18" /></button>

      <div class="confirm">
        <div class="c-t">設定下車地點</div>
        <div class="c-a">台北市{{ trip.dropoff }}</div>
        <button class="c-btn" @click="go('o-book')">確認下車地點</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.o { background: #fff; }
.topbar { margin-top: 50px; padding: 0 8px 0 12px; }
.topbar .t { margin-right: 0; }
.skip { font-size: 14px; color: #6B7684; padding: 0 8px; }

.search { display: flex; align-items: center; gap: 10px; margin: 6px 16px 0; padding: 8px 4px 10px; border-bottom: 1px solid #E3E8EE; }
.dot.end { width: 11px; height: 11px; border-radius: 50%; background: #D8303C; flex-shrink: 0; }
.search input { flex: 1; border: none; outline: none; font: inherit; font-size: 15px; color: #1C2430; background: none; }
.search input::placeholder { color: #A8B1BC; }
.search button { color: #4A5563; display: grid; place-items: center; }

.on-map { display: flex; align-items: center; gap: 10px; width: 100%; padding: 16px; font-size: 14px; color: #1C2430; text-align: left; }
.om-ic { width: 26px; height: 26px; border-radius: 50%; background: #0B1F36; color: #fff; display: grid; place-items: center; }
.rest { flex: 1; background: #fff; }

.fab { position: absolute; top: 58px; left: 14px; z-index: 600; width: 40px; height: 40px; border-radius: 50%; background: #0B1F36; color: #fff; display: grid; place-items: center; box-shadow: 0 3px 10px rgba(5,17,34,.3); }
.locate { top: auto; left: auto; right: 14px; bottom: 162px; background: #fff; color: #0B1F36; }

.confirm { position: absolute; left: 0; right: 0; bottom: 0; z-index: 700; background: #fff; padding: 14px 16px 26px; box-shadow: 0 -4px 18px rgba(5,17,34,.12); }
.c-t { text-align: center; font-size: 14px; font-weight: 500; color: #1C2430; }
.c-a { text-align: center; font-size: 13px; color: #6B7684; margin-top: 12px; }
.c-btn { width: 100%; height: 48px; margin-top: 12px; border-radius: 4px; background: #0B1F36; color: #fff; font-size: 16px; font-weight: 600; }
</style>

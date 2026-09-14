<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { cells, visited } from '../../data/pulse'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

// 依行程上下車點找出「去過」的格子
function nearest(ll) {
  let best, bd = Infinity
  for (const c of cells) {
    const d = (c.ll[0] - ll[0]) ** 2 + ((c.ll[1] - ll[1]) * 0.906) ** 2
    if (d < bd) { bd = d; best = c }
  }
  return best.id
}
const homeId = nearest(visited.home)
const workId = nearest(visited.work)
const newIds = new Set([nearest([25.0805, 121.5455]), nearest([25.0493, 121.578]), nearest([25.064, 121.5655])])
const seen = new Set([homeId, workId, ...visited.extra.map(nearest)])
// 通勤走廊沿線的格子也算去過
const corridor = [[25.062, 121.552], [25.067, 121.553], [25.072, 121.556], [25.075, 121.562], [25.077, 121.568]]
corridor.forEach((ll) => seen.add(nearest(ll)))

const inCity = cells.filter((c) => c.ll[0] > 25.042 && c.ll[0] < 25.09 && c.ll[1] > 121.532 && c.ll[1] < 121.59)
const selected = ref(null)

const layers = computed(() =>
  inCity.map((c) => {
    const isHome = c.id === homeId
    const isWork = c.id === workId
    const on = seen.has(c.id)
    const fresh = newIds.has(c.id)
    return {
      type: 'poly', coords: c.poly,
      fill: isHome || isWork ? '#F14A42' : fresh ? '#4180A1' : on ? '#0C4C80' : '#DCE6F1',
      fillOpacity: on ? 0.82 : 0.35,
      stroke: selected.value === c.id ? '#051122' : '#fff', weight: selected.value === c.id ? 2.5 : 1.2,
      onClick: () => (selected.value = c.id),
    }
  }),
)
const fit = [[25.045, 121.535], [25.087, 121.587]]

const selInfo = computed(() => {
  if (!selected.value) return null
  if (selected.value === homeId) return { t: '家 · 富錦街', d: '本月出發 19 次' }
  if (selected.value === workId) return { t: '公司 · 瑞光路', d: '本月抵達 18 次' }
  if (newIds.has(selected.value)) return { t: '本月新解鎖', d: '9 月第一次在這裡上下車' }
  if (seen.has(selected.value)) return { t: '去過的區域', d: '近 90 天有上下車紀錄' }
  return { t: '尚未探索', d: '附近有 3 條順路走廊可以到這裡' }
})

const traits = [
  { k: '出發時間穩定度', v: '±6 分', d: '比 92% 的通勤者穩定' },
  { k: '共乘比例', v: '64%', d: '8 月是 41%' },
  { k: '平均等車', v: '2.8 分', d: '全市平均 7.4 分' },
]
</script>

<template>
  <div class="scr">
    <div class="topbar" style="margin-top: 50px">
      <button class="icon-btn" @click="back"><Icon name="back" /></button>
      <span class="t">我的城市版圖</span>
    </div>

    <div class="scroll">
      <div class="pad">
        <div class="stats">
          <div><b class="num">{{ seen.size }}</b><span>已走過的街區</span></div>
          <div><b class="num">+3</b><span>本月新解鎖</span></div>
          <div><b class="num">{{ Math.round((seen.size / inCity.length) * 100) }}%</b><span>台北東區探索度</span></div>
        </div>
      </div>

      <div class="map-card">
        <RouteMap :layers="layers" :fit="fit" :padding-top="10" :padding-bottom="36" :padding="[10, 10]" />
        <Transition name="pop">
          <div v-if="selInfo" class="sel">
            <b>{{ selInfo.t }}</b><span>{{ selInfo.d }}</span>
          </div>
        </Transition>
        <div class="legend">
          <span><i style="background: #F14A42"></i>家／公司</span>
          <span><i style="background: #0C4C80"></i>去過</span>
          <span><i style="background: #4180A1"></i>本月新解鎖</span>
          <span><i style="background: #DCE6F1"></i>未探索</span>
        </div>
      </div>

      <div class="pad">
        <section class="persona">
          <div class="p-h">
            <span class="ai"><Icon name="sparkle" :size="14" /> 9 月移動人格</span>
            <button class="share" @click="toast('已產生分享卡片')">分享</button>
          </div>
          <div class="p-name">準時早鳥型通勤者</div>
          <p>你幾乎每天 08:15 出門，路線固定，也最常選擇共乘。這個月開始在週五晚上往南京復興移動，也新解鎖了大直、松山車站等 3 個街區。</p>
          <div class="traits">
            <div v-for="t in traits" :key="t.k" class="trait">
              <span class="tk">{{ t.k }}</span>
              <b class="num">{{ t.v }}</b>
              <span class="td">{{ t.d }}</span>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="h2">值得去看看</div>
          <p class="sub" style="margin-bottom: 8px">依你的時段與常用走廊推薦，順路就能到。</p>
          <div class="sugs">
            <button class="sug card" @click="toast('已加入週六 11:00 順路車候補')">
              <span class="s-ic"><Icon name="pin" :size="20" /></span>
              <span class="s-t">
                <b>大直 · 週六早午餐</b>
                <small>還沒解鎖 · 週六 11:00 有 5 位同社區住戶共乘前往</small>
              </span>
              <Icon name="chevron" :size="18" class="muted" />
            </button>
            <button class="sug card" @click="go('pulse')">
              <span class="s-ic"><Icon name="calendar" :size="20" /></span>
              <span class="s-t">
                <b>小巨蛋 · 今晚演唱會</b>
                <small>散場預估等車 18 分鐘，先看城市脈動再決定怎麼回家</small>
              </span>
              <Icon name="chevron" :size="18" class="muted" />
            </button>
          </div>
        </section>
        <div style="height: 36px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border-radius: var(--r-md); box-shadow: var(--shadow-card); padding: 12px 4px; }
.stats div { display: flex; flex-direction: column; align-items: center; }
.stats div + div { border-left: 1px solid var(--line); }
.stats b { font-size: 22px; font-weight: 800; }
.stats span { font-size: 11px; color: var(--ink-3); }

.map-card { position: relative; height: 300px; margin: 12px 18px 0; border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-card); }
.sel { position: absolute; top: 10px; left: 10px; z-index: 650; background: var(--navy); color: #fff; border-radius: 12px; padding: 8px 12px; display: flex; flex-direction: column; box-shadow: var(--shadow-float); }
.sel b { font-size: 14px; }
.sel span { font-size: 11px; opacity: .8; }
.pop-enter-active, .pop-leave-active { transition: all .2s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }
.legend { position: absolute; left: 8px; right: 8px; bottom: 8px; z-index: 600; background: rgba(255,255,255,.94); border-radius: 10px; padding: 6px 8px; display: flex; flex-wrap: wrap; gap: 3px 10px; font-size: 10px; font-weight: 600; color: var(--ink-2); }
.legend span { display: inline-flex; align-items: center; gap: 4px; }
.legend i { width: 10px; height: 10px; border-radius: 3px; }

.persona { margin-top: 14px; border-radius: var(--r-lg); padding: 16px; color: #fff; background: linear-gradient(140deg, #051122 0%, #0c3560 70%, #4180a1 130%); }
.p-h { display: flex; justify-content: space-between; align-items: center; }
.ai { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.12); padding: 4px 9px; border-radius: 99px; }
.share { font-size: 12px; font-weight: 700; color: #fff; background: var(--red); padding: 5px 12px; border-radius: 9px; }
.p-name { font-size: 22px; font-weight: 900; margin-top: 10px; }
.persona p { font-size: 13px; line-height: 1.7; opacity: .88; margin-top: 4px; }
.traits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 12px; }
.trait { background: rgba(255,255,255,.08); border-radius: 12px; padding: 8px; display: flex; flex-direction: column; }
.tk { font-size: 10px; opacity: .7; }
.trait b { font-size: 18px; font-weight: 800; }
.td { font-size: 10px; opacity: .75; line-height: 1.4; }

.block { margin-top: 20px; }
.sugs { display: flex; flex-direction: column; gap: 8px; }
.sug { display: flex; align-items: center; gap: 12px; padding: 12px 14px; text-align: left; }
.s-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--red-soft); color: var(--red); display: grid; place-items: center; flex-shrink: 0; }
.s-t { flex: 1; display: flex; flex-direction: column; }
.s-t b { font-size: 14px; }
.s-t small { font-size: 12px; color: var(--ink-3); line-height: 1.5; }
</style>

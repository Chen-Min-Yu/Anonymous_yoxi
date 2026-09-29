<script setup>
import { computed, ref } from 'vue'
import { back, toast } from '../../store'
import { split, segments, places, me } from '../../data/scenario'
import { lines, riderPin, meetPin, dropPin, riderColor, riders, routes } from '../../components/mapkit'
import RouteMap from '../../components/RouteMap.vue'
import Icon from '../../components/Icon.vue'

const who = ref('A')
const rider = computed(() => split.riders.find((r) => r.id === who.value))
const fmt = (n) => n.toFixed(1)

const layers = [
  ...riders.map((r) => lines.walk(r)),
  lines.shared3, lines.shared2, lines.soloC,
  dropPin(riders[1], 1), dropPin(riders[0], 2), dropPin(riders[2], 3),
  ...riders.map((r) => riderPin(r)),
  meetPin(),
]
const fit = [...riders.flatMap((r) => routes[r.walk.key]), places.meetup.latlng]
</script>

<template>
  <div class="scr yx">
    <RouteMap :layers="layers" :fit="fit" :padding-top="70" :padding-bottom="430" :padding="[20, 20]" />
    <button class="yx-fab dark bk" @click="back"><Icon name="back" :size="20" /></button>

    <div class="yx-sheet panel">
      <div class="yx-grab"></div>
      <div class="scroll">
        <div class="hd">
          <div>
            <div class="eyebrow">AI 智慧集合點 <span class="yx-new">新</span></div>
            <b class="ttl">{{ places.meetup.name }}</b>
            <span class="sub">{{ places.meetup.sub }} · 08:15 上車</span>
          </div>
        </div>

        <!-- 集合點的存在理由：司機少繞路，乘客只走幾分鐘 -->
        <div class="why">
          <div class="w-col">
            <span>逐一到家門口接</span>
            <b class="num">10.7 km · 21 分</b>
          </div>
          <Icon name="arrow" :size="14" class="w-ar" />
          <div class="w-col good">
            <span>集合點一次上車</span>
            <b class="num">7.3 km · 14 分</b>
          </div>
        </div>

        <div class="who">
          <button v-for="r in split.riders" :key="r.id" :class="{ on: who === r.id }" @click="who = r.id">
            <i :style="{ background: riderColor[r.id] }"></i>{{ r.me ? '你' : r.name }}
          </button>
        </div>

        <!-- 逐段分攤：只有坐在車上的人分擔該段 -->
        <div class="split">
          <div v-for="s in segments" :key="s.key" class="sg" :class="{ off: !s.riders.includes(who) }">
            <div class="sg-h">
              <span class="tag" :class="s.riders.length > 1 ? 'shared' : 'solo'">{{ s.label }}</span>
              <span class="sg-r">{{ s.from }} <Icon name="arrow" :size="11" /> {{ s.to }}</span>
              <span class="sg-km num">{{ (s.meters / 1000).toFixed(1) }} km</span>
            </div>
            <div class="sg-c">
              <span class="num">${{ fmt(s.meters * split.perMeter) }}</span>
              <span class="op">÷</span>
              <span class="fc"><i v-for="id in s.riders" :key="id" :style="{ background: riderColor[id] }"></i></span>
              <span class="num">{{ s.riders.length }} 人</span>
              <span class="op">=</span>
              <b v-if="s.riders.includes(who)" class="num">${{ fmt((s.meters * split.perMeter) / s.riders.length) }}</b>
              <b v-else class="none">不需負擔</b>
            </div>
          </div>
        </div>

        <div class="bill">
          <div class="li"><span>路段分攤小計</span><span class="num">${{ rider.rideShare }}</span></div>
          <div class="li"><span>共乘媒合服務費</span><span class="num">${{ rider.serviceFee }}</span></div>
          <div class="li tot"><span>{{ rider.me ? '你' : rider.name }}的車資</span><b class="num">${{ rider.pay }}</b></div>
          <div class="li save"><span>自己叫車約 ${{ rider.solo }}，省下</span><b class="num">${{ rider.saved }}</b></div>
        </div>

        <div class="note">
          <Icon name="shield" :size="15" />
          <span>若夥伴臨時取消，你的車資最高不超過 ${{ rider.pay + 25 }}，差額自動退回。</span>
        </div>
        <div style="height: 86px"></div>
      </div>

      <div class="cta">
        <div class="c-p">
          <span>你付</span>
          <b class="num">${{ me.pay }}</b>
        </div>
        <button class="yx-btn" @click="toast('已加入 08:15 順路車')">確認加入順路車</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bk { top: 58px; left: 14px; width: 42px; height: 42px; }
.panel { display: flex; flex-direction: column; height: 52%; }
.scroll { flex: 1; overflow-y: auto; padding: 0 16px; scrollbar-width: none; }
.scroll::-webkit-scrollbar { display: none; }

.hd { display: flex; justify-content: space-between; align-items: flex-start; }
.eyebrow { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--yx-ink2); }
.ttl { display: block; font-size: 19px; font-weight: 700; color: var(--yx-ink); margin-top: 3px; }
.sub { font-size: 12px; color: var(--yx-ink2); }

.why { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px; border-radius: 8px; background: var(--yx-field); }
.w-col { flex: 1; display: flex; flex-direction: column; }
.w-col span { font-size: 11px; color: var(--yx-ink2); }
.w-col b { font-size: 14px; font-weight: 700; color: var(--yx-ink); }
.w-col.good b { color: var(--yx-red); }
.w-ar { color: var(--yx-ink3); flex-shrink: 0; }

.who { display: flex; gap: 6px; margin-top: 14px; }
.who button { flex: 1; height: 34px; border-radius: 4px; border: 1px solid var(--yx-line); background: #fff; font-size: 13px; color: var(--yx-ink2); display: flex; align-items: center; justify-content: center; gap: 6px; }
.who button i { width: 9px; height: 9px; border-radius: 50%; }
.who button.on { border: 2px solid var(--yx-navy); color: var(--yx-ink); font-weight: 600; }

.split { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
.sg { border: 1px solid var(--yx-line); border-radius: 8px; padding: 10px 11px; transition: opacity .2s; }
.sg.off { opacity: .45; }
.sg-h { display: flex; align-items: center; gap: 7px; }
.tag { height: 20px; padding: 0 7px; border-radius: 3px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; }
.tag.shared { background: #E4EEF8; color: #0C4C80; }
.tag.solo { background: #FCE6E6; color: #B8261F; }
.sg-r { flex: 1; display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; color: var(--yx-ink); }
.sg-km { font-size: 11px; color: var(--yx-ink2); }
.sg-c { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; color: var(--yx-ink2); }
.op { color: var(--yx-ink3); }
.fc { display: flex; }
.fc i { width: 13px; height: 13px; border-radius: 50%; border: 2px solid #fff; margin-left: -4px; }
.fc i:first-child { margin-left: 0; }
.sg-c b { margin-left: auto; font-size: 16px; font-weight: 700; color: var(--yx-ink); }
.sg-c b.none { font-size: 11px; font-weight: 500; color: var(--yx-ink3); }

.bill { margin-top: 14px; border-top: 1px solid var(--yx-line2); }
.li { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px; color: var(--yx-ink2); }
.li.tot { border-top: 1px solid var(--yx-line2); color: var(--yx-ink); font-weight: 600; }
.li.tot b { font-size: 19px; font-weight: 800; }
.li.save { color: var(--yx-red); font-weight: 600; }
.li.save b { font-size: 15px; font-weight: 800; }

.note { display: flex; gap: 8px; margin-top: 10px; padding: 10px; border-radius: 8px; background: var(--yx-field); font-size: 11.5px; line-height: 1.6; color: var(--yx-ink2); }
.note svg { flex-shrink: 0; margin-top: 1px; color: var(--yx-navy); }

.cta { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 16px 24px; background: #fff; border-top: 1px solid var(--yx-line2); display: flex; align-items: center; gap: 14px; }
.c-p { display: flex; flex-direction: column; line-height: 1.15; flex-shrink: 0; }
.c-p span { font-size: 11px; color: var(--yx-ink2); }
.c-p b { font-size: 24px; font-weight: 800; color: var(--yx-ink); }
.cta .yx-btn { flex: 1; font-size: 16px; }
</style>

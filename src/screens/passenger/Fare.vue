<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { split, segments } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import Icon from '../../components/Icon.vue'

const sel = ref('A')
const r = computed(() => split.riders.find((x) => x.id === sel.value))
const totalKm = (split.totalMeters / 1000).toFixed(1)
const fmt = (n) => n.toFixed(1)
const selfPay = computed(() => r.value.pay - r.value.subsidy)

function confirm() {
  toast('已加入 08:15 順路車')
  setTimeout(() => go('meetup'), 500)
}
</script>

<template>
  <div class="scr">
    <div class="topbar" style="margin-top: 50px">
      <button class="icon-btn" @click="back"><Icon name="back" /></button>
      <span class="t">車資分攤試算</span>
    </div>

    <div class="scroll">
      <div class="pad">
        <!-- 選擇檢視的乘客 -->
        <div class="who">
          <button v-for="x in split.riders" :key="x.id" :class="{ on: sel === x.id }" @click="sel = x.id">
            <i :style="{ background: riderColor[x.id] }"></i>{{ x.me ? '你' : x.name }}
          </button>
        </div>

        <!-- 金額總覽 -->
        <section class="hero card">
          <div class="hero-row">
            <div>
              <div class="eyebrow">{{ r.me ? '你' : r.name }}的共乘車資</div>
              <div class="big num">${{ r.pay }}</div>
            </div>
            <div class="save">
              <span class="num">省 {{ r.savedPct }}%</span>
              <small>自己叫車 <s class="num">${{ r.solo }}</s></small>
            </div>
          </div>
          <div class="compare">
            <div class="cb"><span class="cb-fill solo" style="width: 100%"></span><em>自己叫車 ${{ r.solo }}</em></div>
            <div class="cb"><span class="cb-fill pool" :style="{ width: (r.pay / r.solo) * 100 + '%' }"></span><em>順路共乘 ${{ r.pay }}</em></div>
          </div>
        </section>

        <!-- 路段拆解 -->
        <section class="block">
          <div class="h2">每一段怎麼分</div>
          <p class="sub" style="margin-top: 2px">整趟 {{ totalKm }} km 跳表 ${{ split.totalFare }}。每段依里程計價，只由坐在車上的人平均分攤。</p>

          <div class="strip">
            <div
              v-for="s in segments" :key="s.key" class="strip-seg"
              :class="[s.riders.length > 1 ? 'shared' : 'solo', { mine: s.riders.includes(sel), faded: !s.riders.includes(sel) }]"
              :style="{ flex: s.meters }"
            ></div>
          </div>

          <div class="segs">
            <div v-for="s in segments" :key="s.key" class="seg" :class="{ faded: !s.riders.includes(sel) }">
              <div class="seg-top">
                <span class="chip" :class="s.riders.length > 1 ? 'chip-blue' : 'chip-red'">{{ s.label }}</span>
                <span class="seg-route">{{ s.from }} <Icon name="arrow" :size="12" /> {{ s.to }}</span>
                <span class="seg-km num">{{ (s.meters / 1000).toFixed(1) }} km</span>
              </div>
              <div class="seg-calc">
                <span class="num">${{ fmt(s.meters * split.perMeter) }}</span>
                <span class="op">÷</span>
                <span class="faces">
                  <i v-for="id in s.riders" :key="id" :style="{ background: riderColor[id] }"></i>
                </span>
                <span class="num">{{ s.riders.length }} 人</span>
                <span class="op">=</span>
                <b class="num" v-if="s.riders.includes(sel)">${{ fmt((s.meters * split.perMeter) / s.riders.length) }}</b>
                <b class="num none" v-else>不需負擔</b>
              </div>
            </div>
          </div>
        </section>

        <!-- 帳單 -->
        <section class="bill card">
          <div class="li"><span>路段分攤小計</span><span class="num">${{ r.rideShare }}</span></div>
          <div class="li"><span>共乘媒合服務費</span><span class="num">${{ r.serviceFee }}</span></div>
          <div class="li total"><span>共乘車資</span><span class="num">${{ r.pay }}</span></div>
          <div class="li sub-li"><span><Icon name="building" :size="14" /> {{ r.company }} 通勤補助 50%</span><span class="num">-${{ r.subsidy }}</span></div>
          <div class="li final"><span>你實際支付</span><b class="num">${{ selfPay }}</b></div>
        </section>

        <div class="guard">
          <Icon name="shield" :size="18" />
          <span><b>價格上限保證</b>　若有夥伴臨時取消，你的車資最高不超過 ${{ r.pay + 25 }}，並自動退回差額。</span>
        </div>
        <div style="height: 100px"></div>
      </div>
    </div>

    <div class="cta">
      <button class="btn btn-red" @click="confirm">確認加入 08:15 順路車</button>
    </div>
  </div>
</template>

<style scoped>
.who { display: flex; gap: 6px; margin: 4px 0 12px; }
.who button { flex: 1; height: 36px; border-radius: 10px; background: #fff; border: 1.5px solid var(--line); font-size: 13px; font-weight: 700; color: var(--ink-2); display: flex; align-items: center; justify-content: center; gap: 6px; }
.who button i { width: 9px; height: 9px; border-radius: 50%; }
.who button.on { border-color: var(--navy); color: var(--navy); box-shadow: inset 0 0 0 0.5px var(--navy); }

.hero { padding: 16px; }
.hero-row { display: flex; justify-content: space-between; align-items: flex-end; }
.big { font-size: 44px; font-weight: 800; line-height: 1.05; color: var(--navy); }
.save { text-align: right; display: flex; flex-direction: column; }
.save span { font-size: 18px; font-weight: 800; color: var(--red); }
.save small { font-size: 12px; color: var(--ink-3); }
.compare { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.cb { position: relative; height: 26px; background: var(--bg); border-radius: 8px; overflow: hidden; }
.cb-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 8px; transition: width .5s cubic-bezier(.3,.8,.3,1); }
.cb-fill.solo { background: var(--mist); }
.cb-fill.pool { background: var(--red); }
.cb em { position: relative; font-style: normal; font-size: 12px; font-weight: 700; line-height: 26px; padding-left: 10px; color: var(--navy); }
.cb:last-child em { color: #fff; }

.block { margin-top: 20px; }
.strip { display: flex; gap: 3px; height: 12px; margin: 14px 0 10px; }
.strip-seg { border-radius: 6px; transition: opacity .3s; }
.strip-seg.shared { background: var(--blue); }
.strip-seg.solo { background: var(--red); }
.strip-seg.faded { opacity: .2; }

.segs { display: flex; flex-direction: column; gap: 8px; }
.seg { background: #fff; border-radius: 14px; padding: 12px; box-shadow: var(--shadow-card); transition: opacity .3s; }
.seg.faded { opacity: .5; }
.seg-top { display: flex; align-items: center; gap: 8px; }
.seg-route { flex: 1; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
.seg-km { font-size: 12px; color: var(--ink-3); font-weight: 600; }
.seg-calc { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 13px; color: var(--ink-2); font-weight: 600; }
.op { color: var(--ink-3); }
.faces { display: flex; }
.faces i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; margin-left: -4px; }
.faces i:first-child { margin-left: 0; }
.seg-calc b { margin-left: auto; font-size: 17px; font-weight: 800; color: var(--navy); }
.seg-calc b.none { font-size: 12px; color: var(--ink-3); font-family: var(--font); }

.bill { margin-top: 16px; padding: 6px 16px; }
.li { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 14px; color: var(--ink-2); }
.li.total { border-top: 1px solid var(--line); font-weight: 700; color: var(--navy); }
.sub-li { color: var(--blue); font-weight: 600; }
.sub-li span:first-child { display: flex; align-items: center; gap: 5px; }
.li.final { border-top: 1.5px dashed var(--line); padding: 12px 0; font-weight: 700; color: var(--navy); }
.li.final b { font-size: 24px; font-weight: 800; color: var(--red); }

.guard { display: flex; gap: 10px; margin-top: 12px; padding: 12px; border-radius: 14px; background: var(--blue-soft); color: var(--blue); font-size: 12px; line-height: 1.6; }
.guard svg { flex-shrink: 0; margin-top: 1px; }
.guard b { font-weight: 700; }

.cta { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 18px 30px; background: linear-gradient(transparent, var(--bg) 25%); z-index: 10; }
</style>

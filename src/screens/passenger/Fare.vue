<script setup>
import { computed, ref } from 'vue'
import { back, go, toast } from '../../store'
import { split, segments, riders as baseRiders } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import Icon from '../../components/Icon.vue'

const sel = ref('A')
const totalKm = (split.totalMeters / 1000).toFixed(1)

// 每個人依「自己實際共乘的里程」佔全體總里程的比例分攤車資，不再拆解共同/專屬路段
const pctSplit = computed(() => {
  const withOwnMeters = baseRiders.map((br) => ({
    ...br,
    ownMeters: segments.filter((s) => s.riders.includes(br.id)).reduce((sum, s) => sum + s.meters, 0),
  }))
  const totalOwnMeters = withOwnMeters.reduce((sum, x) => sum + x.ownMeters, 0)

  return withOwnMeters.map((x) => {
    const solo = split.riders.find((s) => s.id === x.id).solo
    const rideShare = Math.round((x.ownMeters / totalOwnMeters) * split.totalFare)
    const serviceFee = split.riders.find((s) => s.id === x.id).serviceFee
    const pay = rideShare + serviceFee
    const subsidy = Math.round(pay * 0.5)
    return {
      ...x,
      pct: Math.round((x.ownMeters / totalOwnMeters) * 100),
      rideShare,
      serviceFee,
      pay,
      solo,
      savedPct: Math.round(((solo - pay) / solo) * 100),
      subsidy,
    }
  })
})
const r = computed(() => pctSplit.value.find((x) => x.id === sel.value))
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

        <!-- 里程佔比分攤 -->
        <section class="block">
          <div class="h2">里程數占比</div>
          <p class="sub" style="margin-top: 2px">整趟 {{ totalKm }} km 跳表 ${{ split.totalFare }}。依每個人實際共乘的里程，佔全體總里程的比例分攤。</p>

          <div class="pct-bar">
            <span v-for="x in pctSplit" :key="x.id" class="pct-seg" :class="{ mine: x.id === sel }" :style="{ flex: x.pct, background: riderColor[x.id] }"></span>
          </div>

          <div class="pct-list">
            <button v-for="x in pctSplit" :key="x.id" class="pct-row" :class="{ on: x.id === sel }" @click="sel = x.id">
              <i :style="{ background: riderColor[x.id] }"></i>
              <span class="pct-name">{{ x.me ? '你' : x.name }}</span>
              <span class="pct-km num">{{ (x.ownMeters / 1000).toFixed(1) }} km</span>
              <span class="pct-pct num">{{ x.pct }}%</span>
              <b class="num">${{ x.rideShare }}</b>
            </button>
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
.pct-bar { display: flex; gap: 3px; height: 12px; margin: 14px 0 10px; border-radius: 6px; overflow: hidden; }
.pct-seg { transition: opacity .3s; opacity: .5; }
.pct-seg.mine { opacity: 1; }

.pct-list { display: flex; flex-direction: column; gap: 8px; }
.pct-row { display: flex; align-items: center; gap: 10px; width: 100%; background: #fff; border-radius: 14px; padding: 12px 14px; box-shadow: var(--shadow-card); text-align: left; opacity: .6; }
.pct-row.on { opacity: 1; outline: 1.5px solid var(--navy); }
.pct-row i { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pct-name { font-size: 14px; font-weight: 700; }
.pct-km { font-size: 12px; color: var(--ink-3); font-weight: 600; }
.pct-pct { font-size: 13px; color: var(--ink-2); font-weight: 700; margin-left: auto; }
.pct-row b { font-size: 17px; font-weight: 800; color: var(--navy); }

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

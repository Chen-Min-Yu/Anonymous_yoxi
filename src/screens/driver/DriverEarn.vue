<script setup>
import { go } from '../../store'
import { driver, split } from '../../data/scenario'
import Icon from '../../components/Icon.vue'
import TabBar from '../../components/TabBar.vue'

const income = split.totalFare + driver.poolBonus
const CO2_SAVED_KG = 42
const FUEL_SAVED_L = Math.round(CO2_SAVED_KG / 2.3) // 一般汽油車約 2.3 kg CO2 / 公升，估算省下的油錢公升數
const trips = [
  { t: '08:12', kind: '共乘', who: '3 人 · 民生社區到內湖', amt: income, pool: true },
  { t: '07:31', kind: '共乘', who: '2 人 · 松山到南港軟體園區', amt: 215, pool: true },
  { t: '06:58', kind: '一般', who: '1 人 · 松山機場到中山', amt: 175 },
]
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <header class="hero">
        <div class="eyebrow light">行程完成 · 已入帳</div>
        <div class="amt num">+${{ income }}</div>
        <div class="split-row">
          <span>跳表 ${{ split.totalFare }}</span>
          <span class="dot"></span>
          <span>共乘獎金 ${{ driver.poolBonus }}</span>
          <span class="dot"></span>
          <span>比一般單多 ${{ income - driver.soloEquivalent }}</span>
        </div>
      </header>

      <div class="pad lift">
        <div class="bonus card">
          <div class="b-h">
            <b>共乘效率獎金</b>
            <span class="chip chip-red">4 / 5 趟</span>
          </div>
          <div class="steps">
            <span v-for="i in 5" :key="i" :class="{ on: i <= 4 }"></span>
          </div>
          <p class="sub">今天再完成 1 趟共乘單，加發 <b style="color: var(--red)">$150</b>。系統會優先派發你所在地區的共乘單。</p>
        </div>

        <section class="block">
          <div class="h2">今日行程</div>
          <div class="trips card">
            <div v-for="tr in trips" :key="tr.t" class="trip">
              <span class="tt num">{{ tr.t }}</span>
              <span class="chip" :class="tr.pool ? 'chip-blue' : 'chip-line'">{{ tr.kind }}</span>
              <span class="tw">{{ tr.who }}</span>
              <b class="num">${{ tr.amt }}</b>
            </div>
          </div>
        </section>

        <div class="green card">
          <span class="g-ic"><Icon name="leaf" :size="20" /></span>
          <div>
            <b>本月共乘單減少 {{ CO2_SAVED_KG }} kg 碳排，省下約 {{ FUEL_SAVED_L }} 公升油錢</b>
            <small>yoxi 綠色車隊認證司機，享保養合作廠優惠</small>
          </div>
        </div>

        <button class="btn btn-navy" style="margin-top: 16px" @click="go('d-home')">繼續接單</button>
        <div style="height: 24px"></div>
      </div>
    </div>
    <TabBar driver active="d-earn" />
  </div>
</template>

<style scoped>
.hero { background: var(--navy); color: #fff; padding: 72px 20px 54px; text-align: center; position: relative; overflow: hidden; }
.hero::after { content: ''; position: absolute; left: 50%; bottom: -160px; width: 360px; height: 260px; transform: translateX(-50%); background: radial-gradient(closest-side, rgba(241,74,66,.55), transparent); }
.eyebrow.light { color: rgba(255,255,255,.7); }
.amt { font-size: 52px; font-weight: 800; line-height: 1.1; margin-top: 6px; position: relative; z-index: 1; }
.split-row { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12px; opacity: .85; margin-top: 8px; position: relative; z-index: 1; }
.dot { width: 3px; height: 3px; border-radius: 50%; background: currentColor; }

.lift { margin-top: -30px; position: relative; z-index: 2; }
.bonus { padding: 14px 16px; }
.b-h { display: flex; justify-content: space-between; align-items: center; }
.b-h b { font-size: 15px; }
.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0 10px; }
.steps span { height: 8px; border-radius: 4px; background: var(--mist); }
.steps span.on { background: var(--red); }
.bonus .sub { font-size: 12px; }

.block { margin-top: 20px; }
.block > .sub { font-size: 12px; margin: 2px 0 10px; }

.trips { padding: 2px 14px; }
.trip { display: flex; align-items: center; gap: 8px; padding: 11px 0; }
.trip + .trip { border-top: 1px solid var(--line); }
.tt { font-size: 12px; font-weight: 700; color: var(--ink-3); width: 38px; }
.tw { flex: 1; font-size: 13px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trip b { font-size: 15px; font-weight: 800; }

.green { display: flex; gap: 12px; align-items: center; padding: 14px 16px; margin-top: 16px; }
.g-ic { width: 40px; height: 40px; border-radius: 12px; background: #e3f0f6; color: var(--teal); display: grid; place-items: center; flex-shrink: 0; }
.green b { font-size: 14px; display: block; }
.green small { font-size: 12px; color: var(--ink-3); }
</style>

<script setup>
import { ref } from 'vue'
import { go, toast } from '../../store'
import { me, split } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import Icon from '../../components/Icon.vue'

const mates = split.riders.filter((r) => !r.me)
const tags = ['準時到集合點', '安靜好相處', '下次想再同車']
const picked = ref({ B: ['準時到集合點'], C: [] })
function toggle(id, tag) {
  const arr = picked.value[id]
  const i = arr.indexOf(tag)
  i >= 0 ? arr.splice(i, 1) : arr.push(tag)
}
const points = me.pay
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <header class="hero">
        <div class="ok"><Icon name="check" :size="30" :stroke="3" /></div>
        <div class="eyebrow light">08:28 抵達瑞光路</div>
        <div class="saved">這趟省下 <b class="num">${{ me.saved }}</b></div>
        <div class="hero-sub">共乘車資 ${{ me.pay }}，公司補助 ${{ me.subsidy }}，你實付 ${{ me.pay - me.subsidy }}</div>
      </header>

      <div class="pad lift">
        <div class="stats card">
          <div>
            <span class="ic teal"><Icon name="leaf" :size="18" /></span>
            <b class="num">{{ me.co2 }}<small>kg</small></b>
            <span>減少碳排</span>
          </div>
          <div>
            <span class="ic red"><Icon name="coin" :size="18" /></span>
            <b class="num">+{{ points }}</b>
            <span>yoxi 點數</span>
          </div>
          <div>
            <span class="ic blue"><Icon name="route" :size="18" /></span>
            <b class="num">3.3<small>km</small></b>
            <span>少開的車程</span>
          </div>
        </div>

        <section class="block">
          <div class="h2">給今天的夥伴回饋</div>
          <p class="sub">互評只用於媒合優化，不會公開顯示分數。</p>
          <div v-for="m in mates" :key="m.id" class="mate card">
            <div class="mate-h">
              <div class="avatar" :style="{ background: riderColor[m.id] }">{{ m.initial }}</div>
              <b>{{ m.name }}</b>
              <span class="muted small">{{ m.company }}</span>
            </div>
            <div class="tags">
              <button v-for="tg in tags" :key="tg" :class="{ on: picked[m.id].includes(tg) }" @click="toggle(m.id, tg)">{{ tg }}</button>
            </div>
          </div>
        </section>

        <section class="fixed card" @click="toast('已建立固定班底：週一至週五 08:15')">
          <div class="fx-ic"><Icon name="calendar" :size="22" /></div>
          <div class="fx-t">
            <b>把今天的組合設為固定班底</b>
            <span>平日 08:15 自動保留座位，媒合成功率從 72% 提高到 94%</span>
          </div>
          <Icon name="chevron" :size="18" class="muted" />
        </section>

        <div class="progress card">
          <div class="pg-h">
            <span><b>綠色通勤者</b>　本月共乘 6 / 10 趟</span>
            <span class="chip chip-blue">可兌換</span>
          </div>
          <div class="pg-bar"><span style="width: 60%"></span></div>
          <p class="sub">達成後可兌換 7-ELEVEN 早餐組合，或把點數捐給植樹計畫。</p>
        </div>

        <button class="btn btn-red" style="margin-top: 16px" @click="go('circle')">查看我的順路圈</button>
        <div style="height: 36px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(160deg, #f14a42 0%, #d8372f 60%, #b82a24 100%); color: #fff; text-align: center;
  padding: 70px 20px 58px; position: relative; overflow: hidden;
}
.hero::before { content: ''; position: absolute; width: 320px; height: 320px; border-radius: 50%; border: 50px solid rgba(255,255,255,.07); right: -120px; top: -120px; }
.ok { width: 62px; height: 62px; border-radius: 50%; background: #fff; color: var(--red); display: grid; place-items: center; margin: 0 auto 12px; animation: pop .5s cubic-bezier(.3,1.6,.5,1) .3s both; }
@keyframes pop { from { transform: scale(0); } }
.eyebrow.light { color: rgba(255,255,255,.8); }
.saved { font-size: 20px; font-weight: 700; margin-top: 4px; }
.saved b { font-size: 48px; font-weight: 800; display: block; line-height: 1.1; }
.hero-sub { font-size: 13px; opacity: .85; margin-top: 6px; }

.lift { margin-top: -34px; position: relative; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); padding: 14px 6px; }
.stats > div { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stats > div + div { border-left: 1px solid var(--line); }
.ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 4px; }
.ic.teal { background: #e3f0f6; color: var(--teal); }
.ic.red { background: var(--red-soft); color: var(--red); }
.ic.blue { background: var(--blue-soft); color: var(--blue); }
.stats b { font-size: 20px; font-weight: 800; }
.stats small { font-size: 12px; margin-left: 1px; }
.stats span:last-child { font-size: 12px; color: var(--ink-3); }

.block { margin-top: 20px; }
.block .sub { margin: 2px 0 10px; font-size: 12px; }
.mate { padding: 12px; margin-bottom: 8px; }
.mate-h { display: flex; align-items: center; gap: 10px; }
.mate-h .avatar { width: 30px; height: 30px; font-size: 12px; }
.mate-h b { font-size: 14px; }
.small { font-size: 12px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.tags button { font-size: 12px; font-weight: 600; height: 30px; padding: 0 11px; border-radius: 99px; border: 1.5px solid var(--line); color: var(--ink-2); background: #fff; transition: all .15s; }
.tags button.on { border-color: var(--navy); background: var(--navy); color: #fff; }

.fixed { display: flex; align-items: center; gap: 12px; padding: 14px; margin-top: 12px; cursor: pointer; border: 1.5px solid var(--blue); }
.fx-ic { width: 44px; height: 44px; border-radius: 12px; background: var(--blue); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.fx-t { flex: 1; display: flex; flex-direction: column; }
.fx-t b { font-size: 14px; }
.fx-t span { font-size: 12px; color: var(--ink-2); line-height: 1.5; }

.progress { padding: 14px; margin-top: 12px; }
.pg-h { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--ink-2); }
.pg-h b { color: var(--navy); }
.pg-bar { height: 8px; border-radius: 4px; background: var(--mist); margin: 10px 0 8px; overflow: hidden; }
.pg-bar span { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--blue), var(--teal)); }
.progress .sub { font-size: 12px; }
</style>

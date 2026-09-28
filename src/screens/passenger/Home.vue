<script setup>
import { go, toast } from '../../store'
import { me, split } from '../../data/scenario'
import { riderColor } from '../../components/mapkit'
import { areaStats, corridor } from '../../data/pulse'
import Icon from '../../components/Icon.vue'
import YoxiLogo from '../../components/YoxiLogo.vue'
import TabBar from '../../components/TabBar.vue'

const mates = split.riders.filter((r) => !r.me)
const pulseAreas = areaStats('now').filter((x) => ['minsheng', 'nanjing', 'neihu'].includes(x.k))
const at815 = corridor.curve.find((d) => d.t === '08:15')
const week = [
  { d: '一', pool: true, amt: 92 }, { d: '二', pool: true, amt: 0, today: true },
  { d: '三', pool: false }, { d: '四', pool: false }, { d: '五', pool: false },
]
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <header class="head">
        <YoxiLogo :height="20" />
        <div class="head-r">
          <button class="icon-btn" @click="toast('2 則新通知')"><Icon name="bell" /><i class="dot"></i></button>
          <div class="avatar" style="background: var(--navy)">敏</div>
        </div>
      </header>

      <div class="pad">
        <div class="greet">
          <div class="h1">早安，敏瑜</div>
          <div class="sub">今天也是往內湖科學園區的一天嗎？</div>
        </div>

        <button class="where card" @click="toast('一般叫車流程沿用 yoxi 現有介面')">
          <span class="dot-red"></span>
          <span class="ph">要去哪裡？</span>
          <span class="chip chip-line"><Icon name="clock" :size="13" />預約</span>
        </button>

        <!-- AI 通勤預報 -->
        <section class="forecast" @click="go('forecast')">
          <div class="fc-top">
            <span class="ai"><Icon name="sparkle" :size="14" /> AI 通勤預報</span>
            <span class="fc-date">週二 早班 · 查看完整預報 <Icon name="chevron" :size="12" /></span>
          </div>
          <div class="fc-main">
            <div>
              <div class="fc-label">你的出發時間</div>
              <div class="fc-time num">08:15</div>
            </div>
            <div class="fc-cmp">
              <div class="row"><span>自己叫車</span><b class="num">等 {{ Math.round(at815.wait) }} 分 · ${{ me.solo }}</b></div>
              <div class="row hl"><span>順路共乘</span><b class="num">步行 {{ me.walk.minutes }} 分 · ${{ me.pay }}</b></div>
            </div>
          </div>
          <p class="fc-note">依近 90 天這條走廊的 yoxi 行程：08:15 自己叫車中位等 {{ at815.wait }} 分、車程 {{ at815.ride }} 分；共乘多花約 3 分鐘，車資少一半以上。</p>
        </section>

        <!-- 城市脈動 -->
        <section class="pulse card" @click="go('pulse')">
          <div class="pl-h">
            <span class="pl-t"><i class="live"></i> 城市脈動</span>
            <span class="link">看熱點地圖 <Icon name="chevron" :size="14" /></span>
          </div>
          <div class="pl-rows">
            <div v-for="a in pulseAreas" :key="a.name" class="pl-row">
              <span class="pl-n">{{ a.name }}</span>
              <span class="pl-b"><i :style="{ width: (a.wait / 10) * 100 + '%' }"></i></span>
              <b class="num">{{ a.wait }} 分</b>
            </div>
          </div>
          <p class="pl-note"><Icon name="clock" :size="13" /> 平日 18 點最難叫車，內湖科學園區 10% 的叫車要等 15 分鐘以上</p>
        </section>

        <!-- 順路邀請 -->
        <section class="invite card" @click="go('match')">
          <div class="inv-head">
            <span class="chip chip-red"><Icon name="users" :size="13" /> 順路圈媒合成功</span>
            <span class="muted small">剩 18 分鐘可加入</span>
          </div>
          <div class="inv-title">2 位夥伴和你同一條通勤走廊</div>
          <div class="inv-people">
            <div class="faces">
              <div class="avatar sm" :style="{ background: riderColor.A }">你</div>
              <div v-for="m in mates" :key="m.id" class="avatar sm" :style="{ background: riderColor[m.id] }">{{ m.initial }}</div>
            </div>
            <div class="inv-meta">
              <div><Icon name="walk" :size="14" /> 走 {{ me.walk.minutes }} 分到民生敦化路口</div>
              <div><Icon name="building" :size="14" /> 2 位同為瑞光科技員工</div>
            </div>
          </div>
          <div class="inv-foot">
            <div>
              <div class="save-label">預估你付</div>
              <div class="price num">${{ me.pay }} <s>${{ me.solo }}</s></div>
            </div>
            <button class="btn btn-red go-btn">查看媒合 <Icon name="arrow" :size="18" /></button>
          </div>
        </section>

        <!-- 本週 -->
        <section class="block">
          <div class="block-h">
            <span class="h2">本週通勤</span>
            <button class="link" @click="go('circle')">我的順路圈 <Icon name="chevron" :size="14" /></button>
          </div>
          <div class="week card">
            <div class="days">
              <div v-for="w in week" :key="w.d" class="day" :class="{ pool: w.pool, today: w.today }">
                <span class="bar"></span>
                <span class="dl">{{ w.d }}</span>
              </div>
            </div>
            <div class="wk-stats">
              <div><b class="num">$1,974</b><span>本月已省</span></div>
              <div><b class="num">6.9<small>kg</small></b><span>減少碳排</span></div>
              <div><b class="num">1,329</b><span>yoxi 點數</span></div>
            </div>
          </div>
        </section>

        <!-- 下班預報 -->
        <section class="block">
          <div class="block-h"><span class="h2">下班回程</span></div>
          <div class="evening card" @click="toast('已預約 18:20 回程順路車')">
            <div class="ev-ic"><Icon name="calendar" :size="20" /></div>
            <div class="ev-t">
              <b>18:20 有 5 位同事也要回民生社區</b>
              <span class="sub">午後雷陣雨，預約可保留座位，自己叫車預估等 14 分鐘</span>
            </div>
            <Icon name="chevron" :size="18" class="muted" />
          </div>
        </section>
        <div style="height: 20px"></div>
      </div>
    </div>
    <TabBar active="home" />
  </div>
</template>

<style scoped>
.head { display: flex; align-items: center; justify-content: space-between; padding: 58px 18px 6px; }
.head-r { display: flex; align-items: center; gap: 6px; }
.dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: var(--red); border: 2px solid var(--bg); transform: translate(7px, -8px); }
.icon-btn { position: relative; }
.greet { margin: 12px 0 14px; }
.where { width: 100%; display: flex; align-items: center; gap: 12px; height: 54px; padding: 0 12px 0 16px; text-align: left; }
.dot-red { width: 10px; height: 10px; border-radius: 3px; background: var(--red); }
.ph { flex: 1; font-size: 16px; font-weight: 700; color: var(--ink-2); }

.forecast {
  margin-top: 14px; border-radius: var(--r-lg); padding: 16px; color: #fff;
  background: linear-gradient(135deg, #051122 0%, #0c3560 100%); position: relative; overflow: hidden;
}
.forecast::after { content: ''; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(241,74,66,.45), transparent 70%); }
.fc-top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.ai { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.12); padding: 4px 9px; border-radius: 99px; }
.fc-date { font-size: 12px; opacity: .7; }
.fc-main { display: flex; gap: 14px; align-items: flex-end; margin-top: 12px; position: relative; z-index: 1; }
.fc-label { font-size: 12px; opacity: .7; }
.fc-time { font-size: 40px; font-weight: 800; line-height: 1.05; }
.fc-cmp { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 10px; border-radius: 9px; background: rgba(255,255,255,.08); }
.row b { font-weight: 700; }
.row.hl { background: var(--red); }
.fc-note { font-size: 12px; line-height: 1.6; opacity: .78; margin-top: 12px; position: relative; z-index: 1; }

.forecast { cursor: pointer; }
.fc-date { display: inline-flex; align-items: center; gap: 2px; }
.pulse { margin-top: 12px; padding: 14px 16px; cursor: pointer; }
.pl-h { display: flex; justify-content: space-between; align-items: center; }
.pl-t { font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.live { width: 8px; height: 8px; border-radius: 50%; background: var(--red); animation: lv 1.4s infinite; }
@keyframes lv { 50% { opacity: .3; } }
.pl-rows { margin-top: 10px; display: flex; flex-direction: column; gap: 7px; }
.pl-row { display: grid; grid-template-columns: 84px 1fr 38px; align-items: center; gap: 8px; font-size: 13px; }
.pl-n { font-weight: 600; color: var(--ink-2); }
.pl-b { height: 8px; background: var(--bg); border-radius: 0 4px 4px 0; overflow: hidden; }
.pl-b i { display: block; height: 100%; background: var(--red); border-radius: 0 4px 4px 0; }
.pl-row b { text-align: right; font-weight: 800; }
.pl-note { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line); font-size: 12px; color: var(--ink-2); display: flex; align-items: center; gap: 5px; }
.invite { margin-top: 14px; padding: 16px; border: 2px solid var(--red); cursor: pointer; transition: transform .15s; }
.invite:hover { transform: translateY(-2px); }
.inv-head { display: flex; justify-content: space-between; align-items: center; }
.small { font-size: 12px; }
.inv-title { font-size: 18px; font-weight: 900; margin: 10px 0 12px; }
.inv-people { display: flex; align-items: center; gap: 14px; }
.faces { display: flex; }
.avatar.sm { width: 34px; height: 34px; border: 2.5px solid #fff; margin-left: -8px; font-size: 13px; }
.avatar.sm:first-child { margin-left: 0; }
.inv-meta { font-size: 12px; color: var(--ink-2); display: flex; flex-direction: column; gap: 3px; }
.inv-meta div { display: flex; align-items: center; gap: 5px; }
.inv-foot { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--line); }
.save-label { font-size: 12px; color: var(--ink-3); }
.price { font-size: 28px; font-weight: 800; color: var(--red); line-height: 1.1; }
.price s { font-size: 14px; color: var(--ink-3); font-weight: 600; margin-left: 4px; }
.go-btn { width: auto; padding: 0 16px; height: 44px; font-size: 14px; }

.block { margin-top: 22px; }
.block-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.link { font-size: 13px; font-weight: 700; color: var(--blue); display: flex; align-items: center; gap: 2px; }
.week { padding: 14px 16px; }
.days { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.day { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.bar { width: 100%; height: 8px; border-radius: 4px; background: var(--mist); }
.day.pool .bar { background: var(--blue); }
.day.today .bar { background: repeating-linear-gradient(90deg, var(--red) 0 6px, #fdb3ae 6px 10px); }
.dl { font-size: 12px; color: var(--ink-3); font-weight: 600; }
.day.today .dl { color: var(--red); }
.wk-stats { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
.wk-stats div { display: flex; flex-direction: column; align-items: center; }
.wk-stats b { font-size: 20px; font-weight: 800; }
.wk-stats small { font-size: 12px; margin-left: 1px; }
.wk-stats span { font-size: 12px; color: var(--ink-3); }

.evening { display: flex; align-items: center; gap: 12px; padding: 14px; cursor: pointer; }
.ev-ic { width: 42px; height: 42px; border-radius: 12px; background: var(--blue-soft); color: var(--blue); display: grid; place-items: center; flex-shrink: 0; }
.ev-t { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ev-t b { font-size: 14px; }
.ev-t .sub { font-size: 12px; line-height: 1.5; }
</style>

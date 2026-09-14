<script setup>
import { ref, onMounted } from 'vue'
import { go } from '../../store'
import { me } from '../../data/scenario'
import YoxiLogo from '../../components/YoxiLogo.vue'

const showMain = ref(false)
onMounted(() => setTimeout(() => (showMain.value = true), 650))
</script>

<template>
  <div class="scr lock">
    <div class="wall"></div>
    <div class="clock">
      <div class="date">9月15日 星期二</div>
      <div class="time num">7:52</div>
    </div>

    <div class="stack">
      <Transition name="drop">
        <button v-if="showMain" class="notif main" @click="go('home')">
          <div class="n-head">
            <span class="app"><YoxiLogo mark :height="13" color="#fff" /></span>
            <span class="app-name">yoxi 順路圈</span>
            <span class="when">現在</span>
          </div>
          <div class="n-title">今天 08:15，有 2 位同路線夥伴</div>
          <div class="n-body">
            往內湖科學園區。集合點在民生敦化路口，走路 {{ me.walk.minutes }} 分鐘。這趟約 ${{ me.pay }}，比自己叫車省 ${{ me.saved }}。
          </div>
          <div class="n-actions">
            <span>加入今天的順路車</span>
            <span>稍後提醒</span>
          </div>
        </button>
      </Transition>

      <button class="notif ghost" @click="go('pulse')">
        <div class="n-head">
          <span class="app"><YoxiLogo mark :height="13" color="#fff" /></span>
          <span class="app-name">yoxi 通勤預報</span>
          <span class="when">07:30</span>
        </div>
        <div class="n-title">今天午後有雷陣雨</div>
        <div class="n-body">18:00 後內湖叫車等候時間預估拉長到 14 分鐘，建議預約回程順路車。</div>
      </button>
    </div>

    <div class="hint">點擊通知開啟 yoxi</div>
  </div>
</template>

<style scoped>
.lock { color: #fff; background: #051122; }
.wall {
  position: absolute; inset: 0;
  background:
    radial-gradient(120% 60% at 80% 110%, rgba(241, 74, 66, 0.75), transparent 60%),
    radial-gradient(90% 50% at 0% 0%, rgba(12, 76, 128, 0.9), transparent 70%),
    linear-gradient(180deg, #051122 0%, #0a1d38 55%, #3b1f35 100%);
}
.clock { position: relative; text-align: center; margin-top: 92px; }
.date { font-size: 17px; font-weight: 500; opacity: 0.85; }
.time { font-size: 92px; font-weight: 600; line-height: 1; letter-spacing: -0.03em; margin-top: 2px; }

.stack { position: relative; margin: 44px 12px 0; display: flex; flex-direction: column; gap: 8px; }
.notif {
  text-align: left; width: 100%; border-radius: 22px; padding: 12px 14px 14px;
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4);
  color: #fff; border: 0.5px solid rgba(255, 255, 255, 0.18);
}
.notif.main { background: rgba(255, 255, 255, 0.26); box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.5); animation: breathe 2.6s ease-in-out 1.2s infinite; }
@keyframes breathe { 50% { transform: scale(1.012); } }
.notif.ghost { opacity: 0.75; transform: scale(0.97); }
.n-head { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.app { width: 22px; height: 22px; border-radius: 6px; background: var(--red); display: grid; place-items: center; }
.app-name { flex: 1; font-weight: 600; opacity: 0.9; }
.when { opacity: 0.7; font-size: 12px; }
.n-title { font-size: 15px; font-weight: 700; margin-top: 8px; }
.n-body { font-size: 14px; line-height: 1.5; opacity: 0.92; margin-top: 2px; }
.n-actions { display: grid; grid-template-columns: 1.4fr 1fr; gap: 8px; margin-top: 12px; }
.n-actions span { background: rgba(255, 255, 255, 0.22); border-radius: 12px; height: 38px; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
.n-actions span:first-child { background: #fff; color: var(--red-deep); }
.hint { position: absolute; bottom: 44px; width: 100%; text-align: center; font-size: 13px; opacity: 0.6; }

.drop-enter-active { transition: all 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.drop-enter-from { opacity: 0; transform: translateY(-40px) scale(0.92); }
</style>

<script setup>
import { ref } from 'vue'
import { back } from '../../store'
import { tripTabs } from '../../data/origin'
import Icon from '../../components/Icon.vue'

const tab = ref('預約叫車(0)')
</script>

<template>
  <div class="scr o">
    <header class="hd">
      <button class="x" @click="back"><Icon name="close" :size="22" /></button>
      <h1>行程紀錄</h1>
      <div class="tabs">
        <button v-for="t in tripTabs" :key="t" :class="{ on: t === tab }" @click="tab = t">
          <Icon :name="t === '個人行程' ? 'user' : t === '企業簽單' ? 'building' : t === '預約叫車(0)' ? 'clock' : 'nav'" :size="12" />
          {{ t }}
        </button>
      </div>
    </header>

    <div class="body">
      <div class="empty">
        <svg width="190" height="96" viewBox="0 0 190 96" fill="none" aria-hidden="true">
          <path d="M8 90L52 30l30 42 22-28 34 46z" fill="#C6CFD9" />
          <path d="M104 90l38-52 40 52z" fill="#96A3B2" />
          <rect x="78" y="62" width="30" height="20" rx="4" fill="#5E6B7A" />
          <rect x="83" y="56" width="20" height="9" rx="3" fill="#5E6B7A" />
          <circle cx="85" cy="84" r="4" fill="#2E3843" />
          <circle cx="101" cy="84" r="4" fill="#2E3843" />
        </svg>
        <div class="gs">Get Started.</div>
        <p>您目前沒有任何行程喔</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.o { background: #fff; }
.hd { background: #DE262A; color: #fff; padding: 92px 0 14px; flex-shrink: 0; }
.x { position: absolute; top: 56px; left: 14px; color: #fff; z-index: 2; }
.hd h1 { font-size: 21px; font-weight: 700; padding: 0 18px; margin-bottom: 12px; }
.tabs { display: flex; gap: 5px; padding: 0 14px; overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tabs button { display: inline-flex; align-items: center; gap: 3px; height: 27px; padding: 0 9px; border-radius: 14px; background: #fff; color: #1C2430; font-size: 11.5px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
.tabs button.on { background: #0B1F36; color: #fff; }

.body { flex: 1; background: #fff; border-radius: 14px 14px 0 0; margin-top: -6px; display: grid; place-items: center; }
.empty { display: flex; flex-direction: column; align-items: center; transform: translateY(-20px); }
.gs { font-size: 28px; font-weight: 700; font-style: italic; color: #9AA6B3; margin-top: 6px; }
.empty p { font-size: 13px; color: #6B7684; margin-top: 12px; }
</style>

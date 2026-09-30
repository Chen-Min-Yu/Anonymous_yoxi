<script setup>
import Icon from './Icon.vue'
import { go, toast } from '../store'

const props = defineProps({ active: String, driver: Boolean })

const driverTabs = [
  { id: 'd-home', label: '接單', icon: 'car' },
  { id: 'd-earn', label: '收入', icon: 'chart' },
  { id: null, label: '訊息', icon: 'message' },
  { id: null, label: '我的', icon: 'user' },
]

function tap(t) {
  if (t.id) go(t.id)
  else toast('此頁面不在本次原型範圍')
}
</script>

<template>
  <nav class="tabbar">
    <button v-for="t in driverTabs" :key="t.label" :class="{ on: t.id === props.active }" @click="tap(t)">
      <Icon :name="t.icon" :size="23" :stroke="t.id === props.active ? 2.3 : 1.8" />
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabbar {
  flex-shrink: 0; display: grid; grid-template-columns: repeat(4, 1fr); height: 84px; padding: 8px 10px 26px;
  background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(14px); border-top: 1px solid var(--line); position: relative; z-index: 600;
}
button { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; color: var(--ink-3); }
button.on { color: var(--red); }
</style>

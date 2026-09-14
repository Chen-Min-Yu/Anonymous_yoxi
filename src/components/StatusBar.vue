<script setup>
defineProps({ dark: Boolean, solid: Boolean })
</script>

<template>
  <div class="sb" :class="{ dark, solid }">
    <span class="time num">7:52</span>
    <span class="right">
      <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
      <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5l2.3-2.6a3.2 3.2 0 00-4.6 0L8 11.5zM3.6 6.9a6.2 6.2 0 018.8 0l1.5-1.6a8.4 8.4 0 00-11.8 0l1.5 1.6zM.4 3.5a10.8 10.8 0 0115.2 0L16 3 14.6 1.6a12.8 12.8 0 00-13.2 0L0 3l.4.5z" /></svg>
      <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" /><rect x="2.5" y="2.5" width="15" height="7" rx="1.5" /><rect x="24" y="4" width="1.6" height="4" rx=".8" opacity=".45" /></svg>
    </span>
  </div>
</template>

<style scoped>
.sb {
  position: absolute; top: 0; left: 0; right: 0; height: 54px; z-index: 1600; pointer-events: none;
  display: flex; align-items: center; justify-content: space-between; padding: 6px 30px 0 40px; color: var(--navy);
}
.sb.dark { color: #fff; }
.sb.solid { background: linear-gradient(var(--bg) 78%, rgba(244, 247, 251, 0)); }
.time { font-size: 16px; font-weight: 700; }
.right { display: flex; gap: 6px; align-items: center; }
svg { fill: currentColor; }
</style>

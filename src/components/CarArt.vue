<script setup>
// yoxi 車種清單用的車輛側視圖示（依錄影中的車款造型重畫）
defineProps({ art: { type: String, default: 'sedan' }, badge: String, size: { type: Number, default: 64 } })

const body = {
  sedan: { paint: '#E9EDF2', shade: '#CBD3DD', glass: '#3C4654' },
  suv: { paint: '#F2F5F8', shade: '#D2DAE3', glass: '#38424F' },
  taxi: { paint: '#FFC820', shade: '#E0A800', glass: '#2E3642' },
  black: { paint: '#2B3138', shade: '#181D23', glass: '#0E1319' },
  van: { paint: '#22262C', shade: '#12161B', glass: '#0C1016' },
}
</script>

<template>
  <svg :width="size" :height="size * 0.62" viewBox="0 0 100 62" fill="none" aria-hidden="true">
    <ellipse cx="50" cy="55" rx="40" ry="4.5" fill="#0B1F36" opacity=".12" />

    <!-- 車身：van 車頂較高較方，其餘為轎車／休旅車輪廓 -->
    <g v-if="art === 'van'">
      <path d="M8 46V27c0-3 1.5-5 4-6l16-6c3-1.2 5-1.6 9-1.6h26c9 0 20 5 27 11 3 2.6 4 4.6 4 8v13z" :fill="body[art].paint" />
      <path d="M30 15h22v14H22z" :fill="body[art].glass" />
      <path d="M56 15h8c7 0 16 5 21 14H56z" :fill="body[art].glass" />
      <path d="M8 40h86v6H8z" :fill="body[art].shade" opacity=".55" />
    </g>
    <g v-else-if="art === 'suv'">
      <path d="M7 46V32c0-2.6 1.4-4.4 4-5.4l14-5 8-7.2c2-1.8 4-2.4 7-2.4h20c4 0 6.6.8 9.6 3l8.4 6.6 12 5c6 2.4 7 4.4 7 8.4v11z" :fill="body[art].paint" />
      <path d="M35 15h15v11H26z" :fill="body[art].glass" />
      <path d="M54 15h6c2.6 0 4 .5 6 2l9 9H54z" :fill="body[art].glass" />
      <path d="M7 40h90v6H7z" :fill="body[art].shade" opacity=".5" />
    </g>
    <g v-else>
      <path d="M6 46V35c0-2.6 1.6-4.4 4.2-5.2l16-5 9-7c2-1.6 4-2.2 6.8-2.2h18c3.8 0 6 .8 8.8 2.8l9.2 6.6 12.6 4.8c6 2.3 6.4 4.4 6.4 8.2v8z" :fill="body[art].paint" />
      <path d="M36 17h14v12H27z" :fill="body[art].glass" />
      <path d="M54 17h5c2.4 0 3.6.5 5.4 1.9L73 29H54z" :fill="body[art].glass" />
      <path d="M6 41h92v5H6z" :fill="body[art].shade" opacity=".5" />
    </g>

    <!-- 計程車頂燈與 yoxi 車身標 -->
    <template v-if="art === 'taxi'">
      <rect x="38" y="9" width="14" height="6" rx="2" fill="#D8303C" />
      <rect x="52" y="32" width="22" height="9" rx="2" fill="#E0242B" />
      <text x="63" y="39.2" text-anchor="middle" font-size="7" font-weight="800" fill="#fff" font-family="Inter, sans-serif">yoxi</text>
    </template>

    <!-- 車輪 -->
    <g>
      <circle cx="27" cy="46" r="8.5" fill="#1B2027" />
      <circle cx="27" cy="46" r="3.6" fill="#AEB7C2" />
      <circle cx="74" cy="46" r="8.5" fill="#1B2027" />
      <circle cx="74" cy="46" r="3.6" fill="#AEB7C2" />
    </g>

    <!-- 左上角標記：不限車種為紅色閃電、減碳車種為綠色葉片 -->
    <g v-if="badge === 'bolt'">
      <circle cx="15" cy="14" r="11" fill="#E0242B" />
      <path d="M17 7l-6 8h4l-1 6 6-8h-4z" fill="#fff" />
    </g>
    <g v-else-if="badge === 'leaf'">
      <circle cx="15" cy="14" r="11" fill="#2FA84F" />
      <path d="M10 19c0-6 4-9 10-9 0 6-4 9-10 9zm0 0l5-5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" />
    </g>
  </svg>
</template>

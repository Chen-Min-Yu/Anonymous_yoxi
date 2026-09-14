<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 22 },
  stroke: { type: [Number, String], default: 2 },
})

const paths = {
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 5l7 7-7 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  bell: 'M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 21h4',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  walk: 'M13 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.5 22l2.5-7 2.5 2.5V22M8 11.5l2-4.5 3.5 1 2 3.5 2.5 1M10 7l-1.5 8',
  car: 'M4 16v-4l2-5h12l2 5v4M4 16h16M4 16v3h3v-3M17 16v3h3v-3M7.5 12.5h.01M16.5 12.5h.01',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.3a3.5 3.5 0 010 6.4M18 14.5a6.5 6.5 0 013.5 5.5',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7',
  coin: 'M12 21a9 9 0 100-18 9 9 0 000 18zM14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01M2 21h20',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM6 15V9a3 3 0 013-3h1M18 9v6a3 3 0 01-3 3h-5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z',
  shield: 'M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3zM9 12l2 2 4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  home: 'M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  gift: 'M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-1.5-3-5-3.5-5-1.5S9 7 12 7zm0 0c1.5-3 5-3.5 5-1.5S15 7 12 7z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z',
  phone: 'M5 4h3.5l1.5 4-2 1.5a11 11 0 006.5 6.5l1.5-2 4 1.5V19a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  message: 'M4 5h16v11H9l-5 4V5z',
  nav: 'M12 2l7.5 19-7.5-4-7.5 4L12 2z',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5h.01',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  doc: 'M6 3h9l4 4v14H6V3zM14 3v5h5M9 13h7M9 17h5',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  swap: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  map: 'M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4zM9 4v13.5M15 6.5V20',
  menu:'M4 7h16M4 12h16M4 17h16',
  play: 'M7 4.5v15l12-7.5-12-7.5z',
  wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l12-3v3M16 13.5h.01',
}
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>

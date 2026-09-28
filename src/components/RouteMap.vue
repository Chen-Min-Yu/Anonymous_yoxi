<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'

/*
  layers: [{ type: 'line', coords, color, weight, dash, opacity }
           { type: 'marker', latlng, html, size:[w,h], anchor:[x,y], id }]
*/
const props = defineProps({
  layers: { type: Array, default: () => [] },
  fit: { type: Array, default: null }, // latlngs to fit
  padding: { type: Array, default: () => [30, 30] },
  paddingBottom: { type: Number, default: 0 },
  paddingTop: { type: Number, default: 60 },
  interactive: { type: Boolean, default: true },
  showLabels: { type: Boolean, default: true },
})

// 離線向量底圖：OpenStreetMap 道路／河流／公園（public/basemap.json），現場 demo 不需網路
let basePromise
function loadBase() {
  basePromise ||= fetch('./basemap.json').then((r) => r.json())
  return basePromise
}

const baseLabels = [
  { t: '基隆河', ll: [25.0735, 121.5525], cls: 'water' },
  { t: '松山機場', ll: [25.0665, 121.5585], cls: 'area' },
  { t: '民生東路', ll: [25.0583, 121.5415], cls: 'road' },
  { t: '民生社區', ll: [25.0600, 121.5610], cls: 'area' },
  { t: '內湖科學園區', ll: [25.0822, 121.5745], cls: 'area' },
]

async function drawBase(m, showLabels = true) {
  const data = await loadBase()
  if (!m._container) return
  const renderer = L.canvas({ padding: 0.3, pane: 'basePane' })
  const styles = {
    park: { color: '#DDEBDF', fillColor: '#DDEBDF', fillOpacity: 1, weight: 0 },
    water: { color: '#C9DDEE', fillColor: '#C9DDEE', fillOpacity: 1, weight: 0 },
  }
  L.polygon(data.park, { ...styles.park, renderer, interactive: false }).addTo(m)
  L.polygon(data.water, { ...styles.water, renderer, interactive: false }).addTo(m)
  const roads = [
    L.polyline(data.minor, { color: '#FFFFFF', renderer, interactive: false }),
    L.polyline(data.mid, { color: '#D6DEE8', renderer, interactive: false }),
    L.polyline(data.mid, { color: '#FFFFFF', renderer, interactive: false }),
    L.polyline(data.major, { color: '#C9D3E0', renderer, interactive: false }),
    L.polyline(data.major, { color: '#FFFFFF', renderer, interactive: false }),
  ]
  const widths = { 13: [0.6, 2.2, 1.4, 4, 3], 14: [1, 3.2, 2.2, 5.5, 4], 15: [1.8, 5, 3.6, 8, 6.2], 16: [3, 7.5, 5.8, 11, 9] }
  const restyle = () => {
    const w = widths[Math.max(13, Math.min(16, Math.round(m.getZoom())))]
    roads.forEach((r, i) => r.setStyle({ weight: w[i], lineCap: 'round', lineJoin: 'round' }))
  }
  roads.forEach((r) => r.addTo(m))
  restyle()
  m.on('zoomend', restyle)
  if (showLabels) baseLabels.forEach((lb) =>
    L.marker(lb.ll, {
      interactive: false, pane: 'labelPane',
      icon: L.divIcon({ className: '', html: `<span class="base-label ${lb.cls}">${lb.t}</span>`, iconSize: [0, 0] }),
    }).addTo(m),
  )
}

const el = ref(null)
let map
const markers = {}
let group

function draw() {
  if (group) group.remove()
  group = L.layerGroup().addTo(map)
  for (const k in markers) delete markers[k]
  for (const ly of props.layers) {
    if (ly.type === 'line') {
      if (ly.casing) {
        L.polyline(ly.coords, { color: '#fff', weight: (ly.weight || 5) + 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(group)
      }
      L.polyline(ly.coords, {
        color: ly.color, weight: ly.weight || 5, opacity: ly.opacity ?? 1,
        dashArray: ly.dash, lineCap: 'round', lineJoin: 'round',
      }).addTo(group)
    } else if (ly.type === 'poly') {
      const pg = L.polygon(ly.coords, {
        fillColor: ly.fill, fillOpacity: ly.fillOpacity ?? 0.78,
        color: ly.stroke || '#fff', weight: ly.weight ?? 1.5, opacity: ly.strokeOpacity ?? 0.9,
        interactive: !!ly.onClick, bubblingMouseEvents: false,
      }).addTo(group)
      if (ly.onClick) pg.on('click', () => ly.onClick())
    } else if (ly.type === 'dot') {
      const cm = L.circleMarker(ly.latlng, {
        radius: ly.radius ?? 8, fillColor: ly.fill, fillOpacity: ly.fillOpacity ?? 0.85,
        color: ly.stroke || '#fff', weight: ly.weight ?? 1.5, opacity: ly.strokeOpacity ?? 1,
        interactive: !!ly.onClick, bubblingMouseEvents: false, pane: 'dotPane',
      }).addTo(group)
      if (ly.onClick) cm.on('click', () => ly.onClick())
    } else if (ly.type === 'marker') {
      const size = ly.size || [28, 28]
      const icon = L.divIcon({
        className: '', html: ly.html, iconSize: size,
        iconAnchor: ly.anchor || [size[0] / 2, size[1] / 2],
      })
      const m = L.marker(ly.latlng, { icon, interactive: false, zIndexOffset: ly.z || 0 }).addTo(group)
      if (ly.id) markers[ly.id] = m
    }
  }
}

function fitView() {
  if (!props.fit || !props.fit.length) return
  map.fitBounds(L.latLngBounds(props.fit), {
    paddingTopLeft: [props.padding[0], props.paddingTop],
    paddingBottomRight: [props.padding[1], props.paddingBottom + props.padding[1]],
    animate: false,
  })
}

onMounted(() => {
  map = L.map(el.value, {
    zoomControl: false, attributionControl: true,
    dragging: props.interactive, scrollWheelZoom: props.interactive, doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    minZoom: 12, maxZoom: 16, zoomSnap: 0.25,
    maxBounds: [[25.03, 121.52], [25.10, 121.60]], maxBoundsViscosity: 1,
  })
  map.createPane('basePane').style.zIndex = 250
  map.createPane('dotPane').style.zIndex = 320
  map.createPane('labelPane').style.zIndex = 350
  map.getPane('labelPane').style.pointerEvents = 'none'
  map.attributionControl.setPrefix(false).addAttribution('&copy; OpenStreetMap contributors')
  drawBase(map, props.showLabels)
  map.setView([25.066, 121.562], 14)
  draw()
  fitView()
  // 等畫面轉場結束後重新計算尺寸
  setTimeout(() => { map.invalidateSize(); fitView() }, 460)
})

onBeforeUnmount(() => map && map.remove())

watch(() => props.layers, draw, { deep: false })

function moveMarker(id, latlng) {
  markers[id] && markers[id].setLatLng(latlng)
}
function flyTo(latlngs) {
  map.flyToBounds(L.latLngBounds(latlngs), {
    paddingTopLeft: [props.padding[0], props.paddingTop],
    paddingBottomRight: [props.padding[1], props.paddingBottom + props.padding[1]],
    duration: 0.8,
  })
}
defineExpose({ moveMarker, fitView, flyTo })
</script>

<template>
  <div ref="el" class="map"></div>
</template>

<style scoped>
.map { position: absolute; inset: 0; z-index: 0; }
</style>

import { routes, riders, places } from '../data/scenario'

export const riderColor = { A: '#F14A42', B: '#0C4C80', C: '#4180A1' }

export const carSvg =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-4l2-5h12l2 5v4M4 16h16M4 16v3h3v-3M17 16v3h3v-3"/></svg>'
const walkSvg =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.5 22l2.5-7 2.5 2.5V22M8 11.5l2-4.5 3.5 1 2 3.5 2.5 1M10 7l-1.5 8"/></svg>'

export function riderPin(r, label) {
  return {
    type: 'marker', latlng: r.latlng, size: [28, 28], z: 200,
    html: `<div class="pin" style="width:28px;height:28px;background:${riderColor[r.id]}">${label ?? r.initial}</div>`,
  }
}

export function dropPin(r, n) {
  return {
    type: 'marker', latlng: r.dropLatlng, size: [24, 24], z: 150,
    html: `<div class="pin" style="width:24px;height:24px;border-radius:7px;background:#051122">${n}</div>`,
  }
}

export function meetPin(label) {
  const lab = label ? `<div class="map-label" style="left:22px;top:0">${label}</div>` : ''
  return {
    type: 'marker', latlng: places.meetup.latlng, size: [44, 44], z: 400,
    html: `<div style="position:relative"><div class="pin-meet">${walkSvg}</div>${lab}</div>`,
  }
}

export function carPin(latlng, id = 'car') {
  return { type: 'marker', id, latlng, size: [34, 34], z: 500, html: `<div class="pin-car">${carSvg}</div>` }
}

export const lines = {
  walk: (r, opts = {}) => ({ type: 'line', coords: routes[r.walk.key], color: riderColor[r.id], weight: 4, dash: '1 8', ...opts }),
  shared3: { type: 'line', coords: routes.shared3, color: '#0C4C80', weight: 6, casing: true },
  shared2: { type: 'line', coords: routes.shared2, color: '#0C4C80', weight: 6, casing: true, opacity: 0.75 },
  soloC: { type: 'line', coords: routes.soloC, color: '#F14A42', weight: 6, casing: true },
  approach: { type: 'line', coords: routes.approach, color: '#778AA4', weight: 4, dash: '6 8' },
}

export const allRoute = [...routes.shared3, ...routes.shared2, ...routes.soloC]

export function sampleAlong(coords, t) {
  // 依累積距離在折線上取點，t = 0..1
  if (!coords.length) return null
  const d = [0]
  for (let i = 1; i < coords.length; i++) {
    const dy = coords[i][0] - coords[i - 1][0]
    const dx = (coords[i][1] - coords[i - 1][1]) * Math.cos((coords[i][0] * Math.PI) / 180)
    d.push(d[i - 1] + Math.hypot(dx, dy))
  }
  const target = d[d.length - 1] * Math.min(1, Math.max(0, t))
  let i = d.findIndex((v) => v >= target)
  if (i <= 0) return coords[0]
  const f = (target - d[i - 1]) / (d[i] - d[i - 1] || 1)
  return [coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * f, coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * f]
}

export { riders, routes, places }

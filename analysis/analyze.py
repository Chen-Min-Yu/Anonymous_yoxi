"""yoxi 行程資料分析：產出城市脈動與順路圈原型使用的真實統計值。

執行：uv run --with pandas --with numpy python analysis/analyze.py
輸出：analysis/results.json（完整結果）、src/data/real.json（原型使用的精簡版）
"""
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

SRC = '/Users/chenminyu/Downloads/yoxi_數據資料.csv'
ROOT = Path(__file__).resolve().parents[1]

df = pd.read_csv(SRC, parse_dates=['OrderStartDateTime_UTC8', 'OrderFormCreatedTime_UTC8'])
df = df.rename(columns={
    'OrderStartDateTime_UTC8': 'start', 'OrderFormCreatedTime_UTC8': 'created',
    'PickUpLatitude': 'plat', 'PickUpLongitude': 'plng', 'DropOffLatitude': 'dlat', 'DropOffLongitude': 'dlng',
    'TravelTime': 'ride_min', 'TravelDistance': 'dist_m',
})
df['wait'] = (df.start - df.created).dt.total_seconds() / 60
df['hour'] = df.start.dt.hour
df['minute_of_day'] = df.hour * 60 + df.start.dt.minute
df['weekday'] = df.start.dt.dayofweek < 5
df['date'] = df.start.dt.date
lo_hi = df.PaymentTotalRange.str.extract(r'\[(\d+),(\d+)\]').astype(float)
df['pay_mid'] = (lo_hi[0] + lo_hi[1]) / 2

# 即時叫車：等車 30 分鐘以上多為預約單，排除於等車時間統計
instant = df[(df.wait > 0) & (df.wait <= 30)]
R = {}

R['overview'] = {
    'trips': int(len(df)), 'riders': int(df.RiderId.nunique()), 'days': int(df.date.nunique()),
    'date_from': str(df.start.min().date()), 'date_to': str(df.start.max().date()),
    'instant_share': round(len(instant) / len(df), 4),
    'wait_median': round(instant.wait.median(), 2), 'wait_p90': round(instant.wait.quantile(.9), 2),
    'dist_median_m': int(df.dist_m.median()), 'ride_median_min': int(df.ride_min.median()),
    'poi_tagged_share': round(df.PickUpLocationType.notna().mean(), 4),
}

# ---------- 時段 × 等車 ----------
by_hour = instant.groupby(['weekday', 'hour']).wait.agg(['median', 'count']).reset_index()
R['wait_by_hour'] = {
    'weekday': [{'h': int(r.hour), 'wait': round(r['median'], 2), 'n': int(r['count'])} for _, r in by_hour[by_hour.weekday].iterrows()],
    'weekend': [{'h': int(r.hour), 'wait': round(r['median'], 2), 'n': int(r['count'])} for _, r in by_hour[~by_hour.weekday].iterrows()],
}

# ---------- 六角網格（與原型 pulse.js 相同參數） ----------
S, N, W, E = 25.036, 25.094, 121.525, 121.598
R_LAT = 0.0036
R_LNG = R_LAT / math.cos(math.radians(25.065))
DY, DX = R_LAT * 1.5, R_LNG * math.sqrt(3)
COS = math.cos(math.radians(25.065))


def hex_centers():
    out, row, lat = [], 0, S
    while lat <= N + 1e-9:
        lng = W + (DX / 2 if row % 2 else 0)
        while lng <= E + 1e-9:
            out.append((row, lat, lng))
            lng += DX
        lat += DY
        row += 1
    return out


CENTERS = hex_centers()
C_LAT = np.array([c[1] for c in CENTERS])
C_LNG = np.array([c[2] for c in CENTERS])


def assign_cell(lat, lng):
    """回傳每個點最近的六角格索引（不在範圍內為 -1）。"""
    lat = np.asarray(lat)
    lng = np.asarray(lng)
    idx = np.full(len(lat), -1)
    inside = (lat > S - DY) & (lat < N + DY) & (lng > W - DX) & (lng < E + DX)
    pts = np.where(inside)[0]
    for start in range(0, len(pts), 20000):
        sl = pts[start:start + 20000]
        d = (lat[sl, None] - C_LAT[None, :]) ** 2 + ((lng[sl, None] - C_LNG[None, :]) * COS) ** 2
        idx[sl] = d.argmin(axis=1)
    return idx


box = instant[(instant.plat.between(S - .005, N + .005)) & (instant.plng.between(W - .005, E + .005))].copy()
box['cell'] = assign_cell(box.plat.values, box.plng.values)

SLOTS = {
    'now': ('平日 07:30–08:30', box.weekday & box.minute_of_day.between(450, 509)),
    'h9': ('平日 09:00–10:00', box.weekday & (box.hour == 9)),
    'h18': ('平日 18:00–19:00', box.weekday & (box.hour == 18)),
    'h2130': ('每日 21:00–22:00', box.hour == 21),
}
MIN_N = 15
grid = {}
for key, (label, mask) in SLOTS.items():
    g = box[mask].groupby('cell').wait.agg(['median', 'count'])
    days = box[mask].date.nunique()
    cells = []
    for ci, r in g.iterrows():
        if ci < 0 or r['count'] < MIN_N:
            continue
        _, lat, lng = CENTERS[ci]
        cells.append({'lat': round(lat, 5), 'lng': round(lng, 5), 'wait': round(r['median'], 1),
                      'n': int(r['count']), 'per_day': round(r['count'] / days, 1)})
    grid[key] = {'label': label, 'days': int(days), 'cells': cells,
                 'wait_median': round(box[mask].wait.median(), 2), 'trips': int(mask.sum())}
R['pulse_grid'] = grid

# ---------- 地標周邊 ----------
PLACES = {
    'arena': ('台北小巨蛋', 25.0513, 121.5497), 'airport': ('松山機場', 25.0632, 121.5520),
    'neihu': ('內湖科學園區', 25.0790, 121.5750), 'nanjing': ('南京復興', 25.0520, 121.5440),
    'minsheng': ('民生社區', 25.0598, 121.5575), 'dazhi': ('大直', 25.0805, 121.5455),
}


def near(lat, lng, plat, plng, m):
    return ((lat - plat) * 111000) ** 2 + ((lng - plng) * 111000 * COS) ** 2 <= m * m


areas = {}
for k, (name, la, ln) in PLACES.items():
    sub = instant[near(instant.plat, instant.plng, la, ln, 700)]
    rows = {}
    for key, (label, _) in SLOTS.items():
        if key == 'now':
            m = sub.weekday & sub.minute_of_day.between(450, 509)
        elif key == 'h9':
            m = sub.weekday & (sub.hour == 9)
        elif key == 'h18':
            m = sub.weekday & (sub.hour == 18)
        else:
            m = sub.hour == 21
        s = sub[m]
        rows[key] = {'wait': round(s.wait.median(), 1) if len(s) >= 10 else None, 'n': int(len(s)),
                     'p90': round(s.wait.quantile(.9), 1) if len(s) >= 10 else None,
                     'pay_mid': round(s.pay_mid.median(), 0) if len(s) >= 10 else None}
    areas[k] = {'name': name, 'slots': rows}
R['areas'] = areas

# 小巨蛋散場：21–23 點周邊上車量最高的日子 vs 一般日
arena = instant[near(instant.plat, instant.plng, 25.0513, 121.5497, 500) & instant.hour.between(21, 22)]
daily = arena.groupby('date').agg(n=('wait', 'size'), wait=('wait', 'median'))
top = daily.sort_values('n', ascending=False).head(5)
R['arena_events'] = {
    'normal_day_trips': round(daily.n.median(), 1), 'normal_day_wait': round(daily.wait.median(), 1),
    'top_days': [{'date': str(d), 'trips': int(r.n), 'wait': round(r.wait, 1)} for d, r in top.iterrows()],
}

# ---------- 通勤模式：同一乘客平日重複相同 OD（約 550 m 格）與相近時段 ----------
wk = df[df.weekday].copy()
wk['o'] = (wk.plat / .005).round().astype(int).astype(str) + '_' + (wk.plng / .005).round().astype(int).astype(str)
wk['d'] = (wk.dlat / .005).round().astype(int).astype(str) + '_' + (wk.dlng / .005).round().astype(int).astype(str)
wk['hb'] = wk.hour
pat = wk.groupby(['RiderId', 'o', 'd', 'hb']).size().rename('k').reset_index()
commute_pat = pat[pat.k >= 4]
wk = wk.merge(commute_pat[['RiderId', 'o', 'd', 'hb']].assign(commute=True), on=['RiderId', 'o', 'd', 'hb'], how='left')
wk['commute'] = wk.commute.fillna(False).astype(bool)
R['commute'] = {
    'weekday_trips': int(len(wk)),
    'commute_trip_share': round(wk.commute.mean(), 4),
    'commute_riders': int(wk[wk.commute].RiderId.nunique()),
    'commute_riders_share': round(wk[wk.commute].RiderId.nunique() / wk.RiderId.nunique(), 4),
    'poi_home_or_company_share': round(df.PickUpLocationType.isin(['住家', '公司', '家', 'Home', 'home']).mean(), 4),
    'commute_by_hour': [{'h': int(h), 'share': round(v, 3)} for h, v in wk.groupby('hour').commute.mean().items()],
}

# ---------- 共乘媒合潛力 ----------
# 條件：平日通勤時段（07–10、17–20），不同乘客，上車點 600 m 內、下車點 1 km 內、出發時間 10 分鐘內
peak = df[df.weekday & (df.hour.between(7, 9) | df.hour.between(17, 19))].copy()
peak = peak[(peak.dist_m >= 2000) & (peak.dist_m <= 30000)]
peak['t'] = (peak.start - pd.Timestamp('2026-01-01')).dt.total_seconds() / 60
peak['ob'] = (peak.plat / .006).round().astype(int).astype(str) + '_' + (peak.plng / .0066).round().astype(int).astype(str)
peak['db'] = (peak.dlat / .01).round().astype(int).astype(str) + '_' + (peak.dlng / .011).round().astype(int).astype(str)
peak['tb'] = (peak.t // 10).astype(int)

matched = np.zeros(len(peak), dtype=bool)
peak = peak.reset_index(drop=True)
keys = peak.groupby(['ob', 'db']).indices
for (_, _), ix in keys.items():
    if len(ix) < 2:
        continue
    sub = peak.loc[ix, ['RiderId', 't', 'plat', 'plng', 'dlat', 'dlng']].sort_values('t')
    arr = sub.values
    for i in range(len(arr)):
        j = i + 1
        while j < len(arr) and arr[j][1] - arr[i][1] <= 10:
            if arr[j][0] != arr[i][0]:
                po = ((arr[i][2] - arr[j][2]) * 111000) ** 2 + ((arr[i][3] - arr[j][3]) * 111000 * COS) ** 2
                do = ((arr[i][4] - arr[j][4]) * 111000) ** 2 + ((arr[i][5] - arr[j][5]) * 111000 * COS) ** 2
                if po <= 600 ** 2 and do <= 1000 ** 2:
                    matched[sub.index[i]] = True
                    matched[sub.index[j]] = True
            j += 1
peak['matched'] = matched
city = peak[peak.plat.between(24.95, 25.15) & peak.plng.between(121.40, 121.66)]
R['pool_potential'] = {
    'rule': '平日 07–10 / 17–20 點，行程 2–30 km；上車點 600 m 內、下車點 1 km 內、出發 10 分鐘內有其他乘客',
    'peak_trips': int(len(peak)), 'match_share': round(peak.matched.mean(), 4),
    'taipei_peak_trips': int(len(city)), 'taipei_match_share': round(city.matched.mean(), 4),
    'match_share_by_hour': [{'h': int(h), 'share': round(v, 3)} for h, v in peak.groupby('hour').matched.mean().items()],
    'matched_trip_dist_median_m': int(peak[peak.matched].dist_m.median()),
    'matched_trip_pay_mid_median': float(peak[peak.matched].pay_mid.median()),
}

# 熱門共乘走廊：配對成功行程的 起點格 → 終點格（約 1 km）
peak['oc'] = (peak.plat / .01).round() * .01
peak['oc2'] = (peak.plng / .011).round() * .011
peak['dc'] = (peak.dlat / .01).round() * .01
peak['dc2'] = (peak.dlng / .011).round() * .011
cor = (peak[peak.matched].groupby(['oc', 'oc2', 'dc', 'dc2'])
       .agg(trips=('Id', 'size'), riders=('RiderId', 'nunique'), dist=('dist_m', 'median')).reset_index()
       .sort_values('trips', ascending=False).head(15))
R['corridors'] = [{'o': [round(r.oc, 3), round(r.oc2, 3)], 'd': [round(r.dc, 3), round(r.dc2, 3)],
                   'trips': int(r.trips), 'riders': int(r.riders), 'dist_m': int(r.dist)} for _, r in cor.iterrows()]

# ---------- 示範走廊：民生社區 → 內湖科學園區 ----------
ms = df[near(df.plat, df.plng, 25.0590, 121.5530, 1200) & near(df.dlat, df.dlng, 25.0790, 121.5730, 1500)]
ms_wk_am = ms[ms.weekday & ms.minute_of_day.between(420, 600)]
ms_inst = ms_wk_am[(ms_wk_am.wait > 0) & (ms_wk_am.wait <= 30)].copy()
ms_inst['b15'] = (ms_inst.minute_of_day // 15) * 15
curve = ms_inst.groupby('b15').agg(wait=('wait', 'median'), ride=('ride_min', 'median'), n=('Id', 'size')).reset_index()
wk_days = df[df.weekday].date.nunique()
peak_ms = peak[near(peak.plat, peak.plng, 25.0590, 121.5530, 1200) & near(peak.dlat, peak.dlng, 25.0790, 121.5730, 1500) & (peak.hour < 12)]
R['demo_corridor'] = {
    'name': '民生社區 → 內湖科學園區（平日 07:00–10:00）',
    'trips': int(len(ms_wk_am)), 'riders': int(ms_wk_am.RiderId.nunique()),
    'trips_per_weekday': round(len(ms_wk_am) / wk_days, 1),
    'wait_median': round(ms_inst.wait.median(), 1), 'ride_median': round(ms_wk_am.ride_min.median(), 1),
    'dist_median_m': int(ms_wk_am.dist_m.median()), 'pay_mid_median': float(ms_wk_am.pay_mid.median()),
    'match_share': round(peak_ms.matched.mean(), 3) if len(peak_ms) else None,
    'curve': [{'t': f'{int(r.b15 // 60):02d}:{int(r.b15 % 60):02d}', 'wait': round(r.wait, 1), 'ride': round(r.ride, 1), 'n': int(r.n)}
              for _, r in curve.iterrows()],
}

# ---------- 車資 vs 里程（檢查原型費率假設） ----------
fare = df[(df.dist_m.between(5000, 6500))]
R['fare_check'] = {
    'dist_5_to_6_5km_pay_range_share': fare.PaymentTotalRange.value_counts(normalize=True).head(4).round(3).to_dict(),
}

(ROOT / 'analysis' / 'results.json').write_text(json.dumps(R, ensure_ascii=False, indent=2, default=str))

real = {k: R[k] for k in ['overview', 'pulse_grid', 'areas', 'arena_events', 'commute', 'pool_potential', 'demo_corridor', 'corridors', 'wait_by_hour']}
(ROOT / 'src' / 'data' / 'real.json').write_text(json.dumps(real, ensure_ascii=False, separators=(',', ':'), default=str))
print(json.dumps({k: v for k, v in R.items() if k not in ('pulse_grid', 'wait_by_hour')}, ensure_ascii=False, indent=1, default=str))
for k, v in R['pulse_grid'].items():
    print(k, v['label'], 'cells', len(v['cells']), 'median', v['wait_median'], 'trips', v['trips'])

"""共乘媒合率敏感度分析：媒合條件放寬程度 × 需求密度倍數。

需求密度倍數 k：把連續 k 個平日的行程視為同一天（只比對時刻），模擬需求量成長為現況 k 倍時的媒合率。
執行：uv run --with pandas --with numpy python analysis/pool_sensitivity.py
"""
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
COS = math.cos(math.radians(25.06))

df = pd.read_csv('/Users/chenminyu/Downloads/yoxi_數據資料.csv', parse_dates=['OrderStartDateTime_UTC8'],
                 usecols=['Id', 'RiderId', 'OrderStartDateTime_UTC8', 'PickUpLatitude', 'PickUpLongitude',
                          'DropOffLatitude', 'DropOffLongitude', 'TravelDistance'])
df.columns = ['id', 'rider', 'start', 'plat', 'plng', 'dlat', 'dlng', 'dist']
df = df[df.start.dt.dayofweek < 5]
h = df.start.dt.hour
df = df[(h.between(7, 9) | h.between(17, 19)) & df.dist.between(2000, 30000)]
df = df[df.plat.between(24.95, 25.15) & df.plng.between(121.40, 121.66)].reset_index(drop=True)  # 雙北
dates = sorted(df.start.dt.date.unique())
day_idx = {d: i for i, d in enumerate(dates)}
df['day'] = df.start.dt.date.map(day_idx)
df['tod'] = df.start.dt.hour * 60 + df.start.dt.minute + df.start.dt.second / 60

RULES = {
    'strict': (600, 1000, 10),   # 上車 600 m、下車 1 km、10 分鐘
    'meetup': (1000, 1500, 15),  # 集合點步行 1 km 內、下車 1.5 km、15 分鐘
    'loose': (1500, 2500, 20),
}


def match_share(pu_m, do_m, win, k):
    d = df.copy()
    d['g'] = d.day // k
    d['ob'] = (d.plat * 111000 / pu_m).round().astype(int)
    d['ob2'] = (d.plng * 111000 * COS / pu_m).round().astype(int)
    d['db'] = (d.dlat * 111000 / do_m).round().astype(int)
    d['db2'] = (d.dlng * 111000 * COS / do_m).round().astype(int)
    matched = np.zeros(len(d), dtype=bool)
    arr_all = d[['rider', 'tod', 'plat', 'plng', 'dlat', 'dlng']].to_numpy()
    for _, ix in d.groupby(['g', 'ob', 'ob2', 'db', 'db2']).indices.items():
        if len(ix) < 2:
            continue
        ix = ix[np.argsort(arr_all[ix, 1])]
        a = arr_all[ix]
        for i in range(len(a)):
            j = i + 1
            while j < len(a) and a[j, 1] - a[i, 1] <= win:
                if a[j, 0] != a[i, 0]:
                    po = ((a[i, 2] - a[j, 2]) * 111000) ** 2 + ((a[i, 3] - a[j, 3]) * 111000 * COS) ** 2
                    do = ((a[i, 4] - a[j, 4]) * 111000) ** 2 + ((a[i, 5] - a[j, 5]) * 111000 * COS) ** 2
                    if po <= pu_m ** 2 and do <= do_m ** 2:
                        matched[ix[i]] = matched[ix[j]] = True
                j += 1
    return round(float(matched.mean()), 4)


out = {'trips': int(len(df)), 'weekdays': len(dates), 'note': '分格比對為保守估計（跨格的近距離配對會漏算）', 'grid': []}
for name, (pu, do, win) in RULES.items():
    for k in (1, 3, 5, 10):
        s = match_share(pu, do, win, k)
        out['grid'].append({'rule': name, 'pickup_m': pu, 'dropoff_m': do, 'window_min': win, 'demand_x': k, 'match_share': s})
        print(name, k, s, flush=True)

(ROOT / 'analysis' / 'pool_sensitivity.json').write_text(json.dumps(out, ensure_ascii=False, indent=2))

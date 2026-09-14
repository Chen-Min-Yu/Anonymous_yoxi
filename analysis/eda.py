import pandas as pd, numpy as np
df = pd.read_csv('/Users/chenminyu/Downloads/yoxi_數據資料.csv',
    parse_dates=['OrderStartDateTime_UTC8','OrderEndDateTime_UTC8','OrderFormCreatedTime_UTC8'])
print(df.shape); print(df.dtypes)
print('date range', df.OrderStartDateTime_UTC8.min(), df.OrderStartDateTime_UTC8.max())
print('riders', df.RiderId.nunique())
df['wait'] = (df.OrderStartDateTime_UTC8 - df.OrderFormCreatedTime_UTC8).dt.total_seconds()/60
print(df.wait.describe(percentiles=[.01,.05,.25,.5,.75,.9,.95,.99]))
print('wait>30 share', (df.wait>30).mean(), 'neg', (df.wait<0).mean())
print(df.PaymentTotalRange.value_counts().head(10))
print(df.TravelDistance.describe(), df.TravelTime.describe())
print('PU POI notnull', df.PickUpLocationType.notna().mean()); print(df.PickUpLocationType.value_counts().head(25))
print(df.DropOffLocationType.value_counts().head(25))
print('lat/lon ranges', df.PickUpLatitude.quantile([.01,.5,.99]).tolist(), df.PickUpLongitude.quantile([.01,.5,.99]).tolist())
tr = df.OrderStartDateTime_UTC8
print(tr.dt.date.value_counts().sort_index().head(3), tr.dt.date.nunique())
print(tr.dt.hour.value_counts().sort_index())
# city bins
bb = df[(df.PickUpLatitude.between(25.03,25.10))&(df.PickUpLongitude.between(121.52,121.60))]
print('in demo bbox pickups', len(bb))
rc = df.RiderId.value_counts(); print('trips per rider', rc.describe(percentiles=[.5,.75,.9,.99]))

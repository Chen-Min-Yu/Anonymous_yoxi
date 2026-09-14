<script setup>
import { ref } from 'vue'
import { toast } from '../../store'
import Icon from '../../components/Icon.vue'
import TabBar from '../../components/TabBar.vue'

const tab = ref('me')
const email = ref('minyu.chen@ruiguang-tech.com.tw')
const joined = ref(true)

const kpis = [
  { k: '員工共乘趟次', v: '1,284', d: '較 8 月 +31%' },
  { k: '參與員工', v: '212', d: '占通勤員工 38%' },
  { k: '減少碳排', v: '0.74 t', d: 'CO2e，可列入 ESG 報告' },
  { k: '補助成本節省', v: '56%', d: '相較補助個人叫車' },
]
const depts = [
  { n: '研發中心', v: 92 }, { n: '業務部', v: 71 }, { n: '製造工程', v: 58 }, { n: '管理部', v: 34 },
]
</script>

<template>
  <div class="scr">
    <div class="scroll">
      <div class="head pad">
        <div class="eyebrow">yoxi 企業方案</div>
        <div class="h1">瑞光科技股份有限公司</div>
        <div class="seg">
          <button :class="{ on: tab === 'me' }" @click="tab = 'me'">員工視角</button>
          <button :class="{ on: tab === 'hr' }" @click="tab = 'hr'">人資後台報告</button>
        </div>
      </div>

      <!-- 員工 -->
      <div v-if="tab === 'me'" class="pad">
        <div class="join card">
          <div class="j-h">
            <span class="j-ic"><Icon name="mail" :size="20" /></span>
            <div>
              <b>公司信箱驗證</b>
              <small>用公司信箱加入，之後照常用自己的 yoxi 帳號搭車</small>
            </div>
          </div>
          <input v-model="email" class="inp" />
          <button v-if="!joined" class="btn btn-red" @click="joined = true; toast('驗證成功，已加入企業方案')">寄送驗證碼</button>
          <div v-else class="ok-row"><Icon name="check" :size="16" :stroke="2.6" /> 已驗證 · 員工編號 RG-20417</div>
        </div>

        <div class="quota card">
          <div class="q-h"><b>本月通勤補助</b><span class="num">$612 / $1,500</span></div>
          <div class="q-bar"><span style="width: 40.8%"></span></div>
          <div class="rules">
            <div><Icon name="users" :size="16" /><span>順路共乘補助 <b>50%</b></span></div>
            <div><Icon name="car" :size="16" /><span>單人叫車補助 <b>20%</b></span></div>
            <div><Icon name="clock" :size="16" /><span>適用時段 <b>平日 07:00–10:00、17:00–21:00</b></span></div>
          </div>
          <p class="hint">公司補助共乘比補助個人叫車多 30 個百分點，鼓勵同事一起搭。</p>
        </div>

        <div class="nobill card">
          <Icon name="doc" :size="22" />
          <div>
            <b>不用再報帳</b>
            <small>補助自動折抵，由 yoxi 每月統一開立企業月結帳單</small>
          </div>
        </div>
      </div>

      <!-- 人資 -->
      <div v-else class="pad">
        <div class="rp-h">
          <span class="chip chip-line"><Icon name="calendar" :size="13" /> 2026 年 9 月</span>
          <span class="muted small">資料更新至 9/14</span>
        </div>

        <div class="kpis">
          <div v-for="k in kpis" :key="k.k" class="kpi card">
            <span class="kk">{{ k.k }}</span>
            <b class="num">{{ k.v }}</b>
            <span class="kd">{{ k.d }}</span>
          </div>
        </div>

        <section class="ai card">
          <div class="ai-h"><Icon name="sparkle" :size="15" /> AI 生成月報摘要</div>
          <p>
            九月員工共乘通勤 <b>1,284 趟</b>，公司補助支出 <b>$70,620</b>。若同樣趟次改為補助個人叫車，預估需 <b>$160,500</b>，
            補助效率提升 56%。共乘減少行駛 <b>4,300 車公里</b>，約 <b>0.74 公噸 CO2e</b>。
          </p>
          <p>建議：業務部參與率偏低，主因是外勤時段不固定，可開放 17:00 後單向共乘補助。</p>
          <div class="src">數字皆來自 yoxi 行程資料彙整，語言模型只負責撰寫摘要，不自行推估數值。</div>
        </section>

        <section class="dept card">
          <div class="h2" style="font-size: 15px">各部門參與人數</div>
          <div v-for="d in depts" :key="d.n" class="d-row">
            <span class="dn">{{ d.n }}</span>
            <span class="db"><i :style="{ width: d.v + '%' }"></i></span>
            <span class="dv num">{{ d.v }}</span>
          </div>
        </section>

        <div class="acts">
          <button class="btn btn-ghost" @click="toast('月結帳單已寄至 hr@ruiguang-tech.com.tw')"><Icon name="doc" :size="18" /> 月結帳單</button>
          <button class="btn btn-navy" @click="toast('已匯出 ESG 碳排佐證報告 PDF')"><Icon name="leaf" :size="18" /> 匯出 ESG 報告</button>
        </div>
      </div>
      <div style="height: 24px"></div>
    </div>
    <TabBar active="enterprise" />
  </div>
</template>

<style scoped>
.head { padding-top: 62px; padding-bottom: 14px; }
.seg { display: grid; grid-template-columns: 1fr 1fr; background: var(--mist); border-radius: 12px; padding: 3px; margin-top: 12px; }
.seg button { height: 34px; border-radius: 9px; font-size: 13px; font-weight: 700; color: var(--ink-2); }
.seg button.on { background: #fff; color: var(--navy); box-shadow: var(--shadow-card); }

.join { padding: 16px; }
.j-h { display: flex; gap: 12px; }
.j-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--red-soft); color: var(--red); display: grid; place-items: center; flex-shrink: 0; }
.j-h b { font-size: 15px; display: block; }
.j-h small { font-size: 12px; color: var(--ink-3); line-height: 1.5; }
.inp { width: 100%; height: 46px; border: 1.5px solid var(--line); border-radius: 12px; padding: 0 12px; font: inherit; font-size: 14px; margin: 12px 0 10px; color: var(--navy); background: var(--bg); }
.inp:focus { outline: none; border-color: var(--navy); }
.ok-row { display: flex; align-items: center; gap: 6px; color: var(--blue); font-size: 13px; font-weight: 700; }

.quota { padding: 16px; margin-top: 12px; }
.q-h { display: flex; justify-content: space-between; font-size: 14px; }
.q-h span { font-weight: 700; color: var(--ink-2); }
.q-bar { height: 10px; border-radius: 5px; background: var(--mist); margin: 10px 0 14px; overflow: hidden; }
.q-bar span { display: block; height: 100%; background: var(--red); border-radius: 5px; }
.rules { display: flex; flex-direction: column; gap: 8px; }
.rules div { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-2); }
.rules svg { color: var(--steel); }
.rules b { color: var(--navy); }
.hint { font-size: 12px; color: var(--blue); background: var(--blue-soft); border-radius: 10px; padding: 8px 10px; margin-top: 12px; line-height: 1.6; }

.nobill { display: flex; gap: 12px; align-items: center; padding: 14px 16px; margin-top: 12px; color: var(--navy); }
.nobill b { font-size: 14px; display: block; }
.nobill small { font-size: 12px; color: var(--ink-3); }

.rp-h { display: flex; justify-content: space-between; align-items: center; }
.small { font-size: 12px; }
.kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.kpi { padding: 12px; display: flex; flex-direction: column; }
.kk { font-size: 12px; color: var(--ink-3); font-weight: 600; }
.kpi b { font-size: 24px; font-weight: 800; line-height: 1.25; }
.kd { font-size: 11px; color: var(--blue); font-weight: 600; }

.ai { padding: 14px 16px; margin-top: 12px; border-left: 4px solid var(--red); }
.ai-h { font-size: 12px; font-weight: 700; color: var(--red-deep); display: flex; align-items: center; gap: 5px; }
.ai p { font-size: 13px; line-height: 1.75; color: var(--ink-2); margin-top: 8px; }
.ai b { color: var(--navy); }
.src { font-size: 11px; color: var(--ink-3); margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line); }

.dept { padding: 14px 16px; margin-top: 12px; }
.d-row { display: grid; grid-template-columns: 64px 1fr 28px; align-items: center; gap: 10px; margin-top: 10px; font-size: 12px; }
.dn { color: var(--ink-2); font-weight: 600; }
.db { height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; }
.db i { display: block; height: 100%; background: var(--blue); border-radius: 5px; }
.dv { text-align: right; font-weight: 700; }

.acts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.acts .btn { font-size: 14px; }
</style>

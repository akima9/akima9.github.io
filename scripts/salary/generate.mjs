// 연봉별 실수령액 페이지(_salary/*.md)를 생성한다.
// 숫자는 모두 여기서 미리 계산해 front matter에 넣고, 렌더링은 _layouts/salary.html 이 맡는다.
//
// 사용법: node scripts/salary/generate.mjs
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calcNetPay, RATES } from "../../assets/js/salary/calc.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(root, "_salary");

// 단위: 만원. 2,000만~1억5,000만은 100만 단위, 이후 3억까지 1,000만 단위
const SALARIES = [];
for (let v = 2000; v <= 15000; v += 100) SALARIES.push(v);
for (let v = 16000; v <= 30000; v += 1000) SALARIES.push(v);

const won = (n) => `${n.toLocaleString("en-US")}원`;
const manwon = (n) => `${Math.round(n / 10_000).toLocaleString("en-US")}만원`;
const signed = (n) => `${n >= 0 ? "+" : "-"}${Math.abs(n).toLocaleString("en-US")}원`;

// 3500 → "3,500만원", 12000 → "1억 2,000만원", 10000 → "1억원"
function label(v) {
  if (v < 10_000) return `${v.toLocaleString("en-US")}만원`;
  const eok = Math.floor(v / 10_000);
  const rest = v % 10_000;
  return rest === 0 ? `${eok}억원` : `${eok}억 ${rest.toLocaleString("en-US")}만원`;
}
// 검색어 형태: "연봉 3500", "연봉 1억", "연봉 1억2천"
function keyword(v) {
  if (v < 10_000) return String(v);
  const eok = Math.floor(v / 10_000);
  const rest = v % 10_000;
  if (rest === 0) return `${eok}억`;
  return rest % 1000 === 0 ? `${eok}억${rest / 1000}천` : `${eok}억${rest}`;
}

const net = (v, opts = {}) => calcNetPay({ annualSalary: v * 10_000, ...opts });

function page(v) {
  const r = net(v);
  const url = (x) => `/salary/${x}/`;

  const family = [
    ["본인 1명", 1, 0],
    ["2명 (배우자)", 2, 0],
    ["3명 (8~20세 자녀 1명)", 3, 1],
    ["4명 (8~20세 자녀 2명)", 4, 2],
  ].map(([name, dependents, children]) => {
    const f = net(v, { dependents, children });
    return { name, incomeTax: won(f.incomeTax + f.localTax), monthlyNet: won(f.monthlyNet), diff: signed(f.monthlyNet - r.monthlyNet) };
  });

  const compare = [-1000, -500, 500, 1000]
    .map((d) => v + d)
    .filter((x) => SALARIES.includes(x))
    .map((x) => {
      const c = net(x);
      return { label: label(x), url: url(x), monthlyNet: won(c.monthlyNet), diff: signed(c.monthlyNet - r.monthlyNet) };
    });

  const raise = [100, 300, 500].map((d) => {
    const c = net(v + d);
    const gross = c.monthlyGross - r.monthlyGross;
    const gain = c.monthlyNet - r.monthlyNet;
    return { label: `${d}만원`, gross: signed(gross), net: signed(gain), keep: `${Math.round((gain / gross) * 100)}%` };
  });

  const noExempt = net(v, { nonTaxableMonthly: 0 });
  const severance = net(v, { severanceIncluded: true });
  const i = SALARIES.indexOf(v);
  const title = `연봉 ${label(v)} 실수령액 (${RATES.year}년)`;

  return {
    title,
    description: `${RATES.year}년 연봉 ${keyword(v)} 실수령액은 월 약 ${manwon(r.monthlyNet)}(${won(r.monthlyNet)})입니다. 세전 월급 ${won(r.monthlyGross)}에서 국민연금·건강보험·고용보험·소득세로 ${won(r.totalDeduction)}이 공제됩니다. 부양가족별 실수령액과 연봉 인상 효과도 확인하세요.`,
    salary: v,
    label: label(v),
    keyword: keyword(v),
    calc_url: `/?salary=${v * 10_000}`,
    r: {
      monthlyGross: won(r.monthlyGross),
      nonTaxable: won(r.nonTaxable),
      taxable: won(r.taxable),
      pension: won(r.pension),
      health: won(r.health),
      longTermCare: won(r.longTermCare),
      employment: won(r.employment),
      incomeTax: won(r.incomeTax),
      localTax: won(r.localTax),
      totalDeduction: won(r.totalDeduction),
      monthlyNet: won(r.monthlyNet),
      monthlyNetMan: manwon(r.monthlyNet),
      annualNet: won(r.annualNet),
      annualNetMan: manwon(r.annualNet),
      deductionRate: `${((r.totalDeduction / r.monthlyGross) * 100).toFixed(1)}%`,
    },
    family,
    compare,
    raise,
    no_exempt_net: won(noExempt.monthlyNet),
    no_exempt_diff: signed(noExempt.monthlyNet - r.monthlyNet),
    severance_net: won(severance.monthlyNet),
    severance_gross: won(severance.monthlyGross),
    prev: i > 0 ? { label: label(SALARIES[i - 1]), url: url(SALARIES[i - 1]) } : null,
    next: i < SALARIES.length - 1 ? { label: label(SALARIES[i + 1]), url: url(SALARIES[i + 1]) } : null,
  };
}

// 값마다 JSON 표기를 쓴다. JSON은 YAML의 부분집합이라 Jekyll이 그대로 읽는다.
const frontMatter = (data) =>
  `---\n${Object.entries(data).map(([k, val]) => `${k}: ${JSON.stringify(val)}`).join("\n")}\n---\n`;

mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith(".md")) rmSync(join(outDir, f));
for (const v of SALARIES) writeFileSync(join(outDir, `${v}.md`), frontMatter(page(v)));
console.log(`_salary/: ${SALARIES.length}개 페이지 생성`);

// 계산 기준 안내에 쓰는 값 (_includes/salary/basis.html)
const pct = (x) => `${+(x * 100).toFixed(4)}%`;
const siteData = {
  year: RATES.year,
  basis_label: RATES.basisLabel,
  pension_rate: pct(RATES.pension.rate),
  pension_min: won(RATES.pension.min),
  pension_max: won(RATES.pension.max),
  health_rate: pct(RATES.health.rate),
  care_rate: `건강보험료 × ${pct(RATES.longTermCare.rateOverHealth)}`,
  employment_rate: pct(RATES.employment.rate),
};
writeFileSync(join(root, "_data", "salary.json"), `${JSON.stringify(siteData, null, 2)}\n`);

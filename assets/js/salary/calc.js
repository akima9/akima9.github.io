// 연봉 실수령액 계산 (브라우저·Node 공용 ES module)
import { RATES } from "./rates-2026.js";
import { TABLE, AT_10M } from "./withholding-2026.js";

export { RATES };

// 10원 미만 절사. 부동소수 오차로 1원 모자라게 잘리는 것을 막기 위해 아주 작은 값을 더한다.
const floor10 = (x) => Math.floor(x / 10 + 1e-9) * 10;

// 간이세액표에서 공제대상가족 수(1~11명)별 세액을 찾는다.
function tableTax(monthly, dependents) {
  const col = Math.min(dependents, 11) - 1;
  if (monthly < TABLE[0][0] * 1000) return 0;
  if (monthly === 10_000_000) return AT_10M[col];
  if (monthly > 10_000_000) {
    const [, , fixed, lower, rate, applies98] = RATES.over10m.find(([lo, hi]) => monthly > lo && monthly <= hi);
    const excess = (monthly - lower) * (applies98 ? 0.98 : 1);
    return floor10(AT_10M[col] + fixed + excess * rate);
  }
  let lo = 0;
  let hi = TABLE.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const row = TABLE[mid];
    if (monthly < row[0] * 1000) hi = mid - 1;
    else if (monthly >= row[1] * 1000) lo = mid + 1;
    else return row[2 + col];
  }
  return 0;
}

// 월 근로소득세 (간이세액표 기준, 자녀 세액공제 반영)
export function incomeTax(monthly, dependents = 1, children = 0) {
  const d = Math.max(1, Math.floor(dependents));
  let tax = tableTax(monthly, d);
  // 비고 4: 공제대상가족 11명 초과
  if (d > 11) tax -= (tableTax(monthly, 10) - tableTax(monthly, 11)) * (d - 11);

  const { one, two, perExtra } = RATES.childDeduction;
  const c = Math.max(0, Math.floor(children));
  if (c === 1) tax -= one;
  else if (c >= 2) tax -= two + perExtra * (c - 2);
  return Math.max(0, tax);
}

export function calcNetPay({
  annualSalary,
  nonTaxableMonthly = 200_000,
  dependents = 1,
  children = 0,
  severanceIncluded = false,
}) {
  const monthlyGross = Math.floor(annualSalary / (severanceIncluded ? 13 : 12));
  const nonTaxable = Math.min(Math.max(0, nonTaxableMonthly), monthlyGross);
  const taxable = monthlyGross - nonTaxable;

  const { pension: p } = RATES;
  const pensionBase = Math.min(Math.max(Math.floor(taxable / 1000) * 1000, p.min), p.max);
  const pension = taxable > 0 ? floor10(pensionBase * p.rate) : 0;
  const health = floor10(taxable * RATES.health.rate);
  const longTermCare = floor10(health * RATES.longTermCare.rateOverHealth);
  const employment = floor10(taxable * RATES.employment.rate);
  const tax = incomeTax(taxable, dependents, children);
  const localTax = floor10(tax * RATES.localTax.rate);

  const totalDeduction = pension + health + longTermCare + employment + tax + localTax;
  const monthlyNet = monthlyGross - totalDeduction;
  return {
    annualSalary,
    monthlyGross,
    nonTaxable,
    taxable,
    pension,
    health,
    longTermCare,
    employment,
    incomeTax: tax,
    localTax,
    totalDeduction,
    monthlyNet,
    // 퇴직금 포함 연봉이면 1/13은 퇴직 시 별도로 받으므로 연 수령액은 12개월분만 센다.
    annualNet: monthlyNet * 12,
  };
}

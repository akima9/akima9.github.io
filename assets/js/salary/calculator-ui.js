// 홈 계산기 화면. 계산 자체는 calc.js 가 담당한다.
import { calcNetPay } from "./calc.js";

// scripts/salary/generate.mjs 의 SALARIES 와 같은 범위 (단위: 만원)
const hasDetailPage = (man) =>
  (man >= 2000 && man <= 15000 && man % 100 === 0) || (man > 15000 && man <= 30000 && man % 1000 === 0);

const form = document.getElementById("salary-form");
const salaryInput = document.getElementById("salary-input");
const nontaxInput = document.getElementById("nontax-input");
const familyInput = document.getElementById("family-input");
const childrenInput = document.getElementById("children-input");
const severanceInput = document.getElementById("severance-input");
const hint = document.getElementById("salary-hint");
const detailLink = document.getElementById("salary-detail-link");

const MAX_SALARY = 10_000_000_000;
const parse = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;
const fmt = (n) => n.toLocaleString("ko-KR");
const won = (n) => `${fmt(n)}원`;
const manwon = (n) => `${fmt(Math.round(n / 10_000))}만원`;

function koreanAmount(n) {
  const man = Math.floor(n / 10_000);
  if (man === 0) return n > 0 ? won(n) : "";
  const eok = Math.floor(man / 10_000);
  const rest = man % 10_000;
  if (eok === 0) return `${fmt(rest)}만원`;
  return rest ? `${fmt(eok)}억 ${fmt(rest)}만원` : `${fmt(eok)}억원`;
}

// 입력 중 콤마를 넣어도 커서가 숫자 기준으로 같은 자리에 남도록 한다.
function formatMoneyInput(input) {
  const digitsBefore = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/[^\d]/g, "").length;
  const value = Math.min(parse(input.value), MAX_SALARY);
  input.value = value ? fmt(value) : "";
  let pos = 0;
  for (let seen = 0; pos < input.value.length && seen < digitsBefore; pos++) {
    if (/\d/.test(input.value[pos])) seen++;
  }
  input.setSelectionRange?.(pos, pos);
}

function syncChildrenLimit() {
  const maxChildren = Number(familyInput.value) - 1;
  for (const opt of childrenInput.options) opt.disabled = Number(opt.value) > maxChildren;
  if (Number(childrenInput.value) > maxChildren) childrenInput.value = String(maxChildren);
}

function render() {
  const annualSalary = parse(salaryInput.value);
  const r = calcNetPay({
    annualSalary,
    nonTaxableMonthly: parse(nontaxInput.value),
    dependents: Number(familyInput.value),
    children: Number(childrenInput.value),
    severanceIncluded: severanceInput.checked,
  });
  hint.textContent = koreanAmount(annualSalary);

  const out = {
    monthlyNet: won(r.monthlyNet),
    monthlyNetMan: `약 ${manwon(r.monthlyNet)}`,
    annualNet: won(r.annualNet),
    annualNetMan: `약 ${manwon(r.annualNet)}`,
    totalDeduction: won(r.totalDeduction),
    deductionRate: `세전 월급의 ${r.monthlyGross ? ((r.totalDeduction / r.monthlyGross) * 100).toFixed(1) : "0.0"}%`,
    monthlyGross: won(r.monthlyGross),
    nonTaxable: won(r.nonTaxable),
  };
  for (const k of ["pension", "health", "longTermCare", "employment", "incomeTax", "localTax"]) {
    out[k] = `-${won(r[k])}`;
  }
  for (const el of document.querySelectorAll("[data-out]")) el.textContent = out[el.dataset.out];

  const man = Math.round(annualSalary / 10_000);
  const exact = annualSalary % 10_000 === 0 && hasDetailPage(man);
  detailLink.hidden = !exact;
  if (exact) {
    const a = detailLink.querySelector("a");
    a.href = `/salary/${man}/`;
    a.textContent = `연봉 ${koreanAmount(annualSalary)} 실수령액 자세히 보기 (부양가족별·인상 효과) →`;
  }

  const params = new URLSearchParams();
  params.set("salary", String(annualSalary));
  if (parse(nontaxInput.value) !== 200_000) params.set("nontax", String(parse(nontaxInput.value)));
  if (familyInput.value !== "1") params.set("family", familyInput.value);
  if (childrenInput.value !== "0") params.set("children", childrenInput.value);
  if (severanceInput.checked) params.set("severance", "1");
  history.replaceState(null, "", `${location.pathname}?${params}`);
}

function loadFromUrl() {
  const q = new URLSearchParams(location.search);
  if (q.has("salary")) salaryInput.value = fmt(Math.min(parse(q.get("salary")), MAX_SALARY));
  if (q.has("nontax")) nontaxInput.value = fmt(parse(q.get("nontax")));
  const family = Number(q.get("family"));
  if (family >= 1 && family <= 11) familyInput.value = String(family);
  const children = Number(q.get("children"));
  if (children >= 0 && children <= 10) childrenInput.value = String(children);
  severanceInput.checked = q.get("severance") === "1";
}

for (const input of [salaryInput, nontaxInput]) {
  input.addEventListener("input", () => {
    formatMoneyInput(input);
    render();
  });
}
familyInput.addEventListener("change", () => {
  syncChildrenLimit();
  render();
});
for (const input of [childrenInput, severanceInput]) input.addEventListener("change", render);
for (const btn of form.querySelectorAll("[data-add]")) {
  btn.addEventListener("click", () => {
    const next = Math.min(Math.max(0, parse(salaryInput.value) + Number(btn.dataset.add)), MAX_SALARY);
    salaryInput.value = fmt(next);
    render();
  });
}

loadFromUrl();
syncChildrenLimit();
render();

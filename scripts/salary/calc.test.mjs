// node --test scripts/salary/calc.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcNetPay, incomeTax } from "../../assets/js/salary/calc.js";

test("간이세액표 행 조회 (소득세법 시행령 [별표 2] 원문 값)", () => {
  // [월급여(원), 공제대상가족 수, 기대 세액]
  const cases = [
    [769_999, 1, 0],
    [1_422_000, 1, 7_210],
    [1_422_000, 2, 2_710],
    [1_422_000, 3, 0],
    [2_300_000, 1, 29_160],
    [2_309_999, 4, 9_180],
    [3_499_999, 1, 124_770], // 3,480~3,500 구간
    [3_500_000, 1, 127_220], // 3,500~3,520 구간 경계
    [4_000_000, 3, 109_590],
    [5_000_000, 11, 87_850],
    [6_010_000, 2, 466_060],
    [8_000_000, 4, 738_550],
    [9_999_999, 1, 1_503_990],
    [10_000_000, 1, 1_507_400],
    [10_000_000, 3, 1_200_840],
  ];
  for (const [monthly, dependents, expected] of cases) {
    assert.equal(incomeTax(monthly, dependents), expected, `${monthly}원, ${dependents}명`);
  }
});

test("월급여 1,000만원 초과 산식", () => {
  // 10,000천원 세액 + 25,000 + 초과액 × 98% × 35%
  assert.equal(incomeTax(12_000_000, 1), 1_507_400 + 25_000 + 686_000);
  // 10,000천원 세액 + 1,397,000 + (초과액 - 14,000천원) × 98% × 38%
  assert.equal(incomeTax(20_000_000, 1), 1_507_400 + 1_397_000 + 2_234_400);
  // 30,000천원 초과: 98% 미적용
  assert.equal(incomeTax(40_000_000, 2), 1_431_570 + 7_394_600 + 4_000_000);
  assert.equal(incomeTax(100_000_000, 1), 1_507_400 + 31_034_600 + 5_850_000);
});

test("자녀 세액공제와 가족 11명 초과", () => {
  assert.equal(incomeTax(5_000_000, 3, 1), 237_850 - 20_830);
  assert.equal(incomeTax(5_000_000, 4, 2), 219_100 - 45_830);
  assert.equal(incomeTax(5_000_000, 5, 3), 200_350 - 45_830 - 33_330);
  assert.equal(incomeTax(2_300_000, 3, 2), 0); // 음수면 0원
  // 12명: 11명 세액 - (10명 세액 - 11명 세액) × 1
  assert.equal(incomeTax(5_000_000, 12), 87_850 - (106_600 - 87_850));
});

test("연봉 3,000만원, 비과세 20만원, 본인 1명 (전 항목 수기 계산)", () => {
  const r = calcNetPay({ annualSalary: 30_000_000 });
  assert.equal(r.monthlyGross, 2_500_000);
  assert.equal(r.taxable, 2_300_000);
  assert.equal(r.pension, 109_250); // 2,300,000 × 4.75%
  assert.equal(r.health, 82_680); // 82,685 → 10원 미만 절사
  assert.equal(r.longTermCare, 10_860); // 82,680 × 0.9448/7.19 = 10,864.5
  assert.equal(r.employment, 20_700);
  assert.equal(r.incomeTax, 29_160);
  assert.equal(r.localTax, 2_910);
  assert.equal(r.totalDeduction, 255_560);
  assert.equal(r.monthlyNet, 2_244_440);
  assert.equal(r.annualNet, 2_244_440 * 12);
});

test("국민연금 기준소득월액 상·하한", () => {
  assert.equal(calcNetPay({ annualSalary: 120_000_000 }).pension, 313_020); // 659만원 상한
  assert.equal(calcNetPay({ annualSalary: 300_000_000 }).pension, 313_020);
  assert.equal(calcNetPay({ annualSalary: 6_000_000, nonTaxableMonthly: 200_000 }).pension, 19_470); // 41만원 하한
});

test("비과세 0원, 퇴직금 포함, 비과세가 월급보다 큰 경우", () => {
  const noExempt = calcNetPay({ annualSalary: 30_000_000, nonTaxableMonthly: 0 });
  assert.equal(noExempt.taxable, 2_500_000);
  assert.equal(noExempt.pension, 118_750);

  const severance = calcNetPay({ annualSalary: 39_000_000, severanceIncluded: true });
  assert.equal(severance.monthlyGross, 3_000_000);
  assert.equal(severance.annualNet, severance.monthlyNet * 12);

  const tiny = calcNetPay({ annualSalary: 1_200_000, nonTaxableMonthly: 500_000 });
  assert.equal(tiny.taxable, 0);
  assert.equal(tiny.totalDeduction, 0);
});

test("연봉이 오르면 실수령액이 줄지 않는다", () => {
  let prev = 0;
  for (let s = 20_000_000; s <= 300_000_000; s += 1_000_000) {
    const { monthlyNet } = calcNetPay({ annualSalary: s });
    assert.ok(monthlyNet >= prev, `${s}원에서 역전`);
    prev = monthlyNet;
  }
});

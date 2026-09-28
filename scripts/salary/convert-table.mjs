// 국세청 근로소득 간이세액표(소득세법 시행령 [별표 2]) 텍스트를 JS 데이터 모듈로 변환한다.
//
// 원본: https://www.law.go.kr (소득세법 시행령 [별표 2] <개정 2026. 2. 27.>) PDF
// source/withholding-2026.txt 는 해당 PDF를 pypdf의 extract_text()로 추출한 텍스트다.
//
// 사용법: node scripts/salary/convert-table.mjs [year]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const year = process.argv[2] ?? "2026";

const src = readFileSync(join(here, "source", `withholding-${year}.txt`), "utf8");
const num = (s) => (s === "-" ? 0 : Number(s.replaceAll(",", "")));

// "월급여액 이상 미만(천원) + 공제대상가족 1~11명 세액" 형태의 행
const rows = [];
for (const line of src.split("\n")) {
  const cols = line.trim().split(/\s+/);
  if (cols.length !== 13 || !/^[\d,]+$/.test(cols[0]) || !/^[\d,]+$/.test(cols[1])) continue;
  rows.push(cols.map(num));
}

// "10,000천원" 행: 월급여 1,000만원 초과 구간 계산의 기준 세액
const m = src.match(/^10,000천원 ((?:[\d,]+ ?){11})$/m);
if (!m) throw new Error("10,000천원 기준 행을 찾지 못했습니다.");
const at10m = m[1].trim().split(/\s+/).map(num);

for (let i = 1; i < rows.length; i++) {
  if (rows[i][0] !== rows[i - 1][1]) throw new Error(`구간 불연속: ${rows[i - 1]} → ${rows[i]}`);
}
if (rows[0][0] !== 770 || rows.at(-1)[1] !== 10000) throw new Error("표 범위가 770~10,000천원이 아닙니다.");

const out = `// 자동 생성 파일 — 직접 수정하지 마세요. (scripts/salary/convert-table.mjs)
// 출처: 소득세법 시행령 [별표 2] 근로소득 간이세액표 <개정 2026. 2. 27.>
// 각 행: [월급여 이상(천원), 미만(천원), 공제대상가족 1명 세액, ..., 11명 세액]
export const TABLE = ${JSON.stringify(rows)};
// 월급여 10,000천원인 경우의 세액 (공제대상가족 1~11명)
export const AT_10M = ${JSON.stringify(at10m)};
`;
writeFileSync(join(root, "assets", "js", "salary", `withholding-${year}.js`), out);
console.log(`withholding-${year}.js: ${rows.length}개 구간`);

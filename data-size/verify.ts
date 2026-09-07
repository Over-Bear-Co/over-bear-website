/**
 * verify.ts — ตรวจว่าโมเดลอ้างอิง reproduce ผลจริงจากวิดเจ็ต UNIQLO ได้
 * รัน: node --experimental-strip-types verify.ts
 */
import { recommend, explainTh, UNIQLO_465185, type UserInput } from './sizeRecommender.ts';

type Case = { input: UserInput; expectSize: string; expect: Record<string, string> };

// ผลจริงที่เก็บได้จากวิดเจ็ต MySize ASSIST เมื่อ 7 ก.ย. 2569
const OBSERVED: Case[] = [
  {
    input: { gender: 'female', age: 30, heightCm: 170, weightKg: 55, fitPreference: 'standard' },
    expectSize: 'XS',
    expect: { 'ไหล่': 'พอดี', 'ความกว้างของลำตัว': 'พอดี' },
  },
  {
    input: { gender: 'female', age: 30, heightCm: 175, weightKg: 95, fitPreference: 'standard' },
    expectSize: 'XXL',
    expect: { 'ไหล่': 'หลวมเล็กน้อย', 'ความกว้างของลำตัว': 'พอดี' },
  },
];

let fail = 0;
for (const c of OBSERVED) {
  const r = recommend(c.input);
  const rec = r.perSize.find((s) => s.size === r.recommendedSize)!;
  const got = Object.fromEntries(rec.dimensions.map((d) => [d.labelTh, d.verdictTh]));
  const sizeOk = r.recommendedSize === c.expectSize;
  const verdictOk = Object.entries(c.expect).every(([k, v]) => got[k] === v);
  if (!sizeOk || !verdictOk) fail++;
  console.log(
    `${sizeOk && verdictOk ? 'PASS' : 'FAIL'}  ${c.input.heightCm}/${c.input.weightKg} ` +
    `-> ${r.recommendedSize} (คาด ${c.expectSize})  ${JSON.stringify(got)}`,
  );
}

console.log('\n--- เมทริกซ์: หญิง 30 ปี, fit=standard ---');
console.log('H\\W  ' + [45, 55, 65, 75, 85, 95, 110, 125].map((w) => String(w).padStart(4)).join(''));
for (const h of [155, 160, 165, 170, 175, 180, 185]) {
  const row = [45, 55, 65, 75, 85, 95, 110, 125]
    .map((w) => recommend({ gender: 'female', age: 30, heightCm: h, weightKg: w }).recommendedSize.padStart(4))
    .join('');
  console.log(String(h).padEnd(5) + row);
}

console.log('\n--- เมทริกซ์: ชาย 30 ปี, fit=standard (ยังไม่ verify) ---');
console.log('H\\W  ' + [55, 65, 75, 85, 95, 110, 125, 140].map((w) => String(w).padStart(4)).join(''));
for (const h of [165, 170, 175, 180, 185]) {
  const row = [55, 65, 75, 85, 95, 110, 125, 140]
    .map((w) => recommend({ gender: 'male', age: 30, heightCm: h, weightKg: w }).recommendedSize.padStart(4))
    .join('');
  console.log(String(h).padEnd(5) + row);
}

console.log('\n--- ผลของ slider (ชาย 175 ซม. 75 กก.) ---');
for (const p of ['tight', 'slightlyTight', 'standard', 'slightlyLoose', 'loose'] as const) {
  const r = recommend({ gender: 'male', age: 35, heightCm: 175, weightKg: 75, fitPreference: p });
  console.log(`${p.padEnd(14)} -> ${r.recommendedSize}`);
}

console.log('\n--- เช็ค out-of-range (กลุ่มเป้าหมายตัวใหญ่) ---');
for (const w of [110, 120, 130, 140]) {
  const r = recommend({ gender: 'male', age: 35, heightCm: 178, weightKg: w });
  console.log(`178/${w} -> ${r.recommendedSize}  target อก ${r.targetChestCirc} ซม.  outOfRange=${r.outOfRange}`);
}

console.log('\n--- ตัวอย่าง output แบบหน้า result ---');
console.log(explainTh({ gender: 'male', age: 35, heightCm: 178, weightKg: 120, fitPreference: 'standard' }));
console.log(`\nไซส์ทั้งหมดในสเปก: ${UNIQLO_465185.sizes.map((s) => s.name).join(', ')}`);
process.exit(fail ? 1 : 0);

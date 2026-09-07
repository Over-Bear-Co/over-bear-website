/* ตรวจว่าเอนจินไม่เลื่อน — ไม่มี test runner ใน repo นี้ จึงเป็น script เดี่ยว
   รัน: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts
   ที่มาของทุกตัวเลขในไฟล์นี้อยู่ใน
   docs/superpowers/specs/2026-09-07-size-guide-recommender-design.md */
import {
  recommend, OVERBEAR_TEE, MODEL,
  type StyleSpec, type UserInput, type FitPreference,
} from "../src/lib/fit.ts";

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
  if (!ok) failed++;
}

/* ── ข้อ 1: พอร์ตแล้วไม่เพี้ยน ────────────────────────────────────────────
   เสื้อ UNIQLO E465185-000 เป็น fixture ของเทสต์ ไม่ใช่ข้อมูลของเว็บ จึงอยู่ที่นี่
   ไม่ใช่ใน src/ — จะได้ไม่มีข้อมูลตายติดไปกับ bundle
   chestCm = bodyWidth x 2 เพราะค่าวัดของ UNIQLO เป็นการวัดแบน */
const UNIQLO_465185: StyleSpec = {
  intendedEase: { chest: 15, shoulder: 10, length: 0 },
  sizes: [
    { name: "XS",  chestCm: 99,  shoulderCm: 49.5, lengthCm: 64 },
    { name: "S",   chestCm: 105, shoulderCm: 51,   lengthCm: 66 },
    { name: "M",   chestCm: 111, shoulderCm: 52.5, lengthCm: 69 },
    { name: "L",   chestCm: 117, shoulderCm: 54,   lengthCm: 72 },
    { name: "XL",  chestCm: 125, shoulderCm: 56,   lengthCm: 75 },
    { name: "XXL", chestCm: 133, shoulderCm: 58,   lengthCm: 77.5 },
    { name: "3XL", chestCm: 141, shoulderCm: 60,   lengthCm: 77.5 },
    { name: "4XL", chestCm: 149, shoulderCm: 62,   lengthCm: 77.5 },
  ],
};

/* ผลจริงที่เก็บจากวิดเจ็ต MySize ASSIST เมื่อ 7 ก.ย. 2569 (data-size/verify.ts)
   ตรวจแค่ 2 มิติที่ UNIQLO รายงาน — ความยาวเป็นมิติที่เราเพิ่มเอง ไม่มีของจริงให้เทียบ */
const OBSERVED = [
  { input: { gender: "female", age: 30, heightCm: 170, weightKg: 55, fitPreference: "standard" },
    size: "XS",  shoulder: "พอดี", chest: "พอดี" },
  { input: { gender: "female", age: 30, heightCm: 175, weightKg: 95, fitPreference: "standard" },
    size: "XXL", shoulder: "หลวมเล็กน้อย", chest: "พอดี" },
] satisfies Array<{ input: UserInput; size: string; shoulder: string; chest: string }>;

for (const c of OBSERVED) {
  const r = recommend(c.input, UNIQLO_465185);
  const rec = r.perSize.find((s) => s.size === r.recommendedSize)!;
  const got = (k: string) => rec.dimensions.find((d) => d.key === k)!.verdictTh;
  const ok = r.recommendedSize === c.size && got("shoulder") === c.shoulder && got("chest") === c.chest;
  check(`UNIQLO ${c.input.heightCm}/${c.input.weightKg}`, ok,
    `-> ${r.recommendedSize} ไหล่ ${got("shoulder")} อก ${got("chest")} (คาด ${c.size}/${c.shoulder}/${c.chest})`);
}

/* ── ข้อ 2: ความตรงกับตารางน้ำหนักที่พิมพ์บนหน้าเว็บ ────────────────────
   grid: ส่วนสูง 6 ค่า x 5 ไซซ์ x น้ำหนัก {ขอบล่าง, กึ่งกลาง, ขอบบน} = 90 เคส
   5XL ในตารางเขียน "130+" ไม่มีขอบบน — ตรึงไว้ที่ 145 เพื่อให้คำนวณซ้ำได้
   62.2% เป็นผลโดยตรงของการเลือกใช้เส้นโค้งร่างกายของ UNIQLO (spec ข้อ 1)
   ถ้าเลขนี้ขยับ แปลว่ามีคนแก้ MODEL หรือ intendedEase โดยไม่ได้ตั้งใจ */
const BANDS: Array<[string, number, number]> = [
  ["XL", 80, 91], ["2XL", 92, 104], ["3XL", 105, 117], ["4XL", 118, 129], ["5XL", 130, 145],
];
let agree = 0, total = 0;
for (const [size, lo, hi] of BANDS) {
  for (const heightCm of [165, 170, 172, 175, 180, 185]) {
    for (const weightKg of [lo, (lo + hi) / 2, hi]) {
      total++;
      const r = recommend({ gender: "male", age: 35, heightCm, weightKg, fitPreference: "standard" });
      if (r.recommendedSize === size) agree++;
    }
  }
}
check("ความตรงกับตารางน้ำหนัก = 56/90", agree === 56 && total === 90, `ได้ ${agree}/${total}`);

/* ── ข้อ 3: ความทนทาน — กวาดทุก input ในช่วงที่ UI ยอมรับ ─────────────── */
const VALID = new Set(OVERBEAR_TEE.sizes.map((s) => s.name));
let broken = 0;
for (let heightCm = 50; heightCm <= 260; heightCm += 2) {
  for (let weightKg = 10; weightKg <= 200; weightKg += 2) {
    for (const gender of ["male", "female"] as const) {
      try {
        const r = recommend({ gender, age: 30, heightCm, weightKg, fitPreference: "standard" });
        if (!VALID.has(r.recommendedSize)) broken++;
        if (r.perSize.some((p) => p.dimensions.some((d) => !Number.isFinite(d.deltaCm)))) broken++;
      } catch { broken++; }
    }
  }
}
check("กวาด input ทั้งช่วงแล้วไม่พัง", broken === 0, `เคสที่พัง ${broken}`);

/* ── ข้อ 4: slider ต้องเลื่อนไซซ์ได้จริง ไม่ใช่ค่าเดียวค้าง ───────────── */
const LADDER: FitPreference[] = ["tight", "slightlyTight", "standard", "slightlyLoose", "loose"];
const picks = LADDER.map((fitPreference) =>
  recommend({ gender: "male", age: 35, heightCm: 172, weightKg: 110, fitPreference }).recommendedSize);
check("slider 172/110 ไล่ 2XL -> 4XL", picks[0] === "2XL" && picks[4] === "4XL", picks.join(" -> "));

/* กันคนเผลอแก้ค่าคงที่ของโมเดลที่ spec สั่งห้ามแตะ
   cast เป็น number ก่อนเทียบ เพราะ MODEL เป็น `as const` ค่าจึงเป็น literal type
   ถ้าไม่ cast แล้วมีคนแก้เลข TypeScript จะฟ้อง "comparison appears unintentional"
   ตอน build ซึ่งอ่านไม่รู้เรื่อง — เราอยากให้มันพังตรงนี้พร้อมชื่อเทสต์แทน */
const asNum = (n: number) => n;
check("MODEL ไม่ถูกแก้",
  asNum(MODEL.body.chestCirc.a) === 19.644 && asNum(MODEL.body.shoulderWidth.a) === 2.3811 &&
  asNum(MODEL.verdictBands.fit) === 3 && asNum(MODEL.verdictBands.slight) === 8);

console.log(failed ? `\n${failed} ข้อไม่ผ่าน` : "\nผ่านทั้งหมด");
process.exit(failed ? 1 : 0);

/* ตรวจว่าเอนจินไม่เลื่อน — ไม่มี test runner ใน repo นี้ จึงเป็น script เดี่ยว
   รัน: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts
   ที่มาของทุกตัวเลขในไฟล์นี้อยู่ใน
   docs/superpowers/specs/2026-09-07-size-guide-recommender-design.md */
import {
  recommend, OVERBEAR_TEE, MODEL, classify, estimateBody,
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

/* ── ข้อ 5: เคสมาตรฐานของแบรนด์ หมุดไหล่กับความยาวด้วย ไม่ใช่แค่รอบอก ──────────
   เช็คข้อ 1/2/4 ข้างบนอ่านแค่ recommendedSize (ขับด้วยรอบอกอย่างเดียว) หรือ verdict
   ของฟิกซ์เจอร์เพศหญิง (UNIQLO) เท่านั้น ไหล่กับความยาวของ OVERBEAR_TEE เอง — รวมถึง
   genderOffset.male, intendedEase.shoulder/length และ LENGTH_MODEL ทั้งก้อน — ไม่เคย
   ถูกหมุดไว้เลย ทั้งที่ §7.3 ของ spec บอกว่าความยาวเป็นมิติเดียวที่ให้ข้อมูลจริง
   ค่าที่คาดหวังรันจากเอนจินจริงแล้วยืนยันก่อนใส่ ไม่ได้เดา (ดู probe ใน session ที่เพิ่มเทสต์นี้) */
const STANDARD_CASE = recommend(
  { gender: "male", age: 33, heightCm: 172, weightKg: 110, fitPreference: "standard" });
{
  const rec = STANDARD_CASE.perSize.find((p) => p.size === STANDARD_CASE.recommendedSize)!;
  const at = (k: string) => rec.dimensions.find((d) => d.key === k)!;
  const shoulder = at("shoulder");
  const chest = at("chest");
  const length = at("length");
  const ok =
    STANDARD_CASE.recommendedSize === "3XL" &&
    shoulder.verdictTh === "พอดี" && shoulder.deltaCm === 0 &&
    chest.verdictTh === "พอดี" && chest.deltaCm === -0.7 &&
    length.verdictTh === "หลวมเล็กน้อย" && length.deltaCm === 4.5;
  check("male/33/172/110/standard -> 3XL · ไหล่พอดี(0) อกพอดี(-0.7) ยาวหลวมเล็กน้อย(+4.5)", ok,
    `-> ${STANDARD_CASE.recommendedSize} ไหล่ ${shoulder.verdictTh}/${shoulder.deltaCm} ` +
    `อก ${chest.verdictTh}/${chest.deltaCm} ยาว ${length.verdictTh}/${length.deltaCm}`);
}

/* ── ข้อ 6: ขอบแบนด์ของ classify ทั้งสองฝั่ง — กัน <= ถูกเผลอแก้เป็น < (หรือกลับกัน) ─── */
check("classify แบนด์ฝั่งบวก: 3 = พอดี, 3.01 = หลวมเล็กน้อย",
  classify(3) === "fit" && classify(3.01) === "slightlyLoose",
  `-> ${classify(3)} / ${classify(3.01)}`);
check("classify แบนด์ฝั่งลบ: -3 = พอดี, -3.01 = คับเล็กน้อย",
  classify(-3) === "fit" && classify(-3.01) === "slightlyTight",
  `-> ${classify(-3)} / ${classify(-3.01)}`);

/* ── ข้อ 7: ทิศทางการเสมอกัน — ไซซ์เล็กกว่าต้องชนะเมื่อคะแนนเท่ากันเป๊ะ ──────────
   สร้าง StyleSpec สังเคราะห์ 2 ไซซ์ที่ target อยู่กึ่งกลางพอดี (ห่างเท่ากันทั้งสองฝั่ง)
   ใช้ intendedEase ทั้งหมด = 0 และ fitPreference standard (shift = 0) เพื่อให้
   targetChestCirc == body.chestCirc เป๊ะ แล้ววาง SMALLER/BIGGER ห่างจากจุดนั้นเท่ากัน */
const tieInput: UserInput = { gender: "male", age: 30, heightCm: 170, weightKg: 80, fitPreference: "standard" };
const tieBody = estimateBody(tieInput);
const TIE_STYLE: StyleSpec = {
  intendedEase: { chest: 0, shoulder: 0, length: 0 },
  sizes: [
    { name: "SMALLER", chestCm: tieBody.chestCirc - 2, shoulderCm: 50, lengthCm: 70 },
    { name: "BIGGER", chestCm: tieBody.chestCirc + 2, shoulderCm: 52, lengthCm: 72 },
  ],
};
const tieResult = recommend(tieInput, TIE_STYLE);
check("เสมอกันพอดี (คะแนนเท่ากันเป๊ะ) -> ไซซ์เล็กกว่าชนะ", tieResult.recommendedSize === "SMALLER",
  `-> ${tieResult.recommendedSize}`);

console.log(failed ? `\n${failed} ข้อไม่ผ่าน` : "\nผ่านทั้งหมด");
process.exit(failed ? 1 : 0);

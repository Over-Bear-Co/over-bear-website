# SIZE GUIDE Recommender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนปุ่ม "ดู SIZE GUIDE" ที่ปัจจุบันชี้ไปทางตัน `#den` ให้เปิด modal แนะนำไซซ์ทรงเดียวกับ UNIQLO MySize ASSIST

**Architecture:** เอนจิน pure function (`src/lib/fit.ts`) แยกจาก UI สมบูรณ์ เรียกได้ทั้งจาก React และจาก script บรรทัดคำสั่ง · UI เป็น client component ตัวเดียว (`SizeGuide.tsx`) ที่เรนเดอร์ทั้งปุ่มและ `<dialog>` ในตัวเอง ทำให้ `BuiltForBiggerDays.tsx` ยังเป็น server component เหมือนเดิม · ใช้ `<dialog>` ของ browser เพื่อให้ได้ focus trap / Esc / `::backdrop` / `inert` มาฟรี

**Tech Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · plain CSS ใน `globals.css` · ไม่เพิ่ม dependency ใด ๆ

**Spec:** `docs/superpowers/specs/2026-09-07-size-guide-recommender-design.md` — อ่านคู่กันเสมอ แผนนี้อ้างเหตุผลจาก spec

## Global Constraints

- **ห้ามเพิ่ม dependency** — เว็บนี้เป็น plain CSS ไม่มี UI framework และไม่มี test runner
- **ห้ามแก้ `src/lib/sizes.ts`** — เป็นแหล่งอ้างอิงเดียวของช่วงไซซ์ ตัวเลขทั้งหมดต้อง derive จากที่นั่น
- **ห้ามแก้ค่าใน `MODEL`** — ลอกจาก `data-size/sizeRecommender.ts` มาทั้งดุ้น การคาลิเบรตใหม่อยู่นอกขอบเขต
- `chest` ใน `sizes.ts` เป็น **เส้นรอบวง** อยู่แล้ว — **ห้ามคูณ 2** (ต่างจาก `bodyWidth` วัดแบนของ UNIQLO)
- **ข้อความทั้งหมดเป็นภาษาไทย** · คอมเมนต์ในโค้ดเป็นภาษาไทยตามแบบที่ repo ใช้อยู่
- **WCAG AA** — ทุกคู่สีข้อความ/พื้นต้องผ่าน 4.5:1 · ขอบช่องกรอกใช้ `--line-input` (3.28:1 ตาม 1.4.11) · สีห้ามเป็นตัวสื่อความหมายเพียงอย่างเดียว
- **ไม่มี localStorage** — ผลอยู่แค่ใน session ตาม state ของ component
- **`intendedEase` ที่ถูกต้อง:** `{ chest: 1, shoulder: 20.6, length: 12.4 }` (หน่วย ซม.)
- คำสั่งรัน script: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts`

### สภาพแวดล้อมที่ยืนยันแล้ว (spike ไปแล้ว ไม่ต้องลองซ้ำ)

- Node v24.14.0 — strip types ได้เองโดยไม่ต้องใส่ flag
- `import ... from "./sizes.ts"` (ใส่นามสกุล) **Turbopack bundle ผ่าน** และ `next build` ผ่าน ยืนยันด้วยการ build จริงแล้ว
- ต้องเปิด `allowImportingTsExtensions: true` ใน `tsconfig.json` ไม่งั้น type-check ไม่ผ่าน
- **`npm run build` พังอยู่แล้วตั้งแต่ก่อนเริ่มงานนี้** เพราะ `data-size/verify.ts` โดน `include: ["**/*.ts"]` กวาดเข้าไป และใช้ `.ts` extension โดยที่ตัวเลือกยังไม่เปิด — Task 1 แก้ให้ไปในตัว

---

### Task 1: เอนจิน `src/lib/fit.ts` + ชุดตรวจ 4 ข้อ

**Files:**
- Modify: `tsconfig.json` (เพิ่ม `allowImportingTsExtensions`)
- Create: `src/lib/fit.ts`
- Test: `scripts/verify-fit.ts`

**Interfaces:**
- Consumes: `SIZES` จาก `src/lib/sizes.ts` (`{ size, chest, length, shoulder, weight }` หน่วยนิ้ว)
- Produces: `recommend(input: UserInput, style?: StyleSpec): Recommendation` · `OVERBEAR_TEE: StyleSpec` · `VERDICT_TH`, `HEADLINE_TH: Record<Verdict, string>` · types `UserInput`, `Gender`, `FitPreference`, `Verdict`, `DimensionKey`, `DimensionResult`, `SizeResult`, `StyleSpec`, `GarmentSize`, `Recommendation`

- [ ] **Step 1: เปิด `allowImportingTsExtensions`**

ใน `tsconfig.json` เพิ่มบรรทัดถัดจาก `"noEmit": true,`:

```json
    "allowImportingTsExtensions": true,
```

- [ ] **Step 2: เขียนชุดตรวจที่ยังต้องแดง**

สร้าง `scripts/verify-fit.ts`:

```ts
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
```

- [ ] **Step 3: รันให้เห็นว่าแดง**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts`
Expected: FAIL — `Cannot find module '../src/lib/fit.ts'`

- [ ] **Step 4: เขียนเอนจิน**

สร้าง `src/lib/fit.ts`:

```ts
/* เอนจินแนะนำไซซ์ของ SIZE GUIDE — pure function ไม่พึ่ง React จึงเรียกจาก script ได้ตรง ๆ

   ตัวเลขในไฟล์นี้มี 2 ชั้น อย่าปนกัน:
   - MODEL       = สูตรประมาณร่างกาย ลอกจาก data-size/sizeRecommender.ts มาทั้งดุ้น ห้ามแก้
                   (คาลิเบรตจากผลจริงของวิดเจ็ต UNIQLO MySize ASSIST 2 เคส)
   - intendedEase = ค่าของ "เสื้อตัวนั้น" ไม่ใช่ของโมเดล ต้อง back-solve ใหม่เมื่อเปลี่ยนเสื้อ

   ที่มาและข้อจำกัดทั้งหมด: docs/superpowers/specs/2026-09-07-size-guide-recommender-design.md
   ใส่นามสกุล .ts ใน import เพราะ scripts/verify-fit.ts รันไฟล์นี้ด้วย Node ตรง ๆ
   ซึ่งไม่เดานามสกุลให้เหมือน bundler (ต้องมี allowImportingTsExtensions ใน tsconfig) */
import { SIZES } from "./sizes.ts";

export type Gender = "female" | "male";
export type FitPreference = "tight" | "slightlyTight" | "standard" | "slightlyLoose" | "loose";
export type Verdict = "tight" | "slightlyTight" | "fit" | "slightlyLoose" | "loose";
export type DimensionKey = "shoulder" | "chest" | "length";

export type UserInput = {
  gender: Gender;
  /* เก็บให้ schema ครบเท่า UNIQLO แต่โมเดลไม่ได้ใช้ (ageCoef = 0)
     ถ้าจะตัดช่องนี้ทิ้งภายหลัง แก้ที่ฟอร์มอย่างเดียวพอ เอนจินไม่ได้พึ่งค่านี้ */
  age: number;
  heightCm: number;
  weightKg: number;
  fitPreference: FitPreference;
};

/** ค่าวัดเสื้อ หน่วย ซม. — chestCm เป็นเส้นรอบวง ไม่ใช่ค่าวัดแบน */
export type GarmentSize = { name: string; chestCm: number; shoulderCm: number; lengthCm: number };

export type StyleSpec = { intendedEase: Record<DimensionKey, number>; sizes: GarmentSize[] };

export type DimensionResult = {
  key: DimensionKey;
  labelTh: string;
  bodyCm: number;
  garmentCm: number;
  /** garment - body : เสื้อเหลือที่จากตัวจริงเท่าไร */
  easeCm: number;
  /** easeCm - ease ที่ทรงตั้งใจ : บวก = หลวมกว่าแบบ — คำตัดสินคิดจากค่านี้ */
  deltaCm: number;
  verdict: Verdict;
  verdictTh: string;
};

export type SizeResult = { size: string; dimensions: DimensionResult[]; score: number };

export type Recommendation = {
  recommendedSize: string;
  body: { chestCirc: number; shoulderWidth: number; coverLength: number };
  targetChestCirc: number;
  /** ครบทุกไซซ์ ไม่ใช่ไซซ์เดียว — แท็บในหน้าผลลัพธ์เปิดดูได้ทั้งหมด */
  perSize: SizeResult[];
};

/* ── โมเดลร่างกาย: ห้ามแก้ค่าในบล็อกนี้ ────────────────────────────────── */
export const MODEL = {
  body: {
    chestCirc: { a: 19.644, b: -27.734 },
    shoulderWidth: { a: 2.3811, b: 25.956 },
    genderOffset: {
      female: { chest: 0, shoulder: 0 },
      male: { chest: 5, shoulder: 3 },
    },
  },
  ageCoef: 0,
  fitPreferenceShiftCm: {
    tight: -6, slightlyTight: -3, standard: 0, slightlyLoose: 3, loose: 6,
  } satisfies Record<FitPreference, number>,
  verdictBands: { fit: 3, slight: 8 },
} as const;

/* สูตรความยาวที่ต้องคลุม — ของใหม่ล้วน ไม่มีข้อมูลสังเกตรองรับเลยสักจุด
   ต่างจากอก/ไหล่ที่อย่างน้อยมีผลจริงของ UNIQLO 2 เคสหนุนอยู่
   พจน์แรก = ความยาวตามส่วนสูง · พจน์สอง = ค่าเผื่อพุง (พุงใหญ่ดึงชายเสื้อด้านหน้าขึ้น
   จึงต้องการความยาวเพิ่ม) ที่ 137 กก. เพิ่มแค่ 1.16 ซม. ซึ่งเป็นขนาดที่ตั้งใจให้เล็ก */
export const LENGTH_MODEL = { hCoef: 0.415, bellyCoef: 0.6, bellyPivot: 7.0 } as const;

export const VERDICT_TH: Record<Verdict, string> = {
  tight: "คับ",
  slightlyTight: "คับเล็กน้อย",
  fit: "พอดี",
  slightlyLoose: "หลวมเล็กน้อย",
  loose: "หลวม",
};

/* หัวเรื่องหน้าผลลัพธ์ยึดคำตัดสินของ "รอบอก" อย่างเดียว เพราะเป็นมิติเดียวที่ขับการเลือกไซซ์
   ไหล่กับความยาวรายงานเป็นผลพลอยได้ (พฤติกรรมเดียวกับที่สังเกตได้จาก UNIQLO) */
export const HEADLINE_TH: Record<Verdict, string> = {
  tight: "ไซซ์นี้รัดรูปมาก",
  slightlyTight: "ไซซ์นี้รัดรูปเล็กน้อย",
  fit: "นี่คือไซซ์มาตรฐาน",
  slightlyLoose: "ไซซ์นี้หลวมเล็กน้อย",
  loose: "ไซซ์นี้หลวม",
};

export const DIMENSION_TH: Record<DimensionKey, string> = {
  shoulder: "ไหล่",
  chest: "รอบอก",
  length: "ความยาวตัว",
};

const DIMENSION_ORDER: DimensionKey[] = ["shoulder", "chest", "length"];

const CM_PER_INCH = 2.54;

/* เสื้อของ OVERBEAR — ค่าวัดทั้งหมด derive จาก SIZES ไม่ให้ค้างเมื่อช่วงไซซ์เปลี่ยน
   chest ใน sizes.ts เป็นเส้นรอบวงอยู่แล้ว จึงไม่คูณ 2 (ต่างจาก bodyWidth วัดแบนของ UNIQLO)

   intendedEase.chest = +1 ไม่ใช่ ease จริงของ OVERBEAR
   ถ้า fit เส้นโค้งร่างกายเข้ากับตารางน้ำหนักของแบรนด์เอง จะได้รอบอกจริง 109.3 ซม.
   ที่ 172 ซม./85.5 กก. เทียบเสื้อ XL 124.5 ซม. -> ease จริง +15.2 ซม.
   ซึ่งเท่ากับ intendedEase +15 ของเสื้อ oversized UNIQLO พอดี
   เลข +1 คือตัวหักล้างการที่เส้นโค้งของ UNIQLO ประเมินรอบอกเกิน ไม่ใช่คำอธิบายทรงเสื้อ
   >>> วันไหนเลิกใช้เส้นโค้ง UNIQLO ต้องเปลี่ยนค่านี้กลับเป็น +15 ทันที <<<

   shoulder = +20.6 : ค่าเฉลี่ย ease ที่จุดกึ่งกลางช่วงน้ำหนักทั้ง 5 ไซซ์ (ที่ 172 ซม.)
   length   = +12.4 : ยึดจาก XL ที่ 172 ซม./85.5 กก. */
export const OVERBEAR_TEE: StyleSpec = {
  intendedEase: { chest: 1, shoulder: 20.6, length: 12.4 },
  sizes: SIZES.map((s) => ({
    name: s.size,
    chestCm: s.chest * CM_PER_INCH,
    shoulderCm: s.shoulder * CM_PER_INCH,
    lengthCm: s.length * CM_PER_INCH,
  })),
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** ประมาณสัดส่วนร่างกายจาก เพศ/ส่วนสูง/น้ำหนัก หน่วย ซม. */
export function estimateBody(input: UserInput) {
  const { chestCirc, shoulderWidth, genderOffset } = MODEL.body;
  const off = genderOffset[input.gender];
  const x = Math.sqrt(input.weightKg / (input.heightCm / 100));
  return {
    x,
    chestCirc: chestCirc.a * x + chestCirc.b + off.chest,
    shoulderWidth: shoulderWidth.a * x + shoulderWidth.b + off.shoulder,
    coverLength:
      LENGTH_MODEL.hCoef * input.heightCm + LENGTH_MODEL.bellyCoef * (x - LENGTH_MODEL.bellyPivot),
  };
}

/* คิดจาก deltaCm ที่ยังไม่ปัดเศษ ไม่งั้น delta 3.04 จะโดนปัดเป็น 3.0
   แล้วคำตัดสินพลิกจาก "หลวมเล็กน้อย" เป็น "พอดี" ที่ขอบแบนด์พอดี */
export function classify(deltaCm: number): Verdict {
  const { fit, slight } = MODEL.verdictBands;
  if (Math.abs(deltaCm) <= fit) return "fit";
  if (deltaCm > 0) return deltaCm <= slight ? "slightlyLoose" : "loose";
  return deltaCm >= -slight ? "slightlyTight" : "tight";
}

export function recommend(input: UserInput, style: StyleSpec = OVERBEAR_TEE): Recommendation {
  if (input.heightCm < 50 || input.heightCm > 260) throw new RangeError("heightCm ต้องอยู่ระหว่าง 50–260");
  if (input.weightKg < 10 || input.weightKg > 200) throw new RangeError("weightKg ต้องอยู่ระหว่าง 10–200");

  const body = estimateBody(input);
  const shift = MODEL.fitPreferenceShiftCm[input.fitPreference];
  const targetChestCirc = body.chestCirc + style.intendedEase.chest + shift;

  const bodyBy: Record<DimensionKey, number> = {
    shoulder: body.shoulderWidth,
    chest: body.chestCirc,
    length: body.coverLength,
  };

  const perSize: SizeResult[] = style.sizes.map((size) => {
    const garmentBy: Record<DimensionKey, number> = {
      shoulder: size.shoulderCm,
      chest: size.chestCm,
      length: size.lengthCm,
    };
    const dimensions = DIMENSION_ORDER.map((key) => {
      const easeCm = garmentBy[key] - bodyBy[key];
      const deltaCm = easeCm - (style.intendedEase[key] + shift);
      const verdict = classify(deltaCm);
      return {
        key,
        labelTh: DIMENSION_TH[key],
        bodyCm: round1(bodyBy[key]),
        garmentCm: round1(garmentBy[key]),
        easeCm: round1(easeCm),
        deltaCm: round1(deltaCm),
        verdict,
        verdictTh: VERDICT_TH[verdict],
      };
    });
    /* เลือกไซซ์ด้วยรอบอกเป็นตัวคุม ไหล่กับความยาวรายงานเป็นผลพลอยได้
       argmin วิ่งบนไซซ์ที่มีขายเท่านั้น จึงถูก clamp อยู่ใน XL–5XL เอง
       ไม่มี outOfRange: ตารางน้ำหนักบนหน้าเว็บชนะ ห้ามบอกลูกค้าว่าไม่มีไซซ์ให้ */
    return { size: size.name, dimensions, score: Math.abs(size.chestCm - targetChestCirc) };
  });

  // เสมอกันให้ไซซ์เล็กกว่าชนะ — ใช้ < ไม่ใช่ <= และ style.sizes เรียงเล็กไปใหญ่
  let best = perSize[0];
  for (const p of perSize) if (p.score < best.score) best = p;

  return {
    recommendedSize: best.size,
    body: {
      chestCirc: round1(body.chestCirc),
      shoulderWidth: round1(body.shoulderWidth),
      coverLength: round1(body.coverLength),
    },
    targetChestCirc: round1(targetChestCirc),
    perSize,
  };
}
```

- [ ] **Step 5: รันให้เขียว**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts`
Expected: PASS ทั้ง 6 บรรทัด และปิดท้ายด้วย "ผ่านทั้งหมด"

- [ ] **Step 6: ยืนยันว่า build กลับมาเขียว**

Run: `npx eslint src && npm run build`
Expected: ผ่านทั้งคู่ — Task นี้แก้ build ที่พังจาก `data-size/verify.ts` ไปในตัว

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json src/lib/fit.ts scripts/verify-fit.ts
git commit -m "feat: add size recommendation engine calibrated from data-size/"
```

---

### Task 2: `SizeGuide.tsx` — dialog + หน้าฟอร์ม + ต่อเข้าหน้าเว็บ

**Files:**
- Create: `src/components/SizeGuide.tsx`
- Modify: `src/components/BuiltForBiggerDays.tsx` (บรรทัด 81 และ import ด้านบน)
- Modify: `src/app/globals.css` (บล็อกใหม่ต่อจาก `.sizecard__note`)

**Interfaces:**
- Consumes: `recommend`, types `Gender`, `FitPreference`, `UserInput`, `Recommendation` จาก `@/lib/fit`
- Produces: `<SizeGuide />` — component ที่เรนเดอร์ทั้งปุ่ม `.btn.btn--wide` และ `<dialog>` ในตัวเอง รับ props ไม่มี

- [ ] **Step 1: เขียน component ที่มีเฉพาะหน้าฟอร์ม**

สร้าง `src/components/SizeGuide.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { recommend, type FitPreference, type Gender, type Recommendation, type UserInput } from "@/lib/fit";

/* Client component ตัวที่ 3 ของเว็บ (ต่อจาก Nav กับ Newsletter)
   เรนเดอร์ทั้งปุ่มและ dialog ในตัวเอง เพื่อให้ BuiltForBiggerDays ยังเป็น server component

   ใช้ <dialog> ของ browser ไม่ใช่ overlay div: focus trap · ปิดด้วย Esc · ::backdrop
   และ inert พื้นหลัง ได้มาฟรีหมด เขียนเองมีแต่จะพลาดเรื่อง a11y

   state อยู่ใน component จึงคงอยู่ตลอด session — ปิดแล้วเปิดใหม่ค่าที่กรอกยังอยู่
   แต่ refresh แล้วหาย ตามที่ตกลงไว้ว่าไม่แตะ localStorage */

const FIT_STEPS: Array<{ value: FitPreference; labelTh: string }> = [
  { value: "tight", labelTh: "รัดรูป" },
  { value: "slightlyTight", labelTh: "" },
  { value: "standard", labelTh: "มาตรฐาน" },
  { value: "slightlyLoose", labelTh: "" },
  { value: "loose", labelTh: "หลวม" },
];

type FormState = {
  gender: Gender | "";
  age: string;
  heightCm: string;
  weightKg: string;
  fitPreference: FitPreference;
};

const EMPTY_FORM: FormState = { gender: "", age: "", heightCm: "", weightKg: "", fitPreference: "standard" };

/* คืน null เมื่อยังกรอกไม่ครบหรือค่าออกนอกช่วง — ปุ่ม "ดำเนินการต่อ" ใช้ค่านี้ตัดสิน disabled
   ช่วง 50–260 / 10–200 ตรงกับที่ recommend() โยน RangeError พอดี ฟอร์มจึงกันไว้ก่อนถึงเอนจิน
   อายุ 1–120 เป็นการกันค่าพิมพ์ผิดของเราเอง UNIQLO ไม่ได้ระบุช่วงไว้บน UI */
function parseForm(f: FormState): UserInput | null {
  if (f.gender === "") return null;
  const age = Number(f.age);
  const heightCm = Number(f.heightCm);
  const weightKg = Number(f.weightKg);
  if (!f.age.trim() || !Number.isFinite(age) || age < 1 || age > 120) return null;
  if (!f.heightCm.trim() || !Number.isFinite(heightCm) || heightCm < 50 || heightCm > 260) return null;
  if (!f.weightKg.trim() || !Number.isFinite(weightKg) || weightKg < 10 || weightKg > 200) return null;
  return { gender: f.gender, age, heightCm, weightKg, fitPreference: f.fitPreference };
}

export default function SizeGuide() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  /* เก็บ input ที่ใช้คำนวณไว้คู่กับผลลัพธ์ ไม่ใช่ไปอ่านค่าจากฟอร์มตอนจะโชว์แถบโปรไฟล์
     ค่าในฟอร์มคือ "สิ่งที่กำลังกรอก" ส่วนแถบโปรไฟล์ต้องแสดง "สิ่งที่คำนวณไปแล้ว"
     สองอย่างนี้บังเอิญตรงกันตอนนี้ แต่จะเพี้ยนทันทีที่มีใครทำให้แก้ฟอร์มได้ระหว่างผลค้างอยู่ */
  const [result, setResult] = useState<{ input: UserInput; rec: Recommendation } | null>(null);

  const valid = parseForm(form);

  const submit = () => {
    if (!valid) return;
    setResult({ input: valid, rec: recommend(valid) });
  };

  return (
    <>
      <button type="button" className="btn btn--wide" onClick={() => dialogRef.current?.showModal()}>
        ดู SIZE GUIDE
      </button>

      {/* คลิกพื้นหลังแล้วปิด — ปลอดภัยเพราะ state ไม่ถูกล้าง ต่างจากวิดเจ็ตต้นแบบ
          เช็ค e.target === dialog เพราะ <dialog> นับพื้นที่ ::backdrop เป็นตัวมันเอง */}
      <dialog
        ref={dialogRef}
        className="sguide"
        aria-labelledby="sguide-title"
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className="sguide__head">
          <h2 id="sguide-title" className="sguide__title">ดูไซซ์ของฉัน</h2>
          <button type="button" className="sguide__x" onClick={() => dialogRef.current?.close()} aria-label="ปิด">
            ✕
          </button>
        </div>

        <div className="sguide__body">
          {result === null ? (
            <form
              className="sguide__form"
              onSubmit={(e) => { e.preventDefault(); submit(); }}
            >
              <p className="sguide__lead">
                เราจะแนะนำไซซ์ตามเพศ อายุ ส่วนสูง น้ำหนัก และความพึงพอใจในการสวมใส่เสื้อผ้าของคุณ
              </p>

              <label className="sguide__field">
                <span>เพศ</span>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender | "" })}
                >
                  <option value="">โปรดเลือกเพศของคุณ</option>
                  <option value="female">หญิง</option>
                  <option value="male">ชาย</option>
                </select>
              </label>

              <label className="sguide__field">
                <span>อายุ</span>
                <input
                  type="number" inputMode="numeric" min={1} max={120}
                  placeholder="โปรดกรอกอายุของคุณ"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </label>

              <div className="sguide__row">
                <label className="sguide__field">
                  <span>ส่วนสูง (ซม.)</span>
                  <input
                    type="number" inputMode="numeric" min={50} max={260}
                    placeholder="50 - 260"
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                  />
                </label>
                <label className="sguide__field">
                  <span>น้ำหนัก (กก.)</span>
                  <input
                    type="number" inputMode="numeric" min={10} max={200}
                    placeholder="10 - 200"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  />
                </label>
              </div>

              {/* radio จริง ไม่ใช่ div ที่ทำท่าเป็น slider — คีย์บอร์ดเลื่อนด้วยลูกศรได้เองตาม native
                  ป้ายมีแค่หัว/กลาง/ท้ายตามต้นแบบ ตัวที่ไม่มีป้ายจึงต้องพึ่ง aria-label */}
              <fieldset className="sguide__fit">
                <legend>ความพึงพอใจในขนาดเสื้อผ้าที่สวมใส่</legend>
                <div className="sguide__fitrow">
                  {FIT_STEPS.map((step, i) => (
                    <label key={step.value} className="sguide__fitstep">
                      <input
                        type="radio" name="fitPreference" value={step.value}
                        checked={form.fitPreference === step.value}
                        onChange={() => setForm({ ...form, fitPreference: step.value })}
                        aria-label={step.labelTh || `ระดับที่ ${i + 1} จาก 5`}
                      />
                      <span className="sguide__fitlabel">{step.labelTh}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sguide__actions">
                <button type="submit" className="btn" disabled={!valid}>ดำเนินการต่อ</button>
                <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>
                  ย้อนกลับ
                </button>
              </div>
            </form>
          ) : (
            <p className="sguide__lead">ไซซ์ที่แนะนำ: {result.rec.recommendedSize}</p>
          )}
        </div>
      </dialog>
    </>
  );
}
```

- [ ] **Step 2: ต่อเข้าหน้าเว็บ**

ใน `src/components/BuiltForBiggerDays.tsx` เพิ่ม import ต่อจากบรรทัด `import { SIZES } from "@/lib/sizes";`:

```tsx
import SizeGuide from "./SizeGuide";
```

แล้วแทนที่บรรทัด 81 ทั้งบรรทัด:

```tsx
          <a className="btn btn--wide" href="#den">ดู SIZE GUIDE</a>
```

ด้วย:

```tsx
          <SizeGuide />
```

- [ ] **Step 3: เขียน CSS**

ต่อท้ายบล็อก `.sizecard__note` ใน `src/app/globals.css`:

```css
/* ============================================================
   SIZE GUIDE — modal แนะนำไซซ์ (client component)
   ใช้ <dialog> จึงได้ ::backdrop มาฟรี ไม่ต้องทำ overlay เอง
   ============================================================ */
.sguide{
  width:min(560px,100% - 2rem);max-width:none;max-height:min(88vh,900px);
  padding:0;border:1px solid var(--line);border-radius:var(--r);
  background:var(--surface);color:var(--text);
  box-shadow:var(--shadow);overflow:hidden;
}
.sguide::backdrop{background:rgba(22,24,26,.42)}
/* dialog เป็น flex column เพื่อให้ .sguide__body เลื่อนในตัวเอง หัวเรื่องไม่เลื่อนตาม */
.sguide[open]{display:flex;flex-direction:column}

.sguide__head{display:flex;align-items:center;justify-content:space-between;gap:1rem;
  padding:1rem clamp(1rem,3vw,1.5rem);border-bottom:1px solid var(--line);flex:none}
.sguide__title{font-size:1.05rem;font-weight:600;letter-spacing:-.01em}
.sguide__x{font-size:18px;line-height:1;padding:.35rem;border-radius:var(--r-sm);color:var(--text-2)}
.sguide__x:hover{color:var(--text)}

.sguide__body{padding:clamp(1rem,3vw,1.5rem);overflow-y:auto;flex:1 1 auto}
.sguide__lead{color:var(--text-2);margin-bottom:1.1rem}

.sguide__form{display:flex;flex-direction:column;gap:1rem}
.sguide__row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
.sguide__field{display:flex;flex-direction:column;gap:.35rem;min-width:0}
.sguide__field>span{font-size:13px;font-weight:600}
.sguide__field select,.sguide__field input{
  font-family:inherit;font-size:15px;color:var(--text);
  padding:.7em .8em;border:1px solid var(--line-input);border-radius:var(--r-sm);
  background:#fff;width:100%;
}
.sguide__field input::placeholder{color:var(--text-3)}

.sguide__fit{border:none}
.sguide__fit legend{font-size:13px;font-weight:600;margin-bottom:.6rem}
/* เส้นเชื่อมระหว่างจุด วาดด้วย background ของแถว ไม่ใช่ border ของแต่ละจุด
   เพราะจุดกระจายด้วย space-between เส้นจึงต้องพาดทับทั้งแถว */
.sguide__fitrow{display:flex;justify-content:space-between;align-items:flex-start;gap:.25rem;
  position:relative;padding-top:.15rem}
.sguide__fitrow::before{content:"";position:absolute;left:9px;right:9px;top:12px;
  height:1px;background:var(--line-2)}
.sguide__fitstep{display:flex;flex-direction:column;align-items:center;gap:.4rem;
  position:relative;z-index:1;cursor:pointer}
.sguide__fitstep input{width:18px;height:18px;accent-color:var(--red);cursor:pointer}
.sguide__fitlabel{font-size:11.5px;color:var(--text-3);white-space:nowrap}

.sguide__actions{display:flex;gap:.7rem;margin-top:.3rem}
.sguide__actions .btn{flex:1}
.btn--ghost{background:transparent;color:var(--text);border-color:var(--line-input)}
.btn--ghost:hover{background:var(--surface-2);color:var(--text);border-color:var(--line-input)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn:disabled:hover{background:var(--red);border-color:var(--red);transform:none}
```

- [ ] **Step 4: ตรวจว่าคอมไพล์ผ่านและเอนจินยังเขียว**

Run: `npx eslint src && npm run build && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts`
Expected: ผ่านหมด และ build ต้องยังขึ้น `○ (Static)` เหมือนเดิม

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

Run: `npm run dev` แล้วเปิด `http://localhost:3000/#size`

ต้องเห็นครบทุกข้อ:
1. ปุ่ม "ดู SIZE GUIDE" หน้าตาเหมือนเดิมเป๊ะ (`.btn.btn--wide` สีแดงเต็มความกว้างการ์ด)
2. กดแล้ว dialog เปิด พื้นหลังมืดลง และโฟกัสเข้าไปอยู่ใน dialog
3. "ดำเนินการต่อ" เป็นสีจาง กดไม่ได้ จนกรอกครบทั้ง 4 ช่อง
4. กรอก ชาย / 33 / 165 / 80 แล้วกด → ขึ้น "ไซซ์ที่แนะนำ: 3XL"
5. กด Esc ปิดได้ · กดพื้นหลังปิดได้ · เปิดใหม่แล้วค่าที่กรอกยังอยู่
6. ใส่ส่วนสูง 300 แล้วปุ่มต้องกลับไปกดไม่ได้

- [ ] **Step 6: Commit**

```bash
git add src/components/SizeGuide.tsx src/components/BuiltForBiggerDays.tsx src/app/globals.css
git commit -m "feat: open a size guide dialog from the size card"
```

---

### Task 3: หน้าผลลัพธ์ — แท็บไซซ์ · คำตัดสินรายมิติ · ตารางขนาด

**Files:**
- Modify: `src/components/SizeGuide.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `Recommendation`, `HEADLINE_TH`, `SIZES` · state `result` ที่ Task 2 สร้างไว้
- Produces: หน้าผลลัพธ์เต็ม — Task 4 จะเสียบ `<FitFigure>` ลงในช่อง `.sguide__figure`

- [ ] **Step 1: เพิ่ม import และ state ของแท็บ**

ใน `src/components/SizeGuide.tsx` แก้บรรทัด import ของ `@/lib/fit` เป็น:

```tsx
import {
  HEADLINE_TH, recommend,
  type FitPreference, type Gender, type Recommendation, type UserInput,
} from "@/lib/fit";
import { SIZES } from "@/lib/sizes";
```

และแก้บรรทัด import ของ react ให้ดึงชนิด `KeyboardEvent` มาด้วย — ห้ามเขียน `React.KeyboardEvent`
เพราะ `React` เป็น UMD global ซึ่งใช้เป็นชนิดในไฟล์ ES module ไม่ได้ TypeScript จะฟ้อง:

```tsx
import { useRef, useState, type KeyboardEvent } from "react";
```

เพิ่ม state ใต้บรรทัด `const [result, setResult] = useState<{ input: UserInput; rec: Recommendation } | null>(null);`:

```tsx
  /* ไซซ์ที่กำลังเปิดดูอยู่ — เริ่มที่ไซซ์ที่แนะนำ แต่กดแท็บอื่นดูได้ทุกไซซ์
     null = ยังไม่เคยกดแท็บ ให้ตกไปใช้ไซซ์ที่แนะนำของผลล่าสุด
     เก็บเป็น null แทนการ sync ด้วย useEffect เพราะคำนวณผลใหม่แล้วต้องเด้งกลับไซซ์ที่แนะนำเสมอ */
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
```

แก้ `submit` ให้รีเซ็ตแท็บ:

```tsx
  const submit = () => {
    if (!valid) return;
    setResult({ input: valid, rec: recommend(valid) });
    setActiveSize(null);
  };
```

- [ ] **Step 2: เพิ่มตัวช่วยเลื่อนแท็บด้วยลูกศร**

วางไว้เหนือ `return (` ใน component:

```tsx
  /* WAI tabs pattern — แท็บของ UNIQLO ไม่รับลูกศร ซึ่งรีวิวจับเป็นบั๊ก a11y ข้อ 5
     roving tabindex: มีแค่แท็บที่ active ที่ tabbable ที่เหลือเลื่อนด้วยลูกศรเท่านั้น */
  const onTabKey = (e: KeyboardEvent, i: number, names: string[]) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + names.length) % names.length;
    setActiveSize(names[next]);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };
```

- [ ] **Step 3: แทนที่ placeholder ของหน้าผลลัพธ์**

แทนบรรทัด `<p className="sguide__lead">ไซซ์ที่แนะนำ: {result.rec.recommendedSize}</p>` (placeholder ที่ Task 2 วางไว้) ด้วย:

```tsx
            (() => {
              const names = result.rec.perSize.map((p) => p.size);
              const shown = activeSize ?? result.rec.recommendedSize;
              const current = result.rec.perSize.find((p) => p.size === shown)!;
              const chest = current.dimensions.find((d) => d.key === "chest")!;
              return (
                <div className="sguide__result">
                  <div className="sguide__profile">
                    <p>
                      {result.input.gender === "male" ? "ชาย" : "หญิง"}, {result.input.age} ปี,{" "}
                      {result.input.heightCm} ซม., {result.input.weightKg} กก.
                    </p>
                    <button type="button" className="btn btn--sm btn--ghost" onClick={() => setResult(null)}>
                      เปลี่ยน
                    </button>
                  </div>

                  <h3 className="sguide__headline">{HEADLINE_TH[chest.verdict]}</h3>

                  <div className="sguide__tabs" role="tablist" aria-label="เลือกไซซ์" ref={tabsRef}>
                    {result.rec.perSize.map((p, i) => (
                      <button
                        key={p.size}
                        type="button"
                        role="tab"
                        id={`sguide-tab-${p.size}`}
                        aria-selected={p.size === shown}
                        aria-controls="sguide-panel"
                        tabIndex={p.size === shown ? 0 : -1}
                        className={`sguide__tab${p.size === shown ? " is-on" : ""}`}
                        onClick={() => setActiveSize(p.size)}
                        onKeyDown={(e) => onTabKey(e, i, names)}
                      >
                        {p.size === result.rec.recommendedSize && (
                          <span className="sguide__rec">ที่แนะนำ</span>
                        )}
                        {p.size}
                      </button>
                    ))}
                  </div>

                  <div
                    className="sguide__panel"
                    id="sguide-panel"
                    role="tabpanel"
                    aria-labelledby={`sguide-tab-${shown}`}
                    tabIndex={0}
                  >
                    <div className="sguide__figure" />

                    {/* ตัวเลขที่โชว์คือ deltaCm ไม่ใช่ easeCm — คำตัดสินคิดจาก delta
                        ถ้าเอา ease มาวางคู่กัน ตัวเลขกับคำพูดจะสวนทาง เช่นไหล่ ease +17.5
                        แต่ทรงตั้งใจไว้ +20.6 คำตัดสินจึงเป็น "คับเล็กน้อย" ทั้งที่เลขเป็นบวก */}
                    <ul className="sguide__dims">
                      {current.dimensions.map((d) => (
                        <li key={d.key} className={`sguide__dim is-${d.verdict}`}>
                          <span className="sguide__dimname">{d.labelTh}</span>
                          <span className="sguide__dimverdict">{d.verdictTh}</span>
                          <span className="sguide__dimnum">
                            {d.deltaCm > 0 ? "+" : ""}{d.deltaCm} ซม. จากทรงที่ตั้งใจ
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ตารางครบทุกไซซ์ — วิดเจ็ตต้นแบบสั่งให้ไปเทียบตารางขนาดแต่โชว์แค่ 3 ไซซ์แรก
                      (บั๊กข้อ 1 ของรีวิว) ที่นี่ข้อมูลมีครบอยู่แล้ว จึงกางให้ดูตรงนี้เลย */}
                  <details className="sguide__chart">
                    <summary>ตารางขนาดทุกไซซ์ (นิ้ว)</summary>
                    <div className="sizetable-wrap">
                      <table className="sizetable">
                        <thead>
                          <tr>
                            <th scope="col">SIZE</th>
                            {SIZES.map((s) => <th scope="col" key={s.size}>{s.size}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr><th scope="row">รอบอก</th>{SIZES.map((s) => <td key={s.size}>{s.chest}</td>)}</tr>
                          <tr><th scope="row">ความยาว</th>{SIZES.map((s) => <td key={s.size}>{s.length}</td>)}</tr>
                          <tr><th scope="row">ไหล่</th>{SIZES.map((s) => <td key={s.size}>{s.shoulder}</td>)}</tr>
                        </tbody>
                      </table>
                    </div>
                  </details>

                  <p className="sguide__disclaimer">
                    ไซซ์ที่แนะนำอาจคลาดเคลื่อนจากไซซ์จริงของคุณ ค่าวัดเสื้อมีความคลาดเคลื่อนจากการผลิต 1–2 ซม.
                  </p>

                  <div className="sguide__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>
                      ปิด
                    </button>
                  </div>
                </div>
              );
            })()
```

- [ ] **Step 4: CSS ของหน้าผลลัพธ์**

ต่อท้ายบล็อก SIZE GUIDE ใน `globals.css`:

```css
.sguide__result{display:flex;flex-direction:column;gap:1rem}
.sguide__profile{display:flex;align-items:center;justify-content:space-between;gap:1rem;
  font-size:13.5px;color:var(--text-2)}
.sguide__headline{font-size:1.15rem;font-weight:600;text-align:center;letter-spacing:-.01em}

/* แท็บไซซ์ — ป้าย "ที่แนะนำ" ลอยเหนือตัวอักษร จึงต้องเผื่อ padding-top ให้ทุกแท็บเท่ากัน
   ไม่งั้นแท็บที่มีป้ายจะสูงกว่าเพื่อนแล้วแถวเด้ง */
.sguide__tabs{display:flex;gap:.15rem;border-bottom:1px solid var(--line)}
.sguide__tab{position:relative;flex:1;padding:1.5rem .2rem .6rem;
  font-size:13.5px;font-weight:600;color:var(--text-3);
  border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .2s}
.sguide__tab:hover{color:var(--text-2)}
.sguide__tab.is-on{color:var(--text);border-bottom-color:var(--text)}
.sguide__rec{position:absolute;top:.35rem;left:50%;transform:translateX(-50%);
  font-size:10px;font-weight:600;letter-spacing:.04em;color:var(--red-ink);white-space:nowrap}

.sguide__panel{display:flex;flex-direction:column;gap:.9rem}
.sguide__panel:focus-visible{outline:2.5px solid var(--red-ink);outline-offset:3px}

.sguide__dims{display:flex;flex-direction:column;gap:.1rem}
.sguide__dim{display:grid;grid-template-columns:1fr auto;gap:.1rem .8rem;
  padding:.7rem 0;border-bottom:1px solid var(--line)}
.sguide__dim:last-child{border-bottom:none}
.sguide__dimname{font-size:14px;font-weight:600}
.sguide__dimverdict{font-size:14px;font-weight:600;text-align:right}
.sguide__dimnum{grid-column:1/-1;font-size:12px;color:var(--text-3)}
/* สีบอกซ้ำสิ่งที่คำไทยบอกอยู่แล้ว ไม่ได้เป็นตัวสื่อความหมายเดี่ยว ๆ (1.4.1) */
.sguide__dim.is-fit .sguide__dimverdict{color:var(--text)}
.sguide__dim.is-slightlyLoose .sguide__dimverdict,
.sguide__dim.is-loose .sguide__dimverdict{color:var(--tan)}
.sguide__dim.is-slightlyTight .sguide__dimverdict,
.sguide__dim.is-tight .sguide__dimverdict{color:var(--red-ink)}

.sguide__chart summary{font-size:13px;color:var(--text-2);cursor:pointer;padding:.4rem 0}
.sguide__chart summary:hover{color:var(--text)}
.sguide__chart .sizetable{margin-top:.5rem}
.sguide__disclaimer{font-size:11.5px;color:var(--text-3);line-height:1.5}
```

- [ ] **Step 5: ตรวจว่าคอมไพล์ผ่าน**

Run: `npx eslint src && npm run build`
Expected: ผ่านทั้งคู่

- [ ] **Step 6: ตรวจในเบราว์เซอร์**

Run: `npm run dev` แล้วกรอก ชาย / 33 / 165 / 80 → กด "ดำเนินการต่อ"

ต้องเห็นครบ:
1. แถบโปรไฟล์ขึ้น "ชาย, 33 ปี, 165 ซม., 80 กก." พร้อมปุ่ม "เปลี่ยน"
2. แท็บ 5 ไซซ์ XL–5XL โดย **3XL** มีป้าย "ที่แนะนำ" และถูกเลือกอยู่
3. ลิสต์ 3 แถว: ไหล่ · รอบอก · ความยาวตัว แต่ละแถวมีคำตัดสินและตัวเลข "… ซม. จากทรงที่ตั้งใจ"
4. กดแท็บ XL → เนื้อหาเปลี่ยนตาม แต่ป้าย "ที่แนะนำ" ยังอยู่ที่ 3XL
5. โฟกัสที่แท็บแล้วกดลูกศรซ้าย/ขวา → แท็บเลื่อนและโฟกัสตามไปด้วย
6. กาง "ตารางขนาดทุกไซซ์" → เห็นครบ 5 ไซซ์
7. กด "เปลี่ยน" → กลับไปฟอร์มโดยค่าที่กรอกยังอยู่ครบ

- [ ] **Step 7: Commit**

```bash
git add src/components/SizeGuide.tsx src/app/globals.css
git commit -m "feat: show per-dimension fit verdicts for every size"
```

---

### Task 4: `FitFigure.tsx` — หุ่น SVG พร้อมเส้นบอกตำแหน่ง

**Files:**
- Create: `src/components/FitFigure.tsx`
- Modify: `src/components/SizeGuide.tsx` (เสียบแทน `<div className="sguide__figure" />`)
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `DimensionResult[]` จากไซซ์ที่กำลังเปิดดู
- Produces: `<FitFigure dimensions={DimensionResult[]} />`

- [ ] **Step 1: สร้าง component**

สร้าง `src/components/FitFigure.tsx`:

```tsx
import type { DimensionResult, Verdict } from "@/lib/fit";

/* หุ่นครึ่งตัวมองจากด้านหน้า ทรงพลัสไซซ์ + เส้นทับ 3 เส้นบอกตำแหน่งที่คำตัดสินพูดถึง
   ไม่ใช่ client component: ไม่มี state ไม่มี event รับ props มาวาดอย่างเดียว

   ต้นแบบใช้หุ่น 3D ที่เปลี่ยนรูปตามน้ำหนัก ซึ่งเกินความจำเป็นที่นี่ —
   หน้าที่จริงของภาพคือชี้ว่า "คำตัดสินนี้พูดถึงตรงไหนของเสื้อ" ไม่ใช่จำลองร่างผู้ใช้

   สีย้ำสิ่งที่คำไทยข้าง ๆ บอกอยู่แล้ว ไม่ได้เป็นตัวสื่อความหมายเดี่ยว ๆ (WCAG 1.4.1)
   พาเลตต์เว็บไม่มีสีฟ้าแบบต้นแบบ จึงใช้ tan แทนหลวม และ red-ink แทนคับ */
const STROKE: Record<Verdict, string> = {
  fit: "var(--text)",
  slightlyLoose: "var(--tan)",
  loose: "var(--tan)",
  slightlyTight: "var(--red-ink)",
  tight: "var(--red-ink)",
};

export default function FitFigure({ dimensions }: { dimensions: DimensionResult[] }) {
  const at = (key: string) => dimensions.find((d) => d.key === key);
  const shoulder = at("shoulder");
  const chest = at("chest");
  const length = at("length");

  return (
    <figure className="fitfig">
      <svg viewBox="0 0 220 260" role="img" aria-label="ภาพหุ่นแสดงตำแหน่งไหล่ รอบอก และชายเสื้อ">
        {/* ลำตัว: คอ ไหล่ตก แขนสั้น เอวกว้าง — ทรง drop-shoulder ของแบรนด์ */}
        <path
          d="M110 26c-11 0-19 6-21 14-3 10-19 12-30 20-9 7-13 16-14 27l-6 44 22 5 4-38v130h90V98l4 38 22-5-6-44c-1-11-5-20-14-27-11-8-27-10-30-20-2-8-10-14-21-14z"
          fill="var(--surface-2)" stroke="var(--line-2)" strokeWidth="1.5" strokeLinejoin="round"
        />
        <circle cx="110" cy="18" r="15" fill="var(--surface-2)" stroke="var(--line-2)" strokeWidth="1.5" />

        {/* เส้นไหล่ พาดตะเข็บบ่าทั้งสองข้าง */}
        <path d="M59 60q51-16 102 0" fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={shoulder ? STROKE[shoulder.verdict] : "var(--text)"} />
        {/* เส้นรอบอก */}
        <path d="M52 112q58 12 116 0" fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={chest ? STROKE[chest.verdict] : "var(--text)"} />
        {/* เส้นชายเสื้อ */}
        <path d="M65 228q45 8 90 0" fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={length ? STROKE[length.verdict] : "var(--text)"} />
      </svg>

      {/* ป้ายข้างภาพ — ข้อความซ้ำกับลิสต์ด้านล่างโดยตั้งใจ เพื่อให้ตำแหน่งบนภาพอ่านได้ในตัวเอง
          aria-hidden เพราะลิสต์ด้านล่างบอกข้อมูลเดียวกันครบแล้ว ไม่ต้องให้ screen reader อ่านซ้ำ */}
      <figcaption className="fitfig__keys" aria-hidden="true">
        {dimensions.map((d) => (
          <span key={d.key} className={`fitfig__key is-${d.verdict}`}>
            {d.labelTh} · {d.verdictTh}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 2: เสียบเข้าหน้าผลลัพธ์**

ใน `src/components/SizeGuide.tsx` เพิ่ม import ต่อจาก `import { SIZES } from "@/lib/sizes";`:

```tsx
import FitFigure from "./FitFigure";
```

แล้วแทน `<div className="sguide__figure" />` ด้วย:

```tsx
                    <FitFigure dimensions={current.dimensions} />
```

- [ ] **Step 3: CSS ของหุ่น**

ต่อท้ายบล็อก SIZE GUIDE ใน `globals.css`:

```css
.fitfig{display:flex;flex-direction:column;align-items:center;gap:.6rem}
.fitfig svg{width:min(200px,58%);height:auto}
.fitfig__keys{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem .6rem}
.fitfig__key{font-size:11.5px;font-weight:600;padding:.25em .7em;
  border:1px solid var(--line-2);border-radius:var(--r-pill)}
.fitfig__key.is-fit{color:var(--text)}
.fitfig__key.is-slightlyLoose,.fitfig__key.is-loose{color:var(--tan);border-color:var(--tan)}
.fitfig__key.is-slightlyTight,.fitfig__key.is-tight{color:var(--red-ink);border-color:var(--red-ink)}
```

- [ ] **Step 4: ตรวจว่าคอมไพล์ผ่าน**

Run: `npx eslint src && npm run build`
Expected: ผ่านทั้งคู่

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

Run: `npm run dev` แล้วกรอก ชาย / 33 / 165 / 80

ต้องเห็น:
1. หุ่นขึ้นเหนือลิสต์คำตัดสิน มีเส้น 3 เส้นที่ไหล่ อก และชายเสื้อ
2. กดไล่แท็บ XL → 5XL แล้ว**สีของเส้นเปลี่ยนตามคำตัดสิน** (ดำ = พอดี, น้ำตาล = หลวม, แดง = คับ)
3. ป้ายใต้ภาพเปลี่ยนข้อความตามแท็บที่เลือก
4. สีของเส้นตรงกับคำตัดสินในลิสต์ด้านล่างเสมอ

- [ ] **Step 6: Commit**

```bash
git add src/components/FitFigure.tsx src/components/SizeGuide.tsx src/app/globals.css
git commit -m "feat: draw the fit verdicts onto a figure"
```

---

### Task 5: Responsive · reduced-motion · เอกสาร · ตรวจรอบสุดท้าย

**Files:**
- Modify: `src/app/globals.css` (บล็อก media query ที่มีอยู่แล้ว)
- Modify: `README.md`

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 1–4
- Produces: ไม่มี interface ใหม่

- [ ] **Step 1: dialog เต็มจอบนมือถือ**

เพิ่มเข้าไปใน media query `@media(max-width:560px)` ที่มีอยู่แล้วใน `globals.css`:

```css
  /* เต็มจอบนมือถือให้ตรงกับรูปอ้างอิงซึ่งเป็นความกว้างมือถือทั้งหมด
     ปุ่มในแถวเดียวกันแคบเกินอ่านที่ 320px จึงเรียงลงมาแทน */
  .sguide{width:100%;max-width:none;height:100%;max-height:none;border:none;border-radius:0}
  .sguide__row{grid-template-columns:1fr}
  .sguide__actions{flex-direction:column}
  .sguide__tab{font-size:12.5px;padding:1.5rem .1rem .6rem}
```

- [ ] **Step 2: reduced motion**

เพิ่มบรรทัดในบล็อก `@media(prefers-reduced-motion:reduce)` ที่มีอยู่แล้ว ต่อจาก `.ctile:hover,.btn:hover{transform:none !important}`:

```css
  .sguide__tab{transition:none}
```

- [ ] **Step 3: อัปเดต README**

ใน `README.md` แก้บรรทัดที่เขียนว่ามี client component 2 ตัว:

```
- **Rendering:** fully static HTML (`○ Static`). Only two client components: `Nav` (mobile menu) and `Newsletter` (form). Everything else is a server component.
```

เป็น:

```
- **Rendering:** fully static HTML (`○ Static`). Three client components: `Nav` (mobile menu), `Newsletter` (form) and `SizeGuide` (the size recommender dialog). Everything else is a server component.
```

แล้วในบล็อก "Project structure" แก้บรรทัดรายชื่อ component เป็น:

```
  components/     One file per block, in page order:
                    Topbar · Nav* · Hero · BestSellers · TrustBar · Story · WhyOverbear
                    FabricDetail · BuiltForBiggerDays · CustomerVoice · ShopByCategory
                    PromoBanner · Newsletter* · Footer          (* = client component)
                  Shared: Frame (photo slot) · Placeholder (empty slot) · Reveal · icons
                  Size guide: SizeGuide* (dialog + form) · FitFigure (SVG) · lib/fit.ts (engine)
```

และเพิ่มบรรทัดใต้ `sizes.ts` ในบล็อกเดียวกัน:

```
    fit.ts        Size recommendation engine. Pure, no React — `scripts/verify-fit.ts` runs it
                  directly under Node. Model constants and their limits: see the design spec in
                  docs/superpowers/specs/
```

- [ ] **Step 4: ตรวจรอบสุดท้ายครบทุกอย่าง**

Run:
```bash
npx eslint src
npm run build
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-fit.ts
```
Expected: ผ่านทั้งสามคำสั่ง · build ต้องขึ้น `○ (Static)` สำหรับ `/` เหมือนเดิม

- [ ] **Step 5: ตรวจมือถือในเบราว์เซอร์**

Run: `npm run dev` แล้วย่อหน้าต่างเหลือกว้าง 360px

ต้องเห็น:
1. dialog เต็มจอ ไม่มีขอบมน
2. ช่องส่วนสูง/น้ำหนักเรียงลงมาเป็นคอลัมน์เดียว
3. แท็บ 5 ไซซ์ยังอยู่ในแถวเดียว ไม่ล้น
4. ตารางขนาดที่กางออกมาเลื่อนในกล่องตัวเอง **หน้าเว็บไม่เลื่อนแนวนอน**
5. ทั้งหน้าไม่มี horizontal scrollbar

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css README.md
git commit -m "feat: fit the size guide to small screens and document it"
```

---

## Self-Review

**ครอบคลุม spec ครบ:** §3 สถาปัตยกรรม → Task 1–5 · §4.1–4.5 เอนจิน → Task 1 · §5.1 ฟอร์ม → Task 2 ·
§5.2 หน้าผลลัพธ์ → Task 3 · §5.3 หุ่น → Task 4 · §5.4 a11y → กระจายใน Task 2–4 (label ผูกจริง,
WAI tabs, `--line-input`, ปิดแล้วค่าไม่หาย) · §5.5 responsive → Task 5 · §6 การตรวจสอบ → Task 1 ครบ 4 ข้อ

**ชื่อที่ต้องตรงกันข้าม task:** `recommend()` · `OVERBEAR_TEE` · `HEADLINE_TH` · `DimensionResult.key`
(ไม่ใช่ `dimension`) · `deltaCm` (ไม่ใช่ `delta`) · `perSize[].dimensions` · `<FitFigure dimensions={...} />`
— ตรวจแล้วตรงกันทุกจุดที่อ้างถึง

**จุดที่จงใจไม่ทำ:** ไม่มี localStorage (ตามผลตัดสินข้อ 4) · ไม่มีข้อความ out-of-range (ข้อ 5) ·
ไม่แตะ `MODEL` · ไม่เพิ่ม test runner · ไม่แก้ `sizes.ts`

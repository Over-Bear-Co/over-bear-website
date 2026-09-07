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

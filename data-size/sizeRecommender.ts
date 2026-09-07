/**
 * sizeRecommender.ts — reference implementation ของ size recommender
 * แบบเดียวกับ UNIQLO MySize ASSIST (powered by Bodygram body2fit)
 *
 * ข้อมูล garment = ของจริงจาก uniqlo.com/th/th/size/465185_size.html
 * ตัวสูตร body estimation = โมเดลของผมเอง (ไม่ใช่ของ Bodygram)
 *   คาลิเบรตจากผลจริง 2 เคสที่ทดสอบบนวิดเจ็ต — ดู verify.ts
 *
 * ไม่มี dependency. รันได้ด้วย: node --experimental-strip-types verify.ts
 */

// ─────────────────────────────────────────── types

export type Gender = 'female' | 'male';

export type FitPreference =
  | 'tight'          // รัดรูป
  | 'slightlyTight'
  | 'standard'       // มาตรฐาน (default ของ UNIQLO)
  | 'slightlyLoose'
  | 'loose';         // หลวม

export type Verdict =
  | 'tight'          // คับ
  | 'slightlyTight'  // คับเล็กน้อย
  | 'fit'            // พอดี
  | 'slightlyLoose'  // หลวมเล็กน้อย
  | 'loose';         // หลวม

export interface UserInput {
  gender: Gender;
  age: number;        // เก็บไว้ให้ schema ครบ — โมเดลนี้ยังไม่ใช้ (ageCoef = 0)
  heightCm: number;   // วิดเจ็ตจริงรับ 50–260
  weightKg: number;   // วิดเจ็ตจริงรับ 10–200
  fitPreference?: FitPreference;
}

/** ค่าวัดเสื้อแบบวัดแบน (flat) หน่วย ซม. */
export interface GarmentSize {
  name: string;
  code?: string;
  backLength: number;
  shoulder: number;
  bodyWidth: number;
  sleeve: number;
}

export interface StyleSpec {
  /** ease ที่ดีไซน์ตั้งใจ หน่วย ซม. — oversized tee ตัวนี้ = อก +15, ไหล่ +10 */
  intendedEase: { chest: number; shoulder: number };
  sizes: GarmentSize[];
}

export interface DimensionResult {
  dimension: 'chest' | 'shoulder';
  labelTh: string;
  bodyCm: number;
  garmentCm: number;
  easeCm: number;        // garment - body
  deltaCm: number;       // easeCm - ease ที่ตั้งใจ (บวก = หลวมกว่าแบบ)
  verdict: Verdict;
  verdictTh: string;
}

export interface Recommendation {
  recommendedSize: string;
  /** target อยู่นอกช่วงที่ไซส์รองรับ — ลูกค้าตัวใหญ่/เล็กเกินกว่าที่แพตเทิร์นนี้ครอบคลุม */
  outOfRange: 'tooLarge' | 'tooSmall' | null;
  body: { chestCirc: number; shoulderWidth: number };
  targetChestCirc: number;
  perSize: Array<{ size: string; dimensions: DimensionResult[]; score: number }>;
}

// ─────────────────────────────────────────── model parameters (แก้ที่นี่เวลาคาลิเบรตใหม่)

export const MODEL = {
  /**
   * body estimation: circumference ~ sqrt(mass / height)
   *   X = sqrt(weightKg / (heightCm/100))   // sqrt(kg per metre)
   *   value = a * X + b (+ offset ตามเพศ)
   * a, b ของผู้หญิงถูก solve จากผลจริง 2 เคส (170/55 -> XS, 175/95 -> XXL)
   * รูป sqrt เลือกเพราะรอบตัวโตช้ากว่าน้ำหนักแบบเชิงเส้น (โมเดลเชิงเส้นจะพุ่งเกินจริงที่ 100+ กก.)
   */
  body: {
    chestCirc:     { a: 19.644, b: -27.734 },
    shoulderWidth: { a: 2.3811, b: 25.956 },
    /** offset ตามเพศ ที่ส่วนสูง/น้ำหนักเท่ากัน (ชายมีมวลช่วงบนมากกว่า) — ยังไม่ verify */
    genderOffset: {
      female: { chest: 0, shoulder: 0 },
      male:   { chest: 5, shoulder: 3 },
    },
  },
  ageCoef: 0,
  /** เลื่อน target ease ตาม slider 5 ระดับ (ยังไม่ verify) */
  fitPreferenceShiftCm: {
    tight: -6, slightlyTight: -3, standard: 0, slightlyLoose: 3, loose: 6,
  } satisfies Record<FitPreference, number>,
  /** ขอบเขตคำตัดสิน: |delta| <= fit => พอดี, <= slight => เล็กน้อย, เกินนั้น => หลวม/คับ */
  verdictBands: { fit: 3, slight: 8 },
} as const;

export const VERDICT_TH: Record<Verdict, string> = {
  tight: 'คับ',
  slightlyTight: 'คับเล็กน้อย',
  fit: 'พอดี',
  slightlyLoose: 'หลวมเล็กน้อย',
  loose: 'หลวม',
};

// ─────────────────────────────────────────── garment data (ของจริง)

export const UNIQLO_465185: StyleSpec = {
  intendedEase: { chest: 15, shoulder: 10 },
  sizes: [
    { name: 'XS',  code: 'SMA002', backLength: 64,   shoulder: 49.5, bodyWidth: 49.5, sleeve: 50   },
    { name: 'S',   code: 'SMA003', backLength: 66,   shoulder: 51,   bodyWidth: 52.5, sleeve: 51   },
    { name: 'M',   code: 'SMA004', backLength: 69,   shoulder: 52.5, bodyWidth: 55.5, sleeve: 53   },
    { name: 'L',   code: 'SMA005', backLength: 72,   shoulder: 54,   bodyWidth: 58.5, sleeve: 55   },
    { name: 'XL',  code: 'SMA006', backLength: 75,   shoulder: 56,   bodyWidth: 62.5, sleeve: 57   },
    { name: 'XXL', code: 'SMA007', backLength: 77.5, shoulder: 58,   bodyWidth: 66.5, sleeve: 58   },
    { name: '3XL', code: 'SMA008', backLength: 77.5, shoulder: 60,   bodyWidth: 70.5, sleeve: 59   },
    { name: '4XL', code: 'SMA009', backLength: 77.5, shoulder: 62,   bodyWidth: 74.5, sleeve: 60.5 },
  ],
};

// ─────────────────────────────────────────── core

/** ประมาณสัดส่วนร่างกายจาก เพศ/ส่วนสูง/น้ำหนัก (หน่วย ซม.) */
export function estimateBody(input: UserInput) {
  const { chestCirc, shoulderWidth, genderOffset } = MODEL.body;
  const off = genderOffset[input.gender];
  const x = Math.sqrt(input.weightKg / (input.heightCm / 100));
  return {
    chestCirc: chestCirc.a * x + chestCirc.b + off.chest,
    shoulderWidth: shoulderWidth.a * x + shoulderWidth.b + off.shoulder,
    x,
  };
}

function classify(deltaCm: number): Verdict {
  const { fit, slight } = MODEL.verdictBands;
  if (Math.abs(deltaCm) <= fit) return 'fit';
  if (deltaCm > 0) return deltaCm <= slight ? 'slightlyLoose' : 'loose';
  return deltaCm >= -slight ? 'slightlyTight' : 'tight';
}

function evaluateSize(
  size: GarmentSize,
  body: { chestCirc: number; shoulderWidth: number },
  style: StyleSpec,
  prefShift: number,
): DimensionResult[] {
  const garmentChest = size.bodyWidth * 2; // วัดแบน -> รอบอก
  const chestEase = garmentChest - body.chestCirc;
  const shoulderEase = size.shoulder - body.shoulderWidth;
  const chestDelta = chestEase - (style.intendedEase.chest + prefShift);
  const shoulderDelta = shoulderEase - (style.intendedEase.shoulder + prefShift);

  const mk = (
    dimension: 'chest' | 'shoulder',
    labelTh: string,
    bodyCm: number,
    garmentCm: number,
    easeCm: number,
    deltaCm: number,
  ): DimensionResult => {
    const verdict = classify(deltaCm);
    return {
      dimension, labelTh,
      bodyCm: round(bodyCm), garmentCm: round(garmentCm),
      easeCm: round(easeCm), deltaCm: round(deltaCm),
      verdict, verdictTh: VERDICT_TH[verdict],
    };
  };

  return [
    mk('shoulder', 'ไหล่', body.shoulderWidth, size.shoulder, shoulderEase, shoulderDelta),
    mk('chest', 'ความกว้างของลำตัว', body.chestCirc, garmentChest, chestEase, chestDelta),
  ];
}

const round = (n: number) => Math.round(n * 10) / 10;

export function recommend(input: UserInput, style: StyleSpec = UNIQLO_465185): Recommendation {
  if (input.heightCm < 50 || input.heightCm > 260) throw new RangeError('heightCm ต้องอยู่ระหว่าง 50–260');
  if (input.weightKg < 10 || input.weightKg > 200) throw new RangeError('weightKg ต้องอยู่ระหว่าง 10–200');

  const body = estimateBody(input);
  const prefShift = MODEL.fitPreferenceShiftCm[input.fitPreference ?? 'standard'];
  const targetChestCirc = body.chestCirc + style.intendedEase.chest + prefShift;

  const perSize = style.sizes.map((size) => ({
    size: size.name,
    dimensions: evaluateSize(size, body, style, prefShift),
    // เลือกไซส์ด้วยรอบอกเป็นตัวคุม (ไหล่รายงานเป็นผลพลอยได้ เหมือนพฤติกรรมที่สังเกตได้)
    score: Math.abs(size.bodyWidth * 2 - targetChestCirc),
  }));

  let best = perSize[0];
  for (const s of perSize) if (s.score < best.score) best = s; // tie -> ไซส์เล็กกว่าชนะ

  const first = style.sizes[0];
  const last = style.sizes[style.sizes.length - 1];
  const outOfRange: Recommendation['outOfRange'] =
    targetChestCirc > last.bodyWidth * 2 + MODEL.verdictBands.fit ? 'tooLarge'
    : targetChestCirc < first.bodyWidth * 2 - MODEL.verdictBands.fit ? 'tooSmall'
    : null;

  return {
    recommendedSize: best.size,
    outOfRange,
    body: { chestCirc: round(body.chestCirc), shoulderWidth: round(body.shoulderWidth) },
    targetChestCirc: round(targetChestCirc),
    perSize,
  };
}

/** เรนเดอร์ผลลัพธ์แบบเดียวกับหน้า result ของ MySize ASSIST */
export function explainTh(input: UserInput, style: StyleSpec = UNIQLO_465185): string {
  const r = recommend(input, style);
  const head = `${input.gender === 'female' ? 'หญิง' : 'ชาย'}, ${input.age} ปี, ${input.heightCm} ซม., ${input.weightKg} กก.`;
  const rec = r.perSize.find((s) => s.size === r.recommendedSize)!;
  const lines = rec.dimensions.map((d) => `  ${d.labelTh}: ${d.verdictTh} (ease ${d.easeCm >= 0 ? '+' : ''}${d.easeCm} ซม.)`);
  if (r.outOfRange === 'tooLarge') lines.push('  ! เกินช่วงไซส์ที่แพตเทิร์นนี้รองรับ');
  if (r.outOfRange === 'tooSmall') lines.push('  ! เล็กกว่าช่วงไซส์ที่แพตเทิร์นนี้รองรับ');
  return [`${head}\nไซส์ที่แนะนำ: ${r.recommendedSize}`, ...lines].join('\n');
}

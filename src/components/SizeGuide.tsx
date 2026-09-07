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

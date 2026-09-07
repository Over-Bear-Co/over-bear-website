"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  HEADLINE_TH, recommend,
  type FitPreference, type Gender, type Recommendation, type UserInput,
} from "@/lib/fit";
import { SIZES } from "@/lib/sizes";
import FitFigure from "./FitFigure";

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

  /* ไซซ์ที่กำลังเปิดดูอยู่ — เริ่มที่ไซซ์ที่แนะนำ แต่กดแท็บอื่นดูได้ทุกไซซ์
     null = ยังไม่เคยกดแท็บ ให้ตกไปใช้ไซซ์ที่แนะนำของผลล่าสุด
     เก็บเป็น null แทนการ sync ด้วย useEffect เพราะคำนวณผลใหม่แล้วต้องเด้งกลับไซซ์ที่แนะนำเสมอ */
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const valid = parseForm(form);

  const submit = () => {
    if (!valid) return;
    setResult({ input: valid, rec: recommend(valid) });
    setActiveSize(null);
  };

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

  /* เนื้อหาของ .sguide__body ตัดสินด้วย if/else ก่อนเข้า JSX แทนที่จะเป็น ternary
     ผูก IIFE ไว้ในต้นไม้ JSX ตรง ๆ — eslint (react-hooks/refs) มองว่ากิ่งที่ render แบบมีเงื่อนไข
     ซึ่งมีปุ่มอ่านค่า ref (tabsRef ใน onTabKey) อาจถูกเรียกระหว่าง render แล้วฟ้อง false positive
     ย้ายมาคำนวณเป็นตัวแปรก่อน return จึงเลี่ยงรูปแบบที่ตัวตรวจจับสับสนได้ โดยพฤติกรรมเหมือนเดิมทุกอย่าง */
  let body: ReactNode;
  if (result === null) {
    body = (
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
    );
  } else {
    const names = result.rec.perSize.map((p) => p.size);
    const shown = activeSize ?? result.rec.recommendedSize;
    const current = result.rec.perSize.find((p) => p.size === shown)!;
    const chest = current.dimensions.find((d) => d.key === "chest")!;
    body = (
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
          <FitFigure dimensions={current.dimensions} />

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
  }

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

        <div className="sguide__body">{body}</div>
      </dialog>
    </>
  );
}

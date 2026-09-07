import type { DimensionResult, Verdict } from "@/lib/fit";

/* หุ่นครึ่งตัวมองจากด้านหน้า ทรงพลัสไซซ์ + เส้นทับ 3 เส้นบอกตำแหน่งที่คำตัดสินพูดถึง
   ไม่ใช่ client component: ไม่มี state ไม่มี event รับ props มาวาดอย่างเดียว

   ต้นแบบใช้หุ่น 3D ที่เปลี่ยนรูปตามน้ำหนัก ซึ่งเกินความจำเป็นที่นี่ —
   หน้าที่จริงของภาพคือชี้ว่า "คำตัดสินนี้พูดถึงตรงไหนของเสื้อ" ไม่ใช่จำลองร่างผู้ใช้

   สีย้ำสิ่งที่คำไทยข้าง ๆ บอกอยู่แล้ว ไม่ได้เป็นตัวสื่อความหมายเดี่ยว ๆ (WCAG 1.4.1)
   พาเลตต์เว็บไม่มีสีฟ้าแบบต้นแบบ จึงใช้ --verdict-loose แทนหลวม และ --verdict-tight แทนคับ

   ใช้ --verdict-* ไม่ใช่ --tan/--red-ink ตรง ๆ เพื่อให้สีตรงกับป้าย .fitfig__key และ
   .sguide__dim ทุกจุด (เคยซ้ำสามที่แยกกัน แก้ที่เดียวไม่ครบ) เส้น svg เป็นวัตถุกราฟิก
   ต้องผ่านแค่ 3:1 อยู่แล้ว ค่า --verdict-loose ที่เข้มกว่า --tan ยิ่งผ่านสบาย (5.15:1 บน --surface-2) */
const STROKE: Record<Verdict, string> = {
  fit: "var(--verdict-fit)",
  slightlyLoose: "var(--verdict-loose)",
  loose: "var(--verdict-loose)",
  slightlyTight: "var(--verdict-tight)",
  tight: "var(--verdict-tight)",
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

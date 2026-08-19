import PullUpHeading from "./PullUpHeading";

/* ตารางไซซ์ฉบับเต็ม — ตัวเลขวัดตัวยกมาจาก code.html (บรรทัด 512-527) ทั้งชุด
   สังเกตว่าไล่ระดับ +2 นิ้วรอบอก / +1 ความยาว / +1 บ่า ต่อไซซ์อย่างสม่ำเสมอ

   ตารางนี้คือแหล่งอ้างอิงเดียวของช่วงไซซ์ที่ขาย — เริ่มที่ XL ไม่มี M กับ L
   ข้อความทั่วเว็บ (topbar, hero, marquee, metadata, การ์ดสินค้า, ช่องสเปกใน Story)
   ต้องเขียน XL–5XL ให้ตรงกับที่นี่เสมอ ถ้าเพิ่มไซซ์ต้องไล่แก้ทุกจุด

   จำนวนแถวต้องตรงกับคาสเคดหน่วงเวลาใน globals.css (.size-sec … tbody tr:nth-child(2)…(5))
   ช่วงน้ำหนักไม่คาบเกี่ยวกัน — ต้นฉบับเขียน 80-92 ต่อด้วย 92-105 ทำให้ 92 kg แมปได้สองไซซ์ */
const ROWS: [string, number, number, number, string][] = [
  ["XL-03", 49, 33, 25, "80–91 kg"],
  ["2XL-04", 51, 34, 26, "92–104 kg"],
  ["3XL-05", 53, 35, 27, "105–117 kg"],
  ["4XL-06", 55, 36, 28, "118–129 kg"],
  ["5XL-07", 57, 37, 29, "130 kg ขึ้นไป"],
];

export default function SpecificationSheet() {
  return (
    /* id="size" — ตารางนี้แทน SizeTable เดิม จึงต้องรับ anchor #size ต่อจาก
       Hero.tsx:93, Footer.tsx:20 และ Footer.tsx:27 */
    <section className="section sheet size-sec" id="size">
      <div className="wrap">
        <div className="sec-head reveal reveal--pu">
          <div>
            <span className="eyebrow">Specification sheet</span>
            <PullUpHeading lines={[[{ text: "ตารางไซซ์" }], [{ text: "ฉบับเต็ม" }]]} />
          </div>
          <div>
            <span className="sheet__ref">REF: OB-ARCHIVE-2024-V1</span>
            <div className="sheet__mark" aria-hidden="true">
              ไซซ์หมี
            </div>
          </div>
        </div>

        <div className="table-wrap reveal">
          <table>
            <thead>
              <tr>
                <th scope="col">UNIT ID</th>
                <th scope="col">รอบอก (นิ้ว)</th>
                <th scope="col">ความยาว (นิ้ว)</th>
                <th scope="col">บ่า (นิ้ว)</th>
                <th scope="col">เหมาะกับน้ำหนัก</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([unit, chest, len, shoulder, weight]) => (
                <tr key={unit}>
                  <td>{unit}</td>
                  <td>{chest}</td>
                  <td>{len}</td>
                  <td>{shoulder}</td>
                  <td>{weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="size-note">
          * วัดจากตัวเสื้อจริงแบบราบ อาจคลาดเคลื่อน ±1 นิ้ว · ชอบทรงหลวมพิเศษ เลือกเผื่อขึ้นอีก 1 ไซซ์
        </p>
      </div>
    </section>
  );
}

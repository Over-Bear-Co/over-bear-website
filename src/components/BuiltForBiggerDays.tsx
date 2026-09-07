import Frame from "./Frame";
import { Check } from "./icons";
import { SIZES } from "@/lib/sizes";
import SizeGuide from "./SizeGuide";

/* 3 คอลัมน์: รูป / ข้อความ+เช็คลิสต์ / การ์ดตารางไซซ์
   การ์ดตารางไซซ์รับ anchor #size แทน SpecificationSheet เดิม (Topbar/Nav/Footer ลิงก์มาที่นี่)
   ตารางเต็ม 5 คอลัมน์ในการ์ดแคบ — บนมือถือ .built__in ยุบเป็นคอลัมน์เดียวก่อน
   จึงได้ความกว้างเต็มจอ ตารางไม่ต้อง scroll แนวนอน */
const POINTS = [
  "ไหล่พอดี ไม่รั้งแขน",
  "รอบอกกว้าง ใส่สบาย ไม่อึดอัด",
  "แขนเสื้อโปร่ง เคลื่อนไหวคล่องตัว",
  "ตัวเสื้อยาวพอดี ไม่สั้นหรือยาวเกินไป",
];

export default function BuiltForBiggerDays() {
  return (
    <section className="sec" id="size">
      <div className="wrap built__in">
        <div className="built__media reveal">
          <Frame
            src="/media/street/fit-01.jpg"
            alt="นายแบบพลัสไซซ์ใส่เสื้อยืด oversize เดินบนถนนในเมือง ถ่ายเต็มตัว"
            sizes="(max-width:720px) 92vw, (max-width:1180px) 46vw, 29vw"
          />
        </div>

        <div className="reveal">
          <span className="eyebrow">Built for bigger days</span>
          <h2 className="sec-title">ตัดเย็บเพื่อวันของคุณ</h2>
          <p className="sec-lead">
            แพทเทิร์นที่ออกแบบเพื่อรูปร่างพลัสไซซ์โดยเฉพาะ ให้คุณเคลื่อนไหวได้สบาย มั่นใจตลอดวัน
          </p>
          <ul className="built__list">
            {POINTS.map((p) => (
              <li key={p}>
                <Check />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sizecard reveal">
          <span className="eyebrow">Size &amp; fit guide</span>
          <h3>เลือกไซซ์ที่ใช่<br />ในแบบของคุณ</h3>
          {/* กล่อง scroll: ที่จอ <=360px ตาราง 6 คอลัมน์กว้างกว่าการ์ด
              ให้เลื่อนในกล่องตัวเอง ไม่ดันหน้าให้เลื่อนแนวนอนทั้งหน้า */}
          <div className="sizetable-wrap">
          <table className="sizetable">
            <thead>
              <tr>
                <th scope="col">SIZE</th>
                {SIZES.map((s) => (
                  <th scope="col" key={s.size}>{s.size}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">รอบอก (นิ้ว)</th>
                {SIZES.map((s) => <td key={s.size}>{s.chest}</td>)}
              </tr>
              <tr>
                <th scope="row">ความยาว (นิ้ว)</th>
                {SIZES.map((s) => <td key={s.size}>{s.length}</td>)}
              </tr>
              <tr>
                <th scope="row">ไหล่ (นิ้ว)</th>
                {SIZES.map((s) => <td key={s.size}>{s.shoulder}</td>)}
              </tr>
              {/* แถวน้ำหนักเป็นแถวเดียวที่ค่าไม่ใช่ตัวเลขเดี่ยว จึงกว้างสุดในตาราง
                  หน่วย kg อยู่ที่หัวแถว ไม่ซ้ำในทุกช่อง (ดูเหตุผลใน lib/sizes.ts) */}
              <tr>
                <th scope="row">เหมาะกับน้ำหนัก (kg)</th>
                {SIZES.map((s) => <td key={s.size}>{s.weight}</td>)}
              </tr>
            </tbody>
          </table>
          </div>
          <SizeGuide />
          <p className="sizecard__note">ไม่แน่ใจไซซ์? แชทกับเราช่วยเลือกไซซ์ได้เลย</p>
        </div>
      </div>
    </section>
  );
}

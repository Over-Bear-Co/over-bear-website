import Frame from "./Frame";
import { Dressform, Leaf, Medal } from "./icons";

/* 3 คอลัมน์ตามอ้างอิง: รูป / ข้อความ / รายการคุณสมบัติคั่นด้วยเส้นตั้ง
   สัดส่วน 397:598:265 ยกมาจากค่าที่วัดได้จริงในไฟล์อ้างอิง */
const FEATS = [
  { Icon: Dressform, t: "ตัดเผื่อทรงจริง" },
  { Icon: Leaf,      t: "ใส่สบายทุกวัน" },
  { Icon: Medal,     t: "คุณภาพที่จับได้" },
];

export default function Story() {
  return (
    <section className="sec sec--warm story" id="story">
      <div className="wrap story__in">
        <div className="story__media reveal">
          <Frame
            src="/media/story/model.jpg"
            alt="นายแบบพลัสไซซ์ใส่เสื้อยืดทรง oversize ยืนในสตูดิโอผนังปูนเปลือย"
            sizes="(max-width:720px) 92vw, (max-width:1180px) 46vw, 28vw"
          />
        </div>
        <div className="reveal">
          <span className="eyebrow">Our story</span>
          <h2 className="sec-title">เรื่องราวของ Overbear</h2>
          {/* ย่อหน้าเดียวจากต้นฉบับ แบ่ง 4 บรรทัดตาม <br> ที่ต้นฉบับใส่ไว้
              เดิมผมเขียนใหม่ทั้งก้อนเป็น 2 ย่อหน้า ซึ่งไม่ตรงต้นฉบับเลย */}
          <p className="sec-lead">
            Overbear เชื่อว่าทุกคนมีสไตล์เป็นของตัวเอง
            <br />
            เราออกแบบเสื้อผ้าสำหรับผู้ชายพลัสไซซ์โดยเฉพาะ
            <br />
            เน้นการตัดเย็บที่พอดี ใส่สบาย และช่วยเสริมความมั่นใจในทุกวัน
            <br />
            เพราะเสื้อผ้าที่ดี ไม่ใช่แค่สวย แต่ต้องทำให้คุณรู้สึกเป็นตัวเองได้ดีที่สุด
          </p>
        </div>
        <div className="story__feats reveal">
          {FEATS.map(({ Icon, t }) => (
            <div className="story__feat" key={t}>
              <Icon />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Frame from "./Frame";

/* Hero ตามอ้างอิง: ซ้ายข้อความ ขวารูป + วงกลมบอกช่วงไซซ์
   ต่างจาก hero เดิมที่เป็นรูปเต็มจอ + ตัวอักษรมหึมาซ้อนทับ — โครงนี้อ่านง่ายกว่าและ
   ไม่มีปัญหา contrast ของตัวอักษรบนรูป (hero เดิมวัดพื้นใต้ปุ่มได้แค่ 1.90:1)

   ไม่ใช่ client component: hero นี้ไม่มี parallax/motion แล้ว จึง prerender ได้ทั้งก้อน */
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero__in">
        <div className="hero__copy">
          <h1>
            สไตล์ที่ใช่ ไซซ์ที่ชอบ
            <span className="hero__sub">สำหรับผู้ชายพลัสไซซ์</span>
          </h1>
          {/* ข้อความจากต้นฉบับ แบ่งบรรทัดตาม <br> ของต้นฉบับ
              ต้นฉบับพิมพ์ "เสื่อผ้า" ซึ่งเป็นคำผิด (ที่ถูกคือ "เสื้อผ้า" — ย่อหน้า
              OUR STORY ของต้นฉบับเองก็สะกดถูก) จึงแก้ให้ถูก ไม่ลอกคำผิดมาด้วย */}
          <p className="hero__lead">
            เสื้อผ้าที่ออกแบบมาเพื่อรูปร่างที่หลากหลาย
            <br />
            ใส่สบาย มั่นใจในทุกวัน
          </p>
          <div className="hero__cta">
            <a className="btn" href="#products">ดูคอลเลกชัน</a>
          </div>
        </div>
        <div className="hero__media">
          {/* priority: รูปนี้คือ LCP ของหน้า ต้อง preload ไม่ lazy-load */}
          <Frame
            src="/media/hero/model.jpg"
            alt="นายแบบพลัสไซซ์ใส่เสื้อยืด oversize ทรง drop-shoulder ยืนเต็มตัว"
            sizes="(max-width:960px) 92vw, 46vw"
            priority
          />
          <span className="hero__badge">PLUS SIZE<br />XL – 5XL</span>
        </div>
      </div>
    </section>
  );
}

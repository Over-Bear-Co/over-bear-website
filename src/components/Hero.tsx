import Image from "next/image";

/* Hero ตามอ้างอิง: ซ้ายข้อความ ขวานายแบบ + วงกลมบอกช่วงไซซ์ บนพื้นหลังรูปห้อง

   รูปเป็น PNG/WebP ตัดพื้นหลังโปร่งใส จึงไม่ใช้ <Frame> เหมือน section อื่น —
   .frame มีพื้น --placeholder กับมุมโค้ง 10px ซึ่งจะกลายเป็นกล่องสีแทนหลังตัวนายแบบ
   ที่นี่ใช้ object-fit:contain + object-position:bottom ให้ตัวนายแบบยืนบนขอบล่างของ
   section พอดี และตัวคนกลืนกับพื้นครีมโดยตรง ซึ่งเป็นทั้งหมดที่ทำให้ layout นี้เป็นไปได้

   ไม่ใช่ client component: hero นี้ไม่มี parallax/motion จึง prerender ได้ทั้งก้อน */
export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* พื้นหลังห้อง — decorative ล้วน (alt="") ไม่ได้สื่อข้อมูลที่ข้อความไม่มี
          priority: กินพื้นที่ทั้ง section ในจอแรก จึงเป็นตัวชิง LCP */}
      <div className="hero__bg">
        <Image src="/media/hero/room.jpg" alt="" fill priority sizes="100vw" />
      </div>
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
          <div className="hero__cutout">
            {/* priority: รูปนี้คือ LCP ของหน้า ต้อง preload ไม่ lazy-load */}
            <Image
              src="/media/hero/model-cutout.webp"
              alt="นายแบบพลัสไซซ์ใส่เสื้อยืด oversize สีน้ำตาลอ่อน ทรง drop-shoulder หันหน้าไปทางข้าง"
              fill
              priority
              sizes="(max-width:960px) 88vw, 48vw"
            />
          </div>
          <span className="hero__badge">PLUS SIZE<br />XL – 5XL</span>
        </div>
      </div>
    </section>
  );
}

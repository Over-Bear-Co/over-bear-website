import Frame from "./Frame";

/* พาเนลแดงครึ่งซ้าย รูปครึ่งขวา — จุดเดียวในหน้าที่ใช้แดงเป็นพื้นใหญ่
   ตัวอักษรขาวบน --red (#8b1719) ได้อัตราตัดกัน 9.1:1 ผ่าน AA สบาย */
export default function PromoBanner() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="promo reveal">
          <div className="promo__txt">
            <span className="eyebrow">Discover your style</span>
            <p className="promo__t">
              เสื้อผ้าที่ใช่ ไซซ์ที่ชอบ<br />ใส่แล้วมั่นใจในแบบคุณ
            </p>
            <a className="btn" href="#products">ดูคอลเลกชัน</a>
          </div>
          {/* alt เขียนจากการเปิดดูรูปจริง
              ของเดิมเคยชี้ไป hero/bg.jpg พร้อม alt ที่บรรยาย "ราวแขวนเสื้อยืด"
              แต่ภาพนั้นเป็นผู้ชายยืนในโรงงานร้าง — alt บรรยายภาพที่ไม่มีอยู่ */}
          <Frame
            src="/media/promo/rack.jpg"
            alt="เสื้อยืด oversize 5 สี เทาเข้ม เขียวขี้ม้า น้ำตาล กรมท่า ดินเผา แขวนเรียงบนราวเหล็กหน้าผนังปูน"
            sizes="(max-width:960px) 92vw, 60vw"
          />
        </div>
      </div>
    </section>
  );
}

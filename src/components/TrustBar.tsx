import { Truck, Shield, Swap, Headset } from "./icons";

/* แถบความน่าเชื่อถือ 4 ช่อง — ข้อความยกจากต้นฉบับตรงตัวทุกช่อง
   เคยเรียบเรียงใหม่แล้วเปลี่ยนความหมาย: "ภายใน 7 วัน" ผมเคยเขียน 14 วัน และ
   "รับประกันคุณภาพ" ผมเคยเปลี่ยนเป็น "ตัดเย็บในไทยทุกตัว" ซึ่งเป็นการกล่าวอ้าง
   เรื่องแหล่งผลิตที่ต้นฉบับไม่ได้พูด — ห้ามแต่งข้อความเชิงนโยบายเองอีก

   lg = ไอคอนรถใหญ่กว่าอีกสามตัว (34px เทียบ 32px) ซึ่งเป็นค่าจากต้นฉบับจริง
   เก็บเป็นข้อมูลไม่ใช่ selector ตามลำดับ (:first-child) เพื่อไม่ให้พังเมื่อสลับลำดับช่อง */
const ITEMS = [
  { Icon: Truck,   lg: true,  t: "ส่งฟรี",         d: "เมื่อช้อปครบ 1,500.-" },
  { Icon: Shield,  lg: false, t: "ของแท้ 100%",    d: "รับประกันคุณภาพ" },
  { Icon: Swap,    lg: false, t: "เปลี่ยนไซซ์ฟรี", d: "ภายใน 7 วัน" },
  { Icon: Headset, lg: false, t: "บริการลูกค้า",   d: "ทุกวัน 9:00 - 21:00" },
];

export default function TrustBar() {
  return (
    <section className="sec" aria-label="บริการและการรับประกัน">
      <div className="wrap">
        <div className="trust reveal">
          {ITEMS.map(({ Icon, lg, t, d }) => (
            <div className="trust__item" key={t}>
              <Icon className={`trust__icon${lg ? " trust__icon--lg" : ""}`} />
              <div>
                <div className="trust__t">{t}</div>
                <div className="trust__d">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

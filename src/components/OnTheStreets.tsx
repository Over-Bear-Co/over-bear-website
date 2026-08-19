import Image from "next/image";
import PullUpHeading from "./PullUpHeading";

/* ---------- ON THE STREETS ----------
   รางเลื่อนแนวนอนเดียวของเว็บ (แทน Lookbook เดิมที่ใช้ .ph placeholder)
   .look__item .frame คุม aspect-ratio 3/4 ให้กรอบ จึงใช้ fill ได้ตามแบบเดียวกับรูปจริงที่อื่น */
const FITS: { src: string; size: string; alt: string }[] = [
  {
    src: "/media/street/fit-01.jpg",
    size: "3XL",
    alt: "ลูกค้าไซซ์ 3XL ใส่เสื้อ OVERBEAR สีขาว ยืนใต้ทางด่วนในกรุงเทพฯ",
  },
  {
    src: "/media/street/fit-02.jpg",
    size: "2XL",
    alt: "ลูกค้าไซซ์ 2XL ใส่เสื้อ OVERBEAR สีเขียวขี้ม้า นั่งอยู่ในโกดัง",
  },
  {
    src: "/media/street/fit-03.jpg",
    size: "4XL",
    alt: "ลูกค้าไซซ์ 4XL ใส่เสื้อ OVERBEAR สีทราย ยืนพิงประตูม้วนในตรอก",
  },
  {
    src: "/media/street/fit-04.jpg",
    size: "XL",
    alt: "ลูกค้าไซซ์ XL ใส่เสื้อ OVERBEAR สีดำ เดินในตรอก ภาพขาวดำ",
  },
];

export default function OnTheStreets() {
  return (
    <section className="section wrap look" id="streets">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">On the streets</span>
          <PullUpHeading lines={[[{ text: "ใส่จริง" }], [{ text: "บน" }, { text: "ถนนจริง", em: true }]]} />
        </div>
      </div>
      {/* รางเลื่อนแนวนอนที่ไม่มีลูกที่โฟกัสได้เลย ต้อง focusable เอง ไม่งั้นคีย์บอร์ดเลื่อนดูรูปที่ 3–4 ไม่ได้ */}
      <div className="look__scroll reveal" tabIndex={0} role="group" aria-label="รูปลุคจากลูกค้าจริง">
        {FITS.map((fit, i) => (
          <div className="look__item" key={fit.src}>
            <div className="frame">
              <Image src={fit.src} alt={fit.alt} fill sizes="(max-width:900px) 60vw, 360px" />
            </div>
            <div className="look__cap">
              <span>Fit 0{i + 1}</span>
              <span>{fit.size}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

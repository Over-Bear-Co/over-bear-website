import Frame from "./Frame";

/* 3 ไทล์ ครึ่งซ้ายข้อความ ครึ่งขวารูป
   อ้างอิงให้ไทล์ลิงก์ไปหน้าหมวด แต่เว็บนี้เป็นหน้าเดียว จึงลิงก์กลับกริดสินค้า
   ถ้าวันหนึ่งทำหน้าหมวดจริง เปลี่ยนแค่ href ที่นี่ */
const CATS = [
  { t: "T-Shirts",  th: "เสื้อยืด",         src: "/media/street/fit-02.jpg", alt: "ลุคเสื้อยืด oversize สวมกับกางเกงขายาว" },
  { t: "Oversized", th: "ทรงโอเวอร์ไซซ์",   src: "/media/street/fit-03.jpg", alt: "ลุคเสื้อทรงโอเวอร์ไซซ์ถ่ายกลางแจ้ง" },
  { t: "Everyday",  th: "ใส่ได้ทุกวัน",     src: "/media/street/fit-04.jpg", alt: "ลุคเสื้อยืดใส่ประจำวันถ่ายริมถนน" },
];

export default function ShopByCategory() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head sec-head--center reveal">
          <span className="eyebrow">Shop by category</span>
          <h2 className="sec-title">เลือกช้อปตามสไตล์</h2>
        </div>
        <ul className="cgrid reveal">
          {CATS.map((c) => (
            <li key={c.t}>
              <a className="ctile" href="#products">
                <span className="ctile__txt">
                  <span className="ctile__t">{c.t}</span>
                  <span className="ctile__d">{c.th}</span>
                </span>
                <Frame src={c.src} alt={c.alt} sizes="(max-width:960px) 46vw, 22vw" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

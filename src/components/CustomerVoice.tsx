/* 3 การ์ดรีวิว — ข้อความ ชื่อ และไซซ์ ยกจาก Overbear-Homepage.html ตรงตัว
   ชื่อคนที่สองคือ "ทัตติกร" — เดิมผมสะกดเป็น "กิตติกร" ซึ่งเป็นชื่อคนละชื่อ

   text เป็นสองชิ้นเพราะต้นฉบับใส่ <br> ไว้ (นับได้ 3 ตัวใน section นี้ ใบละหนึ่ง)
   สังเกต "จริง ๆ" มีช่องว่างก่อน ๆ ตามต้นฉบับ

   อวตารเป็นวงกลมตัวอักษร ไม่ใช่รูปคน — เว็บไม่มีรูปลูกค้าจริง และการใส่ภาพสตอก
   เป็นลูกค้าคือการปั้นหลักฐานปลอม */
const REVIEWS = [
  { name: "เอกชัย", size: "3XL",
    text: ["เนื้อผ้านุ่ม ใส่สบายมากครับ ไซซ์พอดี", "ไม่รัด ชอบมากครับ ใส่แล้วมั่นใจขึ้นเยอะเลย"] },
  { name: "ทัตติกร", size: "4XL",
    text: ["ทรงสวย ตัดเย็บดีมากครับ", "เป็นแบรนด์ที่เข้าใจคนไซซ์ใหญ่จริง ๆ"] },
  { name: "ปกรณ์", size: "2XL",
    text: ["ใส่ไปทำงานทุกวันเลยครับ", "มีคนทักว่าดูดีขึ้นเยอะ"] },
];

export default function CustomerVoice() {
  return (
    <section className="sec sec--warm">
      <div className="wrap">
        <div className="sec-head sec-head--center reveal">
          <span className="eyebrow">Customer voice</span>
          <h2 className="sec-title">เสียงช้อปตามสไตล์</h2>
        </div>
        <ul className="rgrid reveal">
          {REVIEWS.map((r, i) => (
            <li className="rcard" key={r.name}>
              <div className="rcard__head">
                <span className="rcard__av" aria-hidden="true">ลูกค้า<br />{i + 1}</span>
                <div>
                  <div className="rcard__who">
                    {r.name} <span>({r.size})</span>
                  </div>
                  {/* ดาวเป็นการตกแต่ง คะแนนจริงอ่านได้จาก aria-label */}
                  <div className="stars" role="img" aria-label="ให้คะแนน 5 จาก 5 ดาว">★★★★★</div>
                </div>
              </div>
              <p>
                {r.text[0]}
                <br />
                {r.text[1]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

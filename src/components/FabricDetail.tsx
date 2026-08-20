import Frame from "./Frame";

/* 4 การ์ดรูป+คำบรรยาย — .fcard--media กลับทิศเป็นแนวตั้งและให้รูปชนขอบการ์ด

   alt เขียนจากการดูรูปจริงทีละใบ ไม่ได้เขียนจากหัวข้อการ์ด
   (ถ้าเขียนจากหัวข้อ คนใช้ screen reader จะได้คำโฆษณาซ้ำสองรอบ ไม่ได้รู้ว่าภาพคืออะไร)

   ชื่อไฟล์ใหม่ทั้งสามใบ ไม่ทับ collar/seams/weave เดิม — next/image แคชด้วย url+w+q
   ไม่ใช่เนื้อไฟล์ ทับชื่อเดิมแล้วจะยังเสิร์ฟไบต์เก่าจาก .next/cache/images และจาก CDN */
const CARDS = [
  { src: "/media/fabric/macro.jpg", t: "ผ้าคอตตอนพรีเมียม", d: "นุ่ม ละมุน ไม่ระคายเคืองผิว",
    alt: "ภาพมาโครเนื้อผ้าคอตตอนทอแน่น เห็นร่องลายทอชัด" },
  { src: "/media/fabric/crewneck.jpg", t: "คอเสื้อเสริมทรง", d: "คงรูป ไม่ย้วย ใส่สวยทุกครั้ง",
    alt: "คอเสื้อยืดสีดำทรงคอกลม เห็นแถบริบเย็บรอบคอ แขวนบนไม้แขวนเหล็กหน้าผนังปูน" },
  { src: "/media/fabric/seam-join.jpg", t: "ตะเข็บประณีต แข็งแรง", d: "ทนทาน ใช้ได้นาน",
    alt: "ระยะใกล้รอยต่อตะเข็บผ้าสีดำเป็นรูปตัวที เย็บทับสองแถวถี่สม่ำเสมอ" },
  { src: "/media/fabric/hand-feel.jpg", t: "สัมผัสนุ่ม ใส่สบาย", d: "คุณภาพที่คุณรู้สึกได้",
    alt: "มือขยำเนื้อผ้าสีเทาเข้มขึ้นมาเป็นจีบ ถ่ายในแสงธรรมชาติในบ้าน" },
];

export default function FabricDetail() {
  return (
    <section className="sec sec--warm" id="fabric">
      <div className="wrap">
        <div className="sec-head sec-head--center reveal">
          <span className="eyebrow">Fabric &amp; detail</span>
          <h2 className="sec-title">ใส่ใจในทุกสัมผัส</h2>
        </div>
        <ul className="fgrid reveal">
          {CARDS.map((c) => (
            <li className="fcard fcard--media" key={c.t}>
              <Frame src={c.src} alt={c.alt} sizes="(max-width:560px) 92vw, (max-width:960px) 46vw, 24vw" />
              <div className="fcard__body">
                <div className="fcard__t">{c.t}</div>
                <p className="fcard__d">{c.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

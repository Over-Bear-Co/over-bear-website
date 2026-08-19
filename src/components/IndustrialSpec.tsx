import Image from "next/image";
import PullUpHeading from "./PullUpHeading";

type Build = {
  no: string;
  src: string;
  alt: string;
  title: string;
  body: string;
};

/* การ์ด 16:9 สองใบ — ภาพเต็มกรอบ ตัวเลขกำกับมุมขวาบน ข้อความอยู่บนสกรีมของ .build__cap */
const BUILDS: Build[] = [
  {
    no: "01",
    src: "/media/fabric/seams.jpg",
    alt: "ภาพระยะใกล้ของผิวผ้าถักสีดำ แสดงความแน่นของเนื้อผ้า",
    title: "TRIPLE-STITCHED SEAMS",
    body: "ตะเข็บสามเส้นที่ไหล่และวงแขน จุดที่รับแรงดึงมากที่สุดตอนใส่จริง",
  },
  {
    no: "02",
    src: "/media/fabric/collar.jpg",
    alt: "ภาพระยะใกล้ของคอเสื้อริบพร้อมแนวเย็บรอบคอ",
    title: "HIGH-DENSITY COLLAR",
    body: "คอริบถักแน่น คืนตัวได้ ใส่ถอดทุกวันก็ไม่ย้วย",
  },
];

export default function IndustrialSpec() {
  return (
    <section className="section wrap" id="spec">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">Industrial spec</span>
          <PullUpHeading
            lines={[[{ text: "รายละเอียด" }], [{ text: "งาน" }, { text: "ประกอบ", em: true }]]}
          />
        </div>
      </div>
      <div className="build__grid">
        {BUILDS.map((b) => (
          <div className="build__card reveal" key={b.no}>
            <div className="frame">
              <Image src={b.src} alt={b.alt} fill sizes="(max-width:900px) 92vw, 45vw" />
            </div>
            <span className="build__no">{b.no}</span>
            <div className="build__cap">
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

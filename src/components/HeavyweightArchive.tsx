import Image from "next/image";
import { PRODUCTS, type Product } from "@/lib/products";
import PullUpHeading from "./PullUpHeading";

const Bear = () => (
  <svg className="bear" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="55" cy="55" r="30" />
    <circle cx="145" cy="55" r="30" />
    <ellipse cx="100" cy="120" rx="70" ry="62" />
  </svg>
);

/* การ์ดคลังสี — ไม่ใช่ลิงก์ เพราะเว็บเป็นแคตตาล็อกล้วน ไม่มีหน้ารายละเอียดสินค้า
   ตอนนี้ถ่ายครบทั้ง 6 ตัวแล้ว แต่คงทาง .ph ไว้สำหรับสินค้าที่เพิ่มเข้ามาโดยยังไม่มีรูป
   — ให้เห็นชัดว่าใบไหนขาดรูป ดีกว่ายืมรูปสีอื่นมาใส่แทน */
function ArchiveCard({ p }: { p: Product }) {
  return (
    <article className="arch__card reveal">
      <div className="arch__media">
        <div className="arch__tags">
          <span className="tag tag--tan">UNIT {p.unit}</span>
          <span className="tag">240 GSM</span>
        </div>
        {p.image ? (
          <div className="frame frame--contain">
            <Image
              src={p.image}
              alt={`${p.name} สี${p.color} แขวนบนผนังปูน`}
              fill
              sizes="(max-width:900px) 46vw, 300px"
            />
          </div>
        ) : (
          <div className="ph" role="img" aria-label={`${p.name} — สี${p.color}`}>
            <Bear />
            <span className="ph__note">▲ ยังไม่มีรูป</span>
          </div>
        )}
      </div>
      <div className="arch__body">
        <div className="arch__name">{p.name}</div>
        <div className="arch__meta">สี{p.color} · Oversized · XL–5XL</div>
        <div className="arch__foot">
          <span className="dot" aria-hidden="true" />
          OB-{p.unit} · ARCHIVE 2024
        </div>
      </div>
    </article>
  );
}

export default function HeavyweightArchive() {
  return (
    /* id="drop" — คลังสีนี้แทน The Drop เดิม จึงรับ anchor #drop ต่อจาก
       Nav.tsx:7 (ปุ่ม Shop), Hero.tsx:90 (ปุ่มหลักของ hero) และ Footer.tsx:18-19 */
    <section className="section wrap" id="drop">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">Heavyweight archive</span>
          <PullUpHeading lines={[[{ text: "คลังสี" }], [{ text: "เอิร์ธโทน" }]]} />
        </div>
        <p
          className="mono"
          style={{ color: "var(--ash)", maxWidth: "30ch", fontSize: ".82rem", letterSpacing: ".04em" }}
        >
          ทุกตัวตัดจากแพตเทิร์นเดียวกัน ต่างกันแค่สี — เลือกจากโทนที่ใส่ด้วยกันได้ทั้งชุด
        </p>
      </div>
      <div className="arch__grid">
        {PRODUCTS.map((p) => (
          <ArchiveCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

import Frame from "./Frame";
import Placeholder from "./Placeholder";
import { ChevronRight } from "./icons";
import { PRODUCTS } from "@/lib/products";

/* กริดสินค้า 6 ใบตามอ้างอิง — แต่ "ไม่มีราคา ไม่มีป้าย SALE ไม่มีปุ่มหัวใจ"
   เพราะเว็บนี้เป็นแคตตาล็อกล้วน (products.ts เก็บ price ไว้เป็นข้อมูลอ้างอิงเท่านั้น)
   ที่เก็บมาจากอ้างอิงคือโครงการ์ด: รูป 1:1.12 → ชื่อ → บรรทัดรอง และ badge มุมซ้ายบน */
export default function BestSellers() {
  return (
    <section className="sec" id="products">
      <div className="wrap">
        <div className="sec-head sec-head--row reveal">
          <div>
            <span className="eyebrow">Best sellers</span>
            <h2 className="sec-title">สินค้าขายดี</h2>
          </div>
          {/* ต้นฉบับใช้ chevron เป็น svg ไม่ใช่ตัวอักษรลูกศร */}
          <a className="more" href="#den">
            ดูทั้งหมด <ChevronRight className="more__arw" />
          </a>
        </div>

        <ul className="pgrid reveal">
          {PRODUCTS.map((p) => (
            <li className="pcard" key={p.id}>
              <div className="pcard__media">
                {p.image ? (
                  <Frame
                    src={p.image}
                    alt={`${p.name} สี${p.color} แขวนบนราวในสตูดิโอผนังปูน`}
                    sizes="(max-width:560px) 46vw, (max-width:1180px) 31vw, 16vw"
                  />
                ) : (
                  <Placeholder label={`${p.name} — ยังไม่ได้ถ่าย`} />
                )}
                {p.badge && <span className="chip">{p.badge === "NEW" ? "ใหม่" : "ขายดี"}</span>}
              </div>
              <div>
                <div className="pcard__name">{p.name}</div>
                <div className="pcard__meta">{p.color} · XL–5XL</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

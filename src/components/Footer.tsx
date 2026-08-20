import { Clock, Mail } from "./icons";
import { SIZE_RANGE } from "@/lib/sizes";

/* ⚠️ ต้องเติมของจริงก่อนขึ้นโปรดักชัน
   ไฟล์อ้างอิงมีคอลัมน์โซเชียล (Facebook/IG/LINE/TikTok) และเบอร์/อีเมล/นโยบาย
   แต่เป็นข้อมูลสมมติของ mockup (02-123-4567, hello@overbear.co.th)
   จึงไม่ใส่มาเป็นลิงก์ตาย/ข้อมูลปลอม — CONTACT กับ SOCIAL ด้านล่างเว้นไว้ให้เติม
   ลิงก์ที่เหลือทั้งหมดชี้ไป section ที่มีจริงในหน้านี้
   ตอนเติม CONTACT ให้ import Phone / Mail จาก ./icons เพิ่ม (มีให้แล้ว) */
const SOCIAL: { label: string; short: string; href: string }[] = [];
const CONTACT: { Icon: typeof Clock; text: string; href?: string }[] = [];

const COLS = [
  {
    head: "ดูสินค้า",
    links: [
      { label: "สินค้าขายดี", href: "#products" },
      { label: "เลือกตามสไตล์", href: "#products" },
      { label: "ตารางไซซ์", href: "#size" },
    ],
  },
  {
    head: "เกี่ยวกับเรา",
    links: [
      { label: `เรื่องราวของ Overbear`, href: "#story" },
      { label: "เนื้อผ้าและรายละเอียด", href: "#fabric" },
      { label: `ไซซ์ ${SIZE_RANGE}`, href: "#size" },
    ],
  },
  {
    head: "ช่วยเหลือ",
    links: [
      { label: "ปรึกษาเรื่องไซซ์", href: "#den" },
      { label: "รับข่าวดรอปใหม่", href: "#den" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <span className="brand">Overbear</span>
            <p>
              เสื้อผ้าพลัสไซซ์สำหรับผู้ชาย<br />
              ออกแบบเพื่อความมั่นใจในทุกวัน
            </p>
            {SOCIAL.length > 0 && (
              <div className="social">
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}>{s.short}</a>
                ))}
              </div>
            )}
          </div>

          {COLS.map((c) => (
            <div key={c.head}>
              <h3>{c.head}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3>ติดต่อเรา</h3>
            <ul className="footer__contact">
              {CONTACT.length > 0 ? (
                CONTACT.map(({ Icon, text, href }) => (
                  <li key={text}>
                    <Icon />
                    {href ? <a href={href}>{text}</a> : <span>{text}</span>}
                  </li>
                ))
              ) : (
                <li><Mail /><a href="#den">รับข่าวทางอีเมล</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">© 2024 OVERBEAR. All Rights Reserved.</div>
      </div>
    </footer>
  );
}

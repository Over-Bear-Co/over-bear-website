"use client";

import { useEffect, useState } from "react";

/* อ้างอิงมี nav หมวดสินค้า + ค้นหา + wishlist + ตะกร้า
   เว็บนี้เป็นแคตตาล็อกหน้าเดียว ลิงก์จึงเป็น anchor ของ section ไม่ใช่หน้าแยก
   และไม่มีไอคอนค้นหา/wishlist/ตะกร้า เพราะไม่มีระบบรองรับจริง
   (ตะกร้าเคยมีแล้วถูกลบไป 2 รอบ — commit 1a8248b, 528bef0) */
const LINKS = [
  { href: "#products", label: "สินค้า" },
  { href: "#story", label: "เรื่องราว" },
  { href: "#fabric", label: "เนื้อผ้า" },
  { href: "#size", label: "ไซซ์" },
  { href: "#den", label: "ติดต่อ" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  /* ล็อกการเลื่อนพื้นหลังตอนเมนูเปิด ไม่งั้นแตะเลื่อนจะไปโดนหน้าใต้เมนู
     + ปิดด้วย Escape เพราะเมนูเต็มจอต้องมีทางออกจากคีย์บอร์ด */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="nav">
        <nav className="wrap nav__in" aria-label="เมนูหลัก">
          <a className="brand" href="#top">Overbear</a>
          <div className="nav__links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>
          <button
            className="burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>
      {/* เมนูมือถืออยู่นอก <header> เพราะ position:fixed ใน element ที่ sticky
          จะถูกจำกัดด้วย containing block ของ header ทำให้คลุมไม่เต็มจอ */}
      <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
      </div>
    </>
  );
}

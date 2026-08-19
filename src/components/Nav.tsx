"use client";

import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";

const LINKS = [
  { href: "#drop", label: "Shop" },
  { href: "#story", label: "The Fits" },
  { href: "#size", label: "Size" },
  { href: "#den", label: "Contact" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [glass, setGlass] = useState(false);

  /* เมนูมือถือเป็น overlay เต็มจอทับ main/footer จึงต้อง inert พื้นหลังกัน Tab หลุดไปข้างหลัง
     .nav ไม่ inert เพราะปุ่ม burger ที่ใช้ปิดเมนูอยู่ในนั้น · cleanup กันค้าง inert ตอน unmount */
  useEffect(() => {
    const bg = document.querySelectorAll<HTMLElement>("main, footer");
    bg.forEach((el) => {
      el.inert = menuOpen;
    });
    return () => bg.forEach((el) => {
      el.inert = false;
    });
  }, [menuOpen]);

  /* Escape ปิดเมนู — ผูก listener เฉพาะตอนเปิด */
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  /* nav กลายเป็นกระจกเมื่อ hero พ้นจอ — คำนวณจาก scroll ตรงๆ (IO sentinel เคย flaky) */
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    let limit = 0;
    let rz: ReturnType<typeof setTimeout>;
    const measure = () => {
      const r = hero.getBoundingClientRect();
      limit = r.top + scrollY + r.height - 80;
    };
    const apply = () => setGlass(scrollY >= limit);
    measure();
    apply();
    document.fonts.ready.then(() => {
      measure();
      apply();
    });
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        measure();
        apply();
      }, 150);
    };
    addEventListener("resize", onResize, { passive: true });
    addEventListener("scroll", apply, { passive: true });
    return () => {
      removeEventListener("resize", onResize);
      removeEventListener("scroll", apply);
    };
  }, []);

  return (
    <>
      <header className={"nav" + (glass ? " nav--glass" : "")}>
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="OVERBEAR หน้าแรก">
            <BrandMark className="ob-mark" />
            OVERBEAR
          </a>
          <nav className="nav__links" aria-label="เมนูหลัก">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          {/* burger เป็นลูกตรงๆ ของ .nav__inner (ไม่มี wrapper) — จอ >900px burger เป็น display:none
              จึงเหลือ 2 flex items คือแบรนด์ซ้าย เมนูขวา */}
          <button
            className="burger"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <nav className={"mobile-menu" + (menuOpen ? " open" : "")} aria-label="เมนูมือถือ">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}

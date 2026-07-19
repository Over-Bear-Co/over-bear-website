"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";

const Paw = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <g className="paw">
      <ellipse cx="24" cy="30" rx="12" ry="10" />
      <circle cx="10" cy="16" r="5" />
      <circle cx="38" cy="16" r="5" />
      <circle cx="17" cy="9" r="4.5" />
      <circle cx="31" cy="9" r="4.5" />
    </g>
  </svg>
);

const LINKS = [
  { href: "#drop", label: "Shop" },
  { href: "#story", label: "The Fits" },
  { href: "#size", label: "Size" },
  { href: "#den", label: "Contact" },
];

export default function Nav() {
  const { count, openCart, setNavCountEl } = useCart();
  const [glass, setGlass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => setNavCountEl(countRef.current), [setNavCountEl]);

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

  /* เมนูมือถือ: เนื้อหาหลังเมนูออกจาก tab order (burger อยู่ใน .nav จึงยังกดปิดได้) */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("main, footer").forEach((el) => {
      el.inert = menuOpen;
    });
  }, [menuOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className={"nav" + (glass ? " nav--glass" : "")}>
        <div className="nav__inner">
          <a className="brand" href="#top" aria-label="OVERBEAR หน้าแรก">
            <Paw />
            OVERBEAR
          </a>
          <nav className="nav__links" aria-label="เมนูหลัก">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav__right">
            <button
              className="cart-btn"
              id="openCart"
              aria-label={`เปิดตะกร้าสินค้า มีสินค้า ${count} ชิ้น`}
              onClick={openCart}
            >
              Cart{" "}
              <span className="count" ref={countRef}>
                {count}
              </span>
            </button>
            <button
              className="burger"
              aria-label="เปิดเมนู"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
      <nav className={"mobile-menu" + (menuOpen ? " open" : "")} aria-label="เมนูมือถือ">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={closeMenu}>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import BrandMark from "./BrandMark";

const LINKS = [
  { href: "#drop", label: "Shop" },
  { href: "#story", label: "The Fits" },
  { href: "#size", label: "Size" },
  { href: "#den", label: "Contact" },
];

export default function Nav() {
  const { count, openCart, setNavCountEl, menuOpen, toggleMenu, closeMenu } = useCart();
  const [glass, setGlass] = useState(false);
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
              aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
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

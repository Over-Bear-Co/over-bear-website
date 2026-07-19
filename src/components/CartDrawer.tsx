"use client";

import { useEffect, useRef } from "react";
import { FREE_SHIP_THRESHOLD, money } from "@/lib/products";
import { prefersReducedMotion } from "@/lib/motion";
import { useCart } from "./CartProvider";

const BearMini = () => (
  <svg className="bear" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="55" cy="55" r="30" />
    <circle cx="145" cy="55" r="30" />
    <ellipse cx="100" cy="120" rx="70" ry="62" />
  </svg>
);

export default function CartDrawer() {
  const { cart, total, isFree, drawerOpen, changeQty, removeItem, closeCart, checkout } = useCart();
  const wasFree = useRef(false);
  const celebT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  const left = FREE_SHIP_THRESHOLD - total;
  const pct = Math.min(100, (total / FREE_SHIP_THRESHOLD) * 100);

  /* ฉลองส่งฟรี — เฉพาะจังหวะข้าม threshold (false→true) และรอ drawer โผล่ก่อน */
  useEffect(() => {
    if (isFree && !wasFree.current && !prefersReducedMotion()) {
      const wait = drawerOpen ? 500 : 1150;
      clearTimeout(celebT.current);
      celebT.current = setTimeout(() => {
        if (!wasFree.current) return; // ตะกร้าเปลี่ยนใจระหว่างรอ
        const textEl = textRef.current, fill = fillRef.current, burst = burstRef.current;
        if (!textEl || !fill || !burst) return;
        textEl.animate(
          [{ transform: "translateY(8px)", opacity: 0 }, { transform: "none", opacity: 1 }],
          { duration: 300, easing: "ease-out" }
        );
        fill.classList.add("hit");
        const h = (e: AnimationEvent) => {
          if (e.animationName !== "mShipGlow") return; // รอ glow ตัวยาว ไม่ใช่ kick 350ms
          fill.classList.remove("hit");
          fill.removeEventListener("animationend", h);
        };
        fill.addEventListener("animationend", h);
        const cols = ["var(--acid)", "var(--tan)", "var(--bone)"];
        for (let i = 0; i < 14; i++) {
          const s = document.createElement("span");
          s.textContent = "✳";
          s.style.color = cols[i % 3];
          burst.append(s);
          s.animate(
            [
              { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
              {
                transform: `translate3d(${Math.random() * 96 - 48}px,${-(10 + Math.random() * 44)}px,0) rotate(${(Math.random() < 0.5 ? -1 : 1) * 200}deg)`,
                opacity: 0,
              },
            ],
            { duration: 550 + Math.random() * 200, easing: "cubic-bezier(.22,1,.36,1)" }
          ).onfinish = () => s.remove();
        }
      }, wait);
    }
    if (!isFree) clearTimeout(celebT.current); // หล่นต่ำกว่าเกณฑ์ → ยกเลิกที่ค้างอยู่
    wasFree.current = isFree;
  }, [isFree, drawerOpen]);

  return (
    <>
      <div className={"overlay" + (drawerOpen ? " open" : "")} id="overlay" onClick={closeCart} />
      <aside className={"drawer" + (drawerOpen ? " open" : "")} id="drawer" aria-label="ตะกร้าสินค้า" aria-hidden={!drawerOpen}>
        <div className="drawer__head">
          <h3>ตะกร้า</h3>
          <button className="drawer__close" id="closeCart" aria-label="ปิดตะกร้า" onClick={closeCart}>
            ✕
          </button>
        </div>
        <div className="ship" id="ship">
          <div className="ship__text" ref={textRef}>
            {isFree ? (
              <b>✓ คุณได้ส่งฟรีแล้ว!</b>
            ) : (
              <>
                ซื้ออีก <b>{money(left)}</b> ส่งฟรี
              </>
            )}
          </div>
          <div className="ship__bar">
            <div className="ship__fill" ref={fillRef} style={{ width: `${isFree ? 100 : pct}%` }} />
          </div>
          <div className="ship__burst" aria-hidden="true" ref={burstRef} />
        </div>
        <div className="drawer__items" id="cartItems">
          {cart.length === 0 ? (
            <div className="drawer__empty">
              ตะกร้ายังว่างอยู่
              <br />
              เลือกเสื้อสักตัวสิ 🐻
            </div>
          ) : (
            cart.map((i) => (
              <div className="line-item" key={i.id + i.size}>
                <div className="line-item__img">
                  <div className="ph">
                    <BearMini />
                  </div>
                </div>
                <div>
                  <div className="line-item__name">{i.name}</div>
                  <div className="line-item__meta">ไซซ์ {i.size}</div>
                  <div className="qty">
                    <button type="button" aria-label="ลดจำนวน" onClick={() => changeQty(i.id, i.size, -1)}>
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button type="button" aria-label="เพิ่มจำนวน" onClick={() => changeQty(i.id, i.size, 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="line-item__price">{money(i.price * i.qty)}</div>
                  <button className="line-item__rm" type="button" onClick={() => removeItem(i.id, i.size)}>
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="drawer__foot">
          <div className="drawer__total">
            <span className="lbl">รวมทั้งหมด</span>
            <span className="amt">{money(total)}</span>
          </div>
          <button className="btn" id="checkout" onClick={checkout}>
            สั่งซื้อเลย <span className="arw">→</span>
          </button>
        </div>
      </aside>
    </>
  );
}

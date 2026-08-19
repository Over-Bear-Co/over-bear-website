"use client";

import { useEffect, useRef } from "react";
import { PRODUCTS, type Product } from "@/lib/products";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import PullUpHeading from "./PullUpHeading";

const Bear = () => (
  <svg className="bear" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="55" cy="55" r="30" />
    <circle cx="145" cy="55" r="30" />
    <ellipse cx="100" cy="120" rx="70" ry="62" />
  </svg>
);

function ProductCard({ p }: { p: Product }) {
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  /* heavyweight tilt + glare (pointer:fine เท่านั้น) — เอียงสูงสุด 5° ให้รู้สึกมีมวล */
  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const card = cardRef.current, media = mediaRef.current, glare = glareRef.current;
    if (!card || !media) return;
    const st = {
      active: false,
      hov: false,
      cur: { rx: 0, ry: 0, s: 1, gx: 0, gy: 0 },
      tgt: { rx: 0, ry: 0, s: 1, gx: 0, gy: 0 },
      step() {
        const c = this.cur, t = this.tgt;
        (Object.keys(c) as (keyof typeof c)[]).forEach((k) => (c[k] += (t[k] - c[k]) * 0.12));
        media.style.transform = `perspective(750px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s})`;
        if (glare) glare.style.transform = `translate3d(${c.gx}px,${c.gy}px,0)`;
        const settled =
          !this.hov && Math.abs(t.rx - c.rx) < 0.02 && Math.abs(t.ry - c.ry) < 0.02 && Math.abs(t.s - c.s) < 0.001;
        if (settled) {
          media.style.transform = "";
          media.style.willChange = "";
          this.active = false;
        }
        return !settled;
      },
    };
    Engine.add(st);
    const enter = () => {
      st.hov = true;
      st.active = true;
      card.classList.add("tilting");
      media.style.willChange = "transform";
      Engine.wake();
    };
    const move = (e: PointerEvent) => {
      const r = media.getBoundingClientRect();
      const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
      st.tgt.ry = nx * 5;
      st.tgt.rx = -ny * 4;
      st.tgt.s = 1.03;
      const gw = r.width * 1.5;
      st.tgt.gx = (nx + 0.5) * r.width - gw / 2;
      st.tgt.gy = (ny + 0.5) * r.height - gw / 2;
      Engine.wake();
    };
    const leave = () => {
      st.hov = false;
      st.tgt.rx = 0;
      st.tgt.ry = 0;
      st.tgt.s = 1;
      card.classList.remove("tilting");
      Engine.wake();
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      Engine.remove(st);
    };
  }, []);

  return (
    <article className="card" ref={cardRef}>
      <div className="card__media" ref={mediaRef}>
        {p.badge && (
          <span className={`card__badge tag ${p.badge === "NEW" ? "tag--tan" : "tag--acid"}`}>
            <span className="tag__dot"></span>
            {p.badge}
          </span>
        )}
        {/* แทนที่ .ph ด้วย next/image: <Image src={`/${p.id}.jpg`} alt={`${p.name} — ${p.color}`} fill /> (วางรูปใน public/) */}
        <div className="ph" role="img" aria-label={`${p.name} — ${p.color}`}>
          <Bear />
          <span className="ph__note">▲ ใส่รูปสินค้า</span>
        </div>
        <span className="glare" aria-hidden="true" ref={glareRef}></span>
      </div>
      <div className="card__body">
        <div className="card__name">{p.name}</div>
        <div className="card__meta">สี {p.color} · 240 GSM · Oversized</div>
      </div>
    </article>
  );
}

export default function ProductGrid() {
  return (
    <section className="section wrap" id="drop">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">6 Styles · จำนวนจำกัด</span>
          <PullUpHeading lines={[[{ text: "The" }], [{ text: "Drop" }]]} />
        </div>
        <p
          className="mono"
          style={{ color: "var(--ash)", maxWidth: "30ch", fontSize: ".82rem", letterSpacing: ".04em" }}
        >
          เบสิกสีเข้มที่ใส่ได้ทุกวัน ตัดทรง oversize จริง ไม่ใช่ไซซ์ปกติที่ใหญ่ขึ้น
        </p>
      </div>
      <div className="grid">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

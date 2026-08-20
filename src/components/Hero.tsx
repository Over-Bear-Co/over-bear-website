"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";

/* เพดานการเลื่อนพื้นหลัง (px) — ต้องน้อยกว่าขอบเผื่อของ .hero__bg (inset:-7%)
   ไม่งั้นเลื่อนแล้วจะเห็นขอบดำโผล่ใต้รูป */
const BG_DRIFT_MAX = 44;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const m1Ref = useRef<HTMLSpanElement>(null);
  const m2Ref = useRef<HTMLSpanElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  /* entrance ของพื้นหลังจบเมื่อไร ส่งต่อ transform ให้ scroll engine */
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    const done = () => bg.classList.add("anim-done");
    bg.addEventListener("animationend", done, { once: true });
    return () => bg.removeEventListener("animationend", done);
  }, []);

  /* ตัวอักษรสองบรรทัดแยกออกจากกันตอนเลื่อน + พื้นหลังไหลช้ากว่า (parallax) */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = heroRef.current, m1 = m1Ref.current, m2 = m2Ref.current, bg = bgRef.current;
    if (!hero || !m1 || !m2 || !bg) return;
    const coarse = !isFinePointer();
    const f1 = coarse ? 0.11 : 0.22, f2 = coarse ? 0.07 : 0.14, fb = coarse ? 0.04 : 0.08;
    const sh = {
      active: false, s1: 0, s2: 0, sb: 0,
      step() {
        const max = innerWidth * 0.22, y = scrollY;
        const t1 = Math.max(-max, -y * f1);
        const t2 = Math.min(max, y * f2);
        const tb = bg.classList.contains("anim-done") ? Math.min(y * fb, BG_DRIFT_MAX) : 0;
        this.s1 += (t1 - this.s1) * 0.1;
        this.s2 += (t2 - this.s2) * 0.1;
        this.sb += (tb - this.sb) * 0.1;
        m1.style.transform = `translate3d(${this.s1}px,0,0)`;
        m2.style.transform = `translate3d(${this.s2}px,0,0)`;
        if (bg.classList.contains("anim-done")) bg.style.transform = `translate3d(0,${this.sb}px,0)`;
        return Math.abs(t1 - this.s1) > 0.05 || Math.abs(t2 - this.s2) > 0.05 || Math.abs(tb - this.sb) > 0.05;
      },
    };
    Engine.add(sh);
    const io = new IntersectionObserver((es) => {
      sh.active = es[0].isIntersecting;
      Engine.wake();
    });
    io.observe(hero);
    return () => {
      io.disconnect();
      Engine.remove(sh);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero__bg" ref={bgRef}>
        {/* priority: รูปนี้คือ LCP ของหน้า จึงต้อง preload ไม่ lazy-load
            sizes="100vw" เพราะกินเต็มความกว้างจอทุก breakpoint */}
        <Image
          src="/media/hero/bg.jpg"
          alt="นายแบบหุ่นหมีใส่เสื้อยืด oversize สีเทาเข้ม ยืนกลางโรงงานร้างที่มีกราฟฟิตี้"
          fill
          priority
          sizes="100vw"
        />
      </div>
      <span className="hero__side">EST. 2026 — BANGKOK / DROP 01</span>
      <div className="hero__inner">
        {/* ตัวอักษรที่เห็นเป็น aria-hidden (ถูกหั่นเป็นบรรทัดเพื่อทำ animation) — h1 ตัวจริงอยู่ที่นี่ */}
        <h1 className="sr-only">OVERBEAR — เสื้อ oversize สีเข้มสำหรับหุ่นหมี</h1>
        <div className="hero__type" aria-hidden="true">
          <span className="line-mask" ref={m1Ref}>
            <span className="line line--1">
              OVERSIZED<span className="dot">.</span>
            </span>
          </span>
          <span className="line-mask" ref={m2Ref}>
            <span className="line line--2">UNAPOLOGETIC</span>
          </span>
        </div>
        <div className="hero__cta">
          <a className="btn" href="#drop">
            ช้อปดรอปล่าสุด <span className="arw">→</span>
          </a>
          <a className="btn btn--ghost" href="#size">
            ดูตารางไซซ์
          </a>
        </div>
      </div>
    </section>
  );
}

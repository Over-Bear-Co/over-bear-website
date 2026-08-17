"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Engine, isFinePointer, prefersReducedMotion, type EngineItem } from "@/lib/motion";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const m1Ref = useRef<HTMLSpanElement>(null);
  const m2Ref = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  /* entrance ของ media จบเมื่อไร ส่งต่อ transform ให้ scroll engine */
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const done = () => media.classList.add("anim-done");
    media.addEventListener("animationend", done, { once: true });
    return () => media.removeEventListener("animationend", done);
  }, []);

  /* off-frame type shear + media drift (scroll-driven) */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = heroRef.current, m1 = m1Ref.current, m2 = m2Ref.current, media = mediaRef.current;
    if (!hero || !m1 || !m2 || !media) return;
    const coarse = !isFinePointer();
    const f1 = coarse ? 0.11 : 0.22, f2 = coarse ? 0.07 : 0.14, fm = coarse ? 0.03 : 0.06;
    const sh = {
      active: false, s1: 0, s2: 0, sm: 0,
      step() {
        const max = innerWidth * 0.22, y = scrollY;
        const t1 = Math.max(-max, -y * f1);
        const t2 = Math.min(max, y * f2);
        const tm = media.classList.contains("anim-done") ? y * fm : 0; // ค่อยไต่จาก 0 ตอน handoff
        this.s1 += (t1 - this.s1) * 0.1;
        this.s2 += (t2 - this.s2) * 0.1;
        this.sm += (tm - this.sm) * 0.1;
        m1.style.transform = `translate3d(${this.s1}px,0,0)`;
        m2.style.transform = `translate3d(${this.s2}px,0,0)`;
        if (media.classList.contains("anim-done"))
          media.style.transform = `translate3d(0,${this.sm}px,0)`;
        return Math.abs(t1 - this.s1) > 0.05 || Math.abs(t2 - this.s2) > 0.05 || Math.abs(tm - this.sm) > 0.05;
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

  /* SIGNATURE — UV-torch spotlight: โคลนเนื้อหา media (placeholder ตอนนี้ รูปจริงทีหลัง)
     เป็นเลเยอร์สว่างที่เผยผ่าน radial mask ตามเมาส์ */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const media = mediaRef.current;
    if (!media) return;

    const flash = document.createElement("div");
    flash.className = "flash" + (media.classList.contains("ph") ? " ph" : "");
    flash.setAttribute("aria-hidden", "true");
    // โคลน DOM ตรงๆ (ไม่ใช้ innerHTML) — เนื้อหาเป็น markup ของเราเองทั้งหมด
    Array.from(media.children).forEach((child) => flash.append(child.cloneNode(true)));
    flash.querySelector(".ph__note")?.remove();
    (
      [
        ["240 GSM", "24%", "12%"],
        ["FLATLOCK SEAM", "48%", "56%"],
        ["DROP +6CM", "74%", "16%"],
      ] as const
    ).forEach(([t, top, leftPos]) => {
      const s = document.createElement("span");
      s.className = "flash__note";
      s.textContent = t;
      s.style.top = top;
      s.style.left = leftPos;
      flash.append(s);
    });
    media.append(flash);

    let tx = 50, ty = 50, sx = 50, sy = 50;
    let lx = "", ly = "";
    let offT: ReturnType<typeof setTimeout> | undefined;
    const torch = {
      active: false,
      step() {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
        if (Math.abs(tx - sx) < 0.05) sx = tx; // snap ให้ loop หลับได้ตอนเมาส์นิ่ง
        if (Math.abs(ty - sy) < 0.05) sy = ty;
        const vx = sx.toFixed(2) + "%", vy = sy.toFixed(2) + "%";
        if (vx !== lx) { flash.style.setProperty("--mx", vx); lx = vx; }
        if (vy !== ly) { flash.style.setProperty("--my", vy); ly = vy; }
        return sx !== tx || sy !== ty;
      },
    };
    const enter = () => { clearTimeout(offT); torch.active = true; flash.classList.add("on"); Engine.wake(); };
    const move = (e: PointerEvent) => {
      const r = media.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      Engine.wake();
    };
    const leave = () => { flash.classList.remove("on"); offT = setTimeout(() => (torch.active = false), 450); };

    let io: IntersectionObserver | undefined;
    let sweep: EngineItem | undefined;
    if (isFinePointer()) {
      Engine.add(torch); // torch ขับด้วย pointer เท่านั้น — เพิ่มเข้า engine เฉพาะ fine pointer
      media.addEventListener("pointerenter", enter);
      media.addEventListener("pointermove", move, { passive: true });
      media.addEventListener("pointerleave", leave);
    } else {
      // touch: กวาดไฟหนึ่งรอบตอน media เข้าจอครั้งแรก
      io = new IntersectionObserver((es, obs) => {
        if (!es[0].isIntersecting) return;
        obs.disconnect();
        flash.classList.add("on");
        const t0 = performance.now(), D = 2200;
        sweep = {
          active: true,
          step() {
            const p = Math.min(1, (performance.now() - t0) / D);
            const e = 1 - Math.pow(1 - p, 3);
            flash.style.setProperty("--mx", 8 + e * 80 + "%");
            flash.style.setProperty("--my", 10 + e * 70 + "%");
            if (p >= 1) { flash.classList.remove("on"); this.active = false; return false; }
            return true;
          },
        };
        Engine.add(sweep);
      }, { threshold: 0.5 });
      io.observe(media);
    }
    return () => {
      media.removeEventListener("pointerenter", enter);
      media.removeEventListener("pointermove", move);
      media.removeEventListener("pointerleave", leave);
      io?.disconnect();
      clearTimeout(offT);
      Engine.remove(torch);
      if (sweep) Engine.remove(sweep);
      flash.remove();
    };
  }, []);

  return (
    /* .hero เป็น full-bleed (ไม่ใช่ .wrap) — overflow:clip ของมันจึงตัดที่ขอบ "จอ"
       ส่วน .hero__inner เป็น .wrap ที่ไม่ clip ตัวหนังสือจึงล้นออกจาก column ไปถึงขอบจอได้
       แพตเทิร์นเดียวกับ Story: section อยู่นอก wrap, เนื้อหาอยู่ใน wrap ชั้นใน */
    <section className="hero" ref={heroRef}>
      <div className="wrap hero__inner">
        <div className="hero__type" aria-hidden="true">
          <span className="line-mask" ref={m1Ref}>
            <span className="line">
              OVERSIZED<span className="dot">.</span>
            </span>
          </span>
          <span className="line-mask" ref={m2Ref}>
            <span className="line line--2">UNAPOLOGETIC</span>
          </span>
        </div>
        {/* spec line — เคยเป็น rail แนวตั้งมุมขวาบน ย้ายลงมาเป็นบรรทัดนอนใต้หัวเรื่อง
            เพราะพอตัวหนังสือใหญ่พอจะล้นกรอบจริง มันกินพื้นที่มุมขวาบนจนหมด
            (บรรทัด 2 พาดผ่าน x 1342–1360 ที่ rail อยู่ — วัดแล้วต้องใช้ฟอนต์ ≥492px จึงจะพ้นกัน) */}
        <span className="hero__side">EST. 2026 — BANGKOK / DROP 01</span>
        <div className="hero__grid">
          <div className="hero__lede">
            <span className="eyebrow">Drop 01 — Dark Basics</span>
            <h1 className="sr-only">OVERBEAR — เสื้อ oversize สีเข้มสำหรับหุ่นหมี</h1>
            <p>
              เสื้อยืด oversize สีเข้ม ตัดเผื่อทรงหุ่นหมีโดยเฉพาะ ผ้าหนา 240 GSM ทรง drop-shoulder ใส่สบาย
              ดูเท่ทุกวัน — ไซซ์ M ถึง 5XL
            </p>
            <div className="hero__cta">
              <a className="btn" href="#drop">
                ช้อปดรอปล่าสุด <span className="arw">→</span>
              </a>
              <a className="btn btn--ghost" href="#size">
                ดูตารางไซซ์
              </a>
            </div>
          </div>
          {/* LCP ของหน้า — priority บังคับ ห้ามถอด
              รูปนี้ยังเป็นตัวที่ UV torch โคลนไปทำเลเยอร์สว่างด้วย (ดู effect ด้านบน)
              ช่อง 4:5 กว้างสุด 558px → ไฟล์ควรเป็น 1116×1396 (ตอนนี้มีแค่ 512px = เบลอ) */}
          <div className="hero__media ph" ref={mediaRef}>
            <Image
              src="/tees/black.jpg"
              alt="นายแบบหุ่นหมีใส่เสื้อยืด oversize สีดำ ผ้าหนา 240 GSM"
              fill
              priority
              sizes="(max-width:456px) 92vw, (max-width:900px) 420px, (max-width:1391px) 42vw, 558px"
            />
            <span className="tag tag--slab">
              <span className="tag__dot"></span>240 GSM
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

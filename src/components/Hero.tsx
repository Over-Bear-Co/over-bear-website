"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { useTorch, type TorchNote } from "@/lib/useTorch";

/* สเปกที่โผล่ในลำแสง — ต้องตรงกับหัวข้อใน IndustrialSpec */
const HERO_TORCH_NOTES: readonly TorchNote[] = [
  ["240 GSM", "24%", "12%"],
  ["TRIPLE-STITCH", "48%", "56%"],
  ["DROP +6CM", "74%", "16%"],
];

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

  /* SIGNATURE — UV-torch spotlight (ดู lib/useTorch.ts) — ใช้ร่วมกับ IndustrialPrecision */
  useTorch(mediaRef, HERO_TORCH_NOTES);

  return (
    <section className="hero wrap" ref={heroRef}>
      <span className="hero__side">EST. 2026 — BANGKOK / DROP 01</span>
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
      <div className="hero__grid">
        <div className="hero__lede">
          <span className="eyebrow">Drop 01 — Dark Basics</span>
          <h1 className="sr-only">OVERBEAR — เสื้อ oversize สีเข้มสำหรับหุ่นหมี</h1>
          <p>
            เสื้อยืด oversize สีเข้ม ตัดเผื่อทรงหุ่นหมีโดยเฉพาะ ผ้าหนา 240 GSM ทรง drop-shoulder ใส่สบาย
            ดูเท่ทุกวัน — ไซซ์ XL ถึง 5XL
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
        {/* priority: รูปนี้คือ LCP ของหน้า จึงต้อง preload ไม่ lazy-load
            ไม่ใส่ role="img"/aria-label บน div แล้ว เพราะ <img> ถือ alt เองเมื่อเป็นรูปจริง
            useTorch จะโคลนลูกทั้งหมดของ div นี้ไปทำเลเยอร์ไฟฉาย — .flash img ใน globals.css รองรับอยู่แล้ว */}
        <div className="hero__media frame" ref={mediaRef}>
          <Image
            src="/media/hero/model.jpg"
            alt="นายแบบหุ่นหมีใส่เสื้อยืด oversize สีเทาเข้ม ยืนกอดอกหน้าอาคารโรงงานเก่า"
            fill
            priority
            sizes="(max-width:900px) 92vw, 42vw"
          />
          <span className="tag tag--acid">
            <span className="tag__dot"></span>240 GSM
          </span>
        </div>
      </div>
    </section>
  );
}

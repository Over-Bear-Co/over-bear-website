"use client";

import { useEffect, useRef } from "react";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";

const ROW1 = ["100% Heavy Cotton", "240 GSM", "Oversized Fit", "ไซซ์หมี สไตล์เท่", "Machine Wash Cold", "Made in Bangkok"];
const ROW2 = ["Drop-Shoulder", "Boxy Cut", "M–5XL", "ตัดเผื่อหุ่นหมี", "Heavy Drape", "ทรงไม่เพี้ยน"];

export default function Marquee() {
  const mqRef = useRef<HTMLDivElement>(null);

  /* counter-scroll dual tape: แถวบนไหลซ้าย แถวล่างไหลขวา + เร่งตาม scroll */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mq = mqRef.current;
    if (!mq) return;
    const tracks = [...mq.querySelectorAll<HTMLElement>(".marquee__track")];
    if (!tracks.length) return;
    const rows = tracks.map((el, i) => ({
      el,
      rev: el.classList.contains("marquee__track--rev"),
      drift: 0,
      half: 0,
      rate: i ? 0.5 : 0.35,
    }));
    const coarse = !isFinePointer();
    const cf = coarse ? 0.15 : 0.3;
    let smooth = 0, paused = false;
    let rz: ReturnType<typeof setTimeout>;
    const measure = () => rows.forEach((r) => (r.half = r.el.scrollWidth / 2));
    measure();
    document.fonts.ready.then(measure); // ความกว้าง glyph ไทยมาช้า — ต้องวัดซ้ำ
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(measure, 150);
    };
    addEventListener("resize", onResize, { passive: true });

    const tape = {
      active: false,
      step() {
        if (document.getElementById("drawer")?.classList.contains("open")) return false; // หลับหลัง drawer
        if (!paused) rows.forEach((r) => (r.drift += r.rate));
        smooth += (scrollY * cf - smooth) * 0.08;
        rows.forEach((r) => {
          if (!r.half) return;
          const m = (((r.drift + smooth) % r.half) + r.half) % r.half;
          r.el.style.transform = `translate3d(${r.rev ? m - r.half : -m}px,0,0)`;
        });
        return true;
      },
    };
    Engine.add(tape);
    const io = new IntersectionObserver((es) => {
      tape.active = es[0].isIntersecting;
      Engine.wake();
    });
    io.observe(mq);
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    mq.addEventListener("pointerenter", onEnter);
    mq.addEventListener("pointerleave", onLeave);
    return () => {
      removeEventListener("resize", onResize);
      mq.removeEventListener("pointerenter", onEnter);
      mq.removeEventListener("pointerleave", onLeave);
      io.disconnect();
      Engine.remove(tape);
    };
  }, []);

  const spans = (items: string[]) => [...items, ...items].map((t, i) => <span key={i}>{t}</span>);

  return (
    <div className="marquee" aria-hidden="true" ref={mqRef}>
      <div className="marquee__track">{spans(ROW1)}</div>
      <div className="marquee__track marquee__track--rev">{spans(ROW2)}</div>
    </div>
  );
}

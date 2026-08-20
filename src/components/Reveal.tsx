"use client";

import { useEffect } from "react";

/* IntersectionObserver ตัวเดียวสำหรับ .reveal ทุกตัวในหน้า
   ดีไซน์เดิมใช้ rAF Engine เพราะมี parallax/torch ที่ต้องคำนวณทุกเฟรม — ดีไซน์นี้ไม่มีแล้ว
   เหลือแค่ fade-in ครั้งเดียวต่อ element ซึ่ง IO ทำได้โดยไม่กิน frame budget เลย

   unobserve ทันทีที่เห็น: reveal เป็น one-shot ถ้าไม่ปลด element จะ fade กลับตอนเลื่อนขึ้น */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    if (!els.length) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          obs.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

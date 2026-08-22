"use client";

import { useEffect, useRef } from "react";

/* วิดีโอพื้นหลังของ hero

   ไม่ใส่ attribute autoPlay โดยเจตนา — เริ่มเล่นจาก JS เท่านั้น และเฉพาะเมื่อ
   ผู้ใช้ไม่ได้ขอ reduced motion ถ้าใส่ autoPlay ไว้ในมาร์กอัป เบราว์เซอร์จะเริ่มเล่น
   ก่อน effect ทำงาน แล้วเราได้แค่ "สั่งหยุดทีหลัง" ซึ่งผู้ใช้เห็นภาพขยับไปแล้ว

   ระหว่างที่ยังไม่เล่น poster ทำหน้าที่แทน จึงไม่มีช่องดำและ layout ไม่กระโดด
   ผู้ใช้ reduced motion จะเห็น poster นิ่งตลอด ไม่ใช่จอเปล่า

   preload="metadata": ไม่ดึงตัววิดีโอมาแข่งกับ LCP ของหน้า
   aria-hidden + tabIndex -1: เป็นของตกแต่ง ไม่ควรอยู่ในลำดับ focus หรือ a11y tree */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // เบราว์เซอร์อาจปฏิเสธ autoplay (นโยบายประหยัดแบต ฯลฯ) — ปล่อยให้ poster ค้างไว้
    v.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="hero__vid"
      src="/media/hero/hero.mp4"
      poster="/media/hero/hero-poster.jpg"
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

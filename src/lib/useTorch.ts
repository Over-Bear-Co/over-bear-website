"use client";

import { useEffect, type RefObject } from "react";
import { Engine, isFinePointer, prefersReducedMotion, type EngineItem } from "./motion";

/* ตำแหน่งป้ายสเปกในลำแสง: [ข้อความ, top, left] — ค่าเป็น % ของกรอบ media */
export type TorchNote = readonly [text: string, top: string, left: string];

/* SIGNATURE — UV-torch spotlight
   โคลนเนื้อหาใน media เป็นเลเยอร์สว่าง แล้วเผยผ่าน radial mask ที่วิ่งตามพอยน์เตอร์

   ทำไมยังแยกเป็น hook แม้ตอนนี้ IndustrialPrecision เรียกใช้ที่เดียว: เอฟเฟกต์นี้
   ผูกกับ rAF Engine ตัวเดียวของทั้งหน้า (lib/motion.ts) — เขียนซ้ำสองที่แปลว่ามี
   ทางให้ loop ไม่หลับเพิ่มมาอีกทาง ซึ่งเป็นบั๊กที่มองไม่เห็นจนกว่าจะโปรไฟล์ */
export function useTorch(mediaRef: RefObject<HTMLElement | null>, notes: readonly TorchNote[]) {
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
    notes.forEach(([t, top, leftPos]) => {
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
    // notes เป็น literal คงที่ต่อ call site — ไม่ใส่ใน deps เพื่อไม่ให้ effect ถูกสร้างใหม่ทุก render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaRef]);
}

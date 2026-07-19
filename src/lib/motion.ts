"use client";

/* shared rAF engine — หนึ่ง loop ต่อทั้งหน้า, item หลับเมื่อนิ่ง, IO เป็นคน gate `active` */

export type EngineItem = {
  active: boolean;
  step: () => boolean | void; // return false = settled (หลับได้)
};

const items = new Set<EngineItem>();
let running = false;
let wired = false;

function loop() {
  let keep = false;
  items.forEach((it) => {
    if (it.active && it.step() !== false) keep = true;
  });
  if (keep) requestAnimationFrame(loop);
  else running = false;
}

export const Engine = {
  add(it: EngineItem) {
    items.add(it);
    this.wake();
  },
  remove(it: EngineItem) {
    items.delete(it);
  },
  wake() {
    if (typeof window === "undefined") return;
    if (!wired) {
      wired = true;
      addEventListener("scroll", () => Engine.wake(), { passive: true });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  },
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () =>
  typeof window !== "undefined" && matchMedia("(pointer: fine)").matches;

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Engine } from "@/lib/motion";

/* UI shell state ที่ไม่ผูกกับสินค้า — เดิมอยู่ใน CartProvider (ถูกถอดออกตอนตัดตะกร้า)
   เมนูมือถือ + Escape + inert พื้นหลัง ต้องอยู่รวมศูนย์ที่เดียว ไม่ใช่กระจายใน Nav */
type UICtx = {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

const Ctx = createContext<UICtx | null>(null);
export const useUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI must be used inside <UIProvider>");
  return v;
};

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* เมนูเปิด = พื้นหลัง inert ทั้งหมด ยกเว้น .nav (ต้องกดปุ่ม burger เพื่อปิดได้) */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("main, footer").forEach((el) => {
      el.inert = menuOpen;
    });
  }, [menuOpen]);

  /* ปลุก rAF engine ตอนเมนูปิด — marquee หลับตอนเมนูเปิด (ดู step() ใน Marquee) จึงต้องถูกปลุก */
  useEffect(() => {
    if (!menuOpen) Engine.wake();
  }, [menuOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* motion gate อ่านครั้งเดียวตอนโหลด — ถ้า OS สลับ Reduce Motion กลางคัน ให้ re-init ทั้งหน้า */
  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => location.reload();
    rm.addEventListener?.("change", onChange);
    return () => rm.removeEventListener?.("change", onChange);
  }, []);

  return <Ctx.Provider value={{ menuOpen, toggleMenu, closeMenu }}>{children}</Ctx.Provider>;
}

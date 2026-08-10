"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FREE_SHIP_THRESHOLD, PRODUCTS, type Size } from "@/lib/products";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";

export type CartItem = { id: string; name: string; price: number; size: Size; qty: number };

type CartCtx = {
  cart: CartItem[];
  count: number;
  total: number;
  isFree: boolean;
  drawerOpen: boolean;
  menuOpen: boolean;
  toast: string;
  addToCart: (id: string, size: Size, sourceEl?: HTMLElement | null) => void;
  changeQty: (id: string, size: Size, d: number) => void;
  removeItem: (id: string, size: Size) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  checkout: () => void;
  showToast: (msg: string) => void;
  setNavCountEl: (el: HTMLElement | null) => void;
};

const Ctx = createContext<CartCtx | null>(null);
export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
};

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navCountRef = useRef<HTMLElement | null>(null);
  const openT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const isFree = total >= FREE_SHIP_THRESHOLD;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* single source of truth for background inert — ทั้ง drawer และ mobile menu เขียน attribute
     เดียวกันบน main/footer จึงต้องคำนวณจากทั้งสองสถานะที่เดียว กันการ clobber กัน
     .nav/.topbar/.mobile-menu inert เฉพาะตอน drawer เปิด (menu ต้องเข้าถึง burger ใน .nav เพื่อปิดได้) */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("main, footer").forEach((el) => {
      el.inert = drawerOpen || menuOpen;
    });
    document.querySelectorAll<HTMLElement>(".nav, .topbar, .mobile-menu").forEach((el) => {
      el.inert = drawerOpen;
    });
  }, [drawerOpen, menuOpen]);

  /* focus ตามสถานะ drawer + ปลุก rAF engine ตอนปิด (marquee หลับหลัง drawer ต้องถูกปลุก) */
  useEffect(() => {
    if (drawerOpen) {
      document.getElementById("closeCart")?.focus();
    } else {
      const drawer = document.getElementById("drawer");
      if (drawer && document.activeElement && drawer.contains(document.activeElement)) {
        document.getElementById("openCart")?.focus();
      }
      Engine.wake();
    }
  }, [drawerOpen]);

  /* focus trap: Tab วนอยู่ใน drawer เท่านั้นตอนเปิด (คู่กับ inert พื้นหลัง = modal ปิดสนิท) */
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = document.getElementById("drawer");
    if (!drawer) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [drawerOpen]);

  /* Escape ปิดทั้ง drawer และ mobile menu (รวมศูนย์จาก Nav เดิม) */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setMenuOpen(false);
      }
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

  /* fly-to-cart: ชิปสินค้าบินโค้งจากการ์ดเข้าไอคอนตะกร้า */
  const flyToCart = useCallback((sourceEl?: HTMLElement | null): boolean => {
    if (prefersReducedMotion()) return false;
    const navCount = navCountRef.current;
    const mediaEl = sourceEl?.querySelector<HTMLElement>(".card__media") ?? null;
    if (!mediaEl || !navCount || !navCount.isConnected) return false;
    const src = mediaEl.getBoundingClientRect();
    const dst = navCount.getBoundingClientRect();
    if (!src.width || !dst.width) return false;

    const fly = document.createElement("div");
    fly.className = "fly";
    fly.setAttribute("aria-hidden", "true");
    const pic = mediaEl.querySelector("img") || mediaEl.querySelector("svg");
    if (pic) fly.append(pic.cloneNode(true));
    fly.style.left = src.left + src.width / 2 - 28 + "px";
    fly.style.top = src.top + src.height / 2 - 32 + "px";
    document.body.append(fly);

    const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
    const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
    const coarse = !isFinePointer();
    const frames: Keyframe[] = coarse
      ? [
          { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
          { transform: `translate3d(${dx}px,${dy}px,0) scale(.14)`, opacity: 0.35 },
        ]
      : [
          { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
          { transform: `translate3d(${dx * 0.5}px,${dy * 0.5 - 70}px,0) scale(.55)`, opacity: 0.9, offset: 0.5 },
          { transform: `translate3d(${dx}px,${dy}px,0) scale(.14)`, opacity: 0.35 },
        ];
    fly.animate(frames, { duration: coarse ? 420 : 550, easing: "cubic-bezier(.16,1,.3,1)" }).onfinish = () => {
      fly.remove();
      navCount.classList.add("bump");
      navCount.addEventListener("animationend", () => navCount.classList.remove("bump"), { once: true });
      navCount.animate(
        [{ boxShadow: "0 0 0 4px rgba(232,221,206,.45)" }, { boxShadow: "0 0 0 12px rgba(232,221,206,0)" }],
        { duration: 450, easing: "ease-out" }
      );
    };
    return true;
  }, []);

  const addToCart = useCallback(
    (id: string, size: Size, sourceEl?: HTMLElement | null) => {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return;
      setCart((prev) => {
        const found = prev.find((i) => i.id === id && i.size === size);
        return found
          ? prev.map((i) => (i === found ? { ...i, qty: i.qty + 1 } : i))
          : [...prev, { id, name: p.name, price: p.price, size, qty: 1 }];
      });
      showToast(`เพิ่ม "${p.name}" (${size}) แล้ว`);
      const flew = flyToCart(sourceEl);
      clearTimeout(openT.current);
      openT.current = setTimeout(() => setDrawerOpen(true), flew ? 580 : 0); // รอชิปบินถึงก่อนค่อยเปิด
    },
    [flyToCart, showToast]
  );

  const changeQty = useCallback((id: string, size: Size, d: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id && i.size === size ? { ...i, qty: i.qty + d } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string, size: Size) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const checkout = useCallback(() => {
    if (!cart.length) {
      showToast("ตะกร้ายังว่างอยู่");
      return;
    }
    showToast("เดโม: ต่อระบบชำระเงินจริงได้ที่ขั้นถัดไป");
  }, [cart.length, showToast]);

  const setNavCountEl = useCallback((el: HTMLElement | null) => {
    navCountRef.current = el;
  }, []);

  return (
    <Ctx.Provider
      value={{
        cart, count, total, isFree, drawerOpen, menuOpen, toast,
        addToCart, changeQty, removeItem, openCart, closeCart, toggleMenu, closeMenu, checkout, showToast, setNavCountEl,
      }}
    >
      {children}
      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">
        {toast}
      </div>
    </Ctx.Provider>
  );
}

"use client";

import { useEffect, useState } from "react";
import PullUpHeading from "./PullUpHeading";

/* ---------- NEWSLETTER (JOIN THE DEN) ---------- */
export function Den() {
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=email]");
    if (!email || !input?.checkValidity()) {
      setMsg("ใส่อีเมลให้ถูกต้องก่อนนะ");
      return;
    }
    setMsg("เข้าถ้ำเรียบร้อย! 🐻 เช็กอีเมลรอดรอปแรกได้เลย");
    setEmail("");
  };

  return (
    <section className="section wrap" id="den">
      <div className="den reveal reveal--pu">
        <span className="eyebrow">Join the den</span>
        <PullUpHeading lines={[[{ text: "เข้าถ้ำ" }], [{ text: "ก่อนใคร" }]]} />
        <p>สมัครรับข่าวดรอปใหม่ ส่วนลดเฉพาะสมาชิก และของลิมิเต็ด ก่อนเปิดขายจริง</p>
        <form onSubmit={submit} noValidate>
          <input
            type="email"
            placeholder="อีเมลของคุณ"
            aria-label="อีเมล"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn" type="submit">
            สมัคร <span className="arw">→</span>
          </button>
        </form>
        <p className="den__msg" role="status" aria-live="polite">
          {msg}
        </p>
      </div>
    </section>
  );
}

/* ---------- MOTION ROOT: reveal-on-scroll observer ---------- */
export function MotionRoot() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* motion gate อ่านครั้งเดียวตอนโหลด — ถ้า OS สลับ Reduce Motion กลางคัน ให้ re-init ทั้งหน้า */
  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => location.reload();
    rm.addEventListener?.("change", onChange);
    return () => rm.removeEventListener?.("change", onChange);
  }, []);

  return null;
}

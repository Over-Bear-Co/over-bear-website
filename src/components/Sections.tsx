"use client";

import { useEffect, useState } from "react";
import PullUpHeading from "./PullUpHeading";

/* ---------- SIZE TABLE ---------- */
const ROWS: [string, number, number, number, string][] = [
  ["M", 42, 28, 20, "60–70 kg"],
  ["L", 44, 29, 21, "70–80 kg"],
  ["XL", 46, 30, 22, "80–92 kg"],
  ["2XL", 48, 31, 23, "92–105 kg"],
  ["3XL", 50, 32, 24, "105–118 kg"],
  ["4XL", 52, 33, 25, "118–130 kg"],
  ["5XL", 54, 34, 26, "130 kg ขึ้นไป"],
];

export function SizeTable() {
  return (
    <section className="section wrap size-sec" id="size">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">Size guide</span>
          <PullUpHeading lines={[[{ text: "ไซซ์หุ่นหมี" }]]} />
        </div>
      </div>
      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>ไซซ์</th>
              <th>รอบอก (นิ้ว)</th>
              <th>ความยาว (นิ้ว)</th>
              <th>บ่า (นิ้ว)</th>
              <th>เหมาะกับน้ำหนัก</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([s, chest, len, shoulder, w]) => (
              <tr key={s}>
                <td>{s}</td>
                <td>{chest}</td>
                <td>{len}</td>
                <td>{shoulder}</td>
                <td>{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="size-note">
        * วัดจากตัวเสื้อจริงแบบราบ อาจคลาดเคลื่อน ±1 นิ้ว · ชอบทรงหลวมพิเศษ เลือกเผื่อขึ้นอีก 1 ไซซ์
      </p>
    </section>
  );
}

/* ---------- LOOKBOOK ---------- */
const LOOKS = ["3XL", "2XL", "4XL", "XL", "5XL"];

const Bear = () => (
  <svg className="bear" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="55" cy="55" r="30" />
    <circle cx="145" cy="55" r="30" />
    <ellipse cx="100" cy="120" rx="70" ry="62" />
  </svg>
);

export function Lookbook() {
  return (
    <section className="section wrap look">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">Lookbook</span>
          <PullUpHeading lines={[[{ text: "On" }, { text: "the" }, { text: "streets" }]]} />
        </div>
      </div>
      <div className="look__scroll reveal">
        {LOOKS.map((s, i) => (
          <div className="look__item" key={i}>
            {/* แทนที่ .ph ด้วยรูปลุคจริงผ่าน next/image (fill) */}
            <div className="ph" role="img" aria-label={`ลุคที่ ${i + 1} ไซซ์ ${s}`}>
              <Bear />
              <span className="ph__note">▲ ใส่รูปลุค</span>
            </div>
            <div className="look__cap">
              <span>Fit 0{i + 1}</span>
              <span>{s}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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

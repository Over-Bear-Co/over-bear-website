"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
/* ไซซ์ที่แบบใส่ในแต่ละลุค + รูป — ทั้งสองค่าต้องมาคู่กัน */
const LOOKS: { size: string; image: string; color: string }[] = [
  { size: "3XL", image: "/tees/black.jpg", color: "ดำสนิท" },
  { size: "2XL", image: "/tees/navy.jpg", color: "กรมท่า" },
  { size: "4XL", image: "/tees/olive.jpg", color: "เขียวมอส" },
  { size: "XL", image: "/tees/white.jpg", color: "ขาวกระดูก" },
  { size: "5XL", image: "/tees/beige.jpg", color: "ทราย" },
];

const Bear = ({ className = "bear" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
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
        {LOOKS.map((l, i) => (
          <div className="look__item" key={l.size}>
            {/* sizes ตรงกับ clamp(240px,32vw,360px) ของ .look__item พอดี */}
            <div className="ph">
              <Image
                src={l.image}
                alt={`ลุคที่ ${i + 1} — เสื้อ oversize สี${l.color} ไซซ์ ${l.size}`}
                fill
                sizes="(max-width:750px) 240px, (max-width:1125px) 32vw, 360px"
              />
            </div>
            <div className="look__cap">
              <span>Fit 0{i + 1}</span>
              <span>{l.size}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- NEWSLETTER (JOIN THE DEN) ---------- */
export function Den() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=email]");
    if (!email || !input?.checkValidity()) {
      setMsg({ text: "ใส่อีเมลให้ถูกต้องก่อนนะ", ok: false });
      return;
    }
    setMsg({ text: "เข้าถ้ำเรียบร้อย! เช็กอีเมลรอดรอปแรกได้เลย", ok: true });
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
        {/* ห้าม emoji (DESIGN.md §10) — หมีคือสัญลักษณ์ success ของแบรนด์เอง
            svg เป็น aria-hidden จึงไม่ไปกวน role=status ที่อ่านเฉพาะข้อความ */}
        <p className="den__msg" role="status" aria-live="polite">
          {msg?.ok && <Bear className="den__bear" />}
          {msg?.text}
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
  return null;
}

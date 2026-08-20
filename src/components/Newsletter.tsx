"use client";

import { useState } from "react";

/* จุด conversion เดียวของเว็บ — Topbar, Nav, การ์ดไซซ์ และ Footer ลิงก์มาที่ #den ทั้งหมด
   ยังไม่ต่อ backend: ข้อความตอบกลับเป็น client-side เท่านั้น ถ้าต่อ API จริงต้องแก้ที่นี่ */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=email]");
    if (!email || !input?.checkValidity()) {
      setMsg("ใส่อีเมลให้ถูกต้องก่อนนะ");
      return;
    }
    setMsg("สมัครเรียบร้อย! เช็กอีเมลรอข่าวดรอปใหม่ได้เลย");
    setEmail("");
  };

  return (
    <section className="sec sec--warm" id="den">
      <div className="wrap news reveal">
        <div>
          <span className="eyebrow">Join the den</span>
          <h2 className="sec-title">รับข่าวดรอปใหม่ก่อนใคร</h2>
          <p className="sec-lead">สมัครรับข่าวดรอปใหม่ ไซซ์ที่เข้าเพิ่ม และของลิมิเต็ด ก่อนเปิดขายจริง</p>
        </div>
        {/* noValidate: ใช้ checkValidity() เองเพื่อคุมข้อความเป็นภาษาไทย
            แทน tooltip ของเบราว์เซอร์ที่เปลี่ยนภาษาไม่ได้ */}
        <form onSubmit={submit} noValidate>
          <input
            type="email"
            placeholder="อีเมลของคุณ"
            aria-label="อีเมล"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn" type="submit">สมัคร</button>
          <p className="news__msg" role="status" aria-live="polite">{msg}</p>
        </form>
      </div>
    </section>
  );
}

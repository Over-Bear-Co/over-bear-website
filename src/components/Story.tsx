"use client";

import { useEffect, useRef } from "react";
import { Engine, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import PullUpHeading from "./PullUpHeading";

const Bear = () => (
  <svg className="bear" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="55" cy="55" r="30" />
    <circle cx="145" cy="55" r="30" />
    <ellipse cx="100" cy="120" rx="70" ry="62" />
    <circle cx="55" cy="55" r="13" fill="#151109" />
    <circle cx="145" cy="55" r="13" fill="#151109" />
  </svg>
);

export default function Story() {
  const storyRef = useRef<HTMLElement>(null);

  /* Thai grapheme scroll-ink reveal —
     ห้าม "ลดรูป" เป็น split('') เด็ดขาด: สระ/วรรณยุกต์ไทยจะหลุดจากพยัญชนะ
     ใช้ Intl.Segmenter เท่านั้น · screen reader ได้ต้นฉบับใน .sr-only */
  useEffect(() => {
    if (prefersReducedMotion() || !("Segmenter" in Intl)) return;
    const story = storyRef.current;
    if (!story) return;
    const paras = [...story.querySelectorAll<HTMLParagraphElement>(".story__body p")];
    if (!paras.length) return;

    const wordSeg = new Intl.Segmenter("th", { granularity: "word" });
    const charSeg = new Intl.Segmenter("th", { granularity: "grapheme" });
    const coarse = !isFinePointer(); // มือถือขยับระดับคำ (~60 nodes) เดสก์ท็อประดับ grapheme (~300)
    const units: HTMLElement[] = [];
    const originals = new Map<HTMLParagraphElement, string>();

    paras.forEach((p) => {
      const text = p.textContent ?? "";
      originals.set(p, text);
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      const vis = document.createElement("span");
      vis.setAttribute("aria-hidden", "true");
      for (const w of wordSeg.segment(text)) {
        if (!w.segment.trim()) {
          vis.append(document.createTextNode(w.segment));
          continue;
        }
        const wEl = document.createElement("span");
        wEl.className = "w";
        if (coarse) {
          wEl.classList.add("ch");
          wEl.textContent = w.segment;
          units.push(wEl);
        } else {
          for (const g of charSeg.segment(w.segment)) {
            const c = document.createElement("span");
            c.className = "ch";
            c.textContent = g.segment;
            wEl.append(c);
            units.push(c);
          }
        }
        vis.append(wEl);
      }
      p.textContent = "";
      p.append(sr, vis);
    });

    const N = units.length;
    const last = new Float32Array(N).fill(0.18);
    const ink = {
      active: false,
      step() {
        const r = story.getBoundingClientRect(), vh = innerHeight;
        const p = Math.max(0, Math.min(1, (0.8 * vh - r.top) / (0.6 * vh + r.height)));
        let moving = false;
        for (let i = 0; i < N; i++) {
          const cp = i / N;
          const o = 0.18 + 0.82 * Math.max(0, Math.min(1, (p - (cp - 0.1)) / 0.15));
          if (Math.abs(o - last[i]) > 0.02) {
            units[i].style.opacity = String(o);
            last[i] = o;
            moving = true;
          }
        }
        return moving;
      },
    };
    Engine.add(ink);
    const io = new IntersectionObserver(
      (es) => {
        ink.active = es[0].isIntersecting;
        Engine.wake();
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(story);
    return () => {
      io.disconnect();
      Engine.remove(ink);
      originals.forEach((text, p) => (p.textContent = text)); // คืนต้นฉบับตอน unmount
    };
  }, []);

  return (
    <section className="story section" id="story" ref={storyRef}>
      <div className="wrap story__grid">
        {/* แทนที่ .ph ด้วยรูปนายแบบจริง */}
        <div className="story__media ph reveal" role="img" aria-label="นายแบบหุ่นหมีใส่เสื้อ oversize">
          <Bear />
          <span className="ph__note">▲ แทนที่ด้วยรูปนายแบบจริง</span>
        </div>
        <div className="story__body reveal reveal--pu">
          <span className="eyebrow">Made for size</span>
          <PullUpHeading lines={[[{ text: "ตัดมาเพื่อ" }], [{ text: "หุ่นหมี", em: true }, { text: "โดยเฉพาะ" }]]} />
          <p>
            เราเบื่อกับเสื้อ &quot;ไซซ์ใหญ่&quot; ที่จริงๆ แค่ยืดไซซ์ปกติออก แล้วทรงเพี้ยน OVERBEAR
            ตัดแพตเทิร์นใหม่บนหุ่นคนตัวใหญ่จริง บ่าตก อกกว้าง ตัวยาวกำลังดี
          </p>
          <p>
            ผ้าคอตตอนหนา 240 GSM ทิ้งตัวสวย ไม่บางโปร่ง ซักแล้วไม่หด สีเข้มไม่ตก — ใส่ออกไปแล้วมั่นใจ ดูเท่
            ไม่ต้องพยายาม
          </p>
          <dl className="specs">
            <div className="spec">
              <dt>น้ำหนักผ้า</dt>
              <dd>
                240<span className="u">GSM</span>
              </dd>
            </div>
            <div className="spec">
              <dt>ทรง</dt>
              <dd>
                Drop<span className="u">shoulder</span>
              </dd>
            </div>
            <div className="spec">
              <dt>ช่วงไซซ์</dt>
              <dd>M–5XL</dd>
            </div>
            <div className="spec">
              <dt>ผ้า</dt>
              <dd>
                Pre<span className="u">shrunk</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

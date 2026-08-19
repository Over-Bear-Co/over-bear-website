"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTorch, type TorchNote } from "@/lib/useTorch";
import PullUpHeading from "./PullUpHeading";

/* สเปกที่โผล่ในลำแสง — ชุดเดียวกับที่ประกาศไว้ทั้งไซต์ (240 GSM · 50/50 · triple-stitch) */
const TORCH_NOTES: readonly TorchNote[] = [
  ["240 GSM", "22%", "14%"],
  ["50/50 BLEND", "50%", "54%"],
  ["TRIPLE-STITCH", "76%", "18%"],
];

export default function IndustrialPrecision() {
  const mediaRef = useRef<HTMLDivElement>(null);

  /* SIGNATURE — UV-torch spotlight (ดู lib/useTorch.ts) — ใช้ร่วมกับ Hero */
  useTorch(mediaRef, TORCH_NOTES);

  return (
    <section className="section wrap" id="precision">
      <div className="sec-head reveal reveal--pu">
        <div>
          <span className="eyebrow">Industrial precision</span>
          <PullUpHeading
            lines={[[{ text: "งานตัดเย็บ" }], [{ text: "ระดับ" }, { text: "อุตสาหกรรม", em: true }]]}
          />
        </div>
      </div>
      <div className="story__grid">
        <div className="frame prec__media reveal" ref={mediaRef}>
          <Image
            src="/media/fabric/macro.jpg"
            alt="ภาพมาโครเนื้อผ้าทอเส้นใยหนา 240 GSM โทนขาวดำ เห็นร่องลายทอชัดใต้แสงข้าง"
            fill
            sizes="(max-width:900px) 92vw, 45vw"
          />
          <span className="frame__cap tag tag--acid">
            <span className="tag__dot" />240 GSM TEXTILE
          </span>
        </div>
        {/* ไม่ใส่ reveal--pu: หัวข้ออยู่ใน .sec-head บล็อกนี้จึงไม่มี PullUpHeading
            (ถ้าใส่ .js .reveal--pu จะยกเลิกการเลื่อนขึ้น ทำให้สองคอลัมน์เข้าจอไม่พร้อมกัน) */}
        <div className="story__body reveal">
          <p>
            เราปฏิเสธความเปราะบางของแฟชั่นเร็ว เสื้อทุกตัวถูกสร้างแบบงานอุตสาหกรรม ให้ทิ้งตัวลงมาอย่างมีน้ำหนัก
            และทนแรงใช้งานจริงในเมือง
          </p>
          <p>
            ผ้าหนา 240 GSM ทอแน่นจนจับแล้วรู้ได้ทันที ไม่บางโปร่ง ไม่ย้วยหลังซักซ้ำ ทรงยังอยู่เหมือนวันแรก
          </p>
          <dl className="specs">
            <div className="spec">
              <dt>น้ำหนักผ้า</dt>
              <dd>
                240<span className="u">GSM</span>
              </dd>
            </div>
            <div className="spec">
              <dt>ตะเข็บ</dt>
              <dd>
                Triple<span className="u">stitch</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

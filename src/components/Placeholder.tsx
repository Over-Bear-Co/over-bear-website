import { ImageIcon } from "./icons";

/* ช่องรูปที่ยังไม่มีรูปจริง — โครงเดียวกับ .frame เป๊ะ (border-radius/aspect เท่ากัน)
   ดังนั้นตอนได้รูปมาแล้ว สลับ <Placeholder label=…/> เป็น <Frame src=… alt=…/> ได้ตรงๆ
   ไม่ต้องแก้ CSS หรือ layout เลย
   label บอกว่าช่องนี้ควรเป็นรูปอะไร — ทำให้ไบรฟ์ช่างภาพได้จากหน้าเว็บโดยตรง */
export default function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`ph ${className}`.trim()} role="img" aria-label={`ตำแหน่งรูป: ${label}`}>
      <span className="ph__label">
        <ImageIcon className="ph__icon" />
        {label}
      </span>
    </div>
  );
}

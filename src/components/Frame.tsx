import Image from "next/image";

/* คู่แฝดของ Placeholder สำหรับช่องที่มีรูปจริงแล้ว
   ใช้ next/image แบบ fill — พาเรนต์ต้องเป็น position:relative ซึ่ง .frame ตั้งไว้ให้แล้ว
   sizes จำเป็นกับ fill ทุกครั้ง ไม่ใส่แล้ว next จะเดาเป็น 100vw และโหลดรูปใหญ่เกินจริง */
export default function Frame({
  src, alt, sizes, priority = false, className = "",
}: {
  src: string; alt: string; sizes: string; priority?: boolean; className?: string;
}) {
  return (
    <div className={`frame ${className}`.trim()}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}

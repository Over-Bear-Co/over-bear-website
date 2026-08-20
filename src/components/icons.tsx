/* ไอคอนคัดลอก path มาจาก Overbear-Homepage.html ตรงตัว ยกเว้น Truck ตัวเดียว
   ที่ผู้ใช้เลือกแบบอื่น (ดูหมายเหตุที่ตัวมันเอง)
   (รอบแรกผมวาดเองทั้งที่ไฟล์ต้นฉบับมี <svg> ให้ 35 ตัว — ผิดทั้งรูปทรงและความหมาย
   เช่น "บริการลูกค้า" ต้นฉบับเป็นหูฟัง ผมวาดเป็นกรอบคำพูด)

   ทุกตัวใช้ viewBox 0 0 24 24 / fill=none / linecap+linejoin=round เหมือนต้นฉบับ
   strokeWidth ฝังในแต่ละตัวเพราะต้นฉบับตั้งไม่เท่ากันต่อกลุ่ม (1.1 / 1.3 / 1.4 / 1.8 / 2.4)
   ส่วนขนาดและสีปล่อยให้ CSS คุมจากที่เดียวต่อ section */
type P = { className?: string };
const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/* ---- แถบความน่าเชื่อถือ (stroke 1.4 · 32–34px · #8B1719) ---- */

/* ⚠️ ตัวเดียวในไฟล์นี้ที่ไม่ใช่ path ของต้นฉบับ — ผู้ใช้เลือกแบบนี้แทน
   ต้นฉบับเป็นกล่องเหลี่ยม + หัวเก๋งมุมเฉียงคม + เส้นความเร็ว 2 เส้น:
     M7 8h8v8H7z / M15 11h3l2.5 2.5V16H15z / วงล้อ r=1.5 / M2 10h3M1 13h4
   ตัวนี้มุมโค้ง หัวเก๋งไล่โค้ง และเส้นความเร็ว 3 เส้นไล่ระดับสั้น-ยาว-สั้น
   ซึ่งอ่านออกง่ายกว่าที่ขนาดจริง 34px และเข้ากับมุมโค้ง 10px ของการ์ดทั้งเว็บ

   stroke 1.5 (ไม่ใช่ 1.4 เท่าอีกสามตัวในแถบ) — คงไว้ตามที่ผู้ใช้เห็นตอนเลือก
   ต่างกัน 0.1 หน่วย = ~0.14px ที่ 34px ซึ่งมองไม่เห็น */
export const Truck = (p: P) => (
  <svg {...svg} strokeWidth={1.5} {...p}>
    <rect x="7.5" y="7.5" width="8" height="8.5" rx="1.2" />
    <path d="M15.5 10.5h2.6a1.4 1.4 0 0 1 1 .45l1.6 1.8a1.4 1.4 0 0 1 .3.9V16h-5.5z" />
    <circle cx="10.5" cy="18.4" r="1.6" />
    <circle cx="18.4" cy="18.4" r="1.6" />
    <path d="M4.6 9.6h2.2M2.6 12.3h4.2M4.2 15h2.6" />
  </svg>
);
export const Shield = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <path d="M12 3l7.5 3v5.8c0 4.3-3 7.8-7.5 9.2-4.5-1.4-7.5-4.9-7.5-9.2V6z" />
    <path d="M8.8 12l2.4 2.4 4.2-4.6" />
  </svg>
);
export const Swap = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <path d="M4.6 9.6A8 8 0 0 1 19 8.4" />
    <path d="M19.4 4.2v4.4h-4.3" />
    <path d="M19.4 14.4A8 8 0 0 1 5 15.6" />
    <path d="M4.6 19.8v-4.4h4.3" />
  </svg>
);
/* หูฟัง — ไม่ใช่กรอบคำพูด */
export const Headset = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
    <rect x="2.5" y="12.5" width="4" height="6.5" rx="1.8" />
    <rect x="17.5" y="12.5" width="4" height="6.5" rx="1.8" />
    <path d="M12 20.5h1.6" />
    <circle cx="10.5" cy="20.5" r="1" />
  </svg>
);

/* ---- คุณสมบัติใน OUR STORY (stroke 1.3 · 30px · #966C4C) ---- */
export const Dressform = (p: P) => (
  <svg {...svg} strokeWidth={1.3} {...p}>
    <path d="M12 3.2a1.9 1.9 0 0 1 1.9 1.9c0 1.2 3.6 2.6 4.6 6.6.9 3.5-1.7 6.7-6.5 6.7s-7.4-3.2-6.5-6.7c1-4 4.6-5.4 4.6-6.6A1.9 1.9 0 0 1 12 3.2z" />
    <path d="M12 9.6v1.8" />
  </svg>
);
export const Leaf = (p: P) => (
  <svg {...svg} strokeWidth={1.3} {...p}>
    <path d="M13.6 4.6a1.7 1.7 0 1 0-2.7 1.9c1 1.4-2.9 2.3-3.9 6.1-.9 3.4 1.7 5.9 5.6 5.9s6.4-2.5 5.5-5.9c-1-3.9-5.4-4.4-4.5-8z" />
  </svg>
);
export const Medal = (p: P) => (
  <svg {...svg} strokeWidth={1.3} {...p}>
    <circle cx="12" cy="9.6" r="5.2" />
    <path d="M12 4.4l1.6 1.2 2-.2.4 2 1.5 1.3-.9 1.8.4 2-1.9.8-1.1 1.7-2-.5-1.9.7-1.2-1.6-2-.6.1-2-1.2-1.6 1.2-1.6-.2-2 2-.4z" />
    <path d="M8.9 14.8L7.4 20l4.6-2.2L16.6 20l-1.5-5.2" />
  </svg>
);

/* ---- ทำไมต้อง Overbear (stroke 1.1 · 46px · ใบแรก #8B1719 อีกสามใบ #966C4C) ---- */
export const Tshirt = (p: P) => (
  <svg {...svg} strokeWidth={1.1} {...p}>
    <path d="M9 3.5L4.2 6l1.5 4.2 2.3-.7V20h8V9.5l2.3.7L19.8 6 15 3.5a3 3 0 0 1-6 0z" />
  </svg>
);
export const Airflow = (p: P) => (
  <svg {...svg} strokeWidth={1.1} {...p}>
    <path d="M2.5 14.5c2.6-2.2 4.7 2 7.3 0s4.7 2 7.3 0" />
    <path d="M2.5 18c2.6-2.2 4.7 2 7.3 0s4.7 2 7.3 0" />
    <path d="M8.4 10V4m0 0L6.4 6.2M8.4 4l2 2.2" />
    <path d="M14 10V6.4m0 0l-1.8 2M14 6.4l1.8 2" />
  </svg>
);
/* เสื้อมีปกคอ (ทรงเสื้อ) — ไม่ใช่ป้ายแท็ก */
export const Vest = (p: P) => (
  <svg {...svg} strokeWidth={1.1} {...p}>
    <path d="M12 3.2v1.4" />
    <path d="M8.6 4.6c0 1.9 1.5 2.9 3.4 2.9s3.4-1 3.4-2.9c2.4.8 3.8 2.4 3.8 4.9v8a2.6 2.6 0 0 1-2.6 2.6H7.4A2.6 2.6 0 0 1 4.8 17.5v-8c0-2.5 1.4-4.1 3.8-4.9z" />
    <path d="M10.4 11.6h3.2" />
  </svg>
);
export const Cloud = (p: P) => (
  <svg {...svg} strokeWidth={1.1} {...p}>
    <path d="M6.4 18h11.2a3.4 3.4 0 0 0 .3-6.8 5.4 5.4 0 0 0-10.3-1.3A3.9 3.9 0 0 0 6.4 18z" />
    <path d="M9.6 14.4c.9-1.6 2.4-1.6 3.3 0" />
  </svg>
);

/* ---- เช็คลิสต์ BUILT FOR BIGGER DAYS (stroke 2.4 · 15px · #8B1719) ---- */
export const Check = (p: P) => (
  <svg {...svg} strokeWidth={2.4} {...p}>
    <path d="M4 12.5l5.2 5.2L20 6.8" />
  </svg>
);

/* ---- ฟุตเตอร์ (stroke 1.4 · 16px) ---- */
export const Clock = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.6V12l3 1.8" />
  </svg>
);
export const Phone = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <path d="M6.4 4.5h3l1.4 3.4-2 1.3a9.6 9.6 0 0 0 5.6 5.6l1.3-2 3.4 1.4v3a1.5 1.5 0 0 1-1.7 1.5C11.2 18.4 5.4 12.6 4.9 6.2a1.5 1.5 0 0 1 1.5-1.7z" />
  </svg>
);
export const Mail = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </svg>
);
export const Bubble = (p: P) => (
  <svg {...svg} strokeWidth={1.4} {...p}>
    <path d="M12 4.6c-4.4 0-8 2.8-8 6.4 0 3.2 2.8 5.9 6.5 6.3l-.4 2.5 3.5-2.6c3.6-.5 6.4-3.1 6.4-6.2 0-3.6-3.6-6.4-8-6.4z" />
  </svg>
);

/* ---- ลิงก์ "ดูทั้งหมด" (stroke 1.8 · 13px · currentColor) ----
   ต้นฉบับใช้ chevron เป็น svg ไม่ใช่ตัวอักษร → ผมเคยใส่เป็น "→" ซึ่งไม่ตรง */
export const ChevronRight = (p: P) => (
  <svg {...svg} strokeWidth={1.8} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

/* ---- ไอคอนของผมเอง: ต้นฉบับไม่มี เพราะช่อง placeholder ของมันเป็นภาพ ----
   ใช้เฉพาะ <Placeholder> ซึ่งตอนนี้ไม่มี slot ไหนเรียกใช้ (ทุกช่องมีรูปจริงแล้ว) */
export const ImageIcon = (p: P) => (
  <svg {...svg} strokeWidth={1.5} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="M3 17l5-4 3.5 3L16 11l5 5" />
  </svg>
);

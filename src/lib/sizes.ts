/* แหล่งอ้างอิงเดียวของช่วงไซซ์ที่ขาย — ย้ายออกมาจาก SpecificationSheet.tsx เดิม
   ตัวเลขวัดตัวยกมาจาก code.html (บรรทัด 512-527) ทั้งชุด หน่วยเป็นนิ้ว
   ไล่ระดับ +2 รอบอก / +1 ความยาว / +1 บ่า ต่อไซซ์อย่างสม่ำเสมอ

   เริ่มที่ XL ไม่มี M กับ L — ไฟล์ Overbear-Homepage.html อ้างอิงเขียน 2XL–6XL
   แต่ตกลงกันแล้วว่ายึด XL–5XL เพราะชุดนี้มีเลขวัดตัวจริงรองรับ ส่วน 6XL ไม่มี

   ข้อความทั่วเว็บ (Topbar, Hero badge, การ์ดสินค้า, metadata) ต้องเขียน XL–5XL
   ให้ตรงกับที่นี่เสมอ ถ้าเพิ่มไซซ์ต้องไล่แก้ทุกจุด
   ช่วงน้ำหนักไม่คาบเกี่ยวกัน — ต้นฉบับเขียน 80-92 ต่อด้วย 92-105 ทำให้ 92 kg แมปได้สองไซซ์ */
export type SizeRow = {
  size: string;
  chest: number;    // รอบอก (นิ้ว)
  length: number;   // ความยาวตัว (นิ้ว)
  shoulder: number; // ไหล่ (นิ้ว)
  /* ช่วงน้ำหนักตัว หน่วย kg — เก็บเฉพาะตัวเลขเหมือน chest/length/shoulder
     หน่วยอยู่ที่หัวแถวของตาราง ("เหมาะกับน้ำหนัก (kg)") ไม่ซ้ำในทุกช่อง
     เพราะการ์ดไซซ์แคบสุดเหลือเนื้อที่ 248px ที่จอ 320px ใส่ " kg" ทุกช่องแล้วล้น */
  weight: string;
};

export const SIZES: SizeRow[] = [
  { size: "XL",  chest: 49, length: 33, shoulder: 25, weight: "80–91" },
  { size: "2XL", chest: 51, length: 34, shoulder: 26, weight: "92–104" },
  { size: "3XL", chest: 53, length: 35, shoulder: 27, weight: "105–117" },
  { size: "4XL", chest: 55, length: 36, shoulder: 28, weight: "118–129" },
  { size: "5XL", chest: 57, length: 37, shoulder: 29, weight: "130+" },
];

/* ป้ายช่วงไซซ์ที่ใช้ซ้ำหลายที่ — คำนวณจาก SIZES ไม่ให้ค้างเมื่อช่วงไซซ์เปลี่ยน */
export const SIZE_RANGE = `${SIZES[0].size}–${SIZES[SIZES.length - 1].size}`;

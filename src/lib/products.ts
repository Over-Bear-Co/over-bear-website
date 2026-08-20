export type Product = {
  id: string;
  unit: string; // รหัสในคลัง — เก็บเป็นข้อมูลอ้างอิง การ์ดสินค้าไม่แสดง (เหมือน price)
  name: string;
  price: number;
  color: string;
  /* ไฟล์ใน public/media/product/ — ไม่มี = ยังไม่ได้ถ่าย ให้ตกไปใช้ .ph placeholder */
  image?: string;
  badge?: "BESTSELLER" | "NEW";
};

/* แก้สินค้า/ราคาได้ที่นี่ที่เดียว
   price กับ unit เก็บไว้เป็นข้อมูลอ้างอิง การ์ดไม่แสดงทั้งคู่
   (เว็บเป็นแคตตาล็อกล้วน ไม่มีตะกร้า ไม่มีราคา — ยืนยันรอบล่าสุดตอนพอร์ต Overbear-Homepage.html)
   ช่วงสีเป็นเอิร์ธโทนตามชุดรูปจริง ถ่ายชุดเดียวกันทั้ง 6 ตัว (ผนังปูน ไม้แขวน หลอดไฟเดียวกัน)
   image เป็น optional ไว้รองรับสินค้าที่ยังไม่ได้ถ่าย — จะตกไปใช้ .ph placeholder อัตโนมัติ */
export const PRODUCTS: Product[] = [
  { id: "slate",  unit: "01", name: "Slate Heavy Tee",          price: 890, color: "เทาสเลท",   image: "/media/product/slate.jpg",  badge: "BESTSELLER" },
  { id: "olive",  unit: "02", name: "Olive Drab Boxy",          price: 990, color: "เขียวขี้ม้า", image: "/media/product/olive.jpg" },
  { id: "sand",   unit: "03", name: "Sandstone Drop-Shoulder",  price: 890, color: "ทรายอ่อน",   image: "/media/product/sand.jpg" },
  { id: "clay",   unit: "04", name: "Clay Oversized",           price: 990, color: "ดินเผา",    image: "/media/product/clay.jpg" },
  { id: "carbon", unit: "05", name: "Carbon Long Tee",          price: 950, color: "ดำคาร์บอน",  image: "/media/product/carbon.jpg", badge: "NEW" },
  { id: "white",  unit: "06", name: "Optical White Tee",        price: 920, color: "ขาวออฟไวต์", image: "/media/product/white.jpg" },
];

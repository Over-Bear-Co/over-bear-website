export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  image: string;
  badge?: "BESTSELLER" | "NEW";
};

/* แก้สินค้า/ราคา/รูปได้ที่นี่ที่เดียว
   ชื่อรุ่นตั้งจากชื่อสีใน CI palette (Bone / Sand / Moss = --bone / --sand / Olive Moss)
   color ต้องตรงกับสีเสื้อในรูปเสมอ — ถ้าเปลี่ยนรูปต้องเปลี่ยนบรรทัดนี้ด้วย */
export const PRODUCTS: Product[] = [
  { id: "midnight", name: "Midnight Heavy Tee", price: 890, color: "ดำสนิท", image: "/tees/black.jpg", badge: "BESTSELLER" },
  { id: "bone", name: "Bone Boxy Tee", price: 890, color: "ขาวกระดูก", image: "/tees/white.jpg" },
  { id: "deepsea", name: "Deepsea Drop-Shoulder", price: 990, color: "กรมท่า", image: "/tees/navy.jpg" },
  { id: "sand", name: "Sand Long Tee", price: 990, color: "ทราย", image: "/tees/beige.jpg", badge: "NEW" },
  { id: "charcoal", name: "Charcoal Heavy Tee", price: 950, color: "เทาถ่าน", image: "/tees/charcoal.jpg" },
  { id: "moss", name: "Moss Oversized", price: 920, color: "เขียวมอส", image: "/tees/olive.jpg" },
];

export const SIZES = ["M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;
export type Size = (typeof SIZES)[number];

/* BUSINESS RULE — เกณฑ์ส่งฟรี (แก้ตัวเลขได้บรรทัดเดียว) */
export const FREE_SHIP_THRESHOLD = 1500;

export const money = (n: number) => "฿" + n.toLocaleString("th-TH");

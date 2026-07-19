export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  badge?: "BESTSELLER" | "NEW";
};

/* แก้สินค้า/ราคาได้ที่นี่ที่เดียว */
export const PRODUCTS: Product[] = [
  { id: "midnight", name: "Midnight Heavy Tee", price: 890, color: "ดำสนิท", badge: "BESTSELLER" },
  { id: "shadow", name: "Shadow Drop-Shoulder", price: 990, color: "ดำวอช" },
  { id: "charcoal", name: "Charcoal Boxy Tee", price: 890, color: "เทาถ่าน" },
  { id: "obsidian", name: "Obsidian Long Tee", price: 990, color: "ดำยาว", badge: "NEW" },
  { id: "onyx", name: "Onyx Pocket Tee", price: 950, color: "ดำมีกระเป๋า" },
  { id: "graphite", name: "Graphite Oversized", price: 920, color: "เทากราไฟต์" },
];

export const SIZES = ["M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;
export type Size = (typeof SIZES)[number];

/* BUSINESS RULE — เกณฑ์ส่งฟรี (แก้ตัวเลขได้บรรทัดเดียว) */
export const FREE_SHIP_THRESHOLD = 1500;

export const money = (n: number) => "฿" + n.toLocaleString("th-TH");

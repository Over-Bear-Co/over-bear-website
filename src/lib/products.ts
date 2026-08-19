export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  badge?: "BESTSELLER" | "NEW";
};

/* แก้สินค้า/ราคาได้ที่นี่ที่เดียว
   price ยังเก็บไว้เป็นข้อมูลอ้างอิง แม้การ์ดจะไม่แสดงราคาแล้ว (เว็บเป็นแคตตาล็อกล้วน ไม่มีตะกร้า) */
export const PRODUCTS: Product[] = [
  { id: "midnight", name: "Midnight Heavy Tee", price: 890, color: "ดำสนิท", badge: "BESTSELLER" },
  { id: "shadow", name: "Shadow Drop-Shoulder", price: 990, color: "ดำวอช" },
  { id: "charcoal", name: "Charcoal Boxy Tee", price: 890, color: "เทาถ่าน" },
  { id: "obsidian", name: "Obsidian Long Tee", price: 990, color: "ดำยาว", badge: "NEW" },
  { id: "onyx", name: "Onyx Pocket Tee", price: 950, color: "ดำมีกระเป๋า" },
  { id: "graphite", name: "Graphite Oversized", price: 920, color: "เทากราไฟต์" },
];

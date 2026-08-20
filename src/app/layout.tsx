import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Anuphan, EB_Garamond } from "next/font/google";
import "./globals.css";

/* Anuphan = ฟอนต์เดียวของทั้งไซต์ (ตามไฟล์อ้างอิง) รองรับทั้งไทยและละตินในตัว
   จึงไม่ต้องมีฟอนต์ไทยสำรองแยกเหมือนดีไซน์เดิมที่ใช้ Anton (ละตินเท่านั้น) + Kanit
   โหลด 400/500/600 = น้ำหนักที่ใช้จริงทั้งหมด */
const anuphan = Anuphan({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-anuphan",
  display: "swap",
});

/* serif สำหรับ wordmark OVERBEAR เท่านั้น — อ้างอิงใช้ serif ตัวเดียวกับโลโก้
   subset latin พอ เพราะ wordmark ไม่มีอักษรไทย */
const garamond = EB_Garamond({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OVERBEAR — เสื้อผ้าพลัสไซซ์สำหรับผู้ชาย | ไซซ์ XL–5XL",
  description:
    "เสื้อผ้าพลัสไซซ์สำหรับผู้ชาย ตัดเย็บเพื่อรูปร่างใหญ่โดยเฉพาะ ผ้าหนา 240 GSM ทรง drop-shoulder ไซซ์ XL–5XL ใส่สบาย มั่นใจทุกวัน",
  openGraph: {
    title: "OVERBEAR — สไตล์ที่ใช่ ไซซ์ที่ชอบ",
    description: "เสื้อผ้าพลัสไซซ์สำหรับผู้ชาย ตัดเย็บเพื่อรูปร่างใหญ่ ไซซ์ XL–5XL",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5ef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // boot script เติมคลาส .js บน <html> ก่อน hydration — จงใจ จึง suppressHydrationWarning
    <html lang="th" className={`${anuphan.variable} ${garamond.variable}`} suppressHydrationWarning>
      <body>
        {/* .js เป็นเงื่อนไขของ .reveal: ถ้า JS ปิด เนื้อหาต้องมองเห็นทันทีไม่ใช่ opacity:0 ค้าง */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        {children}
      </body>
    </html>
  );
}

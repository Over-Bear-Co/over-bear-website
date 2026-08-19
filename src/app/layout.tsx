import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Anton, Archivo, Kanit, Space_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
// Kanit is the Thai fallback for the Anton display face (Anton has no Thai glyphs; it covers Latin),
// so only the Thai subset and the weights actually rendered are loaded. 700 is not optional: every
// display element at font-weight 400 (.brand, .card__name, .mobile-menu a, .spec dd) falls back to the
// nearest loaded Kanit, and `font-synthesis:weight none` in globals.css forbids faux weights.
// 800 covers the section headings.
const kanit = Kanit({ weight: ["700", "800"], subsets: ["thai"], variable: "--font-kanit", display: "swap" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OVERBEAR — เสื้อ Oversize สายหมี | ไซซ์หมี สไตล์เท่",
  description:
    "เสื้อยืด oversize สีเข้ม ตัดเผื่อทรงหุ่นหมีโดยเฉพาะ ผ้าหนา 240 GSM ทรง drop-shoulder ไซซ์ M–5XL ใส่สบาย ดูเท่ทุกวัน",
  openGraph: {
    title: "OVERBEAR — OVERSIZED. UNAPOLOGETIC.",
    description: "เสื้อ oversize สีเข้ม ตัดเผื่อทรงหุ่นหมี ผ้าหนา ไซซ์ M–5XL",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0b0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // boot script เติมคลาส js/fonts-in บน <html> ก่อน hydration — จงใจ จึง suppressHydrationWarning
    <html
      lang="th"
      className={`${anton.variable} ${archivo.variable} ${kanit.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* load choreography gate: .js ก่อน paint แรก, .fonts-in เมื่อฟอนต์พร้อม,
            .no-intro เมื่อเบราว์เซอร์ restore ตำแหน่ง scroll กลางหน้า */}
        <Script id="motion-boot" strategy="beforeInteractive">{`
document.documentElement.classList.add('js');
Promise.race([document.fonts.ready, new Promise(function(r){setTimeout(r,350)})])
  .then(function(){
    if(scrollY > 100) document.documentElement.classList.add('no-intro');
    document.documentElement.classList.add('fonts-in');
  });
`}</Script>
        {children}
      </body>
    </html>
  );
}

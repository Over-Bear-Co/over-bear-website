import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Kanit, Space_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
// Kanit is the site's ONLY Thai face, and it now carries every Thai slot — not just display.
// Anton, Archivo and Space Mono all ship latin-only subsets, so before 400/700 were added here
// every Thai string outside a heading (body copy, buttons, topbar, table, spec labels, form)
// rendered in whatever face the OS happened to pick. On a Thai-first site that is most of the text.
//   800 = display headings, matched to Anton 400's optical mass (see --display in globals.css)
//   700 = Thai inside bold mono slots (buttons, topbar, form status)
//   400 = Thai body copy and metadata
// Thai subset only: Kanit sits after the Latin faces in every chain, so its Latin is never reached.
const kanit = Kanit({ weight: ["400", "700", "800"], subsets: ["thai"], variable: "--font-kanit", display: "swap" });
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
  themeColor: "#0E0E0E",
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
            .no-intro เมื่อเบราว์เซอร์ restore ตำแหน่ง scroll กลางหน้า

            ต้องเป็น raw <script> และต้องเป็นลูกตัวแรกของ <body> — ห้ามกลับไปใช้ next/script
            เหตุผล: `strategy="beforeInteractive"` + inline children ไม่ได้ compile เป็น <script> ที่รันได้
            มันถูก serialize เป็น (self.__next_s=self.__next_s||[]).push([0,{children:"..."}])
            ซึ่ง drain โดย framework chunk แบบ async = ทำงานหลัง paint แรก
            และเพราะกฎ .js คือกฎที่ "ซ่อน" ของ (opacity:0 / translateY(112%)) ผลคือ paint แรก
            เห็น topbar+nav+ฮีโร่ครบ แล้วกระโดดกลับไปซ่อนแล้วค่อยวิ่งเข้า — คือ flash ที่ gate นี้มีไว้กัน
            docs ยืนยันเอง: beforeInteractive "execution does not block page hydration"
            raw <script> ตำแหน่งนี้บล็อก parser จนรันจบ markup ถัดไปจึงยังไม่ถูก parse/paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');
Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,350)})]).then(function(){
if(scrollY>100)document.documentElement.classList.add('no-intro');
document.documentElement.classList.add('fonts-in');});`,
          }}
        />
        {children}
      </body>
    </html>
  );
}

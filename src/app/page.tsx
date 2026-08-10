import UIProvider from "@/components/UIProvider";
import { FREE_SHIP_THRESHOLD, money } from "@/lib/products";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductGrid from "@/components/ProductGrid";
import Story from "@/components/Story";
import Footer from "@/components/Footer";
import { SizeTable, Lookbook, Den, MotionRoot } from "@/components/Sections";

export default function Home() {
  return (
    <UIProvider>
      <div className="topbar">{`ส่งฟรีเมื่อซื้อครบ ${money(FREE_SHIP_THRESHOLD)} · ดรอปใหม่ทุกเดือน · ไซซ์ M–5XL ครบทุกตัว`}</div>
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <ProductGrid />
        <Story />
        <SizeTable />
        <Lookbook />
        <Den />
      </main>
      <Footer />
      <MotionRoot />
    </UIProvider>
  );
}

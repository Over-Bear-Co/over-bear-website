import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductGrid from "@/components/ProductGrid";
import Story from "@/components/Story";
import Footer from "@/components/Footer";
import { SizeTable, Lookbook, Den, MotionRoot } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <div className="topbar">ดรอปใหม่ทุกเดือน · ไซซ์ M–5XL ครบทุกตัว</div>
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
    </>
  );
}

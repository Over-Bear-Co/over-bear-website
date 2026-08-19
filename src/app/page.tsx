import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Story from "@/components/Story";
import Footer from "@/components/Footer";
import { Den, MotionRoot } from "@/components/Sections";
import IndustrialPrecision from "@/components/IndustrialPrecision";
import FabricTechnology from "@/components/FabricTechnology";
import HeavyweightArchive from "@/components/HeavyweightArchive";
import OnTheStreets from "@/components/OnTheStreets";
import IndustrialSpec from "@/components/IndustrialSpec";
import SpecificationSheet from "@/components/SpecificationSheet";

export default function Home() {
  return (
    <>
      <div className="topbar">ดรอปใหม่ทุกเดือน · ไซซ์ XL–5XL ครบทุกตัว</div>
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <Story />
        {/* ชุดจาก Stitch mockup — วางต่อกันเป็นบล็อกเดียวเพื่อเทียบกับของเดิมด้านบนได้ในหน้าเดียว
            แต่ละตัวถอดออกได้ด้วยการลบบรรทัดเดียว หากตัดสินใจแล้วว่าจะเก็บชุดไหน */}
        <IndustrialPrecision />
        <FabricTechnology />
        <HeavyweightArchive />
        <OnTheStreets />
        <IndustrialSpec />
        <SpecificationSheet />
        <Den />
      </main>
      <Footer />
      <MotionRoot />
    </>
  );
}

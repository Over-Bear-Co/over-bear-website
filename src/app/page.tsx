import Topbar from "@/components/Topbar";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import BestSellers from "@/components/BestSellers";
import TrustBar from "@/components/TrustBar";
import Story from "@/components/Story";
import WhyOverbear from "@/components/WhyOverbear";
import FabricDetail from "@/components/FabricDetail";
import BuiltForBiggerDays from "@/components/BuiltForBiggerDays";
import CustomerVoice from "@/components/CustomerVoice";
import ShopByCategory from "@/components/ShopByCategory";
import PromoBanner from "@/components/PromoBanner";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

/* ลำดับบล็อกตาม Overbear-Homepage.html ทุกบล็อก
   พื้นสลับ (.sec--warm) เป็นตัวคั่น section แทนเส้น — อ้างอิงทำแบบเดียวกัน
   ต้องเรียงให้สลับจริง: ขายดี(ปกติ) trust(ปกติ) story(warm) why(ปกติ)
   fabric(warm) built(ปกติ) review(warm) category(ปกติ) promo(ปกติ) news(warm) */
export default function Home() {
  return (
    <>
      <Topbar />
      <Nav />
      <main>
        <Hero />
        <BestSellers />
        <TrustBar />
        <Story />
        <WhyOverbear />
        <FabricDetail />
        <BuiltForBiggerDays />
        <CustomerVoice />
        <ShopByCategory />
        <PromoBanner />
        <Newsletter />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}

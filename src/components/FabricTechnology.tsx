import Image from "next/image";
import PullUpHeading from "./PullUpHeading";

/* ---------- FABRIC TECHNOLOGY ----------
   narrative band ฝั่งกลับด้าน (คู่กับ Story / IndustrialPrecision)
   .story ทาแถบ ink-2 พร้อมเส้นขอบบน-ล่าง จึงต้องมี .wrap เป็น div ชั้นในเหมือน Story.tsx
   .story__grid--rev สั่ง order:2 ให้ .story__media — บล็อกรูปจึงวางไว้ "ก่อน" ใน JSX
   แล้วปล่อยให้ CSS สลับข้างเอง (มือถือ order กลับเป็น 0 = รูปบน ข้อความล่าง) */
export default function FabricTechnology() {
  return (
    <section className="story section" id="fabric">
      <div className="wrap">
        <div className="sec-head reveal reveal--pu">
          <div>
            <span className="eyebrow">Fabric technology</span>
            <PullUpHeading
              lines={[[{ text: "เนื้อผ้า" }], [{ text: "ที่คิด" }, { text: "มาแล้ว", em: true }]]}
            />
          </div>
        </div>
        <div className="story__grid story__grid--rev">
          <div className="story__media frame fabric__media reveal">
            <Image
              src="/media/fabric/weave.jpg"
              alt="ภาพระยะใกล้ของผ้าถักเนื้อแน่น พร้อมป้ายทอ OVERBEAR INDUSTRIAL และควันลอยผ่านด้านหลัง"
              fill
              sizes="(max-width:900px) 92vw, 45vw"
            />
            <span className="frame__cap tag tag--tan">
              <span className="tag__dot" />HYBRID CORE
            </span>
          </div>
          {/* ไม่ใส่ reveal--pu: หัวข้ออยู่ใน .sec-head บล็อกนี้จึงไม่มี PullUpHeading */}
          <div className="story__body reveal">
            <p>
              แกนผ้าเป็นคอตตอนผสมโพลีเอสเตอร์อย่างละครึ่ง คอตตอนให้สัมผัสนุ่มและระบายอากาศ โพลีเอสเตอร์คุมทรงและกันหด
            </p>
            <p>
              ผลคือเสื้อหนาที่ยังใส่ไหวในอากาศร้อนชื้นแบบบ้านเรา ไม่อมเหงื่อ แห้งเร็ว และซักเครื่องได้ทุกวันโดยทรงไม่เสีย
            </p>
            <dl className="specs">
              <div className="spec">
                <dt>คอตตอน</dt>
                <dd>
                  50<span className="u">%</span>
                </dd>
              </div>
              <div className="spec">
                <dt>โพลีเอสเตอร์</dt>
                <dd>
                  50<span className="u">%</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

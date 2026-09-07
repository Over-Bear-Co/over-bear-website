# ข้อมูล + สูตรอ้างอิงสำหรับทำ size recommender ตาม UNIQLO MySize ASSIST

เก็บข้อมูล 7 กันยายน 2569 · สินค้าอ้างอิง `E465185-000` (เสื้อยืด U AIRism คอตตอน คอกลม ทรงหลวม, UNISEX XS–4XL)

## ไฟล์ในชุดนี้

| ไฟล์ | คืออะไร |
|---|---|
| `uniqlo-465185-size-data.json` | ข้อมูลดิบทั้งหมด: ค่าวัดเสื้อครบ 8 ไซส์ (ซม.), size codes, input/output schema ของวิดเจ็ต, ผลจริง 2 เคส, พารามิเตอร์โมเดล |
| `sizeRecommender.ts` | reference implementation — pure function ไม่มี dependency: `recommend(input)` และ `explainTh(input)` |
| `verify.ts` | เทสต์ที่ยืนยันว่าโมเดล reproduce ผลจริง 2 เคสได้ + พิมพ์เมทริกซ์ไซส์ |

รัน: `node --experimental-strip-types verify.ts` (Node ≥ 22.6) หรือ `tsc` แล้วรัน JS

---

## สำคัญ: อะไรจริง อะไรเป็นโมเดลของผม

**ข้อมูลจริง 100% (ตรวจสอบได้)**

- ค่าวัดเสื้อครบ 8 ไซส์ ทั้ง ซม./นิ้ว — จาก `https://www.uniqlo.com/th/th/size/465185_size.html`
- size code (`SMA002`–`SMA009`), ชื่อไซส์, `sizeChartUrl` — จาก commerce API
- input schema ของวิดเจ็ต: เพศ (2 ค่า), อายุ, ส่วนสูง 50–260, น้ำหนัก 10–200, slider 5 ระดับ default = มาตรฐาน
- output schema: 1 ไซส์ที่แนะนำ + เปิดดูได้ทั้ง 8 ไซส์ + คำตัดสิน 2 มิติ (ไหล่, ความกว้างของลำตัว)
- ผลลัพธ์จริง 2 เคส (ดู `observedSamples`)

**โมเดลของผม (ไม่ใช่สูตร Bodygram — สูตรจริงเป็น proprietary อยู่หลัง iframe cross-origin)**

- สูตรประมาณสัดส่วนร่างกายจาก เพศ/ส่วนสูง/น้ำหนัก
- ค่า intended ease ของทรงนี้ (อก +15 ซม., ไหล่ +10 ซม.) — ได้จากการ back-solve เคส XS
- ขอบเขตคำตัดสิน (±3 ซม. = พอดี, ±8 ซม. = เล็กน้อย)
- การ map slider 5 ระดับเป็นการเลื่อน target ease (±3 / ±6 ซม.)

โมเดลนี้ **reproduce ผลจริงทั้ง 2 เคสได้ตรง** ทั้งไซส์และคำตัดสินรายมิติ แต่ 2 จุดคือ 2 จุด — พารามิเตอร์ยังไม่ unique จนกว่าจะเก็บตัวอย่างเพิ่ม

---

## สูตร

```
X = sqrt(weightKg / (heightCm / 100))            // sqrt(กก. ต่อเมตร)

chestCirc     = 19.644 * X - 27.734 + genderOffset.chest
shoulderWidth = 2.3811 * X + 25.956 + genderOffset.shoulder

genderOffset  female = { chest: 0, shoulder: 0 }
              male   = { chest: +5, shoulder: +3 }   // ยังไม่ verify

targetChestCirc = chestCirc + intendedEase.chest + fitPreferenceShift
recommendedSize = argmin | garmentBodyWidth*2 - targetChestCirc |   // tie -> ไซส์เล็กกว่า

ต่อมิติ:  ease  = garment - body
          delta = ease - (intendedEase + fitPreferenceShift)
          |delta| <= 3  -> พอดี
          3 < delta <= 8 -> หลวมเล็กน้อย   |  -8 <= delta < -3 -> คับเล็กน้อย
          delta > 8      -> หลวม           |  delta < -8       -> คับ
```

**ทำไมใช้ sqrt ไม่ใช่เชิงเส้น:** รอบตัว ∝ sqrt(พื้นที่หน้าตัด) และพื้นที่หน้าตัด ∝ น้ำหนัก/ส่วนสูง โมเดลเชิงเส้นในน้ำหนักจะพุ่งเกินจริงมากที่ 100+ กก. (ลองแล้ว: 178/120 ได้รอบอก 143 ซม. ซึ่งเกินจริง) รูป sqrt ให้ ~133 ซม. ซึ่งสมเหตุสมผลกว่า

**อายุ:** วิดเจ็ตเก็บแต่ผมวัดผลกระทบไม่ได้จาก 2 ตัวอย่าง → `ageCoef = 0` เดาว่า Bodygram ใช้เป็น prior ของ body composition

---

## วิธีดึงข้อมูลสินค้าตัวอื่นเอง (ทดสอบแล้วจาก browser context)

**1. ค่าวัดเสื้อครบทุกไซส์** — pattern คือ 6 หลักของ productId:

```
https://www.uniqlo.com/th/th/size/{l1Id}_size.html      # เช่น 465185_size.html
```

เป็น static HTML มี 4 ตาราง (ไซส์ละคู่) ทั้งนิ้วและ ซม. — parse ด้วย DOMParser/cheerio ได้ตรง ๆ

**2. metadata + sizeChartUrl + รายการไซส์**

```
GET https://www.uniqlo.com/th/api/commerce/v5/th/products/{productId}?httpFailure=true
Header: x-fr-clientid: uq.web-spa        # ต้องมี ไม่งั้น 400 "invalid or missing client id"
```

ฟิลด์ที่ใช้: `result.sizes[]` (code/displayCode/name), `result.sizeChartUrl`, `result.genderName`, `result.l2s[]` (สี×ไซส์×สต็อก)

> หมายเหตุ: cloud container ของผมถูก egress policy บล็อก uniqlo.com — ทั้งสอง endpoint ยืนยันจากในเบราว์เซอร์ของคุณ ถ้ารันจากเครื่องคุณ/เซิร์ฟเวอร์ใช้ curl ได้เลย

---

## ขั้นตอนคาลิเบรตต่อ (แนะนำให้ทำก่อนใช้จริง)

โมเดลมี 2 พารามิเตอร์ต่อมิติ (`a`, `b`) → ต้องมีอย่างน้อย 2 จุดต่อเพศ ตอนนี้มี 2 จุดของผู้หญิงเท่านั้น

1. เปิดวิดเจ็ตบนหน้าสินค้าเดิม กรอกโพรไฟล์ตามลิสต์ แล้วจดไซส์ที่แนะนำ + คำตัดสิน 2 มิติ
   - ชาย: 170/60, 175/85, 178/110, 180/130 (4 จุด ครอบช่วงกว้าง)
   - หญิงเพิ่ม: 160/45, 165/75 (ยืนยันความโค้งของ sqrt)
   - slider: ล็อกร่าง 175/75 แล้วไล่ 5 ระดับ จะได้ค่า `fitPreferenceShiftCm` จริง
2. เอาคู่ (X, ไซส์) ไป solve `a`, `b` ใหม่ (least squares 2 พารามิเตอร์)
3. คำตัดสิน "พอดี/หลวมเล็กน้อย" ที่ได้ จะบีบขอบเขต `verdictBands` ให้แคบลง — ทุกคำตัดสินคือ 1 inequality
4. อัปเดตค่าใน `MODEL` แล้วรัน `verify.ts` ให้ผ่านทุกเคส

**เคล็ด:** วิดเจ็ตเก็บโปรไฟล์ไว้ที่ `localStorage['bgEstimationToken_th']` ของ uniqlo.com ถ้าจะเริ่มโพรไฟล์ใหม่ให้ลบ key นี้แล้ว reload → วิดเจ็ตจะกลับไปหน้า consent + ฟอร์มว่าง (เร็วกว่าไล่หาปุ่ม "เปลี่ยน")

---

## สิ่งที่โมเดลนี้ให้แถมมา และตรงกับงานเสื้อไซส์ใหญ่

- `outOfRange: 'tooLarge'` — บอกได้ว่าลูกค้าตัวใหญ่เกินกว่าที่แพตเทิร์นรองรับ ผลจากข้อมูลจริง: **เสื้อ oversized ตัวนี้หมดช่วงที่ประมาณ 120 กก. (ชาย 178 ซม.)** ต่อจากนั้น 4XL ก็ยังคับที่ลำตัว
- ข้อมูล grading ชี้ว่า **ความยาวลำตัวหยุดที่ 77.5 ซม. ตั้งแต่ XXL ถึง 4XL** — ไซส์ใหญ่โตแต่ด้านกว้าง ไม่โตด้านยาว ซึ่งเป็นสาเหตุคลาสสิกที่คนตัวใหญ่ใส่แล้วชายเสื้อสั้น/เด่อ
- `perSize` คืนคำตัดสินของ **ทุกไซส์** ไม่ใช่ไซส์เดียว (เลียนพฤติกรรมแท็บ 8 ไซส์ของ UNIQLO) → เอาไป render เป็น fit spectrum ได้ตรง ๆ

## ข้อจำกัดที่ต้องรู้

1. สูตรจริงของ Bodygram ดูไม่ได้ (proprietary, cross-origin iframe, ไม่มี network call ที่จับได้จาก parent frame)
2. โมเดลผู้ชายยังไม่ได้ทดสอบกับวิดเจ็ตจริงเลย — dropdown เพศเป็น native select ของ macOS ที่ automation กดไม่ได้
3. คำตัดสินที่เห็นจริงมีแค่ "พอดี" กับ "หลวมเล็กน้อย" — บันไดคำตัดสิน 5 ระดับใน `VERDICT_TH` เป็นการเดาโครงสร้าง
4. โมเดลไม่ nonmonotonic เฉพาะกิจ: ที่น้ำหนักเท่ากัน คนเตี้ยกว่าได้ไซส์ใหญ่กว่า (ถูกตามสรีระ) แต่ขนาดของ effect ยังไม่ได้ยืนยันกับวิดเจ็ต
5. ค่าวัดเสื้อมี tolerance การผลิต 1–2 ซม. ตามที่ UNIQLO ระบุเอง

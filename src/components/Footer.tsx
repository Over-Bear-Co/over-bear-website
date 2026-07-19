const Paw = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <g className="paw">
      <ellipse cx="24" cy="30" rx="12" ry="10" />
      <circle cx="10" cy="16" r="5" />
      <circle cx="38" cy="16" r="5" />
      <circle cx="17" cy="9" r="4.5" />
      <circle cx="31" cy="9" r="4.5" />
    </g>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="brand" href="#top">
              <Paw />
              OVERBEAR
            </a>
            <p>เสื้อ oversize สีเข้มสำหรับหุ่นหมี ตัดจริง ใส่จริง ดูเท่จริง · Bangkok, TH</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="#drop">The Drop</a></li>
              <li><a href="#drop">เสื้อยืด</a></li>
              <li><a href="#size">ตารางไซซ์</a></li>
              <li><a href="#den">ของลิมิเต็ด</a></li>
            </ul>
          </div>
          <div>
            <h4>ช่วยเหลือ</h4>
            <ul>
              <li><a href="#size">วิธีเลือกไซซ์</a></li>
              <li><a href="#top">การจัดส่ง</a></li>
              <li><a href="#top">คืน/เปลี่ยนสินค้า</a></li>
              <li><a href="#den">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div>
            <h4>ติดตาม</h4>
            <ul>
              <li><a href="#top">Instagram</a></li>
              <li><a href="#top">TikTok</a></li>
              <li><a href="#top">LINE OA</a></li>
              <li><a href="#top">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 OVERBEAR — All rights reserved</span>
          <div className="pay">
            <span>VISA</span>
            <span>MASTER</span>
            <span>PROMPTPAY</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

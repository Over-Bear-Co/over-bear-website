"use client";

import { useEffect, type RefObject } from "react";
import { Engine, hasWebGL, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { MARK_PATH, MARK_TRANSFORM } from "@/lib/brandMark";

/* โลโก้ OVERBEAR แบบ extrude 3D ในช่อง .story__media
   ─ ไม่มี rAF loop ของตัวเอง: ลงทะเบียนเป็น EngineItem ตัวหนึ่งใน loop เดียวของทั้งหน้า
   ─ three ถูก import แบบ dynamic *หลัง* ผ่าน gate แล้วเท่านั้น คนที่เปิด reduce-motion หรือไม่มี WebGL
     จึงไม่ต้องโหลด bundle ก้อนนี้เลย (ถ้าใช้ next/dynamic จะโหลดตั้งแต่ component render ก่อนเช็ค gate)
   ─ ของเดิมใน .ph (หมี SVG + ป้ายกำกับ) ยังอยู่ครบ เป็น fallback ของ SSR / no-JS / init ล้มเหลว */
export default function StoryScene({
  mediaRef,
  storyRef,
}: {
  mediaRef: RefObject<HTMLDivElement | null>;
  storyRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const media = mediaRef.current;
    const story = storyRef.current;
    if (!media || !story) return;
    if (prefersReducedMotion() || !hasWebGL()) return;

    const coarse = !isFinePointer();
    let cancelled = false;
    let teardown = () => {};

    /* อย่าเพิ่งโหลด three ตอน mount — คนที่ไม่เคยเลื่อนลงมาถึง Story จะเสีย ~735KB ฟรี ๆ
       รอจนใกล้เข้าจอค่อยยิง import (rootMargin กว้างพอให้โหลดเสร็จก่อนเห็นจริง) */
    const loadIO = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        loadIO.disconnect();
        Promise.all([import("three"), import("three/addons/loaders/SVGLoader.js")])
          .then(([THREE, { SVGLoader }]) => {
            if (cancelled) return; // effect ถูก cleanup ไปแล้ว — ห้ามสร้างอะไรทั้งนั้น ไม่งั้นได้ zombie ที่ remove ไม่ได้
            teardown = boot(THREE, SVGLoader);
          })
          .catch(() => {});
      },
      { rootMargin: "150% 0px" }
    );
    loadIO.observe(story);

    function boot(THREE: typeof import("three"), SVGLoader: typeof import("three/addons/loaders/SVGLoader.js").SVGLoader) {
      const mediaEl = media as HTMLDivElement;
      const storyEl = story as HTMLElement;

      /* SVGLoader.parse ต้องการ DOM จริง (ใช้ DOMParser ข้างใน) จึงต้องห่อ d เป็นเอกสาร SVG ก่อน
         scale(1,-1) มาก่อน translate ในสายตา SVG = translate ก่อนแล้วค่อยมิเรอร์ → พลิก Y ให้เป็นระบบของ three
         ตั้งแต่ตอนสร้าง shape (ห้าม geometry.scale(1,-1,1) ทีหลัง — normal จะกลับด้านจนมืดทั้งก้อน) */
      const markup =
        `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000000" fill-rule="nonzero" ` +
        `transform="scale(1,-1) ${MARK_TRANSFORM}" d="${MARK_PATH}"/></svg>`;
      const shapes = new SVGLoader().parse(markup).paths.flatMap((p) => p.toShapes());
      if (!shapes.length) return () => {};

      // ค่า bevel/depth ต้องสเกลตาม path ที่กว้าง ~820 unit — ดีฟอลต์ของ three ทำมาเพื่อรูปขนาด ~1 unit
      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: 88, // ~11% ของความกว้าง path — หนาพอให้ผนังข้างอ่านออกที่มุม 3/4
        bevelEnabled: true,
        bevelThickness: 7,
        bevelSize: 5,
        bevelSegments: coarse ? 2 : 3,
        curveSegments: coarse ? 14 : 26,
        steps: 1,
      });
      geometry.center();
      geometry.computeBoundingBox();
      const size = geometry.boundingBox!.getSize(new THREE.Vector3());
      const fitScale = 2 / Math.max(size.x, size.y);

      // ExtrudeGeometry แยก group ให้อยู่แล้ว: ฝาหน้า/หลัง = index 0, ผนังข้าง = index 1 → ขอบเข้มได้ฟรี
      const capMat = new THREE.MeshStandardMaterial({ color: 0xc99c84, roughness: 0.62, metalness: 0 });
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x7a503a, roughness: 0.78, metalness: 0 });
      const mesh = new THREE.Mesh(geometry, [capMat, sideMat]);
      mesh.scale.setScalar(fitScale);

      const scene = new THREE.Scene();
      scene.add(mesh);
      scene.add(new THREE.AmbientLight(0xf6f2ea, 0.5));
      const key = new THREE.DirectionalLight(0xfff6e8, 2.6);
      key.position.set(2.5, 3.5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xe8ddce, 1.1); // ขอบสว่างฝั่งตรงข้าม ให้ทรงไม่จมพื้น navy
      rim.position.set(-3, 1.2, -2.5);
      scene.add(rim);

      const renderer = new THREE.WebGLRenderer({ antialias: !coarse, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
      const canvas = renderer.domElement;
      canvas.className = "story__gl";
      canvas.setAttribute("aria-hidden", "true");

      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const halfW = (size.x * fitScale) / 2;
      const halfH = (size.y * fitScale) / 2;

      let ready = false;
      const resize = () => {
        const w = Math.round(mediaEl.clientWidth);
        const h = Math.round(mediaEl.clientHeight);
        if (!w || !h) return false; // .story__media มี aspect-ratio + .reveal — layout มาช้าได้ อย่าเพิ่งเรนเดอร์
        renderer.setSize(w, h, false); // false = ปล่อยให้ CSS คุมขนาดที่แสดง
        camera.aspect = w / h;
        const t = Math.tan((camera.fov * Math.PI) / 360);
        camera.position.z = Math.max(halfH / t, halfW / t / camera.aspect) * 1.32; // พอดีทั้งแนวตั้งและแนวนอน
        camera.updateProjectionMatrix();
        return true;
      };

      const ptr = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      let dirty = true;
      let posed = false;

      const item = {
        active: false,
        step() {
          // เมนูมือถือบังเต็มจอแบบทึบ แต่ IntersectionObserver ไม่รู้เรื่องการถูกบัง — ต้องเช็คเองเป็นบรรทัดแรก
          if (document.querySelector(".mobile-menu.open")) return false;
          try {
            if (!ready) {
              if (!resize()) return false;
              mediaEl.append(canvas);
              mediaEl.classList.add("gl-on"); // ซ่อน fallback ต่อเมื่อเรนเดอร์ได้จริงแล้วเท่านั้น
              ready = true;
            }
            const r = storyEl.getBoundingClientRect();
            const vh = innerHeight;
            // ใช้เส้นโค้งเดียวกับ ink reveal ใน Story.tsx เพื่อให้ 3D กับตัวหนังสือขยับพร้อมกัน
            const p = Math.max(0, Math.min(1, (0.8 * vh - r.top) / (0.6 * vh + r.height)));
            // หมุนรอบแกน yaw ฐาน -22° เสมอ ไม่แกว่งผ่าน 0 — จังหวะที่อยู่กลางจอคือจังหวะที่ต้องดูเป็น 3D ที่สุด
            const tx = -0.1 + p * 0.2 + ptr.y * 0.2;
            const ty = -0.38 + (p - 0.5) * 0.44 + ptr.x * 0.34;

            if (!posed) {
              // เฟรมแรกต้องอยู่ในท่าเลย ไม่งั้นจะเห็นโลโก้แบนแล้วหมุนเข้าที่ทุกครั้งที่เลื่อนมาถึง
              cur.x = tx;
              cur.y = ty;
              posed = true;
            }
            let moving = false;
            const dx = tx - cur.x;
            const dy = ty - cur.y;
            // snap เมื่อเข้าใกล้ ไม่งั้น lerp เทียบ !== จะไม่มีวันเท่ากัน = loop ทั้งหน้าไม่มีวันหลับ
            if (Math.abs(dx) < 4e-4) cur.x = tx;
            else {
              cur.x += dx * 0.12;
              moving = true;
            }
            if (Math.abs(dy) < 4e-4) cur.y = ty;
            else {
              cur.y += dy * 0.12;
              moving = true;
            }
            if (!moving && !dirty) return false;

            mesh.rotation.set(cur.x, cur.y, 0);
            renderer.render(scene, camera);
            dirty = false;
            return moving;
          } catch {
            // throw ที่หลุดออกจาก step() จะทำให้ Engine ค้าง running=true ถาวร → motion ตายทั้งหน้า
            this.active = false;
            return false;
          }
        },
      };

      Engine.add(item);

      const io = new IntersectionObserver(
        (es) => {
          item.active = es[0].isIntersecting;
          Engine.wake();
        },
        { rootMargin: "20% 0px" }
      );
      io.observe(storyEl);

      /* Engine ต่อ listener ไว้แค่ scroll ตัวเดียว อะไรที่ทำให้ภาพเก่าต้องปลุกเองทั้งหมด */
      const ro = new ResizeObserver(() => {
        if (resize()) {
          dirty = true;
          Engine.wake();
        }
      });
      ro.observe(mediaEl);

      const onFonts = () => {
        resize();
        dirty = true;
        Engine.wake();
      };
      document.fonts?.ready.then(onFonts);

      const onMove = (e: PointerEvent) => {
        const r = mediaEl.getBoundingClientRect();
        ptr.x = (e.clientX - r.left) / r.width - 0.5;
        ptr.y = (e.clientY - r.top) / r.height - 0.5;
        Engine.wake();
      };
      const onLeave = () => {
        ptr.x = 0;
        ptr.y = 0;
        Engine.wake();
      };
      if (!coarse) {
        mediaEl.addEventListener("pointermove", onMove, { passive: true });
        mediaEl.addEventListener("pointerleave", onLeave);
      }

      const onLost = (e: Event) => {
        e.preventDefault();
        item.active = false;
      };
      const onRestored = () => {
        dirty = true;
        item.active = true;
        Engine.wake();
      };
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", onRestored);

      return () => {
        Engine.remove(item); // ถอดออกจาก loop ก่อนเสมอ กัน step() วิ่งกลางการรื้อ
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        mediaEl.removeEventListener("pointermove", onMove);
        mediaEl.removeEventListener("pointerleave", onLeave);
        geometry.dispose();
        capMat.dispose();
        sideMat.dispose();
        renderer.dispose();
        renderer.forceContextLoss(); // ไม่ทำ = context ค้างจนชน cap ~8-16 ตัวตอน hot reload แล้วจอดำ
        canvas.remove();
        mediaEl.classList.remove("gl-on");
      };
    }

    return () => {
      cancelled = true;
      loadIO.disconnect();
      teardown();
    };
  }, [mediaRef, storyRef]);

  return null;
}

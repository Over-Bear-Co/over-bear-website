/* OVERBEAR brand mark (bear face + mountain) — single-path icon themed via CSS `fill`.
   Geometry lives in @/lib/brandMark so the 2D mark and the extruded 3D one can never drift apart.
   Keep the tight 902x548 viewBox, NOT the padded -margin variant: the CSS gap in .brand already
   supplies the clear space, and the padded frame would shrink the ink ~8%.
   Decorative here; the adjacent "OVERBEAR" text carries the name, so no role/aria-label/title. */
import { MARK_PATH, MARK_TRANSFORM, MARK_VIEWBOX } from "@/lib/brandMark";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} fill="currentColor" aria-hidden="true">
      <g transform={MARK_TRANSFORM}>
        <path d={MARK_PATH} />
      </g>
    </svg>
  );
}

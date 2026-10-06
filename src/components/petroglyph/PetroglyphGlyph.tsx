import { GLYPH_PATHS, type GlyphKey } from "@/src/data/petroglyph-types";

/**
 * 바위를 쪼아 새긴 듯한 질감의 암각화 그림입니다. filterId는 페이지 안에서 고유해야 합니다.
 * label을 비우면 장식용 그림으로 보고 보조기술에서 숨깁니다.
 */
export default function PetroglyphGlyph({ glyph, label, filterId, className = "", strokeWidth = 3.2 }: { glyph: GlyphKey; label: string; filterId: string; className?: string; strokeWidth?: number }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg viewBox="0 0 100 100" {...a11y} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feDisplacementMap in="SourceGraphic" scale={2.6} />
        </filter>
      </defs>
      <path d={GLYPH_PATHS[glyph]} filter={`url(#${filterId})`} />
    </svg>
  );
}

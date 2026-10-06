import { GLYPH_PATHS, type GlyphKey } from "@/src/data/petroglyph-types";

/** 바위를 쪼아 새긴 듯한 질감의 암각화 그림입니다. filterId는 페이지 안에서 고유해야 합니다. */
export default function PetroglyphGlyph({ glyph, label, filterId, className = "" }: { glyph: GlyphKey; label: string; filterId: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} className={className} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
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

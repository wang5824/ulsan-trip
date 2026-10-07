"use client";

import { useState } from "react";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import type { GlyphKey } from "../../data/petroglyph-types";
import type { PlaceStory } from "../../data/place-stories";

/** 확인된 사진을 사이트에서 직접 제공합니다. 방문 시 외부 사진 API를 호출하지 않습니다. */
export default function PlacePhoto({ photo, alt, glyph, glyphId }: {
  photo?: PlaceStory["photo"];
  alt: string;
  glyph: GlyphKey;
  glyphId: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!photo || failedUrl === photo.url) {
    return (
      <div className="grain-dark relative flex aspect-[16/9] flex-col items-center justify-center gap-2 overflow-hidden rounded-t-[1.5rem] bg-rock text-bone/70">
        <PetroglyphGlyph glyph={glyph} label="" filterId={glyphId} className="h-[55%] w-auto" />
        <p className="text-xs">{photo ? "사진을 불러오지 못했어요" : "등록된 장소 사진이 없어요"}</p>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-t-[1.5rem] bg-rock">
      {/* 변경금지 사진의 원본 파일과 비율을 유지하기 위해 최적화 없이 제공합니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photo.url}
        src={photo.url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(photo.url)}
        className={`aspect-[16/9] w-full ${photo.noAlter ? "object-contain" : "object-cover"}`}
      />
      <figcaption className="px-3 py-2 text-[10px] leading-4 text-white/85">
        사진: <a href={photo.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">{photo.credit}</a> · {photo.license}
      </figcaption>
    </figure>
  );
}

"use client";

import { useEffect, useState } from "react";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import type { GlyphKey } from "../../data/petroglyph-types";
import type { PlacePhotoData } from "../../types/place-photo";
import { loadPlacePhotos } from "../../lib/place-photo-client";
import { focusRing } from "../ui";

/** 로컬 사진을 우선 사용하고, 누락·실패 시 서버에서 확인한 TourAPI 사진을 표시합니다. */
export default function PlacePhoto({ placeId, photo: localPhoto, alt, glyph, glyphId }: {
  placeId: string;
  photo?: PlacePhotoData;
  alt: string;
  glyph: GlyphKey;
  glyphId: string;
}) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [remote, setRemote] = useState<{ photo?: PlacePhotoData; failed: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const needsRemote = !localPhoto || failedUrls.includes(localPhoto.url);
  const photo = [localPhoto, remote?.photo].find(item => item && !failedUrls.includes(item.url));
  const loading = needsRemote && remote === null;
  const failed = remote?.failed || (!!remote?.photo && failedUrls.includes(remote.photo.url));

  useEffect(() => {
    if (!needsRemote) return;
    let active = true;
    loadPlacePhotos().then(photos => {
      if (active) setRemote({ photo: photos[placeId], failed: false });
    }).catch(() => {
      if (active) setRemote({ failed: true });
    });
    return () => { active = false; };
  }, [placeId, needsRemote, attempt]);

  if (!photo) {
    return (
      <div aria-live="polite" aria-busy={loading} className="grain-dark relative flex aspect-[16/9] flex-col items-center justify-center gap-2 overflow-hidden rounded-t-[1.5rem] bg-rock text-bone/70">
        <PetroglyphGlyph glyph={glyph} label="" filterId={glyphId} className="h-[55%] w-auto" />
        <p className="text-xs">{loading ? "장소 사진을 불러오는 중…" : failed ? "사진을 불러오지 못했어요" : "등록된 장소 사진이 없어요"}</p>
        {failed && <button type="button" onClick={() => {
          setRemote(null);
          setFailedUrls(localPhoto ? [localPhoto.url] : []);
          setAttempt(current => current + 1);
        }} className={`min-h-9 rounded-full border border-bone/30 px-3 text-xs ${focusRing}`}>사진 다시 불러오기</button>}
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
        onError={() => setFailedUrls(current => [...current, photo.url])}
        className={`aspect-[16/9] w-full ${photo.noAlter ? "object-contain" : "object-cover"}`}
      />
      <figcaption className="px-3 py-1 text-right text-[9px] leading-3 text-white/50 transition-colors hover:text-white/80 focus-within:text-white/80">
        사진: <a href={photo.page} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline focus-visible:underline">{photo.credit}</a> · {photo.license}
      </figcaption>
    </figure>
  );
}

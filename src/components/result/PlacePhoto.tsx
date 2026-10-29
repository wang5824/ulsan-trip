"use client";

import { useEffect, useState } from "react";
import type { PlacePhotoData } from "../../types/place-photo";
import { loadPlacePhotos } from "../../lib/place-photo-client";

/** 로컬 사진을 우선 사용하고, 누락·실패 시 서버에서 확인한 TourAPI 사진을 표시합니다. */
export default function PlacePhoto({ placeId, photo: localPhoto, alt }: {
  placeId: string;
  photo?: PlacePhotoData;
  alt: string;
}) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [remotePhoto, setRemotePhoto] = useState<PlacePhotoData>();
  const needsRemote = !localPhoto || failedUrls.includes(localPhoto.url);
  const photo = [localPhoto, remotePhoto].find(item => item && !failedUrls.includes(item.url));

  useEffect(() => {
    if (!needsRemote) return;
    let active = true;
    loadPlacePhotos().then(photos => {
      if (active) setRemotePhoto(photos[placeId]);
    }).catch(() => {
      // 사진 API가 실패해도 장소 정보는 그대로 보여주고 사진 영역만 생략합니다.
    });
    return () => { active = false; };
  }, [placeId, needsRemote]);

  if (!photo) return null;

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

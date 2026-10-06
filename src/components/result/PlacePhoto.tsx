"use client";

import { useEffect, useState } from "react";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import type { GlyphKey } from "../../data/petroglyph-types";

interface Photo {
  src: string;
  page: string;
  credit: string;
  license: string;
  /** 변경금지 조건이면 자르지 않고 원본 비율로 보여줍니다. */
  noAlter: boolean;
}

const cache = new Map<string, Promise<Photo | null>>();

function stripHtml(value: string | undefined): string {
  if (!value) return "";
  const doc = new DOMParser().parseFromString(value, "text/html");
  return (doc.body.textContent ?? "").trim();
}

/** 서버 경로(/api/place-photo)를 거쳐 한국관광공사 TourAPI 대표 사진(공공누리 제1·3유형)을 찾습니다. */
async function findTourPhoto(placeId: string): Promise<Photo | null> {
  const data = await fetch(`/api/place-photo?id=${encodeURIComponent(placeId)}`).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const photo = data?.photo as { url: string; page: string; title: string; license: string; noAlter: boolean } | null | undefined;
  if (!photo?.url) return null;
  return { src: photo.url, page: photo.page, credit: `한국관광공사 TourAPI (${photo.title})`, license: photo.license, noAlter: photo.noAlter };
}

/** 위키백과 문서 대표 사진을 찾고, 위키미디어 공용의 자유 이용 사진일 때만 돌려줍니다. */
async function findWikiPhoto(titles: readonly string[]): Promise<Photo | null> {
  for (const entry of titles) {
    const [lang, title] = entry.split(":", 2) as [string, string];
    const api = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(title)}`;
    const page = await fetch(api).then(r => r.json()).catch(() => null);
    const pages = page?.query?.pages ? Object.values(page.query.pages) as { pageimage?: string }[] : [];
    const file = pages.find(item => item.pageimage)?.pageimage;
    if (!file) continue;
    // 공용 저장소에 있는 파일만 사용합니다(위키백과 로컬의 비자유 이미지는 공용에 없어 여기서 걸러집니다).
    const info = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=960&titles=${encodeURIComponent(`File:${file}`)}`)
      .then(r => r.json()).catch(() => null);
    const imagePages = info?.query?.pages ? Object.values(info.query.pages) as { missing?: string; imageinfo?: { thumburl?: string; url: string; descriptionurl: string; extmetadata?: Record<string, { value: string }> }[] }[] : [];
    const image = imagePages[0]?.imageinfo?.[0];
    if (!image || imagePages[0].missing !== undefined) continue;
    const meta = image.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value);
    if (meta.NonFree?.value === "true" || !/CC|Public domain|PD|퍼블릭/i.test(license)) continue;
    return { src: image.thumburl ?? image.url, page: image.descriptionurl, credit: `${stripHtml(meta.Artist?.value) || "작성자 미상"} · Wikimedia Commons`, license, noAlter: false };
  }
  return null;
}

async function resolvePhoto(placeId: string, titles: readonly string[] | undefined): Promise<Photo | null> {
  return (await findTourPhoto(placeId)) ?? (titles?.length ? await findWikiPhoto(titles) : null);
}

/**
 * 장소 사진. 순서: 조사로 확인한 이용 허락 사진 → 한국관광공사 TourAPI 사진 → 위키미디어 자유 이용 사진.
 * 모두 없으면 암각화 그림으로 대신합니다. 모든 사진에 출처와 라이선스를 표시합니다.
 */
export default function PlacePhoto({ placeId, titles, licensed, alt, glyph, glyphId }: {
  placeId: string;
  titles?: readonly string[];
  licensed?: { url: string; page: string; credit: string; license: string; noAlter: boolean };
  alt: string; glyph: GlyphKey; glyphId: string;
}) {
  const fixed: Photo | null = licensed ? { src: licensed.url, page: licensed.page, credit: licensed.credit, license: licensed.license, noAlter: licensed.noAlter } : null;
  const [found, setFound] = useState<Photo | null | undefined>(undefined);
  const [broken, setBroken] = useState<string | null>(null);
  const titleKey = titles?.join("|") ?? "";

  useEffect(() => {
    if (fixed && broken !== fixed.src) return;
    let alive = true;
    const key = `${placeId}|${titleKey}`;
    if (!cache.has(key)) cache.set(key, resolvePhoto(placeId, titles).catch(() => null));
    cache.get(key)!.then(result => { if (alive) setFound(result); });
    return () => { alive = false; };
    // fixed는 licensed에서 매번 새로 만들어지므로 원본 값 기준으로 비교합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, titleKey, licensed?.url, broken]);

  const photo = fixed && broken !== fixed.src ? fixed : found && broken !== found.src ? found : null;

  if (!photo) {
    return (
      <div className="grain-dark relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-t-[1.5rem] bg-rock text-bone/70">
        <PetroglyphGlyph glyph={glyph} label="" filterId={glyphId} className={`h-[70%] w-auto ${found === undefined && !fixed ? "animate-pulse" : ""}`} />
      </div>
    );
  }
  return (
    <figure className="relative overflow-hidden rounded-t-[1.5rem] bg-rock">
      {/* 외부 이미지는 최적화 서버를 거치지 않고 그대로 불러옵니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(photo.src)}
        className={`aspect-[16/9] w-full ${photo.noAlter ? "object-contain" : "object-cover"}`}
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-[10px] leading-4 text-white/85">
        사진: <a href={photo.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">{photo.credit}</a> · {photo.license}
      </figcaption>
    </figure>
  );
}

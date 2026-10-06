"use client";

import { useEffect, useState } from "react";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import type { GlyphKey } from "../../data/petroglyph-types";

interface Photo {
  src: string;
  page: string;
  author: string;
  license: string;
}

const cache = new Map<string, Promise<Photo | null>>();

function stripHtml(value: string | undefined): string {
  if (!value) return "";
  const doc = new DOMParser().parseFromString(value, "text/html");
  return (doc.body.textContent ?? "").trim();
}

/** 위키백과 문서 대표 사진을 찾고, 위키미디어 공용의 자유 이용 사진일 때만 돌려줍니다. */
async function findPhoto(titles: readonly string[]): Promise<Photo | null> {
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
    return { src: image.thumburl ?? image.url, page: image.descriptionurl, author: stripHtml(meta.Artist?.value) || "작성자 미상", license };
  }
  return null;
}

/** 장소 사진. 조사된 위키백과 문서에 자유 이용 사진이 있을 때만 보여주고, 없으면 암각화 그림으로 대신합니다. */
export default function PlacePhoto({ titles, licensed, alt, glyph, glyphId }: {
  titles?: readonly string[];
  /** 조사로 확인한 이용 허락 사진. 있으면 위키백과보다 먼저 씁니다. */
  licensed?: { url: string; page: string; credit: string; license: string; noAlter: boolean };
  alt: string; glyph: GlyphKey; glyphId: string;
}) {
  const key = titles?.join("|") ?? "";
  const [photo, setPhoto] = useState<Photo | null | undefined>(titles?.length && !licensed ? undefined : null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (licensed || !titles?.length) return;
    let alive = true;
    if (!cache.has(key)) cache.set(key, findPhoto(titles).catch(() => null));
    cache.get(key)!.then(result => { if (alive) setPhoto(result); });
    return () => { alive = false; };
  }, [key, titles, licensed]);

  if (licensed && !broken) {
    return (
      <figure className="relative overflow-hidden rounded-t-[1.5rem] bg-rock">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={licensed.url}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          // 변경금지 조건 사진은 자르지 않고 원본 비율 그대로 보여줍니다.
          className={`aspect-[16/9] w-full ${licensed.noAlter ? "object-contain" : "object-cover"}`}
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-[10px] leading-4 text-white/85">
          사진: <a href={licensed.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">{licensed.credit}</a> · {licensed.license}
        </figcaption>
      </figure>
    );
  }

  if (!photo) {
    return (
      <div className="grain-dark relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-t-[1.5rem] bg-rock text-bone/70">
        <PetroglyphGlyph glyph={glyph} label="" filterId={glyphId} className={`h-[70%] w-auto ${photo === undefined ? "animate-pulse" : ""}`} />
      </div>
    );
  }
  return (
    <figure className="relative overflow-hidden rounded-t-[1.5rem] bg-rock">
      {/* 외부 위키미디어 이미지는 최적화 서버를 거치지 않고 그대로 불러옵니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={alt} loading="lazy" className="aspect-[16/9] w-full object-cover" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-[10px] leading-4 text-white/85">
        사진: <a href={photo.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">{photo.author}</a> · {photo.license} · Wikimedia Commons
      </figcaption>
    </figure>
  );
}

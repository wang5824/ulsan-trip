"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "../lib/kakao-sdk";
import type { Place, PlaceCategory } from "../types/travel";

const categoryLabels: Record<PlaceCategory, string> = {
  nature: "자연", sea: "바다", culture: "문화", experience: "체험",
  korean: "한식", seafood: "해산물", cafe: "카페",
};

/** 전달된 배열 순서를 그대로 지도 번호로 사용합니다. 경로 계산은 하지 않습니다. */
export default function KakaoMap({ places }: { places: readonly Place[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<Place | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || places.length === 0) return;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    function clearMap() {
      cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
      container?.replaceChildren();
    }

    async function initialize() {
      // 초기 렌더 및 props 변경 시 비동기 작업과 상태 변경을 동일한 생명주기로 처리합니다.
      await Promise.resolve();
      if (cancelled || !container) return;
      setStatus("loading");
      setSelected(null);
      try {
        if (places.some((place) => !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)
          || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180)) {
          throw new Error("Invalid coordinates");
        }
        const maps = await loadKakaoMaps();
        if (cancelled) return;
        const first = places[0];
        const map = new maps.Map(container, { center: new maps.LatLng(first.latitude, first.longitude), level: 5 });
        const bounds = new maps.LatLngBounds();
        const positions = places.map((place) => new maps.LatLng(place.latitude, place.longitude));
        const info = new maps.InfoWindow({ removable: true });
        cleanups.push(() => info.close());

        // 추천 배열의 좌표를 직선으로 연결할 뿐 실제 도로나 최적 경로를 계산하지 않습니다.
        if (positions.length >= 2) {
          const line = new maps.Polyline({
            map,
            path: positions,
            strokeWeight: 3,
            strokeColor: "#0f766e",
            strokeOpacity: 0.8,
            strokeStyle: "dash",
          });
          cleanups.push(() => line.setMap(null));
        }

        places.forEach((place, index) => {
          const position = positions[index];
          bounds.extend(position);
          // SVG에는 배열 번호만 삽입하며 장소명 등 외부 문자열은 삽입하지 않습니다.
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="46" viewBox="0 0 40 46"><path d="M20 45 12 34a18 18 0 1 1 16 0Z" fill="#0f766e" stroke="white" stroke-width="2"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="17" font-weight="bold">${index + 1}</text></svg>`;
          const image = new maps.MarkerImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, new maps.Size(40, 46), { offset: new maps.Point(20, 46) });
          const marker = new maps.Marker({ map, position, image, title: `${index + 1}. ${place.name}` });
          cleanups.push(() => marker.setMap(null));
          const onClick = () => {
            if (cancelled) return;
            const content = document.createElement("div");
            content.style.cssText = "padding:12px 28px 12px 12px;max-width:240px;color:#0f172a;font-size:14px;white-space:normal;";
            const title = document.createElement("strong");
            title.textContent = `${index + 1}. ${place.name}`;
            const category = document.createElement("p");
            category.style.marginTop = "4px";
            category.textContent = categoryLabels[place.category];
            content.append(title, category);
            info.setContent(content);
            info.open(map, marker);
            setSelected(place);
          };
          maps.event.addListener(marker, "click", onClick);
          cleanups.push(() => maps.event.removeListener(marker, "click", onClick));
        });

        const fit = () => {
          if (cancelled) return;
          map.relayout();
          map.setBounds(bounds, 64, 48, 48, 48);
        };
        fit();
        // PC/모바일 전환과 컨테이너 크기 변경 시 지도와 bounds를 다시 맞춥니다.
        const observer = new ResizeObserver(fit);
        observer.observe(container);
        cleanups.push(() => observer.disconnect());
        setStatus("ready");
      } catch {
        if (cancelled) return;
        clearMap();
        // SDK 오류에는 요청 URL이 포함될 수 있어 원본 오류와 키는 출력하지 않습니다.
        setStatus("error");
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      clearMap();
      // 공유 SDK는 다른 지도와 다음 마운트를 위해 유지합니다.
    };
  }, [places, attempt]);

  return (
    <div>
      <div className="relative isolate overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/50">
        <div ref={containerRef} aria-label="추천 장소 지도" aria-busy={places.length > 0 && status === "loading"} className="h-80 w-full sm:h-96 lg:h-[28rem]" />
        {places.length === 0 ? (
          <p className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm text-slate-600">지도에 표시할 추천 장소가 없습니다.</p>
        ) : status !== "ready" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-teal-50 p-6 text-center">
            {status === "loading" ? <p role="status" className="rounded-full border border-teal-100 bg-white px-5 py-3 text-sm font-medium text-teal-800">지도를 불러오는 중입니다…</p> : (
              <>
                <p role="alert" className="font-semibold text-slate-800">지도를 불러오지 못했습니다.</p>
                <p className="mt-2 text-sm text-slate-600">잠시 후 다시 시도해주세요. 추천 일정은 계속 확인할 수 있어요.</p>
                <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-5 min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">다시 시도</button>
              </>
            )}
          </div>
        )}
      </div>
      <p aria-live="polite" className="mt-4 text-sm leading-6 text-slate-600">
        {selected && status === "ready" ? `${selected.name} · ${categoryLabels[selected.category]}` : "번호 마커를 누르면 장소 이름과 카테고리를 볼 수 있어요."}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        추천 방문 순서를 직선으로 표시한 것으로 실제 이동 경로와 다를 수 있습니다.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { placeCatalog } from "../../data/places";
import { hasCoordinates } from "../../lib/place-coordinates";
import { DISTRICT_LABELS, type TravelRegion } from "../../types/travel";
import { focusRing } from "../ui";

const places = [...placeCatalog.attractions, ...placeCatalog.restaurants, ...placeCatalog.cafes];
const typeLabels = { attraction: "관광지", restaurant: "음식점", cafe: "카페" };

export default function RequiredPlacesPicker({ selectedIds, region, onChange, onExpandRegion }: {
  selectedIds: string[];
  region: TravelRegion | undefined;
  onChange: (ids: string[]) => void;
  onExpandRegion: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.replace(/\s/g, "").toLowerCase();
  const results = places.filter(place => !normalized || `${place.name}${place.address ?? ""}`.replace(/\s/g, "").toLowerCase().includes(normalized))
    .sort((a, b) => b.popularityScore - a.popularityScore || a.name.localeCompare(b.name, "ko"));
  const selected = selectedIds.map(id => places.find(place => place.id === id)).filter(place => place !== undefined);
  const outside = selected.some(place => region && region !== "all" && place.district !== region);

  return <div className="space-y-5">
    <div aria-live="polite" className="rounded-2xl bg-paper p-4">
      <p className="text-sm font-semibold text-ink-2">선택한 장소 <span className="tabular-nums text-sea">{selectedIds.length}/2</span> · 선택한 순서대로 먼저 방문해요</p>
      {selected.length > 0 ? <ul className="mt-3 flex flex-wrap gap-2">
        {selected.map((place, index) => <li key={place.id} className="flex items-center gap-1 rounded-full bg-sea py-1 pl-3 pr-1 text-sm text-white">
          <span className="font-semibold">{index + 1}. {place.name}</span>
          <button type="button" onClick={() => onChange(selectedIds.filter(id => id !== place.id))} aria-label={`${place.name} 선택 해제`} className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 ${focusRing}`}>×</button>
        </li>)}
      </ul> : <p className="mt-1 text-sm text-ink-3">선택하지 않고 넘어가도 괜찮아요.</p>}
    </div>
    {outside && <div role="alert" className="rounded-2xl bg-ochre-tint/70 p-4 text-sm leading-6 text-ink">
      <p>선택한 여행 지역 밖이거나 지역을 확인할 수 없는 장소가 있어요. 지역을 넓히거나 해당 장소를 해제해주세요.</p>
      <button type="button" onClick={onExpandRegion} className={`mt-2 min-h-10 rounded-full border border-ochre/40 bg-card px-4 font-semibold ${focusRing}`}>여행 지역을 울산 전체로 변경</button>
    </div>}
    <div>
      <label htmlFor="place-search" className="mb-2 block text-sm font-semibold text-ink-2">장소 이름 또는 주소 검색</label>
      <input id="place-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: 대왕암공원, 간절곶" className="min-h-12 w-full rounded-2xl border border-line bg-paper px-4 placeholder:text-ink-3/70 focus:border-sea focus:outline-2 focus:outline-sea" />
      <p className="mt-2 text-xs text-ink-3">위치 정보가 있는 장소만 선택할 수 있어요.</p>
    </div>
    <fieldset aria-label="필수 방문 장소 선택" className="max-h-80 space-y-2 overflow-y-auto p-1">
      {results.map(place => {
        const checked = selectedIds.includes(place.id);
        const unavailable = !hasCoordinates(place) || place.recommendedDuration <= 0;
        const disabled = unavailable || (!checked && selectedIds.length >= 2);
        return <label key={place.id} className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ochre ${checked ? "border-sea bg-sea-tint/70" : "border-line bg-card"} ${disabled ? "opacity-45" : "cursor-pointer hover:border-ink-3"}`}>
          <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onChange(checked ? selectedIds.filter(id => id !== place.id) : [...selectedIds, place.id])} className="mt-0.5 h-5 w-5 shrink-0 accent-sea" />
          <span className="text-sm"><span className="font-semibold">{place.name}</span><span className="mt-1 block text-xs text-ink-3">{typeLabels[place.type]} · {place.district ? DISTRICT_LABELS[place.district] : "지역 미확인"}{unavailable ? " · 위치·체류 정보 미확인으로 선택 불가" : ""}</span></span>
        </label>;
      })}
      {!results.length && <p role="status" className="py-6 text-center text-sm text-ink-3">검색 결과가 없습니다. 다른 이름으로 검색해주세요.</p>}
    </fieldset>
  </div>;
}

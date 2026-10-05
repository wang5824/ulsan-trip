"use client";

import { useState } from "react";
import { placeCatalog } from "../../data/places";
import { hasCoordinates } from "../../lib/place-coordinates";
import { DISTRICT_LABELS, type TravelRegion } from "../../types/travel";

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
  const selected = places.filter(place => selectedIds.includes(place.id));
  const outside = selected.some(place => region && region !== "all" && place.district !== region);

  return <div className="space-y-5">
    <p className="text-sm leading-6 text-slate-600">관광지·음식점·카페 중 최대 2곳까지 선택할 수 있어요. 선택한 순서로 먼저 방문하고 나머지 일정을 채워드려요.</p>
    <div aria-live="polite" className="space-y-2">
      <p className="text-sm font-semibold text-teal-800">선택한 장소 {selectedIds.length}/2</p>
      {selected.map(place => <div key={place.id} className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 p-3 text-sm">
        <span>{place.name}</span>
        <button type="button" onClick={() => onChange(selectedIds.filter(id => id !== place.id))} aria-label={`${place.name} 선택 해제`} className="min-h-10 rounded-lg px-3 font-semibold text-teal-800 focus-visible:outline-2">해제</button>
      </div>)}
      {!selected.length && <p className="text-sm text-slate-500">선택하지 않고 넘어가도 괜찮아요.</p>}
    </div>
    {outside && <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <p>선택한 여행 지역 밖이거나 지역을 확인할 수 없는 장소가 있어요. 지역을 넓히거나 해당 장소를 해제해주세요.</p>
      <button type="button" onClick={onExpandRegion} className="mt-2 min-h-10 rounded-lg border border-amber-300 px-3 font-semibold">여행 지역을 울산 전체로 변경</button>
    </div>}
    <div>
      <label htmlFor="place-search" className="mb-2 block text-sm font-medium">장소 이름 또는 주소 검색</label>
      <input id="place-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: 대왕암공원, 간절곶" className="min-h-12 w-full rounded-xl border border-slate-300 px-4 focus-visible:outline-teal-700" />
    </div>
    <p className="text-xs text-slate-500">위치 정보가 있는 장소만 선택할 수 있어요. 두 곳을 선택하면 나머지 선택은 잠깐 비활성화됩니다.</p>
    <fieldset aria-label="필수 방문 장소 선택" className="max-h-80 space-y-2 overflow-y-auto p-1">
      {results.map(place => {
        const checked = selectedIds.includes(place.id);
        const unavailable = !hasCoordinates(place) || place.recommendedDuration <= 0;
        const disabled = unavailable || (!checked && selectedIds.length >= 2);
        return <label key={place.id} className={`flex items-start gap-3 rounded-xl border p-3 ${checked ? "border-teal-600 bg-teal-50" : "border-slate-200"} ${disabled ? "opacity-50" : "cursor-pointer"}`}>
          <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onChange(checked ? selectedIds.filter(id => id !== place.id) : [...selectedIds, place.id])} className="mt-1 h-5 w-5 shrink-0 accent-teal-700" />
          <span className="text-sm"><span className="font-semibold">{place.name}</span><span className="mt-1 block text-xs text-slate-500">{typeLabels[place.type]} · {place.district ? DISTRICT_LABELS[place.district] : "지역 미확인"}{unavailable ? " · 위치·체류 정보 미확인으로 선택 불가" : ""}</span></span>
        </label>;
      })}
      {!results.length && <p role="status" className="py-6 text-center text-sm text-slate-500">검색 결과가 없습니다. 다른 이름으로 검색해주세요.</p>}
    </fieldset>
  </div>;
}

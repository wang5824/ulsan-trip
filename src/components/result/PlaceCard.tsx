import { calculatePreferenceFit, type ScoredPlace } from "../../lib/recommendation";
import { DISTRICT_LABELS } from "../../types/travel";
import type { PlaceType } from "../../types/travel";
import { PLACE_CATEGORY_LABELS as categoryLabels } from "../../lib/place-categories";
const typeLabels: Record<PlaceType, string> = {
  attraction: "관광지", restaurant: "음식점", cafe: "카페",
};

export default function PlaceCard({ recommendation }: { recommendation: ScoredPlace }) {
  const { place, breakdown } = recommendation;
  const preferenceFit = calculatePreferenceFit(recommendation);
  // 취향과 충분히 맞는 항목만 설명해 중립값을 추천 이유로 제시하지 않습니다.
  const reasons = [breakdown.interest, breakdown.companion, breakdown.activity, breakdown.rest]
    .filter((item) => item.points > 0 && item.match >= (item === breakdown.rest ? 0.5 : 0.75))
    .sort((a, b) => b.points - a.points)
    .slice(0, 2);

  return (
    <article className="rounded-3xl border border-teal-900/5 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">
          {typeLabels[place.type]} · {categoryLabels[place.category]}
        </span>
        <span className={`rounded-full px-3 py-1.5 ${place.isTourismDure ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-500"}`}>
          {place.isTourismDure === null ? "관광두레 여부 미확인" : place.isTourismDure ? "관광두레" : "관광두레 비소속"}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{place.district ? DISTRICT_LABELS[place.district] : "지역 미확인"}</p>
      <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight sm:text-xl">{place.name}</h3>
      <p className="mt-3 text-xs font-semibold text-teal-800 sm:text-sm">예상 체류 약 {place.recommendedDuration}분 · {place.indoor === null ? "실내외 혼합 또는 미확인" : place.indoor ? "실내" : "야외"}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{place.address ?? "주소 미확인"}</p>
      <p className="mt-4 text-sm leading-7 text-slate-600">{place.description}</p>
      <div className="mt-5 rounded-2xl border border-teal-100/60 bg-teal-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-teal-900">이런 점이 잘 맞아요</p>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold tabular-nums text-teal-800">취향 적합도 {preferenceFit}%</span>
        </div>
        {reasons.length > 0 ? (
          <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-teal-900">
            {reasons.map((item) => <li key={item.reason}>{item.reason}</li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-teal-900">다른 방문 장소와 함께 둘러볼 수 있도록 일정에 담았어요.</p>}
      </div>
    </article>
  );
}

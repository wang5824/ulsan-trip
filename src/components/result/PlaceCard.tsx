import { calculatePreferenceFit, type ScoredPlace } from "../../lib/recommendation";
import { DISTRICT_LABELS } from "../../types/travel";
import type { PlaceType } from "../../types/travel";
import { PLACE_CATEGORY_LABELS as categoryLabels } from "../../lib/place-categories";

const typeLabels: Record<PlaceType, string> = {
  attraction: "관광지", restaurant: "음식점", cafe: "카페",
};
const typeTone: Record<PlaceType, string> = {
  attraction: "bg-sea text-white", restaurant: "bg-ochre text-white", cafe: "bg-ink text-paper",
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
    <article className="rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 ${typeTone[place.type]}`}>{typeLabels[place.type]} · {categoryLabels[place.category]}</span>
        <span className="rounded-full bg-sand px-3 py-1 text-ink-2">{place.district ? DISTRICT_LABELS[place.district] : "지역 미확인"}</span>
        {place.isTourismDure && <span className="rounded-full bg-ochre-tint px-3 py-1 text-ochre-2">관광두레</span>}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">{place.name}</h3>
      <p className="mt-2 text-xs leading-5 text-ink-3">{place.address ?? "주소 미확인"} · {place.indoor === null ? "실내외 미확인" : place.indoor ? "실내" : "야외"}</p>
      <p className="mt-4 text-sm leading-7 text-ink-2">{place.description}</p>
      <div className="mt-5 rounded-2xl bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-xs font-bold text-ink-2">이런 점이 잘 맞아요</p>
          <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-3">
            취향 적합도
            <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-line" aria-hidden="true"><span className="absolute inset-y-0 left-0 rounded-full bg-sea" style={{ width: `${preferenceFit}%` }} /></span>
            <span className="font-display text-sm font-bold tabular-nums text-sea">{preferenceFit}%</span>
          </span>
        </div>
        {reasons.length > 0 ? (
          <ul className="mt-2.5 space-y-1.5 text-sm leading-6 text-ink-2">
            {reasons.map((item) => <li key={item.reason} className="flex gap-2"><span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ochre" />{item.reason}</li>)}
          </ul>
        ) : <p className="mt-2.5 text-sm text-ink-2">다른 방문 장소와 함께 둘러볼 수 있도록 일정에 담았어요.</p>}
        {place.isTourismDure === null && <p className="mt-3 text-[11px] text-ink-3">관광두레 여부 미확인</p>}
      </div>
    </article>
  );
}

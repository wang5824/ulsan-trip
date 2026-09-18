import type { ScoredPlace } from "../../lib/recommendation";
import type { PlaceCategory, PlaceType } from "../../types/travel";

const categoryLabels: Record<PlaceCategory, string> = {
  nature: "자연", sea: "바다", culture: "문화", experience: "체험",
  korean: "한식", seafood: "해산물", cafe: "카페",
};
const typeLabels: Record<PlaceType, string> = {
  attraction: "관광지", restaurant: "음식점", cafe: "카페",
};

export default function PlaceCard({ recommendation }: { recommendation: ScoredPlace }) {
  const { place, breakdown } = recommendation;
  // 가점이 있는 항목 중 기여도가 큰 설명을 표시합니다. 관광두레는 별도 배지로 표시합니다.
  const reasons = [breakdown.interest, breakdown.companion, breakdown.activity, breakdown.rest]
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 2);

  return (
    <article className="rounded-3xl border border-teal-900/5 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">
          {typeLabels[place.type]} · {categoryLabels[place.category]}
        </span>
        <span className={`rounded-full px-3 py-1.5 ${place.isTourismDure ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-500"}`}>
          {place.isTourismDure ? "관광두레 · mock 설정" : "관광두레 비소속 · mock 설정"}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight sm:text-xl">{place.name}</h3>
      <p className="mt-3 text-xs font-semibold text-teal-800 sm:text-sm">예상 체류 약 {place.recommendedDuration}분 · {place.indoor ? "실내" : "야외"}</p>
      <p className="mt-4 text-sm leading-7 text-slate-600">{place.description}</p>
      <div className="mt-5 rounded-2xl border border-teal-100/60 bg-teal-50/50 p-4">
        <p className="text-xs font-bold text-teal-900">이런 점이 잘 맞아요</p>
        {reasons.length > 0 ? (
          <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-teal-900">
            {reasons.map((item) => <li key={item.reason}>{item.reason}</li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-teal-900">코스에 필요한 장소 유형을 고려한 후보예요.</p>}
      </div>
    </article>
  );
}

import type { ScoredPlace } from "../../lib/recommendation";
import PlaceCard from "./PlaceCard";

export default function CourseTimeline({ stops }: { stops: readonly ScoredPlace[] }) {
  if (stops.length === 0) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">조건에 맞는 추천 장소가 없습니다.</p>;
  }

  return (
    <ol className="space-y-6">
      {stops.map((recommendation, index) => (
        <li key={recommendation.place.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 sm:gap-4">
          {index < stops.length - 1 && <div aria-hidden="true" className="absolute bottom-[-1.5rem] left-4 top-8 w-px bg-teal-200" />}
          <span aria-label={`${index + 1}번째 방문`} className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold tabular-nums text-white ring-4 ring-[#f8faf8]">{index + 1}</span>
          <PlaceCard recommendation={recommendation} />
        </li>
      ))}
    </ol>
  );
}

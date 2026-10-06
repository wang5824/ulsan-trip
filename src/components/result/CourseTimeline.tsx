import { formatScheduleTime, type ScheduledStop } from "../../lib/recommendation";
import type { PetroglyphType } from "../../data/petroglyph-types";
import type { UserProfile } from "../../types/travel";
import PlaceCard from "./PlaceCard";
import { characterQuips } from "../../lib/character-voice";
import { getPlaceStory } from "../../data/place-stories";

export default function CourseTimeline({ stops, traveler, profile }: { stops: readonly ScheduledStop[]; traveler: PetroglyphType; profile: UserProfile }) {
  if (stops.length === 0) {
    return <p className="rounded-[1.5rem] border border-dashed border-line bg-card p-6 text-sm text-ink-2">조건에 맞는 추천 장소가 없습니다.</p>;
  }

  // 같은 코스 안에서 캐릭터가 같은 말을 반복하지 않도록 순서대로 계산합니다.
  const used = new Set<string>();
  const quips = stops.map(({ recommendation, travelMinutes, arrivalMinutes }, index) => characterQuips({
    code: traveler.code, profile, place: recommendation.place, story: getPlaceStory(recommendation.place.id),
    arrivalMinutes, travelMinutes, isFirst: index === 0, isLast: index === stops.length - 1,
  }, used));

  return (
    <ol className="space-y-5">
      {stops.map(({ recommendation, travelMinutes, arrivalMinutes, departureMinutes }, index) => (
        <li key={recommendation.place.id} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:gap-4">
          {index < stops.length - 1 && <div aria-hidden="true" className="absolute bottom-[-1.25rem] left-5 top-11 border-l-2 border-dashed border-line" />}
          <span aria-label={`${index + 1}번째 방문`} className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rock font-display text-base font-bold tabular-nums text-ochre-tint ring-4 ring-paper">{index + 1}</span>
          <div className="min-w-0">
            <p className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2 text-sm">
              <span className="font-display font-bold tabular-nums text-ink">{formatScheduleTime(arrivalMinutes)} – {formatScheduleTime(departureMinutes)}</span>
              <span className="text-xs text-ink-3">체류 {recommendation.place.recommendedDuration}분{index > 0 ? ` · 이동 약 ${travelMinutes}분` : ""}</span>
            </p>
            <PlaceCard
              recommendation={recommendation}
              traveler={traveler}
              profile={profile}
              quip={quips[index]}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

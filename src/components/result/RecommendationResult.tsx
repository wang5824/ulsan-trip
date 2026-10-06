"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTravel } from "../TravelProvider";
import Link from "next/link";
import KakaoMap from "@/src/components/KakaoMap";
import CourseTimeline from "@/src/components/result/CourseTimeline";
import { createTravelCopy } from "@/src/lib/travel-copy";
import { createSchedule, formatScheduleTime } from "@/src/lib/recommendation";
import { DISTRICT_LABELS } from "@/src/types/travel";
import PetroglyphGlyph from "@/src/components/petroglyph/PetroglyphGlyph";
import { describeAxes, findPetroglyphType, getPetroglyphType } from "@/src/lib/petroglyph-type";
import { buttonPrimary, buttonSecondary, eyebrow, focusRing } from "@/src/components/ui";

const companionLabels = { solo: "혼자", couple: "연인과", friends: "친구와", family: "가족과" };
const transportLabels = { car: "자가용", "public-transit": "대중교통", walking: "도보" };

export default function RecommendationResult() {
  const { ready, trip, typeResult } = useTravel();
  const router = useRouter();

  useEffect(() => {
    if (ready && !trip) router.replace("/survey");
  }, [ready, trip, router]);

  const stops = useMemo(() => trip?.recommendations ?? [], [trip]);
  const schedule = useMemo(() => trip ? createSchedule(trip.profile, stops) : [], [trip, stops]);
  const mapPlaces = useMemo(() => stops.map(({ place }) => place), [stops]);

  if (!trip) {
    return <main className="flex-1 px-5 py-20 text-center text-sm text-ink-3"><p role="status">{ready ? "코스 설계로 이동하고 있습니다…" : "불러오는 중…"}</p></main>;
  }
  const { profile } = trip;
  const travelCopy = createTravelCopy(profile, mapPlaces);
  const travelerType = (typeResult && findPetroglyphType(typeResult.code)) || getPetroglyphType(profile);
  const totalStayMinutes = stops.reduce((sum, { place }) => sum + place.recommendedDuration, 0);
  const totalTravelMinutes = schedule.reduce((sum, stop) => sum + stop.travelMinutes, 0);
  const requiredNames = (profile.requiredPlaceIds ?? []).map(id => mapPlaces.find(place => place.id === id)?.name ?? id);
  const chips = [
    companionLabels[profile.companion].replace(/과$|와$/, ""),
    profile.region === "all" ? "울산 전체" : DISTRICT_LABELS[profile.region],
    transportLabels[profile.transport],
    `${profile.startTime} – ${profile.endTime}`,
    ...(profile.accessNeeds?.wheelchair ? ["휠체어·유모차"] : []),
    ...(profile.accessNeeds?.pets ? ["반려동물 동반"] : []),
    ...requiredNames.map(name => `꼭 가기 · ${name}`),
  ];

  return (
    <main className="flex-1">
      <section className="grain-dark bg-rock px-5 pb-12 pt-10 text-bone sm:px-8 sm:pb-16 sm:pt-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-end">
          <div className="animate-rise min-w-0">
            <p className={`${eyebrow} text-ochre-tint/80`}>오늘의 울산 코스</p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-snug tracking-tight sm:text-5xl">{travelCopy.concept}</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-8 text-bone/75">{travelCopy.introduction}</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
              {chips.map(label => <li key={label} className="rounded-full border border-bone/20 px-3 py-1.5 text-bone/85">{label}</li>)}
            </ul>
          </div>
          <Link href={`/type/${travelerType.code}`} className={`group flex items-center gap-4 rounded-3xl border border-bone/15 bg-rock-2/70 p-4 transition-colors hover:border-bone/40 ${focusRing}`}>
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-rock text-ochre-tint shadow-[inset_0_2px_16px_rgba(0,0,0,0.4)]">
              <PetroglyphGlyph glyph={travelerType.glyph} label={travelerType.motif} filterId="pecked-result" className="h-16 w-16" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-bone/55">나의 암각화 여행자 유형</span>
              <span className="mt-0.5 block font-display text-xl font-bold leading-snug">{travelerType.name} <span className="font-mono text-xs text-ochre-tint">{travelerType.code}</span></span>
              <span className="mt-1 block text-xs text-bone/60">{describeAxes(travelerType.code).join(" · ")}</span>
            </span>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <dl className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            ["방문", `${stops.length}곳`],
            ["체류 + 이동", `약 ${totalStayMinutes + totalTravelMinutes}분`],
            ["예상 종료", schedule.length > 0 ? formatScheduleTime(schedule[schedule.length - 1].departureMinutes) : "–"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-card px-3 py-4 text-center sm:px-5">
              <dt className="text-[11px] font-semibold text-ink-3 sm:text-xs">{label}</dt>
              <dd className="mt-1 font-display text-lg font-bold tabular-nums sm:text-2xl">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <section aria-labelledby="timeline-heading" className="min-w-0">
            <h2 id="timeline-heading" className="font-display text-2xl font-bold">추천 일정</h2>
            <p className="mb-7 mt-2 text-sm leading-7 text-ink-3">
              {schedule.length > 0
                ? `체류 ${totalStayMinutes}분과 이동 약 ${totalTravelMinutes}분을 선택한 종료 시간 안에 맞췄어요.`
                : "선택한 지역과 시간에 맞는 관광지가 없습니다. 지역을 넓히거나 여행 시간을 늘려보세요."}
            </p>
            <CourseTimeline stops={schedule} traveler={travelerType} profile={profile} />
          </section>

          <aside aria-labelledby="map-heading" className="min-w-0 rounded-[1.75rem] border border-line bg-card p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 id="map-heading" className="font-display text-2xl font-bold">여행 지도</h2>
            <p className="mb-5 mt-2 text-sm leading-7 text-ink-3">번호를 따라 오늘의 여행을 한눈에 살펴보세요.</p>
            <KakaoMap places={mapPlaces} />
          </aside>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row">
          <Link href="/survey" className={buttonPrimary}>조건 바꿔 다시 짜기</Link>
          <Link href="/test" className={buttonSecondary}>유형검사 다시 하기</Link>
        </div>
      </div>
    </main>
  );
}

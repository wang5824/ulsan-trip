"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTravel } from "../TravelProvider";
import Link from "next/link";
import KakaoMap from "@/src/components/KakaoMap";
import CourseTimeline from "@/src/components/result/CourseTimeline";
import { createTravelCopy } from "@/src/lib/travel-copy";
const companionLabels = { solo: "혼자", couple: "연인과", friends: "친구와", family: "가족과" };
const transportLabels = { car: "자가용", "public-transit": "대중교통", walking: "도보" };
const interestLabels = { nature: "자연", sea: "바다", culture: "문화", experience: "체험", food: "음식", photo: "사진" };

export default function RecommendationResult() {
  const { trip } = useTravel();
  const router = useRouter();

  useEffect(() => {
    if (!trip) router.replace("/survey");
  }, [trip, router]);

  // 같은 배열을 유지해 불필요한 지도 재생성을 방지합니다.
  const stops = useMemo(() => {
    if (!trip) return [];
    const attractions = trip.recommendations.filter(({ place }) => place.type === "attraction");
    const restaurants = trip.recommendations.filter(({ place }) => place.type === "restaurant");
    const cafes = trip.recommendations.filter(({ place }) => place.type === "cafe");
    // 관광 → 식사 → 관광 → 휴식 → 나머지 관광 순서이며 이동 경로 최적화는 아닙니다.
    return [...attractions.slice(0, 1), ...restaurants, ...attractions.slice(1, 2), ...cafes, ...attractions.slice(2)];
  }, [trip]);
  const mapPlaces = useMemo(() => stops.map(({ place }) => place), [stops]);

  if (!trip) {
    return <main className="flex-1 bg-[#f8faf8] px-5 py-16 text-center text-slate-600"><p role="status">여행 성향 설문으로 이동하고 있습니다…</p></main>;
  }
  const { profile } = trip;
  const travelCopy = createTravelCopy(profile, mapPlaces);
  const totalStayMinutes = stops.reduce((sum, { place }) => sum + place.recommendedDuration, 0);

  return (
    <main className="flex-1 bg-[#f8faf8] px-5 py-10 text-slate-900 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-bold tracking-[0.2em] text-teal-700">ULSAN · 나만의 여행</p>
          <h1 className="mt-4 text-3xl font-bold leading-snug tracking-tight sm:text-4xl">당신을 위한 울산 여행</h1>
          <div className="mt-5 max-w-2xl">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800">{travelCopy.concept}</span>
            <p className="mt-3 text-base leading-8 text-slate-600 sm:text-lg">{travelCopy.introduction}</p>
          </div>
          <p className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-900">
            설문 답변을 바탕으로 개발용 가상 장소(mock)를 추천합니다. 장소 정보와 관광두레 소속 여부는 실제 정보가 아닙니다.
          </p>
        </header>

        <section aria-labelledby="style-heading" className="my-8 rounded-3xl border border-teal-100 bg-teal-50/60 p-6 sm:my-10 sm:p-8">
          <h2 id="style-heading" className="text-sm font-bold text-teal-800">여행 스타일 요약</h2>
          <p className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{companionLabels[profile.companion]} 즐기는 {profile.activityLevel <= 2 ? "여유로운" : profile.activityLevel >= 4 ? "활동적인" : "균형 잡힌"} 여행</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profile.interests.length > 0 ? `${profile.interests.map((interest) => interestLabels[interest]).join(" · ")}에 관심이 많고,` : "특별한 관심사 제한 없이,"}
            {profile.restFrequency >= 4 ? " 자주 쉬어가는 여행을 좋아해요." : profile.restFrequency <= 2 ? " 휴식은 적게 필요한 편이에요." : " 적당한 휴식을 선호해요."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
            {[
              transportLabels[profile.transport],
              `${profile.startTime}–${profile.endTime}`,
              `활동량 ${profile.activityLevel}/5`,
              `휴식 빈도 ${profile.restFrequency}/5`,
            ].map((label) => <span key={label} className="rounded-full border border-teal-100 bg-white px-3 py-2 text-teal-900">{label}</span>)}
          </div>
        </section>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
          <section aria-labelledby="timeline-heading" className="min-w-0">
            <h2 id="timeline-heading" className="text-xl font-bold">추천 일정</h2>
            <p className="mb-6 mt-3 text-sm leading-7 text-slate-500">
              {stops.length}곳 · 예상 체류 총 {totalStayMinutes}분 (이동 시간 제외)<br />
              방문 순서 예시이며, 실제 이동 시간과 영업시간은 반영하지 않았어요.
            </p>
            <CourseTimeline stops={stops} />
          </section>

          <aside aria-labelledby="map-heading" className="min-w-0 rounded-3xl border border-teal-900/5 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-8">
            <h2 id="map-heading" className="text-xl font-bold">여행 지도</h2>
            <p className="mb-6 mt-3 text-sm leading-7 text-slate-500">번호를 따라 오늘의 여행을 한눈에 살펴보세요.</p>
            <KakaoMap places={mapPlaces} />
          </aside>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <Link href="/survey" className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl sm:w-auto bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">다시 설문하기</Link>
          <p className="mt-2 text-xs leading-5 text-slate-500">새로고침하면 여행 프로필이 초기화되어 설문으로 이동합니다.</p>
        </div>
      </div>
    </main>
  );
}

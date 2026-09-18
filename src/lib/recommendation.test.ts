import assert from "node:assert/strict";
import { test } from "node:test";
import { places } from "../data/places";
import type { Place, UserProfile } from "../types/travel";
import { rankPlaces, recommendPlaces, recommendPlacesWithBreakdown, RECOMMENDATION_WEIGHTS, scorePlace } from "./recommendation";

const profile: UserProfile = {
  companion: "family", transport: "car", activityLevel: 2, restFrequency: 5,
  interests: ["nature"], preferredFood: ["korean"], startTime: "09:00", endTime: "18:00",
};
const fixture = (changes: Partial<Place>): Place => ({ ...places[0], ...changes });

// 실제 관광지 평가가 아닌 개발용 mock 데이터에 대한 회귀 테스트입니다.
// 높은 관심도는 기존 UserProfile 타입의 interests 목록에 포함하는 것으로 표현합니다.
const commonProfile = {
  transport: "car", preferredFood: [], startTime: "09:00", endTime: "14:00",
} satisfies Partial<UserProfile>;
const scenarioProfiles = {
  A: { ...commonProfile, companion: "couple", activityLevel: 5, restFrequency: 1, interests: ["nature"] },
  B: { ...commonProfile, companion: "family", activityLevel: 1, restFrequency: 5, interests: ["food", "culture"] },
  // C의 휴식 빈도는 지정되지 않았으므로 보통(3)으로 둡니다.
  C: { ...commonProfile, companion: "friends", activityLevel: 5, restFrequency: 3, interests: ["experience"] },
} satisfies Record<string, UserProfile>;

function getScoredPlace(user: UserProfile, id: string) {
  const place = places.find((item) => item.id === id);
  assert.ok(place, `mock 장소 ${id}가 있어야 합니다.`);
  return scorePlace(user, place);
}

function assertPoints(result: ReturnType<typeof scorePlace>, expected: number[]) {
  // 순서: 관심사, 동행, 활동성, 휴식, 관광두레. 가중치 변경 시 기대값을 검토합니다.
  const keys = ["interest", "companion", "activity", "rest", "tourismDure"] as const;
  assert.deepEqual(keys.map((key) => result.breakdown[key].points), expected, `${result.place.name} 항목별 점수`);
  assert.equal(result.totalScore, expected.reduce((sum, points) => sum + points, 0));
  keys.forEach((key) => assert.ok(result.breakdown[key].reason.trim(), `${key} 설명이 있어야 합니다.`));
}

function reportScenario(label: keyof typeof scenarioProfiles) {
  const results = recommendPlacesWithBreakdown(scenarioProfiles[label], places);
  console.log(`\n프로필 ${label}: 개발용 mock 추천 결과 (점수순, 방문 순서 아님)`);
  console.table(results.map(({ place, totalScore, breakdown }, index) => ({
    순위: index + 1, 장소: place.name, 유형: place.type,
    관심사: breakdown.interest.points, 동행: breakdown.companion.points,
    활동성: breakdown.activity.points, 휴식: breakdown.rest.points,
    관광두레: breakdown.tourismDure.points, 총점: totalScore,
  })));
  return results;
}

test("A: 자연을 좋아하는 활동적인 연인에게 해안 전망길이 가장 높다", () => {
  const user = scenarioProfiles.A;
  const sea = getScoredPlace(user, "mock-attraction-02");
  const garden = getScoredPlace(user, "mock-attraction-01");
  assertPoints(sea, [35, 25, 15, 0, 0]);
  assertPoints(garden, [35, 18.75, 5, 0, 0]);
  assert.ok(sea.totalScore > garden.totalScore, "자연 관심 점수는 같아도 연인·활동량 적합도가 더 높은 해안을 우선한다.");
  assert.ok(sea.totalScore > getScoredPlace(user, "mock-attraction-04").totalScore, "관광두레 가점만으로 관심사가 다른 공방이 앞서지 않는다.");
  const result = reportScenario("A");
  assert.equal(result[0].place.id, sea.place.id);
  assert.equal(result.filter(({ place }) => place.type === "attraction").length, 3);
  assert.equal(result.filter(({ place }) => place.type === "restaurant").length, 1);
  assert.ok(result.every(({ place }) => place.type !== "cafe"), "휴식 필요가 낮으면 카페를 추가하지 않는다.");
});

test("B: 음식·문화를 좋아하고 휴식이 필요한 가족에게 식당·전시관·카페가 높다", () => {
  const user = scenarioProfiles.B;
  const restaurant = getScoredPlace(user, "mock-restaurant-01");
  const museum = getScoredPlace(user, "mock-attraction-03");
  const cafe = getScoredPlace(user, "mock-cafe-01");
  assertPoints(restaurant, [35, 25, 20, 10, 8]);
  assertPoints(museum, [35, 25, 20, 15, 0]);
  assertPoints(cafe, [35, 12.5, 20, 20, 8]);
  assert.ok(museum.totalScore > getScoredPlace(user, "mock-attraction-02").totalScore, "문화 관심, 가족 적합도, 낮은 활동량과 휴식 적합도를 반영한다.");
  const result = reportScenario("B");
  assert.deepEqual(result.slice(0, 3).map(({ place }) => place.id), [restaurant.place.id, cafe.place.id, museum.place.id]);
  assert.equal(result.filter(({ place }) => place.type === "attraction").length, 3);
  assert.equal(result.filter(({ place }) => place.type === "restaurant").length, 1);
  assert.equal(result.filter(({ place }) => place.type === "cafe").length, 1);
});

test("C: 체험을 좋아하는 활동적인 친구들에게 공방의 관심사·동행 점수가 높다", () => {
  const user = scenarioProfiles.C;
  const workshop = getScoredPlace(user, "mock-attraction-04");
  const sea = getScoredPlace(user, "mock-attraction-02");
  assertPoints(workshop, [35, 25, 10, 2.5, 8]);
  assertPoints(sea, [0, 25, 15, 2.5, 0]);
  assert.ok(workshop.breakdown.activity.points < sea.breakdown.activity.points, "공방은 활동량만으로는 해안보다 낮다.");
  assert.ok(workshop.totalScore - workshop.breakdown.tourismDure.points > sea.totalScore, "체험 관심 덕분에 관광두레 가점을 제외해도 공방이 앞선다.");
  const result = reportScenario("C");
  assert.equal(result[0].place.id, workshop.place.id);
  assert.equal(result.filter(({ place }) => place.type === "attraction").length, 3);
  assert.equal(result.filter(({ place }) => place.type === "restaurant").length, 1);
  assert.ok(result.every(({ place }) => place.type !== "cafe"));
});

test("긴 여행에는 관광지 4개, 음식점 1개, 카페 1개를 전체 점수순으로 반환한다", () => {
  const results = recommendPlacesWithBreakdown(profile, places);
  assert.equal(results.filter(({ place }) => place.type === "attraction").length, 4);
  assert.equal(results.filter(({ place }) => place.type === "restaurant").length, 1);
  assert.equal(results.filter(({ place }) => place.type === "cafe").length, 1);
  results.forEach((result, index) => {
    if (index > 0) assert.ok(results[index - 1].totalScore >= result.totalScore);
    assert.equal(result.totalScore, Object.values(result.breakdown).reduce((sum, item) => sum + item.points, 0));
  });
  assert.deepEqual(recommendPlaces(profile, places), results.map(({ place }) => place));
});

test("짧은 여행과 낮은 휴식 빈도에는 관광지 3개와 음식점만 추천한다", () => {
  const result = recommendPlaces({ ...profile, endTime: "14:59", restFrequency: 3 }, places);
  assert.equal(result.filter((place) => place.type === "attraction").length, 3);
  assert.equal(result.filter((place) => place.type === "cafe").length, 0);
});

test("관광두레는 동일 조건에서 우대하지만 적합도가 높은 일반 장소를 무조건 이기지 않는다", () => {
  const regular = fixture({ id: "regular", isTourismDure: false });
  const dure = fixture({ id: "dure", isTourismDure: true });
  assert.equal(scorePlace(profile, dure).totalScore - scorePlace(profile, regular).totalScore, RECOMMENDATION_WEIGHTS.tourismDure);
  const poorMatch = fixture({ id: "poor", isTourismDure: true, category: "culture", familyScore: 1, activityLevel: 5, restScore: 1 });
  assert.equal(rankPlaces(profile, [poorMatch, regular])[0].place.id, "regular");
});

test("각 선호는 해당 점수 항목에 반영된다", () => {
  const place = fixture({ familyScore: 5, coupleScore: 1, restScore: 5, activityLevel: 2 });
  const base = scorePlace(profile, place).breakdown;
  assert.ok(base.interest.points > scorePlace({ ...profile, interests: ["culture"] }, place).breakdown.interest.points);
  assert.ok(base.companion.points > scorePlace({ ...profile, companion: "couple" }, place).breakdown.companion.points);
  assert.ok(base.activity.points > scorePlace({ ...profile, activityLevel: 5 }, place).breakdown.activity.points);
  assert.ok(base.rest.points > scorePlace({ ...profile, restFrequency: 1 }, place).breakdown.rest.points);
  const restaurant = fixture({ type: "restaurant", category: "korean" });
  assert.ok(scorePlace(profile, restaurant).totalScore > scorePlace({ ...profile, preferredFood: ["seafood"] }, restaurant).totalScore);
});

test("입력을 변경하지 않고 동점은 ID순으로 정렬하며 중복 ID를 제거한다", () => {
  const input = Object.freeze([Object.freeze(fixture({ id: "b" })), Object.freeze(fixture({ id: "a" })), Object.freeze(fixture({ id: "a" }))]);
  const frozenProfile = Object.freeze({ ...profile, interests: [...profile.interests], preferredFood: [...profile.preferredFood] });
  Object.freeze(frozenProfile.interests);
  Object.freeze(frozenProfile.preferredFood);
  assert.deepEqual(rankPlaces(frozenProfile, input).map(({ place }) => place.id), ["a", "b"]);
  assert.deepEqual(input.map((place) => place.id), ["b", "a", "a"]);
});

test("빈 데이터, 후보 부족, 잘못된 시간, 정보 없는 관심사를 처리한다", () => {
  assert.deepEqual(recommendPlaces(profile, []), []);
  assert.equal(recommendPlaces(profile, [places[0]]).length, 1);
  assert.deepEqual(recommendPlaces({ ...profile, endTime: "09:00" }, places), []);
  assert.deepEqual(recommendPlaces({ ...profile, endTime: "08:00" }, places), []);
  for (const interests of [[], ["photo"]] as UserProfile["interests"][]) {
    const result = scorePlace({ ...profile, companion: "solo", interests }, places[0]);
    assert.equal(result.breakdown.interest.match, 0.5);
    assert.equal(result.breakdown.companion.match, 0.5);
    assert.ok(Number.isFinite(result.totalScore));
  }
});

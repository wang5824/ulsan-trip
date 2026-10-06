import { DISTRICT_LABELS } from "../types/travel";
import { calculatePreferenceFit, getRequiredPlaceIssues } from "./recommendation";
import { isQuestionAnswered, buildUserProfile } from "./survey";
import type { SurveyAnswers } from "../data/survey";
import assert from "node:assert/strict";
import { test } from "node:test";
import { placeCatalog } from "../data/places";
import type { Place, PlaceCatalog, UserProfile } from "../types/travel";
import { rankPlaces, recommendPlaces, recommendPlacesWithBreakdown, RECOMMENDATION_WEIGHTS, scorePlace, distanceKm, FOOD_DISTANCE_LIMITS, createSchedule, estimateTravelMinutes } from "./recommendation";
import { createMapEntries, hasCoordinates } from "./place-coordinates";
import { PLACE_CATEGORY_LABELS, CATEGORY_INTERESTS } from "./place-categories";

const places = [...placeCatalog.attractions, ...placeCatalog.restaurants, ...placeCatalog.cafes];
const catalogOf = (items: readonly Place[]): PlaceCatalog => ({
  attractions: items.filter((p): p is Place & { type: "attraction" } => p.type === "attraction"),
  restaurants: items.filter((p): p is Place & { type: "restaurant" } => p.type === "restaurant"),
  cafes: items.filter((p): p is Place & { type: "cafe" } => p.type === "cafe"),
});

const profile: UserProfile = {
  popularityPreference: "any", region: "all", companion: "family", transport: "car", activityLevel: 2, restFrequency: 5,
  interests: ["nature"], preferredFood: ["korean"], startTime: "09:00", endTime: "18:00",
};
const fixture = (changes: Partial<Place>): Place => ({ ...places[0], ...changes });

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
  assert.deepEqual(recommendPlaces(profile, catalogOf([])), []);
  assert.equal(recommendPlaces(profile, catalogOf([places[0]])).length, 1);
  assert.deepEqual(recommendPlaces({ ...profile, endTime: "09:00" }, placeCatalog), []);
  assert.deepEqual(recommendPlaces({ ...profile, endTime: "08:00" }, placeCatalog), []);
  for (const interests of [[], ["photo"]] as UserProfile["interests"][]) {
    const result = scorePlace({ ...profile, companion: "solo", interests }, places[0]);
    assert.equal(result.breakdown.interest.match, 0.5);
    assert.equal(result.breakdown.companion.match, 0.5);
    assert.ok(Number.isFinite(result.totalScore));
  }
});


test("유형별 데이터가 모두 보존되고 ID가 중복되지 않는다", () => {
  assert.equal(placeCatalog.attractions.length, 211);
  assert.equal(placeCatalog.restaurants.length, 238);
  assert.equal(placeCatalog.cafes.length, 82);
  assert.equal(new Set(places.map(p => p.id)).size, places.length);
  for (const id of ["daewangam-park", "taehwagang-national-garden", "ganjeolgot",
    "jangsaengpo-whale-village", "onggi-village", "ulsan-grand-park", "bangudae-petroglyphs",
    "hamyangjip-main", "eonyang-giwajip-bulgogi", "mijin-dol-gopchang", "nongdo-cafe"]) {
    assert.ok(places.some(place => place.id === id), `${id} 보존`);
  }
});

for (const transport of ["car", "public-transit", "walking"] as const) {
  test(`${transport}: 먼 고득점 음식점·카페는 제외하고 가까운 후보만 선택한다`, () => {
    const anchor = fixture({ id: "anchor" });
    assert.ok(hasCoordinates(anchor));
    const items = [anchor, ...(["restaurant", "cafe"] as const).flatMap(type => [
      fixture({ id: `${type}-near`, type, category: type === "cafe" ? "cafe" : "korean", longitude: anchor.longitude + 0.001, familyScore: 1 }),
      fixture({ id: `${type}-far`, type, category: type === "cafe" ? "cafe" : "korean", longitude: anchor.longitude + 0.1, familyScore: 5, isTourismDure: true }),
    ])];
    const result = recommendPlaces({ ...profile, transport }, catalogOf(items));
    assert.deepEqual(new Set(result.map(p => p.id)), new Set(["anchor", "restaurant-near", "cafe-near"]));
    result.slice(1).forEach(p => assert.ok(distanceKm(anchor, p) <= FOOD_DISTANCE_LIMITS[transport].radius));
  });
}

test("근처 후보나 관광지가 없으면 음식점·카페를 억지로 추천하지 않는다", () => {
  const food = fixture({ id: "food", type: "restaurant", longitude: 128 });
  const cafe = fixture({ id: "cafe", type: "cafe", longitude: 128 });
  assert.equal(recommendPlaces(profile, catalogOf([places[0], food, cafe])).length, 1);
  assert.deepEqual(recommendPlaces(profile, catalogOf([food, cafe])), []);
});

test("관광지 반경 이내라도 우회 상한을 넘는 음식점은 제외한다", () => {
  const a = fixture({ id: "a", latitude: 35, longitude: 129 });
  const b = fixture({ id: "b", latitude: 35, longitude: 129.1 });
  const food = fixture({ id: "food", type: "restaurant", latitude: 35, longitude: 128.974 });
  assert.ok(distanceKm(a, food) < FOOD_DISTANCE_LIMITS.car.radius);
  assert.ok(2 * distanceKm(a, food) > FOOD_DISTANCE_LIMITS.car.detour);
  assert.deepEqual(recommendPlaces(profile, catalogOf([a, b, food])).map(p => p.id), ["a", "b"]);
});

test("식사·휴식은 가까운 관광지 뒤에 삽입하고 관광지 순서를 유지한다", () => {
  const a = fixture({ id: "a", longitude: 129, recommendedDuration: 30 });
  const b = fixture({ id: "b", longitude: 129.2, recommendedDuration: 30 });
  const food = fixture({ id: "food", type: "restaurant", longitude: 129.201 });
  const cafe = fixture({ id: "cafe", type: "cafe", longitude: 129.202 });
  const catalog = catalogOf([a, b, food, cafe]);
  const before = JSON.stringify(catalog);
  const result = recommendPlacesWithBreakdown(profile, catalog);
  assert.deepEqual(result.map(r => r.place.id), ["a", "b", "food", "cafe"]);
  assert.deepEqual(recommendPlaces(profile, catalog), result.map(r => r.place));
  assert.equal(JSON.stringify(catalog), before);
  result.forEach(r => assert.equal(r.totalScore, Object.values(r.breakdown).reduce((n, d) => n + d.points, 0)));
  assert.ok(recommendPlaces({ ...profile, restFrequency: 3 }, catalog).every(p => p.type !== "cafe"));
});

test("여행 길이에 따라 관광지 개수 상한을 적용한다", () => {
  const shortStays = catalogOf(placeCatalog.attractions.map(place => ({ ...place, recommendedDuration: 10 })));
  assert.equal(recommendPlaces(profile, shortStays).filter(p => p.type === "attraction").length, 4);
  assert.equal(recommendPlaces({ ...profile, endTime: "14:59" }, shortStays).filter(p => p.type === "attraction").length, 3);
});

test("잘못된 음식점 좌표는 추천하지 않는다", () => {
  for (const latitude of [null, NaN, Infinity, 91]) {
    assert.equal(recommendPlaces(profile, catalogOf([places[0], fixture({ id: "invalid", type: "restaurant", latitude })])).length, 1);
  }
});

test("모든 등록 장소의 카테고리는 점수와 화면 라벨에서 지원된다", () => {
  places.forEach(place => {
    assert.ok(PLACE_CATEGORY_LABELS[place.category], place.name);
    assert.ok(CATEGORY_INTERESTS[place.category], place.name);
    assert.ok(Number.isFinite(scorePlace(profile, place).totalScore), place.name);
    assert.equal(place.latitude === null, place.longitude === null, place.name);
  });
});

test("미확인 값은 유지하고 관광두레 미확인에 가점을 주지 않는다", () => {
  const unknown = fixture({ address: null, latitude: null, longitude: null, indoor: null, isTourismDure: null });
  const scored = scorePlace(profile, unknown);
  assert.equal(scored.breakdown.tourismDure.points, 0);
  assert.match(scored.breakdown.tourismDure.reason, /확인되지/);
  assert.equal(unknown.address, null);
  assert.equal(unknown.indoor, null);
  assert.equal(rankPlaces(profile, [unknown]).length, 1);
  assert.equal(distanceKm(unknown, places[0]), Infinity);
  assert.deepEqual(recommendPlaces(profile, catalogOf([unknown])), []);
});

test("미확인·부분 누락 좌표는 경로와 지도에서 제외하며 방문 번호는 보존한다", () => {
  const a = fixture({ id: "a", recommendedDuration: 30 });
  const missing = fixture({ id: "missing", latitude: null, longitude: null });
  const partial = fixture({ id: "partial", longitude: null });
  const invalid = fixture({ id: "invalid", latitude: 91 });
  const b = fixture({ id: "b", recommendedDuration: 30 });
  const mixed = [a, missing, partial, invalid, b];
  assert.deepEqual(createMapEntries(mixed).map(({ place, visitNumber }) => [place.id, visitNumber]), [["a", 1], ["b", 5]]);
  assert.deepEqual(createMapEntries([missing, partial, invalid]), []);
  const schedule = createSchedule(profile, mixed.map(place => scorePlace(profile, place)));
  assert.deepEqual(schedule.map(stop => stop.recommendation.place.id), ["a", "b"]);
  assert.ok(schedule.every(stop => Number.isFinite(stop.departureMinutes)));
  assert.deepEqual(recommendPlaces(profile, catalogOf(mixed)).map(place => place.id), ["a", "b"]);
});

test("양식 선호는 양식 카테고리에 반영되며 미분류 음식점은 중립 점수이다", () => {
  const western = fixture({ type: "restaurant", category: "western" });
  assert.ok(scorePlace({ ...profile, preferredFood: ["western"] }, western).totalScore
    > scorePlace({ ...profile, preferredFood: ["korean"] }, western).totalScore);
  const other = fixture({ type: "restaurant", category: "other-food" });
  assert.equal(scorePlace({ ...profile, interests: [], preferredFood: ["western"] }, other).breakdown.interest.match, 0.5);
});


test("같은 장소 쌍에서 이동수단별 시간을 구분하고 가까운 대중교통 구간은 도보로 처리한다", () => {
  const a = fixture({ longitude: 129 });
  const b = fixture({ longitude: 129.1 });
  assert.ok(estimateTravelMinutes(a, b, "car") < estimateTravelMinutes(a, b, "public-transit"));
  assert.ok(estimateTravelMinutes(a, b, "public-transit") < estimateTravelMinutes(a, b, "walking"));
  assert.equal(estimateTravelMinutes(a, a, "car"), 0);
  const near = fixture({ longitude: 129.001 });
  assert.equal(estimateTravelMinutes(a, near, "public-transit"), estimateTravelMinutes(a, near, "walking"));
});

test("체류만 들어가더라도 이동을 포함해 초과하면 다음 장소를 제외한다", () => {
  const items = catalogOf([
    fixture({ id: "a", longitude: 129, recommendedDuration: 30 }),
    fixture({ id: "b", longitude: 129.1, recommendedDuration: 30 }),
  ]);
  const limited = { ...profile, endTime: "10:40" as const };
  assert.equal(recommendPlaces(limited, items).length, 2);
  assert.equal(recommendPlaces({ ...limited, transport: "public-transit" }, items).length, 1);
  assert.deepEqual(recommendPlaces({ ...profile, endTime: "09:20" }, items), []);
});

for (const transport of ["car", "public-transit", "walking"] as const) {
  test(`${transport}: 식사·휴식·이동을 포함한 모든 방문은 종료시간 이내이다`, () => {
    const selected = { ...profile, transport };
    const schedule = createSchedule(selected, recommendPlacesWithBreakdown(selected, placeCatalog));
    assert.ok(schedule.length > 0);
    assert.equal(schedule[0].arrivalMinutes, 540);
    schedule.forEach((stop, index) => {
      assert.ok(stop.departureMinutes <= 1080);
      if (index > 0) assert.equal(stop.arrivalMinutes, schedule[index - 1].departureMinutes + stop.travelMinutes);
    });
    assert.equal(recommendPlacesWithBreakdown(selected, placeCatalog).length, schedule.length);
  });
}

test("모든 장소에 유명도 수치와 주소 기반 지역이 저장되어 있다", () => {
  for (const place of places) {
    assert.ok(Number.isInteger(place.popularityScore) && place.popularityScore >= 1 && place.popularityScore <= 5, place.name);
    if (place.address) assert.equal(place.address.includes(DISTRICT_LABELS[place.district!]), true, place.name);
  }
  assert.equal(places.find(p => p.id === "daewangam-park")?.popularityScore, 5);
});

test("유명도 취향에 따라 같은 조건의 장소 순위가 반전된다", () => {
  const famous = fixture({ id: "famous", popularityScore: 5 });
  const hidden = fixture({ id: "hidden", popularityScore: 1 });
  assert.equal(rankPlaces({ ...profile, popularityPreference: "famous" }, [hidden, famous])[0].place.id, "famous");
  assert.equal(rankPlaces({ ...profile, popularityPreference: "hidden" }, [hidden, famous])[0].place.id, "hidden");
  assert.equal(scorePlace(profile, famous).totalScore, scorePlace(profile, hidden).totalScore);
});

test("유명한 곳 선호는 첫 장소 이후에도 가까운 무명 장소보다 적합한 명소를 선택한다", () => {
  const a = fixture({ id: "a", popularityScore: 5, longitude: 129, recommendedDuration: 30 });
  const near = fixture({ id: "near", popularityScore: 1, longitude: 129.001, recommendedDuration: 30 });
  const famous = fixture({ id: "famous", popularityScore: 5, longitude: 129.05, recommendedDuration: 30 });
  const catalog = catalogOf([a, near, famous]);
  assert.deepEqual(recommendPlaces({ ...profile, popularityPreference: "famous" }, catalog).slice(0, 2).map(p => p.id), ["a", "famous"]);
  assert.deepEqual(recommendPlaces(profile, catalog).slice(0, 2).map(p => p.id), ["a", "near"]);
});

test("희망 지역은 관광지와 음식점 및 카페에 모두 적용하며 지역 미확인은 제외한다", () => {
  const local = fixture({ id: "local", district: "buk" });
  const outside = fixture({ id: "outside", district: "dong", isTourismDure: true });
  const unknown = fixture({ id: "unknown", district: null });
  const food = fixture({ id: "food", district: "dong", type: "restaurant" });
  const cafe = fixture({ id: "cafe", district: "dong", type: "cafe" });
  const catalog = catalogOf([local, outside, unknown, food, cafe]);
  assert.deepEqual(recommendPlaces({ ...profile, region: "buk" }, catalog).map(p => p.id), ["local"]);
  assert.deepEqual(recommendPlaces({ ...profile, region: "ulju" }, catalog), []);
  assert.equal(rankPlaces(profile, [local, outside, unknown]).length, 3);
  for (const region of Object.keys(DISTRICT_LABELS) as (keyof typeof DISTRICT_LABELS)[]) {
    const result = recommendPlaces({ ...profile, region }, placeCatalog);
    assert.ok(result.length > 0, region);
    assert.ok(result.every(p => p.district === region), region);
  }
});

test("경로 설문 응답은 필수이며 유형검사 취향과 합쳐 프로필이 된다", () => {
  const taste = { popularityPreference: "famous" as const, activityLevel: 2 as const, restFrequency: 5 as const, interests: ["nature" as const, "food" as const] };
  const answers: SurveyAnswers = {
    companion: "family", transport: "car", preferredFood: "any", access: "none",
    startTime: "09:00", endTime: "18:00",
  };
  assert.equal(buildUserProfile(answers, taste), null);
  answers.region = "ulju";
  const built = buildUserProfile(answers, taste);
  assert.equal(built?.popularityPreference, "famous");
  assert.equal(built?.region, "ulju");
  assert.equal(built?.activityLevel, 2);
  assert.deepEqual(built?.interests, ["nature", "food"]);
  assert.notEqual(built?.interests, taste.interests);
  answers.region = "invalid";
  assert.equal(buildUserProfile(answers, taste), null);
});


test("필수 장소는 낮은 점수여도 먼저 확보하며 나머지 일정 추가 후에도 유지한다", () => {
  const required = fixture({ id: "required", popularityScore: 1, familyScore: 1, recommendedDuration: 30 });
  const other = fixture({ id: "other", popularityScore: 5, recommendedDuration: 30, longitude: 129.44 });
  const selected = { ...profile, popularityPreference: "famous" as const, requiredPlaceIds: ["required"] };
  const result = recommendPlaces(selected, catalogOf([other, required]));
  assert.equal(result[0].id, "required");
  assert.ok(result.some(p => p.id === "other"));
  assert.equal(result.filter(p => p.id === "required").length, 1);
});

test("필수 장소 이동 시간을 먼저 확보하여 추가 관광지 때문에 필수 장소가 밀리지 않는다", () => {
  const a = fixture({ id: "a", recommendedDuration: 30 });
  const b = fixture({ id: "b", longitude: 129.5, recommendedDuration: 30 });
  const extra = fixture({ id: "extra", recommendedDuration: 90 });
  const selected = { ...profile, endTime: "11:00" as const, requiredPlaceIds: ["a", "b"] };
  const result = recommendPlacesWithBreakdown(selected, catalogOf([a, b, extra]));
  assert.deepEqual(result.map(item => item.place.id), ["a", "b"]);
  assert.ok(createSchedule(selected, result).every(stop => stop.departureMinutes <= 660));
});

test("지역 충돌·좌표 누락·존재하지 않는 필수 장소·시간 초과는 명시적으로 안내한다", () => {
  const required = fixture({ id: "required", district: "dong", recommendedDuration: 90 });
  const catalog = catalogOf([required]);
  assert.match(getRequiredPlaceIssues({ ...profile, region: "buk", requiredPlaceIds: ["required"] }, catalog).join(), /여행 지역/);
  assert.deepEqual(recommendPlaces({ ...profile, region: "buk", requiredPlaceIds: ["required"] }, catalog), []);
  assert.deepEqual(getRequiredPlaceIssues({ ...profile, region: "all", requiredPlaceIds: ["required"] }, catalog), []);
  assert.match(getRequiredPlaceIssues({ ...profile, endTime: "09:30", requiredPlaceIds: ["required"] }, catalog).join(), /초과/);
  assert.match(getRequiredPlaceIssues({ ...profile, requiredPlaceIds: ["missing"] }, catalog).join(), /찾을 수 없/);
  assert.match(getRequiredPlaceIssues({ ...profile, requiredPlaceIds: ["required"] }, catalogOf([{ ...required, latitude: null }])).join(), /위치/);
  assert.match(getRequiredPlaceIssues({ ...profile, requiredPlaceIds: ["required", "required"] }, catalog).join(), /중복/);
  assert.match(getRequiredPlaceIssues({ ...profile, requiredPlaceIds: ["a", "b", "c"] }, catalog).join(), /최대 2곳/);
});

test("필수 음식점과 카페도 거리·휴식 취향보다 우선하며 동일 유형을 자동 추가하지 않는다", () => {
  const food = fixture({ id: "food", type: "restaurant", recommendedDuration: 30 });
  const cafe = fixture({ id: "cafe", type: "cafe", recommendedDuration: 30 });
  const moreFood = fixture({ ...food, id: "more-food" });
  const moreCafe = fixture({ ...cafe, id: "more-cafe" });
  const attraction = fixture({ id: "attraction", recommendedDuration: 30 });
  const selected = { ...profile, restFrequency: 1 as const, requiredPlaceIds: ["food", "cafe"] };
  const result = recommendPlaces(selected, catalogOf([food, cafe, moreFood, moreCafe, attraction]));
  assert.deepEqual(result.slice(0, 2).map(p => p.id), ["food", "cafe"]);
  assert.ok(result.some(p => p.id === "attraction"));
  assert.equal(result.filter(p => p.type === "restaurant").length, 1);
  assert.equal(result.filter(p => p.type === "cafe").length, 1);
  assert.deepEqual(recommendPlaces(selected, catalogOf([food, cafe])).map(p => p.id), ["food", "cafe"]);
});

test("필수 장소 질문은 건너뛸 수 있고 최대 두 곳까지 프로필에 전달된다", () => {
  assert.equal(isQuestionAnswered("requiredPlaces", {}), true);
  assert.equal(isQuestionAnswered("requiredPlaces", { requiredPlaceIds: [] }), true);
  assert.equal(isQuestionAnswered("requiredPlaces", { requiredPlaceIds: ["a", "b"] }), true);
  assert.equal(isQuestionAnswered("requiredPlaces", { requiredPlaceIds: ["a", "b", "c"] }), false);
  const answers: SurveyAnswers = {
    region: "all", companion: "family", transport: "car", access: "pets",
    preferredFood: "any", startTime: "09:00", endTime: "18:00", requiredPlaceIds: ["a", "b"],
  };
  const built = buildUserProfile(answers, profile);
  assert.deepEqual(built?.requiredPlaceIds, ["a", "b"]);
  assert.deepEqual(built?.accessNeeds, { wheelchair: false, pets: true });
  assert.notEqual(built?.requiredPlaceIds, answers.requiredPlaceIds);
});


test("표시용 취향 적합도는 유명도·관광두레 가점과 독립적이고 정수 퍼센트이다", () => {
  const place = fixture({ category: "nature", familyScore: 5, activityLevel: 2, restScore: 5 });
  assert.equal(calculatePreferenceFit(scorePlace(profile, place)), 100);
  const changed = scorePlace({ ...profile, popularityPreference: "hidden" }, { ...place, popularityScore: 1, isTourismDure: true });
  assert.equal(calculatePreferenceFit(changed), 100);
  assert.equal(calculatePreferenceFit(scorePlace({ ...profile, interests: ["culture"], activityLevel: 5 }, { ...place, familyScore: 1, restScore: 1 })), 5);
  places.forEach(place => {
    const fit = calculatePreferenceFit(scorePlace(profile, place));
    assert.ok(Number.isInteger(fit) && fit >= 0 && fit <= 100);
  });
});

test("혼자 여행·관심사 무관·휴식 불필요는 맞는 활동의 적합도를 낮추지 않는다", () => {
  const unrestricted = { ...profile, companion: "solo" as const, interests: [], preferredFood: [], restFrequency: 1 as const };
  assert.equal(calculatePreferenceFit(scorePlace(unrestricted, fixture({ activityLevel: 2, restScore: 1 }))), 100);
  const moderateRest = { ...unrestricted, restFrequency: 3 as const };
  assert.equal(calculatePreferenceFit(scorePlace(moderateRest, fixture({ activityLevel: 2, restScore: 5 }))), 100);
  assert.ok(calculatePreferenceFit(scorePlace(moderateRest, fixture({ activityLevel: 5, restScore: 1 }))) < 100);
});

test("음식점과 카페 적합도는 관광 관심사의 불일치로 감점하지 않는다", () => {
  const selected = { ...profile, companion: "solo" as const, interests: ["nature"] as UserProfile["interests"], restFrequency: 1 as const, activityLevel: 1 as const };
  assert.equal(calculatePreferenceFit(scorePlace(selected, fixture({ type: "restaurant", category: "korean", activityLevel: 1 }))), 90);
  assert.equal(calculatePreferenceFit(scorePlace(selected, fixture({ type: "cafe", category: "cafe", activityLevel: 1 }))), 100);
});

test("다음 관광지는 조금 더 멀어도 취향에 잘 맞는 후보를 우선한다", () => {
  const anchor = fixture({ id: "a", category: "nature", activityLevel: 2, recommendedDuration: 30 });
  const nearPoor = fixture({ id: "poor", category: "culture", activityLevel: 5, longitude: anchor.longitude! + 0.001, recommendedDuration: 30 });
  const better = fixture({ id: "better", category: "nature", activityLevel: 2, longitude: anchor.longitude! + 0.02, recommendedDuration: 30 });
  const result = recommendPlaces({ ...profile, requiredPlaceIds: ["a"] }, catalogOf([anchor, nearPoor, better]));
  assert.deepEqual(result.slice(0, 2).map(place => place.id), ["a", "better"]);
});


test("음식점은 음식 선호 일치 또는 제한 없음이면 공통 초기 점수와 무관하게 높은 적합도이다", () => {
  const food = fixture({ type: "restaurant", category: "korean", activityLevel: 1, familyScore: 4, coupleScore: 3, friendScore: 4, restScore: 3 });
  const active = { ...profile, companion: "couple" as const, activityLevel: 5 as const, restFrequency: 5 as const };
  assert.equal(calculatePreferenceFit(scorePlace(active, food)), 90);
  assert.equal(calculatePreferenceFit(scorePlace({ ...active, preferredFood: [] }, food)), 85);
  assert.equal(calculatePreferenceFit(scorePlace({ ...active, preferredFood: ["western"] }, food)), 0);
  assert.equal(calculatePreferenceFit(scorePlace(active, { ...food, category: "other-food" })), 50);
  assert.equal(calculatePreferenceFit(scorePlace({ ...active, preferredFood: ["vegetarian"] }, food)), 50);
});

test("암각화 여행자 유형: 16개 코드가 모두 정의되고 설문 프로필로 계산된다", async () => {
  const { PETROGLYPH_TYPES } = await import("../data/petroglyph-types");
  const { getPetroglyphCode, getRelations, findPetroglyphType } = await import("./petroglyph-type");
  const codes = new Set(PETROGLYPH_TYPES.map((type) => type.code));
  assert.equal(codes.size, 16);
  for (const a of "AS") for (const b of "NC") for (const c of "ET") for (const d of "FL") assert.ok(codes.has(a + b + c + d));
  assert.equal(getPetroglyphCode(profile), "SNEF");
  assert.equal(getPetroglyphCode({ ...profile, activityLevel: 5, interests: ["culture", "food"], popularityPreference: "hidden" }), "ACTL");
  assert.equal(getPetroglyphCode({ ...profile, activityLevel: 3, restFrequency: 1, interests: [] }), "ANEF");
  assert.equal(getPetroglyphCode({ ...profile, activityLevel: 3, restFrequency: 5, interests: ["nature", "culture"] }), "SNEF");
  const { best, pace } = getRelations("ANEF");
  assert.equal(best, "ANTF");
  assert.equal(pace, "SNEF");
  assert.ok(findPetroglyphType(best) && findPetroglyphType(pace));
});

test("유형검사: 12문항이 축마다 3개씩이고 응답으로 유형과 추천 취향을 계산한다", async () => {
  const { TYPE_TEST_QUESTIONS } = await import("../data/type-test");
  const { scoreTypeTest } = await import("./type-test");
  const { getPetroglyphCode } = await import("./petroglyph-type");
  assert.equal(TYPE_TEST_QUESTIONS.length, 12);
  for (const axis of [0, 1, 2, 3]) assert.equal(TYPE_TEST_QUESTIONS.filter(q => q.axis === axis).length, 3);
  const pick = (code: string) => TYPE_TEST_QUESTIONS.map(q => q.options.find(o => o.letter === code[q.axis])!.letter);
  const answersFor = (code: string) => pick(code);
  // 16개 유형 모두 도달할 수 있고, 취향 값으로 다시 계산해도 같은 유형이 나온다.
  for (const a of "AS") for (const b of "NC") for (const c of "ET") for (const d of "FL") {
    const result = scoreTypeTest(answersFor(a + b + c + d));
    assert.equal(result?.code, a + b + c + d);
    assert.equal(getPetroglyphCode(result!.taste), a + b + c + d);
  }
  const allFirst = scoreTypeTest(answersFor("ANEF"))!;
  assert.deepEqual(allFirst.taste, { activityLevel: 5, restFrequency: 1, interests: ["nature", "experience"], popularityPreference: "famous" });
  assert.equal(scoreTypeTest(answersFor("SCTL"))!.taste.popularityPreference, "hidden");
  // 2:1로 갈린 축도 다수결을 따르고 취향 값이 일관된다.
  const mixed = answersFor("ANEF");
  const firstEnergy = TYPE_TEST_QUESTIONS.findIndex(q => q.axis === 0);
  const firstPlace = TYPE_TEST_QUESTIONS.findIndex(q => q.axis === 3);
  mixed[firstEnergy] = "S";
  mixed[firstPlace] = "L";
  const mixedResult = scoreTypeTest(mixed)!;
  assert.equal(mixedResult.code, "ANEF");
  assert.equal(mixedResult.taste.activityLevel, 4);
  assert.equal(mixedResult.taste.popularityPreference, "any");
  assert.equal(getPetroglyphCode(mixedResult.taste), "ANEF");
  // 빠진 응답이나 다른 축 글자는 거부한다.
  assert.equal(scoreTypeTest(mixed.slice(0, 11)), null);
  assert.equal(scoreTypeTest(mixed.map((value, i) => (i === 0 ? "N" : value))), null);
});

test("휠체어·반려동물 조건은 어려운 관광지를 빼고 확인된 곳을 앞세운다", async () => {
  const { wheelchairVerdict, petVerdict } = await import("./access");
  const trail = fixture({ id: "trail", activityLevel: 5, indoor: false });
  const museum = fixture({ id: "museum", activityLevel: 1, indoor: true });
  const garden = { ...placeCatalog.attractions.find(p => p.id === "taehwagang-national-garden")! };
  assert.equal(wheelchairVerdict(trail), "no");
  assert.equal(petVerdict(museum), "no");
  assert.equal(wheelchairVerdict(garden), "yes");
  const wheelchair = { ...profile, accessNeeds: { wheelchair: true, pets: false } };
  const ranked = rankPlaces(wheelchair, [trail, museum, garden]).map(item => item.place.id);
  assert.ok(!ranked.includes("trail"));
  assert.ok(ranked.includes("museum"));
  const pets = { ...profile, accessNeeds: { wheelchair: false, pets: true } };
  assert.ok(!rankPlaces(pets, [trail, museum]).some(item => item.place.id === "museum"));
  // 조건이 없으면 아무것도 빼지 않는다.
  assert.equal(rankPlaces(profile, [trail, museum, garden]).length, 3);
  // 실제 데이터에서도 조건을 고르면 결과에 '어려움' 관광지가 없다.
  for (const region of ["all", "ulju", "dong", "jung"] as const) {
    const result = recommendPlaces({ ...profile, region, accessNeeds: { wheelchair: true, pets: true } }, placeCatalog);
    assert.ok(result.filter(p => p.type === "attraction").every(p => wheelchairVerdict(p) !== "no" && petVerdict(p) !== "no"), region);
  }
});

test("반구대 관람 지수: 햇빛 드는 계절 맑은 오후가 가장 높고 비·밤·그늘 계절은 낮다", async () => {
  const { scoreHour, floodRisk } = await import("./bangudae-forecast");
  const base = { precipitation: 0, precipitationProbability: 0, cloudCover: 0, visibility: 30000, directRadiation: 600, isDay: true };
  const juneAfternoon = scoreHour({ ...base, time: "2026-06-15T15:00" });
  const juneMorning = scoreHour({ ...base, time: "2026-06-15T09:00" });
  const octoberAfternoon = scoreHour({ ...base, time: "2026-10-15T15:00" });
  const rainy = scoreHour({ ...base, time: "2026-06-15T15:00", precipitation: 3 });
  const night = scoreHour({ ...base, time: "2026-06-15T21:00", isDay: false });
  assert.equal(juneAfternoon.level, "good");
  assert.ok(juneAfternoon.score > juneMorning.score);
  assert.ok(juneAfternoon.score > octoberAfternoon.score);
  assert.notEqual(octoberAfternoon.level, "good");
  assert.equal(rainy.level, "poor");
  assert.equal(night.score, 0);
  assert.equal(floodRisk(20, 10), "low");
  assert.equal(floodRisk(200, 40), "possible");
  assert.equal(floodRisk(120, 160), "high");
});

test("캐릭터 한마디는 데이터에 맞는 문장을 고르고 항상 한 줄 이상 말한다", async () => {
  const { characterQuips } = await import("./character-voice");
  const garden = placeCatalog.attractions.find(p => p.id === "taehwagang-national-garden")!;
  const { getPlaceStory } = await import("../data/place-stories");
  const evening = characterQuips({ code: "SNEF", profile, place: garden, story: getPlaceStory(garden.id), arrivalMinutes: 18 * 60, travelMinutes: 0, isFirst: false, isLast: true });
  assert.match(evening.lines[0], /해 질 무렵/);
  assert.equal(evening.cry, "쉬엄쉬엄 가자.");
  const plain = characterQuips({ code: "ACTL", profile, place: fixture({ id: "plain", indoor: false, activityLevel: 2 }), arrivalMinutes: 600, travelMinutes: 25, isFirst: false, isLast: false });
  assert.ok(plain.lines.length >= 1 && plain.lines.length <= 2);
});

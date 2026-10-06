import type { Place, PlaceCatalog, Score, Transport, UserProfile } from "../types/travel";
import { CATEGORY_INTERESTS } from "./place-categories";
import { hasCoordinates } from "./place-coordinates";
import { accessBonus, isAccessibleFor } from "./access";

export { CATEGORY_INTERESTS } from "./place-categories";

/** 기본 점수는 최대 100점, 관광두레는 별도 가점입니다. */
export const RECOMMENDATION_WEIGHTS = {
  interest: 25,
  companion: 20,
  activity: 15,
  rest: 15,
  popularity: 25,
  tourismDure: 8,
} as const;

export const RECOMMENDATION_RULES = {
  attractionCount: 3,
  extendedAttractionCount: 4,
  extendedTripMinutes: 360,
  restaurantCount: 1,
  cafeCount: 1,
  cafeRestThreshold: 4,
  neutralMatch: 0.5,
} as const;

export interface ScoreDetail {
  /** 가중치를 적용하기 전의 일치도(0~1). */
  match: number;
  weight: number;
  points: number;
  reason: string;
}

export type ScoreBreakdown = Record<keyof typeof RECOMMENDATION_WEIGHTS, ScoreDetail>;

export interface ScoredPlace {
  place: Place;
  totalScore: number;
  preferenceFit: number;
  breakdown: ScoreBreakdown;
  /** 휠체어·반려동물 조건에서 확인된 장소를 앞세우는 선정 가점(화면 점수에는 포함하지 않음). */
  accessBonus?: number;
}

/** 화면용 취향 적합도. 유명도·관광두레는 제외하며 만족 확률을 뜻하지 않습니다. */
export function calculatePreferenceFit(recommendation: ScoredPlace): number {
  return recommendation.preferenceFit;
}

function preferenceFit(profile: UserProfile, place: Place, breakdown: ScoreBreakdown): number {
  if (place.type === "restaurant") {
    // 식당 공통 초기 활동·동행·휴식 값은 음식 취향 적합도에 사용하지 않습니다.
    if (profile.preferredFood.length === 0) return 85;
    if (place.category === "other-food" || profile.preferredFood.every(food => food === "vegetarian")) return 50;
    return profile.preferredFood.some(food => food === place.category) ? 90 : 0;
  }
  const details = [breakdown.activity];
  if (profile.companion !== "solo") details.push(breakdown.companion);
  if (place.type === "attraction" && profile.interests.some(interest => ["nature", "sea", "culture", "experience"].includes(interest))) {
    details.push(breakdown.interest);
  }
  // 휴식 필요도는 중요도로 반영하고, 휴식이 적게 필요하다는 이유로 감점하지 않습니다.
  const restImportance = (profile.restFrequency - 1) / 4;
  if (restImportance > 0) details.push(detail((place.restScore - 1) / 4, RECOMMENDATION_WEIGHTS.rest * restImportance, ""));
  const maximum = details.reduce((sum, item) => sum + item.weight, 0);
  const points = details.reduce((sum, item) => sum + item.points, 0);
  return maximum > 0 ? Math.round(Math.min(1, Math.max(0, points / maximum)) * 100) : 0;
}

/** 취향에 더 잘 맞는 후보를 우선하기 위한 내부 선정 점수입니다. */
function selectionScore(candidate: ScoredPlace): number {
  return candidate.totalScore + candidate.preferenceFit * 0.5 + (candidate.accessBonus ?? 0);
}

function detail(match: number, weight: number, reason: string): ScoreDetail {
  return { match, weight, points: match * weight, reason };
}

/** 1~5 척도의 거리가 작을수록 높은 일치도입니다. */
export function scoreSimilarity(preference: Score, value: Score): number {
  return 1 - Math.abs(preference - value) / 4;
}

export function calculateInterestMatch(profile: UserProfile, place: Place): number {
  const supportedInterests = profile.interests.filter((interest) => interest !== "photo");
  const categoryMatch = supportedInterests.length === 0
    ? RECOMMENDATION_RULES.neutralMatch
    : Number(supportedInterests.some((interest) => CATEGORY_INTERESTS[place.category].includes(interest)));

  // 음식점은 관심사와 음식 선호도를 동등하게 반영합니다. 음식 선호는 필터가 아닙니다.
  if (place.type !== "restaurant" || profile.preferredFood.length === 0) return categoryMatch;
  const foodMatch = place.category === "other-food"
    ? RECOMMENDATION_RULES.neutralMatch
    : Number(profile.preferredFood.some((food) => food === place.category));
  return (categoryMatch + foodMatch) / 2;
}

export function calculateCompanionMatch(profile: UserProfile, place: Place): number {
  // 혼자 여행하는 경우에 대응하는 장소 점수가 없으므로 모든 장소에 같은 중립값을 적용합니다.
  if (profile.companion === "solo") return RECOMMENDATION_RULES.neutralMatch;
  const score = {
    family: place.familyScore,
    couple: place.coupleScore,
    friends: place.friendScore,
  }[profile.companion];
  return (score - 1) / 4;
}

/** 장소 하나의 점수와 설명을 계산하며 입력 객체를 변경하지 않습니다. */
export function scorePlace(profile: UserProfile, place: Place): ScoredPlace {
  const interest = calculateInterestMatch(profile, place);
  const companion = calculateCompanionMatch(profile, place);
  const activity = scoreSimilarity(profile.activityLevel, place.activityLevel);
  // 휴식이 드문 사용자도 휴식하기 좋은 장소에 불이익을 받지 않도록 필요도 × 적합도로 계산합니다.
  const rest = ((profile.restFrequency - 1) / 4) * ((place.restScore - 1) / 4);
  const interestReasons: Partial<Record<Place["category"], string>> = {
    nature: "자연을 즐기는 여행을 좋아하셔서, 주변 풍경을 감상하며 보내는 시간이 잘 맞을 것 같아요.",
    sea: "자연과 바다에 관심이 있으셔서, 해안 풍경을 즐기는 시간이 만족스러울 것 같아요.",
    culture: "역사와 문화에 관심이 있으셔서, 지역의 이야기를 알아가는 재미를 느끼기 좋아요.",
    experience: "직접 참여하는 여행을 좋아하셔서, 새로운 경험을 해보는 시간이 잘 맞을 것 같아요.",
  };
  const companionPhrase = { solo: "혼자", family: "가족과", couple: "연인과", friends: "친구들과" }[profile.companion];
  const breakdown: ScoreBreakdown = {
    interest: detail(interest, RECOMMENDATION_WEIGHTS.interest,
      interest >= 0.75
        ? place.type === "restaurant" ? "맛집을 찾는 취향이나 선호하는 음식 종류와 잘 맞아, 식사 시간이 즐거울 것 같아요."
          : interestReasons[place.category] ?? "관심 있는 여행 주제와 연결되는 장소라 즐겁게 둘러보기 좋아요."
        : "관심사만으로 잘 맞는지 판단하기는 어려운 장소예요."),
    companion: detail(companion, RECOMMENDATION_WEIGHTS.companion,
      profile.companion === "solo" ? "혼자 방문하는 여행에 대한 별도 정보는 없어요."
        : companion >= 0.75 ? `${companionPhrase} 함께 시간을 보내기 좋은 편이라, 이번 동행과 즐거운 추억을 만들기 좋아요.`
          : "동행과 잘 맞는지는 다른 여행 취향도 함께 살펴보면 좋아요."),
    activity: detail(activity, RECOMMENDATION_WEIGHTS.activity,
      activity >= 0.75
        ? profile.activityLevel <= 2 ? "부담 없는 활동을 선호하셔서, 크게 무리하지 않고 편안하게 즐기기 좋아요."
          : profile.activityLevel >= 4 ? "활동적인 여행을 좋아하셔서, 몸을 움직이며 보내는 시간이 잘 맞을 것 같아요."
            : "적당히 활동하는 여행을 선호하셔서, 원하는 여행 속도에 맞춰 즐기기 좋아요."
        : "평소 선호하는 활동량과 차이가 있어 컨디션에 맞춰 방문하면 좋아요."),
    rest: detail(rest, RECOMMENDATION_WEIGHTS.rest,
      rest >= 0.5 ? "여행 중 쉬어가는 시간을 원하셔서, 잠시 머물며 여유를 즐기기 좋은 장소예요."
        : "휴식보다는 다른 여행 취향을 중심으로 고려한 장소예요."),
    popularity: detail(profile.popularityPreference === "any" ? 0.5
      : profile.popularityPreference === "famous" ? (place.popularityScore - 1) / 4 : (5 - place.popularityScore) / 4,
      RECOMMENDATION_WEIGHTS.popularity,
      profile.popularityPreference === "any" ? "유명도에 제한 없이 추천해요."
        : `${profile.popularityPreference === "famous" ? "유명한 대표 명소" : "덜 알려진 장소"} 선호와 편집 유명도 ${place.popularityScore}/5를 반영했어요.`),
    tourismDure: detail(Number(place.isTourismDure === true), RECOMMENDATION_WEIGHTS.tourismDure,
      place.isTourismDure === null ? "관광두레 여부가 확인되지 않아 가점을 적용하지 않았어요."
        : place.isTourismDure ? "등록 데이터의 관광두레 여부에 따라 가점을 적용했어요." : "관광두레 가점이 없는 장소예요."),
  };
  return {
    place, breakdown,
    totalScore: Object.values(breakdown).reduce((sum, item) => sum + item.points, 0),
    preferenceFit: preferenceFit(profile, place, breakdown),
    accessBonus: accessBonus(profile.accessNeeds, place),
  };
}

function compareScores(a: ScoredPlace, b: ScoredPlace): number {
  return selectionScore(b) - selectionScore(a) || (a.place.id < b.place.id ? -1 : a.place.id > b.place.id ? 1 : 0);
}

/** 같은 ID는 점수가 가장 높은 항목 하나만 유지합니다. 동점은 ID순입니다. */
export function rankPlaces(profile: UserProfile, places: readonly Place[]): ScoredPlace[] {
  const ranked = places.filter((place) => (profile.region === "all" || place.district === profile.region) && isAccessibleFor(profile.accessNeeds, place)).map((place) => scorePlace(profile, place)).sort(compareScores);
  const seen = new Set<string>();
  return ranked.filter(({ place }) => {
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

function minutes(time: UserProfile["startTime"]): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

/** 좌표 기준 직선 거리(km). 실제 도로 거리나 이동 시간이 아닙니다. */
export function distanceKm(a: Place, b: Place): number {
  if (!hasCoordinates(a) || !hasCoordinates(b)) return Infinity;
  const rad = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * rad / 2) ** 2
    + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad)
    * Math.sin((b.longitude - a.longitude) * rad / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}

/** 경로 API가 없는 상태의 계획용 가정입니다. 실제 교통 통계가 아닙니다. */
export const TRAVEL_ASSUMPTIONS = {
  car: { distanceFactor: 1.35, speedKmh: 30, overheadMinutes: 8 },
  "public-transit": { distanceFactor: 1.5, speedKmh: 20, overheadMinutes: 20 },
  walking: { distanceFactor: 1.2, speedKmh: 4, overheadMinutes: 0 },
} as const;

/** 자가용은 주차 여유, 대중교통은 접근·대기·환승 여유를 포함합니다. */
export function estimateTravelMinutes(a: Place, b: Place, transport: Transport): number {
  const distance = distanceKm(a, b);
  if (!Number.isFinite(distance)) return Infinity;
  if (distance === 0) return 0;
  // 가까운 대중교통 구간은 도보 이동으로 계획합니다.
  const assumptions = TRAVEL_ASSUMPTIONS[transport === "public-transit" && distance <= 0.6 ? "walking" : transport];
  return Math.ceil((distance * assumptions.distanceFactor / assumptions.speedKmh * 60 + assumptions.overheadMinutes) / 5) * 5;
}

export interface ScheduledStop {
  recommendation: ScoredPlace;
  travelMinutes: number;
  arrivalMinutes: number;
  departureMinutes: number;
}

export function createSchedule(profile: UserProfile, stops: readonly ScoredPlace[]): ScheduledStop[] {
  let cursor = minutes(profile.startTime);
  const routableStops = stops.filter(({ place }) => hasCoordinates(place)
    && Number.isFinite(place.recommendedDuration) && place.recommendedDuration > 0);
  return routableStops.map((recommendation, index) => {
    const travelMinutes = index === 0 ? 0 : estimateTravelMinutes(routableStops[index - 1].place, recommendation.place, profile.transport);
    const arrivalMinutes = cursor + travelMinutes;
    cursor = arrivalMinutes + recommendation.place.recommendedDuration;
    return { recommendation, travelMinutes, arrivalMinutes, departureMinutes: cursor };
  });
}

export function formatScheduleTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function fitsSchedule(profile: UserProfile, route: readonly ScoredPlace[]): boolean {
  const schedule = createSchedule(profile, route);
  return schedule.length === 0 || schedule[schedule.length - 1].departureMinutes <= minutes(profile.endTime);
}

/** 필수 장소가 조건에 맞지 않으면 일부만 누락하지 않고 조정할 내용을 안내합니다. */
export function getRequiredPlaceIssues(profile: UserProfile, catalog: PlaceCatalog): string[] {
  const ids = profile.requiredPlaceIds ?? [];
  if (ids.length > 2 || new Set(ids).size !== ids.length) return ["필수 장소는 중복 없이 최대 2곳까지 선택해주세요."];
  const places = [...catalog.attractions, ...catalog.restaurants, ...catalog.cafes];
  const issues: string[] = [];
  const required: ScoredPlace[] = [];
  for (const id of ids) {
    const place = places.find(place => place.id === id);
    if (!place) { issues.push("선택한 필수 장소를 찾을 수 없습니다. 다시 선택해주세요."); continue; }
    if (!hasCoordinates(place) || !Number.isFinite(place.recommendedDuration) || place.recommendedDuration <= 0) {
      issues.push(`${place.name}: 위치 또는 체류 시간 정보가 없어 일정에 포함할 수 없습니다. 다른 장소를 선택해주세요.`);
      continue;
    }
    if (profile.region !== "all" && place.district !== profile.region) {
      issues.push(`${place.name}: 선택한 여행 지역 밖이거나 지역 미확인 장소입니다. 여행 지역을 울산 전체로 바꾸거나 필수 장소를 조정해주세요.`);
    }
    required.push(scorePlace(profile, place));
  }
  if (required.length && !fitsSchedule(profile, required)) {
    issues.push("필수 장소의 체류·이동 시간이 여행 시간을 초과합니다. 여행 시간을 늘리거나 필수 장소를 줄여주세요.");
  }
  return issues;
}

/** 각 추가 방문의 관광지 반경 및 전체 일정에 더해지는 우회 거리 상한(km). */
export const FOOD_DISTANCE_LIMITS = {
  car: { radius: 3, detour: 4 },
  "public-transit": { radius: 1, detour: 1.5 },
  walking: { radius: 0.6, detour: 0.8 },
} as const;

/**
 * 관광지를 먼저 선정하고 가까운 순서로 연결한 뒤 식사·휴식을 삽입합니다.
 * 반환 순서는 화면과 지도에 사용할 방문 순서입니다. 후보가 없으면 생략합니다.
 * 체류·예상 이동시간을 여행 시간 안에 배정합니다. 실제 경로와 영업시간은 검증하지 않습니다.
 */
export function recommendPlacesWithBreakdown(profile: UserProfile, catalog: PlaceCatalog): ScoredPlace[] {
  const duration = minutes(profile.endTime) - minutes(profile.startTime);
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const count = duration >= RECOMMENDATION_RULES.extendedTripMinutes
    ? RECOMMENDATION_RULES.extendedAttractionCount : RECOMMENDATION_RULES.attractionCount;
  if (getRequiredPlaceIssues(profile, catalog).length) return [];
  const requiredIds = new Set(profile.requiredPlaceIds ?? []);
  const allPlaces = [...catalog.attractions, ...catalog.restaurants, ...catalog.cafes];
  const route: ScoredPlace[] = (profile.requiredPlaceIds ?? []).map(id => scorePlace(profile, allPlaces.find(place => place.id === id)!));
  const remaining = rankPlaces(profile, catalog.attractions.filter(place => hasCoordinates(place) && !requiredIds.has(place.id)));
  while (remaining.length && route.filter(({ place }) => place.type === "attraction").length < count) {
    const previous = route[route.length - 1];
    if (previous) remaining.sort((a, b) => {
      const distanceA = distanceKm(previous.place, a.place);
      const distanceB = distanceKm(previous.place, b.place);
      const penalty = profile.transport === "car" ? 0.3 : profile.transport === "public-transit" ? 1 : 3;
      return (selectionScore(b) - distanceB * penalty) - (selectionScore(a) - distanceA * penalty) || compareScores(a, b);
    });
    const candidate = remaining.shift()!;
    if (Number.isFinite(distanceKm(candidate.place, candidate.place))
      && Number.isFinite(candidate.place.recommendedDuration) && candidate.place.recommendedDuration > 0
      && fitsSchedule(profile, [...route, candidate])) route.push(candidate);
  }
  const attractions = route.filter(({ place }) => place.type === "attraction");
  if (!route.length) return [];
  const limits = FOOD_DISTANCE_LIMITS[profile.transport];
  const used = new Set(route.map(({ place }) => place.id));
  const insertNearby = (candidates: readonly Place[]) => {
    const options = rankPlaces(profile, candidates.filter(hasCoordinates)).flatMap((candidate) => {
      if (used.has(candidate.place.id)) return [];
      const nearest = Math.min(...attractions.map(({ place }) => distanceKm(place, candidate.place)));
      if (nearest > limits.radius) return [];
      // 첫 관광지 방문 후부터 삽입합니다. 마지막 위치는 편도 이동으로 계산합니다.
      return route.flatMap((stop, index) => {
        const next = route[index + 1];
        const detour = next
          ? Math.max(0, distanceKm(stop.place, candidate.place) + distanceKm(candidate.place, next.place) - distanceKm(stop.place, next.place))
          : distanceKm(stop.place, candidate.place);
        if (!Number.isFinite(detour) || detour > limits.detour) return [];
        const proposed = [...route];
        proposed.splice(index + 1, 0, candidate);
        if (!fitsSchedule(profile, proposed)) return [];
        return [{ candidate, index, detour, priority: selectionScore(candidate) - 20 * detour / limits.detour }];
      });
    });
    options.sort((a, b) => b.priority - a.priority || a.detour - b.detour || compareScores(a.candidate, b.candidate) || a.index - b.index);
    const best = options[0];
    if (best) {
      route.splice(best.index + 1, 0, best.candidate);
      used.add(best.candidate.place.id);
    }
  };
  if (!route.some(({ place }) => place.type === "restaurant")) insertNearby(catalog.restaurants);
  if (!route.some(({ place }) => place.type === "cafe") && profile.restFrequency >= RECOMMENDATION_RULES.cafeRestThreshold) insertNearby(catalog.cafes);
  return route;
}

export function recommendPlaces(profile: UserProfile, catalog: PlaceCatalog): Place[] {
  return recommendPlacesWithBreakdown(profile, catalog).map(({ place }) => place);
}

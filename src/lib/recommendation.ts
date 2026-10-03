import type { Interest, Place, PlaceCatalog, PlaceCategory, Score, Transport, UserProfile } from "../types/travel";

/** 기본 점수는 최대 100점, 관광두레는 별도 가점입니다. */
export const RECOMMENDATION_WEIGHTS = {
  interest: 35,
  companion: 25,
  activity: 20,
  rest: 20,
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

/** 사진 적합도는 현재 장소 데이터에 없으므로 임의로 추정하지 않습니다. */
export const CATEGORY_INTERESTS: Readonly<Record<PlaceCategory, readonly Interest[]>> = {
  nature: ["nature"],
  sea: ["sea", "nature"],
  culture: ["culture"],
  experience: ["experience"],
  korean: ["food"],
  seafood: ["food"],
  cafe: ["food"],
};

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
  breakdown: ScoreBreakdown;
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
  const foodMatch = Number(profile.preferredFood.some((food) => food === place.category));
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
  const breakdown: ScoreBreakdown = {
    interest: detail(interest, RECOMMENDATION_WEIGHTS.interest,
      interest === 1 ? "관심사 또는 선호 음식 유형이 잘 맞아요." : interest === 0 ? "관심사 또는 선호 음식 유형과 일치하지 않아요." : "관심사와 음식 선호의 일부 일치 또는 정보가 없는 항목의 중립 점수예요."),
    companion: detail(companion, RECOMMENDATION_WEIGHTS.companion,
      profile.companion === "solo" ? "혼자 여행하는 적합도는 별도 정보가 없어 중립 점수를 적용했어요." : `동행 유형 적합도 ${Math.round(companion * 100)}%를 반영했어요.`),
    activity: detail(activity, RECOMMENDATION_WEIGHTS.activity,
      `선호 활동량 ${profile.activityLevel}점과 장소 활동량 ${place.activityLevel}점의 차이를 반영했어요.`),
    rest: detail(rest, RECOMMENDATION_WEIGHTS.rest,
      `휴식 빈도 ${profile.restFrequency}점과 장소의 휴식 적합도 ${place.restScore}점을 반영했어요.`),
    tourismDure: detail(Number(place.isTourismDure), RECOMMENDATION_WEIGHTS.tourismDure,
      place.isTourismDure ? "등록 데이터의 관광두레 여부에 따라 가점을 적용했어요." : "관광두레 가점이 없는 장소예요."),
  };
  return { place, totalScore: Object.values(breakdown).reduce((sum, item) => sum + item.points, 0), breakdown };
}

function compareScores(a: ScoredPlace, b: ScoredPlace): number {
  return b.totalScore - a.totalScore || (a.place.id < b.place.id ? -1 : a.place.id > b.place.id ? 1 : 0);
}

/** 같은 ID는 점수가 가장 높은 항목 하나만 유지합니다. 동점은 ID순입니다. */
export function rankPlaces(profile: UserProfile, places: readonly Place[]): ScoredPlace[] {
  const ranked = places.map((place) => scorePlace(profile, place)).sort(compareScores);
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
  const coords = [a.latitude, a.longitude, b.latitude, b.longitude];
  if (!coords.every(Number.isFinite) || Math.abs(a.latitude) > 90 || Math.abs(b.latitude) > 90
    || Math.abs(a.longitude) > 180 || Math.abs(b.longitude) > 180) return Infinity;
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
  return stops.map((recommendation, index) => {
    const travelMinutes = index === 0 ? 0 : estimateTravelMinutes(stops[index - 1].place, recommendation.place, profile.transport);
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
  const remaining = rankPlaces(profile, catalog.attractions);
  const route: ScoredPlace[] = [];
  while (remaining.length && route.length < count) {
    const previous = route[route.length - 1];
    if (previous) remaining.sort((a, b) => distanceKm(previous.place, a.place) - distanceKm(previous.place, b.place) || compareScores(a, b));
    const candidate = remaining.shift()!;
    if (Number.isFinite(distanceKm(candidate.place, candidate.place))
      && Number.isFinite(candidate.place.recommendedDuration) && candidate.place.recommendedDuration > 0
      && fitsSchedule(profile, [...route, candidate])) route.push(candidate);
  }
  const attractions = [...route];
  if (!attractions.length) return [];
  const limits = FOOD_DISTANCE_LIMITS[profile.transport];
  const used = new Set(route.map(({ place }) => place.id));
  const insertNearby = (candidates: readonly Place[]) => {
    const options = rankPlaces(profile, candidates).flatMap((candidate) => {
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
        return [{ candidate, index, detour, priority: candidate.totalScore - 20 * detour / limits.detour }];
      });
    });
    options.sort((a, b) => b.priority - a.priority || a.detour - b.detour || compareScores(a.candidate, b.candidate) || a.index - b.index);
    const best = options[0];
    if (best) {
      route.splice(best.index + 1, 0, best.candidate);
      used.add(best.candidate.place.id);
    }
  };
  insertNearby(catalog.restaurants);
  if (profile.restFrequency >= RECOMMENDATION_RULES.cafeRestThreshold) insertNearby(catalog.cafes);
  return route;
}

export function recommendPlaces(profile: UserProfile, catalog: PlaceCatalog): Place[] {
  return recommendPlacesWithBreakdown(profile, catalog).map(({ place }) => place);
}

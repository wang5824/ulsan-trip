import type { Interest, Place, PlaceCategory, Score, UserProfile } from "../types/travel";

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

/**
 * 카테고리별 상위 후보를 선택하고 전체 점수순으로 반환합니다. 방문 순서가 아닙니다.
 * 시간은 3/4개 선택의 기준일 뿐 체류·이동 시간, 영업시간, 교통 경로는 검증하지 않습니다.
 * 후보가 부족하면 있는 만큼만 반환하며 다른 카테고리로 채우지 않습니다.
 */
export function recommendPlacesWithBreakdown(profile: UserProfile, places: readonly Place[]): ScoredPlace[] {
  const duration = minutes(profile.endTime) - minutes(profile.startTime);
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const limits = {
    attraction: duration >= RECOMMENDATION_RULES.extendedTripMinutes
      ? RECOMMENDATION_RULES.extendedAttractionCount : RECOMMENDATION_RULES.attractionCount,
    restaurant: RECOMMENDATION_RULES.restaurantCount,
    cafe: profile.restFrequency >= RECOMMENDATION_RULES.cafeRestThreshold ? RECOMMENDATION_RULES.cafeCount : 0,
  };
  const counts = { attraction: 0, restaurant: 0, cafe: 0 };
  return rankPlaces(profile, places).filter(({ place }) => {
    if (counts[place.type] >= limits[place.type]) return false;
    counts[place.type] += 1;
    return true;
  });
}

/** 장소 배열만 필요한 호출부를 위한 간단한 API입니다. */
export function recommendPlaces(profile: UserProfile, places: readonly Place[]): Place[] {
  return recommendPlacesWithBreakdown(profile, places).map(({ place }) => place);
}

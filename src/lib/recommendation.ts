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
  cafeRestThreshold: 4,
  mealMinutes: 60,
  neutralMatch: 0.5,
} as const;

/** 계획용 식사 시간대입니다. 개별 식당의 영업시간을 뜻하지 않습니다. */
export const MEAL_WINDOWS = {
  lunch: { label: "점심 식사", start: 11 * 60 + 30, end: 14 * 60 },
  dinner: { label: "저녁 식사", start: 17 * 60 + 30, end: 20 * 60 },
} as const;
export type MealKind = keyof typeof MEAL_WINDOWS;

/** 여행 시간과 식사 시간대가 최소 한 끼(60분) 이상 겹치는 경우에만 자동 추천합니다. */
export function getMealWindows(profile: UserProfile): MealKind[] {
  return (Object.keys(MEAL_WINDOWS) as MealKind[]).filter(meal => {
    const window = MEAL_WINDOWS[meal];
    return Math.min(minutes(profile.endTime), window.end) - Math.max(minutes(profile.startTime), window.start)
      >= RECOMMENDATION_RULES.mealMinutes;
  });
}

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
  /** 자동 추천한 식사는 이 시간대를 지킵니다. 필수 음식점은 일정에서 시간대를 배정합니다. */
  meal?: MealKind;
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
  /** 식사 시간까지의 여유 시간. 이동·체류 시간과 별도로 표시합니다. */
  waitMinutes: number;
  meal?: MealKind;
}

export function createSchedule(profile: UserProfile, stops: readonly ScoredPlace[]): ScheduledStop[] {
  let cursor = minutes(profile.startTime);
  const meals = getMealWindows(profile);
  const usedMeals = new Set<MealKind>();
  const routableStops = stops.filter(({ place }) => hasCoordinates(place)
    && Number.isFinite(place.recommendedDuration) && place.recommendedDuration > 0);
  return routableStops.map((recommendation, index) => {
    const travelMinutes = index === 0 ? 0 : estimateTravelMinutes(routableStops[index - 1].place, recommendation.place, profile.transport);
    const reachedAt = cursor + travelMinutes;
    const meal = recommendation.place.type === "restaurant"
      ? recommendation.meal ?? meals.find(kind => !usedMeals.has(kind)
        && Math.max(reachedAt, MEAL_WINDOWS[kind].start) + recommendation.place.recommendedDuration
          <= Math.min(MEAL_WINDOWS[kind].end, minutes(profile.endTime)))
      : undefined;
    if (meal) usedMeals.add(meal);
    const arrivalMinutes = meal ? Math.max(reachedAt, MEAL_WINDOWS[meal].start) : reachedAt;
    cursor = arrivalMinutes + recommendation.place.recommendedDuration;
    return { recommendation, travelMinutes, arrivalMinutes, departureMinutes: cursor, waitMinutes: arrivalMinutes - reachedAt, meal };
  });
}

export function formatScheduleTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function fitsSchedule(profile: UserProfile, route: readonly ScoredPlace[]): boolean {
  const schedule = createSchedule(profile, route);
  if (schedule.length !== route.length) return false;
  const usedMeals = new Set<MealKind>();
  return schedule.every(stop => {
    if (stop.departureMinutes > minutes(profile.endTime)) return false;
    if (!stop.meal) return stop.recommendation.place.type !== "restaurant" || getMealWindows(profile).length === 0;
    const window = MEAL_WINDOWS[stop.meal];
    if (usedMeals.has(stop.meal) || stop.arrivalMinutes < window.start || stop.departureMinutes > window.end) return false;
    usedMeals.add(stop.meal);
    return true;
  });
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
    issues.push("필수 장소의 체류·이동 또는 식사 대기 시간이 여행 시간을 초과하거나 식사 시간대와 맞지 않습니다. 여행 시간이나 필수 장소의 순서·선택을 조정해주세요.");
  }
  return issues;
}

/** 각 추가 방문의 관광지 반경 및 전체 일정에 더해지는 우회 거리 상한(km). */
export const FOOD_DISTANCE_LIMITS = {
  car: { radius: 3, detour: 4 },
  "public-transit": { radius: 1, detour: 1.5 },
  walking: { radius: 0.6, detour: 0.8 },
} as const;

/** 후보를 한 위치에 넣을 때 늘어나는 직선 이동 거리입니다. */
function insertionDetour(route: readonly ScoredPlace[], candidate: ScoredPlace, index: number): number {
  const previous = route[index - 1]?.place;
  const next = route[index]?.place;
  if (previous && next) return Math.max(0, distanceKm(previous, candidate.place) + distanceKm(candidate.place, next) - distanceKm(previous, next));
  if (previous || next) return distanceKm((previous ?? next)!, candidate.place);
  return 0;
}

/** 관광지를 추가한 뒤에도 음식점·카페 때문에 먼 우회를 만들지 않습니다. */
function fitsFoodDistances(profile: UserProfile, route: readonly ScoredPlace[]): boolean {
  const attractions = route.filter(({ place }) => place.type === "attraction");
  const limits = FOOD_DISTANCE_LIMITS[profile.transport];
  return route.every((stop, index) => {
    if (stop.place.type === "attraction" || profile.requiredPlaceIds?.includes(stop.place.id)) return true;
    if (!attractions.some(({ place }) => distanceKm(place, stop.place) <= limits.radius)) return false;
    const without = route.filter((_, i) => i !== index);
    return insertionDetour(without, stop, index) <= limits.detour;
  });
}

interface Insertion {
  route: ScoredPlace[];
  priority: number;
  detour: number;
  index: number;
  candidate: ScoredPlace;
}

/** 식사 시간을 확보한 뒤 빈 구간과 끝부분을 관광지로 채웁니다. 방문 개수는 제한하지 않습니다. */
export function recommendPlacesWithBreakdown(profile: UserProfile, catalog: PlaceCatalog): ScoredPlace[] {
  const duration = minutes(profile.endTime) - minutes(profile.startTime);
  if (!Number.isFinite(duration) || duration <= 0 || getRequiredPlaceIssues(profile, catalog).length) return [];
  const allPlaces = [...catalog.attractions, ...catalog.restaurants, ...catalog.cafes];
  let route: ScoredPlace[] = (profile.requiredPlaceIds ?? []).map(id => scorePlace(profile, allPlaces.find(place => place.id === id)!));
  const valid = (place: Place) => hasCoordinates(place) && Number.isFinite(place.recommendedDuration) && place.recommendedDuration > 0;
  const attractions = rankPlaces(profile, catalog.attractions.filter(valid));
  const restaurants = rankPlaces(profile, catalog.restaurants.filter(valid));
  const cafes = rankPlaces(profile, catalog.cafes.filter(valid));
  const meals = getMealWindows(profile);
  const limits = FOOD_DISTANCE_LIMITS[profile.transport];
  const distancePenalty = profile.transport === "car" ? 0.3 : profile.transport === "public-transit" ? 1 : 3;

  // 이동 시작점이 되는 첫 관광지를 정합니다. 이후에는 이 장소의 앞뒤 식사와 빈 시간을 함께 계산합니다.
  if (!route.length) {
    const first = attractions.find(candidate => fitsSchedule(profile, [candidate]));
    if (!first) return [];
    route = [first];
    // 식사 시간에 출발하면 한 시간짜리 짧은 여행도 관광지가 식사 시간을 먼저 쓰지 않게 합니다.
    const startingMeal = meals.find(meal => minutes(profile.startTime) >= MEAL_WINDOWS[meal].start
      && minutes(profile.startTime) < MEAL_WINDOWS[meal].end);
    if (startingMeal) {
      const restaurant = restaurants.find(candidate => distanceKm(first.place, candidate.place) <= limits.radius
        && fitsSchedule(profile, [{ ...candidate, meal: startingMeal }]));
      if (restaurant) route = [{ ...restaurant, meal: startingMeal }];
    }
  }

  const bestInsertion = (candidates: readonly ScoredPlace[], preferLessWaiting = false): Insertion | undefined => {
    const used = new Set(route.map(({ place }) => place.id));
    const baseWait = createSchedule(profile, route).reduce((sum, stop) => sum + stop.waitMinutes, 0);
    let best: Insertion | undefined;
    for (const candidate of candidates) {
      if (used.has(candidate.place.id)) continue;
      const isAttraction = candidate.place.type === "attraction";
      if (!isAttraction && !route.some(({ place }) => place.type === "attraction" && distanceKm(place, candidate.place) <= limits.radius)) continue;
      for (let index = 0; index <= route.length; index++) {
        // 첫 관광지는 출발 기준점으로 유지합니다. 식당으로 시작한다면 그 전 여유 시간도 관광에 쓸 수 있습니다.
        if (index === 0 && isAttraction && route[0].place.type === "attraction") continue;
        if (index === 0 && candidate.place.type === "cafe") continue;
        const detour = insertionDetour(route, candidate, index);
        if (!Number.isFinite(detour) || (!isAttraction && detour > limits.detour)) continue;
        const proposed = [...route];
        proposed.splice(index, 0, candidate);
        if (!fitsSchedule(profile, proposed) || !fitsFoodDistances(profile, proposed)) continue;
        const waiting = createSchedule(profile, proposed).reduce((sum, stop) => sum + stop.waitMinutes, 0);
        // 같은 취향·동선이면 식사 전 빈 시간을 먼저 활용합니다.
        const priority = selectionScore(candidate) - detour * (isAttraction ? distancePenalty : 20 / limits.detour)
          + (baseWait - waiting) * (preferLessWaiting ? 1 : 0.05);
        const option = { route: proposed, priority, detour, index, candidate };
        if (!best || priority > best.priority || (priority === best.priority
          && (detour < best.detour || (detour === best.detour
            && (compareScores(candidate, best.candidate) < 0 || (candidate.place.id === best.candidate.place.id && index < best.index)))))) best = option;
      }
    }
    return best;
  };

  const insertMealsAndRest = () => {
    for (const meal of meals) {
      if (createSchedule(profile, route).some(stop => stop.meal === meal)) continue;
      const best = bestInsertion(restaurants.map(candidate => ({ ...candidate, meal })));
      if (best) route = best.route;
    }
    if (profile.restFrequency >= RECOMMENDATION_RULES.cafeRestThreshold && !route.some(({ place }) => place.type === "cafe")) {
      const best = bestInsertion(cafes);
      if (best) route = best.route;
    }
  };

  const reduceMealWaiting = () => {
    // 나중에 더해진 관광지 쪽으로 식당을 옮길 수 있으면, 처음 고른 식당으로 되돌아가며 기다리지 않습니다.
    for (const meal of meals) {
      const index = route.findIndex(stop => stop.meal === meal && !profile.requiredPlaceIds?.includes(stop.place.id));
      if (index < 0) continue;
      const original = route;
      const originalSchedule = createSchedule(profile, original);
      const originalWait = originalSchedule.reduce((sum, stop) => sum + stop.waitMinutes, 0);
      if (originalWait === 0) continue;
      route = route.filter((_, i) => i !== index);
      const best = bestInsertion(restaurants.map(candidate => ({ ...candidate, meal })), true);
      if (best) {
        const schedule = createSchedule(profile, best.route);
        const waiting = schedule.reduce((sum, stop) => sum + stop.waitMinutes, 0);
        if (waiting < originalWait && schedule[schedule.length - 1].departureMinutes <= originalSchedule[originalSchedule.length - 1].departureMinutes) {
          route = best.route;
          continue;
        }
      }
      route = original;
    }
  };

  // 식사·휴식 시간을 관광지가 먼저 소진하지 않도록 확보하고, 새 관광지 주변에서도 누락된 식사를 다시 찾습니다.
  insertMealsAndRest();
  while (true) {
    const best = bestInsertion(attractions);
    if (!best) break;
    route = best.route;
    reduceMealWaiting();
    insertMealsAndRest();
  }
  return route;
}

/** 부족한 후보·남는 시간을 숨기지 않고 결과 화면에 설명합니다. */
export function getScheduleNotices(profile: UserProfile, stops: readonly ScoredPlace[]): string[] {
  const schedule = createSchedule(profile, stops);
  if (!schedule.length) return [];
  const notices = getMealWindows(profile)
    .filter(meal => !schedule.some(stop => stop.meal === meal))
    .map(meal => `${MEAL_WINDOWS[meal].label} 시간대와 동선에 맞는 음식점을 찾지 못했어요. 식사 장소를 따로 확인해주세요.`);
  const remaining = minutes(profile.endTime) - schedule[schedule.length - 1].departureMinutes;
  if (remaining >= 30) notices.push(`조건에 맞는 장소를 추가하기 어려워 종료 시간까지 ${remaining}분이 남아요. 자유 시간으로 활용하거나 지역·이동수단을 바꿔보세요.`);
  return notices;
}

export function recommendPlaces(profile: UserProfile, catalog: PlaceCatalog): Place[] {
  return recommendPlacesWithBreakdown(profile, catalog).map(({ place }) => place);
}

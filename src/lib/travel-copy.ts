import type { Interest, Place, PlaceCategory, UserProfile } from "../types/travel";

const interestPhrases: Record<Interest, string> = {
  nature: "자연을 좋아하고", sea: "바다를 좋아하고", culture: "문화에 관심이 많고",
  experience: "새로운 체험을 좋아하고", food: "맛있는 음식을 좋아하고", photo: "사진 남기기를 좋아하고",
};
const themes: Record<PlaceCategory, string> = {
  nature: "자연", sea: "바다", culture: "문화", experience: "체험",
  korean: "한식", seafood: "해산물", cafe: "쉼",
};
const companions: Record<UserProfile["companion"], string> = {
  solo: "혼자만의 시간을 즐기는 당신", couple: "두 사람", friends: "함께 떠나는 친구들", family: "함께하는 가족",
};

/** 표현만 생성합니다. 추천 결과의 선정·점수·순서에는 관여하지 않습니다. */
export function createTravelCopy(profile: UserProfile, places: readonly Place[]) {
  const preference = profile.interests.length > 0 ? interestPhrases[profile.interests[0]] : "새로운 하루를 기대하고";
  const pace = profile.activityLevel >= 4
    ? "활동적인 여행을 선호하는"
    : profile.activityLevel <= 2 ? "여유로운 여행을 선호하는" : "적당한 활동과 여유를 선호하는";
  const rest = profile.restFrequency >= 4 ? " 틈틈이 쉬어가는 여유도 좋아해요." : "";
  // 관광지 테마를 먼저 소개하되 실제 추천에 있는 카테고리만 사용합니다.
  const ordered = [...places.filter((place) => place.type === "attraction"), ...places.filter((place) => place.type !== "attraction")];
  const labels = [...new Set(ordered.map((place) => themes[place.category]))].slice(0, 2);
  const first = labels[0];
  const hasFinalConsonant = first ? (first.charCodeAt(first.length - 1) - 0xac00) % 28 !== 0 : false;
  const theme = labels.length === 2 ? `${first}${hasFinalConsonant ? "과" : "와"} ${labels[1]}` : first;
  const concept = theme ? `${theme}의 하루` : "나의 취향으로 만나는 울산";

  return {
    concept,
    introduction: `${preference} ${pace} ${companions[profile.companion]}에게 어울리는 ${concept}.${rest}`,
  };
}

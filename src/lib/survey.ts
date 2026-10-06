import { surveyQuestions, type SurveyAnswers, type QuestionId } from "../data/survey";
import type { FoodPreference, TimeOfDay, UserProfile } from "../types/travel";
import type { TasteProfile } from "./type-test";

function isTime(value: string | undefined): value is TimeOfDay {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isQuestionAnswered(id: QuestionId, answers: SurveyAnswers): boolean {
  if (id === "requiredPlaces") {
    const ids = answers.requiredPlaceIds ?? [];
    return ids.length <= 2 && new Set(ids).size === ids.length && ids.every(id => typeof id === "string" && id.length > 0);
  }
  if (id === "time") {
    return isTime(answers.startTime) && isTime(answers.endTime)
      && answers.endTime > answers.startTime;
  }
  return surveyQuestions.find((question) => question.id === id)?.options.some(
    (option) => option.value === answers[id],
  ) ?? false;
}

/** 2단계 설문 응답과 1단계 유형검사의 취향 값을 합쳐 추천용 프로필을 만듭니다. */
export function buildUserProfile(answers: SurveyAnswers, taste: TasteProfile): UserProfile | null {
  if (!surveyQuestions.every(({ id }) => isQuestionAnswered(id, answers))) return null;
  const { companion, transport, startTime, endTime, preferredFood, region } = answers;
  if ((companion !== "solo" && companion !== "couple" && companion !== "friends" && companion !== "family")
    || (transport !== "car" && transport !== "public-transit")
    || !isTime(startTime) || !isTime(endTime)) return null;
  if (region !== "all" && region !== "ulju" && region !== "buk" && region !== "dong" && region !== "jung" && region !== "nam") return null;

  const foods: FoodPreference[] = [];
  if (preferredFood === "korean" || preferredFood === "seafood" || preferredFood === "western" || preferredFood === "vegetarian") {
    foods.push(preferredFood);
  }
  return {
    requiredPlaceIds: [...(answers.requiredPlaceIds ?? [])],
    popularityPreference: taste.popularityPreference,
    activityLevel: taste.activityLevel,
    restFrequency: taste.restFrequency,
    interests: [...taste.interests],
    region, companion, transport,
    preferredFood: foods, startTime, endTime,
  };
}

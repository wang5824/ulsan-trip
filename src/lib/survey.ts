import { surveyQuestions, type SurveyAnswers, type QuestionId } from "../data/survey";
import type { FoodPreference, Interest, Score, TimeOfDay, UserProfile } from "../types/travel";

function isTime(value: string | undefined): value is TimeOfDay {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isQuestionAnswered(id: QuestionId, answers: SurveyAnswers): boolean {
  if (id === "time") {
    return isTime(answers.startTime) && isTime(answers.endTime)
      && answers.endTime > answers.startTime;
  }
  return surveyQuestions.find((question) => question.id === id)?.options.some(
    (option) => option.value === answers[id],
  ) ?? false;
}

function toScore(value: string | undefined): Score | null {
  const score = Number(value);
  return score === 1 || score === 2 || score === 3 || score === 4 || score === 5 ? score : null;
}

/** 기존 프로필은 관심도 수치 대신 목록을 사용하므로 4점 이상만 관심사로 변환합니다. */
export function buildUserProfile(answers: SurveyAnswers): UserProfile | null {
  if (!surveyQuestions.every(({ id }) => isQuestionAnswered(id, answers))) return null;
  const { companion, transport, startTime, endTime, preferredFood } = answers;
  const activityLevel = toScore(answers.activityLevel);
  const restFrequency = toScore(answers.restFrequency);
  if ((companion !== "solo" && companion !== "couple" && companion !== "friends" && companion !== "family")
    || (transport !== "car" && transport !== "public-transit")
    || !activityLevel || !restFrequency || !isTime(startTime) || !isTime(endTime)) return null;

  const foods: FoodPreference[] = [];
  if (preferredFood === "korean" || preferredFood === "seafood" || preferredFood === "western" || preferredFood === "vegetarian") {
    foods.push(preferredFood);
  }
  const interestKeys = ["nature", "food", "culture", "experience"] as const satisfies readonly Interest[];
  return {
    companion, transport, activityLevel, restFrequency,
    interests: interestKeys.filter((interest) => Number(answers[interest]) >= 4),
    preferredFood: foods, startTime, endTime,
  };
}

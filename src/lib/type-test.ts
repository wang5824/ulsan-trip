import { PETROGLYPH_AXES } from "../data/petroglyph-types";
import { TYPE_TEST_QUESTIONS } from "../data/type-test";
import type { UserProfile } from "../types/travel";

/** 유형검사에서 나와 2단계 경로 추천에 그대로 쓰이는 취향 값입니다. */
export type TasteProfile = Pick<UserProfile, "popularityPreference" | "activityLevel" | "restFrequency" | "interests">;

export interface TypeTestResult {
  code: string;
  /** 축마다 첫 번째 글자(A·N·E·F)를 고른 문항 수(0~3) */
  firstCounts: [number, number, number, number];
  taste: TasteProfile;
}

/**
 * 문항별로 고른 글자 배열(질문 순서)을 유형 코드와 추천용 취향 값으로 바꿉니다.
 * - 에너지: A 3개 → 활동량 5·휴식 1, A 2개 → 활동량 4·휴식 3, A 1개 → 활동량 2·휴식 5, A 0개 → 활동량 1·휴식 5
 * - 무대: N이 많으면 자연(바다 포함) 관심, C가 많으면 문화 관심
 * - 방식: E가 많으면 체험 관심, T가 많으면 맛집 관심
 * - 장소: F 3개 → 유명한 곳, F 2개 → 상관없음, L이 많으면 숨은 곳
 * 이렇게 만든 취향은 getPetroglyphCode로 다시 계산해도 같은 유형이 나옵니다.
 */
export function scoreTypeTest(letters: readonly (string | undefined)[]): TypeTestResult | null {
  if (letters.length !== TYPE_TEST_QUESTIONS.length) return null;
  const firstCounts: [number, number, number, number] = [0, 0, 0, 0];
  for (const [index, question] of TYPE_TEST_QUESTIONS.entries()) {
    const letter = letters[index];
    if (!question.options.some(option => option.letter === letter)) return null;
    if (letter === PETROGLYPH_AXES[question.axis].first.code) firstCounts[question.axis] += 1;
  }
  const perAxis = TYPE_TEST_QUESTIONS.length / PETROGLYPH_AXES.length;
  const code = PETROGLYPH_AXES.map((axis, index) => firstCounts[index] * 2 > perAxis ? axis.first.code : axis.second.code).join("");

  const [active, nature, experience, famous] = firstCounts;
  const activityLevel = active === 3 ? 5 : active === 2 ? 4 : active === 1 ? 2 : 1;
  const restFrequency = active === 3 ? 1 : active === 2 ? 3 : 5;
  const taste: TasteProfile = {
    activityLevel,
    restFrequency,
    interests: [nature >= 2 ? "nature" : "culture", experience >= 2 ? "experience" : "food"],
    popularityPreference: famous === 3 ? "famous" : famous === 2 ? "any" : "hidden",
  };
  return { code, firstCounts, taste };
}

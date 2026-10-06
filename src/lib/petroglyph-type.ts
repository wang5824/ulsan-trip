import { PETROGLYPH_AXES, PETROGLYPH_TYPES, type PetroglyphType } from "../data/petroglyph-types";
import type { UserProfile } from "../types/travel";

type ProfileForType = Pick<UserProfile, "activityLevel" | "restFrequency" | "interests" | "popularityPreference">;

/**
 * 설문 프로필에서 4글자 유형 코드를 계산합니다. 동행인은 사용하지 않습니다.
 * - 에너지: 활동량 4~5 → A, 1~2 → S, 3이면 휴식 빈도 4 이상 → S, 아니면 A
 * - 무대: 문화 관심만 있으면 C, 그 외(자연·바다 관심, 둘 다, 둘 다 없음) N
 * - 방식: 맛집 관심만 있으면 T, 그 외 E
 * - 장소: 숨은 장소 선호 → L, 그 외(대표 관광지, 둘 다 좋음) F
 */
export function getPetroglyphCode(profile: ProfileForType): string {
  const energy = profile.activityLevel >= 4 ? "A" : profile.activityLevel <= 2 ? "S" : profile.restFrequency >= 4 ? "S" : "A";
  const likesNature = profile.interests.includes("nature") || profile.interests.includes("sea");
  const stage = profile.interests.includes("culture") && !likesNature ? "C" : "N";
  const style = profile.interests.includes("food") && !profile.interests.includes("experience") ? "T" : "E";
  const place = profile.popularityPreference === "hidden" ? "L" : "F";
  return `${energy}${stage}${style}${place}`;
}

export function findPetroglyphType(code: string): PetroglyphType | undefined {
  return PETROGLYPH_TYPES.find((type) => type.code === code);
}

export function getPetroglyphType(profile: ProfileForType): PetroglyphType {
  const type = findPetroglyphType(getPetroglyphCode(profile));
  if (!type) throw new Error("모든 유형 코드는 도감에 정의되어 있어야 합니다.");
  return type;
}

/** 지정한 축(0~3)의 글자만 반대로 바꾼 코드를 반환합니다. */
export function flipAxis(code: string, axisIndex: number): string {
  const axis = PETROGLYPH_AXES[axisIndex];
  const next = code[axisIndex] === axis.first.code ? axis.second.code : axis.first.code;
  return code.slice(0, axisIndex) + next + code.slice(axisIndex + 1);
}

/** 찰떡궁합: 즐기는 방식만 반대. 페이스 조심: 여행 에너지만 반대. */
export function getRelations(code: string) {
  return { best: flipAxis(code, 2), pace: flipAxis(code, 0) };
}

export function describeAxes(code: string): string[] {
  return PETROGLYPH_AXES.map((axis, index) => (code[index] === axis.first.code ? axis.first.label : axis.second.label));
}

import { getPlaceStory } from "../data/place-stories";
import type { AccessNeeds, Place } from "../types/travel";

export type AccessVerdict = "yes" | "partial" | "no" | "unknown";

/**
 * 휠체어·유모차 이동 가능성. 조사 데이터가 있으면 그대로 쓰고,
 * 없으면 활동량 4 이상(산길·트레킹 등)은 어려움으로 추정합니다. 나머지는 미확인입니다.
 */
export function wheelchairVerdict(place: Place): AccessVerdict {
  const story = getPlaceStory(place.id);
  if (story?.barrierFree) return story.barrierFree.status;
  if (place.type === "attraction" && place.activityLevel >= 4) return "no";
  return "unknown";
}

/**
 * 반려동물 동반 가능성. 조사 데이터가 있으면 그대로 쓰고,
 * 없으면 실내 관광지(전시관·박물관 등)는 동반 불가로 추정합니다. 나머지는 미확인입니다.
 */
export function petVerdict(place: Place): AccessVerdict {
  const story = getPlaceStory(place.id);
  if (story?.pets) return story.pets.status;
  if (place.type === "attraction" && place.indoor === true) return "no";
  return "unknown";
}

/** 조건이 있을 때 확실히 어려운 관광지만 제외합니다. 음식점·카페는 정보가 없어 제외하지 않습니다. */
export function isAccessibleFor(needs: AccessNeeds | undefined, place: Place): boolean {
  if (!needs || place.type !== "attraction") return true;
  if (needs.wheelchair && wheelchairVerdict(place) === "no") return false;
  if (needs.pets && petVerdict(place) === "no") return false;
  return true;
}

const BONUS = { yes: 12, partial: 5, no: 0, unknown: 0 } as const;

/** 조건에 맞는다고 확인된 장소를 우선하는 선정 가점입니다. */
export function accessBonus(needs: AccessNeeds | undefined, place: Place): number {
  if (!needs) return 0;
  return (needs.wheelchair ? BONUS[wheelchairVerdict(place)] : 0) + (needs.pets ? BONUS[petVerdict(place)] : 0);
}

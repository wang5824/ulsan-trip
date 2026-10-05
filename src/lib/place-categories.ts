import type { Interest, PlaceCategory } from "../types/travel";

export const PLACE_CATEGORY_LABELS: Readonly<Record<PlaceCategory, string>> = {
  nature: "자연", sea: "바다", culture: "문화", experience: "체험",
  korean: "한식", seafood: "해산물", western: "양식", chinese: "중식",
  japanese: "일식", "fast-food": "간편식", "other-food": "음식점", cafe: "카페",
};

/** 사진 적합도는 장소 데이터에 없으므로 임의로 추정하지 않습니다. */
export const CATEGORY_INTERESTS: Readonly<Record<PlaceCategory, readonly Interest[]>> = {
  nature: ["nature"], sea: ["sea", "nature"], culture: ["culture"], experience: ["experience"],
  korean: ["food"], seafood: ["food"], western: ["food"], chinese: ["food"],
  japanese: ["food"], "fast-food": ["food"], "other-food": ["food"], cafe: ["food"],
};

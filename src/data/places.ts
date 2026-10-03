import { attractions } from "./attractions";
import { restaurants } from "./restaurants";
import { cafes } from "./cafes";
import type { PlaceCatalog } from "../types/travel";

/** 데이터는 유형별 파일에서 독립적으로 관리합니다. */
export const placeCatalog: PlaceCatalog = { attractions, restaurants, cafes };

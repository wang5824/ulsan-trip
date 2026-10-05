import type { GeocodedPlace, Place } from "../types/travel";

/** null을 0으로 변환하지 않으며, 누락·비정상·범위 밖 좌표를 거릅니다. */
export function hasCoordinates(place: Place): place is GeocodedPlace {
  return typeof place.latitude === "number" && Number.isFinite(place.latitude)
    && Math.abs(place.latitude) <= 90
    && typeof place.longitude === "number" && Number.isFinite(place.longitude)
    && Math.abs(place.longitude) <= 180;
}

/** 일부 장소를 생략해도 지도 번호는 원래 방문 순서와 일치해야 합니다. */
export function createMapEntries(places: readonly Place[]) {
  return places.flatMap((place, index) => hasCoordinates(place)
    ? [{ place, visitNumber: index + 1 }] : []);
}

import type { PlacePhotoMap } from "../types/place-photo";

let pending: Promise<PlacePhotoMap> | undefined;
let expiresAt = 0;

/** 여러 카드와 Strict Mode가 같은 요청을 공유합니다. 실패 결과는 저장하지 않습니다. */
export function loadPlacePhotos(): Promise<PlacePhotoMap> {
  if (pending && Date.now() < expiresAt) return pending;
  expiresAt = Date.now() + 5 * 60 * 1000;
  pending = fetch("/api/place-photos", { signal: AbortSignal.timeout(20000) })
    .then(async response => {
      if (!response.ok) throw new Error("사진 조회 실패");
      const data = await response.json();
      if (!data.photos || typeof data.photos !== "object" || Array.isArray(data.photos)) throw new Error("사진 응답 오류");
      return data.photos as PlacePhotoMap;
    }).catch(() => {
      pending = undefined;
      expiresAt = 0;
      throw new Error("사진 조회 실패");
    });
  return pending;
}

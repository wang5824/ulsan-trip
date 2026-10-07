import { DISTRICT_LABELS, type Place } from "../types/travel";
import type { PlacePhotoData, PlacePhotoMap } from "../types/place-photo";

export interface TourPlace {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  areacode: string;
  mapx?: string;
  mapy?: string;
  firstimage?: string;
  cpyrhtDivCd?: string;
}

const ALIASES: Record<string, string[]> = {
  "attraction-55f2bdca0fe1": ["장생포 고래바다여행선"],
  "attraction-7bab558488f2": ["내원암 계곡"],
  "attraction-0b96a50772ce": ["등억온천단지"],
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\((울산|울주)\)/g, "")
    .replace(/[\s·ㆍ()\[\]-]/g, "").replace(/^울산(광역시)?/, "");
}

function normalizeAddress(address: string): string {
  return address.replace(/\([^)]*\)/g, "").replace(/\s/g, "");
}

function distanceKm(place: Place, item: TourPlace): number | null {
  if (place.latitude === null || place.longitude === null || !item.mapx || !item.mapy) return null;
  const lat = Number(item.mapy), lng = Number(item.mapx);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !lat || !lng) return null;
  const radians = Math.PI / 180;
  const a = Math.sin((lat - place.latitude) * radians / 2) ** 2
    + Math.cos(place.latitude * radians) * Math.cos(lat * radians)
    * Math.sin((lng - place.longitude) * radians / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

/** 이름만 비슷한 장소나 다른 지점의 사진을 연결하지 않습니다. */
export function matchTourPlace(place: Place, items: readonly TourPlace[]): TourPlace | undefined {
  const names = [place.name, ...(ALIASES[place.id] ?? [])].map(normalizeName);
  const candidates = items.filter(item => {
    if (item.areacode !== "7" || !item.addr1.startsWith("울산")) return false;
    if (!names.includes(normalizeName(item.title))) return false;
    if (place.type === "attraction" ? !["12", "14", "28"].includes(item.contenttypeid) : item.contenttypeid !== "39") return false;
    if (place.district && !item.addr1.includes(DISTRICT_LABELS[place.district])) return false;
    const distance = distanceKm(place, item);
    if (distance !== null) return distance <= (place.type === "attraction" ? 2 : 0.5);
    return !!place.address && normalizeAddress(place.address) === normalizeAddress(item.addr1);
  });
  if (candidates.length === 1) return candidates[0];
  // 같은 주소로 중복 등록된 관광정보는 사진이 있는 항목을 우선합니다.
  if (candidates.length > 1 && new Set(candidates.map(item => normalizeAddress(item.addr1))).size === 1) {
    return candidates.find(item => item.firstimage) ?? candidates[0];
  }
  return undefined;
}

export function tourPhoto(item: TourPlace): PlacePhotoData | undefined {
  if (!item.firstimage || !["Type1", "Type3"].includes(item.cpyrhtDivCd ?? "")) return;
  let url: URL;
  try { url = new URL(item.firstimage); } catch { return; }
  if (!["http:", "https:"].includes(url.protocol) || url.hostname !== "tong.visitkorea.or.kr"
    || url.port || url.username || url.password || !url.pathname.startsWith("/cms/resource/")) return;
  url.protocol = "https:";
  const noAlter = item.cpyrhtDivCd === "Type3";
  return {
    url: url.href, sourceUrl: url.href,
    page: "https://api.visitkorea.or.kr/",
    credit: `한국관광공사 TourAPI · ${item.title}`,
    license: noAlter ? "공공누리 제3유형 (출처표시·변경금지)" : "공공누리 제1유형 (출처표시)",
    noAlter,
  };
}

export function mapTourPhotos(places: readonly Place[], items: readonly TourPlace[]): PlacePhotoMap {
  const photos: PlacePhotoMap = {};
  for (const place of places) {
    const item = matchTourPlace(place, items);
    const photo = item && tourPhoto(item);
    if (photo) photos[place.id] = photo;
  }
  return photos;
}

export class TourApiError extends Error {
  constructor(public readonly reason: "configuration" | "upstream") {
    // URL, 인증키, 외부 응답 본문을 오류나 로그에 포함하지 않습니다.
    super(reason === "configuration" ? "TourAPI 설정을 확인해주세요." : "TourAPI 사진을 일시적으로 불러올 수 없습니다.");
  }
}

/** URL 인코딩/디코딩 인증키 모두 지원합니다. */
export function normalizeTourApiKey(value: string): string {
  try { return decodeURIComponent(value.trim()); } catch { return value.trim(); }
}

export async function fetchTourPlaces(key: string, fetcher: typeof fetch = fetch): Promise<TourPlace[]> {
  if (!key.trim()) throw new TourApiError("configuration");
  const items: TourPlace[] = [];
  // 현재 울산 목록은 한 페이지지만 데이터가 늘어나도 모든 페이지를 확인합니다.
  for (let page = 1; page <= 10; page++) {
    const url = new URL("https://apis.data.go.kr/B551011/KorService2/areaBasedList2");
    url.search = new URLSearchParams({
      serviceKey: normalizeTourApiKey(key), MobileOS: "ETC", MobileApp: "UlsanTrip",
      _type: "json", areaCode: "7", numOfRows: "500", pageNo: String(page), arrange: "A",
    }).toString();
    try {
      const response = await fetcher(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new TourApiError("upstream");
      const data = await response.json();
      const body = data?.response?.body;
      if (data?.response?.header?.resultCode !== "0000" || !body) throw new TourApiError("upstream");
      const total = Number(body.totalCount);
      if (!Number.isInteger(total) || total < 0) throw new TourApiError("upstream");
      const raw = body.items?.item;
      const rows: TourPlace[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      if (rows.some(row => !row || typeof row.title !== "string" || typeof row.addr1 !== "string")) throw new TourApiError("upstream");
      items.push(...rows);
      if (items.length >= total) return items;
      if (!rows.length) throw new TourApiError("upstream");
    } catch {
      throw new TourApiError("upstream");
    }
  }
  throw new TourApiError("upstream");
}

/** 정상 결과만 하루 보관하며, 동시 요청을 합칩니다. 오류는 30초 뒤 재시도합니다. */
export function createTourPhotoLoader(load: () => Promise<PlacePhotoMap>, now = Date.now) {
  let cached: PlacePhotoMap | undefined;
  let expiresAt = 0;
  let retryAt = 0;
  let pending: Promise<PlacePhotoMap> | undefined;
  return async (): Promise<PlacePhotoMap> => {
    if (cached && now() < expiresAt) return cached;
    if (now() < retryAt) throw new TourApiError("upstream");
    if (!pending) {
      pending = load().then(photos => {
        cached = photos;
        expiresAt = now() + 24 * 60 * 60 * 1000;
        return photos;
      }).catch(error => {
        retryAt = now() + 30000;
        throw error instanceof TourApiError ? error : new TourApiError("upstream");
      }).finally(() => { pending = undefined; });
    }
    return pending;
  };
}

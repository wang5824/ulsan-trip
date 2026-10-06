import type { Place } from "../types/travel";
import { distanceKm } from "./recommendation";

/** 한국관광공사 TourAPI(국문 관광정보 서비스) 대표 사진 */
export interface TourPhoto {
  url: string;
  title: string;
  contentId: string;
  /** 공공누리 유형. Type1: 출처표시, Type3: 출처표시·변경금지 */
  license: "공공누리 제1유형" | "공공누리 제3유형";
  noAlter: boolean;
  page: string;
}

interface TourItem {
  title?: string;
  addr1?: string;
  contentid?: string;
  firstimage?: string;
  mapx?: string;
  mapy?: string;
  cpyrhtDivCd?: string;
}

const SERVICES = [
  "https://apis.data.go.kr/B551011/KorService2/searchKeyword2",
  "https://apis.data.go.kr/B551011/KorService1/searchKeyword1",
];

const normalize = (text: string) => text.replace(/\s|\(.*?\)|본점|울산/g, "");

async function search(endpoint: string, keyword: string, key: string): Promise<TourItem[]> {
  const params = new URLSearchParams({ MobileOS: "ETC", MobileApp: "ulsantrip", _type: "json", numOfRows: "20", pageNo: "1", keyword });
  // 공공데이터포털 인증키(Decoding)는 인코딩해서 붙입니다.
  const response = await fetch(`${endpoint}?serviceKey=${encodeURIComponent(key)}&${params}`);
  if (!response.ok) throw new Error(`TourAPI ${response.status}`);
  const data = await response.json();
  const items = data?.response?.body?.items?.item;
  return Array.isArray(items) ? items : items ? [items] : [];
}

/**
 * 장소 이름으로 검색해, 울산 주소이면서 이름이 같거나 좌표가 1km 안인 결과의 대표 사진을 고릅니다.
 * 공공누리 제1·3유형이 표시된 사진만 사용합니다.
 */
export async function findTourPhoto(place: Place, key: string): Promise<TourPhoto | null> {
  const keyword = place.name.replace(/\(.*?\)/g, "").trim();
  let items: TourItem[] = [];
  for (const endpoint of SERVICES) {
    try {
      items = await search(endpoint, keyword, key);
      break;
    } catch {
      continue;
    }
  }
  const target = normalize(place.name);
  const candidates = items
    .filter(item => item.firstimage && (item.addr1 ?? "").includes("울산"))
    .map(item => {
      const sameName = normalize(item.title ?? "") === target || normalize(item.title ?? "").includes(target);
      const latitude = Number(item.mapy);
      const longitude = Number(item.mapx);
      const distance = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude && longitude
        ? distanceKm(place, { ...place, latitude, longitude })
        : Infinity;
      return { item, sameName, distance };
    })
    .filter(({ sameName, distance }) => sameName || distance <= 1)
    .sort((a, b) => Number(b.sameName) - Number(a.sameName) || a.distance - b.distance);
  for (const { item } of candidates) {
    const type = item.cpyrhtDivCd;
    if (type !== "Type1" && type !== "Type3") continue;
    return {
      url: item.firstimage!.replace(/^http:\/\//, "https://"),
      title: item.title ?? place.name,
      contentId: item.contentid ?? "",
      license: type === "Type1" ? "공공누리 제1유형" : "공공누리 제3유형",
      noAlter: type === "Type3",
      page: `https://korean.visitkorea.or.kr/search/search_list.do?keyword=${encodeURIComponent(item.title ?? place.name)}`,
    };
  }
  return null;
}

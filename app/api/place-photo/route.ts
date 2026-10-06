import { type NextRequest } from "next/server";
import { placeCatalog } from "@/src/data/places";
import { findTourPhoto } from "@/src/lib/tour-api";

const places = new Map([...placeCatalog.attractions, ...placeCatalog.restaurants, ...placeCatalog.cafes].map(place => [place.id, place]));
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

/**
 * 장소 ID로 한국관광공사 TourAPI 대표 사진을 찾아 돌려줍니다.
 * 서비스 키는 서버 환경변수 TOURAPI_KEY에만 두고 브라우저로 보내지 않습니다.
 * 우리 장소 목록에 있는 ID만 받으므로 임의 검색 프록시로 쓰이지 않습니다.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const place = places.get(id);
  const key = process.env.TOURAPI_KEY;
  if (!place || !key) {
    return Response.json({ photo: null }, { status: place ? 200 : 404, headers: { "Cache-Control": CACHE } });
  }
  try {
    const photo = await findTourPhoto(place, key);
    return Response.json({ photo }, { headers: { "Cache-Control": CACHE } });
  } catch {
    // 외부 API 오류는 사진 없음으로 처리하고 짧게만 캐시합니다.
    return Response.json({ photo: null }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  }
}

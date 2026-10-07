import { getTourPhotos } from "@/src/lib/tourapi-server";

export async function GET() {
  try {
    return Response.json({ photos: await getTourPhotos() }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
    });
  } catch {
    return Response.json({ error: "사진을 일시적으로 불러오지 못했어요. 잠시 후 다시 시도해주세요." }, {
      status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}

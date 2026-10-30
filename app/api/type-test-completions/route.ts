export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 512;

function respond(status: number) {
  // 수집 응답에 통계나 방문자 정보는 포함하지 않습니다. 조회용 GET도 제공하지 않습니다.
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const environment = process.env.VERCEL_ENV || "development";
  const enabled = process.env.TYPE_TEST_ANALYTICS_ENABLED;
  if (enabled === "false" || (environment !== "production" && enabled !== "true")) {
    return respond(204);
  }

  // 다른 사이트에서 보내는 요청은 받지 않습니다. 인증이나 봇 판별을 대신하지는 않습니다.
  if (request.headers.get("origin") !== new URL(request.url).origin) return respond(403);
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return respond(415);

  let event: { visitorId: string; completionId: string };
  try {
    // Content-Length가 없는 요청도 스트림을 제한해 큰 본문을 메모리에 쌓지 않습니다.
    const reader = request.body?.getReader();
    if (!reader) return respond(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return respond(413);
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || !("visitorId" in parsed) || !("completionId" in parsed)
      || typeof parsed.visitorId !== "string" || !UUID.test(parsed.visitorId)
      || typeof parsed.completionId !== "string" || !UUID.test(parsed.completionId)) return respond(400);
    event = { visitorId: parsed.visitorId.toLowerCase(), completionId: parsed.completionId.toLowerCase() };
  } catch {
    return respond(400);
  }

  // Vercel Marketplace 기본 변수와 Upstash 직접 연결 변수 모두 지원합니다.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.warn("[type-test-analytics] Redis connection is not configured.");
    return respond(503);
  }

  const prefix = `ulsan-trip:type-test:v1:${environment}`;
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/multi-exec`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SADD", `${prefix}:participants`, event.visitorId],
        ["SADD", `${prefix}:completions`, event.completionId],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error("Redis request failed");
    const results: unknown = await response.json();
    if (!Array.isArray(results) || results.length !== 2 || results.some(
      result => !result || result.error || (result.result !== 0 && result.result !== 1),
    )) throw new Error("Redis transaction failed");
    return respond(204);
  } catch {
    // 자격 증명이나 익명 ID, 저장소의 상세 오류는 로그에 남기지 않습니다.
    console.warn("[type-test-analytics] Completion could not be recorded.");
    return respond(503);
  }
}

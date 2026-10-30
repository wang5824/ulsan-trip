import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import * as route from "../../app/api/type-test-completions/route";
import { trackTypeTestCompletion } from "./type-test-analytics";

const visitorId = "11111111-1111-4111-8111-111111111111";
const completionId = "22222222-2222-4222-8222-222222222222";
const otherId = "33333333-3333-4333-8333-333333333333";
const keys = ["VERCEL_ENV", "TYPE_TEST_ANALYTICS_ENABLED", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"];
const originalEnv = new Map(keys.map(key => [key, process.env[key]]));
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

beforeEach(() => {
  for (const key of keys) delete process.env[key];
  process.env.VERCEL_ENV = "production";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  mock.method(console, "warn", () => {});
});

afterEach(() => {
  mock.restoreAll();
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

function request(body: unknown = { visitorId, completionId }, origin = "https://trip.example") {
  return new Request("https://trip.example/api/type-test-completions", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockRedis() {
  const sets = new Map<string, Set<string>>();
  const fetchMock = mock.method(globalThis, "fetch", async (url: unknown, init?: RequestInit) => {
    assert.equal(url, "https://redis.example/multi-exec");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-token");
    assert.equal(init?.cache, "no-store");
    const commands = JSON.parse(init?.body as string) as string[][];
    const results = commands.map(([command, key, value]) => {
      assert.equal(command, "SADD");
      const set = sets.get(key) ?? new Set<string>();
      const added = set.has(value) ? 0 : 1;
      set.add(value);
      sets.set(key, set);
      return { result: added };
    });
    return Response.json(results);
  });
  return { sets, fetchMock };
}

test("재전송·재검사·다른 방문자를 구분하고 공개 응답에는 수치를 포함하지 않는다", async () => {
  const { sets } = mockRedis();
  const response = await route.POST(request());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(await response.text(), "");
  await Promise.all(Array.from({ length: 10 }, () => route.POST(request())));
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:participants")?.size, 1);
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:completions")?.size, 1);
  await route.POST(request({ visitorId, completionId: otherId }));
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:participants")?.size, 1);
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:completions")?.size, 2);
  await route.POST(request({ visitorId: otherId, completionId: visitorId }));
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:participants")?.size, 2);
  assert.equal(sets.get("ulsan-trip:type-test:v1:production:completions")?.size, 3);
  assert.equal("GET" in route, false);
});

test("외부 출처, 잘못된 JSON·ID·콘텐츠 유형, 큰 본문은 저장 전에 거절한다", async () => {
  const { fetchMock } = mockRedis();
  assert.equal((await route.POST(request(undefined, "https://external.example"))).status, 403);
  const noOrigin = request();
  noOrigin.headers.delete("origin");
  assert.equal((await route.POST(noOrigin)).status, 403);
  for (const body of [null, {}, { visitorId: "invalid", completionId }, { visitorId, completionId: 3 }]) {
    assert.equal((await route.POST(request(body))).status, 400);
  }
  assert.equal((await route.POST(request({ text: "x".repeat(600) }))).status, 413);
  const wrongType = request();
  wrongType.headers.set("Content-Type", "text/plain");
  assert.equal((await route.POST(wrongType)).status, 415);
  const invalidJson = new Request(request(), { body: "{" });
  assert.equal((await route.POST(invalidJson)).status, 400);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("Preview·로컬은 기본 비활성이고 명시적으로 켜도 운영 키와 분리한다", async () => {
  const { fetchMock, sets } = mockRedis();
  for (const environment of ["preview", "development"]) {
    process.env.VERCEL_ENV = environment;
    assert.equal((await route.POST(request())).status, 204);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
  process.env.TYPE_TEST_ANALYTICS_ENABLED = "true";
  await route.POST(request());
  assert.equal(sets.get("ulsan-trip:type-test:v1:development:participants")?.size, 1);
  assert.equal(sets.has("ulsan-trip:type-test:v1:production:participants"), false);
  process.env.VERCEL_ENV = "production";
  process.env.TYPE_TEST_ANALYTICS_ENABLED = "false";
  await route.POST(request());
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("저장소 미설정은 성공으로 보고하지 않고 Vercel KV 변수도 지원한다", async () => {
  const { fetchMock } = mockRedis();
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  assert.equal((await route.POST(request())).status, 503);
  assert.equal(fetchMock.mock.callCount(), 0);
  delete process.env.UPSTASH_REDIS_REST_URL;
  process.env.KV_REST_API_URL = "https://redis.example";
  process.env.KV_REST_API_TOKEN = "test-token";
  assert.equal((await route.POST(request())).status, 204);
});

test("저장소 HTTP 오류·명령 오류·연결 오류는 재시도 가능한 실패로 반환한다", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => new Response(null, { status: 500 }));
  assert.equal((await route.POST(request())).status, 503);
  fetchMock.mock.mockImplementation(async () => Response.json([{ result: 1 }, { error: "failed" }]));
  assert.equal((await route.POST(request())).status, 503);
  fetchMock.mock.mockImplementation(async () => { throw new Error("offline"); });
  assert.equal((await route.POST(request())).status, 503);
});

function mockBrowser(storageBlocked = false) {
  const stored = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: {
      getItem(key: string) { if (storageBlocked) throw new Error("blocked"); return stored.get(key) ?? null; },
      setItem(key: string, value: string) { if (storageBlocked) throw new Error("blocked"); stored.set(key, value); },
    } },
  });
}

test("브라우저 재검사는 같은 방문자 ID와 새로운 완료 ID를 전송한다", async () => {
  mockBrowser();
  const events: { visitorId: string; completionId: string }[] = [];
  mock.method(globalThis, "fetch", async (url: unknown, init?: RequestInit) => {
    assert.equal(url, "/api/type-test-completions");
    assert.equal(init?.keepalive, true);
    events.push(JSON.parse(init?.body as string));
    return new Response(null, { status: 204 });
  });
  await trackTypeTestCompletion();
  await trackTypeTestCompletion();
  assert.deepEqual(Object.keys(events[0]).sort(), ["completionId", "visitorId"]);
  assert.equal(events[0].visitorId, events[1].visitorId);
  assert.notEqual(events[0].completionId, events[1].completionId);
});

test("전송 응답 유실 시 같은 ID로 한 번만 재시도하고 실패를 화면으로 전파하지 않는다", async () => {
  mockBrowser(true);
  const bodies: BodyInit[] = [];
  mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    bodies.push(init!.body!);
    throw new Error("response lost");
  });
  await assert.doesNotReject(trackTypeTestCompletion);
  assert.equal(bodies.length, 2);
  assert.equal(bodies[0], bodies[1]);
});

test("잘못된 요청 응답은 재시도하지 않는다", async () => {
  mockBrowser();
  const fetchMock = mock.method(globalThis, "fetch", async () => new Response(null, { status: 403 }));
  await trackTypeTestCompletion();
  assert.equal(fetchMock.mock.callCount(), 1);
});

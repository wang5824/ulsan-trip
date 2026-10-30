const VISITOR_KEY = "ulsan-trip:analytics:visitor:v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let memoryVisitorId: string | undefined;

function getVisitorId(): string {
  try {
    const stored = window.localStorage.getItem(VISITOR_KEY);
    if (stored && UUID.test(stored)) return stored;
  } catch {
    // 저장소가 차단되면 현재 페이지 생명주기 동안만 같은 방문자로 봅니다.
  }
  memoryVisitorId ??= crypto.randomUUID();
  try {
    window.localStorage.setItem(VISITOR_KEY, memoryVisitorId);
  } catch {
    // 집계 실패가 검사 결과 표시를 막지 않도록 합니다.
  }
  return memoryVisitorId;
}

/** 검사 완료 이벤트에서만 호출합니다. 답변과 결과 유형은 전송하지 않습니다. */
export async function trackTypeTestCompletion(): Promise<void> {
  try {
    const body = JSON.stringify({ visitorId: getVisitorId(), completionId: crypto.randomUUID() });
    // 응답 유실 뒤 재전송해도 같은 completionId이므로 중복으로 세지 않습니다.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch("/api/type-test-completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok || response.status < 500) return;
      } catch {
        // 일시적인 네트워크 실패에는 같은 이벤트로 한 번만 재시도합니다.
      }
    }
  } catch {
    // UUID 생성이나 집계가 불가능해도 기존 검사 흐름은 그대로 유지합니다.
  }
}

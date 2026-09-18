import type { KakaoMaps } from "../types/kakao";

let sdkPromise: Promise<KakaoMaps> | undefined;
const SDK_TIMEOUT_MS = 15000;

function isReady(maps: Partial<KakaoMaps> | undefined): maps is KakaoMaps {
  return !!maps && [maps.load, maps.Map, maps.LatLng, maps.LatLngBounds, maps.Marker,
    maps.MarkerImage, maps.InfoWindow, maps.Polyline, maps.Size, maps.Point,
    maps.event?.addListener, maps.event?.removeListener].every((value) => typeof value === "function");
}

/** 여러 컴포넌트와 Strict Mode에서 하나의 SDK 로딩 작업을 공유합니다. */
export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (typeof window === "undefined") return Promise.reject(new Error("지도는 브라우저에서만 사용할 수 있습니다."));
  if (isReady(window.kakao?.maps)) return Promise.resolve(window.kakao.maps);
  if (sdkPromise) return sdkPromise;

  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return Promise.reject(new Error("지도 설정이 준비되지 않았습니다."));

  sdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    let settled = false;
    let initializing = false;
    let created = false;
    let script: HTMLScriptElement | undefined;
    const timer = window.setTimeout(() => fail("지도 로딩 시간이 초과되었습니다."), SDK_TIMEOUT_MS);

    function detach() {
      window.clearTimeout(timer);
      script?.removeEventListener("load", initialize);
      script?.removeEventListener("error", onError);
    }
    function fail(message: string) {
      if (settled) return;
      settled = true;
      detach();
      reject(new Error(message));
    }
    function onError() {
      // 확실히 실패한 자체 스크립트만 제거합니다. 시간 초과 중인 공유 스크립트는 유지합니다.
      if (created) script?.remove();
      fail("지도 SDK를 불러오지 못했습니다.");
    }
    function initialize() {
      if (settled || initializing) return;
      const maps = window.kakao?.maps;
      if (typeof maps?.load !== "function") { fail("지도 SDK를 초기화하지 못했습니다."); return; }
      initializing = true;
      try {
        maps.load(() => {
          if (settled) return;
          const loaded = window.kakao?.maps;
          if (!isReady(loaded)) { fail("지도 SDK를 초기화하지 못했습니다."); return; }
          settled = true;
          detach();
          resolve(loaded);
        });
      } catch { fail("지도 SDK를 초기화하지 못했습니다."); }
    }

    // 다른 화면이나 이전 모듈에서 삽입한 SDK도 재사용합니다. URL이나 키를 출력하지 않습니다.
    script = Array.from(document.scripts).find((element) => {
      try {
        const url = new URL(element.src);
        return url.hostname === "dapi.kakao.com" && url.pathname === "/v2/maps/sdk.js";
      } catch { return false; }
    });
    if (window.kakao?.maps?.load) { initialize(); return; }
    if (!script) {
      created = true;
      script = document.createElement("script");
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    }
    script.addEventListener("load", initialize);
    script.addEventListener("error", onError);
    if (created) document.head.appendChild(script);
  }).catch((error: unknown) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

/** 이 프로젝트에서 사용하는 Kakao Maps API만 정의한 최소 타입입니다. */
export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}
export interface KakaoBounds { extend(position: KakaoLatLng): void }
export interface KakaoMapInstance {
  setBounds(bounds: KakaoBounds, top?: number, right?: number, bottom?: number, left?: number): void;
  relayout(): void;
}
export interface KakaoMarker { setMap(map: KakaoMapInstance | null): void }
export interface KakaoPolyline { setMap(map: KakaoMapInstance | null): void }
export interface KakaoInfoWindow {
  setContent(content: HTMLElement): void;
  open(map: KakaoMapInstance, marker: KakaoMarker): void;
  close(): void;
}
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoBounds;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Size: new (width: number, height: number) => object;
  Point: new (x: number, y: number) => object;
  MarkerImage: new (src: string, size: object, options: { offset: object }) => object;
  Marker: new (options: { map: KakaoMapInstance; position: KakaoLatLng; image: object; title: string }) => KakaoMarker;
  InfoWindow: new (options: { removable: boolean }) => KakaoInfoWindow;
  Polyline: new (options: {
    map: KakaoMapInstance;
    path: KakaoLatLng[];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: "solid" | "dash";
  }) => KakaoPolyline;
  event: {
    addListener(target: KakaoMarker, type: "click", callback: () => void): void;
    removeListener(target: KakaoMarker, type: "click", callback: () => void): void;
  };
}

declare global {
  interface Window {
    // SDK 스크립트만 로드되고 maps.load가 완료되지 않은 상태도 표현합니다.
    kakao?: { maps?: Partial<KakaoMaps> };
  }
}

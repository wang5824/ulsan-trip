/**
 * 반구대 암각화 관람 지수 계산(규칙 기반 추정).
 * 근거(2026년 10월 조사):
 * - 암벽이 북향이라 10월~2월에는 햇빛이 암면에 들지 않고, 3~9월 맑은 날 오후 3~5시에 그림이 가장 잘 보임
 *   (대한민국 구석구석·파이낸셜뉴스·헤럴드경제 보도).
 * - 사연댐 수위가 해발 53m를 넘으면 암각화가 잠기기 시작하고 57m에서 완전히 잠김.
 *   2025년 7월 폭우 뒤에는 다시 드러나는 데 약 한 달이 걸림(서울신문·헤럴드경제 보도).
 * 실제 댐 수위를 실시간으로 받지 못하므로, 침수 가능성은 최근 30일 강수량으로만 추정합니다.
 */
export const BANGUDAE = { latitude: 35.604018, longitude: 129.177716 } as const;

export interface HourWeather {
  time: string; // "2026-10-06T15:00"
  precipitation: number; // mm
  precipitationProbability: number | null; // %
  cloudCover: number; // %
  visibility: number | null; // m
  directRadiation: number; // W/m²
  isDay: boolean;
}

export type ViewLevel = "good" | "fair" | "poor" | "dark";

export interface HourScore {
  time: string;
  hour: number;
  score: number; // 0~100
  level: ViewLevel;
  reason: string;
}

/** 북향 암벽에 햇빛이 드는 계절(3~9월)인지 여부 */
export function isSunSeason(month: number): boolean {
  return month >= 3 && month <= 9;
}

function timeFactor(hour: number, sunSeason: boolean): number {
  if (sunSeason) {
    if (hour >= 15 && hour < 17) return 1;
    if ((hour >= 13 && hour < 15) || (hour >= 17 && hour < 18)) return 0.75;
    return 0.45;
  }
  // 햇빛이 들지 않는 계절에는 밝은 한낮이 그나마 낫습니다.
  return hour >= 11 && hour < 16 ? 0.55 : 0.4;
}

export function scoreHour(weather: HourWeather): HourScore {
  const hour = Number(weather.time.slice(11, 13));
  const month = Number(weather.time.slice(5, 7));
  if (!weather.isDay) return { time: weather.time, hour, score: 0, level: "dark", reason: "해가 진 시간" };
  const sunSeason = isSunSeason(month);
  const sun = Math.min(1, weather.directRadiation / 450);
  const light = sunSeason ? 0.35 + 0.65 * sun : 0.85 + 0.15 * sun;
  let weatherFactor = 1;
  let reason = sunSeason ? (sun > 0.5 ? "햇빛이 암면을 비추는 시간" : "구름에 햇빛이 약함") : "북향 암벽이라 그늘진 계절";
  if (weather.precipitation >= 0.2) { weatherFactor *= 0.25; reason = "비가 와요"; }
  else if ((weather.precipitationProbability ?? 0) >= 60) { weatherFactor *= 0.6; reason = "비 소식이 있어요"; }
  if (weather.visibility !== null && weather.visibility < 2000) { weatherFactor *= 0.5; reason = "안개로 시야가 흐려요"; }
  const score = Math.round(100 * timeFactor(hour, sunSeason) * light * weatherFactor);
  const level: ViewLevel = score >= 65 ? "good" : score >= 40 ? "fair" : "poor";
  return { time: weather.time, hour, score, level, reason };
}

export type FloodRisk = "low" | "possible" | "high";

/** 최근 30일 강수량으로 본 침수 가능성(추정). 실제 댐 수위와 다를 수 있습니다. */
export function floodRisk(rain30Days: number, maxDay: number): FloodRisk {
  if (rain30Days >= 300 || maxDay >= 150) return "high";
  if (rain30Days >= 150 || maxDay >= 80) return "possible";
  return "low";
}

export const LEVEL_LABEL: Record<ViewLevel, string> = { good: "잘 보여요", fair: "보통", poor: "보기 어려워요", dark: "어두움" };

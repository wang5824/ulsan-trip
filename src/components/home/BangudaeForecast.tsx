"use client";

import { useEffect, useMemo, useState } from "react";
import { BANGUDAE, floodRisk, isSunSeason, LEVEL_LABEL, scoreHour, type FloodRisk, type HourScore, type HourWeather } from "../../lib/bangudae-forecast";
import { eyebrow } from "../ui";

interface Forecast {
  hours: HourScore[];
  rain30Days: number;
  maxDay: number;
  today: string;
  nowHour: number;
}

const API = `https://api.open-meteo.com/v1/forecast?latitude=${BANGUDAE.latitude}&longitude=${BANGUDAE.longitude}`
  + "&hourly=precipitation,precipitation_probability,cloud_cover,visibility,direct_radiation,is_day"
  + "&daily=precipitation_sum&past_days=30&forecast_days=2&timezone=Asia%2FSeoul";

const FLOOD_TEXT: Record<FloodRisk, { title: string; body: string }> = {
  low: { title: "물 위로 보일 가능성 높음", body: "최근 큰비가 없었어요." },
  possible: { title: "아랫부분이 잠겼을 수 있음", body: "최근 비가 많았어요. 수위가 53m를 넘으면 잠기기 시작해요." },
  high: { title: "잠겼을 가능성 높음", body: "큰비 뒤엔 다시 드러나는 데 한 달 가까이 걸린 적도 있어요." },
};

const BAR_HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 06~19시

function seoulNow(): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

async function loadForecast(): Promise<Forecast> {
  const data = await fetch(API).then(response => {
    if (!response.ok) throw new Error("forecast");
    return response.json();
  });
  const { date: today, hour: nowHour } = seoulNow();
  const h = data.hourly;
  const hours: HourScore[] = [];
  for (let i = 0; i < h.time.length; i++) {
    if (h.time[i].slice(0, 10) < today) continue;
    const weather: HourWeather = {
      time: h.time[i], precipitation: h.precipitation[i] ?? 0, precipitationProbability: h.precipitation_probability[i],
      cloudCover: h.cloud_cover[i] ?? 0, visibility: h.visibility[i], directRadiation: h.direct_radiation[i] ?? 0, isDay: h.is_day[i] === 1,
    };
    hours.push(scoreHour(weather));
  }
  const daily = data.daily as { time: string[]; precipitation_sum: (number | null)[] };
  const pastRain = daily.time.map((day, i) => ({ day, rain: daily.precipitation_sum[i] ?? 0 })).filter(item => item.day <= today);
  return {
    hours, today, nowHour,
    rain30Days: Math.round(pastRain.reduce((sum, item) => sum + item.rain, 0)),
    maxDay: Math.round(Math.max(0, ...pastRain.map(item => item.rain))),
  };
}

export default function BangudaeForecast() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadForecast().then(result => { if (alive) setForecast(result); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  const month = Number((forecast?.today ?? seoulNow().date).slice(5, 7));
  const sunSeason = isSunSeason(month);

  const view = useMemo(() => {
    if (!forecast) return null;
    const days = [forecast.today, ...new Set(forecast.hours.map(h => h.time.slice(0, 10)).filter(d => d !== forecast.today))].slice(0, 2);
    const byDay = days.map(day => ({ day, hours: BAR_HOURS.map(hour => forecast.hours.find(h => h.time.slice(0, 10) === day && h.hour === hour)) }));
    const upcoming = forecast.hours.filter(h => h.time.slice(0, 10) > forecast.today || (h.time.slice(0, 10) === forecast.today && h.hour >= forecast.nowHour));
    // 지금이 밤이면 다음 낮 시간 중 가장 좋은 때를 크게 보여줍니다.
    const now = upcoming[0]?.level === "dark" ? undefined : upcoming[0];
    const best = upcoming.filter(h => h.level !== "dark").sort((a, b) => b.score - a.score)[0];
    return { byDay, now, best };
  }, [forecast]);

  const risk = forecast ? floodRisk(forecast.rain30Days, forecast.maxDay) : null;
  const activeHour = forecast?.hours.find(h => h.time === active);

  return (
    <section aria-labelledby="forecast-heading" className="px-5 pt-16 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className={`${eyebrow} text-ochre`}>Petroglyph forecast</p>
            <h2 id="forecast-heading" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">오늘, 반구대 암각화 잘 보일까?</h2>
          </div>
          <p className="max-w-sm text-xs leading-5 text-ink-3">날씨·햇빛 각도·최근 강수량으로 계산한 추정치예요. 실제 관람 여부는 현장 사정에 따라 달라요.</p>
        </div>

        <div className="grain-dark mt-8 grid gap-8 overflow-hidden rounded-[2rem] bg-rock p-6 text-bone sm:p-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div aria-live="polite">
            {!forecast && !failed && <p className="text-sm text-bone/60" role="status">날씨를 불러오는 중…</p>}
            {failed && (
              <div>
                <p className="font-display text-2xl font-bold">날씨를 불러오지 못했어요</p>
                <p className="mt-3 text-sm leading-6 text-bone/70">{sunSeason ? "3~9월 맑은 날 오후 3~5시에 햇빛이 암면을 비춰 가장 잘 보여요." : "10월~2월에는 북향 암벽에 햇빛이 들지 않아 그림이 흐릿해요. 망원경을 꼭 이용하세요."}</p>
              </div>
            )}
            {view && !view.now && view.best && (
              <>
                <p className="text-xs font-semibold text-bone/55">지금은 어두워요 · 다음 관람 추천</p>
                <p className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-7xl font-bold tabular-nums text-ochre-tint">{view.best.score}</span>
                  <span className="font-display text-xl font-bold">{view.best.time.slice(0, 10) === forecast!.today ? "오늘" : "내일"} {view.best.hour}시</span>
                </p>
                <p className="mt-2 text-sm text-bone/70">{LEVEL_LABEL[view.best.level]} · {view.best.reason}</p>
              </>
            )}
            {view?.now && (
              <>
                <p className="text-xs font-semibold text-bone/55">{view.now.hour === forecast!.nowHour ? "지금" : `${view.now.hour}시`} 관람 지수</p>
                <p className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-7xl font-bold tabular-nums text-ochre-tint">{view.now.score}</span>
                  <span className="font-display text-xl font-bold">{LEVEL_LABEL[view.now.level]}</span>
                </p>
                <p className="mt-2 text-sm text-bone/70">{view.now.reason}</p>
                {view.best && view.best.score > 0 && (
                  <p className="mt-5 rounded-2xl bg-bone/8 px-4 py-3 text-sm leading-6">
                    가장 잘 보이는 시간은 <strong className="text-ochre-tint">{view.best.time.slice(0, 10) === forecast!.today ? "오늘" : "내일"} {view.best.hour}시</strong>
                    <span className="text-bone/60"> (지수 {view.best.score})</span>
                  </p>
                )}
              </>
            )}
          </div>

          <div className="min-w-0">
            {view && (
              <div className="grid gap-5" onMouseLeave={() => setActive(null)}>
                {view.byDay.map(({ day, hours }) => (
                  <div key={day}>
                    <p className="mb-2 text-xs font-semibold text-bone/60">{day === forecast!.today ? "오늘" : "내일"} <span className="text-bone/35">{day.slice(5).replace("-", ".")}</span></p>
                    <ol className="flex h-24 items-end gap-[2px]" aria-label={`${day === forecast!.today ? "오늘" : "내일"} 시간별 관람 지수`}>
                      {hours.map((h, i) => {
                        const past = day === forecast!.today && BAR_HOURS[i] < forecast!.nowHour;
                        const isBest = h && view.best && h.time === view.best.time;
                        return (
                          <li key={BAR_HOURS[i]} className="relative flex h-full min-w-0 flex-1 flex-col justify-end">
                            <button
                              type="button"
                              onMouseEnter={() => h && setActive(h.time)}
                              onClick={() => h && setActive(h.time)}
                              onFocus={() => h && setActive(h.time)}
                              onBlur={() => setActive(null)}
                              aria-label={h ? `${h.hour}시 지수 ${h.score}, ${LEVEL_LABEL[h.level]}, ${h.reason}` : `${BAR_HOURS[i]}시 정보 없음`}
                              className="flex h-full w-full items-end focus-visible:outline-2 focus-visible:outline-ochre-tint"
                            >
                              <span
                                className={`block w-full rounded-t-[4px] transition-colors ${isBest ? "bg-ochre" : active === h?.time ? "bg-bone" : "bg-bone/55"} ${past ? "opacity-30" : ""}`}
                                style={{ height: `${Math.max(3, h?.score ?? 0)}%` }}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                    <div className="mt-1 flex justify-between text-[10px] tabular-nums text-bone/40" aria-hidden="true"><span>6시</span><span>12시</span><span>19시</span></div>
                  </div>
                ))}
                <p className="min-h-5 text-xs text-bone/70" aria-hidden="true">
                  {activeHour ? <><strong className="text-bone">{activeHour.hour}시 · 지수 {activeHour.score}</strong> · {LEVEL_LABEL[activeHour.level]} · {activeHour.reason}</> : "막대를 누르거나 마우스를 올리면 시간별 이유가 보여요."}
                </p>
              </div>
            )}
          </div>

          <ul className="grid gap-3 text-sm sm:grid-cols-3 lg:col-span-2">
            <li className="rounded-2xl border border-bone/10 p-4">
              <p className="text-xs font-semibold text-bone/55">햇빛</p>
              <p className="mt-1 font-bold">{sunSeason ? "암면에 해가 드는 계절" : "북향 암벽, 해가 안 드는 계절"}</p>
              <p className="mt-1 text-xs leading-5 text-bone/60">{sunSeason ? "맑은 날 오후 3~5시, 비스듬한 햇빛이 그림의 홈을 그림자로 드러내요." : "10월~2월에는 그림이 흐릿해요. 전망대 망원경을 꼭 쓰세요."}</p>
            </li>
            <li className="rounded-2xl border border-bone/10 p-4">
              <p className="text-xs font-semibold text-bone/55">물(사연댐 침수 추정)</p>
              <p className="mt-1 font-bold">{risk ? FLOOD_TEXT[risk].title : "확인 중"}</p>
              <p className="mt-1 text-xs leading-5 text-bone/60">{forecast ? `최근 30일 강수량 ${forecast.rain30Days}mm. ${FLOOD_TEXT[risk!].body}` : "최근 강수량으로 침수 가능성을 추정해요."}</p>
            </li>
            <li className="rounded-2xl border border-bone/10 p-4">
              <p className="text-xs font-semibold text-bone/55">관람 팁</p>
              <p className="mt-1 font-bold">망원경으로 확대해서 보기</p>
              <p className="mt-1 text-xs leading-5 text-bone/60">암벽은 하천 건너편이라 맨눈으론 작아요. 전망대에 무료 망원경과 AI XR 망원경이 있어요. <a href="https://www.heraldk.com/article/2026071917323438407" target="_blank" rel="noreferrer" className="underline underline-offset-2">출처</a></p>
            </li>
          </ul>
        </div>
        <p className="mt-3 text-[11px] text-ink-3">날씨: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Open-Meteo</a> · 햇빛·침수 기준: 대한민국 구석구석, 서울신문·헤럴드경제 보도(2025~2026)</p>
      </div>
    </section>
  );
}

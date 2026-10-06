"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { placeCatalog } from "../data/places";
import { recommendPlacesWithBreakdown, type ScoredPlace } from "../lib/recommendation";
import { findPetroglyphType } from "../lib/petroglyph-type";
import type { TypeTestResult } from "../lib/type-test";
import type { UserProfile } from "../types/travel";

interface Trip {
  profile: UserProfile;
  recommendations: ScoredPlace[];
}

interface TravelContextValue {
  /** 브라우저 저장소에서 이전 결과를 다시 읽었는지 여부. false인 동안에는 이동 판단을 미룹니다. */
  ready: boolean;
  typeResult: TypeTestResult | null;
  trip: Trip | null;
  completeTypeTest: (result: TypeTestResult) => void;
  completeSurvey: (profile: UserProfile) => void;
}

const TravelContext = createContext<TravelContextValue | null>(null);
const STORAGE_KEY = "ulsan-trip:v2";

interface Stored {
  typeResult: TypeTestResult | null;
  profile: UserProfile | null;
}

function readStored(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    // 저장된 유형 코드가 도감에 없으면 오래되었거나 손상된 값으로 보고 무시합니다.
    if (parsed.typeResult && !findPetroglyphType(parsed.typeResult.code)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리 상태만 사용합니다.
  }
}

/** 유형검사 결과와 여행 추천을 페이지 사이에서 공유합니다. 같은 탭에서는 새로고침해도 유지됩니다. */
export default function TravelProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [typeResult, setTypeResult] = useState<TypeTestResult | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const stored = readStored();
    // 서버 렌더링 결과와 맞추기 위해 저장소는 마운트 뒤에 한 번만 읽습니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored?.typeResult) setTypeResult(stored.typeResult);
    if (stored?.profile) setTrip({ profile: stored.profile, recommendations: recommendPlacesWithBreakdown(stored.profile, placeCatalog) });
    setReady(true);
  }, []);

  function completeTypeTest(result: TypeTestResult) {
    setTypeResult(result);
    // 유형이 바뀌면 이전 유형으로 만든 추천은 더 이상 맞지 않으므로 지웁니다.
    setTrip(null);
    writeStored({ typeResult: result, profile: null });
  }

  function completeSurvey(profile: UserProfile) {
    // 프로필과 계산 결과를 함께 갱신해 이전 추천 결과와 섞이지 않도록 합니다.
    const recommendations = recommendPlacesWithBreakdown(profile, placeCatalog);
    setTrip({ profile, recommendations });
    writeStored({ typeResult, profile });
  }

  return (
    <TravelContext.Provider value={{ ready, typeResult, trip, completeTypeTest, completeSurvey }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) throw new Error("useTravel must be used within TravelProvider");
  return context;
}

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { places } from "../data/places";
import { recommendPlacesWithBreakdown, type ScoredPlace } from "../lib/recommendation";
import type { UserProfile } from "../types/travel";

interface Trip {
  profile: UserProfile;
  recommendations: ScoredPlace[];
}

interface TravelContextValue {
  trip: Trip | null;
  completeSurvey: (profile: UserProfile) => void;
}

const TravelContext = createContext<TravelContextValue | null>(null);

/** 페이지 간에 공유하는 메모리 상태입니다. 새로고침하면 초기화됩니다. */
export default function TravelProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);

  function completeSurvey(profile: UserProfile) {
    // 프로필과 계산 결과를 함께 갱신해 이전 추천 결과와 섞이지 않도록 합니다.
    const recommendations = recommendPlacesWithBreakdown(profile, places);
    setTrip({ profile, recommendations });
  }

  return <TravelContext.Provider value={{ trip, completeSurvey }}>{children}</TravelContext.Provider>;
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) throw new Error("useTravel must be used within TravelProvider");
  return context;
}

import type { Place } from "../types/travel";

export const cafes: (Place & { type: "cafe" })[] = [
  {
    id: "nongdo-cafe",
    name: "농도",
    type: "cafe",
    category: "cafe",
    address: "울산광역시 울주군 상북면 명촌길천로 23",
    latitude: 35.5861,
    longitude: 129.0795,
    description:
      "정원과 한옥 분위기 속에서 쉬어가기 좋은 울주군의 카페입니다.",
    activityLevel: 1,
    familyScore: 4,
    coupleScore: 5,
    friendScore: 4,
    restScore: 5,
    indoor: true,
    recommendedDuration: 60,
    isTourismDure: false,
  },
];

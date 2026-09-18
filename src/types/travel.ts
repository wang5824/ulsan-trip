/** 1은 가장 낮은 수준, 5는 가장 높은 수준입니다. */
export type Score = 1 | 2 | 3 | 4 | 5;

export type PlaceType = "attraction" | "restaurant" | "cafe";
export type PlaceCategory =
  | "nature"
  | "sea"
  | "culture"
  | "experience"
  | "korean"
  | "seafood"
  | "cafe";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  category: PlaceCategory;
  address: string;
  /** 위도와 경도는 십진수 도 단위입니다. */
  latitude: number;
  longitude: number;
  description: string;
  /** 방문에 필요한 활동량입니다. */
  activityLevel: Score;
  familyScore: Score;
  coupleScore: Score;
  friendScore: Score;
  /** 휴식에 적합한 정도입니다. */
  restScore: Score;
  /** 주된 이용 공간이 실내이면 true입니다. */
  indoor: boolean;
  /** 권장 체류 시간(분). 이동 시간은 포함하지 않습니다. */
  recommendedDuration: number;
  isTourismDure: boolean;
}

export type Companion = "solo" | "family" | "couple" | "friends";
export type Transport = "car" | "public-transit" | "walking";
export type Interest = "nature" | "sea" | "culture" | "experience" | "food" | "photo";
export type FoodPreference = "korean" | "seafood" | "western" | "vegetarian";

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Hour = `0${Digit}` | `1${Digit}` | `2${0 | 1 | 2 | 3}`;
type Minute = `${0 | 1 | 2 | 3 | 4 | 5}${Digit}`;

/** 24시간제 HH:mm 형식(00:00~23:59). */
export type TimeOfDay = `${Hour}:${Minute}`;

export interface UserProfile {
  companion: Companion;
  transport: Transport;
  /** 사용자가 선호하는 활동량입니다. */
  activityLevel: Score;
  /** 1은 드문 휴식, 5는 잦은 휴식을 뜻합니다. */
  restFrequency: Score;
  /** 빈 배열은 특별한 관심사 제한이 없음을 뜻합니다. */
  interests: Interest[];
  /** 빈 배열은 음식 선호 제한이 없음을 뜻하며 알레르기 정보가 아닙니다. */
  preferredFood: FoodPreference[];
  /** 한국 현지 시각 기준. 같은 날 endTime > startTime 검증은 입력 단계에서 수행합니다. */
  startTime: TimeOfDay;
  endTime: TimeOfDay;
}

/**
 * 자주 추천되는 관광지 49곳의 조사 데이터입니다(2026년 10월 조사).
 * 모든 항목은 출처 URL과 함께 기록했고, 확인하지 못한 값은 넣지 않았습니다.
 * - visitors: 공식 통계·지자체 집계를 인용한 보도 기준. 집계 기준이 장소마다 달라 label에 적었습니다.
 * - barrierFree / pets: yes(가능) · partial(일부) · no(어려움). 방문 전 현장 확인이 필요합니다.
 * - wikiTitles: 사진 조사에 참고한 위키백과 문서 제목. 화면에서 API를 호출하지 않습니다.
 * - photo: 이용 허락이 표시된 사진. 공공누리 제4유형은 비영리·변경금지 조건이라 상업적으로 쓰게 되면 빼야 합니다.
 */
export type AccessStatus = "yes" | "partial" | "no";

export interface PlaceStory {
  tip?: { text: string; source: string | null };
  blogs: { title: string; url: string; source: string; date: string | null }[];
  barrierFree?: { status: AccessStatus; note: string; source: string | null };
  pets?: { status: AccessStatus; note: string; source: string | null };
  visitors?: { count: number; year: number; label: string; source: string };
  trend: string[];
  wikiTitles?: string[];
  /**
   * 자유 이용 허락이 표시된 사진(공유마당 CC BY·기증저작물, 공공누리 등).
   * noAlter가 true면 변경금지 조건이라 자르지 않고 원본 비율 그대로 보여줍니다.
   */
  photo?: {
    /** public에 보관한 사진 경로. 외부 API 없이 제공합니다. */
    url: string;
    /** 다운로드 원본 주소(출처 확인용). */
    sourceUrl: string;
    page: string;
    credit: string;
    license: string;
    noAlter: boolean;
  };
}

export const PLACE_STORIES: Readonly<Record<string, PlaceStory>> = {
  "attraction-5274dde18ccb": {
    "blogs": [
      {
        "title": "울산 남구 '지붕없는 미술관 신화마을'",
        "url": "https://lightone.kr/%EC%9A%B8%EC%82%B0-%EB%82%A8%EA%B5%AC-%EC%A7%80%EB%B6%95%EC%97%86%EB%8A%94-%EB%AF%B8%EC%88%A0%EA%B4%80-%EC%8B%A0%ED%99%94%EB%A7%88%EC%9D%84/",
        "source": "라이트원(개인 여행블로그)",
        "date": "2024-07"
      },
      {
        "title": "마을에 그려진 벽화가 그녀를 웃게 만드는 곳 '울산 신화마을'",
        "url": "https://yongphotos.com/636",
        "source": "티스토리",
        "date": "2012-06"
      }
    ],
    "trend": [
      "인생샷"
    ],
    "tip": {
      "text": "영화 '고래를 찾는 자전거' 촬영지가 된 뒤 2010년 마을미술 프로젝트로 벽화마을이 됐어요",
      "source": "https://www.ktriptips.com/kor/tourspot/2611134"
    },
    "barrierFree": {
      "status": "partial",
      "note": "언덕 마을이라 완만한 오르막 골목이 이어짐",
      "source": "https://lightone.kr/%EC%9A%B8%EC%82%B0-%EB%82%A8%EA%B5%AC-%EC%A7%80%EB%B6%95%EC%97%86%EB%8A%94-%EB%AF%B8%EC%88%A0%EA%B4%80-%EC%8B%A0%ED%99%94%EB%A7%88%EC%9D%84/"
    },
    "wikiTitles": [
      "ko:신화마을"
    ]
  },
  "attraction-af8dd174e91c": {
    "blogs": [
      {
        "title": "울산 중구 산책하기 좋은 곳, 학성공원",
        "url": "https://www.welfarehello.com/community/hometownNews/55c47960-375a-428c-9e54-2bce6784d887",
        "source": "웰로 동네소식(중구 SNS기자)",
        "date": null
      },
      {
        "title": "울산 조용한 벚꽃 명소 🌸 학성공원, 사람 없는 데이트 코스 추천",
        "url": "https://hidori.kr/entry/%EB%B2%9A%EA%BD%83-%EB%AA%85%EC%86%8C-%ED%95%99%EC%84%B1%EA%B3%B5%EC%9B%90",
        "source": "티스토리(hidori.kr)",
        "date": "2026-03"
      },
      {
        "title": "학성공원을 품은 도시, 울산의 봄",
        "url": "https://lightone.kr/%ED%95%99%EC%84%B1%EA%B3%B5%EC%9B%90%EC%9D%84-%ED%92%88%EC%9D%80-%EB%8F%84%EC%8B%9C-%EC%9A%B8%EC%82%B0%EC%9D%98-%EB%B4%84/",
        "source": "라이트원(개인 여행블로그)",
        "date": "2024-04"
      }
    ],
    "trend": [
      "역사 탐방",
      "꽃 명소"
    ],
    "tip": {
      "text": "1913년 울산 유지 김홍조가 왜성 일대를 사들여 꾸미고 1928년 울산에 기증한 공원이에요",
      "source": "https://ko.wikipedia.org/wiki/%EC%9A%B8%EC%82%B0%EC%99%9C%EC%84%B1"
    },
    "wikiTitles": [
      "ko:울산왜성",
      "ko:학성공원",
      "en:Ulsan Castle"
    ],
    "barrierFree": {
      "status": "partial",
      "note": "정문·성곽 상부는 계단, 둘레 산책로는 완만한 오르막",
      "source": "https://www.welfarehello.com/community/hometownNews/55c47960-375a-428c-9e54-2bce6784d887"
    },
    "photo": {
      "url": "/images/places/attraction-af8dd174e91c.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Ulsan_Castles.jpg",
      "credit": "문화재청 (공공누리 제1유형) / Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "noAlter": false,
      "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/2/22/Ulsan_Castles.jpg"
    }
  },
  "attraction-c8efdfb247ee": {
    "blogs": [
      {
        "title": "울산 산책로 황방산황토길 맨발로 걷기",
        "url": "https://www.welfarehello.com/community/hometownNews/d2ce1381-7eed-441b-887f-fb9fe7bd6527",
        "source": "웰로 동네소식",
        "date": "2024-07"
      },
      {
        "title": "황방산 맨발 산책로, 큰 인기로 임시주차장까지 마련",
        "url": "https://lightone.kr/%ED%99%A9%EB%B0%A9%EC%82%B0-%EB%A7%A8%EB%B0%9C-%EC%82%B0%EC%B1%85%EB%A1%9C-%ED%81%B0-%EC%9D%B8%EA%B8%B0%EB%A1%9C-%EC%9E%84%EC%8B%9C%EC%A3%BC%EC%B0%A8%EC%9E%A5%EA%B9%8C%EC%A7%80-%EB%A7%88%EB%A0%A8/",
        "source": "라이트원(개인 여행블로그)",
        "date": "2023-09"
      }
    ],
    "trend": [
      "맨발걷기",
      "트레킹"
    ],
    "tip": {
      "text": "안시례 1km·장현 1.5km 총 2.5km 맨발길, 2023년 중구 으뜸시책 1위·주말 3천여 명 방문",
      "source": "https://newsseoul.co.kr/news/view/1065606030305679"
    },
    "barrierFree": {
      "status": "no",
      "note": "산 등산로 형태의 황톳길(세족장·신발보관함·주차장 있음)",
      "source": "https://newsseoul.co.kr/news/view/1065606030305679"
    }
  },
  "attraction-e4ab585727bc": {
    "blogs": [
      {
        "title": "[블로그 기자] 울산 명장이 가득 담긴 산책로 왕생이길을 소개합니다",
        "url": "https://www.welfarehello.com/community/hometownNews/f023cc93-dbf3-408d-8457-e3ae6de9c331",
        "source": "웰로 동네소식(블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "야경"
    ],
    "tip": {
      "text": "울산 명장 173명의 핸드프린팅과 조형물이 길 곳곳에 숨어 있어요",
      "source": "https://www.welfarehello.com/community/hometownNews/f023cc93-dbf3-408d-8457-e3ae6de9c331"
    },
    "pets": {
      "status": "yes",
      "note": "낮 시간 반려견과 산책하는 시민이 많은 도심 산책로(목줄 필수)",
      "source": "https://www.welfarehello.com/community/hometownNews/f023cc93-dbf3-408d-8457-e3ae6de9c331"
    }
  },
  "attraction-5eef74d8f0e6": {
    "blogs": [
      {
        "title": "사람 없는 한적한 울산 벚꽃 명소 화동못 수변공원🌸",
        "url": "https://kr.trip.com/moments/detail/ulsan-21421-119167847/",
        "source": "트립닷컴 모먼트",
        "date": "2023-04"
      },
      {
        "title": "울산 북구 숨은 명소 화동못 수변공원",
        "url": "https://www.welfarehello.com/community/hometownNews/%EC%9A%B8%EC%82%B0-%EB%B6%81%EA%B5%AC-%EC%88%A8%EC%9D%80-%EB%AA%85%EC%86%8C-%ED%99%94%EB%8F%99%EB%AA%BB-%EC%88%98%EB%B3%80%EA%B3%B5%EC%9B%90--89cc6cff-d862-492c-b0fa-c1f4dd387c5a",
        "source": "웰로 동네소식",
        "date": null
      },
      {
        "title": "생태습지와 물레방아를 보며 산책할 수 있는 화동못수변공원",
        "url": "https://www.welfarehello.com/community/hometownNews/%EC%83%9D%ED%83%9C%EC%8A%B5%EC%A7%80%EC%99%80-%EB%AC%BC%EB%A0%88%EB%B0%A9%EC%95%84%EB%A5%BC-%EB%B3%B4%EB%A9%B0-%EC%82%B0%EC%B1%85%ED%95%A0-%EC%88%98-%EC%9E%88%EB%8A%94-%ED%99%94%EB%8F%99%EB%AA%BB%EC%88%98%EB%B3%80%EA%B3%B5%EC%9B%90--c9a51465-8186-4f26-a6af-fedd0a31afa6",
        "source": "웰로 동네소식",
        "date": null
      }
    ],
    "trend": [
      "꽃 명소"
    ],
    "tip": {
      "text": "입구의 커다란 벚나무 아래 정자가 봄 포토존, 공원 뒤로 무룡산 등산로가 이어져요",
      "source": "https://kr.trip.com/moments/detail/ulsan-21421-119167847/"
    }
  },
  "attraction-5633217ccd81": {
    "blogs": [
      {
        "title": "꽃바위 바다소리길",
        "url": "https://www.welfarehello.com/community/hometownNews/6c2763b5-ba5a-4c55-9547-0ab8d97529d1",
        "source": "웰로 동네소식",
        "date": null
      }
    ],
    "trend": [
      "바다 뷰",
      "야경",
      "일출"
    ],
    "tip": {
      "text": "등대 입구~상진항 1.2km 데크길, 밤엔 경관조명과 대형 미디어파사드가 켜져요",
      "source": "https://www.welfarehello.com/community/hometownNews/6c2763b5-ba5a-4c55-9547-0ab8d97529d1"
    },
    "barrierFree": {
      "status": "partial",
      "note": "유모차·휠체어는 화암항 방향 구간만 이동 가능",
      "source": "https://www.welfarehello.com/community/hometownNews/6c2763b5-ba5a-4c55-9547-0ab8d97529d1"
    },
    "pets": {
      "status": "yes",
      "note": "입구 꽃바위 바다광장 반려견 출입 가능, 맹견은 입마개 필수",
      "source": "https://www.welfarehello.com/community/hometownNews/438b74e0-23b4-4553-91b1-1ed4a8c352a7"
    }
  },
  "attraction-a783f1ec3d3c": {
    "blogs": [
      {
        "title": "울산을 한눈에 숨은 명소 염포전망대",
        "url": "https://www.welfarehello.com/community/hometownNews/6c361ad9-a897-4cce-8f2a-c2f681154ce3",
        "source": "웰로 동네소식",
        "date": null
      },
      {
        "title": "울산 해돋이 명소 <염포전망대> (입장료, 운영시간, 주차장, 맛집, 카페)",
        "url": "https://c.good-k.co.kr/entry/%EC%9A%B8%EC%82%B0-%ED%95%B4%EB%8F%8B%EC%9D%B4-%EB%AA%85%EC%86%8C-%EC%97%BC%ED%8F%AC%EC%A0%84%EB%A7%9D%EB%8C%80-%EC%9E%85%EC%9E%A5%EB%A3%8C-%EC%9A%B4%EC%98%81%EC%8B%9C%EA%B0%84-%EC%A3%BC%EC%B0%A8%EC%9E%A5-%EB%A7%9B%EC%A7%91-%EC%B9%B4%ED%8E%98",
        "source": "티스토리(c.good-k.co.kr)",
        "date": null
      }
    ],
    "trend": [],
    "tip": {
      "text": "2022년 11월 문을 연 360도 전망대예요. 차로 오르는 길은 좁은 1차로라 염포산 등산로(약 1시간)로 걸어가는 것도 추천해요",
      "source": "https://www.welfarehello.com/community/hometownNews/6c361ad9-a897-4cce-8f2a-c2f681154ce3"
    }
  },
  "attraction-a50210ca12ad": {
    "blogs": [],
    "trend": [
      "역사 탐방",
      "아이와 함께"
    ],
    "tip": {
      "text": "전시관 관람·의병 옷 입기·스탬프 미션 등 어린이 의병 체험 프로그램을 운영해요",
      "source": "https://www.iusm.co.kr/news/articleView.html?idxno=1065105"
    }
  },
  "attraction-55f0b497fff4": {
    "blogs": [],
    "trend": [
      "바다 뷰"
    ],
    "tip": {
      "text": "벽화 골목 '향수바람길'이 해안길로 대왕암공원까지 이어져요",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=e0258438-7667-44d4-8f16-4f4c184c25de"
    }
  },
  "attraction-3d4a183c61fa": {
    "blogs": [
      {
        "title": "울산 야경 명소 추천 - 울산대교 전망대",
        "url": "https://www.welfarehello.com/community/hometownNews/d9eed6cd-6cd2-4556-b3bf-ee6a7c536f6f",
        "source": "웰로 동네소식",
        "date": null
      },
      {
        "title": "울산대교 전망대 방문 후기, 멋진 풍경을 한눈에!",
        "url": "https://www.welfarehello.com/community/hometownNews/bc12ed46-f8cc-4b23-afa9-c46514c57e85",
        "source": "웰로 동네소식",
        "date": null
      },
      {
        "title": "울산대교와 바다를 한눈에, 뷰 맛집 울산대교 전망대",
        "url": "https://www.welfarehello.com/community/hometownNews/8721d76a-3369-4ddf-b0a4-25222296220b",
        "source": "웰로 동네소식",
        "date": null
      }
    ],
    "trend": [
      "야경"
    ],
    "tip": {
      "text": "화정산 위 전망대 높이 63m는 울산대교 주탑 높이와 같아요",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=e0258438-7667-44d4-8f16-4f4c184c25de"
    },
    "barrierFree": {
      "status": "yes",
      "note": "출입구 경사로·엘리베이터, 장애인 화장실·주차, 휠체어 대여",
      "source": "https://access.visitkorea.or.kr/ms/detail.do?cotId=7032a544-1ef3-49d3-bd44-3b1d5f3ad310"
    },
    "visitors": {
      "count": 136058,
      "year": 2024,
      "label": "연간 입장객",
      "source": "https://namu.wiki/w/%EC%9A%B8%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C/%EA%B4%80%EA%B4%91"
    }
  },
  "attraction-4d4a68b666cc": {
    "blogs": [
      {
        "title": "울산 북구 연암동, 숨은 힐링 스팟 '연암정원'",
        "url": "https://www.welfarehello.com/community/hometownNews/293f01aa-5278-4bdf-a210-a66a25dc1755",
        "source": "웰로 동네소식",
        "date": null
      },
      {
        "title": "울산 연암정원 후기｜연꽃연못과 통나무 외나무다리 포토존이 예쁜 울산 산책 명소",
        "url": "https://southkrtraver.com/205",
        "source": "티스토리(southkrtraver.com)",
        "date": "2025-06"
      },
      {
        "title": "울산 포토스팟 여기였어? 연암정원에서 만난 인생샷 장소 공개",
        "url": "https://www.welfarehello.com/community/hometownNews/455c9053-973a-486e-a3c3-8b3d30a2f4bb",
        "source": "웰로 동네소식",
        "date": null
      }
    ],
    "trend": [
      "꽃 명소",
      "인생샷",
      "무료",
      "아이와 함께"
    ],
    "tip": {
      "text": "고사한 은행나무를 재활용해 만든 통나무 다리가 대표 포토스팟이에요",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-yeonam-garden-lotus/"
    },
    "barrierFree": {
      "status": "yes",
      "note": "평탄한 산책로로 유모차·휠체어 이동 가능",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-yeonam-garden-lotus/"
    }
  },
  "attraction-0b30588d0d38": {
    "blogs": [
      {
        "title": "화암추등대 입구 \"꽃바위 바다광장\"",
        "url": "https://www.welfarehello.com/community/hometownNews/438b74e0-23b4-4553-91b1-1ed4a8c352a7",
        "source": "웰로 동네소식",
        "date": null
      }
    ],
    "trend": [
      "일출",
      "바다 뷰"
    ],
    "tip": {
      "text": "높이 44.5m로 국내에서 가장 높은 등대, 2017년 국내 최초로 엘리베이터가 설치됐어요",
      "source": "https://www.sumtoday.co.kr/article/view/isl202511030001"
    },
    "barrierFree": {
      "status": "partial",
      "note": "2017년 엘리베이터 설치, 내부 관람은 단체(10인 이상) 사전예약제",
      "source": "https://www.sumtoday.co.kr/article/view/isl202511030001"
    },
    "wikiTitles": [
      "ko:화암추등대"
    ]
  },
  "attraction-5a615b419a90": {
    "blogs": [],
    "trend": [
      "역사 탐방"
    ],
    "tip": {
      "text": "마을 위 치술령(765m)은 박제상 부인이 왜국을 바라보다 망부석이 됐다는 전설의 고개예요",
      "source": "https://www.kookje.co.kr/news2011/asp/newsbody.asp?code=2500&key=20091120.22023195754"
    }
  },
  "attraction-eb22fb327917": {
    "blogs": [],
    "trend": [
      "바다 뷰",
      "역사 탐방",
      "무료"
    ],
    "tip": {
      "text": "1900년대 초 동해안 최대 어항. 적산가옥·100년 된 목욕탕이 남은 2.1km 근대역사길(약 2시간)",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=86e8939e-551c-40e7-a26f-b6feee8d3119"
    },
    "barrierFree": {
      "status": "partial",
      "note": "평탄한 방파제 산책로, 장애인 화장실·휠체어 대여·장애인 주차 없음",
      "source": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=b8636237-4331-4c57-9e5c-68e926dacde2"
    },
    "wikiTitles": [
      "ko:방어진항"
    ]
  },
  "attraction-e3f542372429": {
    "blogs": [
      {
        "title": "[블로그 기자] 떼까마귀 군무 보러 철새홍보관 가야 할 때!!!",
        "url": "https://www.welfarehello.com/community/hometownNews/34640829-4a96-4155-85da-16fb7ab7118a",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      },
      {
        "title": "천혜의 철새 도래지, 떼까마귀 군무가 춤추는 울산 (2023 삼호 버드페스티벌)",
        "url": "https://lightone.kr/%EC%B2%9C%ED%98%9C%EC%9D%98-%EC%B2%A0%EC%83%88-%EB%8F%84%EB%9E%98%EC%A7%80-%EB%96%BC%EA%B9%8C%EB%A7%88%EA%B7%80-%EA%B5%B0%EB%AC%B4%EA%B0%80-%EC%B6%A4%EC%B6%94%EB%8A%94-%EC%9A%B8%EC%82%B0-2023/",
        "source": "개인 블로그(히도리 라이트원)",
        "date": "2023-11"
      },
      {
        "title": "[블로그 기자] 울산 남구 실내 가볼 만한 철새홍보관 VR 시간",
        "url": "https://www.welfarehello.com/community/hometownNews/62cb27b0-1a08-477d-a906-59b6a9be18e5",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "아이와 함께"
    ],
    "tip": {
      "text": "겨울 떼까마귀 군무는 오후 5시 30분 이후 철새홍보관 전망대에서 보기 좋아요",
      "source": "https://www.welfarehello.com/community/hometownNews/34640829-4a96-4155-85da-16fb7ab7118a"
    }
  },
  "jangsaengpo-whale-village": {
    "blogs": [
      {
        "title": "[블로그 기자] 장생포 옛 모습을 그대로 간직한 고래문화마을",
        "url": "https://www.welfarehello.com/community/hometownNews/e8418577-78c8-4f95-b840-f07baa29428c",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "역사 탐방",
      "아이와 함께",
      "바다 뷰"
    ],
    "tip": {
      "text": "고래조각정원엔 밍크·귀신·향유·혹등·대왕·범고래 6종이 실물 크기로 있어요",
      "source": "https://www.welfarehello.com/community/hometownNews/2cf254f4-7015-40a1-ba79-816e18807287"
    },
    "barrierFree": {
      "status": "yes",
      "note": "2024 열린관광지, 입구 턱 없음·평지, 장애인 화장실·휠체어/유모차 대여",
      "source": "https://access.visitkorea.or.kr/cos/detail.do?cotId=af691602-91a8-43af-a04d-e427371a42d1"
    },
    "visitors": {
      "count": 381799,
      "year": 2024,
      "label": "연간 입장객",
      "source": "https://www.iusm.co.kr/news/articleView.html?idxno=1051429"
    },
    "wikiTitles": [
      "ko:장생포 고래문화마을",
      "ko:장생포고래문화마을",
      "ko:장생포 고래문화특구"
    ],
    "pets": {
      "status": "partial",
      "note": "고래문화마을 안은 반려동물 출입 불가, 인접 수국정원은 리드줄(1.5m 이내)·배변봉투 지참 시 동반 가능",
      "source": "https://www.ban-life.com/store/view?type=s&id=23395"
    }
  },
  "attraction-e029c99e4bef": {
    "blogs": [
      {
        "title": "울산 북구 가볼만한곳 당사해양낚시공원",
        "url": "https://www.welfarehello.com/community/hometownNews/3c9fc429-d5df-4dc0-8f4b-c4caed896c79",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      },
      {
        "title": "울산 북구 가볼만한곳 당사항해양낚시공원 산책로를 걸어요",
        "url": "https://www.welfarehello.com/community/hometownNews/aa870228-35e3-4733-b632-8ade0d141483",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "바다 뷰",
      "일출",
      "일몰"
    ],
    "tip": {
      "text": "입구에서 파는 '사랑의 조개껍데기'에 소원을 적어 잔교에 걸 수 있어요(입장료 성인 1,000원)",
      "source": "https://www.ktriptips.com/kor/tourspot/2778200"
    },
    "barrierFree": {
      "status": "partial",
      "note": "계단과 휠체어 이동로 모두 있음, 잔교 끝 갯바위는 계단",
      "source": "https://www.welfarehello.com/community/hometownNews/aa870228-35e3-4733-b632-8ade0d141483"
    }
  },
  "attraction-b3966c4d7538": {
    "blogs": [],
    "trend": [
      "아이와 함께"
    ],
    "tip": {
      "text": "높이 10m 울산 최대 그물 모험놀이터. 100% 사전예약, 월·화·우천 휴장, 만 4세 이상",
      "source": "https://www.sisajournal.com/news/articleView.html?idxno=349879"
    }
  },
  "attraction-0c0265f3bfc8": {
    "blogs": [
      {
        "title": "해질녘 분위기 미쳤던 울산 산책 명소",
        "url": "https://kr.trip.com/moments/detail/ulsan-21421-146902667/",
        "source": "트립닷컴 모먼트",
        "date": null
      },
      {
        "title": "울산 송정 박상진 호수 공원 힐링 명소에서 봄을 기다리며",
        "url": "https://www.welfarehello.com/community/hometownNews/1c98d802-5d46-4bc3-aa6e-2a72a44c62b3",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      },
      {
        "title": "울산 북구 가볼만한 곳 송정 박상진 호수공원 산책",
        "url": "https://www.welfarehello.com/community/hometownNews/a3aa3338-9344-4007-85d7-7f0da98cc5c3",
        "source": "웰로(울산시 블로그 기자)",
        "date": "2024-02"
      }
    ],
    "trend": [
      "맨발걷기",
      "트레킹",
      "무료",
      "일몰"
    ],
    "tip": {
      "text": "300m 황톳 맨발길과 세족장이 있어요. 겨울 동파 우려 기간엔 운영 중지",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-park-sangjin-lake-park-barefoot-trail/"
    },
    "barrierFree": {
      "status": "yes",
      "note": "3.6km 산책로 전 구간 휠체어·유모차 이동 가능, 무료 주차",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-park-sangjin-lake-park-barefoot-trail/"
    },
    "pets": {
      "status": "yes",
      "note": "반려견과 산책하는 이용객이 많은 호수 산책로(목줄 착용)",
      "source": "https://www.welfarehello.com/community/hometownNews/a3aa3338-9344-4007-85d7-7f0da98cc5c3"
    }
  },
  "attraction-72dbcf4e8e8a": {
    "blogs": [
      {
        "title": "울산 남구 가을 단풍&억새 명소 모아보기",
        "url": "https://www.welfarehello.com/community/hometownNews/8ca194e4-f839-48b2-9f7f-7894cf3f0c89",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "가을 단풍",
      "무료"
    ],
    "tip": {
      "text": "10월 하순 마로니에길 단풍 절정, 옥동저수지에 비친 문수경기장이 포토 포인트",
      "source": "https://www.ardentnews.co.kr/news/articleView.html?idxno=8101"
    }
  },
  "attraction-800151def56c": {
    "blogs": [
      {
        "title": "[블로그 기자] '빛의 공원' 미디어아트 “귀신고래의 고향 장생포”",
        "url": "https://www.welfarehello.com/community/hometownNews/2cf254f4-7015-40a1-ba79-816e18807287",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "야경",
      "무료"
    ],
    "tip": {
      "text": "아기고래를 구한 귀신고래 이야기 영상. 여름(5~8월)엔 19:30~23시, 무료",
      "source": "https://info.koreacharts.com/tour/3462404/contents.html"
    }
  },
  "attraction-de9e4623ffa9": {
    "blogs": [
      {
        "title": "울산 가볼만한곳 - 유곡동 공룡발자국공원 화석 체험",
        "url": "https://hidori.kr/1302/",
        "source": "개인 블로그(히도리)",
        "date": null
      }
    ],
    "trend": [
      "아이와 함께",
      "무료"
    ],
    "tip": {
      "text": "백악기 공룡 발자국 80여 개(울산시 문화재자료 제12호), 로봇공룡은 10~18시 10분 간격 작동",
      "source": "https://namu.wiki/w/%EC%9A%B8%EC%82%B0%20%EA%B3%B5%EB%A3%A1%EB%B0%9C%EC%9E%90%EA%B5%AD%EA%B3%B5%EC%9B%90"
    },
    "barrierFree": {
      "status": "partial",
      "note": "휠체어 가능한 데크 산책로, 일부 계단 구간",
      "source": "https://hidori.kr/1302/"
    },
    "pets": {
      "status": "yes",
      "note": "목줄 필수, 맹견 입마개, 배변봉투 지참",
      "source": "https://info.koreacharts.com/tour/2784124/contents.html"
    }
  },
  "attraction-382f21348e9e": {
    "blogs": [
      {
        "title": "[블로그 기자] 가을을 느끼기 좋은 솔마루길 남산 코스",
        "url": "https://www.welfarehello.com/community/hometownNews/6465bfc7-ce90-4564-b40e-82da59ba228b",
        "source": "웰로(울산시 블로그 기자)",
        "date": "2023-11"
      },
      {
        "title": "[블로그 기자] 한가로운 산책의 즐거움과 함께 한 솔마루길 2구간",
        "url": "https://www.welfarehello.com/community/hometownNews/c120ec81-8691-4f3d-83ef-9fad0dd13538",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "트레킹",
      "가을 단풍"
    ],
    "tip": {
      "text": "선암호수공원~태화강국가정원 24km를 잇는 숲길, 입구마다 고래 모양 게이트",
      "source": "https://www.ulsannamgu.go.kr/solmaru/contents/intro/intro.do"
    },
    "barrierFree": {
      "status": "no",
      "note": "솔숲 능선 등산로, 남산 구간 초입 급경사",
      "source": "https://www.welfarehello.com/community/hometownNews/6465bfc7-ce90-4564-b40e-82da59ba228b"
    },
    "pets": {
      "status": "yes",
      "note": "반려견 산책 가능, 목줄 착용·배설물 수거 필수",
      "source": "https://www.welfarehello.com/community/hometownNews/c120ec81-8691-4f3d-83ef-9fad0dd13538"
    }
  },
  "attraction-2c479a6beabb": {
    "blogs": [
      {
        "title": "울산 중구민들을 위한 문화공간, 중구 문화의전당",
        "url": "https://www.welfarehello.com/community/hometownNews/850be5c1-8f1f-4f49-ad42-b28573b52971",
        "source": "웰로(울산시 블로그 기자)",
        "date": "2024-02"
      },
      {
        "title": "울산 중구문화의전당 개관 10주년",
        "url": "https://www.welfarehello.com/community/hometownNews/73a8a9fd-4d4a-4241-98d0-c6f3e102bf81",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [
      "비 오는 날"
    ],
    "tip": {
      "text": "2015 대한민국 공공건축상 수상 건물, 3층엔 옥상정원 '하늘마당'",
      "source": "https://www.welfarehello.com/community/hometownNews/850be5c1-8f1f-4f49-ad42-b28573b52971"
    },
    "barrierFree": {
      "status": "partial",
      "note": "장애인 주차 8면(지상 6·지하 2)",
      "source": "https://www.welfarehello.com/community/hometownNews/73a8a9fd-4d4a-4241-98d0-c6f3e102bf81"
    }
  },
  "attraction-d75f2459a781": {
    "blogs": [
      {
        "title": "걸으면서 보고 배우는 산책 명소, 중구 복산동 서덕출 공원",
        "url": "https://www.welfarehello.com/community/hometownNews/ebc16d82-3a2f-4935-b54b-a9db1529ee0e",
        "source": "웰로(울산시 블로그 기자)",
        "date": null
      }
    ],
    "trend": [],
    "tip": {
      "text": "울산 출신 동요작가 서덕출 동상 근처에서 그의 동요 원곡이 흘러나와요(한 바퀴 약 1시간)",
      "source": "https://www.welfarehello.com/community/hometownNews/ebc16d82-3a2f-4935-b54b-a9db1529ee0e"
    }
  },
  "attraction-ecfe01653cdc": {
    "blogs": [],
    "trend": [],
    "tip": {
      "text": "'상상이 일상이 되는 우리동네 관광 상생회관'의 줄임말. 온실형 2층 건물, 1층 찻집·2층 전시공연장",
      "source": "http://www.mediatoday.asia/421837"
    }
  },
  "attraction-9a0c06b7f229": {
    "blogs": [
      {
        "title": "신불산 가는 길 ㅡ간월재",
        "url": "https://brunch.co.kr/@yjwon12/138",
        "source": "브런치",
        "date": "2023-01"
      }
    ],
    "trend": [
      "트레킹",
      "무료"
    ],
    "tip": {
      "text": "해발 약 900m 간월재 억새평원은 약 10만 평, 배내2공영주차장에서 완만한 임도로 약 6km(2시간)",
      "source": "https://www.telltrip.com/domestic-travel/ganwoljae-yeongnam-alps-silvergrass-hiking/"
    },
    "barrierFree": {
      "status": "no",
      "note": "영남알프스 등산로 위주, 장애인 편의시설 없음",
      "source": "https://www.ktriptips.com/kor/tourspot/128207"
    },
    "wikiTitles": [
      "ko:신불산",
      "en:Sinbulsan"
    ],
    "photo": {
      "url": "/images/places/attraction-9a0c06b7f229.jpg",
      "page": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=5dd6d062-6c2f-4ccb-920d-7fe58fc0f895",
      "credit": "한국관광공사",
      "license": "공공누리 제4유형 (출처표시-상업용금지-변경금지)",
      "noAlter": true,
      "sourceUrl": "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=263a9b3c-1308-40f5-b2a6-82b9a444adca"
    }
  },
  "attraction-26567fa9db6e": {
    "blogs": [
      {
        "title": "울산 여행 아이와 함께 가기 좋은 철구소 자드락숲",
        "url": "https://blog.naver.com/r00326/224012428139",
        "source": "네이버 블로그",
        "date": null
      }
    ],
    "trend": [
      "아이와 함께",
      "무료"
    ],
    "tip": {
      "text": "연꽃 습지에서 개구리·올챙이를 관찰하고 버섯생태관도 볼 수 있는 무료 숲 놀이터",
      "source": "https://www.ktriptips.com/kor/tourspot/2754456"
    }
  },
  "attraction-7af790b4642f": {
    "blogs": [],
    "trend": [
      "무료",
      "비 오는 날"
    ],
    "tip": {
      "text": "방어진활어센터 상인들과 2023 문화도시 울산 공모로 만든 갤러리·공방, 월요일 휴관·무료",
      "source": "https://info.koreacharts.com/tour/3521859/contents.html"
    }
  },
  "attraction-00a82a6d16e7": {
    "blogs": [],
    "trend": [
      "캠핑",
      "아이와 함께"
    ],
    "tip": {
      "text": "태화저수지 옆 쇄석 사이트 약 40면, 전기·온수·샤워장 완비에 척과천 야외물놀이장이 가까움",
      "source": "https://www.ktriptips.com/kor/leisure/2730148"
    },
    "pets": {
      "status": "no",
      "note": "고캠핑 등록정보상 반려동물 출입 불가",
      "source": "https://www.gocamping.or.kr/bsite/camp/info/read.do?c_no=3145&viewType=read01"
    }
  },
  "attraction-945837bdd2d3": {
    "blogs": [],
    "trend": [
      "바다 뷰"
    ],
    "tip": {
      "text": "여름(7~9월) 우가항에서 투명카약·스노클링·패들보드·해녀체험 등 해양레저 8종 운영(2025)",
      "source": "https://www.ktnnews.co.kr/108868"
    }
  },
  "attraction-1bd9bd605a9f": {
    "blogs": [
      {
        "title": "울산 새로운 핫플 성안동 달빛 야경 누리길 – 울산 가볼만한곳",
        "url": "https://lightone.kr/%EC%9A%B8%EC%82%B0-%EC%83%88%EB%A1%9C%EC%9A%B4-%ED%95%AB%ED%94%8C-%EC%84%B1%EC%95%88%EB%8F%99-%EB%8B%AC%EB%B9%9B-%EC%95%BC%EA%B2%BD-%EB%88%84%EB%A6%AC%EA%B8%B8-%EC%9A%B8%EC%82%B0-%EA%B0%80%EB%B3%BC/",
        "source": "개인 블로그(라이트원)",
        "date": "2023-11"
      }
    ],
    "trend": [
      "야경",
      "인생샷",
      "무료"
    ],
    "tip": {
      "text": "'천국의 계단' 등 포토존 4곳, 바닥조명 따라 걸으며 울산대교까지 보이는 시티뷰 야경",
      "source": "https://www.ktriptips.com/kor/tourspot/3357254"
    }
  },
  "attraction-9f42b5ec06cf": {
    "blogs": [],
    "trend": [
      "캠핑",
      "아이와 함께"
    ],
    "tip": {
      "text": "쇄석 사이트 12면뿐인 아담한 숲속 캠핑장, 숲해설·유아숲 체험 프로그램 운영",
      "source": "https://www.ktriptips.com/kor/leisure/2741542"
    },
    "pets": {
      "status": "no",
      "note": "고캠핑 등록정보상 반려동물 출입 불가",
      "source": "https://www.gocamping.or.kr/bsite/camp/info/read.do?c_no=7043&viewType=read01"
    }
  },
  "attraction-47254af5ba81": {
    "blogs": [
      {
        "title": "[명품숲길 50선] 울산 큰마을저수지 둘레길 : 봄 벚꽃길·가을 단풍·철새 맞춤 트레킹",
        "url": "https://sanisanee.co.kr/367",
        "source": "개인 블로그(산이사니)",
        "date": "2025-09"
      }
    ],
    "trend": [
      "꽃 명소"
    ],
    "tip": {
      "text": "약 3.5km 둘레길, 3월 말~4월 초 벚꽃이 수면에 비치고 늦가을엔 철새 관찰 포인트",
      "source": "https://sanisanee.co.kr/367"
    },
    "barrierFree": {
      "status": "partial",
      "note": "2024년 산림공원~녹수초 후문 구간 데크 정비, 황토·야자매트 구간 있음",
      "source": "https://www.ksilbo.co.kr/news/articleView.html?idxno=1005383"
    }
  },
  "attraction-02d7d96a2825": {
    "blogs": [
      {
        "title": "울산의 바다풍경",
        "url": "https://brunch.co.kr/@hitchwill/9248",
        "source": "브런치",
        "date": "2025-07"
      },
      {
        "title": "울산 주전어촌체험마을, 아이랑 바다 체험하기 딱 좋은 곳!",
        "url": "https://lightone.kr/%EC%9A%B8%EC%82%B0-%EC%A3%BC%EC%A0%84%EC%96%B4%EC%B4%8C%EC%B2%B4%ED%97%98%EB%A7%88%EC%9D%84/",
        "source": "개인 블로그(라이트원)",
        "date": "2025-06"
      }
    ],
    "trend": [
      "바다 뷰",
      "아이와 함께"
    ],
    "tip": {
      "text": "육지에서 유일하게 해녀체험이 가능한 곳으로 소개되며, 직접 캔 해산물로 '해녀 밥상'을 맛볼 수 있음",
      "source": "https://m.dailian.co.kr/news/view/1128955"
    },
    "photo": {
      "url": "/images/places/attraction-02d7d96a2825.jpg",
      "page": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=51a1a924-b698-4928-b077-18bb9e2dca49",
      "credit": "한국관광공사 (여행작가 구완회)",
      "license": "공공누리 제4유형 (출처표시-상업용금지-변경금지)",
      "noAlter": true,
      "sourceUrl": "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=80d08eda-de89-425d-94f1-c591a827f535"
    }
  },
  "onggi-village": {
    "blogs": [
      {
        "title": "2024 울산옹기축제 소개: 웰컴 투 옹기마을",
        "url": "https://lightone.kr/2024-%EC%9A%B8%EC%82%B0%EC%98%B9%EA%B8%B0%EC%B6%95%EC%A0%9C-%EC%86%8C%EA%B0%9C-%EC%9B%B0%EC%BB%B4-%ED%88%AC-%EC%98%B9%EA%B8%B0%EB%A7%88%EC%9D%84/",
        "source": "개인 블로그(라이트원)",
        "date": "2024-05"
      }
    ],
    "trend": [
      "역사 탐방",
      "아이와 함께",
      "무료"
    ],
    "tip": {
      "text": "1950년대 옹기장들이 모여 생긴 국내 최대 옹기 집성촌으로 전국 옹기의 약 50%를 생산",
      "source": "https://www.telltrip.com/festival/the-largest-traditional-onggi-community/"
    },
    "wikiTitles": [
      "ko:외고산 옹기마을",
      "ko:외고산옹기마을",
      "en:Oegosan Onggi Village"
    ],
    "barrierFree": {
      "status": "yes",
      "note": "장애인 주차장·장애인 화장실, 주출입구 턱 없음, 휠체어 대여, 점자안내판",
      "source": "https://access.visitkorea.or.kr/ms/detail.do?cotId=db697a4c-a21e-4802-9ba4-12ed14b6298a"
    },
    "photo": {
      "url": "/images/places/onggi-village.jpg",
      "page": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=16a55bf1-56aa-4249-a67d-c66c69830756",
      "credit": "한국관광공사 (글·사진 서영진 여행작가)",
      "license": "공공누리 제4유형 (출처표시-상업용금지-변경금지)",
      "noAlter": true,
      "sourceUrl": "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=daae64fb-0663-4673-be11-5d4d896bb507"
    }
  },
  "attraction-f537690b569f": {
    "blogs": [],
    "trend": [
      "역사 탐방",
      "무료"
    ],
    "tip": {
      "text": "'방바위'라 불리는 거대한 암벽에 돋을새김한 통일신라 불상으로 본존 높이만 5m",
      "source": "https://www.ktriptips.com/kor/tourspot/128187"
    },
    "wikiTitles": [
      "ko:울산 어물동 마애여래좌상"
    ]
  },
  "attraction-7126f8fcc59d": {
    "blogs": [
      {
        "title": "울산 동구 아이랑 가볼만한 곳 슬도 낚시 후기 ft 줄낚시 채비...",
        "url": "https://blog.naver.com/pandasso/223393863600",
        "source": "네이버 블로그",
        "date": null
      },
      {
        "title": "12개월아기+10일_ 아기랑 슬도(토요여행클럽)",
        "url": "https://blog.naver.com/snowday83/223385612149",
        "source": "네이버 블로그",
        "date": null
      },
      {
        "title": "슬도 팜파스·댑싸리·등대 포토존 완벽 공략 (주차/위치/가볼만한곳)",
        "url": "https://lightone.kr/%EC%8A%AC%EB%8F%84-%ED%8C%9C%ED%8C%8C%EC%8A%A4-%EB%8C%91%EC%8B%B8%EB%A6%AC/",
        "source": "개인 블로그(라이트원)",
        "date": "2025-09"
      }
    ],
    "trend": [
      "바다 뷰",
      "일몰",
      "무료"
    ],
    "tip": {
      "text": "구멍 숭숭 뚫린 바위에 파도가 부딪히는 소리가 거문고 같다 해 '瑟島', 동해안에서 드문 일몰 명소",
      "source": "https://kbmaeil.com/article/202203130329811"
    },
    "visitors": {
      "count": 254959,
      "year": 2024,
      "label": "연간 입장객",
      "source": "https://www.ulsanpress.net/news/articleView.html?idxno=545255"
    },
    "wikiTitles": [
      "ko:슬도"
    ],
    "photo": {
      "url": "/images/places/attraction-7126f8fcc59d.jpg",
      "page": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=79bfe44d-66f7-4ece-b153-063cc1a24747",
      "credit": "한국관광공사",
      "license": "공공누리 제4유형 (출처표시-상업용금지-변경금지)",
      "noAlter": true,
      "sourceUrl": "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=84e2824e-dbe8-4276-a279-f3e3f69df4a2"
    }
  },
  "attraction-29c60b06fe80": {
    "blogs": [],
    "trend": [
      "꽃 명소",
      "아이와 함께",
      "무료"
    ],
    "tip": {
      "text": "호수 둘레 산책로에 1.5~1.8m 크기의 미니 절·교회·성당이 나란히 있음",
      "source": "https://en.wikipedia.org/wiki/Seonam_Lake_Park"
    },
    "wikiTitles": [
      "ko:선암호수공원"
    ],
    "barrierFree": {
      "status": "yes",
      "note": "장애인전용주차장, 장애인화장실 3곳, 휠체어·유모차 무료 대여(신분증 지참)",
      "source": "https://access.visitkorea.or.kr/ms/detail.do?cotId=c8e5cadb-402a-47e0-bb7f-41a91cb3bba7"
    }
  },
  "attraction-d8d83dfadf19": {
    "blogs": [],
    "trend": [],
    "tip": {
      "text": "대운산(742m)은 원효대사의 마지막 수행처로 알려진 산으로, 치유의 숲은 그 자락에 있어요",
      "source": "https://www.ktriptips.com/kor/tourspot/128214"
    },
    "barrierFree": {
      "status": "yes",
      "note": "장애인 전용 주차 1면, 경사로 출입구, 장애인 화장실, 안내센터 휠체어 무료 대여(3대)",
      "source": "https://access.visitkorea.or.kr/ms/detail.do?cotId=d43a66bc-d06d-4147-9787-2d52f130d1db"
    },
    "pets": {
      "status": "no",
      "note": "장애인 보조견 외 반려동물 동반 제한",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-national-daunsan-healing-forest-reservations/"
    }
  },
  "taehwagang-national-garden": {
    "blogs": [
      {
        "title": "4km 대나무 터널, 울산 십리대숲의 청량함",
        "url": "https://brunch.co.kr/@qrssa/5274",
        "source": "브런치",
        "date": "2026-06"
      },
      {
        "title": "울산 1박 2일 여행",
        "url": "https://brunch.co.kr/@cutem4/11",
        "source": "브런치",
        "date": "2026-06"
      }
    ],
    "trend": [
      "야경",
      "꽃 명소",
      "무료",
      "인생샷",
      "아이와 함께"
    ],
    "tip": {
      "text": "십리대숲 은하수길은 일몰부터 밤 11시까지 불이 켜져 야간 산책 명소예요",
      "source": "https://www.ulsan.go.kr/s/garden/contents.ulsan?mId=001004004000000000"
    },
    "barrierFree": {
      "status": "yes",
      "note": "정원 내 모든 공간 휠체어·유모차 통행 가능, 장애인 화장실·주차 구역 있음",
      "source": "https://www.ulsan.go.kr/s/garden/contents.ulsan?mId=001004004000000000"
    },
    "pets": {
      "status": "partial",
      "note": "이동장(하우스·켄넬) 이용 시에만 동반 가능하다는 안내",
      "source": "https://mom-mom.net/travel/places/64b9d9d5c72cc5ffd76c22f5"
    },
    "visitors": {
      "count": 5000000,
      "year": 2023,
      "label": "연간 방문객(울산시 집계, 약)",
      "source": "https://www.ajunews.com/view/20240510134621032"
    },
    "wikiTitles": [
      "ko:태화강 국가정원",
      "ko:태화강국가정원",
      "en:Taehwagang National Garden"
    ],
    "photo": {
      "url": "/images/places/taehwagang-national-garden.jpg",
      "page": "https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?wrtSn=13048987&menuNo=200023",
      "credit": "공유마당 / 조상근 (태화강 십리대밭교 반영)",
      "license": "CC BY 4.0",
      "noAlter": false,
      "sourceUrl": "https://gongu.copyright.or.kr/gongu/wrt/cmmn/wrtFileImageView.do?wrtSn=13048987&filePath=L2Rpc2sxL25ld2RhdGEvMjAxNy85OC9DTFM2L1dSVF9UUkVBU1VSRV9IVU5UXzIwMTcwOTExXzEyNQ==&thumbAt=Y&thumbSe=b_tbumb&wrtTy=10006"
    }
  },
  "attraction-b67e2eda56d3": {
    "blogs": [],
    "trend": [
      "역사 탐방"
    ],
    "tip": {
      "text": "아파트 건설 중 발견돼 1991·1993년 두 차례 발굴로 약 200기의 삼국시대 무덤이 확인됐어요",
      "source": "https://www.ktriptips.com/kor/tourspot/1624370"
    },
    "wikiTitles": [
      "ko:울산 중산동 고분군"
    ],
    "photo": {
      "url": "/images/places/attraction-b67e2eda56d3.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:%EC%9A%B8%EC%82%B0_%EC%A4%91%EC%82%B0%EB%8F%99_%EA%B3%A0%EB%B6%84%EA%B5%B02.jpg",
      "credit": "국가유산청 / Wikimedia Commons",
      "license": "KOGL Type 1",
      "noAlter": false,
      "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6b/%EC%9A%B8%EC%82%B0_%EC%A4%91%EC%82%B0%EB%8F%99_%EA%B3%A0%EB%B6%84%EA%B5%B02.jpg"
    }
  },
  "bangudae-petroglyphs": {
    "blogs": [
      {
        "title": "01화 인류가 지켜야 할 암각 호랑이를 만나다",
        "url": "https://brunch.co.kr/@jheari/5",
        "source": "브런치",
        "date": "2026-04"
      }
    ],
    "trend": [
      "역사 탐방"
    ],
    "tip": {
      "text": "맨눈으론 잘 안 보이는 그림을 전망대의 AI 기반 XR 망원경 4대로 자세히 볼 수 있어요",
      "source": "https://m.go.seoul.co.kr/news/2026/07/16/20260716022001"
    },
    "visitors": {
      "count": 115000,
      "year": 2025,
      "label": "울산암각화박물관 관람객(약, 세계유산 등재 후 +42.6%)",
      "source": "https://m.go.seoul.co.kr/news/2026/07/16/20260716022001"
    },
    "wikiTitles": [
      "ko:울주 대곡리 반구대 암각화",
      "ko:반구대 암각화",
      "en:Bangudae Petroglyphs"
    ],
    "barrierFree": {
      "status": "partial",
      "note": "인근 울산암각화박물관에 장애인 주차·화장실·엘리베이터, 휠체어 4대 대여. 박물관 안내상 암각화 관찰데크까지 휠체어 접근 가능",
      "source": "https://access.visitkorea.or.kr/ms/detail.do?cotId=c950c64e-821e-4946-ac69-8bb27bdb98cf"
    },
    "photo": {
      "url": "/images/places/bangudae-petroglyphs.jpg",
      "page": "https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?wrtSn=13304440&menuNo=200023",
      "credit": "공유마당 / 강형원",
      "license": "기증저작물 자유이용 (공유마당)",
      "noAlter": false,
      "sourceUrl": "https://gongu.copyright.or.kr/gongu/wrt/cmmn/wrtFileImageView.do?wrtSn=13304440&filePath=L2Rpc2sxL25ld2RhdGEvMjAyMi85OC9DTFMxMDAwNi9hZTM2Y2IxMy03MjQzLTRlMzYtOWQxZC1iODk2MTRjZmVmNTg=&thumbAt=Y&thumbSe=b_tbumb&wrtTy=10006"
    }
  },
  "ganjeolgot": {
    "blogs": [
      {
        "title": "울산 1박 2일 여행",
        "url": "https://brunch.co.kr/@cutem4/11",
        "source": "브런치",
        "date": "2026-06"
      }
    ],
    "trend": [
      "일출",
      "바다 뷰",
      "무료",
      "인생샷"
    ],
    "tip": {
      "text": "높이 5m의 대형 '소망우체통'이 간절곶의 상징 포토존이에요",
      "source": "https://www.ktriptips.com/eng/tourspot/3103119"
    },
    "pets": {
      "status": "yes",
      "note": "반려동물 동반 가능(야외), 바람이 강하니 대비",
      "source": "https://mom-mom.net/travel/places/6510d5e57b6f8db33b8dfbb6"
    },
    "visitors": {
      "count": 100000,
      "year": 2026,
      "label": "새해 첫날 하루 해맞이 인파(약)",
      "source": "https://www.g-enews.com/article/General-News/2026/06/202606120723048188f7ba87f45b_1"
    },
    "wikiTitles": [
      "ko:간절곶",
      "en:Ganjeolgot"
    ],
    "barrierFree": {
      "status": "partial",
      "note": "장애인 화장실은 있으나 일부 길이 험해 유모차·휠체어 이동 주의",
      "source": "https://mom-mom.net/travel/places/6510d5e57b6f8db33b8dfbb6"
    },
    "photo": {
      "url": "/images/places/ganjeolgot.jpg",
      "page": "https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?wrtSn=13333632&menuNo=200023",
      "credit": "공유마당 / 여행작가이동근",
      "license": "CC BY 4.0",
      "noAlter": false,
      "sourceUrl": "https://gongu.copyright.or.kr/gongu/wrt/cmmn/wrtFileImageView.do?wrtSn=13333632&filePath=L2Rpc2sxL25ld2RhdGEvMjAyMy8yMS9DTFMxMDAwNi9jMGQwN2YzYy0wNWIyLTRkMjEtYTQ2Ny1kODBmNzI4OTUzM2I=&thumbAt=Y&thumbSe=b_tbumb&wrtTy=10006"
    }
  },
  "daewangam-park": {
    "blogs": [
      {
        "title": "울산 1박 2일 여행",
        "url": "https://brunch.co.kr/@cutem4/11",
        "source": "브런치",
        "date": "2026-06"
      },
      {
        "title": "울산 애견동반 여행 강아지와 가볼만한 곳 TOP 3",
        "url": "https://kkamiiii.com/entry/%EC%9A%B8%EC%82%B0-%EC%95%A0%EA%B2%AC%EB%8F%99%EB%B0%98%EC%97%AC%ED%96%89-%EA%B0%95%EC%95%84%EC%A7%80%EC%99%80-%EA%B0%80%EB%B3%BC%EB%A7%8C%ED%95%9C-%EA%B3%B3-TOP-3",
        "source": "티스토리(세상에나)",
        "date": "2022-11"
      }
    ],
    "trend": [
      "일출",
      "바다 뷰",
      "무료",
      "꽃 명소"
    ],
    "tip": {
      "text": "8월 하순~9월 초 해송숲 아래 맥문동이 보랏빛으로 피어요. 빛내림은 이른 아침이 좋아요",
      "source": "https://www.telltrip.com/domestic-travel/ulsan-daewangam-park-maekmundong/"
    },
    "barrierFree": {
      "status": "partial",
      "note": "대부분 산책로 정비돼 유모차 이동 가능, 대왕암 쪽은 경사·계단 구간",
      "source": "https://mom-mom.net/travel/places/667a1afccc79df71c35527dc"
    },
    "visitors": {
      "count": 394287,
      "year": 2024,
      "label": "연간 입장객",
      "source": "https://www.ulsanpress.net/news/articleView.html?idxno=545255"
    },
    "wikiTitles": [
      "ko:대왕암공원",
      "en:Daewangam Park"
    ],
    "pets": {
      "status": "partial",
      "note": "공원 산책로는 반려견 동반 가능, 출렁다리는 반려견 출입 불가",
      "source": "https://kkamiiii.com/entry/%EC%9A%B8%EC%82%B0-%EC%95%A0%EA%B2%AC%EB%8F%99%EB%B0%98%EC%97%AC%ED%96%89-%EA%B0%95%EC%95%84%EC%A7%80%EC%99%80-%EA%B0%80%EB%B3%BC%EB%A7%8C%ED%95%9C-%EA%B3%B3-TOP-3"
    },
    "photo": {
      "url": "/images/places/daewangam-park.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:KU-Dwa2.jpg",
      "credit": "Dittwjfsdgkvkdjg / Wikimedia Commons",
      "license": "CC BY-SA 3.0",
      "noAlter": false,
      "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/7/74/KU-Dwa2.jpg"
    }
  },
  "attraction-6b36b1c5e3d8": {
    "blogs": [],
    "trend": [
      "바다 뷰",
      "무료",
      "인생샷"
    ],
    "tip": {
      "text": "중간 지지대 없는 303m로 국내 출렁다리 중 최장 경간. 매월 둘째 주 화요일 휴장, 17:40 입장 마감",
      "source": "https://www.ktriptips.com/kor/tourspot/2990054"
    },
    "visitors": {
      "count": 775700,
      "year": 2024,
      "label": "연간 입장객",
      "source": "https://www.ulsanpress.net/news/articleView.html?idxno=545255"
    },
    "barrierFree": {
      "status": "no",
      "note": "계단·금속 구조라 휠체어·유모차로 건널 수 없음. 인근 전망 공간에서 조망",
      "source": "https://www.ablenews.co.kr/news/articleView.html?idxno=219019"
    },
    "pets": {
      "status": "no",
      "note": "출렁다리는 반려견 출입 불가",
      "source": "https://kkamiiii.com/entry/%EC%9A%B8%EC%82%B0-%EC%95%A0%EA%B2%AC%EB%8F%99%EB%B0%98%EC%97%AC%ED%96%89-%EA%B0%95%EC%95%84%EC%A7%80%EC%99%80-%EA%B0%80%EB%B3%BC%EB%A7%8C%ED%95%9C-%EA%B3%B3-TOP-3"
    }
  },
  "attraction-362c4cae73a6": {
    "blogs": [
      {
        "title": "열대의 바다를 닮은 섬",
        "url": "https://brunch.co.kr/@hitchwill/10298",
        "source": "브런치",
        "date": "2026-06"
      }
    ],
    "trend": [
      "야경",
      "바다 뷰",
      "무료",
      "인생샷"
    ],
    "tip": {
      "text": "'아바타 섬'으로도 불려요. 2022년부터 '태양이 잠든 섬' 테마 미디어아트로 밤에만 빛나요",
      "source": "https://www.khan.co.kr/article/202508160600035"
    },
    "wikiTitles": [
      "ko:명선도"
    ]
  },
  "attraction-b37d2285ab03": {
    "blogs": [
      {
        "title": "열대의 바다를 닮은 섬",
        "url": "https://brunch.co.kr/@hitchwill/10298",
        "source": "브런치",
        "date": "2026-06"
      }
    ],
    "trend": [
      "바다 뷰",
      "무료",
      "아이와 함께"
    ],
    "tip": {
      "text": "개장 기간엔 파라솔·튜브·구명조끼를 무료로 빌려줘요(신분증 필요)",
      "source": "https://www.khan.co.kr/article/202508160600035"
    },
    "visitors": {
      "count": 850000,
      "year": 2024,
      "label": "해수욕장 개장 65일간 방문객(약)",
      "source": "https://newsseoul.co.kr/news/view/1065604239664081"
    },
    "wikiTitles": [
      "ko:진하해수욕장"
    ],
    "pets": {
      "status": "yes",
      "note": "전 견종·전 구역 동반 가능, 목줄 필수, 입수 시 보호자 동행, 맹견 입마개",
      "source": "https://info.koreacharts.com/tour/126096/contents.html"
    }
  },
  "ulsan-grand-park": {
    "blogs": [],
    "trend": [
      "아이와 함께",
      "꽃 명소",
      "무료"
    ],
    "tip": {
      "text": "SK가 1996년부터 약 10년간 조성해 울산시에 기부한 364ha 규모 공원이에요",
      "source": "https://www.ktriptips.com/kor/tourspot/127644"
    },
    "visitors": {
      "count": 485867,
      "year": 2024,
      "label": "유료시설 연간 입장객",
      "source": "https://namu.wiki/w/%EC%9A%B8%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C/%EA%B4%80%EA%B4%91"
    },
    "wikiTitles": [
      "ko:울산대공원",
      "en:Ulsan Grand Park"
    ],
    "barrierFree": {
      "status": "partial",
      "note": "정·동·남문 경비실에서 신분증 제시 후 휠체어 무료 대여",
      "source": "https://www.uic.or.kr/ulsanpark/introduction/intro02_4.do"
    },
    "pets": {
      "status": "partial",
      "note": "일부 구역 산책만 가능(목줄 필수), 장미원·동물원 등 시설은 동반 불가",
      "source": "https://info.koreacharts.com/tour/127644/contents.html"
    },
    "photo": {
      "url": "/images/places/ulsan-grand-park.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:%EC%9A%B8%EC%82%B0%EB%8C%80%EA%B3%B5%EC%9B%90_%ED%98%84%EC%B6%A9%ED%83%91_20170524_161927.jpg",
      "credit": "Dongchan0417 / Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "noAlter": false,
      "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c3/%EC%9A%B8%EC%82%B0%EB%8C%80%EA%B3%B5%EC%9B%90_%ED%98%84%EC%B6%A9%ED%83%91_20170524_161927.jpg"
    }
  }
};

export function getPlaceStory(id: string): PlaceStory | undefined {
  return PLACE_STORIES[id];
}

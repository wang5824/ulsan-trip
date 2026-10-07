import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../data/attractions";
import { createTourPhotoLoader, fetchTourPlaces, mapTourPhotos, matchTourPlace, tourPhoto, TourApiError, type TourPlace } from "./tourapi-photos";
import { loadPlacePhotos } from "./place-photo-client";

const place = attractions.find(item => item.id === "daewangam-park")!;
const item: TourPlace = {
  contentid: "123", contenttypeid: "12", title: "울산 대왕암공원",
  addr1: place.address!, areacode: "7", mapx: String(place.longitude), mapy: String(place.latitude),
  firstimage: "http://tong.visitkorea.or.kr/cms/resource/1/photo.jpg", cpyrhtDivCd: "Type3",
};

test("사진은 장소 이름·지역·유형·좌표가 일치할 때만 연결한다", () => {
  assert.equal(matchTourPlace(place, [item]), item);
  for (const override of [
    { title: "대왕암공원 출렁다리" }, { areacode: "6" }, { addr1: "울산광역시 남구" },
    { contenttypeid: "39" }, { mapx: "129.1" },
  ]) assert.equal(matchTourPlace(place, [{ ...item, ...override }]), undefined);
  assert.equal(matchTourPlace({ ...place, latitude: null }, [item]), item);
  assert.equal(matchTourPlace({ ...place, latitude: null, address: null }, [item]), undefined);
});

test("동명 장소의 주소가 다르면 임의의 사진을 선택하지 않는다", () => {
  assert.equal(matchTourPlace(place, [item, { ...item, contentid: "456", addr1: "울산광역시 동구 다른길 1" }]), undefined);
  assert.equal(matchTourPlace(place, [{ ...item, firstimage: "" }, item]), item);
});

test("확인한 별칭과 지역 괄호 표기를 지원한다", () => {
  assert.equal(matchTourPlace({ ...place, name: "대왕암공원(울산)" }, [item]), item);
  assert.equal(matchTourPlace({ ...place, id: "attraction-55f2bdca0fe1", name: "고래바다여행선" }, [{ ...item, title: "장생포 고래바다여행선" }])?.title, "장생포 고래바다여행선");
});

test("HTTPS 주소와 출처를 제공하고 공공누리 3유형의 변경금지를 유지한다", () => {
  const photo = tourPhoto(item)!;
  assert.equal(photo.url, "https://tong.visitkorea.or.kr/cms/resource/1/photo.jpg");
  assert.equal(photo.noAlter, true);
  assert.match(photo.credit, /한국관광공사.*대왕암공원/);
  assert.equal(tourPhoto({ ...item, cpyrhtDivCd: "Type1" })?.noAlter, false);
  assert.deepEqual(mapTourPhotos([place], [item]), { [place.id]: photo });
});

test("이용조건 미확인 이미지와 외부 주소는 사용하지 않는다", () => {
  for (const cpyrhtDivCd of ["", "Type2", "Type4", undefined]) assert.equal(tourPhoto({ ...item, cpyrhtDivCd }), undefined);
  for (const firstimage of ["", "javascript:alert(1)", "https://example.com/photo.jpg", "https://tong.visitkorea.or.kr.evil.test/cms/resource/a.jpg", "https://user:secret@tong.visitkorea.or.kr/cms/resource/a.jpg"])
    assert.equal(tourPhoto({ ...item, firstimage }), undefined);
});

function apiResponse(items: TourPlace[], totalCount = items.length) {
  return Response.json({ response: { header: { resultCode: "0000" }, body: { totalCount, items: { item: items } } } });
}

test("인코딩된 키를 한 번만 인코딩하고 다음 페이지도 조회한다", async () => {
  const calls: URL[] = [];
  const result = await fetchTourPlaces("test%2Bkey%2F%3D", async (input, init) => {
    const url = new URL(String(input));
    calls.push(url);
    assert.equal(url.searchParams.get("serviceKey"), "test+key/=");
    assert.equal(url.searchParams.get("areaCode"), "7");
    assert.equal(init?.cache, "no-store");
    return apiResponse([{ ...item, contentid: String(calls.length) }], 2);
  });
  assert.equal(result.length, 2);
  assert.deepEqual(calls.map(url => url.searchParams.get("pageNo")), ["1", "2"]);
});

test("HTTP·인증·형식 오류를 사진 없음으로 저장하지 않고 키를 노출하지 않는다", async () => {
  const secret = "fake-secret-key";
  const responses = [new Response("limited", { status: 429 }), new Response("<xml>error</xml>"),
    Response.json({ response: { header: { resultCode: "30", resultMsg: secret } } }),
    Response.json({ response: { header: { resultCode: "0000" }, body: { totalCount: 1, items: "" } } })];
  for (const response of responses) {
    await assert.rejects(fetchTourPlaces(secret, async () => response), error => {
      assert(error instanceof TourApiError);
      assert(!String(error).includes(secret));
      return true;
    });
  }
  await assert.rejects(fetchTourPlaces(secret, async () => { throw new Error(`URL with ${secret}`); }), error => !String(error).includes(secret));
  await assert.rejects(fetchTourPlaces(" "), TourApiError);
  assert.deepEqual(await fetchTourPlaces(secret, async () => apiResponse([])), []);
});

test("동시 요청을 합치고 정상 사진 목록을 하루 동안 재사용한다", async () => {
  let now = 0, calls = 0;
  const photos = mapTourPhotos([place], [item]);
  const load = createTourPhotoLoader(async () => { calls++; return photos; }, () => now);
  assert.deepEqual(await Promise.all([load(), load(), load()]), [photos, photos, photos]);
  assert.equal(calls, 1);
  now += 1000;
  await load();
  assert.equal(calls, 1);
  now += 24 * 60 * 60 * 1000;
  await load();
  assert.equal(calls, 2);
});

test("실패 후 잠깐 대기하고 복구하며 이전 성공 결과를 빈 목록으로 덮어쓰지 않는다", async () => {
  let now = 0, calls = 0;
  const load = createTourPhotoLoader(async () => {
    calls++;
    if (calls === 1) throw new Error("temporary");
    return mapTourPhotos([place], [item]);
  }, () => now);
  await assert.rejects(load());
  await assert.rejects(load());
  assert.equal(calls, 1);
  now = 30001;
  assert.equal((await load())[place.id].noAlter, true);
  assert.equal(calls, 2);
});

test("브라우저 카드들의 요청을 공유하고 실패한 요청은 재시도할 수 있다", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async input => {
      assert.equal(input, "/api/place-photos");
      calls++;
      return calls === 1 ? new Response("", { status: 503 }) : Response.json({ photos: mapTourPhotos([place], [item]) });
    };
    await assert.rejects(loadPlacePhotos());
    const [first, second] = await Promise.all([loadPlacePhotos(), loadPlacePhotos()]);
    assert.deepEqual(first, second);
    assert.equal(calls, 2);
    await loadPlacePhotos();
    assert.equal(calls, 2);
  } finally { globalThis.fetch = originalFetch; }
});

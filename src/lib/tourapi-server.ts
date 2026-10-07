import "server-only";
import { placeCatalog } from "../data/places";
import { createTourPhotoLoader, fetchTourPlaces, mapTourPhotos, TourApiError } from "./tourapi-photos";

export const getTourPhotos = createTourPhotoLoader(async () => {
  const key = process.env.TOURAPI_KEY;
  if (!key) throw new TourApiError("configuration");
  const items = await fetchTourPlaces(key);
  return mapTourPhotos(Object.values(placeCatalog).flat(), items);
});

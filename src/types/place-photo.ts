export interface PlacePhotoData {
  url: string;
  sourceUrl: string;
  page: string;
  credit: string;
  license: string;
  noAlter: boolean;
}

export type PlacePhotoMap = Record<string, PlacePhotoData>;

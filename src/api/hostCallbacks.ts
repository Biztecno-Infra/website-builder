export interface UploadedImage {
  imageUrl: string;
  assetId: string;
  assetUrl?: string;
}

export interface ImageSearchResult {
  imageUrl: string;
  assetId?: string;
  assetUrl?: string;
  name?: string;
}

export interface ImageSearchResponse {
  items: ImageSearchResult[];
  totalCount: number;
}

/** Reused for onFetchUploads — same paginated shape as search */
export type UploadLibraryResponse = ImageSearchResponse;

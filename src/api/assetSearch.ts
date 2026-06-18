import { apiGet } from './http';
import { getAssetApiConfig } from './config';

export interface AssetThumbnail {
  url: string;
  valid_until: string;
}

export interface AssetItem {
  id: string;
  filename: string;
  thumbnails: Record<string, AssetThumbnail> | null;
}

export interface AssetSearchResponse {
  total_count: number;
  items: AssetItem[];
}

export interface AssetSearchParams {
  query?:  string;
  limit?:  number;
  offset?: number;
  expand?: string;
}

// Preferred sizes for grid preview (medium quality)
const THUMB_SIZES  = ['300px', '600px', '160px', '125px', '2028px'];
// Preferred sizes for selected image (highest quality first)
const FULL_SIZES   = ['2028px', '600px', '300px', '160px', '125px'];

function pickThumbnail(asset: AssetItem, sizes: string[]): string {
  if (!asset.thumbnails) return '';
  for (const size of sizes) {
    if (asset.thumbnails[size]?.url) return asset.thumbnails[size].url;
  }
  return Object.values(asset.thumbnails)[0]?.url ?? '';
}

export function getAssetThumbnailUrl(asset: AssetItem): string {
  return pickThumbnail(asset, THUMB_SIZES);
}

export function getAssetUrl(asset: AssetItem): string {
  return pickThumbnail(asset, FULL_SIZES);
}

export async function searchAssets(params: AssetSearchParams = {}): Promise<AssetSearchResponse> {
  const { url, token } = getAssetApiConfig();
  return apiGet<AssetSearchResponse>(
    url,
    {
      query:  params.query  ?? '',
      limit:  params.limit  ?? 10,
      expand: params.expand ?? 'thumbnails',
      ...(params.offset !== undefined && { offset: params.offset }),
    },
    token ? { Authorization: `Bearer ${token}` } : undefined,
  );
}

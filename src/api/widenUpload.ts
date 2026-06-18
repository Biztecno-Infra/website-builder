import { ApiError } from './http';
import { getAssetApiConfig } from './config';

// ── Widen upload / asset-detail response shapes ─────────────────────────
interface WidenLinks {
  self?: string;
}

interface WidenUploadResponse {
  _links?: WidenLinks;
}

interface WidenEmbed {
  url?: string;
  html?: string;
  share?: string;
}

interface WidenThumbnail {
  url?: string;
}

interface WidenAssetResponse {
  id?: string;
  filename?: string;
  embeds?: Record<string, WidenEmbed> | null;
  thumbnails?: Record<string, WidenThumbnail> | null;
  metadata?: Record<string, unknown> | null;
  metadata_info?: Record<string, unknown> | null;
  _links?: WidenLinks;
}

export interface WidenUploadResult {
  assetId: string;
  assetUrl: string;
  imageUrl: string;
  metadata?: Record<string, unknown> | null;
}

// Default Widen upload profile, used when none is configured.
const DEFAULT_UPLOAD_PROFILE = 'Test Uploads - New';

// Expand params required to get image URLs + metadata back from the asset.
const ASSET_EXPAND =
  'asset_properties,embeds,file_properties,metadata,metadata_info,metadata_vocabulary,security,thumbnails';

// Preferred thumbnail sizes for canvas rendering (highest quality first).
const THUMB_SIZES = ['2028px', '600px', '300px', '160px', '125px'];

/**
 * Resolve the Widen uploads endpoint. Prefers the explicitly configured
 * uploadUrl (from VITE_ASSET_UPLOAD_URL via configureAssetApi), then falls
 * back to deriving it from the search url's /v{n} root.
 */
function getUploadUrl(): string {
  const { url, uploadUrl } = getAssetApiConfig();
  if (uploadUrl) return uploadUrl;
  if (url) {
    const match = url.match(/^(https?:\/\/[^/]+\/v\d+)\//i);
    if (match) return `${match[1]}/uploads`;
  }
  throw new ApiError(
    500,
    'Missing asset upload URL. Configure it via configureAssetApi({ uploadUrl }) / VITE_ASSET_UPLOAD_URL.',
  );
}

function authHeaders(): Record<string, string> {
  const { token } = getAssetApiConfig();
  if (!token) {
    throw new ApiError(401, 'Missing asset API token. Configure it via configureAssetApi().');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Pick the best renderable image URL from an asset detail response:
 * prefer a sized thumbnail, then any embed url, then the original file.
 */
function pickImageUrl(asset: WidenAssetResponse): string {
  if (asset.thumbnails) {
    for (const size of THUMB_SIZES) {
      const u = asset.thumbnails[size]?.url;
      if (u) return u;
    }
    const firstThumb = Object.values(asset.thumbnails)[0]?.url;
    if (firstThumb) return firstThumb;
  }
  if (asset.embeds) {
    for (const embed of Object.values(asset.embeds)) {
      if (embed?.url) return embed.url;
    }
  }
  return '';
}

/** Upload a single file to Widen and return its self (asset) URL. */
async function uploadToWiden(file: File): Promise<string> {
  const { uploadProfile } = getAssetApiConfig();
  const formData = new FormData();
  formData.append('profile', uploadProfile || DEFAULT_UPLOAD_PROFILE);
  formData.append('file', file);

  let res: Response;
  try {
    res = await fetch(getUploadUrl(), {
      method: 'POST',
      headers: authHeaders(), // do NOT set Content-Type — the browser sets the multipart boundary
      body: formData,
    });
  } catch (e) {
    throw new ApiError(0, `Upload failed: ${e instanceof Error ? e.message : 'network error'}`);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new ApiError(res.status, 'Invalid or expired asset API token.');
    }
    throw new ApiError(res.status, `Upload failed: ${res.status}`);
  }

  const data = (await res.json()) as WidenUploadResponse;
  const assetUrl = data?._links?.self;
  if (!assetUrl) throw new ApiError(502, 'Upload succeeded but no asset URL was returned.');
  return assetUrl;
}

/** Fetch full asset details (with expand params) from a Widen self URL. */
async function fetchAssetDetails(assetUrl: string): Promise<WidenAssetResponse> {
  const sep = assetUrl.includes('?') ? '&' : '?';
  const url = `${assetUrl}${sep}expand=${ASSET_EXPAND}`;

  let res: Response;
  try {
    res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json', ...authHeaders() } });
  } catch (e) {
    throw new ApiError(0, `Asset fetch failed: ${e instanceof Error ? e.message : 'network error'}`);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new ApiError(res.status, 'Invalid or expired asset API token.');
    }
    throw new ApiError(res.status, `Asset fetch failed: ${res.status}`);
  }

  return (await res.json()) as WidenAssetResponse;
}

/**
 * Full Widen upload flow: upload the file, fetch its asset details, and
 * resolve the best renderable image URL plus identifying metadata.
 */
export async function uploadImageToWiden(
  file: File,
  onProgress?: (stage: 'uploading' | 'fetching') => void,
): Promise<WidenUploadResult> {
  onProgress?.('uploading');
  const assetUrl = await uploadToWiden(file);

  onProgress?.('fetching');
  const asset = await fetchAssetDetails(assetUrl);

  const imageUrl = pickImageUrl(asset);
  if (!imageUrl) {
    throw new ApiError(502, 'Upload succeeded but no renderable image URL was found on the asset.');
  }

  const assetId = asset.id ?? assetUrl.split('/').pop() ?? '';

  return {
    assetId,
    assetUrl,
    imageUrl,
    metadata: asset.metadata ?? null,
  };
}

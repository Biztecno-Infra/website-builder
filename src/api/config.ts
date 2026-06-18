interface AssetApiConfig {
  url: string;
  token: string;
}

const _config: AssetApiConfig = { url: '', token: '' };

export function configureAssetApi(config: Partial<AssetApiConfig>): void {
  if (config.url)   _config.url   = config.url;
  if (config.token) _config.token = config.token;
}

export function getAssetApiConfig(): AssetApiConfig {
  return _config;
}

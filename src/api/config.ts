interface AssetApiConfig {
  url: string;
  uploadUrl: string;
  uploadProfile: string;
  token: string;
}

const _config: AssetApiConfig = { url: '', uploadUrl: '', uploadProfile: '', token: '' };

export function configureAssetApi(config: Partial<AssetApiConfig>): void {
  if (config.url)           _config.url           = config.url;
  if (config.uploadUrl)     _config.uploadUrl     = config.uploadUrl;
  if (config.uploadProfile) _config.uploadProfile = config.uploadProfile;
  if (config.token)         _config.token         = config.token;
}

export function getAssetApiConfig(): AssetApiConfig {
  return _config;
}

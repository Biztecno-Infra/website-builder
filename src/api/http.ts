type Params = Record<string, string | number | boolean>;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(
  baseUrl: string,
  params?: Params,
  headers?: Record<string, string>,
): Promise<T> {
  const url = new URL(baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      // skip empty strings and false — they add noise without changing API behaviour
      if (v === '' || v === false) return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json', ...headers },
  });

  if (!res.ok) throw new ApiError(res.status, `Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

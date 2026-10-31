/**
 * Fetch a URL and guarantee a JSON response.
 * Throws a readable error for HTTP failures or HTML error pages so callers
 * never hit "Unexpected token '<'" when a Laravel error page is returned.
 */
export async function fetchJson<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Error('Unexpected non-JSON response');
    }

    return res.json() as Promise<T>;
}

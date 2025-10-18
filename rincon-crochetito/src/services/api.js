const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function api(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${txt}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

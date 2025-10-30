const DEFAULT_API_URL = "http://localhost:8088";

/**
 * Base URL for backend requests.
 * Override using VITE_API_URL in your environment (.env, Render, etc).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.toString().replace(/\/$/, "") ?? DEFAULT_API_URL;

export const makeApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;


// Backend and frontend are served from the same origin; override with VITE_API_URL for local dev.
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

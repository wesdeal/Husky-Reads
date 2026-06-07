// Set VITE_API_URL to your Railway backend URL at build time.
// Defaults to empty string so relative paths work in local dev with a proxy.
export const API = import.meta.env.VITE_API_URL ?? ""

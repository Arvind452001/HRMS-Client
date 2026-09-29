// API base URL
// Set VITE_API_URL in client/.env (local) or in the Vercel project's
// Environment Variables (production) to point at your deployed backend,
// e.g. VITE_API_URL=https://your-backend.onrender.com/api
export const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:4011/api";

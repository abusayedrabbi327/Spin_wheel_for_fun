import type { VercelRequest, VercelResponse } from "@vercel/node";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "").toLowerCase();
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  configuredOrigins.forEach((origin) => origins.add(origin));

  if (process.env.VERCEL_URL) {
    origins.add(normalizeOrigin(`https://${process.env.VERCEL_URL}`));
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(normalizeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`));
  }

  return origins;
}

const ALLOWED_ORIGINS = getAllowedOrigins();

export function applyCors(req: VercelRequest, res: VercelResponse) {
  const requestOrigin = typeof req.headers.origin === "string"
    ? normalizeOrigin(req.headers.origin)
    : "";

  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin as string);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function success<T>(res: VercelResponse, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(res: VercelResponse, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export function unauthorized(res: VercelResponse, message = "Unauthorized") {
  return res.status(401).json({ success: false, error: message });
}

export function forbidden(res: VercelResponse, message = "Forbidden") {
  return res.status(403).json({ success: false, error: message });
}

export function notFound(res: VercelResponse, message = "Not found") {
  return res.status(404).json({ success: false, error: message });
}

export function methodNotAllowed(res: VercelResponse) {
  return res.status(405).json({ success: false, error: "Method not allowed" });
}

export function serverError(res: VercelResponse, err: unknown) {
  console.error("Server error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  const stack = err instanceof Error ? err.stack : undefined;
  
  // In development, return more details
  if (process.env.NODE_ENV !== "production") {
    return res.status(500).json({ 
      success: false, 
      error: message,
      stack,
    });
  }
  
  return res.status(500).json({ success: false, error: message });
}

// Generate URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 50) + "-" + Math.random().toString(36).substring(2, 8);
}

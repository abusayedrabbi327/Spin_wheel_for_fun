import type { VercelResponse } from "@vercel/node";

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
  return res.status(500).json({ success: false, error: "Internal server error" });
}

// Generate URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 50) + "-" + Math.random().toString(36).substring(2, 8);
}

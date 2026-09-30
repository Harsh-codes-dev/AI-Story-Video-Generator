// Frontend API client for the story → video pipeline.
//
// Today these hit the mock routes in src/app/api/generate. To connect the real
// backend (e.g. the DGX-hosted Python pipeline), set NEXT_PUBLIC_API_BASE_URL
// in .env.local — the request/response shapes below are the contract.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const PIPELINE_STAGES = [
  { id: "analyzing", label: "Analyzing story" },
  { id: "characters", label: "Understanding characters" },
  { id: "scenes", label: "Building scenes" },
  { id: "voices", label: "Creating voices" },
  { id: "animating", label: "Animating world" },
  { id: "video", label: "Generating video" },
];

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

/**
 * POST /api/generate  { prompt } → { jobId, status: "processing" }
 */
export function generateStory(prompt) {
  return request("/api/generate", { method: "POST", body: JSON.stringify({ prompt }) });
}

/**
 * GET /api/generate/:jobId →
 *   { jobId, status: "processing" | "completed" | "failed", stage: <PIPELINE_STAGES id>, videoUrl?: string }
 */
export function getJobStatus(jobId) {
  return request(`/api/generate/${encodeURIComponent(jobId)}`);
}

/**
 * POST /api/enhance  { prompt } → { enhanced }
 * Server-side route calls Gemini; the API key never reaches the client.
 */
export function enhancePrompt(prompt) {
  return request("/api/enhance", { method: "POST", body: JSON.stringify({ prompt }) });
}

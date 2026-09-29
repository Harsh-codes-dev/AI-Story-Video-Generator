import { PIPELINE_STAGES } from "@/lib/api";

// Mock: derives the current stage from how long ago the job was created, so
// the UI can be built against real polling. Replace with a lookup of the real
// job's status.
const STAGE_MS = 1700;

export async function GET(_request, { params }) {
  const { jobId } = await params;
  const createdAt = Number(jobId.replace("job_", ""));

  if (!Number.isFinite(createdAt)) {
    return Response.json({ error: "Unknown job." }, { status: 404 });
  }

  const index = Math.floor((Date.now() - createdAt) / STAGE_MS);

  if (index >= PIPELINE_STAGES.length) {
    return Response.json({ jobId, status: "completed", stage: "video", videoUrl: null });
  }

  return Response.json({ jobId, status: "processing", stage: PIPELINE_STAGES[index].id });
}

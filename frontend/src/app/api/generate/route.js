// Mock: accepts a prompt and starts a fake job. Replace with a call to the real
// pipeline (story_generator.py → visual_pipeline.py → story_audio.py → …).

export async function POST(request) {
  const { prompt } = await request.json().catch(() => ({}));

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "Please describe your story first." }, { status: 400 });
  }

  return Response.json({ jobId: `job_${Date.now()}`, status: "processing" });
}

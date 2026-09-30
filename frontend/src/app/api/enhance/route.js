// Server-only route: calls the Gemini API to enhance a story prompt. The API
// key lives in an env var without the NEXT_PUBLIC_ prefix, so it never
// reaches the browser — the client only ever talks to this route.

const MODEL = "gemini-3.8-flash";

export async function POST(request) {
  const { prompt } = await request.json().catch(() => ({}));

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "Please write a prompt first." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Enhancement isn't configured on the server." }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Assume yourself as a professional story writer. A user has given you a short story idea. " +
                    "Your job is only to make it read better — stronger word choice, more sensory detail, smoother " +
                    "phrasing. Do not change what actually happens: keep the same characters, setting, actions, " +
                    "and outcome. Do not invent new characters, emotions, backstory, or plot details that are not " +
                    "implied by the original text. Do not change the meaning or tone of the idea.\n\n" +
                    "Write the result as one or two complete sentences (never cut off mid-sentence), roughly the " +
                    "same length as the original. Reply with only the rewritten prompt — no preamble, no quotes, " +
                    "no labels, no explanation.\n\n" +
                    `Original idea: ${prompt.trim()}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 400,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data?.error?.message || "The enhancement service returned an error." },
        { status: res.status }
      );
    }

    const candidate = data?.candidates?.[0];
    const enhanced = candidate?.content?.parts?.map((p) => p.text).join("").trim();

    if (!enhanced) {
      return Response.json({ error: "No enhancement came back. Try again." }, { status: 502 });
    }

    // Never hand back a sentence that was cut off partway through.
    if (candidate.finishReason === "MAX_TOKENS") {
      return Response.json({ error: "The enhancement ran out of room. Try again." }, { status: 502 });
    }

    return Response.json({ enhanced });
  } catch {
    return Response.json({ error: "Couldn't reach the enhancement service." }, { status: 502 });
  }
}

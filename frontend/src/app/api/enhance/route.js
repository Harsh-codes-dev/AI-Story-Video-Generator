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
                    "Rewrite the following story idea into a more vivid, evocative story prompt. " +
                    "Keep the same core idea and length in the same ballpark (a few sentences at most). " +
                    "Reply with only the rewritten prompt — no preamble, no quotes, no explanation.\n\n" +
                    `Story idea: ${prompt.trim()}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
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

    const enhanced = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();

    if (!enhanced) {
      return Response.json({ error: "No enhancement came back — try again." }, { status: 502 });
    }

    return Response.json({ enhanced });
  } catch {
    return Response.json({ error: "Couldn't reach the enhancement service." }, { status: 502 });
  }
}

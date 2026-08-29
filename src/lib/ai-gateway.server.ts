export const HOMESENSE_AI_MODEL = "google/gemini-3.1-flash-lite";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiGatewayError(401, "LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: HOMESENSE_AI_MODEL,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) throw new AiGatewayError(429, "AI rate limit reached, try again shortly.");
    if (response.status === 402) throw new AiGatewayError(402, "AI credits exhausted. Add credits in Lovable to continue.");
    throw new AiGatewayError(response.status, detail || "AI request failed");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiGatewayError(502, "Empty AI response");
  return text;
}

import { createServerFn } from "@tanstack/react-start";

type Lang = "en" | "ru" | "kz";

type AssistantInput = {
  question: string;
  lang: Lang;
  context: string;
};

type ReportInput = {
  lang: Lang;
  context: string;
};

const LANGUAGE_RULE: Record<Lang, string> = {
  ru: "Отвечай только на русском языке.",
  kz: "Тек қазақ тілінде жауап бер.",
  en: "Answer in English only.",
};

function validateAssistant(input: unknown): AssistantInput {
  const value = input as Partial<AssistantInput> | null;
  if (!value || typeof value.question !== "string" || !value.question.trim()) {
    throw new Error("question is required");
  }
  if (typeof value.context !== "string") throw new Error("context is required");
  const lang: Lang = value.lang === "ru" || value.lang === "kz" ? value.lang : "en";
  return { question: value.question.slice(0, 2000), lang, context: value.context.slice(0, 24000) };
}

function validateReport(input: unknown): ReportInput {
  const value = input as Partial<ReportInput> | null;
  if (!value || typeof value.context !== "string") throw new Error("context is required");
  const lang: Lang = value.lang === "ru" || value.lang === "kz" ? value.lang : "en";
  return { lang, context: value.context.slice(0, 24000) };
}

/** AI chat over the home's live resource data (Gemini 3.1 Flash). */
export const askHomeAssistant = createServerFn({ method: "POST" })
  .inputValidator(validateAssistant)
  .handler(async ({ data }) => {
    const { callGemini } = await import("./ai-gateway.server");
    const text = await callGemini([
      {
        role: "system",
        content: [
          "You are HomeSense AI, an assistant for household water and electricity resource monitoring.",
          "Use ONLY the structured home data provided by the user message. Never invent readings, costs or devices.",
          "Mark estimated values as estimates. Keep answers short (2-5 sentences) and concrete, with numbers and units.",
          LANGUAGE_RULE[data.lang],
        ].join(" "),
      },
      {
        role: "user",
        content: `HOME DATA:\n${data.context}\n\nQUESTION: ${data.question}`,
      },
    ]);
    return { text };
  });

/** AI resource report generated from recorded events (Gemini 3.1 Flash). */
export const generateHomeAiReport = createServerFn({ method: "POST" })
  .inputValidator(validateReport)
  .handler(async ({ data }) => {
    const { callGemini } = await import("./ai-gateway.server");
    const raw = await callGemini([
      {
        role: "system",
        content: [
          "You are HomeSense AI, an analyst producing a home resource waste report.",
          "Use ONLY the supplied monitoring data. Return STRICT JSON with keys:",
          '{"ready": boolean, "summary": string, "topResource": string, "topRoom": string, "opportunity": string}.',
          "Set ready=false with an explanatory summary when the data is too thin (fewer than 3 monitored days or 3 events).",
          "No markdown, no code fences.",
          LANGUAGE_RULE[data.lang],
        ].join(" "),
      },
      { role: "user", content: `MONITORING DATA:\n${data.context}` },
    ]);

    const json = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      return {
        ready: parsed["ready"] !== false,
        summary: String(parsed["summary"] ?? ""),
        topResource: String(parsed["topResource"] ?? ""),
        topRoom: String(parsed["topRoom"] ?? ""),
        opportunity: String(parsed["opportunity"] ?? ""),
      };
    } catch {
      return { ready: true, summary: raw, topResource: "", topRoom: "", opportunity: "" };
    }
  });

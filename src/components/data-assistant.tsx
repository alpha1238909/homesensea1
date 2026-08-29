"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { AppSnapshot } from "../types";
import {
  answerHomeDataQuestion,
  type AssistantLanguage,
  type SensorReading,
} from "../services/data-assistant.service";
import { useServerFn } from "@tanstack/react-start";
import { askHomeAssistant } from "../lib/ai.functions";
import { buildHomeContext } from "../lib/home-context";

type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

const copy = {
  ru: {
    eyebrow: "ДАННЫЕ САЙТА + СИГНАЛЫ ДАТЧИКОВ",
    title: "AI-чат по ресурсам дома",
    lead: "Спросите о воде, электричестве, расходах или состоянии сенсоров. Ответы рассчитываются по текущим данным HomeSense AI.",
    ready: "Данные синхронизированы",
    placeholder: "Например: сколько воды потратилось сегодня?",
    send: "Отправить",
    intro: "Я вижу текущие события сайта, показания профиля и состояния сенсоров. Что вы хотите узнать?",
    suggestions: ["Сколько воды потратилось сегодня?", "Какие датчики сейчас активны?", "Сколько сегодня стоили ресурсы?"],
    note: "Ответы основаны только на доступных событиях и показаниях. Оценочные данные отмечаются как оценочные.",
  },
  kz: {
    eyebrow: "САЙТ ДЕРЕКТЕРІ + СЕНСОР СИГНАЛДАРЫ",
    title: "Үй ресурстары бойынша AI чат",
    lead: "Су, электр энергиясы, шығындар немесе сенсор күйлері туралы сұраңыз. Жауаптар HomeSense AI ағымдағы деректерімен есептеледі.",
    ready: "Деректер синхрондалды",
    placeholder: "Мысалы: бүгін қанша су жұмсалды?",
    send: "Жіберу",
    intro: "Мен сайттың ағымдағы оқиғаларын, профиль көрсеткіштерін және сенсор күйлерін көремін. Нені білгіңіз келеді?",
    suggestions: ["Бүгін қанша су жұмсалды?", "Қандай сенсорлар белсенді?", "Бүгінгі ресурстардың құны қанша?"],
    note: "Жауаптар тек қолжетімді оқиғалар мен көрсеткіштерге негізделеді. Бағаланған деректер бағалау ретінде көрсетіледі.",
  },
  en: {
    eyebrow: "SITE DATA + SENSOR SIGNALS",
    title: "Home resource AI chat",
    lead: "Ask about water, electricity, costs or sensor status. Answers are calculated from the current HomeSense AI snapshot.",
    ready: "Data synchronized",
    placeholder: "For example: how much water was used today?",
    send: "Send",
    intro: "I can read the site's current events, saved meter values and sensor states. What would you like to know?",
    suggestions: ["How much water was used today?", "Which sensors are active?", "How much did resources cost today?"],
    note: "Answers use available events and readings only. Estimated values are identified as estimates.",
  },
} as const;

export function DataAssistant({
  lang,
  snapshot,
  sensors,
}: {
  lang: AssistantLanguage;
  snapshot: AppSnapshot;
  sensors: SensorReading[];
}) {
  const t = copy[lang];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro", role: "assistant", text: t.intro },
  ]);
  const [pending, setPending] = useState(false);
  const askAi = useServerFn(askHomeAssistant);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sourceCount = useMemo(
    () => new Set([...snapshot.events.map((event) => event.source), ...sensors.map((sensor) => sensor.source)]).size,
    [snapshot.events, sensors],
  );

  const ask = async (question: string) => {
    const clean = question.trim();
    if (!clean) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: clean };
    const pendingId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      userMessage,
      { id: pendingId, role: "assistant", text: "…" },
    ]);
    setInput("");
    setPending(true);
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    let answer: string;
    try {
      const result = await askAi({
        data: { question: clean, lang, context: buildHomeContext(snapshot, sensors) },
      });
      answer = result.text;
    } catch (error) {
      console.error("[HomeSense AI] chat failed", error);
      answer = answerHomeDataQuestion(clean, snapshot, sensors, lang);
    }
    setMessages((current) =>
      current.map((message) => (message.id === pendingId ? { ...message, text: answer } : message)),
    );
    setPending(false);
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };


  return (
    <div className="page-content assistant-page">
      <section className="assistant-hero">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.title}</h2>
          <p>{t.lead}</p>
        </div>
        <div className="assistant-sync">
          <span className="pulse teal" />
          <b>{t.ready}</b>
          <small>{snapshot.events.length} events · {sensors.length} sensors · {sourceCount} sources</small>
        </div>
      </section>

      <section className="assistant-layout">
        <div className="assistant-chat panel">
          <div className="assistant-messages" aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`chat-message ${message.role}`}>
                <span>{message.role === "assistant" ? "AI" : "YOU"}</span>
                <p>{message.text}</p>
              </article>
            ))}
            <div ref={bottomRef} />
          </div>
          <form className="assistant-composer" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
            />
            <button className="primary" type="submit" disabled={pending || !input.trim()}>
              {t.send} ↑
            </button>
          </form>
        </div>

        <aside className="assistant-prompts">
          {t.suggestions.map((suggestion) => (
            <button key={suggestion} disabled={pending} onClick={() => void ask(suggestion)}>
              <span>✦</span>
              {suggestion}
            </button>
          ))}
          <p>{t.note}</p>
        </aside>
      </section>
    </div>
  );
}

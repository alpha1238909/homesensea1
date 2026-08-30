"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";

type Lang = "en" | "ru" | "kz";

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  style,
}: {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const base: Transition = {
    repeat: Infinity,
    duration: 6,
    ease: "linear",
  };

  return (
    <div className="border-trail-wrap" aria-hidden="true">
      <motion.div
        className={`border-trail-dot ${className ?? ""}`}
        style={{ width: size, height: size, offsetPath: "rect(0 auto auto 0 round 18px)", ...style } as any}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ ...(transition ?? base), ...(delay !== undefined ? { delay } : {}) }}
      />
    </div>
  );
}

const copy = {
  ru: {
    eyebrow: "HOMESENSE PRO",
    title: "Подписка HomeSense AI",
    lead: "Проактивный AI-аналитик, прогноз коммунального счёта и полная история расходов.",
    periods: { month: "Месяц", half: "Полгода", year: "Год" },
    perMonth: "в месяц",
    save: "выгода",
    popular: "Популярно",
    cta: "Оформить подписку",
    ctaActive: "Подписка активна",
    activated: "Подписка оформлена (демо-режим)",
    plans: {
      month: "Гибкий старт, оплата помесячно",
      half: "Оптимально для сезона отопления",
      year: "Максимальная выгода на весь год",
    },
    featuresTitle: "Что входит",
    features: [
      "Прогноз коммунального счёта на конец месяца",
      "Проактивный AI-аналитик: сам находит утечки и лишний расход",
      "Пример: «Последние 4 дня вода в ванной течёт с 07:20 до 07:35 без присутствия. Возможная потеря — 2 600 ₸/мес»",
      "Подтверждаемые пользователем правила автоматизации",
      "Полная история: день / неделя / месяц / год",
      "Сравнение с предыдущим периодом",
      "Расход по комнатам и по каждому устройству",
      "Сколько денег реально сэкономлено после установки HomeSense",
    ],
    rulesTitle: "Правила автоматизации",
    rulesLead: "Каждое правило включается только после вашего подтверждения.",
    rules: [
      "Выключать свет через 10 минут без людей",
      "Отключать кондиционер при открытом окне",
      "Перекрывать воду при подтверждённой протечке",
      "Выключать выбранные приборы ночью",
      "Присылать запрос на подтверждение перед отключением",
    ],
    on: "Вкл",
    off: "Выкл",
    forecastTitle: "Прогноз коммунального счёта",
    forecastLead: "Оценка на конец месяца по текущей динамике расхода.",
    forecastNote: "Доступно в подписке",
  },
  kz: {
    eyebrow: "HOMESENSE PRO",
    title: "HomeSense AI жазылымы",
    lead: "Проактивті AI-талдаушы, коммуналдық шот болжамы және толық шығын тарихы.",
    periods: { month: "Ай", half: "Жарты жыл", year: "Жыл" },
    perMonth: "айына",
    save: "үнем",
    popular: "Танымал",
    cta: "Жазылымды рәсімдеу",
    ctaActive: "Жазылым белсенді",
    activated: "Жазылым рәсімделді (демо-режим)",
    plans: {
      month: "Икемді бастау, ай сайын төлеу",
      half: "Жылыту маусымына оңтайлы",
      year: "Жыл бойы ең тиімді",
    },
    featuresTitle: "Не кіреді",
    features: [
      "Ай соңына коммуналдық шот болжамы",
      "Проактивті AI-талдаушы: ағып кетуді өзі табады",
      "Мысал: «Соңғы 4 күн жуынатын бөлмеде су 07:20–07:35 аралығында адамсыз ағады. Ықтимал шығын — 2 600 ₸/ай»",
      "Пайдаланушы растайтын автоматтандыру ережелері",
      "Толық тарих: күн / апта / ай / жыл",
      "Алдыңғы кезеңмен салыстыру",
      "Бөлмелер және әр құрылғы бойынша шығын",
      "HomeSense орнатқаннан кейінгі нақты үнем",
    ],
    rulesTitle: "Автоматтандыру ережелері",
    rulesLead: "Әр ереже тек сіздің растауыңыздан кейін іске қосылады.",
    rules: [
      "Адам болмаса, жарықты 10 минуттан кейін өшіру",
      "Терезе ашық болса, кондиционерді өшіру",
      "Расталған ағу кезінде суды жабу",
      "Таңдалған құрылғыларды түнде өшіру",
      "Өшірер алдында растау сұрауын жіберу",
    ],
    on: "Қосулы",
    off: "Өшірулі",
    forecastTitle: "Коммуналдық шот болжамы",
    forecastLead: "Ағымдағы динамика бойынша ай соңына бағалау.",
    forecastNote: "Жазылымда қолжетімді",
  },
  en: {
    eyebrow: "HOMESENSE PRO",
    title: "HomeSense AI subscription",
    lead: "Proactive AI analyst, utility bill forecast and full consumption history.",
    periods: { month: "Month", half: "6 months", year: "Year" },
    perMonth: "per month",
    save: "save",
    popular: "Popular",
    cta: "Subscribe",
    ctaActive: "Subscription active",
    activated: "Subscription activated (demo mode)",
    plans: {
      month: "Flexible start, billed monthly",
      half: "Best for the heating season",
      year: "Maximum value for the whole year",
    },
    featuresTitle: "What's included",
    features: [
      "Utility bill forecast for the end of the month",
      "Proactive AI analyst that finds waste on its own",
      "Example: “For the last 4 days bathroom water runs 07:20–07:35 with no presence. Possible loss — 2,600 ₸/month”",
      "Automation rules you confirm yourself",
      "Full history: day / week / month / year",
      "Comparison with the previous period",
      "Consumption by room and by each device",
      "How much money you really saved after installing HomeSense",
    ],
    rulesTitle: "Automation rules",
    rulesLead: "Every rule activates only after your confirmation.",
    rules: [
      "Turn off lights after 10 minutes with no people",
      "Turn off the AC when a window is open",
      "Shut off water on a confirmed leak",
      "Turn off selected appliances at night",
      "Send a confirmation request before shutting anything down",
    ],
    on: "On",
    off: "Off",
    forecastTitle: "Utility bill forecast",
    forecastLead: "Estimate for the end of the month based on current usage.",
    forecastNote: "Included in the subscription",
  },
} as const;

type PeriodId = "month" | "half" | "year";

const PLANS: Array<{ id: PeriodId; price: number; months: number; highlighted?: boolean }> = [
  { id: "month", price: 1499, months: 1 },
  { id: "half", price: 8099, months: 6, highlighted: true },
  { id: "year", price: 15999, months: 12 },
];

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₸`;

export function Subscription({ lang, toast }: { lang: Lang; toast?: (m: string) => void }) {
  const t = copy[lang];
  const [selected, setSelected] = useState<PeriodId>("half");
  const [active, setActive] = useState<PeriodId | null>(null);
  const [rules, setRules] = useState<boolean[]>(() => t.rules.map(() => false));

  return (
    <div className="page-content sub-page">
      <section className="sub-hero panel">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.title}</h2>
          <p>{t.lead}</p>
        </div>
        <div className="sub-toggle" role="tablist">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              role="tab"
              aria-selected={selected === plan.id}
              className={selected === plan.id ? "active" : ""}
              onClick={() => setSelected(plan.id)}
            >
              {selected === plan.id && (
                <motion.span layoutId="sub-toggle-pill" className="sub-toggle-pill" />
              )}
              <span>{t.periods[plan.id]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sub-grid">
        {PLANS.map((plan) => {
          const perMonth = Math.round(plan.price / plan.months);
          const savePercent = Math.round((1 - plan.price / (1499 * plan.months)) * 100);
          const isSelected = selected === plan.id;
          return (
            <article
              key={plan.id}
              className={`sub-card panel ${isSelected ? "selected" : ""} ${plan.highlighted ? "highlighted" : ""}`}
              onClick={() => setSelected(plan.id)}
            >
              {isSelected && <BorderTrail size={90} />}
              <header className="sub-card-head">
                <b>{t.periods[plan.id]}</b>
                <div className="sub-badges">
                  {plan.highlighted && <span className="sub-badge popular">★ {t.popular}</span>}
                  {savePercent > 0 && <span className="sub-badge">−{savePercent}% {t.save}</span>}
                </div>
              </header>
              <p className="sub-card-info">{t.plans[plan.id]}</p>
              <div className="sub-price">
                <strong>{money(plan.price)}</strong>
                <small>{money(perMonth)} / {t.perMonth}</small>
              </div>
              <button
                className="primary sub-cta"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(plan.id);
                  setActive(plan.id);
                  toast?.(t.activated);
                }}
              >
                {active === plan.id ? t.ctaActive : t.cta}
              </button>
            </article>
          );
        })}
      </section>

      <section className="sub-columns">
        <div className="panel">
          <div className="panel-head">
            <small>{t.eyebrow}</small>
            <h3>{t.featuresTitle}</h3>
          </div>
          <ul className="sub-features">
            {t.features.map((feature) => (
              <li key={feature}>
                <span className="sub-check">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-head">
            <small>{t.rulesLead}</small>
            <h3>{t.rulesTitle}</h3>
          </div>
          <ul className="sub-rules">
            {t.rules.map((rule, index) => (
              <li key={rule}>
                <span>{rule}</span>
                <button
                  className={`sub-switch ${rules[index] ? "on" : ""}`}
                  aria-pressed={!!rules[index]}
                  onClick={() =>
                    setRules((current) => current.map((v, i) => (i === index ? !v : v)))
                  }
                >
                  <i />
                  <small>{rules[index] ? t.on : t.off}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel sub-forecast">
        <div className="panel-head">
          <small>{t.forecastNote}</small>
          <h3>{t.forecastTitle}</h3>
        </div>
        <p className="sub-card-info">{t.forecastLead}</p>
        <div className="sub-forecast-row">
          <div>
            <strong>18 940 ₸</strong>
            <small>{t.forecastTitle}</small>
          </div>
          <div>
            <strong>+6%</strong>
            <small>{lang === "ru" ? "к прошлому месяцу" : lang === "kz" ? "өткен айға" : "vs last month"}</small>
          </div>
          <div>
            <strong>4 860 ₸</strong>
            <small>{lang === "ru" ? "возможная экономия" : lang === "kz" ? "ықтимал үнем" : "possible savings"}</small>
          </div>
        </div>
      </section>
    </div>
  );
}

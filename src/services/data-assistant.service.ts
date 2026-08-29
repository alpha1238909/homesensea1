import type { AppSnapshot, HomeEvent } from "../types";

export type AssistantLanguage = "en" | "ru" | "kz";

export type SensorReading = {
  id: string;
  type: string;
  room: string;
  state: string;
  source: string;
  value: string;
};

type Totals = {
  waterLiters: number;
  waterCost: number;
  electricityKwh: number;
  electricityCost: number;
  totalCost: number;
  eventCount: number;
};

export function answerHomeDataQuestion(
  question: string,
  snapshot: AppSnapshot,
  sensors: SensorReading[],
  lang: AssistantLanguage,
) {
  const normalized = question.trim().toLocaleLowerCase();
  const todayEvents = snapshot.events.filter(isToday);
  const totals = summarize(todayEvents);
  const sources = unique(todayEvents.map((event) => event.source));

  if (hasAny(normalized, ["вод", "water", "су ", "суды", "суға"])) {
    return localized(
      lang,
      `Сегодня по событиям сайта зафиксировано ${format(totals.waterLiters)} л воды. Оценочная стоимость — ${formatMoney(totals.waterCost)}. Текущее показание водомера: ${format(snapshot.waterReading)} м³.${sourceLine(sources, "ru")}`,
      `Бүгін сайт оқиғалары бойынша ${format(totals.waterLiters)} л су тіркелді. Бағаланған құны — ${formatMoney(totals.waterCost)}. Су есептегішінің ағымдағы көрсеткіші: ${format(snapshot.waterReading)} м³.${sourceLine(sources, "kz")}`,
      `Today's recorded site events account for ${format(totals.waterLiters)} L of water, with an estimated cost of ${formatMoney(totals.waterCost)}. Current water-meter reading: ${format(snapshot.waterReading)} m³.${sourceLine(sources, "en")}`,
    );
  }

  if (hasAny(normalized, ["элект", "свет", "energy", "electric", "жарық", "электр"])) {
    return localized(
      lang,
      `Сегодня зафиксировано ${format(totals.electricityKwh)} кВт·ч электроэнергии в событиях, оценочная стоимость — ${formatMoney(totals.electricityCost)}.${sourceLine(sources, "ru")}`,
      `Бүгін оқиғаларда ${format(totals.electricityKwh)} кВт·сағ электр энергиясы тіркелді, бағаланған құны — ${formatMoney(totals.electricityCost)}.${sourceLine(sources, "kz")}`,
      `Today's recorded events account for ${format(totals.electricityKwh)} kWh of electricity, with an estimated cost of ${formatMoney(totals.electricityCost)}.${sourceLine(sources, "en")}`,
    );
  }

  if (hasAny(normalized, ["датчик", "сенсор", "sensor", "работает", "статус", "status"])) {
    const active = sensors.filter((sensor) => sensor.state === "ON");
    const activeText = active.length
      ? active.map((sensor) => `${sensor.id} · ${room(sensor.room, lang)} · ${sensor.value}`).join("; ")
      : localized(lang, "активных сигналов нет", "белсенді сигнал жоқ", "no active signals");
    return localized(
      lang,
      `Получено ${sensors.length} сигналов сенсоров. Сейчас активны: ${activeText}. Эти состояния взяты прямо из раздела «Сенсоры».`,
      `Сенсорлардан ${sensors.length} сигнал алынды. Қазір белсенді: ${activeText}. Бұл күйлер «Сенсорлар» бөлімінен тікелей алынды.`,
      `${sensors.length} sensor signals are available. Currently active: ${activeText}. These states come directly from the Sensors page.`,
    );
  }

  if (hasAny(normalized, ["сколько", "потрат", "стоим", "деньг", "cost", "spent", "қанша", "шығын"])) {
    return localized(
      lang,
      `Сегодня в ${totals.eventCount} зафиксированных событиях рассчитано ${formatMoney(totals.totalCost)}: вода — ${formatMoney(totals.waterCost)}, электричество — ${formatMoney(totals.electricityCost)}. Это оценка только по доступным событиям, а не полный счёт коммунальных услуг.`,
      lang === "kz"
        ? `Бүгін ${totals.eventCount} тіркелген оқиға бойынша ${formatMoney(totals.totalCost)} есептелді: су — ${formatMoney(totals.waterCost)}, электр энергиясы — ${formatMoney(totals.electricityCost)}. Бұл толық коммуналдық шот емес, тек қолжетімді оқиғалар бойынша бағалау.`
        : "",
      `Across ${totals.eventCount} recorded events today, the estimated cost is ${formatMoney(totals.totalCost)}: water ${formatMoney(totals.waterCost)} and electricity ${formatMoney(totals.electricityCost)}. This covers available events only, not the full utility bill.`,
    );
  }

  if (hasAny(normalized, ["счётчик", "показан", "meter", "reading", "есептегіш", "көрсеткіш"])) {
    return localized(
      lang,
      `Показание воды: ${format(snapshot.profile?.waterMeterReading ?? snapshot.waterReading)} м³. Показание электричества: ${format(snapshot.profile?.electricityMeterReading ?? 0)} кВт·ч. Данные взяты из сохранённого профиля квартиры.`,
      `Су көрсеткіші: ${format(snapshot.profile?.waterMeterReading ?? snapshot.waterReading)} м³. Электр көрсеткіші: ${format(snapshot.profile?.electricityMeterReading ?? 0)} кВт·сағ. Деректер сақталған үй профилінен алынды.`,
      `Water-meter reading: ${format(snapshot.profile?.waterMeterReading ?? snapshot.waterReading)} m³. Electricity-meter reading: ${format(snapshot.profile?.electricityMeterReading ?? 0)} kWh. Values come from the saved home profile.`,
    );
  }

  return localized(
    lang,
    `По данным сайта сегодня зарегистрировано ${totals.eventCount} событий: ${format(totals.waterLiters)} л воды и ${format(totals.electricityKwh)} кВт·ч электроэнергии. Спроси, например: «Сколько воды потратилось сегодня?», «Какие датчики активны?» или «Сколько это стоило?».`,
    `Сайт деректері бойынша бүгін ${totals.eventCount} оқиға тіркелді: ${format(totals.waterLiters)} л су және ${format(totals.electricityKwh)} кВт·сағ электр энергиясы. Мысалы: «Бүгін қанша су жұмсалды?», «Қандай сенсорлар белсенді?» немесе «Құны қанша?» деп сұра.`,
    `The site has ${totals.eventCount} recorded events today: ${format(totals.waterLiters)} L of water and ${format(totals.electricityKwh)} kWh of electricity. Try asking “How much water was used today?”, “Which sensors are active?” or “How much did it cost?”.`,
  );
}

function summarize(events: HomeEvent[]): Totals {
  return events.reduce<Totals>((total, event) => {
    const water = event.resource === "water" && event.unit === "L";
    const electricity = (event.resource === "electricity" || event.resource === "safety") && event.unit === "kWh";
    return {
      waterLiters: total.waterLiters + (water ? event.consumption : 0),
      waterCost: total.waterCost + (water ? event.cost : 0),
      electricityKwh: total.electricityKwh + (electricity ? event.consumption : 0),
      electricityCost: total.electricityCost + (electricity ? event.cost : 0),
      totalCost: total.totalCost + event.cost,
      eventCount: total.eventCount + 1,
    };
  }, { waterLiters: 0, waterCost: 0, electricityKwh: 0, electricityCost: 0, totalCost: 0, eventCount: 0 });
}

function isToday(event: HomeEvent) {
  return new Date(event.timestamp).toDateString() === new Date().toDateString();
}

function localized(lang: AssistantLanguage, ru: string, kz: string, en: string) {
  return lang === "ru" ? ru : lang === "kz" ? kz : en;
}

function hasAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function format(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function formatMoney(value: number) {
  return `${format(value)} ₸`;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function sourceLine(sources: string[], lang: AssistantLanguage) {
  if (!sources.length) return "";
  const title = localized(lang, " Источники: ", " Дереккөздер: ", " Sources: ");
  return `${title}${sources.slice(0, 3).join("; ")}.`;
}

function room(value: string, lang: AssistantLanguage) {
  const names: Record<string, Record<AssistantLanguage, string>> = {
    Bathroom: { ru: "Ванная", kz: "Жуынатын бөлме", en: "Bathroom" },
    Kitchen: { ru: "Кухня", kz: "Ас үй", en: "Kitchen" },
    "Living Room": { ru: "Гостиная", kz: "Қонақ бөлме", en: "Living Room" },
    Bedroom: { ru: "Спальня", kz: "Жатын бөлме", en: "Bedroom" },
  };
  return names[value]?.[lang] ?? value;
}

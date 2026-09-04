"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WasteCalculationService } from "../services/resource-engine";
import type { AppSnapshot, HomeEvent, HomeProfile } from "../types";
import { LiveCameraPanel } from "./live-camera-panel";
import { OfficialReport } from "./official-report";
import { DataAssistant } from "./data-assistant";
import { Subscription } from "./subscription";
import { DeviceConnect } from "./device-connect";
import type { SnapshotAdapter } from "../services/supabase-state.service";
import { useServerFn } from "@tanstack/react-start";
import { generateHomeAiReport } from "../lib/ai.functions";
import { buildHomeContext } from "../lib/home-context";
import { buildAIReport } from "../services/resource-engine";
import detectionLightsAc from "../assets/detection-lights-ac.png.asset.json";
import detectionWater from "../assets/detection-water.png.asset.json";

type Lang = "en" | "ru" | "kz";
type Page = "home" | "assistant" | "report" | "cameras" | "sensors" | "subscription" | "profile";
const copy = {
  en: {
    home: "Dashboard",
    assistant: "AI Chat",
    report: "AI Report",
    cameras: "Cameras",
    sensors: "Sensors",
    subscription: "Subscription",
    profile: "Profile",
    monitoring: "Monitoring",
    system: "All systems operational",
    day: "Day",
    remaining: "days remaining",
    waste: "Potential monthly waste",
    annual: "Potential annual waste",
    water: "Water",
    electricity: "Electricity",
    savings: "Potential savings",
    estimated: "Estimated from detected activity",
    where: "Where money is being wasted",
    why: "Why it is happening",
    trend: "Waste trend",
    live: "Latest detected events",
    viewReport: "View AI report",
    runDemo: "Run demo",
    aiTitle: "AI resource report",
    aiLead:
      "The report uses only recorded activity, meter values and configured tariffs.",
    generate: "Generate current report",
    summary: "Executive summary",
    financial: "Financial impact",
    patterns: "Behavior patterns",
    recommendations: "Automation opportunities",
    topWaste:
      "The bathroom is currently the highest-impact room. Repeated water flow without detected presence is the main pattern.",
    cameraTitle: "Camera detections",
    cameraLead:
      "Review what each camera detected. HomeSense AI shows events and object states instead of a CCTV wall.",
    connected: "Connected",
    lastSignal: "Last signal",
    detected: "Detected objects",
    confidence: "Confidence",
    newDetection: "Generate mock detection",
    noVideo: "Event-only privacy mode · raw video is not stored in this MVP",
    sensorTitle: "Sensors and resource states",
    sensorLead:
      "Choose a resource, room and sensor number to inspect or simulate its state.",
    resource: "Resource",
    room: "Room",
    sensorNo: "Sensor number",
    status: "Current state",
    on: "ON",
    off: "OFF",
    manual: "Manual control",
    source: "Data source",
    profileTitle: "Home and billing profile",
    profileLead:
      "These parameters make financial estimates and recommendations more accurate.",
    edit: "Edit profile",
    save: "Save changes",
    cancel: "Cancel",
    personal: "Personal information",
    homeParams: "Apartment parameters",
    utilities: "Utility spending",
    meters: "Meters and readings",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    address: "Address",
    apartment: "Apartment",
    area: "Area, m²",
    rooms: "Rooms",
    occupants: "Occupants",
    previous: "Last month",
    current: "This month",
    meterNumber: "Meter number",
    reading: "Current reading",
    saved: "Profile saved",
    how: "How was this calculated?",
    medium: "Medium confidence",
    noPerson: "No person detected",
    cost: "Estimated cost",
    settings: "Language",
  },
  ru: {
    home: "Главная",
    assistant: "AI-чат",
    report: "AI-отчёт",
    cameras: "Камеры",
    sensors: "Сенсоры",
    subscription: "Подписка",
    profile: "Профиль",
    monitoring: "Мониторинг",
    system: "Все системы работают",
    day: "День",
    remaining: "дней осталось",
    waste: "Возможные потери за месяц",
    annual: "Возможные потери за год",
    water: "Вода",
    electricity: "Электричество",
    savings: "Потенциальная экономия",
    estimated: "Оценка по обнаруженной активности",
    where: "Где теряются деньги",
    why: "Почему это происходит",
    trend: "Динамика потерь",
    live: "Последние обнаруженные события",
    viewReport: "Открыть AI-отчёт",
    runDemo: "Запустить демо",
    aiTitle: "AI-отчёт по ресурсам",
    aiLead:
      "Отчёт использует только зафиксированную активность, показания счётчиков и ваши тарифы.",
    generate: "Сформировать актуальный отчёт",
    summary: "Краткий вывод",
    financial: "Финансовое влияние",
    patterns: "Повторяющиеся привычки",
    recommendations: "Возможности автоматизации",
    topWaste:
      "Сейчас ванная — комната с наибольшими возможными потерями. Главная повторяющаяся проблема — вода без обнаруженного присутствия человека.",
    cameraTitle: "Детекции камер",
    cameraLead:
      "Посмотрите, что заметила каждая камера. GapClose показывает события и состояния объектов, а не стену видеонаблюдения.",
    connected: "Подключена",
    lastSignal: "Последний сигнал",
    detected: "Обнаруженные объекты",
    confidence: "Уверенность",
    newDetection: "Создать тестовую детекцию",
    noVideo: "Приватный режим событий · сырое видео в MVP не сохраняется",
    sensorTitle: "Сенсоры и состояния ресурсов",
    sensorLead:
      "Выберите ресурс, комнату и номер сенсора, чтобы посмотреть или изменить его состояние.",
    resource: "Ресурс",
    room: "Комната",
    sensorNo: "Номер сенсора",
    status: "Текущее состояние",
    on: "ВКЛ",
    off: "ВЫКЛ",
    manual: "Ручное управление",
    source: "Источник данных",
    profileTitle: "Профиль квартиры и платежей",
    profileLead: "Эти параметры делают расчёты потерь и рекомендации точнее.",
    edit: "Редактировать",
    save: "Сохранить",
    cancel: "Отмена",
    personal: "Личные данные",
    homeParams: "Параметры квартиры",
    utilities: "Расходы на коммунальные услуги",
    meters: "Счётчики и показания",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Телефон",
    address: "Адрес",
    apartment: "Квартира",
    area: "Площадь, м²",
    rooms: "Количество комнат",
    occupants: "Жильцов",
    previous: "Прошлый месяц",
    current: "Этот месяц",
    meterNumber: "Номер счётчика",
    reading: "Текущее показание",
    saved: "Профиль сохранён",
    how: "Как это рассчитано?",
    medium: "Средняя уверенность",
    noPerson: "Человек не обнаружен",
    cost: "Оценочная стоимость",
    settings: "Язык",
  },
  kz: {
    home: "Басты бет",
    assistant: "AI чат",
    report: "AI есебі",
    cameras: "Камералар",
    sensors: "Сенсорлар",
    subscription: "Жазылым",
    profile: "Профиль",
    monitoring: "Мониторинг",
    system: "Барлық жүйе жұмыс істеп тұр",
    day: "Күн",
    remaining: "күн қалды",
    waste: "Айлық ықтимал шығын",
    annual: "Жылдық ықтимал шығын",
    water: "Су",
    electricity: "Электр энергиясы",
    savings: "Ықтимал үнем",
    estimated: "Анықталған белсенділік бойынша бағалау",
    where: "Ақша қайда ысырап болады",
    why: "Неліктен болып жатыр",
    trend: "Шығын динамикасы",
    live: "Соңғы анықталған оқиғалар",
    viewReport: "AI есебін ашу",
    runDemo: "Демоны іске қосу",
    aiTitle: "Ресурстар бойынша AI есебі",
    aiLead:
      "Есеп тек тіркелген белсенділікті, есептегіш көрсеткіштерін және тарифтерді қолданады.",
    generate: "Ағымдағы есепті құру",
    summary: "Қысқаша қорытынды",
    financial: "Қаржылық әсер",
    patterns: "Қайталанатын әдеттер",
    recommendations: "Автоматтандыру мүмкіндіктері",
    topWaste:
      "Қазір жуынатын бөлмеде ықтимал шығын ең жоғары. Негізгі қайталанатын мәселе — адам анықталмаған кезде судың ағуы.",
    cameraTitle: "Камера анықтаулары",
    cameraLead:
      "Әр камера нені байқағанын қараңыз. GapClose бейнебақылау қабырғасының орнына оқиғалар мен объект күйлерін көрсетеді.",
    connected: "Қосылған",
    lastSignal: "Соңғы сигнал",
    detected: "Анықталған объектілер",
    confidence: "Сенімділік",
    newDetection: "Сынақ анықтауын жасау",
    noVideo:
      "Оқиғаларға негізделген құпия режим · MVP-де бастапқы бейне сақталмайды",
    sensorTitle: "Сенсорлар және ресурс күйлері",
    sensorLead:
      "Күйін көру немесе модельдеу үшін ресурс, бөлме және сенсор нөмірін таңдаңыз.",
    resource: "Ресурс",
    room: "Бөлме",
    sensorNo: "Сенсор нөмірі",
    status: "Ағымдағы күй",
    on: "ҚОСУ",
    off: "ӨШІРУ",
    manual: "Қолмен басқару",
    source: "Дерек көзі",
    profileTitle: "Үй және төлем профилі",
    profileLead: "Бұл параметрлер шығын есептері мен ұсыныстарды нақтылайды.",
    edit: "Өңдеу",
    save: "Сақтау",
    cancel: "Бас тарту",
    personal: "Жеке мәліметтер",
    homeParams: "Пәтер параметрлері",
    utilities: "Коммуналдық шығындар",
    meters: "Есептегіштер мен көрсеткіштер",
    firstName: "Аты",
    lastName: "Тегі",
    phone: "Телефон",
    address: "Мекенжай",
    apartment: "Пәтер",
    area: "Аудан, м²",
    rooms: "Бөлме саны",
    occupants: "Тұрғындар",
    previous: "Өткен ай",
    current: "Осы ай",
    meterNumber: "Есептегіш нөмірі",
    reading: "Ағымдағы көрсеткіш",
    saved: "Профиль сақталды",
    how: "Бұл қалай есептелді?",
    medium: "Орташа сенімділік",
    noPerson: "Адам анықталмады",
    cost: "Бағаланған құны",
    settings: "Тіл",
  },
} as const;

Object.values(copy).forEach((locale) => {
  (locale as { cameraLead: string }).cameraLead = locale.cameraLead.replace(
    "GapClose",
    "HomeSense AI",
  );
});

const defaultProfile: HomeProfile = {
  firstName: "Alikhan",
  lastName: "Medetbayev",
  phone: "+7 700 000 00 00",
  address: "Astana, Mangilik El 55",
  apartment: "42",
  areaM2: 86,
  roomCount: 3,
  occupants: 4,
  previousUtilitiesKzt: 42800,
  currentUtilitiesKzt: 39100,
  waterMeterNumber: "WM-9821-04",
  waterMeterReading: 128.42,
  electricityMeterNumber: "EM-5529-17",
  electricityMeterReading: 8462.7,
};
const initialEvents: HomeEvent[] = [
  {
    id: "e1",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    kind: "WATER FLOW WITHOUT PRESENCE",
    room: "Bathroom",
    resource: "water",
    detail: "8 min without detected presence",
    cost: 22.4,
    consumption: 24,
    unit: "L",
    confidence: 88,
    severity: "warning",
    source: "Phone audio + water meter → duration → tariff",
    image: detectionWater.url,
  },
  {
    id: "e2",
    timestamp: new Date(Date.now() - 520000).toISOString(),
    kind: "LIGHT LEFT ON",
    room: "Kitchen",
    resource: "electricity",
    detail: "42 min without detected presence",
    cost: 10.5,
    consumption: 0.42,
    unit: "kWh",
    confidence: 94,
    severity: "warning",
    source: "Camera detection → power model → duration → tariff",
    image: detectionLightsAc.url,
  },
  {
    id: "e3",
    timestamp: new Date(Date.now() - 760000).toISOString(),
    kind: "STOVE LEFT ON",
    room: "Kitchen",
    resource: "safety",
    detail: "12 min without detected presence",
    cost: 10,
    consumption: 0.4,
    unit: "kWh",
    confidence: 91,
    severity: "critical",
    source: "Camera detection → state duration → safety rule",
  },
];
const initialSnapshot: AppSnapshot = {
  homeName: "My Apartment",
  monitoringDay: 3,
  automationEnabled: false,
  tariffs: { electricity: 25, water: 93.3, currency: "₸" },
  events: initialEvents,
  devices: [],
  rules: [],
  appliances: [
    { id: "light", name: "Kitchen Light", room: "Kitchen", powerKw: 0.6 },
  ],
  waterReading: 128.42,
  savedTotal: 2140,
  profile: defaultProfile,
};
const cameraSeed = [
  {
    id: "CAM-01",
    name: { en: "Kitchen camera", ru: "Камера кухни", kz: "Ас үй камерасы" },
    room: "Kitchen",
    status: "online",
    events: [
      { time: "19:42:15", objects: ["person", "stove"], confidence: 96 },
      { time: "19:32:04", objects: ["light on", "no person"], confidence: 94 },
      { time: "18:11:50", objects: ["person", "light on"], confidence: 97 },
    ],
  },
  {
    id: "CAM-02",
    name: {
      en: "Living room camera",
      ru: "Камера гостиной",
      kz: "Қонақ бөлме камерасы",
    },
    room: "Living Room",
    status: "online",
    events: [
      { time: "19:38:22", objects: ["AC on", "no person"], confidence: 89 },
      { time: "17:06:12", objects: ["person", "TV on"], confidence: 95 },
    ],
  },
  {
    id: "CAM-03",
    name: { en: "Hallway camera", ru: "Камера прихожей", kz: "Дәліз камерасы" },
    room: "Hallway",
    status: "online",
    events: [
      { time: "19:40:07", objects: ["person left"], confidence: 92 },
      { time: "16:55:44", objects: ["person"], confidence: 98 },
    ],
  },
];
const sensorSeed = [
  {
    id: "WTR-01",
    type: "water",
    room: "Bathroom",
    state: "OFF",
    source: "Phone audio + manual override",
    value: "0 L/min",
  },
  {
    id: "WTR-02",
    type: "water",
    room: "Kitchen",
    state: "OFF",
    source: "Mock flow sensor",
    value: "0 L/min",
  },
  {
    id: "LGT-01",
    type: "light",
    room: "Kitchen",
    state: "ON",
    source: "Camera + smart relay",
    value: "0.60 kW est.",
  },
  {
    id: "LGT-02",
    type: "light",
    room: "Bedroom",
    state: "OFF",
    source: "Smart relay",
    value: "0.02 kW est.",
  },
  {
    id: "PWR-01",
    type: "electricity",
    room: "Living Room",
    state: "ON",
    source: "Appliance power model",
    value: "1.32 kW est.",
  },
  {
    id: "PRS-01",
    type: "presence",
    room: "Kitchen",
    state: "OFF",
    source: "YOLO detection",
    value: "No person",
  },
  {
    id: "STV-01",
    type: "stove",
    room: "Kitchen",
    state: "OFF",
    source: "YOLO state detection",
    value: "0 kW est.",
  },
  {
    id: "AC-01",
    type: "ac",
    room: "Living Room",
    state: "ON",
    source: "Camera + appliance model",
    value: "1.20 kW est.",
  },
];

export function AppShell({
  user,
  stateAdapter,
  onSignOut,
  signOutLabel = "Sign out",
}: {
  user: { displayName: string; email: string } | null;
  stateAdapter?: SnapshotAdapter | undefined;
  onSignOut?: (() => void) | undefined;
  signOutLabel?: string | undefined;
}) {
  const [lang, setLang] = useState<Lang>("ru"),
    [theme, setTheme] = useState<"dark" | "light">("dark"),
    [page, setPage] = useState<Page>("home"),
    [snapshot, setSnapshot] = useState(initialSnapshot),
    ref = useRef(initialSnapshot),
    [notice, setNotice] = useState(""),
    [expanded, setExpanded] = useState<string | null>(null),
    [cameras, setCameras] = useState(cameraSeed),
    [cameraId, setCameraId] = useState("CAM-01"),
    [sensorType, setSensorType] = useState("water"),
    [sensorRoom, setSensorRoom] = useState("all"),
    [sensorId, setSensorId] = useState("WTR-01"),
    [sensors, setSensors] = useState(sensorSeed),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState<HomeProfile>(defaultProfile),
    [report, setReport] = useState<any>(null),
    [reportLoading, setReportLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "saving" | "saved" | "error"
  >("loading");
  const t = copy[lang];
  useEffect(() => {
    const saved = window.localStorage.getItem("gapclose-lang") as Lang | null;
    if (saved && copy[saved]) setLang(saved);
    const savedTheme = window.localStorage.getItem("gapclose-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);
  useEffect(() => {
    if (!user) return;
    const apply = (saved: AppSnapshot | null | undefined) => {
      if (saved) {
        const next = {
          ...initialSnapshot,
          ...saved,
          profile: { ...defaultProfile, ...saved.profile },
        };
        setSnapshot(next);
        ref.current = next;
        setDraft(next.profile!);
      }
    };
    if (stateAdapter) {
      stateAdapter
        .load()
        .then(apply)
        .then(() => setStorageStatus("ready"))
        .catch((error) => {
          console.error("[HomeSense storage] load failed", error);
          setStorageStatus("error");
        });
      return;
    }
    setStorageStatus("ready");
  }, [user, stateAdapter]);
  const persist = async (next: AppSnapshot) => {
    ref.current = next;
    setSnapshot(next);
    setStorageStatus("saving");
    try {
      if (stateAdapter) {
        await stateAdapter.save(next);
      }
      setStorageStatus("saved");
      return true;
    } catch (error) {
      console.error("[HomeSense storage] save failed", error);
      setStorageStatus("error");
      return false;
    }
  };
  const toast = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(""), 2400);
  };
  const changeLang = (l: Lang) => {
    setLang(l);
    window.localStorage.setItem("gapclose-lang", l);
  };
  const metrics = useMemo(
    () => ({
      waste: 4860,
      annual: 58320,
      water: 12.8,
      electricity: 246,
      savings: snapshot.automationEnabled ? 3560 : 3240,
    }),
    [snapshot],
  );
  const nav: Array<[Page, string, string]> = [
    ["home", t.home, "⌂"],
    ["assistant", t.assistant, "✦"],
    ["report", t.report, "AI"],
    ["cameras", t.cameras, "◉"],
    ["sensors", t.sensors, "⌁"],
    ["subscription", t.subscription, "★"],
    ["profile", t.profile, "○"],
  ];
  const Report = ({ lang, snapshot, metrics }: any) => (
    <OfficialReport lang={lang} snapshot={snapshot} metrics={metrics} />
  );
  const runDemo = () => {
    setPage("sensors");
    const engine = new WasteCalculationService();
    const ev = engine.water({
      room: "Bathroom",
      durationMinutes: 8,
      flowLitersPerMinute: 3,
      tariffs: snapshot.tariffs,
      confidence: 88,
    });
    void persist({ ...ref.current, events: [ev, ...ref.current.events] });
    setSensors(
      sensors.map((s) =>
        s.id === "WTR-01" ? { ...s, state: "ON", value: "3.0 L/min" } : s,
      ),
    );
    toast(
      lang === "ru"
        ? "Обнаружен новый расход воды"
        : lang === "kz"
          ? "Жаңа су шығыны анықталды"
          : "New water use detected",
    );
  };
  return (
    <div className="app-shell v2" data-theme={theme}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage("home")}>
          <span className="brand-mark">
            <i />
          </span>
          <span>
            GAPCLOSE<small>RESOURCE INTELLIGENCE</small>
          </span>
        </button>
        <div className="mode-chip">
          <span className="pulse" />
          {t.monitoring} · {t.day} {snapshot.monitoringDay}/30
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="journey">
          <small>SEE → UNDERSTAND</small>
          <small>CALCULATE → SAVE</small>
        </div>
        <div className="side-health">
          <div>
            <span className="pulse teal" />
            {t.system}
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <small>GAPCLOSE / {t[page]}</small>
            <h1>{t[page]}</h1>
          </div>
          <div className="top-actions">
            <button
              className="theme-toggle"
              onClick={() =>
                setTheme((v) => {
                  const next = v === "dark" ? "light" : "dark";
                  window.localStorage.setItem("gapclose-theme", next);
                  return next;
                })
              }
              aria-label="Theme"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <div className="language" aria-label={t.settings}>
              {(["en", "ru", "kz"] as Lang[]).map((l) => (
                <button
                  key={l}
                  className={lang === l ? "active" : ""}
                  onClick={() => changeLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="status-button">
              <span className="pulse teal" />
              {t.system}
            </button>
            {onSignOut && (
              <button className="signout-button" onClick={onSignOut}>
                {signOutLabel}
              </button>
            )}
            <button className="avatar" onClick={() => setPage("profile")}>
              {(snapshot.profile?.firstName || user?.displayName || "DU")
                .slice(0, 2)
                .toUpperCase()}
            </button>
          </div>
        </header>
        {page === "home" && (
          <Dashboard
            t={t}
            snapshot={snapshot}
            metrics={metrics}
            setPage={setPage}
            expanded={expanded}
            setExpanded={setExpanded}
            runDemo={runDemo}
          />
        )}{" "}
        {page === "assistant" && (
          <DataAssistant lang={lang} snapshot={snapshot} sensors={sensors} />
        )}{" "}
        {page === "report" && (
          <Report
            t={t}
            lang={lang}
            snapshot={snapshot}
            metrics={metrics}
            report={report}
            setReport={setReport}
            loading={reportLoading}
            setLoading={setReportLoading}
          />
        )}{" "}
        {page === "cameras" && (
          <Cameras
            t={t}
            lang={lang}
            cameras={cameras}
            setCameras={setCameras}
            cameraId={cameraId}
            setCameraId={setCameraId}
            toast={toast}
          />
        )}{" "}
        {page === "sensors" && (
          <Sensors
            t={t}
            lang={lang}
            sensors={sensors}
            setSensors={setSensors}
            type={sensorType}
            setType={setSensorType}
            room={sensorRoom}
            setRoom={setSensorRoom}
            sensorId={sensorId}
            setSensorId={setSensorId}
            toast={toast}
          />
        )}{" "}
        {page === "subscription" && <Subscription lang={lang} toast={toast} />}{" "}
        {page === "profile" && (
          <Profile
            t={t}
            lang={lang}
            user={user}
            snapshot={snapshot}
            persist={persist}
            editing={editing}
            setEditing={setEditing}
            draft={draft}
            setDraft={setDraft}
            toast={toast}
            storageStatus={storageStatus}
          />
        )}
      </main>
      <nav className="mobile-nav">
        {nav.map(([id, label, icon]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            <span>{icon}</span>
            <small>{label}</small>
          </button>
        ))}
      </nav>
      {notice && (
        <div className="toast">
          <span className="pulse teal" />
          {notice}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  t,
  snapshot,
  metrics,
  setPage,
  expanded,
  setExpanded,
  runDemo,
}: any) {
  return (
    <div className="page-content">
      <section className="monitor-banner">
        <div>
          <span className="pulse" />
          <b>{t.monitoring.toUpperCase()}</b>
          <p>{t.estimated}</p>
        </div>
        <div className="progress-wrap">
          <strong>
            {t.day} {snapshot.monitoringDay} <i>/ 30</i>
          </strong>
          <div className="progress">
            <span
              style={{ width: `${(snapshot.monitoringDay / 30) * 100}%` }}
            />
          </div>
          <small>
            {30 - snapshot.monitoringDay} {t.remaining}
          </small>
        </div>
      </section>
      <section className="money-hero">
        <div>
          <small>{t.waste}</small>
          <strong>{metrics.waste.toLocaleString()} ₸</strong>
          <p>
            {t.estimated} · {t.medium}
          </p>
        </div>
        <button className="primary big" onClick={() => setPage("report")}>
          {t.viewReport} →
        </button>
      </section>
      <section className="metric-grid three">
        <Metric
          label={t.annual}
          value={`${metrics.annual.toLocaleString()} ₸`}
          meta={t.estimated}
        />
        <Metric
          label={t.water}
          value={`${metrics.water} m³`}
          meta={t.current}
        />
        <Metric
          label={t.savings}
          value={`${metrics.savings.toLocaleString()} ₸`}
          meta={t.estimated}
          good
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <PanelHead title={t.trend} kicker="14 DAYS" />
          <RealChart events={snapshot.events} t={t} />
          <div className="chart-legend">
            <span>
              <i className="dot amber" />
              {t.waste}
            </span>
            <span>
              <i className="dot teal" />
              {t.savings}
            </span>
          </div>
        </article>
        <article className="panel breakdown">
          <PanelHead title={t.where} kicker={t.waste} />
          <Break label={t.water} value={2050} total={4860} color="#2dd4bf" />
          <Break
            label={langLabel(t, "Lighting")}
            value={1340}
            total={4860}
            color="#818cf8"
          />
          <Break
            label={langLabel(t, "Appliances")}
            value={1180}
            total={4860}
            color="#607d9a"
          />
          <Break
            label={langLabel(t, "Stove")}
            value={290}
            total={4860}
            color="#ff8b73"
          />
        </article>
        <article className="panel feed">
          <PanelHead title={t.live} kicker="LIVE" />
          {snapshot.events.slice(0, 4).map((e: HomeEvent) => (
            <EventRow
              key={e.id}
              event={e}
              t={t}
              expanded={expanded === e.id}
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            />
          ))}
        </article>
        <article className="panel insight">
          <div className="ai-label">
            <span>AI</span>
            {t.why.toUpperCase()}
          </div>
          <h3>{t.topWaste}</h3>
          <button className="primary big" onClick={() => setPage("report")}>
            {t.viewReport}
          </button>
        </article>
      </section>
      <button className="demo-fab" onClick={runDemo}>
        ▶ {t.runDemo}
      </button>
    </div>
  );
}

function Report({
  t,
  lang,
  snapshot,
  metrics,
  report,
  setReport,
  loading,
  setLoading,
}: any) {
  const runAiReport = useServerFn(generateHomeAiReport);
  const generate = async () => {
    setLoading(true);
    const input = {
      monitoringDays: snapshot.monitoringDay,
      waterConsumptionM3: metrics.water,
      estimatedElectricityKwh: metrics.electricity,
      totalPotentialWaste: metrics.waste,
      events: snapshot.events,
    };
    const context = `${buildHomeContext(snapshot)}\nAGGREGATES:${JSON.stringify(input)}`;
    try {
      setReport(await runAiReport({ data: { lang, context } }));
    } catch (error) {
      console.error("[HomeSense AI] report failed", error);
      setReport(buildAIReport(input));
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };
  return (
    <div className="page-content">
      <section className="report-head">
        <div>
          <span className="ai-orb">AI</span>
          <small>{t.medium}</small>
          <h2>{t.aiTitle}</h2>
          <p>{t.aiLead}</p>
        </div>
        <button className="primary big" onClick={generate} disabled={loading}>
          {loading
            ? lang === "ru"
              ? "Анализируем…"
              : lang === "kz"
                ? "Талдау…"
                : "Analyzing…"
            : t.generate}
        </button>
      </section>
      {loading && (
        <section className="panel analyzing">
          <b>
            {lang === "ru"
              ? "АНАЛИЗ КВАРТИРЫ"
              : lang === "kz"
                ? "ҮЙДІ ТАЛДАУ"
                : "ANALYZING YOUR HOME"}
          </b>
          <span>✓ {t.water}</span>
          <span>✓ {t.electricity}</span>
          <span>✓ {t.patterns}</span>
          <span>● {t.recommendations}</span>
        </section>
      )}
      {report && !loading && (
        <>
          <section className="report-number">
            <small>{t.waste}</small>
            <strong>{metrics.waste.toLocaleString()} ₸</strong>
            <p>{t.estimated}</p>
          </section>
          <section className="report-sections">
            <article className="panel">
              <small>01</small>
              <h3>{t.summary}</h3>
              <p>{t.topWaste}</p>
            </article>
            <article className="panel">
              <small>02</small>
              <h3>{t.financial}</h3>
              <div className="report-kpis">
                <b>
                  6,420 ₸<span>{t.water}</span>
                </b>
                <b>
                  4,210 ₸<span>{langLabel(t, "Lighting")}</span>
                </b>
                <b>
                  10,800 ₸<span>{t.savings}</span>
                </b>
              </div>
            </article>
            <article className="panel">
              <small>03</small>
              <h3>{t.patterns}</h3>
              <p>
                18 ×{" "}
                {lang === "ru"
                  ? "вода без присутствия"
                  : lang === "kz"
                    ? "адамсыз су ағымы"
                    : "water without presence"}
              </p>
              <p>
                42 ×{" "}
                {lang === "ru"
                  ? "свет оставлен включённым"
                  : lang === "kz"
                    ? "жарық қосулы қалған"
                    : "lights left on"}
              </p>
            </article>
            <article className="panel accent-panel">
              <small>04</small>
              <h3>{t.recommendations}</h3>
              <p>
                {lang === "ru"
                  ? "Умный клапан в ванной имеет наибольший потенциальный эффект."
                  : lang === "kz"
                    ? "Жуынатын бөлмедегі ақылды клапан ең жоғары ықтимал әсер береді."
                    : "A smart bathroom valve has the highest potential impact."}
              </p>
              <button>
                {lang === "ru"
                  ? "Добавить в план"
                  : lang === "kz"
                    ? "Жоспарға қосу"
                    : "Add to plan"}
              </button>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function Cameras({
  t,
  lang,
  cameras,
  setCameras,
  cameraId,
  setCameraId,
  toast,
}: any) {
  const cam = cameras.find((c: any) => c.id === cameraId);
  const add = () => {
    const next = {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      objects: ["person left", "light on"],
      confidence: 93,
    };
    setCameras(
      cameras.map((c: any) =>
        c.id === cameraId ? { ...c, events: [next, ...c.events] } : c,
      ),
    );
    toast(
      lang === "ru"
        ? "Новая тестовая детекция добавлена"
        : lang === "kz"
          ? "Жаңа сынақ анықтауы қосылды"
          : "New mock detection added",
    );
  };
  return (
    <div className="page-content">
      <div className="section-title">
        <div>
          <span className="eyebrow">LIVE CAMERA + YOLO EVENT VIEW</span>
          <h2>{t.cameraTitle}</h2>
          <p>{t.cameraLead}</p>
        </div>
        <button className="primary big" onClick={add}>
          ＋ {t.newDetection}
        </button>
      </div>
      <LiveCameraPanel lang={lang} />
      <div className="camera-layout">
        <aside className="camera-list">
          {cameras.map((c: any) => (
            <button
              key={c.id}
              className={cameraId === c.id ? "active" : ""}
              onClick={() => setCameraId(c.id)}
            >
              <span className="camera-dot">
                <i />
              </span>
              <div>
                <b>{c.name[lang]}</b>
                <small>
                  {c.id} · {roomName(c.room, lang)}
                </small>
              </div>
              <em>{c.events.length}</em>
            </button>
          ))}
        </aside>
        <section className="panel camera-detail">
          <div className="camera-header">
            <div>
              <span className="status-good">● {t.connected}</span>
              <h3>{cam.name[lang]}</h3>
              <p>
                {cam.id} · {roomName(cam.room, lang)}
              </p>
            </div>
            <div>
              <small>{t.lastSignal}</small>
              <strong>{cam.events[0].time}</strong>
            </div>
          </div>
          <div className="privacy-strip">▣ {t.noVideo}</div>
          <div className="detection-list">
            {cam.events.map((e: any, i: number) => (
              <article key={`${e.time}-${i}`}>
                <time>{e.time}</time>
                <div>
                  <small>{t.detected}</small>
                  <div className="object-tags">
                    {e.objects.map((o: string) => (
                      <span key={o}>{objectName(o, lang)}</span>
                    ))}
                  </div>
                </div>
                <strong>
                  {e.confidence}%<small>{t.confidence}</small>
                </strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Sensors({
  t,
  lang,
  sensors,
  setSensors,
  type,
  setType,
  room,
  setRoom,
  sensorId,
  setSensorId,
  toast,
}: any) {
  const types = ["water", "light", "electricity", "presence", "stove", "ac"],
    rooms = ["all", "Kitchen", "Bathroom", "Living Room", "Bedroom"];
  const filtered = sensors.filter(
    (s: any) => s.type === type && (room === "all" || s.room === room),
  );
  const selected =
    sensors.find((s: any) => s.id === sensorId && s.type === type) ||
    filtered[0];
  useEffect(() => {
    if (selected && sensorId !== selected.id) setSensorId(selected.id);
  }, [type, room]);
  const command = (state: string) => {
    if (!selected) return;
    setSensors(
      sensors.map((s: any) =>
        s.id === selected.id
          ? {
              ...s,
              state,
              value:
                state === "ON"
                  ? s.type === "water"
                    ? "3.0 L/min"
                    : s.type === "presence"
                      ? "Person detected"
                      : s.value
                  : s.type === "water"
                    ? "0 L/min"
                    : s.type === "presence"
                      ? "No person"
                      : s.value,
            }
          : s,
      ),
    );
    toast(`${selected.id}: ${state}`);
  };
  return (
    <div className="page-content">
      <div className="section-title">
        <div>
          <span className="eyebrow">RESOURCE SENSOR LAYER</span>
          <h2>{t.sensorTitle}</h2>
          <p>{t.sensorLead}</p>
        </div>
      </div>
      <div className="resource-tabs">
        {types.map((x) => (
          <button
            key={x}
            className={type === x ? "active" : ""}
            onClick={() => setType(x)}
          >
            <span>{resourceIcon(x)}</span>
            {resourceName(x, lang)}
          </button>
        ))}
      </div>
      <section className="sensor-filters">
        <label>
          {t.room}
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r === "all"
                  ? lang === "ru"
                    ? "Все комнаты"
                    : lang === "kz"
                      ? "Барлық бөлме"
                      : "All rooms"
                  : roomName(r, lang)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.sensorNo}
          <select
            value={selected?.id || ""}
            onChange={(e) => setSensorId(e.target.value)}
          >
            {filtered.map((s: any) => (
              <option key={s.id}>{s.id}</option>
            ))}
          </select>
        </label>
      </section>
      {selected ? (
        <div className="sensor-detail-grid">
          <article className="panel sensor-focus">
            <div className="sensor-focus-head">
              <span
                className={`resource-icon ${selected.state === "ON" ? "active" : ""}`}
              >
                {resourceIcon(selected.type)}
              </span>
              <div>
                <small>
                  {resourceName(selected.type, lang).toUpperCase()} ·{" "}
                  {selected.id}
                </small>
                <h3>{roomName(selected.room, lang)}</h3>
              </div>
            </div>
            <div className="sensor-big-state">
              <small>{t.status}</small>
              <strong className={selected.state === "ON" ? "on" : ""}>
                {selected.state === "ON" ? t.on : t.off}
              </strong>
              <span>{selected.value}</span>
            </div>
            <div className="sensor-source">
              <small>{t.source}</small>
              <b>{selected.source}</b>
            </div>
          </article>
          <article className="panel manual-card">
            <small>{t.manual.toUpperCase()}</small>
            <h3>
              {lang === "ru"
                ? "Изменить состояние сенсора"
                : lang === "kz"
                  ? "Сенсор күйін өзгерту"
                  : "Change sensor state"}
            </h3>
            <p>
              {lang === "ru"
                ? "Команда проходит через тот же интерфейс, который позже будет подключён к реальному устройству."
                : lang === "kz"
                  ? "Команда кейін нақты құрылғыға қосылатын интерфейс арқылы өтеді."
                  : "The command uses the same interface that will later connect to real hardware."}
            </p>
            <div>
              <button className="success-button" onClick={() => command("ON")}>
                {t.on}
              </button>
              <button onClick={() => command("OFF")}>{t.off}</button>
            </div>
          </article>
        </div>
      ) : (
        <Empty lang={lang} />
      )}
      <DeviceConnect lang={lang} toast={toast} />
      <section className="panel sensor-table">
        <PanelHead
          title={
            lang === "ru"
              ? "Все сенсоры"
              : lang === "kz"
                ? "Барлық сенсор"
                : "All sensors"
          }
          kicker={`${sensors.length} ONLINE`}
        />
        {sensors.map((s: any) => (
          <button
            key={s.id}
            onClick={() => {
              setType(s.type);
              setSensorId(s.id);
              setRoom("all");
            }}
          >
            <b>{s.id}</b>
            <span>{resourceName(s.type, lang)}</span>
            <span>{roomName(s.room, lang)}</span>
            <em className={s.state === "ON" ? "on" : ""}>
              {s.state === "ON" ? t.on : t.off}
            </em>
          </button>
        ))}
      </section>
    </div>
  );
}

function Profile({
  t,
  lang,
  user,
  snapshot,
  persist,
  editing,
  setEditing,
  draft,
  setDraft,
  toast,
  storageStatus,
}: any) {
  const p = snapshot.profile || defaultProfile;
  const save = async () => {
    const saved = await persist({
      ...snapshot,
      profile: draft,
      waterReading: draft.waterMeterReading,
    });
    if (saved) {
      setEditing(false);
      toast(browserSaveMessage(lang, "saved"));
    } else {
      toast(browserSaveMessage(lang, "error"));
    }
  };
  const field = (key: keyof HomeProfile, label: string, type = "text") => (
    <label>
      {label}
      <input
        type={type}
        value={draft[key]}
        disabled={!editing}
        onChange={(e) =>
          setDraft({
            ...draft,
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          })
        }
      />
    </label>
  );
  return (
    <div className="page-content">
      <div className="section-title">
        <div>
          <span className="eyebrow">HOME DATA PROFILE</span>
          <h2>{t.profileTitle}</h2>
          <p>{t.profileLead}</p>
        </div>
        {!editing ? (
          <button
            className="primary big"
            onClick={() => {
              setDraft(p);
              setEditing(true);
            }}
          >
            ✎ {t.edit}
          </button>
        ) : (
          <div className="profile-actions">
            <button
              onClick={() => {
                setDraft(p);
                setEditing(false);
              }}
            >
              {t.cancel}
            </button>
            <button className="primary big" onClick={save}>
              {t.save}
            </button>
          </div>
        )}
      </div>
      <div className={`browser-save-state ${storageStatus}`} role="status">
        <span />
        {browserSaveMessage(lang, storageStatus)}
      </div>
      <section className="profile-summary">
        <div className="profile-avatar">
          {p.firstName.slice(0, 1)}
          {p.lastName.slice(0, 1)}
        </div>
        <div>
          <h3>
            {p.firstName} {p.lastName}
          </h3>
          <p>
            {user?.email || "demo@gapclose.ai"} · {p.phone}
          </p>
        </div>
        <div>
          <small>{t.current}</small>
          <strong>{p.currentUtilitiesKzt.toLocaleString()} ₸</strong>
        </div>
      </section>
      <div className="profile-grid">
        <section className="panel profile-section">
          <PanelHead title={t.personal} kicker="01" />
          <div className="form-grid">
            {field("firstName", t.firstName)}
            {field("lastName", t.lastName)}
            {field("phone", t.phone)}
            {field("address", t.address)}
            {field("apartment", t.apartment)}
          </div>
        </section>
        <section className="panel profile-section">
          <PanelHead title={t.homeParams} kicker="02" />
          <div className="form-grid">
            {field("areaM2", t.area, "number")}
            {field("roomCount", t.rooms, "number")}
            {field("occupants", t.occupants, "number")}
          </div>
        </section>
        <section className="panel profile-section">
          <PanelHead title={t.utilities} kicker="03" />
          <div className="expense-compare">
            <div>
              <small>{t.previous}</small>
              <strong>
                {(editing ? draft : p).previousUtilitiesKzt.toLocaleString()} ₸
              </strong>
            </div>
            <span>→</span>
            <div>
              <small>{t.current}</small>
              <strong className="good">
                {(editing ? draft : p).currentUtilitiesKzt.toLocaleString()} ₸
              </strong>
            </div>
          </div>
          <div className="form-grid">
            {field("previousUtilitiesKzt", `${t.previous}, ₸`, "number")}
            {field("currentUtilitiesKzt", `${t.current}, ₸`, "number")}
          </div>
        </section>
        <section className="panel profile-section">
          <PanelHead title={t.meters} kicker="04" />
          <h4>{t.water}</h4>
          <div className="form-grid">
            {field("waterMeterNumber", t.meterNumber)}
            {field("waterMeterReading", `${t.reading}, m³`, "number")}
          </div>
          <h4>{t.electricity}</h4>
          <div className="form-grid">
            {field("electricityMeterNumber", t.meterNumber)}
            {field("electricityMeterReading", `${t.reading}, kWh`, "number")}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, meta, good }: any) {
  return (
    <article className="metric">
      <small>{label}</small>
      <strong className={good ? "good" : ""}>{value}</strong>
      <span>{meta}</span>
    </article>
  );
}

function browserSaveMessage(
  lang: Lang,
  status: "loading" | "ready" | "saving" | "saved" | "error",
) {
  const messages = {
    en: {
      loading: "Checking browser storage…",
      ready: "Browser storage is ready",
      saving: "Saving in this browser…",
      saved: "Saved in this browser",
      error: "Could not save. Check browser privacy settings.",
    },
    ru: {
      loading: "Проверяем хранилище браузера…",
      ready: "Хранилище браузера готово",
      saving: "Сохраняем в этом браузере…",
      saved: "Сохранено в этом браузере",
      error: "Не удалось сохранить. Проверьте настройки приватности браузера.",
    },
    kz: {
      loading: "Браузер жадын тексеріп жатырмыз…",
      ready: "Браузер жады дайын",
      saving: "Осы браузерде сақталып жатыр…",
      saved: "Осы браузерде сақталды",
      error: "Сақтау мүмкін болмады. Браузер құпиялық баптауларын тексеріңіз.",
    },
  } as const;
  return messages[lang][status];
}
function PanelHead({ title, kicker }: any) {
  return (
    <div className="panel-head">
      <div>
        <small>{kicker}</small>
        <h3>{title}</h3>
      </div>
    </div>
  );
}
function Break({ label, value, total, color }: any) {
  return (
    <div className="break">
      <div>
        <span>{label}</span>
        <b>{value.toLocaleString()} ₸</b>
      </div>
      <i>
        <span
          style={{ width: `${(value / total) * 100}%`, background: color }}
        />
      </i>
    </div>
  );
}
function EventRow({ event, t, expanded, onClick }: any) {
  return (
    <div className={`event-row ${event.severity}`}>
      <button onClick={onClick}>
        <span className="event-symbol">
          {event.resource === "water"
            ? "W"
            : event.resource === "safety"
              ? "!"
              : "E"}
        </span>
        <div>
          <small>
            {new Date(event.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {event.room}
          </small>
          <b>{eventTitle(event.kind, t)}</b>
          <p>{t.noPerson}</p>
        </div>
        {event.image && (
          <img
            className="event-thumb"
            src={event.image}
            alt={eventTitle(event.kind, t)}
            loading="lazy"
          />
        )}
        <div className="event-cost">
          <strong>{event.cost.toFixed(1)} ₸</strong>
          <small>{event.confidence}%</small>
        </div>
      </button>
      {expanded && (
        <div className="calculation">
          {event.image && (
            <img
              className="event-photo"
              src={event.image}
              alt={eventTitle(event.kind, t)}
              loading="lazy"
            />
          )}
          <b>{t.how}</b>
          <span>{event.source}</span>
          <span>
            {event.consumption} {event.unit} · {event.cost.toFixed(2)} ₸
          </span>
        </div>
      )}
    </div>
  );
}
function Empty({ lang }: { lang: Lang }) {
  return (
    <div className="panel empty">
      <h3>
        {lang === "ru"
          ? "Нет данных"
          : lang === "kz"
            ? "Дерек жоқ"
            : "No data yet"}
      </h3>
      <p>
        {lang === "ru"
          ? "Выберите другой тип ресурса или комнату."
          : lang === "kz"
            ? "Басқа ресурс түрін немесе бөлмені таңдаңыз."
            : "Choose another resource type or room."}
      </p>
    </div>
  );
}
function roomName(v: string, l: Lang) {
  const m: any = {
    Kitchen: { ru: "Кухня", kz: "Ас үй" },
    Bathroom: { ru: "Ванная", kz: "Жуынатын бөлме" },
    "Living Room": { ru: "Гостиная", kz: "Қонақ бөлме" },
    Bedroom: { ru: "Спальня", kz: "Жатын бөлме" },
    Hallway: { ru: "Прихожая", kz: "Дәліз" },
  };
  return l === "en" ? v : m[v]?.[l] || v;
}
function resourceName(v: string, l: Lang) {
  const m: any = {
    water: { en: "Water", ru: "Вода", kz: "Су" },
    light: { en: "Lighting", ru: "Свет", kz: "Жарық" },
    electricity: {
      en: "Electricity",
      ru: "Электричество",
      kz: "Электр энергиясы",
    },
    presence: { en: "Presence", ru: "Присутствие", kz: "Адамның болуы" },
    stove: { en: "Stove", ru: "Плита", kz: "Плита" },
    ac: { en: "Air conditioner", ru: "Кондиционер", kz: "Кондиционер" },
  };
  return m[v]?.[l] || v;
}
function resourceIcon(v: string) {
  return (
    {
      water: "W",
      light: "L",
      electricity: "E",
      presence: "P",
      stove: "S",
      ac: "AC",
    } as any
  )[v];
}
function objectName(v: string, l: Lang) {
  const m: any = {
    person: { ru: "человек", kz: "адам" },
    stove: { ru: "плита", kz: "плита" },
    "light on": { ru: "свет включён", kz: "жарық қосулы" },
    "no person": { ru: "нет человека", kz: "адам жоқ" },
    "AC on": { ru: "кондиционер включён", kz: "кондиционер қосулы" },
    "TV on": { ru: "телевизор включён", kz: "теледидар қосулы" },
    "person left": { ru: "человек ушёл", kz: "адам кетті" },
  };
  return l === "en" ? v : m[v]?.[l] || v;
}
function eventTitle(v: string, t: any) {
  if (v.includes("WATER")) return `${t.water.toUpperCase()} · ${t.noPerson}`;
  if (v.includes("STOVE"))
    return `${langLabel(t, "Stove").toUpperCase()} · ${t.noPerson}`;
  return `${langLabel(t, "Lighting").toUpperCase()} · ${t.noPerson}`;
}
function langLabel(t: any, v: string) {
  if (v === "Lighting")
    return t === copy.ru ? "Освещение" : t === copy.kz ? "Жарық" : "Lighting";
  if (v === "Appliances")
    return t === copy.ru
      ? "Приборы"
      : t === copy.kz
        ? "Құрылғылар"
        : "Appliances";
  if (v === "Stove")
    return t === copy.ru ? "Плита" : t === copy.kz ? "Плита" : "Stove";
  return v;
}

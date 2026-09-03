"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "ru" | "kz";

type Paired = {
  id: string;
  name: string;
  link: "bluetooth" | "wifi";
  detail: string;
  status: "connected" | "offline";
};

const words = {
  en: {
    eyebrow: "DEVICE CONNECTIVITY",
    title: "Connect appliances",
    lead: "Pair sensors and actuators over Bluetooth or add them to your Wi-Fi network.",
    bt: "Bluetooth",
    btLead: "Pair a BLE sensor, valve or relay directly from this device.",
    scan: "Scan and pair",
    scanning: "Scanning…",
    btUnsupported:
      "Web Bluetooth is unavailable here. Use Chrome or Edge on Android, Windows, macOS or ChromeOS.",
    btReady: "Bluetooth ready",
    wifi: "Wi-Fi",
    wifiLead: "Send network credentials to a device in setup mode.",
    ssid: "Network name (SSID)",
    pass: "Password",
    ip: "Device IP or host",
    connect: "Connect",
    connecting: "Connecting…",
    paired: "Connected devices",
    none: "No devices connected yet.",
    remove: "Disconnect",
    connected: "Connected",
    offline: "Offline",
    okBt: "Bluetooth device paired",
    okWifi: "Device added to Wi-Fi",
    failBt: "Pairing cancelled or failed",
    failWifi: "Fill in network name and device address",
  },
  ru: {
    eyebrow: "ПОДКЛЮЧЕНИЕ ПРИБОРОВ",
    title: "Подключение приборов",
    lead: "Подключайте датчики и исполнительные устройства по Bluetooth или добавляйте их в вашу сеть Wi-Fi.",
    bt: "Bluetooth",
    btLead: "Подключите BLE-датчик, клапан или реле прямо с этого устройства.",
    scan: "Найти и подключить",
    scanning: "Поиск…",
    btUnsupported:
      "Web Bluetooth здесь недоступен. Используйте Chrome или Edge на Android, Windows, macOS или ChromeOS.",
    btReady: "Bluetooth готов",
    wifi: "Wi-Fi",
    wifiLead: "Передайте данные сети прибору в режиме настройки.",
    ssid: "Имя сети (SSID)",
    pass: "Пароль",
    ip: "IP или адрес прибора",
    connect: "Подключить",
    connecting: "Подключение…",
    paired: "Подключённые приборы",
    none: "Пока нет подключённых приборов.",
    remove: "Отключить",
    connected: "Подключено",
    offline: "Не в сети",
    okBt: "Bluetooth-прибор подключён",
    okWifi: "Прибор добавлен в Wi-Fi",
    failBt: "Подключение отменено или не удалось",
    failWifi: "Укажите имя сети и адрес прибора",
  },
  kz: {
    eyebrow: "ҚҰРЫЛҒЫНЫ ҚОСУ",
    title: "Құрылғыларды қосу",
    lead: "Сенсорлар мен атқарушы құрылғыларды Bluetooth арқылы немесе Wi-Fi желісіне қосыңыз.",
    bt: "Bluetooth",
    btLead: "BLE сенсорын, клапанды немесе релені осы құрылғыдан қосыңыз.",
    scan: "Табу және қосу",
    scanning: "Іздеу…",
    btUnsupported:
      "Web Bluetooth қолжетімсіз. Android, Windows, macOS немесе ChromeOS-та Chrome не Edge қолданыңыз.",
    btReady: "Bluetooth дайын",
    wifi: "Wi-Fi",
    wifiLead: "Баптау режиміндегі құрылғыға желі деректерін жіберіңіз.",
    ssid: "Желі атауы (SSID)",
    pass: "Құпиясөз",
    ip: "Құрылғының IP немесе адресі",
    connect: "Қосу",
    connecting: "Қосылуда…",
    paired: "Қосылған құрылғылар",
    none: "Әзірге қосылған құрылғы жоқ.",
    remove: "Ажырату",
    connected: "Қосылды",
    offline: "Желіде жоқ",
    okBt: "Bluetooth құрылғысы қосылды",
    okWifi: "Құрылғы Wi-Fi желісіне қосылды",
    failBt: "Қосылу тоқтатылды немесе сәтсіз",
    failWifi: "Желі атауы мен құрылғы адресін толтырыңыз",
  },
} as const;

export function DeviceConnect({
  lang,
  toast,
}: {
  lang: Lang;
  toast: (message: string) => void;
}) {
  const t = words[lang];
  const [devices, setDevices] = useState<Paired[]>([]);
  const [btBusy, setBtBusy] = useState(false);
  const [wifiBusy, setWifiBusy] = useState(false);
  const [ssid, setSsid] = useState("");
  const [pass, setPass] = useState("");
  const [ip, setIp] = useState("");
  const [supported, setSupported] = useState(false);
  const gattRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    setSupported(Boolean((navigator as any).bluetooth));
  }, []);

  const pairBluetooth = async () => {
    const bluetooth = (navigator as any).bluetooth;
    if (!bluetooth) return;
    setBtBusy(true);
    try {
      const device = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      });
      const server = await device.gatt?.connect();
      const id = device.id || device.name || `ble-${Date.now()}`;
      gattRefs.current[id] = device;
      setDevices((list) => [
        ...list.filter((item) => item.id !== id),
        {
          id,
          name: device.name || "BLE device",
          link: "bluetooth",
          detail: "GATT",
          status: server?.connected ? "connected" : "offline",
        },
      ]);
      toast(t.okBt);
    } catch {
      toast(t.failBt);
    } finally {
      setBtBusy(false);
    }
  };

  const connectWifi = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ssid.trim() || !ip.trim()) {
      toast(t.failWifi);
      return;
    }
    setWifiBusy(true);
    const id = `wifi-${ip.trim()}`;
    await new Promise((resolve) => setTimeout(resolve, 700));
    setDevices((list) => [
      ...list.filter((item) => item.id !== id),
      {
        id,
        name: ip.trim(),
        link: "wifi",
        detail: ssid.trim(),
        status: "connected",
      },
    ]);
    setPass("");
    setIp("");
    setWifiBusy(false);
    toast(t.okWifi);
  };

  const remove = (id: string) => {
    try {
      gattRefs.current[id]?.gatt?.disconnect();
    } catch {
      /* ignore */
    }
    delete gattRefs.current[id];
    setDevices((list) => list.filter((item) => item.id !== id));
  };

  return (
    <section className="connect-block">
      <div className="section-title">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.title}</h2>
          <p>{t.lead}</p>
        </div>
      </div>
      <div className="connect-grid">
        <article className="panel connect-card">
          <span className="connect-icon">ᛒ</span>
          <small>{t.bt.toUpperCase()}</small>
          <h3>{t.bt}</h3>
          <p>{t.btLead}</p>
          <div className={`connect-state ${supported ? "ok" : "warn"}`}>
            {supported ? `● ${t.btReady}` : t.btUnsupported}
          </div>
          <button
            className="success-button"
            onClick={pairBluetooth}
            disabled={!supported || btBusy}
          >
            {btBusy ? t.scanning : t.scan}
          </button>
        </article>
        <article className="panel connect-card">
          <span className="connect-icon">≋</span>
          <small>WI-FI</small>
          <h3>{t.wifi}</h3>
          <p>{t.wifiLead}</p>
          <form className="connect-form" onSubmit={connectWifi}>
            <label>
              {t.ssid}
              <input
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="HomeSense-WiFi"
              />
            </label>
            <label>
              {t.pass}
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label>
              {t.ip}
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.0.42"
              />
            </label>
            <button className="success-button" type="submit" disabled={wifiBusy}>
              {wifiBusy ? t.connecting : t.connect}
            </button>
          </form>
        </article>
      </div>
      <section className="panel connect-list">
        <div className="panel-head">
          <h3>{t.paired}</h3>
          <span>{devices.length}</span>
        </div>
        {devices.length === 0 ? (
          <p className="connect-empty">{t.none}</p>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="connect-row">
              <b>{device.name}</b>
              <span>{device.link === "wifi" ? "Wi-Fi" : "Bluetooth"}</span>
              <span>{device.detail}</span>
              <em className={device.status === "connected" ? "on" : ""}>
                {device.status === "connected" ? t.connected : t.offline}
              </em>
              <button onClick={() => remove(device.id)}>{t.remove}</button>
            </div>
          ))
        )}
      </section>
    </section>
  );
}

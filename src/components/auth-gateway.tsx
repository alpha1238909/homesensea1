"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  Gauge,
  Languages,
  LockKeyhole,
  Waves,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TubesBackground } from "@/components/ui/neon-flow";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getLocalAuthSession,
  registerLocalAccount,
  signInLocalAccount,
  signOutLocalAccount,
  type LocalAuthUser,
} from "@/services/local-auth.service";
import {
  createLocalSnapshotAdapter,
  createSupabaseSnapshotAdapter,
} from "@/services/supabase-state.service";

type Lang = "en" | "ru" | "kz";
type Mode = "login" | "register";

const messages = {
  en: {
    eyebrow: "AI RESOURCE INTELLIGENCE",
    title: "Find the waste your home cannot show you.",
    lead: "HomeSense AI detects unnecessary water and electricity use, explains the cost and recommends automation only after the waste is proven.",
    proof: "Detect → Measure → Calculate → Prove → Automate → Save",
    detail:
      "One trusted view for cameras, sensors, utility meters and financial impact.",
    login: "Sign in",
    register: "Create account",
    welcome: "Welcome to HomeSense AI",
    accountLead: "Start with monitoring. Automate only what the data proves.",
    name: "Full name",
    email: "Email",
    password: "Password",
    submitLogin: "Sign in to dashboard",
    submitRegister: "Create monitoring account",
    google: "Continue with Google",
    divider: "or use email",
    loading: "Connecting securely…",
    confirmation:
      "Account created. Check your email to confirm registration, then sign in.",
    instantBadge: "INSTANT DEMO ACCESS · NO EMAIL CONFIRMATION",
    devicePrivacy:
      "This demo account is stored only in this browser. Your password is protected with a cryptographic hash and is never stored as plain text.",
    config:
      "Supabase is not configured yet. Add the project URL and publishable key to the environment.",
    privacy:
      "Your password is handled by Supabase Auth and is never stored by HomeSense AI.",
    signOut: "Sign out",
  },
  ru: {
    eyebrow: "AI-АНАЛИТИКА РЕСУРСОВ",
    title: "Найдите потери, которые не показывает ваш дом.",
    lead: "HomeSense AI выявляет лишний расход воды и электричества, объясняет его стоимость и предлагает автоматизацию только после доказанного перерасхода.",
    proof:
      "Обнаружить → Измерить → Рассчитать → Доказать → Автоматизировать → Экономить",
    detail:
      "Единая понятная система для камер, сенсоров, счётчиков и финансового результата.",
    login: "Войти",
    register: "Регистрация",
    welcome: "Добро пожаловать в HomeSense AI",
    accountLead:
      "Сначала мониторинг. Автоматизируем только то, что подтверждено данными.",
    name: "Имя и фамилия",
    email: "Электронная почта",
    password: "Пароль",
    submitLogin: "Войти в панель",
    submitRegister: "Создать аккаунт мониторинга",
    google: "Продолжить через Google",
    divider: "или войдите по почте",
    loading: "Безопасное подключение…",
    confirmation: "Аккаунт создан. Подтвердите почту по ссылке, затем войдите.",
    instantBadge: "МГНОВЕННЫЙ ДЕМО-ДОСТУП · БЕЗ ПИСЬМА",
    devicePrivacy:
      "Демо-аккаунт хранится только в этом браузере. Пароль защищён криптографическим хешем и не сохраняется открытым текстом.",
    config:
      "Supabase ещё не настроен. Добавьте URL проекта и публичный ключ в переменные окружения.",
    privacy: "Пароль обрабатывает Supabase Auth — HomeSense AI его не хранит.",
    signOut: "Выйти",
  },
  kz: {
    eyebrow: "РЕСУРСТАРДЫҢ AI-ТАЛДАУЫ",
    title: "Үйіңіз көрсетпейтін ысырапты табыңыз.",
    lead: "HomeSense AI су мен электр энергиясының артық шығынын анықтайды, оның құнын түсіндіреді және ысырап дәлелденгеннен кейін ғана автоматтандыруды ұсынады.",
    proof: "Анықтау → Өлшеу → Есептеу → Дәлелдеу → Автоматтандыру → Үнемдеу",
    detail:
      "Камералар, сенсорлар, есептегіштер және қаржылық нәтиже үшін бір түсінікті жүйе.",
    login: "Кіру",
    register: "Тіркелу",
    welcome: "HomeSense AI жүйесіне қош келдіңіз",
    accountLead:
      "Алдымен мониторинг. Тек дерек дәлелдеген нәрсені автоматтандырамыз.",
    name: "Аты-жөні",
    email: "Электрондық пошта",
    password: "Құпиясөз",
    submitLogin: "Басқару панеліне кіру",
    submitRegister: "Мониторинг аккаунтын құру",
    google: "Google арқылы жалғастыру",
    divider: "немесе пошта арқылы",
    loading: "Қауіпсіз қосылу…",
    confirmation: "Аккаунт құрылды. Поштаңызды растаңыз, содан кейін кіріңіз.",
    instantBadge: "ЖЕДЕЛ ДЕМО-КІРУ · ХАТСЫЗ РАСТАУ",
    devicePrivacy:
      "Демо аккаунт тек осы браузерде сақталады. Құпиясөз криптографиялық хешпен қорғалады және ашық түрде сақталмайды.",
    config:
      "Supabase әлі бапталмаған. Орта айнымалыларына жоба URL-ін және жария кілтті қосыңыз.",
    privacy: "Құпиясөзді Supabase Auth өңдейді — HomeSense AI оны сақтамайды.",
    signOut: "Шығу",
  },
} as const;

export function AuthGateway({
  supabaseUrl,
  supabasePublishableKey,
  dataMode: configuredDataMode,
  authMode: configuredAuthMode,
}: {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  dataMode?: string;
  authMode?: string;
}) {
  const supabase = useMemo(
    () =>
      getSupabaseBrowserClient({
        url: supabaseUrl,
        publishableKey: supabasePublishableKey,
      }),
    [supabasePublishableKey, supabaseUrl],
  );
  const authMode = configuredAuthMode === "supabase" ? "supabase" : "device";
  const [authUser, setAuthUser] = useState<LocalAuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ru";
    const saved = window.localStorage.getItem(
      "homesense-auth-lang",
    ) as Lang | null;
    return saved && messages[saved] ? saved : "ru";
  });
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = messages[lang];
  const dataMode =
    authMode === "supabase" && configuredDataMode === "supabase"
      ? "supabase"
      : "device";
  const snapshotAdapter = useMemo(() => {
    if (!authUser) return undefined;
    return dataMode === "supabase" && supabase
      ? createSupabaseSnapshotAdapter(supabase, authUser.id, authUser.email)
      : createLocalSnapshotAdapter(authUser.id);
  }, [authUser, dataMode, supabase]);

  useEffect(() => {
    if (authMode === "device") {
      let active = true;
      void Promise.resolve().then(() => {
        if (!active) return;
        setAuthUser(getLocalAuthSession());
        setReady(true);
      });
      return () => {
        active = false;
      };
    }
    if (!supabase) {
      let active = true;
      void Promise.resolve().then(() => {
        if (active) setReady(true);
      });
      return () => {
        active = false;
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setAuthUser(
        user
          ? {
              id: user.id,
              email: user.email ?? "",
              displayName:
                user.user_metadata?.['full_name'] ||
                user.email?.split("@")[0] ||
                "HomeSense user",
            }
          : null,
      );
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const user = nextSession?.user;
      setAuthUser(
        user
          ? {
              id: user.id,
              email: user.email ?? "",
              displayName:
                user.user_metadata?.['full_name'] ||
                user.email?.split("@")[0] ||
                "HomeSense user",
            }
          : null,
      );
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [authMode, supabase]);

  const changeLanguage = (next: Lang) => {
    setLang(next);
    window.localStorage.setItem("homesense-auth-lang", next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (authMode === "supabase" && !supabase) {
      setError(t.config);
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        if (authMode === "device") {
          const user = await registerLocalAccount({
            displayName: fullName,
            email,
            password,
          });
          setAuthUser(user);
          return;
        }
        if (!supabase) throw new Error(t.config);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) setSuccess(t.confirmation);
      } else {
        if (authMode === "device") {
          const user = await signInLocalAccount(email, password);
          setAuthUser(user);
          return;
        }
        if (!supabase) throw new Error(t.config);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Authentication failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError("");
    if (!supabase) {
      setError(t.config);
      return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
  };

  if (!ready) {
    return (
      <div className="auth-loading">
        <span />
        <b>{t.loading}</b>
      </div>
    );
  }

  if (authUser) {
    const handleSignOut = () => {
      if (authMode === "device") {
        signOutLocalAccount();
        setAuthUser(null);
        return;
      }
      void supabase?.auth.signOut();
    };
    return (
      <div className={`storage-mode-shell ${dataMode}`}>
        {dataMode === "device" && (
          <div className="storage-mode-notice" role="status">
            <span />
            {lang === "ru"
              ? "Демо-режим · данные сохраняются только в этом браузере"
              : lang === "kz"
                ? "Демо режим · деректер тек осы браузерде сақталады"
                : "Demo mode · data is saved only in this browser"}
          </div>
        )}
        <AppShell
          user={{ displayName: authUser.displayName, email: authUser.email }}
          stateAdapter={snapshotAdapter}
          onSignOut={handleSignOut}
          signOutLabel={t.signOut}
        />
      </div>
    );
  }

  return (
    <TubesBackground className="auth-landing">
      <div className="auth-page pointer-events-auto">
        <header className="auth-header">
          <a className="auth-brand" href="#top" aria-label="HomeSense AI">
            <span className="brand-mark">
              <i />
            </span>
            <b>HomeSense AI</b>
          </a>
          <div className="auth-language" aria-label="Language">
            <Languages size={16} aria-hidden="true" />
            {(["en", "ru", "kz"] as Lang[]).map((item) => (
              <button
                key={item}
                className={lang === item ? "active" : ""}
                onClick={() => changeLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main id="top" className="auth-main">
          <section className="auth-story">
            <span className="auth-eyebrow">
              <Waves size={17} />
              {t.eyebrow}
            </span>
            <h1>HomeSense AI</h1>
            <h2>{t.title}</h2>
            <p>{t.lead}</p>
            <div className="auth-proof">
              <Check size={18} />
              {t.proof}
            </div>
            <div className="auth-detail">
              <span>
                <Eye size={19} />
              </span>
              <div>
                <b>SEE → UNDERSTAND → SAVE</b>
                <p>{t.detail}</p>
              </div>
            </div>
          </section>

          <section className="auth-card" aria-labelledby="auth-title">
            <div className="auth-card-icon">
              <Gauge size={24} />
            </div>
            <h2 id="auth-title">{t.welcome}</h2>
            <p>{t.accountLead}</p>
            {authMode === "device" && (
              <div className="auth-mode-badge">
                <Check size={14} />
                {t.instantBadge}
              </div>
            )}
            <div className="auth-tabs" role="tablist">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                {t.login}
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                {t.register}
              </button>
            </div>

            {authMode === "supabase" && (
              <>
                <button
                  className="google-button"
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={busy || !supabase}
                >
                  <span className="google-g">G</span>
                  {t.google}
                </button>
                <div className="auth-divider">
                  <span />
                  {t.divider}
                  <span />
                </div>
              </>
            )}

            <form onSubmit={submit}>
              {mode === "register" && (
                <label>
                  {t.name}
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={2}
                    required
                    autoComplete="name"
                  />
                </label>
              )}
              <label>
                {t.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                {t.password}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>
              {error && (
                <div className="auth-message error" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="auth-message success" role="status">
                  {success}
                </div>
              )}
              <button
                className="auth-submit"
                disabled={busy || (authMode === "supabase" && !supabase)}
              >
                {busy
                  ? t.loading
                  : mode === "login"
                    ? t.submitLogin
                    : t.submitRegister}
                <ArrowRight size={18} />
              </button>
            </form>
            {authMode === "supabase" && !supabase && (
              <div className="auth-message warning">{t.config}</div>
            )}
            <small className="auth-privacy">
              <LockKeyhole size={14} />
              {authMode === "device" ? t.devicePrivacy : t.privacy}
            </small>
          </section>
        </main>
      </div>
    </TubesBackground>
  );
}

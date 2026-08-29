export interface LocalAuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface LocalAccount extends LocalAuthUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const ACCOUNTS_KEY = "homesense-demo-accounts:v1";
const SESSION_KEY = "homesense-demo-auth-session:v1";
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password: string, salt: Uint8Array) {
  const saltBuffer = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength,
  ) as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBuffer,
      iterations: 120_000,
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function readAccounts(): LocalAccount[] {
  try {
    const value = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value) as LocalAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Не удалось прочитать аккаунты из памяти браузера.");
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    throw new Error(
      "Браузер запретил сохранение. Отключите приватный режим и попробуйте снова.",
    );
  }
}

function writeSession(user: LocalAuthUser) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    throw new Error(
      "Браузер запретил вход. Разрешите хранение данных сайта и попробуйте снова.",
    );
  }
}

function safeUser(account: LocalAccount): LocalAuthUser {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
  };
}

export function getLocalAuthSession(): LocalAuthUser | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const user = JSON.parse(value) as LocalAuthUser;
    return user?.id && user?.email ? user : null;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function registerLocalAccount(input: {
  displayName: string;
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === email)) {
    throw new Error("Аккаунт с этой почтой уже зарегистрирован.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: LocalAccount = {
    id: crypto.randomUUID(),
    email,
    displayName,
    salt: bytesToBase64(salt),
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  const user = safeUser(account);
  writeSession(user);
  return user;
}

export async function signInLocalAccount(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email === email);
  if (!account) {
    throw new Error("Аккаунт не найден. Сначала зарегистрируйтесь.");
  }

  const passwordHash = await hashPassword(
    password,
    base64ToBytes(account.salt),
  );
  if (passwordHash !== account.passwordHash) {
    throw new Error("Неверный пароль.");
  }

  const user = safeUser(account);
  writeSession(user);
  return user;
}

export function signOutLocalAccount() {
  window.localStorage.removeItem(SESSION_KEY);
}

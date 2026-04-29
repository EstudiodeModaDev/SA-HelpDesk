import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";

let initialized = false;

export const msal = new PublicClientApplication({
  auth: {
    clientId: "0f12fae9-b308-4f77-9e4c-439c3608fa26",
    authority: 'https://login.microsoftonline.com/cd48ecd9-7e15-4f4b-97d9-ec813ee42b2c',
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: "localStorage" },
});

export async function initMSAL() {
  if (initialized) return;
  await msal.initialize();
  initialized = true;
}

const LOGIN_SCOPES = ['openid', 'profile', 'email', 'User.Read', 'Sites.ReadWrite.All','Directory.Read.All'];

export function ensureActiveAccount() {
  const acc = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (acc) msal.setActiveAccount(acc);
  return acc;
}


export async function ensureLogin(): Promise<AccountInfo> {
  await initMSAL();
  let account = ensureActiveAccount();

  if (!account) {
    const res = await msal.loginPopup({
      scopes: LOGIN_SCOPES,
      prompt: "select_account",
    });
    account = res.account ?? msal.getAllAccounts()[0]!;
    msal.setActiveAccount(account);
  }

  return account;
}

export async function getAccessTokenForScopes(scopes: string[]): Promise<string> {
  await initMSAL();
  const account = ensureActiveAccount();
  if (!account) throw new Error("No hay sesión. Llama a ensureLogin() primero.");

  try {
    const res = await msal.acquireTokenSilent({ scopes, account });
    return res.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      const res = await msal.acquireTokenPopup({ scopes, account });
      return res.accessToken;
    }
    throw e;
  }
}

export async function getAccessToken(): Promise<string> {
  return getAccessTokenForScopes(["User.Read"]);
}

export async function logout() {
  await initMSAL();
  const account = ensureActiveAccount();
  await msal.logoutPopup({ account });
}

export function isLoggedIn(): boolean {
  return !!(msal.getActiveAccount() ?? msal.getAllAccounts()[0]);
}
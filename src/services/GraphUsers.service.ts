import { getGraphToken } from "../Auth/token.service";


type GraphUserLite = {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
};

async function graphGet<T>(url: string): Promise<T> {
  const token = await getGraphToken();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ConsistencyLevel: "eventual",
    },
  });

  if (!res.ok) {
    throw new Error(`Graph ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as T;
}

export async function searchUsers(term: string): Promise<GraphUserLite[]> {
  const q = String(term ?? "").trim();
  if (!q) return [];

  const url =
    `https://graph.microsoft.com/v1.0/users` +
    `?$select=id,displayName,mail,userPrincipalName,jobTitle` +
    `&$search="displayName:${q}" OR "mail:${q}" OR "userPrincipalName:${q}"` +
    `&$top=20`;

  const data = await graphGet<{ value: GraphUserLite[] }>(url);
  return data?.value ?? [];
}

export async function getUserByEmail(email: string): Promise<GraphUserLite | null> {
  const q = email.replace(/'/g, "''");
  const url =
    `https://graph.microsoft.com/v1.0/users` +
    `?$select=id,displayName,mail,userPrincipalName,jobTitle` +
    `&$filter=mail eq '${q}' or userPrincipalName eq '${q}'`;

  const data = await graphGet<{ value: GraphUserLite[] }>(url);
  return data?.value?.[0] ?? null;
}
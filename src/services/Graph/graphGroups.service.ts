import { getAccessTokenForScopes } from "../../Auth/msal";

export async function getCurrentUserEntraGroupIds(): Promise<string[]> {
  const token = await getAccessTokenForScopes(["User.Read"]);
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me/transitiveMemberOf/microsoft.graph.group?$select=id",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`Graph ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { value: { id: string }[] };
  return (data.value ?? []).map((g) => g.id);
}

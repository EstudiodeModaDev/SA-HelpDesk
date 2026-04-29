import { SharePointRestClient } from "../../Api/Sharepoint/spClient";


const sp = new SharePointRestClient();

export async function getCurrentUserGroups() {
  console.log("started")
  const data = await sp.get<{ Groups: { Title: string }[] }>(
    "/_api/web/currentuser?$expand=Groups"
  );
  console.log(data)

  return data.Groups.map(g => g.Title);
}
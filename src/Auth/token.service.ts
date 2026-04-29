import { APP_CONFIG } from "../config/app.config";
import { getAccessTokenForScopes } from "./msal";

const tenantHost = `${APP_CONFIG.tenantName}.sharepoint.com`;

export const GRAPH_SCOPES = [
  "User.Read",
  "User.Read.All",
  "Directory.Read.All",
  "Mail.Send",
  "Sites.Manage.All"
];

export const SHAREPOINT_SCOPES = [`https://${tenantHost}/.default`];

export async function getGraphToken() {
  return getAccessTokenForScopes(GRAPH_SCOPES);
}

export async function getSharePointToken() {
  return getAccessTokenForScopes(SHAREPOINT_SCOPES);
}
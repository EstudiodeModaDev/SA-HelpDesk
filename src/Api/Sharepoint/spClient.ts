import { getSharePointToken } from "../../Auth/token.service";
import { APP_CONFIG } from "../../config/app.config";

type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH";

export class SharePointRestClient {
  private baseUrl = APP_CONFIG.sharePointSiteUrl;

  private async call<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const token = await getSharePointToken();
    const hasBody = body !== undefined && body !== null;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
        ...(hasBody ? { "Content-Type": "application/json;odata=nometadata" } : {}),
        ...(extraHeaders ?? {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`SharePoint ${method} ${path} -> ${res.status}: ${text || res.statusText}`);
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    if (!text) return undefined as T;

    return JSON.parse(text) as T;
  }

  get<T>(path: string) {
    return this.call<T>("GET", path);
  }

  post<T>(path: string, body?: unknown) {
    return this.call<T>("POST", path, body);
  }
}
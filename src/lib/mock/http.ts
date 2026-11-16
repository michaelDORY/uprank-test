import { getEnv } from "@/lib/env";
import { parseMockReferenceDateHeader } from "@/lib/reference-date";

export type MockFetchResult = {
  json: unknown;
  referenceDate: Date | null;
};

type MockApiKind = "billing" | "product";

export async function mockFetch(
  kind: MockApiKind,
  path: string,
): Promise<MockFetchResult> {
  const env = getEnv();
  const base =
    kind === "billing" ? env.BILLING_API_BASE_URL : env.PRODUCT_API_BASE_URL;
  const headers: HeadersInit =
    kind === "billing"
      ? {
          Authorization: `Bearer ${env.MOCK_API_KEY}`,
          Accept: "application/json",
        }
      : {
          "X-API-Key": env.MOCK_API_KEY,
          Accept: "application/json",
        };

  const response = await fetch(`${base}${path}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${kind} API ${response.status} for ${path}: ${body.slice(0, 300)}`,
    );
  }

  return {
    json: await response.json(),
    referenceDate: parseMockReferenceDateHeader(
      response.headers.get("X-Mock-Reference-Date"),
    ),
  };
}

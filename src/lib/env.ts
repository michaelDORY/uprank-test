import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MOCK_API_KEY: z.string().min(1),
  BILLING_API_BASE_URL: z
    .string()
    .url()
    .default("https://platform.up-rank.com.au/api/hiring-mock/v1"),
  PRODUCT_API_BASE_URL: z
    .string()
    .url()
    .default("https://platform.up-rank.com.au/api/hiring-mock"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    MOCK_API_KEY: process.env.MOCK_API_KEY,
    BILLING_API_BASE_URL: process.env.BILLING_API_BASE_URL,
    PRODUCT_API_BASE_URL: process.env.PRODUCT_API_BASE_URL,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  cached = parsed.data;
  return cached;
}

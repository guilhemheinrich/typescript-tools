import { z } from 'https://deno.land/x/zod/mod.ts';

const ConfigSchema = z.object({
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  GOOGLE_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URL: z.string(),
  PRACTITIONER_DOMAIN: z.string(),
  ENDUSER_DOMAIN: z.string(),
  STRIPE_TVA_ID: z.string(),
  STRIPE_ESSENTIAL_PRICE: z.string(),
  PUBLIC_PRACTITIONER_BUCKET: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  DISCORD_WEBHOOK_URL: z.string(),
  CPS_PAYMENT_CUT_PERCENTAGE: z.number(),
  SERVER_ROLE: z.union([
    z.literal('production'),
    z.literal('local'),
    z.literal('development'),
  ]),
});

export type Config = z.infer<typeof ConfigSchema>;
const rawConfig: Partial<Config> = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
  GOOGLE_API_KEY: Deno.env.get('GOOGLE_API_KEY'),
  GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_OAuth_client_id'),
  GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_OAuth_client_secret'),
  GOOGLE_REDIRECT_URL: Deno.env.get('GOOGLE_REDIRECT_URL'),
  PRACTITIONER_DOMAIN: Deno.env.get('PRACTITIONER_DOMAIN'),
  ENDUSER_DOMAIN: Deno.env.get('ENDUSER_DOMAIN'),
  STRIPE_TVA_ID: Deno.env.get('STRIPE_TVA_ID'),
  STRIPE_ESSENTIAL_PRICE: Deno.env.get('STRIPE_ESSENTIAL_PRICE'),
  PUBLIC_PRACTITIONER_BUCKET: Deno.env.get('PUBLIC_PRACTITIONER_BUCKET'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  DISCORD_WEBHOOK_URL: Deno.env.get('DISCORD_WEBHOOK_URL'),
  CPS_PAYMENT_CUT_PERCENTAGE: parseFloat(Deno.env.get('CPS_PAYMENT_CUT_PERCENTAGE') ?? '0'),
  SERVER_ROLE: Deno.env.get('SERVER_ROLE') as z.infer<
    typeof ConfigSchema
  >['SERVER_ROLE'],
};
export const Config = ConfigSchema.parse(rawConfig);
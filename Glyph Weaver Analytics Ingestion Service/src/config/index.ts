import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url({ message: "Invalid MONGO_URI" }),
  MONGO_DB_NAME: z.string().min(1, { message: "MONGO_DB_NAME cannot be empty" }),
  CORS_ORIGIN: z.string().url({ message: "Invalid CORS_ORIGIN URL" }).or(z.literal('*')).default('*'),
});

const parsedConfig = envSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsedConfig.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables');
}

export const config = Object.freeze(parsedConfig.data);
import { z } from 'zod';

const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['test', 'development', 'production'])
    .default('development'),
  PORT: z.string().default('3006'),

  // Database
  PGHOST: z.string().default('localhost'),
  PGPORT: z.string().default('5432'),
  PGDATABASE: z.string().default('catalogdb'),
  PGUSER: z.string().default('admin'),
  PGPASSWORD: z.string(),
  PGIDLE_TIMEOUT: z.string().default('0'),
  PGCONNECT_TIMEOUT: z.string().default('30'),

  // Docker Compose
  POSTGRES_DB: z.string().default('catalogdb'),
  POSTGRES_USER: z.string().default('admin'),
  POSTGRES_PASSWORD: z.string(),

  // Additional Elysia-specific variables
  ELYSIA_VERSION: z.string().default('0.0.0'),
  RUNTIME: z.enum(['bun', 'edge']).default('bun'),

  // Messaging
  RABBITMQ_URL: z.string().default('amqp://admin:password@localhost:5672'),
});

export const env = envSchema.parse(process.env);

export const DATABASE_URL = `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
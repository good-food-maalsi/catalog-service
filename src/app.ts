//import swagger from '@elysiajs/swagger';
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { AppRoutes } from "./app.routes.js";
import { env } from "./Utils/env.js";
import { startConsumer } from "./Messaging/rabbitmq.consumer.js";

const defaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
];

const allowedOrigins = env.CORS_ORIGINS?.length
    ? env.CORS_ORIGINS
    : env.NODE_ENV === "production"
      ? []
      : defaultOrigins;

const app = new Elysia({ prefix: "/catalog" })
    .use(
        cors({
            origin: allowedOrigins.length ? (allowedOrigins as string[]) : true,
            credentials: true,
        }),
    )
    /*    .use(logger())
    .use(
        swagger({
            exclude: ['/swagger'],
            autoDarkMode: true,
            documentation: {
                info: {
                    title: 'Elysia',
                    description: '',
                    version: '1.0.0',
                },
            },
        }),
    )
*/
    .use(AppRoutes);

app.listen({ port: env.PORT });

console.log(`🦊 Elysia is running`);

startConsumer().catch((err) =>
    console.error("[RabbitMQ] consumer init failed (non-fatal):", err),
);

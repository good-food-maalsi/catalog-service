//import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

import { AppRoutes } from './app.routes.js';
import { env } from './Utils/env.js';
import { startConsumer } from './Messaging/rabbitmq.consumer.js';

const app = new Elysia({ prefix: '/catalog' })
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

console.log(
    `🦊 Elysia is running`,
);

startConsumer().catch((err) =>
  console.error('[RabbitMQ] consumer init failed (non-fatal):', err)
);
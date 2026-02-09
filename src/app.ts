//import swagger from '@elysiajs/swagger';
import Elysia from 'elysia';

import { AppRoutes } from './app.routes';
import { env } from './Utils/env.ts';

const app = new Elysia()
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
import { Elysia } from 'elysia'
import prisma from '../Utils/prisma.js'

export const prismaPlugin = new Elysia({ name: 'prisma' })
    .decorate('db', prisma)
    .onStop(async () => {
        await prisma.$disconnect()
    })
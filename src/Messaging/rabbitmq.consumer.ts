import amqp from 'amqplib';
import { env } from '../Utils/env.js';
import prisma from '../Utils/prisma.js';
import { stockDeletedEventSchema } from '@good-food/contracts/events';

const EXCHANGE = 'franchise.events';
const QUEUE = 'catalog.stock.events';
const ROUTING_KEY = 'stock.deleted';

export async function startConsumer(): Promise<void> {
  const conn = await amqp.connect(env.RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
  channel.prefetch(1);

  console.log(`[RabbitMQ] Consumer listening on queue "${QUEUE}"`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const raw = JSON.parse(msg.content.toString());
      const event = stockDeletedEventSchema.parse(raw);

      const { count } = await prisma.dishIngredient.deleteMany({
        where: { stock_id: event.stock_id },
      });

      console.log(
        `[RabbitMQ] stock.deleted ${event.stock_id} → removed ${count} dish_ingredients`
      );
      channel.ack(msg);
    } catch (err) {
      console.error('[RabbitMQ] processing error:', err);
      channel.nack(msg, false, false);
    }
  });
}

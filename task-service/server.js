const express = require('express');
const amqp = require('amqplib');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const tasks = [];

const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:29092';
const kafka = new Kafka({
  clientId: 'task-service',
  brokers: [kafkaBrokers]
});
const producer = kafka.producer();

async function produceTaskCreatedEvent(task) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'task.created',
      messages: [{ value: JSON.stringify(task) }]
    });
    console.log('Produced task.created event to Kafka:', task);
    await producer.disconnect();
  } catch (error) {
    console.error('Error producing Kafka event:', error);
  }
}

async function subscribeToUserRegistered() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'user.registered';
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        console.log('Tasl Service received user.registered event:', event);
        const randomValue = Math.floor(Math.random() * 24) + 1;
        const idd = tasks.length + 1
        const task = {
          id: idd,
          userId: event.id,
          item: 'Welcome Package From Rabbit for Text of the task' + idd,
          amount: randomValue
        };
        tasks.push(task);
        await produceTaskCreatedEvent(task);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error subscribing to user.registered events:', error);
  }
}

subscribeToUserRegistered();

app.get('/task', (req, res) => {
  res.json(tasks);
});

app.listen(5000, () => {
  console.log('Task Service running on port 5000');
});

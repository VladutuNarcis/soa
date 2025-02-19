const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const port = 6000;

const taskAnalytics = [];

const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:29092';
const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: [kafkaBrokers]
});
const consumer = kafka.consumer({ groupId: 'analytics-group' });

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'task.created', fromBeginning: true });
  console.log('Analytics Service subscribed to Kafka topic: task.created');
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Analytics Service received event:', event);
      taskAnalytics.push(event);
    }
  });
}

runConsumer().catch(console.error);

app.get('/analytics/tasks', (req, res) => {
  const distinctUsers = new Set(taskAnalytics.map(o => o.userId)).size;
  const totalTasks = taskAnalytics.length;
  const totalValue = taskAnalytics.reduce((sum, task) => sum + task.amount, 0);
  const averageValue = totalTasks ? (totalValue / totalTasks) : 0;

  res.json({
    distinctUsers,
    totalTasks,
    totalValue,
    averageValue: Number(averageValue.toFixed(2)),
    tasks: taskAnalytics 
  });
});

app.listen(port, () => {
  console.log(`Analytics Service running on port ${port}`);
});

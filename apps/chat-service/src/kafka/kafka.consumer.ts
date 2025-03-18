import { Kafka } from "kafkajs";
import redisClient from "../config/redisClient";
import { sendMessageToWsServer } from "./kafka.producer";

const kafka = new Kafka({
  clientId: "chat-service-consumer",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "chat-service-group" });

const pendingRequests: Map<string, (serverId: string | null) => void> =
  new Map();

export const startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "get-user-server-response",
    fromBeginning: false,
  });
  await consumer.subscribe({ topic: "user-came-online", fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || "{}");

        if (topic === "get-user-server-response") {
          const { requestId, serverId } = data;
          console.log(`📩 Received WebSocket server response: ${serverId}`);

          if (pendingRequests.has(requestId)) {
            pendingRequests.get(requestId)?.(serverId);
            pendingRequests.delete(requestId);
          }
        } else if (topic === "user-came-online") {
          const { userId } = data;
          console.log(
            `🟢 User ${userId} is online. Checking for offline messages...`
          );

          // Deliver stored offline messages
          await processOfflineMessages(userId);
        }
      } catch (error) {
        console.error("❌ Error processing Kafka message:", error);
      }
    },
  });

  console.log(
    "✅ Kafka consumer started for handling WebSocket & user online events"
  );
};

export const addPendingRequest = (
  requestId: string,
  resolve: (serverId: string | null) => void
) => {
  pendingRequests.set(requestId, resolve);
};

// Process and Deliver Offline Messages
export const processOfflineMessages = async (userId: string) => {
  try {
    const messages = await redisClient.lRange(
      `offline-messages:${userId}`,
      0,
      -1
    );

    if (messages.length > 0) {
      console.log(
        `📨 Delivering ${messages.length} stored messages to user ${userId}`
      );

      for (const msg of messages) {
        const messageObj = JSON.parse(msg);

        // Send message to the WebSocket server (Replace with actual server ID)
        await sendMessageToWsServer(
          "ws-server-1",
          messageObj.senderId,
          messageObj.receiverId,
          messageObj.message
        );
      }

      // Clear stored messages after delivery
      await redisClient.del(`offline-messages:${userId}`);
      console.log(`✅ Cleared offline messages for user ${userId}`);
    }
  } catch (error) {
    console.error(
      `❌ Error processing offline messages for user ${userId}:`,
      error
    );
  }
};

import prisma from "@repo/prisma";
import { Kafka, Message } from "kafkajs";
import redisClient from "../config/redisClient";

const kafka = new Kafka({
  clientId: "chat-service-producer",
  brokers: ["process.env.KAFKA_BROKERS"],
});

const producer = kafka.producer();

export const startProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka producer connected in chat-service");
};

export const sendMessage = async (topic: string, messages: Message[]) => {
  try {
    await producer.send({
      topic,
      messages,
    });
  } catch (error) {
    console.error("❌ Error sending Kafka message:", error);
  }
};

/*
  Sends a message to specific ws-server
  @param serverId
  @params senderId
  @params reciverId
  @params message
*/

// Send message to the Reciver webSocket server

export const sendMessageToWsServer = async (
  serverId: string,
  senderId: string,
  receiverId: string,
  message: string
) => {
  const payload = {
    action: "deliver-message",
    senderId,
    receiverId,
    message,
    serverId,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check User Presence
    const userStatus = await redisClient.get("user:${receiverId}:status");

    if (userStatus === "online") {
      await sendMessage("ws-server-events", [
        {
          key: serverId,
          value: JSON.stringify(payload),
        },
      ]);

      console.log(
        `Kafka: Sent deliver-message event to ws-server ${serverId} for receiver ${receiverId}`
      );
    } else {
      // When user offline save the message to the Redis database
      console.log(
        `🚫 User ${receiverId} is offline. Storing message in Redis.`
      );

      const offlineMessage = {
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
      };

      // Save the message
      await redisClient.rPush(
        `offline-messages:${receiverId}`,
        JSON.stringify(offlineMessage)
      );

      console.log(`💾 Message stored for offline user ${receiverId}`);
    }
  } catch (error) {
    console.error("Error sending message to ws-server", error);
  }
};

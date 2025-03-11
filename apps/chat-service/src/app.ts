import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { addPendingRequest, startConsumer } from "./kafka/kafka.consumer";
import {
  sendMessage,
  sendMessageToWsServer,
  startProducer,
} from "./kafka/kafka.producer";
import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";

const app = express();

// kafka client setup
const kafka = new Kafka({
  clientId: "chat-sservice",
  brokers: ["process.env.KAFKA_BROKERS"],
});

const consumer = kafka.consumer({
  groupId: "chat-service-group",
});

// Using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Function to start all things
const startServices = async () => {
  await startProducer();
  await startConsumer();
  await consumeChatMessage();

  console.log("Chat service Started");
};

const consumeChatMessage = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "chat-messages",
    fromBeginning: true,
  });

  // TODO: Main message is now textMessage
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || "{}");
        const { senderId, receiverId, message: textMessage } = data; 

        console.log(
          `📩 Received chat message from ${senderId} → ${receiverId}: "${textMessage}"`
        );

        const requestId = uuidv4();
        await sendMessage("get-user-server-request", [
          {
            key: receiverId,
            value: JSON.stringify({
              requestId,
              receiverId,
            }),
          },
        ]);

        console.log(
          `🔍 Requested WebSocket server for receiver ${receiverId}...`
        );

        // ws-manager response wait
        addPendingRequest(requestId, async (serverId) => {
          if (!serverId) {
            console.log("🚫 No WebSocket server available for receiver.");
            return;
          }

          console.log(
            `📡 Receiver ${receiverId} is on WebSocket Server: ${serverId}`
          );

          // Send message to appropriate WebSocket server
          await sendMessageToWsServer(
            serverId,
            senderId,
            receiverId,
            textMessage
          );
        });
      } catch (error) {
        console.log("Error processing chat message", error);
      }
    },
  });
  console.log("Message Successfully Sent to the User");
};

// Define Routes here
export default app;

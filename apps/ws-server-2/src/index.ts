import { WebSocket, WebSocketServer } from "ws";
import { Kafka } from "kafkajs";

// Setup Kafka producer
const kafka = new Kafka({
  clientId: "ws-server-1",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Connected to Kafka Producer");
};

/**
 * Register User Event for ws-Manager
 * @param userId
 * @param serverId
 */

const sendRegisterEvent = async (userId: string, serverId: string) => {
  try {
    await producer.send({
      topic: "user-registration",
      messages: [
        {
          value: JSON.stringify({
            action: "register-user",
            userId,
            serverId,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(
      `Kafka: Sent register event for user ${userId} on server ${serverId}`
    );
  } catch (error) {
    console.error("Kafka: Failed to send register event", error);
  }
};

const sendChatMessageToKafka = async (
  senderId: string,
  receiverId: string,
  message: string
) => {
  try {
    await producer.send({
      topic: "chat-messages",
      messages: [
        {
          value: JSON.stringify({
            action: "send-message",
            senderId,
            receiverId,
            message,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Kafka: Sent chat message from ${senderId} to ${receiverId}`);
  } catch (error) {
    console.error("Kafka: Failed to send chat message", error);
  }
};

const clients = new Map<string, WebSocket>();

// Start the WebSocket server
export const startWebSocketServer = () => {
  const port = Number(process.env.PORT) || 9090;
  const wss = new WebSocketServer({ port });
  console.log(`WebSocket server running on port ${port}`);

  wss.on("connection", (ws, req) => {

    const url = new URL(req.url || "", "http://localhost");
    const userId = url.searchParams.get("userId");
    if (!userId) {
      ws.close();
      return;
    }

    console.log(`User ${userId} connected`);
    clients.set(userId, ws);

    ws.on("message", async (messageData) => {
      try {
        const parsed = JSON.parse(messageData.toString());
        const { receiverId, message } = parsed;
        if (!receiverId || !message) {
          console.error("Invalid message data received:", parsed);
          return;
        }
        console.log(
          `Received message from ${userId} for ${receiverId}: ${message}`
        );

        // Send the message to kafka for ChatService
        await sendChatMessageToKafka(userId, receiverId, message);
      } catch (error) {
        console.error("Error processing WebSocket message", error);
      }
    });

    ws.on("close", () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId);
    });
  });
};

const init = async () => {
  await connectKafkaProducer();
  startWebSocketServer();
};

init();

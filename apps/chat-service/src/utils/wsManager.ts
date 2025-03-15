import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "../kafka/kafka.producer";
import { addPendingRequest } from "../kafka/kafka.consumer";

export const getUserWsServer = async (
  userId: string
): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    const requestId = uuidv4();
    addPendingRequest(requestId, resolve);

    console.log(`📤 Requesting WebSocket server for user ${userId}`);

    try {
      await sendMessage("get-user-server-request", [
        {
          key: requestId,
          value: JSON.stringify({
            userId,
            requestId,
          }),
        },
      ]);

      // Maintain the Timeout logic for fetching the I'd
      setTimeout(() => {
        reject(new Error("WebSocket server request timed out"));
      }, 5000);
    } catch (error) {
      console.error("❌ Error sending Kafka message:", error);
      reject(error);
    }
  });
};

import { Request, Response } from "express";
import redisClient from "../config/redis";
import prisma from "@repo/prisma";
import apiResponse from "../utils/apiResponse";
import { Producer } from "kafkajs";
import { Kafka, Message } from "kafkajs";

const kafka = new Kafka({
  clientId: "user-service",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

const producer = kafka.producer();

const sendMessage = async (topic: string, messages: Message[]) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages,
    });
    await producer.disconnect();
  } catch (error) {
    console.error("Error sending Kafka message:", error);
  }
};

export const getUserPresence = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return apiResponse(res, 404, false, "Missing UserId");
    }

    // Got the status and lastseen and return
    const status = await redisClient.get(`user:${userId}:status`);
    const lastSeen = await redisClient.get(`user:{userId}:lastseen`);

    // send back the response
    return apiResponse(
      res,
      200,
      true,
      "User Status & lastSeen Fetched Successfully",
      {
        userId,
        status: status || "Offline",
        lastseen: lastSeen || null,
      }
    );
  } catch (error) {
    console.error("Failed to fetch presence statys", error);
    return apiResponse(res, 500, false, "Failed to fetch status");
  }
};

// When User is Online send the status to ChatService for offline messages Sending
export const setUserPresenceOnline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "online");

    // Updating the isActive
    await prisma.user.update({
      where: { userId },
      data: {
        isActive: true,
      },
    });

    // Notify chatService here
    await sendMessage("user-came-online", [
      { key: userId, value: JSON.stringify({ userId }) },
    ]);
  } catch (error) {
    console.error(`unable to fetch user presence online`, userId);
  }
};

export const setUserPresenceOffline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "offline");
    await redisClient.set(`user:${userId}:lastseen`, new Date().toISOString());

    // update to prisma
    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        isActive: false,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error("Unable to set presence offline", userId);
  }
};

import app from "./src/app";
import dotenv from "dotenv";
import prisma from "@repo/prisma";

dotenv.config();

const PORT = process.env.PORT || 6001;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};


// Starting the Server
startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

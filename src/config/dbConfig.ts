import { logger } from "../utils/logger";
import mongoose, { Connection } from "mongoose";

export const connectDB = async (): Promise<void> => {
  const DATABASE_URL = process.env.DATABASE_URL!;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing in environment variables.");
		logger.error("❌ DATABASE_URL is missing in environment variables.", { label: 'database' });
    process.exit(1);
  }

  try {
    await mongoose.connect(DATABASE_URL,{
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const connection: Connection = mongoose.connection;

    // Connected
    if (connection.readyState === 1) {
      console.log("✅ MongoDB connected successfully");
			logger.debug("✅ MongoDB connected successfully", { label: 'database' });
    }

    // Connection error listener
    connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", {label: 'database', err});
    });

    // Auto reconnect
    connection.on("disconnected", () => {
			logger.warn("⚠️ MongoDB disconnected. Attempting to reconnect...", { label: 'database' });
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await connection.close();
      console.log("🔌 MongoDB connection closed due to app termination");
			logger.debug("🔌 MongoDB connection closed due to app termination", { label: 'database' });
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
		logger.error("❌ MongoDB connection failed:", { label: 'database', error });
    process.exit(1);
  }
};



export const startSession = (): Promise<mongoose.ClientSession> => {
	return mongoose.startSession();
};

import mongoose from "mongoose";

let isConnected = false;
let lastConnectionError: string | null = null;

export function getLastConnectionError(): {
  error: string | null;
  isConnected: boolean;
  hasUri: boolean;
} {
  return {
    error: lastConnectionError,
    isConnected: mongoose.connection.readyState === 1,
    hasUri: !!process.env.MONGODB_URI,
  };
}

export async function connectDB(): Promise<boolean> {
  // Read ENV at runtime
  const MONGODB_URI = process.env.MONGODB_URI || "";

  console.log("DB URI inside connector =", MONGODB_URI ? "FOUND" : "MISSING");

  if (isConnected && mongoose.connection.readyState === 1) {
    lastConnectionError = null;
    return true;
  }

  if (!MONGODB_URI) {
    const warnMsg =
      "⚠️ MONGODB_URI has not been provided. Database operations will prompt settings setup.";

    console.warn(warnMsg);

    lastConnectionError =
      "MONGODB_URI environment variable is missing or empty.";

    isConnected = false;
    return false;
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    lastConnectionError = null;

    console.log("✅ MongoDB Atlas connected successfully using Mongoose.");

    return true;
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);

    lastConnectionError = error?.message || String(error);
    isConnected = false;

    return false;
  }
}
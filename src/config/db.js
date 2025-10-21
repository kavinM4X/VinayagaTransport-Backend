import mongoose from "mongoose";

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }
  mongoose.set("strictQuery", true);
  const dbName = process.env.MONGODB_DBNAME || process.env.DB_NAME || "transport";
  await mongoose.connect(mongoUri, { dbName });
  console.log("Connected to MongoDB");
}

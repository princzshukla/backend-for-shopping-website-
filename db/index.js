import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

function buildConnectionString(dbName = DB_NAME) {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  // If the value already has a proper scheme, use it (append DB name if missing)
  if (raw.startsWith("mongodb://") || raw.startsWith("mongodb+srv://")) {
    // avoid duplicate trailing slashes
    const base = raw.replace(/\/+$/, "");
    return base.includes(`/${dbName}`) ? base : `${base}/${dbName}`;
  }

  // Fallback: user provided host/cluster without scheme. Prepend mongodb+srv:// as a sensible default.
  return `mongodb+srv://${raw.replace(/\/+$/, "")}/${dbName}`;
}

const connectDB = async () => {
  try {
    const uri = buildConnectionString();
    const connectionInstance = await mongoose.connect(uri);

    console.log(
      `\n mongo_DB is connected to host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(
      "error while connecting to mongoDB:",
      error && error.message ? error.message : error
    );
    if (process.env.MONGODB_URI) {
      const sample = String(process.env.MONGODB_URI).slice(0, 60);
      console.error("MONGODB_URI (first 60 chars):", sample);
    } else {
      console.error(
        "MONGODB_URI is not defined in environment. Add it to your .env or environment variables."
      );
    }
    process.exit(1);
  }
};

export default connectDB;

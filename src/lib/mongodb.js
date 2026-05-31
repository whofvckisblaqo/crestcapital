// src/lib/mongodb.js — Mongoose connection singleton
// Re-uses the same connection across hot-reloads in development.
// Guard is inside connectDB() so the build doesn't fail when
// MONGODB_URI is not set (static page collection phase).

import mongoose from "mongoose";

// Cache the promise on the global object in dev to survive hot-reloads
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define MONGODB_URI in .env.local — copy .env.local.example to get started."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

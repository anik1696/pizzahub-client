import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function getDb() {
  if (!globalWithMongo._mongoClient) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = client.connect();
  }
  return globalWithMongo._mongoClient.db("pizzahub");
}

export const auth = betterAuth({
  database: mongodbAdapter(getDb()),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:5000",
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "customer", input: true },
      isBlocked: { type: "boolean", defaultValue: false },
      businessName: { type: "string", defaultValue: "", input: true },
      subscriptionPlan: { type: "string", defaultValue: "free" },
      subscriptionExpiresAt: { type: "string", defaultValue: null },
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
});

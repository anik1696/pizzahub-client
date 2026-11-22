import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const globalWithMongo = global as typeof globalThis & { _jwtMongo?: MongoClient };

async function getUsersCollection() {
  if (!globalWithMongo._jwtMongo) {
    globalWithMongo._jwtMongo = new MongoClient(process.env.MONGODB_URI!);
    await globalWithMongo._jwtMongo.connect();
  }
  return globalWithMongo._jwtMongo.db("pizzahub").collection("user");
}

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const col = await getUsersCollection();
    // Better Auth stores user IDs as plain strings (not ObjectId)
    // Try string _id first, then fall back to id field
    let user = await col.findOne({ _id: session.user.id } as never);
    if (!user) {
      user = await col.findOne({ id: session.user.id });
    }
    if (!user) {
      // If still not found, build a minimal user from session data
      // This handles the case where the user document structure differs
      user = {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: "customer",
        isBlocked: false,
        businessName: "",
        subscriptionPlan: "free",
      };
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "customer",
        isBlocked: user.isBlocked || false,
        subscriptionPlan: user.subscriptionPlan || "free",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role || "customer",
        isBlocked: user.isBlocked || false,
        businessName: user.businessName || "",
        subscriptionPlan: user.subscriptionPlan || "free",
      },
    });
  } catch (err) {
    console.error("JWT generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

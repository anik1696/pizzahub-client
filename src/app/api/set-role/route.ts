import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const globalWithMongo = global as typeof globalThis & { _setRoleMongo?: MongoClient };

async function getUsersCollection() {
  if (!globalWithMongo._setRoleMongo) {
    globalWithMongo._setRoleMongo = new MongoClient(process.env.MONGODB_URI!);
    await globalWithMongo._setRoleMongo.connect();
  }
  return globalWithMongo._setRoleMongo.db("pizzahub").collection("user");
}

// Called right after signUp.email() to persist the role and businessName
// Better Auth ignores additionalFields in signUp.email() in some versions
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { role, businessName } = body;

    if (!role || !["customer", "vendor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const col = await getUsersCollection();

    // Find the user by session ID or email
    const updateFields: Record<string, string> = { role };
    if (businessName && role === "vendor") {
      updateFields.businessName = businessName;
    }

    const result = await col.updateOne(
      {
        $or: [
          { _id: session.user.id } as never,
          { email: session.user.email },
        ],
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("set-role error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

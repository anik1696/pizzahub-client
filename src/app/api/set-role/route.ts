import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const globalWithMongo = global as typeof globalThis & { _setRoleMongo?: MongoClient };

async function getUsersCollection() {
  if (!globalWithMongo._setRoleMongo) {
    globalWithMongo._setRoleMongo = new MongoClient(process.env.MONGODB_URI!);
    await globalWithMongo._setRoleMongo.connect();
  }
  return globalWithMongo._setRoleMongo.db("pizzahub").collection("user");
}

// Called to persist role and businessName for any signup/switch (Email & Google)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, businessName, email: bodyEmail } = body;

    if (!role || !["customer", "vendor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Only customer or vendor permitted." }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    const targetEmail = session?.user?.email || bodyEmail;

    if (!targetEmail && !session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const col = await getUsersCollection();

    const idQueries: any[] = [];
    if (targetEmail) {
      idQueries.push({ email: targetEmail });
    }
    if (session?.user?.id) {
      try {
        idQueries.push({ _id: new ObjectId(session.user.id) });
      } catch (_) {}
      idQueries.push({ _id: session.user.id });
      idQueries.push({ id: session.user.id });
    }

    const existingUser = await col.findOne({ $or: idQueries });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Safety: Never overwrite an admin account's role
    if (existingUser.role === "admin") {
      return NextResponse.json({ message: "Admin role preserved", role: "admin" });
    }

    const updateFields: Record<string, string> = { role };
    if (businessName !== undefined) {
      updateFields.businessName = businessName;
    }

    await col.updateOne(
      { _id: existingUser._id },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("set-role error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const globalWithMongo = global as typeof globalThis & { _signupMongo?: MongoClient };

async function getCol() {
  if (!globalWithMongo._signupMongo) {
    globalWithMongo._signupMongo = new MongoClient(process.env.MONGODB_URI!);
    await globalWithMongo._signupMongo.connect();
  }
  return globalWithMongo._signupMongo.db("pizzahub").collection("user");
}

/**
 * Atomic signup route:
 *  1. Creates the user via Better Auth server API
 *  2. IMMEDIATELY sets the correct role in MongoDB within the same request
 *  3. Forwards all session cookies back to the client
 *
 * This replaces the broken two-step: signUp.email() → /api/set-role
 * Better Auth ignores additionalFields (role) on client signUp.email().
 * The callbackURL on client signUp also causes a redirect that aborts the
 * subsequent fetch to /api/set-role. This route solves both problems.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, businessName, image } = await req.json();

    // Validate role
    const safeRole = ["vendor", "customer"].includes(role) ? role : "customer";

    // Step 1 — Create user via Better Auth server-side API
    // asResponse:true gives us the raw Response so we can forward its cookies
    const authRes = await auth.api.signUpEmail({
      body: { name, email, password, image: image || "" },
      headers: req.headers,
      asResponse: true,
    } as any);

    if (!authRes.ok) {
      let errMsg = "Signup failed";
      try {
        const errData = await authRes.json();
        errMsg = errData?.message || errMsg;
      } catch (_) {}
      return NextResponse.json({ error: errMsg }, { status: authRes.status });
    }

    // Step 2 — Immediately patch role in DB (use email — always unique)
    // No session lookup needed; this runs in the same server request
    try {
      const col = await getCol();
      const updateDoc: Record<string, string> = { role: safeRole };
      if (businessName) updateDoc.businessName = businessName;
      await col.updateOne({ email }, { $set: updateDoc });
    } catch (dbErr) {
      console.error("Role patch failed after signup:", dbErr);
      // Don't block — user is created; they'll still be customer but can retry
    }

    // Step 3 — Forward the Better Auth response (which carries session cookies)
    const responseBody = await authRes.text();
    const forwarded = new NextResponse(responseBody, {
      status: authRes.status,
      headers: { "Content-Type": "application/json" },
    });

    // Copy all Set-Cookie headers from Better Auth response
    const setCookieValues = authRes.headers.getSetCookie
      ? authRes.headers.getSetCookie()
      : [authRes.headers.get("set-cookie")].filter(Boolean);

    for (const cookie of setCookieValues) {
      if (cookie) forwarded.headers.append("Set-Cookie", cookie);
    }

    return forwarded;
  } catch (err: any) {
    console.error("Atomic signup error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

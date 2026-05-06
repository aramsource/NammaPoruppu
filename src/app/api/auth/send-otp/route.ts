import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const phone = body?.phone as string | undefined;

  if (!phone) {
    return badRequest("phone is required");
  }

  return ok({
    message: "OTP sent",
    otpRequestId: `otp-${Date.now()}`,
  });
}

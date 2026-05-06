import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const otpRequestId = body?.otpRequestId as string | undefined;
  const otp = body?.otp as string | undefined;

  if (!otpRequestId || !otp) {
    return badRequest("otpRequestId and otp are required");
  }

  return ok({
    token: "mock-jwt-token",
    user: {
      id: "user-001",
      phone: "+91xxxxxxxxxx",
    },
  });
}

import { created } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;

  return created({
    reportId: id,
    message: "Support recorded",
  });
}

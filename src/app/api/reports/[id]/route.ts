import { ok } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return ok({ error: error.message }, { status: 500 });
  if (!data) return ok({ error: "Report not found" }, { status: 404 });
  return ok({ data });
}

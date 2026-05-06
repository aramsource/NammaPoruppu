import { ok } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const [{ data: ward, error: wardErr }, { data: reports, error: reportsErr }] = await Promise.all([
    supabase.from("wards").select("*").eq("id", id).maybeSingle(),
    supabase.from("reports").select("*").eq("ward_id", id),
  ]);
  if (wardErr) return ok({ error: wardErr.message }, { status: 500 });
  if (reportsErr) return ok({ error: reportsErr.message }, { status: 500 });
  if (!ward) return ok({ error: "Ward not found" }, { status: 404 });
  const rows = reports ?? [];
  return ok({
    data: ward,
    metrics: {
      totalOpenIssues: rows.filter((report) => report.status === "open").length,
      topIssueCategories: rows.slice(0, 3).map((report) => report.category),
      mostSupportedIssues: rows
        .slice()
        .sort((a, b) => (b.support_count ?? 0) - (a.support_count ?? 0))
        .slice(0, 5),
    },
  });
}

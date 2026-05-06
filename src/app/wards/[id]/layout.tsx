import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createSupabaseServerClient();
    const { data: ward } = await supabase
      .from("wards")
      .select("ward_name, ward_number, zone_name")
      .eq("id", id)
      .maybeSingle();
    if (ward) {
      const title = `Ward ${ward.ward_number} – ${ward.ward_name}`;
      const description = `Civic issues, resolution rates, and local representatives for Ward ${ward.ward_number} (${ward.ward_name}), ${ward.zone_name} Zone, Chennai.`;
      return {
        title,
        description,
        openGraph: { title, description },
        twitter: { title, description },
      };
    }
  } catch {
    // Fall through to default
  }
  return { title: "Ward Dashboard" };
}

export default function WardLayout({ children }: Props) {
  return <>{children}</>;
}

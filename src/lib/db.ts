import { createSupabaseServerClient } from "@/lib/supabase";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { user, supabase };
}

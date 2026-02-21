"use server";

import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { DEFAULT_PRESUPPOSITIONS, FOUNDATIONAL_NODES } from "@/lib/constants";
import { foundationPosition } from "@/lib/foundation-layout";
import { defaultSystemTiers, FOUNDATIONAL_TIER_ID } from "@/lib/tiers";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  let authError;

  if (user?.is_anonymous) {
    const { error } = await supabase.auth.updateUser({ email, password });
    authError = error;
  } else {
    const { error } = await supabase.auth.signUp({ email, password });
    authError = error;
  }

  if (authError) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(authError.message)}`);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/sign-up?message=We've+sent+a+confirmation+link+to+your+email.+Please+check+your+inbox+to+activate+your+account.");
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

export async function continueWithoutAccountAction() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error?.message ?? "Failed to sign in as guest")}`);
  }

  const { data: system, error: insertError } = await supabase
    .from("systems")
    .insert({
      user_id: data.user.id,
      title: "Untitled System",
      presuppositions: DEFAULT_PRESUPPOSITIONS,
      tiers: defaultSystemTiers(),
    })
    .select("*")
    .single();

  if (insertError || !system) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(insertError?.message ?? "Failed to create guest system")}`);
  }

  const seeded = FOUNDATIONAL_NODES.map((title, idx) => {
    const pos = foundationPosition(idx, FOUNDATIONAL_NODES.length, defaultSystemTiers());
    return {
      system_id: system.id,
      tier_id: FOUNDATIONAL_TIER_ID,
      title,
      description: "",
      notes: "",
      is_locked: true,
      x_position: pos.x,
      y_position: pos.y,
    };
  });

  await supabase.from("nodes").insert(seeded);

  redirect(`/systems/${system.id}/templates`);
}

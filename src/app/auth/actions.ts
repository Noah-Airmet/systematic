"use server";

import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

export async function continueWithoutAccountAction() {
  if (process.env.NODE_ENV === "production") {
    redirect("/auth/sign-in?error=Guest+mode+is+disabled+in+production");
  }

  const email = `guest-${randomUUID()}@systematic.local`;
  const password = `Guest-${randomUUID()}-A1!`;

  const admin = createSupabaseAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { guest: true },
  });

  if (createError) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(createError.message)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(signInError.message)}`);
  }

  redirect("/dashboard");
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { CreateSystemForm } from "@/components/dashboard/create-system-form";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: systems } = await supabase
    .from("systems")
    .select("id,title,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#060a12] px-6 py-10 text-[#e9efff]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(108,127,255,0.17),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(67,171,255,0.1),transparent_45%)]" />
      <div className="relative mx-auto w-full max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Systematic</h1>
          <p className="text-sm text-[#9fb0d0]">Build and validate your theology graph.</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </header>

      <section className="mb-8 rounded-2xl border border-[#2c3a54] bg-[#0c1321]/90 p-5 backdrop-blur">
        <h2 className="mb-3 text-lg font-semibold">Create a new System</h2>
        <CreateSystemForm />
      </section>

      <section className="rounded-2xl border border-[#2c3a54] bg-[#0c1321]/90 p-5 backdrop-blur">
        <h2 className="mb-3 text-lg font-semibold">Your Systems</h2>
        {!systems?.length ? <p className="text-sm text-[#9fb0d0]">No systems yet.</p> : null}
        <div className="space-y-2">
          {systems?.map((system) => (
            <Link
              key={system.id}
              href={`/systems/${system.id}/canvas`}
              className="block rounded-xl border border-[#2d3b55] bg-[#0b1220] p-3 transition hover:border-[#4c6aa1] hover:bg-[#111b2f]"
            >
              <div className="font-semibold">{system.title}</div>
              <div className="text-xs text-[#98aacc]">
                Last modified: {new Date(system.updated_at).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}

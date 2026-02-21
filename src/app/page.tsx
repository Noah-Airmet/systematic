import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { CursorTrace } from "@/components/landing/cursor-trace";
import { AiEdgeGlow } from "@/components/ui/ai-edge-glow";
import { Layers, Network, Scale } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase";
import { continueWithoutAccountAction } from "@/app/auth/actions";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden text-[#ecf1ff]">
      <AiEdgeGlow />
      <CursorTrace />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(126,147,255,0.26),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(80,177,255,0.2),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 text-center">
        <p className="type-kicker text-[#8f9dbf]">Interactive Theology Studio</p>
        <h1 className={`${bodoni.className} text-[clamp(4rem,16vw,10rem)] leading-[0.92] tracking-[0.06em] drop-shadow-[0_18px_35px_rgba(124,151,235,0.4)]`}>
          Systematic
        </h1>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-2 mb-4">
          <div className="group relative flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(124,151,235,0.15)]">
            <div className="rounded-full bg-[#8eb3ff]/10 p-4 text-[#8f9dbf] transition-colors group-hover:bg-[#8eb3ff]/20 group-hover:text-[#6ea2ff]">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#d9e5ff]">Build Structure</h3>
              <p className="text-sm leading-relaxed text-[#8f9dbf]">
                Build convictions as firm architectural structure rather than isolated thoughts.
              </p>
            </div>
          </div>

          <div className="group relative flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(124,151,235,0.15)]">
            <div className="rounded-full bg-[#8eb3ff]/10 p-4 text-[#8f9dbf] transition-colors group-hover:bg-[#8eb3ff]/20 group-hover:text-[#6ea2ff]">
              <Network className="h-7 w-7" />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#d9e5ff]">Map Doctrine</h3>
              <p className="text-sm leading-relaxed text-[#8f9dbf]">
                Connect the dots. Map doctrine and theology as a living, interconnected graph.
              </p>
            </div>
          </div>

          <div className="group relative flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(124,151,235,0.15)]">
            <div className="rounded-full bg-[#8eb3ff]/10 p-4 text-[#8f9dbf] transition-colors group-hover:bg-[#8eb3ff]/20 group-hover:text-[#6ea2ff]">
              <Scale className="h-7 w-7" />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#d9e5ff]">Stress-Test</h3>
              <p className="text-sm leading-relaxed text-[#8f9dbf]">
                Stress-test consistency and theological soundness without losing nuance.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {user && !user.is_anonymous ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-[#8eb3ff] bg-[linear-gradient(120deg,#6ea2ff,#8195ff)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(64,113,255,0.35)] transition hover:translate-y-[-1px] hover:brightness-110"
            >
              Go To Dashboard
            </Link>
          ) : (
            <>
              <form action={continueWithoutAccountAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--border)] bg-[rgba(186,207,255,0.08)] px-6 py-3 text-sm font-semibold text-[#d9e5ff] backdrop-blur-md transition hover:bg-[rgba(186,207,255,0.16)]"
                >
                  Continue without account
                </button>
              </form>
              <Link
                href="/auth/sign-up"
                className="rounded-full border border-[#8eb3ff] bg-[linear-gradient(120deg,#6ea2ff,#8195ff)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(64,113,255,0.35)] transition hover:translate-y-[-1px] hover:brightness-110"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { continueWithoutAccountAction, signInAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiEdgeGlow } from "@/components/ui/ai-edge-glow";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060a12] px-6 text-[#ecf1ff]">
      <AiEdgeGlow />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(108,127,255,0.2),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(67,171,255,0.12),transparent_45%)]" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#2d3b55] bg-[#0b1220]/90 p-7 backdrop-blur">
        <h1 className="mb-1 text-3xl font-semibold">Sign in</h1>
        <p className="mb-4 text-sm text-[#a8b6d7]">Return to your theology workspace.</p>
        {params.error ? (
          <p className="mb-3 rounded-md border border-[#6b2f3d] bg-[#2b121a] px-3 py-2 text-sm text-[#ffb7c2]">
            {params.error}
          </p>
        ) : null}
        <form action={signInAction} className="space-y-3 rounded-2xl border border-[#26354c] bg-[#0d1627] p-4">
          <label className="text-sm">Email</label>
          <Input name="email" type="email" required />
          <label className="text-sm">Password</label>
          <Input name="password" type="password" required />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-3 text-sm text-[#a8b6d7]">
          Need an account?{" "}
          <Link className="text-[#8eb8ff] underline underline-offset-2" href="/auth/sign-up">
            Create one
          </Link>
        </p>
        <form action={continueWithoutAccountAction} className="mt-3">
          <Button type="submit" variant="secondary" className="w-full">
            Continue without an account
          </Button>
        </form>
      </div>
    </main>
  );
}

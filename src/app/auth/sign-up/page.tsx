import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060a12] px-6 text-[#ecf1ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(108,127,255,0.2),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(67,171,255,0.12),transparent_45%)]" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#2d3b55] bg-[#0b1220]/90 p-7 backdrop-blur">
        <h1 className="mb-1 text-3xl font-semibold">Create account</h1>
        <p className="mb-4 text-sm text-[#a8b6d7]">Start a new systematic theology workspace.</p>

        {params.error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-300">
            {params.message}
          </div>
        )}

        <form action={signUpAction} className="space-y-3 rounded-2xl border border-[#26354c] bg-[#0d1627] p-4">
          <label className="text-sm">Email</label>
          <Input name="email" type="email" required />
          <label className="text-sm">Password</label>
          <Input name="password" type="password" required minLength={8} />
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
        <p className="mt-3 text-sm text-[#a8b6d7]">
          Already have an account?{" "}
          <Link className="text-[#8eb8ff] underline underline-offset-2" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

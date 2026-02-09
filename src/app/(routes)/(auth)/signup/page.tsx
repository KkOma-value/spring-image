import { type Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./form";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden cny-background text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/80 via-red-900/60 to-red-950/80" />
      <div className="absolute -left-24 top-28 h-56 w-56 rounded-full bg-cny-gold/10 blur-3xl" />
      <div className="absolute -right-28 bottom-20 h-64 w-64 rounded-full bg-cny-red/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-16">
        <div className="glass-panel flex w-full max-w-md flex-col rounded-3xl border border-cny-gold/30 px-8 py-10 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cny-gold/20 text-cny-gold">
              SF
            </div>
            <h1 className="text-3xl font-serif font-bold text-cny-gold">Sign Up</h1>
            <p className="mt-2 text-sm text-white/70">
              Create your Spring Festival AI account.
            </p>
          </div>

          <SignUpForm />

          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <span>Already have an account?</span>
            <Link href="/signin" className="font-semibold text-cny-gold hover:text-yellow-200">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

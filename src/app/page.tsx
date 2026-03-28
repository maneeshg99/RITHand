"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, signInWithMagicLink } from "./login/actions";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn(email, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInWithMagicLink(email);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setMagicLinkSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">RITHand</span>
          </div>
          <p className="text-muted-foreground">
            Right IT Hand — Your vendor intelligence dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {magicLinkSent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 [data-theme='dark']:bg-green-900/20 [data-theme='dark']:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 [data-theme='dark']:text-green-400">
                    Magic link sent!
                  </p>
                  <p className="text-xs text-green-600 [data-theme='dark']:text-green-500">
                    Check your email for a sign-in link
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setEmail("");
                }}
                className="w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-foreground mb-6">
                Sign In
              </h1>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3 mb-6 [data-theme='dark']:bg-red-900/20 [data-theme='dark']:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 [data-theme='dark']:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <form
                onSubmit={
                  useMagicLink ? handleMagicLinkSignIn : handlePasswordSignIn
                }
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com or username"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    required
                  />
                </div>

                {!useMagicLink && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Signing in..."
                    : useMagicLink
                      ? "Send Magic Link"
                      : "Sign In"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setUseMagicLink(!useMagicLink);
                  setPassword("");
                  setError("");
                }}
                className="w-full px-4 py-2.5 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition"
              >
                {useMagicLink
                  ? "Use Password Instead"
                  : "Sign in with Magic Link"}
              </button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:opacity-80 transition font-medium"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/about" className="hover:text-foreground transition">
            Learn more about RITHand
          </Link>
        </p>
      </div>
    </div>
  );
}

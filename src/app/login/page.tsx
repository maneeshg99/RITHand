"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, signInWithMagicLink } from "./actions";

export default function LoginPage() {
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
    // If no error, signIn will redirect
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">RITHand</span>
          </div>
          <p className="text-slate-400">Right IT Hand — Your vendor intelligence dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
          {magicLinkSent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Magic link sent!</p>
                  <p className="text-xs text-green-300/80">Check your email for a sign-in link</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setEmail("");
                }}
                className="w-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white mb-6">Sign In</h1>

              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form
                onSubmit={useMagicLink ? handleMagicLinkSignIn : handlePasswordSignIn}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com or username"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {!useMagicLink && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : useMagicLink ? "Send Magic Link" : "Sign In"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/50 text-slate-400">or</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setUseMagicLink(!useMagicLink);
                  setPassword("");
                  setError("");
                }}
                className="w-full px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-lg font-medium transition"
              >
                {useMagicLink ? "Use Password Instead" : "Sign in with Magic Link"}
              </button>

              <p className="text-center text-sm text-slate-400 mt-6">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition font-medium">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

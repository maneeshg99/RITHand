"use client";

import Link from "next/link";
import {
  Monitor,
  AlertTriangle,
  Shield,
  Calendar,
  Users,
  Lock,
  Zap,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header / Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">RITHand</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">
              Features
            </a>
            <a href="#personas" className="text-slate-300 hover:text-white transition">
              For You
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white transition text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Stop chasing vendor alerts.
              <span className="text-blue-500"> Start staying ahead of them.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Aggregate vendor intelligence from 28+ technology partners in one
              unified dashboard. Monitor CVEs, compliance requirements, and EOL
              dates without the alert fatigue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-center"
              >
                Start for Free
              </Link>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 border border-slate-600 hover:border-slate-400 text-white rounded-lg font-medium transition text-center"
              >
                See How It Works
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-slate-700 p-8 md:p-12">
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <Monitor className="h-16 w-16 text-slate-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Your vendor stack is a full-time job
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Vendor Sprawl</h3>
              <p className="text-slate-400">
                Managing notifications from 20+ vendors across different
                channels is chaotic and error-prone.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <Zap className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Alert Fatigue</h3>
              <p className="text-slate-400">
                Critical CVEs get buried in noise. Noise gets ignored. Critical
                issues slip through the cracks.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <Lock className="h-8 w-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Compliance Chaos
              </h3>
              <p className="text-slate-400">
                Tracking multiple compliance frameworks across your vendor
                portfolio is fragmented and manual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Built for IT leadership
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <Monitor className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Unified Vendor Feed
            </h3>
            <p className="text-slate-400 text-sm">
              Monitor 28+ vendors in one place. Filter by vendor, category, or
              severity.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              CVE & Security Alerts
            </h3>
            <p className="text-slate-400 text-sm">
              Get notified of critical vulnerabilities with severity scoring
              and affected products.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <Shield className="h-8 w-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Compliance Tracking
            </h3>
            <p className="text-slate-400 text-sm">
              Track CIS, NIST, CMMC, HIPAA, GDPR, ISO 27001. Checklist format,
              audit-ready.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <Calendar className="h-8 w-8 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              EOL Management
            </h3>
            <p className="text-slate-400 text-sm">
              Never miss an end-of-life date. Get ahead of support expirations
              and patch deadlines.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <TrendingUp className="h-8 w-8 text-cyan-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Bookmark & Triage
            </h3>
            <p className="text-slate-400 text-sm">
              Save items for follow-up. Mark as read. Organize by priority for
              your team.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition">
            <Users className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Multi-User Teams
            </h3>
            <p className="text-slate-400 text-sm">
              Invite your team, share vendor selections, and stay in sync
              across your organization.
            </p>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section id="personas" className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Built for IT professionals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">IT Director</h3>
              <p className="text-slate-400 text-sm">
                Oversee the entire vendor portfolio, track compliance, and keep
                executive stakeholders informed.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">vCIO</h3>
              <p className="text-slate-400 text-sm">
                Advise on vendor selection, risk assessment, and strategic
                technology planning.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">vCISO</h3>
              <p className="text-slate-400 text-sm">
                Manage security risks, track CVEs, ensure compliance readiness,
                and respond to incidents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Simple, transparent pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for getting started</p>
            <div className="text-3xl font-bold text-white mb-6">
              $0<span className="text-lg text-slate-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "1 user",
                "Up to 5 vendors",
                "Basic news feed",
                "Read/bookmark features",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-white rounded-lg font-medium transition text-center"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-blue-500/10 rounded-lg border border-blue-500/50 p-8 flex flex-col ring-1 ring-blue-500/20">
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-slate-400 text-sm mb-6">For growing teams</p>
            <div className="text-3xl font-bold text-white mb-6">
              $199<span className="text-lg text-slate-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Unlimited users",
                "All 28+ vendors",
                "Full CVE coverage",
                "Compliance checklists (CIS, NIST, CMMC, HIPAA, GDPR, ISO 27001)",
                "Email alerts",
                "Advanced filtering & search",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-center"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
            <p className="text-slate-400 text-sm mb-6">Custom solutions</p>
            <div className="text-3xl font-bold text-white mb-6">
              Custom<span className="text-lg text-slate-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in Pro",
                "White-label dashboard",
                "API access",
                "SSO/SAML",
                "Dedicated support",
                "Custom integrations",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-white rounded-lg font-medium transition">
              Contact Sales
            </button>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-8">
          Pricing coming soon — contact us for early access
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-white">RITHand</span>
            </div>
            <div className="flex gap-6 md:justify-end">
              <a href="#" className="text-slate-400 hover:text-white transition text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition text-sm">
                Contact
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2026 RITHand. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

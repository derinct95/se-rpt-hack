import { Activity, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { DEMO_PASSWORD, FALLBACK_DEMO_ACCOUNTS } from "../../config/demoAccounts";
import type { DemoAccount } from "../../types";
import SyntheticDataBadge from "../common/SyntheticDataBadge";
import DemoAccountCard from "./DemoAccountCard";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<DemoAccount[]>(FALLBACK_DEMO_ACCOUNTS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDemoAccounts().then(setAccounts).catch(() => {});
  }, []);

  async function signInAs(account: DemoAccount) {
    setSubmitting(true);
    setError(null);
    try {
      await login(account.email, DEMO_PASSWORD, account.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email || "demo@clearviewmedicalgroup.demo", password || "demo");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-plane flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-chart-1 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-ink-primary">Clearview Medical Group</span>
        </div>

        <div className="bg-surface border border-ink-primary/10 rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-semibold text-ink-primary mb-1">Sign in</h1>
          <p className="text-sm text-ink-secondary mb-5">
            Access the provider performance analytics dashboard.
          </p>

          <div className="space-y-2">
            {accounts.map((account) => (
              <DemoAccountCard key={account.id} account={account} onSelect={() => signInAs(account)} disabled={submitting} />
            ))}
          </div>

          {error && <p className="text-sm text-risk-critical mt-3">{error}</p>}

          <details className="mt-5 group">
            <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink-secondary select-none">
              Use a different account
            </summary>
            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clearviewmedicalgroup.demo"
                className="w-full rounded-lg border border-line-axis px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-chart-1/40"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any password"
                className="w-full rounded-lg border border-line-axis px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-chart-1/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-ink-primary text-white py-2.5 text-sm font-medium hover:bg-ink-primary/90 transition disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </details>
        </div>

        <div className="mt-6">
          <SyntheticDataBadge variant="banner" />
        </div>
      </div>
    </div>
  );
}

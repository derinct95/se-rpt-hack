import type { DemoAccount } from "../types";

export const FALLBACK_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "usr-admin",
    email: "admin@clearviewmedicalgroup.demo",
    displayName: "Practice Administrator",
    role: "practice_admin",
    description: "Full access to every provider, report, and admin action.",
  },
  {
    id: "usr-analyst",
    email: "analyst@clearviewmedicalgroup.demo",
    displayName: "Clinical Analyst",
    role: "clinical_analyst",
    description: "Reviews performance data and generates reports.",
  },
];

export const DEMO_PASSWORD = "demo";

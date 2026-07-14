import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import type { ReactNode } from "react";

function Glossary({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="text-left">
      <p className="text-sm font-semibold text-ink-primary mb-1">{term}</p>
      <p className="text-xs text-ink-secondary leading-relaxed">{children}</p>
    </div>
  );
}

const STEPS: Step[] = [
  {
    target: '[data-tour="kpi-row"]',
    content: (
      <Glossary term="KPI Row">
        The four practice-wide numbers that matter most: total providers, average performance score,
        how many are at critical/high risk, and your current top performer.
      </Glossary>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour="ai-insights"]',
    content: (
      <Glossary term="AI Proactive Insights">
        Claude reasons over every provider's live metrics -- not just min/max -- to surface the most
        important revenue risks and standout performers. Falls back to rule-based analysis if AI is unavailable.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="recent-panels"]',
    content: (
      <Glossary term="Recently Viewed & Recent Activity">
        Recently Viewed remembers the providers you've opened. Recent Activity shows the emails and
        appointments you've logged, most recent first -- both are one click back to where you left off.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="quick-nav"]',
    content: (
      <Glossary term="Quick Nav (Ctrl K)">
        Press Ctrl+K (⌘K on Mac) anytime to jump straight to any provider or dashboard section without scrolling.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="provider-filters"]',
    content: (
      <Glossary term="Department / Risk / Quality Filters">
        Narrow the roster by specialty, risk level, or performance band. Combine with the Flagged tab
        to focus on just the providers awaiting review.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="compare-toggle"]',
    content: (
      <Glossary term="Compare">
        Toggle up to 4 providers here to open a side-by-side comparison: scores, a full metrics table,
        and an overlaid radar chart -- with group email and scheduling built in.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="open-actions"]',
    content: (
      <Glossary term="Open Actions">
        A running count of unresolved recommendations (denial reviews, coding audits, and similar) for
        each provider. Click it to jump straight into their Actions tab.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="export-import"]',
    content: (
      <Glossary term="Export / Import">
        Export the roster (or just the flagged list) to CSV, or import new providers from a CSV, FHIR
        bundle, or HL7v2 message -- the wizard auto-detects the format and previews it before committing.
      </Glossary>
    ),
  },
  {
    target: '[data-tour="help-menu"]',
    content: (
      <Glossary term="Help Menu">
        Replay this tour or open the full feature guide anytime from here. Click any provider row to
        explore their Overview, Metrics (with weekly/monthly/quarterly/yearly views), Claims History, and Actions.
      </Glossary>
    ),
  },
];

interface ProductTourProps {
  run: boolean;
  onFinish: () => void;
}

export default function ProductTour({ run, onFinish }: ProductTourProps) {
  function handleCallback(data: CallBackProps) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      onFinish();
    }
  }

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableScrolling={false}
      spotlightPadding={6}
      callback={handleCallback}
      locale={{ back: "Back", close: "Close", last: "Done", next: "Next", skip: "Skip tour" }}
      styles={{
        options: {
          primaryColor: "#2a78d6",
          textColor: "#0b0b0b",
          backgroundColor: "#fcfcfb",
          arrowColor: "#fcfcfb",
          overlayColor: "rgba(11, 11, 11, 0.5)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 16,
        },
        buttonNext: {
          borderRadius: 8,
          padding: "8px 14px",
        },
        buttonSkip: {
          color: "#898781",
        },
      }}
    />
  );
}

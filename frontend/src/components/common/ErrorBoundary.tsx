import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Clearview UI crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-plane p-6">
          <div className="max-w-md w-full bg-surface border border-ink-primary/10 rounded-2xl shadow-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-risk-critical/10 text-risk-critical flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-ink-primary">Something went wrong</h2>
            <p className="text-xs text-ink-muted">
              An unexpected error interrupted the view. Your data is safe — reload to get back to the dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                window.location.assign("/dashboard");
              }}
              className="text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

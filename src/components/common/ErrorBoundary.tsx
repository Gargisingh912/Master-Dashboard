import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled React Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-900/30">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6 leading-relaxed">
              An unexpected application error occurred. Don’t worry, your data is safe. Please try refreshing the page.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>

              <button
                onClick={this.toggleDetails}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium text-sm transition-colors"
              >
                {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {this.state.showDetails ? "Hide Technical Details" : "Show Technical Details"}
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-6 text-left bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-48 border border-gray-800">
                <p className="text-red-400 font-bold mb-1">{this.state.error?.toString()}</p>
                <pre className="text-gray-400 whitespace-pre-wrap leading-tight">
                  {this.state.errorInfo?.componentStack || "No stack trace available."}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

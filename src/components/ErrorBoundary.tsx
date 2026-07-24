import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Dashboard error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "60vh", gap: "1rem", padding: "2rem"
        }}>
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", textAlign: "center", maxWidth: 400 }}>
            We hit an unexpected error. Your data is safe.
            Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", background: "var(--color-accent)",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "14px", cursor: "pointer"
            }}
          >
            Refresh page
          </button>
          {import.meta.env.DEV && (
            <pre style={{
              fontSize: "11px", color: "red",
              background: "#fff5f5", padding: "12px",
              borderRadius: "8px", maxWidth: "600px",
              overflow: "auto", marginTop: "1rem"
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
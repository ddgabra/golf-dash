"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("FairwayServe error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
          <p className="mt-2 text-red-700">{this.state.message}</p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  fallback?: ReactNode;
  resetKey?: string | number | null;
};

type State = {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
};

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, componentStack: null };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, componentStack: null });
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: null };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    const stack = info.componentStack ?? null;
    console.error("[SceneErrorBoundary] Caught error in 3D scene:", error);
    console.error("[SceneErrorBoundary] Error name:", error.name);
    console.error("[SceneErrorBoundary] Error message:", error.message);
    console.error("[SceneErrorBoundary] Error stack:", error.stack);
    console.error("[SceneErrorBoundary] Component stack:", stack);
    this.setState({ componentStack: stack });
    this.props.onError?.(error, { componentStack: stack ?? "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center">
            <p className="text-xs font-bold text-red-600">3D scene crashed</p>
            <p className="text-[10px] text-slate-500">
              {this.state.error?.message ?? "Unknown error"}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

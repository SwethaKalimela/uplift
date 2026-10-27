"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export type FallbackProps = {
  error: unknown;
  resetErrorBoundary: () => void;
};

type Props = {
  children: ReactNode;
  fallbackRender: (props: FallbackProps) => ReactNode;
  onReset?: () => void;
};

type State = { error: unknown };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") console.error(error, info);
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) return this.props.fallbackRender({ error: this.state.error, resetErrorBoundary: this.reset });
    return this.props.children;
  }
}

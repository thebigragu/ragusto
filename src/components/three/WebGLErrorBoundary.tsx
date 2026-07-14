"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback: ReactNode };
type State = { error: boolean };

export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

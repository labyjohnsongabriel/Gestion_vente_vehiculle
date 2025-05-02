// pages/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Une erreur s'est produite</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

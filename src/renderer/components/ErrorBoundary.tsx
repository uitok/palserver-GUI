import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#1b1421',
            color: '#fff',
            padding: 40,
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#999', marginBottom: 24, maxWidth: 600, textAlign: 'center' }}>
            An unexpected error occurred. Please restart the application.
          </p>
          <pre
            style={{
              backgroundColor: '#2d2633',
              padding: 16,
              borderRadius: 8,
              maxWidth: 600,
              overflow: 'auto',
              fontSize: 13,
              color: '#e88',
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
            style={{
              marginTop: 24,
              padding: '8px 24px',
              backgroundColor: '#534bc2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#0d111a',
          color: '#f1f5f9',
          padding: '24px',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#141a29',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 18px',
              fontSize: '24px'
            }}>
              ⚠️
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800 }}>Something went wrong</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              An unexpected error occurred while loading this view. You can reload the page or return to the main portal.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#0d111a',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f87171',
                overflowX: 'auto',
                textAlign: 'left',
                marginBottom: '20px',
                border: '1px solid #1f293d'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  border: '1px solid #2b3852',
                  background: '#1b2336',
                  color: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  border: 'none',
                  background: '#6577e8',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

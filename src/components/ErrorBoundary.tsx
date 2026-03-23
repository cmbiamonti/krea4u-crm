import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error);
    console.error('Error info:', errorInfo);
    
    // Se sembra un problema di stato corrotto, pulisci e ricarica
    const corruptionIndicators = [
      'Cannot read',
      'undefined',
      'null',
      'is not a function',
      'is not an object'
    ];
    
    const seemsCorrupted = corruptionIndicators.some(indicator => 
      error.message.includes(indicator)
    );
    
    if (seemsCorrupted) {
      console.log('Detected corrupted state, clearing cache...');
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      }, 2000);
    }
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Qualcosa è andato storto
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
            Si è verificato un errore. Stiamo pulendo la cache e ricaricando l'applicazione...
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Ricarica ora
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#fee',
              borderRadius: '4px',
              fontSize: '12px',
              maxWidth: '600px',
              overflow: 'auto'
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
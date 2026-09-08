import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SEAQ Dashboard] Uncaught runtime exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
          <div className="max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-purple-500/30 shadow-2xl">
            <h2 className="text-lg font-bold text-purple-300 mb-2">SEAQ Dashboard Recovered</h2>
            <p className="text-xs text-slate-300 mb-4">
              A temporary rendering glitch was safely intercepted. Click below to restore all telemetry containers.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition-all"
            >
              Restore Dashboard Containers
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)

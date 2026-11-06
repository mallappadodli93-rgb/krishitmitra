import React from 'react';
import { AlertTriangle, RefreshCw, Home, Leaf } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#home';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 p-6 text-white text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Leaf className="w-8 h-8 text-emerald-300" />
              </div>
              <h2 className="text-xl font-bold">KrishiMitra (ಕೃಷಿಮಿತ್ರ)</h2>
              <p className="text-xs text-emerald-200 mt-1">Smart Farming Assistant</p>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sm text-amber-950 mb-1">
                    {this.props.fallbackTitle || 'Component Rendering Issue'}
                  </p>
                  <p className="text-amber-800">
                    A temporary error occurred while rendering this view. Your saved farm records and data are completely safe in local storage.
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="p-3 bg-slate-100 rounded-xl text-left border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Diagnostic Details:
                  </div>
                  <pre className="text-xs text-rose-700 font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

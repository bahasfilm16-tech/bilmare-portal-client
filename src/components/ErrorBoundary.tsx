import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Terjadi kesalahan</h2>
          {this.state.message && (
            <p className="text-sm text-slate-500 mt-1 max-w-sm">{this.state.message}</p>
          )}
        </div>
        <button
          onClick={this.reset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba lagi
        </button>
      </div>
    );
  }
}

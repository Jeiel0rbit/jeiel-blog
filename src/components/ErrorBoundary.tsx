
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getSafeErrorMessage } from '../utils/security';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate a safe error ID for tracking
    const errorId = Math.random().toString(36).substring(2, 15);
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely without exposing sensitive information
    const safeErrorMessage = getSafeErrorMessage(error);
    console.error('Error boundary caught an error:', {
      message: safeErrorMessage,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack?.substring(0, 500), // Limit stack trace length
    });

    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // reportError({
      //   message: safeErrorMessage,
      //   errorId: this.state.errorId,
      //   url: window.location.href
      // });
    }
  }

  public render() {
    if (this.state.hasError) {
      const safeErrorMessage = this.state.error ? getSafeErrorMessage(this.state.error) : 'Unknown error';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-4 p-4 bg-gray-200 dark:bg-gray-800 rounded text-sm">
                <summary className="cursor-pointer font-medium">Detalhes do erro (dev)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {safeErrorMessage}
                </pre>
                {this.state.errorId && (
                  <p className="mt-2 text-xs text-gray-500">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

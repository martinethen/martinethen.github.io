import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="text-center p-4 bg-red-100 border border-red-300 rounded-lg">
      <h3 className="text-xl font-bold text-red-700 mb-2">A Storm on the Horizon!</h3>
      <p className="text-red-800 mb-4">
        The signal from the Transponder Snail was disrupted by a sudden storm:
        <pre className="mt-2 p-2 bg-red-50 rounded text-sm text-red-900 whitespace-pre-wrap text-left">{message}</pre>
      </p>
      <button
        onClick={onRetry}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );
};
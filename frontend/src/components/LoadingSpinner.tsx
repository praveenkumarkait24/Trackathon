import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex space-x-2.5 items-center justify-center">
        <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

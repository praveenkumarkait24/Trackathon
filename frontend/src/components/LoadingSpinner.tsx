import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-5">
      {/* Branded gradient dots */}
      <div className="flex space-x-3 items-end justify-center">
        {[
          { color: 'bg-indigo-500',  delay: '0s',     size: 'w-3 h-3' },
          { color: 'bg-violet-500',  delay: '0.12s',  size: 'w-4 h-4' },
          { color: 'bg-cyan-400',    delay: '0.24s',  size: 'w-3 h-3' },
          { color: 'bg-indigo-400',  delay: '0.36s',  size: 'w-4 h-4' },
          { color: 'bg-cyan-500',    delay: '0.48s',  size: 'w-3 h-3' },
        ].map((dot, i) => (
          <div
            key={i}
            className={`${dot.size} ${dot.color} rounded-full animate-bounce shadow-md`}
            style={{ animationDelay: dot.delay, animationDuration: '0.8s' }}
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 tracking-wider uppercase">
        Loading...
      </p>
    </div>
  );
};

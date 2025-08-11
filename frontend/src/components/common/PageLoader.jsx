import React from 'react';

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] w-full">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader; 
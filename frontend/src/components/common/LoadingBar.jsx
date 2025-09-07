import React from 'react';

const LoadingBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/20">
      <div className="h-full bg-blue-500 animate-pulse"></div>
    </div>
  );
};

export default LoadingBar; 
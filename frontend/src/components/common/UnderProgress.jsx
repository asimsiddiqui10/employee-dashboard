import React from 'react';
import { Construction } from 'lucide-react';

const UnderProgress = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Construction size={64} className="text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
      <p className="text-gray-600 text-center max-w-md">
        This feature is currently under development. We're working hard to bring you this functionality soon!
      </p>
    </div>
  );
};

export default UnderProgress; 
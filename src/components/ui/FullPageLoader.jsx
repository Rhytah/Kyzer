import React from 'react';

const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-white bg-opacity-75 z-50">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-dark font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
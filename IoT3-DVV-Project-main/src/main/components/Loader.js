import React from 'react';

const Loader = () => {
  return (
    // Center the loader in the available space
    <div className="flex items-center justify-center">
      {/* Spinner animation for loading state */}
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status" // Indicate that this is a loading indicator
      >
        {/* Hidden text for screen readers to indicate loading state */}
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default Loader;

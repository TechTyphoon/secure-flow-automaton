import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">CSS Test Component</h1>
      <p className="text-lg">If you can see this styled properly, Tailwind CSS is working!</p>
      <div className="mt-4 p-4 bg-white text-blue-500 rounded">
        <p>This should have a white background with blue text.</p>
      </div>
    </div>
  );
};

export default TestComponent; 
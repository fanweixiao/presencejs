import React from 'react';

export const Button = ({ style = {}, children }) => {
  return (
    <button className="px-4 py-2 border rounded-md shadow-sm" style={style}>
      {children}
    </button>
  );
};

import Link from '@docusaurus/Link';
import React from 'react';

export const Card = ({ href = '#', style = {}, children }) => {
  return (
    <Link to={href}>
      <div
        className="inline-flex justify-center w-40 p-10 border rounded-md shadow-sm cursor-pointer"
        style={style}
      >
        {children}
      </div>
    </Link>
  );
};

import React from 'react';

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M10.5 19.5h3m-6.75-6.75v-1.5c0-3.423 2.784-6.207 6.207-6.207h.086a6.207 6.207 0 0 1 6.207 6.207v1.5m-6.75 6.75h.008v.008h-.008v-.008Zm-3.75 0h.008v.008h-.008v-.008Zm7.5 0h.008v.008h-.008v-.008Z" 
    />
  </svg>
);

export default LightbulbIcon;
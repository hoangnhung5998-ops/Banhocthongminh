import React from 'react';

const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}>
    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2Zm0 18c-3.31 0-6-2.69-6-6V9a6 6 0 0 1 12 0v5c0 3.31-2.69 6-6 6Zm-4-6v-1h8v1a4 4 0 0 1-8 0Zm-.5-3a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Z"/>
  </svg>
);

export default RobotIcon;

import React from 'react';

const TeacherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M4 19v-2h2v2H4Zm-2 2v-6h6v6H2Zm12-2v-2h2v2h-2Zm-2 2v-6h6v6h-6Zm-2-4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4Zm0-2h4a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/>
  </svg>
);

export default TeacherIcon;
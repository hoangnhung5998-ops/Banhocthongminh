import React from 'react';

const CoNaIcon: React.FC<React.SVGProps<SVGSVGElement> & { waving?: boolean }> = ({ waving, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}>
    <style>
      {waving && `
        @keyframes wave-hand {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .waving-hand {
          animation: wave-hand 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}
    </style>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#a5f3fc"/>
    <path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="none"/>
    <circle cx="9" cy="12" r="1.5" fill="#27272a"/>
    <circle cx="15" cy="12" r="1.5" fill="#27272a"/>
    <path d="M12 15c-2.33 0-4.32 1.45-5.12 3.5h10.24C16.32 16.45 14.33 15 12 15z" fill="#27272a" opacity="0.3"/>
    <path d="M9.5,16 C10.5,17.5 13.5,17.5 14.5,16" stroke="#27272a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {waving && (
      <g className="waving-hand">
        <path d="M17.5 13.5c-1-1-2.5-1.5-4-0.5 1 1.5 2 2.5 4 2.5s2.5-1.5 2.5-2.5c0-1.5-1.5-2-2.5-1" fill="#fef08a" stroke="#4b5563" strokeWidth="0.5"/>
      </g>
    )}
  </svg>
);

export default CoNaIcon;

import React, { useState } from 'react';

interface BidShieldLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BidShieldLogo: React.FC<BidShieldLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {!imageError ? (
        <img
          src="/src/assets/images/bidshield_logo_1790755913762.jpg"
          alt="BidShield Symbol"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-lg filter drop-shadow-md select-none transition-transform hover:scale-105"
        />
      ) : (
        /* Crisp Vector SVG fallback matching the 3D shield, document, checkmark, and orbiting ring */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00d2ff" />
              <stop offset="0.5" stopColor="#0066eb" />
              <stop offset="1" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00f2fe" />
              <stop offset="1" stopColor="#4facfe" />
            </linearGradient>
            <linearGradient id="checkGrad" x1="30" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38ef7d" />
              <stop offset="1" stopColor="#11998e" />
            </linearGradient>
          </defs>

          {/* Outer glowing orbital ring (back arc) */}
          <ellipse
            cx="50"
            cy="52"
            rx="46"
            ry="24"
            transform="rotate(-25 50 52)"
            stroke="url(#ringGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* 3D Shield Base */}
          <path
            d="M50 8L82 22V52C82 72 68 87 50 94C32 87 18 72 18 52V22L50 8Z"
            fill="url(#shieldGrad)"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Shield Facet */}
          <path
            d="M50 14L76 25.5V50C76 66.5 64.5 79.5 50 85.5C35.5 79.5 24 66.5 24 50V25.5L50 14Z"
            fill="#0f172a"
            fillOpacity="0.8"
          />

          {/* Document icon */}
          <path
            d="M34 26H58L68 36V70C68 72.2 66.2 74 64 74H34C31.8 74 30 72.2 30 70V30C30 27.8 31.8 26 34 26Z"
            fill="#ffffff"
          />
          {/* Folded corner */}
          <path d="M58 26V36H68L58 26Z" fill="#cbd5e1" />
          {/* Document lines */}
          <rect x="36" y="42" width="20" height="3.5" rx="1.5" fill="#0284c7" />
          <rect x="36" y="49" width="24" height="3.5" rx="1.5" fill="#0284c7" />
          <rect x="36" y="56" width="16" height="3.5" rx="1.5" fill="#0284c7" />

          {/* Checkmark tick across the front */}
          <path
            d="M34 60L46 72L76 40"
            stroke="url(#checkGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer glowing orbital ring (front arc) */}
          <path
            d="M12 62C24 76 65 78 88 50"
            stroke="url(#ringGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};

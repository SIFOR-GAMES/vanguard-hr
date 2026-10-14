import React from 'react';

interface RoyalEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const RoyalEmblem: React.FC<RoyalEmblemProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const falconSvg = (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${className} drop-shadow-xs`}
    >
      <defs>
        {/* Shimmering Metallic Gold Gradients */}
        <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="35%" stopColor="#BA9547" />
          <stop offset="70%" stopColor="#8A6B2D" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5E3B8" />
          <stop offset="50%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#7A5B1E" />
        </linearGradient>

        <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="100%" stopColor="#8A6B2D" />
        </linearGradient>
      </defs>

      {/* Outer Halo / Sunburst Ring */}
      <circle cx="60" cy="58" r="54" stroke="url(#goldGrad1)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />

      {/* Falcon Head & Crown */}
      <path
        d="M60 16 C57 16 54 18 53 21 C51 24 53 27 55 28 C57 29 60 29 60 32 C60 29 63 29 65 28 C67 27 69 24 67 21 C66 18 63 16 60 16 Z"
        fill="url(#goldGrad2)"
      />
      {/* Beak */}
      <path d="M60 24 L57 26 L60 28 L63 26 Z" fill="#674E23" />

      {/* Left Wing - Outstretched Royal Feathers */}
      <path
        d="M52 32 C45 28 32 23 18 24 C14 24 16 30 20 34 C25 39 34 42 42 46 C32 46 22 46 14 51 C12 52 14 57 18 58 C26 61 36 60 46 59 C38 63 28 67 22 73 C20 75 22 79 26 79 C34 78 44 72 50 67 C48 72 44 78 40 85 C39 87 42 89 45 88 C51 84 55 77 57 71 Z"
        fill="url(#goldGrad1)"
      />

      {/* Right Wing - Outstretched Royal Feathers */}
      <path
        d="M68 32 C75 28 88 23 102 24 C106 24 104 30 100 34 C95 39 86 42 78 46 C88 46 98 46 106 51 C108 52 106 57 102 58 C94 61 84 60 74 59 C82 63 92 67 98 73 C100 75 98 79 94 79 C86 78 76 72 70 67 C72 72 76 78 80 85 C81 87 78 89 75 88 C69 84 65 77 63 71 Z"
        fill="url(#goldGrad1)"
      />

      {/* Falcon Tail Feathers */}
      <path
        d="M54 75 L52 96 C52 98 55 99 57 98 L60 92 L63 98 C65 99 68 98 68 96 L66 75 Z"
        fill="url(#goldGrad2)"
      />

      {/* UAE Flag Shield in Circular Chest Crest */}
      <circle cx="60" cy="54" r="17" fill="#FFFFFF" stroke="url(#goldGrad2)" strokeWidth="2.5" />
      
      {/* 7 Stars around Shield */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 60 + 14 * Math.cos(rad);
        const cy = 54 + 14 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="0.75" fill="#8A6B2D" />;
      })}

      {/* UAE Flag Disc Clipped */}
      <g clipPath="url(#flagClip)">
        {/* Top: Green */}
        <rect x="47" y="41" width="26" height="8.6" fill="#00732f" />
        {/* Middle: White */}
        <rect x="47" y="49.6" width="26" height="8.8" fill="#ffffff" />
        {/* Bottom: Black */}
        <rect x="47" y="58.4" width="26" height="8.6" fill="#000000" />
        {/* Left: Red Vertical Stripe */}
        <rect x="47" y="41" width="8" height="26" fill="#d80027" />
      </g>

      <clipPath id="flagClip">
        <circle cx="60" cy="54" r="13" />
      </clipPath>

      {/* Decorative Gold Ring Over Flag Shield */}
      <circle cx="60" cy="54" r="13" fill="none" stroke="url(#goldGrad1)" strokeWidth="1" opacity="0.6" />

      {/* Golden Pedestal / Talons Base */}
      <path
        d="M44 98 C44 95 76 95 76 98 L72 104 C72 105 48 105 48 104 Z"
        fill="url(#pedestalGrad)"
      />
      {/* UAE Name Scroll Bar */}
      <rect x="36" y="103" width="48" height="7" rx="2" fill="url(#goldGrad2)" stroke="#7A5B1E" strokeWidth="0.5" />
      {/* Scroll Calligraphy lines */}
      <line x1="42" y1="106.5" x2="78" y2="106.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
    </svg>
  );

  if (!showText) {
    return falconSvg;
  }

  return (
    <div className="flex items-center gap-3">
      {falconSvg}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100">
            Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-[#A17D34] uppercase">
            Human Resources Management System
          </span>
          <span className="hidden md:inline text-stone-400">•</span>
          <span className="hidden md:inline font-arabic text-xs text-stone-600 dark:text-stone-400" dir="rtl">
            مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
          </span>
        </div>
      </div>
    </div>
  );
};

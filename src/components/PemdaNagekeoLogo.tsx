import React from 'react';

interface PemdaNagekeoLogoProps {
  className?: string;
  size?: number;
}

export const PemdaNagekeoLogo: React.FC<PemdaNagekeoLogoProps> = ({ 
  className = "h-16 w-auto",
  size = 80
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer rounded card frame with soft shadow matching user badge */}
      <div className="bg-white p-1 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
        <svg 
          viewBox="0 0 200 220" 
          width={size} 
          height={size * 1.1} 
          className="drop-shadow-xs"
        >
          <defs>
            {/* Sky Blue Shield Gradient */}
            <linearGradient id="nagekeo-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ad3f6" />
              <stop offset="100%" stopColor="#4bb3e6" />
            </linearGradient>

            {/* Mountain Gradient */}
            <linearGradient id="mountain-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Wood Peo Gradient */}
            <linearGradient id="peo-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Gold Gradient */}
            <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            {/* Ribbon Gradient */}
            <linearGradient id="red-ribbon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* MAIN SHIELD OUTLINE (Perisai Lima Sudut) */}
          {/* Outer Gold Border */}
          <path 
            d="M 100,10 C 130,10 175,20 185,35 C 185,110 170,165 100,205 C 30,165 15,110 15,35 C 25,20 70,10 100,10 Z" 
            fill="none" 
            stroke="#facc15" 
            strokeWidth="7" 
            strokeLinejoin="round"
          />
          {/* Inner Thin Yellow Border */}
          <path 
            d="M 100,14 C 128,14 171,23 181,37 C 181,108 167,161 100,199 C 33,161 19,108 19,37 C 29,23 72,14 100,14 Z" 
            fill="none" 
            stroke="#eab308" 
            strokeWidth="2" 
          />
          
          {/* SHIELD BACKGROUND FIELD */}
          <path 
            d="M 100,16 C 127,16 169,25 179,38 C 179,106 165,158 100,196 C 35,158 21,106 21,38 C 31,25 73,16 100,16 Z" 
            fill="url(#nagekeo-sky)" 
          />

          {/* MOUNTAIN (Gunung Ebulobo) */}
          <path 
            d="M 45,145 L 100,55 L 155,145 Z" 
            fill="url(#mountain-grad)" 
          />
          {/* Mountain Shadow/Texture lines */}
          <path d="M 100,55 L 85,145 L 100,145 Z" fill="#1e293b" opacity="0.4" />

          {/* PEO MONUMENT (Tugu Peo / Tanduk Kerbau Kayu) */}
          {/* Peo Base Stone Altar */}
          <path d="M 75,155 L 125,155 L 120,142 L 80,142 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
          <path d="M 78,142 L 122,142 L 118,132 L 82,132 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

          {/* Peo Main Post & Horns */}
          <path 
            d="M 94,132 L 94,80 C 82,70 65,45 60,35 C 65,42 78,60 92,68 L 92,132 Z" 
            fill="url(#peo-wood)" 
          />
          <path 
            d="M 106,132 L 106,80 C 118,70 135,45 140,35 C 135,42 122,60 108,68 L 108,132 Z" 
            fill="url(#peo-wood)" 
          />
          {/* Central Peo Column */}
          <rect x="92" y="65" width="16" height="67" fill="url(#peo-wood)" rx="1" />
          
          {/* Peo Carvings Ornament (Ornamen Emas di Peo) */}
          <circle cx="100" cy="80" r="3" fill="#facc15" />
          <polygon points="100,85 96,92 104,92" fill="#facc15" />
          <polygon points="100,105 96,98 104,98" fill="#facc15" />
          <circle cx="100" cy="112" r="2.5" fill="#facc15" />

          {/* YELLOW LAND TRIANGLE (Bukit/Tanah Kuning) */}
          <polygon points="100,140 60,175 140,175" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

          {/* RICE SHEAF - PADI (Left Side) */}
          <g fill="#facc15" stroke="#ca8a04" strokeWidth="0.5">
            <path d="M 40,140 Q 30,110 52,65" fill="none" stroke="#eab308" strokeWidth="2.5" />
            {/* Rice Grains */}
            <ellipse cx="50" cy="70" rx="4" ry="7" transform="rotate(-30 50 70)" />
            <ellipse cx="43" cy="80" rx="4" ry="7" transform="rotate(-35 43 80)" />
            <ellipse cx="38" cy="92" rx="4" ry="7" transform="rotate(-40 38 92)" />
            <ellipse cx="35" cy="105" rx="4" ry="7" transform="rotate(-45 35 105)" />
            <ellipse cx="34" cy="118" rx="4" ry="7" transform="rotate(-50 34 118)" />
            <ellipse cx="36" cy="131" rx="4" ry="7" transform="rotate(-55 36 131)" />
            <ellipse cx="41" cy="143" rx="4" ry="7" transform="rotate(-60 41 143)" />
            <ellipse cx="50" cy="153" rx="4" ry="7" transform="rotate(-65 50 153)" />
          </g>

          {/* COTTON BRANCH - KAPAS (Right Side) */}
          <g>
            <path d="M 160,140 Q 170,110 148,65" fill="none" stroke="#15803d" strokeWidth="2.5" />
            {/* Cotton Bolls */}
            {[
              { x: 150, y: 70 },
              { x: 157, y: 82 },
              { x: 162, y: 95 },
              { x: 165, y: 108 },
              { x: 164, y: 122 },
              { x: 160, y: 135 },
              { x: 152, y: 147 },
            ].map((pt, idx) => (
              <g key={idx}>
                {/* Green Sepal */}
                <path d={`M ${pt.x-5},${pt.y+2} L ${pt.x},${pt.y-4} L ${pt.x+5},${pt.y+2} Z`} fill="#16a34a" />
                {/* White Cotton Cloud */}
                <circle cx={pt.x-3} cy={pt.y-2} r="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx={pt.x+3} cy={pt.y-2} r="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx={pt.x} cy={pt.y-5} r="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
              </g>
            ))}
          </g>

          {/* THREE INTERTWINED GOLD RINGS (3 Cincin Emas) */}
          <g fill="none" stroke="#eab308" strokeWidth="2.5">
            <circle cx="88" cy="165" r="9" />
            <circle cx="100" cy="165" r="9" />
            <circle cx="112" cy="165" r="9" />
          </g>

          {/* YEAR "2006" */}
          <text 
            x="100" 
            y="185" 
            fill="#0f172a" 
            fontSize="13" 
            fontWeight="900" 
            fontFamily="Arial, sans-serif" 
            textAnchor="middle"
            letterSpacing="0.5"
          >
            2006
          </text>

          {/* TOP STAR (Bintang Emas) */}
          <polygon 
            points="100,21 103,29 111,29 105,34 107,42 100,37 93,42 95,34 89,29 97,29" 
            fill="url(#gold-grad)" 
            stroke="#ca8a04" 
            strokeWidth="0.5" 
          />

          {/* RED RIBBON BANNER (Pita Merah "KABUPATEN NAGEKEO") */}
          <g>
            {/* Ribbon Shadow & Fold Tails */}
            <path d="M 40,48 L 30,52 L 40,58 Z" fill="#7f1d1d" />
            <path d="M 160,48 L 170,52 L 160,58 Z" fill="#7f1d1d" />

            {/* Arched Red Ribbon Body */}
            <path 
              d="M 38,48 Q 100,32 162,48 L 158,58 Q 100,42 42,58 Z" 
              fill="url(#red-ribbon)" 
              stroke="#991b1b" 
              strokeWidth="0.8" 
            />

            {/* Ribbon Text Path */}
            <path id="ribbon-path" d="M 40,52 Q 100,36 160,52" fill="none" />

            <text fill="#ffffff" fontSize="8" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="0.8">
              <textPath href="#ribbon-path" startOffset="50%" textAnchor="middle">
                KABUPATEN NAGEKEO
              </textPath>
            </text>
          </g>

        </svg>
      </div>
    </div>
  );
};

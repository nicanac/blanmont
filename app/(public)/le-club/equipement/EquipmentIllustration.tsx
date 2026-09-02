import React from 'react';

interface EquipmentIllustrationProps {
  category: string;
  name: string;
  productCode?: string;
  className?: string;
}

export default function EquipmentIllustration({
  category,
  name,
  productCode,
  className = '',
}: EquipmentIllustrationProps) {
  const isVest = /veste|gilet|coupe[- ]?vent/i.test(name) || category === 'Veste';
  const isShort = /cuissard court|short/i.test(name) || category === 'Short';
  const isTight = /cuissard long|collant/i.test(name) || category === 'Collant';
  const isLongSleeve = /manche longue|hyder/i.test(name);
  const isWomen = /femme|women/i.test(name);

  return (
    <div className={`relative h-full w-full bg-gradient-to-br from-[#12151d] via-[#1a1f2c] to-[#0a0c10] flex flex-col items-center justify-between p-6 select-none overflow-hidden ${className}`}>
      {/* Background watermark club crest */}
      <svg
        className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 text-white/[0.03] transform rotate-12"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
        <polygon points="50,15 62,38 85,42 68,58 72,82 50,70 28,82 32,58 15,42 38,38" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Top Brand Label */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d8493]">
          GOBIK CUSTOM
        </span>
        <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#e03e3e]">
          {isWomen ? 'COUPE FEMME' : 'COUPE HOMME'}
        </span>
      </div>

      {/* Centerpiece Vector Illustration */}
      <div className="relative z-10 my-auto flex items-center justify-center w-full max-h-[180px]">
        {/* 1. BIB SHORTS (Cuissard Court) */}
        {isShort && (
          <svg viewBox="0 0 200 240" className="h-44 w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" fill="none">
            {/* Straps */}
            <path d="M70 20 L80 90 M130 20 L120 90" stroke="#7d8493" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
            <path d="M70 20 C70 40 80 80 85 95 L115 95 C120 80 130 40 130 20" stroke="#e03e3e" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            {/* Main Shorts Body */}
            <path d="M60 95 L140 95 L148 180 L115 185 L100 130 L85 185 L52 180 Z" fill="#181b24" stroke="#2e3547" strokeWidth="2" />
            {/* Side Ergonomic Panels in Black / Red accents */}
            <path d="M60 95 L75 140 L52 180 L56 120 Z" fill="#202534" />
            <path d="M140 95 L125 140 L148 180 L144 120 Z" fill="#202534" />
            {/* Red Grip Bands */}
            <path d="M52 175 L85 180 L84 188 L50 184 Z" fill="#e03e3e" />
            <path d="M115 180 L148 175 L150 184 L116 188 Z" fill="#e03e3e" />
            {/* Pad seamlines / Chamois */}
            <path d="M92 120 C96 110 104 110 108 120 L104 140 L96 140 Z" fill="#e03e3e" opacity="0.3" />
            {/* Brand Wordmark */}
            <text x="100" y="165" fill="#f5f6f8" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2">
              BLANMONT
            </text>
          </svg>
        )}

        {/* 2. BIB TIGHTS (Cuissard Long / Collant) */}
        {isTight && (
          <svg viewBox="0 0 200 240" className="h-44 w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" fill="none">
            {/* Straps */}
            <path d="M75 15 L82 70 M125 15 L118 70" stroke="#7d8493" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
            {/* Main Long Leg Body */}
            <path d="M65 70 L135 70 L138 210 L120 210 L100 120 L80 210 L62 210 Z" fill="#181b24" stroke="#2e3547" strokeWidth="2" />
            {/* Knee articulation panels */}
            <circle cx="77" cy="140" r="10" stroke="#e03e3e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="123" cy="140" r="10" stroke="#e03e3e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            {/* Ankle Cuffs */}
            <rect x="62" y="204" width="18" height="6" fill="#e03e3e" />
            <rect x="120" y="204" width="18" height="6" fill="#e03e3e" />
            {/* Wordmark */}
            <text x="100" y="100" fill="#f5f6f8" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="2">
              BLANMONT
            </text>
          </svg>
        )}

        {/* 3. JACKET / WINDSTOPPER (Veste / Coupe-Vent) */}
        {isVest && (
          <svg viewBox="0 0 200 240" className="h-44 w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" fill="none">
            {/* High collar */}
            <path d="M85 30 L115 30 L118 45 L82 45 Z" fill="#e03e3e" />
            {/* Body */}
            <path d="M82 45 L50 65 L60 190 L140 190 L150 65 L118 45 Z" fill="#1b1f2b" stroke="#2e3547" strokeWidth="2" />
            {/* Vest shoulder cuts or sleeves */}
            {name.toLowerCase().includes('gilet') || name.toLowerCase().includes('coupe') ? (
              <>
                <path d="M50 65 C60 90 60 110 55 125" stroke="#e03e3e" strokeWidth="3" fill="none" />
                <path d="M150 65 C140 90 140 110 145 125" stroke="#e03e3e" strokeWidth="3" fill="none" />
              </>
            ) : (
              <>
                <path d="M50 65 L25 140 L40 145 L60 95" fill="#181b24" stroke="#2e3547" strokeWidth="1.5" />
                <path d="M150 65 L175 140 L160 145 L140 95" fill="#181b24" stroke="#2e3547" strokeWidth="1.5" />
              </>
            )}
            {/* Center Front Zipper */}
            <line x1="100" y1="30" x2="100" y2="190" stroke="#f5f6f8" strokeWidth="2.5" strokeDasharray="6 2" />
            {/* Chest Red Accent Slash */}
            <path d="M60 85 L140 75 L142 90 L60 100 Z" fill="#e03e3e" />
            <text x="100" y="91" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="2">
              BLANMONT
            </text>
            {/* Bottom Silicone Gripper */}
            <rect x="60" y="186" width="80" height="4" fill="#e03e3e" />
          </svg>
        )}

        {/* 4. CYCLING JERSEY (Maillot Manches Courtes / Longues) */}
        {!isShort && !isTight && !isVest && (
          <svg viewBox="0 0 200 240" className="h-44 w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" fill="none">
            {/* Aerodynamic Low Collar */}
            <path d="M85 35 Q100 45 115 35 L118 48 Q100 56 82 48 Z" fill="#101216" stroke="#e03e3e" strokeWidth="1.5" />
            {/* Main Jersey Torso */}
            <path d="M82 48 L55 65 L62 185 L138 185 L145 65 L118 48 Z" fill="#161922" stroke="#2e3547" strokeWidth="2" />
            {/* Sleeves: Short vs Long */}
            {isLongSleeve ? (
              <>
                <path d="M55 65 L20 160 L35 165 L60 100" fill="#1a1e2a" stroke="#2e3547" strokeWidth="1.5" />
                <path d="M145 65 L180 160 L165 165 L140 100" fill="#1a1e2a" stroke="#2e3547" strokeWidth="1.5" />
                <rect x="20" y="157" width="16" height="6" fill="#e03e3e" />
                <rect x="165" y="157" width="16" height="6" fill="#e03e3e" />
              </>
            ) : (
              <>
                <path d="M55 65 L32 105 L48 112 L60 90" fill="#1a1e2a" stroke="#2e3547" strokeWidth="1.5" />
                <path d="M145 65 L168 105 L152 112 L140 90" fill="#1a1e2a" stroke="#2e3547" strokeWidth="1.5" />
                <rect x="32" y="103" width="17" height="6" fill="#e03e3e" />
                <rect x="151" y="103" width="18" height="6" fill="#e03e3e" />
              </>
            )}
            {/* Red Chest Band */}
            <path d="M57 90 L143 82 L144 102 L58 110 Z" fill="#e03e3e" />
            {/* Club Wordmark */}
            <text x="101" y="99" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="2.5">
              BLANMONT
            </text>
            {/* Full Length Camlock Zipper */}
            <line x1="100" y1="48" x2="100" y2="185" stroke="#f5f6f8" strokeWidth="1.5" opacity="0.7" />
            {/* Bottom Waistband */}
            <rect x="62" y="181" width="76" height="4" fill="#e03e3e" />
          </svg>
        )}
      </div>

      {/* Bottom Footer Info Strip */}
      <div className="w-full flex items-center justify-between pt-3 border-t border-white/10 z-10">
        <span className="text-xs font-mono uppercase text-[#a7adbb]">
          {productCode || 'REF-2026'}
        </span>
        <span className="text-xs font-semibold text-[#f5f6f8] flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
          Design Officiel
        </span>
      </div>
    </div>
  );
}

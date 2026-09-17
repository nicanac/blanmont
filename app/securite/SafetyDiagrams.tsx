import React from 'react';

/**
 * Technical architectural SVG diagram representing Belgian Road Code Art. 43bis:
 * 2-by-2 peloton formation on a Belgian roadway with safety clearances and captain placements.
 */
export function PelotonRoadDiagram(): React.ReactElement {
  return (
    <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#101216] p-5 sm:p-6 text-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-4 border-b border-white/10 mb-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Formation en double file sur chaussée
        </h3>
        <span className="text-xs text-[#a7adbb]">
          Art. 43bis · Voie de droite exclusive
        </span>
      </div>

      <div className="relative w-full aspect-16/10 bg-[#161922] rounded-md border border-white/10 overflow-hidden select-none">
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Road background */}
          <rect width="640" height="360" fill="#161922" />

          {/* Left verge / Accotement gauche */}
          <rect x="0" y="0" width="640" height="24" fill="#1b231c" />
          <line x1="0" y1="24" x2="640" y2="24" stroke="#2d3a2e" strokeWidth="1.5" />

          {/* Road edge left line */}
          <line x1="0" y1="36" x2="640" y2="36" stroke="#4a5263" strokeWidth="2" strokeDasharray="12 8" />

          {/* Opposing lane zone */}
          <rect x="0" y="36" width="640" height="134" fill="#13161c" />
          <text
            x="320"
            y="108"
            fill="#5c6370"
            fontSize="11"
            fontWeight="500"
            letterSpacing="0.04em"
            textAnchor="middle"
          >
            VOIE OPPOSÉE — CIRCULATION STRICTEMENT INTERDITE AU GROUPE
          </text>
          <path d="M120 104L70 104M78 99L70 104L78 109" stroke="#5c6370" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Center line (Axe médian de la chaussée) */}
          <line x1="0" y1="170" x2="640" y2="170" stroke="#f5f6f8" strokeWidth="3" strokeDasharray="24 16" />

          {/* Right lane (peloton lane) */}
          <rect x="0" y="170" width="640" height="154" fill="#181c26" />

          {/* Right road edge solid line */}
          <line x1="0" y1="324" x2="640" y2="324" stroke="#f5f6f8" strokeWidth="2" />

          {/* Right verge / Accotement droit */}
          <rect x="0" y="324" width="640" height="36" fill="#1b231c" />
          <line x1="0" y1="324" x2="640" y2="324" stroke="#2d3a2e" strokeWidth="1.5" />

          {/* Edge safety gutter margin */}
          <line x1="160" y1="310" x2="160" y2="324" stroke="#a7adbb" strokeWidth="1" />
          <text x="172" y="318" fill="#a7adbb" fontSize="9">
            Marge 50 cm (avaloirs et débris)
          </text>

          {/* Peloton safe corridor zone */}
          <rect
            x="110"
            y="186"
            width="460"
            height="124"
            fill="#e03e3e"
            fillOpacity="0.05"
            rx="4"
            stroke="#e03e3e"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Direction indicator */}
          <g transform="translate(545, 248)">
            <path d="M0 0L30 0M22 -5L30 0L22 5" stroke="#e03e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="15" y="18" fill="#e03e3e" fontSize="9" fontWeight="600" textAnchor="middle">
              Sens de marche
            </text>
          </g>

          {/* Cyclists 2-by-2 layout */}
          {/* Pair 1 - Front (Capitaine avant à gauche + Équipier de tête à droite) */}
          {/* Rider 1A: Lead Captain */}
          <g transform="translate(485, 218)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#e03e3e" />
            <circle cx="-6" cy="0" r="3" fill="#ffffff" />
            <circle cx="8" cy="0" r="2" fill="#ffffff" />
            {/* Captain identifier badge */}
            <circle cx="0" cy="-10" r="5" fill="#e03e3e" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-7.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">C</text>
          </g>

          {/* Rider 1B: Co-lead */}
          <g transform="translate(485, 276)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#f5f6f8" />
            <circle cx="-6" cy="0" r="3" fill="#101216" />
            <circle cx="8" cy="0" r="2" fill="#101216" />
          </g>

          {/* Lateral distance indicator */}
          <line x1="485" y1="228" x2="485" y2="266" stroke="#e03e3e" strokeWidth="1" strokeDasharray="2 2" />
          <text x="496" y="250" fill="#f5f6f8" fontSize="8">
            20–30 cm
          </text>

          {/* Pair 2 */}
          <g transform="translate(405, 218)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>
          <g transform="translate(405, 276)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>

          {/* Pair 3 */}
          <g transform="translate(325, 218)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>
          <g transform="translate(325, 276)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>

          {/* Safe following distance note */}
          <line x1="245" y1="203" x2="325" y2="203" stroke="#f5f6f8" strokeWidth="0.75" />
          <circle cx="245" cy="203" r="1.5" fill="#f5f6f8" />
          <circle cx="325" cy="203" r="1.5" fill="#f5f6f8" />
          <text x="285" y="198" fill="#f5f6f8" fontSize="8" textAnchor="middle">
            Roue à roue : 30–50 cm
          </text>

          {/* Pair 4 */}
          <g transform="translate(245, 218)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>
          <g transform="translate(245, 276)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>

          {/* Pair 5 - Rear (Capitaine serre-file à gauche + cycliste à droite) */}
          <g transform="translate(165, 218)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#e03e3e" />
            <circle cx="-6" cy="0" r="3" fill="#ffffff" />
            <circle cx="8" cy="0" r="2" fill="#ffffff" />
            {/* Captain identifier badge */}
            <circle cx="0" cy="-10" r="5" fill="#e03e3e" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-7.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">C</text>
          </g>
          <g transform="translate(165, 276)">
            <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#3a3f4a" />
            <circle cx="-6" cy="0" r="3" fill="#a7adbb" />
            <circle cx="8" cy="0" r="2" fill="#a7adbb" />
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
        <div className="flex items-start gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#e03e3e] shrink-0 mt-1" />
          <p className="text-xs text-[#a7adbb] leading-normal">
            <strong className="text-white font-semibold">Capitaines de route (C) :</strong> encadrent en tête et en queue avec brassard tricolore et disque C3.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#3a3f4a] border border-white/30 shrink-0 mt-1" />
          <p className="text-xs text-[#a7adbb] leading-normal">
            <strong className="text-white font-semibold">Deux de front stricts :</strong> maintien permanent sur la voie de droite sans franchir la ligne médiane.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
          <p className="text-xs text-[#a7adbb] leading-normal">
            <strong className="text-white font-semibold">Peloton de 15 à 50 :</strong> dispense légale de piste cyclable inadaptée pour la sécurité du groupe.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Diagram showing the mechanical reality of "Half-Wheeling" (Roue Croisée).
 */
export function HalfWheelingDiagram(): React.ReactElement {
  return (
    <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#101216] dark:text-white">
          Le Risque de la Roue Croisée (Half-Wheeling)
        </h3>
        <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
          Croiser sa roue avant avec la roue arrière du cycliste qui précède est la cause n°1 de chute en peloton.
          Si le coureur de tête s&apos;écarte ne serait-ce que de 5 cm pour éviter un trou ou un gravier, sa roue arrière percute votre roue avant.
          La direction est fauchée net : le guidon tourne à 90°, et la chute est instantanée et imparable.
        </p>
      </div>

      {/* Comparison: DANGER vs BONNE TRAJECTOIRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Wrong: Half-wheeling overlap */}
        <div className="rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
            <span>Roue croisée : accrochage immédiat</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Danger</span>
          </div>

          <div className="h-28 bg-white dark:bg-[#0a0c10] rounded border border-rose-200 dark:border-rose-900/40 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 280 110" className="w-full h-full" fill="none">
              {/* Road markings */}
              <line x1="0" y1="15" x2="280" y2="15" stroke="#e4e0d8" strokeDasharray="6 6" />
              <line x1="0" y1="95" x2="280" y2="95" stroke="#e4e0d8" strokeDasharray="6 6" />

              {/* Leader bike */}
              <rect x="40" y="44" width="76" height="8" rx="2" fill="#5c6370" />
              <circle cx="46" cy="48" r="8" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <circle cx="110" cy="48" r="8" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <text x="78" y="32" fontSize="9" fontWeight="600" fill="#5c6370" textAnchor="middle">
                Coureur devant
              </text>

              {/* Follower bike overlapping dangerously */}
              <rect x="94" y="68" width="76" height="8" rx="2" fill="#e03e3e" />
              <circle cx="100" cy="72" r="8" stroke="#e03e3e" strokeWidth="2" fill="#fee2e2" />
              <circle cx="164" cy="72" r="8" stroke="#e03e3e" strokeWidth="2" fill="#faf8f5" />
              <text x="140" y="93" fontSize="9" fontWeight="600" fill="#e03e3e" textAnchor="middle">
                Votre vélo (roue engagée)
              </text>

              {/* Contact danger zone */}
              <line x1="110" y1="48" x2="100" y2="72" stroke="#e03e3e" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="105" cy="60" r="12" stroke="#e03e3e" strokeWidth="1.5" fill="#ef4444" fillOpacity="0.15" />
              <text x="105" y="63" fontSize="7" fontWeight="bold" fill="#dc2626" textAnchor="middle">
                IMPACT
              </text>
            </svg>
          </div>

          <p className="text-xs text-rose-900 dark:text-rose-300 leading-normal">
            Votre roue avant est à la hauteur de son dérailleur. Le coureur ne vous voit pas et ne peut pas anticiper votre présence.
          </p>
        </div>

        {/* Correct: Aligned in the slipstream */}
        <div className="rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span>Dans le sillage : aspiration sécurisée</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Conforme</span>
          </div>

          <div className="h-28 bg-white dark:bg-[#0a0c10] rounded border border-emerald-200 dark:border-emerald-900/40 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 280 110" className="w-full h-full" fill="none">
              {/* Road markings */}
              <line x1="0" y1="15" x2="280" y2="15" stroke="#e4e0d8" strokeDasharray="6 6" />
              <line x1="0" y1="95" x2="280" y2="95" stroke="#e4e0d8" strokeDasharray="6 6" />

              {/* Leader bike */}
              <rect x="35" y="44" width="76" height="8" rx="2" fill="#5c6370" />
              <circle cx="41" cy="48" r="8" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <circle cx="105" cy="48" r="8" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <text x="73" y="32" fontSize="9" fontWeight="600" fill="#5c6370" textAnchor="middle">
                Coureur devant
              </text>

              {/* Follower bike directly behind */}
              <rect x="145" y="44" width="76" height="8" rx="2" fill="#10b981" />
              <circle cx="151" cy="48" r="8" stroke="#10b981" strokeWidth="2" fill="#ecfdf5" />
              <circle cx="215" cy="48" r="8" stroke="#10b981" strokeWidth="2" fill="#faf8f5" />
              <text x="183" y="32" fontSize="9" fontWeight="600" fill="#059669" textAnchor="middle">
                Votre vélo (aligné)
              </text>

              {/* Safety distance corridor */}
              <line x1="113" y1="48" x2="143" y2="48" stroke="#059669" strokeWidth="1.5" />
              <path d="M117 45L113 48L117 51M139 45L143 48L139 51" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
              <text x="128" y="66" fontSize="8" fontWeight="bold" fill="#059669" textAnchor="middle">
                30–50 cm
              </text>
            </svg>
          </div>

          <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-normal">
            Les deux vélos restent rigoureusement alignés dans le même axe. En cas d&apos;écart, aucun contact de roue n&apos;est possible.
          </p>
        </div>
      </div>
    </div>
  );
}

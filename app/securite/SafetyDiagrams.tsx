import React from 'react';

/**
 * Technical architectural SVG diagram representing Belgian Road Code Art. 43bis:
 * 2-by-2 peloton formation on a Belgian roadway with safety clearances and captain placements.
 */
export function PelotonRoadDiagram(): React.ReactElement {
  return (
    <div className="relative w-full rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-[#101216] p-5 sm:p-6 overflow-hidden text-white shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#e03e3e]">
            Schéma Technique · Code Art. 43bis
          </span>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Disposition Légale du Peloton à 2 de Front
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded-xs bg-white/10 text-[10px] font-mono text-[#a7adbb]">
          Échelle 1:50
        </span>
      </div>

      <div className="relative w-full aspect-16/10 bg-[#161922] rounded-md border border-white/10 overflow-hidden select-none">
        <svg
          viewBox="0 0 600 360"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Road background */}
          <rect width="600" height="360" fill="#161922" />

          {/* Grass verge / accotement gauche */}
          <rect x="0" y="0" width="600" height="30" fill="#1b231c" />
          <line x1="0" y1="30" x2="600" y2="30" stroke="#374538" strokeWidth="2" />

          {/* Lane markings: road edges */}
          <line x1="0" y1="40" x2="600" y2="40" stroke="#f5f6f8" strokeWidth="3" strokeDasharray="16 12" />

          {/* Center line (Axe médian de la chaussée) */}
          <line x1="0" y1="180" x2="600" y2="180" stroke="#f5f6f8" strokeWidth="3" strokeDasharray="30 20" />

          {/* Opposing lane label */}
          <text x="50" y="115" fill="#5c6370" fontSize="11" fontFamily="monospace" letterSpacing="0.08em" textAnchor="start">
            VOIE OPPOSÉE (SENS INVERSE) — CIRCULATION INTERDITE AU PELOTON
          </text>
          <path d="M40 110L20 110" stroke="#5c6370" strokeWidth="1.5" markerEnd="url(#arrow-left)" />

          {/* Right lane marking */}
          <line x1="0" y1="320" x2="600" y2="320" stroke="#f5f6f8" strokeWidth="3" />

          {/* Grass verge / accotement droit */}
          <rect x="0" y="330" width="600" height="30" fill="#1b231c" />
          <line x1="0" y1="330" x2="600" y2="330" stroke="#374538" strokeWidth="2" />

          {/* Peloton Corridor Zone Overlay */}
          <rect x="100" y="195" width="450" height="115" fill="#e03e3e" fillOpacity="0.08" rx="6" stroke="#e03e3e" strokeWidth="1" strokeDasharray="4 4" />
          <text x="540" y="210" fill="#e03e3e" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end">
            GABARIT MAX: VOIE DE DROITE STRICTE
          </text>

          {/* Safety margin indicator to edge */}
          <line x1="160" y1="310" x2="160" y2="320" stroke="#a7adbb" strokeWidth="1" />
          <text x="170" y="318" fill="#a7adbb" fontSize="9" fontFamily="monospace">
            50 cm de marge (avaloirs &amp; débris)
          </text>

          {/* Direction of travel arrow */}
          <path d="M520 252L565 252" stroke="#e03e3e" strokeWidth="2.5" />
          <polygon points="565,248 575,252 565,256" fill="#e03e3e" />
          <text x="545" y="270" fill="#e03e3e" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            ALLURE GROUPÉE
          </text>

          {/* Cyclists 2-by-2 representation */}
          {/* Pair 1 - Head: Lead Captain + Co-Captain */}
          {/* Rider 1A (Outside left) */}
          <g transform="translate(480, 225)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#e03e3e" />
            <circle cx="-5" cy="0" r="3.5" fill="#ffffff" />
            <circle cx="7" cy="0" r="2.5" fill="#ffffff" />
            {/* Captain Badge */}
            <circle cx="0" cy="-9" r="4.5" fill="#e03e3e" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-7.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">C</text>
          </g>

          {/* Rider 1B (Inside right) */}
          <g transform="translate(480, 275)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#f5f6f8" />
            <circle cx="-5" cy="0" r="3.5" fill="#101216" />
            <circle cx="7" cy="0" r="2.5" fill="#101216" />
          </g>

          {/* Dimension line: Distance between rows */}
          <line x1="480" y1="235" x2="480" y2="265" stroke="#e03e3e" strokeWidth="1" strokeDasharray="2 2" />
          <text x="495" y="253" fill="#ffffff" fontSize="8" fontFamily="monospace">
            20-30 cm
          </text>

          {/* Pair 2 */}
          <g transform="translate(400, 225)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>
          <g transform="translate(400, 275)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>

          {/* Pair 3 */}
          <g transform="translate(320, 225)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>
          <g transform="translate(320, 275)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>

          {/* Pair 4 */}
          <g transform="translate(240, 225)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>
          <g transform="translate(240, 275)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>

          {/* Pair 5 - Rear: Tail Captain + Rider */}
          <g transform="translate(160, 225)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#e03e3e" />
            <circle cx="-5" cy="0" r="3.5" fill="#ffffff" />
            <circle cx="7" cy="0" r="2.5" fill="#ffffff" />
            {/* Captain Badge Rear */}
            <circle cx="0" cy="-9" r="4.5" fill="#e03e3e" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-7.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">C</text>
          </g>
          <g transform="translate(160, 275)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#3a3f4a" />
            <circle cx="-5" cy="0" r="3.5" fill="#a7adbb" />
            <circle cx="7" cy="0" r="2.5" fill="#a7adbb" />
          </g>

          {/* Safe following distance note */}
          <line x1="240" y1="210" x2="320" y2="210" stroke="#f5f6f8" strokeWidth="0.75" />
          <circle cx="240" cy="210" r="1.5" fill="#f5f6f8" />
          <circle cx="320" cy="210" r="1.5" fill="#f5f6f8" />
          <text x="280" y="205" fill="#f5f6f8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            Roue à roue: 30-50 cm
          </text>
        </svg>
      </div>

      {/* Diagram Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
        <div className="flex items-start gap-2">
          <span className="flex h-3 w-3 rounded-full bg-[#e03e3e] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#a7adbb] leading-tight">
            <strong className="text-white font-semibold">Capitaines assermentés (C) :</strong> vigie à l&apos;avant et serre-file à l&apos;arrière avec disque C3.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-3 w-3 rounded-full bg-[#3a3f4a] border border-white/30 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#a7adbb] leading-tight">
            <strong className="text-white font-semibold">Peloton groupé :</strong> 2 de front stricts, interdiction d&apos;empiéter sur la ligne blanche médiane.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#a7adbb] leading-tight">
            <strong className="text-white font-semibold">15 à 50 coureurs :</strong> dispense légale de piste cyclable lorsque la sécurité l&apos;exige.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Diagram showing the lethal danger of "Half-Wheeling" (Roue Croisée).
 */
export function HalfWheelingDiagram(): React.ReactElement {
  return (
    <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold text-[#101216] dark:text-white">
          Le Piège Mortel du « Demi-Roue » (Half-Wheeling)
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 self-start sm:self-auto shrink-0">
          80% des chutes collectives
        </span>
      </div>

      <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
        Croiser sa roue avant avec la roue arrière du coureur qui précède est la cause n°1 d&apos;accident collectif.
        Si le coureur de devant fait un écart de 5 cm pour éviter un nid-de-poule, sa roue arrière heurte votre roue avant :
        votre direction est fauchée instantanément et la chute est inévitable à haute vitesse.
      </p>

      {/* Schematic comparison: DANGER vs BONNE TRAJECTOIRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Wrong / Danger */}
        <div className="rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
            <span>INTERDIT : Roues Croisées</span>
            <span>✕ DANGER</span>
          </div>
          <div className="h-28 bg-white dark:bg-[#0a0c10] rounded border border-rose-200 dark:border-rose-900/40 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 260 100" className="w-full h-full" fill="none">
              {/* Leader bike */}
              <rect x="40" y="44" width="70" height="12" rx="3" fill="#7d8493" />
              <circle cx="45" cy="50" r="9" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <circle cx="105" cy="50" r="9" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <text x="75" y="32" fontSize="9" fontWeight="bold" fill="#101216" textAnchor="middle">Coureur devant</text>

              {/* Follower bike overlapping on the side */}
              <rect x="90" y="66" width="70" height="12" rx="3" fill="#e03e3e" />
              <circle cx="95" cy="72" r="9" stroke="#e03e3e" strokeWidth="2.5" fill="#fee2e2" />
              <circle cx="155" cy="72" r="9" stroke="#e03e3e" strokeWidth="2" fill="#faf8f5" />
              <text x="135" y="93" fontSize="9" fontWeight="bold" fill="#e03e3e" textAnchor="middle">Votre vélo (trop avancé)</text>

              {/* Collision overlap hotspot */}
              <circle cx="105" cy="62" r="14" stroke="#e03e3e" strokeWidth="2" strokeDasharray="3 3" fill="#ef4444" fillOpacity="0.2" />
              <text x="105" y="65" fontSize="8" fontWeight="bold" fill="#dc2626" textAnchor="middle">CONTACT</text>
            </svg>
          </div>
          <p className="text-[11px] text-rose-900 dark:text-rose-300 leading-tight">
            Votre roue avant est à la hauteur de son dérailleur. Vous n&apos;avez aucune marge de manœuvre.
          </p>
        </div>

        {/* Correct / Good */}
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span>CONFORME : Dans l&apos;Aspiration</span>
            <span>✓ SÉCURITÉ</span>
          </div>
          <div className="h-28 bg-white dark:bg-[#0a0c10] rounded border border-emerald-200 dark:border-emerald-900/40 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 260 100" className="w-full h-full" fill="none">
              {/* Leader bike */}
              <rect x="30" y="44" width="70" height="12" rx="3" fill="#7d8493" />
              <circle cx="35" cy="50" r="9" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <circle cx="95" cy="50" r="9" stroke="#101216" strokeWidth="2" fill="#faf8f5" />
              <text x="65" y="32" fontSize="9" fontWeight="bold" fill="#101216" textAnchor="middle">Coureur devant</text>

              {/* Follower bike directly behind */}
              <rect x="135" y="44" width="70" height="12" rx="3" fill="#10b981" />
              <circle cx="140" cy="50" r="9" stroke="#10b981" strokeWidth="2.5" fill="#ecfdf5" />
              <circle cx="200" cy="50" r="9" stroke="#10b981" strokeWidth="2" fill="#faf8f5" />
              <text x="170" y="32" fontSize="9" fontWeight="bold" fill="#059669" textAnchor="middle">Votre vélo (aligné)</text>

              {/* Safety corridor 30-50 cm */}
              <line x1="104" y1="50" x2="131" y2="50" stroke="#059669" strokeWidth="2" />
              <polygon points="104,47 98,50 104,53" fill="#059669" />
              <polygon points="131,47 137,50 131,53" fill="#059669" />
              <text x="117" y="70" fontSize="8" fontWeight="bold" fill="#059669" textAnchor="middle">30–50 cm</text>
            </svg>
          </div>
          <p className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-tight">
            Les axes de roues sont alignés dans le sillage aérodynamique sans jamais déborder latéralement.
          </p>
        </div>
      </div>
    </div>
  );
}

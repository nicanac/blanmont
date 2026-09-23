import React from 'react';
import TerritoryMap from './TerritoryMap';

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

/** Loading state of a page cartouche: the territory band prints first, the title block follows. */
export function SheetHeaderSkeleton({
  focus = { x: 50, y: 50 },
}: {
  focus?: { x: number; y: number };
}): React.ReactElement {
  return (
    <header
      className="relative border-b border-line bg-paper dark:border-night-line dark:bg-night"
      aria-busy="true"
    >
      <div
        className="relative h-32 overflow-hidden border-b border-line [--sheet:1500px] sm:h-40 sm:[--sheet:2300px] dark:border-night-line"
        style={{ '--fx': String(focus.x / 100), '--fy': String(focus.y / 100) } as CSSVars}
      >
        <TerritoryMap
          labels={0}
          marker="point"
          layers="relief"
          sheetClassName="w-(--sheet) left-[calc(50%-var(--sheet)*var(--fx))] top-[calc(50%-var(--sheet)*var(--fy))]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="neatline relative -mt-14 bg-white p-6 shadow-md sm:-mt-20 sm:p-10 dark:bg-night-2">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-3/4 max-w-xl rounded-sm bg-paper-2 dark:bg-night-3" />
            <div className="h-4 w-full max-w-2xl rounded-sm bg-paper-2 dark:bg-night-3" />
            <div className="h-4 w-2/3 max-w-xl rounded-sm bg-paper-2 dark:bg-night-3" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default SheetHeaderSkeleton;

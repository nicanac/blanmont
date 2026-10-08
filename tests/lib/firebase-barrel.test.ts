import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as firebaseBarrel from '@/app/lib/firebase';

describe('Firebase Barrel Export (app/lib/firebase/index.ts)', () => {
  it('does not re-export global domain types from app/types', () => {
    const barrelPath = path.resolve(__dirname, '../../app/lib/firebase/index.ts');
    const content = fs.readFileSync(barrelPath, 'utf-8');

    expect(content).not.toMatch(/export\s+\*\s+from\s+['"]\.\.\/\.\.\/types['"]/);
  });

  it('exports expected Firebase services and operations', () => {
    expect(firebaseBarrel.getMembers).toBeTypeOf('function');
    expect(firebaseBarrel.getTraces).toBeTypeOf('function');
    expect(firebaseBarrel.getCalendarEvents).toBeTypeOf('function');
    expect(firebaseBarrel.getLeaderboardEntries).toBeTypeOf('function');
    expect(firebaseBarrel.getAllAttendance).toBeTypeOf('function');
    expect(firebaseBarrel.getActiveWeekendPoll).toBeTypeOf('function');
    expect(firebaseBarrel.getBlogPosts).toBeTypeOf('function');
  });
});

import { describe, it, expect } from 'vitest';
import { toNormalized, exportSize } from '@/app/components/feedback/annotations';

describe('annotation helpers', () => {
  it('normalizes pointer coordinates to 0..1000 and clamps outside the box', () => {
    const box = { left: 100, top: 50, width: 400, height: 200 };
    expect(toNormalized(300, 150, box)).toEqual({ x: 500, y: 500 });
    expect(toNormalized(0, 0, box)).toEqual({ x: 0, y: 0 });
    expect(toNormalized(9999, 9999, box)).toEqual({ x: 1000, y: 1000 });
  });

  it('caps export width without upscaling', () => {
    expect(exportSize(2560, 1440)).toEqual({ width: 1280, height: 720 });
    expect(exportSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

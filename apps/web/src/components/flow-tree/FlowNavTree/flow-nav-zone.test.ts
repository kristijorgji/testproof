import type { ClientRect } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';

import { dropZoneFromPointer } from './flow-nav-zone';

function rect(left: number, top: number, width: number, height: number): ClientRect {
    return { left, top, width, height, right: left + width, bottom: top + height };
}

describe('dropZoneFromPointer', () => {
    const box = rect(0, 0, 200, 40);

    it('uses top band for before when not indented', () => {
        expect(dropZoneFromPointer(box, 20, 5, { depth: 0 })).toBe('before');
    });

    it('uses bottom band for after when not indented', () => {
        expect(dropZoneFromPointer(box, 20, 35, { depth: 0 })).toBe('after');
    });

    it('nests when pointer crosses the next indent threshold', () => {
        expect(dropZoneFromPointer(box, 50, 20, { depth: 0 })).toBe('child');
        expect(dropZoneFromPointer(box, 10, 20, { depth: 0 })).toBe('after');
    });
});

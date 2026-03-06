// two_ellipsoid_collide.test.ts

import { describe, test, expect } from 'bun:test';
import { two_ships_collision } from './obb'; // adjust path

describe('two_ellipsoid_collide (OBB approximation)', () => {
  test('identical overlapping spheres → true', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   5,5,5,5,
      0,0,0,   0,0,1,   0,1,0,   5,5,5,5
    );
    expect(result).toBe(true);
  });

  test('touching externally → true', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   3,3,3,3,
      6,0,0,   0,0,1,   0,1,0,   3,3,3,3
    );
    expect(result).toBe(true);
  });

  test('clearly separate → false', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   3,3,3,3,
      10,0,0,  0,0,1,   0,1,0,   3,3,3,3
    );
    expect(result).toBe(false);
  });

  test('one inside another → true', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   10,10,10,10,
      1,1,1,   0,0,1,   0,1,0,   2,2,2,2
    );
    expect(result).toBe(true);
  });

  test('rotated 90° touching → true', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   4,4,4,4,
      5,0,0,   1,0,0,   0,0,1,   4,4,4,4   // front = x-axis
    );
    expect(result).toBe(true);
  });

  test('rotated 90° clearly separate → false', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   4,4,4,4,
      12,0,0,  1,0,0,   0,0,1,   4,4,4,4
    );
    expect(result).toBe(false);
  });

  test('asymmetric front/back – touching front → true', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   6,2,4,4,    // long front
      7,0,0,   0,0,1,   0,1,0,   3,3,3,3
    );
    expect(result).toBe(true);
  });

  test('asymmetric front/back – separate → false', () => {
    const result = two_ships_collision(
      0,0,0,   0,0,1,   0,1,0,   6,2,4,4,
      10,0,0,  0,0,1,   0,1,0,   3,3,3,3
    );
    expect(result).toBe(false);
  });
});
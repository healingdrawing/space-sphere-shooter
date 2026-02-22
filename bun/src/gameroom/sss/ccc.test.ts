// cell_chain_control.test.ts
import { test, expect } from "bun:test";
import { cell_chain_control } from "./handle.ts";

test("cell_chain_control – all 4 directions (destination to origin order)", () => {
  // Helper to collect visited cells
  const collect = () => {
    const visited: string[] = [];
    const callback = (x: number, y: number) => visited.push(`${x},${y}`);
    return { visited, callback };
  };

  // 1. Right to Left: dest (8,5) to origin (2,5)
  const r1 = collect();
  cell_chain_control(8, 5, 2, 5, r1.callback);
  expect(r1.visited).toEqual([
    "8,5", "7,5", "6,5", "5,5", "4,5", "3,5", "2,5"
  ]);

  // 2. Left to Right: dest (1,3) to origin (8,3)
  const r2 = collect();
  cell_chain_control(1, 3, 8, 3, r2.callback);
  expect(r2.visited).toEqual([
    "1,3", "2,3", "3,3", "4,3", "5,3", "6,3", "7,3", "8,3"
  ]);

  // 3. Bottom to Top: dest (4,9) to origin (4,1)
  const r3 = collect();
  cell_chain_control(4, 9, 4, 1, r3.callback);
  expect(r3.visited).toEqual([
    "4,9", "4,8", "4,7", "4,6", "4,5", "4,4", "4,3", "4,2", "4,1"
  ]);

  // 4. Top to Bottom: dest (6,2) to origin (6,9)
  const r4 = collect();
  cell_chain_control(6, 2, 6, 9, r4.callback);
  expect(r4.visited).toEqual([
    "6,2", "6,3", "6,4", "6,5", "6,6", "6,7", "6,8", "6,9"
  ]);
});

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
const interval: fc.Arbitrary<Interval> = fc
  .tuple(fc.integer(), fc.integer())
  .map(([a, b]) => (a <= b ? [a, b] : [b, a]));
const intervalList = fc.array(interval);

//custom generators for touching and disjoint intervals, to use in differential and conditional properties
const touchingIntervalList: fc.Arbitrary<Interval[]> = fc
  .tuple(fc.integer({ min: -100, max: 100 }), fc.nat(10), fc.nat(10))
  .map(([start, firstLength, secondLength]) => {
    const touchingPoint = start + firstLength;
    return [
      [start, touchingPoint],
      [touchingPoint, touchingPoint + secondLength],
    ];
  });



// Construct sorted intervals with a gap between each pair. The first two
// intervals are adjacent by one so this also exercises the closed-interval
// boundary that must not be merged.
const disjointIntervalList: fc.Arbitrary<Interval[]> = fc
  .tuple(
    fc.integer({ min: -100, max: 100 }),
    fc.nat(10),
    fc.nat(10),
    fc.array(fc.tuple(fc.nat(10), fc.nat(10)), { maxLength: 5 }),
  )
  .map(([firstStart, firstLength, secondLength, rest]) => {
    const result: Interval[] = [];
    let nextStart = firstStart;

    const lengthsAndGaps: Array<[number, number]> = [
      [firstLength, 0],
      [secondLength, 0],
      ...rest,
    ];

    for (const [length, gap] of lengthsAndGaps) {
      const end = nextStart + length;
      result.push([nextStart, end]);
      nextStart = end + gap + 1;
    }

    return result;
  });

const covers = (intervals: readonly Interval[], point: number): boolean =>
  intervals.some(([start, end]) => start <= point && point <= end);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  //invariant: the output is sorted
  // Pattern: invariant. The output is sorted.
  it('returns sorted output', () => {
    fc.assert(
      fc.property(fc.oneof(intervalList, touchingIntervalList), xs => {
        const out = mergeIntervals(xs);

        for (let i = 1; i < out.length; i += 1) {
          expect(out[i - 1][0]).toBeLessThanOrEqual(out[i][0]);
        }
      }),
    );
  });

  //differential: output shouldnt have overlaps
  // Pattern: differential. The output has no overlapping or touching intervals.
  it('returns non-overlapping output', () => {
    fc.assert(
      fc.property(fc.oneof(intervalList, touchingIntervalList), fc.integer(), (xs, point) => {
        const out = mergeIntervals(xs);

        for (let i = 1; i < out.length; i += 1) {
          expect(out[i - 1][1]).toBeLessThan(out[i][0]);
        }

        expect(covers(out, point)).toBe(covers(xs, point));
      }),
    );
  });

  //metamorphic: adding a duplicate of whats already in the list shouldnt change output
  // Pattern: metamorphic. Duplicating every input interval does not change the output.
  it('is unchanged when input intervals are duplicated', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const before = xs.map(([start, end]) => [start, end] as Interval);
        const duplicated = [
          ...xs,
          ...xs.map(([start, end]) => [start, end] as Interval),
        ];
        expect(mergeIntervals(duplicated)).toEqual(mergeIntervals(xs));
        expect(xs).toEqual(before);
      }),
    );
  });

  //algebraic: if alr merged, merging again gives the same thing
  // Pattern: algebraic. Merging an already merged result is idempotent.
  it('is idempotent', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const merged = mergeIntervals(xs);
        expect(mergeIntervals(merged)).toEqual(merged);
      }),
    );
  });

  //conditional: if no overlap, input is output
  // Pattern: conditional. A sorted input with no overlapping or touching intervals is unchanged.
  it('leaves already-disjoint input unchanged', () => {
    fc.assert(
      fc.property(disjointIntervalList, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });

});

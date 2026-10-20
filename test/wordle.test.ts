import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
//const word = ...

const wordFrom = (letters:string) =>
  fc.array(fc.constantFrom(...letters), {minLength: 5, maxLength: 5}).map(cs => cs.join(''));
const word = wordFrom(ALPHABET); //ABC?




describe('matchGuess', () => {
  //it.todo('returns exactly five colors');
  it('returns exactly 5 letters', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        expect(matchGuess(secret, guess)).toHaveLength(5)
      })
    )
  })







  // Pattern: invariant. The result only uses the colors G, Y, B.
  it('only uses the colors G, Y, B', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        const result = matchGuess(secret, guess);
        for (const color of result) {
          expect(['G', 'Y', 'B']).toContain(color);
        }
      })
    )
  });

  //it.todo('guessing the secret gives all greens');
  it('guess secret gives all greens', () => {
    fc.assert(
      fc.property(word, (secret) => {

        const result = matchGuess(secret, secret);

        expect(result).toEqual(['G','G','G','G','G']);


      })
    )
  });




  //it.todo('never credits a letter more times than the secret contains it');
  it('never credits more times', ()=> {
    fc.assert(
      fc.property(word, word, (secret, guess) => {

        const result = matchGuess(secret, guess);
        const secretCounts: Record<string, number> = {};
        for (const letter of secret) {
          secretCounts[letter] = (secretCounts[letter] || 0) + 1;
        }

        const guessCounts: Record<string, number> = {};
        for (let i = 0; i < guess.length; i++) {
          if (result[i] === 'G' || result[i] === 'Y') {
            const letter = guess[i];
            guessCounts[letter] = (guessCounts[letter] || 0) + 1;
          }
        }

        for (const letter in guessCounts) {
          expect(guessCounts[letter]).toBeLessThanOrEqual(secretCounts[letter] || 0);
        }
      })
    )
  })

});

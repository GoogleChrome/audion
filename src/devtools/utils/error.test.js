import {describe, expect, it} from '@jest/globals';

import {invariant, InvariantError} from './error';

describe('invariant', () => {
  it('does not throw when correct', () => {
    invariant(true, 'always passes');
  });
  it('does throw when incorrect', () => {
    expect(() => {
      invariant(false, 'always fails');
    }).toThrowError(InvariantError);
  });
  it('replaces %(\\d) with indexed variable argument', () => {
    expect(() => {
      invariant(false, 'replaces %%%% with %%');
    }).toThrowError('replaces %% with %');
    expect(() => {
      invariant(false, 'replaces %%0 with first arg %0', '"first"');
    }).toThrowError('replaces %0 with first arg "first"');
  });
});

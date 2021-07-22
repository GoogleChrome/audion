import {describe, expect, it, jest} from '@jest/globals';

import {retry} from './retry';

describe('retry', () => {
  it('returns value if first attempt succeeds', async () => {
    await expect(retry(() => 'answer 0')).resolves.toBe('answer 0');
  });
  it('returns value after failed attempts', async () => {
    await expect(
      retry(
        jest
          .fn()
          .mockImplementationOnce(() => {
            throw new Error('reason 0');
          })
          .mockImplementationOnce(() => 'answer 1'),
      ),
    ).resolves.toBe('answer 1');
  });
  it('returns last error if no attempt succeeds', async () => {
    let i = 0;
    const func = jest.fn(() => {
      throw new Error(`reason ${i++}`);
    });
    await expect(retry(func)).rejects.toMatchObject({message: 'reason 9'});
    expect(func).toBeCalledTimes(10);
  });
  it('tries after a timeout', async () => {
    let i = 0;
    const func = jest.fn(() => {
      throw new Error(`reason ${i++}`);
    });
    const timeout = jest.fn(() => Promise.resolve());
    const retryPromise = retry(func, {timeout});
    expect(timeout).toBeCalledTimes(1);
    await expect(retryPromise).rejects.toMatchObject({message: 'reason 9'});
    expect(timeout).toBeCalledTimes(9);
  });
  it('tries n times', async () => {
    let i = 0;
    const func = jest.fn(() => {
      throw new Error(`reason ${i++}`);
    });
    await expect(retry(func, {times: 2})).rejects.toMatchObject({
      message: 'reason 1',
    });
    expect(func).toBeCalledTimes(2);
  });
});

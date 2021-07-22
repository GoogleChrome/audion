/**
 * @param {function(): PromiseLike<T> | T} fn
 * @param {Utils.RetryOptions} options
 * @return {Promise<T>}
 * @template T
 * @memberof Utils
 * @alias retry
 */
export async function retry(
  fn,
  {timeout = () => Promise.resolve(), times = 10} = {},
) {
  try {
    return await fn();
  } catch (err) {
    if (times > 1) {
      await timeout();
      return retry(fn, {timeout, times: times - 1});
    }
    throw err;
  }
}

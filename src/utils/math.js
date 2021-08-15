import {invariant} from './error';

/**
 * Clamp a value between two extremes.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export function clamp(value, min, max) {
  invariant(min <= max, 'clamp(_, min, max): min is less than max');
  invariant(max >= min, 'clamp(_, min, max): max is greater than min');
  return Math.min(Math.max(value, min), max);
}

/**
 * Truncate a number at nth digit.
 *
 * trunc(111.111, 2) returns 100
 * trunc(111.111, -2) returns 111.11
 * @param {number} value
 * @param {number} digits a whole number digit to truncate at
 * @return {number}
 */
export function trunc(value, digits) {
  const factor = Math.pow(10, digits);
  return Math.floor(value / factor) * factor;
}

import {describe, expect, it, jest} from '@jest/globals';

import {InvariantError} from './error';
import {Observer} from './Observer';
import {retry} from './retry';

describe('Observer', () => {
  it('observes values', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = new Observer(subscribeMock);
    o.observe(nextMock);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])('value');
    expect(nextMock).toBeCalledWith('value');
  });

  it('observes completion', () => {
    const subscribeMock = jest.fn();
    const completeMock = jest.fn();
    const o = new Observer(subscribeMock);
    o.observe(() => {}, completeMock);
    /** @type {function} */ (subscribeMock.mock.calls[0][1])();
    expect(completeMock).toBeCalledWith();
  });

  it('observes errors', () => {
    const subscribeMock = jest.fn();
    const errorMock = jest.fn();
    const o = new Observer(subscribeMock);
    o.observe(
      () => {},
      () => {},
      errorMock,
    );
    /** @type {function} */ (subscribeMock.mock.calls[0][2])('reason');
    expect(errorMock).toBeCalledWith('reason');
  });

  it('subscribes when first observed', () => {
    const subscribeMock = jest.fn();
    const o = new Observer(subscribeMock);
    expect(subscribeMock).toBeCalledTimes(0);
    o.observe(() => {});
    expect(subscribeMock).toBeCalledTimes(1);
    o.observe(() => {});
    expect(subscribeMock).toBeCalledTimes(1);
  });

  it('unsubscribes when last observer unsubscribes', () => {
    const unsubscribeMock = jest.fn();
    const o = new Observer(jest.fn().mockReturnValue(unsubscribeMock));
    expect(unsubscribeMock).toBeCalledTimes(0);
    const unsubscribe1 = o.observe(() => {});
    expect(unsubscribeMock).toBeCalledTimes(0);
    const unsubscribe2 = o.observe(() => {});
    expect(unsubscribeMock).toBeCalledTimes(0);
    unsubscribe2();
    expect(unsubscribeMock).toBeCalledTimes(0);
    unsubscribe1();
    expect(unsubscribeMock).toBeCalledTimes(1);
  });
});

describe('Observer.throttle', () => {
  it('must throw when observing non-object or null', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock));
    o.observe(nextMock);
    expect(() => {
      /** @type {function} */ (subscribeMock.mock.calls[0][0])('value');
    }).toThrowError(InvariantError);
    expect(() => {
      /** @type {function} */ (subscribeMock.mock.calls[0][0])('value');
    }).toThrowError(
      'Observer.throttle must observe non-null objects. Received: string',
    );
    expect(() => {
      /** @type {function} */ (subscribeMock.mock.calls[0][0])(null);
    }).toThrowError(InvariantError);
    expect(() => {
      /** @type {function} */ (subscribeMock.mock.calls[0][0])(null);
    }).toThrowError(
      'Observer.throttle must observe non-null objects. Received: null',
    );
  });

  it('immediately sends first value when no throttle is running', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledWith(value);
  });

  it('calls key option', async () => {
    const subscribeMock = jest.fn();
    const keyMock = jest.fn(({key}) => key);
    const o = Observer.throttle(new Observer(subscribeMock), {
      key: keyMock,
    });
    o.observe(() => {});
    const value = {key: 'key'};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(keyMock).toBeCalledWith(value);
    expect(keyMock).toReturnWith(value.key);
  });

  it('calls timeout option', async () => {
    const subscribeMock = jest.fn();
    const timeoutMock = jest.fn().mockImplementation(() => Promise.resolve());
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: timeoutMock,
    });
    o.observe(() => {});
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(timeoutMock).toBeCalledTimes(1);
  });

  it('sends a second value after a throttle timer', async () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledTimes(1);
    expect(nextMock).nthCalledWith(1, value);
    await retry(() => expect(nextMock).toBeCalledTimes(2));
    expect(nextMock).nthCalledWith(2, value);
  });

  it('calls default timeout option', async () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock));
    o.observe(nextMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledTimes(1);
    await retry(() => expect(nextMock).toBeCalledTimes(2), {
      timeout: () => new Promise((resolve) => setTimeout(resolve, 5)),
    });
    expect(nextMock).nthCalledWith(2, value);
  });

  it('skips second and sends a third value during a timer', async () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledTimes(1);
    expect(nextMock).nthCalledWith(1, value);
    await retry(() => expect(nextMock).toBeCalledTimes(2));
    expect(nextMock).nthCalledWith(2, value);
  });

  it('throttles per object value', async () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock);
    const value1 = {};
    const value2 = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value1);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value2);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value1);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value2);
    expect(nextMock).toBeCalledTimes(2);
    expect(nextMock).nthCalledWith(1, value1);
    expect(nextMock).nthCalledWith(2, value2);
    await retry(() => expect(nextMock).toBeCalledTimes(4));
    expect(nextMock).nthCalledWith(3, value1);
    expect(nextMock).nthCalledWith(4, value2);
  });

  it('flushes most recent messages before completing', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const completeMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock, completeMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledTimes(1);
    expect(nextMock).nthCalledWith(1, value);
    /** @type {function} */ (subscribeMock.mock.calls[0][1])();
    expect(nextMock).toBeCalledTimes(2);
    expect(nextMock).nthCalledWith(2, value);
    expect(completeMock).toBeCalledTimes(1);
  });

  it('flushes most recent messages before error', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const errorMock = jest.fn();
    const o = Observer.throttle(new Observer(subscribeMock), {
      timeout: () => Promise.resolve(),
    });
    o.observe(nextMock, () => {}, errorMock);
    const value = {};
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])(value);
    expect(nextMock).toBeCalledTimes(1);
    expect(nextMock).nthCalledWith(1, value);
    /** @type {function} */ (subscribeMock.mock.calls[0][2])('reason');
    expect(nextMock).toBeCalledTimes(2);
    expect(nextMock).nthCalledWith(2, value);
    expect(errorMock).toBeCalledTimes(1);
    expect(errorMock).toBeCalledWith('reason');
  });
});

describe('Observer.transform', () => {
  it('observes value returned by transform', () => {
    const subscribeMock = jest.fn();
    const nextMock = jest.fn();
    const o = Observer.transform(
      new Observer(subscribeMock),
      (value) => 'key: ' + value,
    );
    o.observe(nextMock);
    /** @type {function} */ (subscribeMock.mock.calls[0][0])('value');
    expect(nextMock).toBeCalledWith('key: value');
  });
});

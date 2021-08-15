/// <reference path="Types.js" />

import {invariant} from './error';

/* istanbul ignore next */
/**
 * Do nothing.
 * @param {Array} args
 * @memberof Utils.Observer
 */
function noop(...args) {}

/**
 * @param {Promise<T>} promise
 * @return {Utils.CancelablePromise<T>}
 * @template T
 * @memberof Utils
 * @alias makeCancelable
 */
function makeCancelable(promise) {
  let cancel = noop;
  const cancelablePromise = Promise.race([
    promise.then((value) => ({value, canceled: false})),
    new Promise((resolve) => (cancel = resolve)).then(() => ({canceled: true})),
  ]);
  return {
    promise: cancelablePromise,
    cancel,
  };
}

/**
 * Implementation of the observer idiom.
 *
 * @implements {Utils.Observer<T>}
 * @template T
 * @memberof Utils
 * @alias Observer
 */
export class Observer {
  /**
   * @param {Utils.SubscribeCallback<T>} subscribe
   */
  constructor(subscribe) {
    this.subscribe = subscribe;
    /** @type {function | null} */
    this._unsubscribeParent = null;
    this.handles = [];

    this._onNext = this._onNext.bind(this);
    this._onComplete = this._onComplete.bind(this);
    this._onError = this._onError.bind(this);
  }

  /**
   * @param {Utils.Observer<T1>} target
   * @param {function(T1): T2} onTransform
   * @return {Observer<T2>}
   * @template T1
   * @template T2
   */
  static transform(target, onTransform) {
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        onNext(onTransform(value));
      }, ...args);
    });
  }

  /**
   * @param {Utils.Observer<T>} target
   * @param {function(T): boolean} testFunc
   * @return {Observer<T>}
   * @template T
   */
  static filter(target, testFunc) {
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        if (testFunc(value)) {
          onNext(value);
        }
      });
    });
  }

  /**
   * @param {Utils.Observer<T>} target
   * @param {function(R, T): R} reducer
   * @param {R} initial
   * @return {Utils.Observer<R>}
   * @template T
   * @template R
   */
  static reduce(target, reducer, initial) {
    let latest = initial;
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        latest = reducer(latest, value);
        onNext(latest);
      }, ...args);
    });
  }

  /**
   * @param {Utils.Observer<T>} target
   * @param {Utils.ThrottleObserverOptions<T>} [options]
   * @return {Observer<T>}
   * @template T
   */
  static throttle(target, options) {
    return new ThrottleObserver(target, options);
  }

  /**
   * Immediately observe a value to any new subscribe.
   * @param {Observer<T1>} target
   * @param {function(): T2} onSubscribe
   * @return {Observer<T1 | T2>}
   * @template T1
   * @template T2
   */
  static onSubscribe(target, onSubscribe) {
    return new SubscribeImmediateObserver(target, onSubscribe);
  }

  /**
   * @param {Object<string, Utils.Observer<*>>} props
   * @param {T} latest
   * @return {Utils.Observer<T>}
   * @template T
   */
  static props(props, latest) {
    return new Observer((onNext, onComplete, onError) => {
      const unsubscribes = [];
      for (const [key, prop] of Object.entries(props)) {
        unsubscribes.push(
          prop.observe(
            (value) => {
              latest = {...latest, [key]: value};
              onNext(latest);
            },
            onComplete,
            onError,
          ),
        );
      }
      return () => {
        for (const unsubscribe of unsubscribes) {
          unsubscribe();
        }
      };
    });
  }

  /**
   * @param {Utils.SubscribeOnNext<T>} onNext
   * @param {function(): void} [onComplete]
   * @param {function(*): void} [onError]
   * @return {function(): void} unsubscribe
   */
  observe(onNext, onComplete = noop, onError = noop) {
    this._subscribeToParent();
    const handles = {onNext, onComplete, onError};
    this.handles.push(handles);
    return () => {
      this.handles.splice(this.handles.indexOf(handles), 1);
      this._unsubscribeFromParent();
    };
  }

  /**
   * @protected
   * @param {T} message
   */
  _onNext(message) {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onNext(message);
    }
  }
  /**
   * @protected
   */
  _onComplete() {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onComplete();
    }
  }
  /**
   * @protected
   * @param {*} reason
   */
  _onError(reason) {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onError(reason);
    }
  }

  /**
   * Subscribe to parent.
   * @protected
   */
  _subscribeToParent() {
    if (this.handles.length === 0) {
      this._unsubscribeParent = this.subscribe(
        this._onNext,
        this._onComplete,
        this._onError,
      );
    }
  }
  /**
   * Unsubscribe from parent.
   * @protected
   */
  _unsubscribeFromParent() {
    if (this.handles.length === 0) {
      this._unsubscribeParent();
      this._unsubscribeParent = null;
    }
  }
}

/**
 * Throttle repeated observed messages.
 * @extends {Observer<T>}
 * @template T
 * @memberof Utils
 * @alias ThrottleObserver
 */
export class ThrottleObserver extends Observer {
  /**
   * Create a ThrottleObserver.
   * @param {Utils.Observer<T>} target
   * @param {Utils.ThrottleObserverOptions<T>} [options]
   */
  constructor(
    target,
    {
      key = (obj) => obj,
      timeout = () => new Promise((resolve) => setTimeout(resolve, 16)),
    } = {},
  ) {
    /**
     * @type {Map<*, {cancel: function(): void,
     *   active: boolean,
     *   value: T}>}
     */
    const timerMap = new Map();
    super((onNext, onComplete, onError) => {
      /**
       * @param {T} message
       */
      const onThrottleNext = (message) => {
        invariant(
          typeof message === 'object' && message !== null,
          'Observer.throttle must observe non-null objects. Received: %0',
          message === null ? 'null' : typeof message,
        );
        const timerKey = key(message);
        if (timerMap.has(timerKey)) {
          const timer = timerMap.get(timerKey);
          timer.active = true;
          timer.value = message;
        } else {
          const timer = {cancel: noop, active: false, value: null};
          (async () => {
            timerMap.set(timerKey, timer);

            const {promise, cancel} = makeCancelable(timeout());
            timer.cancel = cancel;

            const {canceled} = await promise;

            timerMap.delete(timerKey);
            if (!canceled && timer.active) {
              onThrottleNext(timer.value);
            }
          })();

          onNext(message);
        }
      };
      return target.observe(
        onThrottleNext,
        () => {
          this._flush();
          onComplete();
        },
        (reason) => {
          this._flush();
          onError(reason);
        },
      );
    });

    /**
     * @private
     */
    this._timerMap = timerMap;
  }

  /**
   * Flush remaining timers.
   * @private
   */
  _flush() {
    for (const timer of this._timerMap.values()) {
      invariant(
        timer.active,
        'Observer throttle timer must be active when flushing',
      );
      this._onNext(timer.value);
      timer.cancel();
    }
    this._timerMap.clear();
  }
}

/**
 * Immediately observe a value to any new subscriber.
 * @template T1
 * @template T2
 * @extends {Observer<T1 | T2>}
 */
export class SubscribeImmediateObserver extends Observer {
  /**
   * Create an SubscribeImmediateObserver.
   * @param {Observer<T1>} target
   * @param {function(): T2} onSubscribe
   */
  constructor(target, onSubscribe) {
    super((onNext, onComplete, onError) =>
      target.observe(onNext, onComplete, onError),
    );

    this.onSubscribe = onSubscribe;
  }
  /**
   * @param {Utils.SubscribeOnNext<T1 | T2>} onNext
   * @param {function(): void} [onComplete]
   * @param {function(*): void} [onError]
   * @return {function(): void} unsubscribe
   */
  observe(onNext, onComplete, onError) {
    onNext(this.onSubscribe());
    return super.observe(onNext, onComplete, onError);
  }
}

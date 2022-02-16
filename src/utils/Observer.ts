import {Utils} from './Types';

import {invariant} from './error';

/* istanbul ignore next */
/**
 * Do nothing.
 * @param args
 * @memberof Utils.Observer
 */
function noop(...args: any) {}

/**
 * @param promise
 * @memberof Utils
 * @alias makeCancelable
 */
function makeCancelable<T>(promise: Promise<T>): Utils.CancelablePromise<T> {
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
 * @memberof Utils
 * @alias Observer
 */
export class Observer<T> implements Utils.Observer<T> {
  subscribe: Utils.SubscribeCallback<T>;
  _unsubscribeParent: (...args: any) => any;
  handles: {onNext; onComplete; onError}[];

  constructor(subscribe: Utils.SubscribeCallback<T>) {
    this.subscribe = subscribe;
    /** @type {function | null} */
    this._unsubscribeParent = null;
    this.handles = [];

    this._onNext = this._onNext.bind(this);
    this._onComplete = this._onComplete.bind(this);
    this._onError = this._onError.bind(this);
  }

  static transform<T1, T2>(
    target: Utils.Observer<T1>,
    onTransform: (value: T1) => T2,
  ): Utils.Observer<T2> {
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        onNext(onTransform(value));
      }, ...args);
    });
  }

  static filter<T>(
    target: Utils.Observer<T>,
    testFunc: (value: T) => boolean,
  ): Utils.Observer<T> {
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        if (testFunc(value)) {
          onNext(value);
        }
      });
    });
  }

  static reduce<T, R>(
    target: Utils.Observer<T>,
    reducer: (accum: R, value: T) => R,
    initial: R,
  ): Utils.Observer<R> {
    let latest = initial;
    return new Observer((onNext, ...args) => {
      return target.observe((value) => {
        latest = reducer(latest, value);
        onNext(latest);
      }, ...args);
    });
  }

  static throttle<T>(
    target: Utils.Observer<T>,
    options?: Utils.ThrottleObserverOptions<T>,
  ): Utils.Observer<T> {
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
  static onSubscribe<T1, T2>(
    target: Utils.Observer<T1>,
    onSubscribe: () => T2,
  ): Utils.Observer<T1 | T2> {
    return new SubscribeImmediateObserver(target, onSubscribe);
  }

  static props<T extends {[key: string]: any}>(
    props: {[key in keyof T]: Utils.Observer<T[key]>},
    latest: T,
  ): Utils.Observer<T> {
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

  observe(
    onNext: (value: T) => void,
    onComplete: () => void = noop,
    onError: (error: Error) => void = noop,
  ): () => void {
    this._subscribeToParent();
    const handles = {onNext, onComplete, onError};
    this.handles.push(handles);
    return () => {
      this.handles.splice(this.handles.indexOf(handles), 1);
      this._unsubscribeFromParent();
    };
  }

  protected _onNext(message: T): void {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onNext(message);
    }
  }

  protected _onComplete(): void {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onComplete();
    }
  }

  protected _onError(reason: any): void {
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].onError(reason);
    }
  }

  /**
   * Subscribe to parent.
   */
  protected _subscribeToParent(): void {
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
   */
  protected _unsubscribeFromParent(): void {
    if (this.handles.length === 0) {
      this._unsubscribeParent();
      this._unsubscribeParent = null;
    }
  }
}

/**
 * Throttle repeated observed messages.
 * @memberof Utils
 * @alias ThrottleObserver
 */
export class ThrottleObserver<T> extends Observer<T> {
  private _timerMap: Map<any, {cancel(): void; active: boolean; value: T}>;

  /**
   * Create a ThrottleObserver.
   */
  constructor(
    target: Utils.Observer<T>,
    {
      key = (obj) => obj,
      timeout = () => new Promise((resolve) => setTimeout(resolve, 16)),
    } = {} as Utils.ThrottleObserverOptions<T>,
  ) {
    const timerMap = new Map() as Map<
      any,
      {cancel(): void; active: boolean; value: T}
    >;
    super((onNext, onComplete, onError) => {
      /**
       * @param {T} message
       */
      const onThrottleNext = (message: T) => {
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

    this._timerMap = timerMap;
  }

  /**
   * Flush remaining timers.
   */
  private _flush() {
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
 */
export class SubscribeImmediateObserver<T1, T2> extends Observer<T1 | T2> {
  onSubscribe: () => T2;

  /**
   * Create an SubscribeImmediateObserver.
   */
  constructor(target: Utils.Observer<T1>, onSubscribe: () => T2) {
    super((onNext, onComplete, onError) =>
      target.observe(onNext, onComplete, onError),
    );

    this.onSubscribe = onSubscribe;
  }

  observe(
    onNext: (value: T1 | T2) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
  ): () => void {
    onNext(this.onSubscribe());
    return super.observe(onNext, onComplete, onError);
  }
}

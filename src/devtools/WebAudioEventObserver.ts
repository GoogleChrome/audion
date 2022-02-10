import {
  BehaviorSubject,
  catchError,
  concat,
  defer,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  ObservedValueOf,
  of,
  scan,
  share,
  tap,
} from 'rxjs';

import {chrome} from '../chrome';
import {Methods} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';
import {Audion} from './Types';

const debuggerVersion = '1.3';
const {tabId} = chrome.devtools.inspectedWindow;

/**
 * @memberof Audion
 * @alias WebAudioEventObserver
 */
export class WebAudioEventObserver extends Observer<Audion.WebAudioEvent> {
  permission: PermissionSubject;
  attachInterest: CounterSubject;
  eventInterest: CounterSubject;

  /**
   * Observe WebAudio events from chrome.debugger.
   */
  constructor() {
    super((onNext, ...args) => {
      /**
       * @param {Chrome.DebuggerDebuggee} debuggeeId
       * @param {ChromeDebuggerWebAudioDomain.EventName} method
       * @param {ChromeDebuggerWebAudioDomain.Event} params
       */
      const onEvent = (debuggeeId, method, params) => {
        onNext({method, params});
      };
      const onDetach = () => {
        // TODO: Show a warning if the DevTools are still open and allow the
        // user to re-attach manually, e.g. by pressing a button.
        // See: https://developer.chrome.com/docs/extensions/reference/debugger/#type-DetachReason
      };

      chrome.debugger.onDetach.addListener(onDetach);
      chrome.debugger.onEvent.addListener(onEvent);

      this.attachInterest.increment();
      this.eventInterest.increment();

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);

        this.eventInterest.decrement();
        this.attachInterest.decrement();
      };
    });

    const permission = (this.permission = new PermissionSubject());

    const attachInterest = (this.attachInterest = new CounterSubject(0));

    const attachSubject = new AttachStateSubject();

    const eventInterest = (this.eventInterest = new CounterSubject(0));

    const eventSubject = new EventStateSubject();

    const debuggerState = merge(
      permission.pipe(map((permission) => ({permission}))),
      attachInterest.pipe(map((attachInterest) => ({attachInterest}))),
      attachSubject.pipe(map((attachState) => ({attachState}))),
      eventInterest.pipe(map((eventInterest) => ({eventInterest}))),
      eventSubject.pipe(map((eventState) => ({eventState}))),
    ).pipe(
      scan((accum, value) => ({...accum, ...value}), {
        permission: AttachPermission.UNKNOWN,
        attachInterest: 0,
        attachState: AttachState.DETACHED,
        eventInterest: 0,
        eventState: EventState.DISABLED,
      }),
      distinctUntilChanged(
        (previous, current) =>
          previous.permission === current.permission &&
          previous.attachInterest === current.attachInterest &&
          previous.attachState === current.attachState &&
          previous.eventInterest === current.eventInterest &&
          previous.eventState === current.eventState,
      ),
      share(),
    );

    debuggerState.subscribe({
      next: (state) => {
        if (
          state.permission === AttachPermission.TEMPORARY &&
          state.attachInterest > 0
        ) {
          attachSubject.attach();
        } else {
          attachSubject.detach();
        }
      },
    });

    onDebuggerDetach.subscribe({
      next([, reason]) {
        if (reason === 'canceled_by_user') {
          permission.reject();
        }
        attachSubject.next(AttachState.DETACHED);
      },
    });

    debuggerState.subscribe({
      next(state) {
        if (
          state.attachState === AttachState.ATTACHED &&
          state.eventInterest > 0
        ) {
          eventSubject.enable();
        } else {
          if (state.attachState === AttachState.ATTACHED) {
            eventSubject.disable();
          } else {
            eventSubject.next(EventState.DISABLED);
          }
        }
      },
    });
  }

  /** Attaches the chrome.debugger to start observing events. */
  attach() {
    this.permission.grantTemporary();
  }
}

enum AttachState {
  DETACHING = 'detaching',
  DETACHED = 'detached',
  ATTACHING = 'attaching',
  ATTACHED = 'attached',
}

function bindChromeCallback<P extends any[]>(
  method: (...args: [...params: P, callback: () => void]) => void,
  thisArg = null,
) {
  return (...args: P) =>
    new Observable<void>((subscriber) => {
      method.call(thisArg, ...args, () => {
        if (chrome.runtime.lastError) {
          subscriber.error(chrome.runtime.lastError);
        } else {
          subscriber.complete();
        }
      });
    });
}
function fromChromeEvent<A extends any[]>(
  event: Chrome.Event<(...args: A) => any>,
) {
  return new Observable<A>((subscriber) => {
    const listener = (...args: A) => {
      subscriber.next(args);
    };
    event.addListener(listener);
    return () => {
      event.removeListener(listener);
    };
  });
}

const attach = bindChromeCallback(chrome.debugger.attach, chrome.debugger);
const detach = bindChromeCallback(chrome.debugger.detach, chrome.debugger);
const sendCommand = bindChromeCallback(
  chrome.debugger.sendCommand as (
    target: Chrome.DebuggerDebuggee,
    method: typeof Methods[string],
    params?,
    callback?,
  ) => void,
  chrome.debugger,
);

const onDebuggerDetach = fromChromeEvent<
  [target: Chrome.DebuggerDebuggee, reason: string]
>(chrome.debugger.onDetach);

enum AttachPermission {
  UNKNOWN,
  TEMPORARY,
  REJECTED,
}

enum EventState {
  DISABLING,
  DISABLED,
  ENABLING,
  ENABLED,
}

class PermissionSubject extends BehaviorSubject<AttachPermission> {
  constructor() {
    super(AttachPermission.UNKNOWN);
  }

  grantTemporary() {
    if (this.value === AttachPermission.UNKNOWN) {
      this.next(AttachPermission.TEMPORARY);
    }
  }

  reject() {
    if (this.value !== AttachPermission.REJECTED) {
      this.next(AttachPermission.REJECTED);
    }
  }
}

abstract class TransitionSubject<T> extends BehaviorSubject<T> {
  transition(options: {
    expectState: T;
    transitionState: T;
    finalState: T;
    errorState?: T;
    transit: () => Observable<void>;
  }) {
    if (this.value === options.expectState) {
      concat(
        of(options.transitionState),
        options.transit(),
        defer(() =>
          this.value === options.transitionState
            ? of(options.finalState)
            : of(),
        ),
      )
        .pipe(
          catchError((err) =>
            of(
              this.value === options.transitionState
                ? options.errorState || options.expectState
                : options.expectState,
            ),
          ),
        )
        .subscribe({next: this.next.bind(this)});
    }
  }
}

class AttachStateSubject extends TransitionSubject<AttachState> {
  private readonly attachTransition = {
    expectState: AttachState.DETACHED,
    transitionState: AttachState.ATTACHING,
    transit: () => attach({tabId}, debuggerVersion),
    finalState: AttachState.ATTACHED,
  };

  private readonly detachTransition = {
    expectState: AttachState.ATTACHED,
    transitionState: AttachState.DETACHING,
    finalState: AttachState.DETACHED,
    transit: () => detach({tabId}),
  };

  constructor() {
    super(AttachState.DETACHED);
  }

  attach() {
    this.transition(this.attachTransition);
  }

  detach() {
    this.transition(this.detachTransition);
  }
}

class EventStateSubject extends TransitionSubject<EventState> {
  private readonly enableTransition = {
    expectState: EventState.DISABLED,
    transitionState: EventState.ENABLING,
    finalState: EventState.ENABLED,
    transit: () => sendCommand({tabId}, Methods.enable),
  };

  private readonly disableTransition = {
    expectState: EventState.ENABLED,
    transitionState: EventState.DISABLING,
    finalState: EventState.DISABLED,
    errorState: EventState.DISABLED,
    transit: () => sendCommand({tabId}, Methods.disable),
  };

  constructor() {
    super(EventState.DISABLED);
  }

  enable() {
    this.transition(this.enableTransition);
  }

  disable() {
    this.transition(this.disableTransition);
  }
}

class CounterSubject extends BehaviorSubject<number> {
  increment() {
    this.next(this.value + 1);
  }

  decrement() {
    this.next(this.value - 1);
  }
}

function props<
  T extends {[key: string]: Observable<any>},
  R extends {[key in keyof T]: ObservedValueOf<T[key]>},
>(
  source: T,
  initialValue: R = (Object.keys(source) as (keyof T)[]).reduce(
    (accum, key) => {
      accum[key] = undefined;
      return accum;
    },
    {} as R,
  ),
): Observable<R> {
  return merge(
    ...Object.entries(source).map(([key, property]) =>
      property.pipe(map((value) => ({[key]: value}))),
    ),
  ).pipe(scan((accum, value) => ({...accum, ...value}), initialValue));
}

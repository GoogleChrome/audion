import {Observer} from '../utils/Observer';

/**
 * Send messages when observed.
 * @extends {Observer<T>}
 * @template T
 */
export class WorkerSender extends Observer {
  /**
   * Create a WorkerSender.
   * @param {Observer<T>} observer
   * @param {Worker} poster
   */
  constructor(observer, poster) {
    super((onNext, ...args) => {
      return observer.observe(
        (message) => poster.postMessage(message),
        ...args,
      );
    });
  }
}

/**
 * Receive messages when observed.
 * @extends {Observer<T>}
 * @template T
 */
export class WorkerReceiver extends Observer {
  /**
   * Create a WorkerReceiver.
   * @param {Worker} receiver
   */
  constructor(receiver) {
    super((onNext, ...args) => {
      const onmessage = (message) => onNext(message.data);
      receiver.addEventListener('message', onmessage);
      return () => {
        receiver.removeEventListener('message', onmessage);
      };
    });
    this.receiver = receiver;
  }
}

/**
 * Send messages to worker and observe received messages.
 * @extends {Observer<T2>}
 * @template T1
 * @template T2
 */
export class WorkerObserver extends Observer {
  /**
   * Create a WorkerObserver.
   * @param {Observer<T1>} observer
   * @param {Worker} worker
   */
  constructor(observer, worker) {
    const sender = new WorkerSender(observer, worker);
    const receiver = new WorkerReceiver(worker);
    super((...args) => {
      const unsubscribe = [sender.observe(() => {}), receiver.observe(...args)];
      return () => {
        unsubscribe.forEach((unsub) => unsub());
      };
    });
  }
}

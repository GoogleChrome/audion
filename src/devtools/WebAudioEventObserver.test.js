/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {chrome} from '../chrome';
import {WebAudioDebuggerEvent} from '../chrome/DebuggerWebAudioDomain';

<<<<<<< HEAD
import {DebuggerAttachEventController} from './DebuggerAttachEventController';
import {WebAudioEventObserver} from './WebAudioEventObserver';
=======
import {webAudioEvents$} from './WebAudioEventObserver';
>>>>>>> c783ed7... Migrate DevtoolsGraphPanel to TypeScript, RxJS.

jest.mock('../chrome');

describe('WebAudioEventObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  it('attachs to chrome.debugger', () => {
    const attachController = new DebuggerAttachEventController();
    const o = new WebAudioEventObserver(attachController);
    o.observe(() => {});
    o.attach();
=======
  it('attaches to chrome.debugger', () => {
    const sub = webAudioEvents$.subscribe();

>>>>>>> c783ed7... Migrate DevtoolsGraphPanel to TypeScript, RxJS.
    expect(chrome.debugger.attach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalled();
    expect(chrome.debugger.onDetach.addListener).toBeCalled();
    expect(chrome.debugger.onEvent.addListener).toBeCalled();

    sub.unsubscribe();
  });

  it('does not reattach when user triggers detach', () => {
<<<<<<< HEAD
    const attachController = new DebuggerAttachEventController();
    const o = new WebAudioEventObserver(attachController);
    o.observe(() => {});
    o.attach();
=======
    const sub = webAudioEvents$.subscribe();

>>>>>>> c783ed7... Migrate DevtoolsGraphPanel to TypeScript, RxJS.
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    expect(chrome.debugger.attach).toBeCalledTimes(1);
    if (
      jest.isMockFunction(chrome.debugger.onDetach.addListener) &&
      chrome.debugger.onDetach.addListener.mock.calls.length > 0
    ) {
      /** @type {function} */ (
        chrome.debugger.onDetach.addListener.mock.calls[0][0]
      )({tabId: 'tab'}, 'canceled_by_user');
    }
    expect(chrome.debugger.attach).toBeCalledTimes(1);

    sub.unsubscribe();
  });

  it('detachs from chrome.debugger on unsubscribe', () => {
<<<<<<< HEAD
    const attachController = new DebuggerAttachEventController();
    const o = new WebAudioEventObserver(attachController);
    o.attach();
    const unsubscribe = o.observe(() => {});
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(1);
    if (jest.isMockFunction(chrome.debugger.sendCommand)) {
      /** @type {function} */ (chrome.debugger.sendCommand.mock.calls[0][2])();
    }
    unsubscribe();
=======
    const sub = webAudioEvents$.subscribe();

    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    sub.unsubscribe();
>>>>>>> c783ed7... Migrate DevtoolsGraphPanel to TypeScript, RxJS.
    expect(chrome.debugger.detach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.sendCommand)) {
      /** @type {function} */ (chrome.debugger.sendCommand.mock.calls[1][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(2);
    if (jest.isMockFunction(chrome.debugger.detach)) {
      /** @type {function} */ (chrome.debugger.detach.mock.calls[0][1])();
    }
    expect(chrome.debugger.onDetach.removeListener).toBeCalled();
    expect(chrome.debugger.onEvent.removeListener).toBeCalled();
  });

  it('forwards to WebAudio debugger protocol events', () => {
    const nextMock = jest.fn();
<<<<<<< HEAD
    const attachController = new DebuggerAttachEventController();
    const o = new WebAudioEventObserver(attachController);
    o.observe(nextMock);
    o.attach();
=======
    const sub = webAudioEvents$.subscribe(nextMock);
>>>>>>> c783ed7... Migrate DevtoolsGraphPanel to TypeScript, RxJS.
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    /** @type {ChromeDebuggerWebAudioDomain.ContextCreatedEvent} */
    const contextCreated = {
      context: {
        contextId: '0',
        contextType: 'realtime',
        contextState: 'running',
        sampleRate: 48000,
        callbackBufferSize: 1000,
        maxOutputChannelCount: 2,
      },
    };
    if (jest.isMockFunction(chrome.debugger.onEvent.addListener)) {
      /** @type {function} */ (
        chrome.debugger.onEvent.addListener.mock.calls[0][0]
      )('tab', WebAudioDebuggerEvent.contextCreated, contextCreated);
    }
    expect(nextMock).toBeCalledWith({
      method: WebAudioDebuggerEvent.contextCreated,
      params: contextCreated,
    });

    sub.unsubscribe();
  });
});

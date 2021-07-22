/// <reference path="../chrome/DebuggerWebAudioDomain.js" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {chrome} from '../chrome';
import {ChromeDebuggerWebAudioDomain} from '../chrome/DebuggerWebAudioDomain';

import {WebAudioEventObserver} from './WebAudioEventObserver';

jest.mock('../chrome');

describe('WebAudioEventObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attachs to chrome.debugger', () => {
    const o = new WebAudioEventObserver();
    o.observe(() => {});
    expect(chrome.debugger.attach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalled();
    expect(chrome.debugger.onDetach.addListener).toBeCalled();
    expect(chrome.debugger.onEvent.addListener).toBeCalled();
    expect(chrome.devtools.network.onNavigated.addListener).toBeCalled();
  });

  it('reattach on unexpected detach', () => {
    const o = new WebAudioEventObserver();
    o.observe(() => {});
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    if (jest.isMockFunction(chrome.debugger.onDetach.addListener)) {
      /** @type {function} */ (
        chrome.debugger.onDetach.addListener.mock.calls[0][0]
      )();
    }
    expect(chrome.debugger.attach).toBeCalledTimes(2);
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[1][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(2);
  });

  it('enables WebAudio debugger after navigation events', () => {
    const o = new WebAudioEventObserver();
    o.observe(() => {});
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    if (jest.isMockFunction(chrome.devtools.network.onNavigated.addListener)) {
      /** @type {function} */ (
        chrome.devtools.network.onNavigated.addListener.mock.calls[0][0]
      )();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(2);
  });

  it('detachs from chrome.debugger on unsubscribe', () => {
    const o = new WebAudioEventObserver();
    const unsubscribe = o.observe(() => {});
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    unsubscribe();
    expect(chrome.debugger.detach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.detach)) {
      /** @type {function} */ (chrome.debugger.detach.mock.calls[0][1])();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(2);
    expect(chrome.debugger.onDetach.removeListener).toBeCalled();
    expect(chrome.debugger.onEvent.removeListener).toBeCalled();
    expect(chrome.devtools.network.onNavigated.removeListener).toBeCalled();
  });

  it('forwards to WebAudio debugger protocol events', () => {
    const nextMock = jest.fn();
    const o = new WebAudioEventObserver();
    o.observe(nextMock);
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
      )(
        'tab',
        ChromeDebuggerWebAudioDomain.Events.contextCreated,
        contextCreated,
      );
    }
    expect(nextMock).toBeCalledWith({
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: contextCreated,
    });
  });
});

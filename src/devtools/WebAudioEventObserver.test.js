/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {chrome} from '../chrome';
import {Event} from '../chrome/DebuggerWebAudioDomain';

import {WebAudioEventObserver} from './WebAudioEventObserver';

jest.mock('../chrome');

describe('WebAudioEventObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attachs to chrome.debugger', () => {
    const o = new WebAudioEventObserver();
    o.observe(() => {});
    o.attach();
    expect(chrome.debugger.attach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.attach)) {
      /** @type {function} */ (chrome.debugger.attach.mock.calls[0][2])();
    }
    expect(chrome.debugger.sendCommand).toBeCalled();
    expect(chrome.debugger.onDetach.addListener).toBeCalled();
    expect(chrome.debugger.onEvent.addListener).toBeCalled();
  });

  it('does not reattach when user triggers detach', () => {
    const o = new WebAudioEventObserver();
    o.observe(() => {});
    o.attach();
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
  });

  it('detachs from chrome.debugger on unsubscribe', () => {
    const o = new WebAudioEventObserver();
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
    const o = new WebAudioEventObserver();
    o.observe(nextMock);
    o.attach();
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
      )('tab', Event.contextCreated, contextCreated);
    }
    expect(nextMock).toBeCalledWith({
      method: Event.contextCreated,
      params: contextCreated,
    });
  });
});

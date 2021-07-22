/// <reference path="../chrome/DebuggerWebAudio.js" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {chrome} from '../chrome';
import {ChromeDebuggerWebAudio} from '../chrome/DebuggerWebAudio';

import {WebAudioEventObserver} from './WebAudioEventObserver';

jest.mock('./chrome');

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
    expect(chrome.debugger.onEvent.addListener).toBeCalled();
  });

  it('detachs from chrome.debugger', () => {
    const o = new WebAudioEventObserver();
    const unsubscribe = o.observe(() => {});
    unsubscribe();
    expect(chrome.debugger.detach).toBeCalled();
    if (jest.isMockFunction(chrome.debugger.detach)) {
      /** @type {function} */ (chrome.debugger.detach.mock.calls[0][1])();
    }
    expect(chrome.debugger.sendCommand).toBeCalledTimes(2);
    expect(chrome.debugger.onEvent.removeListener).toBeCalled();
  });

  it('forwards to WebAudio debugger protocol events', () => {
    const nextMock = jest.fn();
    const o = new WebAudioEventObserver();
    o.observe(nextMock);
    /** @type {ChromeDebuggerWebAudio.ContextCreatedEvent} */
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
      )('tab', ChromeDebuggerWebAudio.Events.contextCreated, contextCreated);
    }
    expect(nextMock).toBeCalledWith({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: contextCreated,
    });
  });
});

/// <reference path="chrome/DebuggerWebAudio.js" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {ChromeDebuggerWebAudio} from './chrome/DebuggerWebAudio';
import {Observer} from './utils/Observer';
import {WebAudioGraphIntegrator} from './WebAudioGraphIntegrator';

describe('WebAudioGraphIntegrator', () => {
  let nextWebAudioEvent = (value) => {};
  const nextGraphContext = jest.fn();
  beforeEach(() => {
    nextGraphContext.mockReset();
    const webAudioEvents = new Observer((onNext) => {
      nextWebAudioEvent = onNext;
      return () => {};
    });
    const graphIntegrator = new WebAudioGraphIntegrator(webAudioEvents);
    graphIntegrator.observe(nextGraphContext);
  });

  it('adds new context', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    expect(nextGraphContext.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "running",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {},
  },
]
`);
  });
  it('changes context', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextChanged,
      params: MockWebAudioEvents.contextChanged[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    expect(nextGraphContext.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "suspended",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {},
  },
]
`);
  });
  it('removes old context', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextWillBeDestroyed,
      params: MockWebAudioEvents.contextWillBeDestroyed[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    expect(nextGraphContext.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": null,
    "id": "context0000",
    "nodes": null,
  },
]
`);
  });
  it('adds new node', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    expect(nextGraphContext.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "running",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {
      "node0000": Object {
        "edges": Array [],
        "node": Object {
          "channelCountMode": "max",
          "channelInterpretation": "discrete",
          "contextId": "context0000",
          "nodeId": "node0000",
          "nodeType": "gain",
          "numberOfInputs": 1,
          "numberOfOutputs": 1,
        },
      },
    },
  },
]
`);
  });
  it('removes old node', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeWillBeDestroyed,
      params: MockWebAudioEvents.audioNodeWillBeDestroyed[0],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    expect(nextGraphContext.mock.calls[2]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "running",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {},
  },
]
`);
  });
  it('adds new node edge connection', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.nodesConnected,
      params: MockWebAudioEvents.nodesConnected[0],
    });
    expect(nextGraphContext).toBeCalledTimes(4);
    expect(nextGraphContext.mock.calls[3]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "running",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {
      "node0000": Object {
        "edges": Array [],
        "node": Object {
          "channelCountMode": "max",
          "channelInterpretation": "discrete",
          "contextId": "context0000",
          "nodeId": "node0000",
          "nodeType": "gain",
          "numberOfInputs": 1,
          "numberOfOutputs": 1,
        },
      },
      "node0001": Object {
        "edges": Array [
          Object {
            "contextId": "context0000",
            "destinationId": "node0000",
            "sourceId": "node0001",
          },
        ],
        "node": Object {
          "channelCountMode": "max",
          "channelInterpretation": "discrete",
          "contextId": "context0000",
          "nodeId": "node0001",
          "nodeType": "bufferSource",
          "numberOfInputs": 0,
          "numberOfOutputs": 1,
        },
      },
    },
  },
]
`);
  });
  it('removes old node edge connection', () => {
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.nodesConnected,
      params: MockWebAudioEvents.nodesConnected[0],
    });
    expect(nextGraphContext).toBeCalledTimes(4);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudio.Events.nodesDisconnected,
      params: MockWebAudioEvents.nodesDisconnected[0],
    });
    expect(nextGraphContext).toBeCalledTimes(5);
    expect(nextGraphContext.mock.calls[4]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": Object {
      "callbackBufferSize": 1000,
      "contextId": "context0000",
      "contextState": "running",
      "contextType": "realtime",
      "maxOutputChannelCount": 2,
      "sampleRate": 48000,
    },
    "id": "context0000",
    "nodes": Object {
      "node0000": Object {
        "edges": Array [],
        "node": Object {
          "channelCountMode": "max",
          "channelInterpretation": "discrete",
          "contextId": "context0000",
          "nodeId": "node0000",
          "nodeType": "gain",
          "numberOfInputs": 1,
          "numberOfOutputs": 1,
        },
      },
      "node0001": Object {
        "edges": Array [],
        "node": Object {
          "channelCountMode": "max",
          "channelInterpretation": "discrete",
          "contextId": "context0000",
          "nodeId": "node0001",
          "nodeType": "bufferSource",
          "numberOfInputs": 0,
          "numberOfOutputs": 1,
        },
      },
    },
  },
]
`);
  });
});

/**
 * @type {Object<ChromeDebuggerWebAudio.EventName,
 *   Object<*, ChromeDebuggerWebAudio.Event>>}
 */
const MockWebAudioEvents = {
  audioNodeCreated: {
    /** @type {ChromeDebuggerWebAudio.AudioNodeCreatedEvent} */
    0: {
      node: {
        contextId: 'context0000',
        nodeId: 'node0000',
        nodeType: 'gain',
        channelCountMode: 'max',
        channelInterpretation: 'discrete',
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    },
    /** @type {ChromeDebuggerWebAudio.AudioNodeCreatedEvent} */
    1: {
      node: {
        contextId: 'context0000',
        nodeId: 'node0001',
        nodeType: 'bufferSource',
        channelCountMode: 'max',
        channelInterpretation: 'discrete',
        numberOfInputs: 0,
        numberOfOutputs: 1,
      },
    },
  },
  audioNodeWillBeDestroyed: {
    /** @type {ChromeDebuggerWebAudio.AudioNodeWillBeDestroyedEvent} */
    0: {
      contextId: 'context0000',
      nodeId: 'node0000',
    },
  },
  contextChanged: {
    /** @type {ChromeDebuggerWebAudio.ContextChangedEvent} */
    0: {
      context: {
        contextId: 'context0000',
        contextType: 'realtime',
        contextState: 'suspended',
        sampleRate: 48000,
        callbackBufferSize: 1000,
        maxOutputChannelCount: 2,
      },
    },
  },
  contextCreated: {
    /** @type {ChromeDebuggerWebAudio.ContextCreatedEvent} */
    0: {
      context: {
        contextId: 'context0000',
        contextType: 'realtime',
        contextState: 'running',
        sampleRate: 48000,
        callbackBufferSize: 1000,
        maxOutputChannelCount: 2,
      },
    },
  },
  contextWillBeDestroyed: {
    /** @type {ChromeDebuggerWebAudio.ContextWillBeDestroyedEvent} */
    0: {
      contextId: 'context0000',
    },
  },
  nodesConnected: {
    /** @type {ChromeDebuggerWebAudio.NodesConnectedEvent} */
    0: {
      contextId: 'context0000',
      sourceId: 'node0001',
      destinationId: 'node0000',
    },
  },
  nodesDisconnected: {
    /** @type {ChromeDebuggerWebAudio.NodesDisconnectedEvent} */
    0: {
      contextId: 'context0000',
      sourceId: 'node0001',
      destinationId: 'node0000',
    },
  },
};

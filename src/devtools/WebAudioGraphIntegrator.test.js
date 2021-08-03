/// <reference path="../chrome/DebuggerWebAudioDomain.js" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import {ChromeDebuggerWebAudioDomain} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.contextChanged,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.contextWillBeDestroyed,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeWillBeDestroyed,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.nodesConnected,
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
      method: ChromeDebuggerWebAudioDomain.Events.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.nodesConnected,
      params: MockWebAudioEvents.nodesConnected[0],
    });
    expect(nextGraphContext).toBeCalledTimes(4);
    nextWebAudioEvent({
      method: ChromeDebuggerWebAudioDomain.Events.nodesDisconnected,
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
 * @type {Object<ChromeDebuggerWebAudioDomain.EventName,
 *   Object<*, ChromeDebuggerWebAudioDomain.Event>>}
 */
const MockWebAudioEvents = {
  audioNodeCreated: {
    /** @type {ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent} */
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
    /** @type {ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent} */
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
    /** @type {ChromeDebuggerWebAudioDomain.AudioNodeWillBeDestroyedEvent} */
    0: {
      contextId: 'context0000',
      nodeId: 'node0000',
    },
  },
  contextChanged: {
    /** @type {ChromeDebuggerWebAudioDomain.ContextChangedEvent} */
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
    /** @type {ChromeDebuggerWebAudioDomain.ContextCreatedEvent} */
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
    /** @type {ChromeDebuggerWebAudioDomain.ContextWillBeDestroyedEvent} */
    0: {
      contextId: 'context0000',
    },
  },
  nodesConnected: {
    /** @type {ChromeDebuggerWebAudioDomain.NodesConnectedEvent} */
    0: {
      contextId: 'context0000',
      sourceId: 'node0001',
      destinationId: 'node0000',
    },
  },
  nodesDisconnected: {
    /** @type {ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent} */
    0: {
      contextId: 'context0000',
      sourceId: 'node0001',
      destinationId: 'node0000',
    },
  },
};

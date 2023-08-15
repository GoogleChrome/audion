/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {EMPTY, from, Observable, Subject, throwError} from 'rxjs';
import {concatWith, filter, takeUntil} from 'rxjs/operators';

import {WebAudioDebuggerEvent} from '../chrome/DebuggerWebAudioDomain';

import {integrateWebAudioGraph} from './WebAudioGraphIntegrator';

// FIX: prettier isn't wrapping this next line.
// eslint-disable-next-line max-len
import * as oscillatorGainFixture from '../../fixtures/oscillatorGainParam';

// Node.js environment doesn't provide some browser-specific APIs
// (e.g. performance.now(), localStorage.getItem and localStorage.setItem)
// Mocking these ensures no errors are thrown when running tests.
global.performance = {
  now: jest.fn(() => Date.now()),
};

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
global.localStorage = localStorageMock;

describe('WebAudioGraphIntegrator', () => {
  let nextWebAudioEvent = (value) => {};
  let nextGraphContext = jest.fn();

  beforeEach(() => {
    const subject = new Subject();
    nextGraphContext = jest.fn();
    nextWebAudioEvent = (value) => subject.next(value);
    const webAudioRealtime = {
      pollContext() {
        return new Observable();
      },
    };
    subject
      .pipe(integrateWebAudioGraph(webAudioRealtime))
      .subscribe(nextGraphContext);
  });

  it('adds new context', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
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
    "eventCount": 1,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeLabels": Object {},
      "_edgeObjs": Object {},
      "_in": Object {},
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodes": Object {},
      "_out": Object {},
      "_preds": Object {},
      "_sucs": Object {},
    },
    "id": "context0000",
    "nodes": Object {},
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });
  it('changes context', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextChanged,
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
    "eventCount": 2,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeLabels": Object {},
      "_edgeObjs": Object {},
      "_in": Object {},
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodes": Object {},
      "_out": Object {},
      "_preds": Object {},
      "_sucs": Object {},
    },
    "id": "context0000",
    "nodes": Object {},
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });
  it('removes old context', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextWillBeDestroyed,
      params: MockWebAudioEvents.contextWillBeDestroyed[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    expect(nextGraphContext.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "context": null,
    "eventCount": 2,
    "graph": null,
    "id": "context0000",
    "nodes": null,
    "params": null,
    "realtimeData": null,
  },
]
`);
  });
  it('adds new node', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
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
    "eventCount": 2,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeLabels": Object {},
      "_edgeObjs": Object {},
      "_in": Object {
        "node0000": Object {},
      },
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodeCount": 1,
      "_nodes": Object {
        "node0000": Object {
          "color": null,
          "height": 50,
          "id": "node0000",
          "label": "gain",
          "type": "gain",
          "width": 150,
        },
      },
      "_out": Object {
        "node0000": Object {},
      },
      "_preds": Object {
        "node0000": Object {},
      },
      "_sucs": Object {
        "node0000": Object {},
      },
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
        "params": Array [],
      },
    },
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });
  it('removes old node', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeWillBeDestroyed,
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
    "eventCount": 3,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeLabels": Object {},
      "_edgeObjs": Object {},
      "_in": Object {},
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodeCount": 0,
      "_nodes": Object {},
      "_out": Object {},
      "_preds": Object {},
      "_sucs": Object {},
    },
    "id": "context0000",
    "nodes": Object {},
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });
  it('adds new node edge connection', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.nodesConnected,
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
    "eventCount": 4,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeCount": 1,
      "_edgeLabels": Object {
        "node0001node00000,0": Object {
          "destinationInputIndex": 0,
          "destinationType": "node",
          "sourceOutputIndex": 0,
        },
      },
      "_edgeObjs": Object {
        "node0001node00000,0": Object {
          "name": "0,0",
          "v": "node0001",
          "w": "node0000",
        },
      },
      "_in": Object {
        "node0000": Object {
          "node0001node00000,0": Object {
            "name": "0,0",
            "v": "node0001",
            "w": "node0000",
          },
        },
        "node0001": Object {},
      },
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodeCount": 2,
      "_nodes": Object {
        "node0000": Object {
          "color": null,
          "height": 50,
          "id": "node0000",
          "label": "gain",
          "type": "gain",
          "width": 150,
        },
        "node0001": Object {
          "color": null,
          "height": 50,
          "id": "node0001",
          "label": "bufferSource",
          "type": "bufferSource",
          "width": 150,
        },
      },
      "_out": Object {
        "node0000": Object {},
        "node0001": Object {
          "node0001node00000,0": Object {
            "name": "0,0",
            "v": "node0001",
            "w": "node0000",
          },
        },
      },
      "_preds": Object {
        "node0000": Object {
          "node0001": 1,
        },
        "node0001": Object {},
      },
      "_sucs": Object {
        "node0000": Object {},
        "node0001": Object {
          "node0000": 1,
        },
      },
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
        "params": Array [],
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
        "params": Array [],
      },
    },
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });
  it('removes old node edge connection', () => {
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.contextCreated,
      params: MockWebAudioEvents.contextCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(1);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[0],
    });
    expect(nextGraphContext).toBeCalledTimes(2);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.audioNodeCreated,
      params: MockWebAudioEvents.audioNodeCreated[1],
    });
    expect(nextGraphContext).toBeCalledTimes(3);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.nodesConnected,
      params: MockWebAudioEvents.nodesConnected[0],
    });
    expect(nextGraphContext).toBeCalledTimes(4);
    nextWebAudioEvent({
      method: WebAudioDebuggerEvent.nodesDisconnected,
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
    "eventCount": 5,
    "graph": Graph {
      "_defaultEdgeLabelFn": [Function],
      "_defaultNodeLabelFn": [Function],
      "_edgeCount": 0,
      "_edgeLabels": Object {},
      "_edgeObjs": Object {},
      "_in": Object {
        "node0000": Object {},
        "node0001": Object {},
      },
      "_isCompound": false,
      "_isDirected": true,
      "_isMultigraph": true,
      "_label": Object {},
      "_nodeCount": 2,
      "_nodes": Object {
        "node0000": Object {
          "color": null,
          "height": 50,
          "id": "node0000",
          "label": "gain",
          "type": "gain",
          "width": 150,
        },
        "node0001": Object {
          "color": null,
          "height": 50,
          "id": "node0001",
          "label": "bufferSource",
          "type": "bufferSource",
          "width": 150,
        },
      },
      "_out": Object {
        "node0000": Object {},
        "node0001": Object {},
      },
      "_preds": Object {
        "node0000": Object {},
        "node0001": Object {},
      },
      "_sucs": Object {
        "node0000": Object {},
        "node0001": Object {},
      },
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
        "params": Array [],
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
        "params": Array [],
      },
    },
    "params": Object {},
    "realtimeData": Object {
      "callbackIntervalMean": 0,
      "callbackIntervalVariance": 0,
      "currentTime": 0,
      "renderCapacity": 0,
    },
  },
]
`);
  });

  describe('simulate graphs', () => {
    describe('oscillator -> gain param', () => {
      const events = oscillatorGainFixture.OSCILLATOR_GAIN_PARAM_EVENTS;
      const simulation = () =>
        integrateWebAudioGraph({
          pollContext() {
            return EMPTY;
          },
        });
      const eventSource = from(events);

      for (let i = 0; i < events.length; i++) {
        const errorEvent = events[i];
        const falseSource = eventSource.pipe(
          takeUntil((event) => event === errorEvent),
          concatWith([throwError(() => new Error())]),
        );
        it(`falsify #${i} ${errorEvent.method}`, () => {
          const subscriber = mockSubscriber();
          falseSource.pipe(simulation()).subscribe(subscriber);
          expect(subscriber.error).toBeCalled();
        });
      }

      it(`all events`, () => {
        const subscriber = mockSubscriber();
        eventSource.pipe(simulation()).subscribe(subscriber);
        expect(subscriber.next).toBeCalled();
        expect(subscriber.error).not.toBeCalled();
      });

      for (let i = 0; i < events.length; i++) {
        const skipEvent = events[i];
        const skipSource = eventSource.pipe(filter((ev) => ev !== skipEvent));
        it(`skip event #${i} ${skipEvent.method}`, () => {
          const subscriber = mockSubscriber();
          skipSource.pipe(simulation()).subscribe(subscriber);
          expect(subscriber.error).not.toBeCalled();
        });
      }
    });
  });
});

/**
 * @type {Object<EventName,
 *   Object<*, WebAudioDebuggerEvent>>}
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

/**
 * @return {Subscriber}
 */
function mockSubscriber() {
  return {next: jest.fn(), complete: jest.fn(), error: jest.fn()};
}

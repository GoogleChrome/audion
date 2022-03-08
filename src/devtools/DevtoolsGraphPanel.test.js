/// <reference path="../chrome/Types.js" />
/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />
/// <reference path="../utils/Types.ts" />
/// <reference path="Types.ts" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';

import dagre from 'dagre';
import {BehaviorSubject, Observable, partition, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {chrome} from '../chrome';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';

jest.mock('../chrome');

/**
 * @type {Object<*, Audion.GraphContext>}
 */
const mockGraphs = {
  0: {
    id: 'context0000',
    /** @type {ChromeDebuggerWebAudio.BaseAudioContext} */
    context: {
      contextId: 'context0000',
      contextType: 'realtime',
      contextState: 'running',
      sampleRate: 48000,
      maxOutputChannelCount: 2,
      callbackBufferSize: 1000,
    },
    graph: new dagre.graphlib.Graph(),
    nodes: {},
  },
  1: {
    id: 'context0000',
    /** @type {ChromeDebuggerWebAudio.BaseAudioContext} */
    context: {
      contextId: 'context0000',
      contextType: 'realtime',
      contextState: 'suspended',
      sampleRate: 48000,
      maxOutputChannelCount: 2,
      callbackBufferSize: 1000,
    },
    graph: new dagre.graphlib.Graph(),
    nodes: {},
  },
  2: {
    id: 'context0000',
    context: null,
    graph: null,
    nodes: null,
  },
};
describe('DevtoolsGraphPanel', () => {
  let nextGraph = (graph) => {};
  /** @type {Subject<Audion.GraphContext>} */
  let subject;
  /** @type {Chrome.RuntimePort} */
  let port;

  beforeEach(() => {
    jest.resetAllMocks();

    subject = new Subject();
    nextGraph = (value) => subject.next(value);

    /** @type {BehaviorSubject<boolean>} */
    const gate = new BehaviorSubject();
    const [gateOpen, gateClose] = partition(gate, Boolean).map(map(() => {}));

    const panel = new DevtoolsGraphPanel(
      subject.pipe(
        map(serializeGraphContext),
        map((graphContext) => ({graphContext})),
        subscribeWhen(gateOpen, gateClose),
      ),
    );

    panel.onPanelShown$.pipe(map(() => true)).subscribe(gate);

    port = mockPort();
  });

  it('creates a panel with chrome.devtools', () => {
    expect(chrome.devtools.panels.create).toBeCalled();
    simulateCreatePanel();
  });

  it('subscribes to debugger events only after panel is shown', () => {
    expect(subject.observed).toBe(false);

    const panel = simulateCreatePanel();
    simulateConnectPort(port);

    expect(subject.observed).toBe(false);

    // Send onShown event to panel creation callback.
    simulateShowPanel(panel);

    expect(subject.observed).toBe(true);
  });

  it('posts graphs when connected', () => {
    // Send onShown event to panel creation callback.
    const panel = simulateCreatePanel();
    simulateConnectPort(port);
    simulateShowPanel(panel);

    nextGraph(mockGraphs[0]);
    nextGraph(mockGraphs[1]);
    expect(port.postMessage).toBeCalledTimes(2);
    expect(port.postMessage.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  Object {
    "graphContext": Object {
      "context": Object {
        "callbackBufferSize": 1000,
        "contextId": "context0000",
        "contextState": "running",
        "contextType": "realtime",
        "maxOutputChannelCount": 2,
        "sampleRate": 48000,
      },
      "graph": Object {
        "edges": Array [],
        "nodes": Array [],
        "options": Object {
          "compound": false,
          "directed": true,
          "multigraph": false,
        },
      },
      "id": "context0000",
      "nodes": Object {},
    },
  },
]
`);
    expect(port.postMessage.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "graphContext": Object {
      "context": Object {
        "callbackBufferSize": 1000,
        "contextId": "context0000",
        "contextState": "suspended",
        "contextType": "realtime",
        "maxOutputChannelCount": 2,
        "sampleRate": 48000,
      },
      "graph": Object {
        "edges": Array [],
        "nodes": Array [],
        "options": Object {
          "compound": false,
          "directed": true,
          "multigraph": false,
        },
      },
      "id": "context0000",
      "nodes": Object {},
    },
  },
]
`);
  });

  it('posts null graph when context is destroyed', () => {
    // Send onShown event to panel creation callback.
    const panel = simulateCreatePanel();
    simulateConnectPort(port);
    simulateShowPanel(panel);

    nextGraph(mockGraphs[0]);
    nextGraph(mockGraphs[2]);
    expect(port.postMessage).toBeCalledTimes(2);
    expect(port.postMessage.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  Object {
    "graphContext": Object {
      "context": Object {
        "callbackBufferSize": 1000,
        "contextId": "context0000",
        "contextState": "running",
        "contextType": "realtime",
        "maxOutputChannelCount": 2,
        "sampleRate": 48000,
      },
      "graph": Object {
        "edges": Array [],
        "nodes": Array [],
        "options": Object {
          "compound": false,
          "directed": true,
          "multigraph": false,
        },
      },
      "id": "context0000",
      "nodes": Object {},
    },
  },
]
`);
    expect(port.postMessage.mock.calls[1]).toMatchInlineSnapshot(`
Array [
  Object {
    "graphContext": Object {
      "context": null,
      "graph": null,
      "id": "context0000",
      "nodes": null,
    },
  },
]
`);
  });

  it('stops posting graphs once disconnected', () => {
    const panel = simulateCreatePanel();
    simulateConnectPort(port);
    simulateShowPanel(panel);

    nextGraph(mockGraphs[0]);

    if (jest.isMockFunction(port.onDisconnect.addListener)) {
      /** @type {function} */ (
        port.onDisconnect.addListener.mock.calls[0][0]
      )();
    }

    nextGraph(mockGraphs[1]);

    expect(port.postMessage).toBeCalledTimes(1);
    expect(port.postMessage.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  Object {
    "graphContext": Object {
      "context": Object {
        "callbackBufferSize": 1000,
        "contextId": "context0000",
        "contextState": "running",
        "contextType": "realtime",
        "maxOutputChannelCount": 2,
        "sampleRate": 48000,
      },
      "graph": Object {
        "edges": Array [],
        "nodes": Array [],
        "options": Object {
          "compound": false,
          "directed": true,
          "multigraph": false,
        },
      },
      "id": "context0000",
      "nodes": Object {},
    },
  },
]
`);
  });
});

/**
 * Simulate chrome api as if devtool panel was shown.
 * @param {Chrome.DevToolsPanels} panel panel to simulating showing
 */
function simulateShowPanel(panel) {
  const panelOnShownCallback = panel.onShown.addListener.mock.calls[0][0];
  panelOnShownCallback();
}

/**
 * Simulate chrome api as if devtool panel was created.
 * @param {Chrome.DevToolsPanel} [panel] panel to simulate creating
 * @return {Chrome.DevToolsPanel} created mock panel
 */
function simulateCreatePanel(panel = mockPanel()) {
  const panelCreateCallback = chrome.devtools.panels.create.mock.calls[0][3];
  panelCreateCallback(panel);
  return panel;
}

/**
 * Simulate chrome api as if runtime port was created.
 * @param {Chrome.RuntimePort} [port] port to simulate connecting
 * @return {Chrome.RuntimePort} connected port
 */
function simulateConnectPort(port = mockPort()) {
  const runtimeOnConnectCallback =
    chrome.runtime.onConnect.addListener.mock.calls[0][0];
  runtimeOnConnectCallback(port);
  return port;
}

/** @return {Chrome.Event<*>} */
function mockEvent() {
  return {addListener: jest.fn(), removeListener: jest.fn()};
}

/** @return {Chrome.RuntimePort} */
function mockPort() {
  return {
    onDisconnect: mockEvent(),
    onMessage: mockEvent(),
    postMessage: jest.fn(),
  };
}

/**
 * @return {Chrome.DevToolsPanel} mock version of a devtool panel
 */
function mockPanel() {
  return {onHidden: mockEvent(), onShown: mockEvent()};
}

/**
 * @param {Observable<void>} subscribeNotifier
 * @param {Observable<void>} unsubscribeNotifier
 * @return {function(Observable<T>): Observable<T>}
 * @template T
 */
function subscribeWhen(subscribeNotifier, unsubscribeNotifier) {
  return (source) => {
    return new Observable((subscriber) => {
      let subscription = null;
      let subscribe = () => {
        const oldSubscribe = subscribe;
        subscribe = () => {};
        subscription = source.subscribe(subscriber);
        unsubscribe = () => {
          unsubscribe = () => {};
          subscription.unsubscribe();
          subscription = null;
          subscribe = oldSubscribe;
        };
      };
      let unsubscribe = () => {};
      const onSubscription = subscribeNotifier.subscribe({
        next() {
          subscribe();
        },
      });
      const offSubscription = unsubscribeNotifier.subscribe({
        next() {
          unsubscribe();
        },
      });
      return () => {
        onSubscription.unsubscribe();
        offSubscription.unsubscribe();
        unsubscribe();
      };
    });
  };
}

/// <reference path="../chrome/Types.js" />
/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />
/// <reference path="../utils/Types.js" />
/// <reference path="Types.ts" />

import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import dagre from 'dagre';

import {chrome} from '../chrome';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';

import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';

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
  let subject = new Subject();

  /** @type {Chrome.RuntimePort} */
  let port;
  beforeEach(() => {
    jest.resetAllMocks();
    subject = new Subject();

    nextGraph = (value) => subject.next(value);

    new DevtoolsGraphPanel(
      subject.pipe(
        map(serializeGraphContext),
        map((graphContext) => ({graphContext})),
      ),
    );
    port = mockPort();
  });

  it('creates a panel with chrome.devtools', () => {
    expect(chrome.devtools.panels.create).toBeCalled();
    if (jest.isMockFunction(chrome.devtools.panels.create)) {
      /** @type {function} */ (chrome.devtools.panels.create.mock.calls[0][3])(
        /** @type {Chrome.DevToolsPanel} */ ({
          onHidden: mockEvent(),
          onShown: mockEvent(),
        }),
      );
    }
  });

  it('subscribes to debugger events only after panel is shown', () => {
    expect(subject.observed).toBe(false);

    chrome.runtime.onConnect.addListener.mock.calls[0][0](port);

    const panel = {onHidden: mockEvent(), onShown: mockEvent()};
    const panelCreateCallback = chrome.devtools.panels.create.mock.calls[0][3];
    panelCreateCallback(panel);

    expect(subject.observed).toBe(false);

    // Send onShown event to panel creation callback.
    const panelOnShownCallback = panel.onShown.addListener.mock.calls[0][0];
    panelOnShownCallback();

    expect(subject.observed).toBe(true);
  });

  it('posts graphs when connected', () => {
    // Send onShown event to panel creation callback.
    const panel = {onHidden: mockEvent(), onShown: mockEvent()};
    const panelCreateCallback = chrome.devtools.panels.create.mock.calls[0][3];
    panelCreateCallback(panel);
    const panelOnShownCallback = panel.onShown.addListener.mock.calls[0][0];
    panelOnShownCallback();

    chrome.runtime.onConnect.addListener.mock.calls[0][0](port);

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
    const panel = {onHidden: mockEvent(), onShown: mockEvent()};
    const panelCreateCallback = chrome.devtools.panels.create.mock.calls[0][3];
    panelCreateCallback(panel);
    const panelOnShownCallback = panel.onShown.addListener.mock.calls[0][0];
    panelOnShownCallback();

    if (jest.isMockFunction(chrome.runtime.onConnect.addListener)) {
      /** @type {function} */ (
        chrome.runtime.onConnect.addListener.mock.calls[0][0]
      )(port);
    }
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
    // Send onShown event to panel creation callback.
    const panel = {onHidden: mockEvent(), onShown: mockEvent()};
    const panelCreateCallback = chrome.devtools.panels.create.mock.calls[0][3];
    panelCreateCallback(panel);
    const panelOnShownCallback = panel.onShown.addListener.mock.calls[0][0];
    panelOnShownCallback();

    if (jest.isMockFunction(chrome.runtime.onConnect.addListener)) {
      /** @type {function} */ (
        chrome.runtime.onConnect.addListener.mock.calls[0][0]
      )(port);
    }
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

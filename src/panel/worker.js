/// <reference path="../devtools/Types.js" />

import dagre from 'dagre';

import {Observer} from '../utils/Observer';
import {colorFromNodeType} from './graphStyle';

let layoutOptions = {rankdir: 'LR'};

/**
 * @typedef LayoutOptionsMessage
 * @property {*} layoutOptions
 */

/**
 * @typedef GraphContextMessage
 * @property {Audion.GraphContext} graphContext
 */

/**
 * @typedef {LayoutOptionsMessage
 *   | GraphContextMessage} PanelMessage
 */

/** @type {Observer<PanelMessage>} */
const receiver = new Observer((onNext) => {
  const onmessage = ({data}) => {
    onNext(data);
  };
  self.addEventListener('message', onmessage);
  return () => {
    self.removeEventListener('message', onmessage);
  };
});

const deserializerObserver = new Observer((onNext, ...args) => {
  return receiver.observe((data) => {
    if (data.layoutOptions) {
      layoutOptions = data.layoutOptions;
    } else {
      const {graphContext} = data;
      if (graphContext.graph) {
        // console.log(`${Date.now()} panelWorker: received ${receiveIndex++}`);
        for (let i = 0; i < graphContext.graph.nodes.length; i++) {
          const node = graphContext.graph.nodes[i].value;
          if (node && node.type && !node.color) {
            node.color = colorFromNodeType(node.type);
          }
        }
        const deserialized = {
          ...graphContext,
          graph: dagre.graphlib.json.read(graphContext.graph),
        };
        deserialized.graph.setGraph(layoutOptions);
        onNext(deserialized);
      } else {
        onNext(graphContext);
      }
    }
  }, ...args);
});

const resolveThrottle = (value) => {};
const receiverThrottle = Observer.throttle(deserializerObserver, {
  key: (message) => message.id,
  // timeout: () =>
  //   new Promise((resolve) => {
  //     resolveThrottle = resolve;
  //   }).then(() => new Promise((resolve) => setTimeout(resolve, 500))),
});

const updateGraph = Observer.transform(receiverThrottle, (context) => {
  // console.log(`${Date.now()} panelWorker: transform ${transformIndex++}`);
  if (context.context) {
    // const graph = new dagre.graphlib.Graph();

    // graph.setGraph({});
    // graph.setDefaultEdgeLabel(() => {
    //   return {};
    // });
    // for (const node of Object.values(context.nodes)) {
    //   graph.setNode(node.node.nodeId, {label: '', width: 200, height: 50});
    //   for (const edge of node.edges) {
    //     graph.setEdge(edge.sourceId, edge.destinationId);
    //   }
    // }
    if (context.graph) {
      dagre.layout(context.graph);
    }
    // context.graph = graph;
  }
  return context;
});

updateGraph.observe((context) => {
  // console.log(`${Date.now()} panelWorker: send ${sendIndex++}`);
  resolveThrottle();
  if (context.graph) {
    self.postMessage({
      ...context,
      graph: dagre.graphlib.json.write(context.graph),
    });
  } else {
    self.postMessage(context);
  }
});

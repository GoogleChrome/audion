/// <reference path="../devtools/Types.js" />
/// <reference path="../utils/Types.js" />

import dagre from 'dagre';

import {Observer} from '../utils/Observer';
import {
  postObservations,
  observeMessageEvents,
} from '../utils/Observer.emitter';

import {serializeGraphContext} from '../devtools/serializeGraphContext';
import {deserializeGraphContext} from '../devtools/deserializeGraphContext';

let layoutOptions = {rankdir: 'LR'};

/** @type {Utils.Observer<PanelMessage>} */
const receiver = observeMessageEvents(self);

const graphContextMessageFilterObserver = new Observer((onNext, ...args) => {
  return receiver.observe((data) => {
    if ('layoutOptions' in data) {
      layoutOptions = data.layoutOptions;
    } else {
      onNext(data.graphContext);
    }
  }, ...args);
});

const deserializedObserver = Observer.transform(
  graphContextMessageFilterObserver,
  deserializeGraphContext,
);

const receiverThrottle = Observer.throttle(deserializedObserver, {
  key: (message) => message.id,
});

const updateGraph = Observer.transform(receiverThrottle, (context) => {
  if (context.context && context.graph) {
    context.graph.setGraph(layoutOptions);
    dagre.layout(context.graph);
  }
  return context;
});

const serializedGraph = Observer.transform(updateGraph, serializeGraphContext);

postObservations(serializedGraph, self);

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

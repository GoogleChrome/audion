import {Observer} from '../utils/Observer';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';
import {WebAudioEventObserver} from './WebAudioEventObserver';
import {WebAudioGraphIntegrator} from './WebAudioGraphIntegrator';

const webAudioEvents = new WebAudioEventObserver();
const integrateMessages = new WebAudioGraphIntegrator(webAudioEvents);
const graphThrottle = Observer.throttle(integrateMessages, {});

const serializeGraph = Observer.transform(graphThrottle, serializeGraphContext);

const graphMessage = Observer.transform(serializeGraph, (message) => ({
  graphContext: message,
}));

// Persistently observe web audio events and integrate events into context
// objects. Collect those into an object of all current graphs.
/** @type {{allGraphs: Object<string, Audion.GraphContext>}} */
const allGraphs = {allGraphs: {}};
graphMessage.observe((message) => {
  if (message.graphContext.graph) {
    allGraphs.allGraphs[message.graphContext.id] = message.graphContext;
  } else {
    delete allGraphs.allGraphs[message.graphContext.id];
  }
});

// When the panel is opened it'll connect to the devtools page, immediately send
// the current set of graphs.
/** @type {Audion.DevtoolsObserver} */
const allGraphsOnSubscribe = Observer.onSubscribe(
  graphMessage,
  () => allGraphs,
);

new DevtoolsGraphPanel(allGraphsOnSubscribe);

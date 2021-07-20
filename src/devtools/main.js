import {Observer} from './utils/Observer';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {WebAudioEventObserver} from './WebAudioEventObserver';
import {WebAudioGraphIntegrator} from './WebAudioGraphIntegrator';

const webAudioEvents = new WebAudioEventObserver();
const integrateMessages = new WebAudioGraphIntegrator(webAudioEvents);
const graphThrottle = Observer.throttle(integrateMessages);
const updateGraph = Observer.transform(graphThrottle, (graph) => {
  // graph is laid out at this point.
  // layout(graph);
  return graph;
});

new DevtoolsGraphPanel(updateGraph);

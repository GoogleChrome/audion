import {Observer} from '../utils/Observer';
import {DebuggerAttachEventController} from './DebuggerAttachEventController';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';
import {WebAudioEventObserver} from './WebAudioEventObserver';
import {WebAudioGraphIntegrator} from './WebAudioGraphIntegrator';
import {WebAudioRealtimeData} from './WebAudioRealtimeData';

const debuggerAttachController = new DebuggerAttachEventController();
const webAudioEvents = new WebAudioEventObserver(debuggerAttachController);
const webAudioRealtimeData = new WebAudioRealtimeData();
const integrateMessages = new WebAudioGraphIntegrator(
  webAudioEvents,
  webAudioRealtimeData,
);
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

const panel = new DevtoolsGraphPanel(allGraphsOnSubscribe);
panel.onShow = () => {
  // Only trigger this initialization code on the first time the panel is
  // opened.
  panel.onShow = null;
  webAudioEvents.attach();
};

panel.requests$.subscribe({
  next(value) {
    if (value.type === 'collectGarbage') {
      debuggerAttachController
        .sendCommand('HeapProfiler.collectGarbage')
        .subscribe();
    }
  },
});

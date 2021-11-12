import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';
import {WebAudioEventObservable} from './WebAudioEventObserver';
import {integrateWebAudioGraph} from './WebAudioGraphIntegrator';
import {throttleTime, map, scan, take} from 'rxjs/operators';
import {Audion} from './Types';
import {DebuggerAttachEventController} from './DebuggerAttachEventController';
import {WebAudioRealtimeData} from './WebAudioRealtimeData';

type AllGraphsContext = {allGraphs: {[key: string]: Audion.GraphContext}};

const attachController = new DebuggerAttachEventController();

const webAudioEvents$ = new WebAudioEventObservable(attachController);
const webAudioRealtimeData = new WebAudioRealtimeData();

const allGraphs$ = webAudioEvents$.pipe(
  integrateWebAudioGraph(webAudioRealtimeData),
  throttleTime(16),
  map(serializeGraphContext),
  map((graphContext) => ({graphContext})),
  // Persistently observe web audio events and integrate events into context
  // objects. Collect those into an object of all current graphs.
  scan<{graphContext: Audion.GraphContext}, AllGraphsContext>(
    (allGraphs, message) => {
      if (message.graphContext.graph) {
        allGraphs.allGraphs[message.graphContext.id] = message.graphContext;
      } else {
        delete allGraphs.allGraphs[message.graphContext.id];
      }
      return allGraphs;
    },
    {allGraphs: {}},
  ),
);

// When the panel is opened it'll connect to the devtools page, immediately send
// the current set of graphs.
const panel = new DevtoolsGraphPanel(allGraphs$);

// When the panel is first shown, grant attachController permission to attach to
// the debugger.
panel.onPanelShown$.pipe(take(1)).subscribe({
  next() {
    attachController.permission$.grantTemporary();
  },
});

// Respond to requests from the panel accordingly.
panel.requests$.subscribe({
  next(value) {
    if (value.type === 'collectGarbage') {
      attachController.sendCommand('HeapProfiler.collectGarbage').subscribe();
    }
  },
});

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {serializeGraphContext} from './serializeGraphContext';
import {webAudioEvents$} from './WebAudioEventObserver';
import {integrateWebAudioGraph} from './WebAudioGraphIntegrator';
import {throttleTime, map, scan} from 'rxjs/operators';
import {Audion} from './Types';

type AllGraphsContext = {allGraphs: {[key: string]: Audion.GraphContext}};

const allGraphs$ = webAudioEvents$.pipe(
  integrateWebAudioGraph(),
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
new DevtoolsGraphPanel(allGraphs$);

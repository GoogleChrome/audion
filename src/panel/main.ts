/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import * as PIXI from 'pixi.js';
// This module disable's pixi.js use of new Function to optimize rendering.
import {install} from '@pixi/unsafe-eval';

import {merge, Subject} from 'rxjs';
import {filter, map, scan, shareReplay, tap} from 'rxjs/operators';

import {Audion} from '../devtools/Types';

import {Utils} from '../utils/Types';
import {Observer} from '../utils/Observer';
import {toUtilsObserver} from '../utils/rxInterop';
import {
  observeMessageEvents,
  postObservations,
} from '../utils/Observer.emitter';

import {connect} from './Observer.runtime';
import {AudioGraphRender} from './graph/AudioGraphRender';
import {GraphSelector} from './GraphSelector';

import {WholeGraphButton} from './components/WholeGraphButton';
import {querySelector} from './components/domUtils';
import {renderRealtimeSummary} from './components/realtimeSummary';
import {renderSelectGraph} from './components/selectGraph';
import {renderDetailPanel} from './components/detailPanel';
import {chrome} from '../chrome';
import {renderCollectGarbage} from './components/collectGarbage';

// Install an alternate system to part of pixi.js rendering that does not use
// new Function.
install(PIXI);

if (chrome.devtools.panels.themeName === 'dark') {
  document.querySelector('html').className = '-theme-with-dark-background';
}

const devtoolsRequestSubject$ = new Subject<Audion.DevtoolsRequest>();
const devtoolsObserver$ = connect<
  Audion.DevtoolsRequest,
  Audion.DevtoolsMessage
>(devtoolsRequestSubject$);

const devtoolsObserver: Audion.DevtoolsObserver =
  toUtilsObserver(devtoolsObserver$);

const allGraphsObserver: Utils.Observer<Audion.GraphContextsById> =
  Observer.reduce(
    devtoolsObserver,
    (allGraphs, message) => {
      if ('allGraphs' in message) {
        return message.allGraphs;
      } else if ('graphContext' in message) {
        if (
          message.graphContext.graph &&
          message.graphContext.context.contextState !== 'closed'
        ) {
          return {
            ...allGraphs,
            [message.graphContext.id]: message.graphContext,
          };
        } else {
          allGraphs = {...allGraphs};
          delete allGraphs[message.graphContext.id];
          return allGraphs;
        }
      }
      return allGraphs;
    },
    {} as {[key: string]: Audion.GraphContext},
  );

const allGraphsObserver$ = devtoolsObserver$.pipe(
  scan((allGraphs, message) => {
    if ('allGraphs' in message) {
      return message.allGraphs;
    } else if ('graphContext' in message) {
      if (
        message.graphContext.graph &&
        message.graphContext.context.contextState !== 'closed'
      ) {
        return {
          ...allGraphs,
          [message.graphContext.id]: message.graphContext,
        };
      } else {
        allGraphs = {...allGraphs};
        delete allGraphs[message.graphContext.id];
        return allGraphs;
      }
    }
    return allGraphs;
  }, {} as Audion.GraphContextsById),
  shareReplay({bufferSize: 1, refCount: true}),
);

const graphSelector = new GraphSelector({
  allGraphsObserver,
  allGraphsObserver$,
});
graphSelector.optionsObserver.observe((options) => {
  if (
    // Select a graph automatically if one is not selected.
    graphSelector.graphId === '' ||
    // Select a graph automatically if current selected graph is no longer available.
    !options.includes(graphSelector.graphId)
  ) {
    // Select the newest graph (the last in the list).
    graphSelector.select(options[options.length - 1] || '');
  }
});

const graphContainer =
  /** @type {HTMLElement} */ document.getElementsByClassName(
    'web-audio-graph',
  )[0] as HTMLElement;

const graphRender = new AudioGraphRender({elementContainer: graphContainer});
graphRender.init();

const sizedNodesGraphObserver = Observer.transform(
  graphSelector.graphObserver,
  (graphContext) => graphRender.updateGraphSizes(graphContext),
);

const prelayoutThrottle = Observer.throttle(sizedNodesGraphObserver, {
  key: (message) => message.id,
});

const layoutWorker = new Worker('panelWorker.js');

postObservations(
  Observer.transform(prelayoutThrottle, (graphContext) => ({graphContext})),
  layoutWorker,
);

const layoutObserver: Utils.Observer<Audion.GraphContext> =
  observeMessageEvents(layoutWorker);

const wholeGraphButton = new WholeGraphButton();
wholeGraphButton.click$.subscribe(() => {
  graphRender.camera.fitToScreen();
});

layoutObserver.observe((message) => graphRender.update(message));

graphContainer.appendChild(graphRender.pixiView);
graphContainer.appendChild(wholeGraphButton.render());

merge(
  renderCollectGarbage(querySelector('.toolbar-garbage-button')).pipe(
    tap((action) => {
      if (action && 'type' in action && action.type === 'collectGarbage') {
        devtoolsRequestSubject$.next(action);
      }
    }),
    filter(isHTMLElement),
  ),
  renderSelectGraph(
    querySelector('.web-audio-toolbar-container .dropdown-title'),
    querySelector('.web-audio-select-graph-dropdown'),
    querySelector('.web-audio-toolbar-container .toolbar-dropdown'),
    graphSelector.graphIdObserver$,
    allGraphsObserver$,
  ).pipe(
    tap((action) => {
      if (action && 'type' in action && action.type === 'selectGraph') {
        graphSelector.select(action.graphId);
      }
    }),
    filter(isHTMLElement),
  ),
  renderRealtimeSummary(
    querySelector('.web-audio-status'),
    graphSelector.graphObserver$.pipe(map(({realtimeData}) => realtimeData)),
  ),
  renderDetailPanel(
    querySelector('.web-audio-detail-panel'),
    graphSelector.graphObserver$,
    graphRender.selectedNode$,
  ),
)
  // Observe elements as they are changed.
  .subscribe();

document.getElementsByClassName('web-audio-loading')[0].classList.add('hidden');

/**
 * @param value
 * @returns value is a HTMLElement
 */
function isHTMLElement(value: unknown): value is HTMLElement {
  return value && value instanceof HTMLElement;
}

/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import * as PIXI from 'pixi.js';
// This module disable's pixi.js use of new Function to optimize rendering.
import {install} from '@pixi/unsafe-eval';
import {combineLatest, map, merge, scan, shareReplay} from 'rxjs';

import {Audion} from '../devtools/Types';

import {Utils} from '../utils/Types';
import {Observer} from '../utils/Observer';
import {toRX} from '../utils/toRX';
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

// Install an alternate system to part of pixi.js rendering that does not use
// new Function.
install(PIXI);

const devtoolsObserver: Audion.DevtoolsObserver = connect();

const devtoolsObserver$ = toRX<Audion.DevtoolsMessage>(devtoolsObserver);

const allGraphsObserver: Utils.Observer<Audion.GraphContextsById> =
  Observer.reduce(
    devtoolsObserver,
    (allGraphs, message) => {
      if ('allGraphs' in message) {
        return {...allGraphs, ...message.allGraphs};
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
      return {...allGraphs, ...message.allGraphs};
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
  // Select the newest graph.
  graphSelector.select(options[options.length - 1] || '');
});

const graphContainer =
  /** @type {HTMLElement} */ document.getElementsByClassName(
    'web-audio-graph',
  )[0];

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

graphRender.start();

merge(
  renderSelectGraph(
    querySelector('.web-audio-toolbar-container .dropdown-title'),
    querySelector('.web-audio-select-graph-dropdown'),
    graphSelector.graphIdObserver$,
    allGraphsObserver$,
  ),
  renderRealtimeSummary(
    querySelector('.web-audio-status'),
    graphSelector.graphObserver$.pipe(map(({realtimeData}) => realtimeData)),
  ),
).subscribe();

document.getElementsByClassName('web-audio-loading')[0].classList.add('hidden');

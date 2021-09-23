/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />
/// <reference path="../devtools/Types.js" />
/// <reference path="../utils/Types.js" />

import * as PIXI from 'pixi.js';
// This module disable's pixi.js use of new Function to optimize rendering.
import {install} from '@pixi/unsafe-eval';

import {Observer} from '../utils/Observer';

import {WholeGraphButton} from './components/WholeGraphButton';

import {connect} from './Observer.runtime';
import {
  observeMessageEvents,
  postObservations,
} from '../utils/Observer.emitter';
import {AudioGraphRender} from './graph/AudioGraphRender';
import {GraphSelector} from './GraphSelector';

// Install an alternate system to part of pixi.js rendering that does not use
// new Function.
install(PIXI);

/** @type {Audion.DevtoolsObserver} */
const devtoolsObserver = connect();

/** @type {Utils.Observer<Object<string, Audion.GraphContext>>} */
const allGraphsObserver = Observer.reduce(
  devtoolsObserver,
  (allGraphs, message) => {
    if ('allGraphs' in message) {
      return {...allGraphs, ...message.allGraphs};
    } else if ('graphContext' in message) {
      if (
        message.graphContext.graph &&
        message.graphContext.context.contextState !== 'closed'
      ) {
        return {...allGraphs, [message.graphContext.id]: message.graphContext};
      } else {
        allGraphs = {...allGraphs};
        delete allGraphs[message.graphContext.id];
        return allGraphs;
      }
    }
    return allGraphs;
  },
  /** @type {Object<string, Audion.GraphContext>} */
  ({}),
);

const graphSelector = new GraphSelector({allGraphsObserver});
graphSelector.optionsObserver.observe((options) => {
  // Select the newest graph.
  graphSelector.select(options[options.length - 1] || '');
});

const graphContainer = /** @type {HTMLElement} */ (
  document.getElementsByClassName('web-audio-graph')[0]
);

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

/** @type {Utils.Observer<Audion.GraphContext>} */
const layoutObserver = observeMessageEvents(layoutWorker);

const wholeGraphButton = new WholeGraphButton();
wholeGraphButton.observe((value) => {
  if (value.event === 'resizeView') {
    graphRender.camera.fitToScreen();
  }
});

layoutObserver.observe((message) => graphRender.update(message));

graphContainer.appendChild(graphRender.pixiView);
graphContainer.appendChild(wholeGraphButton.render().view);

graphRender.start();

document.getElementsByClassName('web-audio-loading')[0].classList.add('hidden');

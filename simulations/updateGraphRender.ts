import {
  auditTime,
  EMPTY,
  filter,
  finalize,
  from,
  interval,
  map,
  pipe,
  switchMap,
  take,
} from 'rxjs';

import {layoutGraphContext} from '../src/devtools/layoutGraphContext';
import {deserializeGraphContext} from '../src/devtools/deserializeGraphContext';
import {serializeGraphContext} from '../src/devtools/serializeGraphContext';
import {WebAudioRealtimeData} from '../src/devtools/WebAudioRealtimeData';
import {integrateWebAudioGraph} from '../src/devtools/WebAudioGraphIntegrator';

import {updateGraphRender} from '../src/panel/updateGraphRender';
import {AudioGraphRender} from '../src/panel/graph/AudioGraphRender';

import {OSCILLATOR_GAIN_PARAM_EVENTS} from '../fixtures/oscillatorGainParam';
import {updateGraphSizes} from '../src/panel/updateGraphSizes';

function main() {
  const graphContainer = document.querySelector('.graph') as HTMLElement;
  const graphRender = new AudioGraphRender({
    elementContainer: graphContainer,
  });
  graphRender.init();
  graphContainer.appendChild(graphRender.pixiView);

  const simulation = () =>
    pipe(
      integrateWebAudioGraph({
        pollContext() {
          return EMPTY;
        },
      } as unknown as WebAudioRealtimeData),
      auditTime(1),
      map(serializeGraphContext),
      filter((graphContext) => graphContext.graph !== null),
      map(updateGraphSizes(graphRender)),
      map(deserializeGraphContext),
      map(layoutGraphContext),
      map(serializeGraphContext),
      map(updateGraphRender(graphRender)),
    );

  interval(50)
    .pipe(
      take(OSCILLATOR_GAIN_PARAM_EVENTS.length),
      switchMap((_, i) =>
        from(
          OSCILLATOR_GAIN_PARAM_EVENTS.slice(-1).concat(
            OSCILLATOR_GAIN_PARAM_EVENTS.slice(
              0,
              i % (OSCILLATOR_GAIN_PARAM_EVENTS.length - 1),
            ),
            OSCILLATOR_GAIN_PARAM_EVENTS.slice(
              (i + 1) % (OSCILLATOR_GAIN_PARAM_EVENTS.length - 1),
              OSCILLATOR_GAIN_PARAM_EVENTS.length - 1,
            ),
          ),
        ),
      ),
      simulation(),
      finalize(() => graphContainer.classList.add('complete')),
    )
    .subscribe();
}

main();

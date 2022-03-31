import {Audion} from '../devtools/Types';

import {AudioGraphRender} from './graph/AudioGraphRender';

export function updateGraphSizes(
  graphRender: AudioGraphRender,
): (value: Audion.GraphContext, index: number) => Audion.GraphContext {
  return (graphContext) => graphRender.updateGraphSizes(graphContext);
}

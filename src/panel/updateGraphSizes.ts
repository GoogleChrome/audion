import {AudioGraphRender} from './graph/AudioGraphRender';

export function updateGraphSizes(
  graphRender: AudioGraphRender,
): (
  value: any,
  index: number,
) => import('/Users/zen/Code/bocoup/audion-2021/src/devtools/Types').Audion.GraphContext {
  return (graphContext) => graphRender.updateGraphSizes(graphContext);
}

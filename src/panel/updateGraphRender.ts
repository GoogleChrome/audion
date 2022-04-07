import {Audion} from '../devtools/Types';
import {AudioGraphRender} from './graph/AudioGraphRender';

export function updateGraphRender(
  graphRender: AudioGraphRender,
): (value: Audion.GraphContext) => void {
  return (graphContext) => graphRender.update(graphContext);
}

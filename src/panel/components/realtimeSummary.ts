import {map, Observable} from 'rxjs';
import {Audion} from '../../devtools/Types';
import {setElementHTML} from './domUtils';

/**
 * Format web audio context performance data in html.
 * @param realtimeData realtime performance data for a web audio context
 * @returns rendered html summary of performance data
 */
export function realtimeSummaryHTML(realtimeData: Audion.ContextRealtimeData) {
  if (!realtimeData) return '';
  const currentTime = realtimeData.currentTime.toFixed(3);
  const callbackIntervalMean = (
    realtimeData.callbackIntervalMean * 1000
  ).toFixed(3);
  const callbackIntervalVariance = (
    Math.sqrt(realtimeData.callbackIntervalVariance) * 1000
  ).toFixed(3);
  const renderCapacity = (realtimeData.renderCapacity * 100).toFixed(3);
  return realtimeData
    ? `<span>Current Time: ${currentTime} s</span>&nbsp;
<span>&#10072;</span>&nbsp;
<span>Callback Interval: &mu; = ${callbackIntervalMean} ms &sigma; = ${callbackIntervalVariance} ms</span>&nbsp;
<span>&#10072;</span>&nbsp;
<span>Render Capacity: ${renderCapacity} %</span>`
    : '';
}

/**
 * Render a summary of web audio context performance.
 * @param element$ current html element to render summary into
 * @param data$ current performance data
 * @returns an element pushed to renderRealtimeSummary after its content is modified
 */
export function renderRealtimeSummary(
  element$: Observable<HTMLElement>,
  data$: Observable<Audion.ContextRealtimeData>,
) {
  const realtimeHTML$ = data$.pipe(map(realtimeSummaryHTML));
  return setElementHTML(element$, realtimeHTML$);
}

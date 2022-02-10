import {map, Observable} from 'rxjs';
import {Audion} from '../../devtools/Types';
import {setElementHTML} from './domUtils';

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
<span>\u2758</span>&nbsp;
<span>Callback Interval: &#956; = ${callbackIntervalMean} ms &#963; = ${callbackIntervalVariance} ms</span>&nbsp;
<span>\u2758</span>&nbsp;
<span>Render Capacity: ${renderCapacity} %</span>`
    : '';
}

export function renderRealtimeSummary(
  element$: Observable<HTMLElement>,
  data$: Observable<Audion.ContextRealtimeData>,
) {
  const realtimeHTML$ = data$.pipe(map(realtimeSummaryHTML));
  return setElementHTML(element$, realtimeHTML$);
}

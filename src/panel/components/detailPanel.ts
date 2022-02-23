import {merge, NEVER, Observable} from 'rxjs';
import {distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';

import {Audion} from '../../devtools/Types';
import {setElementHTML, toggleElementClassList} from './domUtils';
import style from './detailPanel.css';

/**
 * @param context web audio context's context information
 * @returns html representation of context information
 */
function graphContextHTML({
  contextType,
  contextId,
  contextState,
  sampleRate,
  callbackBufferSize,
  maxOutputChannelCount,
}: Audion.GraphContext['context']): string {
  return `<h2>${contextType}</h2>
<p>${contextId}</p>
<hr>
<table cellspacing="0" cellpadding="0">
<tr><th>State</th><td>${contextState}</td></tr>
<tr><th>Sample Rate</th><td>${sampleRate}</td></tr>
<tr><th>Callback Buffer Size</th><td>${callbackBufferSize}</td></tr>
<tr><th>Max Output Channels</th><td>${maxOutputChannelCount}</td></tr>
</table>
`;
}

/**
 * @param node web audio node's node information
 * @returns html representation of web audio node information
 */
function graphNodeBaseHTML({
  nodeType,
  nodeId,
  channelCount,
  channelCountMode,
  channelInterpretation,
  numberOfInputs,
  numberOfOutputs,
}: Audion.GraphNode['node']): string {
  return `<h2>${nodeType}</h2>
<p>${nodeId}</p>
<hr>
<table cellspacing="0" cellpadding="0">
<tr><th>Channel Count</th><td>${channelCount}</td></tr>
<tr><th>Channel Count Mode</th><td>${channelCountMode}</td></tr>
<tr><th>Channel Interpretation</th><td>${channelInterpretation}</td></tr>
<tr><th>Number of Inputs</th><td>${numberOfInputs}</td></tr>
<tr><th>Number of Outputs</th><td>${numberOfOutputs}</td></tr>
</table>
`;
}

/**
 * @param param web audio node's single parameter information
 * @returns html representation of parameter information
 */
function graphParamHTML({
  paramType,
  paramId,
  rate,
  defaultValue,
  minValue,
  maxValue,
}: Audion.GraphNode['params'][number]): string {
  return `<h4>${paramType}</h4>
<p>${paramId}</p>
<hr>
<table cellspacing="0" cellpadding="0">
<tr><th>Automation Rate</th><td>${rate}</td></tr>
<tr><th>Default Value</th><td>${defaultValue}</td></tr>
<tr><th>Minimum Value</th><td>${minValue}</td></tr>
<tr><th>Maximum Value</th><td>${maxValue}</td></tr>
</table>
`;
}

/**
 * @param node web audio node
 * @returns html representation of a node's node and parameters information
 */
function graphNodeHTML({node, params}: Audion.GraphNode): string {
  return `${graphNodeBaseHTML(node)}
${
  params.length
    ? `<h3>Parameters:</h3>
${params.map(graphParamHTML).join('')}`
    : ''
}
`;
}

/**
 * @param element$ observable of html element to render detail panel into
 * @param contextData$ observable of context data to render
 * @param nodeData$ observable of node data to render
 * @returns observable of html elements as they are modified
 */
export function renderDetailPanel(
  element$: Observable<HTMLElement>,
  contextData$: Observable<Audion.GraphContext>,
  nodeData$: Observable<Audion.GraphNode>,
): Observable<HTMLElement> {
  return merge(
    toggleElementClassList(
      element$,
      NEVER.pipe(startWith([style.detailPanel])),
    ),
    setElementHTML(
      element$,
      contextData$.pipe(
        distinctUntilChanged((previous, current) =>
          previous && previous.context && current && current.context
            ? previous.context.contextId === current.context.contextId
            : false,
        ),
        switchMap((graphContext) =>
          nodeData$.pipe(
            distinctUntilChanged((previous, current) =>
              previous && previous.node && current && current.node
                ? previous.node.nodeId === current.node.nodeId
                : false,
            ),
            map((graphNode) =>
              graphNode && graphNode.node
                ? graphNodeHTML(graphNode)
                : graphContext && graphContext.context
                ? graphContextHTML(graphContext.context)
                : '(no recordings)',
            ),
          ),
        ),
      ),
    ),
  );
}

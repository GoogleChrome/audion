// prettier-ignore
/**
 * Send console logging to inspect window
 * @param {String} message The description of the debug event
 * @param {Object} properties The properties
 *     of audio element for debugging
 */
export function DLOG(message, properties) {
  const EXTENSION_OPTIONS_DEBUG_LOG =
      localStorage.getItem('isShownExtraDebugLog') === 'true';
  if (EXTENSION_OPTIONS_DEBUG_LOG) {
    let debugMessage = '[' + performance.now().toFixed(2) + '] ';
    if (message) {
      debugMessage += message + '\n';
    }

    for (const property in properties) {
      if (properties[property]) {
        switch (property) {
          case 'contextId':
            debugMessage += '  context ID = ' + properties[property] + '\n';
            break;
          case 'sourceNodeId':
            debugMessage +=
                '  source node ID = ' + properties[property] + '\n';
            break;
          case 'nodeId':
            debugMessage += '  node ID = ' + properties[property] + '\n';
            break;
          case 'destinationNodeId':
            debugMessage +=
                '  destination node ID = ' + properties[property] + '\n';
            break;
          case 'destinationParamId':
            debugMessage +=
                '  destination param ID = ' + properties[property] + '\n';
            break;
          case 'paramId':
            debugMessage +=
                '  audio param ID = ' + properties[property] + '\n';
            break;
          case 'reason':
            debugMessage +=
                '  Error reason is ' + properties[property] + '\n';
            break;
          default:
            break;
        }
      }
    }
    console.debug(debugMessage);
  }
}

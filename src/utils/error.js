/**
 * An error caused by a falsifiable assumption shown to be false.
 * @memberof Utils
 * @alias InvariantError
 */
export class InvariantError extends Error {
  /**
   * Create an InvariantError.
   * @param {string} message
   * @param {Array} args
   */
  constructor(message, args) {
    super();
    this._message = message;
    this._args = args;
  }

  /**
   * @type {string}
   */
  get message() {
    return this._message.replace(/%(%|\d+)/g, (match) => {
      if (match[1] === '%') {
        return '%';
      }
      return this._args[Number(match[1])];
    });
  }
}

/**
 * @param {boolean} test
 * @param {string} message
 * @param {Array} args
 * @memberof Utils
 * @alias invariant
 */
export function invariant(test, message, ...args) {
  if (!test) {
    throw new InvariantError(message, args);
  }
}

/**
 * Send console logging to inspect window
 * @param {String} message The description of the debug event
 * @param {AudioEventProperties} properties The properties of
 *     audio element for debugging
 */
export function debugLog(message, properties) {
  let debugMessage = '[' + performance.now().toFixed(2) + '] ';
  if (message) {
    debugMessage += message + '\n';
  }

  for (const property in properties) {
    if (properties[property]) {
      switch (property) {
        case 'contextId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The context ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        case 'sourceNodeId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The source node ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        case 'nodeId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The node ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        case 'destinationNodeId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The destination node ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        case 'destinationParamId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The destination param ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        case 'paramId':
          debugMessage +=
            '[' +
            performance.now().toFixed(2) +
            '] The audio param ID is ' +
            properties[property].slice(-6) +
            '\n';
          break;
        default:
          break;
      }
    }
  }

  console.debug(debugMessage);
}

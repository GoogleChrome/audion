import {Observer} from '../utils/Observer';

import {DevtoolsGraphPanel} from './DevtoolsGraphPanel';
import {WebAudioEventObserver} from './WebAudioEventObserver';
import {WebAudioGraphIntegrator} from './WebAudioGraphIntegrator';

const webAudioEvents = new WebAudioEventObserver();
const integrateMessages = new WebAudioGraphIntegrator(webAudioEvents);
const graphThrottle = Observer.throttle(integrateMessages, {});

// persistently observe web audio events
graphThrottle.observe(() => {});

new DevtoolsGraphPanel(graphThrottle);

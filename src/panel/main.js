import {chrome} from '../chrome';
import {Observer} from '../utils/Observer';

const graphObserver = new Observer((onNext, ...args) => {
  const port = chrome.runtime.connect();
  port.onMessage.addListener((message) => {
    onNext(message);
  });
  return () => {};
});

document.getElementById('status').innerText = 'starting';
graphObserver.observe((message) => {
  document.getElementById('status').innerText = `context: ${
    message.id
  } nodes: ${Object.values(message.nodes).length}`;
});

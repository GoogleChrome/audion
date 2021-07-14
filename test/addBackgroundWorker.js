/* global browser */

import {it} from '@jest/globals';

it('adds a background worker', async () => {
  const browserTargets = await browser.targets();
  const devtoolsTarget = browserTargets.find(
    (target) => target.type() === 'service_worker',
  );
  await devtoolsTarget.worker();
});

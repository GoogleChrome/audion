/* global browser */

import {it} from '@jest/globals';

it('browser launches with extension', async () => {
  const browserTargets = await browser.targets();
  const devtoolsTarget = browserTargets.find(
    (target) => target.type() === 'browser',
  );
  await devtoolsTarget.browser();
});

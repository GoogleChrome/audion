import {resolve} from 'path';

import {expect, it} from '@jest/globals';
import {from, fromEvent, lastValueFrom, takeUntil, toArray} from 'rxjs';

it('updateGraphRender does not error', async () => {
  const page = globalThis.page;
  await page.goto(
    `file://${resolve(__dirname, '../simulations/updateGraphRender.html')}`,
  );
  const pageErrors = await lastValueFrom(
    fromEvent(page, 'pageerror').pipe(
      takeUntil(from(page.waitForSelector('.complete'))),
      toArray(),
    ),
  );
  expect(pageErrors).toHaveLength(0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { OUT, render } from './build-function-data.js';

test('the functions data module matches the data files (run npm run build:functions-data)', () => {
  assert.equal(readFileSync(OUT, 'utf8'), render());
});

test('no server function uses a JSON import attribute, which Cloudflare Pages cannot bundle', () => {
  const root = fileURLToPath(new URL('../functions/', import.meta.url));
  for (const dir of ['_shared', 'api']) {
    for (const f of readdirSync(root + dir).filter((n) => n.endsWith('.js') && !n.endsWith('.test.js'))) {
      assert.doesNotMatch(readFileSync(`${root}${dir}/${f}`, 'utf8'), /with\s*\{\s*type:\s*'json'/, `${dir}/${f}`);
    }
  }
});

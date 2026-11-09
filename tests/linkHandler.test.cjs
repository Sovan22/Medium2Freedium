const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const article = 'https://medium.com/muzli-design-inspiration/new-ux-ui-trends-that-top-designers-are-switching-to-fc093ef0365b';

async function loadHandler() {
  const source = await readFile(path.join(__dirname, '../utils/linkHandler.js'), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

test('converts the supplied article link to the Freedium URL', async () => {
  const { convertToFreedium } = await loadHandler();
  assert.equal(convertToFreedium(article), `https://freedium-mirror.cfd/${article}`);
});

test('extracts links from shared text and rejects non-text input', async () => {
  const { extractSharedUrl } = await loadHandler();
  assert.equal(extractSharedUrl(`Read this: ${article}`), article);
  assert.equal(extractSharedUrl(`Read this: ${article}.`), article);
  assert.equal(extractSharedUrl('No link here'), '');
  assert.equal(extractSharedUrl(null), '');
});

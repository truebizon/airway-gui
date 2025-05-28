import test from 'node:test';
import assert from 'node:assert/strict';

// Mock Nuxt's defineEventHandler before importing the module
if (!globalThis.defineEventHandler) {
  globalThis.defineEventHandler = (handler) => handler;
}

// Ensure relative paths in the API use the repository root
process.chdir(new URL('../../app', import.meta.url).pathname);

const { default: getAreaJsonData } = await import(new URL('../../app/server/api/getAreaJsonData.js', import.meta.url));

test('getAreaJsonData returns JSON data with areas array', async () => {
  const result = await getAreaJsonData();
  assert.ok(result.areas, 'areas property should exist');
  assert.ok(Array.isArray(result.areas), 'areas should be an array');
});

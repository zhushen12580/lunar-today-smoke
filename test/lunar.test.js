'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');

test('package.json：唯一运行时依赖 lunar-javascript 精确锁定为 1.7.8', () => {
  assert.deepEqual(pkg.dependencies, { 'lunar-javascript': '1.7.8' });
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(require('lunar-javascript/package.json').version, '1.7.8');
  assert.deepEqual(pkg.bin, { 'lunar-today': 'bin/lunar-today.js' });
  assert.deepEqual(pkg.files, ['bin', 'src']);
  assert.equal(pkg.engines.node, '>=20');
  assert.equal(pkg.scripts.test, 'node --test');
});

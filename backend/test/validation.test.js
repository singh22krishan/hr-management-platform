const test = require('node:test');
const assert = require('node:assert/strict');
const { asRequiredText, asNumber, asEmail, asId } = require('../validation');

test('text validation', () => {
  assert.equal(asRequiredText(' Analyst ', 'title'), 'Analyst');
});

test('email validation', () => {
  assert.equal(asEmail('user@example.com'), 'user@example.com');
  assert.throws(() => asEmail('invalid'), /invalid/);
});

test('number validation', () => {
  assert.equal(asNumber('50000', 'salary', { required: true, min: 0 }), 50000);
  assert.throws(() => asNumber(-1, 'salary', { min: 0 }));
});

test('id validation', () => {
  assert.equal(asId('7'), 7);
  assert.throws(() => asId('2.5'));
});

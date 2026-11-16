import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContact } from './contact.js';

const ok = { topic: 'tip', message: 'The dispensary has been closed for two weeks.', consent: 'yes' };
test('a tip can be anonymous; consent and a real topic are required', () => {
  assert.equal(validateContact(ok).value.contact, null);
  assert.ok(validateContact({ ...ok, consent: '' }).error);
  assert.ok(validateContact({ ...ok, topic: 'spam' }).error);
  assert.ok(validateContact({ ...ok, message: 'short' }).error);
});
test('a reply address must look like a phone number or an email', () => {
  assert.ok(validateContact({ ...ok, contact: '0712 345 678' }).value);
  assert.ok(validateContact({ ...ok, contact: 'a@b.co' }).value);
  assert.ok(validateContact({ ...ok, contact: 'call me' }).error);
});

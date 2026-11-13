import assert from 'node:assert/strict';
import { test } from 'node:test';

import { extractActions, sanitizeMessages, visiblePortion } from './coach.mjs';

test('extractActions parses a valid trailing ACTIONS line', () => {
  const r = extractActions(
    'Do the core reset now.\nACTIONS: [{"type":"start_workout","workoutId":"quick_core_10","label":"Start Core Reset"}]',
    new Set(['quick_core_10']),
  );
  assert.equal(r.text, 'Do the core reset now.');
  assert.deepEqual(r.actions, [
    { type: 'start_workout', label: 'Start Core Reset', workoutId: 'quick_core_10' },
  ]);
});

test('extractActions drops unknown workout ids and types', () => {
  const r = extractActions(
    'Hi\nACTIONS: [{"type":"start_workout","workoutId":"nope"},{"type":"hack"},{"type":"log_water","amountMl":5000}]',
    new Set(['quick_core_10']),
  );
  assert.deepEqual(r.actions, [{ type: 'log_water', label: 'Log water', amountMl: 1000 }]);
});

test('extractActions tolerates malformed JSON', () => {
  const r = extractActions('Text\nACTIONS: [not json');
  assert.equal(r.text, 'Text');
  assert.deepEqual(r.actions, []);
});

test('visiblePortion hides the ACTIONS line while streaming', () => {
  assert.equal(visiblePortion('Hello there\nACTIONS: [{"ty'), 'Hello there');
  assert.equal(visiblePortion('Hello'), 'Hello');
});

test('sanitizeMessages merges same-role turns and starts with user', () => {
  const out = sanitizeMessages([
    { role: 'assistant', content: 'orphan' },
    { role: 'user', content: 'a' },
    { role: 'user', content: 'b' },
    { role: 'assistant', content: 'c' },
  ]);
  assert.deepEqual(out, [
    { role: 'user', content: 'a\n\nb' },
    { role: 'assistant', content: 'c' },
  ]);
});

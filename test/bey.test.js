// @flow
'use strict';
const test = require('ava');
const React = require('react');
const render = require('react-test-renderer').create;
const { state, update, Subscribe } = require('../src/bey');

test('state()', t => {
  let counter = state({ count: 1 });
  t.deepEqual(counter.get(), { count: 1 });

  let called = 0;
  let listener = () => { called++; };

  counter.on(listener);
  counter.set({ count: 2 });

  t.is(called, 1);
  counter.off(listener);
  counter.set({ count: 3 });

  t.is(called, 1);
  t.deepEqual(counter.get(), { count: 3 });
});

test('update()', t => {
  let counter = state({ count: 1 });

  let called = 0;
  let listener = () => { called++; };

  counter.on(listener);

  update(counter, state => { state.count++ });
  t.is(called, 1);

  t.deepEqual(counter.get(), { count: 2 });

  update(counter, state => state);
  t.is(called, 1);
});

test('Subscribe', t => {
  let counter = state({ count: 1 });

  let increment = () => {
    update(counter, state => { state.count++ });
  };

  let inst = render(
    <Subscribe to={counter} on={state => state.count}>
      {count => count}
    </Subscribe>
  );

  t.is(inst.toJSON(), '1');
  increment();
  t.is(inst.toJSON(), '2');
});

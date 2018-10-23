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

test('Subscribe nested value optimization', t => {
  let counter = state({ count: 1, name: "Nice Counter", stats: { isNice: true, rating: 8 } });

  let increment = () => {
    update(counter, state => { state.count++ });
  };

  let updateName = (newName) => {
    update(counter, state => { state.name = newName });
  }

  let updateStats = (newStats) => {
    update(counter, state => { Object.assign(state.stats, newStats) })
  }

  let renderNameCalled = 0;
  let renderCountCalled = 0;
  let renderIsNiceCalled = 0;
  let renderedNameIncrementer = () => { renderNameCalled++; };
  let renderedCountIncrementer = () => { renderCountCalled++; };
  let renderedIsNiceIncrementer = () => { renderIsNiceCalled++; };

  let inst = render(
    <React.Fragment>
      <Subscribe to={counter} on={state => state.count}>
        {count => {
          renderedCountIncrementer();

          return (
            <div>
              {count}
            </div>
          )
        }}
      </Subscribe>
      <Subscribe to={counter} on={state => ({ name: state.name })}>
        {({ name }) => {
          renderedNameIncrementer();

          return (
            <div>
              Counter Name: {name}
            </div>
          )
        }}
      </Subscribe>
      <Subscribe to={counter} on={state => ({ isNice: state.stats.isNice })}>
        {({ isNice }) => {
          renderedIsNiceIncrementer();

          return (
            <div>
              {isNice ? "Nice..." : "Not so nice."}
            </div>
          )
        }}
      </Subscribe>
    </React.Fragment>
  );

  t.is(renderCountCalled, 1);
  t.is(renderNameCalled, 1);
  t.is(renderIsNiceCalled, 1);

  increment();

  t.is(renderCountCalled, 2);
  t.is(renderNameCalled, 1);
  t.is(renderIsNiceCalled, 1);

  updateName("New Counter");
  updateStats({ isNice: false });

  t.is(renderCountCalled, 2);
  t.is(renderNameCalled, 2);
  t.is(renderIsNiceCalled, 2);

  updateName("New Counter");
  updateStats({ rating: 5 });

  t.is(renderCountCalled, 2);
  t.is(renderNameCalled, 2);
  t.is(renderIsNiceCalled, 2);
});
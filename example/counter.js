import React from 'react';
import { render } from 'react-dom';
import { state, update, Subscribe } from '../src/bey';

let counter = state({
  count: 0,
});

function increment() {
  update(counter, state => { state.count++ });
}

function decrement() {
  update(counter, state => { state.count-- });
}

function Counter() {
  return (
    <Subscribe to={counter} on={state => state.count}>
      {count => (
        <div>
          <button onClick={decrement}>-</button>
          <span>{count}</span>
          <button onClick={increment}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

render(<Counter/>, window.root);

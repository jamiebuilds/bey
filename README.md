# bey

> Simple immutable state for React using [Immer](https://github.com/mweststrate/immer)

- **~700B minified and gzipped** (not including React & Immer)
- Try it out alongside other state solutions
- Heavily inspired by [react-copy-write](https://github.com/aweary/react-copy-write)

## Install

```sh
yarn add bey
```

## Example

```js
import React from 'react';
import { render } from 'react-dom';
import { state, update, Subscribe } from 'bey';

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
```

Run this example locally by [cloning the repo](https://help.github.com/articles/cloning-a-repository/)
and running `yarn example` in the root directory.

## Guide

### `state()`

First you'll need to create some state containers for your app.

```js
let counter = state({
  count: 0
});
```

Call `state()` with your initial state and you're good to go.

This returns a small object which we can subscribe to, update, and get
the current state from.

### `update()`

You'll want to create some "actions" that will update your state when
called. These should just be plain functions that call `update()` inside.

```js
let counter = state({
  count: 0
});

function increment() {
  update(counter, state => { state.count++; });
}

function decrement() {
  update(counter, state => { state.count--; });
}
```

When you call `update()` you'll pass your state container and an "updater"
function. Inside the "updater" function is just passed through to
[Immer](https://github.com/mweststrate/immer) (You'll want to read about that
works).

You'll notice that inside the updater function you can just mutate whatever you
want. Don't mutate outside of the updater function though.

### `<Subscribe/>`

Finally, you'll need a way to subscribe to state updates and re-render your
tree.

```js
function Counter() {
  return (
    <Subscribe to={counter}>
      {state => <span>{state.count}</span>}
    </Subscribe>
  );
}
```

If you only need part of your state, you get pass an optional `on` prop which
selects just the state you care about and passes it through to the children
function.

```js
function Counter() {
  return (
    <Subscribe to={counter} on={state => state.count}>
      {count => <span>{count}</span>}
    </Subscribe>
  );
}
```

This also acts as an optimization when you have a large state object but only
need to re-render when a nested value in that state object is updated.

If you need multiple values, you can return an object:

```js
<Subscribe to={user} on={state => ({ name: state.name, username: state.username })}>
  {({ name, username }) => <span>{name} (@{username})</span>}
</Subscribe>
```

The same optimizations will apply using the same shallow equality check that
React uses.

### Calling actions

Actions can be called at any time from any part of your app.

```js
let counter = state({ count: 0 });

function increment() {
  update(counter, state => { state.count++; });
}

function Increment() {
  return <button onClick={increment}>+</button>;
}
```

### Multiple instances of containers

If you need to create multiple instances of containers, wrap your `state()`
call in a factory:

```js
let createCounter = () => {
  return state({ count: 0 });
};
```

Remember that your methods for updating state are just functions, don't be
afraid to write them however you need. So here we can pass the state object we
are updating as a parameter.

```js
function increment(counter) {
  update(counter, state => { state.count++; });
}

function decrement(counter) {
  update(counter, state => { state.count--; });
}
```

Then inside your components where you call those methods, pass the state
objects in:

```js
function Counter(props) {
  return (
    <Subscribe to={props.counter} on={state => state.count}>
      {count => (
        <div>
          <button onClick={() => decrement(props.counter)}>-</button>
          <span>{count}</span>
          <button onClick={() => increment(props.counter)}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

function Counters(props) {
  return (
    <div>
      <Counter counter={createCounter()}/>
      <Counter counter={createCounter()}/>
    </div>
  );
}
```

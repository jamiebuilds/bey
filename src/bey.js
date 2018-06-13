// @flow
'use strict';
const React = require('react');
const immer = require('immer').default;
const shallowEqual = require('fbjs/lib/shallowEqual');
const Symbol_observable = require('symbol-observable');

function state(initialState) {
  let listeners = [];
  let currentState = initialState;

  let emitter = {
    get() {
      return currentState;
    },
    set(nextState) {
      currentState = nextState;
      listeners.forEach(listener => listener(currentState));
    },
    reset() {
      emitter.set(initialState);
    },
    subscribe(observer) {
      let listener = observer.next;
      listeners.push(listener);
      listener(currentState);
      return {
        unsubscribe() {
          listeners = listeners.filter(fn => fn !== listener);
        },
      };
    },
    [Symbol_observable]() {
      return emitter;
    },
  };

  return emitter;
}

function update(target, updater) {
  let currState = target.get();
  let nextState = immer(currState, updater);
  if (nextState !== currState) target.set(nextState);
}

class Subscribe extends React.Component {
  static defaultProps = {
    on: state => state,
  };

  _shouldUpdate = false;
  _state = null;

  componentDidMount() {
    this._shouldUpdate = true;
    this.subscribe();
  }

  componentDidUpdate(prevProps) {
    if (this.props.to !== prevProps.to) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this._shouldUpdate = false;
    this._unsubscribe();
  }

  subscribe() {
    if (this._unsubscribe) this._unsubscribe();
    let observable = this.props.to[Symbol_observable]();
    let subscription = observable.subscribe({ next: this.onUpdate });
    this._unsubscribe = subscription.unsubscribe;
  }

  onUpdate = data => {
    let prevState = this._state;
    let nextState = this.props.on(data);
    this._state = nextState;
    if (!this._shouldUpdate) return;
    if (!shallowEqual(nextState, prevState)) {
      this.setState({});
    }
  };

  render() {
    if (this._state !== null) {
      return this.props.children(this._state);
    } else {
      return null;
    }
  }
}

exports.state = state;
exports.update = update;
exports.Subscribe = Subscribe;

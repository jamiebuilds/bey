// @flow
'use strict';
const React = require('react');
const produce = require('immer').default;
const shallowEqual = require('fbjs/lib/shallowEqual');

function verifyMinified() {}

// check inspired by immer
const isDev = (typeof process !== "undefined"
                      ? process.env.NODE_ENV !== "production"
                      : verifyMinified.name === "verifyMinified");

function state(initialState) {
  let listeners = [];
  let currentState = initialState;
  return {
    get() {
      if(isDev){
        return (Object.isFrozen(currentState)) ? currentState : Object.freeze(currentState);
      }
      return currentState;
    },
    set(nextState) {
      currentState = nextState;
      listeners.forEach(listener => listener());
    },
    on(listener) {
      listeners.push(listener);
    },
    off(listener) {
      listeners = listeners.filter(fn => fn !== listener);
    },
    reset() {
      currentState = initialState;
    },
  };
}

function update(target, updater) {
  let currState = target.get();
  let nextState = produce(currState, updater);
  if (nextState !== currState) target.set(nextState);
}

class Subscribe extends React.Component {
  static defaultProps = {
    on: state => state,
  };

  _shouldUpdate = false;
  _state = this.getState();

  componentDidMount() {
    this._shouldUpdate = true;
    this.props.to.on(this.onUpdate);
  }

  componentDidUpdate(prevProps) {
    if (this.props.to !== prevProps.to) {
      prevProps.to.off(this.onUpdate);
      this.props.to.on(this.onUpdate);
    }
  }

  componentWillUnmount() {
    this._shouldUpdate = false;
    this.props.to.off(this.onUpdate);
  }

  getState() {
    return this.props.on(this.props.to.get());
  }

  onUpdate = () => {
    let prevState = this._state;
    let nextState = this.getState();
    this._state = nextState;
    if (!this._shouldUpdate) return;
    if (!shallowEqual(nextState, prevState)) {
      this.setState({});
    }
  };

  render() {
    return this.props.children(this._state);
  }
}

exports.state = state;
exports.update = update;
exports.Subscribe = Subscribe;

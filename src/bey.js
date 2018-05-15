// @flow
'use strict';
const React = require('react');
const immer = require('immer').default;

function state(initialState) {
  let listeners = [];
  let currentState = initialState;
  return {
    get() {
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
  let nextState = immer(currState, updater);
  if (nextState !== currState) target.set(nextState);
}

class Subscribe extends React.Component {
  static defaultProps = {
    on: state => state,
  };

  _hasUnmounted = false;

  componentDidMount() {
    this._currState = this.props.to.get();
    this.props.to.on(this.onUpdate);
  }

  componentDidUpdate(prevProps) {
    if (this.props.to !== prevProps.to) {
      prevProps.to.off(this.onUpdate);
      this.props.to.on(this.onUpdate);
    }
  }

  componentWillUnmount() {
    this.props.to.off(this.onUpdate);
    this._hasUnmounted = true;
  }

  onUpdate = () => {
    let currState = this._currState;
    let nextState = this.props.to.get();

    this._currState = nextState;

    if (this.props.on(nextState) !== this.props.on(currState)) {
      this.setState({});
    }
  };

  render() {
    return this.props.children(this.props.on(this.props.to.get()));
  }
}

exports.state = state;
exports.update = update;
exports.Subscribe = Subscribe;

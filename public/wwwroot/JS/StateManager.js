class StateManager {
  constructor() {
    this.state = {};
  }

  initialize(lastState = {}) {
    Object.assign(this.state, {
      play: false,
      stop: false,
      capture: false,
      idle: true,
      ...lastState,
    });
  }

  setState(stateKey, value) {
    if (this.state.hasOwnProperty(stateKey)) {
      this.state[stateKey] = value;
    } else {
      console.warn(`State key "${stateKey}" does not exist.`);
    }
  }

  toggleState(stateKey) {
    if (this.state.hasOwnProperty(stateKey)) {
      this.state[stateKey] = !this.state[stateKey];
    } else {
      console.warn(`State key "${stateKey}" does not exist.`);
    }
  }

  getState(stateKey) {
    return this.state.hasOwnProperty(stateKey) ? this.state[stateKey] : null;
  }

  resetState() {
    Object.keys(this.state).forEach((key) => {
      this.state[key] = false;
    });
    this.state.idle = true;
  }

  isPlaying() {
    return this.state.play;
  }

  isStopped() {
    return this.state.stop;
  }

  isCapturing() {
    return this.state.capture;
  }

  isIdle() {
    return this.state.idle;
  }
}

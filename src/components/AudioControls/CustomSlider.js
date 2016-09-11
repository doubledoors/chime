/* eslint-disable no-console, no-alert */

import React, { Component, PropTypes } from 'react';

import CustomSliderThumb from './CustomSliderThumb';
import CustomSliderTrack from './CustomSliderTrack';

import styles from './CustomSlider.scss';

export default class CustomSlider extends Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      drag: false,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
  }
  componentWillMount() {
    this.updateStateFromProps(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.updateStateFromProps(nextProps);
  }
  onMouseDown(evt) {
    const leftMouseButton = 0;
    if (evt.button !== leftMouseButton) return;
    this.updateSliderValue(evt);
    this.setState({
      drag: true,
    });
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    evt.preventDefault();
  }
  updateSliderValue(evt) {
    const { max, min, value: previousValue } = this.state;
    // compare clientX to slider length to get percentage
    const x = evt.clientX - evt.target.getBoundingClientRect().left;
    const totalLength = this.getSliderLength();
    const percent = this.clampValue(+(x / totalLength).toFixed(2), 0, 1);
    // convert perc -> value then match value to notch as per props/state.step
    const rawValue = this.valueFromPercent(percent);
    const value = this.calculateMatchingNotch(rawValue);
    // percentage of the range to render the track/thumb to
    const ratio = (value - min) * 100 / (max - min);
    this.setState({
      percent,
      value,
      ratio,
    });
    // fire onChange if the value has actually changed
    if (value !== previousValue) this.props.onChange(this.state);
  }
  valueFromPercent(perc) {
    const { range, min } = this.state;
    const val = (range * perc) + min;
    // console.log(`${range} * ${perc} + ${min} = ${val}`);
    return val;
  }
  calculateMatchingNotch(value) {
    const { step, max, min } = this.state;
    let match;
    const values = [];
    for (let i = min; i <= max; i++) {
      values.push(i);
    }
    const notches = [];
    // find how many entries in values are divisible by step (+min,+max)
    for (const s of values) {
      if (s === min || s === max || s % step === 0) {
        notches.push(s);
      }
    }
    match = notches.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    console.log(`${value} matched to closest notch ${match}`);
    return match;
  }
  clampValue(val, min, max) {
    return Math.max(min, Math.min(val, max));
  }
  mouseUp() {
    this.setState({
      drag: false,
    });
    document.removeEventListener('mouseup', this.mouseUp);
    document.removeEventListener('mousemove', this.mouseMove);
  }
  mouseMove(evt) {
    if (!this.state.drag) return;
    this.updateSliderValue(evt);
  }
  getSliderLength() {
    const sl = this.refs.slider;
    return sl.clientWidth;
  }
  updateStateFromProps(props) {
    const value = (props.value === undefined ? props.defaultValue : props.value);
    const { min, max, step, height } = props;
    const range = max - min;
    const ratio = (value - min) * 100 / (max - min);
    this.setState({
      height,
      value,
      min,
      max,
      range,
      step,
      ratio,
    });
  }
  render() {
    const sliderStyle = {
      height: `${this.state.height}px`,
    };
    return (
      <div
        ref="slider"
        className={styles.slider}
        onMouseDown={this.onMouseDown}
        style={sliderStyle}
      >
        <CustomSliderTrack
          className={styles.track}
          trackLength={this.state.ratio}
          trackHeight={this.state.height}
        />
        <CustomSliderThumb
          thumbPosition={this.state.ratio}
          height={this.state.height}
        />
      </div>
    );
  }
}


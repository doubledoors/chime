import React, { Component, PropTypes } from 'react';

import MuteToggle from './MuteToggle';
import ReactSimpleRange from 'react-simple-range';

import styles from './AudioPlayer.scss';

// audio files
import chime from './files/chime.mp3';
import beep from './files/beep.mp3';

export default class AudioPlayer extends Component {
  static propTypes = {
    audioPlaying: PropTypes.bool,
    onAudioComplete: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      muted: false,
      volume: 5,
      previousVolume: null,
      audioPlaying: props.audioPlaying,
      chime,
      pauseInterval: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.pauseAudio = this.pauseAudio.bind(this);
  }
  componentDidMount() {
    // initialize audio element
    this.audioElement.volume = this.state.volume / 10;
    this.audioElement.muted = this.state.muted;
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   const { audioPlaying, volume } = this.state;
  //   return (nextProps.audioPlaying !== audioPlaying || nextState.volume !== volume);
  // }
  componentWillReceiveProps(nextProps) {
    const currentState = this.state.audioPlaying;
    const { audioPlaying } = nextProps;
    // should be redundant w/ shouldComponentUpdate but needs test
    if (audioPlaying === currentState) return;
    if (audioPlaying) {
      this.playAudio();
    } else if (!audioPlaying) {
      this.pauseAudio();
    }
  }
  playAudio() {
    const duration = this.audioElement.duration * 1000; // .duration uses secs
    const pauseInterval = setTimeout(this.pauseAudio, duration);
    this.audioElement.play();
    this.setState({
      pauseInterval,
    });
  }
  pauseAudio() {
    clearTimeout(this.state.pauseInterval);
    this.setState({
      pauseInterval: null,
    });
    this.audioElement.pause();
    this.props.onAudioComplete();
  }
  handleChange(newState) {
    let volume;
    let muted;
    let previousVolume = null;
    // if we're setting volume using component state from CustomSlider
    if (newState.hasOwnProperty('value')) {
      if (newState.value > 0) {
        volume = newState.value;
        muted = false;
      } else {
        previousVolume = this.state.volume;
        volume = 0;
        muted = true;
      }
    } else {
      // else we're just toggling mute by inverting this.state
      muted = !this.state.muted;
      // muting: cache current volume for future unmute
      if (muted) {
        previousVolume = this.state.volume;
        volume = 0;
      // toggle unmute and return previous volume value
      } else if (!muted) {
        volume = this.state.previousVolume;
      }
    }
    this.setState({
      volume,
      muted,
      previousVolume,
    });
    this.audioElement.volume = volume / 10; // html5 audio api is 0-1
    this.audioElement.muted = muted;
  }
  render() {
    return (
      <div>
        <div className={styles.iconwrap}>
          <MuteToggle
            onChange={this.handleChange}
            muted={this.state.muted}
          />
        </div>
        <div className={styles.sliderwrap}>
          <ReactSimpleRange
            onChange={this.handleChange}
            min={0}
            max={10}
            step={1}
            defaultValue={this.state.volume}
          />
        </div>
        <audio
          ref={(c) => (this.audioElement = c)}
        >
          html5 <code>audio</code> element not supported by your browser, dayum.
          <source src={this.state.chime} type="audio/mpeg">
          </source>
        </audio>
      </div>
    );
  }
}


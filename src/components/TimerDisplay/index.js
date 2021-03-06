import React, { PropTypes } from 'react';

import styles from './TimerDisplay.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

import ProgressIndicator from './ProgressIndicator';

const TimerDisplay = ({ time, perc, paused }) => {
  let className = cx({
    timer: true,
    paused,
  });
  return (
    <div>
      <ProgressIndicator
        perc={perc}
      />
      <h2 className={className}>{time}</h2>
    </div>
  );
};
TimerDisplay.propTypes = {
  time: PropTypes.string.isRequired,
  perc: PropTypes.number,
  paused: PropTypes.bool,
};

export default TimerDisplay;

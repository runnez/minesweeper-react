import React, { useState, useEffect } from 'react';
import Digits from './Digits'

const Timer = React.memo(({ paused }) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {

      if (!paused) {
        setSeconds(seconds + 1)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [seconds, setSeconds, paused])

  return (
    <Digits value={seconds} />
  );
});

export default Timer;

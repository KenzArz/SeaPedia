import React from 'react';
const WaveBg: React.FC = React.memo(() => (
  <img
    src="/wave-bg.svg"
    aria-hidden="true"
    alt=""
    className="wave-bg-global"
  />
));

WaveBg.displayName = 'WaveBg';

export default WaveBg;

import { stakingProtocols } from 'config/stakingConfig';
import React from 'react'
import { isGoviToken } from 'utils';
import Coin from './Coin';
import Pairs from './Pairs';

const StakedAmount = ({token, protocol, StakedValue}) => {
  const [leftToken, rightToken] = token?.split('-');
  
  return <div className="staked-amount-component">
   {stakingProtocols[protocol] === stakingProtocols.platform ? 
      (isGoviToken(token) ? 
        <Pairs leftToken={leftToken} rightToken={rightToken} hideNames /> : <Coin token={token} />) : 
      <Pairs leftToken={leftToken} rightToken={rightToken} protocol={protocol} hideNames />
    }
    {StakedValue}
  </div>
}

export default StakedAmount;
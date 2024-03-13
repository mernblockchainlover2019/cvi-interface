import AddMetamaskAsset from 'components/AddMetamaskAsset/AddMetamaskAsset';
import { stakingProtocols } from 'config/stakingConfig';
import React from 'react'
import { isGoviToken } from 'utils';

const Coin = ({token, showName, protocol, version}) => {
  if(!token) return null;
  const tokenKey =  isGoviToken(token) ? 'govi' : token;
  const tokenName = tokenKey.split('-').length > 1 ? tokenKey.replace(/-([^-]*)$/, ' $1') : tokenKey;

  return <> 
      <img className="coin-component--img" src={require(`images/coins/${tokenKey}.svg`).default} alt={tokenKey} />
      {showName && <span className="coin-component--text">{tokenName.toUpperCase()}</span>}
      {version && <img className="coin-component--img coin-component--version-img" src={require(`images/coins/${version}.svg`).default} alt={version} />}
      {protocol === stakingProtocols.platform && <AddMetamaskAsset token={token} protocol={protocol} /> }
  </>
}

export default Coin;
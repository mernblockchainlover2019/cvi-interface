import React from 'react'
import Value from './Value';

const Apy = ({apyList = [], buyBond}) => {
    const apys = ["Yearly", "Weekly", "Daily"];
    return <div className="apy-component">
      {buyBond && <a className='buy-bond' title="Buy Bond" href={buyBond} target="_blank" rel="nofollow noopener noreferrer">Buy Bond <img src={require('../../../../images/icons/fire.svg').default} alt="fire" /></a>}
      {apyList.map((apy, index) => <Value key={index} text={apy} subText={apys[index]} disableSpace />)}
    </div>
}

export default Apy;
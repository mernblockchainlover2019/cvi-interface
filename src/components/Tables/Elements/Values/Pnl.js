import React, { useMemo } from 'react'
import { DataState } from './DataState';
import { commaFormatted } from 'utils';

const Pnl = ({value, token, format}) => {
    return useMemo(() => {
        const isPositive = value?.percent >= 0;
        return (
            <div className={`pnl-component ${isPositive ? 'high' : 'low'}`}>
                <DataState value={value}>
                    <b>{commaFormatted(format) ?? value?.amount} </b>
                    <span className="pnl-component__token">{token} </span>
                    <span className="pnl-component__precents">{`(${isPositive ? '+' : ''}${value?.percent}%)`} <img src={require(`images/icons/${isPositive ? 'up-arrow' : 'down-arrow'}.svg`).default} alt="arrow" /></span>
                </DataState>
            </div>
        )
    }, [token, value, format]);
}

export default Pnl;
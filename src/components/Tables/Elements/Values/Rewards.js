import Spinner from 'components/Spinner/Spinner';
import React, { useMemo } from 'react'
import Value from './Value';

const Rewards = ({rewards = [], type}) => {

    return useMemo(() => {
        if(rewards === null) return <Spinner className="statistics-spinner claim-spinner" />
        const claimableToday = (symbol, totalAmount) => `${totalAmount ? `(${totalAmount} ${symbol})` : ''}`;
        const rewardValue = (amount, maxAmount, symbol) => {
            if(maxAmount) {
                return `${amount}/${maxAmount} ${symbol === "WETH" ? "ETH" : symbol}`;
            }
            return `${amount} ${symbol === "WETH" ? "ETH" : symbol}`;
        }
        const progressBarPercents = (amount, maxAmount) => amount > maxAmount ? 100 : (amount / maxAmount) * 100;

        return (
            <div className={`rewards-component ${type ?? ''}`}>
                {rewards !== "N/A" && rewards.map(({amount, maxClaimableRewards, symbol, totalAmount}) => <Value 
                    key={symbol} 
                    progressBarPercents={progressBarPercents(amount, maxClaimableRewards)} 
                    text={amount === null ? null : rewardValue(amount, maxClaimableRewards, symbol)} 
                    subText={claimableToday(symbol, totalAmount)} 
                />)}
            </div>
        )
    }, [rewards, type]);
}

export default Rewards;
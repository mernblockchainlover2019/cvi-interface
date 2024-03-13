import { useWeb3Api } from 'contracts/useWeb3Api';
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { toBN } from 'utils';
import GlobalStatistics from './GlobalStatistics';
import PlatformsStats from './PlatformsStats';
import './Statistics.scss';

const Statistics = () => {
    const { selectedNetwork } = useSelector(({app}) => app)
    const [platformBalance] = useWeb3Api("getPlatformBalance");
    const [liquidityPools] = useWeb3Api("getLiquidityPoolsBalance");
    const [goviPrice] = useWeb3Api("getGoviPrice");
    const [feesCollected] = useWeb3Api("getFeesCollected");

    return useMemo(() => {
        const platformBalanceReduced = platformBalance !== "N/A" && platformBalance?.length > 1 ? platformBalance?.reduce((a, b) => toBN(a).add(b[1]), 0) : platformBalance?.[0]?.[1]; // sum active tokens tvl

        return  (
            <>
                <GlobalStatistics 
                    platformBalance={platformBalance}
                    platformBalanceReduced={platformBalanceReduced}
                    goviPrice={goviPrice}
                    feesCollected={feesCollected}
                />

                <PlatformsStats 
                    platformBalance={platformBalance}
                    selectedNetwork={selectedNetwork}
                    liquidityPools={liquidityPools}
                />
            </>
        )
    }, [platformBalance, liquidityPools, goviPrice, feesCollected, selectedNetwork]);
}


export default Statistics;
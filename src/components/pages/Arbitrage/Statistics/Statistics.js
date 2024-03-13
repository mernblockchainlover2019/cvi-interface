import { appViewContext } from 'components/Context';
import Button from 'components/Elements/Button';
import { useActiveToken, useIsMobile, useIsTablet } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import Container from 'components/Layout/Container';
import IndexValue from 'components/pages/Platform/IndexStats/IndexValue';
import { Value } from 'components/Tables/Elements/Values';
import arbitrageConfig from 'config/arbitrageConfig';
import config from 'config/config';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import { customFixed } from 'utils';
import './Statistics.scss';

const Statistics = () => {
    const { selectedNetwork } = useSelector(({ app }) => app);
    const { w3 } = useContext(appViewContext);
    const { account } = useActiveWeb3React();
    const activeToken = useActiveToken();
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();
    const [statisticsDetails, setStatisticsDetails] = useState({
        tokenPrice: null,
        intrinsicValue: null
    });


    const checkUpKeepers = useCallback(async () => {
        try {
            const volToken = w3.tokens[activeToken.rel.volTokenKey];
            await volToken.checkUpkeep();
            alert("Please check the response in the console.");
        } catch(error) {
            console.log(error);
        }
    }, [activeToken, w3]);
    
    const performUpKeep = useCallback(async () => {
        try {
            const volToken = w3.tokens[activeToken.rel.volTokenKey];
            await volToken.performUpkeep({account});
            alert("Please check the response in the console.");
        } catch(error) {
            console.log(error);
        }
    }, [account, activeToken?.rel?.volTokenKey, w3?.tokens]);

    const getStatisticsDetails = useCallback(async (tokenContract) => {
        try {
            const [tokenPrice, intrinsicValue] = [await tokenContract.getUSDPrice(), await tokenContract.getIntrinsicPrice()];
            setStatisticsDetails({
                tokenPrice,
                intrinsicValue
            });
        } catch(error) {
            console.log(error);
            setStatisticsDetails({
                tokenPrice: "N/A",
                intrinsicValue: "N/A"
            })
        }
    }, [])

    useEffect(() => {
        const tokenContract = w3?.tokens?.[activeToken?.rel?.volTokenKey];
        if(!tokenContract) return;

        const { tokenPrice, intrinsicValue} = statisticsDetails;
        if(!tokenPrice && !intrinsicValue) {
            getStatisticsDetails(tokenContract)
        }
    }, [activeToken?.rel?.volTokenKey, getStatisticsDetails, statisticsDetails, w3?.tokens]);

    
    return useMemo(() => {
        
        if (!selectedNetwork || !activeToken) return null;
        const { pairToken } = activeToken;
        const loadActiveVol = Object.values(arbitrageConfig.tokens[selectedNetwork]).map(({ oracleId }) => oracleId)[0];
        const { tokenPrice, intrinsicValue } = statisticsDetails;
        return (
            <Container className="arbitrage-statistics-component">
                <Value
                    header="Index"
                    text={loadActiveVol === null ? null : <IndexValue
                        type="arbitrage-statistics"
                        activeIndex={loadActiveVol}
                    />}
                />

                <Value
                    header={`${!isMobile && isTablet ? '' : activeToken.name.toUpperCase()} Platform price`}
                    text={intrinsicValue === null ? null : `${customFixed(intrinsicValue, pairToken.statisticsDecimals)} USDC`}
                />

                <Value
                    header={`${!isMobile && isTablet ? '' : activeToken.name.toUpperCase()} ${arbitrageConfig.exchanges[selectedNetwork].mainExchange.label} price`}
                    text={tokenPrice === null ? null : `${customFixed(tokenPrice, pairToken.statisticsDecimals)} USDC`}
                />

                <a href={arbitrageConfig.exchanges[selectedNetwork].mainExchange.path}
                    rel="nofollow noopener noreferrer"
                    className="statistics-trade-button"
                    target="_blank"
                >
                        {`Trade ${activeToken.name.toUpperCase()}`}
                </a>

                {!config.isMainnet && <> 
                    <Button 
                        className="statistics-trade-button"
                        onClick={checkUpKeepers}
                    >
                        Check keepers
                    </Button>
                    
                    <Button 
                        className="statistics-trade-button"
                        onClick={performUpKeep}
                    >
                        Perform up keepers
                    </Button>
                </>}
            </Container>
        )
    }, [selectedNetwork, activeToken, statisticsDetails, isMobile, isTablet, checkUpKeepers, performUpKeep]);
}

export default Statistics;
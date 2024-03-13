
import { useActiveToken, useIsTablet, useNetworkVersion } from "components/Hooks";
import { appViewContext } from 'components/Context';
import DataController from 'components/Tables/DataController';
import ExpandList from 'components/Tables/ExpandList';
import Table from 'components/Tables/Table';
import arbitrageConfig, { activeTabs, activeViews } from 'config/arbitrageConfig';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Container from 'components/Layout/Container';
import TabsForm from 'components/TabsForm';
import './ArbitrageTables.scss';
import moment from 'moment';
import { commaFormatted, customFixed, customFixedTokenValue, toBN, toDisplayAmount } from 'utils/index';
import { clone, upperFirst } from "lodash";
import { MAX_PERCENTAGE } from "contracts/utils";

const ArbitrageTables = () => {
    const [activeTab, setActiveTab] = useState();
    const { activeView } = useContext(appViewContext);

    return useMemo(() => {
        if(!activeView) return null;
        
        const renderView = () => {
            if(!activeTab) return null;
            switch(activeTab) {
                case activeViews.history:
                    return <HistoryTable activeTab={activeTab} />
                default:
                    return <DefaultTable activeTab={activeTab} />
            }
        }

        return (
            <Container className="arbitrage-tables-component">
                <TabsForm 
                    id="table"
                    tabs={arbitrageConfig.tablesInfo[activeView].tabs} 
                    activeTab={activeTab} 
                    setActiveTab={(tab) => setActiveTab(tab)}
                >
                    {renderView()}
                </TabsForm>
            </Container>
        )
    }, [activeTab, activeView]);
}

const DataView = () => {
    const isTablet = useIsTablet();
    return useMemo(() => {
        return isTablet ? <ExpandList /> : <Table />
    }, [isTablet]);
}

const DefaultTable = ({activeTab}) => {
    const { activeView, w3 } = useContext(appViewContext);
    const { unfulfilledRequests } = useSelector(({wallet}) => wallet);
    const { selectedNetwork } = useSelector(({app}) => app);
    const [data, setData] = useState(null);
    const activeToken = useActiveToken();

    useEffect(() => {
        if(unfulfilledRequests?.length === 0) return setData([]);
        if(!unfulfilledRequests?.length) return;

        const getArbitrageData = async () => {
            try {
                const requests = await Promise.all(unfulfilledRequests.map(async ({
                    event, id, requestId, requestType, submitFeesAmount, targetTimestamp, timestamp, tokenAmount,
                }) => {
                    const latestBlock = await w3.block.getLatestBlock();
                    const lastBlockTime = latestBlock.timestamp;
                    const fromToken = arbitrageConfig.requestType[requestType] === activeTabs.burn ? activeToken : activeToken.pairToken; 
                    const fromTokenName = fromToken.name.toUpperCase();
                    const MAX_UPFRONT_FEE = toBN("500");
                    const requestTypeLabel = arbitrageConfig.requestType[requestType];
                    const timeDelayFeeAmount = toBN(tokenAmount).sub(toBN(toBN(tokenAmount).sub(toBN(submitFeesAmount))));
                    const maxFeeAmount = toBN(tokenAmount).mul(MAX_UPFRONT_FEE).div(toBN(MAX_PERCENTAGE));
                    const advanceAmount = toBN(maxFeeAmount).add(toBN(timeDelayFeeAmount));
                    const submitTimeSubmitFeeDiff = moment.utc(targetTimestamp*1000).diff(timestamp*1000)
                    const SubmitFeeLastBlockDiff = moment.utc(targetTimestamp*1000).diff(lastBlockTime*1000);
                    const amountDisplay = toDisplayAmount(tokenAmount, fromToken.decimals);
                    const fulfillmentFeeFixed = customFixed(toDisplayAmount(clone(submitFeesAmount), fromToken.decimals), fromToken.fixedDecimals);
                    const fulfillmentFeePercentage = (fulfillmentFeeFixed / amountDisplay) * 100;
                    const upfrontPaymentFixed = customFixedTokenValue(advanceAmount, fromToken.fixedDecimals, fromToken.decimals);
                    const amountToFulfill = customFixedTokenValue(toBN(tokenAmount).sub(advanceAmount), fromToken.fixedDecimals, fromToken.decimals);
                    const tokenAmountToFulfill = toBN(tokenAmount).sub(advanceAmount);
        
                    const toToken = arbitrageConfig.requestType[requestType] === activeTabs.mint ? activeToken : activeToken.pairToken;
        
                    return {
                        event,
                        id,
                        requestId,
                        type: requestTypeLabel,
                        tokenAmount,
                        amount: commaFormatted(customFixed(amountDisplay, fromToken.fixedDecimals)),
                        symbol: fromTokenName,
                        submitTime: timestamp,
                        submitTimeToFulfillment: {
                            text: moment.utc(moment.duration(submitTimeSubmitFeeDiff).asMilliseconds()).format("HH:mm"),
                            subText: "HH:MM"
                        },
                        timeToFulfillmentFee: `${commaFormatted(customFixed(fulfillmentFeePercentage, 2))}%`,
                        upfrontPayment: commaFormatted(upfrontPaymentFixed),
                        fulfillmentIn: moment.duration(SubmitFeeLastBlockDiff).asMilliseconds(),
                        amountToFulfill: commaFormatted(amountToFulfill),
                        tokenAmountToFulfill,
                        action: true,
                        lastBlockTime,
                        delayFee: String(Math.floor(fulfillmentFeePercentage * 100)),
                        toToken,
                        fromToken
                    }
                }));

                setData(requests);
            } catch(error) {
                console.log(error);
                setData([]);
            }
        }
        getArbitrageData();
    // eslint-disable-next-line
    }, [activeToken, unfulfilledRequests?.length]);

    return useMemo(() => {
        const tableHeaders = arbitrageConfig.tables[selectedNetwork][activeView][activeTab].headers;
       
        return <DataController 
            authGuard
            activeTab={activeTab} 
            data={data}
            showPaginator
            customTableHeaders={!tableHeaders ? [] : Object.values(tableHeaders)}
            labels={{
                pending: arbitrageConfig.tablesInfo[activeView].tabs.pending.toLowerCase()
            }}
        >
           <DataView />
        </DataController>
    }, [selectedNetwork, activeView, activeTab, data]);
}

const HistoryTable = ({activeTab}) => {
    const { activeView } = useContext(appViewContext);
    const { arbitrage } = useSelector(({wallet}) => wallet);
    const { selectedNetwork } = useSelector(({app}) => app);
    const appVersion = useNetworkVersion();
    const activeToken = useActiveToken();

    return useMemo(() => {
        const tableHeaders = arbitrageConfig.tables[selectedNetwork][activeView][activeTab].headers;
        const historyData = arbitrage ? arbitrage.map(({
            event, tokenAmount, mintedShortTokens, mintedTokens, burnedTokens, timestamp
        }) => {
            const fromToken = arbitrageConfig.requestType[event] === activeTabs.burn ? activeToken : activeToken.pairToken;
            const tokenAmountFormatted = commaFormatted(customFixedTokenValue(tokenAmount, 2, 6));
            const fromTokenLabel = fromToken.name.toUpperCase();
            const toToken = arbitrageConfig.requestType[event] === activeTabs.burn ? activeToken.pairToken : activeToken;
            const toTokenName = toToken?.name.toUpperCase();
            const type = upperFirst(arbitrageConfig.requestType[event]);
            const amount = commaFormatted(customFixedTokenValue(arbitrageConfig.requestType[event] === activeTabs.burn ? burnedTokens : tokenAmount, fromToken.fixedDecimals, fromToken.decimals));
            const tokenlpName = `${fromToken.oracleId.toUpperCase()}-${fromToken.name.toUpperCase()} LP`;
            const _mintedShortToken = commaFormatted(customFixedTokenValue(mintedShortTokens, fromToken.fixedDecimals, fromToken.lpTokensDecimals));
            const receivedTokens = 
                arbitrageConfig.requestType[event] === activeTabs.burn ? 
                tokenAmountFormatted 
            : 
            commaFormatted(customFixedTokenValue(burnedTokens ?? mintedTokens, fromToken.fixedDecimals, fromToken.lpTokensDecimals));

            return {
                fulfillmentTime: moment.utc(timestamp * 1000).format('DD/MM/YY HH:mm'),
                type,
                amount: `${amount} ${fromTokenLabel}`,
                receivedTokens: `${receivedTokens} ${toTokenName}`,
                ...appVersion === 'v1' ? {collateralMint: mintedShortTokens ? `${_mintedShortToken} ${tokenlpName}` : 0} : {}
            }
        }) : null;

        return <DataController 
            authGuard
            activeTab={activeTab} 
            data={historyData}
            showPaginator
            customTableHeaders={!tableHeaders ? [] : Object.values(tableHeaders)}
        >
            <DataView />
        </DataController>
    }, [activeTab, activeToken, arbitrage, selectedNetwork]); // eslint-disable-line
}


export default ArbitrageTables;
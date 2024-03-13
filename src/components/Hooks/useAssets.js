import { contractsContext } from "contracts/ContractContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useActiveWeb3React } from "./wallet";
import { commaFormatted, customFixed, customFixedTokenValue, toBN, toBNAmount } from 'utils';
import stakingConfig from "config/stakingConfig";
import { useSelector } from "react-redux";
import platformConfig from "config/platformConfig";
import web3Api from "contracts/web3Api";
import { useInDOM, useIsMount } from ".";
import { useWeb3React } from '@web3-react/core';
import config from "config/config";
import stakingApi from 'contracts/apis/staking';

const useAssets = (type, w3) => {
    const { library } = useWeb3React(config.web3ProviderId);
    const { account } = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const [filteredAssets, setFilteredAssets] = useState(null);
    const { selectedNetwork } = useSelector(({app}) => app);
    const events = useSelector(({events}) => events);
    const eventsUpdateRef = useRef(null);
    const { positions, liquidities } = useSelector(({wallet}) => wallet);
    const actionConfirmedCounter = useSelector(({events}) => events.actionConfirmed);
    const isMount = useIsMount();
    const isActiveInDom = useInDOM();

    const getAssets = () => {
        const stakingAssets = () => {
            let liquidityMiningProtocols = stakingConfig.tokens[selectedNetwork];
            let liquidityMiningProtocolsValues = Object.values(liquidityMiningProtocols);
            let liquidityMiningTokens = liquidityMiningProtocolsValues.map(protocol => Object.values(protocol));
            let stakingAssetsData = liquidityMiningTokens.reduce((prev, next) => prev.concat(next));
            return stakingAssetsData.filter(token => !token.soon)
        }
        
        const platformAsset = () => Object.values(platformConfig.tokens[selectedNetwork]).filter(token => !token.soon)

        switch (type) {
            case "staked":
                return stakingAssets();
            case "available-to-stake":
                return stakingAssets();
            case "Open positions": 
                return platformAsset();
            case "Liquidity": 
                return platformAsset();
            default:
                return [];
        }

    }
    
    const filter = async () =>{
        let filteredAssets = getAssets();
        switch (type) {
            case "staked": {
                const filterAsset = async (asset) => {
                    try {
                        if(asset.key === 'govi-v2') { // use the sdk only for govi v2 asset
                            const stakingInstance = w3.stakings[asset.rel.stakingRewards];
                            const token = w3.tokens[asset.rel.contractKey];
                            const {stakedAmount, sharePercent: poolSize} = await stakingInstance.staked(account);
                            const stakedAmountUSD = await token.getUSD(stakedAmount);

                            return {...asset, data: {staked: {
                                lastStakedAmount: {class: '', value: `(${customFixed(poolSize, 2)}%)`},
                                poolSize: poolSize,
                                stakedAmount: commaFormatted(customFixedTokenValue(stakedAmount, asset.fixedDecimals, asset.decimals)),
                                stakedAmountUSD: commaFormatted(customFixed(stakedAmountUSD, 2)),
                                stakedTokenAmount: stakedAmount
                            }, claim: []}}
                        }
                        let staked = await stakingApi.getStakedAmountAndPoolShareByToken(contracts, asset, account, selectedNetwork);
                        const claim = await stakingApi.getClaimableRewards(contracts, asset, account, selectedNetwork);

                        return {...asset, data: {staked, claim}}
                    } catch(error) {
                        console.log(error)
                        return {...asset, data: {staked: "N/A", claim: []}}
                    }
                }   

                filteredAssets = filteredAssets.map(async asset => await filterAsset(asset))
                filteredAssets = await Promise.allSettled(filteredAssets);

                if(!isActiveInDom()) return;    
                return filteredAssets.map(({value}) => value).filter(({decimals, data: {staked, claim}}) => {
                    const stakedTokenAmount = staked?.stakedTokenAmount ?? 0
                    const hasStaked = toBN(stakedTokenAmount).gt(toBN(0));
                    const canClaim = claim?.some(({amount}) => amount && toBN(toBNAmount(amount, decimals)).gt(toBN(0)));
                    const shouldFiltered = !hasStaked && !canClaim
                    return !shouldFiltered
                })
            }
            case "available-to-stake": {
                return filteredAssets.filter(({disable}) => !disable);
            }
            case "Open positions": {
                filteredAssets = filteredAssets.map(async asset => {
                    const pos = await contracts[asset.rel.platform].methods.positions(account).call();
                    const positionValue = toBN(pos.positionUnitsAmount).gt(toBN(0)) ?
                        await web3Api.getAvailableBalance(contracts, asset, {library, account, type: "sell", errorValue: "0" } ) 
                        : "0";
                    return {...asset, data: { positionValue, pos } };
                })
                filteredAssets = await Promise.all(filteredAssets);
                filteredAssets = filteredAssets.filter(({data: {positionValue}}) => toBN(positionValue).gt(toBN(0)));
                return filteredAssets
            }

            case "Liquidity": {
                filteredAssets = filteredAssets.map(async asset => {
                    const data = await web3Api.getAvailableBalance(contracts, asset, {account, library, withStakeAmount: true, type: "withdraw"});
                    return {...asset, data };
                })
                filteredAssets = await Promise.all(filteredAssets);
                return filteredAssets.filter(({data: {myShare}}) => toBN(myShare).gt(toBN(0)) )
            }
        
            default:
                return filteredAssets;
        }
    }

    const dataFiltering = async (cb) => {
        if((!contracts || !account) && type !== "available-to-stake") return [];
        let filteredAssets = await filter();
        cb(() => setFilteredAssets(filteredAssets));
    }

    useEffect(() => {
        if(!!filteredAssets?.length) {
            setFilteredAssets(null)
        }
        let canceled = false

        dataFiltering((cb)=>{
            if(canceled) return
            cb()
        });

        return () => {
            canceled = true;
        }
    //eslint-disable-next-line
    },[contracts, account, type]);

    useEffect(() => {
        if(isMount) return;

        let canceled = false

        dataFiltering((cb)=>{
            if(canceled) return
            cb()
        });

        return () => {
            canceled = true;
        }
    //eslint-disable-next-line
    }, [events, actionConfirmedCounter]);

    useEffect(() => {
        let canceled = false
        if(type === "Open positions") {
            eventsUpdateRef.current = setTimeout(() => {
                    dataFiltering((cb)=>{
                    if(canceled) return
                    cb()
                });
            }, 1000);
        }
        return () => {
            canceled = true;
            if(eventsUpdateRef.current) clearTimeout(eventsUpdateRef.current);
        }
        //eslint-disable-next-line
    }, [positions?.length]);

    useEffect(() => {
        let canceled = false
        if(type === "Liquidity") {
            if(!liquidities?.length > 0) return;
            eventsUpdateRef.current = setTimeout(() => {
                dataFiltering((cb)=>{
                    if(canceled) return
                    cb()
                });
            }, 1000);
        }
        return () => {
            canceled = true;
            if(eventsUpdateRef.current) clearTimeout(eventsUpdateRef.current);
        }
        //eslint-disable-next-line
    }, [liquidities?.length]);

    return filteredAssets;
}

export default useAssets;
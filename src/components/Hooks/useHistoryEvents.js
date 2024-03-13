import platformConfig from 'config/platformConfig';
import moment from 'moment';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { commaFormatted, customFixed, toBN, toDisplayAmount } from 'utils';
import { useEvents } from './useEvents';
import { useActiveWeb3React } from './wallet';
import * as TheGraph from 'graph/queries';
import { contractsContext } from 'contracts/ContractContext';
import { setData } from 'store/actions/wallet';
import config from 'config/config';
import { chainsData } from 'connectors';
import Contract from 'web3-eth-contract';
import { useWeb3React } from '@web3-react/core';
import { debounce } from 'lodash';

export const contractState = config.isMainnet ? {
    positions: {
        closePositions: 'Sell',
        openPositions: 'Buy',
    },
    liquidities: {
        deposits: 'Deposit',
        withdraws: 'Withdraw'
    }
} : {
    positions: {
        OpenPosition: 'Buy',
        ClosePosition: 'Sell'
    },
    liquidities: {
        Withdraw: 'Withdraw',
        Deposit: 'Deposit'
    }
}

const useHistoryEvents = () => {
    const { selectedNetwork } = useSelector(({app}) => app); 
    const wallet = useSelector(({wallet}) => wallet);
    const [subs, setSubs] = useState([]);
    const { library } = useWeb3React(config.web3ProviderId);
    const { library: web3, account } = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const dispatch = useDispatch();
    const { getEventsFast } = useEvents();
    const actionConfirmedCounter = useSelector(({events}) => events.actionConfirmed);
    let fromWei = library?.utils?.fromWei;
    let getBlock = library?.eth?.getBlock;
    const eventsUtils = useEvents();
    const opt = useMemo(() => ({
        filter: { account },
        fromBlock: chainsData[selectedNetwork].bottomBlock,
        toBlock: 'latest',
    }), [account, selectedNetwork]);

    const mapper = useMemo(() => {
        return {
            positions: async function(event, type, activeToken) {
                let block = await getBlock(event.blockNumber);
                const { tokenAmount, feeAmount, cviValue, leverage } = config.isMainnet ? event : event.returnValues;
                const actionDate = block.timestamp * 1000
                const amount = activeToken.key === 'eth' ? fromWei(tokenAmount) : toDisplayAmount(tokenAmount, activeToken.decimals);
                const fees = activeToken.key === 'eth' ? fromWei(feeAmount) : toDisplayAmount(feeAmount, activeToken.decimals);
                const netAmount = activeToken.key === 'eth' ? fromWei(toBN(tokenAmount).sub(toBN(feeAmount))) : toDisplayAmount(toBN(tokenAmount).sub(toBN(feeAmount)).toString(), activeToken.decimals);
             
                return Promise.resolve({
                    transactionHash: event.transactionHash,
                    date: moment(actionDate).format('DD/MM/YYYY'),
                    timestamp: actionDate,
                    index: activeToken.oracleId.toUpperCase(),
                    type,
                    value: cviValue / 100,
                    leverage: `X${leverage ?? '1'}`,
                    amount: `${commaFormatted(customFixed(amount, activeToken.fixedDecimals))} ${activeToken.name.toUpperCase()}`,
                    fees: `${commaFormatted(customFixed(fees, activeToken.fixedDecimals))} ${activeToken.name.toUpperCase()}`,
                    netAmount: `${commaFormatted(customFixed(netAmount, activeToken.fixedDecimals))} ${activeToken.name.toUpperCase()}`
                });
            },
            liquidities: async function(event, type, activeToken) {
                let block = await getBlock(event.blockNumber);
                const { tokenAmount, feeAmount } = config.isMainnet ? event : event.returnValues;
                const actionDate = block.timestamp * 1000
                const amount = activeToken.key === 'eth' ? fromWei(toBN(tokenAmount).sub(toBN(feeAmount))) : toDisplayAmount(toBN(tokenAmount).sub(toBN(feeAmount)).toString(), activeToken.decimals);

                return Promise.resolve({
                    transactionHash: event.transactionHash,
                    date: moment(actionDate).format('DD/MM/YYYY'),
                    timestamp: actionDate,
                    index: activeToken.oracleId.toUpperCase(),
                    type,
                    amount: `${commaFormatted(customFixed(amount, activeToken.fixedDecimals))} ${activeToken.name.toUpperCase()}`,
                });
            }
        }
    }, [fromWei, getBlock])

    const fetchPastEvents = useCallback(async function(wallet, view, activeToken) {
        if(!activeToken || !account || !selectedNetwork || !contracts || !wallet) return;
        if(wallet[view] !== null) return;
        let events = [];    

        const isUSDC = activeToken.name === "usdc";
        if(config.isMainnet) {
            events = await TheGraph[`account_${view}`](account, contracts[activeToken.rel.platform]._address, 0)
            const migrationsTokens = ['usdc','usdt'];
            if(view === "liquidities" && migrationsTokens.includes(activeToken.key.toLowerCase())) {
                const migrationEvents = await eventsUtils.getMigrationEvents(account, activeToken.key);
                console.log('migrationEvents: ', migrationEvents);
                const actionType =  isUSDC ? "deposits" : "withdraws";
                events[actionType] = events[actionType].concat(migrationEvents);
            }
            events = Object.values(events).map((_events, idx) => _events.map((event)=> ({...event, transactionHash: event.id, timestamp: Number(event.timestamp), event: contractState[view][Object.keys(events)[idx]] }))).flat();
        } else {
            let events2 = await TheGraph[`account_${view}`](account, contracts[activeToken.rel.platform]._address, 0);
            const theGraphLatest = Object.values(events2).flat().sort((a, b) => (b.timestamp < a.timestamp) ? -1 : 1);
            const stagingBottomBlock = theGraphLatest.length ? theGraphLatest[theGraphLatest.length - 1].blockNumber : chainsData[selectedNetwork].bottomBlock;
            events = await getEventsFast([{
                contract: contracts[activeToken.rel.platform], 
                events: { 
                    [Object.keys(contractState[view])[0]]: [{ account }], 
                    [Object.keys(contractState[view])[1]]: [{ account }] 
                } 
            }], {bottomBlock: stagingBottomBlock });
            events = events.map(event => ({...event, event:contractState[view][event.event]}))
        }
       
        if(events.length) {
            events = await Promise.all(events.map(event => mapper[view](event, event.event, activeToken)));
        }
        events = events.sort((a, b) => ((b.timestamp ?? b.blockNumber) < (a.timestamp ?? a.blockNumber)) ? -1 : 1);
    
        dispatch(setData(view, events, true));
    }, [account, contracts, dispatch, eventsUtils, getEventsFast, mapper, selectedNetwork]) 

    const getContract = useCallback((contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(web3?.currentProvider);
        return _contract
    }, [selectedNetwork, web3?.currentProvider])
    
    const subscribe = useCallback(async function(view, type, eventType, activeToken) {
        const _contract = getContract(activeToken.rel.platform);
        const sub = _contract.events[eventType](({...opt, fromBlock: 'latest'}))
        if(!!subs.find((s) => s[`${eventType}-${activeToken.key}`])) return;
        
        sub.on("connected", function(subscriptionId){
            console.log(`Subscribe to event: ${`${eventType}-${activeToken.key}`}, Subscription ID: ${subscriptionId}`);
        })
        .on('data', async function(data) {
            const d = await mapper[view]({
                ...data,
                returnValues: {
                    ...data.returnValues,
                    blockNumber: data.blockNumber,
                    transactionHash: data.transactionHash
                },
            }, type, activeToken);

            dispatch(setData(view, d, true));
        })
        .on('error', console.log);

        setSubs(prev => prev.concat({ [`${eventType}-${activeToken.key}`]: sub }) );
    }, [dispatch, getContract, mapper, opt, subs])

    const loadEvents = useCallback((wallet) => {
        Object.values(platformConfig.tokens[selectedNetwork]).filter(({soon}) => !soon).forEach(token => {
            if(wallet["positions"] === null) fetchPastEvents(wallet, "positions", token);   
            if(wallet["liquidities"] === null) fetchPastEvents(wallet, "liquidities", token);

            if(!chainsData[selectedNetwork].eventCounter) {
                // subscribe to positions
                subscribe("positions", "Buy", 'OpenPosition', token);
                subscribe("positions", "Sell", 'ClosePosition', token);

                // subscribe to liquidities
                subscribe("liquidities", "Deposit", 'Deposit', token);
                subscribe("liquidities", "Withdraw", 'Withdraw', token);
            }
        });
    }, [fetchPastEvents, selectedNetwork, subscribe]);
    
    const fetchPastEventsDebounce = useMemo(() => debounce(loadEvents, 500), [loadEvents]);

    useEffect(() => {
        if(!selectedNetwork || !contracts || !account || typeof getEventsFast !== 'function') return;
        fetchPastEventsDebounce(wallet);
        return () => {
            fetchPastEventsDebounce.cancel();
        }
    }, [selectedNetwork, contracts, account, actionConfirmedCounter, getEventsFast, fetchPastEvents, subscribe, wallet, fetchPastEventsDebounce])

    return null;
}

export default useHistoryEvents;
import { useContext, useMemo } from "react";
import * as TheGraph from 'graph/queries';
import { chainNames, chainsData } from "connectors";
import { contractsContext } from "contracts/ContractContext";
import config from "config/config";
import { useSelector } from "react-redux";
import moment from 'moment';
import { useWeb3React } from "@web3-react/core";
import { getChainName } from "contracts/utils";

export const DEFAULT_STEPS = 30;
export const DAY = 86400;

const EventOptionsDefaults = {
    eventsCount: Number.MAX_SAFE_INTEGER,
    blocks: Number.MAX_SAFE_INTEGER,
    stepSize: 10000,
    bottomBlock: 0,
};

export const useEvents = () => {
    const contracts = useContext(contractsContext);
    const { selectedNetwork: chainName } = useSelector(({app}) => app);
    const { library } = useWeb3React(config.web3ProviderId);
    const { getBlock } = library?.eth ?? {};

    const getEventsFast = async (eventsData, opt) => {
        opt = { ...EventOptionsDefaults, ...opt };
        opt.chainName = opt.chainName ?? chainName;
        if(opt.chainName) {
            opt.bottomBlock = opt.bottomBlock ?? chainsData[opt.chainName].bottomBlock;
            if(!chainsData[opt.chainName].eventCounter) {
                opt.stepSize = Number.MAX_SAFE_INTEGER;
            }
        }
        opt.events = opt.events || [];
        let to = opt.topBlock || (await getBlockCached(getBlock)).number;
        if (opt.days) opt.bottomBlock = await getBlockDaysAgo(opt.days, to, getBlock);
        let from = Math.max(to - opt.stepSize, to - opt.blocks, opt.bottomBlock);
        let pairs = [{ from, to }];
    
        while (opt.blocks > 0 && opt.steps > 0 && from >= opt.bottomBlock) {
            opt.steps--;
            opt.blocks = opt.blocks - (to - from);
            to = from;
            from = Math.max(to - opt.stepSize, to - opt.blocks, opt.bottomBlock);
            pairs.push({ from, to });
        }
        // console.log(`pairs ${JSON.stringify(pairs.map((p) => ({ from: p.from, to: p.to, blocks: p.to - p.from })))}`);
        const promises = pairs.map((p) => getPastEvents(eventsData, p.from, p.to));
        const events = promises ? await Promise.all(promises) : [];
        return [].concat(...events).slice(0, opt.eventsCount);
    }

    async function getEvents(eventsData, opt) {
        opt = { ...EventOptionsDefaults, ...opt };
        opt.chainName = opt.chainName ?? chainName;
        if(opt.chainName) {
            opt.bottomBlock = opt.bottomBlock ?? chainsData[opt.chainName].bottomBlock;
            if(!chainsData[opt.chainName].eventCounter) {
                opt.stepSize = Number.MAX_SAFE_INTEGER;
            }
        }
        opt.events = opt.events || [];
        let to = opt.topBlock || (await getBlockCached(getBlock)).number;
        if (opt.days) opt.bottomBlock = await getBlockDaysAgo(opt.days, to, getBlock);
        let from = Math.max(to - opt.stepSize, to - opt.blocks, opt.bottomBlock);
        let pairs = [{ from, to }];
        while (opt.blocks > 0 && opt.steps > 0 && from > opt.bottomBlock) {
          opt.steps--;
          opt.blocks = opt.blocks - (to - from);
          to = from;
          from = Math.max(to - opt.stepSize, to - opt.blocks, opt.bottomBlock);
          pairs.push({ from, to });
        }
        // console.log(`pairs ${JSON.stringify(pairs.map((p) => ({ from: p.from, to: p.to, blocks: p.to - p.from })))}`);
        const promises = pairs.map((p) => getPastEvents(eventsData, p.from, p.to));
        const events = await Promise.all(promises);
        return [].concat(...events).slice(0, opt.eventsCount);
    }

    // [{ contract: token, contractName?:"USDT", events:{ Transfer: [filter]} }];
    async function getPastEvents(eventsData, fromBlock = 0, toBlock = "latest") {
        let eventList = [];
        for (const event of eventsData) {
            if (!event.contract) event.contract = contracts[event.contractName];
            for (const eventName in event.events) {
                for (const filter of event.events[eventName]) {
                    eventList.push(...(await event.contract.getPastEvents(eventName, { filter, fromBlock, toBlock })));
                }
            }
        }
        return eventList.sort((a, b) => b.blockNumber - a.blockNumber);
    } 

    
    async function getBlockCached() {
        const MAX_TIME = 0;
        let cachedBlock;
        let lastBlockFetch = 0;
        if (!cachedBlock || moment.utc().valueOf() > lastBlockFetch + MAX_TIME) {
            cachedBlock = await getBlock("latest");
            lastBlockFetch = moment.utc().valueOf();
        }
        return cachedBlock;
    }

    async function getBlockDaysAgo(days, from) {
        from = from ? from : (await getBlockCached(getBlock)).number;
        const blocksPerDay = DAY / chainsData[chainName].blockRate;
        return Math.floor(from - blocksPerDay * days);
    }
  
    async function getTransferEvents(staking, token, days, tokenName) {
        const selectedNetwork = await getChainName();
        const bottomBlock = chainsData[selectedNetwork].bottomBlock; 

        let isETH = false;
        if (token._address.toLowerCase() === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") isETH = true;

        const latestBlockNumber = await (await getBlock("latest")).number;
        const stepSize = latestBlockNumber - chainsData[selectedNetwork].bottomBlock;
        let options = { bottomBlock, stepSize: chainsData[chainName].eventCounter ? 2000 : (parseInt(stepSize / DEFAULT_STEPS) + 1000), steps: chainsData[chainName].eventCounter ? Number.MAX_SAFE_INTEGER : DEFAULT_STEPS };
        if(!chainsData[chainName].eventCounter) {
            options.days = days;
        }
        const filter = { [isETH ? "dst" : "to"]: staking._address };
        const eventsData = [{ contract: token, events: { Transfer: [filter] } }];
        const contractEvents = await getEvents(eventsData, options, getBlock);
        if(chainName === chainNames.Matic) {
            const _events = await TheGraph.collectedFees(Math.floor(moment.utc().add(-days, 'days').valueOf() / 1000));
            return _events.collectedFees.concat(contractEvents);
        }
        return contractEvents;
    }

    async function getLastOpenEvent(account, token) {
        try {
            if(config.isMainnet) {
                let _lastOpenEvent = await TheGraph.lastOpen(account, contracts[token.rel.platform]._address);
                return !!_lastOpenEvent.openPositions?.length ? _lastOpenEvent.openPositions[0] : null;
            }
            const options = {eventsCount: 1, days: 30 };
            const eventsData = [{ contract: contracts[token.rel.platform], events: { OpenPosition: [{ account }] } }];
            const events = await getEventsFast(eventsData, options);
            return events[events.length - 1];
        } catch(error) {
            console.log(error);
            return null;
        }
    }

    const getLatestBlockTimestamp = async() => (await getBlock("latest")).timestamp

    const localTimestamp = () => {
        return Math.floor(moment.utc().valueOf() / 1000);
    };

    async function getMigrationEvents(account, tokenSymbol) {
        const isUSDC = tokenSymbol.toLowerCase() === 'usdc';
        const migrationEvents = (await TheGraph.migrations(account)).migrations;
        return !!migrationEvents?.length ? migrationEvents.map(({
          blockNumber,
          id,
          oldLPTokensAmount,
          newLPTokensAmount,
          timestamp,
          oldTokensAmount,
          newTokensAmount })=>({
            account,
            blockNumber,
            feeAmount: "0",
            id,
            lpTokensAmount: isUSDC ? newLPTokensAmount : oldLPTokensAmount,
            platform: tokenSymbol.toUpperCase(),
            timestamp,
            tokenAmount: isUSDC ? newTokensAmount : oldTokensAmount
          })) 
        : [];
    }

    async function getNow(forceSync = true) {
        let diff;
        if (forceSync || !diff) {
            let timestamp = parseInt((await getBlockCached(getBlock)).timestamp);
            diff = timestamp - localTimestamp();
            return timestamp;
        }
        return localTimestamp() + diff;
    }

    return useMemo(()=> {
        if(!library) return {};
        return {
            getEventsFast,
            getEvents, 
            getTransferEvents, 
            getPastEvents, 
            getNow, 
            getLatestBlockTimestamp,
            getLastOpenEvent,
            getMigrationEvents
        }
      // eslint-disable-next-line
    }, [library]);
}
import { commaFormatted, customFixed, toBN, toDisplayAmount, toFixed } from "utils";
import { convert, getPrice, getChainName, getBalance, fromLPTokens } from './utils';
import * as TheGraph from 'graph/queries';
import config from "config/config";
import positionApi from "./apis/position";
import stakingApi from "./apis/staking";
import rewardsApi from './apis/rewards';
import liquidityApi from "./apis/liquidity";
import moment from "moment";
import { chainNames, chainsData } from "connectors";
import platformConfig from "config/platformConfig";
import stakingConfig, { stakingProtocols } from "config/stakingConfig";
import Api from "Api";
 
export const getLatestBlockTimestamp = async(getBlock) => (await getBlock("latest")).timestamp

const findTokenByAddress = (tokens = [], address = "") => Object.values(tokens).find((token) => {
    return (token.address && token.address.toLowerCase() === address.toLowerCase());
})

export const getTokenData = async (contract, protocol) => {
    if(!contract) return null;
    const { address, network } = contract.options;

    const tokensJsonConfig = {...stakingConfig.tokens[network][protocol], ...platformConfig.tokens[network]}
    let tokenData = findTokenByAddress(tokensJsonConfig, address); 
    const getSymbol = (key, name) => {
        const symbol = name === "eth" ? "WETH" : name?.toUpperCase() || key?.toUpperCase();
        return symbol.replace(/-[Vv]\d$/, '');
    }
    if(tokenData) {
        const { decimals, key, name, address} = tokenData;
        
        return { address, symbol: getSymbol(key, name), decimals, contract };
    }
    
    const symbol = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();
 
    return { address, symbol, decimals, contract };
}

export async function getFeesCollectedFromEvents(staking, USDCData, tokensData, { eventsUtils, library, useInitialValue }) {
    const selectedNetwork = await getChainName();
    const bottomBlock = chainsData[selectedNetwork].bottomBlock; // temporary fix for matic
    const options = {
        steps: Number.MAX_SAFE_INTEGER,
        bottomBlock: bottomBlock, 
        stepSize: 2000, 
    }

    let usdSum = toBN((selectedNetwork === chainNames.Matic && useInitialValue) ? "131007869134" : "0");

    for (let i = 0; i < tokensData.length; i++) {
        const token = tokensData[i].contract;
        const tokenData = tokensData[i];
        const to = tokenData.symbol === "WETH" ? "dst" : "to";
        const eventsData = [{ contract: token, events: { Transfer: [{ [to]: staking._address }] } }];
        const events = await eventsUtils.getEvents(eventsData, options, library.eth.getBlock);
        // console.log("events: ", events);
        // sum of transfer events from the last SAMPLE_DAYS days
        const sum = events.reduce((p, e) => p.add(toBN(e.returnValues[2])), toBN(0));
        // console.log(`sum ${toDisplayAmount(sum, tokenData.decimals)} ${tokenData.symbol}`);
        usdSum = usdSum.add(await convert(sum, tokenData, USDCData));
    }
    return toDisplayAmount(usdSum, USDCData.decimals);
}

const getFeesCollectedFromGraph = async (USDCData, tokensData) => {
    let res = await TheGraph.collectedFeesSum();
    // console.log(`res collectedFees size ${res.collectedFees.length}`);
    let sum = toBN(0);
    for (const token of tokensData.filter(item => item !== null)) {
      //console.log(`token ${token.symbol}`);
      let filtered = res.collectedFeesAggregations.filter((e) => e.id.toLowerCase() === token.address.toLowerCase());
      //console.log(`filtered ${filtered.length}`);
      let tokenSum = filtered.reduce((p, e) => p.add(toBN(e.sum)), toBN(0));
      //console.log(`tokenSum ${tokenSum} ${token.symbol}`);
      let tokenSumUSD = await convert(tokenSum, token, USDCData);
      //console.log(`tokenSumUSD ${tokenSumUSD} ${USDCData.symbol}`);
      sum = sum.add(tokenSumUSD);
    }
    //console.log(`graph sum $${toDisplayAmount(sum, USDCData.decimals)}`);
    return toDisplayAmount(sum, USDCData.decimals);
}

const getFeesCollectedFromApi = async (USDCData, tokensData, chainName) => {
    let res = await Api.GET_FEES_COLLECTED();
    let feesCollectedResult = [];

    if(chainName === chainNames.Matic) {
        feesCollectedResult = res.data['Polygon'];
    } else feesCollectedResult = res.data[chainName];
    feesCollectedResult = Object.keys(feesCollectedResult).map(key => ({[key]: feesCollectedResult[key]}));
    // console.log(feesCollectedResult);

    // console.log(`res collectedFees size ${res.collectedFees.length}`);
    let sum = toBN(0);
    for (const token of tokensData.filter(item => item !== null)) {
    //   console.log(`token ${token.symbol}`);
      let filteredToken = feesCollectedResult.filter((e) => e[token.symbol.toUpperCase()])[0];
    //   console.log(`filtered`, filteredToken);
      let tokenSum = filteredToken[token.symbol.toUpperCase()];
    //   console.log(`tokenSum ${tokenSum} ${token.symbol}`);
      let tokenSumUSD = await convert(tokenSum, token, USDCData);
    //   console.log(`tokenSumUSD ${tokenSumUSD} ${USDCData.symbol}`);
      sum = sum.add(tokenSumUSD);
    }
    return toDisplayAmount(sum, USDCData.decimals);
}

export async function getFeesCollected(USDCData, tokensData) {
    const chainName = await getChainName();
    if(chainsData[chainName].eventCounter) {
        return await getFeesCollectedFromApi(USDCData, tokensData, chainName);
    } else {
        return await getFeesCollectedFromGraph(USDCData, tokensData);
    }
}

const web3Api = {
    getPlatformBalance: async (contracts, tokens = [], {library}) => {
        try {
            const USDCData = await getTokenData(contracts["USDC"]);
            
            const promiseList = tokens.map(async ({rel: { platform, contractKey}, name, type, fixedDecimals, oracleId}) => {
                const tokenData = await getTokenData(contracts[contractKey]);

                let totalBalance = toBN(
                    name === 'eth' ? await library.eth.getBalance(contracts[platform]._address) : 
                    name === "usdc" || type === "v3" ? await toBN(await contracts[platform].methods.totalLeveragedTokensAmount().call()) :
                    await contracts[contractKey].methods.balanceOf(contracts[platform]._address).call()
                )

                const amountConverted = await convert(totalBalance, tokenData, USDCData)
                return [
                    `${customFixed(toDisplayAmount(amountConverted.toString(), USDCData.decimals), fixedDecimals)} (${name.toUpperCase()} pool)`, 
                    amountConverted,
                    name,
                    oracleId
                ]
            });

            const result = await (await Promise.allSettled(promiseList))
                            .filter(({status}) => status === "fulfilled")
                            .map(({value}) => value)
            return result;
        } catch(error) {
            console.log(error);
            return "N/A"
        }
    },
    getLiquidityPoolsBalance: async (contracts, tokens = []) => {
        try {
            const USDCData = await getTokenData(contracts["USDC"]);
            
            const promiseList = tokens.filter(({hideFrom}) => !hideFrom?.includes("stats")).map(async ({rel: { platform, contractKey}, name, type, oracleId}) => {
                const tokenData = await getTokenData(contracts[contractKey]);
                let value;
                if(type === "v3" || type === "usdc") {
                    value = await contracts[platform].methods.totalBalance(true).call();
                } else {
                    value = await contracts[platform].methods.totalBalanceWithAddendum().call();
                }
                const amountConverted = await convert(toBN(value), tokenData, USDCData);
                const amountFormatted = commaFormatted(customFixed(toDisplayAmount(amountConverted.toString(), USDCData.decimals), 2))
                return [`${amountFormatted} (${name.toUpperCase()} pool)`, amountConverted, name, oracleId];
            });

            const result = await (await Promise.allSettled(promiseList))
                            .filter(({status}) => status === "fulfilled")
                            .map(({value}) => value);

            return result;
        } catch(error) {
            console.log(error);
            return "N/A";
        }
    },
    getGoviPrice: async ({GOVI, USDC, WETH}) => {
        try {
            const [GOVIData, USDCData, WETHData] = [
                await getTokenData(GOVI, stakingProtocols.platform),
                await getTokenData(USDC),
                await getTokenData(WETH)
            ];
            
            const [wethPrice, goviPrice] = [
                await getPrice(WETHData, USDCData), 
                await getPrice(GOVIData, WETHData)
            ];

            return goviPrice * wethPrice;
        } catch(error) {
            console.log(error);
            return "N/A"
        }
    },
    getFeesCollected: async (contracts, tokens) => {
        try {
            const USDCData = await getTokenData(contracts.USDC);
            const tokensData = [];
            for(let token of tokens) {
                tokensData.push(await getTokenData(contracts[token.rel.contractKey]));
            }
            const totalFeesCollected = await getFeesCollected(USDCData, tokensData);
            return customFixed(totalFeesCollected, 2);
        } catch(error) {
            console.log(error);
            return "N/A"
        }
    },
    getTotalGoviRewards: async (contracts, tokens) => {
        try {
            const maxPositionRewards = tokens.map(async token => [toDisplayAmount(await contracts[token.rel.positionRewards].methods.maxDailyReward().call(), 18), token.rel.oracle]);
            const fulfilledPositionRewards = (await Promise.allSettled(maxPositionRewards))
                .filter(({status}) => status === "fulfilled")
                .map(({value}) => value)
                .reduce((current, acc) => ({ // sum all max govi daily reward by oracle
                    ...current,
                    [acc[1]]: current[acc[1]] !== undefined ? Number(current[acc[1]]) + Number(acc[0]) : Number(acc[0])
                }), {});

            
            return Object.keys(fulfilledPositionRewards).map(reward => [fulfilledPositionRewards[reward], reward]);
        } catch(error) {
            console.log(error);
            return "N/A";
        }
    },
    getCollateralRatio: async (contracts, token, {library}) => {
        try {
            let platformBalance;
            if(token.key === "eth") {
                platformBalance = toBN(await library.eth.getBalance(contracts[token.rel.platform].options.address));
            } else if(token.type === "usdc" || token.type === "v3") {
                platformBalance = toBN(await contracts[token.rel.platform].methods.totalLeveragedTokensAmount().call());
            } else {
                platformBalance = toBN(await contracts[token.rel.contractKey].methods.balanceOf(contracts[token.rel.platform].options.address).call());
            }

            let totalPositionUnitsAmount = toBN(await contracts[token.rel.platform].methods.totalPositionUnitsAmount().call());
            let decimals = toBN(await contracts[token.rel.platform].methods.PRECISION_DECIMALS().call());
            let collateralRatio = platformBalance.toString() !== "0" ? totalPositionUnitsAmount.mul(decimals).div(platformBalance) : toBN("0");
            return {
                collateralRatio,
                currentRatioValue: totalPositionUnitsAmount,
                platformBalance
            }
        } catch (error) {
            console.log(error);
            return "N/A";
        }
    },
    getAvailableBalance: async (contracts, token, {account, type, withStakeAmount, library}) => {
        try {
            if(type === "sell") {
                let positionValue = await contracts[token.rel.platform].methods.calculatePositionBalance(account).call();
                return positionValue.currentPositionBalance;
            }

            if(type === "withdraw") {
                if(withStakeAmount) {
                    const stakedAmount = toBN(await contracts[token.rel.stakingRewards].methods.balanceOf(account).call())
                    let lpBalance = toBN(await contracts[token.rel.platform].methods.balanceOf(account).call());
                    const maxTokenBalance = await fromLPTokens(contracts[token.rel.platform], lpBalance, token);

                    if(stakedAmount) {
                        lpBalance = lpBalance.add(stakedAmount);
                    }
    
                    const totalSupply = toBN(await contracts[token.rel.platform].methods.totalSupply().call());
                    let totalBalance;
                    if(token.type === "v3" || token.type === "usdc") {
                        totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalance(true).call());
                    } else {
                        totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalanceWithAddendum().call());
                    }
       
                    const tokenAmount = totalSupply !== 0 ? lpBalance.mul(totalBalance).div(totalSupply) : toBN(0);
                    let sharePercent = totalSupply !== 0 ? toFixed((library.utils.fromWei(lpBalance, "ether") / library.utils.fromWei(totalSupply, "ether")) * 100) : 0;
                    
                    return {myShare: tokenAmount?.toString(), poolShare: sharePercent, maxTokenBalance: maxTokenBalance?.toString()};
                }

                const lpBalance = toBN(await contracts[token.rel.platform].methods.balanceOf(account).call());
                const lpTokensBalance = await fromLPTokens(contracts[token.rel.platform], lpBalance, token);

                return lpTokensBalance;
            }

            const tokenData = await getTokenData(contracts[token.rel.contractKey]);
            const balance = await getBalance(account, token.key !== "eth" && tokenData.address);
            return balance;
        } catch(error) {
            console.log(error, token);
            return type !== "withdraw" ? "0" : {myShare: "0", poolShare: "0"}
        }
    },
    isLocked: async function(contracts, token, { type, customDuration, account, library, eventsUtils }) {
        try {
            let openTime;
            if(type === "sell"){
                let event = await eventsUtils.getLastOpenEvent(account, token);
                if(!event) return [0,0];
                let block = await new Promise((res, rej)=> library.eth.getBlock(event.blockNumber, (err, data) => err ? rej(err) : res(data)));
                if(!block) return [0,0];
                openTime = (block.timestamp * 1000);
            }
            
            if(type === "withdraw") { 
                openTime = await contracts[token.rel.platform].methods.lastDepositTimestamp(account).call() * 1000;
            }

            if(type === "unstake") {
                openTime = Number(await contracts[token.rel.stakingRewards].methods.stakeTimestamps(account).call()) * 1000
            }

            const lock = await contracts[type === "unstake" ? token.rel.stakingRewards : token.rel.platform].methods[config.lockupPeriod[type]]().call();
            const latestBlockTimestamp = await getLatestBlockTimestamp(library.eth.getBlock) * 1000;
            const lockedTime = moment.utc(openTime).add(lock, 'seconds').valueOf() - latestBlockTimestamp;
            
            let customDurationTime;
            if(customDuration) {
                customDurationTime = moment.utc(openTime).add(customDuration, 'seconds').valueOf() - latestBlockTimestamp;
            }
            
            return [lockedTime > 0, customDurationTime ?? lockedTime];
        } catch(error) {
            console.log(error);
            return "N/A";
        }
    },
    ...positionApi,
    ...stakingApi,
    ...rewardsApi,
    ...liquidityApi,
}

export default web3Api;
import { aprToAPY, convert, fromLPTokens, getChainName, getPrice, platformCreationTimestamp } from "contracts/utils";
import web3Api, { getTokenData } from "contracts/web3Api";
import { commaFormatted, customFixed, isGoviToken, toBN, toDisplayAmount, toFixed } from "utils";
import moment from "moment";
import { DAY } from "components/Hooks/useEvents";
import { chainNames } from "connectors";
import stakingConfig, { stakingProtocols } from "config/stakingConfig";
import Api from "Api";
import { pairsData } from "components/Hooks/Staking/useStakeData";

const stakingApi = {
    getStakedAmountAndPoolShareByToken: async (contracts, asset, account, selectedNetwork) => {
        const {protocol, key: tokenName, fixedDecimals, rel, ...token} = asset

        if(protocol === stakingProtocols.platform) {
            let tokenData;
            const getDataByTokenName = async () => {
                switch (tokenName) {
                    case stakingConfig.tokens[selectedNetwork]["platform"]['govi-v1']?.key:
                    case stakingConfig.tokens[selectedNetwork]["platform"]['govi-v2']?.key:{
                        tokenData = await getTokenData(contracts.GOVI, protocol)
                        return web3Api.getStakedAmountAndPoolShareGOVI(contracts[rel.stakingRewards], account, token.decimals)
                    }
                    default: {
                        tokenData = await getTokenData(contracts[rel.token], protocol);
                        return web3Api.getStakedAmountAndPoolShare(contracts[rel.stakingRewards], account, token.decimals)
                    }
                }
            }
            const data = await getDataByTokenName();
            const USDCData = await getTokenData(contracts["USDC"]);
            
            const getAmount = async () => isGoviToken(tokenName) ? data?.stakedTokenAmount : await fromLPTokens(contracts[rel.platform], toBN(data?.stakedTokenAmount || "0"), token);
            const stakedAmountUSD = await convert(await getAmount(), tokenData, USDCData);

            return {
                ...data,
                stakedAmountUSD: commaFormatted(customFixed(toFixed(toDisplayAmount(stakedAmountUSD.toString(), USDCData.decimals)), fixedDecimals))
            }
        } 
        return web3Api.getPoolSizeLiquidityMining(contracts, asset, account)
    },
    getPoolSizeLiquidityMining: async (contracts, asset, account, percentageDecimals=4) => {
        try {

            const {protocol, key: tokenName, fixedDecimals, rel, ...token} = asset;
            const [stakingRewards, platformLPToken] = [contracts[rel.stakingRewards], contracts[rel.token]]
            // const USDCData = await getTokenData(contracts["USDC"]);
            // const uniswapToken = pairsData[rel.pairToken] || await getTokenData(contracts[rel.pairToken], stakingProtocols.platform);
            const uniswapLPToken = await getTokenData(platformLPToken, protocol);
            const poolSize = await stakingRewards.methods.totalSupply().call();
            // console.log("poolSize: ", poolSize);
            const tvlUSD = await web3Api.uniswapLPTokenToUSD(poolSize, contracts, uniswapLPToken, asset);
            // console.log(tokenName, protocol+" tvlUSD: ", tvlUSD);
            
            const totalStaked = !!account ? await stakingRewards.methods.balanceOf(account).call() : 0;
            // console.log("totalStaked: ", customFixed(toFixed(toDisplayAmount(totalStaked, token.decimals))));
            
            const accountStakedUSD = await web3Api.uniswapLPTokenToUSD(totalStaked, contracts, uniswapLPToken, asset)
            // console.log(tokenName, protocol+" accountStakedUSD: ", accountStakedUSD);
            const mySharePercentage = totalStaked?.toString() === "0" ? toBN("0") : toBN(totalStaked).mul(toBN("1", token.decimals)).div(toBN(poolSize)).mul(toBN("100"));
            
            const data = {
                stakedTokenAmount: totalStaked,
                stakedAmount: commaFormatted(customFixed(toFixed(toDisplayAmount(totalStaked, token.decimals)), fixedDecimals)),
                poolSize: toBN(poolSize).isZero() ? "0" : commaFormatted(customFixed(toDisplayAmount(poolSize, token.decimals), fixedDecimals)),
                lastStakedAmount: {
                    class: mySharePercentage.gt(toBN("0")) ? 'high' : 'low',
                    value: `(${customFixed(toFixed(toDisplayAmount(mySharePercentage?.toString(), token.decimals)), percentageDecimals)}%)`
                },
                stakedAmountUSD: toBN(accountStakedUSD).isZero() ? "0" : `${commaFormatted(customFixed(toFixed(toDisplayAmount(accountStakedUSD)), 2))}`
            };
            
            const tvl = {
                stakedAmountLP: commaFormatted(customFixed(toFixed(toDisplayAmount(poolSize, token.decimals)), fixedDecimals)),
                stakedAmountUSD: toBN(poolSize).isZero() ? "0" : `$${commaFormatted(customFixed(tvlUSD, 2))}`
            }
            return {...data, tvl}
        } catch (error) {
            console.log('error: ', error);
        }
    },
    getStakedAmountAndPoolShare: async (stakingRewards, account, tokenDecimals, decimalsCountDisplay=8, percentageDecimals=4) => {
        const stakedTokenAmount = account ? await stakingRewards.methods.balanceOf(account).call() : 0;
        const poolSize = await stakingRewards.methods.totalSupply().call();
        const mySharePercentage = stakedTokenAmount === "0" ? toBN("0") : toBN(stakedTokenAmount).mul(toBN("1", tokenDecimals)).div(toBN(poolSize)).mul(toBN("100"));

        const lastStakedAmount = {
          class: mySharePercentage.gt(toBN("0")) ? 'high' : 'low',
          value: `(${customFixed(toFixed(toDisplayAmount(mySharePercentage?.toString(), tokenDecimals)), percentageDecimals)}%)`
        }
        
        return {
            stakedTokenAmount,
            stakedAmount: commaFormatted(customFixed(toFixed(toDisplayAmount(stakedTokenAmount, tokenDecimals)), decimalsCountDisplay)),
            poolSize: toBN(poolSize).isZero() ? "0" : commaFormatted(customFixed(toFixed(toDisplayAmount(poolSize, tokenDecimals)), decimalsCountDisplay)),
            lastStakedAmount: {...lastStakedAmount}
        }
    },
    getStakedAmountAndPoolShareGOVI: async (staking, account, tokenDecimals, decimalsCountDisplay=8, percentageDecimals=4) => {
        const stakedTokenAmount = account ? await staking.methods.stakes(account).call() : 0;
        const poolSize = await staking.methods.totalStaked().call();
        const mySharePercentage = stakedTokenAmount?.toString() === "0" ? toBN("0") : toBN(stakedTokenAmount).mul(toBN("1", tokenDecimals)).div(toBN(poolSize)).mul(toBN("100"));

        const lastStakedAmount = {
          class: mySharePercentage.gt(toBN("0")) ? 'high' : 'low',
          value: `(${customFixed(toFixed(toDisplayAmount(mySharePercentage?.toString(), tokenDecimals)), percentageDecimals)}%)`
        }
        
        return {
            stakedTokenAmount,
            stakedAmount: commaFormatted(customFixed(toFixed(toDisplayAmount(stakedTokenAmount, tokenDecimals)), decimalsCountDisplay)),
            poolSize: toBN(poolSize).isZero() ? "0" : commaFormatted(customFixed(toFixed(toDisplayAmount(poolSize, tokenDecimals)), decimalsCountDisplay)),
            lastStakedAmount: {...lastStakedAmount}
        }
    },
    getAPYPerToken: async (contracts, platform, stakingRewards, USDCData, GOVIData, tokenData, token) => {
        try {
          if(token.migrated) return ["0", "0", "0"];
          let rate = await stakingRewards.methods.rewardRate().call();
          let total = await stakingRewards.methods.totalSupply().call();
          let dailyReward = toDisplayAmount(toBN(DAY).mul(toBN(rate)), GOVIData.decimals);

          const goviPrice = await web3Api.getGoviPrice(contracts);

          let USDDailyReward = dailyReward * goviPrice;

          let stakedTokens = await fromLPTokens(platform, toBN(total), token);

          let USDStakedTokens = toDisplayAmount(await convert(stakedTokens, tokenData, USDCData), USDCData.decimals);

          const dailyApr = (USDDailyReward / USDStakedTokens) * 100;
          return USDStakedTokens === 0 ? [0, 0, 0] : [aprToAPY(dailyApr, 365, 365 * 365), aprToAPY(dailyApr, 365, 365 * 7), aprToAPY(dailyApr, 365, 365)];
        } catch(error) {
            console.log(error);
            return [0, 0, 0];
        }
    },
    getGOVIAPY: async function(staking, tokensData, USDCData, GOVIData, {eventsUtils, library}) {
        try {
            async function getTokenDailyProfitInUSD(USDCData) {
                // console.log(`checking relative to the last ${days} days`);
                try {
                    const selectedNetwork = await getChainName();
                    //const response = await Api.GET_FEES_COLLECTED();
                    const response = await Api.GET_FEES_COLLECTED(`?chain=${selectedNetwork === chainNames.Matic ? 'Polygon' : selectedNetwork}&from=${Math.floor(moment().subtract(90, "days").valueOf() / 1000) }`);
                    const feesCollected = response.data;
                    
                    // const feesCollected = response.data[selectedNetwork === chainNames.Matic ? 'Polygon' : selectedNetwork]; // get platform fees sum. (formatted to tokens object)
                    
                    // EXAMPLE: feesCollected (sum of tokens object) = {USDC: "0", USDT: "0"} by network.
                    const collectedFees = Object.keys(feesCollected).map((key) => ({ // map tokens and add tokenData object to each one back from the api.
                        tokenData: tokensData.find(item => item.symbol.toLowerCase() === key.toLowerCase()),
                        sum: feesCollected[key] // fee sum
                    })).filter(({tokenData}) => tokenData); // filter token who exist in api, but not supported in the platform tokens config. 

                    const tokensUsdtProfit = await collectedFees.map(async ({tokenData, sum: fee}) => {
                        //const creationTimestampAgo = Math.floor(moment().subtract(90, "days").valueOf() / 1000) ;// moment.utc().diff(platformCreationTimestamp[selectedNetwork][tokenData.symbol === "WETH" ? "ETH" : tokenData.symbol].creationTimestamp * 1000);
                        
                        const dailyProfit = toBN(fee).div(toBN(90));
                        
                        
                        let USDDailyProfits = (await convert(dailyProfit, tokenData, USDCData)).div(toBN(1).pow(toBN(USDCData.decimals)));
                        return USDDailyProfits;
                    });

                    const USDDailyProfits = (await Promise.all(tokensUsdtProfit)).reduce((sum = 0, item) => item.add(toBN(sum)), 0)
                    return USDDailyProfits;
                } catch(error) {
                    console.log(error);
                    return 0;
                }
            }

            async function getAPR() {
               // daily profits = totalProfits * seconds in year / time since contract creation
                // APR = value of (daily profits) / value of (total staked GOVI) * 100
                let USDDailyProfits = toBN((await getTokenDailyProfitInUSD(USDCData)), USDCData.decimals);
                // console.log(`USDDailyProfits ${USDDailyProfits.toString()}`);
                const totalStaked = await staking.methods.totalStaked().call();
                // console.log(`totalStaked ${totalStaked}`);
                let USDTotalStaked = (await convert(totalStaked, GOVIData, USDCData))
                // console.log(`USDTotalStaked ${USDTotalStaked}`);
                if (USDTotalStaked.isZero()) return toBN("0");
                return toDisplayAmount(USDDailyProfits.div(USDTotalStaked).mul(toBN("100")), USDCData.decimals);
            }
            
            const dailyApr = await getAPR();
            return [aprToAPY(dailyApr, 365, 365 * 365), aprToAPY(dailyApr, 365, 365 * 7), aprToAPY(dailyApr, 365, 365)];
        } catch (error) {
            console.log(error);
            return [0, 0, 0];
        }
    },
    getDailyReward: async (stakingRewards, account, tokenDecimals, decimalsCountDisplay = 8) => {
        if(!account) return {
            amount: 0, 
            symbol: "GOVI"
        }
        let rate = await stakingRewards.methods.rewardRate().call();
        let total = toBN(await stakingRewards.methods.totalSupply().call());
        if(toBN(total).isZero()) return total;
        let balance = await stakingRewards.methods.balanceOf(account).call();

        let rewardPerDayPerToken = toBN(86400)
            .mul(toBN(rate))
            .mul(toBN(10).pow(toBN(tokenDecimals)))
            .div(toBN(total));

        const dailyRewards = toBN(balance).isZero() ? toBN(balance) 
            : toBN(balance)
            .mul(rewardPerDayPerToken)
            .div(toBN(10).pow(toBN(tokenDecimals)));
        
        const dailyReward = {
            amount: commaFormatted(customFixed(toFixed(toDisplayAmount(dailyRewards, tokenDecimals)), decimalsCountDisplay)),
            symbol: "GOVI",
        }
        return dailyReward
    },
    getDailyRewardPerToken: async function (staking, account, feesSum, now, symbol, tokenDecimals, decimalsCountDisplay = 8) {
        try {
            if(!account) return {
                amount: 0,
                symbol
            }
    
            const chainName = await getChainName();
            let creationTimestamp = 0;
            
            if(platformCreationTimestamp[chainName][symbol]) {
                creationTimestamp = platformCreationTimestamp[chainName][symbol].creationTimestamp;
            } else {
                throw new Error(`Please add creation timestamp to ${symbol} platform token.`)
            }
            
            const timePassedSinceCreation = now - creationTimestamp;
            
            const period = (DAY * 90);
            
            const reward = toBN(feesSum).mul(toBN(DAY)).div(toBN(timePassedSinceCreation >= period ? period : timePassedSinceCreation));
            
            let balance = await staking.methods.stakes(account).call();
            let total = await staking.methods.totalStaked().call();
            
            const dailyRewards = toBN(total).isZero() ? toBN(0) : reward.mul(toBN(balance)).div(toBN(total));
            const dailyReward = {
                amount: commaFormatted(customFixed(toFixed(toDisplayAmount(dailyRewards, tokenDecimals)), decimalsCountDisplay)),
                symbol,
            }
            return dailyReward;
        } catch(error) {
            console.log(error);
            return {
                amount: 0,
                symbol
            }
        }
    },
    uniswapLPTokenToUSD: async (stakedAmount, contracts, uniswapLPToken, tokenConfig) => {
        if(!uniswapLPToken.contract) return 0;
        const totalSupply = toBN(await uniswapLPToken.contract.methods.totalSupply().call());
        const token0 = await uniswapLPToken.contract.methods.token0().call();
        const uniswapToken = pairsData[tokenConfig.pair.pairToken] || await getTokenData(contracts[tokenConfig.pair.pairToken], stakingProtocols.platform)
        const swapped = token0.toLowerCase() !== uniswapToken.address.toLowerCase();

        const getReservesData = async () => {
            try {
                const [priceTokenDecimals, pricePairTokenDecimals] = tokenConfig.pair.decimals;
                const {reserve0, reserve1} = await uniswapLPToken.contract.methods?.getReserves()?.call() || {};
                const [reserveToken, reservePairToken] = [
                    toDisplayAmount(reserve0, priceTokenDecimals),
                    toDisplayAmount(reserve1, pricePairTokenDecimals)
                ];
                return swapped ? {reservePairToken: reserveToken, reserveToken: reservePairToken} : {reserveToken, reservePairToken}
            } catch(error) {
                console.log(error);
            }
        }

        const [priceToken, pricePairToken] = Object.values(tokenConfig?.pair?.priceTokens);
        const { reserveToken, reservePairToken } = await getReservesData();

        const pairTokenPrice = await getPrice(await getTokenData(contracts[priceToken.key]), await getTokenData(contracts[pricePairToken.key]));

        const pairLpAmount = reserveToken / reservePairToken;
        const lpAmount = reservePairToken / reserveToken;
        
        const tokenPrice = (pairTokenPrice / pairLpAmount);

        const getLiquidityPool = () => {
            if(uniswapLPToken.symbol.includes("USDC")) {
                if(uniswapToken.symbol === "USDC") return parseFloat(reserveToken) + (reservePairToken * pairLpAmount);
                return (reserveToken * ((swapped ? pairLpAmount : parseFloat(reserveToken) ) * lpAmount) + (reservePairToken * pairLpAmount));
            };
            return (reserveToken * tokenPrice + (reservePairToken * pairTokenPrice));
        }

        const liquidity = getLiquidityPool();

        return (liquidity / totalSupply) * stakedAmount;
    },
    getUniswapAPY: async function(contracts, stakingRewards, USDCData, GOVIData, uniswapLPToken, tokenConfig, isStaked) {
        // console.log("ETHToken: ", ETHToken);
        let rate = await stakingRewards.methods.rewardRate().call();
        // console.log(`reward rate ${rate}`);
        let total = await stakingRewards.methods.totalSupply().call();
        // console.log(`total ${total}`);
        
        let periodRewards = toDisplayAmount(toBN(DAY).mul(toBN(rate)), GOVIData.decimals);

        const goviPrice = await web3Api.getGoviPrice(contracts);

        // console.log(`GOVI periodRewards ${periodRewards}`);
        let USDPeriodRewards = periodRewards * goviPrice;
        // console.log(`USDPeriodRewards ${USDPeriodRewards}`);
        
        // convert from coti/eth or govi/eth to USDT using uniswapLPTokenToUSD (cant use uniswap for this)
        let USDStakedTokens = await this.uniswapLPTokenToUSD(toBN(total), contracts, uniswapLPToken, tokenConfig);
        // console.log(`USDStakedTokens ${USDStakedTokens}`);

        const dailyApr = USDStakedTokens.toString() === "0" ? 0 : (USDPeriodRewards / USDStakedTokens) * 100;
        // console.log(apysPeriods);
        return isStaked ? [aprToAPY(dailyApr, 365, 365 * 365)] : [aprToAPY(dailyApr, 365, 365 * 365), aprToAPY(dailyApr, 365, 365 * 7), aprToAPY(dailyApr, 365, 365)];
    },
    getClaimableRewards: async (contracts, asset, account, selectedNetwork) => {
        const {protocol, key: tokenName, rewardsTokens, fixedDecimals, rel} = asset
        if(protocol === stakingProtocols.platform) {
            const getClaimableRewardsByTokenName = async () => {
                switch (tokenName) {
                  case stakingConfig.tokens[selectedNetwork]["platform"]['govi-v1']?.key:
                  case stakingConfig.tokens[selectedNetwork]["platform"]['govi-v2']?.key:
                    return await rewardsTokens.map(async t => await contracts[rel.stakingRewards].methods.profitOf(account, contracts[t]._address).call());
                  default: 
                    return [await contracts[rel.stakingRewards].methods.earned(account).call()];
                }
            }
            const claim = await (await Promise.allSettled(await getClaimableRewardsByTokenName()))
            .filter(({status}) => status === "fulfilled")
            .map(({value}, idx) => ({
                amount: commaFormatted(customFixed(toFixed(toDisplayAmount(value, rel.tokenDecimals[idx])), fixedDecimals)),
                symbol: rewardsTokens[idx]
            }));
            
            return claim;
        }

        const rewards = await contracts[rel.stakingRewards].methods.earned(account).call();
        // console.log(tokenName, protocol+" rewards: ", rewards );
        const claim = [{
          amount: commaFormatted(customFixed(toFixed(toDisplayAmount(rewards, rel.tokenDecimals[0])), fixedDecimals)),
          symbol: rewardsTokens[0]
        }]

        return claim;
    },

}

export default stakingApi;
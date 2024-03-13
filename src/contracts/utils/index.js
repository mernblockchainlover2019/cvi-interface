import { chainsData, network, RPC_URLS_NETWORK_BY_ENV } from 'connectors';
import { parseHex, percentToAmount, toBN } from '../../utils';
import { supportedNetworksConfigByEnv, chainNames } from '../../connectors';
import { Pair, Route, Token, TokenAmount, WETH } from '@uniswap/sdk';
import Contract from 'web3-eth-contract';
import Web3 from 'web3';
import moment from 'moment';

export const platformCreationTimestamp = {
  [chainNames.Ethereum]: {
    USDT: {
      // creationBlock: 11686790,
      creationTimestamp: 1611073144
    },
    ETH: {
      // creationBlock: 12139444,
      creationTimestamp: 1617091637,
    },
    USDC: {
      // 12909261
      creationTimestamp: 1627404737
    }
  },
  [chainNames.Matic]: {
    USDT: {
      // creationBlock: 15129735,
      creationTimestamp: 1622406129,
    },
    USDC: {
      // creationBlock: 17002125,
      creationTimestamp: 1626623755,
    }
  },
  [chainNames.Arbitrum]: {
    USDC: {
      creationTimestamp: 0
    }
  }
}

const getRpcUrl = async () => {
  const chainId = await getChainId();
  return chainId !== 1 ? RPC_URLS_NETWORK_BY_ENV[chainId] : (window?.ethereum?.selectedAddress && window?.ethereum) || RPC_URLS_NETWORK_BY_ENV[chainId];
}

const getWebProvider = async () => {
  return new Web3(await getRpcUrl());
};

let contracts = {
    [chainNames.Ethereum]: {},
    [chainNames.Matic]: {},
    [chainNames.Arbitrum]: {}
};

export const toTokenAmount = (amount, decimals) => {
  if(amount === "N/A") return toBN("0");
  return toBN(amount, decimals);
};

let diff;
const MAX_TIME = 0;
let lastBlockFetch = 0;
let cachedBlock;
export const MAX_PERCENTAGE = "10000";

const localTimestamp = () => {
  return Math.floor(moment.utc().valueOf() / 1000);
};

export async function getNow(forceSync = true) {
  if (forceSync || !diff) {
    const web3Provider = await getWebProvider();
    let timestamp = parseInt((await getBlockCached(web3Provider.eth.getBlock)).timestamp);
    diff = timestamp - localTimestamp();
    return timestamp;
  }
  return localTimestamp() + diff;
}

async function getBlockCached(getBlock) {
  if (!cachedBlock || moment.utc().valueOf() > lastBlockFetch + MAX_TIME) {
    cachedBlock = await getBlock("latest");
    lastBlockFetch = moment.utc().valueOf();
  }
  return cachedBlock;
}

export async function getWeb3Contract(contractName, chainName) {
    if (contracts[chainName][contractName] === undefined) {
      const contractsJSON = require(`../files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${chainName}.json`);
      if (contractsJSON[contractName]) {
          contracts[chainName][contractName] = new Contract(contractsJSON[contractName]?.abi || contractsJSON[contractsJSON[contractName]?.abiRef]?.abi, contractsJSON[contractName].address);
          contracts[chainName][contractName].setProvider(await getRpcUrl());
        }
        else return undefined;
    }
    return contracts[chainName][contractName];
}

export async function getUNIV2Contract(address, chainName) {
  const contractsJSON = require(`../files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${chainName}.json`);
  const contract = new Contract(contractsJSON["UNIV2"].abi, address);
  contract.setProvider(await getRpcUrl());
  return contract;
}

export async function getERC20Contract(address) {
  try {
    const chainName = await getChainName();
    const contractsJSON = require(`../files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${chainName}.json`);
    if(!contractsJSON) return;
    const contract = new Contract(contractsJSON["ERC20"].abi, address);
    contract.setProvider(await getRpcUrl());
    return contract;
  } catch(error) {
    console.log(error);
  }
}

export const getGraphEndpoint = async (type) => {
    try {
        const chainName = await getChainName();
        if(type === "fees") return chainsData[chainName].graphEndpoints.tokens;
        return chainsData[chainName].graphEndpoints.platforms;
    } catch(error) {
        console.log(error);
    }
}

const devPrices = { "USDT-WETH": 1080, "GOVI-WETH": 0.0002, "GOVI-USDT": 0.216, "COTI/ETH-USDT": 0.03 };
const SIGNIFICANT_DIGITS = 10;

function getConnectorToken(chainId) {
    if (chainId === 80001 || chainId === 31339) {
      return { address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", symbol: "WMATIC", decimals: 18 };
    } else if (chainId === 137 || chainId === 31338) {
      return { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", decimals: 18 };
    }
    return { address: getConnectorTokenAddress(chainId), symbol: "WETH", decimals: 18 };
}

function getConnectorTokenAddress(chainId) {
    if (chainId === 1337) {
      return "0xcF97dacDe084852D111D433e2F86900585dE250c"; // local
    } else if (chainId === 31337) {
      return WETH[1].address; // local
    } else return WETH[chainId].address;
  }

export async function getChainId() {
    const networkChainId = await network.getChainId();
    return networkChainId ? parseHex(networkChainId) : window.ethereum.chainId;
}

export const getChainName = async () => {
    try {
        const chainId = await getChainId();
        return supportedNetworksConfigByEnv[chainId]?.chainName;
    } catch(error) {
        console.log(error);
    }
}

export async function getPrice(token1, token2) {
    const chainId = await getChainId();
 
   if (token1.address === token2.address) return 1;
   // hardcoded prices for local/dev networks (hopefully temporary)
   if ([1337].includes(chainId)) {
     let pairSymbols = token1.symbol + "-" + token2.symbol;
     console.log(`pairSymbols: ${pairSymbols}`);
     return devPrices[pairSymbols];
   }
   const srcToken = new Token(chainId, token1.address, token1.decimals, token1.symbol);
   const dstToken =  new Token(chainId, token2.address, token2.decimals, token2.symbol);
 
   let pairs;
   try {
     const pair = await fetchPairData(srcToken, dstToken, supportedNetworksConfigByEnv[chainId].chainName);
     pairs = [pair];
   } catch (error) {
     const cToken = getConnectorToken(chainId);
     const connectorToken = new Token(chainId, cToken.address, cToken.decimals, cToken.symbol);
     const pair1 = await fetchPairData(srcToken, connectorToken, supportedNetworksConfigByEnv[chainId].chainName);
     const pair2 = await fetchPairData(connectorToken, dstToken, supportedNetworksConfigByEnv[chainId].chainName);
     pairs = [pair1, pair2];
   }
   const route = new Route(pairs, srcToken, dstToken);
   return route.midPrice.toSignificant(SIGNIFICANT_DIGITS);
 }
 
 async function fetchPairData(t0, t1, chainName) {
   const factory = await getWeb3Contract("UniswapV2Factory", chainName);
   const pairAddress = await factory.methods.getPair(t0.address, t1.address).call();
   const reserves = await (await getUNIV2Contract(pairAddress, chainName)).methods.getReserves().call();
   const firstToken = await (await getUNIV2Contract(pairAddress, chainName)).methods.token0().call();
   // const secondToken = await getUNIV2Contract(pairAddress).methods.token1().call();
   let swapped = firstToken.toLowerCase() === t1.address.toLowerCase();
   let reserve0 = reserves[swapped ? "1" : "0"];
   let reserve1 = reserves[swapped ? "0" : "1"];
   const pair = new Pair(new TokenAmount(t0, reserve0), new TokenAmount(t1, reserve1));
   return pair;
 }

export async function convert(amount, fromToken, toToken) {
    const chainId = await getChainId();
    fromToken = fromToken || getConnectorToken(chainId);
    toToken = toToken || getConnectorToken(chainId);
    // console.log(`fromToken [${fromToken.symbol}] ${fromToken.address}`);
    // console.log(`toToken [${toToken.symbol}] ${toToken.address}`);
    const price = await getPrice(fromToken, toToken);
    const multipliedPrice = toBN(10).pow(toBN(toToken.decimals)) * price;
    return toBN(multipliedPrice.toFixed(0))
      .mul(toBN(amount))
      .div(toBN(10).pow(toBN(fromToken.decimals)));
}


export async function getBalance(address, tokenAddress = undefined) {
  try {
    if (tokenAddress) {
      const _contract = await getERC20Contract(tokenAddress);
      return await _contract.methods.balanceOf(address).call();
    }else {
      const _web3Provider = await getWebProvider();
      return await _web3Provider.eth.getBalance(address);
    }
  } catch(error) {
    console.log(error);
  }
}

export const aprToAPY = (apr, period = 365 * 24 * 60, rate = 365 * 24 * 60) => { // daily apr * period of 365 and rate + period of 365 than the apy will be yearly.
  if(apr === 0) return 0;
  const blocksPerMin = period === 365 ? 1 : 4;
  const n = period * blocksPerMin;
  const apy = ((1 + apr / 100 / n) ** rate - 1) * 100;
  return apy === Infinity || apy > 1000000 ? 1000000 : apy;
};

export async function fromLPTokens(platform, lpTokenAmount, token) {
  let totalSupply = toBN(await platform.methods.totalSupply().call());
  let totalBalance;
  if(token?.type === "v3" || token?.type === "lp-v2" || token?.type === 'cvi-sdk' || token?.type === "usdc") {
    totalBalance = toBN(await platform.methods.totalBalance(true).call());
  } else {
    totalBalance = toBN(await platform.methods.totalBalanceWithAddendum().call());
  }
  return totalSupply.isZero() ? toBN(0)  : lpTokenAmount.mul(totalBalance).div(totalSupply);
}

export const getPositionRewardsContract = async (token) => { 
  try {
    if(token.type === "v2" || token.type === "usdc" || token.type === "v3") return;
    const chainName = await getChainName();
    const contractsJSON = require(`../files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${chainName}.json`);
    if(!contractsJSON) return;

    const HELPER_ADDRESS = "0xd5A222B80788E36F707adDc74c3Cb5de7e43F1B0";
    const HELPER_V2_ADDRESS = "0x1C746415D73D4cBc995E5eB80dDD07E698a32C8c";
    const [address, abi] = token.key === "eth" ? [HELPER_V2_ADDRESS, contractsJSON["CVOL-ETH-PositionRewards"].abi] : [HELPER_ADDRESS, contractsJSON["CVOL-USDT-PositionRewards"].abi];
    return new Contract(abi, address);
  } catch(error) {
    console.log(error);
  }
}

export const getCviValue = async (oracle) => {
  try {
    const { cviValue } = await oracle.methods.getCVILatestRoundData().call();
    return cviValue;
  } catch(error) {
    console.log(error);
    return "N/A";
  }
}

export function fromUnitsToTokenAmount(units, index, maxIndex) {
  if(!maxIndex) console.warn("Warning: maxIndex is not provided as a param.");
  return units.mul(toBN(index)).div(toBN(maxIndex));
}

export function fromTokenAmountToUnits(tokenAmount, index, maxIndex) {
  if(!maxIndex) console.warn("Warning: maxIndex is not provided as a param.");
  return toBN(tokenAmount).mul(toBN(maxIndex)).div(toBN(index));
}

export const getSubmitFees = async (_type, tokenAmount, delayFee, longTokenFeesCalculator) => {
  try {
    const _delayFeeAmount = percentToAmount(tokenAmount, delayFee);

    if(_type === 'mint') {
      const {openFee, buyingPremiumFeePercent} = (await longTokenFeesCalculator.getOpenFee(tokenAmount, { leverage: 1 }));
      // (("100000000" * 10000) - ("100000000" * "15")) / 10000
 
      const _buyingPremiumFeeAmount = percentToAmount(tokenAmount, toBN(String(buyingPremiumFeePercent)));
      const _submitFeeAmount = openFee.add(_buyingPremiumFeeAmount);
      const _netFeeAmount = toBN(_submitFeeAmount).add(_delayFeeAmount);

      return {
        _buyingPremiumFeeAmount,
        _submitFeeAmount,
        _netFeeAmount,
        _delayFeeAmount
      };
    }

    const closeFee = await longTokenFeesCalculator.getCloseFeePercent();
    const _submitFeeAmount = percentToAmount(tokenAmount, toBN(String(closeFee)));
    const _netFeeAmount = toBN(_submitFeeAmount).add(_delayFeeAmount);
    
    return {
      _submitFeeAmount,
      _delayFeeAmount,
      _netFeeAmount
    }
  } catch(error) {
    console.log(error)
    return {}
  }
}

export const getTransactionType = (network) => {
  if(network === chainNames.Matic) return {type: 0};
  return {};
}
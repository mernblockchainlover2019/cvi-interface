import { chainNames } from "connectors";
import config from "./config";

export const activeViews = {
  "trade": "trade",
  "view-liquidity": "view-liquidity",
  "history": "History"
}

const tabs = {
  "sub-navbar": {
      "trade": "Trade",
      "view-liquidity": "Provide Liquidity"
  },
  graphs: {
    "index": "Index",
    "fee": "Funding fee",
  },
  trade: {
      "positions": "Open positions",
      "history": "History"
  },
  "view-liquidity": {
      "liquidity": "Liquidity",
      "history": "History"
  },
};

const platformConfig = {
  tabs,
  tokens: {
    [chainNames.Ethereum]: {
      "usdc-cvol": {
        key: "usdc-cvol",
        name: "usdc",
        decimals: 6,
        fixedDecimals: 2,
        lpTokensDecimals: 18,
        type: "v3",
        leverage: ["1", "2"],
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "USDC",
          platform: "CVOL-USDC-Platform",
          feesCalc: "CVOL-USDC-FeesCalculator",
          feesModel: "CVOL-USDC-Platform",
          positionRewards: "CVOL-USDC-PositionRewards",
          oracle: "CVOL-Oracle",
          stakingRewards: "CVOL-USDCLP-StakingRewards",
          liquidation: "CVOL-USDC-Liquidation"
        }
      },
      eth: {
        key: "eth",
        name: "eth",
        decimals: 18,
        fixedDecimals: 8,
        lpTokensDecimals: 18,
        type: "eth",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "WETH",
          platform: "CVOL-ETH-Platform",
          feesCalc: "CVOL-ETH-FeesCalculator",
          feesModel: "CVOL-ETH-Platform",
          positionRewards: "CVOL-ETH-PositionRewards",
          oracle: "CVOL-Oracle-ETH", // same oracle for eth and usdt
          stakingRewards: "CVOL-ETHLP-StakingRewards",
          liquidation: "CVOL-USDT-Liquidation" // there is only one liquidation contract for both eth and usdt.
        },
      },
      "usdc-ethvi": {
        key: "usdc-ethvi",
        name: "usdc",
        decimals: 6,
        fixedDecimals: 2,
        lpTokensDecimals: 18,
        type: "v3",
        leverage: ["1", "2"],
        oracleId: config.oraclesData.ethvi.oracleId,
        rel: {
          contractKey: "USDC",
          platform: "ETHVOL-USDC-Platform",
          feesCalc: "ETHVOL-USDC-FeesCalculator",
          feesModel: "ETHVOL-USDC-Platform",
          positionRewards: "ETHVOL-USDC-PositionRewards",
          oracle: "ETHVOL-Oracle",
          stakingRewards: "ETHVOL-USDCLP-StakingRewards",
          liquidation: "ETHVOL-USDC-Liquidation"
        }
      },
      usdt: {
        migrated: config.isMainnet,
        hideFrom: ['stats'], // hide this token from being show in the statistics
        key: "usdt",
        name: "usdt",
        decimals: 6,
        fixedDecimals: 6,
        lpTokensDecimals: 18,
        type: "v1",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "USDT",
          platform: "CVOL-USDT-Platform",
          feesCalc: "CVOL-USDT-FeesCalculator",
          feesModel: "CVOL-USDT-FeesModel",
          oracle: "CVOL-Oracle-ETH", // same oracle for eth and usdt
          positionRewards: "CVOL-USDT-PositionRewards",
          stakingRewards: "CVOL-USDTLP-StakingRewards",
          liquidation: "CVOL-USDT-Liquidation",
          rewards: "Rewards",
        },
      },
      coti: {
        key: "coti",
        name: "coti",
        soon: true,
        rel: {
          oracle: "CVOL-Oracle"
        }
      },
    },
    [chainNames.Matic]: {
      "usdc-cvol": {
        key: "usdc-cvol",
        name: "usdc",
        decimals: 6,
        fixedDecimals: 6,
        lpTokensDecimals: 18,
        type: "v3",
        leverage: ["1", "2"],
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "USDC",
          platform: "CVOL-USDC-Platform",
          feesCalc: "CVOL-USDC-FeesCalculator",
          feesModel: "CVOL-USDC-Platform",
          positionRewards: "CVOL-USDC-PositionRewards",
          oracle: "CVOL-Oracle",
          stakingRewards: "CVOL-USDCLP-StakingRewards",
          liquidation: "CVOL-USDC-Liquidation"
        }
      },
      usdt: {
        migrated: config.isMainnet,
        hideFrom: ['stats'], // hide this token from being show in the statistics
        key: "usdt",
        name: "usdt",
        decimals: 6,
        fixedDecimals: 6,
        lpTokensDecimals: 18,
        type: "v2",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "USDT",
          platform: "CVOL-USDT-Platform",
          feesCalc: "CVOL-USDT-FeesCalculator",
          feesModel: "CVOL-USDT-Platform",
          positionRewards: "CVOL-USDT-PositionRewards",
          oracle: "CVOL-Oracle",
          stakingRewards: "CVOL-USDTLP-StakingRewards",
          liquidation: "CVOL-USDT-Liquidation"
        },
      },
    },
    [chainNames.Arbitrum]: {
      "usdc-cvol": {
        key: "usdc-cvol",
        name: "usdc",
        decimals: 6,
        fixedDecimals: 6,
        lpTokensDecimals: 18,
        type: "v3",
        leverage: ["1", "2"],
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "USDC",
          platform: "CVOL-USDC-Platform",
          feesCalc: "CVOL-USDC-FeesCalculator",
          feesModel: "CVOL-USDC-Platform",
          positionRewards: "CVOL-USDC-PositionRewards",
          oracle: "CVOL-Oracle",
          stakingRewards: "CVOL-USDCLP-StakingRewards",
          liquidation: "CVOL-USDC-Liquidation"
        }
      },
    }
  },
  headers: {
    "stats": { 
      "Index": {
        label: "Index"
      }, 
      "Liquidity pools": {
        label: "Liquidity pools",
        tooltip: {
          content: "The total value locked in all liquidity pools of CVI and ETHVI platforms in USD.",
          left: -30
        }
      }, 
      "Open positions": {
        label: "Open positions",
        tooltip: {
          content: "The total value of open positions in CVI and ETHVI platforms in USD.",
          left: -30
        }
      }, 
    },
    "index": ["Index", "Previous hour", "Last week high", "Last week low"],
    [activeViews.trade]: {
      [tabs.trade.positions]: {
        index: {
          label: "Index"
        },
        "Value": {
          label: "Value"
        },
        "Leverage": {
          label: "Leverage"
        },
        "P&L": {
          label: "P&L",
          tooltip: {
            content: "Profit and loss of your position is calculated continuously and is based on the index change, purchase and funding fees.",
            left: -30,
          }
        },
        "Rewards (claimable today)": {
          label: "Rewards (claimable today)",
          tooltip: {
            content: "Please note that GOVI tokens will become claimable starting the day after your last open position action (UTC time). If the available claimable amount is lower than your reward amount at the time of your claim, you can try again a day later and for a period of 30 days from the time of the last position purchase.",
            left: -30,
          }
        },
        action: ""
      },
      "History": ["Action date", "Index", "Action type", "Value", "Leverage", "Amount", "Fees", "Net amount"],
    },
    [activeViews["view-liquidity"]]:  {
      [tabs['view-liquidity'].liquidity]: {
        index: {
          label: "Index"
        },
        "My liquidity (pool share)": {
          label: "My liquidity (pool share)"
        },
        "P&L": {
          label: "P&L",
          tooltip: {
            content: "Profit and loss is calculated continuously and is based on the index change, incoming funding fees that traders pay, and your share of the pool.",
            left: -30,
          }
        },
        "Pool size": {
          label: "Pool size"
        },
        action: ""
      },
      "History":  ["Action date", "Index", "Action type", "Amount"],
    }, 
  },
  actionsConfig: {
    "buy": {
        key: "buy",
    },
    "sell": {
        key: "sell",
    },
    "deposit": {
        key: "deposit",
    },
    "withdraw": {
        key: "withdraw",
    },
    "claim": {
        key: "claim",
    }
  },
  collateralRatios: {
    buy: {
       id: "buy",
       text: "Please note that when the collateral ratio is above 80%, the purchase fee will increase.",
       type: "negative",
       markedLevel: 80
    },
    deposit: {
       text: "Please note that when the collateral ratio is above 80%, the purchase fee will increase, resulting in higher profits for the liquidity providers.",
       type: "positive",
       markedLevel: 80
    }
  },
  migrationMsgs: {
      trade: [
        "We have started the migration process of the USDT liquidity to USDC pool. Therefore, we have closed the option to open new positions in USDT.",
        "Active USDT positions will continue to receive their GOVI rewards.",
        <br/>,
        "Users will be able to complete the migration starting",
        "Wednesday, November 17th, at 11:00 AM UTC"
      ],
      liquidity: [
        "We have started the migration process of the USDT liquidity to USDC pool. Therefore, we have closed the option to provide new liquidity in USDT.",
        "Active USDT liquidity providers who have staked their CVI-USDT LP tokens will continue to receive their GOVI rewards.",
        <br/>,
        "Users will be able to complete the migration starting",
        "Wednesday, November 17th, at 11:00 AM UTC"
      ],
  },
  sellFeeWarningDuration: (60 * 60) * 48,
  sellFeeWarningText: "Sell fee will be considerably higher than usual until 48 hours pass from your last purchase",
}

export default platformConfig;
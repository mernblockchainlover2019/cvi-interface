import { chainNames } from "connectors";
import config from "./config";

export const activeViews = {
  "pending": "pending",
  "history": "history"
}

export const activeTabs = {
  "mint": "mint",
  "burn": "burn"
}

export const tabs = {
  "sub-navbar": {
    "mint": "Mint",
    "burn": "Burn"
  },
  graphs: {
    "fulfillment": "Time to fulfillment fee",
    "penalty": "Time penalty fee",
  }
}

const arbitrageConfig = {
  tabs,
  exchanges: {
    [chainNames.Ethereum]: {
      mainExchange: {
        label: 'Uniswap',
        path: 'https://v2.info.uniswap.org/pair/0x197e99bD87F98DFde461afE3F706dE36c9635a5D'
      },
    },
    [chainNames.Matic]: {
      mainExchange: {
        label: 'Quickswap',
        path: 'https://info.quickswap.exchange/#/pair/0x1dd0095a169e8398448A8e72f15A1868d99D9348'
      }
    },
    [chainNames.Arbitrum]: {
      mainExchange: {
        label: 'Sushiswap',
        path: 'https://analytics-arbitrum.sushi.com/'
      }
    },
  },
  tokens: {
    [chainNames.Ethereum]: {
      "ethvol": {
        key: "ethvol",
        name: "ethvol",
        decimals: 18,
        fixedDecimals: 8,
        lpTokensDecimals: 18,
        oracleId: config.oraclesData.ethvi.oracleId,
        rel: {
          contractKey: "ETHVOL-USDC-LONG",
          volTokenKey: "ETHVOL-USDC-LONG",
        },
        pairToken: {
          key: "usdc",
          name: "usdc",
          decimals: 6,
          fixedDecimals: 2,
          statisticsDecimals: 2,
          lpTokensDecimals: 18,
          oracleId: config.oraclesData.ethvi.oracleId,
          rel: {
            contractKey: "USDC",
            volTokenKey: "ETHVOL-USDC-LONG",
          },
        },
        mintProperties: {
          label: "USDC",
          decimals: 6,
          fixedDecimals: 2,
          lpTokensDecimals: 18,
        },
        burnProperties: {
          label: "ETHVOL",
          decimals: 18,
          fixedDecimals: 8,
          lpTokensDecimals: 18,
        }
      },
    },
    [chainNames.Matic]: {
      "cvol": {
        key: "cvol",
        name: "cvol",
        decimals: 18,
        fixedDecimals: 8,
        lpTokensDecimals: 18,
        oracleId: config.oraclesData.cvi.oracleId,
        rel: {
          contractKey: "CVOL-USDC-LONG",
          volTokenKey: "CVOL-USDC-LONG",
        },
        pairToken: {
          key: "usdc",
          name: "usdc",
          decimals: 6,
          fixedDecimals: 6,
          statisticsDecimals: 2,
          lpTokensDecimals: 18,
          oracleId: config.oraclesData.cvi.oracleId,
          rel: {
            contractKey: "USDC",
            volTokenKey: "CVOL-USDC-LONG",
          }
        },
        mintProperties: {
          label: "USDC",
          decimals: 6,
          fixedDecimals: 6,
          lpTokensDecimals: 18,
        },
        burnProperties: {
          label: "CVOL",
          decimals: 18,
          fixedDecimals: 8,
          lpTokensDecimals: 18,
        }
      },
    }
  },
  headers: {
    "stats": { 
      "Index": {
        label: "Index"
      }, 
      "Platform Price": {
        label: "Platform Price",
      }, 
      "Open positions": {
        label: "Uniswap Price",
      }, 
    }
  },
  tablesInfo: {
    [activeTabs.mint]: {
      tabs: {
        [activeViews.pending]: "Pending requests",
        [activeViews.history]: "History"
      }
    },
    [activeTabs.burn]: {
      tabs: {
        [activeViews.pending]: "Pending requests",
        [activeViews.history]: "History"
      }
    }
  },
  actionsConfig: {
    "mint": {
        key: "mint",
    },
    "burn": {
        key: "burn",
    },
    "fulfill": {
      key: "fulfill"
    },
    "receive_now": {
      key: "receive_now"
    },
    "liquidate": {
      key: "liquidate",
    },
    "processing": {
      key: "processing"
    }
  },
  tables: {
    [chainNames.Ethereum]: {
      [activeTabs.mint]: {
        "pending": {
          headers: {
            type: "Type",
            amount: "Amount",
            submitTime: "Submit time",
            submitTimeToFulfillment: "Submitted time to fulfillment",
            timeToFulfillmentFee: "Time to fulfillment fee",
            upfrontPayment: "Up front payment",
            amountToFulfill: "Amount to fulfill",
            fulfillmentIn: "Fulfillment in",
            action: true
          }
        },
        "history": {
          headers: {
            type: "Type",
            amount: "Amount",
            collateralMint: "Collateral mint",
            receivedToken: "Received tokens"
          }
        }
      },
      [activeTabs.burn]: {
        "pending": {
          headers: {
            type: "Type",
            amount: "Amount",
            submitTime: "Submit time",
            submitTimeToFulfillment: "Submitted time to fulfillment",
            timeToFulfillmentFee: "Time to fulfillment fee",
            upfrontPayment: "Up front payment",
            amountToFulfill: "Amount to fulfill",
            fulfillmentIn: "Fulfillment in",
            action: true
          }
        },
        "history": {
          headers: {
            type: "Type",
            amount: "Amount",
            collateralMint: "Collateral mint",
            receivedToken: "Received tokens"
          }
        }
      },
    },
    [chainNames.Matic]: {
      [activeTabs.mint]: {
        "pending": {
          headers: {
            submitTime: "Submit time",
            type: "Type",
            amount: "Amount",
            netAmount: "Net amount",
            expectedTokens: "Estimated # tokens",
            receiveIn: "Receive in",
            action: true
          }
        },
        "history": {
          headers: {
            fulfillmentTime: "Fulfillment time",
            type: "Type",
            amount: "Amount",
            receivedToken: "Received tokens"
          }
        }
      },
      [activeTabs.burn]: {
        "pending": {
          headers: {
            submitTime: "Submit time",
            type: "Type",
            amount: "Amount",
            netAmount: "Net amount",
            expectedTokens: "Estimated # tokens",
            receiveIn: "Receive in",
            action: true
          }
        },
        "history": {
          headers: {
            fulfillmentTime: "Fulfillment time",
            type: "Type",
            amount: "Amount",
            receivedToken: "Received tokens"
          }
        }
      },
    }
  },
  requestType: {
    1: activeTabs.mint,
    2: activeTabs.burn,
    3: activeTabs.mint,
    Mint:activeTabs.mint,
    Burn:activeTabs.burn,
    CollateralizedMint:activeTabs.mint,
  },
  graphsThumbnails: {
    [chainNames.Ethereum]: {
      fulfill: {
        desktop: 'fulfillment.svg',
        tablet: 'fulfillment-tablet.svg',
        mobile: 'fulfillment-mobile.svg',
      },
      penalty: {
        desktop: 'penalty.svg',
        tablet: 'penalty-mobile.svg',
        mobile: 'penalty-tablet.svg',
      }
    },
    [chainNames.Matic]: {
      fulfill: {
        desktop: 'fulfillment-polygon.svg',
        tablet: 'fulfillment-polygon-tablet.svg', 
        mobile: 'fulfillment-polygon-mobile.svg',
      },
      penalty: {
        desktop: 'penalty-polygon.svg',
        tablet: 'penalty-polygon-tablet.svg', 
        mobile: 'penalty-polygon-mobile.svg',
      }
    },
    [chainNames.Arbitrum]: {
      fulfill: {
        desktop: 'fulfillment.svg',
        tablet: 'fulfillment-tablet.svg',
        mobile: 'fulfillment-mobile.svg',
      },
      penalty: {
        desktop: 'penalty.svg',
        tablet: 'penalty-mobile.svg',
        mobile: 'penalty-tablet.svg',
      }
    },
  },
  timeToFulfillment: {
    [chainNames.Ethereum]: { 
      type: 'hours',
      maxTime: '3 hours'
    },
    [chainNames.Matic]: { 
      type: 'minutes',
      maxTime: '90 minutes'
    },
    [chainNames.Arbitrum]: { 
      type: 'hours',
      maxTime: '3 hours'
    }
  }
}

export default arbitrageConfig;
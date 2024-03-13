import { chainNames } from "connectors";

export const newStakingProgramNotification = {
  type: "new-staking-program-notification-2022",
  link: "https://cviofficial.medium.com/govi-staking-v2-is-now-live-3b7211d0069",
  activeBy: {
    restricted: true,
    networks: [chainNames.Ethereum, chainNames.Matic]
  }
}

const config = {
  oraclesData: {
    "cvi": {
      oracleId: "cvi",
      maxIndex: "20000"
    },
    "ethvi": {
      oracleId: 'ethvi',
      maxIndex: "22000"
    }
  },
  lockupPeriod: {
    sell: 'buyersLockupPeriod',
    withdraw: 'lpsLockupPeriod',
    unstake: 'stakeLockupTime'
  },
  maintenanceNetworks: {
    [chainNames.Ethereum]: false,
    [chainNames.Matic]: false,
    [chainNames.Arbitrum]: false,
  },
  isMainnet: process.env.REACT_APP_ENVIRONMENT === "mainnet",
  routes: {
    home: {
      label: "Home",
      path: "/",
      hide: ['/', '/platform', '/staking', '/volatility_tokens', '/index'],
      enterApp: true
    },
    platform: {
      label: "Platform",
      path: '/platform',
      hide: ['/'],
      restricted: true, // block access by country
      soonByNetwork: [chainNames.Arbitrum],
      notification: newStakingProgramNotification
    },
    staking: {
      label: "Staking",
      path: '/staking',
      hide: ['/'],
      restricted: true, // block access by country
      notification: newStakingProgramNotification
    },
    arbitrage: {
      label: "Volatility Tokens",
      path: '/volatility_tokens',
      hide: ['/'],
      restricted: true, // block access by country
      soonByNetwork: [chainNames.Arbitrum],
      notification: newStakingProgramNotification
    },
    bond: {
      label: "Bond",
      path: "https://pro.olympusdao.finance/#/partners/Crypto%20Volatility%20Index",
      supportedByNetwork: [chainNames.Arbitrum],
      fire: true,
      external: true
    },
    analytics: {
      label: "Analytics",
      path: 'https://dune.xyz/govidev/CVI',
      external: true
    },
    "help-center": {
      label: "Docs",
      path: 'https://docs.cvi.finance',
      external: true
    },
    governance: {
      label: "Governance",
      path: 'https://vote.cvi.finance',
      newLink: true,
      external: true
    },
  },
  socialLinks: [
    { iconName: 'github', to: 'https://github.com/govi-dao/cvi-contracts' },
    { iconName: 'telegram', to: 'https://t.me/cviofficial' },
    { iconName: 'twitter', to: 'https://twitter.com/official_cvi' },
    { iconName: 'medium', to: 'https://cviofficial.medium.com' },
    { iconName: 'defipulse', to: 'https://defipulse.com/crypto-volatility-index' },
    { iconName: 'discord', to: 'https://discord.gg/jXba8HmTs5' },
  ],
  alerts: {
    types: {
       PROCESSING: "PROCESSING",
       CONFIRMED: "CONFIRMED",
       FAILED: "FAILED",
       NOTICE: "NOTICE"
    },
  },
  cviVolInfoCurrencyIndex: { // index of api.cvx.finance/cvx (cvxInfo[index][cviInfCurrencyIndex])
    CVI: 1,
    BTC: 2,
    ETH: 3
  },
  volatilityTokenKey: { // @TODO: refactor these configs
    "cvol": "cvol",
    "ethvol": "ethvol",
  },
  volatilityIndexKey: { 
    "cvi": "cvi",
    "ethvi": "ethvi",
  },
  volatilityOracles: {
    "CVIOracle": "cvi",
    "ETHVOL-Oracle": "ethvi",
  },
  volatilityLabel: {
    "cvi": "CVI",
    "ethvi": "ETHVI",
  },
  volatilityApiKey: {
    "cvi": "CVI",
    "ethvi": "ETHVOL",
  },
  oracles: {
    "cvi": "CVOL-Oracle",
    "ethvi": "ETHVOL-Oracle"
  },
  web3ProviderId: "NETWORK",
  networkStatuses: {
     pending: 'pending',
     connected: 'connected',
     disconnected: 'disconnected'
  },
  approveStatus: {
    "notApproved": {
      key: "notApproved"
    },
    "justApproved": {
      key: "justApproved"
    },
    "alreadyApproved": {
      key: "alreadyApproved"
    }
  },
  walletErrors: {
    network: {
       wrong: {
          type: 'wrong-network',
          class: 'wrong-network',
          title: "Wrong Network",
       }
    }
  },
  statisticsDetails: {
    totalValueLocked: {
      title: "Platform TVL",
      className: "bold green",
      prefix: "$",
      tooltip: {
        content: "The total value locked(TVL) in both CVI and ETHVI platforms in USD",
        left: -30,
      }
    },
    goviPrice: {
      title: "GOVI price",
      prefix: "$",
      className: "bold"
    },
    feesCollected: {
      title: "Accumulated fees earned by GOVI stakers",
      className: "bold green",
      prefix: "$",
    },
    collateralRatio: {
      title: "Collateral ratio",
      tooltip: {
        content: "The collateral ratio is the ratio between the potential maximum value of open positions(open positions value when CVI index is 200) and the total value locked in the platform.",
        left: "0",
        mobileLeft: -40,
      }
    },
    purchaseFee: {
      title: "Purchase fee",
      tooltip: {
        content: "A purchase fee is a fee that you pay every time you buy a CVI position. The fee amount will increase if the collateral ratio is above 65% or in case of rapid changes in CVI value (turbulence).",
        left: "0",
        mobileLeft: -40,
      }
    },
    openPositionReward: {
      title: "Open position reward",
      tooltip: {
        content: "You will be able to claim the maximum reward if you keep your position open for at least 48 hours.",
        left: "0",
        mobileLeft: -40,
      }
    },
    fundingFee: {
      title: "Funding fee / hour",
      tooltip: {
        content: "A funding fee is an amount you pay every hour until you sell your CVI position or until the position is liquidated. A funding fee is not constant and may change based on the CVI index value.",
        left: "0",
        mobileLeft: -40,
      }
    },
    slippageTolerance: {
      title: "Slippage tolerance",
      tooltip: {
        content: "Your transaction will revert if the price changes unfavorably by more than this percentage",
        left: "0",
        mobileLeft: -40,
      }
    },
    estimateMint: {
      title: "You will get",
      className: "bold green",
      tooltip: {
        content: "The number of CVOL tokens displayed is an estimated amount you will receive after fulfilling you request. Please note that fulfilling your request prior/after the specified target time will incur in time penalty fee that will reduce the amount of CVOL tokens you will receive",
        left: "0",
        mobileLeft: -40,
      }
    },
    estimateBurn: {
      title: "You will get",
      className: "bold green",
      tooltip: {
        content: "The number of USDC tokens displayed is an estimated amount you will receive after fulfilling you request. Please note that fulfilling your request prior/after the specified target time will incur in time penalty fee that will reduce the amount of USDC tokens you will receive",
        left: "0",
        mobileLeft: -40,
      }
    },
    netMint: {
      title: "Net Mint Amount",
      className: "bold green",
      tooltip: {
        content: "Real mint amount after taking fees",
        left: "0",
        mobileLeft: -40,
      }
    },
    netBurn: {
      title: "Net Burn Amount",
      className: "bold green",
      tooltip: {
        content: "Real burn amount after taking fees",
        left: "0",
        mobileLeft: -40,
      }
    },
    estimatedReceivedTokens: {
      title: "You will get",
      tooltip: {
        content: "? - Estimated number of recieved tokens",
        left: "0",
        mobileLeft: -40,
      }
    },
    receiveInMint: {
      title: "You will get",
      className: "bold green",
      tooltip: {
        content: "The number of CVOL tokens displayed is an estimated amount you will receive after fulfilling you request. Please note that fulfilling your request prior/after the specified target time will incur in time penalty fee that will reduce the amount of CVOL tokens you will receive",
        left: "0",
        mobileLeft: -40,
      }
    },
    receiveInBurn: {
      title: "You will get",
      className: "bold green",
      tooltip: {
        content: "The number of USDC tokens displayed is an estimated amount you will receive after fulfilling you request. Please note that fulfilling your request prior/after the specified target time will incur in time penalty fee that will reduce the amount of USDC tokens you will receive",
        left: "0",
        mobileLeft: -40,
      }
    },
    expectedTokens: {
      title: "Estimated Number of Tokens",
      className: "bold green",
      tooltip: {
        content: "? - Estimated number of recieved tokens",
        left: "0",
        mobileLeft: 0,
      }
    },
    insufficientLiquidity: {
      title: "Insufficient liquidity",
      tooltip: {
        content: "Insufficent Liquidity",
        left: "0",
        mobileLeft: -50,
      }
    },
  },
  migrationStepsTypes: {
    'start': 'start',
    'no-need': 'no-need',
    'unstake': 'unstake', 
    'liquidity': 'liquidity', 
    'approved': 'approved', 
    'migrate': 'migrate', 
  },
  slippageButtons: [
    "0.5", "1", "2"
  ],
  goviV2StakingText: ["The new GOVI staking V2 program is now live on Arbitrum and Polygon!",
                     "For more information on the new GOVI staking V2 program and how to bridge your tokens to Arbitrum"],
  migrationSteps: [
    {
      stepKey: 'start',
      stepVisibility: false,
      stepDesc: [
        <b>Dear user,</b>, 
        "We are migrating the CVI Platform from the USDT to USDC pools on both Ethereum and Polygon networks.",
        "Once the migration is complete, you will be rewarded with additional GOVI tokens. Kindly note that you will need to manually stake your new CVI-USDC LP tokens in order to continue receiving your GOVI rewards.",
        "We have also ceased the distribution of GOVI rewards for traders and liquidity providers of the USDT pool.",
        "To proceed with the migration, please click the button below."
      ],
      stepButton: ["Proceed"]
    },
    {
      stepKey: 'unstake',
      stepVisibility: true,
      stepTitle: "Unstake & Claim",
      stepDesc: ["Unstake your USDT LP tokens and claim your GOVI rewards"],
      stepButton: ["Unstake"]
    }, {
      stepKey: "approved",
      stepVisibility: true,
      stepTitle: "Migrate",
      stepDesc: [
        <span className="bold">
          Clicking the migrate button will perform the following actions:
        </span>,
        ["1. Withdraw", "receive-value"],
        "2. Swap USDT for USDC.",
        "3. Deposit USDC to USDC liquidity pool."
      ],
      stepButton: ["Approve", "Migrate"], 
    }, {
      stepKey: "liquidity",
      stepVisibility: true,
      stepTitle: "Receive",
      stepDesc: [
        <span className="bold float-left">Congratulations!</span>,
        " You have successfully completed the migration.",
        'rewards-id',
        " will be sent to the following address shortly:",
      ]
    }
  ]
}

export default config;

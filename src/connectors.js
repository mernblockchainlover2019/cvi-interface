import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { NetworkConnector } from '@web3-react/network-connector';

if(!process.env.REACT_APP_ENVIRONMENT) {
    console.log("Please make sure that .env file is exist.")
}

export const defaultChainId = process.env.REACT_APP_ENVIRONMENT === "staging" ? 31337 : 1;

export const chainNames = {
    Matic: "Matic",
    Ethereum: "Ethereum",
    Arbitrum: "Arbitrum"
}

export const chainsData = {
    [chainNames.Ethereum]: {
        name: "Ethereum",
        poolingInterval: 62,
        explorerUrl: "https://etherscan.io/address",
        explorerName: "EtherScan",
        bottomBlock: 11686790,
        blockRate: 13.695,
        graphEndpoints: {
            platforms: "https://api.thegraph.com/subgraphs/name/vladi-coti/ethereum-platforms",
            tokens: "https://api.thegraph.com/subgraphs/name/vladi-coti/ethereum-tokens",
        }
    },
    [chainNames.Matic]: {
        name: "Matic",
        eventCounter: true, // true = if events are not working, fetch data after each async process is completed.
        poolingInterval: 21,
        explorerUrl: "https://polygon-explorer-mainnet.chainstacklabs.com/address",
        explorerName: "polygon explorer",
        bottomBlock: 11686790,
        blockRate: 2.21,
        graphEndpoints: {
            platforms: "https://api.thegraph.com/subgraphs/name/vladi-coti/polygon-platforms",
            tokens: "https://api.thegraph.com/subgraphs/name/vladi-coti/polygon-tokens",
        }
    },
    [chainNames.Arbitrum]: {
        name: "Arbitrum",
        poolingInterval: 21,
        explorerUrl: "https://arbiscan.io/address",
        explorerName: "arbitrum explorer",
        bottomBlock: 0,
        blockRate: 1,
        graphEndpoints: {
            platforms: "https://api.thegraph.com/subgraphs/name/vladi-coti/arbitrum-platforms",
            tokens: "https://api.thegraph.com/subgraphs/name/vladi-coti/arbitrum-tokens",
        }
    }
} 

export const supportedNetworksConfig = {
    "mainnet": {
        // 1
        1: {
            chainId: '0x1',
            chainName: 'Ethereum',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ["https://eth-mainnet.alchemyapi.io/v2/KhQWOrbOeWZoTIkwRt4a4aXPPxx5wj5J"],
            blockExplorerUrls: ['https://etherscan.com']
        },
        // matic
        137: {
            chainId: '0x89',
            chainName: 'Matic',
            nativeCurrency: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com']
        },
        // arbitrum 
        42161: {
            chainId: '0xA4B1',
            chainName: 'Arbitrum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io']
        },
    },
    "staging": {
        31337: {
            chainId: '0x7A69',
            chainName: 'Ethereum',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://hardhat-ethereum.dev-cvi-finance-route53.com'],
            blockExplorerUrls: null
        },
        31338: {
            chainId: '0x7A6A',
            chainName: 'Matic',
            nativeCurrency: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://hardhat-polygon.dev-cvi-finance-route53.com'], // https://matic-testnet-archive-rpc.bwarelabs.com
            blockExplorerUrls: ['https://matic.network']
        },
        31339: {
            chainId: '0x7A6B',
            chainName: 'Arbitrum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://hardhat-arbitrum.dev-cvi-finance-route53.com'],
            blockExplorerUrls: ['https://arbiscan.io']
        },
    }
}

export const supportedNetworksConfigByEnv = supportedNetworksConfig[process.env.REACT_APP_ENVIRONMENT]

export const networksFormatted = {
    "mainnet": {
        1: {
            name: "Ethereum",
            icon: "ethereum.svg"
        },
        137: {
            name: "Polygon (Matic)",
            icon: "matic.svg"
        },
        42161: {
            name: 'Arbitrum',
            icon: "arbitrum.svg",
        },
    },
    "staging": {
        31337: {
            name: "Ethereum",
            icon: "ethereum.svg"
        },
        31338: {
            name: "Polygon (Matic)",
            icon: "matic.svg"
        },
        31339: {
            name: 'Arbitrum',
            icon: "arbitrum.svg",
        },
    }
}

export const networksFormattedByEnv = networksFormatted[process.env.REACT_APP_ENVIRONMENT]; 

const POLLING_INTERVAL = 12000;

const RPC_URLS = {
    "mainnet": {
        1: supportedNetworksConfig.mainnet[1].rpcUrls,
        137: supportedNetworksConfig.mainnet[137].rpcUrls,
        42161: supportedNetworksConfig.mainnet[42161].rpcUrls
    },
    "staging": {
        31337: supportedNetworksConfig.staging[31337].rpcUrls,
        31338: supportedNetworksConfig.staging[31338].rpcUrls,
        31339: supportedNetworksConfig.staging[31339].rpcUrls
    },
}
const RPC_URLS_BY_ENV = RPC_URLS[process.env.REACT_APP_ENVIRONMENT];

const RPC_URLS_NETWORK = {
    "mainnet": {
        1: "https://eth-mainnet.alchemyapi.io/v2/KhQWOrbOeWZoTIkwRt4a4aXPPxx5wj5J",
        137: "https://polygon-mainnet.infura.io/v3/febfb2edfb47420784373875242fd24d",
        42161: "https://arb-mainnet.g.alchemy.com/v2/wm1M6JZoetutYwR_gICXbLkdi5CIvTXA",
    },
    "staging": {
        31337: "https://hardhat-ethereum.dev-cvi-finance-route53.com",
        31338: "https://hardhat-polygon.dev-cvi-finance-route53.com",
        31339: "https://hardhat-arbitrum.dev-cvi-finance-route53.com"
    },
}
export const RPC_URLS_NETWORK_BY_ENV = RPC_URLS_NETWORK[process.env.REACT_APP_ENVIRONMENT]

export const injected = new InjectedConnector({ supportedChainIds: Object.keys(supportedNetworksConfig[process.env.REACT_APP_ENVIRONMENT]).map(id => Number(id))});

export const network = new NetworkConnector({
    defaultChainId,
    urls: RPC_URLS_NETWORK_BY_ENV,
})

const walletconnectorInstance = new WalletConnectConnector({
    rpc: { [defaultChainId]: RPC_URLS_BY_ENV[defaultChainId][0]},
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    qrcodeModalOptions: {
        mobileLinks: [
            "metamask",
            "trust",
        ],
    },
});

export let walletconnect = walletconnectorInstance

export const ConnectorNames = {
    MetaMask: 'MetaMask',
    WalletConnect: 'WalletConnect',
    Network: 'Network'
}
  
export let connectorsByName = {
    [ConnectorNames.MetaMask]: injected,
    [ConnectorNames.Network]: network,
    [ConnectorNames.WalletConnect]: walletconnect
}

export const reInitiateConnector = () => {
    connectorsByName = null;
    
    connectorsByName = {
        [ConnectorNames.MetaMask]: injected,
        [ConnectorNames.Network]: network,
        [ConnectorNames.WalletConnect]: new WalletConnectConnector({
            rpc: { [defaultChainId]: RPC_URLS_BY_ENV[defaultChainId][0] },
            bridge: 'https://bridge.walletconnect.org',
            qrcode: true,
            pollingInterval: POLLING_INTERVAL,
            qrcodeModalOptions: {
                mobileLinks: [
                    "metamask",
                    "trust",
                ],
            },
        })
    }
}
import React from 'react';
import { ConnectorNames, connectorsByName, defaultChainId, reInitiateConnector, supportedNetworksConfigByEnv } from 'connectors';
import { useWeb3React } from '@web3-react/core';
import { addAlert } from 'store/actions';
import { useDispatch, useSelector } from 'react-redux';
import config from 'config/config';
import './WalletProviderModal.scss';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { chainNameToChainId } from 'utils';
import Modal from 'components/Modal/Modal';
import Title from 'components/Elements/Title';
import WalletProvider from 'components/WalletProvider';

export const WalletProviderModal = ({setModalIsOpen, metaMaskInstalled }) => {
    const dispatch = useDispatch();
    const { activate } = useWeb3React();
    const { account } = useActiveWeb3React();
    const { selectedNetwork } = useSelector(({app}) => app);
    

    const onClick = async (currentConnector, name) => {
        try {
            await activate(connectorsByName[name], (error) => {
                console.log(error)
                if(name === ConnectorNames.WalletConnect) {
                    reInitiateConnector();
                }
            }).then(async () => {
                if(name !== ConnectorNames.WalletConnect) {
                    if(!await switchNetwork()) throw new Error();
                }
                setModalIsOpen(false);
            });
        } catch(error) {
            console.log(error);
        }
    }

    const switchNetwork = async () => {
        try {
            const chainId = chainNameToChainId(selectedNetwork)
            const selectedNetworkParam = supportedNetworksConfigByEnv?.[chainId] ?? defaultChainId;
            
            if(selectedNetworkParam && window?.ethereum?.request) {
                await window.ethereum.request({method: 'wallet_addEthereumChain', params: [selectedNetworkParam, account]});
            }
            return true;
        } catch(error) {
            console.log(error);
            if(error) {
                if(error.message?.toLowerCase()?.includes("may not specify default metamask chain.")) {
                    dispatch(addAlert({
                        id: "switch-network",
                        message: "Cannot switch to Ethereum network. please change it manually.",
                        alertType: config.alerts.types.FAILED,
                        eventName: "select network error"
                    }))
                } else if(error.message?.toLowerCase()?.includes("user rejected the request.")) {
                    dispatch(addAlert({
                        id: "switch-network",
                        message: "Switch network rejected.",
                        alertType: config.alerts.types.FAILED,
                        eventName: "select network error"
                    }));
                } else {
                    dispatch(addAlert({
                        id: "switch-network",
                        message: "Cannot switch network. please change it manually.",
                        alertType: config.alerts.types.FAILED,
                        eventName: "select network error"
                    }));
                }
            }
            return false;
        }
    }

    if(metaMaskInstalled !== null && !metaMaskInstalled) {
        delete connectorsByName.MetaMask;
    }

    return metaMaskInstalled !== null && (
        <Modal closeIcon className="wallet-connect-modal" handleCloseModal={() => setModalIsOpen(false)}>
            <Title className="connect-wallet-title xs-center" color="white" text="Connect your wallet" borderColor="#f8ba15"/>

            <div className="wallet-connect-modal__container">

                {Object.keys(connectorsByName).filter(name => name !== 'Network' )?.length > 0 ? <h2>Select a wallet provider</h2> : <h2>No wallet providers.</h2>}
                
                <div className="wallet-connect-modal__container--providers">
                    {Object.keys(connectorsByName).filter(name => name !== 'Network' ).map((name, idx) => {
                        const currentConnector = connectorsByName[name];
                        const img = ConnectorNames[name].toLowerCase();
                        return <WalletProvider key={idx} avatarUrl={require(`../../../images/icons/${img}.svg`).default} name={ConnectorNames[name]} onClick={()=>onClick(currentConnector, name)}/>
                    })}
                </div>
                
                {/* <div className="wallet-connect-modal__faq">
                    <span>Need help connecting a wallet? Read our </span>
                    <Link to={config.routes.states.default.faq.path} onClick={() => setModalIsOpen(false)}>FAQ</Link>
                </div> */}
            </div>
        </Modal>
    )
}

export default WalletProviderModal;
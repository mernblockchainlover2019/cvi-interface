import React, { useEffect, useState } from 'react'
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';
import { networksFormatted, supportedNetworksConfig } from 'connectors';
import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';
import Spinner from 'components/Spinner/Spinner';
import { useActiveWeb3React, useIsWrongNetwork } from 'components/Hooks/wallet';
import config from 'config/config';
import MyWalletModal from 'components/Modals/MyWalletModal';
import ErrorModal from 'components/Modals/ErrorModal';
import WalletProviderModal from 'components/Modals/WalletProviderModal';
import { getCurrentProviderName } from 'utils';
import Button from 'components/Elements/Button';
import './ConnectWallet.scss';
import { useInDOM, useIsDesktop } from 'components/Hooks';
import { useMemo } from 'react';

const ConnectWallet = ({type, buttonText = "", hasErrorButtonText}) => {
    const isActiveInDOM = useInDOM();
    const [walletInfoModalIsOpen, setWalletInfoModalIsOpen] = useState(false);
    const [walletProviderModalIsOpen, setWalletProviderModalIsOpen] = useState(false);
    const { active, account, chainId, library } = useActiveWeb3React();
    const { active: injectedActive } = useWeb3React();
    const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
    const [errorData, setErrorData] = useState(); 
    const [mmInstalled, setMmInstalled] = useState(null);
    const isWrongNetwork = useIsWrongNetwork();
    const { networkStatus } = useSelector(({app}) => app);
    const { selectedNetwork } = useSelector(({app}) => app);
    const isDesktop = useIsDesktop();

    const activeNetwork = networksFormatted[supportedNetworksConfig?.[chainId]?.chainId];
    
    useEffect(()=>{
        const checkMetamsk = async() => {
            const provider = await detectEthereumProvider();
            if(isActiveInDOM()){
                setMmInstalled(!!provider);
            }
        }

        checkMetamsk();
        //eslint-disable-next-line
    }, []);
    
    useEffect(()=>{
        if(isActiveInDOM()){ 
            setWalletProviderModalIsOpen(false);
        }
        //eslint-disable-next-line
    },[active]);
    

    useEffect(() => {
        if(isActiveInDOM()){ 
            if(isWrongNetwork) {
                setErrorData(config.walletErrors.network.wrong);
            }  else setErrorData("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWrongNetwork, injectedActive]);

    return useMemo(() => {
        const onClick = () => {
            if(errorData?.type === config.walletErrors.network.wrong.type) {
                setErrorModalIsOpen(true);
            } else if(active && account) {
                setWalletInfoModalIsOpen(true);
            } else {
                setWalletProviderModalIsOpen(true);
            }
        }
    
        const onChangeProvider = () => {
            if(!errorData && isActiveInDOM()) setWalletProviderModalIsOpen(true);
        }

        return <div className={`connect-wallet-button ${errorData ? errorData.class : ''} ${type ?? ''}`}>
            {walletInfoModalIsOpen && <MyWalletModal address={account} setModalIsOpen={setWalletInfoModalIsOpen}/>}
            {walletProviderModalIsOpen && (!account || type === "change") && <WalletProviderModal metaMaskInstalled={mmInstalled} setModalIsOpen={setWalletProviderModalIsOpen}/>}
            {errorModalIsOpen && <ErrorModal 
                error={errorData && `Please connect to ${selectedNetwork} ${config.isMainnet ? 'Mainnet' : 'Testnet'} network.`} 
                setModalIsOpen={setErrorModalIsOpen}
            />}

            {(account && !errorData) ? 
                type === "change" ? <div className="change-provider-container">
                    <span>Connected with {getCurrentProviderName(library.currentProvider)}</span>
                    <Button onClick={onChangeProvider} buttonText="Change" />
                </div> : <div className="connect-wallet-button__has-address">
                    <Button onClick={onClick}>
                        {activeNetwork?.name}
                        <div className="connect-wallet-button__has-address--address">
                            <div className="dot"></div>
                            <span className="full--address">{account}</span>{isDesktop && <span className="sliced-address">{account.slice(account.length-4, account.length)}</span>}
                        </div>
                    </Button>
                </div>
            : <div className="connect-wallet-button__connected">
                {(type === 'navbar' && networkStatus === config.networkStatuses.pending) ? <div className="button network-pending">
                    <Spinner className="spinner-container" />
                    <span>Connecting...</span>
                </div> : <Button buttonText={errorData ? hasErrorButtonText ?? buttonText : buttonText ?? ""} onClick={onClick}/>}
            </div> }
        </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, active, activeNetwork?.name, buttonText, errorData, errorModalIsOpen, hasErrorButtonText, isDesktop, library.currentProvider, mmInstalled, networkStatus, selectedNetwork, type, walletInfoModalIsOpen, walletProviderModalIsOpen])
}

export default ConnectWallet;
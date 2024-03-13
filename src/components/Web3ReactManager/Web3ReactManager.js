import { useWeb3React } from '@web3-react/core';
import { useInDOM } from 'components/Hooks';
import { useEagerConnect, useInactiveListener } from 'components/Hooks/wallet';
import config from 'config/config';
import { network } from 'connectors';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { chainNameToChainId } from 'utils';


const Web3ReactManager = ({children}) => {
    const isActiveInDOM = useInDOM();
    const { active } = useWeb3React()
    const { active: networkActive, error: networkError, activate: activateNetwork} = useWeb3React(config.web3ProviderId)
    const { selectedNetwork } = useSelector(({app}) => app);
    // try to eagerly connect to an injected provider, if it exists and has granted access already
    const triedEager = useEagerConnect();

    // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
    useEffect(() => {
        if(!isActiveInDOM()) return;
        if (!triedEager && !networkActive && !networkError && !active && selectedNetwork) {
            network.changeChainId(chainNameToChainId(selectedNetwork));
            activateNetwork(network);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triedEager, networkActive, networkError, activateNetwork, active, selectedNetwork])

    // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
    useInactiveListener();

    // handle delayed loader state
    const [showLoader, setShowLoader] = useState(false)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if(!isActiveInDOM()) return;
            setShowLoader(true)
        }, 600)

        return () => {
            clearTimeout(timeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // on page load, do nothing until we've tried to connect to the injected connector
    // if (!triedEager) {
    //     return null
    // }

    // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
    if (!active && networkError) {
        return (
            <div className="">
                <h1>network error</h1>
            </div>
        )
    }

    // if neither context is active, spin
    if (!active && !networkActive) {
        return showLoader ? (
            <div className="">
                <h3>Loading....</h3>
            </div>
        ) : null
    }

    
    return children;
}

export default Web3ReactManager;

import { useWeb3React } from "@web3-react/core";
import config from "config/config";
import { injected, network, supportedNetworksConfigByEnv } from "connectors";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectNetwork } from "store/actions";
import { parseHex } from "utils";
import { useInDOM, useIsDesktop } from ".";

export const useActiveWeb3React = () => {
  const context = useWeb3React();
  const contextNetwork = useWeb3React(config.web3ProviderId);
  return (context.active && context.chainId === contextNetwork.chainId) ? context : contextNetwork;
}

export function useEagerConnect() {
  const { activate, active, chainId } = useWeb3React() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);
  const isDesktop = useIsDesktop();
  const dispatch = useDispatch();

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected);
      } else {
        if (!isDesktop && window.ethereum) {
          activate(injected);
        }
      }
    })
    //eslint-disable-next-line
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
      if (supportedNetworksConfigByEnv[chainId]) {
        network.changeChainId(chainId);
        dispatch(setSelectNetwork(supportedNetworksConfigByEnv[chainId].chainName));
      }
    }
    //eslint-disable-next-line
  }, [active]);

  return tried
}

export function useInactiveListener() {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && !error) {
      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }

      const handleChainChanged = (chainId) => {
        console.log("Handling 'chainChanged' event with payload", chainId);
        window.location.reload();
      }

      const handleAccountsChanged = (accounts) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        window.location.reload();
      }

      const handleNetworkChanged = (networkId) => {
        console.log("network change", networkId);
        activate(injected)
      }

      const handleDisconnect = (event) => {
        // window.location.reload();
        console.log("Handling 'disconnect' event with payload", event)
      }


      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleNetworkChanged)
      ethereum.on('disconnect', handleDisconnect)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('chainChanged', handleNetworkChanged)
          ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [active, error, activate])
}

export const useIsWrongNetwork = () => {
  const isActiveInDOM = useInDOM();
  const injectedContext = useWeb3React();
  const networkContext = useWeb3React(config.web3ProviderId);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const checkActivate = async () => {
    try {
      if(!injectedContext.connector.isAuthorized) return;
      const injectedIsAuthorized = await injectedContext.connector.isAuthorized();
      const injectedChainId = parseHex(await injectedContext.connector.getChainId());
      const isWrong = injectedIsAuthorized && injectedChainId !== networkContext.chainId;

      if(isActiveInDOM() && isWrongNetwork !== isWrong) {
        setIsWrongNetwork(isWrong);
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!injectedContext.connector) return;
    checkActivate();
    //eslint-disable-next-line
  }, [injectedContext, networkContext]);

  return isWrongNetwork;
}

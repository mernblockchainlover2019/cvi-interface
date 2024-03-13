import { cloneW3 } from "@coti-cvi/cvi-sdk";
import { useWeb3React } from "@web3-react/core";
import config from "config/config";
import { chainNames } from "connectors";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DAY } from "../useEvents";
import { useActiveWeb3React } from "../wallet";

const useCviSdk = () => {
    const [w3, setW3] = useState();
    const { library: networkPorvider } = useWeb3React(config.web3ProviderId);
    const { library: sendProvider } = useActiveWeb3React();
    const { selectedNetwork } = useSelector(({app}) => app);

    const getW3Instance = useCallback(async (provider, sendProvider) => {
      try {
        let options = {
          provider, 
          env: process.env.REACT_APP_ENVIRONMENT === "mainnet" ? "live" : process.env.REACT_APP_ENVIRONMENT
        }

        if(sendProvider) {
          options.sendProvider = sendProvider;
        }

        let w3Inst = await cloneW3(selectedNetwork === chainNames.Matic ? 'Polygon' : selectedNetwork, options).init();
        
        if(!config.isMainnet || process.env.REACT_APP_DAYS_TO_COUNT_FROM) { // run staging env from block number timestamp sub days in env
          const blockTimestamp = await (await w3Inst.block.getBlock()).timestamp;
          const forkTimestamp = blockTimestamp - (DAY * process.env.REACT_APP_DAYS_TO_COUNT_FROM)
          if(forkTimestamp) {
            w3Inst.forkTimestamp = forkTimestamp;
          }
        }
  
        setW3(w3Inst);
      } catch(error) {
        console.log(error);
      }
    }, [selectedNetwork])
  
    const getW3InstanceDebounce = useMemo(() => debounce(getW3Instance, 500), [getW3Instance]);
  
    useEffect(() => {
      if(!selectedNetwork || !networkPorvider?.currentProvider) return;
      getW3InstanceDebounce(networkPorvider?.currentProvider,  sendProvider?.currentProvider);
      return () => {
        getW3InstanceDebounce.cancel();
      }
    }, [selectedNetwork, getW3InstanceDebounce, networkPorvider?.currentProvider, sendProvider?.currentProvider]);
  
    return w3;
  }

  export default useCviSdk;
import { useWeb3React } from "@web3-react/core";
import { useActiveWeb3React } from "components/Hooks/wallet";
import config from "config/config";
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux";
import Contract from "web3-eth-contract";

export const useContracts = () => {
    const { selectedNetwork } = useSelector(({app}) => app);
    const { library } = useWeb3React(config.web3ProviderId);
    const { library: web3 } = useActiveWeb3React();
    const [contracts, setContracts] = useState(null);

    useEffect(() => {
        const loadContracts = () => {
            if(!library?.currentProvider || !web3?.currentProvider) return;
            const contractsJSON = require(`./files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
            const contractsKeys = Object.keys(contractsJSON);
            let contractsObject = {};
            const provider = selectedNetwork === "Matic" ? library?.currentProvider : web3?.currentProvider
            Contract.setProvider(provider);
         
            contractsKeys.forEach((key) => {
                contractsObject[key] = new Contract(contractsJSON[key]?.abi || contractsJSON[contractsJSON[key]?.abiRef]?.abi, contractsJSON[key].address, {
                    network: selectedNetwork,
                });
            });

            setContracts(contractsObject);
        }

        loadContracts();
        // eslint-disable-next-line
    }, [library, web3]);

    
    return useMemo(() => {
        return contracts;
        //eslint-disable-next-line
    }, [contracts]);
}


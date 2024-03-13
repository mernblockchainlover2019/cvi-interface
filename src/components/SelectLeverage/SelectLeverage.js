import { useActiveWeb3React } from 'components/Hooks/wallet';
import Tabs from 'components/Tabs';
import platformConfig from 'config/platformConfig';
import { contractsContext } from 'contracts/ContractContext';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './SelectLeverage.scss';

const SelectLeverage = ({selectedCurrency, leverage, tokenLeverageList = [], setLeverage}) => {
    const { selectedNetwork } = useSelector(({app}) => app);
    const {account} = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const [lastPositionLeverage, setLastPositionLeverage] = useState(null);
    const actionConfirmedCounter = useSelector(({events}) => events.actionConfirmed);
    useEffect(()=>{
        if(!account || !selectedCurrency || !selectedNetwork) return
        
        const getLastPositionLeverage = async (cb) => {
            const platform = platformConfig.tokens[selectedNetwork][selectedCurrency].rel.platform;
            const pos = await contracts[platform].methods.positions(account).call();
            if(pos.leverage) return cb(()=>setLastPositionLeverage(pos.leverage))
            return
        }

        let canceled = false;
        getLastPositionLeverage((cb)=>{
            if(canceled) return
            cb()
        })
        return () => {
            canceled = true;
        }
        // eslint-disable-next-line
    },[selectedNetwork, selectedCurrency, account, actionConfirmedCounter])
    return (
        <div className="select-leverage-component">
           <h2>Select Leverage</h2>
           <Tabs type="leverage" suffix="X" enableOnly={lastPositionLeverage} tabs={tokenLeverageList} activeTab={leverage} setActiveTab={setLeverage} />
        </div>
    )
}

export default SelectLeverage;

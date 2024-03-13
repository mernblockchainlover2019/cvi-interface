import { useActionController } from 'components/Actions/ActionController';
import { useActiveToken, useInDOM } from 'components/Hooks';
import { useEvents } from 'components/Hooks/useEvents';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { DataState } from 'components/Tables/Elements/Values/DataState';
import platformConfig from 'config/platformConfig';
import { contractsContext } from 'contracts/ContractContext';
import web3Api from 'contracts/web3Api';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { commaFormatted } from 'utils';
import { useWeb3React } from '@web3-react/core';
import config from 'config/config';

export const HighSellFee = ({sellFee, sellFeeAmount}) => {
    const isActiveInDOM = useInDOM();
    const contracts = useContext(contractsContext);
    const eventsUtils = useEvents();
    const { library } = useWeb3React(config.web3ProviderId);
    const { account } = useActiveWeb3React();
    const { token, type } = useActionController();
    const activeToken = useActiveToken(token);
    const _higherFeeDurationTimer = useRef();
    const [sellFeeWarning, setSellFeeWarning] = useState();

    const getLockedTimeFromContract = async () => {
        try {
            const [locked, higherFeeDuration] = await web3Api.isLocked(contracts, activeToken, {
                type, 
                library, 
                eventsUtils,
                account, 
                customDuration: platformConfig.sellFeeWarningDuration // sell fee is for 60 seconds by default
            }); 

            if(higherFeeDuration > 0) {
              _higherFeeDurationTimer.current = setTimeout(() => {
                getLockedTimeFromContract();
              }, higherFeeDuration);
            } 

            if(isActiveInDOM()) {
              setSellFeeWarning((!locked && higherFeeDuration > 0));
            }
        } catch(error) {
          console.log(error);
        }
    }

    useEffect(() => {
        getLockedTimeFromContract();
    
        return () => {
          if(_higherFeeDurationTimer.current) {
            clearTimeout(_higherFeeDurationTimer.current);
          }
        }
        //eslint-disable-next-line
    }, []);

    return (
        <> 
            <div className={`sell-info-component__row ${sellFeeWarning ? 'low' : ''}`}>
                <span>Sell fee</span>
                <DataState value={sellFee}>
                    <span>{commaFormatted(sellFeeAmount)} {activeToken?.name?.toUpperCase()}</span>
                </DataState>
            </div>
            {sellFeeWarning && <p className="sell-info-component__warning">{platformConfig.sellFeeWarningText}</p> }
        </>
    )
}

export default HighSellFee;
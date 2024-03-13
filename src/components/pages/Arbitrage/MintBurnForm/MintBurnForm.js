import ActionController from 'components/Actions/ActionController';
import { appViewContext } from 'components/Context';
import { useActiveToken } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import config from 'config/config';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import './MintBurnForm.scss';

const MintBurnForm = ({ amount, setAmount, delayFee, setDelayFee, slippageTolerance, setSlippageTolerance, type }) => {
    const { unfulfilledRequests } = useSelector(({wallet}) => wallet);
    const { account } = useActiveWeb3React();
    const activeToken = useActiveToken(type); 
    const { w3 } = useContext(appViewContext);
    const tokenContract = w3?.tokens[activeToken.rel.contractKey];
    const [availableBalance, setAvailableBalance] = useState(null);

    const getAvailableBalance = useCallback(async () => {
        try {
            const balance = await tokenContract.balanceOf(account);
            setAvailableBalance(balance);
        } catch(error) {
            console.log(error);
            setAvailableBalance("N/A");
        } 
    }, [account, tokenContract]);
    

    useEffect(() => {
        if(!account) return setAvailableBalance("0");
        if(!tokenContract) return;
        setAvailableBalance(null);
        getAvailableBalance();
    }, [account, tokenContract, getAvailableBalance]);

    useEffect(() => {
        if(unfulfilledRequests === null) return;
        setAvailableBalance(null);
        getAvailableBalance();
    }, [getAvailableBalance, unfulfilledRequests])

    return useMemo(() => {
        if(!activeToken?.name) return;

        return (
            <div className="arbitrage-mint-burn-form-component">
                <ActionController
                    view={config.routes.arbitrage.path}
                    delayFee={delayFee}
                    setDelayFee={setDelayFee}
                    amount={amount}
                    setAmount={setAmount}
                    slippageTolerance={slippageTolerance}
                    setSlippageTolerance={setSlippageTolerance}
                    token={activeToken.name}
                    type={type}
                    balances={{ tokenAmount: availableBalance }}
                    disabled={!amount} 
                    cb={getAvailableBalance}
                />
            </div>
        );
    }, [activeToken.name, amount, availableBalance, delayFee, getAvailableBalance, setAmount, setDelayFee, slippageTolerance, setSlippageTolerance, type]);
}

export default MintBurnForm;


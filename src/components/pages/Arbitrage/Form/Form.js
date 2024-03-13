import ActionController from 'components/Actions/ActionController';
import { appViewContext } from 'components/Context';
import { useActiveToken } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import config from 'config/config';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import './Form.scss';

const Form = ({ amount, setAmount, delayFee, setDelayFee, type }) => {
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
            <div className="arbitrage-form-component">
                <ActionController
                    view={config.routes.arbitrage.path}
                    delayFee={delayFee}
                    setDelayFee={setDelayFee}
                    amount={amount}
                    setAmount={setAmount}
                    token={activeToken.name}
                    type={type}
                    balances={{ tokenAmount: availableBalance }}
                    disabled={!amount} 
                    cb={getAvailableBalance}
                />
                <SeeMore />
            </div>
        );
    }, [activeToken.name, amount, availableBalance, delayFee, getAvailableBalance, setAmount, setDelayFee, type]);
}

const SeeMore = () => {
    return useMemo(() => {
        return <div className="see-more-component">
            <p>Please note that the submitted requests expire after 12 hours. You won’t be able to fulfill Mint/Burn request after it is expired.</p>
            <p>The request can't be fulfilled in the first 15 minutes after it is submitted.</p>
        </div>
    }, []);
}

export default Form;


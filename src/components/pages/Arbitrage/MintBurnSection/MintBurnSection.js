import { appViewContext } from 'components/Context';
import React, { useContext, useMemo, useState } from 'react'
import { useActiveToken } from 'components/Hooks';
import MintBurnForm from '../MintBurnForm';
import config from 'config/config';
import './MintBurnSection.scss';
import Container from 'components/Layout/Container';
import MintBurnTab from '../MintBurnTab';

const MintBurnSection = ({ tabs, setActiveView }) => { 
    const { activeView } = useContext(appViewContext);
    const activeToken = useActiveToken(activeView, config.routes.arbitrage.path);
    const [amount, setAmount] = useState("");
    const [delayFee, setDelayFee] = useState({
        fee: null
    });
    const [slippageTolerance, setSlippageTolerance] = useState("0.5");

    return useMemo(() => {
        if(!activeToken?.name) return null;
        
        return (
            <Container className="arbitrage-mint-burn-section-component">
                <MintBurnTab
                    className="sub-tabs"
                    tabs={tabs}
                    activeView={activeView}
                    setActiveView={setActiveView} 
                />
                <MintBurnForm
                    type={activeView}
                    amount={amount}
                    setAmount={setAmount}
                    delayFee={delayFee}
                    setDelayFee={setDelayFee}
                    slippageTolerance={slippageTolerance}
                    setSlippageTolerance={setSlippageTolerance}
                />
            </Container>
        );
    }, [activeToken?.name, activeView, amount, delayFee, tabs, setActiveView, slippageTolerance]);
}

export default MintBurnSection;
import { appViewContext } from 'components/Context';
import Details from 'components/Details/Details';
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useActiveToken } from 'components/Hooks';
import Form from '../Form';
import GraphsThumbnail from '../GraphsThumbnail';
import config from 'config/config';
import './ActiveSection.scss';

const ActiveSection = ({activeTab}) => { 
    const { activeView } = useContext(appViewContext);
    const activeToken = useActiveToken(activeView, config.routes.arbitrage.path);
    const [amount, setAmount] = useState("");
    const [delayFee, setDelayFee] = useState({
        fee: null
    });
    const GraphsThumbnaill = useCallback(() => (<GraphsThumbnail />), []);

    return useMemo(() => {
        if(!activeToken?.name) return null;
        
        return (
            <div className="arbitrage-section-component">
                <Form
                    type={activeView}
                    amount={amount}
                    setAmount={setAmount}
                    delayFee={delayFee}
                    setDelayFee={setDelayFee}
                />

                <Details
                    activeVolIndex={activeTab}
                    amount={amount} 
                    path={config.routes.arbitrage.path}
                    delayFee={delayFee}
                />

                <GraphsThumbnaill />
            </div>
        );
    }, [activeTab, activeToken?.name, activeView, amount, delayFee]);
}

export default ActiveSection;
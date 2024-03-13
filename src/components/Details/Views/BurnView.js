import { useCallback, useContext, useEffect, useMemo, useState} from "react";
import Stat from "components/Stat";
import { useActiveToken } from "components/Hooks";
import { activeTabs as arbitrageActiveTabs } from "config/arbitrageConfig";
import { appViewContext } from "components/Context";
import debounce from "lodash.debounce";
import { toBN, toBNAmount, toDisplayAmount } from "utils";


const BurnView = ({ amount, delayFee }) => {
    const { w3 } = useContext(appViewContext);
    const activeToken = useActiveToken(arbitrageActiveTabs.burn);
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const [maxSubmitFees, setMaxSubmitFees] = useState("0");

    const loadData = useCallback(async () => {
        try {
            const maxFees = await w3.tokens[activeToken.rel.volTokenKey].maxSubmitFees(tokenAmount, delayFee.delayTime);
            setMaxSubmitFees(toDisplayAmount(maxFees, activeToken.decimals));
        } catch (error) {
            console.log(error);
            setMaxSubmitFees("N/A");
        } 
    }, [activeToken.decimals, activeToken.rel.volTokenKey, delayFee?.delayTime, tokenAmount, w3?.tokens]);

    const loadDataDebounce = useMemo(() => debounce(loadData, 500), [loadData]);
    
    useEffect(() => {
        if(!w3 || !delayFee || !tokenAmount || !w3?.tokens) return;
        if(!amount) return setMaxSubmitFees("0");
        setMaxSubmitFees(null);
        loadDataDebounce();

        return () => {
            loadDataDebounce.cancel();
        }
    }, [amount, delayFee, loadDataDebounce, tokenAmount, w3]);

    return useMemo(() => {
        const tokenName = activeToken?.name?.toUpperCase();
       
        return <> 
            <Stat 
                className="bold amount"
                title="Amount" 
                value={!amount ? "0" : amount} 
                _suffix={tokenName} 
            />

            <Stat 
                title="Up front payment" 
                value={maxSubmitFees === null ? null : maxSubmitFees}
                _suffix={tokenName} 
            />
            
            
            <Stat 
                title="Time to fulfillment" 
                value={"00:00 HH:MM"} 
            />

            <Stat 
                className="bold green"
                title="Estimated number of tokens" 
                value={"0"} 
                _suffix={tokenName}
            />
        </>
    }, [activeToken?.name, amount, maxSubmitFees]) 
}

export default BurnView;
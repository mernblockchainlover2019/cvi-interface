import { useCallback, useContext, useEffect, useMemo, useState} from "react";
import Stat from "components/Stat";
import { useActiveToken } from "components/Hooks";
import { activeTabs as arbitrageActiveTabs } from "config/arbitrageConfig";
import { appViewContext } from "components/Context";
import debounce from "lodash.debounce";
import { customFixedTokenValue, getTimeDurationFormatted, toBN, toBNAmount, toDisplayAmount } from "utils";
import { MAX_PERCENTAGE } from "contracts/utils";
import config from "config/config";

export const estimatedTokenFunctions = {
    [arbitrageActiveTabs.mint]: "estimateMint",
    [arbitrageActiveTabs.burn]: "estimateBurn",
}

const VolDetailsView = ({amount, delayFee}) => {
    const { w3, activeView } = useContext(appViewContext);
    const fromToken = useActiveToken(activeView);
    const toToken = useActiveToken(activeView === arbitrageActiveTabs.mint ? arbitrageActiveTabs.burn : arbitrageActiveTabs.mint);
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, fromToken.decimals)), [amount, fromToken.decimals]);
    const [maxSubmitFees, setMaxSubmitFees] = useState("0");
    const [estimatedTokens, setEstimatedTokens] = useState("0");

    const loadData = useCallback(async () => {
        try {
            const MIN_REQUEST_FEE = toBN("30");
            const maxFees = await w3.tokens[fromToken.rel.volTokenKey].maxSubmitFees(tokenAmount, delayFee.delayTime);
            setMaxSubmitFees(toDisplayAmount(maxFees, fromToken.decimals));
            const _delayFee = await w3.tokens[fromToken.rel.volTokenKey].calculateTimeDelayFee(delayFee.delayTime);
            const estimateSubmitFee = tokenAmount.mul(toBN(toBN(_delayFee * 100).add(MIN_REQUEST_FEE))).div(toBN(MAX_PERCENTAGE));
            const estimateTokens = await w3.tokens[fromToken.rel.volTokenKey][estimatedTokenFunctions[activeView]](tokenAmount.sub(estimateSubmitFee));
            setEstimatedTokens(estimateTokens);
        } catch (error) {
            console.log(error);
            setMaxSubmitFees("N/A");
        } 
    }, [w3?.tokens, fromToken.rel.volTokenKey, fromToken.decimals, tokenAmount, delayFee.delayTime, activeView]);

    const loadDataDebounce = useMemo(() => debounce(loadData, 500), [loadData]);
    
    useEffect(() => {
        if(!w3 || !delayFee?.delayTime || !tokenAmount || !w3?.tokens) return;
        if(!amount) {
            setEstimatedTokens("0");
            return setMaxSubmitFees("0")
        };
        
        setEstimatedTokens(null);
        setMaxSubmitFees(null);

        loadDataDebounce();

        return () => {
            loadDataDebounce.cancel();
        }
    }, [amount, delayFee.delayTime, loadDataDebounce, tokenAmount, w3]);
    
    return useMemo(() => {
        const tokenName = fromToken?.name?.toUpperCase();
       
        return <> 
            <Stat 
                className="bold amount first-letter-cap txt-align-end"
                title={<><span>{activeView}&nbsp;</span> <span>amount</span></>} 
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
                value={
                    delayFee === "N/A" ? "N/A" 
                    : !delayFee?.delayTime ? null 
                    : `${getTimeDurationFormatted(60 * 60 * (delayFee?.delayTime / 3600) * 1000)} HH:MM`
                } 
            />

            <Stat 
                name={estimatedTokenFunctions[activeView]}
                actEthvol={config.volatilityTokenKey.ethvol === toToken.name}
                className="bold green no-padding txt-align-end"
                title="You will get once the request is fulfilled" 
                value={estimatedTokens === null ? null : customFixedTokenValue(estimatedTokens, toToken.fixedDecimals, toToken.decimals)} 
                _suffix={toToken.name.toUpperCase()}
            />
        </>
    }, [fromToken?.name, activeView, amount, maxSubmitFees, delayFee, estimatedTokens, toToken.fixedDecimals, toToken.decimals, toToken.name]) 
}

export default VolDetailsView;
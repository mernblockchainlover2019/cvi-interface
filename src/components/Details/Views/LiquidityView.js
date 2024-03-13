
import { useMemo} from "react";
import { customFixed, customFixedTokenValue, toBN, toBNAmount, toDisplayAmount } from "utils";
import Stat from "components/Stat";
import { useWeb3Api } from "contracts/useWeb3Api";
import config from "config/config";
import { useActiveToken, useActiveVolInfo } from "components/Hooks";

const LiquidityView = ({amount, selectedCurrency, activeVolIndex}) => {
    const [collateralRatioData] = useWeb3Api("getCollateralRatio", selectedCurrency);
    const activeVolInfo = useActiveVolInfo(activeVolIndex);
    const activeToken = useActiveToken(selectedCurrency);
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const lpTokenPayload = useMemo(() => ({tokenAmount}), [tokenAmount]);
    const [lpTokenAmount] = useWeb3Api("toLPTokens", selectedCurrency, lpTokenPayload, { validAmount: true })

    return useMemo(() => {
        const tokenName = activeToken?.name?.toUpperCase();

        return  <> 
            <Stat 
                className="bold amount"
                title="Deposit amount" 
                value={!amount ? "0" : amount} 
                _suffix={tokenName} 
            />

            <Stat 
                className="large-value" 
                title="You will receive" 
                value={activeVolInfo?.key && lpTokenAmount} 
                format={customFixedTokenValue(lpTokenAmount, 6, activeToken.lpTokensDecimals)}
                _suffix={`${activeVolInfo?.key?.toUpperCase()}-${tokenName} LP`}
            />

           <Stat 
                className="low-priority low-priority--header"
                name="collateralRatio" 
                value={collateralRatioData?.collateralRatio} 
                format={`${customFixed(toDisplayAmount(collateralRatioData?.collateralRatio, 8), 0)}%`}
                actEthvol={activeVolIndex === config.volatilityIndexKey.ethvi}
            />

            <Stat 
                className="low-priority"
                title={`${activeVolIndex?.toUpperCase()} index`}  
                value={activeVolInfo?.index} 
            />
        </>
    }, [activeToken?.name, activeToken.lpTokensDecimals, amount, activeVolInfo?.key, activeVolInfo?.index, lpTokenAmount, collateralRatioData?.collateralRatio, activeVolIndex])
}

export default LiquidityView;